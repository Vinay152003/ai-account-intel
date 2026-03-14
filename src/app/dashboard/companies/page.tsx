"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Sparkles,
  Loader2,
  X,
  Globe,
  AlertCircle,
  Search,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  intentScore: number | null;
  enrichmentStatus: string;
  createdAt: string;
}

function normalizeScore(score: number | null): number | null {
  if (score === null) return null;
  return score > 10 ? score / 10 : score;
}

function getScoreColor(score: number | null) {
  const s = normalizeScore(score);
  if (s === null) return "text-slate-500";
  if (s < 4) return "text-red-400";
  if (s <= 6) return "text-yellow-400";
  return "text-green-400";
}

function getScoreBg(score: number | null) {
  const s = normalizeScore(score);
  if (s === null) return "bg-slate-500/10";
  if (s < 4) return "bg-red-500/10";
  if (s <= 6) return "bg-yellow-500/10";
  return "bg-green-500/10";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "enriched":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "failed":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCompanies(data.companies || data);
    } catch {
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, domain: domain || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add company");
      }
      const company = await res.json();
      setCompanies((prev) => [company, ...prev]);
      setName("");
      setDomain("");
      setShowForm(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to add company";
      setError(message);
    } finally {
      setAdding(false);
    }
  };

  const enrichCompany = async (id: string) => {
    setEnrichingId(id);
    try {
      const res = await fetch(`/api/companies/${id}/enrich`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to enrich");
      const updated = await res.json();
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
      );
    } catch {
      setError("Failed to enrich company");
    } finally {
      setEnrichingId(null);
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.domain && c.domain.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage and enrich your company accounts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/10 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
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

      {/* Add Company Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                Add Company
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={addCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Domain (optional)
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. acme.com"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
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
      {companies.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="w-full sm:w-72 bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
          />
        </div>
      )}

      {/* Companies List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {companies.length === 0 ? "No companies yet" : "No results found"}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {companies.length === 0
              ? "Add your first company to get started with AI enrichment."
              : "Try a different search term."}
          </p>
          {companies.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium px-4 py-2.5 rounded-lg transition-all text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {company.name}
                    </h3>
                    {company.domain && (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Globe className="h-3 w-3" />
                        {company.domain}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusBadge(
                    company.enrichmentStatus
                  )}`}
                >
                  {company.enrichmentStatus}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {company.industry && (
                  <span className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded">
                    {company.industry}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Intent:</span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(
                      company.intentScore
                    )}`}
                  >
                    {company.intentScore !== null
                      ? (normalizeScore(company.intentScore) ?? 0).toFixed(1)
                      : "--"}
                  </span>
                  {company.intentScore !== null && (
                    <div
                      className={`w-2 h-2 rounded-full ${getScoreBg(
                        company.intentScore
                      )} ${getScoreColor(company.intentScore)}`}
                      style={{
                        backgroundColor:
                          company.intentScore < 4
                            ? "#ef444440"
                            : company.intentScore <= 6
                            ? "#eab30840"
                            : "#22c55e40",
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/companies/${company.id}`}
                  className="flex-1 text-center bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium py-2 rounded-lg transition-all"
                >
                  View
                </Link>
                <button
                  onClick={() => enrichCompany(company.id)}
                  disabled={enrichingId === company.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm font-medium py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {enrichingId === company.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {enrichingId === company.id ? "Enriching..." : "Enrich"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
