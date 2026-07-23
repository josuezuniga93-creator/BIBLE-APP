"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../lib/useLanguage";
import { isLightTheme, useTheme, type Theme } from "../lib/useTheme";
import { t, type Lang } from "../lib/i18n";
import { getCloudUser, pullFromCloud } from "../lib/cloudSync";
import type { User } from "@supabase/supabase-js";
import { AppSectionIcon, type AppSectionIconName } from "../components/AppSectionIcon";

type TileDef = {
  href: string;
  icon: AppSectionIconName;
  labelKey:
    | "more_tile_plans"
    | "more_tile_tracker"
    | "more_tile_books"
    | "more_tile_history"
    | "more_tile_kids"
    | "more_tile_videos"
    | "more_tile_study_tools"
    | "more_tile_collections"
    | "more_tile_fellowship"
    | "more_tile_church"
    | "more_tile_give"
    | "more_tile_rebuttal";
  sub: Record<Lang, string>;
};

const APP_TILES: Record<string, TileDef> = {
  plans: {
    href: "/bible-plans",
    icon: "plans",
    labelKey: "more_tile_plans",
    sub: { en: "Guided Scripture rhythms", es: "Ritmos guiados de Escritura" },
  },
  library: {
    href: "/library",
    icon: "library",
    labelKey: "more_tile_books",
    sub: { en: "Classic public-domain books", es: "Libros clásicos de dominio público" },
  },
  history: {
    href: "/learn",
    icon: "historical",
    labelKey: "more_tile_history",
    sub: { en: "Creeds, confessions, and councils", es: "Credos, confesiones y concilios" },
  },
  tracker: {
    href: "/bible-tracker",
    icon: "tracker",
    labelKey: "more_tile_tracker",
    sub: { en: "Progress through every book", es: "Progreso por cada libro" },
  },
  kids: {
    href: "/kids-books",
    icon: "kids",
    labelKey: "more_tile_kids",
    sub: { en: "Reading for children and families", es: "Lectura para niños y familias" },
  },
  videos: {
    href: "/videos",
    icon: "videos",
    labelKey: "more_tile_videos",
    sub: { en: "Teaching and testimonies", es: "Enseñanza y testimonios" },
  },
  studyTools: {
    href: "/study-tools",
    icon: "study-tools",
    labelKey: "more_tile_study_tools",
    sub: { en: "Commentary and dictionary", es: "Comentario y diccionario" },
  },
  collections: {
    href: "/collections",
    icon: "collections",
    labelKey: "more_tile_collections",
    sub: { en: "Saved highlights and books", es: "Resaltados y libros guardados" },
  },
  fellowship: {
    href: "/fellowship",
    icon: "fellowship",
    labelKey: "more_tile_fellowship",
    sub: { en: "Community and encouragement", es: "Comunidad y ánimo" },
  },
  church: {
    href: "/church-directory",
    icon: "church",
    labelKey: "more_tile_church",
    sub: { en: "Confessional churches nearby", es: "Iglesias confesionales cercanas" },
  },
  give: {
    href: "/give",
    icon: "give",
    labelKey: "more_tile_give",
    sub: { en: "Support the ministry", es: "Apoya el ministerio" },
  },
  churchAnalysis: {
    href: "/church-analysis",
    icon: "church-analysis",
    labelKey: "more_tile_rebuttal",
    sub: { en: "Discern sermons and teaching", es: "Discierne sermones y enseñanza" },
  },
};

const PRIMARY_TOOLS = [APP_TILES.studyTools, APP_TILES.library, APP_TILES.history, APP_TILES.videos];
const DAILY_TOOLS = [APP_TILES.plans, APP_TILES.tracker, APP_TILES.kids];
const CONNECT_TOOLS = [
  APP_TILES.collections,
  APP_TILES.church,
  APP_TILES.churchAnalysis,
  APP_TILES.fellowship,
  APP_TILES.give,
];

type Palette = {
  bg: string;
  page: string;
  card: string;
  cardAlt: string;
  text: string;
  muted: string;
  faint: string;
  border: string;
  iconWell: string;
  primary: string;
  primaryText: string;
  shadow: string;
};

function getPalette(isLight: boolean): Palette {
  if (isLight) {
    return {
      bg: "#ffffff",
      page: "#f5f5f6",
      card: "#ffffff",
      cardAlt: "#f1f1f2",
      text: "#050505",
      muted: "rgba(0,0,0,0.58)",
      faint: "rgba(0,0,0,0.35)",
      border: "rgba(0,0,0,0.08)",
      iconWell: "#ececed",
      primary: "#050505",
      primaryText: "#ffffff",
      shadow: "0 18px 40px rgba(0,0,0,0.08)",
    };
  }

  return {
    bg: "#080a10",
    page: "#0d1018",
    card: "rgba(255,255,255,0.055)",
    cardAlt: "rgba(255,255,255,0.085)",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.66)",
    faint: "rgba(255,255,255,0.38)",
    border: "rgba(255,255,255,0.10)",
    iconWell: "rgba(211,179,97,0.14)",
    primary: "#d3b361",
    primaryText: "#050505",
    shadow: "0 20px 50px rgba(0,0,0,0.35)",
  };
}

