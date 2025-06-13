import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET: List all events (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: Create a new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate, status } = body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid date format' }), 
        { status: 400 }
      );
    }

    if (end < start) {
      return new NextResponse(
        JSON.stringify({ error: 'End date must be after start date' }), 
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid status' }), 
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: start,
        endDate: end,
        status: status || 'UPCOMING',
        creatorId: session.user.id,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create event' }), 
      { status: 500 }
    );
  }
} 