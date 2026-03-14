import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFullIntelligence } from "@/lib/enrichment";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email, session.user.name);

    const { companies } = await request.json();

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: "An array of company names is required" },
        { status: 400 }
      );
    }

    const createdCompanies = await Promise.all(
      companies.map((name: string) =>
        prisma.company.create({
          data: {
            name,
            userId: user.id,
            enrichmentStatus: "enriching",
          },
        })
      )
    );

    // Enrich in background
    const enrichPromise = Promise.allSettled(
      createdCompanies.map(async (company) => {
        try {
          const intel = await generateFullIntelligence(company.name);

          await prisma.company.update({
            where: { id: company.id },
            data: {
              domain: intel.company.domain,
              website: intel.company.website,
              industry: intel.company.industry,
              size: intel.company.size,
              headquarters: intel.company.headquarters,
              foundedYear: intel.company.foundedYear,
              description: intel.company.description,
              techStack: (intel.company.techStack || undefined) as undefined | string[],
              leadership: (intel.company.leadership || undefined) as undefined | object[],
              businessSignals: (intel.company.businessSignals || undefined) as undefined | string[],
              fundingInfo: intel.company.fundingInfo,
              revenueRange: intel.company.revenueRange,
              aiSummary: intel.aiSummary,
              salesAction: intel.salesAction,
              intentScore: intel.intentScore,
              intentStage: intel.intentStage,
              persona: intel.persona,
              personaConfidence: intel.personaConfidence,
              confidence: intel.confidence,
              enrichmentStatus: "enriched",
              enrichedAt: new Date(),
            },
          });
        } catch (error) {
          console.error(`Failed to enrich ${company.name}:`, error);
          await prisma.company.update({
            where: { id: company.id },
            data: { enrichmentStatus: "failed" },
          });
        }
      })
    );

    // Don't block - let enrichment run in background
    void enrichPromise;

    return NextResponse.json(
      {
        message: `Batch enrichment started for ${createdCompanies.length} companies`,
        companies: createdCompanies,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in batch enrichment:", error);
    return NextResponse.json(
      { error: "Failed to process batch enrichment" },
      { status: 500 }
    );
  }
}
