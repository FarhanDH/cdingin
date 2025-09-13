import { useAuth } from "~/contexts/auth.context";
import Spinner from "./ui/spinner";
import { Navigate, Outlet } from "react-router";

export default function PublicRoute() {
    const { isAuthenticated, isLoading, user } = useAuth();
    // Wait until auth status clear
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size={40} className="text-primary" />
            </div>
        );
    }

    // If user Authenticated
    if (isAuthenticated) {
        // Redirect to the /technician/orders if user is technician
        if (user?.role === "technician") {
            return <Navigate to="/technician/orders" replace />;
        }
        // Redirect to the /orders if user is customer
        return <Navigate to="/orders" replace />;
    }

    // Otherwise allows to see public page
    return <Outlet />;
}
