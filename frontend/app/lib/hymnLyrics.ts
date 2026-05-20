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

  "rock of ages": {
    title: "Rock of Ages",
    author: "Augustus Toplady",
    year: 1776,
    verses: [
      "Rock of Ages, cleft for me,\nlet me hide myself in thee;\nlet the water and the blood,\nfrom thy wounded side which flowed,\nbe of sin the double cure;\nsave from wrath and make me pure.",
      "Not the labors of my hands\ncan fulfill thy law's demands;\ncould my zeal no respite know,\ncould my tears forever flow,\nall for sin could not atone;\nthou must save, and thou alone.",
      "Nothing in my hand I bring,\nsimply to the cross I cling;\nnaked, come to thee for dress;\nhelpless, look to thee for grace;\nfoul, I to the fountain fly;\nwash me, Savior, or I die.",
      "While I draw this fleeting breath,\nwhen mine eyes shall close in death,\nwhen I soar to worlds unknown,\nsee thee on thy judgment throne,\nRock of Ages, cleft for me,\nlet me hide myself in thee.",
    ],
  },

  "o god our help in ages past": {
    title: "O God Our Help in Ages Past",
    author: "Isaac Watts",
    year: 1719,
    verses: [
      "O God, our help in ages past,\nour hope for years to come,\nour shelter from the stormy blast,\nand our eternal home!",
      "Under the shadow of thy throne\nstill may we dwell secure;\nsufficient is thine arm alone,\nand our defense is sure.",
      "Before the hills in order stood,\nor earth received her frame,\nfrom everlasting thou art God,\nto endless years the same.",
      "A thousand ages in thy sight\nare like an evening gone;\nshort as the watch that ends the night\nbefore the rising sun.",
      "Time, like an ever-rolling stream,\nbears all its sons away;\nthey fly forgotten, as a dream\ndies at the opening day.",
      "O God, our help in ages past,\nour hope for years to come,\nbe thou our guard while troubles last,\nand our eternal home.",
    ],
  },

  "jesus loves me": {
    title: "Jesus Loves Me",
    author: "Anna Bartlett Warner",
    year: 1859,
    verses: [
      "Jesus loves me! this I know,\nfor the Bible tells me so;\nlittle ones to him belong;\nthey are weak, but he is strong.",
      "Jesus loves me! he who died\nheaven's gate to open wide;\nhe will wash away my sin,\nlet his little child come in.",
      "Jesus loves me! he will stay\nclose beside me all the way;\nthou hast bled and died for me,\nI will henceforth live for thee.",
    ],
    chorus: "Yes, Jesus loves me!\nYes, Jesus loves me!\nYes, Jesus loves me!\nThe Bible tells me so.",
  },

  "all glory laud and honor": {
    title: "All Glory Laud and Honor",
    author: "Theodulph of Orleans",
    year: 820,
    verses: [
      "All glory, laud, and honor\nto thee, Redeemer, King,\nto whom the lips of children\nmade sweet hosannas ring!\nThou art the King of Israel,\nthou David's royal Son,\nwho in the Lord's name comest,\nthe King and Blessed One!",
      "The company of angels\nare praising thee on high,\nand mortal men and all things\ncreated make reply.\nThe people of the Hebrews\nwith palms before thee went;\nour praise and prayer and anthems\nbefore thee we present.",
      "To thee before thy passion\nthey sang their hymns of praise;\nto thee now high exalted\nour melody we raise.\nThou didst accept their praises;\naccepted ours also;\nthou good and gracious Monarch,\nto whom all goodness flow.",
    ],
  },

  "breathe on me breath of god": {
    title: "Breathe on Me Breath of God",
    author: "Edwin Hatch",
    year: 1878,
    verses: [
      "Breathe on me, Breath of God,\nfill me with life anew,\nthat I may love what thou dost love,\nand do what thou wouldst do.",
      "Breathe on me, Breath of God,\nuntil my heart is pure,\nuntil with thee I will one will,\nto do and to endure.",
      "Breathe on me, Breath of God,\ntill I am wholly thine,\nuntil this earthly part of me\nglows with thy fire divine.",
      "Breathe on me, Breath of God,\nso shall I never die,\nbut live with thee the perfect life\nof thine eternity.",
    ],
  },

  "jesus thy blood and righteousness": {
    title: "Jesus Thy Blood and Righteousness",
    author: "Nicolaus von Zinzendorf",
    year: 1739,
    verses: [
      "Jesus, thy blood and righteousness\nmy beauty are, my glorious dress;\nmidst flaming worlds, in these arrayed,\nwith joy shall I lift up my head.",
      "Bold shall I stand in thy great day,\nfor who aught to my charge shall lay?\nFully absolved through these I am\nfrom sin and fear, from guilt and shame.",
      "The holy, meek, unspotted Lamb,\nwho from the Father's bosom came,\nwho died for me, e'en me to atone,\nnow for my Lord and God I own.",
      "Lord, I believe thy precious blood,\nwhich at the mercy seat of God\nforever doth for sinners plead,\nfor me, e'en for my soul was shed.",
    ],
  },

  "take my life and let it be": {
    title: "Take My Life and Let It Be",
    author: "Frances Ridley Havergal",
    year: 1874,
    verses: [
      "Take my life, and let it be\nconsecrated, Lord, to thee;\ntake my moments and my days,\nlet them flow in ceaseless praise.",
      "Take my hands, and let them move\nat the impulse of thy love;\ntake my feet, and let them be\nswift and beautiful for thee.",
      "Take my voice, and let me sing\nalways, only, for my King;\ntake my lips, and let them be\nfilled with messages from thee.",
      "Take my will, and make it thine;\nit shall be no longer mine;\ntake my heart, it is thine own;\nit shall be thy royal throne.",
      "Take my love; my Lord, I pour\nat thy feet its treasure-store;\ntake myself, and I will be\never, only, all for thee.",
    ],
  },

  "christ the lord is risen today": {
    title: "Christ the Lord Is Risen Today",
    author: "Charles Wesley",
    year: 1739,
    verses: [
      "Christ the Lord is risen today, Alleluia!\nSons of men and angels say, Alleluia!\nRaise your joys and triumphs high, Alleluia!\nSing, ye heavens, and earth, reply, Alleluia!",
      "Lives again our glorious King, Alleluia!\nWhere, O death, is now thy sting? Alleluia!\nOnce he died our souls to save, Alleluia!\nWhere's thy victory, boasting grave? Alleluia!",
      "Love's redeeming work is done, Alleluia!\nFought the fight, the battle won, Alleluia!\nDeath in vain forbids his rise, Alleluia!\nChrist has opened paradise, Alleluia!",
      "Soar we now where Christ has led, Alleluia!\nFollowing our exalted Head, Alleluia!\nMade like him, like him we rise, Alleluia!\nOurs the cross, the grave, the skies, Alleluia!",
    ],
  },

  "love divine all loves excelling": {
    title: "Love Divine All Loves Excelling",
    author: "Charles Wesley",
    year: 1747,
    verses: [
      "Love divine, all loves excelling,\njoy of heaven, to earth come down,\nfix in us thy humble dwelling,\nall thy faithful mercies crown!\nJesus, thou art all compassion,\npure, unbounded love thou art;\nvisit us with thy salvation,\nenter every trembling heart.",
      "Breathe, O breathe thy loving Spirit\ninto every troubled breast!\nLet us all in thee inherit,\nlet us find that second rest.\nTake away our bent to sinning,\nalpha and omega be;\nend of faith, as its beginning,\nset our hearts at liberty.",
      "Come, Almighty to deliver,\nlet us all thy life receive;\nsuddenly return, and never,\nnevermore thy temples leave.\nThee we would be always blessing,\nserve thee as thy hosts above,\npray, and praise thee without ceasing,\nglory in thy perfect love.",
      "Finish then thy new creation,\npure and spotless let us be;\nlet us see thy great salvation\nperfectly restored in thee:\nchanged from glory into glory,\ntill in heaven we take our place,\ntill we cast our crowns before thee,\nlost in wonder, love, and praise.",
    ],
  },

  "o the deep deep love of jesus": {
    title: "O the Deep Deep Love of Jesus",
    author: "Samuel Trevor Francis",
    year: 1875,
    verses: [
      "O the deep, deep love of Jesus,\nvast, unmeasured, boundless, free!\nRolling as a mighty ocean\nin its fullness over me;\nunderneath me, all around me,\nis the current of thy love;\nleading onward, leading homeward,\nto thy glorious rest above.",
      "O the deep, deep love of Jesus,\nspread his praise from shore to shore!\nHow he loveth, ever loveth,\nchangeth never, nevermore;\nhow he watches o'er his loved ones,\ndied to call them all his own;\nhow for them he intercedeth,\nwatcheth o'er them from the throne.",
      "O the deep, deep love of Jesus,\nlove of every love the best!\n'Tis an ocean vast of blessing,\n'tis a haven sweet of rest.\nO the deep, deep love of Jesus,\n'tis a heaven of heavens to me;\nand it lifts me up to glory,\nfor it lifts me up to thee.",
    ],
  },

  "spirit of god descend upon my heart": {
    title: "Spirit of God Descend upon My Heart",
    author: "George Croly",
    year: 1854,
    verses: [
      "Spirit of God, descend upon my heart;\nwean it from earth, through all its pulses move;\nstoop to my weakness, mighty as thou art,\nand make me love thee as I ought to love.",
      "I ask no dream, no prophet ecstasies,\nno sudden rending of the veil of clay,\nno angel visitant, no opening skies;\nbut take the dimness of my soul away.",
      "Hast thou not bid me love thee, God and King?\nAll, all thine own, soul, heart, and strength, and mind;\nI see thy cross — there teach my heart to cling:\nO let me seek thee, and O let me find!",
      "Teach me to feel that thou art always nigh;\nteach me the struggles of the soul to bear,\nto check the rising doubt, the rebel sigh;\nteach me the patience of unanswered prayer.",
      "Teach me to love thee as thine angels love,\none holy passion filling all my frame;\nthe kindling of the heaven-descended Dove,\nmy heart an altar, and thy love the flame.",
    ],
  },

  "just as i am": {
    title: "Just As I Am",
    author: "Charlotte Elliott",
    year: 1835,
    verses: [
      "Just as I am, without one plea,\nbut that thy blood was shed for me,\nand that thou bidd'st me come to thee,\nO Lamb of God, I come, I come.",
      "Just as I am, and waiting not\nto rid my soul of one dark blot,\nto thee whose blood can cleanse each spot,\nO Lamb of God, I come, I come.",
      "Just as I am, though tossed about\nwith many a conflict, many a doubt,\nfightings and fears within, without,\nO Lamb of God, I come, I come.",
      "Just as I am, poor, wretched, blind;\nsight, riches, healing of the mind,\nyea, all I need, in thee to find,\nO Lamb of God, I come, I come.",
      "Just as I am, thou wilt receive,\nwilt welcome, pardon, cleanse, relieve;\nbecause thy promise I believe,\nO Lamb of God, I come, I come.",
      "Just as I am, thy love unknown\nhath broken every barrier down;\nnow, to be thine, yea, thine alone,\nO Lamb of God, I come, I come.",
    ],
  },

  "lo he comes with clouds descending": {
    title: "Lo He Comes with Clouds Descending",
    author: "Charles Wesley",
    year: 1758,
    verses: [
      "Lo! he comes with clouds descending,\nonce for favored sinners slain;\nthousand thousand saints attending\nswell the triumph of his train:\nHallelujah! hallelujah! hallelujah!\nGod appears on earth to reign.",
      "Every eye shall now behold him,\nrobed in dreadful majesty;\nthose who set at naught and sold him,\npierced and nailed him to the tree,\ndeeply wailing, deeply wailing, deeply wailing,\nshall the true Messiah see.",
      "Those dear tokens of his passion\nstill his dazzling body bears,\ncause of endless exultation\nto his ransomed worshipers:\nwith what rapture, with what rapture, with what rapture\ngaze we on those glorious scars!",
      "Yea, amen! let all adore thee,\nhigh on thine eternal throne;\nSavior, take the power and glory,\nclaim the kingdom for thine own:\nO come quickly! O come quickly! O come quickly!\nEverlasting God, come down!",
    ],
  },

  "my hope is built on nothing less": {
    title: "My Hope Is Built on Nothing Less",
    author: "Edward Mote",
    year: 1834,
    verses: [
      "My hope is built on nothing less\nthan Jesus' blood and righteousness;\nI dare not trust the sweetest frame,\nbut wholly lean on Jesus' name.",
      "When darkness veils his lovely face,\nI rest on his unchanging grace;\nin every high and stormy gale,\nmy anchor holds within the veil.",
      "His oath, his covenant, his blood\nsupport me in the whelming flood;\nwhen all around my soul gives way,\nhe then is all my hope and stay.",
      "When he shall come with trumpet sound,\nO may I then in him be found!\ndressed in his righteousness alone,\nfaultless to stand before the throne.",
    ],
    chorus: "On Christ, the solid Rock, I stand;\nall other ground is sinking sand;\nall other ground is sinking sand.",
  },

  "o love that will not let me go": {
    title: "O Love That Will Not Let Me Go",
    author: "George Matheson",
    year: 1882,
    verses: [
      "O Love that will not let me go,\nI rest my weary soul in thee;\nI give thee back the life I owe,\nthat in thine ocean depths its flow\nmay richer, fuller be.",
      "O Light that followest all my way,\nI yield my flickering torch to thee;\nmy heart restores its borrowed ray,\nthat in thy sunshine's blaze its day\nmay brighter, fairer be.",
      "O Joy that seekest me through pain,\nI cannot close my heart to thee;\nI trace the rainbow through the rain,\nand feel the promise is not vain,\nthat morn shall tearless be.",
      "O Cross that liftest up my head,\nI dare not ask to fly from thee;\nI lay in dust life's glory dead,\nand from the ground there blossoms red\nlife that shall endless be.",
    ],
  },

  "stand up stand up for jesus": {
    title: "Stand Up Stand Up for Jesus",
    author: "George Duffield",
    year: 1858,
    verses: [
      "Stand up, stand up for Jesus,\nye soldiers of the cross;\nlift high his royal banner,\nit must not suffer loss:\nfrom victory unto victory\nhis army shall he lead,\ntill every foe is vanquished\nand Christ is Lord indeed.",
      "Stand up, stand up for Jesus,\nthe trumpet call obey;\nforth to the mighty conflict,\nin this his glorious day:\nye that are men now serve him\nagainst unnumbered foes;\nyour courage rise with danger,\nand strength to strength oppose.",
      "Stand up, stand up for Jesus,\nstand in his strength alone;\nthe arm of flesh will fail you,\nye dare not trust your own:\nput on the gospel armor,\neach piece put on with prayer;\nwhere duty calls, or danger,\nbe never wanting there.",
      "Stand up, stand up for Jesus,\nthe strife will not be long;\nthis day the noise of battle,\nthe next the victor's song:\nto him that overcometh,\na crown of life shall be;\nhe with the King of glory\nshall reign eternally.",
    ],
  },

  "i know that my redeemer lives": {
    title: "I Know That My Redeemer Lives",
    author: "Samuel Medley",
    year: 1775,
    verses: [
      "I know that my Redeemer lives;\nwhat comfort this sweet sentence gives!\nHe lives, he lives, who once was dead;\nhe lives, my ever-living Head.",
      "He lives to bless me with his love,\nhe lives to plead for me above;\nhe lives my hungry soul to feed,\nhe lives to help in time of need.",
      "He lives, and grants me daily breath;\nhe lives, and I shall conquer death;\nhe lives my mansion to prepare;\nhe lives to bring me safely there.",
      "He lives, all glory to his name!\nHe lives, my Jesus, still the same;\noh, the sweet joy this sentence gives:\nI know that my Redeemer lives!",
    ],
  },

  "i have decided to follow jesus": {
    title: "I Have Decided to Follow Jesus",
    author: "Traditional",
    year: 1800,
    verses: [
      "I have decided to follow Jesus,\nI have decided to follow Jesus,\nI have decided to follow Jesus;\nno turning back, no turning back.",
      "The world behind me, the cross before me,\nthe world behind me, the cross before me,\nthe world behind me, the cross before me;\nno turning back, no turning back.",
      "Though none go with me, still I will follow,\nthough none go with me, still I will follow,\nthough none go with me, still I will follow;\nno turning back, no turning back.",
      "Will you decide now to follow Jesus?\nWill you decide now to follow Jesus?\nWill you decide now to follow Jesus?\nNo turning back, no turning back.",
    ],
  },

  "sweet hour of prayer": {
    title: "Sweet Hour of Prayer",
    author: "William Walford",
    year: 1842,
    verses: [
      "Sweet hour of prayer, sweet hour of prayer,\nthat calls me from a world of care,\nand bids me at my Father's throne\nmake all my wants and wishes known!\nIn seasons of distress and grief,\nmy soul has often found relief,\nand oft escaped the tempter's snare\nby thy return, sweet hour of prayer.",
      "Sweet hour of prayer, sweet hour of prayer,\nthy wings shall my petition bear\nto him whose truth and faithfulness\nengage the waiting soul to bless;\nand since he bids me seek his face,\nbelieve his word, and trust his grace,\nI'll cast on him my every care,\nand wait for thee, sweet hour of prayer.",
      "Sweet hour of prayer, sweet hour of prayer,\nmay I thy consolation share,\ntill, from Mount Pisgah's lofty height,\nI view my home and take my flight:\nthis robe of flesh I'll drop, and rise\nto seize the everlasting prize,\nand shout, while passing through the air,\nFarewell, farewell, sweet hour of prayer.",
    ],
  },

  "there is a fountain": {
    title: "There Is a Fountain",
    author: "William Cowper",
    year: 1772,
    verses: [
      "There is a fountain filled with blood\ndrawn from Emmanuel's veins;\nand sinners plunged beneath that flood\nlose all their guilty stains.",
      "The dying thief rejoiced to see\nthat fountain in his day;\nand there have I, as vile as he,\nwashed all my sins away.",
      "Dear dying Lamb, thy precious blood\nshall never lose its power,\ntill all the ransomed church of God\nbe saved, to sin no more.",
      "E'er since by faith I saw the stream\nthy flowing wounds supply,\nredeeming love has been my theme,\nand shall be till I die.",
      "When this poor, lisping, stammering tongue\nlies silent in the grave,\nthen in a nobler, sweeter song\nI'll sing thy power to save.",
    ],
  },

  "before the throne of god above": {
    title: "Before the Throne of God Above",
    author: "Charitie Lees Bancroft",
    year: 1863,
    verses: [
      "Before the throne of God above\nI have a strong and perfect plea;\na great High Priest whose name is Love,\nwho ever lives and pleads for me.\nMy name is graven on his hands,\nmy name is written on his heart;\nI know that while in heaven he stands\nno tongue can bid me thence depart.",
      "When Satan tempts me to despair\nand tells me of the guilt within,\nupward I look and see him there\nwho made an end of all my sin.\nBecause the sinless Savior died,\nmy sinful soul is counted free;\nfor God the Just is satisfied\nto look on him and pardon me.",
      "Behold him there! the risen Lamb,\nmy perfect, spotless Righteousness;\nthe great unchangeable I Am,\nthe King of glory and of grace!\nOne with himself I cannot die,\nmy soul is purchased by his blood;\nmy life is hid with Christ on high,\nwith Christ my Savior and my God.",
    ],
  },

  "blest be the tie that binds": {
    title: "Blest Be the Tie That Binds",
    author: "John Fawcett",
    year: 1782,
    verses: [
      "Blest be the tie that binds\nour hearts in Christian love;\nthe fellowship of kindred minds\nis like to that above.",
      "Before our Father's throne\nwe pour our ardent prayers;\nour fears, our hopes, our aims are one,\nour comforts and our cares.",
      "We share our mutual woes,\nour mutual burdens bear;\nand often for each other flows\nthe sympathizing tear.",
      "When we asunder part,\nit gives us inward pain;\nbut we shall still be joined in heart,\nand hope to meet again.",
    ],
  },

  "be still my soul": {
    title: "Be Still My Soul",
    author: "Katharina von Schlegel",
    year: 1752,
    verses: [
      "Be still, my soul! the Lord is on thy side;\nbear patiently the cross of grief or pain;\nleave to thy God to order and provide;\nin every change he faithful will remain.\nBe still, my soul! thy best, thy heavenly Friend\nthrough thorny ways leads to a joyful end.",
      "Be still, my soul! thy God doth undertake\nto guide the future as he has the past;\nthy hope, thy confidence let nothing shake;\nall now mysterious shall be bright at last.\nBe still, my soul! the waves and winds still know\nhis voice who ruled them while he dwelt below.",
      "Be still, my soul! the hour is hastening on\nwhen we shall be forever with the Lord,\nwhen disappointment, grief, and fear are gone,\nsorrow forgot, love's purest joys restored.\nBe still, my soul! when change and tears are past,\nall safe and blessed we shall meet at last.",
    ],
  },

  "yield not to temptation": {
    title: "Yield Not to Temptation",
    author: "Horatio Palmer",
    year: 1868,
    verses: [
      "Yield not to temptation, for yielding is sin;\neach victory will help you some other to win;\nfight manfully onward, dark passions subdue;\nlook ever to Jesus, he will carry you through.",
      "Shun evil companions, bad language disdain;\nGod's name hold in reverence, nor take it in vain;\nbe thoughtful and earnest, kindhearted and true;\nlook ever to Jesus, he will carry you through.",
      "To him that o'ercometh, God giveth a crown;\nthrough faith we shall conquer, though often cast down;\nhe who is our Savior, our strength will renew;\nlook ever to Jesus, he will carry you through.",
    ],
    chorus: "Ask the Savior to help you,\ncomfort, strengthen, and keep you;\nhe is willing to aid you;\nhe will carry you through.",
  },

  "what a friend we have in jesus": {
    title: "What a Friend We Have in Jesus",
    author: "Joseph Scriven",
    year: 1855,
    verses: [
      "What a friend we have in Jesus,\nall our sins and griefs to bear!\nWhat a privilege to carry\neverything to God in prayer!\nO what peace we often forfeit,\nO what needless pain we bear,\nall because we do not carry\neverything to God in prayer!",
      "Have we trials and temptations?\nIs there trouble anywhere?\nWe should never be discouraged;\ntake it to the Lord in prayer.\nCan we find a friend so faithful,\nwho will all our sorrows share?\nJesus knows our every weakness;\ntake it to the Lord in prayer.",
      "Are we weak and heavy-laden,\ncumbered with a load of care?\nPrecious Savior, still our refuge;\ntake it to the Lord in prayer.\nDo thy friends despise, forsake thee?\nTake it to the Lord in prayer!\nIn his arms he'll take and shield thee;\nthou wilt find a solace there.",
    ],
  },

  "open my eyes that i may see": {
    title: "Open My Eyes That I May See",
    author: "Clara Scott",
    year: 1895,
    verses: [
      "Open my eyes, that I may see\nglimpses of truth thou hast for me;\nplace in my hands the wonderful key\nthat shall unclasp and set me free.\nSilently now I wait for thee,\nready, my God, thy will to see;\nopen my eyes, illumine me,\nSpirit divine!",
      "Open my ears, that I may hear\nvoices of truth thou sendest clear;\nand while the wave-notes fall on my ear,\neverything false will disappear.\nSilently now I wait for thee,\nready, my God, thy will to see;\nopen my ears, illumine me,\nSpirit divine!",
      "Open my mouth, and let me bear\ngladly the warm truth everywhere;\nopen my heart, and let me prepare\nlove with thy children thus to share.\nSilently now I wait for thee,\nready, my God, thy will to see;\nopen my heart, illumine me,\nSpirit divine!",
    ],
  },

  "great is thy faithfulness": {
    title: "Great Is Thy Faithfulness",
    author: "Thomas O. Chisholm",
    year: 1923,
    verses: [
      "Great is thy faithfulness, O God my Father,\nthere is no shadow of turning with thee;\nthou changest not, thy compassions they fail not;\nas thou hast been, thou forever wilt be.",
      "Summer and winter and springtime and harvest,\nsun, moon, and stars in their courses above\njoin with all nature in manifold witness\nto thy great faithfulness, mercy, and love.",
      "Pardon for sin and a peace that endureth,\nthy own dear presence to cheer and to guide;\nstrength for today and bright hope for tomorrow,\nblessings all mine, with ten thousand beside!",
    ],
    chorus: "Great is thy faithfulness! Great is thy faithfulness!\nMorning by morning new mercies I see;\nall I have needed thy hand hath provided;\ngreat is thy faithfulness, Lord, unto me!",
  },

  "must jesus bear the cross alone": {
    title: "Must Jesus Bear the Cross Alone",
    author: "Thomas Shepherd",
    year: 1693,
    verses: [
      "Must Jesus bear the cross alone,\nand all the world go free?\nNo, there's a cross for everyone,\nand there's a cross for me.",
      "How happy are the saints above,\nwho once went sorrowing here;\nbut now they taste unmingled love\nand joy without a tear.",
      "The consecrated cross I'll bear\ntill death shall set me free;\nand then go home my crown to wear,\nfor there's a crown for me.",
    ],
  },

  "o come all ye faithful": {
    title: "O Come All Ye Faithful",
    author: "John Francis Wade",
    year: 1751,
    verses: [
      "O come, all ye faithful,\njoyful and triumphant,\nO come ye, O come ye to Bethlehem;\ncome and behold him,\nborn the King of angels.",
      "God of God, Light of Light,\nlo, he abhors not the Virgin's womb;\nvery God, begotten not created.",
      "Sing, all ye citizens of heaven above;\nglory to God in the highest.",
      "Yea, Lord, we greet thee,\nborn this happy morning;\nJesus, to thee be all glory given;\nWord of the Father,\nnow in flesh appearing.",
    ],
    chorus: "O come, let us adore him,\nO come, let us adore him,\nO come, let us adore him,\nChrist the Lord!",
  },

  "his eye is on the sparrow": {
    title: "His Eye Is on the Sparrow",
    author: "Civilla Martin",
    year: 1905,
    verses: [
      "Why should I feel discouraged,\nwhy should the shadows come,\nwhy should my heart feel lonely\nand long for heaven and home,\nwhen Jesus is my portion?\nMy constant friend is he:\nhis eye is on the sparrow,\nand I know he watches me.",
      "Let not your heart be troubled,\nhis tender word I hear,\nand resting on his goodness,\nI lose my doubts and fears;\nthough by the path he leadeth\nbut one step I may see:\nhis eye is on the sparrow,\nand I know he watches me.",
      "Whenever I am tempted,\nwhenever clouds arise,\nwhen songs give place to sighing,\nwhen hope within me dies,\nI draw the closer to him,\nfrom care he sets me free:\nhis eye is on the sparrow,\nand I know he watches me.",
    ],
    chorus: "I sing because I'm happy,\nI sing because I'm free;\nfor his eye is on the sparrow,\nand I know he watches me.",
  },

  "the lord's my shepherd": {
    title: "The Lord's My Shepherd",
    author: "Francis Rous",
    year: 1650,
    verses: [
      "The Lord's my shepherd, I'll not want;\nhe makes me down to lie\nin pastures green; he leadeth me\nthe quiet waters by.",
      "My soul he doth restore again,\nand me to walk doth make\nwithin the paths of righteousness,\ne'en for his own name's sake.",
      "Yea, though I walk in death's dark vale,\nyet will I fear no ill;\nfor thou art with me, and thy rod\nand staff me comfort still.",
      "My table thou hast furnished\nin presence of my foes;\nmy head thou dost with oil anoint,\nand my cup overflows.",
      "Goodness and mercy all my life\nshall surely follow me;\nand in God's house forevermore\nmy dwelling place shall be.",
    ],
  },

  "come ye sinners poor and needy": {
    title: "Come Ye Sinners Poor and Needy",
    author: "Joseph Hart",
    year: 1759,
    verses: [
      "Come, ye sinners, poor and needy,\nweak and wounded, sick and sore;\nJesus ready stands to save you,\nfull of pity, love, and power.",
      "Come, ye thirsty, come, and welcome,\nGod's free bounty glorify;\ntrue belief and true repentance,\nevery grace that brings you nigh.",
      "Come, ye weary, heavy-laden,\nlost and ruined by the fall;\nif you tarry till you're better,\nyou will never come at all.",
      "View him prostrate in the garden;\non the ground your Maker lies;\non the bloody tree behold him;\nhear him cry before he dies.",
      "Lo! the incarnate God, ascended,\npleads the merit of his blood;\nventure on him, venture wholly,\nlet no other trust intrude.",
    ],
    chorus: "I will arise and go to Jesus,\nhe will embrace me in his arms;\nin the arms of my dear Savior,\nO there are ten thousand charms.",
  },

  "there were ninety and nine": {
    title: "There Were Ninety and Nine",
    author: "Elizabeth Clephane",
    year: 1868,
    verses: [
      "There were ninety and nine that safely lay\nin the shelter of the fold;\nbut one was out on the hills away,\nfar off from the gates of gold;\naway on the mountains wild and bare,\naway from the tender Shepherd's care.",
      "Lord, thou hast here thy ninety and nine;\nare they not enough for thee?\nBut the Shepherd made answer: this of mine\nhas wandered away from me;\nand although the road be rough and steep,\nI go to the desert to find my sheep.",
      "But none of the ransomed ever knew\nhow deep were the waters crossed;\nnor how dark was the night that the Lord passed through\nere he found his sheep that was lost;\nout in the desert he heard its cry,\nsick and helpless and ready to die.",
      "Lord, whence are those blood drops all the way\nthat mark out the mountain's track?\nThey were shed for one who had gone astray\nere the Shepherd could bring him back;\nLord, whence are thy hands so rent and torn?\nThey are pierced tonight by many a thorn.",
      "And all through the mountains, thunder riven,\nand up from the rocky steep,\nthere arose a glad cry to the gate of heaven,\nRejoice! I have found my sheep!\nAnd the angels echoed around the throne,\nRejoice, for the Lord brings back his own!",
    ],
  },

  "now thank we all our god": {
    title: "Now Thank We All Our God",
    author: "Martin Rinkart",
    year: 1636,
    verses: [
      "Now thank we all our God\nwith heart and hands and voices,\nwho wondrous things hath done,\nin whom his world rejoices;\nwho from our mothers' arms\nhath blessed us on our way\nwith countless gifts of love,\nand still is ours today.",
      "O may this bounteous God\nthrough all our life be near us,\nwith ever joyful hearts\nand blessed peace to cheer us;\nand keep us in his grace,\nand guide us when perplexed,\nand free us from all ills\nin this world and the next.",
      "All praise and thanks to God\nthe Father now be given,\nthe Son, and him who reigns\nwith them in highest heaven,\nthe one eternal God,\nwhom earth and heaven adore;\nfor thus it was, is now,\nand shall be evermore.",
    ],
  },

  "of the father's love begotten": {
    title: "Of the Father's Love Begotten",
    author: "Aurelius Prudentius",
    year: 405,
    verses: [
      "Of the Father's love begotten,\nere the worlds began to be,\nhe is Alpha and Omega,\nhe the source, the ending he,\nof the things that are, that have been,\nand that future years shall see,\nevermore and evermore!",
      "O that birth forever blessed,\nwhen the Virgin, full of grace,\nby the Holy Ghost conceiving,\nbore the Savior of our race;\nand the Babe, the world's Redeemer,\nfirst revealed his sacred face,\nevermore and evermore!",
      "This is he whom seers in old time\nchanted of with one accord,\nwhom the voices of the prophets\npromised in their faithful word;\nnow he shines, the long-expected;\nlet creation praise its Lord,\nevermore and evermore!",
      "Let the heights of heaven adore him;\nangel hosts his praises sing;\npowers, dominions bow before him,\nand extol our God and King;\nlet no tongue on earth be silent,\nevery voice in concert ring,\nevermore and evermore!",
    ],
  },

  "hark the herald angels sing": {
    title: "Hark the Herald Angels Sing",
    author: "Charles Wesley",
    year: 1739,
    verses: [
      "Hark! the herald angels sing,\nglory to the newborn King;\npeace on earth, and mercy mild,\nGod and sinners reconciled.\nJoyful, all ye nations, rise,\njoin the triumph of the skies;\nwith the angelic host proclaim,\nChrist is born in Bethlehem!",
      "Christ, by highest heaven adored,\nChrist, the everlasting Lord,\nlate in time behold him come,\noffspring of the Virgin's womb.\nVeiled in flesh the Godhead see;\nhail the incarnate Deity,\npleased as man with man to dwell,\nJesus, our Emmanuel!",
      "Hail the heaven-born Prince of Peace!\nHail the Sun of Righteousness!\nLight and life to all he brings,\nrisen with healing in his wings.\nMild he lays his glory by,\nborn that man no more may die,\nborn to raise the sons of earth,\nborn to give them second birth.",
    ],
    chorus: "Hark! the herald angels sing,\nglory to the newborn King!",
  },

  "trust and obey": {
    title: "Trust and Obey",
    author: "John Sammis",
    year: 1887,
    verses: [
      "When we walk with the Lord\nin the light of his word,\nwhat a glory he sheds on our way!\nWhile we do his good will,\nhe abides with us still,\nand with all who will trust and obey.",
      "Not a shadow can rise,\nnot a cloud in the skies,\nbut his smile quickly drives it away;\nnot a doubt nor a fear,\nnot a sigh nor a tear,\ncan abide while we trust and obey.",
      "Not a burden we bear,\nnot a sorrow we share,\nbut our toil he doth richly repay;\nnot a grief nor a loss,\nnot a frown nor a cross,\nbut is blest if we trust and obey.",
      "Then in fellowship sweet\nwe will sit at his feet,\nor we'll walk by his side in the way;\nwhat he says we will do,\nwhere he sends we will go,\nnever fear, only trust and obey.",
    ],
    chorus: "Trust and obey,\nfor there's no other way\nto be happy in Jesus,\nbut to trust and obey.",
  },

  "break thou the bread of life": {
    title: "Break Thou the Bread of Life",
    author: "Mary Lathbury",
    year: 1877,
    verses: [
      "Break thou the bread of life,\ndear Lord, to me,\nas thou didst break the loaves\nbeside the sea;\nbeyond the sacred page\nI seek thee, Lord;\nmy spirit pants for thee,\nO living Word!",
      "Bless thou the truth, dear Lord,\nto me, to me,\nas thou didst bless the bread\nby Galilee;\nthen shall all bondage cease,\nall fetters fall;\nand I shall find my peace,\nmy all in all.",
      "Thou art the bread of life,\nO Lord, to me,\nthy holy Word the truth\nthat saveth me;\ngive me to eat and live\nwith thee above;\nteach me to love thy truth,\nfor thou art love.",
      "O send thy Spirit, Lord,\nnow unto me,\nthat he may touch mine eyes\nand make me see;\nshow me the truth concealed\nwithin thy Word,\nand in thy book revealed\nI see the Lord.",
    ],
  },

  "this little light of mine": {
    title: "This Little Light of Mine",
    author: "Harry Dixon Loes",
    year: 1920,
    verses: [
      "This little light of mine,\nI'm gonna let it shine;\nthis little light of mine,\nI'm gonna let it shine;\nthis little light of mine,\nI'm gonna let it shine,\nlet it shine, let it shine, let it shine.",
      "Hide it under a bushel? No!\nI'm gonna let it shine;\nhide it under a bushel? No!\nI'm gonna let it shine;\nhide it under a bushel? No!\nI'm gonna let it shine,\nlet it shine, let it shine, let it shine.",
      "Don't let Satan blow it out,\nI'm gonna let it shine;\ndon't let Satan blow it out,\nI'm gonna let it shine;\ndon't let Satan blow it out,\nI'm gonna let it shine,\nlet it shine, let it shine, let it shine.",
    ],
  },

  "o day of rest and gladness": {
    title: "O Day of Rest and Gladness",
    author: "Christopher Wordsworth",
    year: 1862,
    verses: [
      "O day of rest and gladness,\nO day of joy and light,\nO balm of care and sadness,\nmost beautiful, most bright!\nOn thee the high and lowly,\nbefore the eternal throne,\nsing Holy, Holy, Holy,\nto the great Three in One.",
      "On thee, at the creation,\nthe light first had its birth;\non thee, for our salvation,\nChrist rose from depths of earth;\non thee our Lord, victorious,\nthe Spirit sent from heaven;\nand thus on thee, most glorious,\na threefold light was given.",
      "Thou art a port protected\nfrom storms that round us rise;\na garden intersected\nwith streams of paradise;\nthou art a cooling fountain\nin life's dry, dreary sand;\nfrom thee, like Pisgah's mountain,\nwe view our promised land.",
      "Today on weary nations\nthe heavenly manna falls;\nto holy convocations\nthe silver trumpet calls,\nwhere gospel light is glowing\nwith pure and radiant beams,\nand living water flowing\nwith soul-refreshing streams.",
    ],
  },

  "we plow the fields and scatter": {
    title: "We Plow the Fields and Scatter",
    author: "Matthias Claudius",
    year: 1782,
    verses: [
      "We plow the fields, and scatter\nthe good seed on the land,\nbut it is fed and watered\nby God's almighty hand;\nhe sends the snow in winter,\nthe warmth to swell the grain,\nthe breezes and the sunshine,\nand soft refreshing rain.",
      "He only is the Maker\nof all things near and far;\nhe paints the wayside flower,\nhe lights the evening star;\nthe winds and waves obey him,\nby him the birds are fed;\nmuch more to us, his children,\nhe gives our daily bread.",
      "We thank thee, then, O Father,\nfor all things bright and good,\nthe seedtime and the harvest,\nour life, our health, our food;\naccept the gifts we offer\nfor all thy love imparts,\nand, what thou most desirest,\nour humble, thankful hearts.",
    ],
    chorus: "All good gifts around us\nare sent from heaven above;\nthen thank the Lord, O thank the Lord\nfor all his love.",
  },

  "search me o god": {
    title: "Search Me O God",
    author: "J. Edwin Orr",
    year: 1936,
    verses: [
      "Search me, O God, and know my heart today;\ntry me, O Savior, know my thoughts, I pray;\nsee if there be some wicked way in me;\ncleanse me from every sin and set me free.",
      "I praise thee, Lord, for cleansing me from sin;\nfulfill thy word and make me pure within;\nfill me with fire where once I burned with shame;\ngrant my desire to magnify thy name.",
      "Lord, take my life and make it wholly thine;\nfill my poor heart with thy great love divine;\ntake all my will, my passion, self, and pride;\nI now surrender — Lord, in me abide.",
      "O Holy Ghost, revival comes from thee;\nsend a revival — start the work in me;\nthy Word declares thou wilt supply our need;\nfor blessings now, O Lord, I humbly plead.",
    ],
  },

  "come thou fount": {
    title: "Come Thou Fount",
    author: "Robert Robinson",
    year: 1758,
    verses: [
      "Come, thou Fount of every blessing,\ntune my heart to sing thy grace;\nstreams of mercy, never ceasing,\ncall for songs of loudest praise.\nTeach me some melodious sonnet,\nsung by flaming tongues above;\npraise the mount! I'm fixed upon it,\nMount of thy redeeming love.",
      "Here I raise mine Ebenezer;\nhither by thy help I'm come;\nand I hope, by thy good pleasure,\nsafely to arrive at home.\nJesus sought me when a stranger,\nwandering from the fold of God;\nhe, to rescue me from danger,\ninterposed his precious blood.",
      "O to grace how great a debtor\ndaily I'm constrained to be!\nLet thy goodness, like a fetter,\nbind my wandering heart to thee.\nProne to wander, Lord, I feel it,\nprone to leave the God I love;\nhere's my heart, O take and seal it,\nseal it for thy courts above.",
    ],
  },

  "all i have is christ": {
    title: "All I Have Is Christ",
    author: "Jordan Kauflin",
    year: 2008,
    verses: [
      "I once was lost in darkest night,\nyet thought I knew the way;\nthe sin that promised joy and life\nhad led me to the grave.\nI had no hope that you would own\na rebel to your will,\nand if you had not loved me first\nI would refuse you still.",
      "But as I ran from you I fell\nand cried out for your grace,\nyou spoke to me, you brought me home,\nand placed me in your arms.\nI now rejoice to be your own\nand not my own or sin's;\nwhat heights of love, what depths of peace\nwhen fears are stilled and strivings cease.",
    ],
    chorus: "Hallelujah! All I have is Christ;\nhallelujah! Jesus is my life.",
  },

  "fill my cup lord": {
    title: "Fill My Cup Lord",
    author: "Richard Blanchard",
    year: 1959,
    verses: [
      "Like the woman at the well, I was seeking\nfor things that could not satisfy;\nand then I heard my Savior speaking:\nDraw from my well that never shall run dry.",
      "There are millions in this world who are craving\nthe pleasures earthly things afford;\nbut none can match the wondrous treasure\nthat I find in Jesus Christ my Lord.",
      "So, my brother, if the things this world gave you\nleave hungers that won't pass away,\nmy blessed Lord will come and save you\nif you kneel to him and humbly pray.",
    ],
    chorus: "Fill my cup, Lord, I lift it up, Lord!\nCome and quench this thirsting of my soul;\nbread of heaven, feed me till I want no more;\nfill my cup, fill it up, and make me whole.",
  },

  "my soul magnifies the lord": {
    title: "My Soul Magnifies the Lord",
    author: "Traditional",
    year: 1800,
    verses: [
      "My soul magnifies the Lord,\nmy spirit rejoices in God my Savior;\nfor he has regarded the lowly estate of his servant;\nhenceforth all generations will call me blessed.",
      "For the Mighty One has done great things for me;\nholy is his name;\nand his mercy is on those who fear him\nfrom generation to generation.",
      "He has shown the strength of his arm;\nhe has scattered the proud in the thoughts of their hearts;\nhe has brought down the mighty from their thrones\nand exalted those of humble estate.",
    ],
  },

  "create in me a clean heart": {
    title: "Create in Me a Clean Heart",
    author: "Traditional",
    year: 1800,
    verses: [
      "Create in me a clean heart, O God,\nand renew a right spirit within me;\ncast me not away from thy presence, O Lord,\nand take not thy Holy Spirit from me.",
      "Restore unto me the joy of thy salvation,\nand uphold me with thy free Spirit;\nthen will I teach transgressors thy ways,\nand sinners shall be converted unto thee.",
      "O Lord, open thou my lips,\nand my mouth shall show forth thy praise;\nfor thou desirest not sacrifice, else would I give it;\nthou delightest not in burnt offering.",
    ],
  },

  "thy word is a lamp": {
    title: "Thy Word Is a Lamp",
    author: "Amy Grant / Michael W. Smith",
    year: 1984,
    verses: [
      "Thy Word is a lamp unto my feet\nand a light unto my path.\nThy Word is a lamp unto my feet\nand a light unto my path.",
      "When I feel afraid, think I've lost my way,\nstill you're there right beside me;\nnothing will I fear as long as you are near;\nplease be near me to the end.",
      "I will not forget your love for me, and yet\nmy heart forever is wandering;\nJesus be my guide and hold me to your side,\nand I will love you to the end.",
    ],
    chorus: "Thy Word is a lamp unto my feet\nand a light unto my path.",
  },
};

export function getHymnLyrics(title: string): HymnEntry | null {
  const key = title.toLowerCase().trim();
  return HYMN_LYRICS[key] ?? null;
}
