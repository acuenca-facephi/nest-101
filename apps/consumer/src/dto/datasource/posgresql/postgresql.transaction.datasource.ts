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
import { PostgresForeignKeyDefinition } from '@app/postgres/entities/postgres-foreingkey-definition';
import { PoolClient } from 'pg';
import { Store } from '@reduxjs/toolkit';

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
            ...DATABASE_CONFIGURATION, tableName: this.TransactionTableName, primaryKeysNames: [this.TablePrimaryKeyName],
            foreignKeys: [], instanceOfObject: TransactionInstance, logger: logger
        });
        this.EventPostgresTable = eventPostgresService;
        this.EventPostgresTable.initialize({
            ...DATABASE_CONFIGURATION, tableName: this.EventTableName, primaryKeysNames: [this.TablePrimaryKeyName],
            foreignKeys: [new PostgresForeignKeyDefinition(
                'transactionId', this.TablePrimaryKeyName, this.TransactionTableName)],
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
            FROM ${this.TransactionTableName}
            WHERE ${this.TablePrimaryKeyName} IN(
                SELECT "transactionId"
                FROM ${this.EventTableName}
                WHERE consumed = FALSE
                GROUP BY "transactionId"
            ) FOR UPDATE;`
        );

        var transactions = result?.rows?.map(this.mapObjectToTransaction);

        return transactions;
    }

    async getAllTransactionEvents(transactionId: string, client?: PoolClient): Promise<Event[] | undefined> {
        const result = await this.EventPostgresTable.getWhere(
            { transactionId: transactionId, consumed: false }, true, ['time'], client);

        var events = result?.map(this.mapObjectToEvent);

        return events;
    }

    private async updateTransaction(
        transactionId: string, updateTransactionDto: UpdateTransactionDto, client?: PoolClient
    ): Promise<UpdateTransactionResponseDto | undefined> {
        const result = await this.TransactionPostgresTable.update(
            [[this.TablePrimaryKeyName, transactionId]], updateTransactionDto, client);

        return result != undefined ? new UpdateTransactionResponseDto(result) : result;
    }

    private async updateEvent(eventId: string, updateEventDto: UpdateEventDto, client?: PoolClient): Promise<UpdateEventResponseDto | undefined> {
        const result = await this.EventPostgresTable.update(
            [[this.TablePrimaryKeyName, eventId]], updateEventDto, client);

        return result != undefined ? new UpdateEventResponseDto(result) : result;
    }

    /*
    async applyAllTransactionEvents(transactionId: string, batchSize: number): Promise<Event[] | undefined> {
        var result: Event[] | undefined = [];

        try {
            const client = await this.TransactionPostgresTable.beginTransaction();
            const events = await this.getAllTransactionEvents(transactionId, client!);
            const transactionEvents: Event[] = events != undefined ? events : [];
            for (let i = 0; i < transactionEvents.length && i < batchSize; i++) {
                const event = transactionEvents[i];
                result.push(event);
                const transactionUpdated: UpdateTransactionDto = event.data;
                await this.updateTransaction(transactionId, transactionUpdated, client!);
                await this.updateEvent(event.id, { consumed: true }, client!);
            }
            await this.TransactionPostgresTable.endTransaction(client!);
        } catch (error) {
            result = undefined;
        }

        return result;
    }
    */

    async applyAllTransactionEvents(
        transactionId: string, events: Event[], batchSize: number, eventReducer: Store<Transaction, any>
    ): Promise<Event[] | undefined> {
        var result: Event[] | undefined = [];

        try {
            const client = await this.TransactionPostgresTable.beginTransaction();
            const transactionEvents: Event[] = events != undefined ? events : [];
            for (let i = 0; i < transactionEvents.length && i < batchSize; i++) {
                const event = transactionEvents[i];
                eventReducer.dispatch({
                    ...event,
                    id: event.id
                });
                await this.updateEvent(event.id, { consumed: true }, client!);
                result.push(event);
            }
            await this.updateTransaction(transactionId, eventReducer.getState(), client!);
            await this.TransactionPostgresTable.endTransaction(client!);
        } catch (error) {
            result = undefined;
        }

        return result;
    }
}
