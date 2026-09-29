export const CATEGORIES = [
  'Pothole',
  'Damaged Road',
  'Garbage / Sanitation',
  'Streetlight',
  'Water Leakage',
  'Water Supply',
  'Drainage',
  'Traffic',
  'Public Property Damage',
  'Other',
];

export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

export const STATUSES = [
  'Submitted',
  'AI Analyzing',
  'Assigned',
  'In Progress',
  'Pending Verification',
  'Resolved',
  'Reopened',
  'Rejected',
];

// Tailwind class pairs (bg/text) — deliberately avoids blue; uses the emerald/mint/amber/rust set.
export const STATUS_STYLES = {
  Submitted: 'bg-stone-100 text-stone-700',
  'AI Analyzing': 'bg-amber-50 text-amber-500 animate-pulse',
  Assigned: 'bg-mint-100 text-emerald-700',
  'In Progress': 'bg-amber-100 text-amber-500',
  'Pending Verification': 'bg-emerald-50 text-emerald-600',
  Resolved: 'bg-emerald-500 text-white',
  Reopened: 'bg-rust-400/10 text-rust-500',
  Rejected: 'bg-stone-200 text-stone-500',
};

export const SEVERITY_STYLES = {
  Critical: 'bg-rust-500 text-white',
  High: 'bg-amber-300 text-char-900',
  Medium: 'bg-mint-200 text-emerald-800',
  Low: 'bg-stone-100 text-stone-600',
};

export const SLA_HOURS_LABEL = {
  Critical: '24 hours',
  High: '3 days',
  Medium: '7 days',
  Low: '14 days',
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [label, secs] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};
