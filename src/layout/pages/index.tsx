import { Outlet } from "react-router-dom";

import React from "react";
import { useCommonStore, useUserStore } from "../../store";
import Sidebar from "../../components/sideBar";
import Topbar from "../../components/topBar";
import { cn } from "../../utils/helper";

const Layout = () => {
  const isOpen = useCommonStore((state) => state.isOpen);
  const setCommonStates = useCommonStore((state) => state.setCommonStates);
  const fetchProfile = useUserStore((state) => state.fetchProfile);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  React.useEffect(() => {
    const handleResize = () => {
      setCommonStates("isOpen", window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Topbar />
        <div
          className={
            "flex flex-col transition-all duration-300 p-4 overflow-hidden h-full"
          }
        >
          <main className="p-4 pr-0 bg-white dark:bg-slate-900 rounded-2xl h-full">
            <div
              className={cn(
                "h-full overflow-y-scroll pr-3",
                "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full",
              )}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
