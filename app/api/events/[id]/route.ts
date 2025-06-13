import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// PATCH: Update an event (admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { id } = params;
  const body = await request.json();
  const { title, description, startDate, endDate, status } = body;
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(status && { status }),
    },
  });
  return NextResponse.json(event);
}

// DELETE: Delete an event (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { id } = params;
  await prisma.event.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
} 