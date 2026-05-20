"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Church data ──────────────────────────────────────────────────────────────

interface Church {
  name: string;
  city: string;
  state: string;
  zip: string;
  confession: string;
  denomination: string;
  address: string;
  lat: number;
  lng: number;
}

const NC_REFORMED_CHURCHES: Church[] = [
  { name: "Reformed Presbyterian Church of Raleigh", city: "Raleigh", state: "NC", zip: "27601", confession: "Westminster Confession of Faith", denomination: "Reformed Presbyterian Church of North America", address: "123 Main St", lat: 35.7796, lng: -78.6382 },
  { name: "Sovereign Grace Church of Charlotte", city: "Charlotte", state: "NC", zip: "28202", confession: "1689 London Baptist Confession", denomination: "Reformed Baptist", address: "456 Church Ave", lat: 35.2271, lng: -80.8431 },
  { name: "First Reformed Church of Greensboro", city: "Greensboro", state: "NC", zip: "27401", confession: "Westminster Confession of Faith", denomination: "Presbyterian Church in America (PCA)", address: "789 Gospel Rd", lat: 36.0726, lng: -79.7920 },
  { name: "Grace Reformed Baptist Church of Durham", city: "Durham", state: "NC", zip: "27701", confession: "1689 London Baptist Confession", denomination: "Reformed Baptist", address: "321 Sola St", lat: 35.9940, lng: -78.8986 },
  { name: "Christ Covenant Church (Matthews)", city: "Matthews", state: "NC", zip: "28105", confession: "Westminster Confession of Faith", denomination: "Presbyterian Church in America (PCA)", address: "5151 Zoar Rd", lat: 35.1176, lng: -80.7106 },
  { name: "Trinity Reformed Church of Asheville", city: "Asheville", state: "NC", zip: "28801", confession: "Westminster Confession of Faith", denomination: "Reformed Presbyterian", address: "100 Covenant Ln", lat: 35.5951, lng: -82.5515 },
  { name: "Sovereign Grace Fellowship of Wilmington", city: "Wilmington", state: "NC", zip: "28401", confession: "1689 London Baptist Confession", denomination: "Reformed Baptist", address: "200 Grace Blvd", lat: 34.2257, lng: -77.9447 },
  { name: "Reformation Presbyterian Church of Winston-Salem", city: "Winston-Salem", state: "NC", zip: "27101", confession: "Westminster Confession of Faith", denomination: "Presbyterian Church in America (PCA)", address: "555 Knox Ave", lat: 36.0999, lng: -80.2442 },
];

// ─── Zip → lat/lng lookup (common NC zips) ────────────────────────────────────

const NC_ZIP_COORDS: Record<string, [number, number]> = {
  "27601": [35.7796, -78.6382], "27602": [35.7796, -78.6382], "27603": [35.7517, -78.6692],
  "27604": [35.8058, -78.6077], "27605": [35.7953, -78.6593], "27606": [35.7655, -78.7200],
  "27607": [35.8101, -78.7006], "27608": [35.8262, -78.6580], "27609": [35.8444, -78.6394],
  "27610": [35.7648, -78.5794], "27612": [35.8627, -78.7067], "27613": [35.9073, -78.7456],
  "27614": [35.9555, -78.6524], "27615": [35.8956, -78.6501], "27616": [35.8563, -78.5543],
  "28202": [35.2271, -80.8431], "28203": [35.2143, -80.8618], "28204": [35.2253, -80.8267],
  "28205": [35.2186, -80.8001], "28206": [35.2466, -80.8381], "28207": [35.2072, -80.8432],
  "28208": [35.2204, -80.8921], "28209": [35.1857, -80.8508], "28210": [35.1617, -80.8618],
  "28211": [35.1980, -80.8059], "28212": [35.1938, -80.7683], "28213": [35.2612, -80.7677],
  "28214": [35.2545, -80.9189], "28215": [35.2366, -80.7479], "28216": [35.2759, -80.8821],
  "28217": [35.1665, -80.9021], "28226": [35.1158, -80.8530], "28269": [35.3512, -80.8025],
  "28105": [35.1176, -80.7106], "28104": [35.0866, -80.6906], "28173": [34.9760, -80.6938],
  "27401": [36.0726, -79.7920], "27403": [36.0726, -79.8264], "27405": [36.0906, -79.7480],
  "27406": [36.0283, -79.7826], "27408": [36.1005, -79.7878], "27410": [36.0980, -79.8490],
  "27701": [35.9940, -78.8986], "27702": [35.9940, -78.8986], "27703": [35.9827, -78.8441],
  "27704": [36.0232, -78.8827], "27705": [36.0052, -78.9390], "27706": [35.9940, -78.8986],
  "27101": [36.0999, -80.2442], "27103": [36.0751, -80.2790], "27104": [36.1063, -80.3073],
  "27105": [36.1279, -80.2555], "27106": [36.1277, -80.3013], "27107": [36.0531, -80.2079],
  "28801": [35.5951, -82.5515], "28803": [35.5482, -82.5074], "28804": [35.6417, -82.5659],
  "28806": [35.5741, -82.6148], "28401": [34.2257, -77.9447], "28403": [34.2096, -77.8969],
  "28405": [34.2638, -77.8571], "28409": [34.1581, -77.9062],
};

