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
    const { action } = await request.json();
    const requestId = params.id;

    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { idea: true },
    });

    if (!joinRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user is the idea owner
    if (joinRequest.idea.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Update the request status
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
      },
    });

    // If accepted, add user to idea members
    if (action === 'accept') {
      await prisma.ideaMember.create({
        data: {
          ideaId: joinRequest.ideaId,
          userId: joinRequest.userId,
          role: 'CONTRIBUTOR',
        },
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating join request:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}