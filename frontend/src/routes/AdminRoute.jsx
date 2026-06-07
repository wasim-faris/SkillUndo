import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
    const { tokens, user, loading } = useAuth();

    if (!tokens) {
        return <Navigate to="/login" replace />;
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen grid place-items-center px-4 text-center text-sm text-[var(--text-secondary)]">
                Loading admin workspace...
            </div>
        );
    }

    if (!user?.is_staff) {
        return <Navigate to="/matches" replace />;
    }

    return <Outlet />;
}
