"use client";

/**
 * Tulip Bible App — Admin Dashboard (Phase 6)
 * Route: /videos/admin
 *
 * Admin-only view. In production, protect this route with middleware
 * checking Supabase auth + admin role before rendering.
 *
 * All data is currently static / mock — replace with Supabase queries (Phase 7).
 */

import { useState } from "react";
import Link from "next/link";
import type { ApprovalStatus, PublicationStatus, VideoLanguage } from "../../lib/videoTypes";

// ─── Design constants ─────────────────────────────────────────────────────────

const AC        = "#c9a961";
const AC_BG     = "rgba(201,169,97,0.12)";
const AC_BORDER = "rgba(201,169,97,0.35)";
const BG_ROOT   = "#08090f";
const BG_CARD   = "rgba(255,255,255,0.035)";
const BD_CARD   = "rgba(255,255,255,0.09)";

// ─── Mock review queue ────────────────────────────────────────────────────────

interface QueueEntry {
  id: string;
  creatorName: string;
  churchName: string;
  confessionOfFaith?: string;
  videoTitle: string;
  duration?: string;
  submittedAt: string;
  category: string;
  language: VideoLanguage;
  approvalStatus: ApprovalStatus;
  publicationStatus: PublicationStatus;
  isFeatured: boolean;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  adminNotes?: string;
}

