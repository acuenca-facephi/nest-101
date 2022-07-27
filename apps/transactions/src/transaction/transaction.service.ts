import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
    findAll() {
        return `This action returns all transaction`;
    }

    findOne(transactionId: string) {
        return `This action returns a #${transactionId} transaction`;
    }

    create(createTransactionDto: CreateTransactionDto) {
        return 'This action adds a new transaction';
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto) {
        return `This action updates a #${transactionId} transaction`;
    }

    remove(transactionId: string) {
        return `This action removes a #${transactionId} transaction`;
    }
}
