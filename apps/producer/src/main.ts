import { NestFactory } from '@nestjs/core';
import { SERVER_PORT } from './environment/environment';
import { ProducerModule } from './producer.module';

async function bootstrap() {
    const serverPort = SERVER_PORT;
    const app = await NestFactory.create(ProducerModule);
    await app.listen(serverPort ? serverPort : 3001);
}
bootstrap();
