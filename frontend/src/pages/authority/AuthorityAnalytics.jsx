import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { analyticsApi } from '../../api';
import { StatCard } from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/Skeletons';
import { ClipboardList, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const COLORS = ['#2E8055', '#E8A33D', '#8F3D2B', '#847C64', '#68C08D'];

export const AuthorityAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, categoryRes] = await Promise.all([
          analyticsApi.authoritySummary(),
          analyticsApi.categoryDistribution().catch(() => ({ data: { data: [] } })),
        ]);
        setSummary(summaryRes.data.data);
        setCategoryData(categoryRes.data.data.map((c) => ({ name: c._id, value: c.count })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-medium text-char-950">Your performance</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Assigned" value={summary.assigned} icon={ClipboardList} accent="stone" />
            <StatCard label="Pending" value={summary.pending} icon={Clock} accent="amber" />
            <StatCard label="Overdue" value={summary.overdue} icon={AlertTriangle} accent="rust" />
            <StatCard label="Resolved" value={summary.resolvedByMe} icon={CheckCircle2} accent="emerald" />
          </>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-medium text-char-950">City-wide category distribution</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {categoryData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
