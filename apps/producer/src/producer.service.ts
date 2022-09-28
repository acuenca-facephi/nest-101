import { Inject, Injectable } from '@nestjs/common';
import { CreateEventResponseDto } from './dto/create/create-event-response.dto';
import { CreateEventDto } from './dto/create/create-event.dto';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';

export const PRODUCER_LOGGER_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');
export const EVENT_TABLE_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const TRANSACTION_TABLE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');


@Injectable()
export class ProducerService {

    private transactionEventDataSource: TransactionEventDataSource;

    constructor(
        @Inject(PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN) transactionEventDataSource: TransactionEventDataSource
    ) {
        this.transactionEventDataSource = transactionEventDataSource;
    }

    async getTransactionByTransactionId(transactionId: string) {
        return this.transactionEventDataSource.getTransactionByTransactionId(transactionId);
    }

    async createEvent(
        createEventDto: CreateEventDto
    ): Promise<CreateEventResponseDto | undefined> {
        if (await this.getTransactionByTransactionId(createEventDto.transactionId) != undefined)
            return this.transactionEventDataSource.create(createEventDto);
        else
            throw new Error('Can not create an event of an unexisting transaction.');
    }
}
