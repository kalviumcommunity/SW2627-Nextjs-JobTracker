import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

export async function GET() {
  try {
    const auth = await requireRole("employer");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const employerId = auth.payload.userId;

    const [totalJobs, statusCounts] = await Promise.all([
      prisma.job.count({ where: { employerId } }),
      prisma.application.groupBy({
        by: ["status"],
        where: { job: { employerId } },
        _count: true,
      }),
    ]);

    let totalApplications = 0;
    let pending = 0;
    let viewed = 0;
    let rejected = 0;

    for (const group of statusCounts) {
      totalApplications += group._count;
      if (group.status === "pending") pending = group._count;
      else if (group.status === "viewed") viewed = group._count;
      else if (group.status === "rejected") rejected = group._count;
    }

    return NextResponse.json({
      stats: {
        totalJobs,
        totalApplications,
        statusBreakdown: { pending, viewed, rejected },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch employer stats" },
      { status: 500 }
    );
  }
}
