import { Transaction, TransactionProperties, TransactionPropertiesNames } from 'src/transaction/entities/transaction.entity';
import { CreateTransactionResponseDto } from '../../create/create-transaction-response.dto';
import { CreateTransactionDto } from '../../create/create-transaction.dto';
import { UpdateTransactionResponseDto } from '../../update/update-transaction-response.dto';
import { UpdateTransactionDto } from '../../update/update-transaction.dto';
import { TransactionDataSource } from '../transaction.datasource';
import { Pool } from 'pg';
import { Logger } from '@nestjs/common';
import { UUID } from "src/util/uuid";

export class TransactionPostgreSqlDataSource implements TransactionDataSource {

    private readonly Pool: Pool;
    private readonly TableName: string = 'transaction';
    private readonly TablePrimaryKeyName: string = 'id';
    private readonly Logger: Logger;

    constructor(databaseHost: string, databaseName: string, databaseUser: string,
        databasePassword: string, databasePort: number, logger: Logger) {
        this.Logger = logger;
        this.Pool = new Pool({
            user: databaseUser,
            host: databaseHost,
            database: databaseName,
            password: databasePassword,
            port: databasePort,
        });
        this.createTableIfNotExists(this.TableName, TransactionProperties, this.TablePrimaryKeyName);

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
        let fieldText: string = `${fieldName} ${fieldPsqlType}`;

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

        this.Pool.query(query, (err, res) => {
            if (err) {
                this.Logger.error(err.stack);
            } else {
                this.Logger.log(`Table ${tableName} created or already exists. Details below:\n${JSON.stringify(res)}`);
            }
        });
    }

    private mapRowToTransaction(row: any): Transaction {
        if (row.id && row.time && row.customid)
            return new Transaction(row.id, row.time, row.customid);
        else
            throw new Error(`The row ${JSON.stringify(row)} it isn't a Transaction.`);

    }

    async getAll(): Promise<Transaction[]> {
        var transactions: Transaction[] = [];
        const query = `SELECT * FROM ${this.TableName};`;

        try {
            const queryResult = await this.Pool.query(query);
            queryResult.rows.forEach(row => {
                transactions.push(
                    this.mapRowToTransaction(row)
                );
            });
        } catch (error) {
            this.Logger.error(error.stack);
        }

        return transactions;
    }

    async getById(transactionId: string): Promise<Transaction | undefined> {
        var transaction: Transaction | undefined;
        const query = { text: `SELECT * FROM ${this.TableName} WHERE id = $1;`, values: [transactionId] };

        try {
            const queryResult = await this.Pool.query(query);
            transaction = this.mapRowToTransaction(queryResult.rows[0]);
        } catch (error) {
            transaction = undefined;
        }

        return transaction;
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<CreateTransactionResponseDto | undefined> {
        var result: CreateTransactionResponseDto | undefined;
        const query = {
            text: `INSERT INTO ${this.TableName}(time, customid) VALUES ($1, $2) RETURNING id;`,
            values: [createTransactionDto.time, createTransactionDto.customId]
        };

        try {
            const queryResult = await this.Pool.query(query);
            result = new CreateTransactionResponseDto(queryResult.rows[0].id);
        } catch (error) {
            result = undefined;
        }

        return result;
    }

    async update(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<UpdateTransactionResponseDto | undefined> {
        var result: UpdateTransactionResponseDto | undefined;
        var updateText: string = '';
        const queryValues = [];
        const propertiesToUpdate = Object.entries(updateTransactionDto).filter(entry => TransactionPropertiesNames.includes(entry[0]) && entry[0] != 'id');
        for (let index = 0; index < propertiesToUpdate.length; index++) {
            const propertyToUpdate = propertiesToUpdate[index];
            updateText += `${propertyToUpdate[0]}=$${index + 2}${index < propertiesToUpdate.length - 1 ? ', ' : ''}`;
            queryValues.push(propertyToUpdate[1]);
        }
        const query = {
            text: `UPDATE ${this.TableName} SET ${updateText} WHERE id = $1 RETURNING id;`,
            values: [transactionId].concat(queryValues)
        };

        try {
            const queryResult = await this.Pool.query(query);
            result = new UpdateTransactionResponseDto(queryResult.rows[0].id);
        } catch (error) {
            result = undefined;
        }

        return result;
    }

    async remove(transactionId: string): Promise<Transaction | undefined> {
        var transaction: Transaction | undefined;
        const query = { text: `DELETE FROM ${this.TableName} WHERE id = $1 RETURNING *;`, values: [transactionId] };

        try {
            const queryResult = await this.Pool.query(query);
            transaction = this.mapRowToTransaction(queryResult.rows[0]);
        } catch (error) {
            transaction = undefined;
        }

        return transaction;
    }
}
