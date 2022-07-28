import { Injectable } from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionService {

    transactions: Transaction[] = [ 
        new Transaction('1', new Date().toISOString(), '1234-ABC'),
        new Transaction('2', new Date().toISOString(), '5678-DEF')
    ];

    findAll(): Transaction[] {
        return this.transactions;
    }

    findOne(transactionId: string): Transaction | undefined {
        const transaction = this.transactions.find(transaction => transaction.id == transactionId);
        return transaction;
    }

    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto {
        const transactionToCreate = new Transaction(
            `${this.transactions.length + 1}`, createTransactionDto.time, createTransactionDto.customId);
        this.transactions.push(transactionToCreate);
        return new CreateTransactionResponseDto(transactionToCreate.id);
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto) {
        return `This action updates a #${transactionId} transaction`;
    }

    remove(transactionId: string) {
        return `This action removes a #${transactionId} transaction`;
    }
}
