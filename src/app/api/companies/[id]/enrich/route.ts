import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFullIntelligence } from "@/lib/enrichment";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email, session.user.name);

    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.company.update({
      where: { id },
      data: { enrichmentStatus: "enriching" },
    });

    const intelligence = await generateFullIntelligence(company.name);

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        domain: intelligence.company.domain || company.domain,
        website: intelligence.company.website || company.website,
        industry: intelligence.company.industry || company.industry,
        size: intelligence.company.size || company.size,
        headquarters: intelligence.company.headquarters || company.headquarters,
        foundedYear: intelligence.company.foundedYear || company.foundedYear,
        description: intelligence.company.description || company.description,
        techStack: (intelligence.company.techStack || company.techStack || undefined) as undefined | string[],
        leadership: (intelligence.company.leadership || company.leadership || undefined) as undefined | object[],
        businessSignals: (intelligence.company.businessSignals || company.businessSignals || undefined) as undefined | string[],
        fundingInfo: intelligence.company.fundingInfo || company.fundingInfo,
        revenueRange: intelligence.company.revenueRange || company.revenueRange,
        aiSummary: intelligence.aiSummary,
        salesAction: intelligence.salesAction,
        intentScore: intelligence.intentScore ?? company.intentScore,
        intentStage: intelligence.intentStage || company.intentStage,
        persona: intelligence.persona || company.persona,
        personaConfidence: intelligence.personaConfidence ?? company.personaConfidence,
        confidence: intelligence.confidence ?? company.confidence,
        enrichmentStatus: "enriched",
        enrichedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error enriching company:", error);

    try {
      await prisma.company.update({
        where: { id },
        data: { enrichmentStatus: "failed" },
      });
    } catch { /* ignore */ }

    return NextResponse.json({ error: "Failed to enrich company" }, { status: 500 });
  }
}
