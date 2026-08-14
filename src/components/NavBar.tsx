"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/food", label: "Food" },
  { href: "/workouts", label: "Workouts" },
  { href: "/runs", label: "Runs" },
  { href: "/stats", label: "Statistics" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #1e1e1e",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 700,
            fontSize: 19,
            color: "#f2f2f2",
            letterSpacing: "-0.02em",
          }}
        >
          FitTrack
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "8px 14px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  background: active ? "#3b82f6" : "transparent",
                  color: active ? "#fff" : "#9a9a9a",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
