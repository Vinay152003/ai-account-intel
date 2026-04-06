"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Target,
  Users,
  Brain,
  Sparkles,
  TrendingUp,
  Loader2,
  AlertCircle,
  Eye,
  Clock,
  Monitor,
  MapPin,
  Tag,
  Zap,
  MessageSquare,
  Building2,
  Link2,
  Compass,
  Shield,
} from "lucide-react";

interface Visitor {
  id: string;
  visitorId: string | null;
  ipAddress: string | null;
  pagesVisited: string[] | null;
  timeOnSite: number | null;
  visitCount: number | null;
  referralSource: string | null;
  device: string | null;
  location: string | null;
  userAgent: string | null;
  persona: string | null;
  personaConfidence: number | null;
  intentScore: number | null;
  intentStage: string | null;
  behaviorSummary: string | null;
  behavioralAttributes: string[] | null;
  userSegment: string | null;
  keySignals: string[] | null;
  engagementStrategy: string | null;
  companyId: string | null;
  company: { id: string; name: string; industry: string | null; size: string | null } | null;
  createdAt: string;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-slate-500";
  if (score < 30) return "text-red-400";
  if (score <= 60) return "text-yellow-400";
  return "text-green-400";
}

function getScoreLabel(score: number | null) {
  if (score === null) return "Not scored";
  if (score < 30) return "Low Intent";
  if (score <= 60) return "Medium Intent";
  return "High Intent";
}

