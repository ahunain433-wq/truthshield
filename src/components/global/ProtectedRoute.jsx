import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../ui/loader';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!currentUser) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userData?.role !== 'admin') {
    // User not admin, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;