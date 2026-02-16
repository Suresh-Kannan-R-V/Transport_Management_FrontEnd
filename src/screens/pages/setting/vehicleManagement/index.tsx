import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Filter,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useVehicleStore } from "../../../../store/SettingStore/VehicleStore";

const VehicleManagement = () => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const {
    vehicles = [],
    fetchVehicles,
    loading,
    deleteVehicle,
    addVehicle,
    bulkUpload,
  } = useVehicleStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchVehicles(`?page=${page}&limit=5&search=${search}`);
  }, [page, search, fetchVehicles]);

  // Template Download Function
  const handleDownloadTemplate = () => {
    const headers = ["vehicle_number", "vehicle_type", "capacity", "status"];

    const sampleData = ["TN02CD5678", "Mini Bus", "25", "maintenance"];

    const csvContent = [headers, sampleData].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "vehicle_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800">
              Fleet Management
            </h1>
            <p className="text-slate-500 font-medium">
              Manage and monitor your transport assets
            </p>
          </div>
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "list" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}
            >
              Vehicle List
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "create" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}
            >
              Add Vehicle
            </button>
          </div>
        </header>

        {activeTab === "list" ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 flex gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-3 text-slate-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search vehicle number..."
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-2xl outline-none font-semibold text-slate-600"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="px-6 py-2.5 bg-slate-50 text-slate-500 rounded-2xl font-bold flex items-center gap-2">
                <Filter size={18} /> Filter
              </button>
            </div>

            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-50">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Vehicle Details
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Type
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Capacity
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-8 py-10 text-center animate-pulse text-slate-400"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : vehicles.length > 0 ? (
                    vehicles.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-8 py-5 font-bold text-slate-700">
                          {v.vehicle_number}
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-semibold">
                          {v.vehicle_type}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm">
                            {v.capacity} Seats
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${v.status === "active" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button className="p-2 text-slate-300 hover:text-indigo-600">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteVehicle([v.id])}
                            className="p-2 text-slate-300 hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-8 py-10 text-center text-slate-400"
                      >
                        No vehicles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="p-6 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
                <p className="text-sm font-bold text-slate-400">
                  Showing page {page}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-white rounded-xl shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 bg-white rounded-xl shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
              <h3 className="text-xl font-black text-slate-800 mb-6">
                Single Vehicle Entry
              </h3>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addVehicle(Object.fromEntries(formData));
                }}
              >
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                    Vehicle Number
                  </label>
                  <input
                    name="vehicle_number"
                    className="w-full p-3 bg-slate-50 rounded-2xl outline-none font-bold"
                    placeholder="TN09..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                      Type
                    </label>
                    <select
                      name="vehicle_type"
                      className="w-full p-3 bg-slate-50 rounded-2xl outline-none font-bold"
                    >
                      <option>Bus</option>
                      <option>Van</option>
                      <option>SUV</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                      Capacity
                    </label>
                    <input
                      name="capacity"
                      type="number"
                      className="w-full p-3 bg-slate-50 rounded-2xl outline-none font-bold"
                      placeholder="40"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Save Vehicle
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-50">
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  Bulk Upload
                </h3>
                <p className="text-slate-400 text-sm mb-6 font-medium">
                  Upload CSV or JSON for batch creation
                </p>
                <div
                  className="border-4 border-dashed border-slate-100 rounded-[2rem] p-10 text-center hover:border-indigo-100 transition-colors group cursor-pointer"
                  onClick={() => document.getElementById("bulk-file")?.click()}
                >
                  <input
                    type="file"
                    id="bulk-file"
                    className="hidden"
                    accept=".csv, .xlsx" // Allowed both based on your controller
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        bulkUpload(e.target.files[0]);
                        e.target.value = ""; // Clear so you can re-upload same file if needed
                      }
                    }}
                  />
                  <Upload
                    className="mx-auto text-slate-200 group-hover:text-indigo-400 mb-4 transition-colors"
                    size={48}
                  />
                  <p className="font-black text-slate-500">
                    Drop your CSV file here
                  </p>
                </div>
              </div>

              {/* DOWNLOAD SECTION UPDATED */}
              <div className="bg-indigo-600 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-indigo-100">
                <div>
                  <h4 className="font-black text-lg">Need a template?</h4>
                  <p className="text-indigo-100 text-sm">
                    Download the CSV format
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="p-4 bg-white/20 rounded-2xl hover:bg-white/30 transition-all"
                >
                  <Download size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;
