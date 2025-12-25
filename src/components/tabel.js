import React from "react";

export function Table({ children, className = "", ...props }) {
  return (
    <div className={`w-full overflow-auto ${className}`}>
      <table {...props} className="w-full table-auto">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return <thead>{children}</thead>;
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <th {...props} className={`text-left px-4 py-2 font-medium ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "", ...props }) {
  return (
    <tr {...props} className={className}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td {...props} className={`px-4 py-2 align-top ${className}`}>
      {children}
    </td>
  );
}
