import React from "react";

export default function HeartHero() {
  return (
    <div style={{ maxWidth: "100px", margin: "0 auto 2rem" }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-animated"
      >
        <path d="M12 21C12 21 7 16 5 12.5C3.5 9 5 6 7 5C9 3.5 12 5 12 5C12 5 15 3.5 17 5C19 6 20.5 9 19 12.5C17 16 12 21 12 21Z" />
        <path d="M12 12V21" />
      </svg>
    </div>
  );
}
