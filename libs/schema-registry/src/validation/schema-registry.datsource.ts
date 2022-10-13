export interface SchemaRegistryDataSource {
    getSchema(schemaName: string): Promise<object>;
}