import React from "react";

export default function StatCard({ title, value, subtitle, icon, border = "border-green-500" }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 border-l-4 ${border} flex items-center space-x-4`}> 
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-pink-700">
        {icon}
      </div>

      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold text-black mt-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
