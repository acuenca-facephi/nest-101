import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { TransactionDataSource } from './dto/datasource/transaction.datasource';
import { UpdateTransactionResponseDto } from './dto/update/update-transaction-response.dto';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

export const TRANSACTION_DATASOURCE_TOKEN = Symbol('TRANSACTION_DATASOURCE_TOKEN');

@Injectable()
export class TransactionService {

    private transactionDataSource: TransactionDataSource;

    constructor(@Inject(TRANSACTION_DATASOURCE_TOKEN) transactionDataSource: TransactionDataSource) {
        this.transactionDataSource = transactionDataSource;
    }

    async findAll(): Promise<Transaction[]> {
        return this.transactionDataSource.getAll();
    }

    async findOne(transactionId: string): Promise<Transaction | undefined> {
        return this.transactionDataSource.getById(transactionId);
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<CreateTransactionResponseDto | undefined> {
        return this.transactionDataSource.create(createTransactionDto);
    }

    async update(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<UpdateTransactionResponseDto | undefined> {
        return this.transactionDataSource.update(transactionId, updateTransactionDto);
    }

    async remove(transactionId: string): Promise<Transaction | undefined> {
        return this.transactionDataSource.remove(transactionId);
    }
}
