import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    const skill = await prisma.skill.create({
      data: { name },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}