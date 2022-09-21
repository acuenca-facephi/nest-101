import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionEventResponseDto } from './dto/create/create-transaction-event-response.dto';
import { CreateTransactionEventDto } from './dto/create/create-transaction-event.dto';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';

export const CONSUMER_LOGGER_TOKEN = Symbol('CONSUMER_LOGGER_TOKEN');
export const CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('CONSUMER_TRANSACTION_EVENT_TOKEN');

@Injectable()
export class ConsumerService {

    private transactionEventDataSource: TransactionEventDataSource;

    constructor(
        @Inject(CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN) transactionEventDataSource: TransactionEventDataSource
    ) {
        this.transactionEventDataSource = transactionEventDataSource;
    }

    async createTransactionEvent(
        createTransactionDto: CreateTransactionEventDto
    ): Promise<CreateTransactionEventResponseDto | undefined> {
        return this.transactionEventDataSource.create(createTransactionDto);
    }
}
