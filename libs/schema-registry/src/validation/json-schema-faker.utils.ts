import { JSONSchemaFaker } from "json-schema-faker";

export function generateFakeInstance(jsonSchema: object): object {
    return JSONSchemaFaker.generate(jsonSchema) as object;
}