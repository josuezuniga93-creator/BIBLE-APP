"use client";

// Reads the saved theme from localStorage (with cookie fallback) and applies it before first paint.
// Keep this list aligned with app/lib/useTheme.ts.
export function ThemeProvider() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var valid = ['gold-navy', 'white-noir'];
              // If data-theme was already set correctly by the <head> script, don't overwrite it.
              var current = document.documentElement.getAttribute('data-theme');
              if (valid.indexOf(current) >= 0) return;
              var saved = localStorage.getItem('ryc-theme');
              if (!saved) {
                var m = document.cookie.match(/(?:^|;\\s*)ryc-theme=([^;]+)/);
                if (m) saved = decodeURIComponent(m[1]);
              }
              var theme = valid.includes(saved) ? saved : 'white-noir';
              localStorage.setItem('ryc-theme', theme);
              document.documentElement.setAttribute('data-theme', theme);
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
