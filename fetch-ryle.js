#!/usr/bin/env node
// ─── Fetch Ryle's Expository Thoughts on the Gospels ─────────────────────────
// J.C. Ryle (1816–1900) — fully public domain.
// Source: Christian Classics Ethereal Library (ccel.org)
// Run: node fetch-ryle.js
// Output: frontend/app/lib/devotionalData.ts

const https = require("https");
const fs = require("fs");
const path = require("path");

// ─── Configuration ────────────────────────────────────────────────────────────

const DELAY_MS = 400; // polite crawl delay between requests

const GOSPELS = [
  { name: "Matthew", chapters: 28, dayStart: 1,   dayEnd: 105, url: "https://www.ccel.org/ccel/ryle/matthew.html" },
  { name: "Mark",    chapters: 16, dayStart: 106,  dayEnd: 150, url: "https://www.ccel.org/ccel/ryle/mark.html" },
  { name: "Luke",    chapters: 24, dayStart: 151,  dayEnd: 255, url: "https://www.ccel.org/ccel/ryle/luke.html" },
  { name: "John",    chapters: 21, dayStart: 256,  dayEnd: 365, url: "https://www.ccel.org/ccel/ryle/john.html" },
];

const HYMNS = [
  { title: "A Mighty Fortress Is Our God",      author: "Martin Luther",        year: 1529, firstLine: "A mighty fortress is our God, a bulwark never failing" },
  { title: "Amazing Grace",                      author: "John Newton",           year: 1779, firstLine: "Amazing grace! how sweet the sound, that saved a wretch like me" },
  { title: "Come Thou Fount of Every Blessing",  author: "Robert Robinson",       year: 1758, firstLine: "Come, thou Fount of every blessing, tune my heart to sing thy grace" },
  { title: "When I Survey the Wondrous Cross",   author: "Isaac Watts",           year: 1707, firstLine: "When I survey the wondrous cross on which the Prince of glory died" },
  { title: "Abide with Me",                      author: "Henry F. Lyte",         year: 1847, firstLine: "Abide with me; fast falls the eventide" },
  { title: "Be Thou My Vision",                  author: "Ancient Irish",         year: 700,  firstLine: "Be thou my vision, O Lord of my heart" },
  { title: "Holy Holy Holy",                     author: "Reginald Heber",        year: 1826, firstLine: "Holy, holy, holy! Lord God Almighty!" },
  { title: "It Is Well with My Soul",            author: "Horatio Spafford",      year: 1873, firstLine: "When peace, like a river, attendeth my way" },
  { title: "To God Be the Glory",                author: "Fanny Crosby",          year: 1875, firstLine: "To God be the glory, great things he hath done!" },
  { title: "Crown Him with Many Crowns",         author: "Matthew Bridges",       year: 1851, firstLine: "Crown him with many crowns, the Lamb upon his throne" },
  { title: "Jesus Shall Reign",                  author: "Isaac Watts",           year: 1719, firstLine: "Jesus shall reign where'er the sun does his successive journeys run" },
  { title: "O Sacred Head Now Wounded",          author: "Paul Gerhardt",         year: 1656, firstLine: "O sacred Head, now wounded, with grief and shame weighed down" },
  { title: "Guide Me O Thou Great Jehovah",      author: "William Williams",      year: 1745, firstLine: "Guide me, O thou great Jehovah, pilgrim through this barren land" },
  { title: "How Firm a Foundation",              author: "John Rippon",           year: 1787, firstLine: "How firm a foundation, ye saints of the Lord" },
  { title: "And Can It Be",                      author: "Charles Wesley",        year: 1738, firstLine: "And can it be that I should gain an interest in the Savior's blood?" },
];

