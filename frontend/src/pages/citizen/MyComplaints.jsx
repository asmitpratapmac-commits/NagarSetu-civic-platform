import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintCard } from '../../components/ComplaintCard';
import { ListSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { STATUSES } from '../../utils/constants';

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await complaintApi.listMine(status ? { status } : {});
        setComplaints(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-2xl font-medium text-char-950">My complaints</h1>
        <select className="input w-full sm:w-52" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton count={6} />
      ) : complaints.length === 0 ? (
        <EmptyState icon={FileText} title="No complaints found" description="Try a different filter, or report a new issue." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} basePath="/citizen/complaints" />
          ))}
        </div>
      )}
    </div>
  );
};
