import { useEffect, useRef } from "react";
import { addDays, format, isToday, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import "~/app.css";

interface DateScrollerProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

/**
 * A horizontal, scrollable date picker component.
 * It displays a range of dates and highlights the selected one.
 */
export default function HorizontalDateScroller({
    selectedDate,
    onDateSelect,
}: Readonly<DateScrollerProps>) {
    const scrollerRef = useRef<HTMLDivElement>(null);

    // Generate a list of dates from 14 days ago up to today.
    const dates = Array.from({ length: 15 }).map((_, i) =>
        addDays(new Date(), i - 14)
    );

    // Effect to scroll the selected date into the center of the view.
    useEffect(() => {
        const selectedElement = document.getElementById(
            `date-${format(selectedDate, "yyyy-MM-dd")}`
        );
        if (selectedElement && scrollerRef.current) {
            const scrollContainer = scrollerRef.current;
            const elementLeft = selectedElement.offsetLeft;
            const elementWidth = selectedElement.offsetWidth;
            const containerWidth = scrollContainer.offsetWidth;

            // Calculate the scroll position to center the element
            const scrollLeft =
                elementLeft - containerWidth / 2 + elementWidth / 2;

            scrollContainer.scrollTo({
                left: scrollLeft,
                behavior: "smooth",
            });
        }
    }, [selectedDate]);

    return (
        <div
            ref={scrollerRef}
            className="flex items-center space-x-6 overflow-x-auto px-4 py-2 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollSnapType: "x mandatory" }}
        >
            {dates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isCurrentDay = isToday(date);

                return (
                    <div
                        key={date.toISOString()}
                        className="flex flex-col items-center"
                    >
                        <button
                            key={date.toISOString()}
                            id={`date-${format(date, "yyyy-MM-dd")}`}
                            onClick={() => onDateSelect(date)}
                            // Style for each date item
                            className={`flex-shrink-0 text-center w-9 h-9 cursor-pointer rounded-full transition-colors duration-200 ${
                                isSelected
                                    ? "bg-primary text-white rounded-full"
                                    : "text-gray-600"
                            }`}
                            style={{ scrollSnapAlign: "center" }}
                        >
                            <p
                                className={`text-sm font-medium ${
                                    isSelected ? "" : "text-gray-800"
                                }`}
                            >
                                {format(date, "d")}
                            </p>
                        </button>
                        <p
                            className={`text-sm w-full text-center ${
                                isSelected
                                    ? "text-primary font-medium "
                                    : "text-gray-700"
                            }`}
                        >
                            {isCurrentDay
                                ? "Hari ini"
                                : format(date, "EEE", { locale: id })}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