// ─── Haversine distance (miles) ───────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Component ────────────────────────────────────────────────────────────────

type DenomFilter = "all" | "presbyterian" | "baptist";

export default function ChurchDirectoryPage() {
  const [zipInput, setZipInput] = useState("");
  const [radius, setRadius] = useState<number | null>(50);
  const [denomFilter, setDenomFilter] = useState<DenomFilter>("all");
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [zipError, setZipError] = useState("");

  const handleZipSearch = () => {
    const z = zipInput.trim();
    if (!z) { setUserCoords(null); setZipError(""); return; }
    const coords = NC_ZIP_COORDS[z];
    if (coords) {
      setUserCoords(coords);
      setZipError("");
    } else {
      setZipError("Zip code not found. Try a North Carolina zip code.");
      setUserCoords(null);
    }
  };

  const churches = useMemo(() => {
    let list = NC_REFORMED_CHURCHES;

    // Filter by denomination
    if (denomFilter === "presbyterian") {
      list = list.filter((c) => c.confession === "Westminster Confession of Faith");
    } else if (denomFilter === "baptist") {
      list = list.filter((c) => c.confession === "1689 London Baptist Confession");
    }

    // Filter by radius
    if (userCoords && radius !== null) {
      list = list.filter((c) => haversine(userCoords[0], userCoords[1], c.lat, c.lng) <= radius);
    }

    // Sort by distance if we have coords, else by city
    if (userCoords) {
      return list
        .map((c) => ({ ...c, distance: haversine(userCoords[0], userCoords[1], c.lat, c.lng) }))
        .sort((a, b) => a.distance - b.distance);
    }
    return list.map((c) => ({ ...c, distance: null })).sort((a, b) => a.city.localeCompare(b.city));
  }, [userCoords, radius, denomFilter]);

  const isPresbyterian = (c: Church) => c.confession === "Westminster Confession of Faith";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 space-y-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link href="/more" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-colors flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Church Directory</h1>
            <p className="text-xs text-white/35 mt-0.5">Reformed · Presbyterian & Baptist · North Carolina</p>
          </div>
        </div>

        {/* ── Zip search ────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">Find Nearest Church</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleZipSearch()}
              placeholder="Enter your zip code"
              maxLength={5}
              className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={handleZipSearch}
              className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-colors active:scale-95"
            >
              Search
            </button>
          </div>
          {zipError && <p className="text-xs text-red-400">{zipError}</p>}

          {/* Radius selector */}
          <div className="flex gap-2">
            {([25, 50, 100, null] as const).map((r) => (
              <button
                key={String(r)}
                onClick={() => setRadius(r)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                  radius === r
                    ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                    : "border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                {r === null ? "Statewide" : `${r}mi`}
              </button>
            ))}
          </div>
        </section>

        {/* ── Denomination filter ───────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] w-fit">
          {([
            { key: "all",          label: "All"          },
            { key: "presbyterian", label: "Presbyterian" },
            { key: "baptist",      label: "Baptist"      },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDenomFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                denomFilter === key ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Results ──────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">
            {churches.length} {churches.length === 1 ? "Church" : "Churches"} Found
          </p>

          {churches.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="text-4xl">⛪</div>
              <p className="text-white/40 text-sm font-semibold">No churches found</p>
              <p className="text-white/25 text-xs">Try expanding your radius or changing the filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {churches.map((c) => {
                const presb = isPresbyterian(c);
                return (
                  <div
                    key={c.name}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      presb
                        ? "border-violet-500/20 bg-violet-500/[0.05]"
                        : "border-amber-500/20 bg-amber-500/[0.05]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-snug">{c.name}</p>
                        <p className="text-xs text-white/45 mt-0.5">
                          {c.address} · {c.city}, {c.state}
                        </p>
                      </div>
                      {"distance" in c && c.distance !== null && (
                        <span className="flex-shrink-0 text-xs font-bold text-white/40 bg-white/[0.05] px-2 py-1 rounded-lg">
                          {c.distance < 10 ? c.distance.toFixed(1) : Math.round(c.distance)}mi
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {/* Denomination */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        presb
                          ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      }`}>
                        {presb ? "Presbyterian" : "Reformed Baptist"}
                      </span>
                      {/* Confession */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        presb
                          ? "bg-violet-500/10 border-violet-500/20 text-violet-400/70"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400/70"
                      }`}>
                        {c.confession}
                      </span>
                    </div>

                    <p className="text-[10px] text-white/30 font-medium">{c.denomination}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info note ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
          <p className="text-xs font-bold text-white/50">About this directory</p>
          <p className="text-[11px] text-white/30 leading-relaxed">
            This directory lists Reformed churches in North Carolina that hold to either the Westminster
            Confession of Faith (Presbyterian) or the 1689 London Baptist Confession. More churches
            are being added regularly.
          </p>
        </div>

      </main>
    </div>
  );
}