// KJV passage texts keyed by "Book Chapter" for common Gospel passages
// These are used as fallback when we can't extract scripture text from Ryle's commentary
const KJV_PASSAGES = {
  "Matthew 1":  "The book of the generation of Jesus Christ, the son of David, the son of Abraham.",
  "Matthew 2":  "Now when Jesus was born in Bethlehem of Judaea in the days of Herod the king, behold, there came wise men from the east to Jerusalem.",
  "Matthew 3":  "In those days came John the Baptist, preaching in the wilderness of Judaea, and saying, Repent ye: for the kingdom of heaven is at hand.",
  "Matthew 4":  "Then was Jesus led up of the Spirit into the wilderness to be tempted of the devil.",
  "Matthew 5":  "And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him: and he opened his mouth, and taught them.",
  "Matthew 6":  "Take heed that ye do not your alms before men, to be seen of them: otherwise ye have no reward of your Father which is in heaven.",
  "Matthew 7":  "Judge not, that ye be not judged.",
  "Matthew 8":  "When he was come down from the mountain, great multitudes followed him.",
  "Matthew 9":  "And he entered into a ship, and passed over, and came into his own city.",
  "Matthew 10": "And when he had called unto him his twelve disciples, he gave them power against unclean spirits, to cast them out, and to heal all manner of sickness and all manner of disease.",
  "Matthew 11": "And it came to pass, when Jesus had made an end of commanding his twelve disciples, he departed thence to teach and to preach in their cities.",
  "Matthew 12": "At that time Jesus went on the sabbath day through the corn; and his disciples were an hungred, and began to pluck the ears of corn, and to eat.",
  "Matthew 13": "The same day went Jesus out of the house, and sat by the sea side.",
  "Matthew 14": "At that time Herod the tetrarch heard of the fame of Jesus.",
  "Matthew 15": "Then came to Jesus scribes and Pharisees, which were of Jerusalem, saying, Why do thy disciples transgress the tradition of the elders?",
  "Matthew 16": "The Pharisees also with the Sadducees came, and tempting desired him that he would shew them a sign from heaven.",
  "Matthew 17": "And after six days Jesus taketh Peter, James, and John his brother, and bringeth them up into an high mountain apart.",
  "Matthew 18": "At the same time came the disciples unto Jesus, saying, Who is the greatest in the kingdom of heaven?",
  "Matthew 19": "And it came to pass, that when Jesus had finished these sayings, he departed from Galilee, and came into the coasts of Judaea beyond Jordan.",
  "Matthew 20": "For the kingdom of heaven is like unto a man that is an householder, which went out early in the morning to hire labourers into his vineyard.",
  "Matthew 21": "And when they drew nigh unto Jerusalem, and were come to Bethphage, unto the mount of Olives, then sent Jesus two disciples.",
  "Matthew 22": "And Jesus answered and spake unto them again by parables, and said, The kingdom of heaven is like unto a certain king, which made a marriage for his son.",
  "Matthew 23": "Then spake Jesus to the multitude, and to his disciples, saying, The scribes and the Pharisees sit in Moses' seat.",
  "Matthew 24": "And Jesus went out, and departed from the temple: and his disciples came to him for to shew him the buildings of the temple.",
  "Matthew 25": "Then shall the kingdom of heaven be likened unto ten virgins, which took their lamps, and went forth to meet the bridegroom.",
  "Matthew 26": "And it came to pass, when Jesus had finished all these sayings, he said unto his disciples, Ye know that after two days is the feast of the passover.",
  "Matthew 27": "When the morning was come, all the chief priests and elders of the people took counsel against Jesus to put him to death.",
  "Matthew 28": "In the end of the sabbath, as it began to dawn toward the first day of the week, came Mary Magdalene and the other Mary to see the sepulchre.",
  "Mark 1":     "The beginning of the gospel of Jesus Christ, the Son of God.",
  "Mark 2":     "And again he entered into Capernaum after some days; and it was noised that he was in the house.",
  "Mark 3":     "And he entered again into the synagogue; and there was a man there which had a withered hand.",
  "Mark 4":     "And he began again to teach by the sea side: and there was gathered unto him a great multitude.",
  "Mark 5":     "And they came over unto the other side of the sea, into the country of the Gadarenes.",
  "Mark 6":     "And he went out from thence, and came into his own country; and his disciples follow him.",
  "Mark 7":     "Then came together unto him the Pharisees, and certain of the scribes, which came from Jerusalem.",
  "Mark 8":     "In those days the multitude being very great, and having nothing to eat, Jesus called his disciples unto him, and saith unto them.",
  "Mark 9":     "And he said unto them, Verily I say unto you, That there be some of them that stand here, which shall not taste of death.",
  "Mark 10":    "And he arose from thence, and cometh into the coasts of Judaea by the farther side of Jordan.",
  "Mark 11":    "And when they came nigh to Jerusalem, unto Bethphage and Bethany, at the mount of Olives, he sendeth forth two of his disciples.",
  "Mark 12":    "And he began to speak unto them by parables. A certain man planted a vineyard, and set an hedge about it.",
  "Mark 13":    "And as he went out of the temple, one of his disciples saith unto him, Master, see what manner of stones and what buildings are here!",
  "Mark 14":    "After two days was the feast of the passover, and of unleavened bread: and the chief priests and the scribes sought how they might take him by craft, and put him to death.",
  "Mark 15":    "And straightway in the morning the chief priests held a consultation with the elders and scribes and the whole council, and bound Jesus, and carried him away, and delivered him to Pilate.",
  "Mark 16":    "And when the sabbath was past, Mary Magdalene, and Mary the mother of James, and Salome, had bought sweet spices, that they might come and anoint him.",
  "Luke 1":     "Forasmuch as many have taken in hand to set forth in order a declaration of those things which are most surely believed among us.",
  "Luke 2":     "And it came to pass in those days, that there went out a decree from Caesar Augustus, that all the world should be taxed.",
  "Luke 3":     "Now in the fifteenth year of the reign of Tiberius Caesar, Pontius Pilate being governor of Judaea.",
  "Luke 4":     "And Jesus being full of the Holy Ghost returned from Jordan, and was led by the Spirit into the wilderness.",
  "Luke 5":     "And it came to pass, that, as the people pressed upon him to hear the word of God, he stood by the lake of Gennesaret.",
  "Luke 6":     "And it came to pass on the second sabbath after the first, that he went through the corn fields; and his disciples plucked the ears of corn.",
  "Luke 7":     "Now when he had ended all his sayings in the audience of the people, he entered into Capernaum.",
  "Luke 8":     "And it came to pass afterward, that he went throughout every city and village, preaching and shewing the glad tidings of the kingdom of God.",
  "Luke 9":     "Then he called his twelve disciples together, and gave them power and authority over all devils, and to cure diseases.",
  "Luke 10":    "After these things the Lord appointed other seventy also, and sent them two and two before his face into every city and place, whither he himself would come.",
  "Luke 11":    "And it came to pass, that, as he was praying in a certain place, when he ceased, one of his disciples said unto him, Lord, teach us to pray.",
  "Luke 12":    "In the mean time, when there were gathered together an innumerable multitude of people, insomuch that they trode one upon another, he began to say unto his disciples first of all.",
  "Luke 13":    "There were present at that season some that told him of the Galilaeans, whose blood Pilate had mingled with their sacrifices.",
  "Luke 14":    "And it came to pass, as he went into the house of one of the chief Pharisees to eat bread on the sabbath day, that they watched him.",
  "Luke 15":    "Then drew near unto him all the publicans and sinners for to hear him.",
  "Luke 16":    "And he said also unto his disciples, There was a certain rich man, which had a steward; and the same was accused unto him that he had wasted his goods.",
  "Luke 17":    "Then said he unto the disciples, It is impossible but that offences will come: but woe unto him, through whom they come!",
  "Luke 18":    "And he spake a parable unto them to this end, that men ought always to pray, and not to faint.",
  "Luke 19":    "And Jesus entered and passed through Jericho.",
  "Luke 20":    "And it came to pass, that on one of those days, as he taught the people in the temple, and preached the gospel, the chief priests and the scribes came upon him with the elders.",
  "Luke 21":    "And he looked up, and saw the rich men casting their gifts into the treasury.",
  "Luke 22":    "Now the feast of unleavened bread drew nigh, which is called the Passover.",
  "Luke 23":    "And the whole multitude of them arose, and led him unto Pilate.",
  "Luke 24":    "Now upon the first day of the week, very early in the morning, they came unto the sepulchre, bringing the spices which they had prepared, and certain others with them.",
  "John 1":     "In the beginning was the Word, and the Word was with God, and the Word was God.",
  "John 2":     "And the third day there was a marriage in Cana of Galilee; and the mother of Jesus was there.",
  "John 3":     "There was a man of the Pharisees, named Nicodemus, a ruler of the Jews.",
  "John 4":     "When therefore the Lord knew how the Pharisees had heard that Jesus made and baptized more disciples than John.",
  "John 5":     "After this there was a feast of the Jews; and Jesus went up to Jerusalem.",
  "John 6":     "After these things Jesus went over the sea of Galilee, which is the sea of Tiberias.",
  "John 7":     "After these things Jesus walked in Galilee: for he would not walk in Jewry, because the Jews sought to kill him.",
  "John 8":     "Jesus went unto the mount of Olives.",
  "John 9":     "And as Jesus passed by, he saw a man which was blind from his birth.",
  "John 10":    "Verily, verily, I say unto you, He that entereth not by the door into the sheepfold, but climbeth up some other way, the same is a thief and a robber.",
  "John 11":    "Now a certain man was sick, named Lazarus, of Bethany, the town of Mary and her sister Martha.",
  "John 12":    "Then Jesus six days before the passover came to Bethany, where Lazarus was which had been dead.",
  "John 13":    "Now before the feast of the passover, when Jesus knew that his hour was come that he should depart out of this world unto the Father.",
  "John 14":    "Let not your heart be troubled: ye believe in God, believe also in me.",
  "John 15":    "I am the true vine, and my Father is the husbandman.",
  "John 16":    "These things have I spoken unto you, that ye should not be offended.",
  "John 17":    "These words spake Jesus, and lifted up his eyes to heaven, and said, Father, the hour is come; glorify thy Son, that thy Son also may glorify thee.",
  "John 18":    "When Jesus had spoken these words, he went forth with his disciples over the brook Cedron.",
  "John 19":    "Then Pilate therefore took Jesus, and scourged him.",
  "John 20":    "The first day of the week cometh Mary Magdalene early, when it was yet dark, unto the sepulchre.",
  "John 21":    "After these things Jesus shewed himself again to the disciples at the sea of Tiberias.",
};

