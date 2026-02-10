import { useState } from "react";
import { FILE_BASE_URL } from "../../../api/base";
import {
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  HistoryIcon,
  PlusSquareIcon,
  BellIcon,
  SearchIcon,
  Settings2Icon,
  TrendingUpIcon,
  Map,
  ChartNoAxesColumn,
  Compass,
  List,
  ListChecks,
} from "lucide-react";
import { useUserStore } from "../../../store";
import { cn } from "../../../utils/helper";

export const Dashboard = () => {
  const [sessionId, setSessionId] = useState<string | null>("TR-2041"); // Mocking an active ID like the mobile app
  const [hours, setHours] = useState<number>(1);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const user = useUserStore((state) => state.user);

  const approveLogin = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${FILE_BASE_URL}/auth/web-login-approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `TMS ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ sessionId, accessHours: hours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage({ text: "Web login approved successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Approval failed", type: "error" });
    }
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4">
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tighter text-slate-900 relative">
            Hello,{" "}
            <span className="text-indigo-500 font-semibold">
              {user?.name.toUpperCase()}
            </span>
          </h1>
        </div>
      </div>

      <div className="space-y-3 grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-3">
          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <SearchIcon
                size={20}
                className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Track Mission ID..."
              className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-14 shadow-md outline-none focus:ring-[1.5px] focus:ring-indigo-400 transition-all text-sm font-medium"
            />
            <div className="absolute inset-y-2 right-2 px-3 flex items-center bg-indigo-50 rounded-xl text-indigo-600 cursor-pointer hover:bg-indigo-100 transition-colors">
              <Settings2Icon className="w-5 h-5" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-400 mb-5 tracking-tight">
              Operational Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatusCard
                title="Active Now"
                value="TR-2041"
                sub="En-route"
                icon={<Map />}
                className="bg-indigo-50 text-indigo-600"
              />
              <StatusCard
                title="Pending"
                value="02 Req"
                sub="Admin Review"
                icon={<ClockIcon />}
                className="bg-orange-50 text-orange-500"
              />
              <StatusCard
                title="History"
                value="148 km"
                sub="This week"
                icon={<ChartNoAxesColumn strokeWidth={4} />}
                className="bg-teal-50 text-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="text-lg font-semibold text-gray-400 mb-5 tracking-tight">
                  Quick Actions
                </h2>
                <div className="flex gap-4">
                  <ActionBtn
                    label="New Req"
                    icon={<PlusSquareIcon />}
                    className="text-indigo-600 bg-indigo-50"
                  />
                  <ActionBtn
                    label="Mission"
                    icon={<Compass />}
                    className="text-sky-500 bg-sky-50"
                  />
                  <ActionBtn
                    label="Requests"
                    icon={<ListChecks />}
                    className="text-red-500 bg-red-50"
                  />
                  <ActionBtn
                    label="History"
                    icon={<HistoryIcon />}
                    className="bg-slate-600"
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="col-span-4 rounded-2xl p-6 pb-4 shadow-md border border-slate-100 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Notifications
            </h2>
            <button className="text-indigo-600 text-xs font-bold uppercase cursor-pointer px-4 py-1 rounded-full bg-indigo-100">
              See All
            </button>
          </div>
          <div className="space-y-2 h-[calc(100vh-280px)] overflow-y-scroll scrollbar-none">
            <NotificationItem
              title="Mission Started"
              body="Driver Assigned for TR-2041."
              time="Just Now"
              icon={<BellIcon />}
              color="bg-indigo-500"
            />
            <NotificationItem
              title="Approved"
              body="Your recurring shuttle is live."
              time="2h ago"
              icon={<ShieldCheckIcon />}
              color="bg-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ title, value, icon, className }: any) => (
  <div className=" rounded-2xl p-6 py-4 shadow-md border border-slate-50 transition-transform hover:-translate-y-1">
    <div
      className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-3",
        className,
      )}
    >
      {icon}
    </div>
    <div className="text-xl font-bold tracking-tighter text-slate-900">
      {value}
    </div>
    <div className="text-[10px] font-semibold text-gray-400 mt-1 tracking-wider">
      {title}
    </div>
  </div>
);

const ActionBtn = ({ label, icon, className }: any) => (
  <div className="min-w-36 rounded-2xl p-4 flex flex-col items-center gap-3 border border-slate-50 shadow-md cursor-pointer hover:shadow-md transition-all group">
    <div
      className={cn(
        "text-white p-2.5 shadow rounded-lg group-hover:scale-110 transition-transform",
        className,
      )}
    >
      {icon}
    </div>
    <span className="text-xs font-bold uppercase tracking-tighter">
      {label}
    </span>
  </div>
);

const NotificationItem = ({ title, body, time, icon, color }: any) => (
  <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 flex items-center gap-4 group cursor-pointer hover:border-indigo-300 transition-colors">
    <div className={`${color} p-2 rounded-xl text-white size-10`}>{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-black text-slate-800">{title}</h4>
        <span className="text-[10px] font-medium text-slate-400 uppercase">
          {time}
        </span>
      </div>
      <p className="text-xs text-slate-500 font-medium mt-1">{body}</p>
    </div>
  </div>
);
