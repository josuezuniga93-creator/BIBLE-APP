// TULIP Bible App — Service Worker v5 (daily verse notifications)

const CACHE_NAME = 'tulip-v5';

// ─── Daily verse pool ─────────────────────────────────────────────────────────
const DAILY_VERSES = [
  { ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path." },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go." },
  { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
  { ref: "Proverbs 3:5–6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
  { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope." },
  { ref: "Matthew 11:28", text: "Come to me, all who labor and are heavy laden, and I will give you rest." },
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
  { ref: "Romans 8:1", text: "There is therefore now no condemnation for those who are in Christ Jesus." },
  { ref: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." },
  { ref: "Ephesians 2:8–9", text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast." },
  { ref: "Galatians 2:20", text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me." },
  { ref: "1 John 4:19", text: "We love because he first loved us." },
  { ref: "Hebrews 4:16", text: "Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { ref: "John 14:6", text: "Jesus said to him, 'I am the way, and the truth, and the life. No one comes to the Father except through me.'" },
  { ref: "Romans 5:8", text: "But God shows his love for us in that while we were still sinners, Christ died for us." },
  { ref: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { ref: "Lamentations 3:22–23", text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness." },
  { ref: "2 Timothy 3:16–17", text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness." },
  { ref: "Matthew 5:6", text: "Blessed are those who hunger and thirst for righteousness, for they shall be satisfied." },
  { ref: "Colossians 3:16", text: "Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom." },
  { ref: "Deuteronomy 6:6–7", text: "And these words that I command you today shall be on your heart. You shall teach them diligently to your children." },
  { ref: "Psalm 1:2", text: "But his delight is in the law of the Lord, and on his law he meditates day and night." },
  { ref: "James 1:22", text: "But be doers of the word, and not hearers only, deceiving yourselves." },
  { ref: "Hebrews 12:1–2", text: "Let us run with endurance the race that is set before us, looking to Jesus, the founder and perfecter of our faith." },
  { ref: "1 Peter 2:2", text: "Like newborn infants, long for the pure spiritual milk, that by it you may grow up into salvation." },
  { ref: "John 8:32", text: "And you will know the truth, and the truth will set you free." },
  { ref: "Psalm 37:4", text: "Delight yourself in the Lord, and he will give you the desires of your heart." },
  { ref: "Romans 12:2", text: "Do not be conformed to this world, but be transformed by the renewal of your mind." },
  { ref: "Micah 6:8", text: "He has told you, O man, what is good; and what does the Lord require of you but to do justice, and to love kindness, and to walk humbly with your God?" },
  { ref: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles." },
  { ref: "Philippians 4:6–7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
  { ref: "1 Corinthians 10:31", text: "So, whether you eat or drink, or whatever you do, do all to the glory of God." },
];

// ─── Pick a verse for today ────────────────────────────────────────────────────
function getTodaysVerse() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / 86400000
  );
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

// ─── Schedule the daily 8am notification ──────────────────────────────────────
function scheduleNext8amNotification() {
  const now = new Date();
  const next8am = new Date(now);
  next8am.setHours(8, 0, 0, 0);
  if (next8am <= now) {
    next8am.setDate(next8am.getDate() + 1);
  }
  const msUntil8am = next8am.getTime() - now.getTime();

  setTimeout(() => {
    showVerseNotification();
    // Reschedule for the next day
    setInterval(showVerseNotification, 24 * 60 * 60 * 1000);
  }, msUntil8am);
}

function showVerseNotification() {
  const verse = getTodaysVerse();
  self.registration.showNotification('📖 Daily Bible Verse', {
    body: `"${verse.text}" — ${verse.ref}`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-verse',
    renotify: true,
    data: { url: '/' },
  });
}

// ─── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});

// ─── Message handler (start/stop notifications) ───────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleNext8amNotification();
  }
});

// ─── Lifecycle ────────────────────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Network-first: always get fresh content, never serve stale
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request));
});
