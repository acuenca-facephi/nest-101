import { Injectable, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { ObjectUtils, Json, UUID } from 'utils/utils';
import * as pgPromise from 'pg-promise';
import { PostgresForeignKeyDefinition } from './entities/postgres-foreingkey-definition';
import { PostgresConfig } from './entities/postgres-config';
const pgp = pgPromise({});

@Injectable()
export class PostgresService {
    private Pool: Pool;
    private TableName: string;
    private TablePrimaryKeysNames: string[];
    private ForeignKeys: PostgresForeignKeyDefinition[];
    private ObjectProperties: [fieldName: string, fieldType: any][];
    private ObjectPropertyNames: string[];
    private Logger: Logger;

    /* TODO: Support two string arrays:
        - primaryKeyNames
        - foreignKeyNames: [fieldName: string, foreignTableName: string][]
        This is to support multiple primary keys and foreign keys. 
        If the foreign table does not exists, raise Error.
    */
    initialize(postgresConfig: PostgresConfig): void;
    initialize(databaseHost: string, databaseName: string, databaseUser: string,
        databasePassword: string, databasePort: number, tableName: string, primaryKeysNames: string[],
        foreignKeys: PostgresForeignKeyDefinition[],
        instanceOfObject: object, logger: Logger): void;
    initialize(databaseHost: string | PostgresConfig, databaseName?: string, databaseUser?: string,
        databasePassword?: string, databasePort?: number, tableName?: string, primaryKeysNames?: string[],
        foreignKeys?: PostgresForeignKeyDefinition[],
        instanceOfObject?: object, logger?: Logger
    ) {
        let postgresConfig: PostgresConfig;
        if (typeof databaseHost == 'object') {
            postgresConfig = arguments[0];
        } else {
            postgresConfig = {
                databaseHost: databaseHost, databaseName: databaseName!, databaseUser: databaseUser!,
                databasePassword: databasePassword!, databasePort: databasePort!, tableName: tableName!, primaryKeysNames: primaryKeysNames!,
                foreignKeys: foreignKeys!, instanceOfObject: instanceOfObject!, logger: logger!
            }
        }
        this.Logger = postgresConfig.logger;
        this.TableName = postgresConfig.tableName;
        this.TablePrimaryKeysNames = postgresConfig.primaryKeysNames;
        this.ForeignKeys = postgresConfig.foreignKeys;
        const configurationDbConnection = {
            user: postgresConfig.databaseUser,
            host: postgresConfig.databaseHost,
            database: postgresConfig.databaseName,
            password: postgresConfig.databasePassword,
            port: postgresConfig.databasePort,
        };
        this.Pool = new Pool(configurationDbConnection);
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

    private fillFieldConstraints(fieldName: string, fieldType: string, isPrimaryKey: boolean, isForeignKey: boolean): string {
        let fieldPsqlType = this.mapJsTypeToPsqlType(fieldType);
        if (!fieldPsqlType)
            // TODO: Create a valid postgres types enum instead of "fieldType: string" parameter.
            throw new Error(`Invalid postgres type ${fieldType}`);
        let fieldText: string = `"${fieldName}" ${fieldPsqlType}`;

        if (isForeignKey) {
            const foreignKey = this.ForeignKeys.find(foreignKey => foreignKey.fieldName == fieldName);
            fieldText +=
                `, CONSTRAINT fk_${fieldName}
                FOREIGN KEY("${fieldName}") 
                REFERENCES ${foreignKey!.foreignTableName}(${foreignKey!.foreignKeyName})`;
        } else if (isPrimaryKey) {
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

    private getTablePrimaryKeyConstraints(): string {
        var primaryKeyConstraintsText = 'PRIMARY KEY(';

        for (let i = 0; i < this.TablePrimaryKeysNames.length; i++)
            primaryKeyConstraintsText += `${i == 0 ? '' : ', '}${this.TablePrimaryKeysNames[i]}`;

        return primaryKeyConstraintsText + ')';
    }

    private createTableIfNotExists() {
        let fieldsTypes: string = '';

        for (let index = 0; index < this.ObjectProperties.length; index++) {
            const element = this.ObjectProperties[index];
            const isForeignKey = this.ForeignKeys.findIndex(
                foreignKey => element[0] == foreignKey.fieldName) != -1;
            const fieldText = this.fillFieldConstraints(
                element[0], element[1], this.TablePrimaryKeysNames.includes(element[0]),
                isForeignKey);
            fieldsTypes += `${index == 0 ? '' : ', '}${fieldText}`;
        }

        const query = `
        CREATE TABLE IF NOT EXISTS ${this.TableName} (
            ${fieldsTypes},
            ${this.getTablePrimaryKeyConstraints()}
        );`;

        this.Pool.query(query)
            .then(_ => {
                this.Logger.log(`Table "${this.TableName}" created succesfully or already exists.`);
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
        /**
         * ------------------------------ TODO ------------------------------
         * - Add support to change between AND, OR, IN, ALL and ANY.
         * - Add support to change the comparator operators (=, !=, <, >, <=, >=, IS, IS NOT).
         * - Add support to correlated and nested queries.
         */
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
                const operator = valueToMatch == null ? ' IS ' : '=';
                const textEnd = index < propertiesToMatch.length - 1 ? ' AND ' : '';
                whereText += `"${propertyToMatch}"${operator}$${index + 1}${textEnd}`;
                queryValues.push(valueToMatch);
            }
            const query = pgp.as.format(`SELECT * FROM ${this.TableName} WHERE ${whereText};`, queryValues);

            const queryResult = await this.Pool.query(query);
            var result = queryResult.rowCount > 0 ? queryResult.rows as object[] : undefined;
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
        const propertiesToCreate = Object.entries(objectToCreate).filter(
            entry => this.ObjectPropertyNames.includes(entry[0]) && !this.TablePrimaryKeysNames.includes(entry[0]));

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
                text: `INSERT INTO ${this.TableName}(${propertiesText}) VALUES (${valuesText}) RETURNING ${this.TablePrimaryKeysNames.join(', ')};`,
                values: queryValues
            };

            const queryResult = await this.Pool.query(query);
            result = queryResult.rows[0] as object;
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async update(ids: [idFieldName: string, idValue: any][], objectProperties: object): Promise<any | undefined> {
        var result: any | undefined;
        var updateText: string = '';
        var whereText: string = '';
        const queryValues = [];
        const propertiesToUpdate = Object.entries(objectProperties).filter(
            entry => this.ObjectPropertyNames.includes(entry[0]) && !this.TablePrimaryKeysNames.includes(entry[0]));

        try {
            if (propertiesToUpdate.length == 0)
                throw new Error("There's no properties to update that matchs with the stored object.\n" +
                    `\tStored object property names: ${this.ObjectPropertyNames}\n` +
                    `\tSended object properties: ${JSON.stringify(objectProperties)}`);

            for (let index = 0; index < propertiesToUpdate.length; index++) {
                const propertyToUpdate = propertiesToUpdate[index];
                updateText += `"${propertyToUpdate[0]}"=$${index + 1}${index < propertiesToUpdate.length - 1 ? ', ' : ''}`;
                queryValues.push(propertyToUpdate[1]);
            }
            for (let i = 0; i < ids.length; i++) {
                whereText += `"${ids[i][0]}" = $${queryValues.length + i + 1}`;
                queryValues.push(ids[i][1]);
            }

            const query = {
                text: `UPDATE ${this.TableName} SET ${updateText} WHERE ${whereText} RETURNING ${this.TablePrimaryKeysNames.join(', ')};`,
                values: queryValues
            };

            const queryResult = await this.Pool.query(query);
            var resultObject = queryResult.rows[0] as object;
            result = resultObject[this.TablePrimaryKeysNames as keyof typeof resultObject];
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async remove(ids: [idFieldName: string, idValue: any][]): Promise<object | undefined> {
        var result: object | undefined;
        var whereText: string = '';
        const queryValues = [];
        for (let i = 0; i < ids.length; i++) {
            whereText += `"${ids[i][0]}" = $${i + 1}`;
            queryValues.push(ids[i][1]);
        }
        const query = {
            text: `DELETE FROM ${this.TableName} WHERE ${whereText} RETURNING *;`,
            values: queryValues
        };

        try {
            const queryResult = await this.Pool.query(query);
            result = queryResult.rows[0];
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async rawQuery(queryText: string, queryValues: Array<any> = []): Promise<QueryResult | undefined> {
        var result: QueryResult | undefined;
        var query = pgp.as.format(queryText, queryValues);

        try {
            result = await this.Pool.query(query);;
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }
}
