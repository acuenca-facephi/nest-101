import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { TransactionDataSource } from './dto/datasource/transaction.datasource';
import { UpdateTransactionResponseDto } from './dto/update/update-transaction-response.dto';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { Transaction, TransactionKeys, TransactionProperties } from './entities/transaction.entity';

export const TRANSACTION_DATASOURCE_TOKEN = Symbol('TRANSACTION_DATASOURCE_TOKEN');

@Injectable()
export class TransactionService {

    private transactionDataSource: TransactionDataSource;

    constructor(@Inject(TRANSACTION_DATASOURCE_TOKEN) transactionDataSource: TransactionDataSource) {
        this.transactionDataSource = transactionDataSource;
    }

    findAll(): Transaction[] {
        return this.transactionDataSource.getAll();
    }

    findOne(transactionId: string): Transaction | undefined {
        return this.transactionDataSource.getById(transactionId);
    }

    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto {
        return this.transactionDataSource.create(createTransactionDto);
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | undefined {
        return this.transactionDataSource.update(transactionId, updateTransactionDto);
    }

    remove(transactionId: string): Transaction | undefined {
        return this.transactionDataSource.remove(transactionId);
    }
}
