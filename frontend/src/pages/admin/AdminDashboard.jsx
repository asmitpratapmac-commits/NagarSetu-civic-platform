import React, { useEffect, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api';
import { StatCard } from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/Skeletons';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, trendRes, aiRes] = await Promise.all([
          analyticsApi.adminSummary(),
          analyticsApi.trend(30),
          analyticsApi.aiStats(),
        ]);
        setSummary(summaryRes.data.data);
        setTrend(trendRes.data.data.map((d) => ({ date: d._id.slice(5), submitted: d.submitted, resolved: d.resolved })));
        setAiStats(aiRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-char-950">Command center</h1>
        <p className="mt-1 text-sm text-stone-600">City-wide complaint activity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading || !summary ? (
          Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total complaints" value={summary.total} icon={FileText} accent="stone" />
            <StatCard label="Open" value={summary.open} icon={Clock} accent="amber" />
            <StatCard label="Resolved" value={summary.resolved} icon={CheckCircle2} accent="emerald" />
            <StatCard label="Overdue (SLA)" value={summary.overdue} icon={AlertTriangle} accent="rust" />
            <StatCard label="Critical (open)" value={summary.critical} icon={AlertTriangle} accent="rust" />
            <StatCard label="Active users" value={summary.activeUsers} icon={Users} accent="stone" />
            <StatCard label="Citizens" value={summary.citizenCount} icon={Users} accent="emerald" />
            <StatCard label="Officers" value={summary.authorityCount} icon={Users} accent="amber" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-medium text-char-950">Complaint trend (30 days)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="submitted" stroke="#847C64" strokeWidth={2} dot={false} name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#2E8055" strokeWidth={2} dot={false} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600" />
            <h2 className="font-medium text-char-950">AI performance</h2>
          </div>
          {aiStats && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-stone-500">Complaints analyzed</p>
                <p className="font-display text-2xl text-char-950">{aiStats.totalAnalyzed}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Average confidence</p>
                <p className="font-display text-2xl text-char-950">{aiStats.avgConfidence}%</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Auto-assigned to department</p>
                <p className="font-display text-2xl text-char-950">{aiStats.autoAssignedCount}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
