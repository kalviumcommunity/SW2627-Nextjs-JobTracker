import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateIdParam = searchParams.get("candidateId");
    const employerIdParam = searchParams.get("employerId");
    const jobIdParam = searchParams.get("jobId");

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    let candidateId = candidateIdParam;
    let employerId = employerIdParam;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        if (payload.role === "candidate" && !candidateId) {
          candidateId = payload.userId;
        } else if (payload.role === "employer" && !employerId) {
          employerId = payload.userId;
        }
      } catch {
        // Fallback to query params
      }
    }

    const applications = await prisma.application.findMany({
      where: {
        ...(candidateId ? { candidateId } : {}),
        ...(jobIdParam ? { jobId: jobIdParam } : {}),
        ...(employerId ? { job: { employerId } } : {}),
      },
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

    const body = await request.json();
    const { jobId, candidateId: bodyCandidateId } = body;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    let candidateId = bodyCandidateId;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        if (payload.role === "candidate") {
          candidateId = payload.userId;
        } else if (!candidateId) {
          return NextResponse.json(
            { error: "Only candidates can apply to jobs" },
            { status: 403 }
          );
        }
      } catch {
        // Fallback to body candidateId
      }
    }

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID or active candidate session is required" },
        { status: 401 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
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
        jobId,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already submitted for this job" },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId,
        status: "pending",
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
