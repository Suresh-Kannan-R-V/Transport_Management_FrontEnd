import { Button, ScrollShadow } from "@heroui/react";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CustomPagination,
  GenericFilterDropdown,
  RequestCard,
  TransportLoader,
} from "../../../components";
import { useRequestPageStore } from "../../../store";
import { ROUTE_STATUS } from "../../../utils/helper";

const requestFilterConfig = [
  {
    title: "Sort By",
    items: [
      {
        key: "newest",
        label: "Newest First",
        value: "created_at",
        type: "sort",
      },
      { key: "oldest", label: "Oldest First", value: "oldest", type: "sort" },
      {
        key: "name-az",
        label: "Route (A-Z)",
        value: "route_name",
        type: "sort",
      },
    ],
  },
  {
    title: "Request Status",
    items: [
      { key: "all-status", label: "All Requests", value: "", type: "filter" },
      {
        key: "pending",
        label: "Only Pending",
        value: ROUTE_STATUS.PENDING,
        type: "filter",
      },
      {
        key: "cancelled",
        label: "Only Cancelled",
        value: ROUTE_STATUS.CANCELLED,
        type: "filter",
      },
    ],
  },
];

const RequestPage = () => {
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
    fetchRequests,
  } = useRequestPageStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterSelect = (_sectionTitle: string, item: any) => {
    setPage(1);

    if (item.type === "sort") {
      const order = item.key === "name-az" ? "ASC" : "DESC";
      setSort(item.value, order);
    } else {
      setFilters(item.value, undefined);
    }
  };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    setFilters("", "");
    setSort("created_at");
  };

  return (
    <div className="px-2 pb-0 pt-1 animate-in fade-in duration-500 h-full">
      <div className="flex justify-between items-center mb-1">
        <div>
          <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
            Transport System
          </p>
          <h1 className="text-2xl md:text-4xl text-slate-900 tracking-tight font-bold">
            Pending Requests
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
                onPress={() => {
                  fetchRequests();
                  handleReset();
                }}
                variant="flat"
                className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
                startContent={<RefreshCcw size={16} strokeWidth={2} />}
              />
              <GenericFilterDropdown
                sections={requestFilterConfig}
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
              <ScrollShadow className="h-[calc(100vh-300px)] custom-scrollbar p-1 pr-2">
                {items.length == 0 && (
                  <div className="flex items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 h-full">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      No Transport Requests Found
                    </h3>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ">
                  {items.map((req) => (
                    <RequestCard key={req.id} item={req} />
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

export default RequestPage;
