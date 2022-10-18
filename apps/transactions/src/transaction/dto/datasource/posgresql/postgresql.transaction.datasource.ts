import { Transaction, TransactionInstance } from '../../../entities/transaction.entity';
import { CreateTransactionResponseDto } from '../../create/create-transaction-response.dto';
import { CreateTransactionDto } from '../../create/create-transaction.dto';
import { UpdateTransactionResponseDto } from '../../update/update-transaction-response.dto';
import { UpdateTransactionDto } from '../../update/update-transaction.dto';
import { TransactionDataSource } from '../transaction.datasource';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@app/postgres';
import { ConfigService } from '@nestjs/config';
import { APP_LOGGER_TOKEN } from 'apps/transactions/src/app.service';

@Injectable()
export class TransactionPostgreSqlDataSource implements TransactionDataSource {

    private readonly TableName: string = 'transaction';
    private readonly TablePrimaryKeyName: string = 'id';
    private readonly PostgresTable: PostgresService;

    constructor(@Inject(PostgresService) postgresService: PostgresService,
        @Inject(ConfigService) configService: ConfigService,
        @Inject(APP_LOGGER_TOKEN) logger: Logger) {
        this.PostgresTable = postgresService;
        this.PostgresTable.initialize(
            configService.get<string>('DATABASE_HOST')!, configService.get<string>('DATABASE_NAME')!,
            configService.get<string>('DATABASE_USER')!, configService.get<string>('DATABASE_PASSWORD')!,
            configService.get<number>('DATABASE_PORT')!, this.TableName, [this.TablePrimaryKeyName],
            [], TransactionInstance, logger);
    }

    private mapObjectToTransaction(transactionObject: object): Transaction {
        var transaction: Transaction = new Transaction('', '', '', '');
        Object.assign(transaction, transactionObject);

        if (transaction.id && transaction.time && transaction.customId)
            return transaction;
        else
            throw new Error(`The row ${JSON.stringify(transactionObject)} it isn't a Transaction.`);
    }

    async getAll(): Promise<Transaction[]> {
        var transactions: Transaction[] = [];
        const result = await this.PostgresTable.getAll();

        if (result?.length && result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                transactions.push(this.mapObjectToTransaction(element));
            }
        }

        return transactions;
    }

    async getById(transactionId: string): Promise<Transaction | undefined> {
        const result = await this.PostgresTable.getByIds([['id', transactionId]]);

        var transaction = typeof result == 'object' ? this.mapObjectToTransaction(result) : result;

        return transaction;
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<CreateTransactionResponseDto | undefined> {
        const result = await this.PostgresTable.create(createTransactionDto);

        var transactionResponse = result != undefined ? new CreateTransactionResponseDto(result['id']) : result;

        return transactionResponse
    }

    async update(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<UpdateTransactionResponseDto | undefined> {
        const result = await this.PostgresTable.update([[ 'id', transactionId ]], updateTransactionDto);

        var transactionResponse = result != undefined ? new UpdateTransactionResponseDto(result) : result;

        return transactionResponse;
    }

    async remove(transactionId: string): Promise<Transaction | undefined> {
        const result = await this.PostgresTable.remove([['id', transactionId]]);

        var transactionDeleted = typeof result == 'object' ? this.mapObjectToTransaction(result) : result;

        return transactionDeleted;
    }
}
