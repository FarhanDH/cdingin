import { Navigate, Outlet } from 'react-router';
import { useAuth } from '~/contexts/auth.context';
import NotFoundPage from '~/pages/not-found';
import Spinner from './ui/spinner';

type UserRole = 'customer' | 'technician';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
}

export default function RoleBasedRoute({ allowedRoles }: RoleBasedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Wait until authentication clear
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} />
      </div>
    );
  }

  // If not logged in, throw to /
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  //   Is the role in the list of allowed role
  const isAuthorized = user && allowedRoles.includes(user.role);

  // If the role does not match, display a "Not Found" page.
  if (!isAuthorized) {
    return <NotFoundPage />;
  }

  // If all checks pass, allow access
  return <Outlet />;
}
