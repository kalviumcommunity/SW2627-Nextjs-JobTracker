import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

export async function GET() {
  try {
    const auth = await requireRole("employer");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const employer = await prisma.employer.findUnique({
      where: { id: auth.payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        website: true,
        bio: true,
        location: true,
        createdAt: true,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ employer }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch employer settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireRole("employer");

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

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

    const { name, companyName, website, bio, location } = body;

    const dataToUpdate: Record<string, string | null> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name must be a non-empty string" },
          { status: 400 }
        );
      }
      dataToUpdate.name = name.trim();
    }

    if (companyName !== undefined) {
      dataToUpdate.companyName =
        typeof companyName === "string" && companyName.trim().length > 0
          ? companyName.trim()
          : null;
    }

    if (website !== undefined) {
      dataToUpdate.website =
        typeof website === "string" && website.trim().length > 0
          ? website.trim()
          : null;
    }

    if (bio !== undefined) {
      dataToUpdate.bio =
        typeof bio === "string" && bio.trim().length > 0 ? bio.trim() : null;
    }

    if (location !== undefined) {
      dataToUpdate.location =
        typeof location === "string" && location.trim().length > 0
          ? location.trim()
          : null;
    }

    const updatedEmployer = await prisma.employer.update({
      where: { id: auth.payload.userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        website: true,
        bio: true,
        location: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Settings updated successfully",
        employer: updatedEmployer,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to update employer settings" },
      { status: 500 }
    );
  }
}
