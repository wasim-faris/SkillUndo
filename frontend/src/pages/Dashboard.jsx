import { Navigate } from 'react-router-dom';

// Dashboard redirects to Profile — same page, different route
export default function Dashboard() {
  return <Navigate to="/profile" replace />;
}
