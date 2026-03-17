import { Button, Card, DatePicker } from "@heroui/react";
import {
  parseDate,
  today,
  getLocalTimeZone,
  isWeekend,
} from "@internationalized/date";
import {
  AlertTriangle,
  ArrowRightLeft,
  Award,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplet,
  History,
  Mail,
  Map,
  MapPin,
  Milestone,
  Phone,
  Play,
  PlusCircle,
  Signpost,
  Square,
  TrendingUp,
  User,
  UserRound,
  UsersRound,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDriverDashboardStore } from "../../../store";
import { cn, DriverStatus, formatDuration } from "../../../utils/helper";
import { useParams } from "react-router-dom";
import { BackButton, TransportLoader } from "../../../components";
import { pickerStyles } from "../../../utils/style";

const DriverDashBoard = () => {
  const { driverId } = useParams();
  const decodedId = atob(driverId as string);
  const {
    driverInfo,
    ongoingRoute,
    upcomingRoutes,
    weeklyActivity,
    loading,
    fetchDashboardData,
    fetchWeeklyActivity,
  } = useDriverDashboardStore();

  const getCurrentMonday = (baseDate: Date = new Date()) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0)
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
  };

  const [currentWeekMonday, setCurrentWeekMonday] =
    useState<Date>(getCurrentMonday());

  const isNextDisabled =
    getCurrentMonday().getTime() <= currentWeekMonday.getTime();

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekMonday);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }

    setCurrentWeekMonday(newDate);
    const dateString = newDate.toISOString().split("T")[0];
    fetchWeeklyActivity(decodedId, dateString);
  };

  useEffect(() => {
    if (decodedId) {
      fetchDashboardData(decodedId);
    }
  }, [decodedId, fetchDashboardData]);

  const isLicenseExpiring = true;

  return (
    <div className="px-2 pb-0 pt-1 animate-in fade-in duration-500 h-full">
      {loading ? (
        <div className="h-full flex justify-center items-center overflow-hidden">
          <TransportLoader size={60} />
        </div>
      ) : (
        <>
          {!isLicenseExpiring && (
            <div className="bg-rose-100 border animate-pulse border-rose-500 px-4 py-2 rounded-lg mb-3 flex items-center justify-between gap-4">
              <div className="flex gap-2 items-center">
                <AlertTriangle size={18} className="text-rose-500" />
                <p className="text-rose-600 font-bold pt-1 text-[11px] uppercase tracking-widest">
                  Alert For Driver
                </p>
              </div>
              <div>
                <p className="text-rose-600 text-xs">
                  License Expires:{" "}
                  {driverInfo?.licenseExpiry
                    ? new Date(
                        driverInfo.licenseExpiry || "",
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
          <div className="mb-3 flex gap-3">
            <BackButton />
            <h1 className="text-2xl md:text-4xl text-slate-900 tracking-tight font-bold">
              Welcome,
              <span className="text-indigo-600 uppercase">
                {driverInfo?.name}
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <BigStat
              label="Total Distance"
              value={driverInfo?.totalKm}
              unit="KM"
              icon={<TrendingUp />}
              iconColor="emerald"
            />
            <BigStat
              label="Total Routes"
              value={driverInfo?.totalRoutes}
              unit="Runs"
              icon={<MapPin />}
              iconColor="orange"
            />
            <BigStat
              label="Leaves Taken"
              value={driverInfo?.totalLeaves}
              unit="Days"
              iconColor="rose"
              icon={<Calendar />}
            />
            <BigStat
              label="Exp. Years"
              value={driverInfo?.expYears}
              unit="Years"
              icon={<Award />}
              iconColor="purple"
            />
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {ongoingRoute && (
                <div>
                  <div className="flex gap-2 items-center mb-2 pl-4">
                    <div className="size-2 animate-pulse bg-indigo-500 rounded-full ring-3 ring-indigo-300" />
                    <p className="text-sm font-bold">On Going</p>
                  </div>

                  <Card className="bg-white rounded-3xl overflow-hidden shadow-sm p-2 border-2 border-slate-100">
                    <div className="px-4 py-2 flex justify-between items-center">
                      <div className="flex gap-4">
                        <div className="flex gap-3 items-center text-indigo-500">
                          <MapPin size={16} />
                          <p className="text-xs font-bold text-black">
                            {ongoingRoute.routeName}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="flex gap-2 text-indigo-500">
                          {(ongoingRoute.travelType === "One Way" && (
                            <Milestone size={16} strokeWidth={2} />
                          )) ||
                            (ongoingRoute.travelType === "Two Way" && (
                              <Signpost size={16} strokeWidth={2} />
                            )) || <ArrowRightLeft size={16} strokeWidth={2} />}
                          <p className="text-xs font-bold text-black">
                            {ongoingRoute.travelType}
                          </p>
                        </div>
                        <div className="flex gap-2 items-center text-indigo-500">
                          <Car size={16} />
                          <p className="text-xs font-bold text-black">
                            {ongoingRoute.vehicleNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 pb-8 relative">
                      <div className="flex items-center justify-between gap-8 relative z-10">
                        <div className="flex-1">
                          <h3 className="text-md font-semibold text-slate-800 leading-none">
                            {ongoingRoute.startLocation?.split(",")[0]}
                          </h3>
                          <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1">
                            <Calendar size={12} />{" "}
                            {ongoingRoute.startDate?.split(" ")[0]}
                          </p>
                        </div>

                        <div className="flex flex-col items-center min-w-3xs ">
                          <div className="flex items-center w-full gap-2 relative">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
                            <div className="flex-1 border-t-4 border-dotted border-slate-300 relative flex justify-center">
                              <div className="absolute -top-6">
                                {ongoingRoute.status === "Driver Assigned" ? (
                                  <Button
                                    size="sm"
                                    className="bg-indigo-600 text-white font-black text-[10px] rounded-full px-6 h-12 shadow-xl shadow-indigo-200 animate-bounce hover:animate-none"
                                    startContent={
                                      <Play size={14} fill="currentColor" />
                                    }
                                    //   onPress={() => handleStartTrip()}
                                  >
                                    START TRIP
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-indigo-50 text-indigo-500 font-bold text-[10px] rounded-full px-6 py-4 mt-1"
                                    startContent={
                                      <Square size={12} fill="currentColor" />
                                    }
                                    //   onPress={() => handleEndTrip()}
                                  >
                                    FINISH TRIP
                                  </Button>
                                )}
                              </div>

                              <div className="absolute top-9 bg-slate-100 px-3 py-1 rounded-full">
                                <p className="text-xs font-extrabold text-indigo-500 whitespace-nowrap">
                                  Est.{" "}
                                  {formatDuration(
                                    Number(ongoingRoute.duration),
                                  ) || "-"}
                                </p>
                              </div>
                            </div>

                            <div
                              className={cn(
                                "w-4 h-4 rounded-full shrink-0 bg-rose-500",
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex-1 text-right">
                          <h3 className="text-md font-semibold text-slate-800 leading-none">
                            {ongoingRoute.endLocation?.split(",")[0]}
                          </h3>
                          <p className="text-xs font-bold text-slate-400 mt-2 flex items-center justify-end gap-1">
                            {ongoingRoute.endDate?.split(" ")[0]}
                            <Calendar size={12} />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="border-2 border-dashed border-indigo-300 rounded-xl p-3 px-4 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-sm">
                        <DetailItem
                          icon={
                            <UserRound size={18} className="text-indigo-600" />
                          }
                          label="Creator Phone"
                          value={ongoingRoute.creatorPhone}
                        />
                        <DetailItem
                          icon={
                            <UsersRound size={18} className="text-indigo-600" />
                          }
                          label="Passengers"
                          value={ongoingRoute.guestCount}
                        />
                        <div className="flex flex-col">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Trip Status
                          </p>
                          <span
                            className={cn(
                              "size-fit font-bold uppercase text-[10px] px-4 py-1 rounded-full",
                              ongoingRoute.status === "Started"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-indigo-100 text-indigo-700",
                            )}
                          >
                            {ongoingRoute.status}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-3 cursor-pointer group"
                          // onClick={() =>
                          // window.open(`tel:${ongoingRoute.adminSOSPhone}`)
                          // }
                        >
                          <div className="p-2 rounded-full transition-colors">
                            <AlertTriangle
                              size={16}
                              className="text-rose-600"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-rose-400 uppercase leading-none mb-1">
                              Emergency SOS
                            </p>
                            <p className="text-xs font-bold text-rose-500 group-hover:underline">
                              Call Dispatch Office
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <Card className="p-4 rounded-3xl shadow-sm border-2 border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" /> Weekly
                    Activity
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-sm">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
                      onPress={() => handleWeekChange("prev")}
                    >
                      <ChevronLeft size={20} strokeWidth={2.5} />
                    </Button>

                    <div className="px-4 py-1 min-w-40 text-center">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                        Week Starting
                      </p>
                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {currentWeekMonday.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      isDisabled={isNextDisabled}
                      className={cn(
                        "rounded-xl transition-all",
                        isNextDisabled
                          ? "text-slate-300"
                          : "text-slate-600 hover:bg-white hover:shadow-sm",
                      )}
                      onPress={() => handleWeekChange("next")}
                    >
                      <ChevronRight size={20} strokeWidth={2.5} />
                    </Button>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyActivity}>
                      <defs>
                        <linearGradient
                          id="areaColor"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey={`date`}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94a3b8",
                          fontWeight: 700,
                          fontSize: 10,
                        }}
                        tickFormatter={(value) => {
                          const item = weeklyActivity.find(
                            (d) => d.date === value,
                          );
                          const datePart = value
                            ? value.split("-").slice(1, 3).reverse().join("-")
                            : "";
                          return item ? `${item.day} (${datePart})` : value;
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#cbd5e1", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          fontSize: "10px",
                          borderRadius: "20px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(value) => {
                          const item = weeklyActivity.find(
                            (d) => d.date === value,
                          );
                          return item
                            ? `${item.day}, ${value.split("-").reverse().join("-")}`
                            : value;
                        }}
                        formatter={(value, name) => {
                          if (name === "km")
                            return [`${value} KM`, "Total Distance"];
                          if (name === "routes")
                            return [
                              Array.isArray(value) ? value.length : value,
                              "Routes Completed",
                            ];
                          return [value, name];
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="km"
                        name="km"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fill="url(#areaColor)"
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="routes"
                        name="routes"
                        stroke="#8f949a"
                        strokeWidth={3}
                        fill="none"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg uppercase mb-3 flex items-center gap-3">
                  <User size={20} className="text-indigo-500" /> Driver Profile
                </h3>
                <div className="space-y-5">
                  <ProfileRow
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={driverInfo?.email}
                  />
                  <ProfileRow
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={driverInfo?.phone}
                  />
                  <div className="grid grid-cols-2 gap-5">
                    <ProfileRow
                      icon={<Award size={16} />}
                      label="Experience"
                      value={`${driverInfo?.expYears} Yrs`}
                    />
                    <ProfileRow
                      icon={<Clock size={16} />}
                      label="Licence Date"
                      value={driverInfo?.license}
                    />
                    <ProfileRow
                      icon={<Droplet size={16} />}
                      label="Blood"
                      value={driverInfo?.bloodGroup}
                    />
                    <ProfileRow
                      icon={<Car size={16} />}
                      label="Status"
                      value={
                        DriverStatus[
                          driverInfo?.status as keyof typeof DriverStatus
                        ] || "N/A"
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <Button
                    variant="flat"
                    className="bg-indigo-50 text-indigo-600 font-bold rounded-xl"
                    startContent={<History size={18} />}
                  >
                    View History
                  </Button>
                  <Button
                    className="bg-indigo-600 text-white font-bold rounded-xl"
                    startContent={<PlusCircle size={18} />}
                  >
                    Apply for Leave
                  </Button>
                </div>
              </div>
            </div>
            {upcomingRoutes.length > 0 && (
              <div className="col-span-12 grid space-y-4 mb-2">
                <h3 className="text-md font-bold text-slate-800 ml-1 mb-2 uppercase flex gap-2 items-center">
                  <Map size={18} className="text-indigo-500" />
                  Upcoming
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mx-2">
                  {upcomingRoutes.map((route, index) => (
                    <div
                      key={route.id || index}
                      className="group relative bg-white border-2 border-slate-100 rounded-2xl p-3 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all cursor-pointer overflow-hidden max-h-40"
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="flex-1 min-w-0 mr-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate uppercase tracking-tight">
                            {route.routeName}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold whitespace-nowrap">
                              {route.travelType}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold whitespace-nowrap">
                              {route.distance} KM
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-black text-indigo-600">
                            {route.startDate
                              ? new Date(route.startDate).toLocaleDateString(
                                  [],
                                  {
                                    month: "short",
                                    day: "numeric",
                                    timeZone: "UTC",
                                  },
                                )
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-1 items-center my-2 bg-slate-50/50 p-2 rounded-xl">
                        <div className="col-span-5">
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">
                            From
                          </p>
                          <p className="text-[11px] font-semibold text-slate-700 truncate">
                            {route.startLocation
                              ?.split(",")
                              .slice(0, 2)
                              .join(", ") || "N/A"}
                          </p>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <ArrowRightLeft
                            size={12}
                            className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                          />
                        </div>

                        <div className="col-span-5 text-right">
                          <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">
                            To
                          </p>
                          <p className="text-[11px] font-semibold text-slate-700 truncate">
                            {route.destinationLocation
                              ?.split(",")
                              .slice(0, 2)
                              .join(", ") || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2 border-t border-dashed border-slate-200 pt-2">
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar size={10} />
                          <p className="text-[9px] font-medium">
                            {route?.startDate
                              ? new Date(route.startDate).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "UTC",
                                  },
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <p className="text-[9px] font-medium italic">
                            Until{" "}
                            {route.endDate
                              ? new Date(route.endDate).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "UTC",
                                })
                              : "TBD"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const BigStat = ({ label, value, unit, icon, iconColor }: any) => {
  const themes: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    violet: "bg-violet-100 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
    emerald: "bg-emerald-50 text-emerald-600 ",
    rose: "bg-rose-50 text-rose-600",
    orange: "bg-orange-50 text-orange-600 ",
  };
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border-2 flex gap-5 border-slate-50 relative overflow-hidden group hover:border-indigo-300 transition-colors">
      <div
        className={cn(
          "flex items-center p-2.5 rounded-2xl bg-indigo-100 text-indigo-500",
          iconColor && themes[iconColor],
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-800">
          {value}{" "}
          <span className="text-[10px] font-bold text-indigo-500 uppercase ml-1">
            {unit}
          </span>
        </p>
      </div>
    </div>
  );
};
const DetailItem = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
  sub?: string;
}) => (
  <div className="flex items-center gap-4 group">
    <div className="p-2 rounded-2xl bg-slate-50 text-indigo-600 transition-colors duration-300">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
      {sub && (
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mt-0.5">
          {sub}
        </p>
      )}
    </div>
  </div>
);

const ProfileRow = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4">
    <div className="p-2.5 bg-slate-50 rounded-xl text-indigo-600 border border-slate-100">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter mb-0.5">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

export default DriverDashBoard;
