import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

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
