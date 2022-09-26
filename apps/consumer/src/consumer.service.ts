import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';
import { UpdateEventDto } from './dto/update/update-event.dto';
import { UpdateIntervalResponseDto } from './dto/update/update-interval-response.dto';
import { UpdateIntervalDto } from './dto/update/update-interval.dto';
import { Event } from './entities/event.entity';
import { Interval } from './entities/interval.entity';

export const CONSUMER_LOGGER_TOKEN = Symbol('CONSUMER_LOGGER_TOKEN');
export const CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('CONSUMER_TRANSACTION_EVENT_TOKEN');
export const EVENT_TABLE_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const TRANSACTION_TABLE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');

@Injectable()
export class ConsumerService {

    private transactionEventDataSource: TransactionEventDataSource;

    private queryInterval: Interval;

    constructor(
        @Inject(CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN) transactionEventDataSource: TransactionEventDataSource,
        @Inject(ConfigService) configService: ConfigService
    ) {
        this.transactionEventDataSource = transactionEventDataSource;
        this.queryInterval = new Interval(
            parseInt(configService.get<string>('MIN_INTERVAL_MS')!),
            parseInt(configService.get<string>('MAX_INTERVAL_MS')!),
            parseInt(configService.get<string>('INTERVAL_MS')!));
        this.consumerLoop();
    }

    changeQueryInterval(newQueryInterval: UpdateIntervalDto): UpdateIntervalResponseDto {
        const oldInterval = this.queryInterval.interval;
        var updateMessage: string;
        var intervalUpdated: boolean;

        if (intervalUpdated = this.queryInterval.setInterval(newQueryInterval.newInterval))
            updateMessage = `Interval updated from ${oldInterval} to ${newQueryInterval.newInterval}! :)`;
        else
            updateMessage =
                `Interval not updated! :( Min interval: ${this.queryInterval.MIN_INTERVAL} Max interval: ${this.queryInterval.MAX_INTERVAL}`;

        return new UpdateIntervalResponseDto(intervalUpdated, updateMessage);
    }

    private consumerLoop() {
        setInterval(async () => {
            const result = await this.transactionEventDataSource.getAllTransactions();
            const transactions = result != undefined ? result : [];
            for (let i = 0; i < transactions.length; i++) {
                const transaction = transactions[i];
                const result = await this.transactionEventDataSource.getAllTransactionEvents(transaction.id);
                const transactionEvents: Event[] = result != undefined ? result : [];
                for (let j = 0; j < transactionEvents.length; j++) {
                    const event = transactionEvents[j];
                    const eventUpdated: UpdateEventDto = {
                        time: new Date().toISOString(),
                        type: 'com.facephi.nest101.status.consumed',
                        data: { 'status': 'CONSUMED' }
                    };
                    this.transactionEventDataSource.updateEventsByTransactionId(event.id, eventUpdated);
                }
            }
        }, this.queryInterval.interval);
    }
}
