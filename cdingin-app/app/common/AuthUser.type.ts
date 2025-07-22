export type AuthUser = {
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
