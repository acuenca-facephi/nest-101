import { Transaction } from "src/transaction/entities/transaction.entity";
import { CreateTransactionResponseDto } from "../../create/create-transaction-response.dto";
import { CreateTransactionDto } from "../../create/create-transaction.dto";
import { UpdateTransactionResponseDto } from "../../update/update-transaction-response.dto";
import { UpdateTransactionDto } from "../../update/update-transaction.dto";
import { TransactionDataSource } from "../transaction.datasource";

export class TransactionPostgreSqlDataSource implements TransactionDataSource {

    constructor(databaseHost: string, databaseName: string, databaseUser: string, 
        databasePassword: string, databasePort: string) {
        
        console.log()
    }

    getAll(): Transaction[] {
        throw new Error("Method not implemented.");
    }

    getById(transactionId: string): Transaction | undefined {
        throw new Error("Method not implemented.");
    }

    create(createTransactionDto: CreateTransactionDto): CreateTransactionResponseDto {
        throw new Error("Method not implemented.");
    }

    update(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | undefined {
        throw new Error("Method not implemented.");
    }

    remove(transactionId: string): Transaction | undefined {
        throw new Error("Method not implemented.");
    }
}
