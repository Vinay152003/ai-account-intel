import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeVisitor, identifyCompanyFromIP } from "@/lib/enrichment";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email, session.user.name);

    const visitor = await prisma.visitor.findUnique({ where: { id } });

    if (!visitor) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    if (visitor.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pagesVisited = Array.isArray(visitor.pagesVisited) ? visitor.pagesVisited as string[] : [];

    const analysis = await analyzeVisitor({
      pagesViewed: pagesVisited,
      timeOnSite: visitor.timeOnSite || 0,
      referrer: visitor.referralSource || undefined,
      deviceType: visitor.device || undefined,
      returningVisitor: (visitor.visitCount || 1) > 1,
    });

    let companyId = visitor.companyId;
    let identifiedCompany = null;

    if (visitor.ipAddress) {
      const companyName = await identifyCompanyFromIP(visitor.ipAddress);

      if (companyName) {
        let company = await prisma.company.findFirst({
          where: {
            userId: user.id,
            name: { equals: companyName, mode: "insensitive" },
          },
        });

        if (!company) {
          company = await prisma.company.create({
            data: { name: companyName, userId: user.id },
          });
        }

        companyId = company.id;
        identifiedCompany = company;
      }
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id },
      data: {
        persona: analysis.persona,
        personaConfidence: analysis.personaConfidence,
        intentScore: analysis.intentScore,
        intentStage: analysis.intentStage,
        behaviorSummary: analysis.behaviorSummary,
        behavioralAttributes: analysis.behavioralAttributes || [],
        userSegment: analysis.userSegment || null,
        keySignals: analysis.keySignals || [],
        engagementStrategy: analysis.engagementStrategy || null,
        companyId,
      },
      include: { company: true },
    });

    return NextResponse.json({ visitor: updatedVisitor, identifiedCompany });
  } catch (error) {
    console.error("Error analyzing visitor:", error);
    return NextResponse.json({ error: "Failed to analyze visitor" }, { status: 500 });
  }
}
