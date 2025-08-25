import axios from "axios";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { AuthContextType, UserResponse } from "~/types/auth.type";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            // Panggil endpoint yang dilindungi untuk memeriksa status login
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/users/me`,
                {
                    withCredentials: true,
                },
            );

            if (response.status === 200) {
                setUser(response.data.data);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const authContextValue = useMemo(
        () => ({ isAuthenticated, user, isLoading, checkAuthStatus }),
        [isAuthenticated, user, isLoading, checkAuthStatus],
    );

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
