import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AppResponse } from '../interceptors/app-response/app-response';
import { FastifyRequest } from 'fastify/types/request';

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor() {}

  private readonly log = new Logger(CatchEverythingFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();

    this.log.error(exception);
    const request = host.switchToHttp().getRequest<FastifyRequest>();

    response
      .code(500)
      .send(AppResponse.error('Internal server error', undefined, request.id));
  }
}
