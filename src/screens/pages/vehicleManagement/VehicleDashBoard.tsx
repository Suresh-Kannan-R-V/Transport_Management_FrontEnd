import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Tabs,
  Tab,
  Divider,
  Button,
} from "@heroui/react";
import {
  Bus,
  Gauge,
  Fuel,
  MapPinned,
  Wrench,
  CalendarDays,
  Store,
  Banknote,
  History,
  Info,
  AlertTriangle,
  Plus,
  ArrowRight,
  Car,
} from "lucide-react";
import { cn } from "../../../utils/helper";

const vehicleData = {
  id: 1,
  vehicle_number: "TN-37-BY-1234",
  vehicle_type: "Bus",
  capacity: 45,
  status: "active",
  current_kilometer: 15450,
  mileage: 33.33,
  insurance_date: "2026-12-15",
  pollution_date: "2026-08-20",
  rc_date: "2030-05-10",
  fc_date: "2027-01-05",
  next_service_date: "2026-04-10",
  service_summary: {
    total_service_count: 12,
    total_spent_on_service: 45600.5,
  },
  maintenance_history: [
    {
      id: 101,
      service_title: "Engine Oil Change & Filter",
      maintenance_date: "2026-03-01T10:30:00",
      end_date: "2026-03-01T16:00:00",
      type: "Scheduled",
      shop_name: "ProTrack Service Hub",
      current_km_before: 14200,
      cost: 4500.0,
      description:
        "Full synthetic oil replacement, oil filter change, and air filter cleaning.",
      status: "completed",
    },
    {
      id: 102,
      service_title: "Brake Pad Replacement",
      maintenance_date: "2026-01-15T09:00:00",
      end_date: "2026-01-15T12:00:00",
      type: "Repair",
      shop_name: "City Auto Works",
      current_km_before: 12000,
      cost: 2800.0,
      description: "Front disc brake pads replaced due to wear squeal.",
      status: "completed",
    },
  ],
  fuel_history: [
    {
      id: 501,
      date: "2026-03-15T08:45:00",
      liters: 50.5,
      cost_per_liter: 102.5,
      total_cost: 5176.25,
      km_reading: 15400,
    },
    {
      id: 502,
      date: "2026-03-08T18:20:00",
      liters: 40,
      cost_per_liter: 102.5,
      total_cost: 4100.0,
      km_reading: 14800,
    },
  ],
  assigned_routes: [
    {
      schedule_id: 88,
      route_name: "Route A - City Morning Shuttle",
      start_time: "07:30 AM",
      end_time: "09:30 AM",
      driver_name: "John Doe",
    },
    {
      schedule_id: 92,
      route_name: "Route C - Industrial Evening Drop",
      start_time: "05:00 PM",
      end_time: "07:00 PM",
      driver_name: "Mike Smith",
    },
  ],
};

