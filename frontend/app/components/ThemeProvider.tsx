"use client";

// Always sets Premium Neon as the active theme.
// Additional themes will be added here when ready.
export function ThemeProvider() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              localStorage.setItem('ryc-theme', 'premium-neon');
              document.documentElement.setAttribute('data-theme', 'premium-neon');
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
