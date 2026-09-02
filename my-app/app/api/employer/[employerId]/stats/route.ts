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

    // Only authenticated employers can access this route
    const auth = await requireRole("employer");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Employer can only access their own statistics
    if (auth.payload.userId !== employerId) {
      return NextResponse.json(
        { error: "You are not authorized to access these statistics" },
        { status: 403 }
      );
    }

    // Count jobs belonging to this employer
    const totalJobs = await prisma.job.count({
      where: {
        employerId,
      },
    });

    // Count applications belonging to this employer's jobs
    const totalApplications = await prisma.application.count({
      where: {
        job: {
          employerId,
        },
      },
    });

    // Count applications grouped by status
    const statusBreakdown = await prisma.application.groupBy({
      by: ["status"],
      where: {
        job: {
          employerId,
        },
      },
      _count: {
        _all: true,
      },
    });

    const pending =
      statusBreakdown.find(
        (item) => item.status === "pending"
      )?._count._all ?? 0;

    const viewed =
      statusBreakdown.find(
        (item) => item.status === "viewed"
      )?._count._all ?? 0;

    const rejected =
      statusBreakdown.find(
        (item) => item.status === "rejected"
      )?._count._all ?? 0;

    return NextResponse.json(
      {
        totalJobs,
        totalApplications,
        statusBreakdown: {
          pending,
          viewed,
          rejected,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch employer statistics" },
      { status: 500 }
    );
  }
}