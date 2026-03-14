import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email, session.user.name);

    const userId = user.id;

    // Run all queries in parallel
    const [
      totalCompanies,
      enrichedCompanies,
      totalVisitors,
      analyzedVisitors,
      avgIntentResult,
      allCompanies,
      recentActivity,
    ] = await Promise.all([
      prisma.company.count({ where: { userId } }),
      prisma.company.count({
        where: { userId, enrichmentStatus: "enriched" },
      }),
      prisma.visitor.count({ where: { userId } }),
      prisma.visitor.count({
        where: { userId, intentScore: { not: null } },
      }),
      prisma.company.aggregate({
        where: { userId, intentScore: { not: null } },
        _avg: { intentScore: true },
      }),
      prisma.company.findMany({
        where: { userId },
        select: { industry: true, intentStage: true },
      }),
      prisma.company.findMany({
        where: { userId, enrichmentStatus: "enriched" },
        orderBy: { enrichedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          domain: true,
          industry: true,
          enrichedAt: true,
          intentScore: true,
          intentStage: true,
        },
      }),
    ]);

    // Calculate top industries
    const industryCounts: Record<string, number> = {};
    for (const company of allCompanies) {
      if (company.industry) {
        industryCounts[company.industry] =
          (industryCounts[company.industry] || 0) + 1;
      }
    }
    const topIndustries = Object.entries(industryCounts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate intent distribution
    const intentCounts: Record<string, number> = {};
    for (const company of allCompanies) {
      if (company.intentStage) {
        intentCounts[company.intentStage] =
          (intentCounts[company.intentStage] || 0) + 1;
      }
    }
    const intentDistribution = Object.entries(intentCounts).map(
      ([stage, count]) => ({ stage, count })
    );

    return NextResponse.json({
      totalCompanies,
      enrichedCompanies,
      totalVisitors,
      analyzedVisitors,
      avgIntentScore: avgIntentResult._avg.intentScore || 0,
      topIndustries,
      recentActivity,
      intentDistribution,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
