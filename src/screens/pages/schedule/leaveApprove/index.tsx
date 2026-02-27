import {
  Avatar,
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
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Phone,
  Search,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FILE_BASE_URL } from "../../../../api/base";
import { cn, DRIVER_STATUS, DriverStatus } from "../../../../utils/helper";

interface Driver {
  id: string | number;
  name: string;
  user_name?: string;
  phone?: string;
  avatar?: string;
  status: number;
}

interface LeaveApprovalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leaveData: {
    id: string | number;
    driver?: {
      avatar?: string;
      name: string;
    };
    total_days?: number;
    current_assignment?: {
      schedule_id: string | number;
      route_name: string;
    };
  };
  onSuccess: () => void;
}

export const LeaveApprovalModal = ({
  isOpen,
  onOpenChange,
  leaveData,
  onSuccess,
}: LeaveApprovalModalProps) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isAssigned = !!leaveData?.current_assignment;

  useEffect(() => {
    if (isOpen && isAssigned) {
      fetchAvailableDrivers("");
    }

    if (!isOpen) {
      setSelectedDriver(null);
      setSearchTerm("");
      setDrivers([]);
    }
  }, [isOpen, isAssigned]);

  const fetchAvailableDrivers = async (search: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${FILE_BASE_URL}/api/drivers/all-drivers?status=1&search=${search}`,
        { headers: { Authorization: `TMS ${token}` } },
      );
      setDrivers(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.user_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleProcess = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (isAssigned) {
        if (!leaveData.current_assignment || !selectedDriver)
          return toast.error(
            !leaveData.current_assignment
              ? "No active assignment found"
              : "Please select a replacement driver",
          );
        await axios.patch(
          `${FILE_BASE_URL}/request/update-driver-assign`,
          {
            schedule_id: leaveData.current_assignment?.schedule_id,
            new_driver_id: selectedDriver.id,
          },
          { headers: { Authorization: `TMS ${token}` } },
        );
      }
      const res = await axios.put(
        `${FILE_BASE_URL}/api/leaves/status/${leaveData.id}`,
        { status: 2 },
        { headers: { Authorization: `TMS ${token}` } },
      );
      if (res.data.success) {
        toast.success("Leave approved successfully");
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
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
        base: "border-1 border-slate-200 rounded-lg bg-white",
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
                  Action Required
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  Reassign Driver for Leave
                </h1>
              </div>
            </ModalHeader>

            <ModalBody className="py-5">
              <div className="bg-indigo-50/50 px-5 py-4 flex items-center justify-between rounded-2xl shadow">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={leaveData?.driver?.avatar}
                    name={leaveData?.driver?.name}
                    size="sm"
                    className="bg-indigo-600 text-white font-bold"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      Driver Name
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {leaveData?.driver?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Leave Duration
                  </p>
                  <p className="text-sm font-bold text-indigo-700">
                    {leaveData?.total_days} Days
                  </p>
                </div>
              </div>

              <div className="px-6 py-3 space-y-6">
                {isAssigned ? (
                  <>
                    <div className="flex gap-4 p-4 items-center rounded-xl bg-amber-50 border border-amber-200">
                      <AlertCircle className="text-amber-600" size={20} />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-amber-900 leading-none">
                          Driver is currently on duty
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Assigned to:{" "}
                          <span className="font-semibold">
                            {leaveData.current_assignment?.route_name}
                          </span>
                          . Replacement is required before approval.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                          Replacement Driver
                        </label>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                          Available Only
                        </span>
                      </div>
                      <Popover placement="bottom" className="w-full">
                        <PopoverTrigger>
                          <div
                            className={cn(
                              "flex items-center justify-between bg-white border-2 border-slate-100 p-3 rounded-2xl cursor-pointer hover:border-indigo-500 transition-all group",
                              selectedDriver &&
                                "border-indigo-500 bg-indigo-50/30",
                            )}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div
                                className={cn(
                                  "p-2 rounded-xl transition-colors",
                                  selectedDriver
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-400",
                                )}
                              >
                                <User size={20} />
                              </div>
                              <div className="w-full flex justify-between items-center pr-2">
                                <div>
                                  <p
                                    className={cn(
                                      "text-sm font-bold",
                                      !selectedDriver && "text-slate-400",
                                    )}
                                  >
                                    {selectedDriver
                                      ? selectedDriver.name
                                      : "Choose a replacement driver..."}
                                  </p>
                                  {selectedDriver?.user_name && (
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      @{selectedDriver.user_name}
                                    </p>
                                  )}
                                </div>
                                {selectedDriver?.phone && (
                                  <p className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500 flex items-center gap-1">
                                    <Phone size={10} /> {selectedDriver.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedDriver && (
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  color="danger"
                                  className="rounded-lg h-7 w-7"
                                  onPress={() => setSelectedDriver(null)}
                                >
                                  <X size={14} />
                                </Button>
                              )}
                              <ChevronDown
                                size={18}
                                className="text-slate-400 group-hover:text-indigo-500"
                              />
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] bg-white p-0 border border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
                          <div className="p-3 border-b border-slate-100 bg-slate-50/50 w-full">
                            <div className="relative">
                              <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                              />
                              <input
                                autoFocus
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Search name or experience..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>
                          <ScrollShadow className="max-h-60 w-full p-2 space-y-1 custom-scrollbar">
                            {loading ? (
                              <div className="p-8 text-center text-slate-400 text-sm">
                                Loading available drivers...
                              </div>
                            ) : filteredDrivers.length > 0 ? (
                              filteredDrivers.map((driver) => (
                                <div
                                  key={driver.id}
                                  onClick={() => setSelectedDriver(driver)}
                                  className={cn(
                                    "p-2.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between border-2 border-transparent",
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

                                        driver.status ===
                                          DRIVER_STATUS.AVAILABLE &&
                                          "bg-emerald-100 text-emerald-600",
                                      )}
                                    >
                                      {DriverStatus[driver.status as number] ||
                                        "-"}
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
                  </>
                ) : (
                  <div className="py-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">
                      Safe to Approve
                    </h4>
                    <p className="text-sm text-slate-500 max-w-72 truncate">
                      This driver has no active assignments during the leave
                      period.
                    </p>
                  </div>
                )}
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
                isLoading={loading}
                onPress={handleProcess}
                className="bg-indigo-600 text-white font-semibold rounded-lg"
              >
                Reassign Driver
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
