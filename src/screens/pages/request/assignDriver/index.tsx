import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from "@heroui/react";
import axios from "axios";
import { ChevronDown, Phone, Search, User, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FILE_BASE_URL } from "../../../../api/base";
import { cn, DRIVER_STATUS, DriverStatus } from "../../../../utils/helper";

interface Driver {
  id: number;
  name: string;
  phone: string;
  user_name?: string;
  status?: number;
}

interface AssignDriverModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  scheduleId: number | null;
  VehicleId: string | null;
  // Added currentDriverId to differentiate between Assign and Reassign
  currentDriverId?: number | null;
  onSuccess: () => void;
}

export const AssignDriverModal = ({
  isOpen,
  onOpenChange,
  scheduleId,
  VehicleId,
  currentDriverId,
  onSuccess,
}: AssignDriverModalProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Logic to clear state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDriver(null);
      setSearchTerm("");
    }
  }, [isOpen]);

  const fetchDrivers = async (search: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // status=1 usually implies Available
      const response = await axios.get(
        `${FILE_BASE_URL}/api/drivers/all-drivers?status=1&search=${search}`,
        { headers: { Authorization: `TMS ${token}` } },
      );
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const delayDebounce = setTimeout(() => fetchDrivers(searchTerm), 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [searchTerm, isOpen]);

  const handleAssign = async () => {
    if (!selectedDriver || !scheduleId)
      return toast.error("Please select a driver");

    setAssigning(true);
    try {
      const token = localStorage.getItem("token");
      const isReassign = !!currentDriverId;

      // Determine URL and Payload based on current assignment status
      const url = isReassign
        ? `${FILE_BASE_URL}/request/update-driver-assign`
        : `${FILE_BASE_URL}/request/assign-driver`;

      const payload = isReassign
        ? { schedule_id: scheduleId, new_driver_id: selectedDriver.id }
        : { schedule_id: scheduleId, driver_id: selectedDriver.id };

      const resp = await axios.patch(url, payload, {
        headers: { Authorization: `TMS ${token}` },
      });

      if (resp.data.success) {
        toast.success(isReassign ? "Driver Reassigned!" : "Driver assigned!");
        onSuccess();
        onOpenChange();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      size="3xl"
      classNames={{
        backdrop: "bg-indigo-950/30",
        base: "border-1 border-slate-200 rounded-xl bg-white",
        header: "border-b-[1px] border-slate-100 p-6",
        footer: "border-t-[1px] border-slate-100 p-6",
        body: "py-8 px-6",
        closeButton: "hover:bg-rose-100 text-rose-500 top-4 right-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pt-5 pb-2">
              <div>
                <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-black">
                  {currentDriverId ? "Reassigning" : "Assigning"} Driver for
                  Vehicle{" "}
                  <span className="text-black text-sm font-bold">
                    ({VehicleId})
                  </span>
                </p>
                <h1 className="text-2xl text-slate-900 font-bold flex items-end justify-between gap-2 mr-10">
                  <span>
                    {currentDriverId ? "Update Driver" : "Assign Driver"}
                  </span>
                  <p className="text-slate-400 text-xs pb-0.5">
                    Available Drivers:{" "}
                    <span className="text-indigo-600 text-sm font-semibold">
                      {drivers.length}
                    </span>
                  </p>
                </h1>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="relative w-full">
                <Popover placement="bottom" className="w-full">
                  <PopoverTrigger>
                    <div
                      className={cn(
                        "flex items-center justify-between bg-slate-50 border-2 border-slate-100 p-3 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all group",

                        selectedDriver && "border-indigo-500",
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={cn(
                            "p-2 rounded-xl transition-colors",

                            selectedDriver
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 text-slate-500",
                          )}
                        >
                          <User size={20} />
                        </div>

                        <div className="w-full flex justify-between items-center">
                          <div>
                            <p
                              className={cn(
                                "text-sm font-medium",

                                !selectedDriver && "text-slate-400",
                              )}
                            >
                              {selectedDriver
                                ? selectedDriver.name
                                : "Choose a driver from the list..."}
                            </p>

                            {selectedDriver?.user_name && (
                              <p className="text-[10px] text-slate-400 font-medium">
                                @{selectedDriver.user_name}
                              </p>
                            )}
                          </div>

                          <div>
                            {selectedDriver?.phone && (
                              <p className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-500 flex items-center gap-1 hover:underline hover:text-indigo-600">
                                <Phone size={12} />

                                {selectedDriver?.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedDriver && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="danger"
                            className="rounded-lg"
                            onPress={() => {
                              setSelectedDriver(null);
                            }}
                            startContent={<X size={14} />}
                          />
                        )}

                        <ChevronDown
                          size={18}
                          className="text-slate-400 group-hover:text-indigo-500"
                        />
                      </div>
                    </div>
                  </PopoverTrigger>

                  <PopoverContent className="w-lg bg-white p-0 border border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/50 w-full">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />

                        <input
                          autoFocus
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="Search name or username..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <ScrollShadow className="max-h-60 w-full p-2 space-y-1.5 overflow-scroll custom-scrollbar">
                      {loading ? (
                        <div className="p-8 text-center text-slate-400 text-sm italic">
                          Searching drivers...
                        </div>
                      ) : drivers.length > 0 ? (
                        drivers.map((driver) => (
                          <div
                            key={driver.id}
                            onClick={() => setSelectedDriver(driver)}
                            className={cn(
                              "p-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between border-2 border-slate-100",

                              selectedDriver?.id === driver.id
                                ? "bg-indigo-50 border-indigo-100"
                                : "hover:bg-slate-50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                <UserCircle size={24} />
                              </div>

                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">
                                  {driver.name}
                                </span>

                                <span className="text-[10px] text-slate-400 font-medium">
                                  @{driver.user_name}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                <Phone size={10} /> {driver.phone}
                              </div>

                              <span
                                className={cn(
                                  "text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-tighter bg-gray-100 text-gray-500",

                                  driver.status === DRIVER_STATUS.AVAILABLE &&
                                    "bg-emerald-100 text-emerald-600",
                                )}
                              >
                                {DriverStatus[driver.status as number] || "-"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          No drivers found.
                        </div>
                      )}
                    </ScrollShadow>
                  </PopoverContent>
                </Popover>
              </div>
            </ModalBody>
            <ModalFooter className="flex gap-3 pb-5 pt-3 w-full">
              <Button
                fullWidth
                variant="light"
                className="bg-indigo-50 text-indigo-600 font-semibold rounded-lg"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                color="primary"
                isLoading={assigning}
                onPress={handleAssign}
                className="bg-indigo-600 text-white font-semibold rounded-lg"
              >
                {currentDriverId ? "Update Assignment" : "Confirm Assignment"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
