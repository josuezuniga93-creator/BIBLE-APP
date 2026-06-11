// ─── Church History Database ──────────────────────────────────────────────────
// 60-day rotating stories — 40 missionary + 20 hymn
// Batch 1: 20 missionary stories (entries 1–20)
// Remaining 40 entries added in subsequent batches

export interface ChurchHistoryEntry {
  id: string;
  verseReference: string;
  verseText: string;
  title: string;
  year: string;
  fullStory: string;        // 1,500–2,500 characters
  keyTakeaway: string;      // 1–2 sentences
  category: "missionary" | "hymn";
  glow: string;             // rgba — used for home screen gradient
}

// Epoch-based 60-day rotation (anchor: Jan 1, 2024)
export function getTodaysEntry(): ChurchHistoryEntry {
  const today  = new Date();
  const epoch  = new Date(2024, 0, 1);
  const daysSince = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
  return CHURCH_HISTORY[daysSince % CHURCH_HISTORY.length];
}

export const CHURCH_HISTORY: ChurchHistoryEntry[] = [

  // ── MISSIONARY STORIES ──────────────────────────────────────────────────────

  {
    id: "william-carey-leaves-for-india",
    verseReference: "Matthew 28:19",
    verseText: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    title: "William Carey Leaves for India",
    year: "1793",
    category: "missionary",
    glow: "rgba(201,169,97,0.18)",
    fullStory: `William Carey was a Baptist pastor and shoemaker in England who became convinced that Christ's command in Matthew 28:19 applied to every generation of Christians. While many churches focused primarily on ministry at home, Carey believed the gospel should be carried to nations that had never heard it.

In 1792, he published "An Enquiry into the Obligations of Christians to Use Means for the Conversion of the Heathens," a carefully argued case that the Great Commission applied to his generation. Later that year he helped found the Baptist Missionary Society. In 1793, despite uncertainty and hardship, he sailed for India with his family.

The work was harder than he expected. He faced financial struggles, illness, family tragedy, and years with little visible fruit. His wife Dorothy struggled deeply with the upheaval of mission life. Yet Carey remained committed to preaching the gospel and translating Scripture into local languages.

One of the most discouraging moments came when a fire destroyed years of translation manuscript work. Rather than quit, Carey began again. "There is no discouragement which should cause us to abandon God's cause," he wrote. He trusted that God's purposes would not fail.

Carey's ministry helped launch the modern Protestant missionary movement. He supervised translations of Scripture into more than forty Indian languages and founded Serampore College. More than his accomplishments, his life demonstrated that Christ's Great Commission applied to every church in every age — and that obedience was possible even at great personal cost.`,
    keyTakeaway: "William Carey believed that Christ's command to make disciples of all nations still applied to the church. His willingness to go, labor, and persevere helped spark a missionary movement that continues to impact the world today.",
  },

  {
    id: "adoniram-judson-sails-for-burma",
    verseReference: "Isaiah 6:8",
    verseText: "And I heard the voice of the Lord saying, 'Whom shall I send, and who will go for us?' Then I said, 'Here I am! Send me.'",
    title: "Adoniram Judson Sails for Burma",
    year: "1812",
    category: "missionary",
    glow: "rgba(20,184,166,0.18)",
    fullStory: `Adoniram Judson was among the first Americans sent abroad as foreign missionaries. In 1812, he and his wife Ann sailed for Asia, eventually settling in Burma — a country with no Protestant church, no missionary, and no Bible in the Burmese language.

The early years were defined by slow, painful progress. The Burmese language was unlike anything Judson had encountered. He spent years in study before preaching a sermon he trusted his hearers understood. He labored for six years before baptizing his first Burmese convert, Maung Nau, in 1819.

Then came a different kind of test. In 1824, war broke out between Burma and Britain. Judson was arrested as a suspected spy and thrown into Ava's death prison. He spent seventeen months shackled, beaten, and brought near death. His wife Ann worked tirelessly outside the prison walls to secure his release. She died in 1826, exhausted from years of hardship.

Judson survived. He returned to his work. He completed the Burmese Bible in 1834 — a project that had consumed over two decades. By the time he died in 1850, there were more than 7,000 Burmese believers and over 100 churches.

He described his imprisonment later as one of the most spiritually formative periods of his life. The suffering had not destroyed his faith. It had deepened it.`,
    keyTakeaway: "Adoniram Judson endured imprisonment, grief, and years of slow progress without abandoning his calling. His life demonstrates that missionary faithfulness is measured in decades, not days, and that God's purposes are not stopped by suffering or loss.",
  },

  {
    id: "david-brainerd-among-native-americans",
    verseReference: "Romans 10:14",
    verseText: "How then will they call on him in whom they have not believed? And how are they to believe in him of whom they have never heard? And how are they to hear without someone preaching?",
    title: "David Brainerd Among the Native Americans",
    year: "1743",
    category: "missionary",
    glow: "rgba(99,102,241,0.18)",
    fullStory: `David Brainerd was a young missionary who carried the gospel to Native American tribes in New Jersey and Pennsylvania in the 1740s. He was frail, earnest, and consumed by a sense of urgency for souls who had never heard the gospel. He was also dying — tuberculosis had already taken hold of his body before his missionary work fully began.

Brainerd traveled alone through forests on horseback, often through bitter weather, preaching through interpreters to small, suspicious gatherings. He suffered frequently — days too sick to ride, too weak to preach, spending hours in prayer when he could do nothing else. His journal records long stretches of spiritual darkness alongside moments of extraordinary communion with God.

In 1745, something unexpected happened at Crossweeksung, New Jersey. Brainerd preached through an interpreter, and a powerful awakening followed. Men and women who had shown little interest began weeping, crying out, and professing faith. The movement continued for days without natural explanation. Brainerd was astonished — and careful not to take credit for it.

He gathered converts into a settlement called Bethel, where Native American believers could live together under Christian instruction. But his health collapsed. He died at the age of 29, in the home of Jonathan Edwards, in 1747.

Jonathan Edwards published Brainerd's diary. It became one of the most widely read missionary documents in history, inspiring William Carey, Henry Martyn, and generations of missionaries after them.`,
    keyTakeaway: "David Brainerd's short life of prayer, suffering, and perseverance among Native Americans became an instrument God used to inspire generations of missionaries. His diary teaches that faithfulness is often invisible in the moment and fruitful only in eternity.",
  },

  {
    id: "robert-morrison-arrives-in-china",
    verseReference: "Psalm 2:8",
    verseText: "Ask of me, and I will make the nations your heritage, and the ends of the earth your possession.",
    title: "Robert Morrison Arrives in China",
    year: "1807",
    category: "missionary",
    glow: "rgba(56,189,248,0.18)",
    fullStory: `Robert Morrison was a young Scottish Presbyterian who became the first Protestant missionary to China. When he arrived in Canton in 1807, there was no Chinese Bible, no Chinese church, and no known Protestant convert in the entire empire.

The obstacles were extraordinary. The Chinese government forbade foreigners from learning the language. Morrison's Chinese teachers risked punishment for helping him. He initially disguised his work, studying in secret and depending on teachers who cooperated at great personal risk. When he told a representative of the East India Company that he hoped to convert China, the man reportedly replied, "Do you really expect to make an impression on the idolatry of the great Chinese empire?"

Morrison pressed on quietly. He completed the New Testament in 1811 and the full Chinese Bible in 1823 — a monumental achievement that took sixteen years. He also compiled a Chinese dictionary that helped future missionaries for generations.

In twenty-seven years of labor, Morrison saw only ten Chinese converts. By every visible measure, the work looked unfruitful. But the translation he produced outlasted him. When China opened its doors in later decades, Morrison's Bible was already there — a foundation on which thousands of future believers would stand.

He died in Canton in 1834. His gravestone reads: "Sacred to the memory of Robert Morrison, the first Protestant missionary to China."`,
    keyTakeaway: "Robert Morrison worked for years with little visible fruit but left behind a translated Bible that shaped Chinese Christianity for generations. His life teaches that faithfulness is not measured by what we see, but by what God does with what we offer.",
  },

  {
    id: "henry-martyn-travels-to-persia",
    verseReference: "2 Corinthians 5:20",
    verseText: "Therefore, we are ambassadors for Christ, God making his appeal through us. We implore you on behalf of Christ, be reconciled to God.",
    title: "Henry Martyn Travels to Persia",
    year: "1805",
    category: "missionary",
    glow: "rgba(249,115,22,0.18)",
    fullStory: `Henry Martyn was an English scholar and clergyman who sailed to India in 1805 as a chaplain for the East India Company. He carried a singular conviction: the gospel must reach Persia and the Arab world in their own languages. He also knew he was dying. Tuberculosis was slowly destroying his body, and he chose to work at a pace that left no room for recovery.

In India, Martyn learned Urdu and Hindi and supervised translations of the New Testament. Then in 1811, he traveled overland to Persia — a country where Islam dominated every sphere of public life and Christian mission was essentially illegal — to revise his Persian translation of the New Testament.

At the Persian court in Shiraz, he engaged Islamic scholars in serious theological debate about the nature of Christ and the authority of Scripture. The conversations were exhausting and often hostile. But Martyn did not retreat. He completed his Persian revision and sent it to London.

His health was failing rapidly. He began the journey back to England in 1812, traveling overland through Turkey. He collapsed at Tokat, Turkey, and died there at the age of 31.

In seven years of ministry, Martyn had translated or supervised translations of the New Testament into Urdu, Persian, and Arabic. "I cannot stop," he had written. "What is the use of living if it is not to spend oneself in the service of Christ?" His translations served missionaries and believers for generations after his death.`,
    keyTakeaway: "Henry Martyn burned his life out for the sake of getting Scripture into languages that had never had it. His willingness to sacrifice comfort, health, and years for translation work gave the gospel a voice in regions where it was barely a whisper.",
  },

  {
    id: "john-eliot-native-american-bible",
    verseReference: "Romans 1:16",
    verseText: "For I am not ashamed of the gospel, for it is the power of God for salvation to everyone who believes, to the Jew first and also to the Greek.",
    title: "John Eliot and the Native American Bible",
    year: "1663",
    category: "missionary",
    glow: "rgba(16,185,129,0.18)",
    fullStory: `John Eliot was a Puritan minister in Roxbury, Massachusetts who began preaching to Native American tribes in the 1640s. He recognized early that genuine conversion required hearing the gospel in one's own language. He spent years learning the Algonquin language — an undertaking for which he had no grammar book, no dictionary, and no teacher except a willing Native American informant.

Eliot began preaching in Algonquin in 1646. He established a series of "praying towns" — settlements where Native American converts could live under Christian instruction, away from the pressures of traditional tribal life. At their peak, these communities housed more than 1,100 Native American believers.

His most lasting work was the translation of the entire Bible into the Massachusett dialect of Algonquin. Completed in 1663, it was the first Bible printed in the Americas and the first complete Bible translated specifically for a non-European people. Eliot also translated a catechism and other devotional works.

The praying towns were largely destroyed during King Philip's War in 1675–76, a devastating conflict that swept up Eliot's converts between hostile forces on both sides. The communities never fully recovered.

Eliot continued preaching until his death at age 85. His Bible was never reprinted — the Algonquin language was dying with its speakers. But his commitment to putting Scripture in the hands of Native peoples anticipated the modern Bible translation movement by more than a century.`,
    keyTakeaway: "John Eliot believed Native Americans deserved to hear and read the gospel in their own language. His translation of the Bible into Algonquin was a pioneering act of linguistic love that foreshadowed the global Bible translation movement.",
  },

  {
    id: "david-zeisberger-among-native-tribes",
    verseReference: "Romans 15:20",
    verseText: "and thus I make it my ambition to preach the gospel, not where Christ has already been named, lest I build on someone else's foundation.",
    title: "David Zeisberger Among Native Tribes",
    year: "1745",
    category: "missionary",
    glow: "rgba(139,92,246,0.18)",
    fullStory: `David Zeisberger was a Moravian missionary who spent nearly sixty years among Native American peoples in Pennsylvania, Ohio, and Canada — one of the longest missionary careers in American colonial history. Born in Germany and raised in Moravian communities, he arrived in North America as a young man committed to the spiritual welfare of peoples his contemporaries largely ignored.

The Moravians believed God could save anyone, regardless of culture or background, and that missionaries should preach the gospel without imposing European customs. Zeisberger learned multiple Native American languages and preached in them for decades. He established Christian communities among the Delaware people, gathering converts into disciplined settlements where they lived and worshiped together.

These communities were continually threatened by the wars sweeping colonial North America. Native American Christian villages were caught in political crossfires they had not chosen. The Gnadenhutten massacre of 1782 was the most devastating blow: ninety-six peaceful Delaware Christian converts — men, women, and children — were murdered by Pennsylvania militia who refused to distinguish Christian Native Americans from hostile ones.

Zeisberger rebuilt. He continued preaching. He did not quit. He labored until he was nearly ninety years old. When he died in 1808, he had outlasted most of his generation and left behind communities of faith scattered across the eastern frontier.

His story is largely forgotten in church history, but it represents one of the longest and most faithful missionary labors in North American history.`,
    keyTakeaway: "David Zeisberger spent sixty years carrying the gospel to Native American peoples, enduring war, massacre, and repeated loss without abandoning his calling. His life is a testimony to the kind of long, quiet faithfulness that most church histories overlook.",
  },

  {
    id: "robert-moffat-reaches-southern-africa",
    verseReference: "Mark 16:15",
    verseText: "And he said to them, 'Go into all the world and proclaim the gospel to the whole creation.'",
    title: "Robert Moffat Reaches Southern Africa",
    year: "1817",
    category: "missionary",
    glow: "rgba(239,68,68,0.18)",
    fullStory: `Robert Moffat was a Scottish missionary who arrived in southern Africa in 1817 and spent the next fifty years as one of the most consequential figures in African mission history. He was twenty-one years old and had no formal theological training — just a conviction that the gospel belonged to Africa.

Moffat's early years were defined by slow, uncertain work among the Bechuana people. One of the region's most feared chiefs, a man named Africaner, was known for violence and cruelty. Against the advice of others, Moffat sought him out directly. What followed astonished everyone who knew Africaner's reputation: a genuine conversion that transformed his character and his community. That transformation became one of the most striking testimonies in early African missions.

Moffat settled at Kuruman, which became a center of missionary activity in southern Africa. He built a church, organized a school, and translated the entire Bible into Tswana. The translation was completed in 1857 and gave the Tswana people the full Scriptures in their own language for the first time.

Moffat's influence extended beyond his own work. He befriended a young David Livingstone and described to him a vast African interior where countless peoples had never heard the gospel — "the smoke of a thousand villages." That image never left Livingstone. Moffat's daughter Mary became Livingstone's wife. Their partnership opened central Africa to the gospel.`,
    keyTakeaway: "Robert Moffat gave fifty years to southern Africa, producing a Bible in the Tswana language and inspiring the next generation of African missionaries. He demonstrated that long, faithful investment in a place can transform not just individuals but entire regions.",
  },

  {
    id: "william-burns-arrives-in-china",
    verseReference: "Acts 20:24",
    verseText: "But I do not account my life of any value nor as precious to myself, if only I may finish my course and the ministry that I received from the Lord Jesus, to testify to the gospel of the grace of God.",
    title: "William Burns Arrives in China",
    year: "1847",
    category: "missionary",
    glow: "rgba(20,184,166,0.18)",
    fullStory: `William Burns was a Scottish preacher who had already witnessed significant revivals in Ireland and Scotland before sailing to China in 1847 as one of the early Protestant missionaries to the country. He arrived with a determination to move beyond the coastal cities and travel into the interior where no Western missionary had yet gone.

Burns was a man of remarkable self-denial. He adopted Chinese dress and lived as closely as possible to the people he served. He learned Cantonese and then Mandarin. He translated and distributed Christian literature. He preached on street corners and in teahouses — wherever anyone would listen.

His most significant influence may have been on a younger missionary named Hudson Taylor. Burns befriended Taylor in 1855, and the older man's willingness to dress in Chinese clothing, eat Chinese food, and abandon Western customs deeply shaped Taylor's approach to mission. Hudson Taylor would go on to found the China Inland Mission — one of the most influential missionary organizations in history — and he credited Burns as a formative example.

Burns spent nearly twenty years in China before his death in 1868 in northern Manchuria. He left behind a comparatively small number of direct converts. But his influence on Hudson Taylor alone multiplied his labor beyond what he ever saw in his lifetime.

The work God had given Burns to do was not finished when Burns died — it was carried forward through the man he had mentored.`,
    keyTakeaway: "William Burns labored in China with great personal sacrifice and saw limited visible fruit — but his influence on Hudson Taylor shaped one of the most significant missionary movements in Chinese history. God often multiplies faithful work through others in ways we never see.",
  },

  {
    id: "carey-begins-bible-translation-work",
    verseReference: "Matthew 28:19",
    verseText: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
    title: "Carey Begins Bible Translation Work",
    year: "1801",
    category: "missionary",
    glow: "rgba(201,169,97,0.18)",
    fullStory: `When William Carey arrived in India in 1793, he carried a vision that went beyond preaching: he intended to put the Scriptures into the hands of every people in India in their own language. No one had attempted anything like this on such a scale. The subcontinent was home to hundreds of languages and dialects, most of which had never had a single verse of Scripture translated.

In 1800, Carey moved to Serampore, a small Danish territory near Calcutta, where he established a printing press and began organized translation work. Working alongside William Ward (a printer) and Joshua Marshman (a scholar and educator), the Serampore Trio began systematically translating Scripture into the languages of India.

Each language required learning new grammar, vocabulary, and writing systems. Carey supervised translations himself and trained local scholars to assist. Over the following decades, the press produced complete or partial translations of the Bible in Bengali, Sanskrit, Oriya, Marathi, Hindi, Assamese, Punjabi, and more — eventually covering over forty languages.

In 1812, fire destroyed the press and years of manuscript work. Carey wrote to a friend: "The loss is heavy, but I trust the work will lose nothing of real value. We are not discouraged; the work is already begun again in every language."

He began again. By the time Carey died in 1834, the Serampore press had produced more than 200,000 Bibles, Testaments, and Scripture portions.`,
    keyTakeaway: "William Carey's Bible translation work at Serampore transformed how the church thought about Scripture access. His conviction that every people deserved God's Word in their own language helped establish Bible translation as a primary task of missionary work.",
  },

  {
    id: "serampore-translation-work",
    verseReference: "Isaiah 55:11",
    verseText: "so shall my word be that goes out from my mouth; it shall not return to me empty, but it shall accomplish that which I purpose, and shall succeed in the thing for which I sent it.",
    title: "The Serampore Translation Work",
    year: "1800s",
    category: "missionary",
    glow: "rgba(56,189,248,0.18)",
    fullStory: `The Serampore Trio — William Carey, William Ward, and Joshua Marshman — understood that Bible translation required more than Western missionaries. The best translations demanded native speakers with mother-tongue fluency that no foreigner could fully replicate. Serampore College, founded in 1818, was designed in part to train Indian scholars who could bring that expertise to the translation project.

Local pandits — Sanskrit scholars — worked alongside Carey and his colleagues, contributing expertise in regional languages that shaped the final quality of the translations. Their names rarely appear in mission histories, but without them, the Serampore project would have been impossible. One pandit named Ram Ram Basu helped Carey with early Bengali translation and produced some of the first original Bengali prose literature in the process.

The translations were not perfect — later missionaries revised and improved many of them — but they established a foundation. More importantly, they established a method: the best Bible translations require deep collaboration between foreign missionaries and mother-tongue speakers. This principle would shape the approach of Bible translation societies for more than two centuries.

When Carey died in 1834, he left instructions that his gravestone be inscribed with words that captured his self-understanding: "William Carey — A Wretched, Poor and Helpless Worm — On Thy Kind Arms I Fall." He did not see himself as the hero of Serampore. He saw himself as a servant of a God whose Word would accomplish what he could never accomplish alone.`,
    keyTakeaway: "The translation work at Serampore succeeded because it was collaborative — missionaries, printers, and Indian scholars working together toward a common goal. Serampore is a reminder that God works through communities, not only individuals.",
  },

  {
    id: "judson-endures-imprisonment-in-burma",
    verseReference: "Acts 20:24",
    verseText: "But I do not account my life of any value nor as precious to myself, if only I may finish my course and the ministry that I received from the Lord Jesus, to testify to the gospel of the grace of God.",
    title: "Judson Endures Imprisonment in Burma",
    year: "1824",
    category: "missionary",
    glow: "rgba(99,102,241,0.18)",
    fullStory: `In May 1824, war broke out between the Burmese empire and British forces. Adoniram Judson, an American, was swept up in the conflict despite having nothing to do with British colonial policy. Suspected of being a British spy, he was arrested and thrown into Ava's death prison — a place where prisoners were kept in brutal conditions and where execution was a constant possibility.

For seventeen months, Judson was shackled and crowded with other prisoners in suffocating heat. At night, his feet were raised on a bamboo pole to prevent escape. Disease was constant. Death surrounded him daily. He was moved multiple times, including on a forced march in brutal heat that nearly killed him.

His wife Ann made extraordinary efforts outside the prison walls. She petitioned Burmese officials, bribed guards, and smuggled food and medicine to Judson. She was pregnant for part of this period and continued her advocacy through illness. Their daughter Maria was born shortly before Judson's release. Ann died in October 1826, exhausted by years of hardship and illness.

Judson survived. In the journals and letters he wrote from prison and afterward, there is no bitterness — only a deepened sense that God's purposes ran through every trial. He returned to his translation work and completed the Burmese Bible in 1834.

"God is love," he wrote after his release. "I never felt it so intensely as when all comfort was taken from me."`,
    keyTakeaway: "Judson's imprisonment tested his faith at its deepest point and did not break it. His endurance under suffering, and his return to the work that had brought him to Burma, remains one of the most striking testimonies in missionary history.",
  },

  {
    id: "carey-plants-churches-in-india",
    verseReference: "Romans 1:16",
    verseText: "For I am not ashamed of the gospel, for it is the power of God for salvation to everyone who believes, to the Jew first and also to the Greek.",
    title: "Carey Plants Churches in India",
    year: "1790s",
    category: "missionary",
    glow: "rgba(16,185,129,0.18)",
    fullStory: `William Carey arrived in India in 1793 and immediately confronted the complexity of planting churches in a caste-stratified society. Converting to Christianity carried severe social consequences — converts were often cut off from family, community, and livelihood. Carey understood that preaching alone was not enough; new believers needed a community to belong to.

Carey's early church-planting work was slow and discouraging. He spent seven years before baptizing his first Indian convert, Krishna Pal, in 1800. Pal came from a lower caste, and his baptism was a public event that drew a large crowd, curious and hostile in equal measure. Other baptisms followed — but the pace was measured in individuals, not movements.

From the beginning, Carey believed that the church in India had to be indigenous — led by Indian believers, shaped by Indian culture where Scripture permitted it, and financially self-sustaining. He opposed the dependency model, where missions funded everything indefinitely, because he believed it prevented Indian believers from genuine ownership of their own church.

His practice of preaching, gathering converts, and training local leaders was ahead of its time. He organized the church at Serampore around a common life — shared meals, prayer, and shared accountability — and invited Indian believers into leadership as they demonstrated spiritual maturity.

The churches Carey planted were small and sometimes fragile. They faced hostility from Hindu and Muslim neighbors and pressure from colonial authorities. But they survived — and some tracing their origins to Carey's work continue in India today.`,
    keyTakeaway: "William Carey was not only a translator but a church planter who believed Indian believers should lead Indian churches. His vision of indigenous, self-sustaining congregations anticipated principles that would become foundational to global missions a century later.",
  },

  {
    id: "first-burmese-converts",
    verseReference: "Luke 24:47",
    verseText: "and that repentance for the forgiveness of sins should be proclaimed in his name to all nations, beginning from Jerusalem.",
    title: "The First Burmese Converts",
    year: "1819",
    category: "missionary",
    glow: "rgba(20,184,166,0.18)",
    fullStory: `For six years after his arrival in Burma, Adoniram Judson saw no converts. He preached, distributed tracts, and welcomed conversations at a bamboo shelter he built near his home — but Buddhism was woven deeply into Burmese life, and interest in the gospel was minimal. The years required patience Judson had to pray for regularly.

In 1819, a man named Maung Nau came to Judson and began asking sustained questions about Christianity. He had read Judson's Burmese tracts and was moved by what he found. Over several months, their conversations deepened. Maung Nau's understanding grew. In June 1819, he was baptized — the first Burmese Protestant believer in recorded history.

A second convert followed several months later. Then a third. A small community began forming — mostly poor and from lower social classes, as wealthy and educated Burmese feared the social cost of conversion. Judson gathered these early believers, taught them Scripture, and worked to build a functioning congregation.

The early church was fragile. Some converts fell away under pressure from family and community. But others held firm, and their steadfastness strengthened those around them. Judson's arrest in 1824 and the hardships that followed disrupted the growing church — but did not destroy it. When he was released, the believers were still there, marked by hardship but not scattered by it.

Those first converts had staked everything on a gospel they had received from a foreign missionary who could barely speak their language. Their faith was their own.`,
    keyTakeaway: "The first Burmese converts came after six years of patient labor — a reminder that gospel fruit often comes on God's timeline, not ours. Maung Nau's baptism stands as a monument to what prayer and perseverance can produce.",
  },

  {
    id: "morrison-completes-chinese-bible",
    verseReference: "Psalm 96:3",
    verseText: "Declare his glory among the nations, his marvelous works among all the peoples!",
    title: "Morrison Completes the Chinese Bible",
    year: "1823",
    category: "missionary",
    glow: "rgba(56,189,248,0.18)",
    fullStory: `Robert Morrison arrived in China in 1807 with a single long-term ambition: to translate the entire Bible into Chinese. He knew it would take years. He did not know it would take sixteen.

Morrison's work was carried out in conditions of secrecy and danger. The Chinese government banned foreigners from learning the language. His Chinese teachers risked serious punishment for helping him. He worked in early morning hours and late at night, building vocabulary, studying classical Chinese texts, and drafting translations a chapter at a time.

He completed the New Testament in 1811, and Chinese portions circulated quietly. The full Old Testament was translated with the help of William Milne, a fellow missionary who joined Morrison in 1813. The complete Bible was finished in 1823 and printed at Malacca — the first complete Bible in the Chinese language.

Morrison saw only ten converts in his lifetime. The Chinese government's restrictions on evangelism made direct missionary work nearly impossible. But the Bible he produced was not dormant. Decades later, when China began to open, Morrison's translation was already there — carried by traders, read by curious Chinese who had found copies through various channels.

One of Morrison's few converts was a man named Liang Fa. Liang Fa became one of China's first Protestant evangelists, and his writings introduced Protestant ideas to millions of Chinese. Morrison had baptized him in 1816 — one small seed from which an unexpected harvest grew.`,
    keyTakeaway: "Robert Morrison's Chinese Bible was a seed planted in frozen ground. He never saw most of what it produced — but what it produced was enormous. His faithfulness in translation is a reminder that the Word of God does not return empty.",
  },

  {
    id: "judsons-first-years-of-hardship",
    verseReference: "Acts 16:9",
    verseText: "And a vision appeared to Paul in the night: a man of Macedonia was standing there, urging him and saying, 'Come over to Macedonia and help us.'",
    title: "Judson's First Years of Hardship",
    year: "1813",
    category: "missionary",
    glow: "rgba(249,115,22,0.18)",
    fullStory: `When Adoniram Judson and his wife Ann arrived in Burma in 1813, they were greeted by almost every form of hardship imaginable. Burma had no Protestant church, no Christian community, and no sympathy from its Buddhist government toward missionaries who had come to preach a different religion.

The Judsons began by studying Burmese — an immensely difficult task without grammar books or reliable teachers. Adoniram spent hours each day wrestling with the tonal sounds and complex script of a language unlike any he had known. He wrote in his journal that there were days when the task felt impossible.

The climate added to the strain. Ann suffered severe illness in the early years. Adoniram battled fever and exhaustion. Their first child was born and died within months. The combination of grief, isolation, language difficulty, and physical suffering would have caused most people to return home.

They stayed. Adoniram continued his study. Ann wrote letters home describing the work with honesty and warmth — letters that became some of the most widely read missionary accounts of the era and helped sustain prayer and financial support for the Burma mission.

By 1816, Judson was preaching in Burmese. By 1817, he had completed a translation of Matthew. The years of isolated suffering had produced something invisible to the outside world: competence, faithfulness, and the quiet credibility that comes only from staying when others would have left. The visible years of harvest would not have been possible without the hidden years of preparation.`,
    keyTakeaway: "Judson's first years in Burma were defined by grief, illness, and slow progress — with no converts and no visible fruit. He stayed anyway. The willingness to endure the hidden years of preparation is what made the visible years of harvest possible.",
  },

  {
    id: "brainerds-missionary-labors-and-prayer",
    verseReference: "Matthew 9:37–38",
    verseText: "Then he said to his disciples, 'The harvest is plentiful, but the laborers are few; therefore pray earnestly to the Lord of the harvest to send out laborers into his harvest.'",
    title: "Brainerd's Missionary Labors and Prayer",
    year: "1740s",
    category: "missionary",
    glow: "rgba(139,92,246,0.18)",
    fullStory: `David Brainerd's missionary journals are among the most searching accounts of prayer in Christian literature. He spent long hours — sometimes entire days — prostrate in prayer in the forests of New Jersey and Pennsylvania, wrestling with God over souls he had not yet met and a ministry that seemed to produce nothing visible.

"I had spent much of the day in prayer and preparation for preaching," he wrote during a period of discouragement. "God seemed near and precious to me, though I can see nothing but my own barrenness." The journals record alternating days of spiritual warmth and crushing darkness — a record that has resonated with believers across three centuries.

When the revival broke out at Crossweeksung in 1745, Brainerd was theologically careful in his response. He did not immediately attribute it to the Spirit. He watched, he questioned, he waited. Only when he saw genuine and lasting change in the lives of those who had professed faith did he conclude that God had acted. His carefulness shaped how he described the awakening and how he counseled the new converts.

Jonathan Edwards, who edited Brainerd's diary, saw in it a model of genuine evangelical piety: honest about sin, earnest in prayer, Christocentric in its devotion. Edwards used the diary as a standard of authentic spiritual experience in his wider pastoral writing.

Brainerd's prayer life was not separate from his missionary work — it was the foundation of it.`,
    keyTakeaway: "David Brainerd's legacy is inseparable from his prayer life. He believed what happened in prayer in the forest mattered more than what happened when he stood to preach — and the Crossweeksung revival gave evidence that he was right.",
  },

  {
    id: "henry-martyn-translates-the-new-testament",
    verseReference: "Romans 15:21",
    verseText: "but as it is written, 'Those who have never been told of him will see, and those who have never heard will understand.'",
    title: "Henry Martyn Translates the New Testament",
    year: "1811",
    category: "missionary",
    glow: "rgba(239,68,68,0.18)",
    fullStory: `Henry Martyn arrived in India in 1806 carrying alongside his chaplain's duties a consuming ambition: to translate the New Testament into languages the gospel had never reached. He was twenty-five years old and already suffering from the tuberculosis that would eventually kill him.

In India, Martyn supervised translations of the New Testament into Urdu and Hindi, working alongside native scholars whose mother-tongue fluency he knew he could not replicate. The partnership was essential — Martyn's theological precision combined with the scholars' linguistic expertise produced translations that could be read and understood by ordinary people.

His Urdu New Testament, completed in 1811, was among the first Protestant Scripture translations for the Urdu-speaking Muslim world. But Martyn saw his Persian translation as the most strategically important project — Persian was the literary language of educated Muslims across a vast region. He traveled to Persia specifically to revise it with Iranian scholars who could correct idiom and nuance that no foreigner could reliably master.

He completed the Persian revision and sent it to London. Then he began the journey back to England. He never made it. He died in Tokat, Turkey, in October 1812, at the age of 31.

His translations reached their intended audiences. His Persian New Testament served believers in Persia for generations. His Urdu work shaped Indian Christianity for two centuries. He had poured his short life into getting the Word of God into the hands of people who had never held it.`,
    keyTakeaway: "Henry Martyn translated the New Testament into languages the Islamic world could read, spending his short life on a task that outlasted him by centuries. His willingness to exhaust himself in translation work gave the gospel a voice where it desperately needed one.",
  },

  {
    id: "careys-missionary-vision",
    verseReference: "Psalm 67:2",
    verseText: "that your way may be known on earth, your saving power among all nations.",
    title: "Carey's Missionary Vision",
    year: "1792",
    category: "missionary",
    glow: "rgba(201,169,97,0.18)",
    fullStory: `The year before William Carey sailed for India, he wrote a book that changed the course of Protestant missions. "An Enquiry into the Obligations of Christians to Use Means for the Conversion of the Heathens," published in 1792, was a carefully reasoned argument that the Great Commission applied to every generation of Christians — including his own.

Carey's argument confronted a widely held belief in English Baptist circles: that God would convert the heathen in his own time without human means, and that missionary activity was presumptuous. Carey disagreed. Drawing on Matthew 28 and a detailed survey of the world's unreached peoples, he argued that the church was obligated to go — and that the tools existed to make it possible: ships, trade routes, and printing presses.

In May 1792, he preached to the Northamptonshire Baptist Association from Isaiah 54 and produced one of the most famous missionary slogans in history: "Expect great things from God; attempt great things for God." The sermon galvanized the Association. Later that year, the Baptist Missionary Society was founded — the organization that would send Carey to India.

The "Enquiry" became the intellectual foundation of the modern missionary movement. It was reprinted, widely read, and placed in the hands of men like Adoniram Judson and Henry Martyn, who read it and felt compelled to go.

Carey did not merely inspire missions from a distance. He went.`,
    keyTakeaway: "William Carey's 1792 'Enquiry' gave the modern missionary movement its theological foundation. By arguing that the Great Commission applied to his generation, he helped awaken a movement that would eventually carry the gospel to every nation on earth.",
  },

  {
    id: "moravian-missions-to-the-caribbean",
    verseReference: "Acts 13:47",
    verseText: "For so the Lord has commanded us, saying, 'I have made you a light for the Gentiles, that you may bring salvation to the ends of the earth.'",
    title: "Moravian Missions to the Caribbean",
    year: "1732",
    category: "missionary",
    glow: "rgba(16,185,129,0.18)",
    fullStory: `The Moravian Church — a small Protestant denomination rooted in the traditions of Jan Hus of Bohemia — became in the eighteenth century one of the most missionary-minded communities in Christian history. Their first major overseas mission began not to a convenient location, but to the enslaved people of the Danish Caribbean island of St. Thomas.

In 1732, two young Moravian men — Johann Leonhard Dober and David Nitschmann — left Herrnhut, Germany, for St. Thomas. They had heard that enslaved Africans on the island had no access to the gospel and that no one was willing to go to them. The Moravians decided to go themselves — reportedly with such urgency that Dober was willing to sell himself into slavery to gain access to the enslaved community if necessary.

The obstacles were severe. Colonial society had little interest in the spiritual welfare of enslaved people. Some planters actively opposed Christian mission among their slaves, fearing it would undermine social control. Dober and Nitschmann arrived with almost no resources and faced a population speaking languages they did not know, exhausted by forced labor, and suspicious of Europeans.

They stayed. They learned. They preached. Within two years, the first enslaved Africans were baptized. The Moravian mission to the Caribbean grew into one of the most significant Christian movements among enslaved peoples in the Atlantic world.

At Herrnhut, the Moravian community maintained a round-the-clock prayer watch — an intercession that continued for over a hundred years. Many historians credit this prayer movement as the spiritual engine of Moravian missions.`,
    keyTakeaway: "The Moravians carried the gospel to enslaved peoples when few others would. Their willingness to go to the forgotten and marginalized, sustained by a remarkable prayer movement at Herrnhut, demonstrates that gospel mission often begins where the powerful have no interest in going.",
  },

];
