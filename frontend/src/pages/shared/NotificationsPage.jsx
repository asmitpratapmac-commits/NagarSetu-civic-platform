import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../redux/slices/notificationSlice';
import { EmptyState } from '../../components/EmptyState';
import { timeAgo } from '../../utils/constants';
import { Button } from '../../components/Button';

export const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, status } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-char-950">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={() => dispatch(markAllNotificationsRead())}>
            Mark all read
          </Button>
        )}
      </div>

      {status === 'loading' ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You'll see complaint updates and announcements here." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && dispatch(markNotificationRead(n._id))}
              className={`card block w-full p-4 text-left ${!n.isRead ? 'border-emerald-200 bg-emerald-50/40' : ''}`}
            >
              <p className="font-medium text-char-950">{n.title}</p>
              <p className="mt-1 text-sm text-stone-600">{n.message}</p>
              <p className="mt-1.5 text-xs text-stone-400">{timeAgo(n.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
