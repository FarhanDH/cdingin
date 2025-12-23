import * as SecureStore from 'expo-secure-store';

const AUTH_KEY = 'auth_data';

export interface AuthData {
    accessToken: string;
    role: 'customer' | 'technician';
    userName?: string; // Optional: store name to welcome user back
}

export const saveAuthData = async (data: AuthData) => {
    try {
        await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving auth data:', error);
    }
};

export const getAuthData = async (): Promise<AuthData | null> => {
    try {
        const data = await SecureStore.getItemAsync(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting auth data:', error);
        return null;
    }
};

export const clearAuthData = async () => {
    try {
        await SecureStore.deleteItemAsync(AUTH_KEY);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};
