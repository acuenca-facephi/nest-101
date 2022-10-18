export class UpdateIntervalResponseDto {
    intervalUpdated: boolean
    resultMessage: string

    constructor(intervalUpdated: boolean, resultMessage: string) {
        this.intervalUpdated = intervalUpdated;
        this.resultMessage = resultMessage;
    }
}
