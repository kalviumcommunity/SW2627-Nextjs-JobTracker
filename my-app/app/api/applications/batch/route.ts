import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

const VALID_TARGET_STATUSES = ["viewed", "rejected"] as const;

export async function PATCH(request: Request) {
  try {
    const auth = await requireRole("employer");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const employerId = auth.payload.userId;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a valid JSON object" },
        { status: 400 }
      );
    }

    const { applicationIds, newStatus, status } = body;
    const targetStatus = (newStatus || status)?.toString()?.trim();

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

    if (
      !targetStatus ||
      !VALID_TARGET_STATUSES.includes(targetStatus as (typeof VALID_TARGET_STATUSES)[number])
    ) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_TARGET_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const sanitizedIds = [...new Set(applicationIds.map((id: string) => id.trim()))];

    const ownedApplications = await prisma.application.findMany({
      where: {
        id: { in: sanitizedIds },
        job: {
          employerId: employerId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (ownedApplications.length === 0) {
      return NextResponse.json(
        { error: "No matching applications found belonging to your job postings" },
        { status: 404 }
      );
    }

    if (ownedApplications.length !== sanitizedIds.length) {
      return NextResponse.json(
        { error: "One or more application IDs were not found or do not belong to your job postings" },
        { status: 404 }
      );
    }

    // State machine:
    // target "viewed" -> allowed only from "pending"
    // target "rejected" -> allowed from "pending" or "viewed"
    // "rejected" is a terminal state; applications cannot be transitioned back to "pending" or "viewed"
    const allowedSourceStatuses =
      targetStatus === "viewed" ? ["pending"] : ["pending", "viewed"];

    const ineligibleApplications = ownedApplications.filter(
      (app) => !allowedSourceStatuses.includes(app.status)
    );

    // Atomic enforcement: if ANY application cannot make the transition, reject the entire batch
    if (ineligibleApplications.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid status transition: all selected applications must be eligible to transition to '${targetStatus}'. Found ${ineligibleApplications.length} application(s) with incompatible status.`,
        },
        { status: 400 }
      );
    }

    const result = await prisma.application.updateMany({
      where: {
        id: {
          in: sanitizedIds,
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
