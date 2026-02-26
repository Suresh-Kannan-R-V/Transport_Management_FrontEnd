/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import {
  CheckCircle2,
  Clock,
  FilterIcon,
  Info,
  RefreshCcw,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BackButton } from "../../../../components";
import { cn } from "../../../../utils/helper";

const INITIAL_LEAVES = [
  {
    id: 1,
    name: "John Doe",
    start: "2023-02-01",
    end: "2023-02-03",
    days: 3,
    reason: "Family function in hometown.",
    vehicle: true,
    status: "Pending",
    isReassigned: false,
    schedule: {
      route: "Route A - North",
      startTime: "08:00 AM",
      endTime: "05:00 PM",
    },
  },
  {
    id: 2,
    name: "Mike Ross",
    start: "2023-11-05",
    end: "2023-11-05",
    days: 1,
    reason: "Medical checkup.",
    vehicle: false,
    status: "Pending",
    isReassigned: true,
    schedule: null,
  },
  {
    id: 3,
    name: "Harvey Specter",
    start: "2023-11-07",
    end: "2023-11-08",
    days: 2,
    reason: "Personal emergency.",
    vehicle: true,
    status: "Pending",
    isReassigned: false,
    schedule: {
      route: "Route C - South",
      startTime: "09:00 AM",
      endTime: "06:00 PM",
    },
  },
  // Add more mock data here to see pagination in action
];

const AVAILABLE_DRIVERS = [
  { label: "Robert Zane", value: "robert" },
  { label: "Louis Litt", value: "louis" },
  { label: "Jessica Pearson", value: "jessica" },
];

