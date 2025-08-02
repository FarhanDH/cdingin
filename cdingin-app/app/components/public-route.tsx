import { useAuth } from '~/contexts/auth.context';
import Spinner from './ui/spinner';
import { Navigate, Outlet } from 'react-router';

export default function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  // Wait until auth status clear
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} />
      </div>
    );
  }

  // If user Authenticated
  if (isAuthenticated) {
    // Redirect to the /orders
    return <Navigate to="/orders" replace />;
  }

  // Otherwise allows to see public page
  return <Outlet />;
}
