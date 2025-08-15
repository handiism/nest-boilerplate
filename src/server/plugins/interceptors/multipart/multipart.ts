import { z } from 'zod';

export const MultipartFileSchema = z.object({
  name: z.string(),
  file: z.instanceof(Buffer),
  contentType: z.string(),
});

export type MultipartFile = z.infer<typeof MultipartFileSchema>;
export type MultipartText = string;

export type MultipartValue = MultipartFile | MultipartText;
