import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiConfig } from '../config/ai';
import { CRMRecordDTO, CRMRecordSchema } from '../dtos/crm-record.dto';
import { CSVRecord } from '../types';
import { buildSystemPrompt, buildUserPrompt } from '../ai/prompts';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

// Initialize OpenAI (fallback)
const openai = aiConfig.openaiApiKey ? new OpenAI({
  apiKey: aiConfig.openaiApiKey,
  timeout: 60_000,
  maxRetries: 0,
}) : null;

export const aiService = {
  async extractCRMRecords(records: CSVRecord[]): Promise<CRMRecordDTO[]> {
    const userPrompt = buildUserPrompt(records);
    const systemPrompt = buildSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // ----------------------------------------------------------
    // 1. Try Gemini with auto‑discovery – PRIORITIZE HIGH QUOTA MODELS
    // ----------------------------------------------------------
    if (aiConfig.geminiApiKey) {
      try {
        // First, list available models
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${aiConfig.geminiApiKey}`;
        const listRes = await fetch(listUrl);
        if (!listRes.ok) {
          throw new Error(`Failed to list models: ${listRes.status}`);
        }
        const listData = await listRes.json();
        const models = listData.models || [];
        logger.info(`Found ${models.length} Gemini models`);

        // ==== NEW: Priority order for models with higher free quotas ====
        const priorityModels = [
          'gemini-1.5-flash',      // Higher free quota
          'gemini-1.5-pro',        // Higher free quota
          'gemini-2.0-flash-exp',  // Lower free quota (20/day)
          'gemini-1.0-pro',
        ];

        // Find the first priority model that supports generateContent
        let selectedModel = null;
        for (const priority of priorityModels) {
          const found = models.find((m: any) => {
            const name = m.name.split('/').pop();
            return name === priority && m.supportedGenerationMethods?.includes('generateContent');
          });
          if (found) {
            selectedModel = found;
            break;
          }
        }

        // Fallback to first available model if none of the priority ones work
        if (!selectedModel) {
          selectedModel = models.find((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent')
          );
        }

        if (!selectedModel) {
          throw new Error('No model found that supports generateContent');
        }

        const modelName = selectedModel.name.split('/').pop();
        logger.info(`🟢 Using Gemini model: ${modelName}`);

        // Now generate content with that model
        const generateUrl =
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${aiConfig.geminiApiKey}`;
        const genRes = await fetch(generateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
          }),
        });
        if (!genRes.ok) {
          const errText = await genRes.text();
          throw new Error(`Generate failed: ${genRes.status} - ${errText}`);
        }
        const genData = await genRes.json();
        const content = genData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) throw new Error('No content in Gemini response');

        const parsed = this.parseAIResponse(content);
        const validated = this.validateRecords(parsed);
        logger.info(`✅ Gemini (${modelName}) succeeded: ${validated.length} records`);
        return validated;
      } catch (error: any) {
        logger.warn('⚠️ Gemini failed:', error.message);
        // fall through to OpenAI/Ollama
      }
    }

    // ----------------------------------------------------------
    // 2. Fallback to OpenAI
    // ----------------------------------------------------------
    if (openai) {
      try {
        logger.info('🟡 Trying OpenAI...');
        const response = await openai.chat.completions.create({
          model: aiConfig.openaiModel || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: aiConfig.temperature,
        });
        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty response');
        const parsed = this.parseAIResponse(content);
        const validated = this.validateRecords(parsed);
        logger.info(`✅ OpenAI succeeded: ${validated.length} records`);
        return validated;
      } catch (error: any) {
        logger.warn('⚠️ OpenAI failed:', error.message);
      }
    }

    // ----------------------------------------------------------
    // 3. Final fallback: Ollama
    // ----------------------------------------------------------
    try {
      logger.info('🟣 Trying Ollama...');
      const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          options: { temperature: 0.1 },
        }),
      });
      if (!ollamaResponse.ok) throw new Error(`Ollama returned ${ollamaResponse.status}`);
      const ollamaData = await ollamaResponse.json();
      const content = ollamaData.message?.content;
      if (content) {
        const parsed = this.parseAIResponse(content);
        const validated = this.validateRecords(parsed);
        logger.info(`✅ Ollama succeeded: ${validated.length} records`);
        return validated;
      }
    } catch (error: any) {
      logger.warn('⚠️ Ollama failed:', error.message);
    }

    throw new AppError('All AI providers failed.', 500);
  },

  parseAIResponse(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError);
      throw new AppError('AI response is not valid JSON', 500);
    }
  },

  validateRecords(parsed: any): CRMRecordDTO[] {
    if (!parsed.records || !Array.isArray(parsed.records)) {
      throw new AppError('AI response missing "records" array', 500);
    }
    return parsed.records.map((rec: any) => {
      const safeRec = { ...rec };
      const result = CRMRecordSchema.safeParse(safeRec);
      if (result.success) return result.data;
      return CRMRecordSchema.parse(safeRec);
    });
  },
};