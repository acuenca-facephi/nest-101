import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';
import { UpdateIntervalResponseDto } from './dto/update/update-interval-response.dto';
import { UpdateIntervalDto } from './dto/update/update-interval.dto';
import { Interval } from './entities/interval.entity';

export const CONSUMER_LOGGER_TOKEN = Symbol('CONSUMER_LOGGER_TOKEN');
export const CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('CONSUMER_TRANSACTION_EVENT_TOKEN');
export const EVENT_TABLE_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const TRANSACTION_TABLE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');

@Injectable()
export class ConsumerService {

    private transactionEventDataSource: TransactionEventDataSource;
    private logger: Logger;
    private queryInterval: Interval;
    private batchSize: number;

    constructor(
        @Inject(CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN) transactionEventDataSource: TransactionEventDataSource,
        @Inject(ConfigService) configService: ConfigService,
        @Inject(CONSUMER_LOGGER_TOKEN) logger: Logger
    ) {
        this.logger = logger;
        this.transactionEventDataSource = transactionEventDataSource;
        this.queryInterval = new Interval(
            parseInt(configService.get<string>('MIN_INTERVAL_MS')!),
            parseInt(configService.get<string>('MAX_INTERVAL_MS')!),
            parseInt(configService.get<string>('INTERVAL_MS')!));
        // TODO: Create a BatchSize class to define a min/max size, like the Interval class.
        this.batchSize = parseInt(configService.get<string>('BATCH_SIZE')!);
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

        this.logger.log(updateMessage);
        return new UpdateIntervalResponseDto(intervalUpdated, updateMessage);
    }

    private consumerLoop() {
        setTimeout(async () => {
            const result = await this.transactionEventDataSource.getAllTransactionsWithEvents();
            const transactions = result != undefined ? result : [];
            for (let i = 0; i < transactions.length; i++) {
                const transaction = transactions[i];
                const consumedEvents =
                    await this.transactionEventDataSource.applyAllTransactionEvents(transaction.id, this.batchSize);
                if (!consumedEvents || consumedEvents.length == 0)
                    this.logger.error(
                        `Can not consume the events of the below transaction.\n${JSON.stringify(transaction)}! :(`);
                else
                    consumedEvents.forEach(event => this.logger.log(`Event ${event.id} consumed! :)`));
            }
            this.consumerLoop();
        }, this.queryInterval.interval);
    }
}