const VehicleDashboard = () => {
  const [activeTab, setActiveTab] = useState<string | number>("maintenance");

  return (
    <div className="p-6 space-y-4">
      <Card className="rounded-md border-2 border-dashed border-rose-100 bg-rose-50/30">
        <CardBody className="p-2 px-4 flex flex-row gap-4 items-center">
          <div className=" text-rose-600">
            <AlertTriangle size={16} />
          </div>
          <div className="w-full flex justify-between items-center">
            <p className="text-[10px] font-black uppercase text-rose-500">
              Maintenance Warning
            </p>
            <p className="text-sm text-rose-600 font-medium leading-tight">
              Service required within 3,000 KM or by April 10th.
            </p>
          </div>
        </CardBody>
      </Card>
      {/* Header Section (Unchanged per request) */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indio-600 rounded-2xl shadow-lg shadow-indigo-200">
            <Car size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
              {vehicleData.vehicle_number}
            </h1>
            <div className="flex gap-5 mt-1">
              <span
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase ",
                  vehicleData.status === "active"
                    ? "bg-green-100 text-green-600"
                    : "bg-amber-100 text-amber-600",
                )}
              >
                {vehicleData.status}
              </span>
              <span className="text-indigo-500 font-bold uppercase">
                {vehicleData.vehicle_type}
              </span>
              <p className="font-bold">
                Cap:{" "}
                <span className="text-indigo-600">{vehicleData.capacity}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Current KiloMeter
            </p>
            <p className="text-2xl font-black text-indigo-600">
              {vehicleData.current_kilometer.toLocaleString()}
              <span className="text-xs">KM</span>
            </p>
          </div>
          <Divider orientation="vertical" className="h-10" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Next Service
            </p>
            <p className="text-xl font-bold text-rose-500">
              {vehicleData.next_service_date}
            </p>
          </div>
        </div>
      </header>

      {/* Summary Stat Cards */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Services"
              value={vehicleData.service_summary.total_service_count}
              icon={<History className="text-blue-600" />}
            />
            <StatCard
              title="Total Maintenance Spent"
              value={`₹${vehicleData.service_summary.total_spent_on_service.toLocaleString()}`}
              icon={<Banknote className="text-emerald-600" />}
            />
            <StatCard
              title="Mileage"
              value={`${vehicleData.mileage.toLocaleString()} KM/L`}
              icon={<Gauge className="text-amber-600" />}
            />
          </div>
          <Card className="rounded-3xl shadow-sm border border-slate-200">
            <CardBody className="p-0">
              {/* Enhanced Tab Header with Action Button */}
              <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-100">
                <Tabs
                  aria-label="Vehicle Details"
                  variant="underlined"
                  color="primary"
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  className="bg-red-300"
                  classNames={{
                    tabList: "gap-6",
                    cursor: "w-full bg-indigo-600",
                  }}
                >
                  <Tab
                    key="maintenance"
                    title={
                      <div className="flex items-center gap-2 font-bold">
                        <Wrench size={16} /> Maintenance
                      </div>
                    }
                  />
                  <Tab
                    key="fuel"
                    title={
                      <div className="flex items-center gap-2 font-bold">
                        <Fuel size={16} /> Fuel Logs
                      </div>
                    }
                  />
                  <Tab
                    key="routes"
                    title={
                      <div className="flex items-center gap-2 font-bold">
                        <MapPinned size={16} /> Routes
                      </div>
                    }
                  />
                </Tabs>

                {/* Conditional Action Button */}
                <div className="pb-2">
                  {activeTab === "maintenance" && (
                    <Button
                      size="sm"
                      color="primary"
                      className="bg-indigo-600 font-bold rounded-xl"
                      startContent={<Plus size={16} />}
                    >
                      Log Maintenance
                    </Button>
                  )}
                  {activeTab === "fuel" && (
                    <Button
                      size="sm"
                      color="primary"
                      className="bg-indigo-600 font-bold rounded-xl"
                      startContent={<Plus size={16} />}
                    >
                      Log Fuel
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "maintenance" && (
                  <div className="space-y-4">
                    {vehicleData.maintenance_history.map((m) => (
                      <div
                        key={m.id}
                        className="p-5 border-2 border-slate-50 bg-white hover:border-indigo-100 rounded-2xl transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800 uppercase tracking-tight">
                              {m.service_title}
                            </h4>
                            <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                              <Store size={12} /> {m.shop_name} •{" "}
                              {new Date(
                                m.maintenance_date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Chip
                            color="secondary"
                            variant="flat"
                            size="sm"
                            className="font-bold"
                          >
                            ₹{m.cost}
                          </Chip>
                        </div>
                        <p className="text-sm text-slate-600 italic border-l-4 border-indigo-200 pl-3 my-3">
                          "{m.description}"
                        </p>
                        <div className="flex gap-4 text-[10px] uppercase font-black text-slate-400">
                          <span>KM Before: {m.current_km_before}</span>
                          <span>Type: {m.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "fuel" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicleData.fuel_history.map((f) => (
                      <Card
                        key={f.id}
                        className="border-2 border-slate-50 shadow-sm rounded-2xl hover:border-indigo-100 transition-all"
                      >
                        <CardBody className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                              <Fuel size={20} />
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                Total Spent
                              </p>
                              <p className="text-lg font-black text-indigo-600">
                                ₹{f.total_cost}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">
                                Quantity
                              </p>
                              <p className="text-sm font-bold text-slate-700">
                                {f.liters} Liters
                              </p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">
                                Odometer
                              </p>
                              <p className="text-sm font-bold text-slate-700">
                                {f.km_reading.toLocaleString()} KM
                              </p>
                            </div>
                          </div>
                          <Divider className="my-2 opacity-50" />
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              {new Date(f.date).toLocaleDateString("en-GB")}
                            </p>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              className="text-indigo-600"
                            >
                              <ArrowRight size={16} />
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === "routes" && (
                  <div className="space-y-4">
                    {vehicleData.assigned_routes.map((r) => (
                      <div
                        key={r.schedule_id}
                        className="flex items-center gap-4 p-4 bg-white border-2 border-slate-50 rounded-2xl shadow-sm"
                      >
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                          <MapPinned size={20} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-800">
                            {r.route_name}
                          </h5>
                          <p className="text-xs text-slate-500 font-medium tracking-tight uppercase">
                            Driver: {r.driver_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Shift Timing
                          </p>
                          <p className="text-xs font-black text-indigo-600">
                            {r.start_time} - {r.end_time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar (Unchanged layout per request) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-900 text-white flex gap-2 items-center px-6 py-4">
              <Info size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Document Status
              </span>
            </CardHeader>
            <CardBody className="p-6 space-y-5 bg-white">
              <ExpiryItem
                label="Insurance Valid Till"
                date={vehicleData.insurance_date}
              />
              <ExpiryItem
                label="Pollution Valid Till"
                date={vehicleData.pollution_date}
              />
              <ExpiryItem
                label="Registration (RC) Date"
                date={vehicleData.rc_date}
              />
              <ExpiryItem
                label="Fitness (FC) Date"
                date={vehicleData.fc_date}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) => (
  <Card className="rounded-3xl shadow-sm border border-slate-200 px-2 py-1 bg-white">
    <CardBody className="flex flex-row items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
          {title}
        </p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </CardBody>
  </Card>
);

// Expiry Item Component
const ExpiryItem = ({ label, date }: { label: string; date: string }) => (
  <div className="flex justify-between items-center group">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700">{date}</p>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
      <CalendarDays size={16} className="text-indigo-400" />
    </div>
  </div>
);

export default VehicleDashboard;
