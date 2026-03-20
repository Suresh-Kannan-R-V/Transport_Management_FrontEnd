import {
  Button,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import {
  CheckCircle2,
  Fuel,
  UploadCloud
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FormInput } from "../../../../components";
import { useUserStore, useVehicleDashboardStore } from "../../../../store";
import { pickerStyles, selectorStyles } from "../../../../utils/style";

export const AddFuelModal = ({ isOpen, onClose, vehicleId }: any) => {
  const { addFuelLog, verifyFuelBill, fetchVehicleDashboard } =
    useVehicleDashboardStore();
  const { fuelBunks, roleName } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isMatches, setIsMatches] = useState<boolean | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    bunk_id: "",
    volume: "",
    bill_amount: "",
    curr_km: "",
    filled_at: null as any,
  });

  const isAdmin = roleName === "Transport Admin";

  // Logic to determine if submit is allowed based on your new rules
  const isSubmitDisabled = useMemo(() => {
    if (loading || verifying) return true;

    // Basic required fields for everyone
    if (
      !formData.bunk_id ||
      !formData.bill_amount ||
      !formData.volume ||
      !formData.filled_at
    )
      return true;

    // If Admin: File and isMatches are optional. Allow submit.
    if (isAdmin) return false;

    // If NOT Admin (Driver):
    // 1. If a file is selected, we MUST wait for verification to provide a result (true or false)
    if (file && isMatches === null) return true;

    return false;
  }, [loading, verifying, formData, isAdmin, file, isMatches]);

  const formatDateTime = (dateInput: any) => {
    if (!dateInput) return "";
    const d = new Date(dateInput.toString());
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setIsMatches(null);
      return;
    }

    // For Drivers: Validate fields needed for verification API before calling it
    if (
      !isAdmin &&
      (!formData.bunk_id || !formData.bill_amount || !formData.volume)
    ) {
      toast.error("Fill Bunk, Amount, and Volume first!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setIsMatches(null);

    // ONLY Verify via AI if NOT Admin
    if (!isAdmin) {
      setVerifying(true);
      const verifyData = new FormData();
      verifyData.append("bill_image", selectedFile);
      verifyData.append("bill_amount", formData.bill_amount);
      verifyData.append("volume", formData.volume);

      const selectedBunk = fuelBunks.find(
        (b) => b.id.toString() === formData.bunk_id,
      );
      verifyData.append("bunk_name", selectedBunk?.name || "");

      try {
        const res = await verifyFuelBill(verifyData);
        if (res && res.success) {
          setIsMatches(res.data.verified);
          res.data.verified
            ? toast.success("Verified!")
            : toast.error("Bill Mismatch");
        }
      } catch (err) {
        toast.error("Verification failed");
      } finally {
        setVerifying(false);
      }
    }
  };
  const handleClose = () => {
    setFormData({
      bunk_id: "",
      volume: "",
      bill_amount: "",
      curr_km: "",
      filled_at: null,
    });

    setFile(null);
    setIsMatches(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const finalPayload = new FormData();
    finalPayload.append("vehicle_id", String(vehicleId));
    finalPayload.append("bunk_id", String(formData.bunk_id));
    finalPayload.append("volume", String(formData.volume));
    finalPayload.append("bill_amount", String(formData.bill_amount));
    finalPayload.append("curr_km", String(formData.curr_km));
    finalPayload.append("filled_at", formatDateTime(formData.filled_at));

    if (file) {
      finalPayload.append("bill_file", file);
    }

    // Only send isMatches if NOT Admin AND a file exists
    if (!isAdmin && file) {
      finalPayload.append("isMatches", String(isMatches ?? false));
    }

    const success = await addFuelLog(finalPayload);
    if (success) {
      toast.success("Fuel Log Added!");
      fetchVehicleDashboard(vehicleId);
      onClose();
    } else {
      toast.error("Error: Please check inputs");
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      classNames={{
        backdrop: "bg-indigo-950/40",
        base: "border-none rounded-[24px] bg-white shadow-2xl",
        header: "px-8 pt-8 pb-2",
        footer: "px-8 pb-8 pt-4",
        body: "px-8 py-4",
        closeButton:
          "hover:bg-rose-50 text-rose-500 top-6 right-6 p-2 rounded-full",
      }}
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 pt-6 items-center text-indigo-600">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Fuel size={24} />
          </div>
          <span className="font-black uppercase text-slate-800">
            New Fuel Entry
          </span>
        </ModalHeader>

        <ModalBody className="px-8 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
                Select Fuel Bunk
              </label>
              <Select
                placeholder="Select Station"
                classNames={selectorStyles}
                selectedKeys={formData.bunk_id ? [formData.bunk_id] : []}
                onChange={(e) =>
                  setFormData({ ...formData, bunk_id: e.target.value })
                }
              >
                {fuelBunks.map((bunk) => (
                  <SelectItem key={bunk.id} textValue={bunk.name}>
                    {bunk.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <FormInput
              label="Odometer (KM)"
              type="number"
              value={formData.curr_km}
              onValueChange={(v) => setFormData({ ...formData, curr_km: v })}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <FormInput
              label="Liters"
              type="number"
              value={formData.volume}
              onValueChange={(v) => setFormData({ ...formData, volume: v })}
            />
            <FormInput
              label="Amount (₹)"
              type="number"
              value={formData.bill_amount}
              onValueChange={(v) =>
                setFormData({ ...formData, bill_amount: v })
              }
            />
            <DatePicker
              label="Filling Date"
              labelPlacement="outside"
              variant="flat"
              classNames={pickerStyles}
              onChange={(d) => setFormData({ ...formData, filled_at: d })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Upload Receipt {isAdmin && "(Optional)"}
            </label>
            <div
              onClick={() => !verifying && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[24px] p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                file
                  ? "bg-indigo-50/30 border-indigo-200"
                  : "bg-slate-50 border-slate-200 hover:border-indigo-400"
              }`}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />

              {verifying ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" color="primary" />
                  <p className="text-xs font-bold text-indigo-600 animate-pulse">
                    AI IS VERIFYING...
                  </p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 size={20} /> {file.name}
                  </div>
                  {!isAdmin && isMatches !== null && (
                    <div
                      className={`px-4 py-1 rounded-full text-[10px] font-black ${isMatches ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {isMatches ? "MATCH SUCCESS" : "DATA MISMATCH"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-500 tracking-tight">
                    Tap to upload bill
                  </p>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="px-8 pb-8 gap-3">
          <Button
            variant="light"
            onPress={handleClose}
            className="rounded-lg font-bold text-indigo-400 bg-indigo-50 px-10"
          >
            Cancel
          </Button>
          <Button
            isLoading={loading}
            isDisabled={isSubmitDisabled}
            onPress={handleSubmit}
            className={`font-bold text-sm rounded-lg shadow-lg transition-all ${
              isSubmitDisabled
                ? "bg-slate-100 text-slate-400"
                : "bg-indigo-600 text-white"
            }`}
          >
            {isAdmin ? "SUBMIT DIRECT LOG" : "SUBMIT LOG"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
