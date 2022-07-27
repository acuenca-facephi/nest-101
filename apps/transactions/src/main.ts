import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config as dotenvConfig } from 'dotenv';

async function bootstrap() {
    // Loads .env file and environment variables.
    dotenvConfig();
    const port = process.env.SERVER_PORT;

    const app = await NestFactory.create(AppModule);

    // Setup Swagger
    const options = new DocumentBuilder()
        .setTitle('Nest 101 Transactions')
        .setDescription('Nest 101 Transactions exercise')
        .setVersion('0.0.1')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(port != null ? port : 3000);
}
bootstrap();