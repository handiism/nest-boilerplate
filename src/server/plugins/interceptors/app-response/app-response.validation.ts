import { z } from 'zod';

// JSend status enum
export const ResponseStatusSchema = z.enum(['success', 'fail', 'error']);

// Base response schema
export const ResponseBaseSchema = z.object({
  status: ResponseStatusSchema,
  requestId: z.string().uuid().optional(), // Adding requestId to base schema
});

// Success response schema
export const SuccessResponseSchema = ResponseBaseSchema.extend({
  status: z.literal('success'),
  data: z.unknown(),
  metadata: z.unknown().optional(),
  message: z.string().optional(),
});

// Fail response schema
export const FailResponseSchema = ResponseBaseSchema.extend({
  status: z.literal('fail'),
  data: z.unknown().optional(),
  message: z.string(),
});

// Error response schema
export const ErrorResponseSchema = ResponseBaseSchema.extend({
  status: z.literal('error'),
  message: z.string(),
  data: z.unknown().optional(),
});

// Union schema for responses
export const ResponseSchema = z.union([
  SuccessResponseSchema,
  FailResponseSchema,
  ErrorResponseSchema,
]);
