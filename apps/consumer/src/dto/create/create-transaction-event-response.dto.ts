export class CreateTransactionEventResponseDto {
    transactionId: string

    constructor(transactionId: string) {
        this.transactionId = transactionId
    }
}