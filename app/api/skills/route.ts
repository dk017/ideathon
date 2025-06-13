import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });

    return NextResponse.json(userSkills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, level, category } = body;

    if (!name || !level || !category) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        level,
        category,
        userId: session.user.id,
      },
    });

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error creating skill:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}