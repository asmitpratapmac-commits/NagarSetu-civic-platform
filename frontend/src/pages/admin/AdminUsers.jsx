import React, { useEffect, useState } from 'react';
import { Users, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../api';
import { EmptyState } from '../../components/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 400);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (role) params.role = role;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await userApi.list(params);
      setUsers(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, debouncedSearch]);

  const toggleActive = async (user) => {
    try {
      await userApi.setActiveStatus(user._id, !user.isActive);
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}.`);
      load();
    } catch (err) {
      toast.error('Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-medium text-char-950">Users</h1>

      <div className="card flex flex-wrap gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="input pl-9" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="citizen">Citizen</option>
          <option value="authority">Authority</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="card h-64 animate-pulse" />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-xs uppercase tracking-wide text-stone-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-stone-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-char-900">{u.name}</td>
                  <td className="px-5 py-3 text-stone-600">{u.email}</td>
                  <td className="px-5 py-3 capitalize text-stone-600">{u.role}</td>
                  <td className="px-5 py-3 text-stone-600">{u.department?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(u)} className="text-stone-400 hover:text-emerald-600">
                      {u.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
