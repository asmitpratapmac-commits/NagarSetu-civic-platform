import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, MapPin, Plus } from 'lucide-react';
import { analyticsApi } from '../../api';
import { complaintApi } from '../../api/complaintApi';
import { StatCard } from '../../components/StatCard';
import { StatCardSkeleton } from '../../components/Skeletons';
import { ComplaintCard } from '../../components/ComplaintCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, complaintsRes] = await Promise.all([
          analyticsApi.citizenSummary(),
          complaintApi.listMine({ limit: 4 }),
        ]);
        setSummary(summaryRes.data.data);
        setRecent(complaintsRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-medium text-char-950">Hi, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-stone-600">Here's what's happening with your reports.</p>
        </div>
        <Link to="/citizen/report" className="btn-primary">
          <Plus size={16} /> Report an Issue
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total reported" value={summary.total} icon={FileText} accent="stone" />
            <StatCard label="Active" value={summary.active} icon={Clock} accent="amber" />
            <StatCard label="Resolved" value={summary.resolved} icon={CheckCircle2} accent="emerald" />
            <StatCard label="Awaiting your confirmation" value={summary.pendingVerification} icon={MapPin} accent="rust" />
          </>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-char-950">Recent complaints</h2>
          <Link to="/citizen/complaints" className="text-sm font-medium text-emerald-600 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-32 animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No complaints yet"
            description="Report your first civic issue and start tracking it here."
            action={
              <Link to="/citizen/report" className="btn-primary">
                Report an Issue
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recent.map((c) => (
              <ComplaintCard key={c._id} complaint={c} basePath="/citizen/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
