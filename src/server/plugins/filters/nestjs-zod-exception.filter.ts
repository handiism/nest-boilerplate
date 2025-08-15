import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodValidationException } from 'nestjs-zod';
import { AppResponse } from '../interceptors/app-response/app-response';

@Catch(ZodValidationException)
export class NestJsZodExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const zodError = exception.getZodError();

    const request = ctx.getRequest<FastifyRequest>();

    response
      .status(400)
      .send(
        AppResponse.fail(
          exception.message,
          zodError.format()._errors,
          request.id,
        ),
      );
  }
}
