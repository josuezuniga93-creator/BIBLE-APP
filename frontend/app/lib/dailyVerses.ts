// ─── Daily Verse System ───────────────────────────────────────────────────────
// 30 curated, theologically rich verses cycling by day-of-month.
// All text is KJV (King James Version).

export interface DailyVerse {
  reference: string;        // e.g. "John 3:16-17"
  text: string;             // full verse text (KJV)
  book: string;             // e.g. "John"
  chapter: number;          // for linking to /lexicon
  theme: string;            // one-word theme
  matthewHenryUrl: string;  // BibleHub Matthew Henry commentary URL
}

export const DAILY_VERSES: DailyVerse[] = [
  // 1 — Salvation
  {
    reference: "John 3:16-17",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
    book: "John", chapter: 3, theme: "Salvation",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/John.3.16-John.3.17",
  },
  // 2 — Providence
  {
    reference: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    book: "Romans", chapter: 8, theme: "Providence",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Rom.8.28",
  },
  // 3 — Shepherd
  {
    reference: "Psalm 23:1-3",
    text: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
    book: "Psalms", chapter: 23, theme: "Shepherd",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Ps.23.1-Ps.23.3",
  },
  // 4 — Grace
  {
    reference: "Ephesians 2:8-9",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
    book: "Ephesians", chapter: 2, theme: "Grace",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Eph.2.8-Eph.2.9",
  },
  // 5 — Renewal
  {
    reference: "Isaiah 40:31",
    text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    book: "Isaiah", chapter: 40, theme: "Renewal",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Isa.40.31",
  },
  // 6 — Justification
  {
    reference: "Romans 3:23-24",
    text: "For all have sinned, and come short of the glory of God; Being justified freely by his grace through the redemption that is in Christ Jesus.",
    book: "Romans", chapter: 3, theme: "Justification",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Rom.3.23-Rom.3.24",
  },
  // 7 — Contentment
  {
    reference: "Philippians 4:11-13",
    text: "Not that I speak in respect of want: for I have learned, in whatsoever state I am, therewith to be content. I know both how to be abased, and I know how to abound: every where and in all things I am instructed both to be full and to be hungry, both to abound and to suffer need. I can do all things through Christ which strengtheneth me.",
    book: "Philippians", chapter: 4, theme: "Contentment",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Phil.4.11-Phil.4.13",
  },
  // 8 — Trust
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    book: "Proverbs", chapter: 3, theme: "Trust",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Prov.3.5-Prov.3.6",
  },
  // 9 — Resurrection
  {
    reference: "John 11:25-26",
    text: "Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live: And whosoever liveth and believeth in me shall never die. Believest thou this?",
    book: "John", chapter: 11, theme: "Resurrection",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/John.11.25-John.11.26",
  },
  // 10 — Love
  {
    reference: "Romans 5:8",
    text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    book: "Romans", chapter: 5, theme: "Love",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Rom.5.8",
  },
  // 11 — Refuge
  {
    reference: "Psalm 46:1-2",
    text: "God is our refuge and strength, a very present help in trouble. Therefore will not we fear, though the earth be removed, and though the mountains be carried into the midst of the sea.",
    book: "Psalms", chapter: 46, theme: "Refuge",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Ps.46.1-Ps.46.2",
  },
  // 12 — Faith
  {
    reference: "Hebrews 11:1-3",
    text: "Now faith is the substance of things hoped for, the evidence of things not seen. For by it the elders obtained a good report. Through faith we understand that the worlds were framed by the word of God, so that things which are seen were not made of things which do appear.",
    book: "Hebrews", chapter: 11, theme: "Faith",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Heb.11.1-Heb.11.3",
  },
  // 13 — Rest
  {
    reference: "Matthew 11:28-30",
    text: "Come unto me, all ye that labour and are heavy laden, and I will give you rest. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls. For my yoke is easy, and my burden is light.",
    book: "Matthew", chapter: 11, theme: "Rest",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Matt.11.28-Matt.11.30",
  },
  // 14 — Union
  {
    reference: "Galatians 2:20",
    text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
    book: "Galatians", chapter: 2, theme: "Union",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Gal.2.20",
  },
  // 15 — Atonement
  {
    reference: "Isaiah 53:5-6",
    text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed. All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.",
    book: "Isaiah", chapter: 53, theme: "Atonement",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Isa.53.5-Isa.53.6",
  },
  // 16 — Freedom
  {
    reference: "Romans 8:1-2",
    text: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit. For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death.",
    book: "Romans", chapter: 8, theme: "Freedom",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Rom.8.1-Rom.8.2",
  },
  // 17 — Scripture
  {
    reference: "Psalm 119:105",
    text: "Thy word is a lamp unto my feet, and a light unto my path.",
    book: "Psalms", chapter: 119, theme: "Scripture",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Ps.119.105",
  },
  // 18 — Inspiration
  {
    reference: "2 Timothy 3:16-17",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: That the man of God may be perfect, throughly furnished unto all good works.",
    book: "2Timothy", chapter: 3, theme: "Inspiration",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/2Tim.3.16-2Tim.3.17",
  },
  // 19 — Security
  {
    reference: "Romans 8:38-39",
    text: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
    book: "Romans", chapter: 8, theme: "Security",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Rom.8.38-Rom.8.39",
  },
  // 20 — Examination
  {
    reference: "Psalm 139:23-24",
    text: "Search me, O God, and know my heart: try me, and know my thoughts: And see if there be any wicked way in me, and lead me in the way everlasting.",
    book: "Psalms", chapter: 139, theme: "Examination",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Ps.139.23-Ps.139.24",
  },
  // 21 — Regeneration
  {
    reference: "Titus 3:4-5",
    text: "But after that the kindness and love of God our Saviour toward man appeared, Not by works of righteousness which we have done, but according to his mercy he saved us, by the washing of regeneration, and renewing of the Holy Ghost.",
    book: "Titus", chapter: 3, theme: "Regeneration",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Titus.3.4-Titus.3.5",
  },
  // 22 — Sovereignty
  {
    reference: "Colossians 1:15-17",
    text: "Who is the image of the invisible God, the firstborn of every creature: For by him were all things created, that are in heaven, and that are in earth, visible and invisible, whether they be thrones, or dominions, or principalities, or powers: all things were created by him, and for him: And he is before all things, and by him all things consist.",
    book: "Colossians", chapter: 1, theme: "Sovereignty",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Col.1.15-Col.1.17",
  },
  // 23 — Propitiation
  {
    reference: "1 John 4:9-10",
    text: "In this was manifested the love of God toward us, because that God sent his only begotten Son into the world, that we might live through him. Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our sins.",
    book: "1John", chapter: 4, theme: "Propitiation",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/1John.4.9-1John.4.10",
  },
  // 24 — Mercy
  {
    reference: "Exodus 34:6-7",
    text: "And the LORD passed by before him, and proclaimed, The LORD, The LORD God, merciful and gracious, longsuffering, and abundant in goodness and truth, Keeping mercy for thousands, forgiving iniquity and transgression and sin, and that will by no means clear the guilty.",
    book: "Exodus", chapter: 34, theme: "Mercy",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Exod.34.6-Exod.34.7",
  },
  // 25 — Repentance
  {
    reference: "Psalm 51:10-12",
    text: "Create in me a clean heart, O God; and renew a right spirit within me. Cast me not away from thy presence; and take not thy holy spirit from me. Restore unto me the joy of thy salvation; and uphold me with thy free spirit.",
    book: "Psalms", chapter: 51, theme: "Repentance",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Ps.51.10-Ps.51.12",
  },
  // 26 — Hope
  {
    reference: "Jeremiah 29:11-13",
    text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end. Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you. And ye shall seek me, and find me, when ye shall search for me with all your heart.",
    book: "Jeremiah", chapter: 29, theme: "Hope",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Jer.29.11-Jer.29.13",
  },
  // 27 — Logos
  {
    reference: "John 1:1-3",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made.",
    book: "John", chapter: 1, theme: "Logos",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/John.1.1-John.1.3",
  },
  // 28 — Exclusivity
  {
    reference: "Acts 4:11-12",
    text: "This is the stone which was set at nought of you builders, which is become the head of the corner. Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.",
    book: "Acts", chapter: 4, theme: "Exclusivity",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Acts.4.11-Acts.4.12",
  },
  // 29 — Intercession
  {
    reference: "Hebrews 4:15-16",
    text: "For we have not an high priest which cannot be touched with the feeling of our infirmities; but was in all points tempted like as we are, yet without sin. Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need.",
    book: "Hebrews", chapter: 4, theme: "Intercession",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Heb.4.15-Heb.4.16",
  },
  // 30 — New Creation
  {
    reference: "Revelation 21:3-4",
    text: "And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God. And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.",
    book: "Revelation", chapter: 21, theme: "New Creation",
    matthewHenryUrl: "https://www.biblegateway.com/resources/matthew-henry/Rev.21.3-Rev.21.4",
  },
];

/** Returns today's verse based on day-of-month (cycles through 30). */
export function getTodayVerse(): DailyVerse {
  const index = (new Date().getDate() - 1) % 30;
  return DAILY_VERSES[index];
}