// Themes keyed by chapter for theme derivation
const CHAPTER_THEMES = {
  "Matthew 1": "Incarnation", "Matthew 2": "The Wise Men", "Matthew 3": "Repentance",
  "Matthew 4": "Temptation", "Matthew 5": "The Beatitudes", "Matthew 6": "Prayer and Trust",
  "Matthew 7": "Judgment", "Matthew 8": "Healing and Faith", "Matthew 9": "Forgiveness",
  "Matthew 10": "Discipleship", "Matthew 11": "Christ's Invitation", "Matthew 12": "The Sabbath",
  "Matthew 13": "The Kingdom of Heaven", "Matthew 14": "Walking on Water", "Matthew 15": "True Defilement",
  "Matthew 16": "Peter's Confession", "Matthew 17": "The Transfiguration", "Matthew 18": "Humility",
  "Matthew 19": "Marriage and Riches", "Matthew 20": "The Kingdom's Workers", "Matthew 21": "The Triumphal Entry",
  "Matthew 22": "The Great Banquet", "Matthew 23": "False Religion", "Matthew 24": "The Last Days",
  "Matthew 25": "The Ten Virgins", "Matthew 26": "The Passion", "Matthew 27": "The Crucifixion",
  "Matthew 28": "The Resurrection",
  "Mark 1": "The Gospel Begins", "Mark 2": "Healing and Controversy", "Mark 3": "The Twelve Chosen",
  "Mark 4": "Parables", "Mark 5": "Deliverance", "Mark 6": "Feeding the Multitude",
  "Mark 7": "Tradition and Truth", "Mark 8": "The Bread of Life", "Mark 9": "Transfiguration",
  "Mark 10": "Servanthood", "Mark 11": "Christ the King", "Mark 12": "Godly Wisdom",
  "Mark 13": "Watchfulness", "Mark 14": "The Betrayal", "Mark 15": "Christ Crucified",
  "Mark 16": "He Is Risen",
  "Luke 1": "Annunciation", "Luke 2": "The Nativity", "Luke 3": "John the Baptist",
  "Luke 4": "Christ's Ministry Begins", "Luke 5": "Call to Follow", "Luke 6": "Blessedness",
  "Luke 7": "Faith and Mercy", "Luke 8": "The Sower", "Luke 9": "Christ Revealed",
  "Luke 10": "Love of Neighbor", "Luke 11": "Prayer", "Luke 12": "Watchfulness",
  "Luke 13": "Repentance", "Luke 14": "Humility", "Luke 15": "The Prodigal Son",
  "Luke 16": "Stewardship", "Luke 17": "Gratitude", "Luke 18": "Persistence in Prayer",
  "Luke 19": "Zacchaeus", "Luke 20": "Authority", "Luke 21": "The Widow's Offering",
  "Luke 22": "The Last Supper", "Luke 23": "The Cross", "Luke 24": "The Risen Christ",
  "John 1": "The Word Made Flesh", "John 2": "Christ's Glory", "John 3": "New Birth",
  "John 4": "Living Water", "John 5": "Healing and Authority", "John 6": "The Bread of Life",
  "John 7": "Christ's Identity", "John 8": "Light of the World", "John 9": "Spiritual Sight",
  "John 10": "The Good Shepherd", "John 11": "The Resurrection and the Life", "John 12": "Glorification",
  "John 13": "Servant Leadership", "John 14": "The Way, Truth, and Life", "John 15": "Abiding in Christ",
  "John 16": "The Holy Spirit", "John 17": "Christ's Intercession", "John 18": "The Arrest",
  "John 19": "The Cross", "John 20": "Resurrection Faith", "John 21": "Restoration",
};

