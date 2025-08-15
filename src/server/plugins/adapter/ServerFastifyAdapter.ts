import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ulid } from 'ulid';

export class ServerFastifyAdapter extends FastifyAdapter {
  constructor() {
    super({
      logger: false,
      genReqId: () => ulid(),
    });
  }
}
