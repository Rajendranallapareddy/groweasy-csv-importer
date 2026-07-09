import { aiService } from './ai.service';
import { CSVRecord, CRMRecord, ProcessedResult } from '../types';
import { chunkArray, sleep } from '../utils/helpers';
import { aiConfig } from '../config/ai';
import logger from '../utils/logger';
import { AppError } from '../utils/error-handler';

export const batchService = {
  async processRecords(records: CSVRecord[]): Promise<ProcessedResult> {
    const batchSize = aiConfig.batchSize;
    const batches = chunkArray(records, batchSize);
    const allCRMRecords: CRMRecord[] = [];
    const allSkipped: Array<{ record: CSVRecord; reason: string }> = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      let attempt = 0;
      let success = false;
      let batchResult: CRMRecord[] = [];

      while (attempt < aiConfig.maxRetries && !success) {
        try {
          logger.info(`Processing batch ${i+1}/${batches.length}, attempt ${attempt+1}...`);
          batchResult = await aiService.extractCRMRecords(batch);
          const { valid, skipped } = this.filterValidRecords(batch, batchResult);
          allCRMRecords.push(...valid);
          allSkipped.push(...skipped);
          success = true;
          logger.info(`Batch ${i+1} succeeded: ${valid.length} valid, ${skipped.length} skipped`);
        } catch (error: any) {
          attempt++;
          const errorMsg = error.message || 'Unknown error';
          logger.warn(`Batch ${i+1} attempt ${attempt} failed: ${errorMsg}`);
          if (attempt < aiConfig.maxRetries) {
            const delay = 1000 * Math.pow(2, attempt); // exponential backoff
            logger.info(`Retrying in ${delay}ms...`);
            await sleep(delay);
          } else {
            // Mark all records in this batch as skipped with the error reason
            const reason = `AI processing failed after ${aiConfig.maxRetries} attempts: ${errorMsg}`;
            batch.forEach(rec => allSkipped.push({ record: rec, reason }));
            logger.error(`Batch ${i+1} permanently failed after ${aiConfig.maxRetries} attempts`);
          }
        }
      }
    }

    return {
      imported: allCRMRecords,
      skipped: allSkipped,
      total: records.length,
    };
  },

  filterValidRecords(batch: CSVRecord[], aiResults: CRMRecord[]): { valid: CRMRecord[]; skipped: Array<{ record: CSVRecord; reason: string }> } {
    const valid: CRMRecord[] = [];
    const skipped: Array<{ record: CSVRecord; reason: string }> = [];

    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];
      const aiResult = aiResults[i];
      if (!aiResult) {
        skipped.push({ record, reason: 'No AI result' });
        continue;
      }
      const hasEmail = aiResult.email && aiResult.email.length > 0;
      const hasMobile = aiResult.mobile_without_country_code && aiResult.mobile_without_country_code.length > 0;
      if (!hasEmail && !hasMobile) {
        skipped.push({ record, reason: 'Missing both email and mobile' });
        continue;
      }
      valid.push(aiResult);
    }

    return { valid, skipped };
  },
};