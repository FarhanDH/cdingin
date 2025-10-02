import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import { Button, IconButton } from "@mui/material";
import {
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@radix-ui/react-dialog";
import axios, { AxiosError } from "axios";
import { ID } from "country-flag-icons/react/3x2";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import settingBg from "~/assets/setting-bg.png";
import { customToastStyle } from "~/common/custom-toast-style";
import Header from "~/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dialog } from "~/components/ui/dialog";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import Spinner from "~/components/ui/spinner";
import { useAuth } from "~/contexts/auth.context";
import type { Route } from "./+types/profile";
import { useNotificationPermission } from "~/hooks/use-notification-permission";

export function meta(args: Route.MetaArgs) {
    return [
        { title: "Profil | Cdingin" },
        { name: "description", content: "Welcome to cdingin!" },
    ];
}

export default function Profile() {
    const [isLogoutSheetOpen, setIsLogoutSheetOpen] = useState<boolean>(false);
    const [isUpdateProfileDrawerOpen, setIsUpdateProfileDrawerOpen] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { user, logout } = useAuth();
    const [fullName, setFullName] = useState(user?.fullName ?? "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const navigate = useNavigate();
    const { subscribe } = useNotificationPermission();

    const logoutHandler = async () => {
        const subscription = await subscribe();
        setIsLoading(true);
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/auth/logout`,
                {
                    data: subscription,
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                logout();
                navigate("/");
                toast("Sampai ketemu lagi! 👋", customToastStyle);
            } else {
                toast(
                    "Yah, kayaknya ada yang salah. Coba lagi nanti, ya",
                    customToastStyle
                );
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                toast(
                    error.response?.data?.message ??
                        "Yah, kayaknya ada yang salah. Coba lagi nanti, ya",
                    customToastStyle
                );
                console.error(error.response?.data.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div
                className={`flex bg-gray-100 items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-50`}
            >
                <Dialog open={isLoading}>
                    <DialogContent className="flex flex-col items-center justify-center w-25 h-25 bg-white rounded-lg">
                        <DialogTitle></DialogTitle>
                        <DialogDescription></DialogDescription>
                        <Spinner size={30} className="text-primary" />
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 h-screen">
            <Header
                title="Profilku"
                showBack
                navigateTo="/technician/orders"
                isSticky
                showBorder={false}
                className="bg-none"
            />

            <div className="relative">
                <img
                    src={settingBg}
                    alt="settingBg"
                    className="w-full rounded-b-4xl -mt-25"
                />

                {/* Profile Card */}
                <div className="px-6 -mt-32 relative">
                    <div className="bg-white mx-auto mt-13 w-full rounded-2xl p-4 flex gap-4 items-start border-b-2 border-b-gray-300 normal-case">
                        {/* Avatar */}
                        <Avatar className="w-13 h-13 shrink-0">
                            <AvatarImage
                                className="w-full h-full rounded-full"
                                sizes="80px"
                                src={user?.avatarUrl}
                                alt={user?.fullName?.split(" ")[0]}
                            />
                            <AvatarFallback>
                                {user?.fullName?.split(" ")[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 flex justify-between items-center gap-3 min-w-0">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-semibold break-words">
                                    {user?.fullName}
                                </h2>
                                <p className="text-gray-800 font-light text-[15px] break-words">
                                    {user?.email}
                                </p>
                                <p className="text-gray-800 font-light text-[15px] break-words">
                                    +62{user?.phoneNumber}
                                </p>
                            </div>

                            {/* // !TODO : Uncomment when update profile feature is ready */}
                            {/* <IconButton
                                onClick={() =>
                                    setIsUpdateProfileDrawerOpen(true)
                                }
                                className="shrink-0 self-center"
                            >
                                <EditIcon
                                    className="text-gray-700"
                                    fontSize="medium"
                                />
                            </IconButton> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account settings */}
            <div className="mt-7 px-4">
                {/* Title */}
                <h1 className="font-medium text-sm text-gray-600 mb-2">Akun</h1>

                <div className="rounded-xl py-4 border border-gray-300 bg-white">
                    {/* Logout */}
                    <Button
                        onClick={() => setIsLogoutSheetOpen(true)}
                        className="w-full gap-2 px-4 rounded-none normal-case !font-[Rubik] text-gray-800 flex flex-col items-start"
                    >
                        <div className="flex w-full gap-4">
                            <LogoutIcon className="text-gray-700" />
                            <div className="flex items-center w-full border-b border-b-gray-300 pb-2">
                                <div className="flex flex-col items-start w-full">
                                    <p className="font-medium text-sm mb-1 text-gray-900">
                                        Keluar
                                    </p>
                                    <p className="font-light text-xs text-start !font-[Rubik]">
                                        Yakin mau keluar? Pas balik harus masuk
                                        akun lagi, ya.
                                    </p>
                                </div>
                                <ChevronRight className="text-gray-700 w-10 text-end" />
                            </div>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Logout Sheet Confirmation */}
            <Sheet open={isLogoutSheetOpen} onOpenChange={setIsLogoutSheetOpen}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-2xl max-w-lg mx-auto p-4 text-center"
                >
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl font-bold">
                            Yakin Mau Keluar?
                        </SheetTitle>
                        <SheetDescription className="text-base text-gray-600">
                            Sebelum keluar, pastikan semua pesanan sudah beres.
                            Tenang, semua data dan riwayat orderanmu tetap aman.
                            Sampai ketemu lagi!
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setIsLogoutSheetOpen(false)}
                            className="w-full h-12 rounded-full text-base font-semibold border-primary border text-primary normal-case !font-[Rubik] active:scale-95"
                        >
                            Gak jadi
                        </Button>

                        <Button
                            onClick={() => {
                                logoutHandler();
                                setIsLogoutSheetOpen(false);
                            }}
                            className="bg-red-600 text-white w-full h-12 rounded-full text-base font-semibold text-gray-600m normal-case !font-[Rubik] active:scale-95 disabled:bg-gray-300 disabled:text-gray-400"
                            disabled={isLoading}
                        >
                            Ya, keluar
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Profile Update Drawer */}
            <Drawer
                open={isUpdateProfileDrawerOpen}
                onOpenChange={setIsUpdateProfileDrawerOpen}
            >
                <DrawerContent className="max-w-lg mx-auto rounded-t-3xl h-[92%] scroll-smooth">
                    <div className="p-6 flex flex-col gap-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                Ubah Profil
                            </h2>
                            <Button
                                onClick={() =>
                                    setIsUpdateProfileDrawerOpen(false)
                                }
                                disabled={
                                    !fullName.trim() ||
                                    !phoneNumber.trim() ||
                                    !email.trim() ||
                                    (fullName === user?.fullName &&
                                        phoneNumber === user?.phoneNumber &&
                                        email === user?.email)
                                }
                                className="bg-primary text-white rounded-full px-5 py-2 font-semibold normal-case !font-[Rubik] active:scale-95 disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
                            >
                                SIMPAN
                            </Button>
                        </div>

                        {/* // ! TODO: CHANGE PROFILE IMAGE AND PROVIDE CLOUD STORAGE*/}
                        {/* <div className="flex items-center gap-4">
                            <IconButton>
                                <Avatar className="w-16 h-16">
                                    <AvatarImage
                                        src={user?.avatarUrl}
                                        alt={user?.fullName}
                                    />
                                    <AvatarFallback>
                                        {user?.fullName?.charAt(0) ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </IconButton>
                            <div>
                                <p className="text-sm font-medium">
                                    Pasang foto yang oke!
                                </p>
                                <p className="text-xs text-gray-500">
                                    Semua orang bakal bisa lihat.
                                </p>
                                <Button className="mt-2 rounded-full text-xs px-4 py-1 border border-primary">
                                    Tambah foto
                                </Button>
                            </div>
                        </div> */}

                        {/* Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-normal text-gray-700">
                                Nama <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Cth: John Doe"
                                defaultValue={user?.fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="border-b border-gray-300 py-2 text-base font-medium focus:outline-none focus:ring-primary focus:border-b-gray-800"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="flex flex-col">
                            <label className="text-xs font-normal text-gray-700">
                                Nomor HP <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center overflow-hidden font-medium gap-4">
                                <div className="flex gap-1 justify-center items-center bg-gray-100 rounded-full border-[0.5px] border-gray-300 mt-1 h-7 w-15">
                                    <ID title="Indonesia" className="w-3" />
                                    <p className="text-xs font-medium">+62</p>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Cth: 8xx-xxx-xxx"
                                    defaultValue={user?.phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value)
                                    }
                                    className="flex-1 py-2 text-base focus:outline-none border-b border-gray-300 focus:border-b-gray-800"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col">
                            <label className="text-xs font-normal text-gray-700">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Cth: namamu@domain.com"
                                defaultValue={user?.email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-b border-gray-300 py-2 text-base font-medium focus:outline-none focus:border-b-gray-800"
                            />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
