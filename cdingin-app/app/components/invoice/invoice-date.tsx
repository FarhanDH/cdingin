import { formattedDate } from "~/common/utils";

/**
 * A reusable component for displaying key invoice dates.
 */
export const DateInfo = ({ label, date }: { label: string; date: Date }) => (
    <div className="border-b w-full">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-sm text-gray-800 mb-2">
            {formattedDate(date, { withTime: true })}
        </p>
    </div>
);
