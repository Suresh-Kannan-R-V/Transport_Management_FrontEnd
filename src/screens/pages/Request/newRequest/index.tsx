import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import "leaflet/dist/leaflet.css";
import {
  GripVertical,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useRequestStore } from "../../../../store/RequestStore";

const MemoizedMap = memo(({ stops }: { stops: any[] }) => {
  return (
    <MapContainer
      {...({
        center: [11.4965, 77.2764],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      } as any)}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      {stops.map(
        (stop, i) =>
          stop.lat && <Marker key={i} position={[stop.lat, stop.lon!]} />,
      )}
      <MapAutoCenter stops={stops} />
    </MapContainer>
  );
});

const MapAutoCenter = ({ stops }: { stops: any[] }) => {
  const map = useMap();
  useMemo(() => {
    const valid = stops.filter((s) => s.lat);
    if (valid.length > 0) {
      const coords = valid.map((s) => [s.lat, s.lon] as [number, number]);
      map.fitBounds(coords, { padding: [20, 20], maxZoom: 15 });
    }
  }, [stops, map]);
  return null;
};

const RouteInput = ({ value, onChange, placeholder, className }: any) => {
  const [localValue, setLocalValue] = useState(value);

  const handleBlur = () => onChange(localValue);

  return (
    <input
      className={className}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
    />
  );
};

export const NewRequest = () => {
  const store = useRequestStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(store.stops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    store.reorderStops(items);
  };

  const validatePhoneCount = () => {
    const filledPhones = store.guestNames.filter(
      (g) => g.phone.trim().length > 0,
    ).length;
    return store.passengerCount === 1 ? filledPhones === 1 : filledPhones >= 2;
  };

  return (
    <div className="flex overflow-hidden font-sans">
      <div className="w-1/2 flex flex-col border-r border-slate-200">
        <div className="h-[35%] relative border-b-4 border-white">
          <MemoizedMap stops={store.stops} />
        </div>

        <div className="h-[65%] overflow-y-auto p-8 bg-white">
          <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
            <MapPin className="text-indigo-600" size={22} /> Travel & Route
          </h2>

          <div className="space-y-6">
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
              {["One Way", "Two Way", "Multi Day"].map((t) => (
                <button
                  key={t}
                  onClick={() => store.setField("travelType", t)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    store.travelType === t
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

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
                            className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                          >
                            <div {...p.dragHandleProps}>
                              <GripVertical
                                className="text-slate-300"
                                size={18}
                              />
                            </div>
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? "bg-green-500" : idx === store.stops.length - 1 ? "bg-red-500" : "bg-indigo-400"}`}
                            />

                            <RouteInput
                              className="bg-transparent flex-1 font-bold outline-none text-sm"
                              value={stop.address}
                              onChange={(val: string) =>
                                store.updateStop(idx, val)
                              }
                              placeholder="Enter location..."
                            />

                            {idx !== 0 && idx !== store.stops.length - 1 && (
                              <button onClick={() => store.removeStop(idx)}>
                                <Trash2
                                  size={16}
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

            <button
              onClick={store.addStop}
              className="w-full py-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-50"
            >
              + Add Stop
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 bg-white p-10 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">
            Passenger Details
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Manage guests and vehicle capacity
          </p>
        </header>

        <div className="space-y-8">
          {/* Passenger Count Container */}
          <div className="bg-indigo-50 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                Total Passengers
              </p>
              <input
                type="number"
                value={store.passengerCount}
                onChange={(e) =>
                  store.setField("passengerCount", e.target.value)
                }
                className="bg-transparent text-3xl font-black text-indigo-900 outline-none w-24"
              />
            </div>
            <Users className="text-indigo-200" size={48} />
          </div>

          <section>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
                Guest Information
              </h3>
              {store.isBulkUpload && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded-md">
                  Bulk Mode Enabled
                </span>
              )}
            </div>

            {store.isBulkUpload ? (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="mx-auto text-slate-300 mb-4" size={40} />
                <p className="font-bold text-slate-600">
                  Upload Guest List (CSV/XLSX)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {store.guestNames.map((guest, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">
                        Name
                      </label>
                      <input
                        value={guest.name}
                        onChange={(e) =>
                          store.updateGuest(idx, "name", e.target.value)
                        }
                        className="w-full bg-transparent font-bold text-sm outline-none"
                        placeholder="Guest Name"
                      />
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <label className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">
                        Phone{" "}
                        {(idx < 2 || store.passengerCount === 1) && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-300" />
                        <input
                          value={guest.phone}
                          onChange={(e) =>
                            store.updateGuest(idx, "phone", e.target.value)
                          }
                          className="w-full bg-transparent font-bold text-sm outline-none"
                          placeholder="+91 ..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {!store.isBulkUpload && !validatePhoneCount() && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
              <ShieldCheck size={18} />
              {store.passengerCount === 1
                ? "Guest phone number is required."
                : "At least 2 guest phone numbers are required."}
            </div>
          )}

          <button className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all active:scale-95 uppercase">
            Create Request
          </button>
        </div>
      </div>
    </div>
  );
};
