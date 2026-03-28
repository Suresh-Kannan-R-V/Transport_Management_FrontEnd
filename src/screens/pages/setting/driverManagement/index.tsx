import { Button, Card, ScrollShadow } from "@heroui/react";
import {
  BellRing,
  Calendar,
  LogIn,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldUser,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  BackButton,
  CustomPagination,
  GenericFilterDropdown,
  NoDataFound,
  TransportLoader,
} from "../../../../components";
import { useDriverStore } from "../../../../store/SettingStore/DriverStore";
import { cn, DRIVER_STATUS } from "../../../../utils/helper";
import { useNavigate } from "react-router-dom";

const filterConfig = [
  {
    title: "Driver Status",
    items: [
      { key: "available", label: "Available", value: DRIVER_STATUS.AVAILABLE },
      { key: "assigned", label: "Assigned", value: DRIVER_STATUS.ASSIGNED },
      { key: "trip", label: "On Trip", value: DRIVER_STATUS.ON_TRIP },
      { key: "leave", label: "On Leave", value: DRIVER_STATUS.ON_LEAVE },
    ],
  },
  {
    title: "Login Status",
    items: [
      { key: "true-login", label: "Logged In", value: "true" },
      { key: "false-login", label: "Logged Out", value: "false" },
    ],
  },
  {
    title: "Push Notifications",
    items: [
      { key: "true-push", label: "Enabled (ON)", value: "true" },
      { key: "false-push", label: "Disabled (OFF)", value: "false" },
    ],
  },
];

