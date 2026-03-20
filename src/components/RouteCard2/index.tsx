import { Card, Chip, Tooltip } from "@heroui/react";
import {
  ArrowRightLeft,
  Calendar,
  Car,
  Clock,
  Milestone,
  ShieldCheck,
  Signpost,
  User,
} from "lucide-react";
import {
  cn,
  DRIVER_STATUS,
  formatDateTime,
  formatDuration,
  RouteStatus,
} from "../../utils/helper";
import { statusStyles } from "../../utils/style";

interface RouteCardItem {
  id: number;
  routeName: string;
  status: number;
  travelType: "One Way" | "Two Way" | "Multi Day";
  start_datetime: string;
  end_datetime: string | null;
  approx_duration: number;
  passengerCount: number;
  startLocation: string;
  destinationLocation: string;
  intermediateStops: string[];
  vehicleAssigned: number | string | null;
  driverAssigned?: number | string | null;
  drivers?: Array<{
    driver_id: number;
    name: string;
    phone: string;
    status: number | null;
  }>;
  createdAt?: string;
  updatedAt?: string;
  createdBy: {
    user_id: number;
    name: string;
    faculty_id: string | null;
    roles: {
      id: number;
      role: string;
    };
  };
}

export const AssignmentCard = ({
  item,
  onPress,
  isPressable = true,
}: {
  item: RouteCardItem;
  onPress?: () => void;
  isPressable?: boolean;
}) => {
  return (
    <Card
      isPressable={isPressable}
      onPress={onPress}
      className="group relative border-2 shadow-sm border-slate-100 hover:border-indigo-400 rounded-xl transition-all duration-300 w-full overflow-auto scrollbar-none"
    >
      <div className="relative p-4 px-5 flex flex-col lg:flex-row items-stretch gap-5 lg:gap-6 w-full">
        <div className="flex flex-col justify-between lg:min-w-52 w-full lg:w-auto border-b lg:border-b-0 border-slate-100 pb-4 lg:pb-0">
          <div className="flex items-center justify-between lg:justify-start lg:items-start gap-4">
            <div className="flex flex-col text-left">
              <h4 className="text-base lg:text-lg font-bold leading-tight tracking-tight truncate max-w-48 lg:max-w-52">
                {item.routeName}
              </h4>
              <div className="flex gap-2">
                <p
                  className={cn(
                    "text-[10px] w-fit capitalize font-semibold bg-indigo-100 px-3 rounded-full text-indigo-600 mt-0.5",
                    item.createdBy?.roles?.role === "Faculty" &&
                      "bg-green-100 text-green-600",
                  )}
                >
                  {item.createdBy?.roles?.role === "Transport Admin"
                    ? "Admin"
                    : item.createdBy?.roles?.role}
                </p>
                {item.createdBy?.faculty_id && (
                  <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">
                    • {item.createdBy.faculty_id}
                  </p>
                )}
              </div>
            </div>
            <div className="lg:hidden">
              <Chip
                variant="shadow"
                className={cn(
                  "h-6 px-1 text-[8px] font-extrabold uppercase tracking-widest",
                  statusStyles[item.status],
                )}
              >
                {RouteStatus[item.status]}
              </Chip>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-4 lg:gap-2 mt-3 lg:mt-0">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-indigo-600" />
              <p className="text-[10px] font-bold text-slate-500">
                {item.passengerCount} Guests
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-600" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 lg:px-5 py-3 border border-white shadow-inner flex flex-col justify-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full text-center md:text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                Origin
              </p>
              <h5 className="text-sm font-bold text-slate-80 w-full md:max-w-40 truncate text-center md:text-left">
                {item.startLocation?.split(",")[0]}
              </h5>
              <p className="text-[10px] text-slate-500 font-medium truncate italic">
                {item.startLocation?.split(",")[1]}
              </p>
            </div>

            <div className="flex flex-col items-center px-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="w-10 sm:w-16 lg:w-24 h-0.5 border-t-2 border-dotted border-indigo-200" />

                <Tooltip
                  content={
                    <div className="flex items-center gap-2 text-indigo-600 capitalize">
                      {item.travelType === "One Way" ? (
                        <Milestone size={14} />
                      ) : item.travelType === "Two Way" ? (
                        <Signpost size={14} />
                      ) : (
                        <ArrowRightLeft size={14} />
                      )}
                      <span className="text-[10px] font-bold tracking-wide text-slate-500">
                        {item.travelType}
                      </span>
                    </div>
                  }
                  showArrow
                  placement="bottom"
                  classNames={{
                    base: "before:bg-white",
                    content:
                      "py-1 px-3 shadow-xl shadow-indigo-400/50 bg-white backdrop-blur-md border border-white rounded-2xl",
                  }}
                >
                  <div className="p-1 bg-indigo-600 rounded-full text-white shrink-0 shadow-md">
                    <Car size={12} />
                  </div>
                </Tooltip>

                <div className="w-10 sm:w-16 lg:w-24 h-0.5 border-t-2 border-dotted border-indigo-200" />
                <div className="size-1.5 rounded-full bg-rose-500 shrink-0" />
              </div>
              <span className="text-[9px] font-bold text-indigo-600 mt-2 bg-indigo-100/50 px-2 py-0.5 rounded-full">
                {formatDuration(item.approx_duration) || 0}
              </span>
            </div>

            <div className="flex-1 w-full flex flex-col items-center md:items-end text-center md:text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                Destination
              </p>
              <h5 className="text-sm font-bold text-slate-800 block w-full md:max-w-40 truncate text-center md:text-right">
                {item.destinationLocation?.split(",")[0]}
              </h5>
              <p className="text-[10px] text-slate-500 font-medium truncate italic w-full">
                {item.destinationLocation?.split(",")[1]}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "w-full flex flex-col sm:flex-row items-center justify-center gap-3",
              item.end_datetime != null && "sm:justify-between",
            )}
          >
            <div className="flex items-center gap-1.5 ">
              <Clock size={12} className="text-indigo-600" />
              <p className="text-[9px] font-bold uppercase tracking-">
                {formatDateTime(item.start_datetime)}
              </p>
            </div>
            {item.end_datetime && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-indigo-600" />
                <p className="text-[9px] font-bold uppercase tracking-">
                  {formatDateTime(item.end_datetime)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col justify-between lg:min-w-48 w-full lg:w-auto gap-4">
          <div className="hidden lg:flex flex-col items-end">
            <span
              className={cn(
                "py-1 px-3 text-[10px] font-bold shadow-sm rounded-full",
                statusStyles[item.status],
              )}
            >
              {RouteStatus[item.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-3 w-full">
            <div className="flex flex-col lg:items-end">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-right">
                  Vehicle
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {item.vehicleAssigned
                  ? `${item.vehicleAssigned} Allotted`
                  : "Pending"}
              </p>
            </div>

            <div className="flex flex-col lg:items-end">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <User size={14} className="text-orange-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Driver
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {item.driverAssigned ? (
                  <>
                    {item.drivers?.filter(
                      (d) => d.status === DRIVER_STATUS.ON_TRIP,
                    ).length || 0}
                    /{item.driverAssigned} Started
                  </>
                ) : (
                  "Not Set"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
