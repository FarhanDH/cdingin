import bongkarACIcon from "~/assets/bongkar-ac.png";
import bongkarPasangACIcon from "~/assets/bongkar-pasang-ac.png";
import heroImage from "~/assets/hero.png";
import pasangACIcon from "~/assets/pasang-ac.png";
import washACIcon from "~/assets/wash-ac.png";
import cuciACIllustration from "~/assets/cuci-ac-illustration.png";
import pasangACIllustration from "~/assets/pasang-illustration.png";

export const services = [
    {
        id: 1,
        label: "Cuci AC",
        icon: washACIcon,
        illustration: {
            title: "Napas Lega, Hati Senang",
            description:
                "AC bersih bikin udara sejuk dan sehat. Yuk, cuci AC Anda biar bebas debu dan kuman!",
            image: cuciACIllustration,
        },
        bgColor: "bg-[#D3F4FB]",
    },
    {
        id: 2,
        label: "Pasang AC",
        illustration: {
            title: "Adem Seketika, Gak Pake Ribet",
            description:
                "Beli AC baru? Biar kami yang pasang. Cepat, rapi, dan dijamin dingin maksimal!",
            image: pasangACIllustration,
        },
        icon: pasangACIcon,
        bgColor: "bg-[#FFE1DF]",
    },
    {
        id: 3,
        label: "Bongkar AC",
        icon: bongkarACIcon,
        illustration: {
            title: "Pindahan? AC-nya Kami Urus",
            description:
                "Mau pindah rumah atau ganti AC? Serahin urusan bongkar ke ahlinya. Aman dan tanpa bekas!",
        },
        bgColor: "bg-[#FFE1DF]",
    },
    {
        id: 4,
        label: "Bongkar & Pasang AC",
        illustration: {
            title: "Paket Komplit Pindahan AC",
            description:
                "Gak perlu pusing, kami siap bongkar AC lama dan pasang di tempat baru. Praktis dan beres!",
        },
        icon: bongkarPasangACIcon,
        bgColor: "bg-[#FBEED3]",
    },
];

export default function Home() {
    return (
        <div className="bg-white">
            <div className="w-full h-[200px]">
                <img
                    src={heroImage}
                    alt="hero"
                    className="bg-gray-200 w-full h-full object-cover"
                />
            </div>

            {/* Services */}
            <div className="p-4 space-y-8">
                {/* <p className="font-semibold text-lg">Layanan yang tersedia</p> */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                    {services.map((service) => (
                        <div key={service.id}>
                            <div className="flex flex-col items-center justify-center">
                                <div
                                    className={`shadow-md rounded-xl flex flex-col items-center justify-center w-14 h-14 ${service.bgColor}`}
                                >
                                    <img
                                        src={service.icon}
                                        alt={service.label}
                                        className="w-full mt-5 ml-7 object-bottom-right rounded-md"
                                    />
                                </div>
                                <p className="text-gray-700 text-xs text-center mt-2">
                                    {service.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    {/* <h2 className="font-semibold text-lg text-gray-900">
                        Layanan AC Profesional
                    </h2>
                    <p className="text-gray-500 text-base">
                        AC Anda gak dingin? Dengan teknisi yang berpengalaman,
                        siap benerin dan rawat AC Anda!
                    </p> */}

                    {/* Card */}
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="mt-4 bg-white flex flex-col items-start justify-start rounded-xl shadow-md"
                        >
                            <div className="bg-gray-100 flex items-center justify-center rounded-t-xl w-full h-[170px]">
                                <img
                                    src={service.illustration.image}
                                    alt=""
                                    className="h-full w-full rounded-t-xl object-left"
                                />
                            </div>
                            <div className="p-4">
                                <h2 className="font-semibold text-lg text-gray-900">
                                    {service.illustration.title}
                                </h2>
                                <p className="text-gray-500 text-base">
                                    {service.illustration.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
