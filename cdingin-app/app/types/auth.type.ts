export type UserResponse = {
  isNewUser?: boolean;
  user: {
    id?: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
};

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserResponse['user'] | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
}
