import { PostgresModule } from '@app/postgres';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ConsumerController } from './consumer.controller';
import { ConsumerService, CONSUMER_LOGGER_TOKEN, CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN } from './consumer.service';

@Module({
    imports: [
        PostgresModule,
        ConfigModule.forRoot(),
    ],
    controllers: [ConsumerController],
    providers: [
        {
            provide: CONSUMER_LOGGER_TOKEN,
            useValue: new Logger(ConsumerController.name)
        },
        {
            provide: CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN,
            useClass: TransactionPostgreSqlDataSource
        },
        ConsumerService
    ]
})
export class ConsumerModule { }
