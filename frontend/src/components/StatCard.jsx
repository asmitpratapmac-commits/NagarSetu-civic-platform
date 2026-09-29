import React from 'react';

export const StatCard = ({ label, value, icon: Icon, accent = 'emerald', trend }) => {
  const accentClass = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-500',
    rust: 'bg-rust-400/10 text-rust-500',
    stone: 'bg-stone-100 text-stone-600',
  }[accent];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-display font-medium text-char-950">{value}</p>
          {trend && <p className="mt-1 text-xs text-stone-500">{trend}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
};
