import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
   // Connect to test database
   await prisma.$connect();
});

afterAll(async () => {
   // Cleanup and disconnect
   await prisma.$disconnect();
});

beforeEach(async () => {
   // Clean up database before each test
   await prisma.booking.deleteMany();
   await prisma.inventory.deleteMany();
   await prisma.apiKey.deleteMany();
   await prisma.user.deleteMany();
   await prisma.ratePlan.deleteMany();
   await prisma.roomType.deleteMany();
   await prisma.tenant.deleteMany();
});

export { prisma };
