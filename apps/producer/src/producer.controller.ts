import {
    Body, ClassSerializerInterceptor, Controller, Get, HttpException, HttpStatus,
    Inject, Logger, Post, Res, UseInterceptors
} from '@nestjs/common';
import { CreateTransactionEventDto } from './dto/create/create-transaction-event.dto';
import { ProducerService, PRODUCER_LOGGER_TOKEN } from './producer.service';
import { Response } from 'express';
import { ExcludeNullInterceptor } from 'utils/utils';
import { CreateTransactionEventResponseDto } from './dto/create/create-transaction-event-response.dto';

@Controller('transaction-event')
@UseInterceptors(ClassSerializerInterceptor, ExcludeNullInterceptor)
export class ProducerController {
    constructor(
        private readonly producerService: ProducerService,
        @Inject(PRODUCER_LOGGER_TOKEN) private logger: Logger
    ) { }

    private status(): string {
        return `Hello World From NestJs! Server listening on port ${process.env.SERVER_PORT}.`;
    }

    @Get('/status')
    getStatus(): string {
        return this.status();
    }

    @Post()
    async createTransactionEvent(@Body() createTransactionEventDto: CreateTransactionEventDto) {
        const result = await this.producerService.createTransactionEvent(createTransactionEventDto);

        if (result instanceof CreateTransactionEventResponseDto) {
            this.logger.log(`Transaction ${result.transactionId} created! :)`);
        } else {
            this.logger.log(`Transaction ${JSON.stringify(createTransactionEventDto)} not created! :(`);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Transaction ${JSON.stringify(createTransactionEventDto)} not created! :(`,
            }, HttpStatus.INTERNAL_SERVER_ERROR); 
        }

        return result;
    }
}
