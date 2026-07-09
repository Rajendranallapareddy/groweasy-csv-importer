import { Request, Response, NextFunction } from 'express';
import { handleError } from '../utils/error-handler';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', err);
  const { status, message } = handleError(err);
  res.status(status).json({ error: message });
};