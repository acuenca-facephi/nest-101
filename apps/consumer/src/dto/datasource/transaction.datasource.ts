import { TransactionEvent } from "../../entities/transaction-event.entity"
import { CreateTransactionEventResponseDto } from "../create/create-transaction-event-response.dto"
import { CreateTransactionEventDto } from "../create/create-transaction-event.dto"

export interface TransactionEventDataSource {
    getAllTransactions(): TransactionEvent[] | undefined | Promise<TransactionEvent[] | undefined>
    updateTransactionsByTransactionId(createTransactionDto: CreateTransactionEventDto): CreateTransactionEventResponseDto | undefined | Promise<CreateTransactionEventResponseDto | undefined>
}

