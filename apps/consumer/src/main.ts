import { NestFactory } from '@nestjs/core';
import { SERVER_PORT } from './environment/environment';
import { ConsumerModule } from './consumer.module';

async function bootstrap() {
    const serverPort = SERVER_PORT;
    const app = await NestFactory.create(ConsumerModule);
    await app.listen(serverPort ? serverPort : 3002);
}
bootstrap();
