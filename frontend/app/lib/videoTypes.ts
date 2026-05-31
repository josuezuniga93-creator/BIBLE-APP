// ─── Tulip Bible App — Video System Types ─────────────────────────────────────
// Phase 7: Database preparation — designed for future Supabase migration.
// All IDs are strings for UUID compatibility when moving to Supabase.

// ─── Approval / Publication Status ───────────────────────────────────────────

export type ApprovalStatus  = "pending" | "approved" | "rejected" | "revision_requested";
export type PublicationStatus = "draft" | "ready_for_upload" | "published" | "removed";
export type VideoCategory =
  | "Fundamentals"
  | "Short"
  | "Community"
  | "Featured"
  | "Archive";

// ─── Creator Profile ──────────────────────────────────────────────────────────

export interface CreatorProfile {
  id: string;
  fullName: string;
  email: string;
  churchName: string;
  churchWebsite?: string;
  confessionOfFaith?: string;
  biography?: string;
  ministryWebsite?: string;
  socialLinks?: {
    youtube?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  isTrustedContributor: boolean;    // Phase 8
  trustedSince?: string;            // ISO date string
  submittedVideoIds: string[];
  featuredVideoIds: string[];
  createdAt: string;
}

// ─── Video ────────────────────────────────────────────────────────────────────

export interface Video {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  churchName: string;
  category: VideoCategory;
  youtubeVideoId: string;           // e.g. "dQw4w9WgXcQ"
  youtubeUrl: string;               // full URL
  thumbnailUrl?: string;            // custom thumbnail; falls back to YT
  scriptureReferences: string[];    // e.g. ["Romans 3:23", "John 3:16"]
  fundamentalsTopicId?: string;     // links to FundamentalsTopic
  durationSeconds?: number;
  isShortVideo?: boolean;           // ≤ 6 minutes
  approvalStatus: ApprovalStatus;
  publicationStatus: PublicationStatus;
  isFeatured: boolean;
  isCurrentFeatured: boolean;
  featuredAt?: string;
  datePublished?: string;
  submittedAt: string;
  updatedAt: string;
  adminNotes?: string;
}

// ─── Fundamentals of the Faith ────────────────────────────────────────────────

export interface FundamentalsTopic {
  id: string;
  category: FundamentalsCategory;
  title: string;
  description: string;
  videoCount: number;
  featuredVideoId?: string;
  lastUploadDate?: string;
  isComplete: boolean;
  order: number;
}

export type FundamentalsCategory =
  | "God"
  | "Jesus Christ"
  | "The Gospel"
  | "Scripture"
  | "Salvation"
  | "The Holy Spirit"
  | "The Church";

// ─── Video Submission ─────────────────────────────────────────────────────────

export interface VideoSubmission {
  id: string;
  creatorId?: string;               // if existing creator
  fullName: string;
  email: string;
  churchName: string;
  videoTitle: string;
  videoDescription: string;
  scriptureReferences: string[];
  videoCategory: string;
  churchWebsite?: string;
  confessionOfFaith?: string;
  creatorBio?: string;
  ministryWebsite?: string;
  socialLinks?: Record<string, string>;
  agreedApostlesCreed: boolean;
  agreedStatementOfFaith: boolean;
  agreedContentPermission: boolean;
  relatedTopicId?: string;          // Phase 4 — needed topic
  submittedAt: string;
  reviewStatus: ApprovalStatus;
  youtubeUrl?: string;              // filled by admin after upload
  reviewedAt?: string;
  reviewedBy?: string;
}

// ─── Needed Topics (Phase 4) ──────────────────────────────────────────────────

export type NeededTopicPriority = "core" | "recommended" | "additional";

export interface NeededTopic {
  id: string;
  title: string;
  fundamentalsTopicId: string;
  priority: NeededTopicPriority;
  currentVideoCount: number;
  targetVideoCount: number;
}

// ─── Review Queue Entry (Phase 6) ─────────────────────────────────────────────

export interface ReviewQueueEntry {
  submissionId: string;
  creatorName: string;
  churchName: string;
  confessionOfFaith?: string;
  videoTitle: string;
  durationSeconds?: number;
  submittedAt: string;
  category: string;
  approvalStatus: ApprovalStatus;
  publicationStatus: PublicationStatus;
  isFeatured: boolean;
  youtubeUrl?: string;
}

// ─── Trusted Contributor Tier (Phase 8) ───────────────────────────────────────

export interface TrustedContributorBenefit {
  badgeLabel: string;
  fasterReview: boolean;
  priorityFeatured: boolean;
}

export const TRUSTED_CONTRIBUTOR_BENEFITS: TrustedContributorBenefit = {
  badgeLabel: "Trusted Contributor",
  fasterReview: true,
  priorityFeatured: true,
};
