import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { MultipartInterceptorOptions } from './multipart.type';
import sharp from 'sharp';
import { MultipartValue } from './multipart';

@Injectable()
export class MultipartInterceptor implements NestInterceptor {
  constructor(private readonly options: MultipartInterceptorOptions = {}) {}

  private get validationConfig() {
    return this.options?.fields || {};
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (!request.isMultipart()) {
      return next.handle();
    }

    const parts = request.parts(this.options?.configs);

    const reqBody: Record<string, MultipartValue | MultipartValue[]> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        const fieldRule =
          part.fieldname in this.validationConfig
            ? this.validationConfig[part.fieldname]
            : undefined;
        let buff = await part.toBuffer();

        // Validate file size
        if (fieldRule?.limit && buff.length > fieldRule.limit) {
          throw new BadRequestException(
            `File too large for field "${part.fieldname}". Limit: ${fieldRule.limit} bytes`,
          );
        }

        // Validate mime types if defined
        if (
          fieldRule?.mimeTypes &&
          !fieldRule.mimeTypes.includes(part.mimetype)
        ) {
          throw new BadRequestException(
            `Invalid file type for "${part.fieldname}". Allowed: ${fieldRule.mimeTypes.join(', ')}`,
          );
        }

        let fileName = part.filename;
        let contentType = part.mimetype;
        if (fieldRule?.compress) {
          const imageMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/svg+xml',
          ];

          if (imageMimeTypes.includes(part.mimetype)) {
            Logger.log(
              `Compressing image: ${fileName} : ${contentType} : ${buff.length} bytes`,
            );

            buff = await sharp(buff)
              .resize({ width: 1024 }) // Optional: resize to a max width
              .webp({ quality: 70 }) // Change quality (or .webp / .png)
              .toBuffer();

            contentType = 'image/webp';
            fileName = fileName.replace(/\.[^.]+$/, '.webp');

            Logger.log(
              `Compressed image: ${fileName} : ${contentType} : ${buff.length} bytes`,
            );
          }
        }

        const value: MultipartValue = {
          name: fileName,
          file: buff,
          contentType,
        };

        // Handle multiple files for same field
        if (part.fieldname in reqBody) {
          const existingValue = reqBody[part.fieldname];
          if (Array.isArray(existingValue)) {
            reqBody[part.fieldname] = [...existingValue, value];
          } else {
            reqBody[part.fieldname] = [existingValue, value];
          }
        } else {
          reqBody[part.fieldname] = value;
        }
      }

      if (part.type === 'field' && typeof part.value === 'string') {
        if (part.fieldname in reqBody) {
          const existingValue = reqBody[part.fieldname];
          if (Array.isArray(existingValue)) {
            reqBody[part.fieldname] = [...existingValue, part.value];
          } else {
            reqBody[part.fieldname] = [existingValue, part.value];
          }
        } else {
          reqBody[part.fieldname] = part.value;
        }
      }
    }

    // Validate required fields (default to true)
    for (const [fieldName, fieldRule] of Object.entries(
      this.validationConfig,
    )) {
      const isRequired = fieldRule.required === true;
      if (isRequired && !(fieldName in reqBody)) {
        throw new BadRequestException(
          `Missing required file field: "${fieldName}"`,
        );
      }
    }

    // Zod validation if schema exists
    if (this.options.schema) {
      const validationResult = this.options.schema.safeParse(reqBody);
      if (!validationResult.success) {
        Logger.error(validationResult.error.issues);
        throw new BadRequestException(`Zod validation failed`);
      }

      request.body = validationResult.data;
      return next.handle();
    }

    request.body = reqBody;
    return next.handle();
  }
}