const MOCK_QUEUE: QueueEntry[] = [
  {
    id: "sub-001",
    creatorName: "James Wilson",
    churchName: "Covenant Reformed Church",
    confessionOfFaith: "Westminster Confession of Faith",
    videoTitle: "What Is Sanctification?",
    duration: "28 min",
    submittedAt: "2024-05-28",
    category: "The Gospel",
    language: "en",
    approvalStatus: "pending",
    publicationStatus: "draft",
    isFeatured: false,
  },
  {
    id: "sub-002",
    creatorName: "Michael Torres",
    churchName: "Grace Baptist Church",
    confessionOfFaith: "London Baptist Confession 1689",
    videoTitle: "What Is Baptism?",
    duration: "35 min",
    submittedAt: "2024-05-25",
    category: "The Church",
    language: "en",
    approvalStatus: "approved",
    publicationStatus: "ready_for_upload",
    isFeatured: false,
  },
  {
    id: "sub-003",
    creatorName: "Sarah Hendricks",
    churchName: "Providence Presbyterian",
    confessionOfFaith: "Westminster Confession of Faith",
    videoTitle: "Assurance of Salvation",
    duration: "40 min",
    submittedAt: "2024-05-20",
    category: "Salvation",
    language: "en",
    approvalStatus: "approved",
    publicationStatus: "published",
    isFeatured: false,
    youtubeUrl: "https://youtube.com/watch?v=abc123",
    youtubeVideoId: "Hm-hP7q5dJ8",
  },
  {
    id: "sub-004",
    creatorName: "Robert Kim",
    churchName: "Heritage Reformed Church",
    videoTitle: "The Trinity Explained",
    duration: "22 min",
    submittedAt: "2024-05-18",
    category: "God",
    language: "en",
    approvalStatus: "revision_requested",
    publicationStatus: "draft",
    isFeatured: false,
    adminNotes: "Good content but audio quality is poor. Please re-record or provide a cleaner file.",
  },
  {
    id: "sub-005",
    creatorName: "David Chen",
    churchName: "Redeemer Community Church",
    videoTitle: "Who Is Jesus? — A Christological Overview",
    duration: "55 min",
    submittedAt: "2024-05-15",
    category: "Jesus Christ",
    language: "en",
    approvalStatus: "approved",
    publicationStatus: "published",
    isFeatured: true,
    youtubeUrl: "https://youtube.com/watch?v=def456",
    youtubeVideoId: "Yba_bm4nYmA",
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ApprovalStatus, { bg: string; color: string; label: string }> = {
  pending:            { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Pending" },
  approved:           { bg: "rgba(16,185,129,0.12)",  color: "#10b981", label: "Approved" },
  rejected:           { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", label: "Rejected" },
  revision_requested: { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6", label: "Revision Needed" },
};

const PUB_COLORS: Record<PublicationStatus, { bg: string; color: string; label: string }> = {
  draft:             { bg: "rgba(255,255,255,0.06)",  color: "rgba(255,255,255,0.40)", label: "Draft" },
  ready_for_upload:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", label: "Ready for Upload" },
  published:         { bg: "rgba(16,185,129,0.12)",  color: "#10b981", label: "Published" },
  removed:           { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", label: "Removed" },
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const s = STATUS_COLORS[status];
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function PubBadge({ status }: { status: PublicationStatus }) {
  const s = PUB_COLORS[status];
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────

function ActionBtn({
  label, color, onClick,
}: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-[0.97]"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
    >
      {label}
    </button>
  );
}

// ─── Entry card ───────────────────────────────────────────────────────────────

function QueueCard({
  entry,
  onAction,
}: {
  entry: QueueEntry;
  onAction: (id: string, action: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [ytUrl, setYtUrl] = useState(entry.youtubeUrl ?? "");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-white leading-snug mb-1">{entry.videoTitle}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {entry.creatorName} · {entry.churchName}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={entry.approvalStatus} />
            <PubBadge status={entry.publicationStatus} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            {entry.category}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: entry.language === "es" ? "rgba(59,130,246,0.15)" : AC_BG, color: entry.language === "es" ? "#60a5fa" : AC }}
          >
            {entry.language === "es" ? "Spanish" : "English"}
          </span>
          {entry.duration && (
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
              {entry.duration}
            </span>
          )}
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            {new Date(entry.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {entry.isFeatured && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: AC_BG, color: AC }}>
              Featured
            </span>
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {/* Metadata */}
          {(entry.confessionOfFaith || entry.adminNotes) && (
            <div className="pt-3 mb-4">
              {entry.confessionOfFaith && (
                <p className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span className="font-bold text-white/60">Confession:</span> {entry.confessionOfFaith}
                </p>
              )}
              {entry.adminNotes && (
                <div className="mt-2 p-2.5 rounded-lg" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.20)" }}>
                  <p className="text-[10px] font-bold text-blue-400 mb-1">Admin Notes</p>
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{entry.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* YouTube URL input (for approved videos) */}
          {entry.approvalStatus === "approved" && entry.publicationStatus !== "published" && (
            <div className="mb-4">
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.30)" }}>
                Video Language
              </label>
              <select
                className="w-full px-3 py-2 mb-3 rounded-xl text-[13px] text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                value={entry.language}
                onChange={(e) => onAction(entry.id, `set_language:${e.target.value}`)}
              >
                <option value="en" style={{ background: "#0f0f18" }}>English</option>
                <option value="es" style={{ background: "#0f0f18" }}>Spanish / Español</option>
              </select>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.30)" }}>
                YouTube URL (after upload)
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-xl text-[13px] text-white outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  placeholder="https://youtube.com/watch?v=…"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                />
                <button
                  onClick={() => onAction(entry.id, `add_youtube_url:${ytUrl}`)}
                  className="px-3 py-2 rounded-xl text-[12px] font-bold"
                  style={{ background: AC, color: "#08090f" }}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Published video preview */}
          {entry.youtubeVideoId && entry.publicationStatus === "published" && (
            <a
              href={entry.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mb-4 text-[12px] font-bold"
              style={{ color: "#ff4444" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14m-6-6 6 6-6 6"/>
              </svg>
              View on YouTube
            </a>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {entry.approvalStatus === "pending" && (
              <>
                <ActionBtn label="Approve"          color="#10b981" onClick={() => onAction(entry.id, "approve")} />
                <ActionBtn label="× Reject"           color="#ef4444" onClick={() => onAction(entry.id, "reject")} />
                <ActionBtn label="⟳ Request Revision" color="#3b82f6" onClick={() => onAction(entry.id, "revision")} />
              </>
            )}
            {entry.approvalStatus === "approved" && entry.publicationStatus !== "published" && (
              <ActionBtn label="Mark Ready for Upload" color="#f59e0b" onClick={() => onAction(entry.id, "ready_for_upload")} />
            )}
            {entry.publicationStatus === "published" && !entry.isFeatured && (
              <ActionBtn label="Feature on Home" color={AC} onClick={() => onAction(entry.id, "feature")} />
            )}
            {entry.isFeatured && (
              <ActionBtn label="Un-feature" color="rgba(255,255,255,0.40)" onClick={() => onAction(entry.id, "unfeature")} />
            )}
            {entry.publicationStatus === "published" && (
              <ActionBtn label="× Remove Video" color="#ef4444" onClick={() => onAction(entry.id, "remove")} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function VideoAdminPage() {
  const [queue, setQueue] = useState<QueueEntry[]>(MOCK_QUEUE);
  const [filterStatus, setFilterStatus] = useState<"all" | ApprovalStatus>("all");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function handleAction(id: string, action: string) {
    setQueue((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        if (action === "approve")          return { ...e, approvalStatus: "approved" as ApprovalStatus };
        if (action === "reject")           return { ...e, approvalStatus: "rejected" as ApprovalStatus };
        if (action === "revision")         return { ...e, approvalStatus: "revision_requested" as ApprovalStatus };
        if (action === "ready_for_upload") return { ...e, publicationStatus: "ready_for_upload" as PublicationStatus };
        if (action === "feature")          return { ...e, isFeatured: true };
        if (action === "unfeature")        return { ...e, isFeatured: false };
        if (action === "remove")           return { ...e, publicationStatus: "removed" as PublicationStatus };
        if (action.startsWith("set_language:")) {
          const language = action.replace("set_language:", "") as VideoLanguage;
          showToast(`Language set to ${language === "es" ? "Spanish" : "English"}.`);
          return { ...e, language };
        }
        if (action.startsWith("add_youtube_url:")) {
          const url = action.replace("add_youtube_url:", "");
          const videoId = url.split("v=")[1]?.split("&")[0] ?? "";
          showToast("YouTube URL saved.");
          return { ...e, youtubeUrl: url, youtubeVideoId: videoId, publicationStatus: "published" as PublicationStatus };
        }
        return e;
      })
    );
    if (!action.startsWith("add_youtube_url:")) showToast(`Action "${action}" applied.`);
  }

  const filtered = queue.filter((e) =>
    filterStatus === "all" ? true : e.approvalStatus === filterStatus
  );

  const stats = {
    pending:  queue.filter((e) => e.approvalStatus === "pending").length,
    approved: queue.filter((e) => e.approvalStatus === "approved").length,
    published: queue.filter((e) => e.publicationStatus === "published").length,
    featured:  queue.filter((e) => e.isFeatured).length,
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: BG_ROOT }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-[13px] font-bold text-white shadow-xl"
          style={{ background: "#10b981" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: BG_ROOT, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          href="/videos"
          className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors py-1 mb-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-[13px] font-semibold">Videos</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: AC }}>
              Administrator
            </p>
            <h1 className="text-[20px] font-bold text-white">Video Dashboard</h1>
          </div>
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
            Admin Only
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: "Pending",   value: stats.pending,   color: "#f59e0b" },
            { label: "Approved",  value: stats.approved,  color: "#10b981" },
            { label: "Published", value: stats.published, color: "#3b82f6" },
            { label: "Featured",  value: stats.featured,  color: AC },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: BG_CARD, border: `1px solid ${BD_CARD}` }}>
              <p className="text-[18px] font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-bold tracking-wider uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Suggested workflow */}
        <div className="rounded-xl p-3.5 mb-5" style={{ background: AC_BG, border: `1px solid ${AC_BORDER}` }}>
          <p className="text-[9px] font-black tracking-widest uppercase mb-2" style={{ color: AC }}>Suggested Workflow</p>
          <div className="flex flex-col gap-1">
            {[
              "1. Contributor submits video",
              "2. Administrator reviews submission",
              "3. Approve content → Mark Ready for Upload",
              "4. Upload to official Tulip YouTube channel",
              "5. Add YouTube URL → Video goes live in app",
              "6. Optionally feature on home page",
            ].map((step) => (
              <p key={step} className="text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>{step}</p>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {(["all", "pending", "approved", "rejected", "revision_requested"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
              style={{
                background: filterStatus === f ? AC : "rgba(255,255,255,0.06)",
                color: filterStatus === f ? "#08090f" : "rgba(255,255,255,0.50)",
                border: filterStatus === f ? "none" : "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {f === "all" ? "All" : f === "revision_requested" ? "Revision" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Queue */}
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <QueueCard key={entry.id} entry={entry} onAction={handleAction} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-white/30 text-[14px] mt-8">No submissions match this filter.</p>
          )}
        </div>

        {/* Phase 8 note */}
        <div className="mt-6 rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "rgba(255,255,255,0.20)" }}>
            Phase 8 — Trusted Contributors
          </p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
            Trusted Contributor tier is architected and ready. Badge display and faster review queue will activate when this feature is enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
