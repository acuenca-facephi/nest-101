import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Logger, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Response } from 'express';
import { AppController } from '../app.controller';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { UpdateTransactionResponseDto } from './dto/update/update-transaction-response.dto';

@Controller('transaction')
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }
    private readonly logger = new Logger(AppController.name);

    @Get()
    async findAll() {
        return await this.transactionService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
        const transaction = await this.transactionService.findOne(id);
        const isTransactionFound = transaction != undefined;
        let statusCode: HttpStatus;
        let result: Transaction | {}

        if (isTransactionFound) {
            this.logger.log(`Transaction ${id} found! :)`);
            statusCode = HttpStatus.OK;
            result = transaction
        } else {
            this.logger.log(`Transaction ${id} not found! :(`);
            statusCode = HttpStatus.NOT_FOUND;
            result = {}
        }

        response.status(statusCode).json(result);
    }

    @Post()
    async create(@Body() createTransactionDto: CreateTransactionDto, @Res({ passthrough: true }) response: Response) {
        let statusCode: HttpStatus;
        let result: CreateTransactionResponseDto | undefined | {}

        result = await this.transactionService.create(createTransactionDto);
        if (result instanceof CreateTransactionResponseDto) {
            statusCode = HttpStatus.CREATED
            this.logger.log(`Transaction ${result.transactionId} created! :)`);
        } else {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            this.logger.log(`Transaction ${JSON.stringify(createTransactionDto)} not created! :(`);
            result = {}
        }

        response.status(statusCode).json(result)
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateTransactionDto: UpdateTransactionDto,
        @Res({ passthrough: true }) response: Response) {
        const transaction = await this.transactionService.update(id, updateTransactionDto);
        const isTransactionFound = transaction != undefined;
        let statusCode: HttpStatus;
        let result: UpdateTransactionResponseDto | {}

        if (isTransactionFound) {
            this.logger.log(`Transaction ${id} updated! :)`);
            statusCode = HttpStatus.OK;
            result = transaction
        } else {
            this.logger.log(`Transaction ${id} not updated! :(`);
            statusCode = HttpStatus.NOT_FOUND;
            result = {}
        }

        response.status(statusCode).json(result);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
        const deletedTransaction = await this.transactionService.remove(id);
        const isTransactionDeled = deletedTransaction != undefined;
        let statusCode: HttpStatus;
        let result: Transaction | {}

        if (isTransactionDeled) {
            this.logger.log(`Transaction ${id} deleted! :)`);
            statusCode = HttpStatus.OK;
            result = deletedTransaction
        } else {
            this.logger.log(`Transaction ${id} not deleted! :(`);
            statusCode = HttpStatus.NOT_FOUND;
            result = {}
        }

        response.status(statusCode).json(result);
    }
}
