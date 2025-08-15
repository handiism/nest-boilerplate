import { FastifyMultipartOptions } from '@fastify/multipart';
import { ZodSchema } from 'zod';

export interface MultipartValidationRule {
  required?: boolean; // default true
  limit?: number; // file size limit in bytes
  mimeTypes?: string[]; // if undefined, allow any
  compress?: boolean; // default false
}

export type MultipartValidationConfig = Record<string, MultipartValidationRule>;

export interface MultipartInterceptorOptions {
  fields?: MultipartValidationConfig;
  configs?: FastifyMultipartOptions;
  schema?: ZodSchema;
}