function getSegmentColor(segment: string | null) {
  const colors: Record<string, string> = {
    "Enterprise Buyer": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "SMB Explorer": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "Technical Evaluator": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "Individual Researcher": "bg-slate-500/10 text-slate-400 border-slate-500/20",
    "Partner/Integrator": "bg-teal-500/10 text-teal-400 border-teal-500/20",
    "Executive Decision Maker": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Churning Customer": "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return colors[segment || ""] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

function parseJsonField(field: unknown): unknown[] {
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try { return JSON.parse(field); } catch { return []; }
  }
  return [];
}

export default function VisitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const id = params.id as string;

  useEffect(() => {
    fetchVisitor();
  }, [id]);

  const fetchVisitor = async () => {
    try {
      const res = await fetch(`/api/visitors/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch visitor");
      const data = await res.json();
      setVisitor(data);
    } catch {
      setError("Failed to load visitor details");
    } finally {
      setLoading(false);
    }
  };

  const analyzeVisitorAction = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch(`/api/visitors/${id}/analyze`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to analyze");
      const updated = await res.json();
      const updatedVisitor = updated.visitor || updated;
      setVisitor((prev) => prev ? { ...prev, ...updatedVisitor } : updatedVisitor);
    } catch {
      setError("Failed to analyze visitor");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error && !visitor) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      </div>
    );
  }

  if (!visitor) return null;

  const pagesVisited = parseJsonField(visitor.pagesVisited) as string[];
  const behavioralAttributes = parseJsonField(visitor.behavioralAttributes) as string[];
  const keySignals = parseJsonField(visitor.keySignals) as string[];
  const hasAnalysis = visitor.persona || visitor.intentScore !== null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/visitors" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Visitors
      </Link>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
              <Users className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{visitor.visitorId || "Anonymous Visitor"}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {visitor.ipAddress && (
                  <span className="flex items-center gap-1 text-sm text-slate-400">
                    <Globe className="h-3.5 w-3.5" /> {visitor.ipAddress}
                  </span>
                )}
                {visitor.userSegment && (
                  <span className={`text-xs px-2 py-1 rounded border ${getSegmentColor(visitor.userSegment)}`}>
                    {visitor.userSegment}
                  </span>
                )}
                {visitor.intentStage && (
                  <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                    {visitor.intentStage}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={analyzeVisitorAction}
            disabled={analyzing}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/10 text-sm"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-slate-400">Intent Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(visitor.intentScore)}`}>
              {visitor.intentScore !== null ? visitor.intentScore : "--"}
            </span>
            <span className="text-sm text-slate-500 mb-1">/100</span>
          </div>
          <p className={`text-xs mt-1 ${getScoreColor(visitor.intentScore)}`}>
            {getScoreLabel(visitor.intentScore)}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-slate-400">Persona</span>
          </div>
          <p className="text-lg font-semibold text-white">{visitor.persona || "Not identified"}</p>
          {visitor.personaConfidence !== null && (
            <p className="text-xs text-slate-500 mt-1">{(visitor.personaConfidence * 100).toFixed(0)}% confidence</p>
          )}
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">User Segment</span>
          </div>
          <p className="text-lg font-semibold text-white">{visitor.userSegment || "Not classified"}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-slate-400">Intent Stage</span>
          </div>
          <p className="text-lg font-semibold text-white">{visitor.intentStage || "Unknown"}</p>
        </div>
      </div>

      {/* Not Analyzed State */}
      {!hasAnalysis ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Not Analyzed Yet</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Click &quot;Analyze with AI&quot; to generate a comprehensive visitor profile with persona, intent, behavioral attributes, and engagement strategy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visitor Overview */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Visitor Overview</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {visitor.device && (
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5 text-slate-500" />
                  <div>
                    <span className="text-xs text-slate-500">Device</span>
                    <p className="text-sm text-white">{visitor.device}</p>
                  </div>
                </div>
              )}
              {visitor.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <div>
                    <span className="text-xs text-slate-500">Location</span>
                    <p className="text-sm text-white">{visitor.location}</p>
                  </div>
                </div>
              )}
              {visitor.referralSource && (
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-slate-500" />
                  <div>
                    <span className="text-xs text-slate-500">Referral</span>
                    <p className="text-sm text-white">{visitor.referralSource}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <div>
                  <span className="text-xs text-slate-500">Visit Count</span>
                  <p className="text-sm text-white">{visitor.visitCount || 1} visits</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <div>
                  <span className="text-xs text-slate-500">Time on Site</span>
                  <p className="text-sm text-white">
                    {visitor.timeOnSite ? `${Math.floor(visitor.timeOnSite / 60)}m ${visitor.timeOnSite % 60}s` : "N/A"}
                  </p>
                </div>
              </div>
              {visitor.userAgent && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                  <div>
                    <span className="text-xs text-slate-500">User Agent</span>
                    <p className="text-sm text-white truncate max-w-[200px]">{visitor.userAgent}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pages Visited */}
          {pagesVisited.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Pages Visited</h2>
              </div>
              <ul className="space-y-2">
                {pagesVisited.map((page, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <code className="bg-slate-900/50 px-2 py-0.5 rounded text-xs">{page}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Behavioral Attributes */}
          {behavioralAttributes.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Behavioral Attributes</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {behavioralAttributes.map((attr, i) => (
                  <span key={i} className="text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-full">
                    {attr}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Signals */}
          {keySignals.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Key Signals Observed</h2>
              </div>
              <ul className="space-y-2">
                {keySignals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Behavior Summary */}
          {visitor.behaviorSummary && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">AI Behavior Summary</h2>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/5 to-teal-500/5 border border-cyan-500/10 rounded-lg p-4">
                <p className="text-slate-300 text-sm leading-relaxed">{visitor.behaviorSummary}</p>
              </div>
            </div>
          )}

          {/* Engagement Strategy */}
          {visitor.engagementStrategy && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Engagement Strategy</h2>
              </div>
              <div className="bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/10 rounded-lg p-4">
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{visitor.engagementStrategy}</p>
                {visitor.company && (
                  <a
                    href={`mailto:?subject=Outreach: ${encodeURIComponent(visitor.company.name)} Visitor&body=${encodeURIComponent(`Hi,\n\nWe detected high-intent activity from a visitor associated with ${visitor.company.name}.\n\nKey Insight:\n${visitor.engagementStrategy || ''}\n\nBest regards`)}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium px-4 py-2 rounded-lg transition-all text-sm"
                  >
                    <MessageSquare className="h-4 w-4" /> Start Outreach
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Linked Company */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Linked Company</h2>
            </div>
            {visitor.company ? (
              <Link
                href={`/dashboard/companies/${visitor.company.id}`}
                className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{visitor.company.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {visitor.company.industry && (
                      <span className="text-xs text-slate-400">{visitor.company.industry}</span>
                    )}
                    {visitor.company.size && (
                      <span className="text-xs text-slate-500">{visitor.company.size}</span>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="text-center py-4">
                <Building2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No company linked</p>
                <p className="text-xs text-slate-600 mt-1">Company will be identified during AI analysis</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
