import { Day, type DayProps } from "react-day-picker"; // <-- 1. Impor Day dan DayProps yang benar
import { Badge } from "./badge";

/**
 * CustomDay component to render each day in the calendar.
 * It wraps the original Day component to add a "Penuh" (Full) badge
 * when a day is marked with the 'full' modifier.
 */
export default function CustomDay(props: DayProps) {
    // Destructure props to get the 'full' modifier from the DayPicker's modifiers.
    // This 'full' modifier is set to true if the date is in the 'fullyBookedDates' array.
    const isFullyBooked = props.modifiers.full;

    return (
        // Use a div as a wrapper to control the positioning of the badge relative to the day.
        <div className="relative rounded-lg w-full flex flex-col items-center justify-center]">
            {/* Render the original <Day> component from 'react-day-picker' to maintain its core functionality and appearance. */}
            <Day {...props} />

            {/* Conditionally render the Badge component if the 'isFullyBooked' flag is true. */}
            {isFullyBooked && (
                <Badge
                    variant="destructive"
                    className="absolute bottom-0 text-[10px] h-3 px-1 leading-none"
                >
                    Penuh
                </Badge>
            )}
        </div>
    );
}
