import PersonIcon from "@mui/icons-material/Person";
import { IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth.context";

export default function Header({
    isSticky = false,
    showProfile = false,
    showBack = false,
    navigateTo = "/",
    title,
    onBack,
    showBorder = true,
    className = "",
    children,
}: Readonly<{
    isSticky?: boolean;
    showProfile?: boolean;
    showBorder?: boolean;
    showBack?: boolean;
    navigateTo?: string;
    onBack?: () => void;
    className?: string;
    title: string;
    children?: React.ReactNode;
}>) {
    const { user } = useAuth();
    let navigateToProfile = "/";
    const navigate = useNavigate();

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
                }  top-0 left-0 right-0 max-w-lg mx-auto border-b-gray-300 z-40 text-lg ${
                    showBorder && "border-b shadow-sm"
                } ` + className
            }
        >
            <div
                className={`flex items-center justify-between mb- px-4 pt-4 pb-2 `}
            >
                <div className={`flex items-center gap-3`}>
                    {showBack && (
                        <IconButton
                            size="small"
                            className="m-0"
                            onClick={onBack ?? (() => navigate(navigateTo))}
                        >
                            <ArrowLeft size={24} className="text-gray-800" />
                        </IconButton>
                    )}
                    <h1 className={`font-semibold `}>{title}</h1>
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
