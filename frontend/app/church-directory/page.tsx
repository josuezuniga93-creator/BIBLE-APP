"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/useLanguage";
import { t } from "../lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Church {
  name: string;
  city: string;
  state: string;
  confession: string;
  denomination: string;
  website?: string;
  lat: number;
  lng: number;
}

// ─── Confession filter options ────────────────────────────────────────────────

const CONFESSION_FILTERS = [
  { key: "all",              label: "All"          },
  { key: "westminster",      label: "Westminster"  },
  { key: "1689",             label: "1689 Baptist" },
  { key: "pca",              label: "PCA"          },
  { key: "new-hampshire",    label: "New Hampshire" },
  { key: "reformed",         label: "Reformed"     },
] as const;
type ConfessionFilter = typeof CONFESSION_FILTERS[number]["key"];

// ─── Church data ──────────────────────────────────────────────────────────────

const ALL_CHURCHES: Church[] = [
  // ── North Carolina ────────────────────────────────────────────────────────
  { name: "Reformed Presbyterian Church of Raleigh",       city: "Raleigh",       state: "NC", confession: "Westminster Confession of Faith",         denomination: "Reformed Presbyterian Church of North America", lat: 35.7796, lng: -78.6382 },
  { name: "Sovereign Grace Church of Charlotte",            city: "Charlotte",     state: "NC", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 35.2271, lng: -80.8431 },
  { name: "First Reformed Church of Greensboro",            city: "Greensboro",    state: "NC", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 36.0726, lng: -79.7920 },
  { name: "Grace Reformed Baptist Church of Durham",        city: "Durham",        state: "NC", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 35.9940, lng: -78.8986 },
  { name: "Christ Covenant Church",                         city: "Matthews",      state: "NC", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 35.1176, lng: -80.7106, website: "https://christcovenant.org" },
  { name: "Trinity Reformed Church of Asheville",           city: "Asheville",     state: "NC", confession: "Westminster Confession of Faith",         denomination: "Reformed Presbyterian",                         lat: 35.5951, lng: -82.5515 },
  { name: "Sovereign Grace Fellowship of Wilmington",       city: "Wilmington",    state: "NC", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 34.2257, lng: -77.9447 },
  { name: "Reformation Presbyterian Church of Winston-Salem", city: "Winston-Salem", state: "NC", confession: "Westminster Confession of Faith",      denomination: "Presbyterian Church in America (PCA)",          lat: 36.0999, lng: -80.2442 },
  // ── Texas ─────────────────────────────────────────────────────────────────
  { name: "Grace Covenant Church",                          city: "Austin",        state: "TX", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 30.2672, lng: -97.7431, website: "https://gracecovenantaustin.org" },
  { name: "First Baptist Church of Dallas",                 city: "Dallas",        state: "TX", confession: "New Hampshire Confession of Faith",       denomination: "Southern Baptist / Doctrines of Grace",         lat: 32.7767, lng: -96.7970, website: "https://firstdallas.org" },
  { name: "Redeemer Presbyterian Church",                   city: "Austin",        state: "TX", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 30.2500, lng: -97.7500 },
  { name: "Covenant Reformed Baptist Church",               city: "Houston",       state: "TX", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 29.7604, lng: -95.3698 },
  { name: "Grace Community Church of San Antonio",          city: "San Antonio",   state: "TX", confession: "Westminster Confession of Faith",         denomination: "Reformed Presbyterian",                         lat: 29.4241, lng: -98.4936 },
  // ── California ────────────────────────────────────────────────────────────
  { name: "Grace Community Church",                         city: "Sun Valley",    state: "CA", confession: "Westminster Confession of Faith",         denomination: "Independent Reformed / Doctrines of Grace",     lat: 34.2105, lng: -118.3897, website: "https://gracechurch.org" },
  { name: "Redeemer Presbyterian Church",                   city: "Los Angeles",   state: "CA", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 34.0522, lng: -118.2437 },
  { name: "Sovereign Grace Church of San Diego",            city: "San Diego",     state: "CA", confession: "Westminster Confession of Faith",         denomination: "Sovereign Grace Churches",                      lat: 32.7157, lng: -117.1611 },
  // ── Tennessee ─────────────────────────────────────────────────────────────
  { name: "Cornerstone Presbyterian Church",                city: "Chattanooga",   state: "TN", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 35.0456, lng: -85.3097 },
  { name: "Grace Baptist Church of Nashville",              city: "Nashville",     state: "TN", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 36.1627, lng: -86.7816 },
  // ── Georgia ───────────────────────────────────────────────────────────────
  { name: "Midway Presbyterian Church",                     city: "Powder Springs", state: "GA", confession: "Westminster Confession of Faith",       denomination: "Presbyterian Church in America (PCA)",          lat: 33.8601, lng: -84.6832, website: "https://midwaypca.org" },
  { name: "Heritage Reformed Baptist Church",               city: "Atlanta",       state: "GA", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 33.7490, lng: -84.3880 },
  // ── Florida ───────────────────────────────────────────────────────────────
  { name: "Proclamation Presbyterian Church",               city: "Bryn Mawr",     state: "FL", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 27.9944, lng: -82.7284 },
  { name: "Reformed Baptist Church of Greater Orlando",     city: "Orlando",       state: "FL", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 28.5383, lng: -81.3792 },
  // ── Virginia ──────────────────────────────────────────────────────────────
  { name: "McLean Presbyterian Church",                     city: "McLean",        state: "VA", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 38.9345, lng: -77.1814, website: "https://mcleanpc.org" },
  { name: "Covenant Fellowship Church",                     city: "Richmond",      state: "VA", confession: "Westminster Confession of Faith",         denomination: "Reformed Presbyterian",                         lat: 37.5407, lng: -77.4360 },
  // ── Pennsylvania ──────────────────────────────────────────────────────────
  { name: "Tenth Presbyterian Church",                      city: "Philadelphia",  state: "PA", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 39.9526, lng: -75.1652, website: "https://tenth.org" },
  { name: "Reformed Baptist Church of Greater Philadelphia", city: "Philadelphia", state: "PA", confession: "1689 London Baptist Confession",          denomination: "Reformed Baptist",                              lat: 39.9500, lng: -75.1700 },
  // ── New York ──────────────────────────────────────────────────────────────
  { name: "Redeemer Presbyterian Church",                   city: "New York",      state: "NY", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 40.7128, lng: -74.0060, website: "https://redeemer.com" },
  // ── Illinois ──────────────────────────────────────────────────────────────
  { name: "Covenant Reformed Baptist Church",               city: "Chicago",       state: "IL", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 41.8781, lng: -87.6298 },
  { name: "Christ Church of Chicago",                       city: "Chicago",       state: "IL", confession: "Westminster Confession of Faith",         denomination: "Presbyterian Church in America (PCA)",          lat: 41.8800, lng: -87.6300 },
  // ── Michigan ──────────────────────────────────────────────────────────────
  { name: "Pilgrim Reformed Baptist Church",                city: "Grand Rapids",  state: "MI", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 42.9634, lng: -85.6681 },
  { name: "Grace Reformed Church",                          city: "Grandville",    state: "MI", confession: "Westminster Confession of Faith",         denomination: "United Reformed Churches in North America",     lat: 42.9081, lng: -85.7599 },
  // ── Washington ────────────────────────────────────────────────────────────
  { name: "Christ Church Seattle",                          city: "Seattle",       state: "WA", confession: "Westminster Confession of Faith",         denomination: "Reformed / Doctrines of Grace",                 lat: 47.6062, lng: -122.3321 },
  { name: "Reformed Baptist Church of Spokane",             city: "Spokane",       state: "WA", confession: "1689 London Baptist Confession",           denomination: "Reformed Baptist",                              lat: 47.6588, lng: -117.4260 },
];

