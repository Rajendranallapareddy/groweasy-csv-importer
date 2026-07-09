import { z } from 'zod';

export const UploadFileSchema = z.object({
  file: z.any().refine((file) => file && file.mimetype === 'text/csv', {
    message: 'Only CSV files are allowed',
  }),
});