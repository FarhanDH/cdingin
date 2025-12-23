import axios from "axios";

// Access env variables in Expo via process.env or expo-constants if configured
// For now, hardcoding or using a placeholder. 
// In a real app, use expo-constants for environment variables.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here
        return Promise.reject(error);
    }
);
