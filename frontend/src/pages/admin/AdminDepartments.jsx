import React, { useEffect, useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { departmentApi } from '../../api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { CATEGORIES } from '../../utils/constants';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', categories: [] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await departmentApi.list();
      setDepartments(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await departmentApi.create(form);
      toast.success('Department created.');
      setForm({ name: '', code: '', categories: [] });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-char-950">Departments</h1>
        <Button onClick={() => setShowForm((s) => !s)} icon={showForm ? X : Plus}>
          {showForm ? 'Cancel' : 'New Department'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Code</label>
              <input
                className="input"
                required
                placeholder="e.g. ROADS"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>
          <div>
            <label className="label">Handles categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    form.categories.includes(cat)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" isLoading={saving}>
            Create Department
          </Button>
        </form>
      )}

      {loading ? (
        <div className="card h-48 animate-pulse" />
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create your first department to start routing complaints." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-char-950">{d.name}</h3>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{d.code}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.categories.map((c) => (
                  <span key={c} className="rounded-full bg-mint-100 px-2 py-0.5 text-xs text-emerald-700">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
                <span>Assigned: <b className="text-char-900">{d.performance?.totalAssigned || 0}</b></span>
                <span>Resolved: <b className="text-char-900">{d.performance?.totalResolved || 0}</b></span>
                <span>Overdue: <b className="text-char-900">{d.performance?.overdueCount || 0}</b></span>
                <span>Avg hrs: <b className="text-char-900">{d.performance?.avgResolutionHours || 0}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
