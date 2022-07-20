import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Get('/transactions')
    findAll() {
        return this.transactionService.findAll();
    }

    @Get('/transactions/:id')
    findOne(@Param('id') id: string) {
        return this.transactionService.findOne(id);
    }

    @Post('/transactions')
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionService.create(createTransactionDto);
    }

    @Patch('/transactions/:id')
    update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        return this.transactionService.update(id, updateTransactionDto);
    }

    @Delete('/transactions/:id')
    remove(@Param('id') id: string) {
        return this.transactionService.remove(id);
    }
}
