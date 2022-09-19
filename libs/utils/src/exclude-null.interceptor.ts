import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function recursivelyStripNullValues(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(recursivelyStripNullValues);
    } else if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, value]) => [key, recursivelyStripNullValues(value)])
        );
    } else if (value !== null) {
        return value;
    }
}

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map(value => recursivelyStripNullValues(value)));
    }
}
