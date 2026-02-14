import { Button, Card } from "@heroui/react";
import { ChevronRight, Plus, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequestCard } from "../../../components";
import { cn } from "../../../utils/helper";

const RequestPage = () => {
  const navigate = useNavigate();

  const requests = [
    {
      name: "Dr. Sarah Jenkins",
      requestId: "REQ-8821",
      status: "Pending" as const,
      pickup: "Central Station, NY",
      destination: "JFK Airport, Terminal 4",
      date: "Oct 24, 2023",
      guests: 2,
      vehicleType: "Mini Sedan (4)",
      travelType: "One Way" as const,
    },
    {
      name: "Prof. James Wilson",
      requestId: "REQ-7652",
      status: "Confirmed" as const,
      pickup: "Grand Hyatt Hotel",
      destination: "City Tour Loop",
      date: "Oct 28, 2023",
      guests: 4,
      vehicleType: "Luxury SUV (7)",
      travelType: "Multi Day" as const,
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
    <div className="p-1 sm:p-8 animate-in fade-in duration-500 ">
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
            onPress={() => navigate("/request/new-request")}
            startContent={<Plus size={18} strokeWidth={3} />}
            className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg duration-200"
          >
            New
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 ">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-slate-500">
              Active Requests
            </h2>
            <Button className="flex items-center gap-1 text-indigo-500 rounded-lg font-semibold text-xs hover:underline hover:text-indigo-600 cursor-pointer duration-200">
              View All <ChevronRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {requests.map((req) => (
              <RequestCard key={req.requestId} {...req} />
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-slate-500">
              Leaves Request
            </h2>
            <Button
              onPress={() => navigate("/request/leave-approve")}
              className="flex items-center gap-1 text-indigo-500 font-semibold rounded-lg text-xs hover:underline hover:text-indigo-600 cursor-pointer duration-200"
            >
              View All <ChevronRight size={16} />
            </Button>
          </div>

          <div className="space-y-3">
            {leaves.map((leave, idx) => (
              <Card
                isPressable
                key={idx}
                className="bg-white p-3 rounded-3xl duration-200 border border-slate-100 hover:border-indigo-500 shadow-sm w-full "
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                      <User size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800">{leave.name}</h4>
                      <p className="text-xs font-semibold text-slate-400">
                        {leave.duration} ({leave.days})
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "px-3 pt-1 rounded-full text-[11px] font-semibold shadow-sm bg-orange-100 text-orange-500",
                        leave.status === "Approved" &&
                          "bg-green-50 text-green-600",
                      )}
                    >
                      {leave.status}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
