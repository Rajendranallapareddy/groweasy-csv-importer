import { z } from 'zod';

export const CSVRecordSchema = z.record(z.string(), z.string().optional());
export type CSVRecordDTO = z.infer<typeof CSVRecordSchema>;