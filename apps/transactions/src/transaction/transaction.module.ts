import { Module } from '@nestjs/common';
import { TransactionService, TRANSACTION_DATASOURCE_TOKEN } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionMemoryDataSource } from './dto/datasource/memory/memory.transaction.datasource';

@Module({
    controllers: [TransactionController],
    providers: [
        {
            provide: TRANSACTION_DATASOURCE_TOKEN,
            useValue: new TransactionMemoryDataSource()
        },
        TransactionService
    ]
})
export class TransactionModule { }
