import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { config as dotenvConfig } from 'dotenv';
import { PostgresModule } from '@app/postgres';
import { SchemaRegistryModule } from '@schreg/schema-registry';
import { APP_LOGGER_TOKEN } from '../app.service';
import { Logger } from '@nestjs/common';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';
import { Transaction } from './entities/transaction.entity';
import { v4 as uuidv4, validate as uuidValidate, version as getUuidVersion } from 'uuid';
import { CreateTransactionResponseDto } from './dto/create/create-transaction-response.dto';
import { postgresContainer } from '../../test/setup-test.spec';
import { POSTGRES_PORT } from '../../test/postgres-container.spec';

jest.setTimeout(50000);

describe('TransactionController', () => {
    let controller: TransactionController;
    let config: ConfigService;

    beforeEach(async () => {
        dotenvConfig();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionController],
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
                            switch (key) {
                                case 'DATABASE_HOST':
                                    return postgresContainer.getHost();
                                case 'DATABASE_PORT':
                                    return postgresContainer.getMappedPort(POSTGRES_PORT);
                                default:
                                    return process.env[key];
                            }
                        })
                    }
                }
            ]
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
        config = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('create transaction should create successfully', async () => {
        // arrange
        const dummyTransaction = new Transaction(
            uuidv4(), '2022-07-29T12:31:04.555Z',
            '1111-AAA', '66f63676-88b0-4287-b21b-373e03273389', 'CREATED', '1st step'
        );

        // act
        const result = await controller.create(dummyTransaction);

        // assert
        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(CreateTransactionResponseDto);
        expect(result!.errorMessage).toBeUndefined();
        expect(uuidValidate(result!.transactionId)).toBeTruthy();
        expect(getUuidVersion(result!.transactionId)).toBe(4);
    });
});
