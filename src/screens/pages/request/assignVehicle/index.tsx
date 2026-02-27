/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Button,
  Card,
  Chip,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from "@heroui/react";
import {
  AlertCircle,
  ChevronDown,
  CircleCheckBig,
  GripVertical,
  Phone,
  Plus,
  Search,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FILE_BASE_URL } from "../../../../api/base";
import { useUserStore } from "../../../../store";
import { cn } from "../../../../utils/helper";

interface Guest {
  id: number;
  name: string;
  phone: string;
  seat_number: number;
  status: string;
}

interface Vehicle {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
  capacity: number;
  status: string;
}

interface VehicleCard {
  id: string;
  selectedVehicle: Vehicle | null;
  assignedGuests: Guest[];
}

interface ExistingSchedule {
  schedule_id?: number;
  vehicle: Vehicle | null;
  guests: Guest[];
}

interface Props {
  guests: Guest[];
  onClose: () => void;
  routeId: string | undefined | number;
  existingSchedules?: ExistingSchedule[];
}
export const VehicleAssignmentPopup = ({
  guests,
  onClose,
  routeId,
  existingSchedules,
}: Props) => {
  const [vehicles, setVehicles] = useState<VehicleCard[]>([
    { id: `card-${Date.now()}`, selectedVehicle: null, assignedGuests: [] },
  ]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>(
    Array.isArray(guests) ? guests : [],
  );
  const [searchGuest, setSearchGuest] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remarks, setRemarks] = useState("");

  const roleName = useUserStore((state) => state.roleName);

  const fetchVehicles = async (searchTerm: string = "") => {
    try {
      const params = new URLSearchParams({
        limit: "100",
        status: "active",
      });

      // Only add search if it exists
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(
        `${FILE_BASE_URL}/api/vehicles/get-all?${params.toString()}`,
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        },
      );

      const result = await response.json();

      // FIXED: Mapping result.data based on your store's logic
      if (result.success) {
        setAvailableVehicles(result.data || []);
      } else {
        setAvailableVehicles([]);
      }
    } catch (error) {
      console.error("Vehicle fetch error:", error);
      toast.error("Failed to fetch available vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles("");

    if (existingSchedules && existingSchedules.length > 0) {
      const assignedIds = new Set();
      const initialCards = existingSchedules.map((sched) => {
        sched.guests.forEach((g: Guest) => assignedIds.add(g.id));
        return {
          id: `card-${sched.schedule_id || Math.random()}`,
          selectedVehicle: sched.vehicle || null,
          assignedGuests: sched.guests,
        };
      });
      setVehicles(initialCards);
      setUnassignedGuests(guests.filter((g) => !assignedIds.has(g.id)));
    } else {
      setUnassignedGuests(guests);
      setVehicles([
        { id: `card-${Date.now()}`, selectedVehicle: null, assignedGuests: [] },
      ]);
    }
  }, [guests, existingSchedules]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVehicles(vehicleSearch);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [vehicleSearch]);

  const handleConfirm = async () => {
    let decodedRouteId;
    try {
      decodedRouteId = Number(atob(routeId as string));
      if (isNaN(decodedRouteId)) {
        throw new Error("Invalid Route ID format");
      }
    } catch (err) {
      console.error("Decoding error:", err);
      toast.error("Error processing Route ID. Please refresh.");
      return;
    }

    for (const card of vehicles) {
      if (!card.selectedVehicle) {
        toast.error("Please select a vehicle for all groups.");
        return;
      }
      if (card.assignedGuests.length > card.selectedVehicle.capacity) {
        toast.error(
          `Vehicle ${card.selectedVehicle.vehicle_number} is over capacity! (Max: ${card.selectedVehicle.capacity})`,
        );
        return;
      }
    }

    if (unassignedGuests.length > 0) {
      toast.error(`Assign all guests. ${unassignedGuests.length} left.`);
      return;
    }

    if (vehicles.some((v) => !v.selectedVehicle)) {
      toast.error("Please select a vehicle for all assigned groups.");
      return;
    }

    const finalRemark = remarks.trim()
      ? remarks.trim()
      : `Remark By ${roleName}.`;
    const isUpdate = existingSchedules && existingSchedules.length > 0;
    setIsSubmitting(true);

    const apiUrl = isUpdate
      ? `${FILE_BASE_URL}/request/update-assigned-vehicles`
      : `${FILE_BASE_URL}/request/assign-vehicles`;

    const payload = {
      route_id: decodedRouteId,
      remarks: finalRemark,
      allocations: vehicles.map((v) => ({
        vehicle_id: v.selectedVehicle?.id,
        guest_ids: v.assignedGuests.map((g) => g.id),
      })),
    };

    try {
      const response = await fetch(apiUrl, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `TMS ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      if (resData.success) {
        toast.success(resData.message || "Assignments saved!");
        onClose();
      } else {
        throw new Error(resData.message || "Server validation failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get IDs of vehicles already used in ANY card
  const usedVehicleIds = useMemo(
    () =>
      vehicles.map((v) => v.selectedVehicle?.id).filter(Boolean) as number[],
    [vehicles],
  );

  const filteredUnassignedGuests = useMemo(() => {
    return unassignedGuests.filter((g) =>
      g.name.toLowerCase().includes(searchGuest.toLowerCase()),
    );
  }, [unassignedGuests, searchGuest]);

  const returnGuestToPool = (cardId: string, guestId: number) => {
    const card = vehicles.find((v) => v.id === cardId);
    const guest = card?.assignedGuests.find((g) => g.id === guestId);
    if (!guest) return;

    setVehicles((prev) =>
      prev.map((v) =>
        v.id === cardId
          ? {
              ...v,
              assignedGuests: v.assignedGuests.filter((g) => g.id !== guestId),
            }
          : v,
      ),
    );
    setUnassignedGuests((prev) => [...prev, guest]);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const destCard = vehicles.find((v) => v.id === destination.droppableId);

    if (destCard && destination.droppableId !== "guest-pool") {
      if (!destCard.selectedVehicle) {
        toast.error("Select a vehicle first to check capacity.");
        return;
      }
      if (destCard.assignedGuests.length >= destCard.selectedVehicle.capacity) {
        toast.error(
          `Capacity reached for ${destCard.selectedVehicle.vehicle_number}`,
        );
        return;
      }
    }

    let guestToMove: Guest | undefined;

    if (source.droppableId === "guest-pool") {
      guestToMove = unassignedGuests.find(
        (g) => g.id.toString() === draggableId,
      );
      setUnassignedGuests((prev) =>
        prev.filter((g) => g.id.toString() !== draggableId),
      );
    } else {
      const sourceCard = vehicles.find((v) => v.id === source.droppableId);
      guestToMove = sourceCard?.assignedGuests.find(
        (g) => g.id.toString() === draggableId,
      );
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === source.droppableId
            ? {
                ...v,
                assignedGuests: v.assignedGuests.filter(
                  (g) => g.id.toString() !== draggableId,
                ),
              }
            : v,
        ),
      );
    }

    if (!guestToMove) return;

    if (destination.droppableId === "guest-pool") {
      setUnassignedGuests((prev) => [...prev, guestToMove!]);
    } else {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === destination.droppableId
            ? { ...v, assignedGuests: [...v.assignedGuests, guestToMove!] }
            : v,
        ),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/30 p-4 m-0">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl bg-slate-50 border-none rounded-3xl overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-indigo-100 flex justify-between items-center">
          <div>
            <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-black">
              Assigning {filteredUnassignedGuests.length || 0} Guests
            </p>
            <h1 className="text-2xl text-slate-900 font-bold">
              Vehicle Assignment
            </h1>
          </div>
          <Button
            isIconOnly
            variant="flat"
            onPress={onClose}
            className="rounded-xl hover:bg-rose-100 hover:text-rose-500"
          >
            <X size={20} />
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-12 flex-1 overflow-hidden">
            <div className="col-span-8 p-4 overflow-y-scroll custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3">
                  <Chip className="bg-white text-slate-500 py-4 px-3 text-sm tracking-wider font-bold shadow border border-slate-100">
                    Groups :{" "}
                    <span className="text-indigo-600 font-bold">
                      {vehicles.length}
                    </span>
                  </Chip>
                  <Chip className="bg-white text-slate-500 py-4 px-3 text-sm tracking-wider font-bold shadow border border-slate-100">
                    Available Vehicle :{" "}
                    <span className="text-indigo-600 font-bold">
                      {availableVehicles.length - usedVehicleIds.length}{" "}
                    </span>
                  </Chip>
                </div>
                {roleName !== "Faculty" && (
                  <Button
                    size="sm"
                    isDisabled={roleName === "Faculty"}
                    onPress={() =>
                      setVehicles([
                        ...vehicles,
                        {
                          id: `card-${Date.now()}`,
                          selectedVehicle: null,
                          assignedGuests: [],
                        },
                      ])
                    }
                    className="bg-indigo-600 text-white rounded-xl"
                    startContent={<Plus size={20} />}
                  >
                    Add Vehicle
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {vehicles.map((card) => {
                  const isOverCapacity =
                    card.selectedVehicle &&
                    card.assignedGuests.length > card.selectedVehicle.capacity;

                  return (
                    <Droppable droppableId={card.id} key={card.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "p-4 rounded-3xl border-2 transition-all bg-white shadow-sm flex flex-col min-h-44",
                            snapshot.isDraggingOver
                              ? "border-indigo-400 bg-indigo-50/50"
                              : "border-transparent",
                            isOverCapacity && "border-rose-500 bg-rose-50/30",
                          )}
                        >
                          <div className="flex items-center justify-between mb-4 gap-2">
                            <Popover
                              placement="bottom-start"
                              className="w-full"
                              style={{ padding: "0px" }}
                            >
                              <PopoverTrigger>
                                <div className="flex-1 flex items-center justify-between bg-slate-100 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                                  <span
                                    className={cn(
                                      "text-sm font-medium",
                                      !card.selectedVehicle && "text-slate-400",
                                    )}
                                  >
                                    {card.selectedVehicle
                                      ? card.selectedVehicle.vehicle_number
                                      : "Select Vehicle"}
                                  </span>
                                  <ChevronDown
                                    size={16}
                                    className="text-slate-500"
                                  />
                                </div>
                              </PopoverTrigger>
                              {roleName !== "Faculty" && (
                                <PopoverContent className="w-72 overflow-hidden rounded-2xl border border-slate-300 shadow-md bg-white pb-4">
                                  <div className="relative w-full group mb-2 mt-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <Search
                                        size={14}
                                        className="text-slate-400 group-focus-within:text-indigo-500"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Search vehicle..."
                                      value={vehicleSearch}
                                      onChange={(e) =>
                                        setVehicleSearch(e.target.value)
                                      }
                                      className="w-full bg-white border border-slate-200 text-sm rounded-full py-2 pl-9 pr-4 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow"
                                    />
                                  </div>

                                  <ScrollShadow className="max-h-60 w-full custom-scrollbar space-y-1.5">
                                    {availableVehicles.map((v) => {
                                      const isUsed =
                                        usedVehicleIds.includes(v.id) &&
                                        card.selectedVehicle?.id !== v.id;
                                      return (
                                        <div
                                          key={v.id}
                                          onClick={() => {
                                            if (!isUsed) {
                                              setVehicles((prev) =>
                                                prev.map((c) =>
                                                  c.id === card.id
                                                    ? {
                                                        ...c,
                                                        selectedVehicle: v,
                                                      }
                                                    : c,
                                                ),
                                              );
                                            }
                                          }}
                                          className={cn(
                                            "flex items-center justify-between gap-3 p-2 cursor-pointer transition-colors rounded-2xl border border-slate-300",
                                            isUsed
                                              ? "opacity-30 cursor-not-allowed bg-slate-50"
                                              : "hover:bg-indigo-50",
                                          )}
                                        >
                                          <div className="flex gap-2 items-center">
                                            <div className="bg-indigo-100 p-2 rounded-lg">
                                              <Truck
                                                size={16}
                                                className="text-indigo-600"
                                              />
                                            </div>
                                            <div className="flex flex-col">
                                              <span className="text-sm font-bold">
                                                {v.vehicle_number}
                                              </span>
                                              <span className="text-[10px] text-slate-500 uppercase">
                                                {v.vehicle_type} •
                                                <span className="text-green-500 font-medium ml-1">
                                                  {v.capacity} Seats
                                                </span>
                                              </span>
                                            </div>
                                          </div>
                                          {isUsed && (
                                            <CircleCheckBig
                                              size={14}
                                              className="mr-2 text-rose-500"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </ScrollShadow>
                                </PopoverContent>
                              )}
                            </Popover>

                            {/* Capacity Badge */}
                            {card.selectedVehicle && (
                              <div
                                className={cn(
                                  "text-[11px] font-bold px-2 py-1 rounded-lg shrink-0",
                                  isOverCapacity
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-emerald-100 text-emerald-600",
                                )}
                              >
                                {card.assignedGuests.length} /{" "}
                                {card.selectedVehicle.capacity}
                              </div>
                            )}

                            {roleName !== "Faculty" && (
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                className="rounded-lg hover:bg-rose-100 hover:text-rose-500"
                                onPress={() => {
                                  setUnassignedGuests((prev) => [
                                    ...prev,
                                    ...card.assignedGuests,
                                  ]);
                                  setVehicles((prev) =>
                                    prev.filter((v) => v.id !== card.id),
                                  );
                                }}
                                startContent={<X size={16} />}
                              />
                            )}
                          </div>

                          {/* Pulsing Warning Message */}
                          {isOverCapacity && (
                            <div className="flex items-center gap-1 text-rose-500 text-[10px] mb-2 font-bold animate-pulse">
                              <AlertCircle size={12} /> CAPACITY EXCEEDED
                            </div>
                          )}

                          {/* Droppable Area for Guests */}
                          <div className="space-y-2 flex-1">
                            {card.assignedGuests.map((guest, index) => (
                              <Draggable
                                key={guest.id.toString()}
                                draggableId={guest.id.toString()}
                                index={index}
                              >
                                {(p) => (
                                  <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                    className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical
                                        size={14}
                                        className="text-slate-400"
                                      />
                                      <span className="text-sm font-bold">
                                        {guest.name}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        returnGuestToPool(card.id, guest.id)
                                      }
                                      className="p-0.5 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {card.assignedGuests.length === 0 && (
                              <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 uppercase text-[10px] font-bold">
                                <Users size={20} className="mb-1" /> Drop Guests
                                Here
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>

            {/* Right: Guest Pool */}
            <div className="col-span-4 bg-white border-l border-indigo-100 flex flex-col">
              <div className="p-4 space-y-3">
                <h3 className="font-bold text-slate-800">Available Guests</h3>
                <Input
                  placeholder="Search by name..."
                  startContent={
                    <Search size={18} className="text-indigo-600" />
                  }
                  value={searchGuest}
                  onChange={(e) => setSearchGuest(e.target.value)}
                  className="rounded-2xl shadow"
                />
              </div>

              <Droppable droppableId="guest-pool">
                {(provided) => (
                  <ScrollShadow
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="ml-2 mr-1 mb-2 pl-1 pr-2 space-y-2 h-[calc(100vh-320px)]"
                  >
                    {filteredUnassignedGuests.map((guest, index) => (
                      <Draggable
                        key={guest.id.toString()}
                        draggableId={guest.id.toString()}
                        index={index}
                      >
                        {(p, s) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className={cn(
                              "p-4 rounded-2xl border border-slate-200 flex justify-between items-center bg-white hover:border-indigo-600 shadow-sm",
                              s.isDragging &&
                                "border-2 border-indigo-600 shadow-xl",
                            )}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <GripVertical
                                size={22}
                                className="text-indigo-600 bg-indigo-50 p-1 rounded-md"
                              />
                              <div className="flex justify-between w-full">
                                <p className="text-sm font-bold capitalize truncate">
                                  {guest.name}
                                </p>
                                {guest.phone !== "null -1" && (
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Phone
                                      size={10}
                                      className="text-indigo-600"
                                    />{" "}
                                    {guest.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ScrollShadow>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>

        <div className="pt-2 pb-4 px-6 bg-white border-t border-indigo-100 flex justify-between items-center gap-3">
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            placeholder="Enter notes here..."
            className="flex-1 max-w-md px-4 py-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
          />
          <div className="flex gap-3">
            <Button
              variant="light"
              className="font-bold rounded-xl px-12 bg-indigo-50 text-indigo-600"
              onPress={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              isLoading={isSubmitting}
              isDisabled={vehicles.length === 0}
              onPress={handleConfirm}
              color="primary"
              className="font-medium px-12 rounded-xl text-white bg-indigo-600 shadow-xl shadow-indigo-100"
            >
              Confirm
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