function copyFor(lang: Lang) {
  return {
    account: lang === "es" ? "Cuenta" : "Account",
    signedIn: lang === "es" ? "Sesión iniciada" : "Signed in",
    viewProfile: lang === "es" ? "Ver mi perfil" : "View my profile",
    signInTitle: lang === "es" ? "Sincroniza tu Biblia" : "Sync your Bible",
    signInSub:
      lang === "es"
        ? "Guarda notas, resaltados, planes y colecciones en todos tus dispositivos."
        : "Keep notes, highlights, plans, and collections across your devices.",
    signIn: lang === "es" ? "Iniciar sesión" : "Sign in",
    heroLabel: lang === "es" ? "Extras" : "Extras",
    heroTitle: lang === "es" ? "Todo para estudiar mejor." : "Everything for deeper study.",
    heroSub:
      lang === "es"
        ? "Abre comentarios, libros, videos, herramientas y conexiones sin perderte."
        : "Open commentaries, books, videos, tools, and church connections without hunting around.",
    continueStudy: lang === "es" ? "Continuar estudio" : "Continue study",
    saved: lang === "es" ? "Guardados" : "Saved",
    libraryStudy: lang === "es" ? "Biblioteca y estudio" : "Library & Study",
    daily: lang === "es" ? "Ritmos diarios" : "Daily Rhythms",
    connect: lang === "es" ? "Conectar" : "Connect",
    settings: lang === "es" ? "Ajustes" : "Settings",
    syncDone: lang === "es" ? "Sincronizado" : "Synced",
    syncing: lang === "es" ? "Sincronizando" : "Syncing",
    syncError: lang === "es" ? "Revisar conexión" : "Check connection",
    idle: lang === "es" ? "Listo" : "Ready",
  };
}

function statusLabel(lang: Lang, status: "idle" | "syncing" | "done" | "error") {
  const c = copyFor(lang);
  if (status === "done") return c.syncDone;
  if (status === "syncing") return c.syncing;
  if (status === "error") return c.syncError;
  return c.idle;
}

function SectionLabel({
  label,
  palette,
}: {
  label: string;
  palette: Palette;
}) {
  return (
    <p
      className="px-1 text-[10px] font-black uppercase tracking-[0.28em]"
      style={{ color: palette.faint }}
    >
      {label}
    </p>
  );
}

function IconWell({
  name,
  palette,
  large = false,
}: {
  name: AppSectionIconName;
  palette: Palette;
  large?: boolean;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: large ? 48 : 42,
        height: large ? 48 : 42,
        borderRadius: large ? 18 : 15,
        color: palette.text,
        background: palette.iconWell,
        border: `1px solid ${palette.border}`,
      }}
    >
      <AppSectionIcon name={name} size={large ? 25 : 22} />
    </span>
  );
}

function FeatureCard({
  tile,
  palette,
  lang,
}: {
  tile: TileDef;
  palette: Palette;
  lang: Lang;
}) {
  return (
    <Link
      href={tile.href}
      className="group flex min-h-[152px] flex-col justify-between rounded-[28px] p-5 transition-transform active:scale-[0.985]"
      style={{
        color: palette.text,
        background: palette.card,
        border: `1px solid ${palette.border}`,
        boxShadow: palette.shadow,
      }}
    >
      <IconWell name={tile.icon} palette={palette} large />
      <span>
        <span className="block text-[19px] font-black leading-tight">{t(lang, tile.labelKey)}</span>
        <span className="mt-2 block text-[13px] font-medium leading-snug" style={{ color: palette.muted }}>
          {tile.sub[lang]}
        </span>
      </span>
    </Link>
  );
}

