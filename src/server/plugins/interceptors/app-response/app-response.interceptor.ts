import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { z } from 'zod';
import { ResponseSchema } from './app-response.validation';

@Injectable()
export class AppResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map<unknown, z.infer<typeof ResponseSchema>>((data) => {
        console.log('masuk sini 2');
        const parsed = ResponseSchema.safeParse(data);
        if (parsed.success) {
          return parsed.data;
        }

        console.log('masuk sini 3');

        return {
          status: 'success',
          data,
        };
      }),
    );
  }
}
