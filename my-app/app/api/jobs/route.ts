import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get("employerId")?.trim();
    const search = searchParams.get("search")?.trim();
    const location = searchParams.get("location")?.trim();
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    // Parse pagination parameters
    let page = DEFAULT_PAGE;
    let limit = DEFAULT_LIMIT;

    if (pageParam !== null) {
      const parsedPage = Number(pageParam);
      if (Number.isInteger(parsedPage) && parsedPage >= 1) {
        page = parsedPage;
      }
    }

    if (limitParam !== null) {
      const parsedLimit = Number(limitParam);
      if (Number.isInteger(parsedLimit) && parsedLimit >= 1) {
        limit = Math.min(parsedLimit, MAX_LIMIT);
      }
    }

    // Build filter conditions
    const whereClause: Record<string, unknown> = {};

    if (employerId) {
      whereClause.employerId = employerId;
    }

    if (search) {
      whereClause.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (location) {
      whereClause.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    const queryWhere =
      Object.keys(whereClause).length > 0 ? whereClause : undefined;

    const skip = (page - 1) * limit;

    const [total, jobs] = await Promise.all([
      prisma.job.count({
        where: queryWhere,
      }),
      prisma.job.findMany({
        where: queryWhere,
        skip,
        take: limit,
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
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json(
      {
        jobs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      { status: 200 }
    );
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

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a valid JSON object" },
        { status: 400 }
      );
    }

    const { title, location } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Job title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const sanitizedLocation =
      location && typeof location === "string" && location.trim().length > 0
        ? location.trim()
        : null;

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
        location: sanitizedLocation,
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