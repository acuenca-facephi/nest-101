import { Logger } from "@nestjs/common";

export interface PostgresConfig {
    databaseHost: string, databaseName: string, databaseUser: string,
    databasePassword: string, databasePort: number, tableName: string, primaryKeyName: string,
    instanceOfObject: object, logger: Logger
}