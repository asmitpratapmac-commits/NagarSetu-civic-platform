import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    {Icon && (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <Icon size={22} />
      </div>
    )}
    <div>
      <p className="font-medium text-char-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>}
    </div>
    {action}
  </div>
);
