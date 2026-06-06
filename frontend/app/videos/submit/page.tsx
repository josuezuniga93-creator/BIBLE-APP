"use client";

/**
 * Tulip Bible App — Video Submission Page
 * Phase 3: Submission form + video upload (Cloudinary) + email notification (EmailJS)
 * Phase 4: Dynamic Needed Topics System
 *
 * Setup required:
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    — your Cloudinary cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET — unsigned preset (e.g. "tulip_videos")
 *   NEXT_PUBLIC_EMAILJS_SERVICE_ID       — EmailJS service ID
 *   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID      — EmailJS template ID
 *   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY       — EmailJS public key
 */

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "../../lib/useLanguage";

// ─── Cloudinary unsigned video upload ─────────────────────────────────────────

async function uploadToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary env vars not set.");

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "video");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url);
      } else {
        reject(new Error("Cloudinary upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Upload error."));
    xhr.send(formData);
  });
}

// ─── EmailJS REST send (no npm needed) ────────────────────────────────────────

async function sendEmailJS(params: Record<string, string>) {
  const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) throw new Error("EmailJS env vars not set.");

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:      serviceId,
      template_id:     templateId,
      user_id:         publicKey,
      accessToken:     publicKey,
      template_params: params,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${body}`);
  }
}

// ─── Design constants ─────────────────────────────────────────────────────────

const AC        = "#c9a961";
const AC_BG     = "rgba(201,169,97,0.12)";
const AC_BORDER = "rgba(201,169,97,0.35)";
const BG_ROOT   = "#08090f";
const BG_CARD   = "rgba(255,255,255,0.035)";
const BD_CARD   = "rgba(255,255,255,0.09)";

// ─── Needed Topics (Phase 4) — future: fetched from Supabase dynamically ──────

interface NeededTopic {
  id: string;
  title: string;
  category: string;
  priority: "core" | "recommended" | "additional";
  currentCount: number;
}

const NEEDED_TOPICS: NeededTopic[] = [
  // Core
  { id: "what-is-gospel",   title: "What Is the Gospel?",    category: "The Gospel",    priority: "core",          currentCount: 0 },
  { id: "who-is-jesus",     title: "Who Is Jesus?",           category: "Jesus Christ",  priority: "core",          currentCount: 0 },
  { id: "what-is-repentance",title: "What Is Repentance?",   category: "The Gospel",    priority: "core",          currentCount: 0 },
  { id: "what-is-faith",    title: "What Is Faith?",          category: "The Gospel",    priority: "core",          currentCount: 0 },
  { id: "sinless-life",     title: "Sinless Life of Christ",  category: "Jesus Christ",  priority: "core",          currentCount: 0 },
  { id: "ascension",        title: "Ascension of Christ",     category: "Jesus Christ",  priority: "core",          currentCount: 0 },
  { id: "sanctification",   title: "What Is Sanctification?", category: "The Gospel",    priority: "core",          currentCount: 0 },
  // Recommended
  { id: "baptism",          title: "What Is Baptism?",        category: "The Church",    priority: "recommended",   currentCount: 0 },
  { id: "lords-supper",     title: "The Lord's Supper",       category: "The Church",    priority: "recommended",   currentCount: 0 },
  { id: "membership",       title: "Church Membership",       category: "The Church",    priority: "recommended",   currentCount: 0 },
  { id: "who-is-god",       title: "Who Is God?",             category: "God",           priority: "recommended",   currentCount: 2 },
  // Additional
  { id: "assurance",        title: "Assurance of Salvation",  category: "Salvation",     priority: "additional",    currentCount: 1 },
  { id: "fruit-of-spirit",  title: "Fruit of the Spirit",     category: "The Holy Spirit",priority: "additional",   currentCount: 3 },
  { id: "adoption",         title: "Adoption",                category: "The Gospel",    priority: "additional",    currentCount: 0 },
];

const VIDEO_CATEGORIES = [
  "God",
  "Jesus Christ",
  "The Gospel",
  "Scripture",
  "Salvation",
  "The Holy Spirit",
  "The Church",
  "Short Teaching (under 6 min)",
  "Community Teaching",
  "Other",
];

const VIDEO_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish / Español" },
];

const CONFESSIONS = [
  "Westminster Confession of Faith",
  "Heidelberg Catechism",
  "Belgic Confession",
  "Canons of Dort",
  "London Baptist Confession 1689",
  "Savoy Declaration",
  "39 Articles",
  "No formal confession",
  "Other",
];

// ─── Field components ─────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
      {children}
    </label>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      className="w-full px-3 py-2.5 rounded-xl text-[14px] text-white outline-none transition-colors"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function TextArea({
  placeholder,
  value,
  onChange,
  rows = 3,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      className="w-full px-3 py-2.5 rounded-xl text-[14px] text-white outline-none resize-none transition-colors"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
      placeholder={placeholder}
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      className="w-full px-3 py-2.5 rounded-xl text-[14px] text-white outline-none"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="" style={{ background: "#0f0f18" }}>{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#0f0f18" }}>{o}</option>
      ))}
    </select>
  );
}

function AgreementRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
      style={{ background: checked ? "rgba(201,169,97,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${checked ? AC_BORDER : "rgba(255,255,255,0.08)"}` }}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
        style={{ background: checked ? AC : "rgba(255,255,255,0.08)", border: checked ? "none" : "1px solid rgba(255,255,255,0.20)" }}
      >
        {checked && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#08090f" strokeWidth="3" strokeLinecap="round">
            <path d="m5 13 4 4L19 7"/>
          </svg>
        )}
      </div>
      <p className="text-[13px] text-white/70 leading-relaxed flex-1">{children}</p>
    </button>
  );
}

