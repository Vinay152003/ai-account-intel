import Anthropic from "@anthropic-ai/sdk";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CompanyEnrichment {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  foundedYear?: number;
  description?: string;
  techStack?: string[];
  leadership?: { name: string; title: string; linkedin?: string }[];
  businessSignals?: string[];
  fundingInfo?: string;
  revenueRange?: string;
}

export interface VisitorInput {
  pagesViewed: string[];
  timeOnSite: number; // seconds
  referrer?: string;
  deviceType?: string;
  returningVisitor?: boolean;
  formInteractions?: string[];
  downloadedAssets?: string[];
  searchTerms?: string[];
}

export interface VisitorAnalysis {
  persona: string;
  personaConfidence: number;
  intentScore: number;
  intentStage: string;
  behaviorSummary: string;
  companyGuess?: string;
}

export interface AccountIntelligence {
  company: CompanyEnrichment;
  aiSummary: string;
  salesAction: string;
  intentScore: number;
  intentStage: string;
  persona?: string;
  personaConfidence?: number;
  confidence: number;
}

// ── Anthropic client ───────────────────────────────────────────────────────────

function getAnthropicClient(): Anthropic {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY)?.trim();
  if (!apiKey) {
    throw new Error("CLAUDE_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

// ── Helper: call Claude and parse JSON from response ───────────────────────────

async function askClaude<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response received from Claude");
  }

  const raw = textBlock.text;

  // Extract JSON from the response (handle markdown code fences)
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonStr.slice(0, 200)}`);
  }
}

// ── Hunter.io domain lookup ────────────────────────────────────────────────────

export async function lookupDomain(companyName: string): Promise<string | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    console.warn("HUNTER_API_KEY not set; skipping domain lookup");
    return null;
  }

  try {
    const url = `https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(companyName)}&api_key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`Hunter.io returned status ${res.status} for "${companyName}"`);
      return null;
    }

    const data = (await res.json()) as {
      data?: { domain?: string };
    };

    return data?.data?.domain ?? null;
  } catch (err) {
    console.error("Hunter.io lookup failed:", err);
    return null;
  }
}

// ── IP-based company identification ────────────────────────────────────────────

export async function identifyCompanyFromIP(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}`);

    if (!res.ok) {
      console.warn(`ip-api.com returned status ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      status: string;
      org?: string;
      isp?: string;
      as?: string;
    };

    if (data.status !== "success") {
      return null;
    }

    // Prefer org, fall back to ISP (filter out generic ISP names)
    const org = data.org || data.isp || null;
    if (!org) return null;

    // Filter out generic ISP / hosting names that are not real companies
    const genericPatterns = [
      /comcast/i,
      /verizon/i,
      /at&t/i,
      /spectrum/i,
      /cox\s/i,
      /centurylink/i,
      /t-mobile/i,
      /sprint/i,
    ];
    if (genericPatterns.some((p) => p.test(org))) {
      return null;
    }

    return org;
  } catch (err) {
    console.error("IP lookup failed:", err);
    return null;
  }
}

// ── Company enrichment via Claude ──────────────────────────────────────────────

export async function enrichCompany(companyName: string): Promise<AccountIntelligence> {
  const domain = await lookupDomain(companyName);

  const systemPrompt = `You are an expert B2B sales intelligence researcher. Your job is to provide structured, accurate company enrichment data. Return ONLY valid JSON with no additional text or markdown fences.`;

  const userPrompt = `Research the company "${companyName}"${domain ? ` (domain: ${domain})` : ""} and provide comprehensive enrichment data.

Return a JSON object with this exact structure:
{
  "company": {
    "name": "${companyName}",
    "domain": "<company domain or null>",
    "website": "<full website URL or null>",
    "industry": "<primary industry>",
    "size": "<employee range, e.g. '51-200', '1001-5000'>",
    "headquarters": "<city, state/country>",
    "foundedYear": <year as number or null>,
    "description": "<1-2 sentence company description>",
    "techStack": ["<known technologies they use>"],
    "leadership": [{"name": "<name>", "title": "<title>", "linkedin": "<linkedin URL or null>"}],
    "businessSignals": ["<recent news, hiring trends, product launches, etc.>"],
    "fundingInfo": "<funding stage and amount if applicable, or null>",
    "revenueRange": "<estimated annual revenue range>"
  },
  "aiSummary": "<2-3 sentence executive summary for a sales rep>",
  "salesAction": "<specific recommended next action for a sales rep>",
  "intentScore": <0-100 number estimating buying intent based on signals>,
  "intentStage": "<one of: Awareness, Consideration, Decision, Purchase>",
  "confidence": <0-1 number indicating confidence in the enrichment data>
}

Be as accurate as possible. If you are unsure about specific data, make reasonable inferences but lower the confidence score. For lesser-known companies, provide your best estimates based on available context.`;

  try {
    const result = await askClaude<AccountIntelligence>(systemPrompt, userPrompt);

    // Ensure domain from Hunter.io is included if Claude didn't find one
    if (domain && !result.company.domain) {
      result.company.domain = domain;
    }

    return result;
  } catch (err) {
    console.error("Company enrichment failed:", err);
    return buildFallbackIntelligence(companyName, domain);
  }
}

// ── Visitor behavior analysis via Claude ───────────────────────────────────────

