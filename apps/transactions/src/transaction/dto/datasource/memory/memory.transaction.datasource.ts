import { CreateTransactionResponseDto } from 'src/transaction/dto/create/create-transaction-response.dto';
import { CreateTransactionDto } from 'src/transaction/dto/create/create-transaction.dto';
import { UpdateTransactionResponseDto } from 'src/transaction/dto/update/update-transaction-response.dto';
import { UpdateTransactionDto } from 'src/transaction/dto/update/update-transaction.dto';
import { Transaction, TransactionKeys, TransactionPropertiesNames } from 'src/transaction/entities/transaction.entity';
import { TransactionDataSource } from '../transaction.datasource';
import { v4 as uuidV4 } from "uuid";

export class TransactionMemoryDataSource implements TransactionDataSource {

    private transactions: Transaction[] = [
        new Transaction('', new Date().toISOString(), '1234-ABC'),
        new Transaction('', new Date().toISOString(), '5678-DEF')
    ];

    getAll(): Transaction[] {
        return this.transactions;
    }

    getById(transactionId: string): Transaction | undefined {
        const transaction = this.transactions.find(transaction => transaction.id == transactionId);
        return transaction;
    }

    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto {
        const transactionToCreate = new Transaction(uuidV4(), createTransactionDto.time, createTransactionDto.customId);
        this.transactions.push(transactionToCreate);
        return new CreateTransactionResponseDto(transactionToCreate.id as string);
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | undefined {
        const transactionToUpdate = this.transactions.find(
            transaction => transaction.id == transactionId);
        let updateTransactionResponse: UpdateTransactionResponseDto | undefined;

        if (transactionToUpdate != undefined) {
            const propertiesToUpdate = Object.entries(updateTransactionDto);
            for (let index = 0; index < propertiesToUpdate.length; index++) {
                const propertyToUpdate = propertiesToUpdate[index];
                if (TransactionPropertiesNames.includes(propertyToUpdate[0])) {
                    transactionToUpdate[`${propertyToUpdate[0] as TransactionKeys}`] = propertyToUpdate[1];
                }
            }
            updateTransactionResponse = new UpdateTransactionResponseDto(transactionToUpdate.id as string);
        } else
            updateTransactionResponse = undefined;
        
        return updateTransactionResponse;
    }

    remove(transactionId: string): Transaction | undefined {
        const indexOfTransactionToRemove = this.transactions.findIndex(
            transaction => transaction.id == transactionId);
        let transactionRemoved: Transaction | undefined;

        if (indexOfTransactionToRemove != -1) {
            const deletedTransactions = this.transactions.splice(indexOfTransactionToRemove, 1);
            transactionRemoved = deletedTransactions[0]
        } else
            transactionRemoved = undefined;

        return transactionRemoved
    }
}
