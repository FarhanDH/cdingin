import { Button } from "@mui/material";
import axios from "axios";
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
import Spinner from "~/components/ui/spinner";
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
import { type InvoiceResponse } from "~/types/invoice.types";
import type { Route } from "./+types/invoice-detail";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Detail Tagihan | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

/**
 * A page for customers to view their invoice details and choose a payment method.
 */
export default function InvoiceDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const [isCashInfoOpen, setIsCashInfoOpen] = useState(false);
    const [customerAddress, setCustomerAddress] = useState<string>("");

    // Fetch invoice details on component mount
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
                navigate(`/order/${orderId}`); // Kembali jika gagal
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoice();
    }, [orderId, navigate]);

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
        } catch (error) {
            toast(
                error instanceof Error
                    ? error.message
                    : "Gagal mendapatkan alamat",
                customToastStyle
            );
            setCustomerAddress("Gagal mendapatkan alamat");
        }
    };

    useEffect(() => {
        if (invoice) {
            getDetailAddress();
        }
    }, [invoice]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size={40} className="text-primary" />
            </div>
        );
    }

    if (!invoice) {
        return <div>Tagihan tidak ditemukan.</div>;
    }

    return (
        <div className="pb-40">
            <Header
                title={`Tagihan #${invoice.invoiceNumber}`}
                isSticky
                showBack
                navigateTo={`/technician/order/${orderId}/detail`}
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

                {/* Detail invoice */}
                <div className=" overflow-hidden">
                    <h3 className="font-semibold p-4">Rincian Tagihan</h3>

                    {/* Container untuk tabel */}
                    <div className="w-full">
                        <Table className="text-xs ">
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
                                    <TableHead className="">QTY</TableHead>
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
                                        <TableCell className="">
                                            {item.quantity}
                                        </TableCell>
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

                {/* Create Stample based on status invoice */}
                <InvoiceStamp status={invoice.status} />
            </main>

            {/* Cash dialog */}
            <Dialog open={isCashInfoOpen} onOpenChange={setIsCashInfoOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pembayaran Tunai</DialogTitle>
                        <DialogDescription className="pt-2">
                            Silakan siapkan uang pas dan bayar langsung ke
                            teknisi yang bertugas. Teknisi akan mengkonfirmasi
                            pembayaranmu di aplikasi.
                        </DialogDescription>
                    </DialogHeader>
                    <Button
                        onClick={() => setIsCashInfoOpen(false)}
                        className="mt-4 w-full capitalize text-white bg-primary !font-[Rubik]"
                    >
                        Oke, Mengerti
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
