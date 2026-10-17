"use client";
import {Action} from "../components/study/Views";

import FeatureFrame from "../components/study/FeatureFrame";
export default function GivePage() { return <FeatureFrame title="Give" screen="give"><GiveContent/></FeatureFrame>; }

import { useState, useEffect } from "react";
import { useLanguage } from "../lib/useLanguage";

function GiftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2"/>
      <path d="M21 8H3V6a2 2 0 012-2h14a2 2 0 012 2v2z"/>
      <path d="M12 8v13"/>
      <path d="M12 6c0 0-2-3-4-2s-1 3 0 3"/>
      <path d="M12 6c0 0 2-3 4-2s1 3 0 3"/>
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l5-5h4l2-2h3l5 5"/>
      <path d="M7 7l-5 5 5 5 2-2"/>
      <path d="M17 7l5 5-5 5-2-2"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}

function GiveContent() {
 const [amount,setAmount]=useState(""),[givingStatus,setGivingStatus]=useState("");
  const { t } = useLanguage();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsLight(theme === "white-noir");
    const obs = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "white-noir");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const bg        = isLight ? "#ffffff" : "#0f0f0f";
  const fg        = isLight ? "#0a0a0a" : "#ffffff";
  const fgMuted   = isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.50)";
  const fgFaint   = isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.25)";
  const cardBg    = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const cardBdr   = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const amberBg   = isLight ? "rgba(180,120,0,0.08)" : "rgba(245,158,11,0.12)";
  const amberBdr  = isLight ? "rgba(180,120,0,0.15)" : "rgba(245,158,11,0.18)";
  const amberFg   = isLight ? "rgba(120,80,0,0.70)" : "rgba(245,158,11,0.80)";
  const btnBdr    = isLight ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.10)";
  const btnBg     = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";

  const helpItems = [
    { Icon: MonitorIcon, text: t("give_help_servers") },
    { Icon: SparkleIcon, text: t("give_help_features") },
    { Icon: GlobeIcon,   text: t("give_help_global") },
  ];

  return (<><p className="body-copy">Support the ministry</p><div className="amount-options">{['$10','$25','$50','$100'].map(value=><button key={value} aria-pressed={amount===value} onClick={()=>setAmount(value)}>{value}</button>)}</div><Action onClick={()=>setGivingStatus('Online giving is not available yet.')}>Continue</Action>{givingStatus&&<p role="status" className="body-copy">{givingStatus}</p>}</>);
}
