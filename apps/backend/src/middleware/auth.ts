import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

interface AuthenticatedRequest extends Request {
   user?: {
      id: string;
      email: string;
      tenant_id: string;
   };
}

export const requireAuth = (
   req: AuthenticatedRequest,
   res: Response,
   next: NextFunction
) => {
   const authHeader = req.headers.authorization;

   if (!authHeader?.startsWith('Bearer ')) {
      return next(createError('Authorization token required', 401));
   }

   const token = authHeader.substring(7);

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = {
         id: decoded.user_id,
         email: decoded.email,
         tenant_id: decoded.tenant_id,
      };
      next();
   } catch (error) {
      next(createError('Invalid or expired token', 401));
   }
};
