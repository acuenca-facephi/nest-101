import { Inject, Injectable } from '@nestjs/common';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { CreateTransactionDto } from './dto/create/create-transaction.dto';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { TransactionDataSource } from './dto/datasource/transaction.datasource';
import { UpdateTransactionResponseDto } from './dto/update/update-transaction-response.dto';
import { UpdateTransactionDto } from './dto/update/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';
import { SchemaRegistryDataSource } from '@schreg/schema-registry/validation/schema-registry.datsource';
import { JsonSchemaService } from '@schreg/schema-registry/validation/json-schema.service';
import { ObjectUtils } from '@utils/utils';
import { generateFakeInstance } from '@schreg/schema-registry/validation/json-schema-faker.utils';

export const TRANSACTION_DATASOURCE_TOKEN = Symbol('TRANSACTION_DATASOURCE_TOKEN');

@Injectable()
export class TransactionService {

    private transactionDataSource: TransactionDataSource;
    private schemaRegistryDataSource: SchemaRegistryDataSource;
    private jsonSchemaService: JsonSchemaService;

    constructor(
        @Inject(TransactionPostgreSqlDataSource) transactionDataSource: TransactionDataSource,
        @Inject(ApicurioV2SchemaRegistryDataSource) schemaRegistryDataSource: SchemaRegistryDataSource,
        @Inject(AjvJsonSchemaService) jsonSchemaService: JsonSchemaService
    ) {
        this.transactionDataSource = transactionDataSource;
        this.schemaRegistryDataSource = schemaRegistryDataSource;
        this.jsonSchemaService = jsonSchemaService;
    }

    async findAll(): Promise<Transaction[]> {
        return this.transactionDataSource.getAll();
    }

    async findOne(transactionId: string): Promise<Transaction | undefined> {
        return this.transactionDataSource.getById(transactionId);
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<CreateTransactionResponseDto | undefined> {
        try {
            const schema = await this.schemaRegistryDataSource.getSchema(createTransactionDto.flowId);
            return (
                this.jsonSchemaService.validate(
                    schema,
                    ObjectUtils.mergeObjects(createTransactionDto, generateFakeInstance(schema))
                ) ?
                    this.transactionDataSource.create(createTransactionDto)
                    :
                    new CreateTransactionResponseDto('', 'Invalid transaction format.')
            );
        } catch (error) {
            return new CreateTransactionResponseDto(
                '', `Error creating transaction. Details below:\n${error.stack}`);
        }
    }

    async update(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<UpdateTransactionResponseDto | undefined> {
        return this.transactionDataSource.update(transactionId, updateTransactionDto);
    }

    async remove(transactionId: string): Promise<Transaction | undefined> {
        return this.transactionDataSource.remove(transactionId);
    }
}
