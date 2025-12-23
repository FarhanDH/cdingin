import { InvoiceStatus } from "~/types/invoice.types";

export const InvoiceStamp = ({ status }: { status: InvoiceStatus }) => {
    let text = "";
    let colorClass = "";

    switch (status) {
        case InvoiceStatus.PAID:
            text = "LUNAS";
            colorClass = "text-green-600 border-green-600";
            break;
        case InvoiceStatus.UNPAID:
            text = "BELUM LUNAS";
            colorClass = "text-red-600 border-red-600";
            break;
        case InvoiceStatus.DRAFT:
            text = "MENUNGGU PEMBAYARAN";
            colorClass = "text-yellow-600 border-yellow-600";
            break;
        case InvoiceStatus.VOID:
            text = "DIBATALKAN";
            colorClass = "text-gray-600 border-gray-600";
            break;
        default:
            return null;
    }

    return (
        <div
            className={`absolute top-80 left-1/2 mx-auto text-center transform -rotate-12 opacity-80 border-2 font-black px-8 py-2 rounded-lg text-lg ${colorClass}`}
            style={{
                letterSpacing: "0.2em",
                transform: "rotate(-12deg) translateX(-50%) translateY(-50%)",
                zIndex: 50,
            }}
        >
            {text}
        </div>
    );
};
