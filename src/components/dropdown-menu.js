import React from "react";

export function DropdownMenu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild, ...props }) {
  if (asChild) {
    return React.cloneElement(React.Children.only(children), props);
  }
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, align = "start", className = "", ...props }) {
  const alignClass = align === "end" ? "right-0" : "left-0";
  return (
    <div {...props} className={`absolute z-50 mt-1 min-w-[8rem] rounded-md shadow bg-white ${alignClass} ${className}`}>
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = "", ...props }) {
  return (
    <button type="button" onClick={onClick} {...props} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${className}`}>
      {children}
    </button>
  );
}
