import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ideaId = params.id;

  try {
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

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        members: true,
        joinRequests: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Check if user is already a member
    const isMember = idea.members.some(member => member.userId === user.id);
    if (isMember) {
      return NextResponse.json(
        { error: 'You are already a member of this idea' },
        { status: 400 }
      );
    }

    // Check if user has a pending request
    const hasPendingRequest = idea.joinRequests.some(
      request => request.userId === user.id && request.status === 'PENDING'
    );
    if (hasPendingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request to join this idea' },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        ideaId: ideaId,
        userId: user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error('Error creating join request:', error);
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    );
  }
}