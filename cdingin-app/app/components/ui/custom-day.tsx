import { Day, type DayProps } from "react-day-picker";
import { Badge } from "./badge";

/**
 * CustomDay component to render each day in the calendar.
 * It wraps the original Day component to add badges for different states.
 * - "Libur" (Holiday) for Sundays.
 * - "Penuh" (Full) for fully booked dates.
 */
export default function CustomDay(props: DayProps) {
    const isFullyBooked = props.modifiers.full;
    const isSunday = props.day.date ? props.day.date.getDay() === 0 : false;

    let badgeContent = null;

    if (isSunday) {
        badgeContent = (
            <Badge
                variant="secondary"
                className="absolute bottom-0 text-[10px] h-3 px-1 leading-none text-white"
            >
                Libur
            </Badge>
        );
    } else if (isFullyBooked) {
        badgeContent = (
            <Badge
                variant="destructive"
                className="absolute bottom-0 text-[10px] h-3 px-1 leading-none"
            >
                Penuh
            </Badge>
        );
    }

    return (
        <div className="relative rounded-lg w-full flex flex-col items-center justify-center">
            <Day {...props} />
            {badgeContent}
        </div>
    );
}
