import { Outlet } from "react-router-dom";

export const Layout = () => {
    return (
        <div className="relative flex justify-center items-center min-h-screen p-4 bg-slate-50 dark:bg-[#111827] transition-colors duration-500 overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-[15%] left-[10%] size-[700px] rounded-full bg-indigo-100/30 dark:bg-indigo-900/10" />
                <div className="absolute -bottom-[20%] -left-[10%] size-[800px] rounded-full bg-pink-100/40 dark:bg-slate-800/20" />
                <div className="absolute top-[20%] -right-[5%] size-[400px] rounded-full hidden md:block bg-blue-100/40 dark:bg-blue-900/10" />
            </div>

            <main className="relative z-10 w-full max-w-xl min-h-[500px] bg-white dark:bg-[#1e293b] shadow-xl rounded-3xl p-8 md:p-12 transition-all duration-500">
                <div className="text-slate-900 dark:text-white flex flex-col justify-center items-center">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;