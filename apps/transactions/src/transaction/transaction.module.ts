import { Module } from '@nestjs/common';
import { TransactionService, TRANSACTION_DATASOURCE_TOKEN } from './transaction.service';
import { TransactionController } from './transaction.controller';
// import { TransactionMemoryDataSource } from './dto/datasource/memory/memory.transaction.datasource';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import * as env from 'src/environment/environment'

@Module({
    controllers: [TransactionController],
    providers: [
        {
            provide: TRANSACTION_DATASOURCE_TOKEN,
            useValue: new TransactionPostgreSqlDataSource(
                env.DATABASE_HOST, env.DATABASE_NAME, env.DATABASE_USER,
                env.DATABASE_PASSWORD, env.DATABASE_PORT
            )
            //useValue: new TransactionMemoryDataSource()
        },
        TransactionService
    ]
})
export class TransactionModule { }
