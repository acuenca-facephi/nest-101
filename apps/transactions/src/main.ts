import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as dotenvConfig } from 'dotenv';

async function bootstrap() {
    // Loads .env file.
    dotenvConfig();
    
    const port = process.env.SERVER_PORT;
    const app = await NestFactory.create(AppModule);
    await app.listen(port != null ? port : 3000);
}
bootstrap();
