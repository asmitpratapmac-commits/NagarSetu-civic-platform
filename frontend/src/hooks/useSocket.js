import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import { connectSocket, disconnectSocket } from '../services/socketService';
import { notificationReceived } from '../redux/slices/notificationSlice';
import { complaintPatched } from '../redux/slices/complaintSlice';

/**
 * Mount once near the app root (inside a layout, after auth is known).
 * Wires Socket.IO events into Redux so the UI updates live without polling.
 */
export const useSocket = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const accessToken = localStorage.getItem('accessToken');
    const socket = connectSocket(accessToken);

    socket.on('notification:new', (notification) => {
      dispatch(notificationReceived(notification));
      toast(notification.title, { icon: '🔔' });
    });

    socket.on('complaint:status_changed', ({ complaintId, status }) => {
      dispatch(complaintPatched({ complaintId, patch: { status } }));
    });

    socket.on('complaint:assigned', () => {
      // Lists refresh on next fetch; a toast is enough for immediate feedback.
      toast('A complaint was assigned.', { icon: '📌' });
    });

    socket.on('announcement:new', (announcement) => {
      toast(announcement.title, { icon: '📣', duration: 6000 });
    });

    return () => {
      socket.off('notification:new');
      socket.off('complaint:status_changed');
      socket.off('complaint:assigned');
      socket.off('announcement:new');
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch]);
};
