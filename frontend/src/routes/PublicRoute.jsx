import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
  const { tokens } = useAuth();
  return tokens ? <Navigate to="/feed" replace /> : <Outlet />;
}
