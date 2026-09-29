import React from 'react';

export const CardSkeleton = () => (
  <div className="card animate-pulse p-5">
    <div className="h-4 w-2/3 rounded bg-stone-200" />
    <div className="mt-3 h-3 w-full rounded bg-stone-100" />
    <div className="mt-2 h-3 w-5/6 rounded bg-stone-100" />
    <div className="mt-4 flex gap-2">
      <div className="h-6 w-16 rounded-full bg-stone-100" />
      <div className="h-6 w-16 rounded-full bg-stone-100" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card animate-pulse p-5">
    <div className="h-3 w-1/2 rounded bg-stone-200" />
    <div className="mt-3 h-8 w-1/3 rounded bg-stone-100" />
  </div>
);
