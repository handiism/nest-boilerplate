import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServerController } from './server.controller';
import { LoggerModule } from 'nestjs-pino';
import { JwtModule } from '@nestjs/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    JwtModule.register({
      global: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          ...(configService.get('NODE_ENV', 'production') === 'development' && {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname,context',
              },
            },
          }),
          serializers: {
            req(req: FastifyRequest) {
              return {
                id: req.id, // custom or generated request ID
                method: req.method, // HTTP method
                url: req.url, // request URL
              };
            },
            res(res: FastifyReply) {
              return {
                statusCode: res.statusCode,
              };
            },
          },
        },
      }),
    }),
    UserModule,
  ],
  controllers: [ServerController],
})
export class ServerModule {}
