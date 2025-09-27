import { useNavigate } from "react-router";
import acHeroImage from "../assets/home-page.png";
import { Button } from "@mui/material";

export function Welcome() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen p-3">
            {/* Logo/Brand section */}
            <div className="flex gap-1 items-center">
                <img
                    src="/web-app-manifest-192x192.png"
                    alt="Logo"
                    className="w-9"
                />
                <h1 className="text-2xl font-bold">cdingin</h1>
            </div>

            {/* Hero image + text (centered) */}
            <div className="flex flex-col flex-1 justify-center items-center text-center px-5 md:px-11">
                <img
                    src={acHeroImage}
                    alt="AC Service"
                    className="w-full max-w-md mb-6"
                />
                <h2 className="text-2xl font-bold mb-2">
                    AC Gerah? Bikin Adem Lagi!
                </h2>
                <p className="font-light">
                    Cukup AC aja yang dingin, kamu jangan. Servis AC jadi
                    gampang tinggal klik, beres!
                </p>
            </div>

            {/* Navigation buttons at bottom */}
            <div className="w-full space-y-5 pb-6">
                <Button
                    onClick={() => navigate("/auth")}
                    className="w-full block h-[48px] rounded-full text-center text-[16px] font-semibold bg-primary text-white capitalize active:scale-95"
                >
                    Masuk
                </Button>
                <Button
                    onClick={() => navigate("/auth")}
                    className="w-full h-[48px] bg-white border-[1.5px] border-[#006C7F] text-[#006C7F] rounded-full text-center text-[16px] font-semibold cursor-pointer active:scale-95 capitalize"
                >
                    Belum ada akun? Daftar dulu
                </Button>
            </div>
        </div>
    );
}
