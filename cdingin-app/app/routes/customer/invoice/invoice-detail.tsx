import { Button, CircularProgress } from "@mui/material";
import axios, { AxiosError } from "axios";
import { ArrowRightIcon, ChevronRight, CreditCard } from "lucide-react";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import bcaIcon from "~/assets/banks/bca.png";
import bniIcon from "~/assets/banks/bni.png";
import briIcon from "~/assets/banks/bri.png";
import mandiriIcon from "~/assets/banks/mandiri.png";
import permataIcon from "~/assets/banks/permata.png";
import cashIcon from "~/assets/cash.png";
import qrisIcon from "~/assets/qris-icon.png";
import { customToastStyle } from "~/common/custom-toast-style";
import Header from "~/components/header";
import { DateInfo } from "~/components/invoice/invoice-date";
import { InfoCard } from "~/components/invoice/invoice-info-card";
import { InvoiceStamp } from "~/components/invoice/invoice-stamp";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion";
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
    DrawerHeader,
    DrawerTitle,
} from "~/components/ui/drawer";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
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
import type { InvoiceResponse } from "~/types/invoice.types";
import type { Route } from "./+types/invoice-detail";

type PaymentMethod = "qris" | "bca" | "bni" | "bri" | "mandiri" | "cash";

const generalPaymentMethods = [
    {
        id: "qris",
        name: "QRIS",
        icon: qrisIcon,
        description: "Bayar dengan scan kode QRIS",
    },
    {
        id: "cash",
        name: "Tunai",
        icon: cashIcon,
        description: "Bayar langsung ke teknisi",
    },
];

