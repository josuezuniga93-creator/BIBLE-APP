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
              var stored = localStorage.getItem('ryc-theme');
              // migrate old dark/light values
              if (stored === 'dark') stored = 'midnight';
              if (stored === 'light') stored = 'ivory';
              var valid = ['midnight','ivory','lavender','sage','rose','slate','neon','premium-neon'];
              var t = valid.includes(stored) ? stored : 'midnight';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `,
      }}
    />
  );
}
