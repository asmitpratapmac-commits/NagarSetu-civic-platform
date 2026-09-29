import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { auditLogApi } from '../../api';
import { EmptyState } from '../../components/EmptyState';
import { formatDateTime } from '../../utils/constants';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await auditLogApi.list({ limit: 50 });
        setLogs(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-medium text-char-950">Audit logs</h1>

      {loading ? (
        <div className="card h-64 animate-pulse" />
      ) : logs.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No audit events yet" description="Sensitive actions like status overrides and user management will be logged here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Target</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-stone-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-char-900">{log.action}</td>
                  <td className="px-5 py-3 text-stone-600">{log.actor?.name || 'System'}</td>
                  <td className="px-5 py-3 text-stone-600">{log.targetType}</td>
                  <td className="px-5 py-3 text-stone-600">{log.reason || '—'}</td>
                  <td className="px-5 py-3 text-stone-500">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
