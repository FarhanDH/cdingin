import GlobalStyles from "@mui/material/GlobalStyles";
import { StyledEngineProvider } from "@mui/material/styles";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Toaster } from "sonner";
import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/auth.context";
import NotFoundPage from "./pages/not-found";

export const links: Route.LinksFunction = () => [
    { rel: "icon", href: "/icon-192x192.png" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    // Outfit font
    // {
    //     rel: "stylesheet",
    //     href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
    // },

    // Rubik font
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <div className="min-h-screen max-w-lg mx-auto border-2 border-gray-100">
                    {children}
                </div>
                <Toaster
                    position="top-center"
                    className="bg-gray-100 text-center text-lg"
                />
                <ScrollRestoration />
                <Scripts />
                <script>var global = global || window;</script>
            </body>
        </html>
    );
}

export default function App() {
    return (
        <StyledEngineProvider enableCssLayer>
            <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        </StyledEngineProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    return <NotFoundPage />;
}
