import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get("employerId");

    const jobs = await prisma.job.findMany({
      where: employerId ? { employerId } : undefined,
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
      { error: "Failed to fetch jobs" },
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
        { error: "Only employers are authorized to create job postings" },
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

    const { title } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Job title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer account not found" },
        { status: 404 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        employerId,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Job created successfully",
        job,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
