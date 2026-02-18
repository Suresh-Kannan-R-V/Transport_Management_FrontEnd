import { Card } from "@heroui/react";
import {
  ArrowRightLeft,
  CarFront,
  MapPin,
  UserCircle,
  Users,
} from "lucide-react";
import { cn, formatDateTime } from "../../utils/helper";
import { useNavigate } from "react-router-dom";

export const RequestCard = ({ item }: { item: any }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    const hashedId = btoa(item.id.toString());
    navigate(`/request/view-request/${hashedId}`);
  };

  return (
    <Card
      isPressable
      onPress={handleCardClick}
      className="bg-white duration-200 rounded-4xl shadow-md border border-slate-200 hover:border hover:border-indigo-400 overflow-hidden flex flex-col h-full"
    >
      <div>
        <div className="flex justify-between items-center px-5 py-3 pb-2 sm:pb-2 border-b-2 border-slate-200">
          <div className="flex gap-3">
            <div className="bg-indigo-100 p-2 rounded-full h-fit">
              <UserCircle className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                {item.routeName}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-left font-semibold text-slate-400 tracking-widest uppercase">
                {item.createdBy.faculty_id}
              </p>
            </div>
          </div>
          <p
            className={cn(
              "px-3 py-0.5 rounded-full text-[11px] font-semibold shadow-sm",
              item.status === "Confirmed" && "bg-green-50 text-green-600",
              item.status === "pending" && "bg-orange-100 text-orange-500",
              item.status === "Assign" && "bg-red-50 text-red-500",
            )}
          >
            {item.status}
          </p>
        </div>

        <div className="relative px-5 pt-3 pb-2 pl-5 space-y-6 mb-1">
          <div className="absolute left-6.5 top-5 h-14 border-l-2 border-dashed border-slate-300" />
          {/* {item.intermediateStops.length != 0 && (
            <div className="absolute left-14 top-10.5 flex gap-2">
              <div className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <div className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <div className="size-1.5 rounded-full bg-indigo-600 animate-pulse" />
            </div>
          )} */}
          <div>
            <div className="relative">
              <div className="absolute top-1 size-3 rounded-full border-[3px] border-white bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241)]" />
              <div className="flex justify-between items-start ml-7 pt-0.5">
                <h4 className="font-bold text-xs sm:text-sm w-60 text-left truncate">
                  {item.startLocation}
                </h4>
                <span className="text-[8px] sm:text-[8px] font-semibold text-slate-400">
                  {formatDateTime(item.start_datetime)}
                </span>
              </div>
            </div>

            <div className="relative mt-5">
              <div className="absolute -left-1 top-1">
                <MapPin className="text-indigo-600 fill-indigo-200" size={20} />
              </div>
              <div className="flex justify-between items-end pt-0.5">
                <h4 className="font-bold text-xs sm:text-sm pt-0.5 ml-7 w-60 text-left truncate">
                  {item.destinationLocation}
                </h4>
                {/* <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                  {formatDateTime(item.start_datetime)}
                </span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100/70  px-6 pt-3 py-4 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2.5 text-slate-500">
          <Users size={18} strokeWidth={2.5} />
          <span className="text-[11px] sm:text-xs font-bold tracking-wide">
            {item.passengerCount} Guests
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500">
          <ArrowRightLeft size={18} strokeWidth={2} />
          <span className="text-xs font-bold tracking-wide">
            {item.travelType}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500">
          <CarFront size={18} strokeWidth={2} />
          <span
            className={cn(
              "text-xs font-bold tracking-wide",
              !item.vehicleAssigned && "text-slate-400 italic",
            )}
          >
            {item.vehicleAssigned || "Not Assigned"}
          </span>
        </div>
      </div>
    </Card>
  );
};