function RowLink({
  tile,
  palette,
  lang,
}: {
  tile: TileDef;
  palette: Palette;
  lang: Lang;
}) {
  return (
    <Link
      href={tile.href}
      className="flex items-center gap-4 rounded-[24px] px-4 py-4 transition-transform active:scale-[0.99]"
      style={{
        color: palette.text,
        background: palette.card,
        border: `1px solid ${palette.border}`,
      }}
    >
      <IconWell name={tile.icon} palette={palette} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-black">{t(lang, tile.labelKey)}</span>
        <span className="mt-0.5 block truncate text-[13px] font-medium" style={{ color: palette.muted }}>
          {tile.sub[lang]}
        </span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: palette.cardAlt, color: palette.muted }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

function SettingRow({
  label,
  sub,
  palette,
  children,
}: {
  label: string;
  sub: string;
  palette: Palette;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-[24px] px-4 py-4"
      style={{
        background: palette.card,
        border: `1px solid ${palette.border}`,
        color: palette.text,
      }}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-black">{label}</span>
        <span className="mt-0.5 block text-[12.5px] font-medium leading-snug" style={{ color: palette.muted }}>
          {sub}
        </span>
      </span>
      {children}
    </div>
  );
}

export default function MorePage() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isLight = isLightTheme(theme);
  const palette = getPalette(isLight);
  const c = copyFor(lang);

  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"default" | "granted" | "denied">("default");

  useEffect(() => {
    getCloudUser().then((user) => {
      setCloudUser(user);
      if (!user) return;

      setSyncStatus("syncing");
      pullFromCloud(user)
        .then(() => setSyncStatus("done"))
        .catch(() => setSyncStatus("error"));
    });
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifStatus(Notification.permission as "default" | "granted" | "denied");
    }
    try {
      setNotifEnabled(localStorage.getItem("tulip_notif_enabled") === "true");
    } catch {
      // localStorage can be unavailable in restrictive browsers.
    }
  }, []);

  async function handleNotifToggle() {
    if (notifEnabled) {
      setNotifEnabled(false);
      try {
        localStorage.setItem("tulip_notif_enabled", "false");
      } catch {}
      return;
    }

    if (typeof Notification === "undefined") return;
    let perm = Notification.permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
      setNotifStatus(perm as "default" | "granted" | "denied");
    }
    if (perm !== "granted") return;

    setNotifEnabled(true);
    try {
      localStorage.setItem("tulip_notif_enabled", "true");
    } catch {}
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: "SCHEDULE_NOTIFICATIONS" });
    }
  }

  async function handleShare() {
    const data = {
      title: "Tulip Bible App",
      text: "Study Scripture with commentaries, books, notes, and daily devotional tools.",
      url: "https://tulip-bible-app.vercel.app",
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        alert(lang === "es" ? "Enlace copiado." : "Link copied.");
      }
    } catch {
      // User cancelled native share sheet.
    }
  }

  return (
    <div className="min-h-screen" style={{ background: palette.bg, color: palette.text }}>
      <main className="mx-auto max-w-lg px-5 pb-10 pt-6">
        <section className="space-y-3">
          <SectionLabel label={c.account} palette={palette} />
          {cloudUser ? (
            <Link
              href="/profile"
              className="flex items-center gap-4 rounded-[26px] p-4 transition-transform active:scale-[0.99]"
              style={{
                background: palette.cardAlt,
                border: `1px solid ${palette.border}`,
                color: palette.text,
              }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: palette.card }}>
                {cloudUser.user_metadata?.avatar_url ? (
                  <img
                    src={cloudUser.user_metadata.avatar_url}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  <span className="text-base font-black">{(cloudUser.email?.[0] ?? "?").toUpperCase()}</span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-black">
                  {cloudUser.user_metadata?.name ?? cloudUser.email}
                </span>
                <span className="mt-0.5 block text-[13px] font-semibold" style={{ color: palette.muted }}>
                  {c.viewProfile} →
                </span>
              </span>
              <span className="flex flex-col items-end gap-1">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background:
                      syncStatus === "done"
                        ? "#22c55e"
                        : syncStatus === "syncing"
                          ? "#a1a1aa"
                          : syncStatus === "error"
                            ? "#ef4444"
                            : palette.faint,
                  }}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: palette.faint }}>
                  {statusLabel(lang, syncStatus)}
                </span>
              </span>
            </Link>
          ) : (
            <div
              className="rounded-[28px] p-5"
              style={{
                background: palette.cardAlt,
                border: `1px solid ${palette.border}`,
              }}
            >
              <div className="flex items-start gap-4">
                <IconWell name="home" palette={palette} large />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[19px] font-black leading-tight">{c.signInTitle}</h2>
                  <p className="mt-1 text-[13px] font-medium leading-relaxed" style={{ color: palette.muted }}>
                    {c.signInSub}
                  </p>
                </div>
              </div>
              <Link
                href="/auth/login"
                className="mt-5 flex h-12 items-center justify-center rounded-2xl text-[14px] font-black active:scale-[0.99]"
                style={{ background: palette.primary, color: palette.primaryText }}
              >
                {c.signIn}
              </Link>
            </div>
          )}
        </section>

        <section
          className="mt-6 overflow-hidden rounded-[34px] p-6"
          style={{
            background: isLight
              ? "linear-gradient(135deg, #f6f6f7 0%, #ffffff 56%, #e9e9eb 100%)"
              : "linear-gradient(135deg, #111827 0%, #0a0d16 58%, #201a0d 100%)",
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadow,
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.32em]" style={{ color: palette.faint }}>
            {c.heroLabel}
          </p>
          <h1 className="mt-3 max-w-[13ch] text-[38px] font-black leading-[0.94] tracking-[-0.04em]">
            {c.heroTitle}
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-relaxed" style={{ color: palette.muted }}>
            {c.heroSub}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/study-tools"
              className="flex h-12 flex-1 items-center justify-center rounded-2xl text-[14px] font-black active:scale-[0.99]"
              style={{ background: palette.primary, color: palette.primaryText }}
            >
              {c.continueStudy}
            </Link>
            <Link
              href="/collections"
              className="flex h-12 flex-1 items-center justify-center rounded-2xl text-[14px] font-black active:scale-[0.99]"
              style={{
                background: palette.card,
                color: palette.text,
                border: `1px solid ${palette.border}`,
              }}
            >
              {c.saved}
            </Link>
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <SectionLabel label={c.libraryStudy} palette={palette} />
          <div className="grid grid-cols-2 gap-3">
            {PRIMARY_TOOLS.map((tile) => (
              <FeatureCard key={tile.href} tile={tile} palette={palette} lang={lang} />
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <SectionLabel label={c.daily} palette={palette} />
          <div className="space-y-3">
            {DAILY_TOOLS.map((tile) => (
              <RowLink key={tile.href} tile={tile} palette={palette} lang={lang} />
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <SectionLabel label={c.connect} palette={palette} />
          <div className="space-y-3">
            {CONNECT_TOOLS.map((tile) => (
              <RowLink key={tile.href} tile={tile} palette={palette} lang={lang} />
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <SectionLabel label={c.settings} palette={palette} />
          <div className="space-y-3">
            <SettingRow
              label={t(lang, "more_appearance")}
              sub={isLight ? "Light Mode" : "Dark Mode"}
              palette={palette}
            >
              <div
                className="grid grid-cols-2 rounded-2xl p-1"
                style={{ background: palette.cardAlt, border: `1px solid ${palette.border}` }}
              >
                {[
                  { key: "white-noir" as Theme, label: "Light" },
                  { key: "gold-navy" as Theme, label: "Dark" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTheme(item.key)}
                    className="h-9 rounded-xl px-3 text-[12px] font-black transition-colors"
                    style={{
                      background: theme === item.key ? palette.primary : "transparent",
                      color: theme === item.key ? palette.primaryText : palette.muted,
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow
              label={t(lang, "more_language_section")}
              sub={lang === "en" ? "English" : "Español"}
              palette={palette}
            >
              <button
                onClick={() => setLang(lang === "en" ? "es" : "en")}
                className="flex h-10 items-center overflow-hidden rounded-2xl p-1"
                style={{ background: palette.cardAlt, border: `1px solid ${palette.border}` }}
              >
                {(["en", "es"] as const).map((code) => (
                  <span
                    key={code}
                    className="flex h-8 w-10 items-center justify-center rounded-xl text-[12px] font-black uppercase"
                    style={{
                      background: lang === code ? palette.primary : "transparent",
                      color: lang === code ? palette.primaryText : palette.muted,
                    }}
                  >
                    {code}
                  </span>
                ))}
              </button>
            </SettingRow>

            <SettingRow
              label={t(lang, "more_daily_verse")}
              sub={
                notifStatus === "denied"
                  ? t(lang, "more_notif_blocked")
                  : notifEnabled
                    ? t(lang, "more_verse_on")
                    : t(lang, "more_verse_off")
              }
              palette={palette}
            >
              <button
                onClick={handleNotifToggle}
                disabled={notifStatus === "denied"}
                className="relative h-8 w-14 rounded-full transition-colors disabled:opacity-40"
                style={{
                  background: notifEnabled ? palette.primary : palette.cardAlt,
                  border: `1px solid ${palette.border}`,
                }}
                aria-pressed={notifEnabled}
              >
                <span
                  className="absolute top-1 h-6 w-6 rounded-full transition-transform"
                  style={{
                    left: 4,
                    transform: notifEnabled ? "translateX(22px)" : "translateX(0)",
                    background: notifEnabled ? palette.primaryText : palette.text,
                  }}
                />
              </button>
            </SettingRow>

            <button
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-3 rounded-[24px] px-4 py-4 text-[15px] font-black transition-transform active:scale-[0.99]"
              style={{
                background: palette.card,
                color: palette.text,
                border: `1px solid ${palette.border}`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="m16 6-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t(lang, "more_share")}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
