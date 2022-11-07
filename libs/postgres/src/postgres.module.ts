import { Module } from '@nestjs/common';
import { UtilsModule } from '@utils/utils';
import { PostgresService } from './postgres.service';

@Module({
    imports: [UtilsModule],
    providers: [PostgresService],
    exports: [PostgresService]
})
export class PostgresModule { }
