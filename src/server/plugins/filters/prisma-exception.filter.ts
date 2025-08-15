import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppResponse } from '../interceptors/app-response/app-response';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const request = ctx.getRequest<FastifyRequest>();

    const code = exception.code;

    const meta = exception.meta;

    if (code === 'P2002') {
      const message = 'Unique constraint violated';
      if (!meta) {
        response
          .code(409)
          .send(AppResponse.fail(message, undefined, request.id));

        return;
      }

      const targets = Object.hasOwn(meta, 'target') ? meta['target'] : null;

      if (!targets) {
        response
          .code(409)
          .send(AppResponse.fail(message, undefined, request.id));

        return;
      }

      if (!Array.isArray(targets)) {
        response
          .code(409)
          .send(
            AppResponse.fail(
              `Unique constraint violated`,
              undefined,
              request.id,
            ),
          );
        return;
      }

      if (!targets.every((t) => typeof t === 'string')) {
        response
          .code(409)
          .send(
            AppResponse.fail(
              `Unique constraint violated`,
              undefined,
              request.id,
            ),
          );
        return;
      }

      response
        .code(409)
        .send(
          AppResponse.fail(
            `Data duplication on field: ${targets.join(', ')}`,
            undefined,
            request.id,
          ),
        );

      return;
    }

    response
      .code(409)
      .send(AppResponse.fail(exception.message, undefined, request.id));
  }
}
