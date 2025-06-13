import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching all skills:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 