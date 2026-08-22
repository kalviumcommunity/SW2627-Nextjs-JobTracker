import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const candidateCount = await prisma.candidate.count();
  return NextResponse.json({ status: "ok", candidateCount });
}