import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintCard } from '../../components/ComplaintCard';
import { ListSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { STATUSES, SEVERITIES } from '../../utils/constants';

export const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', severity: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.severity) params.severity = filters.severity;
        const { data } = await complaintApi.listAssignedToMe(params);
        setComplaints(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-2xl font-medium text-char-950">Assigned complaints</h1>
        <div className="flex gap-2">
          <select
            className="input w-40"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="input w-36"
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          >
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <ListSkeleton count={6} />
      ) : complaints.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No complaints match these filters" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} basePath="/authority/complaints" />
          ))}
        </div>
      )}
    </div>
  );
};
