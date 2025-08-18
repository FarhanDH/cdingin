import {
    motion,
    useMotionValue,
    useTransform,
    animate,
    useMotionValueEvent,
} from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import "~/app.css";
import Spinner from "./spinner";

interface SwipeButtonProps {
    onSubmit: () => void;
    isLoading?: boolean;
    text: string;
    className?: string;
}

const SLIDER_WIDTH = 56;

export default function SwipeButton({
    onSubmit,
    text,
    isLoading = false,
    className = "",
}: Readonly<SwipeButtonProps>) {
    const [isSwiped, setIsSwiped] = useState(false);
    const x = useMotionValue(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    useMotionValueEvent(x, "change", (latest) => {
        setIsDragging(latest > 0);
    });

    const maxDrag = containerWidth > 0 ? containerWidth - SLIDER_WIDTH - 8 : 0;

    const swipeThreshold = maxDrag * 0.8;

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > swipeThreshold) {
            setIsSwiped(true);
            onSubmit();
            setTimeout(() => {
                animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
                setIsSwiped(false);
            }, 800);
        } else {
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
    };

    const textOpacity = useTransform(x, [0, 100], [1, 0]);

    const progressWidth = useTransform(
        x,
        (value) => `${value + SLIDER_WIDTH}px`,
    );

    const iconScale = useTransform(x, [0, maxDrag], [1, 1.2]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-14 rounded-full p-1 flex items-center select-none border border-primary bg-white overflow-hidden ${className}`}
        >
            {isLoading ? (
                <Spinner size={20} className="text-primary" />
            ) : (
                <>
                    <motion.div
                        className="absolute left-1 h-12 bg-primary rounded-full"
                        style={{ width: progressWidth }}
                    />

                    <motion.div
                        className="relative w-17 h-12 bg-primary rounded-full flex justify-center items-center shadow-md cursor-grab active:cursor-grabbing z-10"
                        drag="x"
                        dragConstraints={{ left: 0, right: maxDrag }}
                        style={{ x }}
                        onDragEnd={handleDragEnd}
                        dragMomentum={!isSwiped}
                    >
                        <motion.div style={{ scale: iconScale }}>
                            <ChevronsRight
                                className={`text-white h-7 w-7 ${
                                    !isDragging
                                        ? "animate-slide-right-loop"
                                        : ""
                                }`}
                            />
                        </motion.div>
                    </motion.div>

                    <motion.p
                        className="absolute w-full text-center text-primary font-semibold pointer-events-none z-20 left-4"
                        // style={{ opacity: textOpacity }}
                    >
                        {text}
                    </motion.p>
                </>
            )}
        </div>
    );
}
