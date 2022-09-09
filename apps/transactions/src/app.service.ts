import { Injectable } from '@nestjs/common';

export const APP_LOGGER_TOKEN = Symbol('APP_LOGGER_TOKEN');

@Injectable()
export class AppService {
    getIndex(): string {
        return 'Welcome to Transactions REST API! go to "/swagger" to look for API documentation.'
    }

    getStatus(): string {
        return `Hello World From NestJs! Server listening on port ${process.env.SERVER_PORT}.`;
    }
}
