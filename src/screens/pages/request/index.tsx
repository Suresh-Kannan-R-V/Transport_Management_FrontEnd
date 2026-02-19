import {
  Button,
  Card,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  ChevronRight,
  FilterIcon,
  Plus,
  RefreshCcw,
  Search,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CustomPagination,
  RequestCard,
  TransportLoader,
} from "../../../components";
import { useRequestPageStore } from "../../../store";
import { cn } from "../../../utils/helper";

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
  }, []);

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
    <div className="p-1 sm:p-4 sm:pb-0 sm:pt-2 animate-in fade-in duration-500 h-full">
      <div className="flex justify-between items-center mb-1">
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
              onChange={handleSearchChange}
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
        <div className="col-span-12 lg:col-span-9 ">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-semibold text-slate-500">
              Active Requests
            </h2>
            <div className="flex gap-2">
              <Button
                isIconOnly
                onPress={() => fetchRequests()}
                variant="flat"
                className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
                startContent={<RefreshCcw size={16} strokeWidth={2} />}
              />
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
                    startContent={<FilterIcon size={16} />}
                  >
                    Filter & Sort
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Sort and Filter"
                  className="min-w-40 bg-white shadow-md rounded-2xl border border-slate-300 -translate-x-18"
                  classNames={{
                    base: "p-2",
                    list: "gap-1",
                  }}
                  itemClasses={{
                    base: [
                      "rounded-xl text-slate-600 transition-opacity data-[hover=true]:text-indigo-600 data-[hover=true]:bg-indigo-50 data-[selectable=true]:focus:bg-indigo-500 data-[selected=true]:bg-indigo-500 data-[selected=true]:text-white",
                    ],
                  }}
                >
                  <DropdownItem
                    key="date-desc"
                    onClick={() => setSort("created_at")}
                  >
                    Newest First
                  </DropdownItem>
                  <DropdownItem
                    key="name-asc"
                    onClick={() => setSort("route_name", "ASC")}
                  >
                    Name (A-Z)
                  </DropdownItem>
                  <DropdownItem
                    key="status-pending"
                    onClick={() => setFilters("pending", undefined)}
                  >
                    Only Pending
                  </DropdownItem>
                  <DropdownItem
                    key="reset"
                    color="danger"
                    onClick={() => {
                      setSearch("");
                      setFilters("", "");
                      setSort("created_at");
                    }}
                  >
                    Reset Filters
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          {loading ? (
            <div className="h-[calc(100vh-380px)] overflow-hidden">
              <TransportLoader size={60} />
            </div>
          ) : (
            <>
              <div className="h-[calc(100vh-310px)] custom-scrollbar p-1 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                  {items.map((req) => (
                    <RequestCard key={req.id} item={req} />
                  ))}
                </div>
              </div>
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

        <div className="col-span-12 lg:col-span-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-semibold text-slate-500">
              Leaves Request
            </h2>
            <Button
              size="sm"
              onPress={() => navigate("/request/leave-approve")}
              className="flex items-center pr-0 gap-1 text-indigo-500 font-semibold rounded-lg text-xs hover:underline hover:text-indigo-600 cursor-pointer duration-200"
            >
              View All <ChevronRight size={16} />
            </Button>
          </div>

          <div className="bg-slate-100/50 p-3 rounded-3xl border border-white space-y-2 shadow-inner">
            {leaves.map((leave, idx) => (
              <Card
                isPressable
                key={idx}
                className="bg-white p-3 rounded-2xl border border-slate-200/60 hover:border-indigo-400 hover:shadow-md transition-all w-full"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shadow-sm">
                      <User size={18} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 leading-tight">
                        {leave.name}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-500">
                        {leave.duration} •{" "}
                        <span className="text-indigo-600">{leave.days}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold capitalize tracking-wider shadow-sm",
                      leave.status === "Approved"
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-400",
                    )}
                  >
                    {leave.status}
                  </span>
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
