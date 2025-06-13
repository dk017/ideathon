import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ message: "Admin access granted!" });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized: Admin access required" },
      { status: 403 }
    );
  }
} 