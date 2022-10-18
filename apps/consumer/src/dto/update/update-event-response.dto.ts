export class UpdateEventResponseDto {
    eventId: string;
    errorMessage?: string;

    constructor(eventId: string, errorMessage?: string) {
        this.eventId = eventId;
        this.errorMessage = errorMessage;
    }
}
