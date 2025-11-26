import { Button, CircularProgress, IconButton } from "@mui/material";
import axios, { AxiosError } from "axios";
import { Pencil, Plus, Trash2 } from "lucide-react";
import technicianConfirmationIllustration from "public/technician-confirmation.png";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";
import Header from "~/components/header";
import InvoiceItemDialog from "~/components/invoice/invoice-item-dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import type { InvoiceItemForm } from "~/types/invoice.types";

/**
 * A page for technicians to create and submit a new invoice for an order.
 */
export default function CreateInvoice() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [items, setItems] = useState<InvoiceItemForm[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInputDialogOpen, setIsInputDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InvoiceItemForm | null>(
        null
    );
    const [isSheetConfirmationOpen, setIsSheetConfirmationOpen] =
        useState<boolean>(false);

    // --- LOGIC FOR MANAGING INVOICE ITEMS ---
    const handleOpenAddDialog = () => {
        setEditingItem(null); // Pastikan mode 'add'
        setIsInputDialogOpen(true);
    };

    const handleOpenEditDialog = (item: InvoiceItemForm) => {
        setEditingItem(item); // Set item yang akan diedit
        setIsInputDialogOpen(true);
    };

    const handleSaveItem = (itemToSave: InvoiceItemForm) => {
        // Cek apakah ini item baru atau item yang sudah ada
        const itemExists = items.some((item) => item.id === itemToSave.id);

        if (itemExists) {
            // Update item yang sudah ada
            setItems(
                items.map((item) =>
                    item.id === itemToSave.id ? itemToSave : item
                )
            );
        } else {
            // Tambah item baru
            setItems([...items, itemToSave]);
        }
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter((item) => item.id !== id));
    };

    // --- CALCULATIONS & SUBMISSION ---

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
                className="w-full bg-white"
            />

            {/* Main content area with padding for the sticky footer */}
            <main className="flex-grow p-4 space-y-4 pb-32">
                <h2 className="text-lg font-semibold text-gray-700">
                    Rincian biaya untuk pesanan #{orderId}
                </h2>

                {/* Dynamic list of invoice items */}
                <div className="bg-white shadow-sm border">
                    <Table className="rounded-lg">
                        <TableHeader className="bg-gray-100 rounded-t-lg">
                            <TableRow>
                                <TableHead className="w-[60%]">
                                    Deskripsi
                                </TableHead>
                                <TableHead className="text-right">
                                    Jumlah
                                </TableHead>
                                <TableHead className="w-[80px] text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="text-center text-[13px] text-gray-500 h-24"
                                    >
                                        Silakan tambahkan item untuk membuat
                                        tagihan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        {/* Item description */}
                                        <TableCell className="font-medium">
                                            <p>{item.description}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} x Rp
                                                {item.unitPrice.toLocaleString(
                                                    "id-ID"
                                                )}
                                            </p>
                                        </TableCell>
                                        {/* Amount QTY and price */}
                                        <TableCell className="text-right font-medium">
                                            Rp
                                            {(
                                                item.quantity * item.unitPrice
                                            ).toLocaleString("id-ID")}
                                        </TableCell>
                                        {/* Action buttons */}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <IconButton
                                                    size="small"
                                                    className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                                    onClick={() =>
                                                        handleOpenEditDialog(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Add Item Button */}
                <Button
                    variant="outlined"
                    className="w-full border-dashed border-primary capitalize text-primary !font-[Rubik] active:scale-95"
                    onClick={handleOpenAddDialog}
                    disabled={isSubmitting}
                >
                    <Plus size={16} className="mr-2" />
                    {items.length === 0 ? "Tambah item" : "Tambah item lagi"}
                </Button>
            </main>

            {/* Sticky Footer for Total and Submit Button */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t p-4 space-y-3 rounded-t-3xl">
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-800">
                        Total tagihan
                    </span>
                    <span className="text-base font-bold text-primary">
                        Rp{totalAmount.toLocaleString("id-ID")}
                    </span>
                </div>
                <Button
                    onClick={() => setIsSheetConfirmationOpen(true)}
                    disabled={isSubmitting || items.length <= 0}
                    className="w-full h-12 rounded-full text-base !font-[Rubik] font-semibold normal-case bg-primary text-white hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <CircularProgress size={20} className="text-white" />
                    ) : (
                        "Kirim tagihan"
                    )}
                </Button>
            </footer>

            <InvoiceItemDialog
                isOpen={isInputDialogOpen}
                onClose={() => setIsInputDialogOpen(false)}
                onSave={handleSaveItem}
                itemToEdit={editingItem}
            />

            <Sheet
                open={isSheetConfirmationOpen}
                onOpenChange={setIsSheetConfirmationOpen}
            >
                <SheetContent
                    side="bottom"
                    className="rounded-t-3xl max-w-lg mx-auto text-center"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="-mb-8">
                        <img
                            src={technicianConfirmationIllustration}
                            alt="Ilustrasi Peta"
                            className="w-full mx-auto"
                        />
                        <SheetTitle className="text-xl font-bold">
                            Pastiin tagihannya udah sesuai, ya
                        </SheetTitle>
                        <SheetDescription className="text-[16px] text-gray-600">
                            Abis dikonfirmasi, udah gak bisa diubah lagi.
                            Tagihan bakal langsung dikirim ke pelanggan biar
                            cepat dibayar.
                        </SheetDescription>
                    </SheetHeader>

                    <SheetFooter className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={() => setIsSheetConfirmationOpen(false)}
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-full font-semibold text-base bg-white border-[1.5px] border-[#006C7F] text-[#006C7F] active:scale-95 cursor-pointer normal-case !font-[Rubik]"
                        >
                            Bentar, cek lagi
                        </Button>
                        <Button
                            onClick={handleSubmitInvoice}
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-full font-semibold text-md active:scale-95 cursor-pointer normal-case !font-[Rubik] bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            {isSubmitting ? (
                                <CircularProgress
                                    size={20}
                                    className="text-white"
                                />
                            ) : (
                                "Ya, kirim sekarang"
                            )}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
