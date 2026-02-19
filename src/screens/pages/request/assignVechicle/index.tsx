import React, { useState, useMemo, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Button,
  Card,
  Input,
  ScrollShadow,
  Chip,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import {
  X,
  Plus,
  Search,
  GripVertical,
  CheckCircle2,
  Users,
  Phone,
  PhoneCall,
} from "lucide-react";
import { FILE_BASE_URL } from "../../../../api/base";
import { cn } from "../../../../utils/helper";

// ... Types remain the same ...

export const VehicleAssignmentPopup = ({ guests, onClose }: Props) => {
  const [vehicles, setVehicles] = useState<VehicleCard[]>([
    { id: `card-${Date.now()}`, selectedVehicle: null, assignedGuests: [] },
  ]);
  const [unassignedGuests, setUnassignedGuests] = useState<Guest[]>(guests);
  const [searchGuest, setSearchGuest] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // 1. Fixed Vehicle Fetching
  const fetchVehicles = async (search = "") => {
    setIsLoadingVehicles(true);
    try {
      const response = await fetch(
        `${FILE_BASE_URL}/api/vehicles/get-all?status=active&search=${search}`,
        { headers: { Authorization: `TMS ${localStorage.getItem("token")}` } }, // Ensure your token is correct here
      );
      const result = await response.json();
      if (result.success) setAvailableVehicles(result.data);
    } catch (error) {
      console.error("Failed to fetch vehicles", error);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchVehicles(vehicleSearch), 300);
    return () => clearTimeout(delayDebounce);
  }, [vehicleSearch]);

  const usedVehicleIds = useMemo(
    () => vehicles.map((v) => v.selectedVehicle?.id).filter(Boolean),
    [vehicles],
  );

  // 3. Fixed Guest Search Logic
  const filteredUnassignedGuests = useMemo(() => {
    return unassignedGuests.filter((g) =>
      g.name.toLowerCase().includes(searchGuest.toLowerCase()),
    );
  }, [unassignedGuests, searchGuest]);

  // 2. Return Guest to Pool (The X Button Logic)
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
    const { source, destination } = result;
    if (!destination) return;

    // From Pool to Vehicle
    if (
      source.droppableId === "guest-pool" &&
      destination.droppableId.startsWith("card-")
    ) {
      const guestToMove = filteredUnassignedGuests[source.index];
      setUnassignedGuests((prev) =>
        prev.filter((g) => g.id !== guestToMove.id),
      );
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === destination.droppableId
            ? { ...v, assignedGuests: [...v.assignedGuests, guestToMove] }
            : v,
        ),
      );
    }
    // Between Vehicles or back to pool handled similarly...
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/40 backdrop-blur-md p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl bg-slate-50 border-none rounded-3xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 bg-white border-b border-indigo-100 flex justify-between items-center">
          <div>
            <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-black">
              Assigning {guests.length} Guests
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
            <div className="col-span-8 p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <Chip className="bg-white text-slate-500 py-4 px-3 text-sm tracking-wider font-bold shadow border border-slate-100">
                  Vehicle :{" "}
                  <span className="text-indigo-600 font-bold">
                    {vehicles.length}
                  </span>
                </Chip>
                <Button
                  size="sm"
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
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {vehicles.map((card) => (
                  <Droppable droppableId={card.id} key={card.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "p-4 rounded-3xl border-2 transition-all bg-white shadow-sm",
                          snapshot.isDraggingOver
                            ? "border-indigo-400 bg-indigo-50/50"
                            : "border-transparent",
                        )}
                      >
                        <div className="flex items-center justify-between mb-4 gap-2">
                          <Autocomplete
                            placeholder="Search Vehicle..."
                            variant="flat"
                            isLoading={isLoadingVehicles}
                            onInputChange={setVehicleSearch}
                            onSelectionChange={(key) => {
                              const v = availableVehicles.find(
                                (veh) => veh.id.toString() === key,
                              );
                              setVehicles((prev) =>
                                prev.map((c) =>
                                  c.id === card.id
                                    ? { ...c, selectedVehicle: v || null }
                                    : c,
                                ),
                              );
                            }}
                            classNames={{
                              base: "max-w-xs rounded-3xl border border-slate-200 shadow-sm",
                              listboxWrapper: "rounded-2xl p-0 bg-white",
                              popoverContent:
                                "rounded-2xl shadow-2xl border border-indigo-500 bg-white",
                            }}
                            listboxProps={{
                              hideSelectedIcon: true,
                              itemClasses: {
                                base: [
                                  "rounded-xl text-slate-600 transition-all duration-200 data-[hover=true]:bg-indigo-50",
                                  "data-[hover=true]:text-indigo-700 data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white",
                                  "data-[selectable=true]:focus:bg-indigo-100",
                                ],
                                title: "font-bold text-sm",
                              },
                            }}
                          >
                            {availableVehicles.map((v) => (
                              <AutocompleteItem
                                key={v.id.toString()}
                                textValue={v.vehicle_number}
                                isDisabled={
                                  usedVehicleIds.includes(v.id) &&
                                  card.selectedVehicle?.id !== v.id
                                }
                              >
                                <div className="flex justify-between">
                                  {v.vehicle_number}{" "}
                                  <Chip size="sm">{v.capacity}</Chip>
                                </div>
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => {
                              setUnassignedGuests((prev) => [
                                ...prev,
                                ...card.assignedGuests,
                              ]);
                              setVehicles((prev) =>
                                prev.filter((v) => v.id !== card.id),
                              );
                            }}
                          >
                            <X size={16} />
                          </Button>
                        </div>

                        <div className="space-y-2">
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
                                  <div className="flex items-center gap-2">
                                    <span className="flex gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full font-bold">
                                      <Phone
                                        size={12}
                                        className="text-indigo-600 mt-0.5"
                                      />
                                      {guest.phone}
                                    </span>
                                    <button
                                      onClick={() =>
                                        returnGuestToPool(card.id, guest.id)
                                      }
                                      className="p-0.5 rounded-full bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {card.assignedGuests.length === 0 && (
                            <div className="h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 uppercase text-[10px] font-bold">
                              <Users size={20} className="mb-1" /> Drop Here
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>

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
                  className="rounded-2xl shadow-sm border border-slate-200"
                />
              </div>

              <Droppable droppableId="guest-pool">
                {(provided) => (
                  <ScrollShadow
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="ml-2 mr-1 mb-2 pl-1 pr-2 space-y-2 h-[calc(100vh-320px)] custom-scrollbar"
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
                              "p-4 rounded-2xl border border-slate-200 transition-all flex justify-between items-center bg-white hover:border-indigo-600 hover:shadow-md",
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
                                <p className="text-sm font-bold w-44 capitalize truncate">
                                  {guest.name}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Phone
                                    size={10}
                                    className="text-indigo-600"
                                  />{" "}
                                  {guest.phone}
                                </p>
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
        <div className="pt-2 pb-4 px-6 bg-white border-t border-indigo-100 flex justify-end gap-3">
          <Button
            variant="light"
            className="font-bold rounded-xl px-12 bg-indigo-50 text-indigo-600"
            onPress={onClose}
          >
            Cancel
          </Button>
          <Button
            isDisabled={vehicles.length == 0}
            onPress={() => alert("hello")}
            color="primary"
            className="font-medium px-10 rounded-xl text-white bg-indigo-600 shadow-xl shadow-indigo-100"
            startContent={<CheckCircle2 size={20} />}
          >
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  );
};
