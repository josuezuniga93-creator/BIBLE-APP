"use client";
import StudyScreen from "../components/study/StudyScreen";
import {PageHeading} from "../components/study/Views";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
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

  const bg      = isLight ? "#ffffff" : "#08090f";
  const fg      = isLight ? "#0a0a0a" : "#ffffff";
  const fgMuted = isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.50)";
  const fgFaint = isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)";
  const border  = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const cardBg  = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const backBg  = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const sections = [
    {
      title: "What we collect",
      body: "Your email address when you create an account. Reading highlights and notes you choose to save — these sync to your account so you can access them on any device. Your theme preference is stored locally on your device only.",
    },
    {
      title: "What we don't collect",
      body: "No ads. No tracking pixels. No selling of your data to anyone. No behavioral profiles. The only analytics we receive are basic server logs from Vercel (page visits, error rates) — we have no way to tie these to you personally.",
    },
    {
      title: "Google Sign-In",
      body: "We use Google OAuth only to verify your identity and create your account. We do not access your Gmail, Google Drive, contacts, calendar, or any other Google data. Your Google password is never seen or stored by us.",
    },
    {
      title: "Data storage",
      body: "Account data (email, highlights, notes) is stored securely via Supabase with encryption in transit. Data that stays only on your device: Bible tracker reading progress, fellowship gatherings, and local preferences.",
    },
    {
      title: "Deleting your data",
      body: "To delete your account and all associated data, email us at josuezuniga93@gmail.com. We will permanently remove your account and everything linked to it within 7 days.",
    },
    {
      title: "Contact",
      body: "Questions about this policy? Email josuezuniga93@gmail.com — we will respond.",
    },
  ];

  return <StudyScreen screen="privacy"><PageHeading title={<>Quietly<br/>private.</>} kicker="PRIVACY"/><div className="page-pad prose">{sections.map(section=><section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}</div></StudyScreen>;
}
