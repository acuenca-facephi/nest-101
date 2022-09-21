import { Expose } from 'class-transformer';
import { Json, ObjectUtils, UUID } from 'utils/utils';

export class TransactionEvent {
    #id: UUID;

    time: string;

    customId: string;

    type: string;

    data: Json;

    constructor(id: UUID, time: string, customId: string, type: string, data: Json) {
        this.#id = id;
        this.time = time;
        this.customId = customId;
        this.type = type;
        this.data = data;
    }

    @Expose()
    get id(): string {
        return this.#id as string;
    }

    set id(uuid: UUID) {
        this.#id = uuid;
    }
}

export type TransactionEventKeys = keyof TransactionEvent;

export const TransactionEventInstance = new TransactionEvent(new UUID(''), '', '', '', new Json({}));

export const [TransactionEventPropertiesNames, TransactionEventProperties] = ObjectUtils.getAllObjectPropertyNames(TransactionEventInstance);

const transactions: TransactionEvent[] = [
    new TransactionEvent('1', new Date().toISOString(), '1234-ABC', 'com.facephi.nest101.step.changed', new Json({ 'step': '1st step' })),
    new TransactionEvent('2', new Date().toISOString(), '5678-DEF', 'com.facephi.nest101.status.changed', new Json({ 'status': 'SUCCEDED' }))
];
