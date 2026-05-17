"use client";

const PERKS_FREE = [
  "Unlimited Scripture Explorer (KJV + Geneva 1599)",
  "Free Books Library (public domain classics)",
  "Featured Reformed teaching videos",
  "Sermon analyzer — 3 analyses per day",
  "History & preacher tracking",
  "Shareable analysis links",
  "PDF export",
];

const PERKS_COMMUNITY = [
  "Everything in Free",
  "Join the private community Discord",
  "Vote on which books and features come next",
  "Early access to new features",
  "Monthly community theology discussion",
  "Support the mission directly",
  "Your name in the supporters list (optional)",
];

const REFORM_QUOTES = [
  {
    quote: "The Bible is not man's word about God, but God's word about man.",
    author: "Karl Barth",
  },
  {
    quote: "To be a Christian without prayer is no more possible than to be alive without breathing.",
    author: "Martin Luther",
  },
  {
    quote: "The whole of the Christian life is a holy longing.",
    author: "Augustine",
  },
];

export default function GivePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/25 via-transparent to-amber-900/15" />
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
            🤝 Community & Support
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-5 bg-gradient-to-r from-white via-violet-200 to-amber-200 bg-clip-text text-transparent">
            Keep the Mission Free
          </h1>
          <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">
            Axiom Bible App is free — and will stay free. It exists to help the body of Christ
            test every teaching against Scripture, the creeds, and the confessions of the
            Reformation.
          </p>
          <p className="mt-3 text-white/30 text-sm italic max-w-xl mx-auto">
            "Buy the truth and do not sell it — wisdom, instruction and insight as well." — Proverbs 23:23
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Mission statement */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 mb-12 text-center max-w-2xl mx-auto">
          <p className="text-2xl font-black text-white/90 mb-4">The Model</p>
          <p className="text-white/55 leading-relaxed">
            30% of community revenue goes to operating costs. The other{" "}
            <span className="text-amber-300 font-bold">70% goes back to the community</span> —
            funding Reformed book digitization, supporting faithful ministries, and expanding the
            free resources available to every believer.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Free tier */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 flex flex-col">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-2">Always Free</p>
              <p className="text-3xl font-black text-white mb-1">$0</p>
              <p className="text-white/40 text-sm">Forever. No credit card. No limits on Scripture access.</p>
            </div>
            <ul className="space-y-3 flex-1">
              {PERKS_FREE.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-white/60">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="mt-6 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-xs text-white/25">
              You already have this — just use the app.
            </div>
          </div>

          {/* Community tier */}
          <div className="rounded-2xl border border-violet-500/30 bg-violet-600/[0.07] p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest">
                Recommended
              </span>
            </div>
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">Community Member</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-3xl font-black text-white">$4.99</p>
                <p className="text-white/40 text-sm">/month</p>
              </div>
              <p className="text-white/40 text-sm">Join the community, shape the mission, support free access for all.</p>
            </div>
            <ul className="space-y-3 flex-1">
              {PERKS_COMMUNITY.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-sm text-white/70">
                  <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            <a
              href="https://patreon.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-500 transition-colors text-sm shadow-lg shadow-violet-900/30"
            >
              🤝 Join on Patreon — $4.99/mo
            </a>
            <p className="text-center text-xs text-white/20 mt-3">Cancel anytime. No lock-in.</p>
          </div>
        </div>

        {/* One-time donation */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center mb-16">
          <p className="text-xl font-bold text-white/80 mb-2">Prefer a one-time gift?</p>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-5">
            Any amount is deeply appreciated and directly funds free access for believers who can't afford premium tools.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["$5", "$15", "$25", "$50", "Custom"].map((amount) => (
              <a
                key={amount}
                href="https://ko-fi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white/60 font-bold text-sm hover:bg-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all min-h-[44px] flex items-center"
              >
                {amount}
              </a>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-4">via Ko-fi — no account required</p>
        </div>

        {/* Reformed quotes */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {REFORM_QUOTES.map((q) => (
            <div
              key={q.author}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col justify-between gap-4"
            >
              <p className="text-white/55 text-sm leading-relaxed italic">&ldquo;{q.quote}&rdquo;</p>
              <p className="text-xs font-bold text-white/30">— {q.author}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-xl font-bold text-white/70 mb-6 text-center">Common Questions</h2>
          {[
            {
              q: "Will the core features ever go behind a paywall?",
              a: "No. Sermon analysis, Scripture Explorer, and the Free Books Library will always be free. The 3-analyses-per-day limit is to keep server costs manageable — it will never drop to 0.",
            },
            {
              q: "Where does the 70% community revenue go?",
              a: "To Reformed book digitization projects, supporting faithful gospel ministries, funding translation of public-domain classics, and expanding free resources. We'll publish a transparent report annually.",
            },
            {
              q: "What is the community Discord?",
              a: "A private server for community members to discuss theology, ask questions about analyses, suggest improvements, and study together. Moderated to stay on-topic and doctrinally sound.",
            },
            {
              q: "I'm a pastor with no budget. Can I use this freely?",
              a: "Absolutely. The free tier is fully functional. If you're using it for ministry, we'd love to hear from you — reach out and we'll make sure you always have access.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <p className="text-sm font-bold text-white/80 mb-2">{item.q}</p>
              <p className="text-sm text-white/45 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-white/[0.06] bg-gradient-to-b from-transparent to-violet-900/10">
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <p className="text-2xl font-black text-white/80 mb-3">Test the spirits.</p>
          <p className="text-white/40 text-sm mb-6">
            "Beloved, do not believe every spirit, but test the spirits to see whether they are from God, for many false prophets have gone out into the world." — 1 John 4:1
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-500 transition-colors text-sm"
          >
            🔍 Analyze a Sermon Now
          </a>
        </div>
      </div>
    </div>
  );
}
