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
    applyAllTransactionEvents(
        transactionId: string, events: Event[]
    ): Event[] | undefined | Promise<Event[] | undefined>;
}

