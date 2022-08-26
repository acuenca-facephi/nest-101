import { Transaction } from "src/transaction/entities/transaction.entity";
import { CreateTransactionResponseDto } from "../create/create-transaction-response.dto";
import { CreateTransactionDto } from "../create/create-transaction.dto";
import { UpdateTransactionResponseDto } from "../update/update-transaction-response.dto";
import { UpdateTransactionDto } from "../update/update-transaction.dto";

export interface TransactionDataSource {
    getAll(): Transaction[] | Promise<Transaction[]>
    getById(transactionId: string): Transaction | undefined
    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto
    update(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | undefined
    remove(transactionId: string): Transaction | undefined
}

