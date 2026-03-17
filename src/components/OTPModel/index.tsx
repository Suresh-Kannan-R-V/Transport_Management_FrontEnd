import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  CheckCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { useAssignmentStore, useUserStore } from "../../store";
import { cn, DRIVER_STATUS } from "../../utils/helper";
import toast from "react-hot-toast";
import { selectorStyles } from "../../utils/style";

interface OTPGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId: string | number | null; // Allow null
  title: string;
  onGenerate: (routeId: string | number) => Promise<any>;
  drivers: {
    driver_id: number;
    name: string;
    phone: string;
    status: number | null;
  }[];
}

export const OTPGeneratorModal = ({
  isOpen,
  onClose,
  routeId,
  title,
  onGenerate,
  drivers,
}: OTPGeneratorModalProps) => {
  const otp = useAssignmentStore((s) => s.otp);
  const encryptedOtp = useAssignmentStore((s) => s.encryptedOtp);
  const otpLoading = useAssignmentStore((s) => s.otpLoading);
  const executeOTPAction = useAssignmentStore((s) => s.executeOTPAction);
  const clearOTP = useAssignmentStore((s) => s.clearOTP);
  const completeRouteAdmin = useAssignmentStore((s) => s.completeRouteAdmin);
  const role = useUserStore((s) => s.roleName);

  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(
    new Set(),
  );

  // 1. Stable Generate Function
  const handleGenerate = useCallback(() => {
    if (!routeId) return;
    executeOTPAction(onGenerate, Number(routeId));
    setTimeLeft(30);
  }, [executeOTPAction, onGenerate, routeId]);

  useEffect(() => {
    let interval: any;
    if (otp && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && interval) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otp, timeLeft]);

  const handleClose = () => {
    clearOTP();
    setTimeLeft(0);
    setSelectedDrivers(new Set());
    onClose();
  };
  useEffect(() => {
    if (otp && timeLeft === 0) {
      Promise.resolve().then(() => handleClose());
    }
  }, [timeLeft, otp]);

  const handleAdminComplete = async () => {
    if (!routeId) return;
    if (selectedDrivers.size === 0)
      return toast.error("Please select at least one driver");

    const driverIds = Array.from(selectedDrivers).map((id) => Number(id));
    const success = await completeRouteAdmin(Number(routeId), driverIds);
    if (success) handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      classNames={{
        backdrop: "bg-indigo-950/30",
        base: "border-1 border-slate-200 rounded-xl bg-white",
        header: "border-b-[1px] border-slate-100 p-6",
        footer: "border-t-[1px] border-slate-100 p-6",
        body: "py-8 px-6",
        closeButton: "hover:bg-rose-100 text-rose-500 top-4 right-4",
      }}
      isDismissable={false}
    >
      <ModalContent className="">
        <ModalHeader className="flex items-center pt-4 gap-3 pb-2">
          <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-indigo-500 text-[9px] uppercase tracking-widest font-extrabold">
              Secure Verification
            </p>
            <h1 className="text-2xl text-slate-900 tracking-tight font-bold">
              {title}
            </h1>
          </div>
        </ModalHeader>

        <ModalBody className="flex flex-col items-center pb-10 px-6">
          {!otp ? (
            <div className="flex flex-col items-center justify-center text-center w-full">
              <p className="text-sm text-slate-500 mb-6 max-w-60">
                Click the button below to generate a secure OTP for
              </p>
              <Button
                onPress={handleGenerate}
                className="bg-indigo-600 text-white font-bold rounded-lg px-8"
                startContent={
                  <RefreshCw
                    size={18}
                    className={cn(otpLoading && "animate-spin")}
                  />
                }
              >
                GENERATE OTP
              </Button>
              {role === "Transport Admin" && title.includes("End") && (
                <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      OR SELECT DRIVERS
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  <Select
                    placeholder="Select drivers"
                    selectionMode="multiple"
                    fullWidth
                    variant="bordered"
                    selectedKeys={selectedDrivers}
                    onSelectionChange={(keys) =>
                      setSelectedDrivers(keys as Set<string>)
                    }
                    className="w-full capitalize"
                    classNames={selectorStyles}
                    disabledKeys={drivers
                      .filter((d) => d.status !== DRIVER_STATUS.ON_TRIP)
                      .map((d) => String(d.driver_id))}
                  >
                    {drivers.map((d) => (
                      <SelectItem key={d.driver_id} textValue={d.name}>
                        <div className="flex gap-3 items-end justify-between">
                          <div className="flex items-end gap-2">
                            <p className="text-xs font-semibold capitalize">
                              {d.name}
                            </p>
                            {d.status === DRIVER_STATUS.ON_TRIP ? (
                              <span className="text-[7px] text-emerald-600 font-bold uppercase">
                                Active Trip
                              </span>
                            ) : (
                              <span className="text-[7px] text-slate-400 font-bold uppercase">
                                Available / Not Started
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[9px] flex gap-1 items-center">
                            <Phone size={10} />
                            +91 {d.phone}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>

                  <Button
                    onPress={handleAdminComplete}
                    isLoading={otpLoading}
                    className="font-bold bg-emerald-500 text-white rounded-lg px-8"
                    startContent={!otpLoading && <CheckCircle size={18} />}
                  >
                    Direct Complete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300 space-y-5">
              <div className="p-4 bg-white border-[6px] border-indigo-200 rounded-2xl shadow-inner">
                <QRCodeSVG value={encryptedOtp || ""} size={160} level="H" />
              </div>

              <div className="flex gap-2">
                {otp.split("").map((char, i) => (
                  <div
                    key={i}
                    className="size-12 bg-indigo-50 border-2 border-indigo-500 flex items-center justify-center rounded-2xl text-xl font-bold shadow-lg"
                  >
                    {char}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 shadow">
                <Timer
                  size={16}
                  className={cn(
                    timeLeft < 10
                      ? "text-rose-500 animate-pulse"
                      : "text-indigo-500",
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-black tabular-nums",
                    timeLeft < 10 ? "text-rose-500" : "text-slate-700",
                  )}
                >
                  Expires in 00:{timeLeft.toString().padStart(2, "0")}
                </p>
              </div>

              <Button
                variant="light"
                onPress={handleGenerate}
                isDisabled={otpLoading}
                className={cn(
                  "text-indigo-600 bg-indigo-50 shadow rounded-xl font-bold text-xs uppercase tracking-widest",
                  !otpLoading && "hidden",
                )}
              >
                {otpLoading && "Generating..."}
              </Button>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
