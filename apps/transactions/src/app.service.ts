import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World From NestJs! Server listening on port ${process.env.SERVER_PORT}.`;
  }
}
