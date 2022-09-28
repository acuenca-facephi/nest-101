import { TransactionEventDataSource } from '../transaction.datasource';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@app/postgres';
import { ConfigService } from '@nestjs/config';
import { CONSUMER_LOGGER_TOKEN, EVENT_TABLE_TOKEN, TRANSACTION_TABLE_TOKEN } from 'apps/consumer/src/consumer.service';
import { Transaction, TransactionInstance } from 'apps/consumer/src/entities/transaction.entity';
import { EventInstance } from 'apps/consumer/src/entities/event.entity';
import { Event } from 'apps/consumer/src/entities/event.entity';
import { UpdateTransactionResponseDto } from '../../update/update-transaction-response.dto';
import { UpdateTransactionDto } from '../../update/update-transaction.dto';
import { UpdateEventResponseDto } from '../../update/update-event-response.dto';
import { UpdateEventDto } from '../../update/update-event.dto';

@Injectable()
export class TransactionPostgreSqlDataSource implements TransactionEventDataSource {

    private readonly TransactionTableName: string = 'transaction';
    private readonly EventTableName: string = 'event';
    private readonly TablePrimaryKeyName: string = 'id';
    private readonly TransactionPostgresTable: PostgresService;
    private readonly EventPostgresTable: PostgresService;

    constructor(@Inject(TRANSACTION_TABLE_TOKEN) transactionPostgresService: PostgresService,
        @Inject(EVENT_TABLE_TOKEN) eventPostgresService: PostgresService,
        @Inject(ConfigService) configService: ConfigService,
        @Inject(CONSUMER_LOGGER_TOKEN) logger: Logger
    ) {
        const DATABASE_CONFIGURATION = {
            databaseHost: configService.get<string>('DATABASE_HOST')!, databaseName: configService.get<string>('DATABASE_NAME')!,
            databaseUser: configService.get<string>('DATABASE_USER')!, databasePassword: configService.get<string>('DATABASE_PASSWORD')!,
            databasePort: configService.get<number>('DATABASE_PORT')!
        };

        this.TransactionPostgresTable = transactionPostgresService;
        this.TransactionPostgresTable.initialize({
            ...DATABASE_CONFIGURATION, tableName: this.TransactionTableName, primaryKeyName: this.TablePrimaryKeyName,
            instanceOfObject: TransactionInstance, logger: logger
        });
        this.EventPostgresTable = eventPostgresService;
        this.EventPostgresTable.initialize({
            ...DATABASE_CONFIGURATION, tableName: this.EventTableName, primaryKeyName: this.TablePrimaryKeyName,
            instanceOfObject: EventInstance, logger: logger
        });
    }

    private mapObjectToTransaction(transactionObject: object): Transaction {
        var transaction: Transaction = new Transaction('', '', '');
        Object.assign(transaction, transactionObject);

        if (transaction.id && transaction.time && transaction.customId)
            return transaction;
        else
            throw new Error(`The row ${JSON.stringify(transactionObject)} it isn't a Transaction.`);
    }

    private mapObjectToEvent(eventObject: object): Event {
        var event: Event = new Event('', '', '', '', {});
        Object.assign(event, eventObject);

        if (event.id && event.time && event.transactionId && event.type, event.data)
            return event;
        else
            throw new Error(`The row ${JSON.stringify(eventObject)} it isn't an Event.`);
    }

    async getAllTransactionsWithEvents(): Promise<Transaction[] | undefined> {
        const result = await this.TransactionPostgresTable.rawQuery(
            `SELECT *
            FROM transaction
            WHERE id::VARCHAR IN(
                SELECT "transactionId"
                FROM event
                GROUP BY "transactionId");`
        );

        var transactions = result?.rows?.map(this.mapObjectToTransaction);

        return transactions;
    }

    async getAllTransactionEvents(transactionId: string): Promise<Event[] | undefined> {
        const result = await this.EventPostgresTable.getWhere({ transactionId: transactionId, consumed: false });

        var events = result?.map(this.mapObjectToEvent);

        return events;
    }

    async updateTransaction(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<UpdateTransactionResponseDto | undefined> {
        const result = await this.TransactionPostgresTable.update(transactionId, updateTransactionDto);

        return result != undefined ? new UpdateTransactionResponseDto(result) : result;
    }

    async updateEvent(eventId: string, updateEventDto: UpdateEventDto): Promise<UpdateEventResponseDto | undefined> {
        const result = await this.EventPostgresTable.update(eventId, updateEventDto);

        return result != undefined ? new UpdateEventResponseDto(result) : result;
    }
}
