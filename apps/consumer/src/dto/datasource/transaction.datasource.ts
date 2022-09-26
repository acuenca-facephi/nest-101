import { Transaction } from "../../entities/transaction.entity"
import { UpdateEventDto } from "../../dto/update/update-event.dto"
import { UpdateEventResponseDto } from "../update/update-event-response.dto"
import { Event } from '../../entities/event.entity';


export interface TransactionEventDataSource {
    getAllTransactions(): Transaction[] | undefined | Promise<Transaction[] | undefined>
    getAllTransactionEvents(transactionId: string): Promise<Event[] | undefined>
    updateEventsByTransactionId(eventId: string, UpdateEventDto: UpdateEventDto): Promise<UpdateEventResponseDto | undefined> | UpdateEventResponseDto | undefined
}

