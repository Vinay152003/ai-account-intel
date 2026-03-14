"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Globe,
  Target,
  Users,
  Brain,
  Sparkles,
  TrendingUp,
  Loader2,
  AlertCircle,
  Cpu,
  MessageSquare,
  Rocket,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
} from "lucide-react";

interface Leader {
  name: string;
  title: string;
  linkedin?: string;
}

interface Company {
  id: string;
  name: string;
  domain: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  headquarters: string | null;
  foundedYear: number | null;
  description: string | null;
  techStack: string[] | null;
  leadership: Leader[] | null;
  businessSignals: string[] | null;
  fundingInfo: string | null;
  revenueRange: string | null;
  aiSummary: string | null;
  salesAction: string | null;
  intentScore: number | null;
  intentStage: string | null;
  persona: string | null;
  personaConfidence: number | null;
  confidence: number | null;
  enrichmentStatus: string;
  enrichedAt: string | null;
  createdAt: string;
}

function normalizeScore(score: number | null): number | null {
  if (score === null) return null;
  return score > 10 ? score / 10 : score;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-slate-500";
  const s = normalizeScore(score)!;
  if (s < 4) return "text-red-400";
  if (s <= 6) return "text-yellow-400";
  return "text-green-400";
}

function getScoreLabel(score: number | null) {
  if (score === null) return "Not scored";
  const s = normalizeScore(score)!;
  if (s < 4) return "Low Intent";
  if (s <= 6) return "Medium Intent";
  return "High Intent";
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [error, setError] = useState("");

  const id = params.id as string;

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const res = await fetch(`/api/companies/${id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch company");
      const data = await res.json();
      setCompany(data);
    } catch {
      setError("Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  const enrichCompany = async () => {
    setEnriching(true);
    setError("");
    try {
      const res = await fetch(`/api/companies/${id}/enrich`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to enrich");
      const updated = await res.json();
      setCompany(updated);
    } catch {
      setError("Failed to enrich company");
    } finally {
      setEnriching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }

  if (!company) return null;

  const score = normalizeScore(company.intentScore);
  const techStack = Array.isArray(company.techStack) ? company.techStack : [];
  const leadership = Array.isArray(company.leadership) ? company.leadership as Leader[] : [];
  const businessSignals = Array.isArray(company.businessSignals) ? company.businessSignals : [];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/companies"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Link>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {company.domain && (
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Globe className="h-3.5 w-3.5" />
                    {company.domain}
                  </span>
                )}
                {company.industry && (
                  <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded">
                    {company.industry}
                  </span>
                )}
                {company.intentStage && (
                  <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                    {company.intentStage}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={enrichCompany}
            disabled={enriching}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/10 text-sm"
          >
            {enriching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {enriching ? "Enriching..." : "Enrich with AI"}
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-slate-400">Intent Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(company.intentScore)}`}>
              {score !== null ? score.toFixed(1) : "--"}
            </span>
            <span className="text-sm text-slate-500 mb-1">/10</span>
          </div>
          <p className={`text-xs mt-1 ${getScoreColor(company.intentScore)}`}>
            {getScoreLabel(company.intentScore)}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-slate-400">Persona</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {company.persona || "Not identified"}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Confidence</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {company.confidence !== null
              ? `${(company.confidence * 100).toFixed(0)}%`
              : "--"}
          </p>
        </div>
      </div>

      {/* Enrichment Data */}
      {company.enrichmentStatus === "pending" ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Not Enriched Yet
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Click &quot;Enrich with AI&quot; to generate a comprehensive profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Overview */}
          {company.description && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Company Overview</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {company.description}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/30">
                {company.size && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Employees</span>
                      <p className="text-sm text-white">{company.size}</p>
                    </div>
                  </div>
                )}
                {company.revenueRange && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Revenue</span>
                      <p className="text-sm text-white">{company.revenueRange}</p>
                    </div>
                  </div>
                )}
                {company.foundedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Founded</span>
                      <p className="text-sm text-white">{company.foundedYear}</p>
                    </div>
                  </div>
                )}
                {company.headquarters && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <span className="text-xs text-slate-500">Location</span>
                      <p className="text-sm text-white">{company.headquarters}</p>
                    </div>
                  </div>
                )}
              </div>
              {company.fundingInfo && (
                <div className="mt-4 pt-4 border-t border-slate-700/30">
                  <span className="text-xs text-slate-500">Funding</span>
                  <p className="text-sm text-white mt-1">{company.fundingInfo}</p>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Tech Stack</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Leadership */}
          {leadership.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Leadership</h2>
              </div>
              <div className="space-y-3">
                {leadership.map((person, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full flex items-center justify-center text-cyan-400 text-xs font-bold">
                      {person.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{person.name}</p>
                      <p className="text-xs text-slate-400">{person.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Signals */}
          {businessSignals.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Business Signals</h2>
              </div>
              <ul className="space-y-2">
                {businessSignals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Summary */}
          {company.aiSummary && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">AI Summary</h2>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/5 to-teal-500/5 border border-cyan-500/10 rounded-lg p-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {company.aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* Sales Action */}
          {company.salesAction && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">
                  Recommended Sales Action
                </h2>
              </div>
              <div className="bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/10 rounded-lg p-4">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {company.salesAction}
                </p>
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm">
                  <MessageSquare className="h-4 w-4" />
                  Start Outreach
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
