import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens";

const VALID_STATUSES = ["pending", "viewed", "rejected"] as const;

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as an employer." },
        { status: 401 }
      );
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired access token" },
        { status: 401 }
      );
    }

    if (payload.role !== "employer") {
      return NextResponse.json(
        { error: "Only employers are authorized to batch-update applications" },
        { status: 403 }
      );
    }

    const employerId = payload.userId;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { applicationIds, newStatus, status } = body;
    const targetStatus = newStatus || status;

    if (
      !applicationIds ||
      !Array.isArray(applicationIds) ||
      applicationIds.length === 0 ||
      !applicationIds.every((id) => typeof id === "string" && id.trim().length > 0)
    ) {
      return NextResponse.json(
        { error: "applicationIds must be a non-empty array of valid string IDs" },
        { status: 400 }
      );
    }

    if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    // Find all applications belonging to this employer's jobs
    const eligibleApplications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: {
          employerId: employerId,
        },
      },
      select: {
        id: true,
      },
    });

    const eligibleIds = eligibleApplications.map((app) => app.id);

    if (eligibleIds.length === 0) {
      return NextResponse.json(
        { error: "No matching applications found belonging to your job postings" },
        { status: 404 }
      );
    }

    const result = await prisma.application.updateMany({
      where: {
        id: {
          in: eligibleIds,
        },
      },
      data: {
        status: targetStatus,
      },
    });

    return NextResponse.json(
      {
        message: "Batch status updated successfully",
        count: result.count,
        updatedStatus: targetStatus,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to batch update applications" },
      { status: 500 }
    );
  }
}
