// ─── Daily Verse System ───────────────────────────────────────────────────────
// 30 Bible verses aligned with Reformed theology, renewing-your-mind passages,
// and historically significant Scripture. Each entry includes:
//   context      – theological explanation of the verse
//   historicalNote – (optional) church history moment tied to this verse
// All text is KJV (King James Version).

export interface DailyVerse {
  reference: string;   // e.g. "Romans 8:29-30"
  text: string;        // full verse text (KJV)
  book: string;        // must match the API's BookMeta.name exactly
  chapter: number;     // for linking to /lexicon
  theme: string;       // one-word theme label
  context: string;     // theological explanation (2–3 sentences)
  historicalNote?: string; // optional church history connection
}

export const DAILY_VERSES: DailyVerse[] = [

  // 1 — Election
  {
    reference: "Romans 8:29-30",
    text: "For whom he did foreknow, he also did predestinate to be conformed to the image of his Son, that he might be the firstborn among many brethren. Moreover whom he did predestinate, them he also called: and whom he called, them he also justified: and whom he justified, them he also glorified.",
    book: "Romans", chapter: 8, theme: "Election",
    context: "Paul traces the unbroken chain of God's sovereign grace — from foreknowledge to glorification — without a single link left to human initiative. Every verb is past tense: God speaks of glorification as already accomplished, so certain is his eternal purpose. This 'golden chain' of redemption assures believers that their salvation rests entirely in God's immutable will, not in the frailty of human decision.",
    historicalNote: "John Calvin used these verses as the backbone of his doctrine of double predestination in the Institutes of the Christian Religion (1536). The Synod of Dort (1618–1619) affirmed this same chain against Arminian objections, codifying it in the Five Canons of Dort that became foundational for Reformed churches worldwide.",
  },

  // 2 — Grace Alone
  {
    reference: "Ephesians 2:8-9",
    text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: not of works, lest any man should boast.",
    book: "Ephesians", chapter: 2, theme: "Grace",
    context: "Paul explicitly removes every human contribution from salvation — grace is the source, faith is the instrument, and even faith is 'the gift of God,' not a meritorious act. The 'not of works' is absolute: no cooperation, no initial disposition, no moral effort contributes to our standing before God. The reason is stated plainly — so that no human pride can attach itself to salvation.",
    historicalNote: "When Augustine cited Ephesians 2:8-9 against Pelagius in the 5th century, he argued that even the faith by which we receive grace is itself a gift — a position later confirmed at the Council of Carthage (418 AD). This same text was central at the Diet of Augsburg (1530) when Lutherans presented the Augsburg Confession, insisting that justification is received through faith alone, not human merit.",
  },

  // 3 — Justification by Faith
  {
    reference: "Romans 1:16-17",
    text: "For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek. For therein is the righteousness of God revealed from faith to faith: as it is written, The just shall live by faith.",
    book: "Romans", chapter: 1, theme: "Justification",
    context: "The righteousness Paul describes is not moral achievement but an alien righteousness — God's own righteousness credited to the believing sinner. 'From faith to faith' underscores that faith is the sole instrument, beginning to end. The quotation from Habakkuk 2:4 roots this New Testament doctrine in the Old Testament witness, showing one consistent gospel across the ages.",
    historicalNote: "Martin Luther was reading Romans 1:17 in the Wittenberg tower around 1515 when the phrase 'the righteousness of God' suddenly appeared to him not as a punishing demand but as a gift granted through faith. He later wrote: 'I felt myself to be born again and to have gone through open doors into paradise.' This tower experience ignited the Protestant Reformation, and Luther nailed his 95 Theses on October 31, 1517.",
  },

  // 4 — Irresistible Grace
  {
    reference: "John 6:37-40",
    text: "All that the Father giveth me shall come to me; and him that cometh to me I will in no wise cast out. For I came down from heaven, not to do mine own will, but the will of him that sent me. And this is the Father's will which hath sent me, that of all which he hath given me I should lose nothing, but should raise it up again at the last day.",
    book: "John", chapter: 6, theme: "Perseverance",
    context: "Jesus draws a direct line between the Father's gift (election) and the Son's guarantee (preservation). 'All that the Father giveth me shall come' — the coming is certain, not contingent on human cooperation. The double promise — that none will be cast out and none will be lost — grounds the believer's security in Christ's own faithfulness, not in human steadfastness. This is the Reformed doctrine of perseverance of the saints rooted in Christ's work, not ours.",
    historicalNote: "The Synod of Dort (1618) cited John 6 extensively in defending irresistible grace and the perseverance of the saints against the Remonstrants (Arminians). The Canons of Dort declared that those given to Christ by the Father will without fail come to him and be preserved — a ruling that shaped Reformed confessions from the Westminster Standards (1647) to the Belgic Confession.",
  },

  // 5 — No Condemnation
  {
    reference: "Romans 8:1",
    text: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.",
    book: "Romans", chapter: 8, theme: "Justification",
    context: "The 'therefore' links back to Romans 7's agonized confession of indwelling sin — yet Paul's verdict is total acquittal. The ground of 'no condemnation' is not the believer's performance but their union with Christ, in whom God's condemning judgment has already fallen (8:3). The law of the Spirit of life has freed believers from the law of sin and death, making their standing before God permanently secure.",
  },

  // 6 — Total Depravity
  {
    reference: "Jeremiah 17:9",
    text: "The heart is deceitful above all things, and desperately wicked: who can know it?",
    book: "Jeremiah", chapter: 17, theme: "Depravity",
    context: "Jeremiah diagnoses the root problem of humanity not in circumstance or environment but in the heart itself. The Hebrew word for 'desperately wicked' (anash) carries the sense of incurably ill — a disease beyond human remedy. This is why Reformed theology insists that no sinner can choose God unaided: the very organ of spiritual perception and desire has been corrupted by the fall. Only a new heart given by God can produce genuine turning.",
    historicalNote: "Augustine cited this human incapacity when confronting Pelagius's claim that humans possess the natural ability to choose good. Thomas Boston's 'Human Nature in Its Fourfold State' (1720) built extensively on this verse to explain total inability — not that man commits every possible sin, but that every faculty is tainted and none will seek God apart from regenerating grace.",
  },

  // 7 — Sovereign Grace
  {
    reference: "Ephesians 1:4-6",
    text: "According as he hath chosen us in him before the foundation of the world, that we should be holy and without blame before him in love: having predestinated us unto the adoption of children by Jesus Christ to himself, according to the good pleasure of his will, to the praise of the glory of his grace, wherein he hath made us accepted in the beloved.",
    book: "Ephesians", chapter: 1, theme: "Election",
    context: "Election here is traced to a point before creation — 'before the foundation of the world' — ruling out any basis in foreseen faith or merit. The ground given is 'the good pleasure of his will,' not human qualification. The ultimate aim is not human comfort but 'the praise of the glory of his grace' — God's own glory in the display of his mercy. This is unconditional election at its clearest.",
    historicalNote: "The Synod of Dort (1619) used Ephesians 1 to refute the First Remonstrance, which claimed God elected those whom He foresaw would believe. The Canons declared election unconditional — based solely on God's sovereign good pleasure — a doctrine that became a cornerstone of the Heidelberg Catechism, Belgic Confession, and Westminster Confession of Faith.",
  },

  // 8 — Renewing the Mind
  {
    reference: "Romans 12:1-2",
    text: "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service. And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.",
    book: "Romans", chapter: 12, theme: "Sanctification",
    context: "After eleven chapters of doctrinal foundation, Paul calls believers to a life of responsive worship grounded in 'the mercies of God.' Transformation is not self-improvement but the renewal of the mind — the capacity for spiritual discernment reshaped by grace. The passive voice ('be ye transformed') indicates this is something done to us as we submit to the Spirit, not something we accomplish by moral effort alone.",
  },

  // 9 — Thinking Rightly
  {
    reference: "Philippians 4:8",
    text: "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.",
    book: "Philippians", chapter: 4, theme: "Renewal",
    context: "Paul's command to govern the thought-life is set between two great promises: the peace of God (v.7) and the God of peace (v.9). Sanctified thinking is not mere positive thinking but the deliberate orientation of the mind toward what is objectively true, virtuous, and God-honoring. The mind renewed by the Spirit begins to find delight in these things rather than needing to be forced toward them.",
  },

  // 10 — Setting Your Mind
  {
    reference: "Colossians 3:1-2",
    text: "If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God. Set your affection on things above, not on things on the earth.",
    book: "Colossians", chapter: 3, theme: "Renewal",
    context: "The indicative of union with Christ ('if ye then be risen') is the ground for the imperative ('seek'). Because the believer's true life is already hidden with Christ in God (v.3), setting the mind on heavenly things is not escapism but realism — aligning perception with what is already most real. The word translated 'affection' (phronéō) means the whole direction of thought, will, and orientation, not mere sentiment.",
  },

  // 11 — Taking Every Thought Captive
  {
    reference: "2 Corinthians 10:5",
    text: "Casting down imaginations, and every high thing that exalteth itself against the knowledge of God, and bringing into captivity every thought to the obedience of Christ.",
    book: "2 Corinthians", chapter: 10, theme: "Renewal",
    context: "Paul uses military language — pulling down strongholds, taking captives — to describe the cognitive war of sanctification. Every competing worldview, every argument raised against the knowledge of God, must be brought under Christ's authority. This is not the suppression of reason but its proper submission: the redeemed intellect recognizing Christ as Lord of all truth.",
  },

  // 12 — God's Word as Guard
  {
    reference: "Psalm 119:11",
    text: "Thy word have I hid in mine heart, that I might not sin against thee.",
    book: "Psalms", chapter: 119, theme: "Scripture",
    context: "The Psalmist's strategy for resisting sin is not moral resolve but Scripture memorized and cherished. The word 'hid' (tsaphan) implies something treasured and stored carefully, like a precious reserve. Reformed spirituality has always emphasized the formative power of Scripture not merely read but internalized — shaping conscience, desire, and imagination from the inside out.",
  },

  // 13 — Sola Scriptura
  {
    reference: "2 Timothy 3:16-17",
    text: "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness: that the man of God may be perfect, thoroughly furnished unto all good works.",
    book: "2 Timothy", chapter: 3, theme: "Scripture",
    context: "The Greek 'theopneustos' — God-breathed — locates the origin of Scripture not in human genius but in divine exhalation. Every part is profitable for every need: doctrine (what to believe), reproof (where we have gone wrong), correction (how to get right), and instruction (how to walk rightly). This sufficiency of Scripture means no church tradition, no ongoing revelation, and no papal decree can supplement what God has already fully given.",
    historicalNote: "At the Diet of Worms (1521), Martin Luther was asked to recant his writings. He replied: 'Unless I am convicted by Scripture and plain reason — I do not accept the authority of popes and councils, for they have contradicted each other — my conscience is captive to the Word of God. I cannot and will not recant anything, for to go against conscience is neither right nor safe. Here I stand; I can do no other.' This was Sola Scriptura made flesh.",
  },

  // 14 — The Righteousness We Need
  {
    reference: "Romans 3:23-24",
    text: "For all have sinned, and come short of the glory of God; being justified freely by his grace through the redemption that is in Christ Jesus.",
    book: "Romans", chapter: 3, theme: "Justification",
    context: "The universal diagnosis — 'all have sinned' — cuts through every human distinction of race, class, or religious heritage. The remedy is equally universal in its offer: justification freely by grace. 'Freely' (Greek: dōrean) means without payment, gratis — the believer brings no currency to the transaction. Redemption is the price paid by Christ; justification is the verdict declared for the believing sinner.",
  },

  // 15 — Solus Christus
  {
    reference: "Acts 4:12",
    text: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.",
    book: "Acts", chapter: 4, theme: "Christ Alone",
    context: "Peter's declaration before the Sanhedrin is absolute and exclusive. The Greek 'dei' ('we must') is the language of divine necessity — salvation in Christ is not one option among many but the only provision God has made. This exclusivity is not arrogance but mercy: God has not left humanity without a Savior, but neither has He provided multiple roads.",
    historicalNote: "The Reformation slogan 'Solus Christus' — Christ Alone — was articulated against the medieval Catholic system of merit through saints, Mary, and priestly sacraments as channels of grace alongside Christ. Zwingli championed this at the First Zurich Disputation (1523), and it was formalized in confessions from the Heidelberg Catechism to the Westminster Standards.",
  },

  // 16 — God's Sovereignty Over All
  {
    reference: "Isaiah 46:9-10",
    text: "Remember the former things of old: for I am God, and there is none else; I am God, and there is none like me, declaring the end from the beginning, and from ancient times the things that are not yet done, saying, My counsel shall stand, and I will do all my pleasure.",
    book: "Isaiah", chapter: 46, theme: "Sovereignty",
    context: "God claims absolute uniqueness by virtue of his exhaustive foreknowledge — not merely foreseeing the future but declaring it from the beginning because He has ordained it. 'My counsel shall stand' is the language of decree, not prediction. This is the theological foundation for Reformed confidence: history is not spinning out of control but unfolding according to a plan that cannot be thwarted.",
  },

  // 17 — Union with Christ
  {
    reference: "Galatians 2:20",
    text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
    book: "Galatians", chapter: 2, theme: "Union with Christ",
    context: "Paul describes the believer's identity as fundamentally changed by union with Christ — not merely forgiven but co-crucified and co-raised. The Christian life is not imitation of Christ from the outside but participation in Christ from the inside. The phrase 'faith of the Son of God' speaks to the faithful faithfulness of Christ himself — the one who loved Paul and gave himself, whose own faith and obedience secured what Paul now enjoys.",
  },

  // 18 — Substitutionary Atonement
  {
    reference: "Isaiah 53:5-6",
    text: "But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed. All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.",
    book: "Isaiah", chapter: 53, theme: "Atonement",
    context: "Isaiah prophesies the substitutionary heart of the atonement seven centuries before the cross: the Servant bears punishment not for his own sin but for 'our' transgressions. The legal exchange is explicit — our iniquity laid upon him, his peace and healing transferred to us. This is the great imputation: God treating the innocent one as guilty so he can treat the guilty as innocent.",
    historicalNote: "Anselm of Canterbury's 'Cur Deus Homo' (1098) argued from Isaiah 53 that God's justice required a satisfaction that only a sinless God-man could provide. This satisfaction theory of atonement, refined by the Reformers into penal substitution, became the confessional position of Reformed churches and is defended in documents from the Heidelberg Catechism (Q&A 12-17) to the Westminster Confession (Chapter 8).",
  },

  // 19 — Providence and Trust
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, a very present help in trouble.",
    book: "Psalms", chapter: 46, theme: "Providence",
    context: "The Psalmist grounds confidence not in circumstances but in the character of God — a refuge available and powerful when everything else shakes. The phrase 'very present' translates a Hebrew idiom meaning 'abundantly available' or 'proved to be near.' This is not abstract theology but covenant certainty: the God who has shown himself faithful throughout Israel's history is the same God who is near in present trouble.",
    historicalNote: "Luther wrote 'A Mighty Fortress Is Our God' (Ein feste Burg) based on Psalm 46, likely during the Diet of Augsburg (1530) when the Reformed cause seemed overwhelmed by imperial opposition. The hymn became the anthem of the Reformation, expressing the conviction that God's sovereignty — not political power — is the ultimate stronghold. It remains one of the most sung hymns in Protestant history.",
  },

  // 20 — The New Birth
  {
    reference: "Ezekiel 36:26",
    text: "A new heart also will I give you, and a new spirit will I put within you: and I will take away the stony heart out of your flesh, and I will give you an heart of flesh.",
    book: "Ezekiel", chapter: 36, theme: "Regeneration",
    context: "God speaks entirely in first person — 'I will give,' 'I will take away,' 'I will put.' The new heart is not cultivated by the sinner but implanted by God in an act of sovereign regeneration. Reformed theology insists regeneration precedes and produces faith: a heart of stone cannot choose God, so God must first remove it. This is the New Covenant fulfillment of what the Law demanded but could not produce.",
    historicalNote: "Augustine used this passage against Pelagius, arguing that if God gives the heart, then no sinner can claim credit for the first step toward God. This principle — that grace is not merely assistive but transformative and effectual — was the hinge of the Augustinian-Pelagian controversy (early 5th century) and reappears at the center of every subsequent debate about free will and grace, from Dort to modern evangelical Calvinism.",
  },

  // 21 — Eternal Life
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    book: "John", chapter: 3, theme: "Gospel",
    context: "The love of God here is expressed in the giving of the Son — not a sentiment but a costly act. Reformed theology reads this within John's larger Gospel, where Jesus also teaches that no one can come to him unless the Father draws them (6:44), and that the faith by which one believes is itself a gift (Acts 18:27; Phil 1:29). The promise is genuine: all who believe receive eternal life. The Reformed question is how that faith comes to be — and Scripture's answer is: by grace.",
  },

  // 22 — Perseverance of the Saints
  {
    reference: "Romans 8:38-39",
    text: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
    book: "Romans", chapter: 8, theme: "Perseverance",
    context: "Paul's confidence is not in his own grip on God but in God's grip on him — nothing in the created order can sever the love that is 'in Christ Jesus our Lord.' The perseverance of the saints is not the doctrine that believers will never struggle or doubt, but that God's covenant love will never release those He has justified and will certainly glorify them (8:30). The chain holds because God holds it.",
    historicalNote: "The Fifth Canon of Dort (1619) — 'Perseverance of the Saints' — was framed directly from Romans 8 and was the most pastoral of the Five Canons. It distinguished between temporary assurance lapses and final apostasy, declaring that the elect can never be totally or finally lost from grace. The Westminster Confession (Chapter 17) affirms the same, citing God's unchangeable love as the sole ground of security.",
  },

  // 23 — Sovereign Mercy
  {
    reference: "Romans 9:15-16",
    text: "For he saith to Moses, I will have mercy on whom I will have mercy, and I will have compassion on whom I will have compassion. So then it is not of him that willeth, nor of him that runneth, but of God that sheweth mercy.",
    book: "Romans", chapter: 9, theme: "Election",
    context: "Paul quotes Exodus 33:19 to demonstrate that mercy is always and only God's sovereign prerogative — never owed, never compelled, never dependent on human willing or effort. 'Not of him that willeth, nor of him that runneth' sweeps away every form of human contribution to the act of divine mercy. This is not arbitrary cruelty but the freedom of a God who owes no one salvation and yet chooses to bestow it.",
    historicalNote: "This passage was the centerpiece of Augustine's anti-Pelagian treatises, where he argued that predestination is grounded in God's will alone, not in foreseen human response. Calvin commented extensively on Romans 9, and the Synod of Dort placed this text at the heart of Article 1 on Unconditional Election. Jonathan Edwards drew on Romans 9 in 'Freedom of the Will' (1754) to argue that true freedom is the freedom of a transformed nature, not libertarian indeterminacy.",
  },

  // 24 — Purchased Redemption
  {
    reference: "Titus 3:4-5",
    text: "But after that the kindness and love of God our Saviour toward man appeared, not by works of righteousness which we have done, but according to his mercy he saved us, by the washing of regeneration, and renewing of the Holy Ghost.",
    book: "Titus", chapter: 3, theme: "Grace",
    context: "Paul provides the reason for our salvation — 'not by works of righteousness which we have done' — and the means — 'according to his mercy.' The 'washing of regeneration' is the inward cleansing by the Spirit, not merely the external rite of baptism. This passage encapsulates the three Persons of the Trinity united in the single act of saving the sinner: the Father's mercy, the Son's appearing, the Spirit's renewal.",
  },

  // 25 — God's Initiating Love
  {
    reference: "1 John 4:10",
    text: "Herein is love, not that we loved God, but that he loved us, and sent his Son to be the propitiation for our sins.",
    book: "1 John", chapter: 4, theme: "Love",
    context: "John locates the defining act of love not in human response but in divine initiative — 'not that we loved God, but that he loved us.' This is the grammar of grace: God acts first, completely reversing any notion that human love for God triggered His response. The word 'propitiation' is important — Christ did not merely demonstrate love, He satisfied God's righteous wrath against sin, making peace possible.",
  },

  // 26 — Scripture's Sufficiency
  {
    reference: "Deuteronomy 29:29",
    text: "The secret things belong unto the LORD our God: but those things which are revealed belong unto us and to our children for ever, that we may do all the words of this law.",
    book: "Deuteronomy", chapter: 29, theme: "Scripture",
    context: "God's revelation is sufficient for what He intends — the 'revealed things' are given for obedience, for life, for godliness. The 'secret things' He has not chosen to disclose, and Reformed theology is content with this boundary: we need not know what God has not told us. The Sola Scriptura principle rests on this confidence — Scripture is sufficient for faith and life, and we need not reach beyond it.",
  },

  // 27 — Forgiveness and Mercy
  {
    reference: "Psalm 103:12",
    text: "As far as the east is from the west, so far hath he removed our transgressions from us.",
    book: "Psalms", chapter: 103, theme: "Forgiveness",
    context: "The Psalmist uses an infinite spatial metaphor — east and west never converge — to describe the absolute removal of sin in justification. This is not merely forgiveness as pardon but as removal: God does not suppress our record, He removes it. The ground of this confidence is not the believer's improvement but God's covenant mercy to those who fear Him (v.11), grounded in what Christ would do in taking those sins to the cross.",
  },

  // 28 — Christ Our Righteousness
  {
    reference: "1 Corinthians 1:30-31",
    text: "But of him are ye in Christ Jesus, who of God is made unto us wisdom, and righteousness, and sanctification, and redemption: that, according as it is written, He that glorieth, let him glory in the Lord.",
    book: "1 Corinthians", chapter: 1, theme: "Union with Christ",
    context: "Christ is not merely the means to our righteousness — He is our righteousness. Every spiritual possession the believer has — wisdom, righteousness, sanctification, redemption — is 'in Christ Jesus,' found in union with Him rather than developed independently. The deliberate elimination of human boasting is the proof of grace: if our righteousness came from us, we could glory in ourselves. Since it comes from Him, all glory belongs to Him.",
    historicalNote: "This verse was cited by the Reformers to refute the medieval concept of infused righteousness (righteousness that grows within us through sacraments and cooperation). Luther insisted on imputed righteousness — an alien righteousness credited to us from outside ourselves. The Formula of Concord (1577) and Westminster Confession (Chapter 11) distinguish imputation from infusion as the Reformed and Lutheran alternative to Rome.",
  },

  // 29 — Trust Over Understanding
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    book: "Proverbs", chapter: 3, theme: "Providence",
    context: "The command is comprehensive — 'with all thine heart' and 'in all thy ways' — leaving no compartment of life exempt from dependence on God. 'Lean not unto thine own understanding' is not anti-intellectual but anti-autonomous: it calls us to submit our reasoning to divine revelation rather than treating our own judgment as the final authority. The promise that God will 'direct thy paths' is the covenant assurance that sovereign wisdom accompanies those who walk in humble dependence.",
  },

  // 30 — New Every Morning
  {
    reference: "Lamentations 3:22-23",
    text: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
    book: "Lamentations", chapter: 3, theme: "Faithfulness",
    context: "Written in the ruins of Jerusalem, this is one of the most extraordinary affirmations of faith in all of Scripture. Jeremiah's lament turns on these verses: the very destruction he witnesses becomes the canvas against which God's daily mercies are visible. 'Not consumed' is the baseline — every breath is evidence of undeserved mercy. The inexhaustible daily renewal of God's compassion is the ground of morning-by-morning hope even when outward circumstances give none.",
    historicalNote: "Thomas Chalmers preached on this text after the Disruption of 1843, when 474 ministers left the Church of Scotland to form the Free Church of Scotland, forfeiting their manses, salaries, and livelihood. His point was that even in institutional collapse and personal loss, God's mercies are fresh each morning — a conviction that sustained the Disruption men as they rebuilt churches, schools, and colleges from nothing within a generation.",
  },
];

/** Returns today's verse, rotating daily through all 30 verses. */
export function getTodayVerse(): DailyVerse {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
    (1000 * 60 * 60 * 24)
  );
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
