import { Button, CircularProgress } from "@mui/material";
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
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { useMidtrans } from "~/hooks/use-midtrans";
import type { InvoiceResponse } from "~/types/invoice.types";
import type { MidtransTokenResponse } from "~/types/payment.type";
import type { Route } from "./+types/invoice-detail";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Detail Tagihan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function InvoiceDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [isCashInfoOpen, setIsCashInfoOpen] = useState(false);
    const [customerAddress, setCustomerAddress] = useState<string>("");
    const [isPaymentGatewaySheetOpen, setIsPaymentGatewaySheetOpen] =
        useState(false);
    const [snapToken, setSnapToken] = useState<string | null>(null);
    const { embed, isScriptLoaded, reloadSnapScript } = useMidtrans();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!invoice) return;
        setIsDownloading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/invoices/${
                    invoice.id
                }/download`,
                {
                    withCredentials: true,
                    responseType: "blob", // <-- PENTING: Minta data sebagai file biner
                }
            );

            // Buat URL sementara untuk file yang diterima
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `invoice-${invoice.invoiceNumber}.pdf`
            );

            // Klik link secara terprogram untuk memulai download
            document.body.appendChild(link);
            link.click();

            // Bersihkan
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Tampilkan notifikasi sukses
            toast("Tagihan berhasil di-download", customToastStyle);
        } catch (error) {
            toast("Gagal mengunduh tagihan.", customToastStyle);
        } finally {
            setIsDownloading(false);
        }
    };

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
        if (isPaymentGatewaySheetOpen && snapToken && isScriptLoaded) {
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
                        setIsPaymentGatewaySheetOpen(false);
                        navigate(`/order/${orderId}`);
                    },
                    onPending: () => {
                        toast("Pembayaran sedang diproses.", customToastStyle);
                        setIsPaymentGatewaySheetOpen(false);
                        navigate(`/order/${orderId}`);
                    },
                    onError: () => {
                        toast(
                            "Pembayaran gagal. Coba lagi, ya.",
                            customToastStyle
                        );
                        setIsPaymentGatewaySheetOpen(false);
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
                        setIsPaymentGatewaySheetOpen(false);
                    },
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [
        isPaymentGatewaySheetOpen,
        snapToken,
        isScriptLoaded,
        embed,
        navigate,
        orderId,
    ]);

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
            setIsPaymentGatewaySheetOpen(true);
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
                <CircularProgress size={40} className="text-primary" />
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
                <div className="bg-white p-2 flex-col space-y-2 items-center">
                    <InfoCard
                        title="No."
                        name={`#${invoice.invoiceNumber}`}
                        isCentered={true}
                    />
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

                {/* Rincian Tagihan */}
                <div className="overflow-hidden">
                    <h3 className="font-semibold p-2">Rincian Tagihan</h3>
                    <div className="w-full">
                        <Table className="text-xs">
                            {invoice.status === "paid" && (
                                <TableCaption className="text-start">
                                    Bayar Pakai{" "}
                                    {invoice.payments.find(
                                        (payment) =>
                                            payment.status === "success" ||
                                            payment.status === "settlement"
                                    )?.method === "cash"
                                        ? "Tunai"
                                        : invoice.payments.find(
                                              (payment) =>
                                                  payment.status ===
                                                      "success" ||
                                                  payment.status ===
                                                      "settlement"
                                          )?.paymentChannel}
                                </TableCaption>
                            )}
                            <TableHeader className="bg-gray-100">
                                <TableRow>
                                    <TableHead>Banyaknya</TableHead>
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
                                            Rp
                                            {Number(
                                                item.unitPrice
                                            ).toLocaleString("id-ID")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            Rp
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
                                        Rp
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
                <Button
                    variant="outlined"
                    className="h-12 w-full rounded-full text-base text-primary font-medium border-primary normal-case !font-[Rubik] active:scale-95"
                    disabled={isDownloading}
                    onClick={handleDownload}
                >
                    {isDownloading ? (
                        <CircularProgress size={20} className="text-primary" />
                    ) : (
                        "Download tagihan"
                    )}
                </Button>
            </main>

            {/* Footer Pilih Metode */}
            {invoice.status === "unpaid" && (
                <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 p-4 space-y-3 rounded-t-3xl z-50 shadow-card border-x-2">
                    <h3 className="font-semibold">Pilih Metode Pembayaran</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outlined"
                            className="h-12 text-base text-primary font-medium border-primary normal-case !font-[Rubik] active:scale-95 rounded-full"
                            disabled={isPaymentGatewaySheetOpen}
                            onClick={() => setIsCashInfoOpen(true)}
                        >
                            Bayar tunai
                        </Button>
                        <Button
                            className="h-12 text-base bg-primary font-medium text-white normal-case !font-[Rubik] active:scale-95 rounded-full disabled:bg-primary/50 disabled:cursor-not-allowed"
                            onClick={handleDigitalPayment}
                            disabled={
                                isPaying ||
                                !isScriptLoaded ||
                                isPaymentGatewaySheetOpen
                            }
                        >
                            {isPaying ? (
                                <CircularProgress
                                    size={20}
                                    className="text-white"
                                />
                            ) : (
                                "Bayar digital"
                            )}
                        </Button>
                    </div>
                </footer>
            )}

            {/* Cash Dialog */}
            <Dialog open={isCashInfoOpen} onOpenChange={setIsCashInfoOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Langsung Bayar ke Teknisi</DialogTitle>
                        <DialogDescription className="">
                            Siapin uang pas, yaa 😉. Biar teknisi ga repot cari
                            kembalian.
                        </DialogDescription>
                    </DialogHeader>
                    <Button
                        onClick={() => setIsCashInfoOpen(false)}
                        className=" w-full text-base normal-case text-white bg-primary !font-[Rubik] active:scale-95 h-11 rounded-full"
                    >
                        Oke, siap
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Midtrans Sheet Snap */}
            <Sheet
                open={isPaymentGatewaySheetOpen}
                onOpenChange={(open) => {
                    setIsPaymentGatewaySheetOpen(open);
                    if (!open) {
                        const container =
                            document.getElementById("snap-container");
                        if (container) container.innerHTML = "";
                        reloadSnapScript();
                        setSnapToken(null);
                    }
                }}
            >
                <SheetContent
                    isXIconVisible={false}
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto p-2 text-center h-full sm:max-h-none"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <SheetHeader className="border-b-2 border-dashed">
                        <SheetTitle>Pembayaran Digital</SheetTitle>
                        <SheetDescription>
                            Silakan pilih metode bayar
                        </SheetDescription>
                    </SheetHeader>
                    {isPaymentGatewaySheetOpen && (
                        <div
                            id="snap-container"
                            className="w-full h-full sm:max-h-none"
                        />
                    )}
                    <SheetFooter>
                        <Button
                            onClick={() => {
                                setIsPaymentGatewaySheetOpen(false);
                                const container =
                                    document.getElementById("snap-container");
                                if (container) container.innerHTML = "";
                                reloadSnapScript();
                                setSnapToken(null);
                            }}
                            variant="outlined"
                            className="w-full text-primary border-primary bg-white !font-[Rubik] active:scale-95 rounded-full h-12 text-base normal-case"
                        >
                            Ga, jadi
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
