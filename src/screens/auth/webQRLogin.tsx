import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import { checkWebSession, createWebSession } from "../../api/auth";
import { cn } from "../../utils/helper";
import { useUserStore } from "../../store";

const POLL_INTERVAL = 2000;
const SESSION_DURATION = 120; // 2 minutes

export const WebQrLogin = () => {
    const navigate = useNavigate();

      const role = useUserStore((state) => state.role);
      const user = useUserStore((state) => state.user);
    

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<"IDLE" | "LOADING" | "ACTIVE" | "EXPIRED">("IDLE");
    const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION);

    const pollerRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const cleanup = () => {
        if (pollerRef.current) clearInterval(pollerRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleStartSession = async () => {
        setStatus("LOADING");
        try {
            const res = await createWebSession();
            setSessionId(res.data.sessionId);
            setTimeLeft(SESSION_DURATION);
            setStatus("ACTIVE");

            // Start Polling
            startPolling(res.data.sessionId);

            // Start Timer
            timerRef.current = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleExpiry();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setStatus("IDLE");
            alert("Failed to connect to server.");
        }
    };

    const startPolling = (id: string) => {
        pollerRef.current = window.setInterval(async () => {
            try {
                const res = await checkWebSession(id);
                if (res.data.status === "APPROVED") {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user", res.data.user);
                    cleanup();
                    navigate("/dashboard", { replace: true });
                }
            } catch (err: any) {
                if (err.response?.status === 410) handleExpiry();
            }
        }, POLL_INTERVAL);
    };

    const handleExpiry = () => {
        cleanup();
        setStatus("EXPIRED");
        setSessionId(null);
    };

    useEffect(() => {
        return cleanup; // Cleanup on unmount
    }, []);

    

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-10 bg-white shadow-xl rounded-2xl border border-gray-100 gap-6 min-w-md">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-indigo-500">Login to Web</h2>
                <p className="text-gray-500 text-sm mt-1">Authorized via Mobile Scanner</p>
            </div>

            <div className="relative flex items-center justify-center p-4 bg-white border-4 border-indigo-400 rounded-xl shadow-inner size-[300px]">
                {status === "ACTIVE" && sessionId ? (
                    <QRCode value={sessionId} size={300} level="H" color="#7c86ff" />
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                        {status === "LOADING" ? (
                            <div className="animate-spin rounded-full size-10 border-b-2 border-indigo-600" />
                        ) : (
                            <>
                                <div className="text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                    </svg>
                                </div>
                                <button
                                    onClick={handleStartSession}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                                >
                                    {status === "EXPIRED" ? "Regenerate QR" : "Generate QR Code"}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center">
                {status === "ACTIVE" && (
                    <>
                        <div className={`px-4 py-1 rounded-full text-sm font-mono font-bold transition-colors ${timeLeft < 20 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
                            EXPIRES IN: {formatTime(timeLeft)}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 text-center italic">
                            Scanning session will auto-close after <b>2 minutes</b>.
                        </p>
                    </>
                )}
            
                <p className={cn("px-4 py-1 rounded-full font-mono font-bold text-sm bg-indigo-100 text-indigo-500",
                    status === "EXPIRED" && "bg-red-100 text-red-500",
                    status === "ACTIVE" && "hidden"
                )}>
                    {status === "EXPIRED" ? "Session timed out. Click above to try again." : "Click above Button to Generate QR Code"}
                </p>
            </div>
        </div>
    );
};