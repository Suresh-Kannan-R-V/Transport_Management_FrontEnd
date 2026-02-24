import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Button, DatePicker } from "@heroui/react";
import {
  Calendar,
  Download,
  FileWarning,
  Footprints,
  GripVertical,
  MapPin,
  Plus,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  UsersRound,
} from "lucide-react";
import {
  now,
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { AddressSearchInput, CountrySelector } from "../../../../components";
import MapViewer from "../../../../components/MapComponent";
import { cn } from "../../../../utils/helper";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo, useRef } from "react";
import { useRequestCreationStore } from "../../../../store";
import { pickerStyles } from "../../../../utils/style";

const NewRequest = () => {
  const store = useRequestCreationStore();

  const navigate = useNavigate();
  const currentDateTime = useMemo(() => now(getLocalTimeZone()), []);

  const parseToZoned = useCallback((dateStr: string | null) => {
    if (!dateStr || dateStr === "") return null;
    try {
      return parseAbsoluteToLocal(new Date(dateStr).toISOString());
    } catch (e) {
      console.error("Date parsing error:", e);
      return null;
    }
  }, []);

  const endMinValue = useMemo(() => {
    if (!store.startDate) return currentDateTime;
    return parseToZoned(store.startDate) || currentDateTime;
  }, [store.startDate, currentDateTime, parseToZoned]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      store.setField("guestFile", file); // Add guestFile to your store
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleCancel = () => {
    store.reset();
    navigate("/request");
  };

  const handleCreateRequest = async () => {
    const result = await store.submitRequest();

    if (result.success) {
      toast.success(result.message);
      navigate("/request");
    } else {
      toast.error("Error: " + result.message);
    }
  };

  const isMandatory = (index: number) => {
    if (store.passengerCount === 1) return index === 0;
    return index < 2;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(store.stops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    store.reorderStops(items);
  };

  return (
    <div className="font-sans grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-5 flex flex-col gap-2 overflow-hidden">
        <div className="h-64 shrink-0 bg-white shadow-md rounded-3xl overflow-hidden border-4 border-white">
          <MapViewer stops={store.stops} />
        </div>

        <div className="rounded-2xl p-2">
          <div className="flex items-center justify-between bg-white rounded-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MapPin className="text-indigo-600" size={20} /> Route Plan
            </h2>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-3 bg-indigo-100 py-1.5 px-4 mb-1.5 rounded-lg">
                <p className="text-indigo-600 uppercase text-[10px] font-bold tracking-wider">
                  Distance :
                </p>
                <p className="font-semibold text-slate-900">
                  {store.distance || "0.00"} km
                </p>
              </div>
              <div className="flex items-center gap-3 bg-indigo-100 py-1.5 px-4 mb-1.5 rounded-lg">
                <p className="text-indigo-600 uppercase text-[10px] font-bold tracking-wider">
                  Est. Time :
                </p>
                <p className="font-semibold text-slate-900">
                  {(() => {
                    const totalMinutes = parseFloat(store.duration || "0");
                    if (totalMinutes < 60) {
                      return `${totalMinutes.toFixed(0)} min`;
                    } else {
                      const hours = Math.floor(totalMinutes / 60);
                      const mins = Math.round(totalMinutes % 60);
                      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
                    }
                  })()}
                </p>
              </div>
            </div>
          </div>

          <div className="h-[calc(100vh-500px)] overflow-y-auto pr-1.5 custom-scrollbar">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="stops">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {store.stops.map((stop, idx) => (
                      <Draggable
                        key={stop.id}
                        draggableId={stop.id}
                        index={idx}
                      >
                        {(p) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                          >
                            <div {...p.dragHandleProps}>
                              <GripVertical
                                className="text-slate-300"
                                size={16}
                              />
                            </div>
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full",
                                idx === 0
                                  ? "bg-green-500"
                                  : idx === store.stops.length - 1
                                    ? "bg-red-500"
                                    : "bg-indigo-400",
                              )}
                            />
                            <AddressSearchInput
                              value={stop.address}
                              onChange={(val: string) =>
                                store.updateStop(idx, val)
                              }
                              onSelect={(
                                addr: string,
                                lat: number,
                                lon: number,
                              ) => store.updateStop(idx, addr, lat, lon)}
                              placeholder={
                                idx === 0
                                  ? "Start"
                                  : idx === store.stops.length - 1
                                    ? "End"
                                    : "Stop"
                              }
                            />
                            {idx !== 0 && idx !== store.stops.length - 1 && (
                              <button onClick={() => store.removeStop(idx)}>
                                <Trash2
                                  size={14}
                                  className="text-slate-300 hover:text-red-500"
                                />
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          <Button
            size={"sm"}
            onPress={store.addStop}
            className="mt-2 w-full py-2 border-2 border-dashed border-indigo-600 rounded-xl text-indigo-500 font-bold text-xs uppercase hover:bg-slate-50 transition-all duration-300"
          >
            <Plus size={14} /> Add Intermediate Stop
          </Button>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col overflow-hidden h-full">
        <div className="rounded-3xl px-2 pt-1 h-[calc(100vh-190px)] pb-2 custom-scrollbar overflow-y-scroll">
          <input
            className="w-full mb-4 p-3 shadow-sm bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-indigo-500"
            placeholder="Route Name"
            value={store.routeName}
            onChange={(e) => store.setField("routeName", e.target.value)}
          />
          <section>
            <div className="flex justify-between items-center">
              <h3 className="font-bold uppercase text-sm flex gap-2 ">
                <Footprints size={18} className="text-indigo-600" />
                Travel Configuration
              </h3>

              <div className="flex bg-slate-100 p-1 rounded-lg shadow-sm">
                {["One Way", "Two Way", "Multi Day"].map((t) => (
                  <button
                    key={t}
                    onClick={() => store.setField("travelType", t)}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                      store.travelType === t
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-400",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 mt-1">
              <div className="space-y-1">
                <DatePicker
                  label="Start Date & Time"
                  labelPlacement="outside"
                  showMonthAndYearPickers
                  hideTimeZone
                  value={parseToZoned(store.startDate)}
                  minValue={currentDateTime}
                  onChange={(date) => {
                    const dateString = date ? date.toDate().toISOString() : "";
                    store.setField("startDate", dateString);
                  }}
                  classNames={pickerStyles}
                  selectorIcon={
                    <Calendar size={16} className="text-indigo-600" />
                  }
                />
              </div>

              {store.travelType === "Multi Day" && (
                <div className="space-y-1">
                  <DatePicker
                    label="End Date & Time"
                    labelPlacement="outside"
                    hideTimeZone
                    showMonthAndYearPickers
                    value={parseToZoned(store.endDate)}
                    minValue={endMinValue}
                    onChange={(date) => {
                      const dateString = date
                        ? date.toDate().toISOString()
                        : "";
                      store.setField("endDate", dateString);
                    }}
                    classNames={pickerStyles}
                    selectorIcon={
                      <Calendar size={16} className="text-slate-400" />
                    }
                  />
                </div>
              )}
            </div>
          </section>

          <section className="space-y-1.5 mb-2">
            <div className="flex justify-between items-center ">
              <div className="flex gap-3 items-center">
                <h3 className="font-bold uppercase text-sm flex gap-2 ">
                  <UsersRound size={18} className="text-indigo-600" />
                  Guest Details
                </h3>
                <input
                  type="number"
                  min="1"
                  className={cn(
                    "w-24 p-1 mb-1 text-center bg-slate-50 border border-slate-100 rounded-md text-sm font-bold outline-none focus:ring-2 ring-indigo-500",
                  )}
                  placeholder="Count"
                  value={store.passengerCount}
                  onChange={(e) =>
                    store.setField("passengerCount", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={store.isBulkUpload}
                    onChange={(e) =>
                      store.setField("isBulkUpload", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span
                    className={cn(
                      "text-xs font-bold text-slate-500",
                      store.isBulkUpload && "text-indigo-600",
                    )}
                  >
                    Bulk Upload
                  </span>
                </label>

                {!store.isBulkUpload &&
                  store.guests.length < Number(store.passengerCount) && (
                    <button
                      onClick={store.addGuest}
                      className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                    >
                      <Plus size={16} />
                    </button>
                  )}
              </div>
            </div>
            <div className="rounded-2xl min-h-40">
              {store.isBulkUpload ? (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors",
                      store.guestFile
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-slate-300 hover:border-indigo-400",
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileChange}
                    />
                    <div className="flex justify-center">
                      <p className="text-xs font-medium text-rose-500 flex gap-2">
                        <TriangleAlert size={14} /> Fill Guest Count Before
                        Upload File
                      </p>
                    </div>
                    <Upload
                      className={cn(
                        "mx-auto my-2",
                        store.guestFile ? "text-indigo-500" : "text-slate-300",
                      )}
                      size={32}
                    />
                    <p className="text-sm font-bold text-slate-600">
                      {store.guestFile
                        ? store.guestFile.name
                        : "Click to Upload Guest List"}
                    </p>
                  </div>
                  <Button
                    onPress={() => store.sampleGuestBulkFile()}
                    size={"sm"}
                    className="w-full text-xs border-2 border-dashed border-indigo-400 rounded-md p-1 mt-2 text-indigo-400 font-semibold"
                  >
                    <Download size={14} /> Download Sample Format
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  {store.guests.map((guest, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "relative transition-all animate-in fade-in slide-in-from-top-1",
                        !isMandatory(idx) && "pr-10",
                      )}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name Input */}
                        <div className="flex flex-col gap-1.5 p-2 px-4 bg-slate-50 rounded-2xl border border-transparent focus-within:border-indigo-500 focus-within:border-2 shadow-sm">
                          <label className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                            Full Name{" "}
                            {isMandatory(idx) && (
                              <span className="text-rose-500">*</span>
                            )}
                          </label>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-indigo-600" />
                            <input
                              value={guest.name}
                              onChange={(e) =>
                                store.updateGuest(idx, "name", e.target.value)
                              }
                              className="w-full bg-transparent font-medium text-sm outline-none"
                              placeholder="Guest Name"
                            />
                          </div>
                        </div>

                        {/* Phone Input with Country Selector */}
                        <div className="flex flex-col gap-1.5 p-2 px-4 bg-slate-50 rounded-2xl border border-transparent focus-within:border-indigo-600 focus-within:border-2 shadow-sm">
                          <label className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                            Phone Number{" "}
                            {isMandatory(idx) && (
                              <span className="text-rose-500">*</span>
                            )}
                          </label>
                          <div className="flex items-center gap-0">
                            <CountrySelector
                              selectedCode={guest.country_code}
                              onSelect={(val: string) =>
                                store.updateGuest(idx, "country_code", val)
                              }
                            />
                            <div className="h-4 w-px bg-slate-400 mx-3" />
                            <input
                              value={guest.phone}
                              onChange={(e) =>
                                store.updateGuest(idx, "phone", e.target.value)
                              }
                              className="w-full bg-transparent font-medium text-sm outline-none"
                              placeholder="12345 67890"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remove Button for optional guests */}
                      {!isMandatory(idx) && (
                        <button
                          onClick={() => store.removeGuest(idx)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl p-1.5 transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Additional Info */}
          <section className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">
                Luggage Details{" "}
                <span className="text-slate-400 text-[9px]">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={store.luggageDetails}
                onChange={(e) =>
                  store.setField("luggageDetails", e.target.value)
                }
                className="w-full min-h-18 custom-scrollbar overflow-y-scroll p-2 bg-slate-50 rounded-xl text-[10px] outline-none resize-none focus-within:border-indigo-500 focus-within:border-2 shadow-sm"
                placeholder="e.g. 2 Large bags"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-600 uppercase ml-1">
                Special Requirements{" "}
                <span className="text-slate-400 text-[9px]">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={store.specialRequirements}
                onChange={(e) =>
                  store.setField("specialRequirements", e.target.value)
                }
                className="w-full min-h-18 custom-scrollbar overflow-y-scroll p-2 bg-slate-50 rounded-xl text-[10px] outline-none resize-none focus-within:border-indigo-500 focus-within:border-2 shadow-sm"
                placeholder="e.g. AC, Water bottles"
              />
            </div>
          </section>
        </div>
        <div className="flex flex-1 mt-2 gap-4">
          <Button
            onPress={handleCancel}
            className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-xl text-lg shadow-sm hover:bg-indigo-100 transition-all active:scale-95 tracking-wider"
          >
            Cancel
          </Button>
          <Button
            onPress={handleCreateRequest}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl text-lg shadow-sm hover:bg-indigo-500 transition-all active:scale-95 tracking-wider"
          >
            Create Request
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewRequest;
