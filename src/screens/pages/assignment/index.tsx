import { Button, ScrollShadow, useDisclosure } from "@heroui/react";
import { RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { generateEndOTP, generateStartOTP } from "../../../api/auth";
import {
  CustomPagination,
  GenericFilterDropdown,
  NoDataFound,
  OTPGeneratorModal,
  TransportLoader,
} from "../../../components";
import { AssignmentCard } from "../../../components/RouteCard2";
import { useAssignmentStore, useUserStore } from "../../../store";
import { ROUTE_STATUS } from "../../../utils/helper";

const assignmentFilterConfig = [
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
    title: "Assignment Status",
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

const AssignmentPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    items,
    totalItems,
    loading,
    totalPages,
    currentPage,
    otpLoading,
    setPage,
    setSearch,
    setSort,
    setFilters,
    fetchAssignment,
  } = useAssignmentStore();

  const role = useUserStore((s) => s.roleName);

  const [activeId, setActiveId] = useState<number | null>(null);
  const currentDrivers = items.find((i) => i.id === activeId)?.drivers || [];
  const [modalType, setModalType] = useState<"start" | "end">("start");

  const handleAction = (req: any) => {
    const canAccess = role == "Transport Admin" || role == "Faculty";
    if (canAccess) {
      if (
        req.status === ROUTE_STATUS.DRIVER_ASSIGNED ||
        req.status === ROUTE_STATUS.DRIVER_REASSIGNED
      ) {
        setModalType("start");
        setActiveId(req.id);
        onOpen();
      } else if (req.status === ROUTE_STATUS.STARTED) {
        setModalType("end");
        setActiveId(req.id);
        onOpen();
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (items.length === 0) {
      fetchAssignment();
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
            All Assignment
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
              placeholder="Quick search assignment..."
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm w-72 shadow-sm"
            />
          </div>
          <Button
            isIconOnly
            onPress={handleReset}
            variant="flat"
            className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
            startContent={<RefreshCcw size={16} strokeWidth={2} />}
          />
          <GenericFilterDropdown
            sections={assignmentFilterConfig}
            onFilterSelect={handleFilterSelect}
            onReset={handleReset}
            buttonLabel="Filter & Sort"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          {loading ? (
            <div className="h-[calc(100vh-380px)]">
              <TransportLoader size={60} />
            </div>
          ) : (
            <>
              <ScrollShadow className="h-[calc(100vh-250px)] custom-scrollbar p-1 pr-2 pb-2">
                {items.length == 0 && (
                  <NoDataFound data={"No Approved Assignment Found."} />
                )}
                <div className="grid grid-cols-1 gap-3">
                  {items.map((req) => (
                    <AssignmentCard
                      key={req.id}
                      item={req}
                      onPress={() => handleAction(req)}
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
      <OTPGeneratorModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setActiveId(null);
        }}
        routeId={activeId || ""}
        title={modalType === "start" ? "Start Trip OTP" : "End Trip OTP"}
        onGenerate={modalType === "start" ? generateStartOTP : generateEndOTP}
        drivers={currentDrivers}
      />
    </div>
  );
};

export default AssignmentPage;
