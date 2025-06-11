import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ideaId, title, description, column } = await request.json();

    // Check if user is a member of the idea
    const membership = await prisma.ideaMember.findUnique({
      where: {
        ideaId_userId: {
          ideaId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this idea' }, { status: 403 });
    }

    const card = await prisma.kanbanCard.create({
      data: {
        ideaId,
        title,
        description,
        column,
        assigneeId: session.user.id,
      },
      include: {
        assignee: true,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error creating kanban card:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}