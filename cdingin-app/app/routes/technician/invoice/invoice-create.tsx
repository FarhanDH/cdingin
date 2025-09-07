import { Button, Input } from "@mui/material";
import axios, { AxiosError } from "axios";
import { Trash2, Plus } from "lucide-react";
import { useState, useMemo } from "react";

import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";
import Header from "~/components/header";
import Spinner from "~/components/ui/spinner";
import type { InvoiceItemForm } from "~/types/invoice.types";

/**
 * A page for technicians to create and submit a new invoice for an order.
 */
export default function CreateInvoice() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [items, setItems] = useState<InvoiceItemForm[]>([
        // Mulai dengan satu item default
        { id: 1, description: "Jasa Servis AC", quantity: 1, unitPrice: 0 },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- LOGIC FOR MANAGING INVOICE ITEMS ---

    /**
     * Adds a new, empty item to the invoice list.
     */
    const handleAddItem = () => {
        setItems([
            ...items,
            // Gunakan timestamp sebagai ID unik sementara
            { id: Date.now(), description: "", quantity: 1, unitPrice: 0 },
        ]);
    };

    /**
     * Removes an item from the invoice list by its ID.
     * @param id - The unique ID of the item to remove.
     */
    const handleRemoveItem = (id: number) => {
        if (items.length <= 1) {
            toast("Minimal harus ada satu item tagihan.", customToastStyle);
            return;
        }
        setItems(items.filter((item) => item.id !== id));
    };

    /**
     * Updates a specific field of an item in the list.
     * @param id - The ID of the item to update.
     * @param field - The name of the field to update ('description', 'quantity', 'unitPrice').
     * @param value - The new value for the field.
     */
    const handleItemChange = (
        id: number,
        field: keyof Omit<InvoiceItemForm, "id">,
        value: string | number
    ) => {
        setItems(
            items.map((item) => {
                if (item.id === id) {
                    const numericValue =
                        field === "quantity" || field === "unitPrice"
                            ? Number(value) || 0
                            : value;
                    return { ...item, [field]: numericValue };
                }
                return item;
            })
        );
    };

    // --- CALCULATIONS & SUBMISSION ---

    /**
     * Calculates the total amount of the invoice in real-time.
     * `useMemo` ensures this calculation only runs when the `items` array changes.
     */
    const totalAmount = useMemo(() => {
        return items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        );
    }, [items]);

    /**
     * Handles the final submission of the invoice to the backend.
     */
    const handleSubmitInvoice = async () => {
        if (
            items.some(
                (item) =>
                    !item.description ||
                    item.quantity <= 0 ||
                    item.unitPrice <= 0
            )
        ) {
            toast(
                "Pastikan semua deskripsi, kuantitas, dan harga diisi dengan benar.",
                customToastStyle
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                items: items.map(({ description, quantity, unitPrice }) => ({
                    description,
                    quantity,
                    unitPrice,
                })),
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/invoices/${orderId}`,
                payload,
                { withCredentials: true }
            );

            toast("Tagihan berhasil dikirim ke pelanggan!", customToastStyle);
            navigate(`/technician/order/${orderId}`);
        } catch (error) {
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message
                    : "Gagal mengirim tagihan.";
            toast(errorMessage, customToastStyle);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header
                title="Buat Tagihan"
                isSticky
                showBack
                navigateTo={`/technician/order/${orderId}`}
            />

            {/* Main content area with padding for the sticky footer */}
            <main className="flex-grow p-4 space-y-4 pb-32">
                <h2 className="text-lg font-semibold text-gray-700">
                    Rincian Biaya untuk Pesanan #{orderId}
                </h2>

                {/* Dynamic list of invoice items */}
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-white p-4 rounded-lg shadow-sm border space-y-3"
                    >
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-600">
                                Item #{index + 1}
                            </p>
                            <Button
                                className="text-red-500 hover:bg-red-50"
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>

                        {/* Description Input */}
                        <Input
                            type="text"
                            placeholder="Deskripsi (e.g., Jasa Cuci AC)"
                            value={item.description}
                            onChange={(e) =>
                                handleItemChange(
                                    item.id,
                                    "description",
                                    e.target.value
                                )
                            }
                            className="text-md"
                        />

                        {/* Quantity and Price Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Kuantitas
                                </label>
                                <Input
                                    type="number"
                                    placeholder="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleItemChange(
                                            item.id,
                                            "quantity",
                                            e.target.value
                                        )
                                    }
                                    className="text-md"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Harga Satuan (Rp)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="75000"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                        handleItemChange(
                                            item.id,
                                            "unitPrice",
                                            e.target.value
                                        )
                                    }
                                    className="text-md"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Item Button */}
                <Button
                    variant="outlined"
                    className="w-full border-dashed"
                    onClick={handleAddItem}
                >
                    <Plus size={16} className="mr-2" />
                    Tambah Item Lain
                </Button>
            </main>

            {/* Sticky Footer for Total and Submit Button */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t p-4 space-y-3 rounded-t-3xl">
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-800">
                        Total Tagihan
                    </span>
                    <span className="text-base font-bold text-primary">
                        Rp{totalAmount.toLocaleString("id-ID")}
                    </span>
                </div>
                <Button
                    onClick={handleSubmitInvoice}
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-full text-base font-semibold capitalize bg-primary text-white hover:bg-primary/90 active:scale-95"
                >
                    {isSubmitting ? <Spinner size={20} /> : "Kirim Tagihan"}
                </Button>
            </footer>
        </div>
    );
}
