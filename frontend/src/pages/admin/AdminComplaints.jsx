import React, { useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintCard } from '../../components/ComplaintCard';
import { ListSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { STATUSES, SEVERITIES, CATEGORIES } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', severity: '', category: '', search: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page: filters.page, limit: 12 };
        if (filters.status) params.status = filters.status;
        if (filters.severity) params.severity = filters.severity;
        if (filters.category) params.category = filters.category;
        if (debouncedSearch) params.search = debouncedSearch;
        const { data } = await complaintApi.listAll(params);
        setComplaints(data.data);
        setMeta(data.meta);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters.status, filters.severity, filters.category, filters.page, debouncedSearch]);

  const updateFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-medium text-char-950">All complaints</h1>

      <div className="card flex flex-wrap gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            className="input pl-9"
            placeholder="Search title or description..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          />
        </div>
        <select className="input w-40" value={filters.status} onChange={(e) => updateFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input w-36" value={filters.severity} onChange={(e) => updateFilter('severity', e.target.value)}>
          <option value="">All severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className="input w-44" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ListSkeleton count={9} />
      ) : complaints.length === 0 ? (
        <EmptyState icon={FileText} title="No complaints match these filters" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} basePath="/admin/complaints" />
            ))}
          </div>
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: meta.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${
                    meta.page === i + 1 ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
