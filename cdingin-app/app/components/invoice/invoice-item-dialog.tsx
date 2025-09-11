import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import type { InvoiceItemForm } from "~/types/invoice.types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";

interface InvoiceItemDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: InvoiceItemForm) => void;
    itemToEdit: InvoiceItemForm | null;
}
/**
A dialog component for adding or editing an invoice item.
It operates in two modes: 'add' and 'edit'.
*/
export default function InvoiceItemDialog({
    isOpen,
    onClose,
    onSave,
    itemToEdit,
}: Readonly<InvoiceItemDialogProps>) {
    const [item, setItem] = useState<InvoiceItemForm>({
        id: Date.now(),
        description: "",
        quantity: 1,
        unitPrice: 0,
    });

    // Effect to populate the form when in 'edit' mode.
    useEffect(() => {
        if (itemToEdit && isOpen) {
            setItem(itemToEdit);
        } else {
            // Reset form when opening in 'add' mode
            setItem({
                id: Date.now(),
                description: "",
                quantity: 1,
                unitPrice: 0,
            });
        }
    }, [itemToEdit, isOpen]);
    const handleChange = (
        field: keyof Omit<InvoiceItemForm, "id">,
        value: string
    ) => {
        const numericValue =
            field === "quantity" || field === "unitPrice"
                ? Number(value) || 0
                : value;
        setItem({ ...item, [field]: numericValue });
    };
    const handleSave = () => {
        if (!item.description || item.quantity <= 0 || item.unitPrice <= 0) {
            toast(
                "Deskripsi, kuantitas, dan harga harus diisi dengan benar.",
                customToastStyle
            );
            return;
        }
        onSave(item);
        onClose();
    };
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>
                        {itemToEdit ? "Edit Item Tagihan" : "Tambah Item Baru"}
                    </DialogTitle>
                    <DialogDescription>
                        Masukkan rincian item untuk tagihan ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm">Deskripsi</label>
                        <Input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                            placeholder="Cth. Jasa Servis Cuci AC"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm">Banyaknya</label>
                            <Input
                                type="number"
                                value={item.quantity}
                                placeholder="1"
                                min={1}
                                onChange={(e) =>
                                    handleChange("quantity", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm">Harga Satuan (Rp)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) =>
                                    handleChange("unitPrice", e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter className="!flex !justify-end">
                    <Button
                        onClick={onClose}
                        className="border border-primary capitalize text-primary !font-[Rubik] active:scale-95 rounded-full"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="!font-[Rubik] active:scale-95 bg-primary text-white capitalize rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                            !item.description ||
                            item.quantity <= 0 ||
                            item.unitPrice <= 0
                        }
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
