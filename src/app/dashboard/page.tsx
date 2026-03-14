"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RecentCompany {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  enrichedAt: string | null;
  intentScore: number | null;
  intentStage: string | null;
}

interface DashboardStats {
  totalCompanies: number;
  enrichedCompanies: number;
  totalVisitors: number;
  avgIntentScore: number;
  intentDistribution: { stage: string; count: number }[];
  recentActivity: RecentCompany[];
}

const defaultStats: DashboardStats = {
  totalCompanies: 0,
  enrichedCompanies: 0,
  totalVisitors: 0,
  avgIntentScore: 0,
  intentDistribution: [],
  recentActivity: [],
};

const stageColors: Record<string, string> = {
  Awareness: "#ef4444",
  Consideration: "#eab308",
  Decision: "#22c55e",
  Purchase: "#06b6d4",
};

function normalizeScore(score: number): number {
  return score > 10 ? score / 10 : score;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats({
        ...defaultStats,
        ...data,
        avgIntentScore: data.avgIntentScore ? normalizeScore(data.avgIntentScore) : 0,
      });
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "text-cyan-400",
      bg: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      label: "Enriched",
      value: stats.enrichedCompanies,
      icon: Sparkles,
      color: "text-teal-400",
      bg: "from-teal-500/20 to-teal-500/5",
    },
    {
      label: "Total Visitors",
      value: stats.totalVisitors,
      icon: Users,
      color: "text-blue-400",
      bg: "from-blue-500/20 to-blue-500/5",
    },
    {
      label: "Avg Intent Score",
      value: stats.avgIntentScore.toFixed(1),
      icon: Target,
      color: "text-amber-400",
      bg: "from-amber-500/20 to-amber-500/5",
    },
  ];

  const chartData = stats.intentDistribution.length > 0
    ? stats.intentDistribution
    : [
        { stage: "Awareness", count: 0 },
        { stage: "Consideration", count: 0 },
        { stage: "Decision", count: 0 },
        { stage: "Purchase", count: 0 },
      ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Overview of your account intelligence
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <div
                className={`w-10 h-10 bg-gradient-to-br ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intent Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">
              Intent Stage Distribution
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="stage"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "#475569" }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "#475569" }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={stageColors[entry.stage] || "#06b6d4"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No recent activity yet.
              </p>
            ) : (
              stats.recentActivity.map((company) => (
                <div
                  key={company.id}
                  className="flex items-start gap-3 pb-4 border-b border-slate-700/30 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {company.industry || "Enriched"} &middot; {formatDate(company.enrichedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
