import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create initial skills
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' }
    }),
    prisma.skill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript' }
    }),
    prisma.skill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js' }
    }),
    prisma.skill.upsert({
      where: { name: 'UI/UX Design' },
      update: {},
      create: { name: 'UI/UX Design' }
    }),
    prisma.skill.upsert({
      where: { name: 'Project Management' },
      update: {},
      create: { name: 'Project Management' }
    }),
  ]);

  // Create a test user
  const hashedPassword = await bcrypt.hash('test123', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      department: 'Engineering',
      bio: 'A passionate developer',
    } as any,
  });

  console.log('Test user created:', testUser);

  // Create a sample idea
  const idea = await prisma.idea.create({
    data: {
      title: 'AI-Powered Task Manager',
      description: 'A smart task management system that uses AI to prioritize and organize tasks.',
      ownerId: testUser.id,
      status: 'PITCH',
      skillsNeeded: {
        create: [
          { skillId: skills[0].id, level: 'INTERMEDIATE' },
          { skillId: skills[1].id, level: 'INTERMEDIATE' },
          { skillId: skills[2].id, level: 'BEGINNER' },
        ],
      },
      members: {
        create: [
          { userId: testUser.id, role: 'OWNER' },
        ],
      },
      kanbanCards: {
        create: [
          {
            title: 'Setup Project Structure',
            description: 'Create initial project setup with Next.js and TypeScript',
            column: 'BACKLOG',
            order: 0,
          },
          {
            title: 'Design Database Schema',
            description: 'Design and implement the database schema',
            column: 'IN_PROGRESS',
            order: 0,
          },
        ],
      },
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });