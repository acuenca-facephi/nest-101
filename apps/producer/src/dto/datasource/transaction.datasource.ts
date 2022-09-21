import { TransactionEvent } from "../../entities/transaction-event.entity"
import { CreateTransactionEventResponseDto } from "../create/create-transaction-event-response.dto"
import { CreateTransactionEventDto } from "../create/create-transaction-event.dto"

export interface TransactionEventDataSource {
    getTransactionByCustomerId(transactionId: string): TransactionEvent | Promise<TransactionEvent | undefined> | undefined
    create(createTransactionDto: CreateTransactionEventDto): CreateTransactionEventResponseDto | undefined | Promise<CreateTransactionEventResponseDto | undefined>
}

