import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Logger } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { Response } from 'express';
import { AppController } from 'src/app.controller';
import { Transaction } from './entities/transaction.entity';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { UpdateTransactionResponseDto } from './dto/update/update-transaction-response.dto';

@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }
    private readonly logger = new Logger(AppController.name);

    @Get()
    findAll() {
        return this.transactionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
        const transaction = this.transactionService.findOne(id);
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
    create(@Body() createTransactionDto: CreateTransactionDto, @Res({ passthrough: true }) response: Response) {
        let statusCode: HttpStatus;
        let result: CreateTransactionResponseDto | {}

        result = this.transactionService.create(createTransactionDto);
        if (result instanceof CreateTransactionResponseDto) {
            statusCode = HttpStatus.CREATED
            this.logger.log(`Transaction ${result.transactionId} created! :)`);
        } else {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            this.logger.log(`Transaction ${createTransactionDto} not created! :(`);
            result = {}
        }

        response.status(statusCode).json(result)
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateTransactionDto: UpdateTransactionDto,
        @Res({ passthrough: true }) response: Response) {
        const transaction = this.transactionService.update(id, updateTransactionDto);
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
    remove(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
        const deletedTransaction = this.transactionService.remove(id);
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
