import { Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { ObjectUtils, Json, UUID } from '@utils/utils';
import pgPromise from 'pg-promise';
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

    private noPropertiesError(propertiesLength: number, objectProperties: object) {
        if (propertiesLength == 0) {
            const [propertiesNames, _] = ObjectUtils.getAllObjectPropertyNames(objectProperties);
            throw new Error("There's no properties that matchs with the stored object.\n" +
                `\tStored object property names: ${this.ObjectPropertyNames}\n` +
                `\tSended object properties: ${propertiesNames}`);
        }
    }

    private selectClient(client?: PoolClient): Pool | PoolClient {
        return client ? client : this.Pool;
    }

    private buildWhereText(
        objectToMatch: object, propertiesModifier: number = 0
    ): [string, any[]] {
        let whereText: string = 'WHERE ';
        const queryValues = [];
        const propertiesToMatch =
            Object.entries(objectToMatch)
                .filter(entry => this.ObjectPropertyNames.includes(entry[0]));

        this.noPropertiesError(propertiesToMatch.length, objectToMatch);
        for (let index = 0; index < propertiesToMatch.length; index++) {
            const propertyToMatch = propertiesToMatch[index][0];
            const valueToMatch = propertiesToMatch[index][1];
            const operator = valueToMatch == null ? ' IS ' : '=';
            const textEnd = index < propertiesToMatch.length - 1 ? ' AND ' : '';
            whereText += `"${propertyToMatch}"${operator}$${index + 1 + propertiesModifier}${textEnd}`;
            queryValues.push(valueToMatch);
        }

        return [whereText, queryValues];
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

    async getByIds(ids: [idFieldName: string, idValue: any][]): Promise<object | undefined> {
        var result: object | undefined;
        var whereText: string = '';
        const queryValues: any[] = [];
        for (let i = 0; i < ids.length; i++) {
            whereText += `"${ids[i][0]}" = $${i + 1}`;
            queryValues.push(ids[i][1]);
        }
        const query = {
            text: `SELECT * FROM ${this.TableName} WHERE ${whereText};`, values: queryValues
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

    async getWhere(
        objectToMatch: object, forUpdate: boolean = false, orderBy: string[] = [], client?: PoolClient
    ): Promise<object[] | undefined> {
        /**
         * ------------------------------ TODO ------------------------------
         * - Add support to change between AND, OR, IN, ALL and ANY.
         * - Add support to change the comparator operators (=, !=, <, >, <=, >=, IS, IS NOT).
         * - Add support to correlated and nested queries.
         * - Add support to JOIN with foreign keys/tables.
         * - Add support for ORDER BY DESC/ASC any field.
         * - Add support for LIMIT.
         */
        const dbClient = this.selectClient(client);
        var result: object[] | undefined;

        try {
            const [whereText, queryValues] = this.buildWhereText(objectToMatch);
            const orderByText = ` ORDER BY ${orderBy
                .filter(entry => this.ObjectPropertyNames.includes(entry))
                .join(', ')}`;
            const query = pgp.as.format(
                `SELECT * FROM ${this.TableName} ${whereText
                }${orderBy.length > 0 ? orderByText : ''
                }${forUpdate ? ' FOR UPDATE' : ''
                };`, queryValues);

            const queryResult = await dbClient.query(query);
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
            this.noPropertiesError(propertiesToCreate.length, objectToCreate);

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

    async update(
        ids: [idFieldName: string, idValue: any][],
        objectProperties: object,
        client?: PoolClient,
        whereObject?: object
    ): Promise<any | undefined> {
        const dbClient = this.selectClient(client);
        var result: any | undefined;
        var updateText: string = '';
        const queryValues = [];
        const propertiesToUpdate = Object.entries(objectProperties).filter(
            entry => this.ObjectPropertyNames.includes(entry[0]) && !this.TablePrimaryKeysNames.includes(entry[0]));

        try {
            this.noPropertiesError(propertiesToUpdate.length, objectProperties);

            for (let index = 0; index < propertiesToUpdate.length; index++) {
                const propertyToUpdate = propertiesToUpdate[index];
                updateText += `"${propertyToUpdate[0]}"=$${index + 1}${index < propertiesToUpdate.length - 1 ? ', ' : ''}`;
                queryValues.push(propertyToUpdate[1]);
            }

            const [whereText, whereValues] = this.buildWhereText({
                ...whereObject,
                ...ids.map(it => {
                    return { [it[0]]: it[1] as any }
                }).reduce((obj, item) => {
                    return { ...obj, ...item };
                }, {})
            }, propertiesToUpdate.length);

            const query = {
                text: `UPDATE ${this.TableName} SET ${updateText} ${whereText} RETURNING ${this.TablePrimaryKeysNames.join(', ')};`,
                values: queryValues.concat(whereValues)
            };

            const queryResult = await dbClient.query(query);
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

    async rawQuery(queryText: string, queryValues: Array<any> = [], client?: PoolClient): Promise<QueryResult | undefined> {
        const dbClient = this.selectClient(client);
        var result: QueryResult | undefined;
        var query = pgp.as.format(queryText, queryValues);

        try {
            result = await dbClient.query(query);;
        } catch (error) {
            this.Logger.error(error.stack);
            result = undefined;
        }

        return result;
    }

    async beginTransaction(): Promise<PoolClient | undefined> {
        var client: PoolClient | undefined;

        try {
            client = await this.Pool.connect();
            await client.query('BEGIN');
            client.on('error', async err => {
                this.Logger.error('Error creating transaction. Details below.', err.stack);
                await client?.query('ROLLBACK');
            });
        } catch (error) {
            this.Logger.error('Error creating transaction. Details below.', error.stack);
            client = undefined;
        }

        return client;
    }

    async endTransaction(client: PoolClient) {
        try {
            await client.query('COMMIT')
            client.release();
        } catch (error) {
            this.Logger.error('Error ending transaction. Details below.', error.stack);
            client.release();
        }
    }
}