export async function analyzeVisitor(visitorData: VisitorInput): Promise<VisitorAnalysis> {
  const systemPrompt = `You are a B2B visitor behavior analyst. Analyze website visitor behavior patterns to infer their persona, buying intent, and stage in the buyer journey. Return ONLY valid JSON with no additional text or markdown fences.`;

  const userPrompt = `Analyze this website visitor's behavior and provide insights:

Visitor Data:
- Pages viewed: ${JSON.stringify(visitorData.pagesViewed)}
- Time on site: ${visitorData.timeOnSite} seconds
- Referrer: ${visitorData.referrer || "direct"}
- Device: ${visitorData.deviceType || "unknown"}
- Returning visitor: ${visitorData.returningVisitor ?? false}
- Form interactions: ${JSON.stringify(visitorData.formInteractions || [])}
- Downloaded assets: ${JSON.stringify(visitorData.downloadedAssets || [])}
- Search terms: ${JSON.stringify(visitorData.searchTerms || [])}

Return a JSON object with this exact structure:
{
  "persona": "<inferred buyer persona, e.g. 'Technical Decision Maker', 'Executive Buyer', 'End User Researcher'>",
  "personaConfidence": <0-1 confidence in persona identification>,
  "intentScore": <0-100 buying intent score>,
  "intentStage": "<one of: Awareness, Consideration, Decision, Purchase>",
  "behaviorSummary": "<2-3 sentence summary of what this visitor's behavior suggests>",
  "companyGuess": "<best guess at company name based on behavior patterns, or null>"
}

Base your analysis on:
- Pricing page visits indicate high intent
- Case study / testimonial pages indicate consideration stage
- Blog / resource pages indicate awareness stage
- Form submissions indicate decision stage
- Multiple return visits increase intent score
- Time on site correlates with engagement
- Downloaded assets (whitepapers, etc.) indicate serious research`;

  try {
    return await askClaude<VisitorAnalysis>(systemPrompt, userPrompt);
  } catch (err) {
    console.error("Visitor analysis failed:", err);
    return buildFallbackVisitorAnalysis(visitorData);
  }
}

// ── Full intelligence pipeline ─────────────────────────────────────────────────

export async function generateFullIntelligence(
  companyName: string,
  visitorData?: VisitorInput
): Promise<AccountIntelligence> {
  // Run enrichment and optional visitor analysis in parallel
  const [intelligence, visitorAnalysis] = await Promise.all([
    enrichCompany(companyName),
    visitorData ? analyzeVisitor(visitorData) : Promise.resolve(null),
  ]);

  // Merge visitor analysis into the intelligence result
  if (visitorAnalysis) {
    intelligence.persona = visitorAnalysis.persona;
    intelligence.personaConfidence = visitorAnalysis.personaConfidence;

    // Use the higher intent score between company signals and visitor behavior
    if (visitorAnalysis.intentScore > intelligence.intentScore) {
      intelligence.intentScore = visitorAnalysis.intentScore;
      intelligence.intentStage = visitorAnalysis.intentStage;
    }

    // Enhance the AI summary with visitor context
    intelligence.aiSummary += ` Visitor analysis suggests a ${visitorAnalysis.persona} persona (${Math.round(visitorAnalysis.personaConfidence * 100)}% confidence). ${visitorAnalysis.behaviorSummary}`;
  }

  return intelligence;
}

// ── Fallback builders ──────────────────────────────────────────────────────────

function buildFallbackIntelligence(
  companyName: string,
  domain: string | null
): AccountIntelligence {
  return {
    company: {
      name: companyName,
      domain: domain ?? undefined,
      website: domain ? `https://${domain}` : undefined,
      description: `${companyName} - company details could not be enriched at this time.`,
      techStack: [],
      leadership: [],
      businessSignals: [],
    },
    aiSummary: `Limited information available for ${companyName}. Manual research is recommended to gather more details before outreach.`,
    salesAction:
      "Conduct manual research on the company via LinkedIn and their website before reaching out.",
    intentScore: 25,
    intentStage: "Awareness",
    confidence: 0.1,
  };
}

function buildFallbackVisitorAnalysis(visitorData: VisitorInput): VisitorAnalysis {
  // Simple heuristic-based fallback
  const pricingViewed = visitorData.pagesViewed.some((p) =>
    /pricing|plans|packages/i.test(p)
  );
  const caseStudyViewed = visitorData.pagesViewed.some((p) =>
    /case.?study|testimonial|customer/i.test(p)
  );
  const hasFormInteraction = (visitorData.formInteractions?.length ?? 0) > 0;
  const hasDownloads = (visitorData.downloadedAssets?.length ?? 0) > 0;

  let intentScore = 20;
  let intentStage = "Awareness";

  if (pricingViewed) {
    intentScore += 30;
    intentStage = "Decision";
  }
  if (caseStudyViewed) {
    intentScore += 15;
    if (intentStage === "Awareness") intentStage = "Consideration";
  }
  if (hasFormInteraction) {
    intentScore += 20;
    intentStage = "Decision";
  }
  if (hasDownloads) {
    intentScore += 10;
    if (intentStage === "Awareness") intentStage = "Consideration";
  }
  if (visitorData.returningVisitor) {
    intentScore += 10;
  }
  if (visitorData.timeOnSite > 300) {
    intentScore += 5;
  }

  intentScore = Math.min(intentScore, 100);

  return {
    persona: "Unknown Visitor",
    personaConfidence: 0.1,
    intentScore,
    intentStage,
    behaviorSummary: `Visitor viewed ${visitorData.pagesViewed.length} pages over ${Math.round(visitorData.timeOnSite / 60)} minutes. ${pricingViewed ? "Pricing page was viewed, indicating buying interest." : "No high-intent pages detected."}`,
  };
}
