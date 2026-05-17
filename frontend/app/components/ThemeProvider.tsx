"use client";

// Reads localStorage and sets data-theme on <html> before first paint
// to avoid a flash of the wrong theme.
export function ThemeProvider() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var t = localStorage.getItem('ryc-theme') || 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
