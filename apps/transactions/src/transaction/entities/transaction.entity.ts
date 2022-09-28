import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { getAllObjectPropertyNames } from '../../util/util';
import { UUID } from 'utils/utils';

export class Transaction {
    #id: UUID;

    @ApiProperty()
    time: string;

    @ApiProperty()
    customId: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    step: string;

    constructor(id: UUID, time: string, customId: string, status?: string, step?: string) {
        this.#id = id;
        this.time = time;
        this.customId = customId;
        this.status = status ? status : 'CREATED';
        this.step = step ? step : '1st step';
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

export const [TransactionPropertiesNames, TransactionProperties] = getAllObjectPropertyNames(TransactionInstance);
