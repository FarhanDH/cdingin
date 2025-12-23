import { useState, useEffect } from "react";

// Define type for event 'beforeinstallprompt'
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

/**
 * A custom hook to manage the PWA installation prompt.
 * It listens for the 'beforeinstallprompt' event, saves it,
 * and provides a function to trigger the prompt manually.
 */
export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            console.log("PWA install prompt event ditangkap!");
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
        };
    }, []);

    /**
     * Triggers the saved installation prompt.
     */
    const triggerInstallPrompt = async () => {
        if (!deferredPrompt) {
            console.log("Install prompt tidak tersedia.");
            return;
        }

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Pilihan pengguna: ${outcome}`);

        setDeferredPrompt(null);
        setIsSheetOpen(false);
    };

    /**
     * Public function to show the custom install sheet.
     * Only shows it if the prompt is available.
     */
    const showInstallSheet = () => {
        if (deferredPrompt) {
            setIsSheetOpen(true);
        } else {
            console.log("Tidak bisa menampilkan sheet, prompt tidak tersedia.");
        }
    };

    return {
        isSheetOpen,
        showInstallSheet,
        closeInstallSheet: () => setIsSheetOpen(false),
        triggerInstallPrompt,
        canInstall: !!deferredPrompt,
    };
}
