import { Transaction } from "../../entities/transaction.entity"
import { Event } from '../../entities/event.entity';
import { PoolClient } from "pg";
import { Store } from "@reduxjs/toolkit";


export interface TransactionEventDataSource {
    getAllTransactionsWithEvents(): Transaction[] | undefined | Promise<Transaction[] | undefined>;
    getAllTransactionEvents(transactionId: string, client?: PoolClient): Promise<Event[] | undefined>;
    applyAllTransactionEvents(
        transactionId: string, events: Event[], batchSize: number, eventReducer: Store<Transaction, Event>
    ): Event[] | undefined | Promise<Event[] | undefined>;
}

