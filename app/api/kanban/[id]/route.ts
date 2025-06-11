import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { column } = await request.json();
    const cardId = params.id;

    const card = await prisma.kanbanCard.findUnique({
      where: { id: cardId },
      include: { idea: true },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user is a member of the idea
    const membership = await prisma.ideaMember.findUnique({
      where: {
        ideaId_userId: {
          ideaId: card.ideaId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updatedCard = await prisma.kanbanCard.update({
      where: { id: cardId },
      data: { column },
      include: {
        assignee: true,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating kanban card:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}