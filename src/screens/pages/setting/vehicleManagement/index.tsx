import type { DateValue } from "@heroui/react";
import { Button, DatePicker, ScrollShadow } from "@heroui/react";
import {
  Calendar,
  Car,
  FileText,
  FilterIcon,
  Navigation,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  BackButton,
  CustomPagination,
  TransportLoader,
} from "../../../../components";
import { useVehicleStore } from "../../../../store/SettingStore/VehicleStore";
import { cn } from "../../../../utils/helper";

const pickerStyles = {
  label: "text-[10px] font-bold text-indigo-600 uppercase ml-1",
  inputWrapper:
    "bg-slate-50 !bg-opacity-100 border-slate-200 rounded-md shadow-sm hover:border-indigo-400 transition-all focus:ring focus:ring-indigo-600",
  popoverContent: "bg-white border border-slate-200 shadow-xl rounded-xl",
  calendar: "bg-red-500",
  errorMessage:
    "text-rose-500 text-[10px] font-medium mt-1 bg-rose-50 px-2 py-1 rounded-md border border-rose-100",
  helperText: "text-slate-400 text-[10px]",
  input: "text-slate-800 font-medium",
};

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const {
    vehicles = [],
    fetchVehicles,
    loading,
    deleteVehicle,
    addVehicle,
    totalVehicles,
  } = useVehicleStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const totalPages = Math.ceil(totalVehicles / limit);
  const totalItems = totalVehicles;

  const [dates, setDates] = useState<{
    insurance_date: DateValue | null;
    pollution_date: DateValue | null;
    rc_date: DateValue | null;
    fc_date: DateValue | null;
    next_service_date: DateValue | null;
  }>({
    insurance_date: null,
    pollution_date: null,
    rc_date: null,
    fc_date: null,
    next_service_date: null,
  });

  useEffect(() => {
    fetchVehicles(`?page=${page}&limit=${limit}&search=${search}`);
  }, [page, search, fetchVehicles]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const baseData = Object.fromEntries(formData);

    const finalVehicleData = {
      vehicle_number: String(baseData.vehicle_number),
      vehicle_type: String(baseData.vehicle_type),
      capacity: Number(baseData.capacity),
      status: "active" as const,
      current_kilometer: Number(baseData.current_kilometer) || undefined,
      insurance_date: dates.insurance_date?.toString() || null,
      pollution_date: dates.pollution_date?.toString() || null,
      rc_date: dates.rc_date?.toString() || null,
      fc_date: dates.fc_date?.toString() || null,
      next_service_date: dates.next_service_date?.toString() || null,
    };

    addVehicle(finalVehicleData);
    setActiveTab("list");
  };

  return (
    <div className="p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4">
        <div className="flex gap-4">
          <BackButton />
          <div>
            <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
              Transport Asset Control
            </p>
            <h1 className="text-3xl md:text-4xl text-slate-900 tracking-tight font-bold">
              Vehicle Management
            </h1>
          </div>
        </div>
        <div className="bg-slate-100 p-1 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
          <Button
            size="md"
            onPress={() => setActiveTab("list")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all bg-transparent text-slate-400",
              activeTab === "list" && "bg-indigo-600 text-white",
            )}
          >
            List View
          </Button>
          <Button
            size="md"
            onPress={() => setActiveTab("create")}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all bg-transparent text-slate-400 ",
              activeTab === "create" && "bg-indigo-600 text-white",
            )}
          >
            Add New
          </Button>
        </div>
      </header>

      {activeTab === "list" ? (
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative hidden lg:block ">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm w-96 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                isIconOnly
                onPress={() =>
                  fetchVehicles(`?page=${page}&limit=${limit}&search=${search}`)
                }
                variant="flat"
                className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
                startContent={<RefreshCcw size={16} strokeWidth={2} />}
              />
              <Button
                variant="flat"
                className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
                startContent={<FilterIcon size={16} />}
              >
                Filter & Sort
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <TransportLoader size={60} />
            </div>
          ) : (
            <>
              <ScrollShadow className="grid grid-cols-1 gap-2 h-[calc(100vh-340px)] px-2 custom-scrollbar mb-0 pb-4">
                {vehicles.length > 0 ? (
                  vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white border-2 border-slate-100 rounded-2xl p-3 hover:border-indigo-600 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex gap-4 items-start lg:w-1/4">
                          <div
                            className={cn(
                              "bg-indigo-50 p-4 rounded-2xl text-indigo-600",
                              v.status === "active"
                                ? "bg-green-100 text-green-600"
                                : v.status === "assign"
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-rose-100 text-rose-600",
                            )}
                          >
                            <Car size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                              {v.vehicle_number}
                            </h3>
                            <div className="flex gap-3 mt-1">
                              <span className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase">
                                <Users
                                  size={12}
                                  className="text-slate-400"
                                  strokeWidth={2}
                                />
                                {v.capacity} Seats
                              </span>
                              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                <Settings size={12} strokeWidth={2} />
                                {v.vehicle_type}
                              </span>
                              <span
                                className={cn(
                                  "inline-block px-3 py-0.5 rounded-full text-[9px] font-semibold uppercase ",
                                  v.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-amber-100 text-amber-600",
                                )}
                              >
                                {v.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 flex-1 lg:px-4 border-t lg:border-t-0 lg:border-x-2 border-slate-100 pt-6 lg:pt-0">
                          <DataMetric
                            label="Current KM"
                            value={`${v.current_kilometer} km`}
                            icon={<Navigation size={12} />}
                          />
                          <DataMetric
                            label="Insurance"
                            value={v.insurance_date}
                            icon={<ShieldCheck size={12} />}
                            isDate
                          />
                          <DataMetric
                            label="Pollution"
                            value={v.pollution_date}
                            icon={<Calendar size={12} />}
                            isDate
                          />
                          <DataMetric
                            label="RC Expiry"
                            value={v.rc_date}
                            icon={<FileText size={12} />}
                            isDate
                          />
                          <DataMetric
                            label="FC Date"
                            value={v.fc_date}
                            icon={<Calendar size={12} />}
                            isDate
                          />
                          <DataMetric
                            label="Next Service"
                            value={v.fc_date}
                            icon={<Calendar size={12} />}
                            isDate
                          />
                        </div>

                        <div className="flex justify-center items-center">
                          <Button
                            isIconOnly
                            startContent={<Trash2 size={16} />}
                            onPress={() => deleteVehicle([v.id])}
                            className="text-red-500 bg-red-50 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 rounded-2xl py-20 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">
                      No assets found
                    </p>
                  </div>
                )}
              </ScrollShadow>
              <CustomPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={limit}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-9 bg-white p-3">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Vehicle Number"
                  name="vehicle_number"
                  placeholder="TN01AA1234"
                  required
                />
                <FormInput
                  label="Vehicle Type"
                  name="vehicle_type"
                  placeholder="Bus, Van, SUV..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Seating Capacity"
                  name="capacity"
                  type="number"
                  placeholder="48"
                  required
                  min="2"
                />
                <FormInput
                  label="Current KM"
                  name="current_kilometer"
                  type="number"
                  placeholder="25000"
                  min="100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DatePicker
                  label="RC Date"
                  labelPlacement="outside"
                  classNames={pickerStyles}
                  selectorIcon={
                    <Calendar size={16} className="text-slate-400" />
                  }
                  onChange={(v) => setDates({ ...dates, rc_date: v })}
                />
                <DatePicker
                  label="Insurance Date"
                  labelPlacement="outside"
                  classNames={pickerStyles}
                  selectorIcon={
                    <Calendar size={16} className="text-slate-400" />
                  }
                  onChange={(v) => setDates({ ...dates, insurance_date: v })}
                />
                <DatePicker
                  label="Pollution Date"
                  labelPlacement="outside"
                  classNames={pickerStyles}
                  selectorIcon={
                    <Calendar size={16} className="text-slate-400" />
                  }
                  onChange={(v) => setDates({ ...dates, pollution_date: v })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="FC Date"
                  labelPlacement="outside"
                  classNames={pickerStyles}
                  selectorIcon={
                    <Calendar size={16} className="text-slate-400" />
                  }
                  onChange={(v) => setDates({ ...dates, fc_date: v })}
                />
                <DatePicker
                  label="Next Service"
                  labelPlacement="outside"
                  classNames={pickerStyles}
                  selectorIcon={
                    <Calendar size={16} className="text-slate-400" />
                  }
                  onChange={(v) => setDates({ ...dates, next_service_date: v })}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="reset"
                  className="w-full text-indigo-600 bg-indigo-50 rounded-lg font-bold capitalize tracking-widest  hover:bg-indigo-100 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-indigo-500 text-white rounded-lg font-bold capitalize tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all"
                >
                  Save Vehicle Asset
                </Button>
              </div>
            </form>
          </div>
          <div className="bg-white p-4 rounded-2xl lg:col-span-3  shadow-sm border border-slate-100 h-full">
            <h3 className="text-lg font-bold mb-2">Bulk Integration</h3>
            <div
              onClick={() => document.getElementById("bulk-file")?.click()}
              className="border-3 border-dashed border-slate-100 rounded-2xl p-10 text-center hover:border-indigo-100 cursor-pointer transition-all"
            >
              <input
                type="file"
                id="bulk-file"
                className="hidden"
                accept=".csv, .xlsx"
              />
              <Upload className="mx-auto text-slate-200 mb-4" size={40} />
              <p className="font-black text-slate-400 text-sm">
                Upload Spreadsheet
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataMetric = ({
  label,
  value,
  icon,
  isDate = false,
}: {
  label: string;
  value: string | null | undefined;
  icon: React.ReactNode;
  isDate?: boolean;
}) => (
  <div className="space-y-1 my-auto">
    <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-xs font-bold text-slate-700 truncate ml-1">
      {value
        ? isDate
          ? new Date(value).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : value
        : "--"}
    </p>
  </div>
);

const FormInput = ({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1 h-fit">
    <label className="text-[10px] font-bold uppercase text-indigo-600 ml-2">
      {label}
    </label>
    <input
      {...props}
      className="w-full p-3 shadow-sm bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
    />
  </div>
);

export default VehicleManagement;
