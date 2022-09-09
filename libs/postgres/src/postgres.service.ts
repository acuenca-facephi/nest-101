import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { getAllObjectPropertyNames } from './util/util';
import { UUID } from './util/uuid';

@Injectable()
export class PostgresService {
    private Pool: Pool;
    private TableName: string;
    private TablePrimaryKeyName: string;
    private ObjectProperties: [fieldName: string, fieldType: any][];
    private ObjectPropertyNames: string[];
    private Logger: Logger;

    initialize(databaseHost: string, databaseName: string, databaseUser: string,
        databasePassword: string, databasePort: number, tableName: string, primaryKeyName: string,
        instanceOfObject: object, logger: Logger) {
        this.Logger = logger;
        this.TableName = tableName;
        this.TablePrimaryKeyName = primaryKeyName;
        this.Pool = new Pool({
            user: databaseUser,
            host: databaseHost,
            database: databaseName,
            password: databasePassword,
            port: databasePort,
        });
        [this.ObjectPropertyNames, this.ObjectProperties] = getAllObjectPropertyNames(instanceOfObject);
        this.createTableIfNotExists(this.TableName, this.ObjectProperties, this.TablePrimaryKeyName);
    }

    private mapJsTypeToPsqlType(jsType: any): string {
        var postgreSql: string = 'text';
        var typeofJsType = typeof jsType;

        if (typeofJsType == 'number')
            postgreSql = 'int';
        else if (typeofJsType == 'boolean')
            postgreSql = 'boolean';
        else if (typeofJsType === 'string')
            postgreSql = 'varchar';
        else if (typeofJsType == 'object')
            if (jsType.constructor.name == UUID.name)
                postgreSql = 'uuid';

        return postgreSql;
    }

    private fillFieldConstraints(fieldName: string, fieldType: string, isPrimaryKey: boolean): string {
        let fieldPsqlType = this.mapJsTypeToPsqlType(fieldType);
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

    private createTableIfNotExists(tableName: string, tableFields: [fieldName: string, fieldType: any][], primaryKeyFieldName: string) {
        let fieldsTypes: string = '';

        for (let index = 0; index < tableFields.length; index++) {
            const element = tableFields[index];
            const fieldText = this.fillFieldConstraints(element[0], element[1], element[0] == primaryKeyFieldName);
            fieldsTypes += `${index == 0 ? '' : ', '}${fieldText}`;
        }

        const query = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            ${fieldsTypes}
        );`;

        this.Pool.query(query)
            .then(_ => this.Logger.log(
                `Table created succesfylly or already exists.`))
            .catch(error => this.Logger.error(
                `Error creating table, details below:\n${JSON.stringify(error)}`));
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
