import { Button } from "@mui/material";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { customToastStyle } from "~/common/custom-toast-style";
import Header from "~/components/header";
import { DateInfo } from "~/components/invoice/invoice-date";
import { InfoCard } from "~/components/invoice/invoice-info-card";
import { InvoiceStamp } from "~/components/invoice/invoice-stamp";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import Spinner from "~/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { useMidtrans } from "~/hooks/use-midtrans";
import type { InvoiceResponse } from "~/types/invoice.types";
import type { MidtransTokenResponse } from "~/types/payment.type";

export default function InvoiceDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [isCashInfoOpen, setIsCashInfoOpen] = useState(false);
    const [customerAddress, setCustomerAddress] = useState<string>("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [snapToken, setSnapToken] = useState<string | null>(null);

    const { embed, isScriptLoaded, reloadSnapScript } = useMidtrans();

    // Fetch invoice details
    useEffect(() => {
        const fetchInvoice = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/orders/${orderId}/invoice`,
                    { withCredentials: true }
                );
                setInvoice(response.data.data);
            } catch (error) {
                toast("Gagal memuat tagihan.", customToastStyle);
                navigate(`/order/${orderId}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoice();
    }, [orderId, navigate]);

    // Get address
    const getDetailAddress = async () => {
        try {
            const response = await axios.get(
                "https://nominatim.openstreetmap.org/reverse",
                {
                    params: {
                        lat: invoice?.order.serviceLocation.latitude,
                        lon: invoice?.order.serviceLocation.longitude,
                        format: "json",
                    },
                }
            );
            setCustomerAddress(
                response.data.display_name || "Alamat tidak ditemukan"
            );
        } catch {
            setCustomerAddress("Gagal mendapatkan alamat");
        }
    };

    useEffect(() => {
        if (invoice) {
            getDetailAddress();
        }
    }, [invoice]);

    // Embed Snap setiap kali drawer dibuka
    useEffect(() => {
        if (isDrawerOpen && snapToken && isScriptLoaded) {
            const timer = setTimeout(() => {
                // Cleanup sebelum embed ulang
                const container = document.getElementById("snap-container");
                if (container) container.innerHTML = "";

                embed(snapToken, "snap-container", {
                    onSuccess: () => {
                        toast(
                            "Pembayaran berhasil! Terima kasih.",
                            customToastStyle
                        );
                        setIsDrawerOpen(false);
                        navigate(`/order/${orderId}`);
                    },
                    onPending: () => {
                        toast(
                            "Pembayaranmu sedang diproses.",
                            customToastStyle
                        );
                        setIsDrawerOpen(false);
                        navigate(`/order/${orderId}`);
                    },
                    onError: () => {
                        toast(
                            "Pembayaran gagal. Coba lagi, ya.",
                            customToastStyle
                        );
                        setIsDrawerOpen(false);
                    },
                    onClose: () => {
                        toast(
                            "Pembayaran dibatalkan. Coba lagi, ya.",
                            customToastStyle
                        );
                        // 🧹 Cleanup Snap saat popup ditutup
                        const container =
                            document.getElementById("snap-container");
                        if (container) container.innerHTML = "";
                        setIsDrawerOpen(false);
                    },
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isDrawerOpen, snapToken, isScriptLoaded, embed, navigate, orderId]);

    // Handle digital payment
    const handleDigitalPayment = async () => {
        if (!invoice) return;
        setIsPaying(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/payments/invoices/${
                    invoice.id
                }/midtrans`,
                {},
                { withCredentials: true }
            );
            const midtransToken: MidtransTokenResponse = response.data.data;

            setSnapToken(midtransToken.token); // token baru
            setIsDrawerOpen(true);
        } catch (error) {
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message
                    : "Gagal memulai pembayaran.";
            toast(errorMessage, customToastStyle);
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size={40} />
            </div>
        );
    }

    if (!invoice) {
        return <div>Tagihan tidak ditemukan.</div>;
    }

    return (
        <div className="pb-40">
            <Header
                title={`Tagihan`}
                isSticky
                showBack
                navigateTo={`/order/${orderId}`}
            />
            <main className="p-2 space-y-4">
                <div className="bg-white p-2 flex justify-between items-center">
                    <DateInfo label="Tanggal Terbit" date={invoice.issuedAt} />
                </div>

                {/* Info pengirim & penerima */}
                <div className="grid grid-cols-2 gap-4 justify-between">
                    <InfoCard
                        title="Ditagihkan oleh"
                        name="Herdi Jaya Service"
                        address="Jl. Turi Putih Perumahan Bengkuring, Samarinda, Kalimantan Timur Indonesia"
                    />
                    <InfoCard
                        title="Ditagihkan kepada"
                        name={invoice.order.customer.fullName}
                        address={`${customerAddress} ${
                            invoice.order.serviceLocation.note
                                ? `, (${invoice.order.serviceLocation.note})`
                                : ""
                        }`}
                    />
                </div>
                <InfoCard title="No." name={`#${invoice.invoiceNumber}`} />

                {/* Rincian Tagihan */}
                <div className="overflow-hidden">
                    <h3 className="font-semibold p-2">Rincian Tagihan</h3>
                    <div className="w-full">
                        <Table className="text-xs">
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead>QTY</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-right">
                                        Harga
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Jumlah
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>
                                            {item.description}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            Rp{" "}
                                            {Number(
                                                item.unitPrice
                                            ).toLocaleString("id-ID")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            Rp{" "}
                                            {Number(
                                                item.totalPrice
                                            ).toLocaleString("id-ID")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell
                                        colSpan={3}
                                        className="font-semibold text-base"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right text-primary font-semibold text-base">
                                        Rp{" "}
                                        {Number(
                                            invoice.totalAmount
                                        ).toLocaleString("id-ID")}
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
                <InvoiceStamp status={invoice.status} />
            </main>

            {/* Footer Pilih Metode */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 p-4 space-y-3 rounded-t-3xl z-50 shadow-card border-x-2">
                <h3 className="font-semibold">Pilih Metode Pembayaran</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="outlined"
                        className="h-11 text-md text-primary font-medium border-primary capitalize !font-[Rubik] active:scale-95"
                        disabled={isDrawerOpen}
                        onClick={() => setIsCashInfoOpen(true)}
                    >
                        Bayar Tunai
                    </Button>
                    <Button
                        className="h-11 text-md bg-primary font-medium text-white capitalize !font-[Rubik] active:scale-95"
                        onClick={handleDigitalPayment}
                        disabled={isPaying || !isScriptLoaded || isDrawerOpen}
                    >
                        {isPaying ? <Spinner size={20} /> : "Bayar Digital"}
                    </Button>
                </div>
            </footer>

            {/* Cash Dialog */}
            <Dialog open={isCashInfoOpen} onOpenChange={setIsCashInfoOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pembayaran Tunai</DialogTitle>
                        <DialogDescription className="pt-2">
                            Siapin uang pas, yaa 😉. Biar teknisi ga repot cari
                            kembalian.
                        </DialogDescription>
                    </DialogHeader>
                    <Button
                        onClick={() => setIsCashInfoOpen(false)}
                        className="mt-4 w-full capitalize text-white bg-primary !font-[Rubik] active:scale-95 h-11 rounded-full"
                    >
                        Oke, Siap
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Midtrans Drawer Snap */}
            <Drawer
                open={isDrawerOpen}
                onOpenChange={(open) => {
                    setIsDrawerOpen(open);
                    if (!open) {
                        const container =
                            document.getElementById("snap-container");
                        if (container) container.innerHTML = "";
                        reloadSnapScript();
                        setSnapToken(null);
                    }
                }}
            >
                <DrawerContent
                    className="max-w-lg mx-auto flex flex-col"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DrawerHeader className="border-b">
                        <DrawerTitle>Pembayaran Digital</DrawerTitle>
                        <DrawerDescription>
                            Silakan pilih metode bayar
                        </DrawerDescription>
                    </DrawerHeader>
                    <ScrollArea
                        className="overflow-y-scroll"
                        showScrollBar={false}
                    >
                        {/* <div className="flex-1 overflow-y-auto px-2"> */}
                        {isDrawerOpen && (
                            <div id="snap-container" className="w-full" />
                        )}
                        {/* </div> */}
                    </ScrollArea>
                    <DrawerFooter className="border-t">
                        <Button
                            onClick={() => {
                                setIsDrawerOpen(false);
                                const container =
                                    document.getElementById("snap-container");
                                if (container) container.innerHTML = "";
                                reloadSnapScript();
                                setSnapToken(null);
                            }}
                            variant="outlined"
                            className="w-full capitalize text-primary border-primary bg-white !font-[Rubik] active:scale-95 rounded-full h-11"
                        >
                            Ga, jadi
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
