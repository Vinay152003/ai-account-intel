"use client";

import { useState } from "react";
import {
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  Target,
} from "lucide-react";

interface BatchResult {
  name: string;
  status: "pending" | "enriching" | "success" | "error";
  company?: {
    id: string;
    name: string;
    industry?: string | null;
    intentScore?: number | null;
    enrichmentStatus: string;
  };
  error?: string;
}

function getScoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) return "text-slate-500";
  if (score < 4) return "text-red-400";
  if (score <= 6) return "text-yellow-400";
  return "text-green-400";
}

const exampleCompanies = `BrightPath Lending
Summit Realty Group
Rocket Mortgage
Redfin
Compass Real Estate`;

export default function BatchEnrichPage() {
  const [input, setInput] = useState(exampleCompanies);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleEnrich = async () => {
    const names = input
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length === 0) {
      setError("Please enter at least one company name.");
      return;
    }

    setProcessing(true);
    setError("");
    setProgress({ current: 0, total: names.length });

    // Initialize results
    const initialResults: BatchResult[] = names.map((name) => ({
      name,
      status: "pending",
    }));
    setResults(initialResults);

    try {
      const res = await fetch("/api/enrich/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companies: names }),
      });

      if (!res.ok) {
        throw new Error("Batch enrichment request failed");
      }

      const data = await res.json();

      // If the API returns all results at once
      if (data.results) {
        const finalResults: BatchResult[] = data.results.map(
          (r: { name: string; success: boolean; company?: BatchResult["company"]; error?: string }) => ({
            name: r.name,
            status: r.success ? "success" : "error",
            company: r.company,
            error: r.error,
          })
        );
        setResults(finalResults);
        setProgress({ current: names.length, total: names.length });
      }
    } catch {
      // If batch endpoint fails, try one-by-one
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        setProgress({ current: i + 1, total: names.length });

        // Mark as enriching
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, status: "enriching" } : r
          )
        );

        try {
          // Create company
          const createRes = await fetch("/api/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name }),
          });

          if (!createRes.ok) {
            const errData = await createRes.json();
            throw new Error(errData.error || "Failed to create");
          }

          const company = await createRes.json();

          // Enrich it
          const enrichRes = await fetch(
            `/api/companies/${company.id}/enrich`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (!enrichRes.ok) throw new Error("Failed to enrich");

          const enriched = await enrichRes.json();

          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i
                ? { ...r, status: "success", company: enriched }
                : r
            )
          );
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed";
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i ? { ...r, status: "error", error: message } : r
            )
          );
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Batch Enrichment</h1>
        <p className="text-slate-400 text-sm mt-1">
          Enrich multiple companies at once with AI-powered intelligence
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Input */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">
            Company Names
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Enter company names, one per line. Each will be created and enriched
          with AI.
        </p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          disabled={processing}
          placeholder="Enter company names, one per line..."
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono text-sm resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-slate-500">
            {input.split("\n").filter((n) => n.trim()).length} companies
          </span>
          <button
            onClick={handleEnrich}
            disabled={processing}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/20 text-sm"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing {progress.current}/{progress.total}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Enrich All
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress */}
      {processing && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">
              Enriching companies...
            </span>
            <span className="text-sm text-cyan-400 font-medium">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full h-2 transition-all duration-500"
              style={{
                width: `${
                  progress.total > 0
                    ? (progress.current / progress.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {results.length > 0 && !processing && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-green-400">{successCount} succeeded</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-400">{errorCount} failed</span>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Results</h2>
          <div className="space-y-2">
            {results.map((result, i) => (
              <div
                key={i}
                className={`bg-slate-800/50 border rounded-xl p-4 flex items-center gap-4 transition-all ${
                  result.status === "success"
                    ? "border-green-500/20"
                    : result.status === "error"
                    ? "border-red-500/20"
                    : result.status === "enriching"
                    ? "border-cyan-500/20"
                    : "border-slate-700/50"
                }`}
              >
                {/* Status Icon */}
                <div className="shrink-0">
                  {result.status === "pending" && (
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-slate-500" />
                    </div>
                  )}
                  {result.status === "enriching" && (
                    <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                    </div>
                  )}
                  {result.status === "success" && (
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                  )}
                  {result.status === "error" && (
                    <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-400" />
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {result.name}
                  </p>
                  {result.status === "enriching" && (
                    <p className="text-xs text-cyan-400 mt-0.5">
                      Enriching with AI...
                    </p>
                  )}
                  {result.company?.industry && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      {result.company.industry}
                    </p>
                  )}
                  {result.error && (
                    <p className="text-xs text-red-400 mt-0.5">
                      {result.error}
                    </p>
                  )}
                </div>

                {/* Score */}
                {result.company?.intentScore !== undefined &&
                  result.company?.intentScore !== null && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Target className="h-3.5 w-3.5 text-slate-500" />
                      <span
                        className={`text-sm font-bold ${getScoreColor(
                          result.company.intentScore
                        )}`}
                      >
                        {result.company.intentScore.toFixed(1)}
                      </span>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
