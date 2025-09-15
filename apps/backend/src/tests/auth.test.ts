import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../index';
import { prisma } from './setup';

describe('Authentication', () => {
   let tenant: any;
   let user: any;

   beforeEach(async () => {
      // Create test tenant
      tenant = await prisma.tenant.create({
         data: {
            name: 'Test Hotel',
            slug: 'test-hotel',
            currency: 'ARS',
         },
      });

      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await prisma.user.create({
         data: {
            tenant_id: tenant.id,
            email: 'test@example.com',
            password: hashedPassword,
            name: 'Test User',
            role: 'manager',
         },
      });
   });

   describe('POST /api/v1/auth/login', () => {
      it('should login with valid credentials', async () => {
         const response = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
            password: 'password123',
         });

         expect(response.status).toBe(200);
         expect(response.body).toHaveProperty('token');
         expect(response.body.user).toEqual({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenant: {
               id: tenant.id,
               name: tenant.name,
               slug: tenant.slug,
            },
         });
      });

      it('should reject invalid credentials', async () => {
         const response = await request(app).post('/api/v1/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
         });

         expect(response.status).toBe(401);
         expect(response.body).toHaveProperty('error');
      });

      it('should reject non-existent user', async () => {
         const response = await request(app).post('/api/v1/auth/login').send({
            email: 'nonexistent@example.com',
            password: 'password123',
         });

         expect(response.status).toBe(401);
         expect(response.body).toHaveProperty('error');
      });
   });

   describe('GET /api/v1/auth/me', () => {
      it('should return user info with valid token', async () => {
         // Login first to get token
         const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
               email: 'test@example.com',
               password: 'password123',
            });

         const token = loginResponse.body.token;

         const response = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

         expect(response.status).toBe(200);
         expect(response.body).toEqual({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenant: {
               id: tenant.id,
               name: tenant.name,
               slug: tenant.slug,
            },
         });
      });

      it('should reject request without token', async () => {
         const response = await request(app).get('/api/v1/auth/me');

         expect(response.status).toBe(401);
         expect(response.body).toHaveProperty('error');
      });

      it('should reject request with invalid token', async () => {
         const response = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', 'Bearer invalid-token');

         expect(response.status).toBe(401);
         expect(response.body).toHaveProperty('error');
      });
   });
});
