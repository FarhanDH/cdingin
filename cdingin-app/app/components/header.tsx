import PersonIcon from "@mui/icons-material/Person";
import { IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "~/contexts/auth.context";

export default function Header({
    isSticky = false,
    showProfile = false,
    showBack = false,
    navigateTo = "/",
    title,
    showBorder = true,
    className = "",
    children,
}: Readonly<{
    isSticky?: boolean;
    showProfile?: boolean;
    showBorder?: boolean;
    showBack?: boolean;
    navigateTo?: string;
    className?: string;
    title: string;
    children?: React.ReactNode;
}>) {
    const { user } = useAuth();
    let navigateToProfile = "/";

    if (user?.role === "technician") {
        navigateToProfile = "/technician/profile";
    } else {
        navigateToProfile = "/profile";
    }

    return (
        <div
            className={
                `${
                    isSticky ? "sticky" : ""
                }  top-0 left-0 right-0 max-w-lg mx-auto px-4 pt-4 pb-2 border-b-gray-300 z-40 ${
                    showBorder && "border-b shadow-sm"
                } ` + className
            }
        >
            <div className={`flex items-center justify-between mb-2`}>
                <div className={`flex items-center gap-3`}>
                    {showBack && (
                        <Link to={navigateTo}>
                            <IconButton size="small" className="m-0">
                                <ArrowLeft
                                    size={24}
                                    className="text-gray-800"
                                />
                            </IconButton>
                        </Link>
                    )}
                    <h1 className={`text-lg font-semibold `}>{title}</h1>
                </div>
                {showProfile && (
                    <Link to={navigateToProfile}>
                        <IconButton
                            size="small"
                            className="m-0 border border-gray-300"
                        >
                            <PersonIcon className="text-primary" />
                        </IconButton>
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}
