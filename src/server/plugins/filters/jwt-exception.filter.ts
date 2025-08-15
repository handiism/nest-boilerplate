import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '../interceptors/app-response/app-response';

@Catch(JsonWebTokenError)
@Injectable()
export class JwtExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof TokenExpiredError) {
      response
        .status(401)
        .send(AppResponse.fail('Token expired', undefined, request.id));
    } else if (exception instanceof NotBeforeError) {
      response
        .status(401)
        .send(AppResponse.fail('Token not active', undefined, request.id));
    } else {
      response
        .status(401)
        .send(AppResponse.fail('Token invalid', undefined, request.id));
    }
  }
}
