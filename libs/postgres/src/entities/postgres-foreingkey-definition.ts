export class PostgresForeignKeyDefinition {
    fieldName: string;
    foreignKeyName: string;
    foreignTableName: string;

    constructor(fieldName: string, foreignKeyName: string, foreignTableName: string) {
        this.fieldName = fieldName;
        this.foreignKeyName = foreignKeyName;
        this.foreignTableName = foreignTableName;
    }
}