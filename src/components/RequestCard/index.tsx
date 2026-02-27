import { Card } from "@heroui/react";
import {
  ArrowRightLeft,
  CarFront,
  Milestone,
  Signpost,
  UserCircle,
  Users,
} from "lucide-react";
import {
  cn,
  formatDate,
  formatDuration,
  RouteStatus,
} from "../../utils/helper";

interface RequestCardItem {
  id: number;
  routeName: string;
  status: number;
  startLocation: string;
  destinationLocation: string;
  start_datetime: string;
  end_datetime?: string | null;
  travelType: string;
  passengerCount: number;
  approx_duration: number;
  vehicleAssigned?: string | null;
  intermediateStops: unknown[];
  createdBy: {
    name: string;
    faculty_id?: string | null;
    roles: {
      id: number;
      role: string;
    };
  };
}

const statusStyles: Record<number, string> = {
  1: "bg-amber-50 text-amber-500 border-amber-200 border", // Pending
  2: "bg-purple-50 text-purple-500 border-purple-200 border", // Vehicle Assigned
  3: "bg-purple-50 text-purple-500 border-purple-200 border", // Vehicle Reassigned
  4: "bg-indigo-50 text-indigo-500 border-indigo-200 border", // Faculty Approved
  5: "bg-teal-50 text-teal-500 border-teal-200 border", // Driver Assigned
  6: "bg-teal-50 text-teal-500 border-teal-200 border", // Driver Reassigned
  7: "bg-blue-50 text-blue-500 border-blue-200 border", // Started
  8: "bg-emerald-50 text-emerald-500 border-emerald-200 border", // Completed
  9: "bg-slate-50 text-slate-500 border-slate-200 border", // Cancelled
};

export const RequestCard = ({ item,onPress,isPressable }: { item: RequestCardItem, onPress?: () => void, isPressable?: boolean }) => {
  return (
    <Card
      isPressable={isPressable}
      onPress={onPress}
      className="bg-white duration-200 rounded-3xl shadow-sm border border-slate-200 hover:border hover:border-indigo-400 overflow-hidden flex flex-col h-full"
    >
      <div>
        <div className="flex justify-between items-center px-5 py-3 pb-2 sm:pb-2 border-b-2 border-slate-200">
          <div className="flex gap-3">
            <div className="bg-indigo-100 p-2 rounded-full h-fit">
              <UserCircle className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate uppercase">
                {item.routeName}
              </h3>

              <div className="flex justify-start items-center gap-2">
                <p
                  className={cn(
                    "text-[10px] capitalize font-semibold bg-indigo-100 px-3 rounded-full text-indigo-600 mt-0.5",
                    item.createdBy?.roles?.role === "Faculty" &&
                      "bg-green-100 text-green-600",
                  )}
                >
                  {item.createdBy?.roles?.role === "Transport Admin"
                    ? "Admin"
                    : item.createdBy?.roles?.role || "User"}
                </p>
                {item.createdBy?.faculty_id && (
                  <p className="text-[10px] sm:text-[11px] text-left font-semibold text-slate-400 tracking-widest uppercase">
                    {item.createdBy.faculty_id}
                  </p>
                )}
              </div>
            </div>
          </div>
          <p
            className={cn(
              "px-3 py-0.5 pb-[0.5px] rounded-full text-[11px] font-semibold shadow-sm capitalize",
              statusStyles[item.status] ||
                "bg-slate-50 text-slate-500 border-slate-200 border",
            )}
          >
            {RouteStatus[item.status] || "Unknown"}
          </p>
        </div>

        <div className="relative px-4 pt-1 pb-2 space-y-6 mb-1">
          <div className="w-full pt-2 px-0 bg-white rounded-xl space-y-2">
            <div className="flex items-center justify-between relative h-14">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 max-w-24 leading-tight overflow-hidden h-12">
                  {item.startLocation}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center mx-4 relative">
                {item.intermediateStops.length > 0 && (
                  <span className="absolute -top-5.5 font-semibold text-[11px] px-2 rounded-3xl text-indigo-600 bg-indigo-50">
                    {item.intermediateStops?.length} Stops
                  </span>
                )}
                <span className="text-[10px] sm:text-xs font-bold rounded-full bg-white px-3 z-10">
                  {formatDuration(item.approx_duration) || "-"}
                </span>

                <div className="absolute w-full border-t-2 border-dotted border-slate-300 top-2 flex justify-between items-center">
                  <div className="size-3 rounded-full bg-green-500 -ml-1.5 -mt-1.5" />
                  <div className="size-3 rounded-full bg-rose-500 -mr-0.5 -mt-1.5" />
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 text-center max-w-24 leading-tight overflow-hidden h-12">
                  {item.destinationLocation}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-xs font-bold text-center w-24">
                {formatDate(item.start_datetime)}
              </span>
              <span className="text-sm sm:text-xs font-bold text-slate-900 text-center w-24">
                {item.end_datetime ? formatDate(item.end_datetime) : "--:--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100/70  px-6 pt-2 py-3 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2.5 text-slate-500">
          <Users size={14} strokeWidth={2.5} />
          <span className="text-[11px] font-bold tracking-wide">
            {item.passengerCount} Guests
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 capitalize">
          {(item.travelType === "One Way" && (
            <Milestone size={16} strokeWidth={2} />
          )) ||
            (item.travelType === "Two Way" && (
              <Signpost size={16} strokeWidth={2} />
            )) || <ArrowRightLeft size={16} strokeWidth={2} />}
          <span className="text-[11px]   font-bold tracking-wide">
            {item.travelType}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500">
          <CarFront size={14} strokeWidth={2} />
          <span
            className={cn(
              "text-[11px] font-bold tracking-wide",
              !item.vehicleAssigned && "text-slate-400 italic",
            )}
          >
            {item.vehicleAssigned
              ? `Assigned (${item.vehicleAssigned})`
              : "Not Assigned"}
          </span>
        </div>
      </div>
    </Card>
  );
};
