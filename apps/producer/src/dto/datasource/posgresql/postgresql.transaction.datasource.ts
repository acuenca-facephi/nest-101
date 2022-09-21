import { TransactionEventDataSource } from '../transaction.datasource';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@app/postgres';
import { ConfigService } from '@nestjs/config';
import { TransactionEvent, TransactionEventInstance } from 'apps/producer/src/entities/transaction-event.entity';
import { CreateTransactionEventDto } from '../../create/create-transaction-event.dto';
import { CreateTransactionEventResponseDto } from '../../create/create-transaction-event-response.dto';
import { PRODUCER_LOGGER_TOKEN } from 'apps/producer/src/producer.service';
import { Json } from 'utils/utils';

@Injectable()
export class TransactionPostgreSqlDataSource implements TransactionEventDataSource {

    private readonly TableName: string = 'transaction';
    private readonly TablePrimaryKeyName: string = 'id';
    private readonly PostgresTable: PostgresService;

    constructor(@Inject(PostgresService) postgresService: PostgresService,
        @Inject(ConfigService) configService: ConfigService,
        @Inject(PRODUCER_LOGGER_TOKEN) logger: Logger
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

    async getTransactionByCustomerId(customerId: string): Promise<TransactionEvent | undefined> {
        const result = await this.PostgresTable.getWhere({'customId': customerId, data: null, type: null});

        var transactionEvent = typeof result == 'object' ? this.mapObjectToTransactionEvent(result[0]) : result;

        return transactionEvent;
    }

    async create(createTransactionEventDto: CreateTransactionEventDto): Promise<CreateTransactionEventResponseDto | undefined> {
        const result = await this.PostgresTable.create(createTransactionEventDto);

        var transactionResponse = result != undefined ? new CreateTransactionEventResponseDto(result) : result;

        return transactionResponse;
    }
}
