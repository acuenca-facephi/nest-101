import {
    Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus,
    Logger, UseInterceptors, ClassSerializerInterceptor, Req, HttpException
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AppController } from '../app.controller';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { ExcludeNullInterceptor } from '../util/exclude-null.interceptor';

@Controller('transaction')
@UseInterceptors(ClassSerializerInterceptor, ExcludeNullInterceptor)
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }
    private readonly logger = new Logger(AppController.name);

    @Get()
    async findAll() {
        return await this.transactionService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const transaction = await this.transactionService.findOne(id);

        if (transaction != undefined) {
            this.logger.log(`Transaction ${id} found! :)`);
        } else {
            this.logger.log(`Transaction ${id} not found! :(`);
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `Transaction ${id} not found! :(`,
            }, HttpStatus.NOT_FOUND);
        }

        return transaction;
    }

    @Post()
    async create(@Body() createTransactionDto: CreateTransactionDto) {
        let result: CreateTransactionResponseDto | undefined

        result = await this.transactionService.create(createTransactionDto);
        if (result instanceof CreateTransactionResponseDto) {
            this.logger.log(
                !result.errorMessage ?
                    `Transaction ${result.transactionId} created! :)`:
                    `Transaction ${JSON.stringify(createTransactionDto)} not created! :(\nDetails below: ${result.errorMessage}`);
        } else {
            this.logger.log(`Transaction ${JSON.stringify(createTransactionDto)} not created! :(`);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Transaction ${JSON.stringify(createTransactionDto)} not created! :(`,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return result;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        const transaction = await this.transactionService.update(id, updateTransactionDto);

        if (transaction != undefined) {
            this.logger.log(`Transaction ${id} updated! :)`);
        } else {
            this.logger.log(`Transaction ${id} not updated! :(`);
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `Transaction ${id} not updated! :(`,
            }, HttpStatus.NOT_FOUND);
        }

        return transaction;
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deletedTransaction = await this.transactionService.remove(id);

        if (deletedTransaction != undefined) {
            this.logger.log(`Transaction ${id} deleted! :)`);
        } else {
            this.logger.log(`Transaction ${id} not deleted! :(`);
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `Transaction ${id} not deleted! :(`,
            }, HttpStatus.NOT_FOUND);
        }

        return deletedTransaction;
    }
}
