import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function deleteObjectNullProperties(objectToCheck: object): object {
    Object.entries(objectToCheck).map(([key, value]) => {
        const isValueEmpty: boolean = value == null || !value;
        if (typeof value == 'object' && !isValueEmpty)
            value = deleteObjectNullProperties(value);
        if (isValueEmpty)
            delete objectToCheck[key as keyof typeof objectToCheck];
    });
    return objectToCheck;
}

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next
            .handle()
            .pipe(map(value => {
                var result: any;

                if (value instanceof Array) {
                    result = value.map(it => {
                        if (typeof it == 'object') {
                            return deleteObjectNullProperties(it);
                        } else
                            return it == null || !it ? '' : it;
                    })
                } else if (typeof value == 'object') {
                    result = deleteObjectNullProperties(value);
                } else
                    result = value == null || !it ? '' : value;

                return result;
            }));
    }
}
