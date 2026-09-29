import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../redux/slices/notificationSlice';
import { toggleNotificationPanel, closeNotificationPanel } from '../redux/slices/uiSlice';
import { timeAgo } from '../utils/constants';

export const NotificationBell = () => {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const isOpen = useSelector((state) => state.ui.isNotificationPanelOpen);
  const panelRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 8 }));
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        dispatch(closeNotificationPanel());
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => dispatch(toggleNotificationPanel())}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-char-700 hover:bg-stone-100"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rust-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-stone-200 bg-white shadow-raised">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <p className="font-medium text-char-950">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => dispatch(markAllNotificationsRead())}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-stone-500">You're all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.isRead && dispatch(markNotificationRead(n._id))}
                  className={`block w-full border-b border-stone-50 px-4 py-3 text-left last:border-0 hover:bg-stone-50 ${
                    !n.isRead ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-char-900">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{n.message}</p>
                  <p className="mt-1 text-[11px] text-stone-400">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => dispatch(closeNotificationPanel())}
            className="block border-t border-stone-100 px-4 py-2.5 text-center text-sm font-medium text-emerald-600 hover:bg-stone-50"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};
