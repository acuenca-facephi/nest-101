import { JsonSchemaService } from "../json-schema.service";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AjvJsonSchemaService implements JsonSchemaService {
    private readonly ajv: Ajv2020;

    constructor() {
        this.ajv = new Ajv2020();
        addFormats(this.ajv);
    }

    validate(schema: object, data: unknown): boolean {
        const validateResult = this.ajv.compile(schema)(data);
        return validateResult;
    }
}