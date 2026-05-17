"use client";

import Script from "next/script";

/**
 * Loads the Google Translate widget.
 * A single inline script defines the callback AND injects the GT script
 * so execution order is guaranteed — no race condition.
 */
export function GoogleTranslate() {
  return (
    <>
      <div id="google_translate_element" />

      <Script id="gt-all" strategy="afterInteractive">
        {`
          (function () {
            // 1. Define callback first
            window.googleTranslateElementInit = function () {
              new window.google.translate.TranslateElement(
                { pageLanguage: 'en', includedLanguages: 'es', autoDisplay: false },
                'google_translate_element'
              );
            };

            // 2. Then inject the external script — it will call the callback when ready
            var s = document.createElement('script');
            s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            s.async = true;
            document.head.appendChild(s);
          })();
        `}
      </Script>
    </>
  );
}
