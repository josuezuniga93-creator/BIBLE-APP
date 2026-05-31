"use client";

// Reads the saved theme from localStorage and applies it before first paint.
// Falls back to 'premium-neon' if no valid theme is saved.
export function ThemeProvider() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var valid = ['premium-neon', 'gold-navy', 'light-elegant', 'light-pink'];
              var saved = localStorage.getItem('ryc-theme');
              var theme = valid.includes(saved) ? saved : 'gold-navy';
              localStorage.setItem('ryc-theme', theme);
              document.documentElement.setAttribute('data-theme', theme);
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
