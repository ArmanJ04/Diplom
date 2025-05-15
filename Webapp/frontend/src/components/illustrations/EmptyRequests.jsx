export function EmptyRequests() {
  return (
    <div style={{ maxWidth: "120px", margin: "2rem auto", opacity: 0.5 }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-animated"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
        <path d="M3 10h18" />
        <path d="M7 16h.01" />
        <path d="M11 16h.01" />
        <path d="M15 16h.01" />
      </svg>
    </div>
  );
}
