import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import axios from "axios";
import { Banknote, ChevronDown, Copy, InfoIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import failureLottie from "~/assets/lottie/Failure error icon.json";
import loadingLottie from "~/assets/lottie/Loading Dots Blue.json";
import loveLottie from "~/assets/lottie/Love hand sign.json";
import { customToastStyle } from "~/common/custom-toast-style";
import { formattedDate } from "~/common/utils";
import Header from "~/components/header";

import Pusher from "pusher-js";
import type { Payment } from "~/types/payment.type";

// Structured instructions data for payment methods
const PAYMENT_INSTRUCTIONS: Record<
    string,
    { title: string; steps: string[] }[]
> = {
    qris: [
        {
            title: "Cara bayar lewat E‑Wallet (OVO, ShopeePay, Dana, LinkAja)",
            steps: [
                "Buka aplikasi e‑wallet Anda (OVO / ShopeePay / Dana / LinkAja).",
                "Pilih menu 'Scan QR' / 'Bayar dengan QR'.",
                "Arahkan kamera ke QR code yang muncul di halaman ini (atau gunakan tangkapan layar QR).",
                "Konfirmasi nominal dan selesaikan pembayaran.",
                "Simpan bukti pembayaran jika diperlukan.",
            ],
        },
        {
            title: "Cara bayar lewat Mobile Banking (BNI, BCA, Mandiri, dll.)",
            steps: [
                "Buka aplikasi mobile banking Anda.",
                "Pilih menu 'QRIS' / 'Bayar QR'.",
                "Scan QR code dari halaman ini atau unggah gambarnya jika tersedia.",
                "Konfirmasi data dan selesaikan pembayaran.",
            ],
        },
        {
            title: "Catatan",
            steps: [
                "Pastikan jumlah yang tertera sesuai (Rp ...).",
                "QRIS berlaku sampai waktu kedaluwarsa yang ditampilkan.",
            ],
        },
    ],
    mandiri: [
        {
            title: "Transfer lewat Livin by Mandiri",
            steps: [
                "Masuk ke Mandiri Online / m-Banking.",
                "Pilih 'Bayar' → 'Multipayment' atau 'Pembayaran Tagihan'.",
                "Pilih penyedia (Biller) lalu masukkan Kode Perusahaan: {biller_code}.",
                "Masukkan Kode Pembayaran: {bill_key}.",
                "Konfirmasi nominal dan selesaikan pembayaran.",
            ],
        },
        {
            title: "Transfer lewat ATM Mandiri",
            steps: [
                "Masukkan kartu dan PIN pada ATM Mandiri.",
                "Pilih 'Bayar/Beli' → 'Multipayment'.",
                "Masukkan Kode Perusahaan: {biller_code} dan Kode Pembayaran: {bill_key}.",
                "Periksa nama dan jumlah, konfirmasi untuk menyelesaikan.",
            ],
        },
    ],
    bca: [
        {
            title: "Transfer lewat BCA (VA)",
            steps: [
                "Buka m-BCA / KlikBCA.",
                "Pilih 'Transfer' → 'Virtual Account'.",
                "Masukkan nomor Virtual Account: {va_number}.",
                "Konfirmasi nominal dan selesaikan pembayaran.",
            ],
        },
    ],
    bri: [
        {
            title: "Transfer lewat BRI (VA)",
            steps: [
                "Buka BRI Mobile / ATM BRI.",
                "Pilih 'Pembayaran' atau 'Transfer' → 'Virtual Account'.",
                "Masukkan nomor Virtual Account: {va_number}.",
                "Konfirmasi dan selesaikan pembayaran.",
            ],
        },
    ],
    bni: [
        {
            title: "Transfer lewat BNI (VA)",
            steps: [
                "Buka BNI Mobile / ATM BNI.",
                "Pilih 'Pembayaran' → 'Virtual Account'.",
                "Masukkan nomor Virtual Account: {va_number}.",
                "Konfirmasi dan selesaikan pembayaran.",
            ],
        },
    ],
    generic_va: [
        {
            title: "Transfer lewat Virtual Account",
            steps: [
                "Buka aplikasi/mobile/ATM bank Anda.",
                "Pilih menu 'Transfer' → 'Virtual Account' / 'Transfer ke rekening bank'.",
                "Masukkan nomor Virtual Account: {va_number}.",
                "Periksa nama & nominal, lalu selesaikan pembayaran.",
            ],
        },
    ],
};

function PaymentInstructionsSheet({
    open,
    onClose,
    payment,
}: {
    open: boolean;
    onClose: () => void;
    payment: Payment;
}) {
    if (!payment) return null;

    const methodKey = payment.qr_code_url
        ? "qris"
        : (payment.bank as string) || "generic_va";

    const instructions =
        PAYMENT_INSTRUCTIONS[methodKey] || PAYMENT_INSTRUCTIONS.generic_va;

    const renderStep = (step: string) =>
        step
            .replace("{va_number}", payment.va_number ?? "")
            .replace(
                "{biller_code}",
                (payment.gateway_response as any)?.biller_code ?? ""
            )
            .replace(
                "{bill_key}",
                (payment.gateway_response as any)?.bill_key ?? ""
            );

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            className="max-w-lg"
        >
            <div className="p-4 max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between mb-3">
                    <Typography variant="h6">Cara Pembayaran</Typography>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        className="normal-case !font-[Rubik] bg-white text-gray-700"
                    >
                        <X />
                    </IconButton>
                </div>

                {instructions.map((group, idx) => (
                    <Accordion key={idx}>
                        <AccordionSummary expandIcon={<ChevronDown />}>
                            <Typography className="font-medium">
                                {group.title}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {group.steps.map((s, i) => (
                                    <ListItem key={i} className="py-1">
                                        <ListItemText
                                            primary={`${i + 1}. ${renderStep(
                                                s
                                            )}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        </Drawer>
    );
}

function CountdownTimer({
    expiryTime,
    paymentType,
    onExpire,
}: Readonly<{
    expiryTime: string;
    paymentType: string;
    onExpire: () => void;
}>) {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryTime) - +new Date();
        let timeLeft: { [key: string]: number } = {};
        if (difference > 0 || difference <= 0) {
            timeLeft = {
                Jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
                Menit: Math.floor((difference / 1000 / 60) % 60),
                Detik: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            const totalSeconds = Object.values(newTimeLeft).reduce(
                (a, b) => a + b,
                0
            );
            if (totalSeconds <= 0) {
                onExpire();
            }
        }, 1000);
        return () => clearTimeout(timer); // Cleanup timer on component unmount
    });

    const timerComponents = Object.keys(timeLeft).map((interval) => {
        if (timeLeft[interval] === undefined) return null;
        return (
            <div key={interval} className="flex flex-col items-center mx-1">
                <span className="bg-secondary/10 text-gray-600 font-normal px-2 py-1 rounded-md min-w-[30px] text-center">
                    {String(timeLeft[interval]).padStart(2, "0")}
                </span>
            </div>
        );
    });

    return (
        <div>
            <div className="flex items-start justify-between text-sm">
                <div className="flex flex-col items-start">
                    <span className="mr-2 text-gray-500">Selesaikan dalam</span>
                </div>
                <div className="flex">
                    {timerComponents.filter(Boolean).map((component, index) => (
                        <span key={index} className="flex items-center">
                            {component}{" "}
                            {index <
                                timerComponents.filter(Boolean).length - 1 &&
                                ":"}
                        </span>
                    ))}
                </div>
            </div>
            <p className="text-xs text-start mr-2 text-gray-800 font font-medium">
                {formattedDate(new Date(expiryTime), {
                    withTime: true,
                    shortMonth: true,
                })}
            </p>
            {paymentType.toLowerCase() === "qris" && (
                <div className="flex items-start justify-start text-start gap-4 mt-2 bg-gray-100 rounded-lg p-2">
                    <InfoIcon className="text-primary" />
                    <p className="text-xs font-light text-black">
                        Anda bisa bayar pakai e-wallet atau aplikasi mobile
                        banking
                    </p>
                </div>
            )}
        </div>
    );
}

function SuccessPaymentView({
    orderId,
    navigate,
}: Readonly<{
    orderId: string | undefined;
    navigate: any;
}>) {
    return (
        <div className="flex flex-col items-center text-center mt-10">
            <DotLottieReact
                data={loveLottie}
                loop={true}
                autoplay
                style={{ width: "200px", height: "200px" }}
            />
            <h1 className="text-2xl font-bold mt-4">Pembayaran Berhasil!</h1>
            <p className="text-gray-600 mt-2">
                Terima kasih! Pembayaran Anda telah kami terima dan pesanan Anda
                telah selesai.
            </p>
            <Button
                onClick={() => navigate(`/order/${orderId}`)}
                className="mt-8 w-full h-12 rounded-full text-base font-semibold bg-primary text-white normal-case !font-[Rubik] active:scale-95"
            >
                Kembali ke detail pesanan
            </Button>
        </div>
    );
}

function FailedPaymentView({
    orderId,
    navigate,
}: Readonly<{
    orderId: string | undefined;
    navigate: any;
}>) {
    return (
        <div className="flex flex-col items-center text-center mt-10">
            <DotLottieReact
                data={failureLottie}
                loop={false}
                autoplay
                style={{ width: "180px", height: "180px" }}
            />
            <h1 className="text-2xl font-bold mt-4">Pembayaran Gagal</h1>
            <p className="text-gray-600 mt-2">
                Waktu pembayaran telah habis atau dibatalkan. Silakan coba lagi.
            </p>
            <Button
                onClick={() => navigate(`/order/${orderId}/invoice`)}
                className="mt-8 w-full h-12 rounded-full text-base font-semibold bg-primary text-white normal-case !font-[Rubik] active:scale-95"
            >
                Pilih metode pembayaran lain
            </Button>
        </div>
    );
}

function PaymentDetailsCard({
    payment,
    handleCopyToClipboard,
}: Readonly<{
    payment: Payment;
    handleCopyToClipboard: (text: string) => void;
}>) {
    return (
        <div className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden bg-primary">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {payment.qr_code_url ? (
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png"
                                alt="Logo QRIS"
                                className="h-7 object-contain opacity-80"
                                style={{
                                    filter: "brightness(0) invert(1)",
                                }}
                            />
                        ) : (
                            "Virtual Account"
                        )}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                        {payment.bank
                            ? `Transfer via ${payment.bank?.toUpperCase()}`
                            : ``}
                    </p>
                </div>
                {payment.qr_code_url ? (
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/8/83/Gerbang_Pembayaran_Nasional_logo.svg"
                        alt="Logo GPN"
                        className="h-8 object-contain opacity-80"
                        style={{
                            filter: "brightness(0) invert(1)",
                        }}
                    />
                ) : (
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                        <Banknote size={24} />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center py-4 mb-1 relative z-10 text-gray-900">
                {payment.qr_code_url ? (
                    <div className="bg-white w-54 h-[215px] rounded-2xl flex flex-col items-center text-center justify-center shadow-inner">
                        <img
                            src={payment.actions[0].url}
                            alt="QRIS"
                            className="w-50 aspect-square object-contain"
                        />
                    </div>
                ) : (
                    <PaymentAccountDisplay
                        payment={payment}
                        handleCopyToClipboard={handleCopyToClipboard}
                    />
                )}
            </div>

            <div className="border-t border-dashed mb-4"></div>
            <div className="flex justify-between items-center relative z-10 ">
                <p className="text-white/80 text-base font-medium mb-1">
                    Total
                </p>
                <p className="text-xl font-bold">
                    Rp
                    {Number(payment.amount).toLocaleString("id-ID")}
                </p>
            </div>
        </div>
    );
}

function PaymentAccountDisplay({
    payment,
    handleCopyToClipboard,
}: Readonly<{
    payment: Payment;
    handleCopyToClipboard: (text: string) => void;
}>) {
    if (payment.bank === "mandiri") {
        return (
            <div className="flex justify-between items-center w-full bg-white rounded-2xl p-4">
                <div className="w-full space-y-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">
                                Kode Perusahaan
                            </p>
                            <p className="text-lg font-bold tracking-wider text-gray-800">
                                {(payment.gateway_response as any).biller_code}
                            </p>
                        </div>
                        <IconButton
                            onClick={() =>
                                handleCopyToClipboard(
                                    (payment.gateway_response as any)
                                        .biller_code
                                )
                            }
                            className="bg-black/10 hover:bg-gray-900/30 text-gray-600 p-2 rounded-lg"
                        >
                            <Copy size={20} />
                        </IconButton>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">
                                Kode Pembayaran
                            </p>
                            <p className="text-lg font-bold tracking-wider text-gray-800">
                                {(payment.gateway_response as any).bill_key}
                            </p>
                        </div>
                        <IconButton
                            onClick={() =>
                                handleCopyToClipboard(
                                    (payment.gateway_response as any).bill_key
                                )
                            }
                            className="bg-black/10 hover:bg-gray-900/30 text-gray-600 p-2 rounded-lg"
                        >
                            <Copy size={20} />
                        </IconButton>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center w-full bg-white rounded-2xl p-4">
            <div>
                <p className="text-gray-500 text-sm mb-1">
                    Nomor Virtual Account
                </p>
                <p className="text-lg font-bold tracking-wider text-gray-800 break-all">
                    {payment.va_number}
                </p>
            </div>
            <IconButton
                onClick={() => handleCopyToClipboard(payment.va_number)}
                className="bg-black/10 hover:bg-gray-900/30 text-gray-600 p-2 rounded-lg"
            >
                <Copy size={20} />
            </IconButton>
        </div>
    );
}

function PendingPaymentView({
    payment,
    handleCopyToClipboard,
    fetchPaymentDetails,
}: Readonly<{
    payment: Payment;
    handleCopyToClipboard: (text: string) => void;
    fetchPaymentDetails: () => void;
}>) {
    const [openInstructions, setOpenInstructions] = useState(false);
    return (
        <>
            <div className="flex flex-col items-center">
                <DotLottieReact
                    data={loadingLottie}
                    loop={true}
                    autoplay
                    style={{ width: "50px" }}
                    className="flex items-center -mt-4 -mb-4 w-70"
                />
                <p className="text-sm">Sedang menunggu pembayaran anda...</p>
            </div>

            {payment.expiry_time && (
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <CountdownTimer
                        expiryTime={payment.expiry_time}
                        paymentType={payment.bank ?? "qris"}
                        onExpire={fetchPaymentDetails}
                    />
                </div>
            )}

            <PaymentDetailsCard
                payment={payment}
                handleCopyToClipboard={handleCopyToClipboard}
            />

            <Button
                onClick={() => setOpenInstructions(true)}
                className="w-full flex border normal-case text-gray-700 text-start items-start border-gray-400 rounded-full justify-between p-4 !font-medium !font-[Rubik]"
            >
                <span>💡 Lihat cara pembayaran</span>
                <ChevronDown />
            </Button>

            <PaymentInstructionsSheet
                open={openInstructions}
                onClose={() => setOpenInstructions(false)}
                payment={payment}
            />
        </>
    );
}

export default function PaymentStatusPage() {
    const { orderId, paymentId } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPaymentDetails = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/payments/${paymentId}`,
                { withCredentials: true }
            );
            setPayment(response.data.data);
        } catch (error) {
            toast("Gagal memuat detail pembayaran.", customToastStyle);
            navigate(`/order/${orderId}/invoice`);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (paymentId) {
            fetchPaymentDetails();
        }
    }, [paymentId, orderId, navigate]);
    const isExpired = useMemo(() => {
        if (!payment?.expiry_time) return false;
        return new Date(payment.expiry_time) < new Date();
    }, [payment]);

    // Effect to connect Pusher Real-Time for payment status
    useEffect(() => {
        if (!orderId) return;

        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
            cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        });

        const channelName = `order-${orderId}-customer`;
        const channel = pusher.subscribe(channelName);

        // Bind and Listen to 'payment-updated' event
        channel.bind("payment-updated", (data: any) => {
            console.log("Real-time Payment Status update: ", data.newStatus);
            fetchPaymentDetails(); // Refetch details to update the UI
        });

        return () => {
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [orderId]);

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

            fetchPaymentDetails();
            toast(data.message, customToastStyle);
        });

        return () => {
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [orderId, paymentId]);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Berhasil disalin!", customToastStyle);
    };

    const isPaymentSuccessful = (payment: Payment) =>
        payment.status === "settlement" || payment.status === "success";

    const isPaymentFailed = (payment: Payment, isExpired: boolean) =>
        payment.status === "cancel" ||
        payment.status === "expire" ||
        payment.status === "deny" ||
        isExpired;

    if (isLoading)
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress className="text-primary" />
            </div>
        );
    if (!payment) return <div>Data tidak ditemukan</div>;

    const renderPaymentView = () => {
        if (isPaymentSuccessful(payment)) {
            return <SuccessPaymentView orderId={orderId} navigate={navigate} />;
        }
        if (isPaymentFailed(payment, isExpired)) {
            return <FailedPaymentView orderId={orderId} navigate={navigate} />;
        }
        return (
            <PendingPaymentView
                payment={payment}
                handleCopyToClipboard={handleCopyToClipboard}
                fetchPaymentDetails={fetchPaymentDetails}
            />
        );
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <Header
                title="Pembayaran"
                isSticky
                navigateTo={`/order/${orderId}/invoice`}
                className="bg-white shadow-sm items-center justify-center flex"
            />

            <main className="p-4 max-w-lg mx-auto space-y-6">
                {renderPaymentView()}
            </main>
        </div>
    );
}
