import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ServerModule } from './server/module/server.module';
import { HttpExceptionFilter } from './server/plugins/filters/http-exception.filter';
import { CatchEverythingFilter } from './server/plugins/filters/catch-everything.filter';
import { NestJsZodExceptionFilter } from './server/plugins/filters/nestjs-zod-exception.filter';
import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtExceptionFilter } from './server/plugins/filters/jwt-exception.filter';
import { PrismaExceptionFilter } from './server/plugins/filters/prisma-exception.filter';
import { ZodExceptionFilter } from './server/plugins/filters/zod-exception.filter';
import { AppResponseInterceptor } from './server/plugins/interceptors/app-response/app-response.interceptor';
import { ServerFastifyAdapter } from './server/plugins/adapter/ServerFastifyAdapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    ServerModule,
    new ServerFastifyAdapter(),
    {
      bufferLogs: true,
    },
  );
  const log = app.get(Logger);
  app.useLogger(log);

  await app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
  });
  await app.register(fastifyCompress);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
  await app.register(fastifyCookie);
  app.useGlobalInterceptors(new AppResponseInterceptor());
  app.useGlobalPipes(new ZodValidationPipe());

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 8080);
  app.useGlobalFilters(
    new CatchEverythingFilter(),
    new HttpExceptionFilter(),
    new NestJsZodExceptionFilter(),
    new ZodExceptionFilter(),
    new PrismaExceptionFilter(),
    new JwtExceptionFilter(),
  );
  await app.listen(port, (err) => {
    if (!err) {
      log.log(`Application listening on port ${port}`);
      return;
    }

    log.error(err);
  });
}

bootstrap().catch(console.error);
