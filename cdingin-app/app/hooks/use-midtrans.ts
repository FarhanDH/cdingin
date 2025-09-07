import { useState, useEffect } from "react";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";

declare global {
    interface Window {
        snap: any;
    }
}

export function useMidtrans() {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        const midtransScriptUrl =
            "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

        if (document.getElementById("midtrans-snap-script")) {
            setIsScriptLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "midtrans-snap-script";
        script.src = midtransScriptUrl;
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => {
            setIsScriptLoaded(true);
            console.log("Midtrans Snap script loaded successfully.");
        };
        script.onerror = () => {
            console.error("Failed to load Midtrans Snap script.");
        };

        document.head.appendChild(script);

        return () => {
            const existingScript = document.getElementById(
                "midtrans-snap-script"
            );
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };
    }, []);

    const pay = (
        snapToken: string,
        callbacks?: {
            onSuccess?: (result: any) => void;
            onPending?: (result: any) => void;
            onError?: (result: any) => void;
            onClose?: () => void;
        }
    ) => {
        if (!isScriptLoaded || !window.snap) {
            toast(
                "Layanan pembayaran sedang tidak tersedia. Coba lagi nanti.",
                customToastStyle
            );
            return;
        }

        // Tampilkan popup
        window.snap.pay(snapToken, callbacks);
    };

    /**
     * Metode baru untuk menyematkan Snap ke dalam elemen HTML tertentu.
     * @param snapToken - The transaction token received from the backend.
     * @param embedId - The ID of the HTML element where Snap will be embedded.
     * @param callbacks - Optional callback functions.
     */
    const embed = (
        snapToken: string,
        embedId: string,
        callbacks?: {
            onSuccess?: (result: any) => void;
            onPending?: (result: any) => void;
            onError?: (result: any) => void;
            onClose?: () => void;
        }
    ) => {
        if (!isScriptLoaded || !window.snap) {
            toast(
                "Layanan pembayaran sedang tidak tersedia. Coba lagi nanti.",
                customToastStyle
            );
            return;
        }

        const targetElement = document.getElementById(embedId);
        if (!targetElement) {
            toast(
                `Elemen dengan ID "${embedId}" tidak ditemukan.`,
                customToastStyle
            );
            return;
        }

        window.snap.embed(snapToken, {
            embedId: embedId,
            onSuccess: callbacks?.onSuccess,
            onPending: callbacks?.onPending,
            onError: callbacks?.onError,
            onClose: callbacks?.onClose,
        });
    };

    const reloadSnapScript = () => {
        const existing = document.getElementById("midtrans-snap-script");
        if (existing) {
            document.head.removeChild(existing);
            delete window.snap; // reset instance lama
        }

        const script = document.createElement("script");
        script.id = "midtrans-snap-script";
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute(
            "data-client-key",
            import.meta.env.VITE_MIDTRANS_CLIENT_KEY
        );
        script.onload = () => setIsScriptLoaded(true);
        document.head.appendChild(script);
    };

    return { pay, embed, isScriptLoaded, reloadSnapScript };
}
