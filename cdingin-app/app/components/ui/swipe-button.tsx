import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SwipeButtonProps {
    onSubmit: () => void;
    text: string;
    className?: string;
}

const SLIDER_WIDTH = 56;

export default function SwipeButton({
    onSubmit,
    text,
    className = "",
}: Readonly<SwipeButtonProps>) {
    const [isSwiped, setIsSwiped] = useState(false);
    const x = useMotionValue(0);

    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

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
        (value) => `${value + SLIDER_WIDTH}px`
    );

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-14 rounded-full p-1 flex items-center select-none border border-primary bg-white overflow-hidden ${className}`}
        >
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
                <ChevronsRight className="text-white h-7 w-7" />
            </motion.div>

            <motion.p
                className="absolute w-full text-center text-primary font-semibold pointer-events-none z-20 left-4"
                style={{ opacity: textOpacity }}
            >
                {text}
            </motion.p>
        </div>
    );
}
