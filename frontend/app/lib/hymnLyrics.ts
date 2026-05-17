// ─── Hymn Lyrics ─────────────────────────────────────────────────────────────
// All hymns are pre-1923 and fully public domain.

export interface HymnEntry {
  title: string;
  author: string;
  year: number;
  verses: string[];
  chorus?: string;
}

export const HYMN_LYRICS: Record<string, HymnEntry> = {
  "a mighty fortress is our god": {
    title: "A Mighty Fortress Is Our God",
    author: "Martin Luther",
    year: 1529,
    verses: [
      "A mighty fortress is our God,\na bulwark never failing;\nour helper he amid the flood\nof mortal ills prevailing.\nFor still our ancient foe\ndoth seek to work us woe;\nhis craft and power are great,\nand armed with cruel hate,\non earth is not his equal.",
      "Did we in our own strength confide,\nour striving would be losing,\nwere not the right Man on our side,\nthe Man of God's own choosing.\nDost ask who that may be?\nChrist Jesus, it is he;\nLord Sabaoth, his name,\nfrom age to age the same,\nand he must win the battle.",
      "And though this world, with devils filled,\nshould threaten to undo us,\nwe will not fear, for God hath willed\nhis truth to triumph through us.\nThe prince of darkness grim,\nwe tremble not for him;\nhis rage we can endure,\nfor lo, his doom is sure;\none little word shall fell him.",
      "That word above all earthly powers,\nno thanks to them, abideth;\nthe Spirit and the gifts are ours\nthrough him who with us sideth.\nLet goods and kindred go,\nthis mortal life also;\nthe body they may kill:\nGod's truth abideth still;\nhis kingdom is forever.",
    ],
  },

  "amazing grace": {
    title: "Amazing Grace",
    author: "John Newton",
    year: 1779,
    verses: [
      "Amazing grace! how sweet the sound,\nthat saved a wretch like me!\nI once was lost, but now am found,\nwas blind, but now I see.",
      "'Twas grace that taught my heart to fear,\nand grace my fears relieved;\nhow precious did that grace appear\nthe hour I first believed!",
      "Through many dangers, toils, and snares,\nI have already come;\n'tis grace hath brought me safe thus far,\nand grace will lead me home.",
      "The Lord has promised good to me,\nhis word my hope secures;\nhe will my shield and portion be,\nas long as life endures.",
      "When we've been there ten thousand years,\nbright shining as the sun,\nwe've no less days to sing God's praise\nthan when we'd first begun.",
    ],
  },

  "come thou fount of every blessing": {
    title: "Come Thou Fount of Every Blessing",
    author: "Robert Robinson",
    year: 1758,
    verses: [
      "Come, thou Fount of every blessing,\ntune my heart to sing thy grace;\nstreams of mercy, never ceasing,\ncall for songs of loudest praise.\nTeach me some melodious sonnet,\nsung by flaming tongues above;\npraise the mount! I'm fixed upon it,\nMount of thy redeeming love.",
      "Here I raise mine Ebenezer;\nhither by thy help I'm come;\nand I hope, by thy good pleasure,\nsafely to arrive at home.\nJesus sought me when a stranger,\nwandering from the fold of God;\nhe, to rescue me from danger,\ninterposed his precious blood.",
      "O to grace how great a debtor\ndaily I'm constrained to be!\nLet thy goodness, like a fetter,\nbind my wandering heart to thee.\nProne to wander, Lord, I feel it,\nprone to leave the God I love;\nhere's my heart, O take and seal it,\nseal it for thy courts above.",
    ],
  },

  "when i survey the wondrous cross": {
    title: "When I Survey the Wondrous Cross",
    author: "Isaac Watts",
    year: 1707,
    verses: [
      "When I survey the wondrous cross\non which the Prince of glory died,\nmy richest gain I count but loss,\nand pour contempt on all my pride.",
      "Forbid it, Lord, that I should boast,\nsave in the death of Christ my God;\nall the vain things that charm me most,\nI sacrifice them to his blood.",
      "See, from his head, his hands, his feet,\nsorrow and love flow mingled down;\ndid e'er such love and sorrow meet,\nor thorns compose so rich a crown?",
      "Were the whole realm of nature mine,\nthat were an offering far too small;\nlove so amazing, so divine,\ndemands my soul, my life, my all.",
    ],
  },

  "abide with me": {
    title: "Abide with Me",
    author: "Henry F. Lyte",
    year: 1847,
    verses: [
      "Abide with me; fast falls the eventide;\nthe darkness deepens; Lord with me abide!\nWhen other helpers fail and comforts flee,\nHelp of the helpless, O abide with me.",
      "Swift to its close ebbs out life's little day;\nEarth's joys grow dim; its glories pass away;\nChange and decay in all around I see;\nO thou who changest not, abide with me.",
      "I need thy presence every passing hour;\nwhat but thy grace can foil the tempter's power?\nWho, like thyself, my guide and stay can be?\nThrough cloud and sunshine, Lord, abide with me.",
      "I fear no foe, with thee at hand to bless;\nills have no weight, and tears no bitterness;\nwhere is death's sting? where, grave, thy victory?\nI triumph still, if thou abide with me.",
      "Hold thou thy cross before my closing eyes;\nshine through the gloom and point me to the skies;\nheaven's morning breaks, and earth's vain shadows flee;\nin life, in death, O Lord, abide with me.",
    ],
  },

  "be thou my vision": {
    title: "Be Thou My Vision",
    author: "Ancient Irish",
    year: 700,
    verses: [
      "Be thou my vision, O Lord of my heart;\nnought be all else to me, save that thou art.\nThou my best thought, by day or by night,\nwaking or sleeping, thy presence my light.",
      "Be thou my wisdom, and thou my true word;\nI ever with thee and thou with me, Lord;\nthou my great Father, I thy true son;\nthou in me dwelling, and I with thee one.",
      "Riches I heed not, nor man's empty praise,\nthou mine inheritance, now and always;\nthou and thou only, first in my heart,\nHigh King of heaven, my treasure thou art.",
      "High King of heaven, my victory won,\nmay I reach heaven's joys, O bright heaven's Sun!\nHeart of my own heart, whatever befall,\nstill be my vision, O Ruler of all.",
    ],
  },

  "holy holy holy": {
    title: "Holy Holy Holy",
    author: "Reginald Heber",
    year: 1826,
    verses: [
      "Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to thee;\nholy, holy, holy! merciful and mighty!\nGod in three persons, blessed Trinity!",
      "Holy, holy, holy! all the saints adore thee,\ncasting down their golden crowns around the glassy sea;\ncherubim and seraphim falling down before thee,\nwho wert, and art, and evermore shalt be.",
      "Holy, holy, holy! though the darkness hide thee,\nthough the eye of sinful man thy glory may not see;\nonly thou art holy; there is none beside thee,\nperfect in power, in love, and purity.",
      "Holy, holy, holy! Lord God Almighty!\nAll thy works shall praise thy name, in earth, and sky, and sea;\nholy, holy, holy! merciful and mighty!\nGod in three persons, blessed Trinity!",
    ],
  },

  "it is well with my soul": {
    title: "It Is Well with My Soul",
    author: "Horatio Spafford",
    year: 1873,
    verses: [
      "When peace, like a river, attendeth my way,\nwhen sorrows like sea billows roll;\nwhatever my lot, thou hast taught me to say,\nit is well, it is well with my soul.",
      "Though Satan should buffet, though trials should come,\nlet this blest assurance control,\nthat Christ hath regarded my helpless estate,\nand hath shed his own blood for my soul.",
      "My sin — oh, the bliss of this glorious thought! —\nmy sin, not in part but the whole,\nis nailed to the cross, and I bear it no more,\npraise the Lord, praise the Lord, O my soul!",
      "And, Lord, haste the day when my faith shall be sight,\nthe clouds be rolled back as a scroll;\nthe trump shall resound, and the Lord shall descend,\neven so, it is well with my soul.",
    ],
    chorus: "It is well with my soul,\nit is well, it is well with my soul.",
  },

  "to god be the glory": {
    title: "To God Be the Glory",
    author: "Fanny Crosby",
    year: 1875,
    verses: [
      "To God be the glory, great things he hath done!\nSo loved he the world that he gave us his Son,\nwho yielded his life an atonement for sin,\nand opened the life gate that all may go in.",
      "O perfect redemption, the purchase of blood,\nto every believer the promise of God;\nthe vilest offender who truly believes,\nthat moment from Jesus a pardon receives.",
      "Great things he hath taught us, great things he hath done,\nand great our rejoicing through Jesus the Son;\nbut purer, and higher, and greater will be\nour wonder, our transport, when Jesus we see.",
    ],
    chorus: "Praise the Lord, praise the Lord,\nlet the earth hear his voice!\nPraise the Lord, praise the Lord,\nlet the people rejoice!\nO come to the Father, through Jesus the Son,\nand give him the glory, great things he hath done!",
  },

  "crown him with many crowns": {
    title: "Crown Him with Many Crowns",
    author: "Matthew Bridges",
    year: 1851,
    verses: [
      "Crown him with many crowns,\nthe Lamb upon his throne;\nhark! how the heavenly anthem drowns\nall music but its own!\nAwake, my soul, and sing\nof him who died for thee,\nand hail him as thy matchless King\nthrough all eternity.",
      "Crown him the Lord of love;\nbehold his hands and side,\nrich wounds, yet visible above,\nin beauty glorified;\nno angel in the sky\ncan fully bear that sight,\nbut downward bends his burning eye\nat mysteries so bright.",
      "Crown him the Lord of life,\nwho triumphed o'er the grave,\nand rose victorious in the strife\nfor those he came to save;\nhis glories now we sing,\nwho died and rose on high,\nwho died eternal life to bring,\nand lives that death may die.",
      "Crown him the Lord of heaven,\none with the Father known,\none with the Spirit through him given\nfrom yonder glorious throne;\nto thee be endless praise,\nfor thou for us hast died;\nbe thou, O Lord, through endless days\nadored and magnified.",
    ],
  },

  "jesus shall reign": {
    title: "Jesus Shall Reign",
    author: "Isaac Watts",
    year: 1719,
    verses: [
      "Jesus shall reign where'er the sun\ndoes his successive journeys run;\nhis kingdom stretch from shore to shore,\ntill moons shall wax and wane no more.",
      "To him shall endless prayer be made,\nand endless praises crown his head;\nhis name like sweet perfume shall rise\nwith every morning sacrifice.",
      "People and realms of every tongue\ndwell on his love with sweetest song,\nand infant voices shall proclaim\ntheir early blessings on his name.",
      "Let every creature rise and bring\npeculiar honors to our King;\nangels descend with songs again,\nand earth repeat the loud amen!",
    ],
  },

  "o sacred head now wounded": {
    title: "O Sacred Head Now Wounded",
    author: "Paul Gerhardt",
    year: 1656,
    verses: [
      "O sacred Head, now wounded,\nwith grief and shame weighed down,\nnow scornfully surrounded\nwith thorns, thine only crown;\nO sacred Head, what glory,\nwhat bliss till now was thine!\nYet, though despised and gory,\nI joy to call thee mine.",
      "What thou, my Lord, hast suffered,\nwas all for sinners' gain;\nmine, mine was the transgression,\nbut thine the deadly pain.\nLo, here I fall, my Savior!\n'Tis I deserve thy place;\nlook on me with thy favor,\nvouchsafe to me thy grace.",
      "What language shall I borrow\nto thank thee, dearest friend,\nfor this thy dying sorrow,\nthy pity without end?\nO make me thine forever;\nand should I fainting be,\nLord, let me never, never\noutlive my love to thee.",
    ],
  },

  "guide me o thou great jehovah": {
    title: "Guide Me O Thou Great Jehovah",
    author: "William Williams",
    year: 1745,
    verses: [
      "Guide me, O thou great Jehovah,\npilgrim through this barren land;\nI am weak, but thou art mighty;\nhold me with thy powerful hand;\nbread of heaven, bread of heaven,\nfeed me till I want no more;\nfeed me till I want no more.",
      "Open now the crystal fountain,\nwhence the healing stream doth flow;\nlet the fire and cloudy pillar\nlead me all my journey through;\nstrong deliverer, strong deliverer,\nbe thou still my strength and shield;\nbe thou still my strength and shield.",
      "When I tread the verge of Jordan,\nbid my anxious fears subside;\ndeath of death and hell's Destruction,\nland me safe on Canaan's side;\nsongs of praises, songs of praises,\nI will ever give to thee;\nI will ever give to thee.",
    ],
  },

  "how firm a foundation": {
    title: "How Firm a Foundation",
    author: "John Rippon",
    year: 1787,
    verses: [
      "How firm a foundation, ye saints of the Lord,\nis laid for your faith in his excellent word!\nWhat more can he say than to you he hath said,\nto you who for refuge to Jesus have fled?",
      "Fear not, I am with thee, O be not dismayed,\nfor I am thy God, and will still give thee aid;\nI'll strengthen thee, help thee, and cause thee to stand,\nupheld by my righteous, omnipotent hand.",
      "When through the deep waters I call thee to go,\nthe rivers of woe shall not thee overflow;\nfor I will be with thee, thy troubles to bless,\nand sanctify to thee thy deepest distress.",
      "The soul that on Jesus hath leaned for repose,\nI will not, I will not desert to his foes;\nthat soul, though all hell should endeavor to shake,\nI'll never, no never, no never forsake.",
    ],
  },

  "and can it be": {
    title: "And Can It Be",
    author: "Charles Wesley",
    year: 1738,
    verses: [
      "And can it be that I should gain\nan interest in the Savior's blood?\nDied he for me, who caused his pain?\nFor me, who him to death pursued?\nAmazing love! how can it be\nthat thou, my God, shouldst die for me?",
      "He left his Father's throne above,\nso free, so infinite his grace;\nemptied himself of all but love,\nand bled for Adam's helpless race.\n'Tis mercy all, immense and free;\nfor, O my God, it found out me.",
      "Long my imprisoned spirit lay\nfast bound in sin and nature's night;\nthine eye diffused a quickening ray;\nI woke, the dungeon flamed with light;\nmy chains fell off, my heart was free;\nI rose, went forth, and followed thee.",
      "No condemnation now I dread;\nJesus, and all in him, is mine!\nAlive in him, my living Head,\nand clothed in righteousness divine,\nbold I approach the eternal throne,\nand claim the crown, through Christ my own.",
    ],
    chorus: "Amazing love! how can it be\nthat thou, my God, shouldst die for me?",
  },
};

export function getHymnLyrics(title: string): HymnEntry | null {
  const key = title.toLowerCase().trim();
  return HYMN_LYRICS[key] ?? null;
}
