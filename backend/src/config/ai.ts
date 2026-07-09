import { env } from './env';

export const aiConfig = {
  geminiApiKey: env.GEMINI_API_KEY || '',
  openaiApiKey: env.OPENAI_API_KEY || '',
  openaiModel: env.OPENAI_MODEL || 'gpt-3.5-turbo',
  batchSize: env.AI_BATCH_SIZE || 5,
  maxRetries: env.MAX_RETRIES || 3,
  temperature: 0.1,
};