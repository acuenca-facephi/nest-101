import { Inject, Injectable } from '@nestjs/common';
import { CreateEventResponseDto } from './dto/create/create-event-response.dto';
import { CreateEventDto } from './dto/create/create-event.dto';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';

export const PRODUCER_LOGGER_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');

@Injectable()
export class ProducerService {

    private transactionEventDataSource: TransactionEventDataSource;

    constructor(
        @Inject(PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN) transactionEventDataSource: TransactionEventDataSource
    ) {
        this.transactionEventDataSource = transactionEventDataSource;
    }

    async getTransactionByCustomerId(transactionId: string) {
        return this.transactionEventDataSource.getTransactionByCustomerId(transactionId);
    }

    async createEvent(
        createTransactionDto: CreateEventDto
    ): Promise<CreateEventResponseDto | undefined> {
        if (await this.getTransactionByCustomerId(createTransactionDto.customId) != undefined)
            return this.transactionEventDataSource.create(createTransactionDto);
        else
            throw new Error('Can not create an event of an unexisting transaction.');
    }
}
