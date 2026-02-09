import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { FILE_BASE_URL } from "../../../api/base";
import { secondsToHMS } from "../../../utils/helper";

// const API_URL = import.meta.env.VITE_API_URL;

export const Dashboard = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [hours, setHours] = useState<number>(1);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: 250,
            },
            false
        );

        scanner.render(
            (decodedText) => {
                setSessionId(decodedText);
                scanner.clear();
            },
            (error) => {
                alert("error", error);
                // ignore scan errors
            }
        );

        return () => {
            scanner.clear().catch(() => { });
        };
    }, []);

    const approveLogin = async () => {
        if (!sessionId) return;

        try {
            const res = await fetch(`${FILE_BASE_URL}/auth/web-login-approve`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `TMS ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    sessionId,
                    accessHours: hours,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setMessage("✅ Web login approved successfully");
        } catch (err: any) {
            setMessage(`❌ ${err.message || "Approval failed"}`);
        }
    };
    const accessValue = localStorage.getItem("access");

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <h1 className="text-xl font-bold">Dashboard (TEST MODE)</h1>

            {!sessionId && (
                <>
                    <p className="text-gray-600">
                        Scan the QR shown on your laptop screen
                    </p>
                    <div id="qr-reader" style={{ width: 300 }} />
                </>
            )}

            {sessionId && (
                <div className="flex flex-col gap-3 items-center">
                    <p className="text-sm break-all">
                        <strong>Session ID:</strong> {sessionId}
                    </p>

                    <input
                        type="number"
                        min={1}
                        max={24}
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="border px-3 py-1 rounded"
                        placeholder="Access hours"
                    />

                    <button
                        onClick={approveLogin}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        Approve Web Login
                    </button>
                </div>
            )}

            {message && <p className="mt-3">{message}</p>}

            <p className="text-xs text-red-500 mt-6">
                ⚠️ TEMP TEST ONLY — remove before production
            </p>
        </div>
    );
};
