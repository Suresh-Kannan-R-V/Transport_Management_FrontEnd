import {
  LayoutDashboard,
  LogOut,
  Settings
} from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCommonStore, useUserStore } from "../../store";
import { cn } from "../../utils/helper";

const menu = [
  { name: "Workspace", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = React.useState(false);

  const isOpen = useCommonStore((state) => state.isOpen);
  const setState = useCommonStore((state) => state.setCommonStates);
  const logout = useUserStore((state) => state.logout);

  const handleLogout = async () => {
    setShowLogout(false)
    logout();
    navigate("/auth/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/10 lg:hidden"
          onClick={() => setState("isOpen", false)}
        />
      )}

      <aside
        className={cn(
          "z-50 flex flex-col items-center justify-center",
          "lg:static lg:translate-x-0 lg:w-fit lg:min-h-80",
          "fixed top-16 left-4",
          isOpen ? "-translate-x-1" : "-translate-x-10 hidden",

          className
        )}
      >
        <div className={cn("bg-white dark:bg-slate-900/90 p-4 px-1 min-h-80 transition-transform duration-300 rounded-2xl flex flex-col items-center",
          "border border-white/40 dark:border-slate-700/50 shadow-2xl",
        )}>

          <nav className={`flex flex-col gap-3 grow border-b border-slate-200 dark:border-slate-800`}>
            {menu.map((item) => (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={location.pathname === item.path || location.pathname.startsWith(item.path + '/')}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 768) setState("isOpen", false);
                }}
              />
            ))}

          </nav>
          <SidebarItem
            item={{ name: "Logout", icon: LogOut, path: "" }}
            isLogout={true}
            isActive={false}
            onClick={() => setShowLogout(true)}
          />
        </div>
      </aside>

      {showLogout && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold">Confirm Logout</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Are you sure you want to end your session?</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowLogout(false)} className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium text-indigo-500 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleLogout} className="cursor-pointer flex-1 px-4 py-2.5 text-sm font-medium bg-rose-600 text-white rounded-lg shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





const SidebarItem = ({ item, isActive, onClick, isLogout = false }: { item: typeof menu[0]; isActive: boolean; onClick: () => void; isLogout?: boolean }) => {
  const Icon = item.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-center p-3 cursor-pointer rounded-lg transition-colors ease-in-out duration-500",
        !isLogout && "hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20",
        isActive && !isLogout && "bg-indigo-500/20 dark:bg-indigo-500/20",
        // Logout (Red) Hover and Active
        isLogout && "hover:bg-red-500/10 dark:hover:bg-red-500/20",
        isActive && isLogout && "bg-red-500/20 dark:bg-red-500/20"
      )}
    >
      <div
        className={cn(
          "relative z-10 transition-all duration-300",
          isLogout ? "text-rose-500" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 group-hover:scale-110",
          isActive && !isLogout && "text-indigo-600 dark:text-indigo-400 scale-110"
        )}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <div
        className={cn(
          "absolute left-12 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center overflow-hidden whitespace-nowrap",
          "size-0 opacity-0 origin-left transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          "group-hover:size-fit group-hover:opacity-100 group-hover:px-4 group-hover:py-2.5",
          "rounded-md shadow-lg",
          isLogout ? "bg-red-500" : "bg-indigo-600"
        )}
      >
        <span className="text-xs font-semibold uppercase text-white">
          {item.name}
        </span>
      </div>
    </div>
  );
};