// ─── Haversine distance (miles) ───────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesFilter(c: Church, f: ConfessionFilter): boolean {
  if (f === "all") return true;
  const conf = c.confession.toLowerCase();
  const denom = c.denomination.toLowerCase();
  if (f === "westminster") return conf.includes("westminster");
  if (f === "1689") return conf.includes("1689");
  if (f === "pca") return denom.includes("pca") || denom.includes("presbyterian church in america");
  if (f === "new-hampshire") return conf.includes("new hampshire");
  if (f === "reformed") return denom.includes("reformed") || denom.includes("doctrines of grace") || denom.includes("sovereign grace");
  return true;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChurchDirectoryPage() {
  const { lang } = useLanguage();
  const [cityInput, setCityInput] = useState("");
  const [radius, setRadius] = useState<number>(50);
  const [confessionFilter, setConfessionFilter] = useState<ConfessionFilter>("all");
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setCityInput("");
        setLocationLoading(false);
      },
      () => {
        setLocationError("Could not get your location. Please allow location access and try again.");
        setLocationLoading(false);
      }
    );
  };

  const handleCitySearch = async () => {
    const q = cityInput.trim();
    if (!q) { setUserCoords(null); setLocationError(""); return; }
    setLocationLoading(true);
    setLocationError("");
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", USA")}&limit=1`
      );
      const data = await resp.json();
      if (data && data[0]) {
        setUserCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setLocationError("City not found. Try a different city name.");
      }
    } catch {
      setLocationError("Could not search location. Check your connection.");
    }
    setLocationLoading(false);
  };

  const churches = useMemo(() => {
    let list = ALL_CHURCHES.filter((c) => matchesFilter(c, confessionFilter));
    if (userCoords) {
      const withDist = list
        .map((c) => ({ ...c, distance: haversine(userCoords[0], userCoords[1], c.lat, c.lng) }))
        .filter((c) => c.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
      return withDist;
    }
    return list.map((c) => ({ ...c, distance: null })).sort((a, b) => a.city.localeCompare(b.city));
  }, [userCoords, radius, confessionFilter]);

  const isBaptist = (c: Church) => c.confession.includes("1689");

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24 space-y-5">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link href="/more" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-colors flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{t(lang, "church_heading")}</h1>
            <p className="text-xs text-white/35 mt-0.5">{t(lang, "church_sub")}</p>
          </div>
        </div>

        {/* ── Location search ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">{t(lang, "church_your_location")}</p>

          {/* GPS button */}
          <button
            onClick={handleUseMyLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-bold hover:bg-violet-500/20 transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {locationLoading ? t(lang, "church_getting_location") : t(lang, "church_use_location")}
          </button>

          <div className="flex items-center gap-2 text-white/20 text-xs">
            <div className="flex-1 h-px bg-white/10" />
            <span>{t(lang, "church_or_city")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* City search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
              placeholder={t(lang, "church_city_placeholder")}
              className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={handleCitySearch}
              disabled={locationLoading}
              className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-500 transition-colors active:scale-95 disabled:opacity-50"
            >
              {t(lang, "church_search")}
            </button>
          </div>

          {locationError && <p className="text-xs text-red-400">{locationError}</p>}
          {userCoords && !locationError && (
            <p className="text-xs text-emerald-400/70">📍 {t(lang, "church_location_set")} {radius} {t(lang, "church_miles")}</p>
          )}

          {/* Radius selector — only show when we have coords */}
          {userCoords && (
            <div className="flex gap-2">
              {([25, 50, 100, 250] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                    radius === r
                      ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 text-white/40 hover:text-white/60"
                  }`}
                >
                  {r}mi
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Confession filter ──────────────────────────────────────────────── */}
        <section className="space-y-2">
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase">{t(lang, "church_filter")}</p>
          <div className="flex flex-wrap gap-1.5">
            {CONFESSION_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setConfessionFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  confessionFilter === key
                    ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                    : "border-white/10 text-white/30 hover:text-white/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black tracking-widest text-white/30 uppercase mb-3">
            {churches.length} {churches.length === 1 ? t(lang, "church_found") : t(lang, "church_found_pl")} Found
            {!userCoords && ` — ${t(lang, "church_found_nationwide")}`}
          </p>

          {churches.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="text-4xl">⛪</div>
              <p className="text-white/40 text-sm font-semibold">{t(lang, "church_none")}</p>
              <p className="text-white/25 text-xs">{t(lang, "church_none_sub")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {churches.map((c) => {
                const presb = !isBaptist(c);
                return (
                  <div
                    key={c.name + c.city}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      presb
                        ? "border-violet-500/20 bg-violet-500/[0.05]"
                        : "border-amber-500/20 bg-amber-500/[0.05]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-snug">{c.name}</p>
                        <p className="text-xs text-white/45 mt-0.5">{c.city}, {c.state}</p>
                      </div>
                      {"distance" in c && c.distance !== null && (
                        <span className="flex-shrink-0 text-xs font-bold text-white/40 bg-white/[0.05] px-2 py-1 rounded-lg">
                          {(c.distance as number) < 10 ? (c.distance as number).toFixed(1) : Math.round(c.distance as number)}mi
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        presb
                          ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                          : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                      }`}>
                        {presb ? t(lang, "church_presbyterian") : t(lang, "church_reformed_baptist")}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 text-white/40">
                        {c.confession}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-white/30 font-medium flex-1 min-w-0">{c.denomination}</p>
                      {c.website && (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex-shrink-0 ml-2"
                        >
                          {t(lang, "church_website")}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Info ──────────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
          <p className="text-xs font-bold text-white/50">{t(lang, "church_about")}</p>
          <p className="text-[11px] text-white/30 leading-relaxed">
            Lists confessional Reformed churches holding to the Westminster Confession, 1689 London Baptist Confession, New Hampshire Confession, or the Doctrines of Grace. More churches are added regularly.
          </p>
        </div>

      </main>
    </div>
  );
}
