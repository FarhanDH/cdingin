import { CircularProgress } from "@mui/material";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/contexts/auth.context";

export default function PublicRoute() {
    const { isAuthenticated, isLoading, user } = useAuth();
    // Wait until auth status clear
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress size={40} className="text-primary" />
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
