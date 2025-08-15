import { NestFactory } from '@nestjs/core';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ServerModule } from './server/module/server.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ServerModule,
    new FastifyAdapter(),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
