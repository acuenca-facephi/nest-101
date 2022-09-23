import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { ObjectUtils, Json, UUID } from 'utils/utils';
import * as pgPromise from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { PostgresConfig } from './postgres-config';
const pgp = pgPromise({});

@Injectable()
export class PostgresService {
    private Pool: Pool;
    private TableName: string;
    private TablePrimaryKeyName: string;
    private ObjectProperties: [fieldName: string, fieldType: any][];
    private ObjectPropertyNames: string[];
    private Logger: Logger;
    private PgPromiseDb: pgPromise.IDatabase<{}, pg.IClient>;

    initialize(postgresConfig: PostgresConfig): void;
    initialize(databaseHost: string, databaseName: string, databaseUser: string,
        databasePassword: string, databasePort: number, tableName: string, primaryKeyName: string,
        instanceOfObject: object, logger: Logger): void;
    initialize(databaseHost: string | PostgresConfig, databaseName?: string, databaseUser?: string,
        databasePassword?: string, databasePort?: number, tableName?: string, primaryKeyName?: string,
        instanceOfObject?: object, logger?: Logger
    ) {
        let postgresConfig: PostgresConfig;
        if (typeof databaseHost == 'object') {
            postgresConfig = arguments[0];
        } else {
            postgresConfig = {
                databaseHost: databaseHost, databaseName: databaseName!, databaseUser: databaseUser!,
                databasePassword: databasePassword!, databasePort: databasePort!, tableName: tableName!, primaryKeyName: primaryKeyName!,
                instanceOfObject: instanceOfObject!, logger: logger!
            }
        }
        this.Logger = postgresConfig.logger;
        this.TableName = postgresConfig.tableName;
        this.TablePrimaryKeyName = postgresConfig.primaryKeyName;
        const configurationDbConnection = {
            user: postgresConfig.databaseUser,
            host: postgresConfig.databaseHost,
            database: postgresConfig.databaseName,
            password: postgresConfig.databasePassword,
            port: postgresConfig.databasePort,
        };
        this.Pool = new Pool(configurationDbConnection);
        this.PgPromiseDb = pgp(configurationDbConnection)
        this.setObjectInstance(postgresConfig.instanceOfObject);
    }

    setObjectInstance(instanceOfObject: object) {
        [this.ObjectPropertyNames, this.ObjectProperties] = ObjectUtils.getAllObjectPropertyNames(instanceOfObject);
        this.createTableIfNotExists();
    }

    private mapJsTypeToPsqlType(jsType: any): string {
        var postgreSqlType: string;
        var typeofJsType = typeof jsType;

        switch (typeofJsType) {
            case 'number':
                postgreSqlType = 'int';
                break;
            case 'bigint':
                postgreSqlType = 'bigint';
                break;
            case 'boolean':
                postgreSqlType = 'boolean';
                break;
            case 'string':
                postgreSqlType = 'varchar';
                break;
            case 'object':
                switch ((jsType as object).constructor.name) {
                    case UUID.name:
                        postgreSqlType = 'uuid';
                        break;
                    case Json.name:
                        postgreSqlType = 'jsonb';
                        break;
                    default:
                        postgreSqlType = ''
                        break;
                }
                break;
            default:
                postgreSqlType = ''
                break;
        }

        return postgreSqlType;
    }

    private fillFieldConstraints(fieldName: string, fieldType: string, isPrimaryKey: boolean): string {
        let fieldPsqlType = this.mapJsTypeToPsqlType(fieldType);
        if (!fieldPsqlType)
            // TODO: Create a valid postgres types enum instead of "fieldType: string" parameter.
            throw new Error(`Invalid postgres type ${fieldType}`);
        let fieldText: string = `"${fieldName}" ${fieldPsqlType}`;

        if (isPrimaryKey) {
            fieldText += ' PRIMARY KEY';
            if (fieldPsqlType == 'uuid')
                fieldText += ' DEFAULT gen_random_uuid()';
            else if (fieldPsqlType == 'int')
                fieldText += ' GENERATED ALWAYS AS IDENTITY';
        }

        return fieldText;
    }

    private alterTableAddColumnIfNotExists(columnName: string, columnType: any) {
        const query =
            `ALTER TABLE ${this.TableName} ADD COLUMN IF NOT EXISTS "${columnName}" ${this.mapJsTypeToPsqlType(columnType)};`;

        this.Pool.query(query)
            .then(_ => {
                this.Logger.log(`Column "${columnName}" added succesfylly or already exists.`);
            })
            .catch(error => this.Logger.error(
                `Error adding column "${columnName}", details below:\n${JSON.stringify(error)}`));
    }

    private checkTableColumns() {
        const query = `
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_name = '${this.TableName}';`;
        let tableColumnsNames: string[];

        this.Pool.query(query)
            .then(queryResult => {
                tableColumnsNames = queryResult.rows.map(it => it.column_name as string);
                this.ObjectPropertyNames.forEach(objectPropertyName => {
                    if (!tableColumnsNames.includes(objectPropertyName)) {
                        this.alterTableAddColumnIfNotExists(
                            objectPropertyName, this.ObjectProperties.find(it => it[0] == objectPropertyName)![1]);
                    }
                });
            })
            .catch(error => this.Logger.error(
                `Error checking table columns, details below:\n${JSON.stringify(error)}`));
    }

