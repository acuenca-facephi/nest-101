import { Logger, Module } from '@nestjs/common';
import { TransactionService, TRANSACTION_DATASOURCE_TOKEN } from './transaction.service';
import { TransactionController } from './transaction.controller';
// import { TransactionMemoryDataSource } from './dto/datasource/memory/memory.transaction.datasource';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import * as env from 'src/environment/environment'
import { AppController } from 'src/app.controller';

@Module({
    controllers: [TransactionController],
    providers: [
        {
            provide: TRANSACTION_DATASOURCE_TOKEN,
            useValue: new TransactionPostgreSqlDataSource(
                env.DATABASE_HOST, env.DATABASE_NAME, env.DATABASE_USER,
                env.DATABASE_PASSWORD, Number.parseInt(env.DATABASE_PORT),
                new Logger(AppController.name)
            )
            // useValue: new TransactionMemoryDataSource()
        },
        TransactionService
    ]
})
export class TransactionModule { }
