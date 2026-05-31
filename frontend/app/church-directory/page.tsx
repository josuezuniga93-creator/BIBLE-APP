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
  // ── Founders Ministries Directory ────────────────────────────────────────
  // Source: church.founders.org — Reformed & Confessional Baptist churches
  { name: "Grace Baptist Church",                           city: "Cape Coral",    state: "FL", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 26.5629, lng: -81.9495, website: "https://church.founders.org/church/grace-baptist-church/" },
  { name: "Maranatha Baptist Church",                       city: "Cumming",       state: "GA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 34.2073, lng: -84.1401 },
  { name: "Bethel Reformed Baptist Church",                 city: "Terre Haute",   state: "IN", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 39.4667, lng: -87.4139 },
  { name: "Grace Baptist Church",                           city: "Carlisle",      state: "PA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 40.2015, lng: -77.1889 },
  { name: "Christ Fellowship",                              city: "Kansas City",   state: "MO", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 39.0997, lng: -94.5786 },
  { name: "Vail Valley Baptist Church",                     city: "Tucson",        state: "AZ", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 32.2541, lng: -110.9742, website: "https://church.founders.org/church/vail-valley-baptist-church-2/" },
  { name: "Providence Bible Fellowship",                    city: "Xenia",         state: "OH", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 39.6837, lng: -83.9263 },
  { name: "The King's Chapel",                              city: "Mooresville",   state: "NC", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 35.5846, lng: -80.8101 },
  { name: "Christ the Redeemer Reformed Church",            city: "Gilbert",       state: "AZ", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 33.3528, lng: -111.7890 },
  { name: "Crossroads Church of Dunwoody",                  city: "Dunwoody",      state: "GA", confession: "New Hampshire Confession of Faith",       denomination: "Southern Baptist / Doctrines of Grace",         lat: 33.9462, lng: -84.3346, website: "https://church.founders.org/church/crossroads-church-of-dunwoody/" },
  { name: "Grace Reformed Baptist Church",                  city: "Springfield",   state: "IL", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 39.7817, lng: -89.6501 },
  { name: "Texas Avenue Baptist Church",                    city: "College Station", state: "TX", confession: "Baptist Faith and Message 2000",        denomination: "Southern Baptist / Doctrines of Grace",         lat: 30.6280, lng: -96.3344 },
  { name: "Southern Hills Baptist Church",                  city: "Oklahoma City", state: "TX", confession: "Baptist Faith and Message 2000",          denomination: "Southern Baptist / Doctrines of Grace",         lat: 35.3395, lng: -97.5289 },
  { name: "The Church At Pecan Creek",                      city: "Denton",        state: "TX", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 33.2148, lng: -97.1331 },
  { name: "Bread of Life Baptist Church",                   city: "New York",      state: "NY", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 40.7128, lng: -74.0060 },
  { name: "LUMA Bible Church",                              city: "Denver",        state: "CO", confession: "Abstract of Principles",                  denomination: "Independent Reformed",                          lat: 39.7392, lng: -104.9903 },
  { name: "Furnace Creek Baptist Church",                   city: "Forest",        state: "VA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 37.3671, lng: -79.2803 },
  { name: "Pleasant Grove Baptist Church",                  city: "Thomasville",   state: "NC", confession: "New Hampshire Confession of Faith",       denomination: "Southern Baptist / Doctrines of Grace",         lat: 35.8827, lng: -80.0815, website: "https://church.founders.org/church/pleasant-grove-baptist-church/" },
  { name: "Friendship Baptist Church",                      city: "Friendswood",   state: "TX", confession: "Baptist Faith and Message 2000",          denomination: "Southern Baptist / Doctrines of Grace",         lat: 29.5294, lng: -95.2010 },
  { name: "Woodside Baptist Church of Ocala",               city: "Ocala",         state: "FL", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 29.1872, lng: -82.1401 },
  { name: "First Baptist Church of Moravia",                city: "Moravia",       state: "NY", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 42.7145, lng: -76.4219 },
  { name: "Redeemer Community Church",                      city: "Baltimore",     state: "MD", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 39.2904, lng: -76.6122 },
  { name: "Crosspoint Fellowship",                          city: "Tomball",       state: "TX", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 30.0972, lng: -95.6158 },
  { name: "Midtown Baptist Church",                         city: "Memphis",       state: "TN", confession: "Baptist Faith and Message 2000",          denomination: "Southern Baptist / Doctrines of Grace",         lat: 35.1495, lng: -90.0490 },
  { name: "New Georgia Baptist Church",                     city: "Mableton",      state: "GA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 33.8173, lng: -84.5660 },
  { name: "Grace Community Church",                         city: "Madisonville",  state: "TN", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 35.5187, lng: -84.3630 },
  { name: "Central Chapel",                                 city: "Ceredo",        state: "WV", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 38.3870, lng: -82.5577 },
  { name: "Trinity Baptist Church",                         city: "Thomaston",     state: "GA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 32.8874, lng: -84.3266 },
  { name: "Hillside Baptist Church",                        city: "Derry",         state: "NH", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 42.8812, lng: -71.3273 },
  { name: "Waiehu Community Church",                        city: "Wailuku",       state: "HI", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 20.8893, lng: -156.5047 },
  { name: "Providence Church Katy",                         city: "Katy",          state: "TX", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 29.7858, lng: -95.8245 },
  { name: "Dallas Reformed Baptist Church",                 city: "Dallas",        state: "TX", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 32.7767, lng: -96.7970, website: "https://church.founders.org/church/dallas-reformed-baptist-church/" },
  { name: "First Baptist Church of Clewiston",              city: "Clewiston",     state: "FL", confession: "New Hampshire Confession of Faith",       denomination: "Southern Baptist / Doctrines of Grace",         lat: 26.7540, lng: -80.9348 },
  { name: "Christ Community Church",                        city: "Zephyrhills",   state: "FL", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 28.2336, lng: -82.1812 },
  { name: "First Baptist Church of Pharr",                  city: "Pharr",         state: "TX", confession: "Baptist Faith and Message 2000",          denomination: "Southern Baptist / Doctrines of Grace",         lat: 26.1948, lng: -98.1836, website: "https://church.founders.org/church/first-baptist-church-of-pharr/" },
  { name: "Grace Reformed Baptist Church of Augusta",       city: "Augusta",       state: "GA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 33.4735, lng: -82.0105 },
  { name: "Reformation Church Covington",                   city: "Covington",     state: "TN", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 35.5640, lng: -89.6462, website: "https://church.founders.org/church/reformation-church-covington/" },
  { name: "Fellowship Baptist Church",                      city: "Slinger",       state: "WI", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 43.3322, lng: -88.2862 },
  { name: "Bethany Bible Church",                           city: "Mound",         state: "MN", confession: "Abstract of Principles",                  denomination: "Independent Reformed",                          lat: 44.9358, lng: -93.6649, website: "https://church.founders.org/church/bethany-bible-church/" },
  { name: "Dwight Baptist Church",                          city: "Dwight",        state: "AL", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 34.0537, lng: -86.0097 },
  { name: "The Church of New Life",                         city: "Bridgeport",    state: "CT", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 41.1865, lng: -73.1952 },
  { name: "New Song Bible Church",                          city: "Coeur d'Alene", state: "ID", confession: "Abstract of Principles",                  denomination: "Independent Reformed",                          lat: 47.6777, lng: -116.7805 },
  { name: "Reformed Baptist Church Santa Anna",             city: "Santa Anna",    state: "TX", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 31.7418, lng: -99.3218 },
  { name: "First Baptist Church, Mooresville",              city: "Mooresville",   state: "IN", confession: "New Hampshire Confession of Faith",       denomination: "Southern Baptist / Doctrines of Grace",         lat: 39.6128, lng: -86.3716 },
  { name: "Providence Bible Church",                        city: "Missoula",      state: "MT", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 46.8787, lng: -113.9966 },
  { name: "Bent Tree Church",                               city: "Colorado Springs", state: "CO", confession: "2nd London Baptist Confession (1689)", denomination: "Reformed Baptist",                              lat: 38.8339, lng: -104.8214 },
  { name: "Sovereign Grace Baptist Church",                 city: "Antelope",      state: "CA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 38.7157, lng: -121.3685 },
  { name: "Grace Bible Church",                             city: "Medford",       state: "OR", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 42.3265, lng: -122.8756 },
  { name: "North End Church",                               city: "Johnson City",  state: "TN", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 36.3134, lng: -82.3535 },
  { name: "Grace Reformed Baptist Church",                  city: "Muskogee",      state: "OK", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 35.7479, lng: -95.3696, website: "https://church.founders.org/church/grace-reformed-baptist-church-9/" },
  { name: "Bethany Baptist Church",                         city: "Louisville",    state: "KY", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 38.2527, lng: -85.7585 },
  { name: "Second Baptist Church",                          city: "Springfield",   state: "IL", confession: "Baptist Faith and Message 2000",          denomination: "Southern Baptist / Doctrines of Grace",         lat: 39.7817, lng: -89.6501 },
  { name: "King of Grace Church",                           city: "Woburn",        state: "MA", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 42.4793, lng: -71.1523, website: "https://church.founders.org/church/king-of-grace-church/" },
  { name: "Sovereign Grace Bible Church",                   city: "Casper",        state: "WY", confession: "2nd London Baptist Confession (1689)",    denomination: "Reformed Baptist",                              lat: 42.8666, lng: -106.3131 },

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

// ─── Submit church form ───────────────────────────────────────────────────────

interface ChurchApplication {
  churchName: string;
  pastor: string;
  city: string;
  state: string;
  confession: string;
  denomination: string;
  website: string;
  email: string;
  phone: string;
  description: string;
}

function emptyApplication(): ChurchApplication {
  return { churchName: "", pastor: "", city: "", state: "", confession: "", denomination: "", website: "", email: "", phone: "", description: "" };
}

function SubmitChurchForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<ChurchApplication>(emptyApplication());
  const [sent, setSent] = useState(false);

  const set = (k: keyof ChurchApplication) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const body = [
      `Church Name: ${form.churchName}`,
      `Pastor / Contact: ${form.pastor}`,
      `City: ${form.city}, ${form.state}`,
      `Confession: ${form.confession}`,
      `Denomination: ${form.denomination}`,
      `Website: ${form.website || "—"}`,
      `Contact Email: ${form.email}`,
      `Contact Phone: ${form.phone || "—"}`,
      `\nDescription:\n${form.description}`,
    ].join("\n");

    window.open(
      `mailto:josuezuniga93@gmail.com?subject=${encodeURIComponent("Church Directory Application — " + form.churchName)}&body=${encodeURIComponent(body)}`,
      "_self"
    );
    setSent(true);
  };

  const valid = form.churchName.trim() && form.pastor.trim() && form.city.trim() && form.state.trim() && form.confession.trim() && form.email.trim();

  const inputStyle = { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(201,169,97,0.2)" };
  const label = "text-[10px] font-bold uppercase tracking-widest mb-1 block text-[rgba(255,255,255,0.35)]";

  return (
    <div className="fixed inset-0 z-[300] flex flex-col max-w-lg mx-auto" style={{ background: "#0f0f0f" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <p className="text-base font-bold text-white">Submit Your Church</p>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Confessional Reformed churches only</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {sent ? (
          <div className="py-20 text-center space-y-4">
            <div className="text-5xl">✉️</div>
            <p className="text-base font-bold text-white">Application sent!</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Your email app should have opened with the pre-filled message. Please send it to complete your application.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: "#c9a961" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border px-4 py-3 text-xs leading-relaxed" style={{ borderColor: "rgba(201,169,97,0.25)", background: "rgba(201,169,97,0.07)", color: "rgba(255,255,255,0.5)" }}>
              Only churches holding to a formal confession (Westminster, 1689 LBC, Heidelberg, Belgic, etc.) and subscribing to the Doctrines of Grace will be listed. Applications are reviewed before publishing.
            </div>

            <div className="space-y-3">
              {/* Church name */}
              <div>
                <label className={label}>Church Name *</label>
                <input type="text" value={form.churchName} onChange={set("churchName")} placeholder="Grace Reformed Church" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>

              {/* Pastor */}
              <div>
                <label className={label}>Pastor / Contact Name *</label>
                <input type="text" value={form.pastor} onChange={set("pastor")} placeholder="Rev. John Smith" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>City *</label>
                  <input type="text" value={form.city} onChange={set("city")} placeholder="Nashville" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className={label}>State *</label>
                  <input type="text" value={form.state} onChange={set("state")} placeholder="TN" maxLength={2} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
                </div>
              </div>

              {/* Confession */}
              <div>
                <label className={label}>Confession *</label>
                <select value={form.confession} onChange={set("confession")} className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="">Select confession…</option>
                  <option>Westminster Confession of Faith</option>
                  <option>1689 London Baptist Confession</option>
                  <option>Heidelberg Catechism</option>
                  <option>Belgic Confession</option>
                  <option>New Hampshire Confession of Faith</option>
                  <option>Second Helvetic Confession</option>
                  <option>Three Forms of Unity</option>
                  <option>Other (specify in description)</option>
                </select>
              </div>

              {/* Denomination */}
              <div>
                <label className={label}>Denomination / Network *</label>
                <input type="text" value={form.denomination} onChange={set("denomination")} placeholder="e.g. PCA, Reformed Baptist, RPCNA…" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>

              {/* Website */}
              <div>
                <label className={label}>Website</label>
                <input type="url" value={form.website} onChange={set("website")} placeholder="https://yourchurch.org" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>

              {/* Contact email */}
              <div>
                <label className={label}>Contact Email *</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="pastor@yourchurch.org" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>

              {/* Phone */}
              <div>
                <label className={label}>Contact Phone</label>
                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={inputStyle} />
              </div>

              {/* Description */}
              <div>
                <label className={label}>Brief Description</label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Tell us a bit about your congregation — history, preaching style, ministries, etc."
                  rows={4}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!valid}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{ background: "#c9a961" }}
            >
              Send Application
            </button>

            <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
              Tapping "Send Application" opens your email app with a pre-filled message.
            </p>

            <div style={{ height: "max(env(safe-area-inset-bottom), 12px)" }} />
          </>
        )}
      </div>
    </div>
  );
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
  const [showSubmitForm, setShowSubmitForm] = useState(false);

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
      {showSubmitForm && <SubmitChurchForm onClose={() => setShowSubmitForm(false)} />}
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-colors active:scale-[0.98] disabled:opacity-50"
            style={{ borderColor: "rgba(201,169,97,0.35)", background: "rgba(201,169,97,0.08)", color: "#c9a961" }}
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
              className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none"
            />
            <button
              onClick={handleCitySearch}
              disabled={locationLoading}
              className="px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-colors active:scale-95 disabled:opacity-50"
              style={{ background: "#c9a961" }}
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
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all"
                  style={radius === r
                    ? { borderColor: "rgba(201,169,97,0.4)", background: "rgba(201,169,97,0.12)", color: "#c9a961" }
                    : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
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
                className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                style={confessionFilter === key
                  ? { borderColor: "rgba(201,169,97,0.4)", background: "rgba(201,169,97,0.12)", color: "#c9a961" }
                  : { borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}
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
                    className="rounded-2xl border p-4 space-y-3"
                    style={{ borderColor: "rgba(201,169,97,0.2)", background: "rgba(201,169,97,0.04)" }}
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
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: "rgba(201,169,97,0.12)", borderColor: "rgba(201,169,97,0.3)", color: "#c9a961" }}>
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
                          className="text-[10px] font-bold flex-shrink-0 ml-2"
                          style={{ color: "#c9a961" }}
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

        {/* ── Submit Your Church ────────────────────────────────────────────── */}
        <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: "rgba(201,169,97,0.2)", background: "rgba(201,169,97,0.05)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⛪</span>
            <div>
              <p className="text-sm font-bold text-white">Is your church listed?</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Pastors and church planters can apply to be added.</p>
            </div>
          </div>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: "#c9a961" }}
          >
            Submit Your Church
          </button>
        </div>

      </main>
    </div>
  );
}
