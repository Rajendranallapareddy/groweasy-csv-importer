import fs from 'fs';
import papa from 'papaparse';
import { CSVRecord } from '../types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export const csvService = {
  parseCSV(filePath: string): Promise<CSVRecord[]> {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      // Use the "parse" method with a type assertion to bypass the strict type check
      const result = papa.parse<CSVRecord>(fileContent, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        transformHeader: (header: string) => header.trim(),
      } as any); // Type assertion to avoid strict type conflict

      if (result.errors && result.errors.length > 0) {
        logger.warn('CSV parsing errors:', result.errors);
      }
      resolve(result.data);
    });
  },
};