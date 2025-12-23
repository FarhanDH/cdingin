import ErrorIcon from "@mui/icons-material/Error";

interface AcProblemsCardProps {
    problems: string[];
}

export default function AcProblemsCard({
    problems,
}: Readonly<AcProblemsCardProps>) {
    return (
        <div className="p-4 bg-white rounded-xl shadow-xs border border-gray-200">
            <div className="flex items-center text-start">
                <div className="flex gap-4">
                    <div className="bg-orange-300 w-9 h-9 rounded-full flex items-center justify-center text-center">
                        <ErrorIcon className="w-20 text-white" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg">
                            Layanan / Keluhan
                        </h1>
                        <ul className="list-disc ml-4 text-sm text-gray-800">
                            {problems?.map((problem, index) => (
                                <li key={index}>{problem}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
