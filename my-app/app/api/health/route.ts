import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const candidateCount = await prisma.candidate.count();
    return NextResponse.json({ status: "ok", candidateCount });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}