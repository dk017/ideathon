import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; skillId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.id !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.userSkill.delete({
      where: {
        userId_skillId: {
          userId: params.id,
          skillId: params.skillId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing skill:', error);
    return NextResponse.json({ error: 'Failed to remove skill' }, { status: 500 });
  }
}