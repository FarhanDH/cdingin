import type { InvoiceResponse } from "./invoice.types";

export type MidtransTokenResponse = {
    token: string;
    redirect_url: string;
};

type MidtransAction = {
    name: string;
    method: string;
    url: string;
};

export type Payment = {
    id: string;
    invoice: InvoiceResponse;
    status: string;
    amount: number;
    method: string;
    gateway_response: object;
    va_number: string;
    bank: string;
    qr_code_url: string;
    actions: MidtransAction[];
    expiry_time: string;
    created_at: Date;
    updated_at: Date;
};
