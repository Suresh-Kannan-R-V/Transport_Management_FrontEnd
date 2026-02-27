import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ScrollShadow,
  Tooltip,
  DateRangePicker,
  type RangeValue,
  type DateValue,
} from "@heroui/react";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Info,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  Truck,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  BackButton,
  CustomPagination,
  GenericFilterDropdown,
  TransportLoader,
} from "../../../components";
import { useLeaveStore, useUserStore } from "../../../store";
import type { Leave } from "../../../store/ScheduleStore/LeaveStore";
import {
  cn,
  formatDateTime,
  LEAVE_TYPE,
  RouteStatus,
} from "../../../utils/helper";
import { LeaveApprovalModal } from "./leaveApprove";
import { FILE_BASE_URL } from "../../../api/base";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DateRangePickerStyles } from "../../../utils/style";

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
}

const requestFilterConfig = [
  {
    title: "Request Status",
    items: [
      { key: "status-1", label: "Pending", value: 1 },
      { key: "status-2", label: "Approved", value: 2 },
      { key: "status-3", label: "Rejected", value: 3 },
    ],
  },
  {
    title: "Leave Type",
    items: [
      { key: "sick", label: "Sick", value: 1 },
      { key: "casual", label: "Casual", value: 2 },
      { key: "emergency", label: "Emergency", value: 3 },
      { key: "other", label: "Other", value: 4 },
    ],
  },
];

