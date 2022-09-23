import { PostgresModule, PostgresService } from '@app/postgres';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionEventPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ProducerController } from './producer.controller';
import { EVENT_TABLE_TOKEN, ProducerService, PRODUCER_LOGGER_TOKEN, PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN, TRANSACTION_TABLE_TOKEN } from './producer.service';

@Module({
    imports: [
        PostgresModule,
        ConfigModule.forRoot(),
    ],
    controllers: [ProducerController],
    providers: [
        {
            provide: PRODUCER_LOGGER_TOKEN,
            useValue: new Logger(ProducerController.name)
        },
        {
            provide: PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN,
            useClass: TransactionEventPostgreSqlDataSource
        },
        {
            provide: EVENT_TABLE_TOKEN,
            useClass: PostgresService
        },
        {
            provide: TRANSACTION_TABLE_TOKEN,
            useClass: PostgresService
        },
        ProducerService
    ]
})
export class ProducerModule { }