// Prayer prompts keyed by chapter theme
const PRAYER_PROMPTS = {
  "Incarnation": "Lord Jesus, we marvel that you left the glory of heaven to be born among us. Grant us hearts that treasure your Incarnation and live in the light of God with us.",
  "The Wise Men": "Father, like the Magi of old, may we seek Christ with all diligence and offer him the worship he deserves, counting all earthly treasure as nothing beside knowing him.",
  "Repentance": "Lord, soften our hearts to true repentance. May we not merely feel sorrow for sin but turn wholly to you, bearing the fruit of lives transformed by your grace.",
  "Temptation": "Almighty God, we confess our weakness before temptation. Strengthen us by your Spirit and your Word, that we may stand firm as Christ stood, trusting every promise of the Father.",
  "The Beatitudes": "Lord, make us poor in spirit, hungry for righteousness, and pure in heart. May the Beatitudes not be words we admire from afar, but the shape of lives yielded to you.",
  "Prayer and Trust": "Heavenly Father, teach us to pray as Christ taught his disciples. Free us from anxiety and deliver us from secret service to wealth. May our treasure be in you alone.",
  "Judgment": "Lord, grant us the wisdom to hear and do your words, that we might build our lives upon the rock. May we not deceive ourselves with mere profession while our hearts remain far from you.",
  "Healing and Faith": "Jesus, we bring before you every affliction and infirmity — of body, soul, and spirit. Increase our faith to trust that nothing is too hard for you, and nothing beyond your healing touch.",
  "Forgiveness": "Father, we confess the sins that weigh upon us. Grant us the faith of those who brought their need to Christ, and the joy of hearing: your sins are forgiven, rise and walk.",
  "Discipleship": "Lord Jesus, we acknowledge the cost of following you. May we not shrink from the call to take up our cross. Make us witnesses who are bold because we trust your Spirit's work.",
  "Christ's Invitation": "Lord, we hear your call: Come unto me, all ye that labour and are heavy laden. We come weary and burdened. Grant us the rest that only you can give, and teach us to be meek and lowly.",
  "The Sabbath": "Father, forgive us when we honor you with our lips while our hearts are far from you. Teach us that mercy is greater than sacrifice, and that Christ is Lord of all our days.",
  "The Kingdom of Heaven": "King of kings, open our ears to understand your parables of the kingdom. May we prize the kingdom above all else, like the man who sold everything to possess the pearl of great price.",
  "Walking on Water": "Lord of wind and wave, when fear overwhelms us and faith wavers, may we hear your voice saying 'Be not afraid.' Stretch out your hand to save us before we sink.",
  "True Defilement": "Search us, O God, and know our hearts. It is not what enters from without but what comes from within that defiles. Create in us clean hearts and renew a right spirit within us.",
  "Peter's Confession": "Lord Jesus, grant us Peter's confession — that you are the Christ, the Son of the living God — and may that truth not merely rest in our heads but rule our lives and comfort our fears.",
  "The Transfiguration": "Lord, grant us glimpses of your glory to sustain us in the valleys of trial. When the cloud of suffering descends, may we hear the Father say: This is my beloved Son — hear him.",
  "Humility": "Lord Jesus, who took a little child as the emblem of true greatness, humble us. Deliver us from ambition for status and fill us with a servant's heart, like yours.",
  "Marriage and Riches": "Father, guard us against the idol of riches and the hardness of heart that makes us cling to the world. May we hear your call, sell all, and follow Jesus — and find in him far more than we gave up.",
  "The Kingdom's Workers": "Lord, we confess our tendency to compare ourselves with others and resent your generosity to those who come late. Help us to work faithfully, trusting your sovereign goodness in all things.",
  "The Triumphal Entry": "Hosanna to the Son of David! May our welcome of Christ go deeper than waving palms. May we receive him as our King — not the king of our imagination, but the Savior who comes to die.",
  "The Great Banquet": "Father, keep us from the fatal mistake of making excuses and refusing your invitation. May we come to your banquet of grace with joy, dressed in the righteousness you alone provide.",
  "False Religion": "Lord, preserve us from the hypocrisy that honors you in public while the inward life is corrupt. May we be clean within and without, undivided in our devotion to you.",
  "The Last Days": "O Lord, who knows the day and the hour, keep us watchful and sober-minded. May the certainty of your return not be a source of terror but of joyful readiness.",
  "The Ten Virgins": "Lord Jesus, we long to be found ready when you come. May our lamps be filled with the oil of true grace — not the empty profession that fades in the hour of trial.",
  "The Passion": "We bow before the mystery of your suffering, Lord Jesus. You who knew no sin were betrayed, denied, and abandoned for our sake. May the weight of your love break every pride in us.",
  "The Crucifixion": "Father, forgive us, for we knew not what we did — yet by our sin we drove the nails. May the cross never grow familiar or small to us. Let us stand beneath it in wonder, love, and praise.",
  "The Resurrection": "O risen Lord, death could not hold you! May the power of your resurrection fill our hearts with living hope, and may we go forth to all nations in your great name.",
  "The Gospel Begins": "Lord, we hear again the beginning of the gospel of Jesus Christ. Stir up in us the freshness of first faith — the wonder of sins forgiven, the joy of a Savior found.",
  "Healing and Controversy": "Jesus, we marvel at your authority over sickness and sin alike. Grant us faith to bring our paralysis — of soul and conscience — to you, knowing you have power to forgive and heal.",
  "The Twelve Chosen": "Lord, who chose weak and ordinary men to carry the gospel to the world, use us likewise. We offer our inadequacy and ask only for your sufficiency.",
  "Parables": "Open our ears, Lord, that we may hear. May the seed of your Word fall on good soil in our hearts — hearts that receive it, cherish it, and bear fruit abundantly.",
  "Deliverance": "Lord of all power, who commanded even the unclean spirits, we trust your authority over all that enslaves and destroys. Speak your word of release over every chain that holds us.",
  "Feeding the Multitude": "Provider God, you fed thousands with a boy's loaves and fish. Teach us to bring what little we have to you and trust you to make it more than enough.",
  "Tradition and Truth": "Father, guard us from elevating tradition above your living Word. May we not honor you with our lips while our hearts are far from you, but worship in spirit and in truth.",
  "The Bread of Life": "Lord Jesus, you are the bread that comes down from heaven. May we not labor for food that perishes but come to you, believe in you, and find in you all the nourishment our souls need.",
  "Transfiguration": "Lord, on the holy mountain your glory was unveiled. When we are overwhelmed and afraid, remind us again of who you are — beloved Son, full of glory — and bid us rise and fear not.",
  "Servanthood": "Lord, you who came not to be served but to serve and give your life, make us servants after your own heart. May greatness among us be measured by love, not position.",
  "Christ the King": "Hosanna! Blessed is he who comes in the name of the Lord. May our welcome of Christ not be the shallow enthusiasm of the crowd but the deep surrender of hearts that call him Lord.",
  "Godly Wisdom": "Father, may we be found giving to Caesar what is Caesar's and to God what is God's — keeping the first commandment first, and living in the wisdom that loves you and loves our neighbor.",
  "Watchfulness": "Lord, keep us awake and watchful in these days. May we not be deceived by false prophets or overwhelmed by fear, but stand firm to the end, trusting your sovereign care.",
  "The Betrayal": "Lord Jesus, we are sobered by the ease with which Judas betrayed you. Search our hearts for any root of treachery or self-deception, and grant us the grace of true and lasting loyalty.",
  "Christ Crucified": "We stand at the cross, Lord Jesus, and confess that there we see the height of love and the depth of our sin. May the cross be our boast, our comfort, and our life.",
  "He Is Risen": "Alleluia! Christ is risen! May this not be mere confession of lips but conviction of heart. Let the resurrection fill us with a living hope that transforms everything.",
  "Annunciation": "Gracious God, we marvel at the mystery of the Incarnation — the Most High overshadowing the humble. Like Mary, may we hear your word, believe it, and say: let it be according to your word.",
  "The Nativity": "Lord Jesus, we bow with the shepherds before the manger. May we receive the good news of great joy — that unto us is born a Savior, Christ the Lord — with wonder and worship.",
  "John the Baptist": "Father, make us voices that prepare the way for Christ — not building our own reputation but decreasing that he might increase. May we point all we meet to the Lamb of God.",
  "Christ's Ministry Begins": "Lord, the Spirit who rested on Christ at his baptism has been given to us. May we live in the power of the Spirit, proclaiming the acceptable year of the Lord in all we do.",
  "Call to Follow": "Jesus, we hear your call: Follow me. May we respond as the disciples did — immediately, completely, leaving behind all that competes with you. You are worth it.",
  "Blessedness": "Lord, overturn our idea of blessedness. May we not seek the applause of men but the blessedness you pronounce — on the meek, the merciful, the peacemakers, and those who suffer for righteousness.",
  "Faith and Mercy": "Lord Jesus, increase our faith. May we come boldly to you with every need and wound, trusting that your mercy reaches as far as our greatest sin and our deepest suffering.",
  "The Sower": "Lord of the harvest, let your Word take deep root in our hearts. Remove the hard ground, the shallow soil, and the thorns of worldly care, and make us fruitful ground for your glory.",
  "Christ Revealed": "Lord, when the disciples saw your glory, they fell on their faces. Grant us a vision of who you truly are — that we might live sobered by your majesty and comforted by your nearness.",
  "Love of Neighbor": "Lord, you answered the question: who is my neighbor? by showing us one who had mercy. May we go and do likewise — crossing every boundary of convenience to serve those in need.",
  "Prayer": "Lord, teach us to pray. May we not give up, but come boldly and persistently to the Father who delights to give good things to his children. Let prayer be the breath of our souls.",
  "Watchfulness": "Lord, let us be like servants who wait for the master's return — ready, awake, and faithful in the work we have been given. May we not sleep when we should watch.",
  "Repentance": "Lord, we hear your word: except ye repent, ye shall all likewise perish. Keep us from the pride that refuses to be warned, and grant us the grace of genuine turning from sin to you.",
  "Humility": "Lord, you said that whoever exalts himself will be humbled. Teach us the wisdom of the lower place. May we not seek the seat of honor but cheerfully serve the least, knowing you see all.",
  "The Prodigal Son": "Father, we are the prodigals who have wasted your gifts on riotous living. We arise and come to you, not worthy to be called your sons. Receive us by your grace, and restore us.",
  "Stewardship": "Lord, we are stewards of all you have entrusted to us. May we be faithful with money, time, and gifts — using all for your glory, knowing we will give account to you.",
  "Gratitude": "Lord, of the ten who were cleansed, only one returned to give thanks. May we be that one — grateful in all circumstances, aware of how great a salvation we have received.",
  "Persistence in Prayer": "Father, grant us the perseverance of the widow who would not give up. May we pray and not faint, trusting that you hear us and that justice will come in your perfect time.",
  "Zacchaeus": "Lord Jesus, you sought Zacchaeus when no one else would. You seek us when we are lost in the trees of our own smallness. May we, too, come down and receive you joyfully.",
  "Authority": "Lord, we acknowledge your authority over all — death, taxes, scripture, and the powers of this age. May we render to you what is yours: our whole hearts, our whole lives.",
  "The Widow's Offering": "Lord, you saw the widow's two mites and called it more than all. Help us to give not from our abundance but from our dependence, trusting you to supply all our need.",
  "The Last Supper": "Lord Jesus, we remember your body broken and your blood poured out. May we come to your table not in empty ritual but in genuine communion with you, proclaiming your death until you come.",
  "The Cross": "We stand before the mystery of the cross, Lord. Heaven shuddered, the veil was torn, the centurion confessed. May our hearts be similarly undone by what Christ has done for us.",
  "The Risen Christ": "Lord Jesus, we have heard the report of the empty tomb and we believe. Strengthen our faith in the resurrection. Open our eyes as you opened the disciples' eyes on the road to Emmaus.",
  "The Word Made Flesh": "Father, we bow before the majesty of the Logos who was in the beginning with you. May the Word made flesh dwell richly in us, and may we behold his glory, full of grace and truth.",
  "Christ's Glory": "Lord, at Cana you revealed your glory and your disciples believed in you. May every miracle of grace in our lives deepen our trust in you and draw us closer to your glory.",
  "New Birth": "Lord Jesus, like Nicodemus we come with questions. Grant us the miracle of the new birth — born of the Spirit, like the wind — that we may enter the kingdom of God.",
  "Living Water": "Lord, you are the well that never runs dry. Like the woman at the well, may we drink of you and never thirst again — and may we run to tell others of the Christ who knows us and loves us.",
  "Healing and Authority": "Father, we see that Christ healed on the Sabbath and was persecuted for it. May we not be surprised when faithful obedience brings opposition, but trust in the one whose hour has not yet come.",
  "Christ's Identity": "Lord, in the great debate over who you are, grant us clarity and courage. May we confess with Peter: Thou art the Christ — and may that confession shape everything.",
  "Light of the World": "Jesus, you are the light of the world. In the darkness of our age, may we follow you and walk in the light of life. And make us lights in dark places, reflecting your glory.",
  "Spiritual Sight": "Lord, we confess that we often walk in spiritual blindness, not seeing what is right before us. Open our eyes as you opened the eyes of the man born blind, that we may see and worship you.",
  "The Good Shepherd": "Lord Jesus, we are your sheep and you are our shepherd. May we know your voice and follow you — trusting that you laid down your life for us and will never lose one of your own.",
  "The Resurrection and the Life": "Lord, you said: I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live. May this be the rock beneath our feet in every valley of grief.",
  "Glorification": "Lord, we hear your prayer: Father, glorify your Son. May we live for your glory in all things — not for our own fame, but that the world may believe the Father sent you.",
  "Servant Leadership": "Lord Jesus, you washed your disciples' feet. May we who call you Lord and Teacher follow your example — no task too small, no person beneath our service.",
  "The Way, Truth, and Life": "Jesus, you are the way and the truth and the life. In a world of confusion and many paths, anchor us in you — the only way to the Father, the one sure truth, the source of all life.",
  "Abiding in Christ": "Lord, you said: Abide in me, and I in you. May we not merely visit you in crisis but remain in you daily, drawing life from the vine, bearing the fruit that glorifies the Father.",
  "The Holy Spirit": "Come, Holy Spirit. You who convict of sin, righteousness, and judgment — work deeply in our hearts. Guide us into all truth and glorify Christ in and through us.",
  "Christ's Intercession": "Lord Jesus, you prayed for your disciples and for all who would believe through their word — including us. We rest in your intercession, knowing you pray for us even now.",
  "The Arrest": "Lord, we see you choosing the cup of suffering rather than twelve legions of angels. May we trust your sovereign submission in our own trials and lay down our rights for love's sake.",
  "Resurrection Faith": "Lord, Thomas touched your wounds and declared: My Lord and my God. Grant us that same confession. And grant us the faith of those who have not seen and yet believe.",
  "Restoration": "Lord Jesus, you restored Peter after his denial with a threefold charge of love. There is hope for the fallen and the faithless. Restore us, and send us out again to feed your sheep.",
};

