import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ideas = await prisma.idea.findMany({
      include: {
        owner: true,
        skillsNeeded: {
          include: {
            skill: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            joinRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, skillsNeeded } = await request.json();

    // Ensure user exists in database
    const user = await prisma.user.upsert({
      where: { email: session.user.email! },
      create: {
        email: session.user.email!,
        name: session.user.name || null,
        image: session.user.image || null,
      },
      update: {
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      },
    });

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        ownerId: user.id,
        skillsNeeded: {
          create: skillsNeeded.map((skill: any) => ({
            skillId: skill.skillId,
            level: skill.level,
          })),
        },
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: true,
        skillsNeeded: {
          include: {
            skill: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}