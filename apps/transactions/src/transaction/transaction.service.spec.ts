import { PostgresModule } from '@app/postgres';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SchemaRegistryModule } from '@schreg/schema-registry';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { APP_LOGGER_TOKEN } from '../app.service';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { TransactionService } from './transaction.service';
import { config as dotenvConfig } from 'dotenv';
import { Transaction } from './entities/transaction.entity';
import { v4 as uuidv4, validate as uuidValidate, version as getUuidVersion } from 'uuid';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';

describe('TransactionService', () => {
    let service: TransactionService;
    let config: ConfigService;

    beforeEach(async () => {
        dotenvConfig();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                PostgresModule,
                SchemaRegistryModule
            ],
            providers: [
                TransactionService,
                {
                    provide: APP_LOGGER_TOKEN,
                    useValue: new Logger()
                },
                {
                    provide: TransactionPostgreSqlDataSource,
                    useClass: TransactionPostgreSqlDataSource
                },
                {
                    provide: ApicurioV2SchemaRegistryDataSource,
                    useClass: ApicurioV2SchemaRegistryDataSource
                },
                {
                    provide: AjvJsonSchemaService,
                    useClass: AjvJsonSchemaService
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            return process.env[key];
                        })
                    }
                }
            ],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
        config = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        const DATABASE_PASSWORD = config.get<string>('DATABASE_PASSWORD');
        expect(service).toBeDefined();
        expect(DATABASE_PASSWORD).toBeDefined();
    });

    it('create transaction should create successfully', async () => {
        // arrange
        const dummyTransaction = new Transaction(
            uuidv4(), '2022-07-29T12:31:04.555Z',
            '1111-AAA', '66f63676-88b0-4287-b21b-373e03273389', 'CREATED', '1st step'
        );

        // act
        const result = await service.create(dummyTransaction);

        // assert
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(CreateTransactionResponseDto);
        expect(result!.errorMessage).toBeUndefined();
        expect(uuidValidate(result!.transactionId)).toBeTruthy();
        expect(getUuidVersion(result!.transactionId)).toBe(4);
    });
});
