import { Logger, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
// import { TransactionMemoryDataSource } from './dto/datasource/memory/memory.transaction.datasource';
import { TransactionPostgreSqlDataSource } from './dto/datasource/posgresql/postgresql.transaction.datasource';
import { AppController } from '../app.controller';
import { PostgresModule } from '@app/postgres';
import { ConfigModule } from '@nestjs/config';
import { APP_LOGGER_TOKEN } from '../app.service';
import { ApicurioV2SchemaRegistryDataSource } from '@schreg/schema-registry/validation/apicurio/apicurio-v2-schema-registry.datsource';
import { AjvJsonSchemaService } from '@schreg/schema-registry/validation/ajv/ajv-json-schema.service';
import { SchemaRegistryModule } from '@schreg/schema-registry';

@Module({
    imports: [
        PostgresModule,
        SchemaRegistryModule,
        ConfigModule.forRoot()
    ],
    controllers: [TransactionController],
    providers: [
        {
            provide: APP_LOGGER_TOKEN,
            useValue: new Logger(AppController.name)
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
        TransactionPostgreSqlDataSource,
        TransactionService
    ]
})
export class TransactionModule { }
