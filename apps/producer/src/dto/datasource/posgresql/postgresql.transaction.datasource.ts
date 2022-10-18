import { TransactionEventDataSource } from '../transaction.datasource';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@app/postgres';
import { ConfigService } from '@nestjs/config';
import { Transaction, TransactionInstance } from 'apps/producer/src/entities/transaction.entity';
import { CreateEventDto } from '../../create/create-event.dto';
import { CreateEventResponseDto } from '../../create/create-event-response.dto';
import { EVENT_TABLE_TOKEN, PRODUCER_LOGGER_TOKEN, TRANSACTION_TABLE_TOKEN } from 'apps/producer/src/producer.service';
import { EventInstance } from 'apps/producer/src/entities/event.entity';
import { PostgresForeignKeyDefinition } from '@app/postgres/entities/postgres-foreingkey-definition';

@Injectable()
export class TransactionEventPostgreSqlDataSource implements TransactionEventDataSource {

    private readonly TransactionTableName: string = 'transaction';
    private readonly EventTableName: string = 'event';
    private readonly TablePrimaryKeyName: string = 'id';
    private readonly TransactionPostgresTable: PostgresService;
    private readonly EventPostgresTable: PostgresService;

    constructor(@Inject(TRANSACTION_TABLE_TOKEN) transactionPostgresService: PostgresService,
        @Inject(EVENT_TABLE_TOKEN) eventPostgresService: PostgresService,
        @Inject(ConfigService) configService: ConfigService,
        @Inject(PRODUCER_LOGGER_TOKEN) logger: Logger
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

    private mapObjectToTransactionEvent(transactionEventObject: object): Transaction {
        var transactionEvent: Transaction = new Transaction('', '', '');
        Object.assign(transactionEvent, transactionEventObject);

        if (transactionEvent.id && transactionEvent.time && transactionEvent.customId)
            return transactionEvent;
        else
            throw new Error(`The row ${JSON.stringify(transactionEventObject)} it isn't a Transaction.`);
    }

    async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
        const result = await this.TransactionPostgresTable.getWhere({ 'id': transactionId });

        var transaction = typeof result == 'object' ? this.mapObjectToTransactionEvent(result[0]) : result;

        return transaction;
    }

    async create(createTransactionEventDto: CreateEventDto): Promise<CreateEventResponseDto | undefined> {
        createTransactionEventDto.consumed = false;
        const result = await this.EventPostgresTable.create(createTransactionEventDto);

        var transactionResponse = result != undefined ? new CreateEventResponseDto(result['id']) : result;

        return transactionResponse;
    }
}
