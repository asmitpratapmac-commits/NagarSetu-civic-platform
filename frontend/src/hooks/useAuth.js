import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, accessToken, status, error } = useSelector((state) => state.auth);
  return {
    user,
    isAuthenticated: Boolean(user && accessToken),
    role: user?.role,
    status,
    error,
  };
};