const LeaveApprovePage = () => {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [filterValue] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [newDriver, setNewDriver] = useState("");

  const filteredItems = useMemo(() => {
    return leaves.filter((leave) =>
      leave.name.toLowerCase().includes(filterValue.toLowerCase()),
    );
  }, [leaves, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const handleOpenReschedule = (leave: any) => {
    setSelectedLeave(leave);
    onOpen();
  };

  const confirmReschedule = () => {
    if (!newDriver) return toast.error("Please select a replacement driver");

    setLeaves((prev) =>
      prev.map((l) =>
        l.id === selectedLeave.id ? { ...l, isReassigned: true } : l,
      ),
    );

    toast.success(`Schedule reassigned to ${newDriver}`);
    onOpenChange();
    setNewDriver("");
  };

  const handleStatusToggle = (id: number) => {
    const leave = leaves.find((l) => l.id === id);

    if (leave?.vehicle && !leave.isReassigned) {
      return toast.error(
        "Please reschedule the vehicle duties before approving leave.",
      );
    }

    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const isCurrentlyApproved = l.status === "Approved";
          return {
            ...l,
            status: isCurrentlyApproved ? "Pending" : "Approved",
          };
        }
        return l;
      }),
    );
  };

  return (
    <div className="px-4 py-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <p className="text-indigo-600 text-[10px] uppercase tracking-[0.25em] font-extrabold">
              Transport System
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Leave Approval
            </h1>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative hidden lg:block">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Quick search missions..."
              className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm w-72 shadow-sm"
            />
          </div>
          <Button
            isIconOnly
            variant="flat"
            className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs shadow"
            startContent={<RefreshCcw size={16} strokeWidth={2} />}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs shadow"
                startContent={<FilterIcon size={16} />}
              >
                Filter & Sort
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              className="bg-white shadow-md rounded-2xl"
              aria-label="Filter Actions"
              disallowEmptySelection
              selectionMode="single"
            >
              <DropdownItem
                key="all"
                //   onClick={() => setFilterStatus("all")}
              >
                All Users
              </DropdownItem>
              <DropdownItem
                key="active"
                className="text-green-600"
                // onClick={() => setFilterStatus("active")}
              >
                Active
              </DropdownItem>
              <DropdownItem
                key="inactive"
                className="text-rose-600"
                // onClick={() => setFilterStatus("inactive")}
              >
                Inactive
              </DropdownItem>
              <DropdownItem
                key="asc"
                showDivider
                // onClick={() => setSortOrder("asc")}
              >
                Ascending (A-Z)
              </DropdownItem>
              <DropdownItem
                key="desc"
                //   onClick={() => setSortOrder("desc")}
              >
                Descending (Z-A)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_2fr_1.2fr] px-6 py-3 bg-slate-100/80 text-sm rounded-t-3xl text-indigo-600 font-bold shadow-sm border-x border-t border-slate-200">
          <span>Name</span>
          <span className="text-center">Start Date</span>
          <span className="text-center">End Date</span>
          <span className="text-center">Total Days</span>
          <span className="text-center">Vehicle</span>
          <span>Reason</span>
          <span className="text-right sticky right-0 pl-4">Status</span>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mt-3 px-0.5">
          {items.map((leave) => (
            <div
              key={leave.id}
              className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr_2fr_1.2fr] items-center px-6 py-4 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-400 transition-all group relative shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  {leave.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800 text-sm">
                  {leave.name}
                </span>
              </div>

              <span className="text-center text-sm text-slate-400 font-medium">
                {leave.start}
              </span>
              <span className="text-center text-sm text-slate-400 font-medium">
                {leave.end}
              </span>

              <div className="flex justify-center">
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                  {leave.days} DAYS
                </span>
              </div>

              <div className="flex justify-center">
                <Button
                  isDisabled={!leave.vehicle}
                  size="sm"
                  variant="flat"
                  onPress={() => handleOpenReschedule(leave)}
                  className={cn(
                    "text-xs font-bold uppercase px-3 rounded-xl",
                    leave.isReassigned
                      ? "bg-green-100 text-green-700"
                      : "bg-indigo-50 text-indigo-600",
                  )}
                >
                  {leave.vehicle
                    ? leave.isReassigned
                      ? "Rescheduled"
                      : "Scheduled"
                    : "None"}
                </Button>
              </div>

              <div className="relative flex items-center gap-2">
                <Tooltip
                  content={leave.reason}
                  placement="top-start"
                  showArrow
                  classNames={{
                    content:
                      "bg-white text-indigo-600 border-2 border-indigo-400 rounded-2xl max-w-96 p-3 text-xs shadow-xl",
                  }}
                >
                  <div className="flex items-center gap-2 cursor-pointer max-w-full">
                    <p className="text-xs font-medium text-slate-500 truncate">
                      {leave.reason}
                    </p>
                    <Info size={14} className="text-slate-300 shrink-0" />
                  </div>
                </Tooltip>
              </div>

              <div className="flex justify-end sticky right-0 bg-white group-hover:bg-indigo-50/10 pl-4 transition-colors">
                <Button
                  onPress={() => handleStatusToggle(leave.id)}
                  startContent={
                    leave.status === "Approved" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Clock size={16} />
                    )
                  }
                  className={cn(
                    "h-fit py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2",
                    leave.status === "Approved"
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-orange-50 text-orange-500 border-orange-100",
                  )}
                >
                  {leave.status}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex justify-center mt-8">
        <Pagination
          isCompact
          showControls
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
            cursor: "bg-indigo-600 shadow-indigo-200 shadow-lg",
          }}
        />
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: "rounded-[40px] p-2 bg-white shadow-lg" }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-indigo-600 font-black uppercase text-xs tracking-widest">
                  Duty Reassignment
                </h2>
                <p className="text-xl font-bold tracking-tight">
                  Schedule Details: {selectedLeave?.name}
                </p>
              </ModalHeader>
              <ModalBody>
                {selectedLeave?.schedule ? (
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Route
                      </p>
                      <p className="font-bold text-slate-700 text-md">
                        {selectedLeave.schedule.route}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Duration
                      </p>
                      <p className="font-semibold text-slate-600">
                        {selectedLeave.days > 1
                          ? `${selectedLeave.start} to ${selectedLeave.end}`
                          : selectedLeave.start}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Time Slot
                      </p>
                      <p className="font-semibold text-slate-600">
                        {selectedLeave.schedule.startTime} -{" "}
                        {selectedLeave.schedule.endTime}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-4 italic">
                    No schedule associated with this leave.
                  </p>
                )}

                <Divider className="my-2" />

                <Select
                  label="Select Available Driver"
                  placeholder="Choose replacement driver"
                  variant="bordered"
                  selectedKeys={newDriver ? [newDriver] : []}
                  onChange={(e) => setNewDriver(e.target.value)}
                  classNames={{ trigger: "border-2" }}
                >
                  {AVAILABLE_DRIVERS.map((driver) => (
                    <SelectItem key={driver.value}>{driver.label}</SelectItem>
                  ))}
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  //   onPress={onClose}
                  className="font-bold text-indigo-600 rounded-lg flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-600 text-white font-bold rounded-2xl px-10 shadow-lg shadow-indigo-100 flex-1"
                  onPress={confirmReschedule}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LeaveApprovePage;
