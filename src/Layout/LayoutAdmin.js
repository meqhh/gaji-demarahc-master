import { Outlet } from "react-router-dom";
import Sidebar from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
// WelcomeToast intentionally not used for admin to avoid covering admin content

export default function AdminLayout() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="ml-60 flex-1 bg-gray-50 overflow-y-auto scroll-pt-40">
        <HeaderAdmin />
        <div className="min-h-full p-6 md:p-8 lg:p-10 pt-40">
          <main className="max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
