import { Expose } from 'class-transformer';
import { Json, ObjectUtils, UUID } from 'utils/utils';

export class Event {
    #id: UUID;

    time: string;

    transactionId: string;

    type: string;

    data: Json;

    consumed: boolean;

    constructor(id: UUID, time: string, transactionId: string, type: string, data: Json, consumed: boolean = false) {
        this.#id = id;
        this.time = time;
        this.transactionId = transactionId;
        this.type = type;
        this.data = data;
        this.consumed = consumed;
    }

    @Expose()
    get id(): string {
        return this.#id as string;
    }

    set id(uuid: UUID) {
        this.#id = uuid;
    }
}

export type EventKeys = keyof Event;

export const EventInstance = new Event(new UUID(''), '', '', '', new Json({}));

export const [EventPropertiesNames, EventProperties] = ObjectUtils.getAllObjectPropertyNames(EventInstance);
