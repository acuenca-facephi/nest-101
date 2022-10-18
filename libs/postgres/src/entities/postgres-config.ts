import { Logger } from "@nestjs/common";
import { PostgresForeignKeyDefinition } from "./postgres-foreingkey-definition";

export interface PostgresConfig {
    databaseHost: string, databaseName: string, databaseUser: string,
    databasePassword: string, databasePort: number, tableName: string,
    primaryKeysNames: string[], instanceOfObject: object, logger: Logger,
    foreignKeys: PostgresForeignKeyDefinition[]
}