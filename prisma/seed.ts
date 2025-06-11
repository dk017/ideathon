import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create initial skills
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'React' } }),
    prisma.skill.create({ data: { name: 'TypeScript' } }),
    prisma.skill.create({ data: { name: 'Node.js' } }),
    prisma.skill.create({ data: { name: 'UI/UX Design' } }),
    prisma.skill.create({ data: { name: 'Project Management' } }),
  ]);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      department: 'Engineering',
      bio: 'A passionate developer',
      skills: {
        create: [
          { skillId: skills[0].id, level: 'EXPERT' },
          { skillId: skills[1].id, level: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Create a sample idea
  const idea = await prisma.idea.create({
    data: {
      title: 'AI-Powered Task Manager',
      description: 'A smart task management system that uses AI to prioritize and organize tasks.',
      ownerId: user.id,
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
          { userId: user.id, role: 'OWNER' },
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