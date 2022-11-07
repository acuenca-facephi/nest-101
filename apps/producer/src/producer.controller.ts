import {
    Body, ClassSerializerInterceptor, Controller, Get, HttpException, HttpStatus,
    Inject, Logger, Post, UseInterceptors
} from '@nestjs/common';
import { CreateEventDto } from './dto/create/create-event.dto';
import { ProducerService, PRODUCER_LOGGER_TOKEN } from './producer.service';
import { ExcludeNullInterceptor } from '@utils/utils';
import { CreateEventResponseDto } from './dto/create/create-event-response.dto';

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
    async createTransactionEvent(@Body() createEventDto: CreateEventDto) {
        const result = await this.producerService.createEvent(createEventDto);

        if (result instanceof CreateEventResponseDto) {
            this.logger.log(
                !result.errorMessage ?
                    `Event ${result.eventId} created! :)` :
                    `Event ${JSON.stringify(createEventDto)} not created! :(\nDetails below: ${result.errorMessage}`);
        } else {
            this.logger.log(`Event ${JSON.stringify(createEventDto)} not created! :(`);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Event ${JSON.stringify(createEventDto)} not created! :(`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return result;
    }
}
