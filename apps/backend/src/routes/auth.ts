import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { loginSchema } from '../schemas';
import { createError } from '../middleware/errorHandler';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /auth/login
router.post('/login', async (req, res, next) => {
   try {
      const { email, password } = loginSchema.parse(req.body);

      // Find user by email (across all tenants for admin login)
      const user = await prisma.user.findFirst({
         where: {
            email,
            is_active: true,
         },
         include: {
            tenant: true,
         },
      });

      if (!user) {
         throw createError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
         throw createError('Invalid credentials', 401);
      }

      // Generate JWT token
      const token = jwt.sign(
         {
            user_id: user.id,
            email: user.email,
            tenant_id: user.tenant_id,
            role: user.role,
         },
         process.env.JWT_SECRET!,
         { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json({
         token,
         user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenant: {
               id: user.tenant.id,
               name: user.tenant.name,
               slug: user.tenant.slug,
            },
         },
      });
   } catch (error) {
      next(error);
   }
});

// GET /auth/me
router.get('/me', requireAuth, async (req: any, res, next) => {
   try {
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: {
            tenant: true,
         },
      });

      if (!user) {
         throw createError('User not found', 404);
      }

      res.json({
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role,
         tenant: {
            id: user.tenant.id,
            name: user.tenant.name,
            slug: user.tenant.slug,
         },
      });
   } catch (error) {
      next(error);
   }
});

export { router as authRoutes };
