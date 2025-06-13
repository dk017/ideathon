import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const skillName = searchParams.get('skill');
  const category = searchParams.get('category');
  const level = searchParams.get('level');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Filter users by skill, category, or level if provided
  const filtered = users.filter(user =>
    user.skills.some(userSkill => {
      const matchesSkill = skillName ? userSkill.skill.name.toLowerCase().includes(skillName.toLowerCase()) : true;
      const matchesCategory = category ? userSkill.skill.category === category : true;
      const matchesLevel = level ? userSkill.level === level : true;
      return matchesSkill && matchesCategory && matchesLevel;
    })
  );

  return NextResponse.json(filtered);
} 