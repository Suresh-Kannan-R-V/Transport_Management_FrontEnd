import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import axios from "axios";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FILE_BASE_URL } from "../../../../api/base";

interface FacultyApprovalModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  routeId: string | number | null;
  onSuccess: () => void;
}

export const FacultyApprovalModal = ({
  isOpen,
  onOpenChange,
  routeId,
  onSuccess,
}: FacultyApprovalModalProps) => {
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!routeId) return;
    let decodedRouteId;
    try {
      decodedRouteId = Number(atob(routeId as string));
      if (isNaN(decodedRouteId)) {
        throw new Error("Invalid Route ID format");
      }
    } catch (err) {
      console.error("Decoding error:", err);
      toast.error("Error processing Route ID. Please refresh.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${FILE_BASE_URL}/request/change-route-status`,
        {
          route_id: decodedRouteId,
          status: "Faculty Confirmed",
          remark: remark || "All details verified by faculty",
        },
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        },
      );

      if (response.data.success) {
        toast.success("Route confirmed successfully!");
        onSuccess();
        onOpenChange(); // Close modal
        setRemark(""); // Reset remark
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      size="xl"
      classNames={{
        backdrop: "bg-indigo-950/30",
        base: "border-1 border-slate-200 rounded-xl bg-white",
        header: "border-b-[1px] border-slate-100 p-6",
        footer: "border-t-[1px] border-slate-100 p-6",
        body: "py-8 px-6",
        closeButton:
          "hover:bg-rose-100 active:bg-rose-200 text-rose-500 transition-colors cursor-pointer rounded-md top-4 right-4 p-2 text-lg",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h1 className="text-xl text-slate-900 font-bold">
                    Faculty Confirmation
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Please verify the details before confirming the route.
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="py-4">
              <Textarea
                label="Confirmation Remarks"
                variant="bordered"
                labelPlacement="outside"
                placeholder="e.g., All details verified by faculty"
                disableAnimation
                disableAutosize
                classNames={{
                  input: "min-h-[120px] text-sm text-slate-700",
                  label: "font-bold text-indigo-600 ml-1",
                  inputWrapper:
                    "rounded-2xl border-2 border-slate-200 shadow focus-within:border-indigo-500 transition-all",
                }}
                startContent={
                  <MessageSquareText
                    className="text-slate-400 mt-1"
                    size={18}
                  />
                }
                value={remark}
                onValueChange={setRemark}
              />
            </ModalBody>
            <ModalFooter className="flex gap-3 pb-3 pt-2 w-full">
              <Button
                variant="flat"
                className="flex-1 font-bold text-slate-500 rounded-xl"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                isLoading={loading}
                className="flex-1 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200"
                onPress={handleConfirm}
              >
                Confirm Status
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
