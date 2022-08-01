import { ApiProperty } from "@nestjs/swagger";

export class Transaction {
    readonly #id: string;

    @ApiProperty()
    time: string;

    @ApiProperty()
    customId: string;

    constructor(id: string, time: string, customId: string) {
        this.#id = id;
        this.time = time;
        this.customId = customId;
    }

    getId(): string {
        return this.#id
    }
}

export type TransactionKeys = keyof Transaction;

export const TransactionProperties = Object.getOwnPropertyNames(new Transaction('', '', ''))
