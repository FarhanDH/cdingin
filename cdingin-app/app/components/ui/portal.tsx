import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: React.ReactNode;
}

/**
 * A component that teleports its children to the end of the document body.
 * Useful for modals, dialogs, and sheets to escape stacking context issues.
 */
export default function Portal({ children }: PortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Only render the portal on the client-side after the component has mounted.
    // This prevents issues with Server-Side Rendering (SSR).
    return mounted ? createPortal(children, document.body) : null;
}
