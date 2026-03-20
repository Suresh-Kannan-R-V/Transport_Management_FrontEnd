import { Button, ScrollShadow } from "@heroui/react";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AssignmentCard,
  CustomPagination,
  GenericFilterDropdown,
  NoDataFound,
  TransportLoader,
} from "../../../components";
import { useApproveMissionStore } from "../../../store";
import { ROUTE_STATUS } from "../../../utils/helper";

const missionFilterConfig = [
  {
    title: "Sort By",
    items: [
      {
        key: "newest",
        label: "Newest First",
        value: "created_at",
        type: "sort",
      },
      {
        key: "name-az",
        label: "Route (A-Z)",
        value: "route_name",
        type: "sort",
      },
    ],
  },
  {
    title: "Routes Timeline",
    items: [
      { key: "date-all", label: "All Dates", value: "", type: "date" },
      { key: "upcoming", label: "Upcoming Routes", value: "", type: "date" },
    ],
  },
  {
    title: "Mission Status",
    items: [
      {
        key: "pending",
        label: "Pending",
        value: ROUTE_STATUS.PENDING,
        type: "filter",
      },
      {
        key: "vehicle1",
        label: "Vehicle Assigned",
        value: ROUTE_STATUS.VEHICLE_ASSIGNED,
        type: "filter",
      },
      {
        key: "vehicle2",
        label: "Vehicle Reassigned",
        value: ROUTE_STATUS.VEHICLE_REASSIGNED,
        type: "filter",
      },
      {
        key: "vehicle3",
        label: "Vehicle Approved",
        value: ROUTE_STATUS.VEHICLE_APPROVED,
        type: "filter",
      },
    ],
  },
];

const MissionPage = () => {
  const navigate = useNavigate();

  const {
    items,
    totalItems,
    loading,
    totalPages,
    currentPage,
    setPage,
    setSearch,
    setSort,
    setFilters,
    fetchMission,
  } = useApproveMissionStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (items.length === 0) {
      fetchMission();
    }
  }, []);

  const handleFilterSelect = (_sectionTitle: string, item: any) => {
    setPage(1);

    if (item.type === "sort") {
      const order = item.key === "name-az" ? "ASC" : "DESC";
      setSort(item.value, order);
    } else if (item.type === "date") {
      const isUpcoming = item.key === "upcoming";
      setFilters(undefined, undefined, isUpcoming);
    } else {
      setFilters(item.value, undefined, false);
    }
  };

  const handleReset = () => {
    setSearch("");
    setFilters("", "", false);
    setSort("created_at", "DESC");
  };

  return (
    <div className="px-2 pb-0 pt-1 animate-in fade-in duration-500 h-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
            Transport System
          </p>
          <h1 className="text-2xl md:text-4xl text-slate-900 tracking-tight font-bold">
            All Missions
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            onPress={() => navigate("/request/new-request")}
            startContent={<Plus size={18} strokeWidth={3} />}
            className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg duration-200"
          >
            New
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1 mr-4 w-full">
            <div className="relative hidden lg:block">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Quick search missions..."
                onChange={handleSearchChange}
                className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm w-72 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                isIconOnly
                onPress={handleReset}
                variant="flat"
                className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
                startContent={<RefreshCcw size={16} strokeWidth={2} />}
              />
              <GenericFilterDropdown
                sections={missionFilterConfig}
                onFilterSelect={handleFilterSelect}
                onReset={handleReset}
                buttonLabel="Filter & Sort"
              />
            </div>
          </div>
          {loading ? (
            <div className="h-[calc(100vh-380px)] overflow-hidden">
              <TransportLoader size={60} />
            </div>
          ) : (
            <>
              <ScrollShadow className="h-[calc(100vh-295px)] custom-scrollbar p-1 pr-2">
                {items.length == 0 && (
                  <NoDataFound data={"No Approved Missions Found."} />
                )}
                <div className="grid grid-cols-1 gap-3 ">
                  {items.map((req) => (
                    <AssignmentCard
                      key={req.id}
                      item={req}
                      onPress={() =>
                        navigate(`view-request/${btoa(req.id.toString())}`)
                      }
                    />
                  ))}
                </div>
              </ScrollShadow>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                limit={10}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionPage;
