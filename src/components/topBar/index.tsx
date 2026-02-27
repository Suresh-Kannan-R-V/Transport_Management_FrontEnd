/* eslint-disable @typescript-eslint/no-unused-vars */
import { Bell, Copy, Menu, Truck, UserRound, X } from "lucide-react";
import React from "react";
import { useCommonStore, useUserStore } from "../../store";
import { cn, getTokenRemainingTime, privateGet } from "../../utils/helper";

/* 🔹 Role config */
// const roleConfig: Record<number, { label: string; className: string }> = {
//   1: {
//     label: "Admin",
//     className: "bg-yellow-200 text-gray-800",
//   },
//   2: {
//     label: "Driver",
//     className: "bg-blue-200 text-blue-800",
//   },
//   3: {
//     label: "Customer",
//     className: "bg-green-200 text-green-800",
//   },
// };

export default function Topbar() {
  const isOpen = useCommonStore((state) => state.isOpen);
  const setState = useCommonStore((state) => state.setCommonStates);

  const user = useUserStore((state) => state.user);
  const role = useUserStore((state) => state.roleName);

  const [remainingTime, setRemainingTime] = React.useState("00:00:00");

  React.useEffect(() => {
    setRemainingTime(getTokenRemainingTime());

    const interval = setInterval(() => {
      setRemainingTime(getTokenRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const type = privateGet("type");

  return (
    <header className="bg-white flex items-center justify-between px-4 py-1  shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg hidden lg:block">
          <Truck className="text-indigo-600" />
        </div>
        <div
          onClick={() => setState("isOpen", !isOpen)}
          className="cursor-pointer p-2 rounded-md text-indigo-500 hover:bg-indigo-500/20 block lg:hidden"
        >
          {!isOpen ? (
            <Menu size={18} strokeWidth={2.5} />
          ) : (
            <X size={18} strokeWidth={2.5} />
          )}
        </div>
        <div>
          <p className="hidden sm:block font-semibold">
            Transport Management System
          </p>
          <p className="block sm:hidden font-semibold">TMS</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {type === "WEB" && (
          <div className="px-4 py-1 rounded-full font-mono font-bold text-sm bg-indigo-100 text-indigo-500">
            {remainingTime}
          </div>
        )}
        <div className="cursor-pointer p-2 rounded-md text-gray-500 hover:text-indigo-500 hover:bg-indigo-500/20 ease-in-out duration-300">
          <Bell size={18} strokeWidth={2.5} />
        </div>

        <ProfileSection user={user} role={role} />
      </div>
    </header>
  );
}

const ProfileSection = ({ user, role }: { user: any; role: any }) => {
  const userName = user?.name || "-";
  const userEmail = user?.email || "-";

  return (
    <div className="group relative flex flex-col items-center justify-center p-2 cursor-pointer w-full h-12">
      <div className="flex items-center w-full justify-center lg:justify-start gap-3">
        <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105">
          <div className="size-7 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all">
            <UserRound className="size-full text-indigo-500" />
          </div>
          {/* <img src={profileImg} alt="profile" /> */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
        </div>

        <div className="hidden lg:flex flex-col leading-tight overflow-hidden transition-all duration-300">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate w-24 uppercase">
            {userName}
          </p>
          <p
            className={cn(
              "inline-flex w-fit items-center rounded-full px-2 pt-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-600",
            )}
          >
            {role}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "absolute top-full right-[2%] z-10",
          "flex flex-col overflow-hidden whitespace-nowrap pointer-events-none",

          "w-0 h-0 opacity-0 origin-top transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "group-hover:min-w-64 w-fit group-hover:h-auto group-hover:opacity-100 group-hover:p-3 group-hover:pointer-events-auto",
          "bg-white dark:bg-slate-900 border-2 border-indigo-500 dark:border-slate-800 shadow-xl rounded-2xl backdrop-blur-xl",
        )}
      >
        <p className="text-sm text-indigo-500 font-bold uppercase">
          Profile Details
        </p>
        <div className="flex flex-col gap-0">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 uppercase">
            {userName}
          </h4>
          <p
            className=" flex gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:underline"
            onClick={() => navigator.clipboard.writeText(userEmail)}
          >
            <Copy size={12} />
            <span>{userEmail}</span>
          </p>

          <div className="h-px bg-slate-200 dark:bg-slate-700 my-2 w-full" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Role:</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-md font-bold bg-indigo-100 text-indigo-600",
                )}
              >
                {role || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
