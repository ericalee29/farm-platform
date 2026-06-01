// src/components/CropTrustIcons.jsx
// Lucide-style inline icons — 2px round stroke, currentColor
// Used across all CropTrust surfaces

export default function Icon({ name, size = 18, style, className }) {
  const paths = {
    leaf: (
      <>
        <path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 7-7h7v7a7 7 0 0 1-7 7z" />
        <path d="M11 13 4 6" />
      </>
    ),
    "qr-code": (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h3v3m0 4h4m0-4v4m-7-4h.01M14 21h.01" />
      </>
    ),
    "badge-check": (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
    "x-circle": (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </>
    ),
    shield: (
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    external: (
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    ),
    alert: (
      <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    ),
    loader: (
      <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="15" />
    ),
  };

  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
