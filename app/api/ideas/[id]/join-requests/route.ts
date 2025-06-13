import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List all join requests for an idea (admin/owner only)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    include: { owner: true },
  });
  if (!idea) {
    return new NextResponse("Idea not found", { status: 404 });
  }
  // Only owner or admin can view join requests
  if (session.user.role !== "ADMIN" && idea.ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const joinRequests = await prisma.joinRequest.findMany({
    where: { ideaId: params.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(joinRequests);
}

// PATCH: Approve or reject a join request (admin/owner only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { requestId, status } = await request.json();
  if (!requestId || !["ACCEPTED", "REJECTED"].includes(status)) {
    return new NextResponse("Invalid request", { status: 400 });
  }
  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    include: { owner: true },
  });
  if (!idea) {
    return new NextResponse("Idea not found", { status: 404 });
  }
  // Only owner or admin can approve/reject
  if (session.user.role !== "ADMIN" && idea.ownerId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  // Update join request status
  const updated = await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status },
  });
  // If accepted, add to members
  if (status === "ACCEPTED") {
    await prisma.ideaMember.create({
      data: {
        ideaId: params.id,
        userId: updated.userId,
        role: "CONTRIBUTOR",
      },
    });
  }
  return NextResponse.json(updated);
} 