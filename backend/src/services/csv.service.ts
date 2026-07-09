import fs from 'fs';
import papa from 'papaparse';
import { CSVRecord } from '../types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export const csvService = {
  parseCSV(filePath: string): Promise<CSVRecord[]> {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        transformHeader: (header: string) => header.trim(),
        complete: (result: papa.ParseResult<CSVRecord>) => {
          if (result.errors.length > 0) {
            logger.warn('CSV parsing errors:', result.errors);
          }
          resolve(result.data as CSVRecord[]);
        },
        error: (error: Error) => {
          reject(new AppError(`CSV parsing failed: ${error.message}`, 400));
        },
      });
    });
  },
};