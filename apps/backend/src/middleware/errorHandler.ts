import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface AppError extends Error {
   statusCode?: number;
   isOperational?: boolean;
}

export const errorHandler = (
   err: AppError | ZodError,
   req: Request,
   res: Response,
   next: NextFunction
) => {
   logger.error(
      {
         error: err.message,
         stack: err.stack,
         url: req.url,
         method: req.method,
      },
      'Error occurred'
   );

   // Zod validation errors
   if (err instanceof ZodError) {
      return res.status(400).json({
         error: 'Validation error',
         details: err.errors,
      });
   }

   // Operational errors
   if (err.isOperational) {
      return res.status(err.statusCode || 500).json({
         error: err.message,
      });
   }

   // Programming errors
   return res.status(500).json({
      error: 'Internal server error',
   });
};

export const createError = (
   message: string,
   statusCode: number = 500
): AppError => {
   const error = new Error(message) as AppError;
   error.statusCode = statusCode;
   error.isOperational = true;
   return error;
};
