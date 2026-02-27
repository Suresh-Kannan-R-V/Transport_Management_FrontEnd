import {
  Button,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import {
  getLocalTimeZone,
  parseZonedDateTime,
  today,
} from "@internationalized/date";
import axios from "axios";
import {
  Calendar,
  CalendarIcon,
  ChevronDown,
  Phone,
  Search,
  User,
  UserCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FILE_BASE_URL } from "../../../../api/base";
import { BackButton } from "../../../../components";
import { cn, LEAVE_TYPE } from "../../../../utils/helper";
import { DateRangePickerStyles, selectorStyles } from "../../../../utils/style";

const CreateLeave = () => {
  const navigate = useNavigate();
  const timeZone = getLocalTimeZone();

  // Helper to generate default date (2 days from now at 8 AM)
  const getInitialStartDate = () => {
    const d = today(timeZone).add({ days: 2 });
    return parseZonedDateTime(`${d.toString()}T08:00[${timeZone}]`);
  };

  const getInitialEndDate = () => {
    const d = today(timeZone).add({ days: 2 });
    return parseZonedDateTime(`${d.toString()}T17:00[${timeZone}]`);
  };

  // Form State
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [dateRange, setDateRange] = useState<any>({
    start: getInitialStartDate(),
    end: getInitialEndDate(),
  });
  const [leaveType, setLeaveType] = useState<string>("");
  const [reason, setReason] = useState("");

  // Drivers Data State
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Block Today, Tomorrow, and Past Dates
  const isDateUnavailable = (date: any) => {
    const currentToday = today(timeZone);
    const tomorrow = currentToday.add({ days: 1 });
    // Returns true if date is before or equal to tomorrow
    return date.compare(tomorrow) <= 0;
  };

  const fetchAvailableDrivers = async (search: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${FILE_BASE_URL}/api/drivers/all-drivers?search=${search}`,
        { headers: { Authorization: `TMS ${token}` } },
      );
      setDrivers(res.data.data);
    } catch (err) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableDrivers(searchTerm);
  }, [searchTerm]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d: any) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [drivers, searchTerm]);

  // Auto-calculate total days/hours
  const totalDays = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) return 0;
    const diffInMs =
      dateRange.end.toDate().getTime() - dateRange.start.toDate().getTime();
    const days = diffInMs / (1000 * 60 * 60 * 24);
    return days < 1 ? days.toFixed(1) : Math.ceil(days);
  }, [dateRange]);

  const handleCreateLeave = async () => {
    if (!selectedDriver || !dateRange || !leaveType || !reason) {
      return toast.error("Please fill all fields");
    }

    // Validation: Minimum 8 hours check
    const diffInHrs =
      (dateRange.end.toDate().getTime() - dateRange.start.toDate().getTime()) /
      (1000 * 60 * 60);
    if (diffInHrs < 8) {
      return toast.error("Leave duration must be at least 8 hours");
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        driver_id: selectedDriver.id,
        // Format: YYYY-MM-DD HH:mm:ss
        from_date: dateRange.start
          .toDate()
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        to_date: dateRange.end
          .toDate()
          .toISOString()
          .slice(0, 19)
          .replace("T", " "),
        leave_type: Number(leaveType),
        reason: reason,
      };

      const res = await axios.post(
        `${FILE_BASE_URL}/api/leaves/create`,
        payload,
        { headers: { Authorization: `TMS ${token}` } },
      );

      if (res.data) {
        toast.success("Leave request created successfully");
        navigate("/schedule");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <header className="flex items-center gap-4 mb-4">
        <BackButton />
        <div>
          <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
            Leave Management
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            Apply Driver Leave
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Select Driver
            </label>
            <Popover placement="bottom" className="w-full">
              <PopoverTrigger>
                <div
                  className={cn(
                    "flex items-center justify-between bg-slate-50 border-2 border-indigo-200 p-4 rounded-2xl cursor-pointer hover:border-indigo-600 transition-all group",
                    selectedDriver && "border-indigo-600 bg-indigo-50/30",
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
                      <p
                        className={cn(
                          "text-sm font-bold",
                          !selectedDriver && "text-slate-400",
                        )}
                      >
                        {selectedDriver
                          ? selectedDriver.name
                          : "Choose a driver..."}
                      </p>
                      {selectedDriver?.phone && (
                        <p className="bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone size={10} /> {selectedDriver.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={18} className="text-slate-400" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-lg bg-white p-0 border border-slate-200 shadow-2xl rounded-3xl overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 w-full">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      autoFocus
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none"
                      placeholder="Search driver name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollShadow className="max-h-60 w-full p-2 space-y-1 custom-scrollbar">
                  {loading ? (
                    <div className="p-8 text-center text-sm text-slate-400">
                      Loading...
                    </div>
                  ) : (
                    filteredDrivers.map((driver: any) => (
                      <div
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className={cn(
                          "group p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all border-2 border-slate-100",
                          selectedDriver?.id === driver.id
                            ? "bg-indigo-50"
                            : "hover:bg-indigo-50 hover:border-indigo-500",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <UserCircle
                            size={32}
                            className="text-slate-300 group-hover:text-indigo-600"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">
                              {driver.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              @{driver.user_name}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                          {driver.phone}
                        </div>
                      </div>
                    ))
                  )}
                </ScrollShadow>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Leave Period (8 AM - 5 PM Default)
              </label>
              <DateRangePicker
                selectorIcon={<Calendar size={16} className="text-slate-400" />}
                hideTimeZone
                aria-label="Leave Period"
                value={dateRange}
                onChange={setDateRange}
                variant="bordered"
                isDateUnavailable={isDateUnavailable}
                className="max-w-full"
                classNames={DateRangePickerStyles}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                Leave Type
              </label>
              <Select
                placeholder="Select type"
                variant="bordered"
                className="h-fit"
                selectedKeys={leaveType ? [leaveType] : []}
                onChange={(e) => setLeaveType(e.target.value)}
                classNames={selectorStyles}
              >
                {Object.entries(LEAVE_TYPE).map(([id, label]) => (
                  <SelectItem key={id}>{label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">
              Reason for Leave
            </label>
            <Textarea
              placeholder="Provide a detailed reason..."
              variant="bordered"
              value={reason}
              onValueChange={setReason}
              classNames={{
                inputWrapper:
                  "border-2 border-slate-100 rounded-2xl bg-white hover:border-indigo-500",
              }}
            />
          </div>

          <Button
            fullWidth
            size="lg"
            isLoading={submitting}
            onPress={handleCreateLeave}
            className="bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 mt-4"
          >
            Create Leave Request
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm relative overflow-hidden">
            <CalendarIcon
              className="absolute -right-4 -top-4 text-indigo-50 opacity-10"
              size={120}
            />

            <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
              Request Summary
            </h3>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <SummaryRow
                  label="Estimated Duration"
                  value={totalDays === 0 ? "---" : `${totalDays} Days`}
                />
              </div>

              <SummaryRow
                label="Leave Type"
                value={LEAVE_TYPE[Number(leaveType)] || "---"}
              />

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                  <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                    Impact Analysis
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  Driver will be unavailable from{" "}
                  <span className="font-bold text-indigo-600">
                    {dateRange?.start
                      ? `${dateRange.start.day}/${dateRange.start.month} ${String(dateRange.start.hour).padStart(2, "0")}:${String(dateRange.start.minute).padStart(2, "0")}`
                      : "..."}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-indigo-600">
                    {dateRange?.end
                      ? `${dateRange.end.day}/${dateRange.end.month} ${String(dateRange.end.hour).padStart(2, "0")}:${String(dateRange.end.minute).padStart(2, "0")}`
                      : "..."}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center w-full">
    <span className="text-xs text-indigo-600 font-bold uppercase tracking-tight">
      {label}
    </span>
    <span className="text-sm font-bold">{value}</span>
  </div>
);

export default CreateLeave;
