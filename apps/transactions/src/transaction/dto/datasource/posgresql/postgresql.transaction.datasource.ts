import { Transaction, TransactionProperties } from 'src/transaction/entities/transaction.entity';
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

    async getAll(): Promise<Transaction[]> {
        var transactions: Transaction[] = [];
        const query = `SELECT * FROM ${this.TableName};`;

        try {
            const queryResult = await this.Pool.query(query);
            queryResult.rows.map(row => {
                transactions.push(
                    new Transaction(
                        row.id, row.time, row.customid
                    )
                );
            });
        } catch (error) {
            this.Logger.error(error.stack);
        }

        return transactions;
    }

    getById(transactionId: string): Transaction | undefined {
        throw new Error('Method not implemented.');
    }

    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto {
        throw new Error('Method not implemented.');
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | undefined {
        throw new Error('Method not implemented.');
    }

    remove(transactionId: string): Transaction | undefined {
        throw new Error('Method not implemented.');
    }
}
