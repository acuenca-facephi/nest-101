import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [ProducerController],
    providers: [ProducerService],
})
export class ProducerModule { }
