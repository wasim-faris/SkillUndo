import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLandingPath } from '../utils/admin';

export default function PublicRoute() {
  const { tokens, user, loading } = useAuth();

  if (tokens && (loading || !user)) {
    return (
      <div className="min-h-screen grid place-items-center px-4 text-center text-sm text-[var(--text-secondary)]">
        Loading your account...
      </div>
    );
  }

  if (tokens && user) {
    return <Navigate to={getLandingPath(user)} replace />;
  }

  return <Outlet />;
}
