import { Outlet } from "react-router-dom";

import React from "react";
import { useCommonStore, useUserStore } from "../../store";
import Sidebar from "../../components/sideBar";
import Topbar from "../../components/topBar";

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
    <div className="flex flex-col gap-3 h-screen bg-gray-100 p-3">
      <Topbar />

      <div className="flex gap-3 h-screen overflow-hidden">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 max-md:pl-0 p-3 bg-white dark:bg-slate-900 rounded-2xl `}
        >
          <main className="flex-1 overflow-y-scroll p-3 px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
