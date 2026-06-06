"use client";
import { useLanguage } from "../lib/useLanguage";

const BOOKS = {
  en: {
    title: "Believe and Be Saved",
    author: "Charles H. Spurgeon",
    subtitle: "Or, Around the Wicket Gate",
    cover: "/books/believe-and-be-saved.jpg",
    buyUrl: "https://a.co/d/07zyQGpk",
    price: "$13.99",
    tag: "Reformed Classic",
    description: "A warm and persuasive Spurgeon classic on saving faith — written for the doubting believer and the seeking sinner alike.",
  },
  es: {
    title: "No desperdicies tu vida",
    author: "John Piper",
    subtitle: "Edición revisada y actualizada",
    cover: "/books/john-piper-no-desperdicies-tu-vida.jpg",
    buyUrl: "https://www.amazon.com/desperdicies-Edici%C3%B3n-revisada-actualizada-Waste/dp/0825450764/ref=sr_1_3?crid=1DHDBPDPRPBLJ&dib=eyJ2IjoiMSJ9.d_KQ8_8P0rnElmojf10rQve5fmdu46JkRn_mgr3mvnFE3Axt1lBA1EHT-jIuTkwTCi1SL4GEfP34VL1veDo0u9rBzqsx72aRDWVqyPoAjq3LTZ2cLjHXxWSa07pjTZFGdcqsHAWXLyTqxto6bFahVXlNtoUV6bgoVnNqiTPUZ_dMkEJ8y2AtYhT12hrYf5aPWjM04q4hTMd8EN_xixnH95Ym-1eJOu2WEW07t8e-1_c.gwj5zrfx_Nk1soBKUjTWTqeOVtiYN8NqEgbHLPoX7G8&dib_tag=se&keywords=john+piper+espanol&qid=1780432202&sprefix=john+piper+espanol%2Caps%2C170&sr=8-3",
    price: "$6.99",
    tag: "Vida Cristiana",
    description: "Un llamado directo de John Piper a vivir con propósito eterno, evitando una vida consumida por distracciones, comodidad y placeres pequeños.",
  },
};

export default function BookOfMonth() {
  const { lang } = useLanguage();
  const book = lang === "es" ? BOOKS.es : BOOKS.en;

  return (
    <section className="mt-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold" style={{ color: "var(--color-text, #fff)" }}>
          {lang === "es" ? "Libro del Mes" : "Book of the Month"}
        </h3>
        <span className="text-[11px]" style={{ color: "rgba(201,169,97,0.7)" }}>
          {lang === "es" ? "Lectura recomendada" : "Recommended reading"}
        </span>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, rgba(201,169,97,0.08) 0%, rgba(10,11,18,0.98) 45%, rgba(8,9,15,1) 100%)",
          border: "1px solid rgba(201,169,97,0.18)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex">
          {/* Book cover */}
          <div
            className="flex-shrink-0 relative"
            style={{ width: "34%" }}
          >
            <img
              src={book.cover}
              alt={book.title}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "0",
                boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
              }}
            />
            {/* Bottom fade on cover */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: "42%",
                background: "linear-gradient(to top, rgba(10,11,18,0.62), rgba(10,11,18,0.22) 45%, transparent 100%)",
              }}
            />
          </div>

          {/* Info panel */}
          <div className="flex flex-col justify-center p-4 pb-3" style={{ flex: 1, minWidth: 0 }}>
            <div>
              {/* Month + tag row */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(201,169,97,0.68)" }}
                >
                  {lang === "es" ? "• Junio 2026" : "• June 2026"}
                </span>
                <span
                  className="text-[8px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(201,169,97,0.12)", color: "rgba(201,169,97,0.85)", border: "1px solid rgba(201,169,97,0.22)" }}
                >
                  {book.tag}
                </span>
              </div>

              {/* Title */}
              <h4
                className="font-bold text-white leading-snug mb-1"
                style={{ fontSize: "17px", letterSpacing: "-0.1px" }}
              >
                {book.title}
              </h4>

              {/* Author */}
              <p className="text-[12px] font-semibold mb-1" style={{ color: "rgba(201,169,97,0.92)" }}>
                {book.author}
              </p>

              {/* Subtitle */}
              <p className="text-[11px] italic" style={{ color: "rgba(255,255,255,0.48)" }}>
                {book.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          className="mx-4 mt-1 rounded-xl px-3.5 py-3"
          style={{
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.76)" }}
          >
            {book.description}
          </p>
        </div>

        {/* Price + buy button */}
        <div className="px-4 pb-4 pt-3 flex items-center gap-2">
          <div
            className="rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.045)",
              border: "1px solid rgba(201,169,97,0.16)",
              minWidth: "92px",
            }}
          >
            <p
              className="text-[8px] uppercase tracking-widest font-bold mb-0.5"
              style={{ color: "rgba(201,169,97,0.66)" }}
            >
              {lang === "es" ? "Precio" : "Price"}
            </p>
            <p
              className="text-[7px] uppercase tracking-wider font-bold mb-1"
              style={{ color: "rgba(255,255,255,0.34)" }}
            >
              Amazon
            </p>
            <p className="text-[15px] font-bold leading-none" style={{ color: "rgba(255,255,255,0.92)" }}>
              {book.price}
            </p>
          </div>
          <a
            href={book.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 transition-opacity active:opacity-80"
            style={{
              background: "rgba(201,169,97,1)",
              color: "#08090f",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.4px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {lang === "es" ? "Comprar en Amazon" : "Buy on Amazon"}
          </a>
        </div>
      </div>
    </section>
  );
}
