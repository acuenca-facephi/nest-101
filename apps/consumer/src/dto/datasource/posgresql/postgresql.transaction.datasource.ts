import { TransactionEventDataSource } from '../transaction.datasource';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '@app/postgres';
import { ConfigService } from '@nestjs/config';
import { TransactionEventInstance } from 'apps/consumer/src/entities/transaction-event.entity';
import { CreateTransactionEventDto } from '../../create/create-transaction-event.dto';
import { CreateTransactionEventResponseDto } from '../../create/create-transaction-event-response.dto';
import { CONSUMER_LOGGER_TOKEN } from 'apps/consumer/src/consumer.service';

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

    async create(createTransactionEventDto: CreateTransactionEventDto): Promise<CreateTransactionEventResponseDto | undefined> {
        const result = await this.PostgresTable.create(createTransactionEventDto);

        var transactionResponse = result != undefined ? new CreateTransactionEventResponseDto(result) : result;

        return transactionResponse;
    }
}
