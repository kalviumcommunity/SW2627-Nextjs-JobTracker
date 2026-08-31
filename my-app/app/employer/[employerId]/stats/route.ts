import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth/tokens";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employerId: string }> }
) {
  try {
    // Get employer ID from URL
    const { employerId } = await params;

    if (!employerId) {
      return NextResponse.json(
        { error: "Employer ID is required" },
        { status: 400 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify access token
    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired access token" },
        { status: 401 }
      );
    }

    // Only employers can access employer statistics
    if (payload.role !== "employer") {
      return NextResponse.json(
        { error: "Only employers can access employer statistics" },
        { status: 403 }
      );
    }

    // Employer can only access their own statistics
    if (payload.userId !== employerId) {
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

    // Convert grouped result into simple counts
    const pending =
      statusBreakdown.find((item) => item.status === "pending")?._count._all ??
      0;

    const viewed =
      statusBreakdown.find((item) => item.status === "viewed")?._count._all ??
      0;

    const rejected =
      statusBreakdown.find((item) => item.status === "rejected")?._count._all ??
      0;

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