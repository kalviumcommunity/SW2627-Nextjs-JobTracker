import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth/guard";

const VALID_STATUSES = ["pending", "viewed", "rejected"] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();

    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const payload = auth.payload;

    const { searchParams } = new URL(request.url);
    const jobIdParam = searchParams.get("jobId")?.trim();
    const statusParam = searchParams.get("status")?.trim();

    if (statusParam && !VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Invalid status filter. Allowed values: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    let whereClause: Record<string, unknown> = {};

    if (payload.role === "candidate") {
      whereClause = {
        candidateId: payload.userId,
        ...(jobIdParam ? { jobId: jobIdParam } : {}),
        ...(statusParam ? { status: statusParam } : {}),
      };
    } else if (payload.role === "employer") {
      whereClause = {
        job: {
          employerId: payload.userId,
        },
        ...(jobIdParam ? { jobId: jobIdParam } : {}),
        ...(statusParam ? { status: statusParam } : {}),
      };
    } else {
      return NextResponse.json(
        { error: "Invalid user role" },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole("candidate");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const candidateId = auth.payload.userId;

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

    const { jobId } = body;

    if (!jobId || typeof jobId !== "string" || jobId.trim().length === 0) {
      return NextResponse.json(
        { error: "jobId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const sanitizedJobId = jobId.trim();

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate account not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: sanitizedJobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId: job.id,
        status: "pending",
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            employer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002") {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
