import { PostgresModule, PostgresService } from '@app/postgres';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchemaRegistryModule } from '@schreg/schema-registry';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { TransactionEventPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ProducerController } from './producer.controller';
import { EVENT_TABLE_TOKEN, ProducerService, PRODUCER_LOGGER_TOKEN, PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN, TRANSACTION_TABLE_TOKEN } from './producer.service';

@Module({
    imports: [
        PostgresModule,
        SchemaRegistryModule,
        ConfigModule.forRoot(),
    ],
    controllers: [ProducerController],
    providers: [
        {
            provide: PRODUCER_LOGGER_TOKEN,
            useValue: new Logger(ProducerController.name)
        },
        {
            provide: PRODUCER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN,
            useClass: TransactionEventPostgreSqlDataSource
        },
        {
            provide: EVENT_TABLE_TOKEN,
            useClass: PostgresService
        },
        {
            provide: TRANSACTION_TABLE_TOKEN,
            useClass: PostgresService
        },
        {
            provide: ApicurioV2SchemaRegistryDataSource,
            useClass: ApicurioV2SchemaRegistryDataSource
        },
        {
            provide: AjvJsonSchemaService,
            useClass: AjvJsonSchemaService
        },
        ProducerService
    ]
})
export class ProducerModule { }
