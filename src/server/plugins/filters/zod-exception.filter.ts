import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppResponse } from '../interceptors/app-response/app-response';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const request = ctx.getRequest<FastifyRequest>();

    response
      .status(400)
      .send(AppResponse.fail('Validation Failed', exception, request.id));
  }
}
