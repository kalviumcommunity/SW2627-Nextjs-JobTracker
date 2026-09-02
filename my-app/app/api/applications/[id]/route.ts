import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth/guard";

const VALID_STATUSES = ["pending", "viewed", "rejected"] as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const auth = await requireAuth();

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Access control: Candidates can only view their own applications, Employers can only view applications for their jobs
    if (auth.payload.role === "candidate" && application.candidateId !== auth.payload.userId) {
      return NextResponse.json(
        { error: "You are not authorized to view this application" },
        { status: 403 }
      );
    }

    if (auth.payload.role === "employer" && application.job.employerId !== auth.payload.userId) {
      return NextResponse.json(
        { error: "You are not authorized to view this application" },
        { status: 403 }
      );
    }

    return NextResponse.json({ application }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const auth = await requireRole("employer");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (application.job.employerId !== auth.payload.userId) {
      return NextResponse.json(
        { error: "You do not own the job associated with this application" },
        { status: 403 }
      );
    }

    // State machine check
    const current = (application.status || "").toLowerCase();
    if (current === "rejected") {
      return NextResponse.json(
        { error: "Rejected applications cannot undergo further status transitions" },
        { status: 400 }
      );
    }

    if (current === "viewed" && status === "pending") {
      return NextResponse.json(
        { error: "Cannot transition status back from viewed to pending" },
        { status: 400 }
      );
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Application status updated successfully",
        application: updated,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
