import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Usage: <Route element={<RoleRoute allowed={['admin']} />}>...</Route>
 * Must be nested inside <ProtectedRoute /> so `user` is guaranteed to exist.
 */
export const RoleRoute = ({ allowed = [] }) => {
  const { role } = useAuth();

  if (!allowed.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return <Outlet />;
};