const LeaveManagement = () => {
  const navigate = useNavigate();
  const roleName = useUserStore((state) => state.roleName);
  const {
    leaves = [],
    loading,
    totalPages,
    totalItems,
    fetchLeaves,
    updateLeaveStatus,
  } = useLeaveStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [leaveToReject, setLeaveToReject] = useState<Leave | null>(null);

  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(
    null,
  );
  const limit = 10;

  useEffect(() => {
    const formatDate = (date: DateValue | null | undefined) => {
      if (!date) return undefined;
      return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    };

    fetchLeaves(page, limit, {
      search: search || undefined,
      status: statusFilter ?? undefined,
      leave_type: typeFilter ?? undefined,
      from_date: formatDate(dateRange?.start),
      to_date: formatDate(dateRange?.end),
    });
  }, [page, search, statusFilter, typeFilter, dateRange]);

  const statusMap: Record<number, StatusConfig> = {
    1: {
      label: "Pending",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    2: {
      label: "Approved",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    3: {
      label: "Rejected",
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  };

  const handleFilterSelect = (sectionTitle: string, item: any) => {
    const value = Number(item.value); // Ensure it's a number for API consistency

    if (sectionTitle === "Request Status") {
      // Toggle logic: if same value clicked, set to null, else set new value
      setStatusFilter((prev) => (prev === value ? null : value));
    } else if (sectionTitle === "Leave Type") {
      setTypeFilter((prev) => (prev === value ? null : value));
    }
    setPage(1);
  };

  const handleReset = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setDateRange(null);
    setSearch("");
    setPage(1);
  };

  const handleDeleteLeave = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${FILE_BASE_URL}/api/leaves/delete/${id}`, {
        headers: { Authorization: `TMS ${token}` },
      });
      toast.success("Leave request deleted successfully");
      fetchLeaves(page, limit); // Refresh the list
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="px-4 pt-2">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex gap-4">
          <BackButton />
          <div>
            <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
              Administrative Control
            </p>
            <h1 className="text-3xl md:text-4xl text-slate-900 tracking-tight font-bold">
              Leave Requests
            </h1>
          </div>
        </div>
        <Button
          onPress={() => navigate("/schedule/create-leave")}
          startContent={<Plus size={18} strokeWidth={3} />}
          className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg duration-200"
        >
          Create Leave
        </Button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-3">
        <div className="relative w-full lg:w-72">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            isIconOnly
            onPress={() => fetchLeaves(page, limit)}
            variant="flat"
            className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
            startContent={<RefreshCcw size={16} strokeWidth={2} />}
          />
          <GenericFilterDropdown
            sections={requestFilterConfig}
            onFilterSelect={handleFilterSelect}
            onReset={handleReset}
            buttonLabel="Filter & Sort"
          />
          <div>
            <DateRangePicker
              selectorIcon={<Calendar size={16} className="text-slate-400" />}
              hideTimeZone
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setPage(1);
              }}
              variant="bordered"
              className="max-w-xs"
              classNames={{
                ...DateRangePickerStyles,
                inputWrapper: [
                  "bg-white border-2 border-white rounded-2xl shadow transition-all duration-200 hover:border-indigo-400",
                  "hover:bg-slate-50/50 min-h-[40px]",
                ],
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <TransportLoader size={60} />
        </div>
      ) : (
        <>
          <ScrollShadow className="flex flex-col gap-3 h-[calc(100vh-320px)] pr-2 pb-6 overflow-y-scroll custom-scrollbar">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="w-full bg-white border-2 border-slate-100 rounded-3xl p-5 hover:border-indigo-500 transition-all shadow-sm"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex gap-4 items-center lg:w-1/4">
                      <div className="p-3 rounded-2xl bg-slate-50 text-slate-600">
                        <UserIcon size={24} />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-lg font-bold text-slate-800 uppercase leading-tight truncate">
                          {leave.driver?.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate mb-1">
                          {leave.driver?.email}
                        </p>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border inline-block",
                            statusMap[leave.status ?? 1]?.bg,
                            statusMap[leave.status ?? 1]?.color,
                            statusMap[leave.status ?? 1]?.border,
                          )}
                        >
                          {statusMap[leave.status ?? 1]?.label || "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 flex-1 gap-4 w-full">
                      <div className="flex gap-10">
                        <DataMetric
                          label="Leave Period"
                          value={`${formatDateTime(leave.from_date)} - ${formatDateTime(leave.to_date)}`}
                          icon={<Calendar size={12} />}
                        />
                        <DataMetric
                          label="Duration"
                          value={`${leave.total_days} Days`}
                          icon={<Clock size={12} />}
                        />
                      </div>
                      <div className="flex gap-16">
                        <DataMetric
                          label="Type"
                          value={
                            LEAVE_TYPE[Number(leave.leave_type)] || "Unknown"
                          }
                          icon={<Briefcase size={12} />}
                        />

                        <div className="flex flex-col justify-center max-w-36">
                          <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
                            <ClipboardList size={12} /> Reason
                          </p>
                          <Tooltip
                            content={leave.reason}
                            placement="top"
                            classNames={{
                              content: [
                                "py-2 px-3 shadow-sm bg-white border-2 border-indigo-500 ",
                                "rounded-xl w-[250px] break-words text-xs font-medium leading-relaxed text-left",
                                "text-slate-700 text-left justify-start items-start",
                              ],
                            }}
                            showArrow={true}
                          >
                            <p className="text-xs font-bold text-slate-700 cursor-pointer truncate italic">
                              "{leave.reason}"
                            </p>
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {leave.status === 1 && roleName === "Transport Admin" ? (
                        <>
                          <Button
                            isIconOnly
                            size="sm"
                            className="bg-green-50 text-green-600 rounded-full"
                            onPress={() => {
                              setSelectedLeave(leave);
                              setIsApproveOpen(true);
                            }}
                          >
                            <CheckCircle size={18} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            className="bg-rose-50 text-rose-600 rounded-full"
                            onPress={() => {
                              setLeaveToReject(leave);
                              setIsRejectOpen(true);
                            }}
                          >
                            <XCircle size={18} />
                          </Button>
                        </>
                      ) : (
                        <Tooltip
                          placement="top"
                          classNames={{
                            content: [
                              "py-2 px-3 shadow-sm bg-white border-2 border-indigo-500 ",
                              "rounded-xl w-[250px] break-words text-xs font-medium leading-relaxed text-left",
                              "text-slate-700 text-left justify-start items-start",
                            ],
                          }}
                          showArrow={true}
                          content={
                            leave.status === 2
                              ? `Approved by ${leave.approver?.name || "Admin"} at ${formatDateTime(leave.updated_at)}`
                              : "Request Rejected"
                          }
                        >
                          <div className="p-2 bg-slate-50 rounded-full text-slate-400 cursor-help">
                            <Info size={18} />
                          </div>
                        </Tooltip>
                      )}

                      {roleName === "Driver" && leave.status === 1 && (
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-rose-50 text-rose-600 rounded-full"
                          onPress={() => {
                            setLeaveToReject(leave);
                            setIsRejectOpen(true);
                          }}
                        >
                          <XCircle size={18} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-8 gap-y-2 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-100 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Requested On:
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        {formatDateTime(leave.created_at)}
                      </span>
                    </div>
                    {leave.status === 2 && (
                      <div className="flex items-center gap-2 border-l border-slate-200 pl-8">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          Approved At:
                        </span>
                        <span className="text-[10px] font-bold text-green-600">
                          {formatDateTime(leave.updated_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {leave.current_assignment && (
                    <div className="flex flex-col gap-3 p-2 bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-2xl">
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                          <div className="p-1.5 bg-indigo-500 text-white rounded-lg">
                            <MapPin size={14} />
                          </div>
                          <span className="text-xs font-bold text-indigo-900 uppercase tracking-tighter text-nowrap">
                            Assigned Route
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
                          <DataMetric
                            label="Route"
                            value={leave.current_assignment.route_name}
                            icon={<MapPin size={12} />}
                          />
                          <DataMetric
                            label="Vehicle"
                            value={
                              leave.current_assignment.vehicle?.vehicle_number
                            }
                            icon={<Truck size={12} />}
                          />
                          <DataMetric
                            label="Vehicle Type"
                            value={
                              leave.current_assignment.vehicle?.vehicle_type
                            }
                            icon={<Briefcase size={12} />}
                          />
                          <DataMetric
                            label="Start Time"
                            value={formatDateTime(
                              leave.current_assignment.start_datetime,
                            )}
                            icon={<Clock size={12} />}
                          />
                          <DataMetric
                            label="End Time"
                            value={formatDateTime(
                              leave.current_assignment.end_datetime,
                            )}
                            icon={<Clock size={12} />}
                          />
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-nowrap text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {RouteStatus[leave.current_assignment.route_status] ||
                            "Unknown"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </ScrollShadow>

          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      )}

      <LeaveApprovalModal
        isOpen={isApproveOpen}
        onOpenChange={(open) => {
          setIsApproveOpen(open);
          if (!open) setSelectedLeave(null);
        }}
        leaveData={{
          id: selectedLeave?.id ?? 0,
          driver: selectedLeave?.driver,
          total_days: selectedLeave?.total_days,
          current_assignment: selectedLeave?.current_assignment,
        }}
        onSuccess={() => fetchLeaves(page, limit)}
      />
      {(roleName === "Transport Admin" || roleName === "Driver") && (
        <Modal
          isOpen={isRejectOpen}
          onOpenChange={(open) => {
            setIsRejectOpen(open);
            if (!open) setLeaveToReject(null);
          }}
          isDismissable={false}
          size="sm"
          classNames={{
            backdrop: "bg-indigo-950/10",
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
                <ModalBody className="text-center px-8 text-slate-500 py-6">
                  <div className="bg-white rounded-3xl w-full">
                    <h2 className="text-slate-900 text-xl font-bold">
                      {roleName === "Transport Admin"
                        ? "Reject Request"
                        : "Delete Request"}
                    </h2>
                    <p className="text-slate-500 mt-2">
                      {roleName === "Transport Admin"
                        ? "Are you sure you want to reject the leave for:"
                        : "Are you sure you want to permanently delete your request?"}
                    </p>
                    <p className="font-bold text-indigo-600 mt-1">
                      {leaveToReject?.driver?.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest mt-2 text-slate-400">
                      {leaveToReject?.total_days} Days (
                      {LEAVE_TYPE[Number(leaveToReject?.leave_type)] ||
                        "Unknown"}
                      )
                    </p>
                  </div>
                </ModalBody>
                <ModalFooter className="flex flex-col sm:flex-row gap-2 pt-2 pb-4">
                  <Button
                    fullWidth
                    variant="light"
                    onPress={onClose}
                    className="bg-slate-100 text-sm text-slate-600 font-medium rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    className="bg-rose-600 text-sm text-white font-medium rounded-md shadow-lg shadow-rose-200"
                    onPress={async () => {
                      if (leaveToReject) {
                        if (roleName === "Transport Admin") {
                          await updateLeaveStatus(Number(leaveToReject.id), 3);
                        } else {
                          await handleDeleteLeave(Number(leaveToReject.id));
                        }
                        fetchLeaves(page, limit);
                        onClose();
                      }
                    }}
                  >
                    Confirm{" "}
                    {roleName === "Transport Admin" ? "Reject" : "Delete"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

const DataMetric = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number | undefined;
  icon: React.ReactNode;
}) => (
  <div className="min-w-0">
    <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-0.5">
      {icon} {label}
    </p>
    <p
      className="text-xs font-bold text-slate-700 truncate"
      title={String(value)}
    >
      {value || "--"}
    </p>
  </div>
);

export default LeaveManagement;
