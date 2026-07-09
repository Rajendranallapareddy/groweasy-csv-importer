import fs from 'fs';
import papa from 'papaparse';
import { CSVRecord } from '../types';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';

export const csvService = {
  parseCSV(filePath: string): Promise<CSVRecord[]> {
    return new Promise((resolve, reject) => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Use Papa Parse with a callback to handle results
      papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results: papa.ParseResult<CSVRecord>) => {
          if (results.errors && results.errors.length > 0) {
            logger.warn('CSV parsing errors:', results.errors);
          }
          resolve(results.data);
        },
        error: (error: Error) => {
          reject(new AppError(`CSV parsing failed: ${error.message}`, 400));
        },
      });
    });
  },
};