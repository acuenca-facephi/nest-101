import { CreateTransactionEventResponseDto } from "../create/create-transaction-event-response.dto"
import { CreateTransactionEventDto } from "../create/create-transaction-event.dto"

export interface TransactionEventDataSource {
    create(createTransactionDto: CreateTransactionEventDto): CreateTransactionEventResponseDto | undefined | Promise<CreateTransactionEventResponseDto | undefined>
}

