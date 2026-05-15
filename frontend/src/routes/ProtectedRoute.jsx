import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { tokens } = useAuth();
  return tokens ? <Outlet /> : <Navigate to="/login" replace />;
}
