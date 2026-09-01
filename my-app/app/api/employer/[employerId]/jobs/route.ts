import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  try {
    const { employerId } = await params;

    if (!employerId) {
      return NextResponse.json(
        { error: "Employer ID is required" },
        { status: 400 }
      );
    }

    // 1. Require authenticated employer session
    const auth = await requireRole("employer");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // 2. Ensure employer can only view their own posted jobs
    if (auth.payload.userId !== employerId) {
      return NextResponse.json(
        { error: "You are not authorized to view jobs for this employer" },
        { status: 403 }
      );
    }

    // 3. Fetch jobs belonging only to this employer with applicant counts
    const jobs = await prisma.job.findMany({
      where: {
        employerId,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch employer jobs" },
      { status: 500 }
    );
  }
}
