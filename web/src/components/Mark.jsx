import React from "react";

/** The SCOUT mark (brand/mark.svg): allowed hours on a clock face. Use at 24 px and above. */
export default function Mark({ size = 30, title = "SCOUT" }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 96 96" role="img" aria-label={title}>
      <path fillRule="evenodd" d="M48 4a44 44 0 1 0 0 88a44 44 0 1 0 0-88zM55 41V11.67A37 37 0 0 1 84.33 41z" fill="#8a6d2f" />
      <path d="M45 14h6v34h-6zM48 45h26v6H48z" fill="#f7f4ee" />
      <circle cx="48" cy="48" r="7" fill="#f7f4ee" />
      <circle cx="48" cy="48" r="2.5" fill="#8a6d2f" />
    </svg>
  );
}
