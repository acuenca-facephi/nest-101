import { TransactionEventDataSource } from '../transaction.datasource';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@app/postgres';
import { ConfigService } from '@nestjs/config';
import { TransactionEvent, TransactionEventInstance } from 'apps/consumer/src/entities/transaction-event.entity';
import { CreateTransactionEventDto } from '../../create/create-transaction-event.dto';
import { CreateTransactionEventResponseDto } from '../../create/create-transaction-event-response.dto';
import { CONSUMER_LOGGER_TOKEN } from 'apps/consumer/src/consumer.service';
import { Json } from 'utils/utils';

@Injectable()
export class TransactionPostgreSqlDataSource implements TransactionEventDataSource {

    private readonly TableName: string = 'transaction';
    private readonly TablePrimaryKeyName: string = 'id';
    private readonly PostgresTable: PostgresService;

    constructor(@Inject(PostgresService) postgresService: PostgresService,
        @Inject(ConfigService) configService: ConfigService,
        @Inject(CONSUMER_LOGGER_TOKEN) logger: Logger
    ) {
        this.PostgresTable = postgresService;
        this.PostgresTable.initialize(
            configService.get<string>('DATABASE_HOST')!, configService.get<string>('DATABASE_NAME')!,
            configService.get<string>('DATABASE_USER')!, configService.get<string>('DATABASE_PASSWORD')!,
            configService.get<number>('DATABASE_PORT')!, this.TableName, this.TablePrimaryKeyName,
            TransactionEventInstance, logger);
    }

    private mapObjectToTransactionEvent(transactionEventObject: object): TransactionEvent {
        var transactionEvent: TransactionEvent = new TransactionEvent('', '', '', '', new Json({}));
        Object.assign(transactionEvent, transactionEventObject);

        if (transactionEvent.id && transactionEvent.time && transactionEvent.customId)
            return transactionEvent;
        else
            throw new Error(`The row ${JSON.stringify(transactionEventObject)} it isn't a Transaction.`);
    }

    async getAllTransactions(): Promise<TransactionEvent[] | undefined> {
        const result = await this.PostgresTable.getWhere({ data: null, type: null });

        var transactionEvents = result?.map(this.mapObjectToTransactionEvent);

        return transactionEvents;
    }

    async updateTransactionsByTransactionId(createTransactionEventDto: CreateTransactionEventDto): Promise<CreateTransactionEventResponseDto | undefined> {
        const result = await this.PostgresTable.create(createTransactionEventDto);

        var transactionResponse = result != undefined ? new CreateTransactionEventResponseDto(result) : result;

        return transactionResponse;
    }
}
