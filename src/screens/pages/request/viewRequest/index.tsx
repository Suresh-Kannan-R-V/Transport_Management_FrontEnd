import { Button, Card, ScrollShadow, useDisclosure } from "@heroui/react";
import axios from "axios";
import {
  Briefcase,
  Calendar,
  Car,
  CarFront,
  CheckCheck,
  Clock,
  Copy,
  Info,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Trash2,
  User,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FILE_BASE_URL } from "../../../../api/base";
import { BackButton, TransportLoader } from "../../../../components";
import MapViewer from "../../../../components/MapComponent";
import { useUserStore } from "../../../../store";
import {
  cn,
  formatDateTime,
  formatDuration,
  geocodeLocations,
  ROUTE_STATUS,
  RouteStatus,
} from "../../../../utils/helper";
import { VehicleAssignmentPopup } from "../assignVehicle";
import { AssignDriverModal } from "../assignDriver";
import { FacultyApprovalModal } from "../facultyApprove";

export interface MappedStop {
  id: string;
  address: string;
  lat: number;
  lon: number;
}

interface Guest {
  id: number;
  name: string;
  phone: string;
  seat_number: number;
  status: string;
}

interface Schedule {
  schedule_id: number;
  status: number;
  start_datetime: string;
  end_datetime: string | null;
  vehicle?: {
    id: number;
    vehicle_number: string;
    vehicle_type: string;
    vehicle_capacity: number;
    assigned_at: string | null;
    assigned_by: string | null;
  } | null;
  driver?: {
    id: number;
    name: string;
    phone: string;
  } | null;
  guest_count: number;
  guests?: Guest[];
}

interface Creator {
  id: number;
  name: string;
  user_name: string;
  email: string;
  phone: string;
  faculty_id: string | null;
  destination: string | null;
  department: string | null;
  Role: {
    id: number;
    name: string;
  };
}

interface RouteData {
  travel_info: {
    route_name: string;
    type: string;
    start_date: string;
    end_date: string | null;
  };
  route_details: {
    selected_locations: string[];
    distance_km: number;
    duration_mins: number;
  };
  vehicle_config: {
    passenger_count: number;
  };
  additional_info: {
    special_requirements: string | null;
    luggage_details: string | null;
  };
  total_guest: number;
  guests: Guest[];
  route_status: number;
  faculty_remark: string | null;
  admin_remark: string | null;
  created_at: string;
  updated_at: string;
  creator: Creator;
  schedules: Schedule[];
}

const statusStyles: Record<number, string> = {
  1: "bg-amber-50 text-amber-500 border-amber-200 border", // Pending
  2: "bg-purple-50 text-purple-500 border-purple-200 border", // Vehicle Assigned
  3: "bg-purple-50 text-purple-500 border-purple-200 border", // Vehicle Reassigned
  4: "bg-indigo-50 text-indigo-500 border-indigo-200 border", // Faculty Approved
  5: "bg-teal-50 text-teal-500 border-teal-200 border", // Driver Assigned
  6: "bg-teal-50 text-teal-500 border-teal-200 border", // Driver Reassigned
  7: "bg-blue-50 text-blue-500 border-blue-200 border", // Started
  8: "bg-emerald-50 text-emerald-500 border-emerald-200 border", // Completed
  9: "bg-slate-50 text-slate-500 border-slate-200 border", // Cancelled
};

const ViewRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const roleName = useUserStore((state) => state.roleName);
  const [data, setData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mappedStops, setMappedStops] = useState<MappedStop[]>([]);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    null,
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  const handleCardClick = (id: number) => {
    setSelectedScheduleId(id);
    onOpen();
  };
  const [showPopup, setShowPopup] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const realId = atob(id);
      const response = await axios.get(
        `${FILE_BASE_URL}/request/get-by-id/${realId}`,
        {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        },
      );

      const requestData = response.data.data;
      setData(requestData);

      if (requestData?.route_details?.selected_locations) {
        const coords = await geocodeLocations(
          requestData.route_details.selected_locations,
        );
        setMappedStops(coords);
      }
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Failed to load request details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action: "cancel" | "uncancel" | "delete") => {
    const realId = parseInt(atob(id || ""));
    console.log(realId);

    try {
      const config = {
        headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
      };
      let res;

      if (action === "cancel") {
        res = await axios.patch(
          `${FILE_BASE_URL}/request/cancel-transport-request/${realId}`,
          {},
          config,
        );
      } else if (action === "uncancel") {
        res = await axios.patch(
          `${FILE_BASE_URL}/request/uncancel-transport-request/${realId}`,
          {},
          config,
        );
      } else {
        res = await axios.delete(
          `${FILE_BASE_URL}/request/delete-transport-request/${realId}`,
          config,
        );
      }

      if (res.data?.success) {
        toast.success(`Request ${action}ed successfully!`);

        if (action === "delete") {
          navigate("/request");
        } else {
          fetchData();
        }
      } else {
        toast.error(res.data?.message || `Failed to ${action} request`);
      }
    } catch (error: any) {
      console.error(`Error during ${action}:`, error);
      toast.error(
        error.response?.data?.message || `Failed to ${action} request`,
      );
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <TransportLoader size={60} />
      </div>
    );
  if (!data)
    return <div className="p-10 text-center font-bold">Request not found.</div>;

  const schedule = data.schedules[0];

  return (
    <div className="px-4 py-2 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-5 mb-3">
        <div className="flex gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 uppercase tracking-tight">
              {data.travel_info.route_name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-slate-500 text-xs font-medium flex items-center gap-2">
                <Calendar size={14} className="text-indigo-600" />
                Created: {formatDateTime(data.created_at)}
              </p>
              <span className="px-3 pt-1 pb-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase">
                {data.travel_info.type}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div
            className={cn(
              "capitalize font-bold text-xs border rounded-full px-4 py-1.5 inline-flex items-center shadow-sm",
              statusStyles[data.route_status] ||
                "bg-slate-50 text-slate-500 border-slate-200 border",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full mr-2 animate-pulse bg-current",
              )}
            />
            {RouteStatus[data?.route_status] || "Unknown"}
          </div>
          {roleName === "Faculty" &&
            (data?.route_status === ROUTE_STATUS.VEHICLE_ASSIGNED ||
              data?.route_status === ROUTE_STATUS.VEHICLE_REASSIGNED) && (
              <Button
                variant="faded"
                size="sm"
                startContent={<CheckCheck size={14} />}
                isDisabled={
                  data?.route_status !== ROUTE_STATUS.VEHICLE_ASSIGNED &&
                  data?.route_status !== ROUTE_STATUS.VEHICLE_REASSIGNED
                }
                className="font-bold text-violet-600 rounded-lg bg-violet-50 text-xs"
                onPress={() => setIsApprovalOpen(true)}
              >
                Approve Route
              </Button>
            )}
          {data?.route_status === ROUTE_STATUS.PENDING && (
            <Button
              onPress={() => handleAction("cancel")}
              variant="faded"
              size="sm"
              className="bg-indigo-50 rounded-lg px-5 text-sm text-indigo-600 "
            >
              Cancel Request
            </Button>
          )}

          {(roleName === "Faculty" || roleName === "Transport Admin") &&
            data?.route_status === ROUTE_STATUS.CANCELLED && (
              <Button
                onPress={() => handleAction("uncancel")}
                variant="flat"
                size="sm"
                color="success"
                className="bg-green-50 rounded-lg px-5 text-sm text-green-600 "
              >
                UnCancel Request
              </Button>
            )}
          {(roleName === "Transport Admin" || roleName === "Faculty") && (
            <Button
              onPress={() => setConfirmDelete(true)}
              size="sm"
              startContent={<Trash2 size={14} />}
              isDisabled={
                schedule?.status !== 1 && roleName !== "Transport Admin"
              }
              className="text-white bg-rose-500 rounded-lg px-5 text-sm shadow-sm hover:bg-rose-600 transition-all active:scale-95 tracking-wider"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-5 space-y-3">
          <div className="h-80 bg-white shadow-md rounded-3xl overflow-hidden border-4 border-white">
            <MapViewer stops={mappedStops} />
          </div>

          <div className="p-3 px-4 pb-5 rounded-3xl bg-white shadow-md border border-slate-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                <MapPin className="text-indigo-600" size={20} /> Route Plan
              </h2>
              <div className="flex gap-2">
                <p className="text-slate-500 text-xs font-semibold flex items-center gap-1">
                  {formatDateTime(data.travel_info.start_date)}
                </p>
                {data.travel_info.end_date && (
                  <>
                    <div className="flex items-center gap-1 mx-1">
                      <span className="size-1 bg-indigo-500 rounded-full" />
                      <span className="size-2 bg-indigo-500 rounded-full" />
                      <span className="size-2 bg-indigo-500 rounded-full" />
                      <span className="size-1 bg-indigo-500 rounded-full" />
                    </div>
                    <p className="text-slate-500 text-xs font-semibold flex items-center gap-1">
                      {formatDateTime(data.travel_info.end_date)}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative space-y-8 px-2 mt-2 h-60 custom-scrollbar overflow-y-scroll">
              {mappedStops.map((stop, idx) => (
                <div key={stop.id} className="flex gap-4 relative">
                  {idx !== mappedStops.length - 1 && (
                    <div className="absolute left-2.5 top-8 h-full border-l-2 border-dashed border-slate-400 z-50" />
                  )}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 mt-1 shadow-sm",
                      idx === 0
                        ? "bg-emerald-500"
                        : idx === mappedStops.length - 1
                          ? "bg-rose-500"
                          : "bg-indigo-400",
                    )}
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                      {idx === 0
                        ? "Source"
                        : idx === mappedStops.length - 1
                          ? "Destination"
                          : `Stop ${idx}`}
                    </p>
                    <p className="font-semibold text-sm leading-snug">
                      {stop.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              icon={<Clock />}
              label="Duration"
              value={`${formatDuration(data.route_details.duration_mins)}`}
              className="text-green-600 bg-green-100"
            />
            <MetricCard
              icon={<MapPin />}
              label="Distance"
              value={`${data.route_details.distance_km} km`}
              className="text-purple-600 bg-purple-50"
            />
            <MetricCard
              icon={<Users />}
              label="Capacity"
              value={data.vehicle_config.passenger_count}
              className="text-amber-600 bg-amber-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-5 pb-0 rounded-3xl border border-slate-200 shadow-md">
              <SectionTitle icon={<User size={22} />} title="Requested By" />
              {(data.creator.Role.name === "Transport Admin" && (
                <div className="flex flex-col items-center justify-center gap-2 py-15 bg-indigo-50 rounded-2xl border border-slate-300 border-dashed">
                  <Users className="text-slate-400" size={30} />
                  <p className="text-xs text-indigo-500 font-semibold">
                    Created By Admin
                  </p>
                </div>
              )) || (
                <div className="space-y-3 mt-5">
                  <InfoRow
                    icon={<Briefcase size={14} />}
                    label="Name"
                    value={data.creator.name}
                    valueClassName="uppercase"
                  />
                  <InfoRow
                    icon={<Mail size={14} />}
                    label="Email"
                    value={
                      <p
                        className=" flex justify-end gap-2 text-xs font-medium cursor-pointer text-slate-500 hover:text-indigo-600 hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(data.creator.email);
                          toast.success("Email copied to clipboard");
                        }}
                      >
                        <Copy size={12} />
                        <span>{data.creator.email}</span>
                      </p>
                    }
                  />
                  <InfoRow
                    icon={<Phone size={14} />}
                    label="Phone"
                    value={
                      <p
                        className=" flex justify-end gap-2 text-xs font-medium cursor-pointer text-slate-500 hover:text-indigo-600 hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(data.creator.phone);
                          toast.success("Phone Number copied to clipboard");
                        }}
                      >
                        <Copy size={12} />
                        <span>{data.creator.phone}</span>
                      </p>
                    }
                  />
                  <InfoRow
                    icon={<ShieldCheck size={14} />}
                    label="Department"
                    value={
                      <span className="text-xs text-slate-500 font-medium">
                        {data.creator.department}
                      </span>
                    }
                  />
                  <InfoRow
                    icon={<ShieldCheck size={14} />}
                    label="Destination"
                    value={
                      <span className="text-xs text-slate-500 font-medium">
                        {data.creator.destination}
                      </span>
                    }
                  />
                </div>
              )}
            </div>
            <div className="p-4 pb-2 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <SectionTitle
                  icon={<Users />}
                  title={
                    <span className="w-36 truncate">{`Guest (${data.total_guest})`}</span>
                  }
                />
                {(roleName === "Transport Admin" ||
                  (roleName === "Faculty" &&
                    data?.route_status >= ROUTE_STATUS.VEHICLE_ASSIGNED &&
                    data?.route_status < ROUTE_STATUS.FACULTY_APPROVED)) && (
                  <Button
                    size="sm"
                    onPress={() => setShowPopup(true)}
                    isDisabled={
                      data?.route_status === ROUTE_STATUS.COMPLETED ||
                      data?.route_status === ROUTE_STATUS.CANCELLED
                    }
                    className={cn(
                      "text-xs font-medium items-start px-3 h-6 rounded-3xl justify-center",
                      data?.route_status === ROUTE_STATUS.VEHICLE_ASSIGNED ||
                        data?.route_status === ROUTE_STATUS.VEHICLE_REASSIGNED
                        ? "text-orange-600 "
                        : "text-indigo-600 ",
                    )}
                  >
                    {data?.route_status === ROUTE_STATUS.VEHICLE_ASSIGNED ||
                    data?.route_status === ROUTE_STATUS.VEHICLE_REASSIGNED
                      ? "Reassign Vehicles"
                      : "Assign Vehicles"}
                  </Button>
                )}
              </div>
              <ScrollShadow className="space-y-2 h-48 overflow-y-scroll pr-2 custom-scrollbar">
                {data.guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-500 transition-colors hover:shadow-md"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm text-xs border border-slate-200">
                      {guest.seat_number}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {guest.name}
                      </p>
                      {guest.phone !== "null -1" && (
                        <p
                          className=" flex gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:underline cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(guest.phone);
                            toast.success(`${guest.name} Phone number copied`);
                          }}
                        >
                          <Phone size={12} />
                          <span>{guest.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollShadow>
            </div>
          </div>
          {showPopup && (
            <VehicleAssignmentPopup
              routeId={id}
              guests={data?.guests}
              existingSchedules={
                data?.schedules?.map((schedule) => ({
                  schedule_id: schedule.schedule_id,
                  vehicle: schedule.vehicle
                    ? {
                        id: schedule.vehicle.id,
                        vehicle_number: schedule.vehicle.vehicle_number,
                        vehicle_type: schedule.vehicle.vehicle_type,
                        capacity: Number(schedule.vehicle.vehicle_capacity),
                        status: "active" as const,
                      }
                    : null,
                  guests: schedule.guests || [],
                })) as any
              }
              onClose={() => {
                setShowPopup(false);
                fetchData();
              }}
            />
          )}
          <div className="relative group">
            <ScrollShadow
              className={cn(
                "flex gap-1 pb-1 no-scrollbar snap-x snap-mandatory",
                data.schedules.length === 1 && !data.schedules[0].vehicle
                  ? "w-full"
                  : "h-fit overflow-y-auto scrollbar-none",
              )}
            >
              {data.schedules.map((schedule) => (
                <div
                  key={schedule.schedule_id}
                  className={cn(
                    "h-full snap-start transition-all duration-300 mx-1",
                    !schedule.vehicle && data.schedules.length === 1
                      ? "w-full"
                      : "min-w-80",
                  )}
                >
                  <Card
                    isDisabled={
                      roleName !== "Transport Admin" ||
                      data?.route_status !== ROUTE_STATUS.FACULTY_APPROVED
                    }
                    isPressable={
                      roleName === "Transport Admin" &&
                      data?.route_status === ROUTE_STATUS.FACULTY_APPROVED
                    }
                    onPress={() => handleCardClick(schedule.schedule_id)}
                    className={cn(
                      "w-full p-5 pb-2 rounded-3xl border border-slate-100 shadow-sm bg-wh  h-full flex flex-col justify-between transition-all",
                      !schedule.vehicle &&
                        "bg-indigo-50/50 border-dashed border-indigo-200",
                    )}
                  >
                    <div className={cn(!schedule.vehicle && "flex-1")}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex gap-2">
                          <SectionTitle
                            icon={<Car className="text-indigo-600" />}
                            title={
                              schedule?.vehicle?.vehicle_number || "unDefined"
                            }
                          />
                          {schedule?.vehicle?.vehicle_type && (
                            <span className="text-xs mt-0.5 text-slate-500">
                              {schedule.vehicle.vehicle_type}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <p className="text-xs text-slate-500 font-medium">
                            {schedule.guest_count} Guests
                          </p>
                        </div>
                      </div>

                      {schedule.vehicle ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                          <ScrollShadow className="h-57 overflow-y-scroll space-y-2 custom-scrollbar">
                            {schedule?.guests?.map((guest) => (
                              <div
                                key={guest.id}
                                className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-500 transition-colors hover:shadow-md"
                              >
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 shadow-sm text-xs border border-slate-200">
                                  {guest.seat_number}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="font-bold text-slate-800 text-sm truncate text-left">
                                    {guest.name}
                                  </p>
                                  {guest.phone !== "null -1" && (
                                    <p
                                      className=" flex gap-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:underline cursor-pointer"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          guest.phone,
                                        );
                                        toast.success(
                                          `${guest.name} Phone number copied`,
                                        );
                                      }}
                                    >
                                      <Phone size={12} />
                                      <span>{guest.phone}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </ScrollShadow>
                          {schedule.driver && (
                            <div className="py-1.5 pb-2 px-2 flex justify-between items-center border-t border-slate-200">
                              <div className="flex items-center gap-1">
                                <CarFront
                                  size={16}
                                  className="text-indigo-600 mr-2"
                                />
                                <p className="font-semibold text-xs">
                                  {schedule.driver.name}
                                </p>
                              </div>
                              <p
                                className="text-xs text-slate-400 flex gap-1 items-center"
                                onClick={() => {
                                  const phone = schedule?.driver?.phone;
                                  if (phone) {
                                    navigator.clipboard.writeText(
                                      phone as string,
                                    );
                                    toast.success(
                                      "Driver Phone Number copied to clipboard",
                                    );
                                  }
                                }}
                              >
                                <Phone
                                  size={12}
                                  className="text-slate-400 mr-1"
                                />
                                {schedule?.driver?.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-60 text-indigo-600 py-4">
                          <Car size={48} className="mb-2" strokeWidth={1.5} />
                          <p className="text-sm font-semibold text-center">
                            No Vehicle Assigned Yet
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                  {
                    <AssignDriverModal
                      isOpen={isOpen}
                      onOpenChange={onOpenChange}
                      scheduleId={selectedScheduleId}
                      VehicleId={schedule.vehicle?.vehicle_number || null}
                      onSuccess={() => {
                        fetchData();
                      }}
                    />
                  }
                </div>
              ))}
            </ScrollShadow>
          </div>
          {roleName === "Faculty" &&
            (data?.route_status === ROUTE_STATUS.VEHICLE_ASSIGNED ||
              data?.route_status === ROUTE_STATUS.VEHICLE_REASSIGNED) && (
              <FacultyApprovalModal
                isOpen={isApprovalOpen}
                onOpenChange={() => setIsApprovalOpen(false)}
                routeId={id || null}
                onSuccess={() => {
                  fetchData();
                }}
              />
            )}
        </div>
        <div className="p-5 rounded-3xl border border-slate-200 shadow-md col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SectionTitle icon={<Info />} title="Requirements" />
              <div className="space-y-4">
                <RemarkBox
                  label="Special Requirements"
                  content={data.additional_info.special_requirements}
                />
                <RemarkBox
                  label="Luggage Details"
                  content={data.additional_info.luggage_details}
                />
              </div>
            </div>
            <div>
              <SectionTitle icon={<MessageSquare />} title="Remarks" />
              <div className="space-y-4">
                <RemarkBox
                  label="Faculty Remark"
                  content={data.faculty_remark}
                />
                <RemarkBox label="Admin Remark" content={data.admin_remark} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop--md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">
              Confirm Delete
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to Delete?
            </p>
            <div className="flex gap-3 mt-8">
              <Button
                onPress={() => setConfirmDelete(false)}
                className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                onPress={() => handleAction("delete")}
                className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium bg-rose-600 text-white rounded-lg shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactElement<{ size?: number }>;
  label: string;
  value: string | number;
  className: string;
}) => (
  <div className="p-2.5 px-4 rounded-2xl shadow-sm flex flex-row items-center gap-4 bg-white border border-slate-200">
    <div className={cn("p-2 rounded-lg shadow-sm", className)}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
      <p className="text-xl font-bold text-indigo-600 leading-tight">{value}</p>
    </div>
  </div>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactElement<{ size?: number; className?: string }>;
  title: string | React.ReactNode;
}) => (
  <h4
    className={cn(
      "text-sm font-bold mb-2 flex items-center gap-2 text-slate-800",
    )}
  >
    {React.cloneElement(icon, {
      size: 16,
      className: "text-indigo-600",
    })}
    {title}
  </h4>
);

const InfoRow = ({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate-500 flex items-center gap-2">
      <span className="text-indigo-600">{icon}</span> {label}
    </span>
    <span
      className={cn(
        "font-semibold text-slate-700 w-52 truncate text-right",
        valueClassName,
      )}
    >
      {value || "N/A"}
    </span>
  </div>
);

const RemarkBox = ({
  label,
  content,
}: {
  label: string;
  content?: string | null;
}) => (
  <div>
    <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">
      {label}
    </p>
    <div className="h-12.5 p-2 bg-slate-50 rounded-xl text-xs italic border border-slate-100">
      {content || `No ${label.toLowerCase()} provided.`}
    </div>
  </div>
);

export default ViewRequest;
