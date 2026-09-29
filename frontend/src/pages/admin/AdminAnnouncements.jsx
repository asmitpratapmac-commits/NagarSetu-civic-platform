import React, { useEffect, useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { announcementApi } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { timeAgo } from '../../utils/constants';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', audience: 'all', severity: 'info' });
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await announcementApi.list();
      setAnnouncements(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await announcementApi.create(form);
      toast.success('Announcement published.');
      setForm({ title: '', message: '', audience: 'all', severity: 'info' });
      load();
    } catch (err) {
      toast.error('Failed to publish announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-medium text-char-950">Announcements</h1>

      <form onSubmit={handleSend} className="card space-y-4 p-6">
        <h2 className="font-medium text-char-950">Publish a new announcement</h2>
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea
            className="input min-h-[90px]"
            required
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Audience</label>
            <select className="input" value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
              <option value="all">Everyone</option>
              <option value="citizen">Citizens</option>
              <option value="authority">Authorities</option>
            </select>
          </div>
          <div>
            <label className="label">Severity</label>
            <select className="input" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <Button type="submit" isLoading={sending} icon={Send}>
          Publish
        </Button>
      </form>

      {loading ? (
        <div className="card h-48 animate-pulse" />
      ) : announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-char-950">{a.title}</h3>
                <span className="text-xs capitalize text-stone-500">{a.audience} · {timeAgo(a.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-sm text-stone-600">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
