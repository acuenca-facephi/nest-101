import { Inject, Injectable } from '@nestjs/common';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { generateFakeInstance } from '@schreg/schema-registry/validation/json-schema-faker.utils';
import { JsonSchemaService } from '@schreg/schema-registry/validation/json-schema.service';
import { SchemaRegistryDataSource } from '@schreg/schema-registry/validation/schema-registry.datsource';
import { ObjectUtils } from '@utils/utils';
import { CreateEventResponseDto } from './dto/create/create-event-response.dto';
import { CreateEventDto } from './dto/create/create-event.dto';
import { TransactionEventDataSource } from './dto/datasource/transaction.datasource';

export const PRODUCER_LOGGER_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');
export const EVENT_TABLE_TOKEN = Symbol('PRODUCER_LOGGER_TOKEN');
export const TRANSACTION_TABLE_TOKEN = Symbol('PRODUCER_TRANSACTION_EVENT_TOKEN');


@Injectable()
export class ProducerService {

    private transactionEventDataSource: TransactionEventDataSource;
    private schemaRegistryDataSource: SchemaRegistryDataSource;
    private jsonSchemaService: JsonSchemaService;

    constructor(
        @Inject(PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN) transactionEventDataSource: TransactionEventDataSource,
        @Inject(ApicurioV2SchemaRegistryDataSource) schemaRegistryDataSource: SchemaRegistryDataSource,
        @Inject(AjvJsonSchemaService) jsonSchemaService: JsonSchemaService
    ) {
        this.transactionEventDataSource = transactionEventDataSource;
        this.schemaRegistryDataSource = schemaRegistryDataSource;
        this.jsonSchemaService = jsonSchemaService;
    }

    async getTransactionByTransactionId(transactionId: string) {
        return this.transactionEventDataSource.getTransactionByTransactionId(transactionId);
    }

    async createEvent(
        createEventDto: CreateEventDto
    ): Promise<CreateEventResponseDto | undefined> {
        try {
            const schema = await this.schemaRegistryDataSource.getSchema(createEventDto.type);
            if (await this.getTransactionByTransactionId(createEventDto.transactionId as string) != undefined)
                return (
                    this.jsonSchemaService.validate(schema,
                        ObjectUtils.mergeObjects(createEventDto, generateFakeInstance(schema))) ?
                        this.transactionEventDataSource.create(createEventDto) :
                        new CreateEventResponseDto('', 'Invalid event format.')
                );
            else
                throw new Error('Can not create an event of an unexisting transaction.');
        } catch (error) {
            return new CreateEventResponseDto(
                '', `Error creating event. Details below:\n${error.stack}`);
        }
    }
}
