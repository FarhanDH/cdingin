import { client } from "./client";
import { UserResponse } from "../types/auth";

export const sendOtp = async (email: string) => {
    return client.post("/email/send-otp", { email });
};

export const verifyOtp = async (email: string, otp: string) => {
    return client.post<{ data: UserResponse }>("/auth/verify-otp", { email, otp });
};

export const registerCustomer = async (data: { email: string; fullName: string; phoneNumber: string }) => {
    return client.post<{ data: UserResponse }>("/auth/register-customer-profile", data);
};
