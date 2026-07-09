import Papa from 'papaparse';
import { CSVRecord } from '@/types';

export const parseCSV = (file: File): Promise<CSVRecord[]> => {
  return new Promise((resolve, reject) => {
    // Read the file as text first
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          trimHeaders: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            if (results.errors.length) {
              reject(new Error('CSV parsing error'));
            } else {
              resolve(results.data as CSVRecord[]);
            }
          },
          error: (error: Error) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
};