import { Transaction } from '../../entities/transaction.entity';
import { CreateTransactionResponseDto } from '../create/create-transaction-response.dto';
import { CreateTransactionDto } from '../create/create-transaction.dto';
import { UpdateTransactionResponseDto } from '../update/update-transaction-response.dto';
import { UpdateTransactionDto } from '../update/update-transaction.dto';

export interface TransactionDataSource {
    getAll(): Transaction[] | Promise<Transaction[]>
    getById(transactionId: string): Transaction | Promise<Transaction | undefined> | undefined
    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto | undefined | Promise<CreateTransactionResponseDto | undefined>
    update(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | Promise<UpdateTransactionResponseDto | undefined> | undefined
    remove(transactionId: string): Transaction | Promise<Transaction | undefined> | undefined
}

