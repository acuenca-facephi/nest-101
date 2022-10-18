import { PostgresModule, PostgresService } from '@app/postgres';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { ConsumerController } from './consumer.controller';
import { ConsumerService, CONSUMER_LOGGER_TOKEN, CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN, EVENT_TABLE_TOKEN, TRANSACTION_TABLE_TOKEN } from './consumer.service';
import { SchemaRegistryModule } from '@schreg/schema-registry';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';

@Module({
    imports: [
        PostgresModule,
        SchemaRegistryModule,
        ConfigModule.forRoot(),
    ],
    controllers: [ConsumerController],
    providers: [
        {
            provide: CONSUMER_LOGGER_TOKEN,
            useValue: new Logger(ConsumerController.name)
        },
        {
            provide: CONSUMER_TRANSACTION_EVENT_DATA_SOURCE_TOKEN,
            useClass: TransactionPostgreSqlDataSource
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
        ConsumerService
    ]
})
export class ConsumerModule { }
