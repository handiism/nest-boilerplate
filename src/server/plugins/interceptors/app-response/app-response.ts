import { z } from 'zod';
import {
  ErrorResponseSchema,
  FailResponseSchema,
  SuccessResponseSchema,
} from './app-response.validation';

export class AppResponse {
  static success<T>(
    data?: T,
    message?: string,
    metadata?: unknown,
    requestId?: string,
  ): z.infer<typeof SuccessResponseSchema> {
    return { status: 'success', data, message, metadata, requestId };
  }

  static fail<T>(
    message: string,
    data: T | undefined,
    requestId: string,
  ): z.infer<typeof FailResponseSchema> {
    return { status: 'fail', message, data, requestId };
  }

  static error<T>(
    message: string,
    data: T | undefined,
    requestId: string,
  ): z.infer<typeof ErrorResponseSchema> {
    return { status: 'error', message, data, requestId };
  }
}
