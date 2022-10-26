import { Expose } from 'class-transformer';
import { ObjectUtils, UUID } from 'utils/utils';

export class Transaction {
    #id: UUID;

    time: string;

    customId: string;

    flowId: string;

    status: string;

    step: string;

    // This allow to set any property name with any property type dynamically to a transaction. 
    // This dynamically added properties must be validated against a schema registry using the "flowId".
    [key: string]: any;

    constructor(id: UUID, time: string, customId: string, status?: string, step?: string, ...properties: [key: string, value: any][]) {
        this.#id = id;
        this.time = time;
        this.customId = customId;
        this.status = status ? status : 'CREATED';
        this.step = step ? step : '1st step';
        for (const property of properties)
            this[property[0]] = property[1];
    }

    @Expose()
    get id(): string {
        return this.#id as string;
    }

    set id(uuid: UUID) {
        this.#id = uuid;
    }
}

export type TransactionKeys = keyof Transaction;

export const TransactionInstance = new Transaction(new UUID(''), '', '');

export const [TransactionPropertiesNames, TransactionProperties] = ObjectUtils.getAllObjectPropertyNames(TransactionInstance);
