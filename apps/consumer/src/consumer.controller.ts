import {
    Body, ClassSerializerInterceptor, Controller, Get, HttpException, HttpStatus,
    Inject, Logger, Post, UseInterceptors
} from '@nestjs/common';
import { ConsumerService, CONSUMER_LOGGER_TOKEN } from './consumer.service';
import { ExcludeNullInterceptor } from '@utils/utils';
import { UpdateIntervalDto } from './dto/update/update-interval.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor, ExcludeNullInterceptor)
export class ConsumerController {
    constructor(
        private readonly consumerService: ConsumerService,
        @Inject(CONSUMER_LOGGER_TOKEN) private logger: Logger
    ) { }

    private status(): string {
        return `Hello World From NestJs! Server listening on port ${process.env.SERVER_PORT}.`;
    }

    @Get('/status')
    getStatus(): string {
        return this.status();
    }

    @Post('/interval')
    async postNewQueryInterval(@Body() newQueryInterval: UpdateIntervalDto) {
        const result = this.consumerService.changeQueryInterval(newQueryInterval);

        if (result.intervalUpdated) {
            this.logger.log(result.resultMessage);
        } else {
            this.logger.error(result.resultMessage);
            throw new HttpException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                error: result.resultMessage,
            }, HttpStatus.UNPROCESSABLE_ENTITY); 
        }

        return result;
    }
}
