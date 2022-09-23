import { PostgresModule } from '@app/postgres';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionEventPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ProducerController } from './producer.controller';
import { ProducerService, PRODUCER_LOGGER_TOKEN, PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN } from './producer.service';

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
        ProducerService
    ]
})
export class ProducerModule { }
