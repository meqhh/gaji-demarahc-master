import React from "react";

export function Button({ children, className = "", variant, ...props }) {
  const base = "inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium focus:outline-none";
  const variants = {
    ghost: "bg-transparent hover:bg-gray-100",
    default: "bg-blue-600 text-white hover:bg-blue-700",
  };
  const cls = `${base} ${variants[variant] ?? variants.default} ${className}`;
  return (
    <button {...props} className={cls}>
      {children}
    </button>
  );
}