// ─── Utility Functions ────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : require("http");
    const req = lib.get(url, { headers: { "User-Agent": "TULIP-Bible-App/1.0 (devotional research; public domain text)" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}

/** Strip HTML tags, decode entities, collapse whitespace */
function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract the main content text from a CCEL Ryle page */
function extractDevotionalText(html, bookName, chapterNum) {
  // Try to find the main content div
  let content = "";

  // CCEL typically wraps content in <div class="text"> or similar
  const textMatch = html.match(/<div[^>]+class="[^"]*text[^"]*"[^>]*>([\s\S]+?)<\/div>/i);
  if (textMatch) {
    content = stripHtml(textMatch[1]);
  }

  if (!content || content.length < 100) {
    // Try body content, excluding header/footer/nav
    const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
    if (bodyMatch) {
      let body = bodyMatch[1];
      // Remove navigation areas
      body = body.replace(/<nav[\s\S]*?<\/nav>/gi, "");
      body = body.replace(/<header[\s\S]*?<\/header>/gi, "");
      body = body.replace(/<footer[\s\S]*?<\/footer>/gi, "");
      body = body.replace(/<aside[\s\S]*?<\/aside>/gi, "");
      content = stripHtml(body);
    }
  }

  if (!content || content.length < 100) {
    return null;
  }

  // Clean up the text: find the expository content
  // Remove "CCEL" headers, navigation text, copyright notices
  content = content
    .replace(/Christian Classics Ethereal Library[^.]*\./g, "")
    .replace(/Prev\s+\w[^.]*Next/g, "")
    .replace(/\[\s*Prev\s*\]\s*\[\s*Next\s*\]/g, "")
    .replace(/Copyright[^.]*\./g, "")
    .replace(/^.*?(?=(?:SECTION|CHAPTER|Matthew|Mark|Luke|John|I\.|1\.))/s, "")
    .trim();

  // Trim to a reasonable size (CCEL pages may have long navigation)
  // Look for Ryle's characteristic paragraph openings
  const ryleStart = content.search(/(?:Let us|We see|I think|There is|The passage|This passage|These words|Look at|Notice|Consider|Our Lord|The text|It is|We learn|We have)/);
  if (ryleStart > 0 && ryleStart < 500) {
    content = content.slice(ryleStart);
  }

  // Take a reasonable chunk (first 1200 characters of actual exposition)
  if (content.length > 1200) {
    // Try to break at a sentence
    const cutoff = content.lastIndexOf(".", 1200);
    content = cutoff > 800 ? content.slice(0, cutoff + 1) : content.slice(0, 1200);
  }

  return content.trim() || null;
}

/** Parse chapter/section links from a CCEL index page */
function parseChapterLinks(html, baseUrl, bookSlug) {
  const links = [];
  const seen = new Set();

  // Match hrefs that look like chapter links for this book
  const hrefPattern = new RegExp(
    `href="((?:[^"]*)?${bookSlug}(?:\\.\\w+)+\\.html(?:#[^"]*)?)"`,
    "gi"
  );

  let match;
  while ((match = hrefPattern.exec(html)) !== null) {
    let href = match[1];
    // Resolve relative URLs
    if (!href.startsWith("http")) {
      const base = baseUrl.replace(/[^/]+$/, "");
      href = base + href;
    }
    // Deduplicate
    const normalized = href.split("#")[0];
    if (!seen.has(normalized)) {
      seen.add(normalized);
      links.push(normalized);
    }
  }

  // Fallback: look for any internal links with the book slug
  if (links.length === 0) {
    const generalPattern = /href="([^"#]+\.html)"/gi;
    while ((match = generalPattern.exec(html)) !== null) {
      let href = match[1];
      if (href.includes(bookSlug) && !href.endsWith(`${bookSlug}.html`)) {
        if (!href.startsWith("http")) {
          const base = baseUrl.replace(/[^/]+$/, "");
          href = base + href;
        }
        const normalized = href.split("#")[0];
        if (!seen.has(normalized)) {
          seen.add(normalized);
          links.push(normalized);
        }
      }
    }
  }

  return links;
}

/** Generate a placeholder devotional text */
function placeholderDevotional(bookName, chapterNum) {
  return `Ryle's exposition of ${bookName} chapter ${chapterNum} calls us to careful attention to the text of Scripture. The great commentator urges us to mark what is written, to consider what the Lord is teaching, and to apply it practically to our daily walk. Every chapter of the Gospels is full of instruction, and no reader should pass on without pausing to ask: What does this teach me about Christ? What does it demand of me as a Christian?`;
}

// ─── Day / Date Utilities ─────────────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dayOfYearToDate(day) {
  // day is 1-indexed; use a non-leap year (2025) as reference
  const d = new Date(2025, 0, day);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const dayStr = String(d.getDate()).padStart(2, "0");
  const displayDate = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return { date: `${month}-${dayStr}`, displayDate };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌿 Fetching Ryle's Expository Thoughts on the Gospels...\n");

  const entries = []; // Will hold { dayOfYear, bookName, chapterNum, text }

  for (const gospel of GOSPELS) {
    console.log(`📖 ${gospel.name} (Days ${gospel.dayStart}–${gospel.dayEnd})`);

    // Fetch the index page
    let indexHtml = "";
    try {
      indexHtml = await fetchUrl(gospel.url);
      await delay(DELAY_MS);
    } catch (err) {
      console.warn(`  ⚠ Could not fetch index for ${gospel.name}: ${err.message}`);
    }

    // Parse chapter links from the index
    const bookSlug = gospel.name.toLowerCase();
    let chapterLinks = indexHtml
      ? parseChapterLinks(indexHtml, gospel.url, bookSlug)
      : [];

    console.log(`  Found ${chapterLinks.length} chapter links`);

    // If we found too few, generate expected URLs for CCEL Ryle
    // CCEL Ryle URLs follow pattern: /ccel/ryle/matthew.ii.html (Roman numerals for chapters)
    if (chapterLinks.length < gospel.chapters) {
      console.log(`  Generating fallback URLs for all ${gospel.chapters} chapters...`);
      // Generate Roman numeral URLs (CCEL convention) + arabic numeral fallbacks
      const romanNumerals = ["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","xxi","xxii","xxiii","xxiv","xxv","xxvi","xxvii","xxviii"];
      chapterLinks = [];
      for (let c = 0; c < gospel.chapters; c++) {
        chapterLinks.push(`https://www.ccel.org/ccel/ryle/${bookSlug}.${romanNumerals[c]}.html`);
      }
    }

    // Limit to the actual number of chapters
    chapterLinks = chapterLinks.slice(0, gospel.chapters);

    // Calculate day distribution across this gospel's range
    const totalDays = gospel.dayEnd - gospel.dayStart + 1;
    const chapters = gospel.chapters;

    // Assign days to chapters: distribute totalDays across chapters
    // Some chapters get floor(totalDays/chapters), some get ceil
    const daysPerChapter = [];
    const base = Math.floor(totalDays / chapters);
    let extra = totalDays - base * chapters;
    for (let c = 0; c < chapters; c++) {
      daysPerChapter.push(base + (extra > 0 ? 1 : 0));
      if (extra > 0) extra--;
    }

    let dayCounter = gospel.dayStart;

    for (let c = 0; c < chapters; c++) {
      const chapterNum = c + 1;
      const chapterKey = `${gospel.name} ${chapterNum}`;
      const chapterDays = daysPerChapter[c];
      const url = chapterLinks[c];

      process.stdout.write(`  ${gospel.name} ${chapterNum}... `);

      // Fetch chapter text
      let rawText = null;
      try {
        const html = await fetchUrl(url);
        rawText = extractDevotionalText(html, gospel.name, chapterNum);
        await delay(DELAY_MS);
        console.log("done");
      } catch (err) {
        console.log(`⚠ (fetch failed: ${err.message})`);
      }

      const devotionalText = rawText || placeholderDevotional(gospel.name, chapterNum);
      const scriptureText = KJV_PASSAGES[chapterKey] || `${gospel.name} ${chapterNum} — see your Bible for the full text.`;
      const theme = CHAPTER_THEMES[chapterKey] || `${gospel.name} ${chapterNum}`;
      const prayer = PRAYER_PROMPTS[theme] || `Lord, speak to us through ${gospel.name} chapter ${chapterNum}. Open our hearts to receive your Word, and transform us by what we read. Amen.`;

      // Split this chapter's content across chapterDays entries
      // Divide the devotional text into segments if multiple days
      const words = devotionalText.split(" ");
      const wordsPerDay = Math.ceil(words.length / chapterDays);

      for (let d = 0; d < chapterDays; d++) {
        const start = d * wordsPerDay;
        const end = Math.min(start + wordsPerDay, words.length);
        let segmentText = words.slice(start, end).join(" ").trim();

        // Ensure clean sentence ending
        const lastPeriod = segmentText.lastIndexOf(".");
        if (lastPeriod > segmentText.length * 0.5) {
          segmentText = segmentText.slice(0, lastPeriod + 1);
        }

        if (!segmentText || segmentText.length < 50) {
          segmentText = devotionalText; // fallback: repeat full text
        }

        entries.push({
          dayOfYear: dayCounter,
          bookName: gospel.name,
          chapterNum,
          chapterKey,
          theme,
          scriptureText,
          devotionalText: segmentText,
          prayer,
          hymnIndex: (dayCounter - 1) % HYMNS.length,
        });

        dayCounter++;
        if (dayCounter > gospel.dayEnd) break;
      }

      if (dayCounter > gospel.dayEnd) break;
    }

    // If we didn't fill all days (edge case), pad with the last entry repeated
    while (dayCounter <= gospel.dayEnd) {
      const last = entries[entries.length - 1];
      entries.push({ ...last, dayOfYear: dayCounter });
      dayCounter++;
    }

    console.log();
  }

  // ─── Build the TypeScript file ─────────────────────────────────────────────

  console.log("✍ Writing devotionalData.ts...\n");

  const lines = [];
  lines.push(`// ─── Ryle's Expository Thoughts on the Gospels ───────────────────────────────`);
  lines.push(`// Original text by J.C. Ryle (1816–1900). Fully public domain.`);
  lines.push(`// Source: Christian Classics Ethereal Library (ccel.org)`);
  lines.push(`// Auto-generated by fetch-ryle.js — do not edit by hand.`);
  lines.push(``);
  lines.push(`export interface DailyDevotional {`);
  lines.push(`  date: string;`);
  lines.push(`  displayDate: string;`);
  lines.push(`  theme: string;`);
  lines.push(`  scripture: { reference: string; text: string; translation: string; };`);
  lines.push(`  devotional: string;`);
  lines.push(`  prayer: string;`);
  lines.push(`  hymn: { title: string; author: string; year: number; firstLine?: string; };`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export const DAILY_DEVOTIONALS: Record<string, DailyDevotional> = {`);

  for (const entry of entries) {
    const { date, displayDate } = dayOfYearToDate(entry.dayOfYear);
    const hymn = HYMNS[entry.hymnIndex];

    const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

    lines.push(`  "${date}": {`);
    lines.push(`    date: "${date}", displayDate: "${displayDate}",`);
    lines.push(`    theme: \`${esc(entry.theme)}\`,`);
    lines.push(`    scripture: {`);
    lines.push(`      reference: \`${esc(entry.chapterKey)}\`,`);
    lines.push(`      text: \`${esc(entry.scriptureText)}\`,`);
    lines.push(`      translation: "KJV"`);
    lines.push(`    },`);
    lines.push(`    devotional: \`${esc(entry.devotionalText)}\`,`);
    lines.push(`    prayer: \`${esc(entry.prayer)}\`,`);
    lines.push(`    hymn: { title: "${hymn.title}", author: "${hymn.author}", year: ${hymn.year}, firstLine: "${hymn.firstLine}" },`);
    lines.push(`  },`);
  }

  lines.push(`};`);
  lines.push(``);
  lines.push(`export function getDevotionalForDate(date: Date): DailyDevotional | null {`);
  lines.push(`  const month = String(date.getMonth() + 1).padStart(2, "0");`);
  lines.push(`  const day = String(date.getDate()).padStart(2, "0");`);
  lines.push(`  return DAILY_DEVOTIONALS[\`\${month}-\${day}\`] ?? null;`);
  lines.push(`}`);
  lines.push(``);

  const outputPath = path.join(__dirname, "frontend", "app", "lib", "devotionalData.ts");
  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

  console.log(`✅ Wrote ${entries.length} entries to frontend/app/lib/devotionalData.ts`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
