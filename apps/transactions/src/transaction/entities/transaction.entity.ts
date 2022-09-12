import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { getAllObjectPropertyNames } from '../../util/util';
import { UUID } from '@app/postgres';
import { Json } from '../../util/json';

export class Transaction {
    #id: UUID;

    @ApiProperty()
    time: string;

    @ApiProperty()
    customId: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
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

export type TransactionKeys = keyof Transaction;

export const TransactionInstance = new Transaction(new UUID(''), '', '', '', new Json({}));

export const [TransactionPropertiesNames, TransactionProperties] = getAllObjectPropertyNames(TransactionInstance);
