import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../api';

const COLORS = ['#2E8055', '#E8A33D', '#8F3D2B', '#847C64', '#68C08D', '#B7E4C7', '#A9A28C', '#4A4536', '#F3C879', '#6FC08C'];

export const AdminAnalytics = () => {
  const [category, setCategory] = useState([]);
  const [severity, setSeverity] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, sevRes, deptRes] = await Promise.all([
          analyticsApi.categoryDistribution(),
          analyticsApi.severityDistribution(),
          analyticsApi.departmentPerformance(),
        ]);
        setCategory(catRes.data.data.map((d) => ({ name: d._id, value: d.count })));
        setSeverity(sevRes.data.data.map((d) => ({ name: d._id, value: d.count })));
        setDepartments(deptRes.data.data.map((d) => ({ name: d.code, resolved: d.performance.totalResolved, assigned: d.performance.totalAssigned })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="card h-96 animate-pulse" />;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-medium text-char-950">Analytics</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-medium text-char-950">Category distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={category} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {category.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-medium text-char-950">Severity distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severity} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {severity.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-medium text-char-950">Department performance</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D5" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="assigned" fill="#A9A28C" radius={[4, 4, 0, 0]} name="Assigned" />
              <Bar dataKey="resolved" fill="#2E8055" radius={[4, 4, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
