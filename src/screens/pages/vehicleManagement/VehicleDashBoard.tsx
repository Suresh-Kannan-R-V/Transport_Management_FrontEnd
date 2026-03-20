import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Tab,
  Tabs,
  useDisclosure
} from "@heroui/react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  Car,
  CircleCheckBig,
  CircleX,
  Fuel,
  Gauge,
  History,
  Info,
  MapPinned,
  Plus,
  Store,
  Wrench,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TransportLoader } from "../../../components";
import { useVehicleDashboardStore } from "../../../store";
import { cn } from "../../../utils/helper";
import { AddFuelModal } from "./models/addFuelModel";
import { AddMaintenanceModal } from "./models/addMaintenanceModal";

const VehicleDashboard = () => {
  const { vehicle_id } = useParams();
  const { vehicleData, fetchVehicleDashboard, loading } =
    useVehicleDashboardStore();
  const [activeTab, setActiveTab] = useState<string | number>("maintenance");
  const {
    isOpen: isMaintenanceOpen,
    onOpen: onMaintenanceOpen,
    onClose: onMaintenanceClose,
  } = useDisclosure();
  const {
    isOpen: isFuelOpen,
    onOpen: onFuelOpen,
    onClose: onFuelClose,
  } = useDisclosure();

  useEffect(() => {
    if (vehicle_id) {
      const decodedId = isNaN(Number(vehicle_id))
        ? atob(vehicle_id)
        : vehicle_id;
      fetchVehicleDashboard(decodedId);
    }
  }, [vehicle_id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <TransportLoader />
      </div>
    );
  if (!vehicleData)
    return <div className="p-10 text-center">No vehicle data found.</div>;

  const isAlert = new Date(vehicleData.next_service_date) < new Date();

  return (
    <div className="p-3 space-y-4">
      {isAlert && (
        <Card className="rounded-md border-2 border-dashed border-rose-100 bg-rose-50/30 shadow-none">
          <CardBody className="p-2 px-4 flex flex-row gap-4 items-center">
            <div className="text-rose-600">
              <AlertTriangle size={16} />
            </div>
            <div className="w-full flex justify-between items-center">
              <p className="text-[10px] font-black uppercase text-rose-500">
                Maintenance Overdue
              </p>
              <p className="text-sm text-rose-600 font-medium leading-tight">
                Scheduled service was due on{" "}
                {new Date(vehicleData.next_service_date).toLocaleDateString()}.
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
            <Car size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
              {vehicleData.vehicle_number}
            </h1>
            <div className="flex gap-5 mt-1">
              <span
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase",
                  vehicleData.status == 1
                    ? "bg-green-100 text-green-600"
                    : "bg-amber-100 text-amber-600",
                )}
              >
                {vehicleData.status == 1 ? "Active" : "On Trip"}
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
              Current Odometer
            </p>
            <p className="text-2xl font-black text-indigo-600">
              {vehicleData.current_kilometer.toLocaleString()}{" "}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Services"
              value={vehicleData.service_summary.total_service_count}
              icon={<History className="text-blue-600" />}
            />
            <StatCard
              title="Service Expenditure"
              value={`₹${vehicleData.service_summary.total_spent_on_service.toLocaleString()}`}
              icon={<Banknote className="text-emerald-600" />}
            />
            <StatCard
              title="Avg Mileage"
              value={`${vehicleData.mileage} KM/L`}
              icon={<Gauge className="text-amber-600" />}
            />
          </div>

          <Card className="rounded-xl shadow-sm border border-slate-200 max-h-96">
            <CardBody className="p-0">
              <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-100">
                <Tabs
                  aria-label="Details"
                  variant="underlined"
                  color="primary"
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  classNames={{
                    tabList: "gap-6 overflow-x-auto scrollbar-hide border-b-0",
                    cursor: "w-full bg-indigo-600 text-indigo-600",
                  }}
                >
                  <Tab
                    key="maintenance"
                    title={
                      <div className="flex items-center gap-2 font-bold">
                        <Wrench size={16} className=""/> Maintenance
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
                <div className="pb-2">
                  {activeTab === "maintenance" ? (
                    <Button
                      size="sm"
                      onPress={onMaintenanceOpen}
                      className="bg-indigo-600 font-bold text-white text-xs rounded-xl"
                      startContent={<Plus size={16} />}
                    >
                      Add Service
                    </Button>
                  ) : (
                    activeTab === "fuel" && (
                      <Button
                        size="sm"
                        onPress={onFuelOpen}
                        className="bg-indigo-600 font-bold text-white text-xs rounded-xl"
                        startContent={<Plus size={16} />}
                      >
                        Add Fuel
                      </Button>
                    )
                  )}
                </div>
              </div>

              <div className="p-4 overflow-y-auto custom-scrollbar">
                {activeTab === "maintenance" && (
                  <div className="space-y-4">
                    {vehicleData.maintenance_history.length > 0 ? (
                      vehicleData.maintenance_history.map((m) => (
                        <div
                          key={m.id}
                          className="p-5 border-2 border-slate-50 bg-white hover:border-indigo-400 rounded-2xl transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-slate-800 uppercase tracking-tight">
                                {m.service_title}
                              </h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1 font-medium italic">
                                <Store size={12} /> {m.shop_name} •{" "}
                                {new Date(
                                  m.maintenance_date,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="font-bold bg-indigo-100 text-indigo-500 px-4 rounded-full text-lg">
                              ₹{m.cost}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 italic border-l-4 border-indigo-200 pl-3 my-3">
                            "{m.description}"
                          </p>
                          <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-400">
                            <span>KM at Service: {m.current_km_before}</span>
                            <span>Type: {m.type}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 py-10">
                        No maintenance history found.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "fuel" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicleData.fuel_history.length > 0 ? (
                      vehicleData.fuel_history.map((f) => (
                        <Card
                          key={f.id}
                          isPressable
                          className="group border-none shadow-sm bg-white hover:bg-slate-50 transition-all duration-300 rounded-2xl overflow-hidden"
                        >
                          <CardBody className="p-0">
                            <div className="flex items-stretch h-full">
                              <div className="w-16 flex flex-col items-center justify-center bg-indigo-50/50 border-r border-slate-100 py-3">
                                <p className="text-[10px] font-black text-indigo-400 uppercase leading-none mb-1">
                                  {new Date(f.date).toLocaleString("en-GB", {
                                    month: "short",
                                  })}
                                </p>

                                <p className="text-xl font-black text-indigo-600 leading-none">
                                  {new Date(f.date).getDate()}
                                </p>

                                <div className="mt-3 p-1.5 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                                  <Fuel size={14} />
                                </div>
                              </div>
                              <div className="flex-1 p-4 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                      Refuel Session
                                      <Chip
                                        size="sm"
                                        variant="dot"
                                        color="primary"
                                        className="h-5 text-[9px] border-none"
                                      >
                                        {f.liters}L
                                      </Chip>
                                    </h4>

                                    <div className="flex items-center gap-1 mt-1">
                                      <Gauge
                                        size={12}
                                        className="text-slate-400"
                                      />

                                      <p className="text-[11px] font-bold text-slate-500 italic">
                                        Odometer:{" "}
                                        {f.km_reading.toLocaleString()} KM
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                      Amount Paid
                                    </p>

                                    <p className="text-xl font-black text-indigo-600 tracking-tight">
                                      <span className="text-xs font-bold mr-0.5">
                                        ₹
                                      </span>

                                      {f.total_cost.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="px-2 py-1 bg-slate-100 rounded-md">
                                      <p className="text-[9px] font-bold text-slate-500 uppercase leading-none">
                                        Rate: ₹{f.cost_per_liter}/L
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-3 items-center">
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isIconOnly
                                      startContent={<CircleX size={16} />}
                                      className="bg-rose-100 text-rose-500 font-bold p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                    />
                                    <Button
                                      size="sm"
                                      variant="flat"
                                      isIconOnly
                                      startContent={
                                        <CircleCheckBig size={16} />
                                      }
                                      className="bg-emerald-100 text-emerald-500 p-0.5 font-bold rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 py-10 w-full">
                        No fuel logs recorded.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "routes" && (
                  <div className="space-y-3">
                    {vehicleData.assigned_routes.map((r) => (
                      <div
                        key={r.schedule_id}
                        className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl"
                      >
                        <div className="p-3 bg-white rounded-xl text-indigo-600 border shadow-sm">
                          <MapPinned size={20} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-800 text-sm">
                            {r.route_name || "Unmapped Route"}
                          </h5>
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                            Driver: {r.driver_name || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Shift
                          </p>
                          <p className="text-xs font-black text-indigo-600">
                            {new Date(r.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
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

        <div className="lg:col-span-4 space-y-4">
          <Card className="rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <CardHeader className="bg-indigo-100 text-indigo-600 flex gap-2 items-center px-6 py-4">
              <Info size={18} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Documents
              </span>
            </CardHeader>
            <CardBody className="p-6 space-y-5 bg-white">
              <ExpiryItem
                label="Insurance Valid Till"
                date={vehicleData.insurance_date}
              />
              <ExpiryItem
                label="Pollution (PUC) Till"
                date={vehicleData.pollution_date}
              />
              <ExpiryItem label="RC Expiry Date" date={vehicleData.rc_date} />
              <ExpiryItem
                label="Fitness (FC) Date"
                date={vehicleData.fc_date}
              />
            </CardBody>
          </Card>
        </div>
      </div>
      <AddMaintenanceModal
        isOpen={isMaintenanceOpen}
        onClose={onMaintenanceClose}
        vehicleId={vehicleData.id}
      />
      <AddFuelModal
        isOpen={isFuelOpen}
        onClose={onFuelClose}
        vehicleId={vehicleData.id}
      />
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) => (
  <Card className="rounded-xl shadow-sm border border-slate-200 px-2 py-1 bg-white">
    <CardBody className="flex flex-row items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">
          {title}
        </p>
        <p className="text-lg font-black text-slate-800 tracking-tight">
          {value}
        </p>
      </div>
    </CardBody>
  </Card>
);

const ExpiryItem = ({ label, date }: { label: string; date: string }) => (
  <div className="flex justify-between items-center group">
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-700">{date}</p>
    </div>
    <CalendarDays size={16} className="text-indigo-200" />
  </div>
);

export default VehicleDashboard;