const vaPaymentMethods = [
    {
        id: "bca",
        name: "BCA Virtual Account",
        icon: bcaIcon,
    },
    {
        id: "bni",
        name: "BNI Virtual Account",
        icon: bniIcon,
    },
    {
        id: "bri",
        name: "BRI Virtual Account",
        icon: briIcon,
    },
    {
        id: "mandiri",
        name: "MANDIRI Bill Payment",
        icon: mandiriIcon,
    },
    {
        id: "permata",
        name: "PERMATA Virtual Account",
        icon: permataIcon,
    },
];

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
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentMethod | null>(null);
    const [pendingPayment, setPendingPayment] = useState<any | null>(null);

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

    // Fetch invoice details
    useEffect(() => {
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

    const handlePaymentSelection = (methodId: PaymentMethod) => {
        setSelectedPaymentMethod(methodId);
        setIsPaymentDrawerOpen(false);
        if (methodId === "cash") {
            setIsCashInfoOpen(true);
        }
    };

    const handlePayNow = async () => {
        if (!invoice) return;

        if (!selectedPaymentMethod) {
            toast("Pilih metode pembayaran dulu, ya.", customToastStyle);
            return;
        }

        if (selectedPaymentMethod === "cash") {
            setIsCashInfoOpen(true);
            return;
        }

        setIsPaying(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/payments/invoices/${
                    invoice.id
                }/core-api`,
                { paymentMethod: selectedPaymentMethod },
                { withCredentials: true }
            );
            const { paymentId } = response.data.data;

            // Navigate to the new payment status page
            navigate(`/order/${orderId}/payment/${paymentId}`);
        } catch (error) {
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message
                    : "Gagal membuat transaksi pembayaran.";
            toast(errorMessage, customToastStyle);
        } finally {
            setIsPaying(false);
        }
    };

    // Effect to connect Pusher Real-Time
    useEffect(() => {
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        });

        const channelName = `order-${orderId}-customer`;
        const channel = pusher.subscribe(channelName);

        // Bind and Listen Even 'status-updated'
        channel.bind("status-updated-customer", (data: any) => {
            console.log("Real-time Status update: ", data.newStatus);

            fetchInvoice();

            toast(data.message, customToastStyle);
        });

        return () => {
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [orderId]);

    useEffect(() => {
        if (invoice?.payments) {
            // Cari pembayaran yang statusnya 'pending' dan belum expired
            const findPendingPayment = invoice.payments.find((payment) => {
                const isPending = payment.status === "pending";
                if (!payment.expiryTime) return false;
                const isNotExpired = new Date(payment.expiryTime) > new Date();
                return isPending && isNotExpired;
            });

            setPendingPayment(findPendingPayment || null);
        }
    }, [invoice]);

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
                className="bg-white"
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
            {invoice.status === "unpaid" &&
                invoice.order.status !== "cancelled" &&
                invoice.order.status !== "completed" && (
                    <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t-2 p-4 space-y-3 rounded-t-3xl z-50 shadow-card border-x-2">
                        {pendingPayment ? (
                            <Button
                                className="h-12 text-base bg-primary font-medium text-white normal-case !font-[Rubik] active:scale-95 rounded-full w-full"
                                onClick={() =>
                                    navigate(
                                        `/order/${orderId}/payment/${pendingPayment.id}`
                                    )
                                }
                            >
                                <div className="flex justify-between items-center w-full px-4">
                                    <p>Lanjutkan pembayaran</p>
                                    <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
                                        <ArrowRightIcon
                                            className={`text-primary animate-slide-right-loop`}
                                            size={16}
                                        />
                                    </div>
                                </div>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    className="w-full flex border normal-case text-gray-700 text-start items-start border-gray-400 rounded-xl justify-between p-4 !font-semibold !font-[Rubik]"
                                    onClick={() => setIsPaymentDrawerOpen(true)}
                                >
                                    <div className="flex items-center gap-3">
                                        {selectedPaymentMethod && (
                                            <img
                                                src={
                                                    [
                                                        ...generalPaymentMethods,
                                                        ...vaPaymentMethods,
                                                    ].find(
                                                        (p) =>
                                                            p.id ===
                                                            selectedPaymentMethod
                                                    )?.icon
                                                }
                                                alt={selectedPaymentMethod}
                                                className="w-7 h-7"
                                            />
                                        )}
                                        <p>
                                            {selectedPaymentMethod
                                                ? [
                                                      ...generalPaymentMethods,
                                                      ...vaPaymentMethods,
                                                  ].find(
                                                      (p) =>
                                                          p.id ===
                                                          selectedPaymentMethod
                                                  )?.name
                                                : "Pilih metode pembayaran"}
                                        </p>
                                    </div>
                                    <ChevronRight />
                                </Button>

                                <div className="">
                                    <Button
                                        className="h-12 text-base bg-primary font-medium text-white normal-case !font-[Rubik] active:scale-95 rounded-full disabled:bg-primary/50 disabled:cursor-not-allowed w-full "
                                        onClick={handlePayNow}
                                        disabled={
                                            isPaying || !selectedPaymentMethod
                                        }
                                    >
                                        <div className="flex justify-between items-center w-full px-4">
                                            <p>
                                                {isPaying ? (
                                                    <CircularProgress
                                                        size={20}
                                                        className="text-white items-center"
                                                    />
                                                ) : (
                                                    "Bayar Sekarang"
                                                )}
                                            </p>
                                            <div className="flex justify-end items-center gap-3">
                                                <p>
                                                    Rp
                                                    {Number(
                                                        invoice.totalAmount
                                                    ).toLocaleString("id-ID")}
                                                </p>
                                                <div className="flex items-center justify-center w-6 h-6 bg-white rounded-full">
                                                    <ArrowRightIcon
                                                        className={`text-primary ${
                                                            selectedPaymentMethod &&
                                                            !isPaying &&
                                                            "animate-slide-right-loop"
                                                        }`}
                                                        size={16}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                </div>
                            </>
                        )}
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

            <Drawer
                open={isPaymentDrawerOpen}
                onOpenChange={setIsPaymentDrawerOpen}
            >
                <DrawerContent className="max-w-lg mx-auto h-[97vh] flex flex-col rounded-t-3xl">
                    <DrawerHeader className="border-b-[1.5px] border-dashed">
                        <DrawerTitle className="text-xl font-semibold text-start">
                            Pilih Metode Pembayaran
                        </DrawerTitle>
                    </DrawerHeader>
                    <RadioGroup
                        value={selectedPaymentMethod ?? ""}
                        onValueChange={(value) =>
                            handlePaymentSelection(value as PaymentMethod)
                        }
                        className=" space-y-2"
                    >
                        {generalPaymentMethods.map((method) => (
                            <Label
                                key={method.id}
                                htmlFor={method.id}
                                className="flex items-center border-b justify-between p-4 cursor-pointer active:bg-gray-100"
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={method.icon}
                                        alt={method.name}
                                        className="w-8 h-8"
                                    />
                                    <div>
                                        <h2 className="font-semibold">
                                            {method.name}
                                        </h2>
                                        {method.description && (
                                            <p className="text-sm text-gray-600 font-light">
                                                {method.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <RadioGroupItem
                                    value={method.id}
                                    id={method.id}
                                    className="size-6 active:size-5"
                                />
                            </Label>
                        ))}

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="va" className="px-3">
                                <AccordionTrigger className="hover:no-underline cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <CreditCard className="w-8 h-8 text-gray-600" />
                                        <div>
                                            <h2 className="font-semibold text-start">
                                                Virtual Account
                                            </h2>
                                            <p className="text-sm text-gray-600 font-light">
                                                Bayar pakai rekening yang kamu
                                                punya
                                            </p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 space-y-2">
                                    {vaPaymentMethods.map((method) => (
                                        <Label
                                            key={method.id}
                                            htmlFor={method.id}
                                            className="flex items-center justify-between p-3 cursor-pointer active:bg-gray-100"
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={method.icon}
                                                    alt={method.name}
                                                    className="w-8 h-8 "
                                                />
                                                <div>
                                                    <h2 className="font-semibold">
                                                        {method.name}
                                                    </h2>
                                                </div>
                                            </div>
                                            <RadioGroupItem
                                                value={method.id}
                                                id={method.id}
                                                className="size-6 active:size-5"
                                            />
                                        </Label>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </RadioGroup>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
