import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '../interceptors/app-response/app-response';

@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor() {}

  private readonly log = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const statusCode = exception.getStatus();
    this.log.error(exception);

    if (statusCode >= 500) {
      response
        .status(statusCode)
        .send(AppResponse.error(exception.message, undefined, request.id));
      return;
    }

    response
      .status(statusCode)
      .send(AppResponse.fail(exception.message, undefined, request.id));
  }
}
