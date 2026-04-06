import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email, session.user.name);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { company: true },
        skip,
        take: limit,
      }),
      prisma.visitor.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      visitors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email, session.user.name);

    const {
      visitorId,
      ipAddress,
      pagesVisited,
      timeOnSite,
      visitCount,
      referralSource,
      device,
      location,
      userAgent,
    } = await request.json();

    const visitor = await prisma.visitor.create({
      data: {
        visitorId,
        ipAddress,
        pagesVisited: pagesVisited || null,
        timeOnSite,
        visitCount: visitCount || 1,
        referralSource,
        device,
        location,
        userAgent,
        userId: user.id,
      },
    });

    return NextResponse.json(visitor, { status: 201 });
  } catch (error) {
    console.error("Error creating visitor:", error);
    return NextResponse.json(
      { error: "Failed to create visitor" },
      { status: 500 }
    );
  }
}
