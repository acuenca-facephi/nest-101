export class UpdateTransactionResponseDto {
    transactionId: string;
    errorMessage?: string;

    constructor(transactionId: string, errorMessage?: string) {
        this.transactionId = transactionId;
        this.errorMessage = errorMessage;
    }
}
