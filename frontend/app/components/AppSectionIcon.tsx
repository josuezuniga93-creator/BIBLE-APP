"use client";

/**
 * Premium hierarchical duotone icon system.
 *
 * Design rules (applied to every icon):
 *  - 24×24 grid, live area ~3–21, consistent optical padding
 *  - Primary layer: currentColor stroke, 1.75px (2.05px when active), round caps/joins
 *  - Secondary layer: currentColor at 50% opacity — depth without extra colors
 *  - Active: main silhouette gains a soft 15% fill (SF Symbols–style hierarchical)
 */

export type AppSectionIconName =
  | "home"
  | "bible"
  | "notes"
  | "worship"
  | "extras"
  | "plans"
  | "library"
  | "tracker"
  | "kids"
  | "videos"
  | "study-tools"
  | "historical"
  | "collections"
  | "fellowship"
  | "church"
  | "give"
  | "church-analysis"
  | "timeline";

type Props = {
  name: AppSectionIconName;
  size?: number;
  active?: boolean;
  className?: string;
};

export function AppSectionIcon({ name, size = 22, active = false, className }: Props) {
  const sw = active ? 2.05 : 1.75; // primary stroke
  const sw2 = sw - 0.3; // secondary stroke
  const softFill = active ? "currentColor" : "none";
  const softOp = active ? 0.15 : 0;
  const loOp = 0.5; // secondary layer opacity

  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    "aria-hidden": true as const,
  };
  const round = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path
            d="M4 10.2 12 3.5l8 6.7v8.1a2.7 2.7 0 0 1-2.7 2.7H6.7A2.7 2.7 0 0 1 4 18.3v-8.1Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path
            d="M9.55 21v-4.1a2.45 2.45 0 0 1 4.9 0V21"
            stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round}
          />
        </svg>
      );

    case "bible":
      return (
        <svg {...common}>
          <rect
            x="4.75" y="2.75" width="14.5" height="18.5" rx="3.1"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <path d="M12 6.9v6.4M8.8 10.1h6.4" stroke="currentColor" strokeWidth={sw} {...round} />
          <path d="M4.75 17.6h14.5" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
        </svg>
      );

    case "notes":
      return (
        <svg {...common}>
          <rect
            x="4.25" y="3.25" width="15.5" height="17.5" rx="3.2"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <path
            d="M8.25 8.6h7.5M8.25 12.25h7.5M8.25 15.9h4.4"
            stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round}
          />
        </svg>
      );

    case "worship":
      return (
        <svg {...common}>
          <path
            d="M4 6.9h4.6A3.4 3.4 0 0 1 12 10.3v9.9a3.4 3.4 0 0 0-3.4-2.4H4V6.9Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path
            d="M20 6.9h-4.6A3.4 3.4 0 0 0 12 10.3v9.9a3.4 3.4 0 0 1 3.4-2.4H20V6.9Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path d="M12 2.4v3.4M10.4 4.1h3.2" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
        </svg>
      );

    case "extras":
      return (
        <svg {...common}>
          {([5, 12, 19] as const).map((x) =>
            ([5, 12, 19] as const).map((y) => {
              const isCenter = x === 12 && y === 12;
              return (
                <circle
                  key={`${x}-${y}`}
                  cx={x} cy={y}
                  r={isCenter ? (active ? 2.6 : 2.1) : 1.95}
                  fill="currentColor"
                  opacity={isCenter ? 1 : loOp + 0.15}
                />
              );
            }),
          )}
        </svg>
      );

    case "plans":
      return (
        <svg {...common}>
          <rect
            x="3.6" y="4.9" width="16.8" height="15.6" rx="3.4"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <path d="M8 2.9v3.4M16 2.9v3.4" stroke="currentColor" strokeWidth={sw} {...round} />
          <path d="M3.6 9.7h16.8" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
          <path d="m8.9 14.8 2.15 2.15 4.15-4.9" stroke="currentColor" strokeWidth={sw} {...round} />
        </svg>
      );

    case "library":
      return (
        <svg {...common}>
          <rect
            x="3.9" y="3.9" width="4.3" height="16.2" rx="1.7"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <rect
            x="9.8" y="3.9" width="4.3" height="16.2" rx="1.7"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <path d="m15.5 5 4.3 14.7" stroke="currentColor" strokeWidth={sw} {...round} />
          <path d="M3.9 16.7h4.3M9.8 16.7h4.3" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
        </svg>
      );

    case "tracker":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth={sw2} opacity={loOp} />
          <path
            d="M12 3.6a8.4 8.4 0 1 1-8.4 8.4"
            stroke="currentColor" strokeWidth={sw} {...round}
            fill={softFill} fillOpacity={softOp}
          />
          <path d="m8.7 12.3 2.2 2.2 4.3-5" stroke="currentColor" strokeWidth={sw} {...round} />
        </svg>
      );

    case "kids":
      return (
        <svg {...common}>
          <circle cx="6.9" cy="6.9" r="2.3" stroke="currentColor" strokeWidth={sw2} opacity={loOp} />
          <circle cx="17.1" cy="6.9" r="2.3" stroke="currentColor" strokeWidth={sw2} opacity={loOp} />
          <circle
            cx="12" cy="13.1" r="6.6"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <circle cx="9.8" cy="12.2" r=".9" fill="currentColor" />
          <circle cx="14.2" cy="12.2" r=".9" fill="currentColor" />
          <path d="M9.9 15.4c1.15 1.05 3.05 1.05 4.2 0" stroke="currentColor" strokeWidth={sw2} {...round} />
        </svg>
      );

    case "videos":
      return (
        <svg {...common}>
          <rect
            x="3.1" y="5.1" width="17.8" height="13.8" rx="3.6"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <path
            d="M10.3 9.35a.75.75 0 0 1 1.13-.65l4.35 2.65a.75.75 0 0 1 0 1.3l-4.35 2.65a.75.75 0 0 1-1.13-.65v-5.3Z"
            fill="currentColor" opacity={active ? 1 : loOp + 0.15}
          />
        </svg>
      );

    case "study-tools":
      return (
        <svg {...common}>
          <path
            d="M4.25 5.35h5.35A3.4 3.4 0 0 1 13 8.75v10.9a3.4 3.4 0 0 0-3.4-2.35H4.25V5.35Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path
            d="M19.75 5.35H14.4A3.4 3.4 0 0 0 11 8.75v10.9a3.4 3.4 0 0 1 3.4-2.35h5.35V5.35Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path d="M8 9.25h2.1M8 12h2.1M15.1 9.25h1.9" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
          <circle cx="16.25" cy="14.25" r="2.1" stroke="currentColor" strokeWidth={sw} />
          <path d="m17.8 15.8 2.05 2.05" stroke="currentColor" strokeWidth={sw} {...round} />
        </svg>
      );

    case "historical":
      return (
        <svg {...common}>
          <path
            d="M12 3.1 20.2 7.7H3.8L12 3.1Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path d="M6.6 10.6v6.7M12 10.6v6.7M17.4 10.6v6.7" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
          <path d="M4.4 20.6h15.2" stroke="currentColor" strokeWidth={sw} {...round} />
        </svg>
      );

    case "collections":
      return (
        <svg {...common}>
          <path
            d="M12 3.4 20 7.6l-8 4.2-8-4.2 8-4.2Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path
            d="m4 12.2 8 4.2 8-4.2M4 16.5l8 4.2 8-4.2"
            stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round}
          />
        </svg>
      );

    case "fellowship":
      return (
        <svg {...common}>
          <circle cx="16.9" cy="8.7" r="2.7" stroke="currentColor" strokeWidth={sw2} opacity={loOp} />
          <path
            d="M15.6 14.4c2.9.35 4.75 2.35 5.1 5.9"
            stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round}
          />
          <circle
            cx="9.1" cy="8" r="3.5"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw}
          />
          <path
            d="M3.4 20.3c.5-4.1 2.7-6.2 5.7-6.2s5.2 2.1 5.7 6.2"
            stroke="currentColor" strokeWidth={sw} {...round}
          />
        </svg>
      );

    case "church":
      return (
        <svg {...common}>
          <path d="M12 2.3v3.4M10.4 4h3.2" stroke="currentColor" strokeWidth={sw} {...round} />
          <path
            d="M5.2 20.6v-8.5L12 7.5l6.8 4.6v8.5Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path
            d="M9.4 20.6v-3.8a2.6 2.6 0 0 1 5.2 0v3.8"
            stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round}
          />
          <path d="M3.6 20.6h16.8" stroke="currentColor" strokeWidth={sw} {...round} />
        </svg>
      );

    case "give":
      return (
        <svg {...common}>
          <path
            d="M12 20.6S4.3 15.8 4.3 10.5A4.5 4.5 0 0 1 12 7.3a4.5 4.5 0 0 1 7.7 3.2c0 5.3-7.7 10.1-7.7 10.1Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path d="M12 10.2v4.2M9.9 12.3h4.2" stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round} />
        </svg>
      );

    case "church-analysis":
      return (
        <svg {...common}>
          <path
            d="M12 2.9 19.2 5.6v5.5c0 4.7-2.9 7.9-7.2 9.9-4.3-2-7.2-5.2-7.2-9.9V5.6L12 2.9Z"
            fill={softFill} fillOpacity={softOp}
            stroke="currentColor" strokeWidth={sw} {...round}
          />
          <path d="m8.9 12 2.2 2.2 4-4.7" stroke="currentColor" strokeWidth={sw} {...round} />
        </svg>
      );

    case "timeline":
      return (
        <svg {...common}>
          <circle cx="7.3" cy="6.1" r="2" stroke="currentColor" strokeWidth={sw} fill={softFill} fillOpacity={softOp} />
          <circle cx="7.3" cy="12" r="2" stroke="currentColor" strokeWidth={sw} fill={softFill} fillOpacity={softOp} />
          <circle cx="7.3" cy="17.9" r="2" stroke="currentColor" strokeWidth={sw} fill={softFill} fillOpacity={softOp} />
          <path d="M7.3 8.3v1.5M7.3 14.2v1.5" stroke="currentColor" strokeWidth={sw2} {...round} />
          <path
            d="M11.3 6.1h7.1M11.3 12h4.7M11.3 17.9h7.1"
            stroke="currentColor" strokeWidth={sw2} opacity={loOp} {...round}
          />
        </svg>
      );

    default:
      return null;
  }
}
