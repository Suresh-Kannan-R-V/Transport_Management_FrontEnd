import React from "react";
import { Plus, User, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequestCard } from "../../../components";
import { cn } from "../../../utils/helper";
import { Button } from "@heroui/react";

export const RequestPage = () => {
  const navigate = useNavigate();

  const requests = [
    {
      name: "Dr. Sarah Jenkins",
      requestId: "REQ-8821",
      status: "Pending",
      pickup: "Central Station, NY",
      destination: "JFK Airport, Terminal 4",
      date: "Oct 24, 2023",
      guests: 2,
      vehicleType: "Mini Sedan (4)",
    },
    {
      name: "Prof. James Wilson",
      requestId: "REQ-7652",
      status: "Confirmed",
      pickup: "Grand Hyatt Hotel",
      destination: "City Tour Loop",
      date: "Oct 28, 2023",
      guests: 4,
      vehicleType: "Luxury SUV (7)",
    },
  ];

  const leaves = [
    {
      name: "John Doe",
      duration: "Nov 01 - Nov 03",
      days: "3 Days",
      status: "Approved",
    },
    {
      name: "Mike Ross",
      duration: "Nov 05 - Nov 05",
      days: "1 Day",
      status: "Pending",
    },
    {
      name: "Harvey Specter",
      duration: "Nov 07 - Nov 08",
      days: "2 Days",
      status: "Approved",
    },
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500 ">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
            Transport System
          </p>
          <h1 className="text-2xl md:text-4xl text-slate-900 tracking-tight font-bold">
            Requests
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden lg:block">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Quick search missions..."
              className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm w-72 shadow-sm"
            />
          </div>
          <Button
            onPress={() => navigate("/request/leave-approve")}
            startContent={<Plus size={18} strokeWidth={3} />}
            className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg"
          >
            New
          </Button>
        </div>
      </div>

      {/* 2. Active Requests Section */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-slate-500">
            Active Requests
          </h2>
          <button className="flex items-center gap-1 text-indigo-500 font-semibold text-sm hover:underline hover:text-indigo-600 cursor-pointer">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => (
            <RequestCard key={req.requestId} {...req} />
          ))}
        </div>
      </div>

      {/* 3. Leaves Request Section (Matching bottom of image) */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">Leaves Request</h2>
          <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1">
            View All <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaves.map((leave, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-2xl">
                  <User size={20} className="text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{leave.name}</h4>
                  <p className="text-xs font-bold text-slate-400">
                    {leave.duration} ({leave.days})
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  leave.status === "Approved"
                    ? "bg-green-50 text-green-500"
                    : "bg-orange-50 text-orange-400",
                )}
              >
                {leave.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
