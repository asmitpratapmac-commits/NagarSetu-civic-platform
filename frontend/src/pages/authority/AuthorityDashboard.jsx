import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { analyticsApi } from '../../api';
import { complaintApi } from '../../api/complaintApi';
import { StatCard } from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/Skeletons';
import { ComplaintCard } from '../../components/ComplaintCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';

export const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [critical, setCritical] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, criticalRes] = await Promise.all([
          analyticsApi.authoritySummary(),
          complaintApi.listAssignedToMe({ severity: 'Critical', limit: 4 }),
        ]);
        setSummary(summaryRes.data.data);
        setCritical(criticalRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-char-950">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-stone-600">{user?.designation} · {user?.department?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Assigned to me" value={summary.assigned} icon={ClipboardList} accent="stone" />
            <StatCard label="Pending work" value={summary.pending} icon={Clock} accent="amber" />
            <StatCard label="Critical" value={summary.critical} icon={AlertTriangle} accent="rust" />
            <StatCard label="Resolved by me" value={summary.resolvedByMe} icon={CheckCircle2} accent="emerald" />
          </>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-char-950">Critical complaints</h2>
          <Link to="/authority/complaints" className="text-sm font-medium text-emerald-600 hover:underline">
            View all assigned
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card h-32 animate-pulse" />
            ))}
          </div>
        ) : critical.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No critical complaints" description="You're on top of everything urgent right now." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {critical.map((c) => (
              <ComplaintCard key={c._id} complaint={c} basePath="/authority/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