    private createTableIfNotExists() {
        let fieldsTypes: string = '';

        for (let index = 0; index < this.ObjectProperties.length; index++) {
            const element = this.ObjectProperties[index];
            const fieldText = this.fillFieldConstraints(element[0], element[1], element[0] == this.TablePrimaryKeyName);
            fieldsTypes += `${index == 0 ? '' : ', '}${fieldText}`;
        }

        const query = `
        CREATE TABLE IF NOT EXISTS ${this.TableName} (
            ${fieldsTypes}
        );`;

        this.Pool.query(query)
            .then(_ => {
                this.Logger.log(`Table "${this.TableName}" created succesfylly or already exists.`);
                this.checkTableColumns();
            })
            .catch(error => {
                const errorMessage = `Error creating table "${this.TableName}", details below:\n${JSON.stringify(error)}`;
                this.Logger.error(errorMessage);
                throw new Error(errorMessage);
            });
    }

    async getAll(): Promise<object[] | undefined> {
        var result: object[] | undefined;
        const query = `SELECT * FROM ${this.TableName};`;

        try {
            const queryResult = await this.Pool.query(query);
            result = queryResult.rows;
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async getById(id: string): Promise<object | undefined> {
        var result: object | undefined;
        const query = { text: `SELECT * FROM ${this.TableName} WHERE id = $1;`, values: [id] };

        try {
            const queryResult = await this.Pool.query(query);
            result = queryResult.rows[0];
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async getWhere(objectToMatch: object): Promise<object[] | undefined> {
        const propertiesToMatch = Object.entries(objectToMatch).filter(entry => this.ObjectPropertyNames.includes(entry[0]));
        var result: object[] | undefined;
        var whereText: string = '';
        const queryValues = [];

        try {
            if (propertiesToMatch.length == 0)
                throw new Error("There's no properties to filter that matchs with the stored object.\n" +
                    `\tStored object property names: ${this.ObjectPropertyNames}\n` +
                    `\tSended object properties: ${JSON.stringify(objectToMatch)}`);
            for (let index = 0; index < propertiesToMatch.length; index++) {
                const propertyToMatch = propertiesToMatch[index][0];
                const valueToMatch = propertiesToMatch[index][1];
                const comparator = valueToMatch == null ? ' IS ' : '=';
                // TODO: Add method param to change between AND and OR operators (all or any).
                const textEnd = index < propertiesToMatch.length - 1 ? ' AND ' : '';
                whereText += `"${propertyToMatch}"${comparator}$${index + 1}${textEnd}`;
                queryValues.push(valueToMatch);
            }
            const queryText = `SELECT * FROM ${this.TableName} WHERE ${whereText};`;

            const queryResult = await this.PgPromiseDb.query(queryText, queryValues);
            var result = queryResult.length > 0 ? queryResult as object[] : undefined;
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async create(objectToCreate: object): Promise<any | undefined> {
        var result: any | undefined;
        var propertiesText: string = '';
        var valuesText: string = '';
        const queryValues = [];
        const propertiesToCreate = Object.entries(objectToCreate).filter(entry => this.ObjectPropertyNames.includes(entry[0]) && entry[0] != this.TablePrimaryKeyName);

        try {
            if (propertiesToCreate.length == 0)
                throw new Error("There's no properties to create that matchs with the stored object.\n" +
                    `\tStored object property names: ${this.ObjectPropertyNames}\n` +
                    `\tSended object properties: ${JSON.stringify(objectToCreate)}`);

            for (let index = 0; index < propertiesToCreate.length; index++) {
                const propertyToCreate = propertiesToCreate[index];
                propertiesText += `"${propertyToCreate[0]}"${index < propertiesToCreate.length - 1 ? ', ' : ''}`;
                valuesText += `$${index + 1}${index < propertiesToCreate.length - 1 ? ', ' : ''}`
                queryValues.push(propertyToCreate[1]);
            }

            const query = {
                text: `INSERT INTO ${this.TableName}(${propertiesText}) VALUES (${valuesText}) RETURNING ${this.TablePrimaryKeyName};`,
                values: queryValues
            };

            const queryResult = await this.Pool.query(query);
            var resultObject = queryResult.rows[0] as object;
            result = resultObject[this.TablePrimaryKeyName as keyof typeof resultObject];
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async update(id: string, objectProperties: object): Promise<any | undefined> {
        var result: any | undefined;
        var updateText: string = '';
        const queryValues = [];
        const propertiesToUpdate = Object.entries(objectProperties).filter(entry => this.ObjectPropertyNames.includes(entry[0]) && entry[0] != this.TablePrimaryKeyName);

        try {
            if (propertiesToUpdate.length == 0)
                throw new Error("There's no properties to update that matchs with the stored object.\n" +
                    `\tStored object property names: ${this.ObjectPropertyNames}\n` +
                    `\tSended object properties: ${JSON.stringify(objectProperties)}`);

            for (let index = 0; index < propertiesToUpdate.length; index++) {
                const propertyToUpdate = propertiesToUpdate[index];
                updateText += `"${propertyToUpdate[0]}"=$${index + 2}${index < propertiesToUpdate.length - 1 ? ', ' : ''}`;
                queryValues.push(propertyToUpdate[1]);
            }

            const query = {
                text: `UPDATE ${this.TableName} SET ${updateText} WHERE "${this.TablePrimaryKeyName}" = $1 RETURNING ${this.TablePrimaryKeyName};`,
                values: [id].concat(queryValues)
            };

            const queryResult = await this.Pool.query(query);
            var resultObject = queryResult.rows[0] as object;
            result = resultObject[this.TablePrimaryKeyName as keyof typeof resultObject];
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async remove(id: string): Promise<object | undefined> {
        var result: object | undefined;
        const query = { text: `DELETE FROM ${this.TableName} WHERE ${this.TablePrimaryKeyName} = $1 RETURNING *;`, values: [id] };

        try {
            const queryResult = await this.Pool.query(query);
            result = queryResult.rows[0];
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }
}
