import Papa from 'papaparse';
import { CSVRecord } from '@/types';

export const parseCSV = (file: File): Promise<CSVRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      trimHeaders: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error('CSV parsing error'));
        } else {
          resolve(results.data as CSVRecord[]);
        }
      },
      error: reject,
    });
  });
};