import { Transaction } from "../../entities/transaction.entity"
import { CreateEventResponseDto } from "../create/create-event-response.dto"
import { CreateEventDto } from "../create/create-event.dto"

export interface TransactionEventDataSource {
    getTransactionByTransactionId(transactionId: string): Transaction | Promise<Transaction | undefined> | undefined
    create(createTransactionDto: CreateEventDto): CreateEventResponseDto | undefined | Promise<CreateEventResponseDto | undefined>
}

