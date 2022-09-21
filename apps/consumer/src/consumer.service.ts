import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';
import { UpdateIntervalResponseDto } from './dto/update/update-interval-response.dto';
import { UpdateIntervalDto } from './dto/update/update-interval.dto';
import { Interval } from './entities/interval.entity';

export const CONSUMER_LOGGER_TOKEN = Symbol('CONSUMER_LOGGER_TOKEN');
export const CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('CONSUMER_TRANSACTION_EVENT_TOKEN');

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
            configService.get<number>('MIN_INTERVAL_MS')!, configService.get<number>('MAX_INTERVAL_MS')!,
            configService.get<number>('INTERVAL_MS')!);
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
        while (true) {
            setInterval(async () => {
                const transactions = await this.transactionEventDataSource.getAllTransactions();
            }, this.queryInterval.interval);
        }
    }
}
