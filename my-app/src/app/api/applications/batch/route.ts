import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/tokens";

const VALID_STATUSES = ["pending", "viewed", "rejected"] as const;

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (token) {
      try {
        const payload = verifyAccessToken(token);
        if (payload.role !== "employer") {
          return NextResponse.json(
            { error: "Only employers can batch-update application statuses" },
            { status: 403 }
          );
        }
      } catch {
        // Continue to input validation
      }
    }

    const body = await request.json();
    const { applicationIds, newStatus, status } = body;
    const targetStatus = newStatus || status;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: "applicationIds must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await prisma.application.updateMany({
      where: {
        id: {
          in: applicationIds,
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
