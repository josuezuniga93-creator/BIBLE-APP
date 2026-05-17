// ─── Family Worship Data ──────────────────────────────────────────────────────
// All content is public domain or original. No external APIs required.

export interface FamilyWorshipDay {
  id: string;                    // "mon" | "tue" | etc.
  day: string;                   // "Monday"
  theme: string;                 // "The Character of God"
  scripture: FWScripture;
  catechism: FWCatechism;
  discussion: string[];          // 3–4 questions for all ages
  prayer: FWPrayer;
  hymn: FWHymn;
}

export interface FWScripture {
  reference: string;             // "Psalm 23:1–6"
  translation: string;           // "KJV"
  text: string;
}

export interface FWCatechism {
  source: string;                // "Westminster Shorter Catechism"
  qNumber: number;
  question: string;
  answer: string;
  memory: string;                // the key phrase to memorize
}

export interface FWPrayer {
  opening: string;               // A short written prayer / prompt
  petitions: string[];           // 3–4 guided petition areas
  closing: string;               // A brief doxological close
}

export interface FWHymn {
  title: string;
  author: string;
  year: number;
  verses: string[];              // Each string = one verse
  tune?: string;
}

// ─── Seven Days of Family Worship ─────────────────────────────────────────────

export const FAMILY_WORSHIP_WEEK: FamilyWorshipDay[] = [
  // ── MONDAY ──────────────────────────────────────────────────────────────────
  {
    id: "mon",
    day: "Monday",
    theme: "The Majesty of God",
    scripture: {
      reference: "Isaiah 40:25–31",
      translation: "KJV",
      text: `To whom then will ye liken me, or shall I be equal? saith the Holy One. Lift up your eyes on high, and behold who hath created these things, that bringeth out their host by number: he calleth them all by names by the greatness of his might, for that he is strong in power; not one faileth.

Why sayest thou, O Jacob, and speakest, O Israel, My way is hid from the LORD, and my judgment is passed over from my God?

Hast thou not known? hast thou not heard, that the everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is weary? there is no searching of his understanding.

He giveth power to the faint; and to them that have no might he increaseth strength. Even the youths shall faint and be weary, and the young men shall utterly fall: But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.`,
    },
    catechism: {
      source: "Westminster Shorter Catechism",
      qNumber: 4,
      question: "What is God?",
      answer:
        "God is a Spirit, infinite, eternal, and unchangeable, in his being, wisdom, power, holiness, justice, goodness, and truth.",
      memory: "God is infinite, eternal, and unchangeable.",
    },
    discussion: [
      "Isaiah says God calls every star by name. What does that tell us about how well God knows each of us?",
      "Have you ever felt like God forgot about you? What does this passage say to that feeling?",
      "What does it mean to 'wait upon the LORD'? How can our family do that this week?",
      "Name one thing about God's greatness that makes you want to worship him.",
    ],
    prayer: {
      opening:
        "Almighty Father, you hold the stars in place and you know our names. We come before your majesty with humble hearts, grateful that so great a God stoops to hear our prayers.",
      petitions: [
        "Praise God for one of his attributes you discussed tonight",
        "Pray for someone in your family or church who is weary and needs renewed strength",
        "Ask God to help your family trust him when life feels uncertain",
        "Thank God for the gift of his Word that reveals who he is",
      ],
      closing:
        "To you alone, Father, Son, and Holy Spirit, be all glory, honor, and praise, now and forever. Amen.",
    },
    hymn: {
      title: "O Worship the King",
      author: "Robert Grant",
      year: 1833,
      tune: "HANOVER",
      verses: [
        `O worship the King, all glorious above,\nO gratefully sing his power and his love;\nOur Shield and Defender, the Ancient of Days,\nPavilioned in splendor, and girded with praise.`,
        `O tell of his might, O sing of his grace,\nWhose robe is the light, whose canopy space;\nHis chariots of wrath the deep thunderclouds form,\nAnd dark is his path on the wings of the storm.`,
        `Thy bountiful care, what tongue can recite?\nIt breathes in the air, it shines in the light;\nIt streams from the hills, it descends to the plain,\nAnd sweetly distills in the dew and the rain.`,
        `Frail children of dust, and feeble as frail,\nIn thee do we trust, nor find thee to fail;\nThy mercies how tender, how firm to the end,\nOur Maker, Defender, Redeemer, and Friend.`,
      ],
    },
  },

  // ── TUESDAY ──────────────────────────────────────────────────────────────────
  {
    id: "tue",
    day: "Tuesday",
    theme: "The Fall and Our Need",
    scripture: {
      reference: "Romans 3:10–12, 23",
      translation: "KJV",
      text: `As it is written, There is none righteous, no, not one: There is none that understandeth, there is none that seeketh after God. They are all gone out of the way, they are together become unprofitable; there is none that doeth good, no, not one.

For all have sinned, and come short of the glory of God.`,
    },
    catechism: {
      source: "Westminster Shorter Catechism",
      qNumber: 14,
      question: "What is sin?",
      answer: "Sin is any want of conformity unto, or transgression of, the law of God.",
      memory: "Sin is any want of conformity unto, or transgression of, the law of God.",
    },
    discussion: [
      "The Bible says 'none is righteous, not even one.' Does that surprise you? Why or why not?",
      "What does it mean to 'fall short of the glory of God'? What are we supposed to be like?",
      "If no one seeks God on their own, how does anyone come to know God? (Hint: who must start it?)",
      "How does knowing we are sinners make the gospel — God's rescue — more amazing?",
    ],
    prayer: {
      opening:
        "Holy and righteous Father, we confess that we are not what we should be. We have sinned against you in thought, word, and deed. Yet you have not left us without hope.",
      petitions: [
        "Confess specific sins to God together as a family (in age-appropriate ways)",
        "Thank God that he does not leave us in our sin but sent a Savior",
        "Pray for someone you know who does not yet know Christ",
        "Ask God to give your family growing hatred of sin and love for holiness",
      ],
      closing:
        "Lord, have mercy on us sinners, for the sake of Christ Jesus our Savior. Amen.",
    },
    hymn: {
      title: "Rock of Ages",
      author: "Augustus Toplady",
      year: 1776,
      verses: [
        `Rock of Ages, cleft for me,\nLet me hide myself in thee;\nLet the water and the blood,\nFrom thy wounded side which flowed,\nBe of sin the double cure;\nSave from wrath and make me pure.`,
        `Not the labor of my hands\nCan fulfill thy law's demands;\nCould my zeal no respite know,\nCould my tears forever flow,\nAll for sin could not atone;\nThou must save, and thou alone.`,
        `Nothing in my hand I bring,\nSimply to the cross I cling;\nNaked, come to thee for dress;\nHelpless, look to thee for grace;\nFoul, I to the fountain fly;\nWash me, Savior, or I die.`,
        `While I draw this fleeting breath,\nWhen mine eyes shall close in death,\nWhen I soar to worlds unknown,\nSee thee on thy judgment throne,\nRock of Ages, cleft for me,\nLet me hide myself in thee.`,
      ],
    },
  },

  // ── WEDNESDAY ──────────────────────────────────────────────────────────────────
  {
    id: "wed",
    day: "Wednesday",
    theme: "Christ the Savior",
    scripture: {
      reference: "Isaiah 53:4–6",
      translation: "KJV",
      text: `Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted.

But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed.

All we like sheep have gone astray; we have turned every one to his own way; and the LORD hath laid on him the iniquity of us all.`,
    },
    catechism: {
      source: "Westminster Shorter Catechism",
      qNumber: 25,
      question: "How doth Christ execute the office of a priest?",
      answer:
        "Christ executeth the office of a priest, in his once offering up of himself a sacrifice to satisfy divine justice, and reconcile us to God; and in making continual intercession for us.",
      memory: "Christ offered himself as a sacrifice to satisfy divine justice.",
    },
    discussion: [
      "Isaiah was written 700 years before Jesus. What does it mean that he described Christ's suffering so accurately?",
      "What did Jesus carry in our place? What did we deserve that he took on himself?",
      "The catechism says Christ makes 'continual intercession for us.' That means right now, Jesus is praying for you. How does that make you feel?",
      "What is one way you can thank Jesus today for what he did for your family?",
    ],
    prayer: {
      opening:
        "Lord Jesus, you were wounded for our transgressions. You bore what we deserved. We worship you tonight, our great High Priest, who ever lives to pray for us.",
      petitions: [
        "Praise Christ specifically for bearing your sin on the cross",
        "Pray for someone who is suffering and needs to know Christ's comfort",
        "Ask God to deepen your family's love for the cross",
        "Pray for your church's pastor and elders as they shepherd God's people",
      ],
      closing:
        "To him who loved us and washed us from our sins in his own blood — to him be glory and dominion forever and ever. Amen. (Revelation 1:5–6)",
    },
    hymn: {
      title: "Man of Sorrows! What a Name",
      author: "Philip P. Bliss",
      year: 1875,
      verses: [
        `Man of Sorrows! what a name\nFor the Son of God, who came\nRuined sinners to reclaim.\nHallelujah! What a Savior!`,
        `Bearing shame and scoffing rude,\nIn my place condemned he stood;\nSealed my pardon with his blood.\nHallelujah! What a Savior!`,
        `Guilty, vile, and helpless we;\nSpotless Lamb of God was he;\n"Full atonement!" can it be?\nHallelujah! What a Savior!`,
        `Lifted up was he to die,\n"It is finished!" was his cry;\nNow in heaven exalted high.\nHallelujah! What a Savior!`,
        `When he comes, our glorious King,\nAll his ransomed home to bring,\nThen anew his song we'll sing:\nHallelujah! What a Savior!`,
      ],
    },
  },

  // ── THURSDAY ──────────────────────────────────────────────────────────────────
  {
    id: "thu",
    day: "Thursday",
    theme: "The Gift of Faith",
    scripture: {
      reference: "Ephesians 2:1–10",
      translation: "KJV",
      text: `And you hath he quickened, who were dead in trespasses and sins; wherein in time past ye walked according to the course of this world, according to the prince of the power of the air, the spirit that now worketh in the children of disobedience.

But God, who is rich in mercy, for his great love wherewith he loved us, even when we were dead in sins, hath quickened us together with Christ, (by grace ye are saved;) and hath raised us up together, and made us sit together in heavenly places in Christ Jesus.

For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: not of works, lest any man should boast. For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them.`,
    },
    catechism: {
      source: "Westminster Shorter Catechism",
      qNumber: 86,
      question: "What is faith in Jesus Christ?",
      answer:
        "Faith in Jesus Christ is a saving grace, whereby we receive and rest upon him alone for salvation, as he is offered to us in the gospel.",
      memory: "Faith receives and rests upon Christ alone for salvation.",
    },
    discussion: [
      "Ephesians says we were 'dead' in sin before God saved us. Can a dead person help save themselves? What does this teach us about God's role in salvation?",
      "Verse 8 says faith itself is 'the gift of God.' Does that surprise you? What does it mean to receive a gift?",
      "God says we are his 'workmanship,' created for good works. What good work could your family do for someone this week?",
      "How do you know if you have real faith? What does it look like day to day?",
    ],
    prayer: {
      opening:
        "Father, we were dead and you made us alive. We did nothing to deserve your mercy. Every blessing we have — faith, forgiveness, eternal life — is your gift. We worship you tonight.",
      petitions: [
        "Thank God for the specific gift of faith in your family",
        "Pray for any family member who is still in spiritual deadness — that God would give them life",
        "Ask God to show your family one concrete good work to do this week",
        "Pray for the children and youth in your church, that God would grant them saving faith",
      ],
      closing:
        "Not to us, O Lord, not to us, but to your name be the glory, for your steadfast love and faithfulness. Amen. (Psalm 115:1)",
    },
    hymn: {
      title: "And Can It Be",
      author: "Charles Wesley",
      year: 1738,
      verses: [
        `And can it be that I should gain\nAn interest in the Savior's blood?\nDied he for me, who caused his pain—\nFor me, who him to death pursued?\nAmazing love! How can it be,\nThat thou, my God, shouldst die for me?`,
        `He left his Father's throne above\n(So free, so infinite his grace!),\nEmptied himself of all but love,\nAnd bled for Adam's helpless race.\n'Tis mercy all, immense and free,\nFor O my God, it found out me!`,
        `Long my imprisoned spirit lay,\nFast bound in sin and nature's night;\nThine eye diffused a quickening ray;\nI woke, the dungeon flamed with light;\nMy chains fell off, my heart was free,\nI rose, went forth, and followed thee.`,
        `No condemnation now I dread;\nJesus, and all in him, is mine;\nAlive in him, my living Head,\nAnd clothed in righteousness divine,\nBold I approach the eternal throne,\nAnd claim the crown, through Christ my own.`,
      ],
    },
  },

  // ── FRIDAY ──────────────────────────────────────────────────────────────────
  {
    id: "fri",
    day: "Friday",
    theme: "The Church and the Lord's Day",
    scripture: {
      reference: "Hebrews 10:24–25",
      translation: "KJV",
      text: `And let us consider one another to provoke unto love and to good works: not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching.`,
    },
    catechism: {
      source: "Heidelberg Catechism",
      qNumber: 54,
      question: `What do you believe concerning "the holy catholic church"?`,
      answer:
        "I believe that the Son of God through his Spirit and Word, out of the entire human race, from the beginning of the world to its end, gathers, protects, and preserves for himself a community chosen for eternal life and united in true faith. And of this community I am and always will be a living member.",
      memory: "Christ gathers, protects, and preserves his church.",
    },
    discussion: [
      "Why does God want us to gather with other believers? What happens when a family stops going to church?",
      "The passage says to 'provoke' one another to love and good works. How can your family encourage someone at church this week?",
      "The catechism says Christ is building his church 'from the beginning of the world to its end.' How does it feel to be part of something that spans all of history?",
      "What is one thing you love about your local church? What can your family pray for it?",
    ],
    prayer: {
      opening:
        "Lord Jesus, you are building your church and the gates of hell will not prevail against it. Thank you for calling us into your body, for giving us brothers and sisters, and for gathering us around your Word and table.",
      petitions: [
        "Pray for your pastor by name — for wisdom, health, and faithfulness in preaching",
        "Pray for any struggling members of your church that you know of",
        "Ask God to help your family serve and love your church family better",
        "Pray for persecuted Christians around the world who risk everything to gather",
      ],
      closing:
        "Lord, prepare our hearts for worship tomorrow. May we come ready to hear, to sing, and to fellowship with your people. Amen.",
    },
    hymn: {
      title: "The Church's One Foundation",
      author: "Samuel J. Stone",
      year: 1866,
      verses: [
        `The Church's one foundation\nIs Jesus Christ her Lord;\nShe is his new creation\nBy water and the word.\nFrom heaven he came and sought her\nTo be his holy bride;\nWith his own blood he bought her,\nAnd for her life he died.`,
        `Elect from every nation,\nYet one o'er all the earth;\nHer charter of salvation,\nOne Lord, one faith, one birth;\nOne holy Name she blesses,\nPartakes one holy food,\nAnd to one hope she presses,\nWith every grace endued.`,
        `Though with a scornful wonder\nMen see her sore oppressed,\nBy schisms rent asunder,\nBy heresies distressed;\nYet saints their watch are keeping,\nTheir cry goes up, "How long?"\nAnd soon the night of weeping\nShall be the morn of song.`,
        `'Mid toil and tribulation,\nAnd tumult of her war,\nShe waits the consummation\nOf peace forevermore;\nTill, with the vision glorious,\nHer longing eyes are blest,\nAnd the great Church victorious\nShall be the Church at rest.`,
      ],
    },
  },

  // ── SATURDAY ──────────────────────────────────────────────────────────────────
  {
    id: "sat",
    day: "Saturday",
    theme: "Prayer and the Word",
    scripture: {
      reference: "Psalm 119:9–16",
      translation: "KJV",
      text: `Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.

With my whole heart have I sought thee: O let me not wander from thy commandments. Thy word have I hid in mine heart, that I might not sin against thee.

Blessed art thou, O LORD: teach me thy statutes. With my lips have I declared all the judgments of thy mouth. I have rejoiced in the way of thy testimonies, as much as in all riches.

I will meditate in thy precepts, and have respect unto thy ways. I will delight myself in thy statutes: I will not forget thy word.`,
    },
    catechism: {
      source: "Westminster Shorter Catechism",
      qNumber: 88,
      question:
        "What are the outward and ordinary means whereby Christ communicateth to us the benefits of redemption?",
      answer:
        "The outward and ordinary means whereby Christ communicateth to us the benefits of redemption are his ordinances, especially the word, sacraments, and prayer; all which are made effectual to the elect for salvation.",
      memory: "The Word, sacraments, and prayer are the ordinary means of grace.",
    },
    discussion: [
      "The psalmist says 'thy word have I hid in mine heart.' What does it mean to hide God's Word in your heart? How do we do that?",
      "The catechism calls the Word, sacraments, and prayer 'ordinary means of grace.' Why do you think God uses ordinary things to give us extraordinary grace?",
      "Does your family have a regular time to read the Bible together? What gets in the way, and what would help?",
      "Pick one verse from tonight's passage to memorize together as a family.",
    ],
    prayer: {
      opening:
        "Heavenly Father, your Word is a lamp to our feet and a light to our path. Forgive us for the times we neglect it. Tonight we ask you to give us hungry hearts for your truth.",
      petitions: [
        "Ask God to give your family a love for reading Scripture together",
        "Pray for wisdom to prepare your hearts for worship tomorrow",
        "Thank God for the gift of prayer — that you can speak directly to the King of the universe",
        "Pray for families in your church who struggle and need the comfort of God's Word",
      ],
      closing:
        "Your word is truth. Sanctify us in your truth. May it dwell richly in our hearts tonight and all our days. Amen. (John 17:17; Col 3:16)",
    },
    hymn: {
      title: "How Firm a Foundation",
      author: "John Rippon's Selection",
      year: 1787,
      verses: [
        `How firm a foundation, ye saints of the Lord,\nIs laid for your faith in his excellent word!\nWhat more can he say than to you he hath said,\nTo you who for refuge to Jesus have fled?`,
        `"Fear not, I am with thee, O be not dismayed,\nFor I am thy God and will still give thee aid;\nI'll strengthen and help thee, and cause thee to stand\nUpheld by my righteous, omnipotent hand.`,
        `"When through the deep waters I call thee to go,\nThe rivers of woe shall not thee overflow;\nFor I will be with thee, thy troubles to bless,\nAnd sanctify to thee thy deepest distress.`,
        `"When through fiery trials thy pathways shall lie,\nMy grace, all sufficient, shall be thy supply;\nThe flame shall not hurt thee; I only design\nThy dross to consume, and thy gold to refine.`,
        `"The soul that on Jesus hath leaned for repose,\nI will not, I will not desert to his foes;\nThat soul, though all hell should endeavor to shake,\nI'll never, no never, no never forsake!"`,
      ],
    },
  },

  // ── SUNDAY ──────────────────────────────────────────────────────────────────
  {
    id: "sun",
    day: "Sunday",
    theme: "Resurrection and the Hope of Glory",
    scripture: {
      reference: "1 Corinthians 15:20–22, 54–57",
      translation: "KJV",
      text: `But now is Christ risen from the dead, and become the firstfruits of them that slept. For since by man came death, by man came also the resurrection of the dead. For as in Adam all die, even so in Christ shall all be made alive.

So when this corruptible shall have put on incorruption, and this mortal shall have put on immortality, then shall be brought to pass the saying that is written, Death is swallowed up in victory.

O death, where is thy sting? O grave, where is thy victory? The sting of death is sin; and the strength of sin is the law. But thanks be to God, which giveth us the victory through our Lord Jesus Christ.`,
    },
    catechism: {
      source: "Westminster Shorter Catechism",
      qNumber: 38,
      question: "What benefits do believers receive from Christ at the resurrection?",
      answer:
        "At the resurrection, believers being raised up in glory, shall be openly acknowledged and acquitted in the day of judgment, and made perfectly blessed in the full enjoying of God to all eternity.",
      memory: "Believers will be made perfectly blessed in the full enjoying of God to all eternity.",
    },
    discussion: [
      "Paul calls Christ's resurrection the 'firstfruits.' What does that mean for those who trust in him?",
      "Death is called an 'enemy' — but one that has been defeated. How should that change the way we think about death?",
      "The catechism says we will be 'perfectly blessed in the full enjoying of God.' What do you think that will be like?",
      "How does the promise of resurrection give your family hope right now, today, in the midst of real struggles?",
    ],
    prayer: {
      opening:
        "Risen Lord Jesus, you are alive! Death could not hold you. And because you live, we shall live also. We worship you tonight — the firstfruits, our forerunner, our resurrection and our life.",
      petitions: [
        "Praise Christ for his resurrection and what it means for your family's future",
        "Pray for any family members grieving a loss — remind them of the resurrection hope",
        "Thank God for the worship you experienced today and ask him to seal it in your hearts",
        "Ask God to help your family live in the light of eternity — to hold earthly things loosely",
      ],
      closing:
        "Thanks be to God who gives us the victory through our Lord Jesus Christ. To him be glory in the church and in Christ Jesus throughout all generations, forever and ever. Amen.",
    },
    hymn: {
      title: "Crown Him with Many Crowns",
      author: "Matthew Bridges & Godfrey Thring",
      year: 1851,
      verses: [
        `Crown him with many crowns,\nThe Lamb upon his throne.\nHark! How the heavenly anthem drowns\nAll music but its own.\nAwake, my soul, and sing\nOf him who died for thee,\nAnd hail him as thy matchless King\nThrough all eternity.`,
        `Crown him the Lord of life,\nWho triumphed o'er the grave,\nAnd rose victorious in the strife\nFor those he came to save.\nHis glories now we sing,\nWho died, and rose on high,\nWho died eternal life to bring,\nAnd lives that death may die.`,
        `Crown him the Lord of love;\nBehold his hands and side,\nRich wounds, yet visible above,\nIn beauty glorified.\nNo angel in the sky\nCan fully bear that sight,\nBut downward bends his burning eye\nAt mysteries so bright.`,
        `Crown him the Lord of years,\nThe Potentate of time,\nCreator of the rolling spheres,\nIneffably sublime.\nAll hail, Redeemer, hail!\nFor thou hast died for me;\nThy praise and glory shall not fail\nThroughout eternity.`,
      ],
    },
  },
];

// ─── Helper: get today's worship day ─────────────────────────────────────────

export function getTodayId(): string {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date().getDay()];
}

export function getTodayWorship(): FamilyWorshipDay {
  const id = getTodayId();
  return FAMILY_WORSHIP_WEEK.find((d) => d.id === id) ?? FAMILY_WORSHIP_WEEK[0];
}
