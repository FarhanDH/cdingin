// src/components/ui/swipe-button.tsx

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { useState, useRef, useEffect } from "react"; // <-- 1. Impor useRef dan useEffect

interface SwipeButtonProps {
    onSubmit: () => void;
    text: string;
    className?: string;
}

// Definisikan ukuran slider sebagai konstanta agar mudah diubah
const SLIDER_WIDTH = 56; // Lebar slider dalam piksel (w-14)

export default function SwipeButton({
    onSubmit,
    text,
    className = "",
}: Readonly<SwipeButtonProps>) {
    const [isSwiped, setIsSwiped] = useState(false);
    const x = useMotionValue(0);

    // --- LANGKAH 1: Setup untuk pengukuran dinamis ---
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- LANGKAH 2: Ukur lebar container setelah render ---
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []); // Jalankan hanya sekali saat komponen pertama kali dimuat

    // --- LANGKAH 3: Hitung nilai dinamis ---
    // Batas geser maksimum adalah lebar container dikurangi lebar slider itu sendiri
    // dan sedikit padding.
    const maxDrag = containerWidth > 0 ? containerWidth - SLIDER_WIDTH - 8 : 0;
    // Anggap swipe berhasil jika digeser lebih dari 70% dari jarak maksimum
    const swipeThreshold = maxDrag * 0.7;

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
    // Lebar progress sekarang juga dinamis
    const progressWidth = useTransform(
        x,
        (value) => `${value + SLIDER_WIDTH}px`
    );

    return (
        // Tambahkan ref ke div utama
        <div
            ref={containerRef}
            className={`relative w-full h-14 rounded-full p-1 flex items-center select-none border border-primary bg-white overflow-hidden ${className}`}
        >
            {/* Lapisan pengisi (tidak perlu diubah) */}
            <motion.div
                className="absolute left-1 h-12 bg-primary rounded-full"
                style={{ width: progressWidth }}
            />

            {/* Slider (gunakan nilai dinamis) */}
            <motion.div
                className="relative w-17 h-12 bg-primary rounded-full flex justify-center items-center shadow-md cursor-grab active:cursor-grabbing z-10"
                drag="x"
                // Gunakan nilai maxDrag yang sudah dihitung
                dragConstraints={{ left: 0, right: maxDrag }}
                style={{ x }}
                onDragEnd={handleDragEnd}
                dragMomentum={!isSwiped}
            >
                <ChevronsRight className="text-white h-7 w-7" />
            </motion.div>

            {/* Teks (tidak perlu diubah) */}
            <motion.p
                className="absolute w-full text-center text-primary font-semibold pointer-events-none z-20 left-4"
                style={{ opacity: textOpacity }}
            >
                {text}
            </motion.p>
        </div>
    );
}
