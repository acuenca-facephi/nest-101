import { Logger, Module } from '@nestjs/common';
import { TransactionService, TRANSACTION_DATASOURCE_TOKEN } from './transaction.service';
import { TransactionController } from './transaction.controller';
// import { TransactionMemoryDataSource } from './dto/datasource/memory/memory.transaction.datasource';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { AppController } from '../app.controller';
import { PostgresModule } from '@app/postgres';
import { ConfigModule } from '@nestjs/config';
import { APP_LOGGER_TOKEN } from '../app.service';

@Module({
    imports: [
        PostgresModule,
        ConfigModule.forRoot()
    ],
    controllers: [TransactionController],
    providers: [
        {
            provide: APP_LOGGER_TOKEN,
            useValue: new Logger(AppController.name)
        },
        {
            provide: TransactionPostgreSqlDataSource,
            useClass: TransactionPostgreSqlDataSource
        },
        TransactionPostgreSqlDataSource,
        TransactionService
    ]
})
export class TransactionModule { }
