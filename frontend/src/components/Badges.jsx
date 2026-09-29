import React from 'react';
import { STATUS_STYLES, SEVERITY_STYLES } from '../utils/constants';

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      STATUS_STYLES[status] || 'bg-stone-100 text-stone-700'
    }`}
  >
    {status}
  </span>
);

export const SeverityBadge = ({ severity }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      SEVERITY_STYLES[severity] || 'bg-stone-100 text-stone-700'
    }`}
  >
    {severity}
  </span>
);
