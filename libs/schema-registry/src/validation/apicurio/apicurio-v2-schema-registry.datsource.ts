import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SchemaRegistryDataSource } from "../schema-registry.datsource";

@Injectable()
export class ApicurioV2SchemaRegistryDataSource implements SchemaRegistryDataSource {

    private apicurioUrl: string;
    private readonly API_BASE_URI: string = '/api/artifacts';

    constructor(
        @Inject(ConfigService) configService: ConfigService
    ) {
        this.apicurioUrl =
            `http://${configService.get<string>('SCHEMA_REGISTRY_HOST')}:${configService.get<string>('SCHEMA_REGISTRY_PORT')}`;
    }

    async getSchema(schemaId: string): Promise<object> {
        var result: object;

        try {
            const getSchemaByIdUrl = `${this.apicurioUrl}${this.API_BASE_URI}/${schemaId}`;
            result = await (await fetch(getSchemaByIdUrl)).json() as object;
        } catch (ex) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `Can not found "${schemaId}" schema. Details below:\n${JSON.stringify(ex)}`,
            }, HttpStatus.NOT_FOUND);
        }

        return result;
    }
}