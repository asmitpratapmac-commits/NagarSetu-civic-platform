import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { StatusBadge, SeverityBadge } from './Badges';
import { timeAgo } from '../utils/constants';

export const ComplaintCard = ({ complaint, basePath = '/complaints' }) => {
  const isOverdue = complaint.isOverdue && !['Resolved', 'Rejected'].includes(complaint.status);

  return (
    <Link
      to={`${basePath}/${complaint._id}`}
      className="card block p-4 transition-shadow hover:shadow-raised sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-char-950">{complaint.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{complaint.description}</p>
        </div>
        {complaint.media?.[0] && (
          <img
            src={complaint.media[0].url}
            alt=""
            className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={complaint.status} />
        <SeverityBadge severity={complaint.severity} />
        {isOverdue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rust-500/10 px-2.5 py-1 text-xs font-medium text-rust-500">
            <Clock size={12} /> Overdue
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1 truncate">
          <MapPin size={12} /> {complaint.address || 'Location on map'}
        </span>
        <span className="flex-shrink-0">{timeAgo(complaint.createdAt)}</span>
      </div>
    </Link>
  );
};
