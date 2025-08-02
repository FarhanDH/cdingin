import { Navigate, Outlet } from 'react-router';
import Spinner from './ui/spinner';
import { useAuth } from '~/contexts/auth.context';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Tampilkan loading spinner saat status auth sedang diperiksa
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Jika tidak terautentikasi, redirect ke halaman auth
    return <Navigate to="/" replace />;
  }

  // Jika terautentikasi, tampilkan konten halaman
  return <Outlet />;
}