// ─── Phase 4: Needed Topics View ──────────────────────────────────────────────

function NeededTopicsView({
  onSubmitForTopic,
  onSubmitCustom,
  onBack,
}: {
  onSubmitForTopic: (topic: NeededTopic) => void;
  onSubmitCustom: () => void;
  onBack: () => void;
}) {
  const core        = NEEDED_TOPICS.filter((t) => t.priority === "core");
  const recommended = NEEDED_TOPICS.filter((t) => t.priority === "recommended");
  const additional  = NEEDED_TOPICS.filter((t) => t.priority === "additional");

  const PRIORITY_COLORS: Record<string, string> = {
    core: "#ef4444",
    recommended: "#f59e0b",
    additional: "#3b82f6",
  };

  function TopicGroup({ label, topics, color }: { label: string; topics: NeededTopic[]; color: string }) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <p className="text-[11px] font-black tracking-widest uppercase" style={{ color }}>{label}</p>
        </div>
        <div className="flex flex-col gap-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => onSubmitForTopic(t)}
              className="flex items-center justify-between p-3.5 rounded-xl text-left transition-all active:scale-[0.98]"
              style={{ background: `${color}0d`, border: `1px solid ${color}22` }}
            >
              <div>
                <p className="text-[13px] font-bold text-white">{t.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                  {t.category} · {t.currentCount === 0 ? "No videos yet" : `${t.currentCount} video${t.currentCount > 1 ? "s" : ""}`}
                </p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: BG_ROOT }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: BG_ROOT, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors py-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-[13px] font-semibold">Back</span>
        </button>
        <div className="mt-3">
          <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: AC }}>
            Help Build the Library
          </p>
          <h1 className="text-[20px] font-bold text-white">Topics That Need Videos</h1>
          <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            These topics in our Fundamentals of the Faith library currently need videos.
          </p>
        </div>
      </div>

      <div className="px-4 pt-5">
        <TopicGroup label="Core Topics Needed"        topics={core}        color={PRIORITY_COLORS.core}        />
        <TopicGroup label="Recommended Topics"        topics={recommended} color={PRIORITY_COLORS.recommended} />
        <TopicGroup label="Additional Topics"         topics={additional}  color={PRIORITY_COLORS.additional}  />

        {/* Custom option */}
        <div className="mt-2 rounded-2xl p-4" style={{ background: AC_BG, border: `1px solid ${AC_BORDER}` }}>
          <p className="text-[13px] font-bold text-white mb-1">Have a different teaching?</p>
          <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.50)" }}>
            Submit a custom video not listed above and our team will determine the best placement.
          </p>
          <button
            onClick={onSubmitCustom}
            className="w-full py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: AC, color: "#08090f" }}
          >
            Submit Custom Video
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Submission Page ──────────────────────────────────────────────────────

