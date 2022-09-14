import { PostgresModule } from '@app/postgres';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';

export const PRODUCER_LOGGER_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const PRODUCER_TRANSACTION_EVENT_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');

@Module({
    imports: [
        PostgresModule,
        ConfigModule.forRoot()
    ],
    controllers: [ProducerController],
    providers: [
        ProducerService,
        {
            provide: PRODUCER_LOGGER_TOKEN,
            useValue: new Logger(ProducerModule.name)
        },
        {
            provide: PRODUCER_TRANSACTION_EVENT_TOKEN,
            useClass: TransactionPostgreSqlDataSource
        }
    ]
})
export class ProducerModule { }
