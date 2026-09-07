import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/guard";

export async function GET() {
  try {
    const auth = await requireRole("candidate");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: auth.payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        skills: true,
        bio: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error("GET /api/candidate/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireRole("candidate");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
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
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const { name, headline, skills, bio, phone, location } = body;

    const data: Record<string, string | null> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      data.name = name.trim();
    }

    if (headline !== undefined) {
      data.headline = typeof headline === "string" && headline.trim().length > 0 ? headline.trim() : null;
    }

    if (skills !== undefined) {
      data.skills = typeof skills === "string" && skills.trim().length > 0 ? skills.trim() : null;
    }

    if (bio !== undefined) {
      data.bio = typeof bio === "string" && bio.trim().length > 0 ? bio.trim() : null;
    }

    if (phone !== undefined) {
      data.phone = typeof phone === "string" && phone.trim().length > 0 ? phone.trim() : null;
    }

    if (location !== undefined) {
      data.location = typeof location === "string" && location.trim().length > 0 ? location.trim() : null;
    }

    const updated = await prisma.candidate.update({
      where: { id: auth.payload.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        headline: true,
        skills: true,
        bio: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      candidate: updated,
    });
  } catch (error) {
    console.error("PATCH /api/candidate/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate profile" },
      { status: 500 }
    );
  }
}
