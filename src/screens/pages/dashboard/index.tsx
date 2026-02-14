import React from "react";
import {
  ShieldAlert,
  Clock,
  Car,
  Users,
  AlertTriangle,
  Flame,
  Search,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useUserStore } from "../../../store";

// Mock Data for the Utilization Chart
const utilizationData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 85 },
  { day: "Thu", value: 30 },
  { day: "Fri", value: 90 },
];

/**
 * Utility for joining class names
 */
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Dashboard = () => {
  const user = useUserStore((state) => state.user);

  return (
    <div className="w-full h-full animate-in fade-in duration-500 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-4xl text-slate-900 tracking-tight font-bold">
            Welcome,{" "}
            <span className="text-indigo-600 uppercase">
              {user?.name ?? "User"}
            </span>
          </h1>
        </div>

        {/* Local Page Search */}
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
      </div>

      {/* 2. Key Metrics Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        <StatCard title="Active" value="12" icon={<Car />} color="indigo" />
        <StatCard title="Pending" value="05" icon={<Clock />} color="amber" />
        <StatCard title="In Use" value="18" icon={<Users />} color="sky" />
        <StatCard
          title="On Duty"
          value="24"
          icon={<ShieldAlert />}
          color="emerald"
        />
        <StatCard
          title="Conflicts"
          value="02"
          icon={<AlertTriangle />}
          color="rose"
          pulse
        />
        <StatCard
          title="Emergency"
          value="01"
          icon={<Flame />}
          color="orange"
          pulse
        />
      </section>

      {/* 3. Operational Data Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Section: Assignments & Approvals */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          {/* Upcoming Assignments Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Upcoming Assignments
              </h3>
              <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                <Filter size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-left">
                  <tr>
                    <th className="px-8 py-5">Mission ID</th>
                    <th className="px-8 py-5">Vehicle / Driver</th>
                    <th className="px-8 py-5">Dep. Time</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-left">
                  <TableRow
                    id="M-9021"
                    vehicle="Toyota Hiace"
                    driver="John Wick"
                    time="14:30"
                  />
                  <TableRow
                    id="M-8842"
                    vehicle="Honda Civic"
                    driver="Sarah J."
                    time="16:00"
                  />
                  <TableRow
                    id="M-7721"
                    vehicle="Ford Transit"
                    driver="Mike Ross"
                    time="17:15"
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Requests Grid */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-800 text-lg">
                Pending Approvals
              </h3>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 uppercase tracking-widest shadow-sm">
                2 New Requests
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RequestCard
                id="REQ-101"
                faculty="Dr. Aris"
                date="Oct 12"
                pass="04"
              />
              <RequestCard
                id="REQ-102"
                faculty="Prof. Snape"
                date="Oct 14"
                pass="01"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Visual Analytics */}
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Utilization
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Weekly system load efficiency
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                    dy={12}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 25px 30px -5px rgba(0,0,0,0.08)",
                      padding: "16px",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={22}>
                    {utilizationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value > 80 ? "#6366f1" : "#cbd5e1"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-10 p-6 bg-indigo-50 rounded-[2rem] flex justify-between items-center group cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-100">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] leading-none mb-2">
                  Weekly Peak
                </p>
                <p className="text-2xl font-black text-indigo-900">
                  Friday (90%)
                </p>
              </div>
              <div className="bg-white p-3 rounded-2xl text-indigo-600 group-hover:translate-x-1.5 transition-transform border border-indigo-100 shadow-sm">
                <ChevronRight size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Internal Page Components ---

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactElement<{ size?: number }>;
  color: string;
  pulse?: boolean;
}

interface TableRowProps {
  id: string;
  vehicle: string;
  driver: string;
  time: string;
}

interface RequestCardProps {
  id: string;
  faculty: string;
  date: string;
  pass: string;
}

const StatCard = ({ title, value, icon, color, pulse }: StatCardProps) => {
  const themes: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2.25rem] border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
      {pulse && (
        <span className="absolute top-6 right-6 flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${themes[color].split(" ")[1].replace("text", "bg")}`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${themes[color].split(" ")[1].replace("text", "bg")}`}
          ></span>
        </span>
      )}
      <div
        className={cn(
          "w-12 h-12 rounded-[1.25rem] flex items-center justify-center border group-hover:scale-110 transition-transform duration-300",
          themes[color],
        )}
      >
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-800 leading-none tracking-tight">
          {value}
        </p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-3">
          {title}
        </p>
      </div>
    </div>
  );
};

const TableRow = ({ id, vehicle, driver, time }: TableRowProps) => (
  <tr className="group hover:bg-slate-50/80 transition-colors">
    <td className="px-8 py-6">
      <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 shadow-sm">
        {id}
      </span>
    </td>
    <td className="px-8 py-6 text-left">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">
          <Car size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {vehicle}
          </p>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider mt-1">
            {driver}
          </p>
        </div>
      </div>
    </td>
    <td className="px-8 py-6 text-sm font-bold text-slate-600">{time}</td>
    <td className="px-8 py-6 text-right">
      <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
        <MoreVertical size={20} />
      </button>
    </td>
  </tr>
);

const RequestCard = ({ id, faculty, date, pass }: RequestCardProps) => (
  <div className="border border-slate-100 bg-slate-50/40 p-6 rounded-[2.25rem] flex justify-between items-center group hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/8 transition-all cursor-pointer">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 font-black text-xs text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
        {id.split("-")[1]}
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-slate-800">{faculty}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
          {date} • {pass} Passengers
        </p>
      </div>
    </div>
    <div className="bg-white p-3 rounded-xl text-slate-200 group-hover:text-indigo-500 border border-transparent group-hover:border-indigo-100 transition-all shadow-sm">
      <ChevronRight size={22} />
    </div>
  </div>
);

export default Dashboard;
