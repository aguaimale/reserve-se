import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
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
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
         throw createError('JWT_SECRET not configured', 500);
      }

      const payload = {
         user_id: user.id,
         email: user.email,
         tenant_id: user.tenant_id,
         role: user.role,
      };

      const token = jwt.sign(payload, jwtSecret, {
         expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      } as any);

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

// PATCH /auth/profile
router.patch('/profile', requireAuth, async (req: any, res, next) => {
   try {
      const { name, password } = req.body;

      if (!name && !password) {
         throw createError(
            'At least one field (name or password) is required',
            400
         );
      }

      const updateData: any = {};

      if (name) {
         if (typeof name !== 'string' || name.trim().length < 1) {
            throw createError('Name must be a non-empty string', 400);
         }
         updateData.name = name.trim();
      }

      if (password) {
         if (typeof password !== 'string' || password.length < 6) {
            throw createError(
               'Password must be at least 6 characters long',
               400
            );
         }
         const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
         updateData.password = await bcrypt.hash(
            password as string,
            saltRounds
         );
      }

      updateData.updated_at = new Date();

      const updatedUser = await prisma.user.update({
         where: { id: req.user.id },
         data: updateData,
         include: {
            tenant: true,
         },
      });

      res.json({
         id: updatedUser.id,
         email: updatedUser.email,
         name: updatedUser.name,
         role: updatedUser.role,
         tenant: {
            id: updatedUser.tenant.id,
            name: updatedUser.tenant.name,
            slug: updatedUser.tenant.slug,
         },
      });
   } catch (error) {
      next(error);
   }
});

export { router as authRoutes };
