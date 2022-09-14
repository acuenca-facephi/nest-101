import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionEventResponseDto } from './dto/create/create-transaction-event-response.dto';
import { CreateTransactionEventDto } from './dto/create/create-transaction-event.dto';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';
import { PRODUCER_LOGGER_TOKEN } from './producer.module';

@Injectable()
export class ProducerService {
    constructor(
        @Inject(PRODUCER_LOGGER_TOKEN) private transactionEventDataSource: TransactionEventDataSource) { }

    async createTransactionEvent(
        createTransactionDto: CreateTransactionEventDto
    ): Promise<CreateTransactionEventResponseDto | undefined> {
        return this.transactionEventDataSource.create(createTransactionDto);
    }
}
