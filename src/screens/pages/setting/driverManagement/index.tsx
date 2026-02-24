import { Button, ScrollShadow, Select, SelectItem } from "@heroui/react";
import {
  Calendar,
  FilterIcon,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  Trash2,
  User,
  ShieldCheck,
  LogIn,
  BellRing,
  ShieldUser,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  BackButton,
  CustomPagination,
  TransportLoader,
} from "../../../../components";
import { cn } from "../../../../utils/helper";
import { useDriverStore } from "../../../../store/SettingStore/DriverStore";
import { selectorStyles } from "../../../../utils/style";

const DriverManagement = () => {
  // Store Hooks
  const {
    drivers = [],
    fetchDrivers,
    loading,
    deleteDriver,
    totalDrivers,
  } = useDriverStore();

  // Filter States
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("all");
  const [isLogin, setIsLogin] = useState<string>("all");
  const [pushStatus, setPushStatus] = useState<string>("all");
  const limit = 10;

  const totalPages = Math.ceil(totalDrivers / limit);

  const loadDrivers = () => {
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

        <div className="flex gap-3">
          <Button
            isIconOnly
            onPress={loadDrivers}
            variant="flat"
            size="md"
            className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl text-xs shadow"
            startContent={<RefreshCcw size={16} strokeWidth={2} />}
          />
          <Select
            placeholder="Status"
            size="sm"
            className="w-32"
            classNames={selectorStyles}
            onSelectionChange={(keys) =>
              setStatus(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="available">Available</SelectItem>
            <SelectItem key="assigned">Assigned</SelectItem>
            <SelectItem key="leave">Leave</SelectItem>
          </Select>

          <Select
            placeholder="Login"
            size="sm"
            className="w-28"
            classNames={selectorStyles}
            onSelectionChange={(keys) =>
              setIsLogin(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="true">Log In</SelectItem>
            <SelectItem key="false">Log Out</SelectItem>
          </Select>

          <Select
            placeholder="Push"
            className="w-28"
            size="sm"
            classNames={selectorStyles}
            onSelectionChange={(keys) =>
              setPushStatus(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="true">ON</SelectItem>
            <SelectItem key="false">OFF</SelectItem>
          </Select>
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
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <TransportLoader size={60} />
        </div>
      ) : (
        <>
          <ScrollShadow className="flex flex-col gap-2 h-[calc(100vh-330px)] px-2 custom-scrollbar mb-0 pb-4 overflow-y-auto">
            {" "}
            {drivers.length > 0 ? (
              drivers.map((d) => (
                <div
                  key={d.id}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group h-fit flex-shrink-0"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex gap-4 items-center lg:w-1/3">
                      <div
                        className={cn(
                          "p-3 rounded-2xl transition-colors",
                          d.status === "available"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600",
                        )}
                      >
                        <User size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">
                          {d.name}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          <p className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">
                            <ShieldUser size={13} className="inline mr-1" />
                            {d.user_name}
                          </p>
                          <span
                            className={cn(
                              "px-2 pt-0.5 rounded-full text-[9px] font-semibold uppercase border",
                              d.status === "available"
                                ? "bg-green-50 border-green-100 text-green-600"
                                : "bg-amber-50 border-amber-100 text-amber-600",
                            )}
                          >
                            {d.status}
                          </span>
                          {d.isLogin && (
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 pt-0.5 rounded-full text-[9px] font-semibold uppercase flex items-center gap-1">
                              <LogIn size={10} /> Online
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 flex-1 lg:px-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-4 lg:pt-0 gap-4">
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
                </div>
              ))
            ) : (
              <div className="bg-slate-50 rounded-[32px] py-20 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">
                  No drivers matching filters
                </p>
              </div>
            )}
          </ScrollShadow>

          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalDrivers}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

// Sub-component for individual metrics
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
