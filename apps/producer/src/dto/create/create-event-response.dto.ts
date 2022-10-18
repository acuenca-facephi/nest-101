export class CreateEventResponseDto {
    eventId: string;
    errorMessage?: string;

    constructor(eventId: string, errorMessage?: string) {
        this.eventId = eventId;
        this.errorMessage = errorMessage;
    }
}
