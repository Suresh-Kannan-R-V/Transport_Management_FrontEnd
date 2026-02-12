import React from "react";
import { UserCircle, MapPin, Users, Car, CarFront } from "lucide-react";
import { cn } from "../../utils/helper";

interface RequestCardProps {
  name: string;
  requestId: string;
  status: "Pending" | "Confirmed" | "Assign";
  pickup: string;
  destination: string;
  date: string;
  guests: number;
  vehicleType: string;
}

export const RequestCard = ({
  name,
  requestId,
  status,
  pickup,
  destination,
  date,
  guests,
  vehicleType,
}: RequestCardProps) => {
  return (
    <div className="bg-white rounded-4xl shadow-md border-1 border-slate-200 hover:border-2 hover:border-indigo-400 overflow-hidden flex flex-col h-full">
      <div>
        <div className="flex justify-between items-center px-5 py-4 pb-3 border-b-2 border-slate-200">
          <div className="flex gap-4">
            <div className="bg-indigo-100 p-2 rounded-full h-fit">
              <UserCircle className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight truncate">
                {name}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
                {requestId}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "px-3 pt-1 rounded-full text-[11px] font-semibold shadow-sm",
              status === "Confirmed" && "bg-green-50 text-green-600",
              status === "Pending" && "bg-orange-100 text-orange-500",
              status === "Assign" && "bg-red-50 text-red-500",
            )}
          >
            {status}
          </span>
        </div>

        <div className="relative px-5 pt-3 pb-2 pl-5 space-y-6 mb-2 ">
          <div className="absolute left-[25px] top-5 bottom-0 w-[2px] rounded bg-slate-200" />
          <div className="relative">
            <div className="absolute top-1 size-3 rounded-full border-[3px] border-white bg-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241)]" />
            <div className="flex justify-between items-start ml-7 pt-0.5">
              <h4 className="font-bold text-sm">{pickup}</h4>
              <span className="text-[12px] font-bold text-slate-500">
                {date}
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-1 top-1">
              <MapPin className="text-indigo-600 fill-indigo-200" size={20} />
            </div>
            <h4 className="font-bold text-sm pt-0.5 ml-7">{destination}</h4>
          </div>
        </div>
      </div>

      <div className="bg-slate-100/70  px-6 pt-3 py-4 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-2.5 text-slate-500">
          <Users size={18} strokeWidth={2} />
          <span className="text-xs font-bold tracking-wide">
            {guests} Guests
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-500">
          <CarFront size={18} strokeWidth={2} />
          <span className="text-xs font-bold tracking-wide">{vehicleType}</span>
        </div>
      </div>
    </div>
  );
};