const DriverManagement = () => {
  const navigate = useNavigate();
  const { drivers, fetchDrivers, loading, deleteDriver, totalDrivers } =
    useDriverStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [isLogin, setIsLogin] = useState<string>("all");
  const [pushStatus, setPushStatus] = useState<string>("all");

  // 1. Update limit to 10 to see more than one record at a time
  const limit = 10;

  // 2. Ensure totalPages calculation is based on the updated limit
  const totalPages = Math.max(1, Math.ceil(totalDrivers / limit));

  const loadDrivers = () => {
    // This query string will now correctly ask for page X with 10 records
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${search}`;
    if (status !== "all") query += `&status=${status}`;
    if (isLogin !== "all") query += `&isLogin=${isLogin}`;
    if (pushStatus !== "all")
      query += `&push_notification_status=${pushStatus}`;

    fetchDrivers(query);
  };

  useEffect(() => {
    loadDrivers();
  }, [page, search, status, isLogin, pushStatus]);

  // Handle page out of bounds (e.g., after a deletion)
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleFilterSelection = (sectionTitle: string, item: any) => {
    setPage(1);
    switch (sectionTitle) {
      case "Driver Status":
        setStatus(item.value);
        break;
      case "Login Status":
        setIsLogin(item.value);
        break;
      case "Push Notifications":
        setPushStatus(item.value);
        break;
    }
  };
  const handleReset = () => {
    setSearch("");
    setPage(1);
    setStatus("all");
    setIsLogin("all");
    setPushStatus("all");
    fetchDrivers(`?page=1&limit=${limit}`);
  };

  return (
    <div className="px-4 pt-2">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex gap-4">
          <BackButton />
          <div>
            <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
              Personal Operations
            </p>
            <h1 className="text-3xl md:text-4xl text-slate-900 tracking-tight font-bold">
              Driver Management
            </h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-3">
        <div className="relative hidden lg:block">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm w-72 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button
            isIconOnly
            onPress={handleReset}
            size="md"
            className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
            startContent={<RefreshCcw size={16} strokeWidth={2} />}
          />
          <GenericFilterDropdown
            sections={filterConfig}
            onFilterSelect={handleFilterSelection}
            onReset={handleReset}
            buttonLabel="Filter Drivers"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <TransportLoader size={60} />
        </div>
      ) : (
        <>
          <ScrollShadow className="flex flex-col gap-2 h-[calc(100vh-330px)] px-2 custom-scrollbar mb-0 pb-4">
            {" "}
            {drivers.length > 0 ? (
              drivers.map((d) => (
                <Card
                  key={d.id}
                  isPressable
                  onPress={() =>
                    navigate(
                      `/settings/driver-management/${btoa(d.user_id.toString())}`,
                    )
                  }
                  className="w-full bg-white text-left border-2 border-slate-100 rounded-2xl p-4 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group h-fit flex-shrink-0"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex gap-4 items-center lg:w-1/4">
                      <div
                        className={cn(
                          "p-3 rounded-2xl transition-colors",
                          d.status === "AVAILABLE"
                            ? "bg-green-50 text-green-600"
                            : d.status === "ASSIGNED"
                              ? "bg-amber-50 text-amber-600"
                              : d.status === "ON_TRIP"
                                ? "bg-cyan-50 text-cyan-600"
                                : "bg-rose-50 text-rose-600",
                        )}
                      >
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">
                          {d.name}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <p className="text-[10px] font-medium text-slate-400 tracking-widest">
                            <ShieldUser size={13} className="inline mr-1" />
                            {d.user_name}
                          </p>
                          <span
                            className={cn(
                              "px-2 pt-0.5 rounded-full text-[9px] font-semibold uppercase border",
                              d.status === "AVAILABLE"
                                ? "bg-green-50 border-green-100 text-green-600"
                                : d.status === "ASSIGNED"
                                  ? "bg-amber-50 border-amber-100 text-amber-600"
                                  : d.status === "ON_TRIP"
                                    ? "bg-cyan-50 border-cyan-100 text-cyan-600"
                                    : "bg-rose-50 border-rose-100 text-rose-600",
                            )}
                          >
                            {d.status === "AVAILABLE"
                              ? "Available"
                              : d.status === "ASSIGNED"
                                ? "Assign"
                                : d.status === "ON_TRIP"
                                  ? "On Trip"
                                  : "On Leave"}
                          </span>
                          {d.isLogin && (
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 pt-0.5 rounded-full text-[9px] font-semibold uppercase flex items-center gap-1">
                              <LogIn size={10} /> Online
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 flex-1 lg:px-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-4 lg:pt-0 gap-4">
                      <DataMetric
                        label="Employee Code"
                        value={d.employee_code}
                        icon={<Phone size={12} />}
                      />
                      <DataMetric
                        label="Contact"
                        value={d.phone}
                        icon={<Phone size={12} />}
                      />
                      <DataMetric
                        label="License No"
                        value={d.license_number}
                        icon={<ShieldCheck size={12} />}
                      />
                      <DataMetric
                        label="Experience"
                        value={`${d.experience_years} Years`}
                        icon={<Calendar size={12} />}
                      />
                      <DataMetric
                        label="Total Kilometer"
                        value={`${d.total_routes} - ${d.total_kilometer_drive} km`}
                        icon={<Calendar size={12} />}
                      />
                      <DataMetric
                        label="Notifications"
                        value={
                          d.push_notification_status ? "Enabled" : "Disabled"
                        }
                        icon={<BellRing size={12} />}
                      />
                    </div>

                    <div className="flex lg:flex-col justify-center gap-2">
                      <Button
                        isIconOnly
                        startContent={<Trash2 size={16} />}
                        onPress={() => deleteDriver(d.id)}
                        className="text-red-500 bg-red-50 rounded-full transition-all"
                      />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <NoDataFound data={"No Driver Found."} />
            )}
          </ScrollShadow>

          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalDrivers}
            limit={limit}
            onPageChange={(newPage) => {
              setPage(newPage);
              const scrollContainer =
                document.querySelector(".custom-scrollbar");
              if (scrollContainer) scrollContainer.scrollTop = 0;
            }}
          />
        </>
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
  value: string | number | null | undefined;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-col justify-center">
    <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1 mb-1">
      {icon} {label}
    </p>
    <p className="text-xs font-bold text-slate-700 truncate">{value || "--"}</p>
  </div>
);

export default DriverManagement;
