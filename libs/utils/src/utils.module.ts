import { Module } from '@nestjs/common';
import { ExcludeNullInterceptor } from './exclude-null.interceptor';
import { Json } from './json';
import { ObjectUtils } from './object-utils';
import { UUID } from './uuid';

@Module({
    providers: [ExcludeNullInterceptor, Json, UUID, ObjectUtils],
    exports: [ExcludeNullInterceptor, Json, UUID, ObjectUtils]
})
export class UtilsModule { }
