import {
    Body, ClassSerializerInterceptor, Controller, Get, HttpStatus,
    Inject, Logger, Post, Res, UseInterceptors
} from '@nestjs/common';
import { CreateTransactionEventDto } from './dto/create/create-transaction-event.dto';
import { PRODUCER_LOGGER_TOKEN } from './producer.module';
import { ProducerService } from './producer.service';
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
    async createTransactionEvent(@Body() createTransactionEventDto: CreateTransactionEventDto, @Res({ passthrough: true }) response: Response) {
        let statusCode: HttpStatus;
        let result: CreateTransactionEventResponseDto | undefined | {};

        result = await this.producerService.createTransactionEvent(createTransactionEventDto);
        if (result instanceof CreateTransactionEventResponseDto) {
            statusCode = HttpStatus.CREATED
            this.logger.log(`Transaction ${result.transactionId} created! :)`);
        } else {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            this.logger.log(`Transaction ${JSON.stringify(createTransactionEventDto)} not created! :(`);
            result = {}
        }

        response.status(statusCode).json(result)
    }
}
