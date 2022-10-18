import { Transaction } from "../../entities/transaction.entity"
import { Event } from '../../entities/event.entity';
import { UpdateTransactionDto } from "../update/update-transaction.dto";
import { UpdateTransactionResponseDto } from "../update/update-transaction-response.dto";
import { UpdateEventDto } from "../update/update-event.dto";
import { UpdateEventResponseDto } from "../update/update-event-response.dto";
import { PoolClient } from "pg";


export interface TransactionEventDataSource {
    getAllTransactionsWithEvents(): Transaction[] | undefined | Promise<Transaction[] | undefined>;
    getAllTransactionEvents(transactionId: string, client?: PoolClient): Promise<Event[] | undefined>;
    applyAllTransactionEvents(transactionId: string, batchSize: number): Event[] | undefined | Promise<Event[] | undefined>;
    applyAllTransactionEventsValidation(
        transactionId: string, events: Event[]
    ): Event[] | undefined | Promise<Event[] | undefined>;
    updateTransaction(transactionId: string, updateTransactionDto: UpdateTransactionDto): UpdateTransactionResponseDto | Promise<UpdateTransactionResponseDto | undefined> | undefined;
    updateEvent(eventId: string, updateEventDto: UpdateEventDto): Promise<UpdateEventResponseDto | undefined> | UpdateEventResponseDto | undefined;
}

