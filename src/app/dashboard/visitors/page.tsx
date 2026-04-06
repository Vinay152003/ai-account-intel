"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Brain,
  Beaker,
  Search,
  Globe,
  Clock,
  Eye,
  Link2,
  ChevronRight,
} from "lucide-react";

interface Visitor {
  id: string;
  visitorId: string;
  ipAddress: string | null;
  pagesVisited: string[];
  timeOnSite: number;
  visitCount: number;
  referralSource: string | null;
  device: string | null;
  location: string | null;
  userAgent: string | null;
  intentScore: number | null;
  persona: string | null;
  userSegment: string | null;
  companyId: string | null;
  company?: { name: string } | null;
  createdAt: string;
}

function getScoreColor(score: number | null) {
  if (score === null) return "text-slate-500";
  if (score < 4) return "text-red-400";
  if (score <= 6) return "text-yellow-400";
  return "text-green-400";
}

const sampleVisitors = [
  {
    visitorId: "visitor-001",
    ipAddress: "34.201.12.45",
    pagesVisited: "/pricing,/features,/enterprise,/contact,/ai-sales-agent",
    timeOnSite: 340,
    visitCount: 5,
    referralSource: "google",
    device: "Desktop",
    location: "San Francisco, CA",
    userAgent: "Chrome 120 / Windows 11",
  },
  {
    visitorId: "visitor-002",
    ipAddress: "52.14.88.201",
    pagesVisited: "/blog,/about,/documentation,/api-reference",
    timeOnSite: 120,
    visitCount: 2,
    referralSource: "twitter",
    device: "Mobile",
    location: "New York, NY",
    userAgent: "Safari / iPhone 15",
  },
  {
    visitorId: "visitor-003",
    ipAddress: "172.16.0.88",
    pagesVisited: "/pricing,/demo,/case-studies,/integrations,/security,/enterprise",
    timeOnSite: 560,
    visitCount: 8,
    referralSource: "linkedin",
    device: "Desktop",
    location: "Chicago, IL",
    userAgent: "Firefox 121 / macOS",
  },
];

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Form fields
  const [visitorId, setVisitorId] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [pagesVisited, setPagesVisited] = useState("");
  const [timeOnSite, setTimeOnSite] = useState("");
  const [visitCount, setVisitCount] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [device, setDevice] = useState("");
  const [location, setLocation] = useState("");
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch("/api/visitors", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setVisitors(data.visitors || data);
    } catch {
      setError("Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  const addVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          visitorId,
          ipAddress: ipAddress || undefined,
          pagesVisited: pagesVisited
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          timeOnSite: parseInt(timeOnSite) || 0,
          visitCount: parseInt(visitCount) || 1,
          referralSource: referralSource || undefined,
          device: device || undefined,
          location: location || undefined,
          userAgent: userAgent || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add visitor");
      }
      const visitor = await res.json();
      setVisitors((prev) => [visitor, ...prev]);
      resetForm();
      setShowForm(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add visitor";
      setError(message);
    } finally {
      setAdding(false);
    }
  };

  const resetForm = () => {
    setVisitorId("");
    setIpAddress("");
    setPagesVisited("");
    setTimeOnSite("");
    setVisitCount("");
    setReferralSource("");
    setDevice("");
    setLocation("");
    setUserAgent("");
  };

  const analyzeVisitor = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await fetch(`/api/visitors/${id}/analyze`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to analyze");
      const updated = await res.json();
      const updatedVisitor = updated.visitor || updated;
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updatedVisitor } : v))
      );
    } catch {
      setError("Failed to analyze visitor");
    } finally {
      setAnalyzingId(null);
    }
  };

  const loadSampleData = async () => {
    setAdding(true);
    setError("");
    try {
      for (const sample of sampleVisitors) {
        const res = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...sample,
            pagesVisited: sample.pagesVisited
              .split(",")
              .map((p) => p.trim()),
          }),
        });
        if (res.ok) {
          const visitor = await res.json();
          setVisitors((prev) => [visitor, ...prev]);
        }
      }
    } catch {
      setError("Failed to load sample data");
    } finally {
      setAdding(false);
    }
  };

  const filtered = visitors.filter(
    (v) =>
      v.visitorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.ipAddress &&
        v.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Visitors</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track and analyze website visitor behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          {visitors.length === 0 && (
            <button
              onClick={loadSampleData}
              disabled={adding}
              className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 font-medium px-4 py-2.5 rounded-lg transition-all text-sm"
            >
              <Beaker className="h-4 w-4" />
              Load Samples
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/10 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Visitor
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add Visitor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Add Visitor
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addVisitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Visitor ID *
                </label>
                <input
                  type="text"
                  value={visitorId}
                  onChange={(e) => setVisitorId(e.target.value)}
                  placeholder="e.g. visitor-001"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Pages Visited (comma separated)
                </label>
                <input
                  type="text"
                  value={pagesVisited}
                  onChange={(e) => setPagesVisited(e.target.value)}
                  placeholder="/pricing, /features, /contact"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Time on Site (sec)
                  </label>
                  <input
                    type="number"
                    value={timeOnSite}
                    onChange={(e) => setTimeOnSite(e.target.value)}
                    placeholder="300"
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Visit Count
                  </label>
                  <input
                    type="number"
                    value={visitCount}
                    onChange={(e) => setVisitCount(e.target.value)}
                    placeholder="1"
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Referral Source
                </label>
                <input
                  type="text"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  placeholder="e.g. google, linkedin, direct"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Device
                  </label>
                  <input
                    type="text"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    placeholder="e.g. Desktop, Mobile"
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  User Agent
                </label>
                <input
                  type="text"
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  placeholder="e.g. Chrome 120 / Windows 11"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {adding ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      {visitors.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by visitor ID or IP..."
            className="w-full sm:w-72 bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
          />
        </div>
      )}

      {/* Visitors List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {visitors.length === 0 ? "No visitors yet" : "No results found"}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {visitors.length === 0
              ? "Add visitors manually or load sample data to get started."
              : "Try a different search term."}
          </p>
          {visitors.length === 0 && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadSampleData}
                disabled={adding}
                className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 font-medium px-4 py-2.5 rounded-lg transition-all text-sm"
              >
                <Beaker className="h-4 w-4" />
                Load Samples
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium px-4 py-2.5 rounded-lg transition-all text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Visitor
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                    Visitor
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden sm:table-cell">
                    Pages
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">
                    Time / Visits
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                    Intent
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">
                    Company
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/visitors/${visitor.id}`} className="block group">
                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                          {visitor.visitorId}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Globe className="h-3 w-3" />
                          {visitor.ipAddress || "Unknown IP"}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {visitor.pagesVisited.join(", ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(visitor.timeOnSite / 60)}m{" "}
                          {visitor.timeOnSite % 60}s
                        </span>
                        <span>{visitor.visitCount} visits</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold ${getScoreColor(
                          visitor.intentScore
                        )}`}
                      >
                        {visitor.intentScore !== null
                          ? visitor.intentScore.toFixed(1)
                          : "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {visitor.company ? (
                        <span className="flex items-center gap-1 text-xs text-cyan-400">
                          <Link2 className="h-3 w-3" />
                          {visitor.company.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Not linked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); analyzeVisitor(visitor.id); }}
                          disabled={analyzingId === visitor.id}
                          className="inline-flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          {analyzingId === visitor.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Brain className="h-3 w-3" />
                          )}
                          {analyzingId === visitor.id ? "Analyzing..." : "Analyze"}
                        </button>
                        <Link
                          href={`/dashboard/visitors/${visitor.id}`}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-xs font-medium px-2 py-1.5 rounded-lg transition-all"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