type SubmitView = "entry" | "topics" | "form" | "success";

export default function VideoSubmitPage() {
  const { lang } = useLanguage();

  const [view, setView]               = useState<SubmitView>("entry");
  const [selectedTopic, setSelectedTopic] = useState<NeededTopic | null>(null);

  // Form state
  const [fullName,     setFullName]     = useState("");
  const [email,        setEmail]        = useState("");
  const [churchName,   setChurchName]   = useState("");
  const [videoTitle,   setVideoTitle]   = useState("");
  const [videoDesc,    setVideoDesc]    = useState("");
  const [scriptureRef, setScriptureRef] = useState("");
  const [category,     setCategory]     = useState("");
  const [videoLanguage, setVideoLanguage] = useState<"en" | "es">(lang === "es" ? "es" : "en");
  const [churchWeb,    setChurchWeb]    = useState("");
  const [confession,   setConfession]   = useState("");
  const [creatorBio,   setCreatorBio]   = useState("");
  const [ministryWeb,  setMinistryWeb]  = useState("");
  const [socialYT,     setSocialYT]     = useState("");
  const [socialIG,     setSocialIG]     = useState("");

  const [agreedChurch,      setAgreedChurch]      = useState(false);
  const [agreedFaith,       setAgreedFaith]       = useState(false);
  const [agreedPermission,  setAgreedPermission]  = useState(false);

  // ── Video ──────────────────────────────────────────────────────────────────
  const [videoMode,     setVideoMode]     = useState<"file" | "link">("file");
  const [videoFile,     setVideoFile]     = useState<File | null>(null);
  const [videoLink,     setVideoLink]     = useState("");
  const [uploadPct,     setUploadPct]     = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState<string[]>([]);

  useEffect(() => {
    setVideoLanguage(lang === "es" ? "es" : "en");
  }, [lang]);

  const allAgreed = agreedChurch && agreedFaith && agreedPermission;

  const hasVideo = videoMode === "file" ? !!videoFile : videoLink.trim().length > 0;

  function validateForm(): string[] {
    const errs: string[] = [];
    if (!fullName.trim())   errs.push("Full name is required.");
    if (!email.trim())      errs.push("Email address is required.");
    if (!churchName.trim()) errs.push("Church name is required.");
    if (!videoTitle.trim()) errs.push("Video title is required.");
    if (!videoDesc.trim())  errs.push("Video description is required.");
    if (!category)          errs.push("Please select a video category.");
    if (!videoLanguage)     errs.push("Please select the video language.");
    if (!hasVideo)          errs.push("Please attach your video file or provide a Drive / Dropbox link.");
    if (videoMode === "link" && videoLink.toLowerCase().includes("youtube.com"))
      errs.push("Please share a Google Drive or Dropbox link, not a YouTube link.");
    if (!agreedChurch)      errs.push("Please confirm your local church membership.");
    if (!agreedFaith)       errs.push("Please affirm the Statement of Faith agreement.");
    if (!agreedPermission)  errs.push("Please agree to the Content Permission Agreement.");
    return errs;
  }

  async function handleSubmit() {
    const errs = validateForm();
    if (errs.length > 0) { setErrors(errs); window.scrollTo({ top: 9999, behavior: "smooth" }); return; }
    setErrors([]);
    setSubmitting(true);

    try {
      let videoUrl = videoLink.trim();

      // Upload file to Cloudinary if file mode
      if (videoMode === "file" && videoFile) {
        videoUrl = await uploadToCloudinary(videoFile, setUploadPct);
      }

      // Send email notification via EmailJS
      await sendEmailJS({
        from_name:       fullName,
        from_email:      email,
        church_name:     churchName,
        video_title:     videoTitle,
        video_description: videoDesc,
        video_url:       videoUrl,
        video_source:    videoMode === "file" ? "Uploaded file (Cloudinary)" : "Drive / Dropbox link",
        video_language:  videoLanguage === "es" ? "Spanish" : "English",
        category,
        scripture_refs:  scriptureRef || "—",
        confession:      confession   || "—",
        creator_bio:     creatorBio   || "—",
        church_website:  churchWeb    || "—",
        ministry_website: ministryWeb || "—",
        youtube_channel: socialYT     || "—",
        instagram:       socialIG     || "—",
      });

      setView("success");
    } catch (err) {
      setErrors([(err as Error).message ?? "Something went wrong. Please try again."]);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Entry screen ─────────────────────────────────────────────────────────────

  if (view === "entry") {
    return (
      <div className="min-h-screen pb-24" style={{ background: BG_ROOT }}>
        <div className="px-4 pt-5">
          <Link
            href="/videos"
            className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors py-1 mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span className="text-[13px] font-semibold">Back to Videos</span>
          </Link>

          {/* Hero */}
          <div className="mb-8">
            <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: AC }}>
              Share Biblical Teaching
            </p>
            <h1 className="text-[28px] font-bold text-white leading-tight mb-3">
              Submit a Video
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Approved videos are uploaded to the official Tulip Bible App YouTube channel and featured in the app. All content is reviewed by administrators before publication.
            </p>
          </div>

          {/* Workflow steps */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
            <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
              How It Works
            </p>
            {[
              ["1", "Submit your video", "Fill out the form with your details and content information."],
              ["2", "Admin review",      "Our team reviews your submission for doctrinal faithfulness."],
              ["3", "YouTube upload",   "Approved videos are published to the official Tulip YouTube channel."],
              ["4", "In-app feature",   "Your video appears in the Tulip Bible App for believers worldwide."],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex gap-3 mb-4 last:mb-0">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5" style={{ background: AC_BG, color: AC }}>
                  {n}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">{title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setView("topics")}
              className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98]"
              style={{ background: AC, color: "#08090f" }}
            >
              Submit Video →
            </button>
          </div>

          {/* Note */}
          <p className="text-center text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.25)" }}>
            All content remains subject to administrator review. Tulip Bible App reserves the right to decline or remove any submission.
          </p>
        </div>
      </div>
    );
  }

  // ── Topics screen (Phase 4) ───────────────────────────────────────────────────

  if (view === "topics") {
    return (
      <NeededTopicsView
        onBack={() => setView("entry")}
        onSubmitForTopic={(topic) => {
          setSelectedTopic(topic);
          setCategory(topic.category);
          setVideoTitle(`${topic.title} — `);
          setView("form");
        }}
        onSubmitCustom={() => { setSelectedTopic(null); setView("form"); }}
      />
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────────

  if (view === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 text-center" style={{ background: BG_ROOT }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
            <path d="m5 13 4 4L19 7"/>
          </svg>
        </div>
        <h1 className="text-[24px] font-bold text-white mb-3">Submission Received</h1>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
          Thank you, {fullName || "friend"}. Our team will review your submission and reach out to {email || "you"} with next steps.
        </p>
        <div className="rounded-2xl p-4 w-full max-w-sm mb-6" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
          <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.50)", fontStyle: "italic" }}>
            &ldquo;Approved videos will be uploaded to the official Tulip Bible App YouTube channel before being featured in the app.&rdquo;
          </p>
        </div>
        <Link
          href="/videos"
          className="px-6 py-3 rounded-2xl text-[14px] font-bold transition-all active:scale-[0.98]"
          style={{ background: AC, color: "#08090f" }}
        >
          Back to Videos
        </Link>
      </div>
    );
  }

  // ── Submission form (Phase 3) ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-24" style={{ background: BG_ROOT }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: BG_ROOT, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={() => setView("topics")}
          className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors py-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-[13px] font-semibold">Back</span>
        </button>
        <div className="mt-3">
          <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: AC }}>
            {selectedTopic ? `Topic: ${selectedTopic.title}` : "Custom Submission"}
          </p>
          <h1 className="text-[20px] font-bold text-white">Video Submission Form</h1>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">

        {/* Selected topic banner */}
        {selectedTopic && (
          <div className="rounded-xl p-3.5" style={{ background: "rgba(201,169,97,0.08)", border: `1px solid ${AC_BORDER}` }}>
            <p className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: AC }}>Submitting for</p>
            <p className="text-[14px] font-bold text-white">{selectedTopic.title}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{selectedTopic.category}</p>
          </div>
        )}

        {/* ─ Required fields ─ */}
        <div className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
          <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
            Required Information
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Full Name *</FieldLabel>
              <TextInput placeholder="John Owen" value={fullName} onChange={setFullName} />
            </div>
            <div>
              <FieldLabel>Email Address *</FieldLabel>
              <TextInput type="email" placeholder="you@church.org" value={email} onChange={setEmail} />
            </div>
            <div>
              <FieldLabel>Church Name *</FieldLabel>
              <TextInput placeholder="Grace Reformed Church" value={churchName} onChange={setChurchName} />
            </div>
            <div>
              <FieldLabel>Video Title *</FieldLabel>
              <TextInput placeholder="What Is the Gospel?" value={videoTitle} onChange={setVideoTitle} />
            </div>
            <div>
              <FieldLabel>Video Description *</FieldLabel>
              <TextArea
                placeholder="A clear description of what this video teaches and who it is for…"
                value={videoDesc}
                onChange={setVideoDesc}
                rows={4}
              />
            </div>
            <div>
              <FieldLabel>Scripture References Used</FieldLabel>
              <TextInput placeholder="Romans 3:23, John 3:16, Ephesians 2:8–9" value={scriptureRef} onChange={setScriptureRef} />
            </div>
            <div>
              <FieldLabel>Video Category *</FieldLabel>
              <SelectInput
                value={category}
                onChange={setCategory}
                options={VIDEO_CATEGORIES}
                placeholder="Select a category…"
              />
            </div>
            <div>
              <FieldLabel>Video Language *</FieldLabel>
              <select
                className="w-full px-3 py-2.5 rounded-xl text-[14px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                value={videoLanguage}
                onChange={(e) => setVideoLanguage(e.target.value as "en" | "es")}
              >
                {VIDEO_LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value} style={{ background: "#0f0f18" }}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.32)" }}>
                This determines whether the approved video appears in English mode or Spanish mode.
              </p>
            </div>
          </div>
        </div>

        {/* ─ Video upload / link ─ */}
        <div className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
          <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
            Your Video *
          </p>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-4">
            {(["file", "link"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setVideoMode(mode); setVideoFile(null); setVideoLink(""); setUploadPct(0); }}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold transition-all"
                style={{
                  background: videoMode === mode ? AC : "rgba(255,255,255,0.06)",
                  color: videoMode === mode ? "#08090f" : "rgba(255,255,255,0.50)",
                  border: videoMode === mode ? "none" : "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {mode === "file" ? "📎 Attach File" : "🔗 Share Link"}
              </button>
            ))}
          </div>

          {videoMode === "file" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-m4v,.mp4,.mov"
                className="hidden"
                onChange={(e) => { setVideoFile(e.target.files?.[0] ?? null); setUploadPct(0); }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: videoFile ? "rgba(201,169,97,0.08)" : "rgba(255,255,255,0.04)",
                  border: `2px dashed ${videoFile ? AC_BORDER : "rgba(255,255,255,0.12)"}`,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={videoFile ? AC : "rgba(255,255,255,0.30)"} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {videoFile ? (
                  <div className="text-center">
                    <p className="text-[13px] font-bold" style={{ color: AC }}>{videoFile.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                      {(videoFile.size / 1024 / 1024).toFixed(0)} MB · Tap to change
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-white/60">Tap to choose your video</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>MP4 or MOV · up to 500 MB</p>
                  </div>
                )}
              </button>

              {/* Upload progress */}
              {submitting && videoMode === "file" && uploadPct > 0 && uploadPct < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>Uploading…</p>
                    <p className="text-[11px] font-bold" style={{ color: AC }}>{uploadPct}%</p>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${uploadPct}%`, background: AC }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <TextInput
                placeholder="https://drive.google.com/file/... or https://dropbox.com/s/..."
                value={videoLink}
                onChange={setVideoLink}
              />
              <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.30)" }}>
                Share a <span style={{ color: "rgba(255,255,255,0.55)" }}>Google Drive</span> or <span style={{ color: "rgba(255,255,255,0.55)" }}>Dropbox</span> link with view access. YouTube links are not accepted here.
              </p>
            </div>
          )}
        </div>

        {/* ─ Confessional info (informational only, no checkbox) ─ */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(201,169,97,0.06)", border: `1px solid ${AC_BORDER}` }}>
          <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: AC }}>
            Our Confessional Alignment
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            The Tulip Bible App aligns with the <span className="text-white font-semibold">1689 London Baptist Confession of Faith</span> and the <span className="text-white font-semibold">Westminster Confession of Faith</span>. You are not required to hold these confessions, but submitted content should be faithful to historic, biblical Christianity.
          </p>
        </div>

        {/* ─ Required agreements ─ */}
        <div className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
          <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
            Required Agreements
          </p>
          <div className="flex flex-col gap-3">
            <AgreementRow checked={agreedChurch} onChange={setAgreedChurch}>
              I am an active member of a <span className="font-bold text-white">local church</span> and this teaching reflects the ministry I serve under.
            </AgreementRow>
            <AgreementRow checked={agreedFaith} onChange={setAgreedFaith}>
              I confirm that this video is faithful to <span className="font-bold text-white">historic, biblical Christianity</span> and does not contradict core Christian doctrine.
            </AgreementRow>
            <AgreementRow checked={agreedPermission} onChange={setAgreedPermission}>
              <span className="font-bold text-white">Content Permission:</span> I grant Tulip Bible App permission to publish, distribute, and display this video through Tulip Bible App platforms, including the official Tulip Bible App YouTube channel.
            </AgreementRow>
          </div>
        </div>

        {/* ─ Optional fields ─ */}
        <div className="rounded-2xl p-4" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
          <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
            Optional Information
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Church Website</FieldLabel>
              <TextInput type="url" placeholder="https://gracereformed.org" value={churchWeb} onChange={setChurchWeb} />
            </div>
            <div>
              <FieldLabel>Confession of Faith</FieldLabel>
              <SelectInput value={confession} onChange={setConfession} options={CONFESSIONS} placeholder="Select…" />
            </div>
            <div>
              <FieldLabel>Creator Biography</FieldLabel>
              <TextArea placeholder="Brief bio — your ministry background, church role, etc." value={creatorBio} onChange={setCreatorBio} rows={3} />
            </div>
            <div>
              <FieldLabel>Ministry Website</FieldLabel>
              <TextInput type="url" placeholder="https://yourministry.org" value={ministryWeb} onChange={setMinistryWeb} />
            </div>
            <div>
              <FieldLabel>YouTube Channel</FieldLabel>
              <TextInput type="url" placeholder="https://youtube.com/@yourchannel" value={socialYT} onChange={setSocialYT} />
            </div>
            <div>
              <FieldLabel>Instagram</FieldLabel>
              <TextInput placeholder="@yourhandle" value={socialIG} onChange={setSocialIG} />
            </div>
          </div>
        </div>

        {/* ─ Error list ─ */}
        {errors.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="text-[11px] font-bold text-red-400 mb-2">Please fix the following:</p>
            {errors.map((e) => (
              <p key={e} className="text-[12px] text-red-300/80 mb-1">· {e}</p>
            ))}
          </div>
        )}

        {/* ─ Submit button ─ */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: allAgreed ? AC : "rgba(201,169,97,0.30)", color: "#08090f" }}
        >
          {submitting
            ? (videoMode === "file" && uploadPct < 100 ? `Uploading… ${uploadPct}%` : "Sending…")
            : "Submit Video for Review →"}
        </button>

        {!allAgreed && (
          <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            All three agreements must be confirmed before submitting.
          </p>
        )}

        <p className="text-center text-[11px] pb-4" style={{ color: "rgba(255,255,255,0.20)" }}>
          Submissions are reviewed by Tulip Bible App administrators. All approved content is published through the official Tulip Bible App YouTube channel.
        </p>
      </div>
    </div>
  );
}
