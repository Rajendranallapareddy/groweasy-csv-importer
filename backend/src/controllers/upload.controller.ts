import { Request, Response, NextFunction } from 'express';
import { csvService } from '../services/csv.service';
import { batchService } from '../services/batch.service';
import { AppError } from '../utils/error-handler';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

export const uploadController = {
  async uploadCSV(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const filePath = req.file.path;
      try {
        // Parse CSV
        const records = await csvService.parseCSV(filePath);
        if (records.length === 0) {
          throw new AppError('CSV is empty', 400);
        }

        // Process with AI
        const result = await batchService.processRecords(records);

        // Clean up uploaded file
        fs.unlink(filePath, (err) => {
          if (err) logger.error('Failed to delete temp file:', err);
        });

        res.status(200).json(result);
      } catch (error) {
        // Clean up even on error
        fs.unlink(filePath, (err) => {
          if (err) logger.error('Failed to delete temp file on error:', err);
        });
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },
};