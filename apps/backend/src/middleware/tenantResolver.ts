import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { createError } from './errorHandler';

interface AuthenticatedRequest extends Request {
   tenant?: {
      id: string;
      slug: string;
   };
   user?: {
      id: string;
      email: string;
      tenant_id: string;
   };
}

export const tenantResolver = async (
   req: AuthenticatedRequest,
   res: Response,
   next: NextFunction
) => {
   try {
      let tenantSlug: string | null = null;
      let tenantId: string | null = null;

      // 1. Try to get tenant from URL params (public routes)
      if (req.params.slug) {
         tenantSlug = req.params.slug;
      }

      // 2. Try to get tenant from query params
      if (!tenantSlug && req.query.tenant) {
         tenantSlug = req.query.tenant as string;
      }

      // 3. Try to get tenant from request body
      if (!tenantSlug && req.body?.tenant) {
         tenantSlug = req.body.tenant;
      }

      // 4. Try to get tenant from API Key header
      const apiKey = req.headers['x-api-key'] as string;
      if (!tenantSlug && apiKey) {
         const apiKeyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { tenant: true },
         });

         if (apiKeyRecord) {
            tenantSlug = apiKeyRecord.tenant.slug;
            tenantId = apiKeyRecord.tenant_id;
         }
      }

      // 5. Try to get tenant from JWT token
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
         const token = authHeader.substring(7);
         try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            if (decoded.tenant_id) {
               tenantId = decoded.tenant_id;
               req.user = {
                  id: decoded.user_id,
                  email: decoded.email,
                  tenant_id: decoded.tenant_id,
               };
            }
         } catch (error) {
            logger.warn('Invalid JWT token');
         }
      }

      // Resolve tenant by slug if we have it
      if (tenantSlug && !tenantId) {
         const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
         });

         if (!tenant) {
            throw createError('Tenant not found', 404);
         }

         tenantId = tenant.id;
         req.tenant = { id: tenant.id, slug: tenant.slug };
      }

      // Resolve tenant by ID if we have it
      if (tenantId && !req.tenant) {
         const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
         });

         if (!tenant) {
            throw createError('Tenant not found', 404);
         }

         req.tenant = { id: tenant.id, slug: tenant.slug };
      }

      // Set tenant context for RLS
      if (tenantId) {
         await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      }

      next();
   } catch (error) {
      next(error);
   }
};
