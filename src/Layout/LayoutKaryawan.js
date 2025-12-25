import SidebarKaryawan from "../components/SidebarKaryawan";
import HeaderKaryawan from "../components/HeaderKaryawan";
import { Outlet } from "react-router-dom";

export default function LayoutKaryawan() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarKaryawan />

      <div className="ml-60 flex-1 overflow-y-auto bg-gray-50 scroll-pt-40">
        <HeaderKaryawan />
        <div className="p-6 md:p-8 lg:p-10 pt-40">
          <main className="max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
