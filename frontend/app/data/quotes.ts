export type Quote = {
  id: string;
  author: string;
  born: number;
  died: number;
  image: string; // path under /quotes/
  text: string;
  textEs: string; // Spanish translation
  week: number; // ISO week number (1–52) — rotates by week
};

export const QUOTES: Quote[] = [
  {
    id: "jc-ryle-1",
    author: "J.C. Ryle",
    born: 1816,
    died: 1900,
    image: "/quotes/jc-ryle.jpg",
    text: "Happy indeed is that church whose members not only desire to reach heaven themselves, but desire also to take others with them.",
    textEs:
      "Dichosa es en verdad aquella iglesia cuyos miembros no solo desean llegar al cielo ellos mismos, sino que también desean llevar a otros consigo.",
    week: 1,
  },
];

export function getCurrentQuote(): Quote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7
  );
  return QUOTES[week % QUOTES.length] ?? QUOTES[0];
}
