/**
 * A reusable card for displaying address information (Bill From/To).
 */
export const InfoCard = ({
    title,
    name,
    address,
    isCentered = false,
}: {
    isCentered?: boolean;
    title?: string;
    name?: string;
    address?: string;
}) => (
    <div className={`bg-white p-2 border-b ${isCentered && "text-center"}`}>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="font-bold text-sm text-gray-800">{name}</p>
        <p className="text-xs text-gray-600">{address}</p>
    </div>
);
