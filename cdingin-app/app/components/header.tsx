import { IconButton } from "@mui/material";
import { ArrowLeft, Menu } from "lucide-react";
import { Link } from "react-router";

export default function Header({
    isSticky = false,
    showBack = false,
    navigateTo = "/",
    title,
    showBorder = true,
    children,
}: Readonly<{
    isSticky?: boolean;
    showBorder?: boolean;
    showBack?: boolean;
    navigateTo?: string;
    title: string;
    children?: React.ReactNode;
}>) {
    return (
        <div
            className={`${
                isSticky ? "sticky" : ""
            } top-0 bg-white px-4 pt-4 pb-2 border-b-gray-300 z-40 ${
                showBorder && "border-b"
            }`}
        >
            <div className={`flex items-center justify-between mb-2`}>
                <div className={`flex items-center gap-3`}>
                    {showBack && (
                        <Link to={navigateTo}>
                            <IconButton size="small" className="m-0">
                                <ArrowLeft
                                    size={24}
                                    className="text-gray-500"
                                />
                            </IconButton>
                        </Link>
                    )}
                    <h1 className={`text-lg font-semibold `}>{title}</h1>
                </div>
                {/* {showSidebar && <} */}
            </div>
            {children}
        </div>
    );
}
