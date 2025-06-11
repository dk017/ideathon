import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { skillId, level } = await request.json();

    const userSkill = await prisma.userSkill.create({
      data: {
        userId: params.id,
        skillId,
        level,
      },
    });

    return NextResponse.json(userSkill);
  } catch (error) {
    console.error('Error adding skill:', error);
    return NextResponse.json({ error: 'Failed to add skill' }, { status: 500 });
  }
}