import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getIndex(): string {
        return 'Welcome to Transactions REST API! go to "/swagger" to look for API documentation.'
    }
    
    getStatus(): string {
        return `Hello World From NestJs! Server listening on port ${process.env.SERVER_PORT}.`;
    }
}
