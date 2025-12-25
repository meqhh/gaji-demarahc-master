import React, { useEffect, useRef } from "react";

export function Checkbox({ checked = false, onCheckedChange, className = "", ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = checked === "indeterminate";
    }
  }, [checked]);

  const isChecked = checked === true;

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={isChecked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={`h-4 w-4 rounded ${className}`}
      {...props}
    />
  );
}
