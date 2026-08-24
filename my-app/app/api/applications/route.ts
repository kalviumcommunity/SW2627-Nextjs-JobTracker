import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required to view applications" },
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

    const { searchParams } = new URL(request.url);
    const jobIdParam = searchParams.get("jobId");

    let whereClause: Record<string, unknown> = {};

    if (payload.role === "candidate") {
      whereClause = {
        candidateId: payload.userId,
        ...(jobIdParam ? { jobId: jobIdParam } : {}),
      };
    } else if (payload.role === "employer") {
      whereClause = {
        job: {
          employerId: payload.userId,
        },
        ...(jobIdParam ? { jobId: jobIdParam } : {}),
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
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required. Please log in as a candidate." },
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

    if (payload.role !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates are authorized to apply to jobs" },
        { status: 403 }
      );
    }

    const candidateId = payload.userId;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
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
      where: { id: jobId.trim() },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId,
        jobId: job.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
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
  } catch (error: any) {
    if (error?.code === "P2002") {
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
