import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  // Both AI keys are optional – at least one should be set
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  AI_MODEL: z.string().optional(), // legacy fallback
  AI_BATCH_SIZE: z.coerce.number().default(5),
  MAX_RETRIES: z.coerce.number().default(3),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

export const env = envSchema.parse(process.env);

// Warn if no AI key is set
if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
  console.warn('⚠️ No AI API key provided. Please set OPENAI_API_KEY or GEMINI_API_KEY in .env');
}