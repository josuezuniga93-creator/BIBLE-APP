"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  loadStreak,
  recordLogin,
  getNewBadges,
  BADGES,
  type StreakData,
  type BadgeId,
} from "./lib/streakData";
import {
  loadDevotionalProgress,
  DEVOTIONAL_BADGES,
  type DevotionalBadgeId,
} from "./lib/devotionalProgress";
import { useLanguage } from "./lib/useLanguage";
import { translateToSpanish } from "./lib/googleTranslate";
import { GeneratedBadgeLogo } from "./components/GeneratedArtwork";

import { getRotatingArticle, daysUntilNextRotation } from "./lib/graceGemsArticles";

// ─── Church History Verses ────────────────────────────────────────────────────

interface HistoryVerse {
  reference: string;
  book: string;
  chapter: number;
  text: string;
  event: string;
  year: string;
  history: string;
  glow: string;
}

const HISTORY_VERSES: HistoryVerse[] = [
  {
    reference: "John 1:1",
    book: "John", chapter: 1,
    text: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    event: "Council of Nicaea",
    year: "325 AD",
    glow: "rgba(56,189,248,0.18)",
    history:
      "When Arius taught that Christ was a created being — 'there was a time when he was not' — the church convened at Nicaea under Emperor Constantine. John 1:1 was the anchor text: if the Word was God from the beginning, he could not have had a beginning. Bishop Athanasius argued from this verse that a less-than-God Christ saves no one. The council affirmed the Son is homoousios — of the same substance as the Father — a position Athanasius would defend alone against emperors and bishops for decades, giving rise to the phrase Athanasius contra mundum: Athanasius against the world.",
  },
  {
    reference: "Romans 1:17",
    book: "Romans", chapter: 1,
    text: "For in it the righteousness of God is revealed from faith for faith, as it is written, 'The righteous shall live by faith.'",
    event: "Luther's Tower Experience",
    year: "c. 1515",
    glow: "rgba(201,169,97,0.18)",
    history:
      "Martin Luther was a tormented Augustinian monk who hated the phrase 'righteousness of God' — he read it as God's punishing justice against sinners. While studying Romans in his tower cell in Wittenberg, he was struck: the righteousness Paul describes is not demanded from us but given to us, received through faith. 'I felt myself to be reborn and to have gone through open doors into paradise,' he wrote. This single verse ignited the Protestant Reformation. Two years later, Luther nailed his 95 Theses to the Wittenberg church door, and the medieval church was never the same.",
  },
  {
    reference: "Galatians 2:16",
    book: "Galatians", chapter: 2,
    text: "A person is not justified by works of the law but through faith in Jesus Christ.",
    event: "The Reformation Debate",
    year: "1517–1545",
    glow: "rgba(249,115,22,0.18)",
    history:
      "This verse was the sword of the Reformation. When Rome insisted that justification required both faith and meritorious works — and condemned the Reformers at the Council of Trent (1545–1563) — Luther, Calvin, and Melanchthon all returned to Galatians. Calvin called justification 'the hinge on which all true religion turns.' The Reformers insisted: to add works to faith as the ground of justification is to preach a different gospel. The Council of Trent formally anathematized the Reformation position, a condemnation that formally stands to this day in Roman Catholic canon law.",
  },
  {
    reference: "John 6:37",
    book: "John", chapter: 6,
    text: "All that the Father gives me will come to me, and whoever comes to me I will never cast out.",
    event: "The Synod of Dort",
    year: "1618–1619",
    glow: "rgba(139,92,246,0.18)",
    history:
      "After Jacobus Arminius and his followers challenged Calvinist teaching on predestination, the Dutch Reformed church convened an international council at Dordrecht with delegates from England, Germany, Switzerland, and the Netherlands. Five points were at stake: total depravity, unconditional election, limited atonement, irresistible grace, and perseverance of the saints — the TULIP doctrines. John 6:37–40 was central: 'All that the Father gives me will come' — election is the Father's act. 'I will never cast out' — preservation is Christ's promise. The Canons of Dort remain one of the most carefully argued theological documents in Christian history.",
  },
  {
    reference: "Acts 5:29",
    book: "Acts", chapter: 5,
    text: "We must obey God rather than men.",
    event: "Diet of Worms",
    year: "1521",
    glow: "rgba(239,68,68,0.18)",
    history:
      "Standing before Emperor Charles V and the full assembly of the Holy Roman Empire, Martin Luther was ordered to recant his writings. His answer has echoed for five centuries: 'Unless I am convinced by the testimony of the Scriptures or by clear reason — for I do not trust either in the pope or in councils alone, since it is well known that they have often erred and contradicted themselves — I am bound by the Scriptures I have quoted, and my conscience is captive to the Word of God. I cannot and will not recant anything, since it is neither safe nor right to go against conscience. Here I stand. I cannot do otherwise. God help me. Amen.' He was declared an outlaw of the Empire the next day.",
  },
  {
    reference: "2 Timothy 3:16",
    book: "2 Timothy", chapter: 3,
    text: "All Scripture is breathed out by God and profitable for doctrine, for reproof, for correction, for training in righteousness.",
    event: "Sola Scriptura",
    year: "Reformation Era",
    glow: "rgba(16,185,129,0.18)",
    history:
      "The first of the Five Solas — Scripture alone — was not an invention of the Reformers but a recovery of the early church's conviction. When Rome argued that Scripture and Church Tradition carried equal authority, the Reformers cited 2 Timothy 3:16: God breathed out Scripture; councils and popes are fallible men. Sola Scriptura does not mean 'no creeds or confessions' — Luther, Calvin, and the Westminster Divines all wrote extensive confessional documents. It means Scripture is the supreme and final authority to which all tradition must submit. This principle was the formal cause of the Reformation.",
  },
  {
    reference: "Romans 8:30",
    book: "Romans", chapter: 8,
    text: "And those whom he predestined he also called, and those whom he called he also justified, and those whom he justified he also glorified.",
    event: "Augustine vs. Pelagius",
    year: "410–430 AD",
    glow: "rgba(99,102,241,0.18)",
    history:
      "Pelagius, a British monk in Rome, taught that human beings have the natural ability to choose good and earn salvation — sin is imitation, not inherited corruption. Augustine of Hippo saw this as the destruction of grace. His debate with Pelagius produced some of the most important theology in Christian history: original sin, the bondage of the will, prevenient and irresistible grace, and predestination. Romans 8:29–30 — the 'golden chain' of salvation — was Augustine's anchor. The Council of Carthage (418 AD) condemned Pelagianism. Augustine's framework became the backbone of both Catholic and Protestant soteriology, though the Reformers argued Rome itself had drifted back toward Pelagius.",
  },
  {
    reference: "Hebrews 4:12",
    book: "Hebrews", chapter: 4,
    text: "For the word of God is living and active, sharper than any two-edged sword, piercing to the division of soul and of spirit, of joints and of marrow, and discerning the thoughts and intentions of the heart.",
    event: "Tyndale & the English Bible",
    year: "1526–1536",
    glow: "rgba(20,184,166,0.18)",
    history:
      "William Tyndale believed ordinary English people deserved to read this living Word in their own language. When a church official told him 'we are better to be without God's law than the Pope's,' Tyndale replied: 'I defy the Pope, and all his laws; and if God spare my life, ere many years I will cause a boy that driveth the plough, to know more of the Scripture than thou dost.' He translated the New Testament from Greek and much of the Old Testament from Hebrew — the first printed English Bible from the original languages. He was strangled and burned at the stake in 1536. Eighty percent of the King James Bible (1611) is Tyndale's translation. His dying prayer: 'Lord, open the King of England's eyes.'",
  },
];

// ─── Church History Verses — Spanish ─────────────────────────────────────────

const HISTORY_VERSES_ES: HistoryVerse[] = [
  {
    reference: "Juan 1:1",
    book: "John", chapter: 1,
    text: "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.",
    event: "Concilio de Nicea",
    year: "325 d.C.",
    glow: "rgba(56,189,248,0.18)",
    history:
      "Cuando Arrio enseñó que Cristo era un ser creado — 'hubo un tiempo en que no existía' — la iglesia se reunió en Nicea bajo el emperador Constantino. Juan 1:1 fue el texto central: si el Verbo era Dios desde el principio, no podía haber tenido un comienzo. El obispo Atanasio argumentó desde este versículo que un Cristo inferior a Dios no puede salvar a nadie. El concilio afirmó que el Hijo es homoousios — de la misma sustancia que el Padre — una posición que Atanasio defendería solo contra emperadores y obispos durante décadas, dando origen a la frase Athanasius contra mundum: Atanasio contra el mundo.",
  },
  {
    reference: "Romanos 1:17",
    book: "Romans", chapter: 1,
    text: "Porque en el evangelio la justicia de Dios se revela por fe y para fe; como está escrito: 'Mas el justo por la fe vivirá.'",
    event: "La Experiencia de la Torre de Lutero",
    year: "c. 1515",
    glow: "rgba(201,169,97,0.18)",
    history:
      "Martín Lutero era un monje agustino atormentado que odiaba la frase 'justicia de Dios' — la leía como la justicia punitiva de Dios contra los pecadores. Mientras estudiaba Romanos en su celda de la torre en Wittenberg, comprendió: la justicia que Pablo describe no nos es exigida, sino que nos es dada, recibida por fe. 'Me sentí renacer y entrar por puertas abiertas al paraíso', escribió. Este solo versículo encendió la Reforma Protestante. Dos años después, Lutero clavó sus 95 Tesis en la puerta de la iglesia de Wittenberg, y la iglesia medieval nunca volvió a ser la misma.",
  },
  {
    reference: "Gálatas 2:16",
    book: "Galatians", chapter: 2,
    text: "El hombre no es justificado por las obras de la ley, sino por la fe de Jesucristo.",
    event: "El Debate de la Reforma",
    year: "1517–1545",
    glow: "rgba(249,115,22,0.18)",
    history:
      "Este versículo fue la espada de la Reforma. Cuando Roma insistió en que la justificación requería tanto la fe como las obras meritorias — y condenó a los Reformadores en el Concilio de Trento (1545–1563) — Lutero, Calvino y Melanchthon volvieron todos a Gálatas. Calvino llamó a la justificación 'el eje sobre el cual gira toda la religión verdadera.' Los Reformadores insistieron: añadir obras a la fe como base de la justificación es predicar un evangelio diferente. El Concilio de Trento anatematizó formalmente la posición de la Reforma, una condena que permanece vigente hasta hoy en el derecho canónico católico romano.",
  },
  {
    reference: "Juan 6:37",
    book: "John", chapter: 6,
    text: "Todo lo que el Padre me da, vendrá a mí; y al que a mí viene, no le echo fuera.",
    event: "El Sínodo de Dort",
    year: "1618–1619",
    glow: "rgba(139,92,246,0.18)",
    history:
      "Después de que Jacobo Arminio y sus seguidores desafiaron la enseñanza calvinista sobre la predestinación, la iglesia reformada holandesa convocó un concilio internacional en Dordrecht con delegados de Inglaterra, Alemania, Suiza y los Países Bajos. Cinco puntos estaban en juego: depravación total, elección incondicional, expiación limitada, gracia irresistible y perseverancia de los santos — las doctrinas TULIP. Juan 6:37–40 era central: 'Todo lo que el Padre me da vendrá' — la elección es el acto del Padre. 'No le echo fuera' — la preservación es la promesa de Cristo. Los Cánones de Dort siguen siendo uno de los documentos teológicos más cuidadosamente razonados de la historia cristiana.",
  },
  {
    reference: "Hechos 5:29",
    book: "Acts", chapter: 5,
    text: "Es necesario obedecer a Dios antes que a los hombres.",
    event: "Dieta de Worms",
    year: "1521",
    glow: "rgba(239,68,68,0.18)",
    history:
      "De pie ante el emperador Carlos V y la asamblea plena del Sacro Imperio Romano, Martín Lutero fue ordenado a retractarse de sus escritos. Su respuesta ha resonado durante cinco siglos: 'A menos que sea convencido por el testimonio de las Escrituras o por razón clara — porque no confío ni en el papa ni en los concilios solos, ya que es bien sabido que han errado con frecuencia y se han contradicho — estoy ligado por las Escrituras que he citado, y mi conciencia es cautiva de la Palabra de Dios. No puedo ni quiero retractarme de nada, pues no es seguro ni correcto ir contra la conciencia. Aquí me mantengo. No puedo hacer otra cosa. Que Dios me ayude. Amén.' Al día siguiente fue declarado fuera de la ley del Imperio.",
  },
  {
    reference: "2 Timoteo 3:16",
    book: "2 Timothy", chapter: 3,
    text: "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.",
    event: "Sola Scriptura",
    year: "Era de la Reforma",
    glow: "rgba(16,185,129,0.18)",
    history:
      "La primera de las Cinco Solas — solo la Escritura — no fue un invento de los Reformadores sino una recuperación de la convicción de la iglesia primitiva. Cuando Roma argumentó que la Escritura y la Tradición de la Iglesia tenían igual autoridad, los Reformadores citaron 2 Timoteo 3:16: Dios espiró la Escritura; los concilios y los papas son hombres falibles. Sola Scriptura no significa 'sin credos ni confesiones' — Lutero, Calvino y los Divinos de Westminster escribieron extensos documentos confesionales. Significa que la Escritura es la autoridad suprema y final a la que toda tradición debe someterse. Este principio fue la causa formal de la Reforma.",
  },
  {
    reference: "Romanos 8:30",
    book: "Romans", chapter: 8,
    text: "Y a los que predestinó, a éstos también llamó; y a los que llamó, a éstos también justificó; y a los que justificó, a éstos también glorificó.",
    event: "Agustín contra Pelagio",
    year: "410–430 d.C.",
    glow: "rgba(99,102,241,0.18)",
    history:
      "Pelagio, un monje británico en Roma, enseñó que los seres humanos tienen la capacidad natural de elegir el bien y ganarse la salvación — el pecado es imitación, no corrupción heredada. Agustín de Hipona vio en esto la destrucción de la gracia. Su debate con Pelagio produjo parte de la teología más importante de la historia cristiana: el pecado original, la esclavitud de la voluntad, la gracia preveniente e irresistible, y la predestinación. Romanos 8:29–30 — la 'cadena de oro' de la salvación — fue el ancla de Agustín. El Concilio de Cartago (418 d.C.) condenó el pelagianismo. El marco de Agustín se convirtió en la columna vertebral de la soteriología tanto católica como protestante.",
  },
  {
    reference: "Hebreos 4:12",
    book: "Hebrews", chapter: 4,
    text: "Porque la palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu, las coyunturas y los tuétanos, y discierne los pensamientos y las intenciones del corazón.",
    event: "Tyndale y la Biblia en Inglés",
    year: "1526–1536",
    glow: "rgba(20,184,166,0.18)",
    history:
      "William Tyndale creía que el pueblo inglés ordinario merecía leer esta Palabra viva en su propio idioma. Cuando un oficial de la iglesia le dijo 'es mejor estar sin la ley de Dios que sin la del Papa', Tyndale respondió: 'Desafío al Papa y a todas sus leyes; y si Dios me da vida, antes de muchos años haré que un niño que ara la tierra sepa más de la Escritura que tú.' Tradujo el Nuevo Testamento del griego y gran parte del Antiguo Testamento del hebreo — la primera Biblia impresa en inglés a partir de los idiomas originales. Fue estrangulado y quemado en la hoguera en 1536. El ochenta por ciento de la Biblia del Rey Jacobo (1611) es traducción de Tyndale. Su oración final: 'Señor, abre los ojos del rey de Inglaterra.'",
  },
];

// ─── Featured Meditation videos ───────────────────────────────────────────────
const FEATURED_VIDEOS = {
  en: { file: "/videos/featured-en.mp4", youtubeId: "", thumb: "/meditation-thumb.jpg", title: "HeartCry Missionary's Testimony" },
  es: { file: "/videos/featured-es.mp4", youtubeId: "", thumb: "/meditation-thumb-es.jpg", title: "Testimonio Misionero HeartCry" },
};

// ─── Article types ─────────────────────────────────────────────────────────────
interface MarrowArticle {
  title: string;
  href: string;
  excerpt: string;
  date: string;
  slug: string;
  imageUrl?: string;
}

interface ArticleContent {
  title: string;
  date: string;
  content: string;
  author?: string;
}

function weekIndex() {
  return Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
}

function dayOfWeekIndex() {
  return new Date().getDay();
}

// ─── Gold accent constants ─────────────────────────────────────────────────────
const AC         = "#c9a961";
const AC_SUB     = "rgba(201,169,97,0.75)";
const AC_BG      = "rgba(201,169,97,0.14)";
const AC_BORDER  = "rgba(201,169,97,0.40)";
const AC_BORDER_SM = "rgba(201,169,97,0.30)";
const AC_CTA_GRAD = "linear-gradient(135deg, rgba(201,169,97,0.18), rgba(201,169,97,0.05))";
const SERIF = "'Iowan Old Style','Georgia','Times New Roman',serif";

// ─── Attributes of God — Memorization Verses ─────────────────────────────────
// Gold Navy palette: gold (#c9a961) is the dominant accent. Each attribute carries
// a small warm-toned indicator color used only for picker dots — the card UI stays gold.

interface MemVerse {
  ref: string;
  text: string;
  textEs: string;
  refEs: string;
  theme: string;             // sanctification topic
  color: string;             // subtle indicator accent
  context: string;           // brief background / why it matters
}

const MEM_VERSES: MemVerse[] = [
  { ref: "Psalm 119:11",        refEs: "Salmo 119:11",          theme: "Scripture & Sin",     color: "#c9a961", text: "I have stored up your word in my heart, that I might not sin against you.", textEs: "En mi corazón he guardado tus dichos, para no pecar contra ti.", context: "The psalmist's strategy against sin is not willpower but Scripture. Hiding God's Word in the heart means meditating on it until it shapes desires — so temptation meets truth before it meets the will." },
  { ref: "John 17:17",          refEs: "Juan 17:17",            theme: "Sanctification",      color: "#d4a857", text: "Sanctify them in the truth; your word is truth.", textEs: "Santifícalos en tu verdad; tu palabra es verdad.", context: "Jesus prays this on the night of His arrest. Sanctification is not self-improvement but being set apart and shaped by divine truth. The Word is the instrument the Spirit uses to conform us to Christ." },
  { ref: "John 17:19",          refEs: "Juan 17:19",            theme: "Christ Our Holiness", color: "#dca15a", text: "And for their sake I consecrate myself, that they also may be sanctified in truth.", textEs: "Y por ellos yo me santifico a mí mismo, para que también ellos sean santificados en la verdad.", context: "Jesus consecrates Himself to death so that His people would be holy. Our sanctification is rooted in His sacrifice — He is the source, not just the model, of our holiness." },
  { ref: "Acts 26:18",          refEs: "Hechos 26:18",          theme: "Gospel & Holiness",   color: "#caa45e", text: "…that they may receive forgiveness of sins and a place among those who are sanctified by faith in me.", textEs: "…para que reciban, por la fe que es en mí, perdón de pecados y herencia entre los santificados.", context: "Paul's gospel commission links forgiveness and sanctification. Salvation is not merely pardon; it transfers us into a holy people set apart for God — sanctification begins at conversion." },
  { ref: "Romans 6:6",          refEs: "Romanos 6:6",           theme: "Death to Sin",        color: "#c9a961", text: "We know that our old self was crucified with him in order that the body of sin might be brought to nothing, so that we would no longer be enslaved to sin.", textEs: "Sabiendo esto, que nuestro viejo hombre fue crucificado juntamente con él, para que el cuerpo del pecado sea destruido, a fin de que no sirvamos más al pecado.", context: "Union with Christ in His death means our sinful nature received a lethal blow at the cross. This is the doctrinal foundation for mortification — sin has no legal claim on those who died with Christ." },
  { ref: "Romans 6:11",         refEs: "Romanos 6:11",          theme: "Reckoning Faith",     color: "#d6a652", text: "So you also must consider yourselves dead to sin and alive to God in Christ Jesus.", textEs: "Así también vosotros consideraos muertos al pecado, pero vivos para Dios en Cristo Jesús, Señor nuestro.", context: "'Consider' is an accounting term — reckon it as fact. Mortification begins with faith that the verdict of Romans 6:6 is real. We fight sin by believing we are already free from its dominion." },
  { ref: "Romans 8:13",         refEs: "Romanos 8:13",          theme: "Spirit & Mortification", color: "#cf9f56", text: "For if you live according to the flesh you will die, but if by the Spirit you put to death the deeds of the body, you will live.", textEs: "Porque si vivís conforme a la carne, moriréis; mas si por el Espíritu hacéis morir las obras de la carne, viviréis.", context: "The classic mortification text. John Owen drew his entire treatise from it: killing sin is a Spirit-empowered act, not mere self-discipline. We are the agents; the Spirit is the power." },
  { ref: "Romans 8:29",         refEs: "Romanos 8:29",          theme: "God's Goal",          color: "#c9a961", text: "For those whom he foreknew he also predestined to be conformed to the image of his Son, in order that he might be the firstborn among many brothers.", textEs: "Porque a los que antes conoció, también los predestinó para que fuesen hechos conformes a la imagen de su Hijo.", context: "Conformity to Christ is the telos of election. God did not predestine us merely to escape hell but to be holy. Sanctification is the outworking of eternal purpose — not optional." },
  { ref: "Romans 12:2",         refEs: "Romanos 12:2",          theme: "Mind Renewal",        color: "#d4a857", text: "Do not be conformed to this world, but be transformed by the renewal of your mind, that by testing you may discern what is the will of God, what is good and acceptable and perfect.", textEs: "No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento.", context: "Sanctification moves from the mind outward. The Greek 'metamorphoo' (transform) contrasts with 'syschematizo' (conform). Real change is internal — a renewed mind that sees the world through Scripture." },
  { ref: "Romans 13:14",        refEs: "Romanos 13:14",         theme: "Provision & Flesh",   color: "#dca15a", text: "But put on the Lord Jesus Christ, and make no provision for the flesh, to gratify its desires.", textEs: "Sino vestíos del Señor Jesucristo, y no proveáis para los deseos de la carne.", context: "Augustine read this verse and was converted. Mortification is partly environmental — stop arranging circumstances that feed sin. Put on Christ as armor against every temptation." },
  { ref: "1 Corinthians 1:2",   refEs: "1 Corintios 1:2",       theme: "Called to Be Holy",   color: "#caa45e", text: "To the church of God that is in Corinth, to those sanctified in Christ Jesus, called to be saints together with all those who in every place call upon the name of our Lord Jesus Christ.", textEs: "A la iglesia de Dios que está en Corinto, a los santificados en Cristo Jesús, llamados a ser santos.", context: "Written to one of the most troubled churches in the NT. Their identity is 'sanctified' even in their failures. Our calling to holiness is grounded in what God has already declared, not earned." },
  { ref: "1 Corinthians 6:11",  refEs: "1 Corintios 6:11",      theme: "Washed & Set Apart",  color: "#cf9f56", text: "But you were washed, you were sanctified, you were justified in the name of the Lord Jesus Christ and by the Spirit of our God.", textEs: "Y esto erais algunos; mas ya habéis sido lavados, ya habéis sido santificados, ya habéis sido justificados en el nombre del Señor Jesús.", context: "Paul lists former sins then declares: 'But you were…' Three aorist verbs — definitive acts. Sanctification here is positional (set apart), paired with justification, both secured through Christ and the Spirit." },
  { ref: "1 Corinthians 9:27",  refEs: "1 Corintios 9:27",      theme: "Self-Discipline",     color: "#c9a961", text: "But I discipline my body and keep it under control, lest after preaching to others I myself should be disqualified.", textEs: "Sino que golpeo mi cuerpo, y lo pongo en servidumbre, no sea que habiendo sido heraldo para otros, yo mismo venga a ser eliminado.", context: "Even the apostle Paul fought bodily desires. Spiritual leadership does not exempt anyone from the battle. The body must be trained, not indulged, or even preachers can shipwreck." },
  { ref: "2 Corinthians 7:1",   refEs: "2 Corintios 7:1",       theme: "Pursuing Holiness",   color: "#d6a652", text: "Since we have these promises, beloved, let us cleanse ourselves from every defilement of body and spirit, bringing holiness to completion in the fear of God.", textEs: "Así que, amados, puesto que tenemos tales promesas, limpiémonos de toda contaminación de carne y de espíritu, perfeccionando la santidad en el temor de Dios.", context: "Holiness is both gift and pursuit. The promises of God (being His people, dwelling with Him) are the motivation for cleansing. Fear of God — not fear of punishment alone — drives genuine sanctification." },
  { ref: "Galatians 2:20",      refEs: "Gálatas 2:20",          theme: "Crucified with Christ", color: "#d4a857", text: "I have been crucified with Christ. It is no longer I who live, but Christ who lives in me. And the life I now live in the flesh I live by faith in the Son of God, who loved me and gave himself for me.", textEs: "Con Cristo estoy juntamente crucificado, y ya no vivo yo, mas vive Cristo en mí.", context: "The old 'I' — the self-ruled, sin-enslaved ego — was nailed to the cross with Christ. The new life is Christ-indwelt and faith-sustained. This is the heart of mortification: not self-effort but Christ living through us." },
  { ref: "Galatians 5:1",       refEs: "Gálatas 5:1",           theme: "Freedom from Sin",    color: "#dca15a", text: "For freedom Christ has set us free; stand firm therefore, and do not submit again to a yoke of slavery.", textEs: "Estad, pues, firmes en la libertad con que Cristo nos hizo libres, y no estéis otra vez sujetos al yugo de esclavitud.", context: "Gospel freedom is not freedom to sin but freedom from sin's tyranny. Paul warns against returning to religious law as a means of justification — but the principle applies to any slavery that replaces Christ." },
  { ref: "Galatians 5:13",      refEs: "Gálatas 5:13",          theme: "Love vs. Flesh",      color: "#caa45e", text: "For you were called to freedom, brothers. Only do not use your freedom as an opportunity for the flesh, but through love serve one another.", textEs: "Porque vosotros, hermanos, a libertad fuisteis llamados; solamente que no uséis la libertad como ocasión para la carne, sino servid los unos a los otros por el amor.", context: "Freedom becomes a snare when it feeds self-indulgence. The antidote is not law but love — outward-focused service that leaves no room for the flesh to operate in its self-seeking mode." },
  { ref: "Galatians 5:24",      refEs: "Gálatas 5:24",          theme: "Crucifying the Flesh", color: "#cf9f56", text: "And those who belong to Christ Jesus have crucified the flesh with its passions and desires.", textEs: "Pero los que son de Cristo han crucificado la carne con sus pasiones y deseos.", context: "Belonging to Christ involves an act: crucifying sinful passions. This is not once-for-all (like our co-crucifixion in Romans 6) but ongoing mortification — daily taking the flesh to the cross through the Spirit." },
  { ref: "Galatians 6:14",      refEs: "Gálatas 6:14",          theme: "Cross & World",       color: "#c9a961", text: "But far be it from me to boast except in the cross of our Lord Jesus Christ, by which the world has been crucified to me, and I to the world.", textEs: "Pero lejos esté de mí gloriarme, sino en la cruz de nuestro Señor Jesucristo, por quien el mundo me es crucificado a mí, y yo al mundo.", context: "The cross reorients the believer's entire value system. 'The world' — its approval, pleasures, and priorities — dies to the believer at the cross. This is why boasting in the cross is the death of worldly ambition." },
  { ref: "Ephesians 2:10",      refEs: "Efesios 2:10",          theme: "Created for Holiness", color: "#d4a857", text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them.", textEs: "Porque somos hechura suya, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano para que anduviésemos en ellas.", context: "Salvation is not merely rescue from hell but creation for fruitfulness. We are God's poem (poiema — craftsmanship). Good works are not the basis of salvation but the predetermined path of the saved life." },
  { ref: "Ephesians 4:24",      refEs: "Efesios 4:24",          theme: "New Self",            color: "#dca15a", text: "…and to put on the new self, created after the likeness of God in true righteousness and holiness.", textEs: "…y vestíos del nuevo hombre, creado según Dios en la justicia y santidad de la verdad.", context: "The new self is not improved old self — it is created after the likeness of God. Sanctification is putting on what God has created: a character that reflects His righteousness and holiness in practice." },
  { ref: "Ephesians 4:31",      refEs: "Efesios 4:31",          theme: "Putting Away Sin",    color: "#caa45e", text: "Let all bitterness and wrath and anger and clamor and slander be put away from you, along with all malice.", textEs: "Quítense de vosotros toda amargura, enojo, ira, gritería y maledicencia, y toda malicia.", context: "Paul lists specific relational sins — bitterness, rage, slander. Mortification is not abstract; it targets concrete sins of the heart and tongue. These are put away, not merely managed." },
  { ref: "Ephesians 5:11",      refEs: "Efesios 5:11",          theme: "Exposing Darkness",   color: "#cf9f56", text: "Take no part in the unfruitful works of darkness, but instead expose them.", textEs: "Y no participéis en las obras infructuosas de las tinieblas, sino más bien reprendedlas.", context: "Passive avoidance of evil is not enough — the believer must actively expose darkness. This applies personally (sin cannot be hidden) and corporately (the church is a community of accountability)." },
  { ref: "Ephesians 6:11",      refEs: "Efesios 6:11",          theme: "Spiritual Warfare",   color: "#c9a961", text: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil.", textEs: "Vestíos de toda la armadura de Dios, para que podáis estar firmes contra las asechanzas del diablo.", context: "Sanctification is warfare. The enemy schemes — plans, exploits patterns of sin. The armor of God is not decorative but functional: truth, righteousness, peace, faith, salvation, Scripture. All are needed." },
  { ref: "Philippians 1:6",     refEs: "Filipenses 1:6",        theme: "God's Faithfulness",  color: "#d6a652", text: "And I am sure of this, that he who began a good work in you will bring it to completion at the day of Jesus Christ.", textEs: "Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.", context: "Sanctification is God's project, not ours alone. He who started it guarantees its completion. This is the perseverance of the saints — not that we hold on, but that He holds us through to glory." },
  { ref: "Philippians 2:13",    refEs: "Filipenses 2:13",       theme: "God Works in Us",     color: "#d4a857", text: "…for it is God who works in you, both to will and to work for his good pleasure.", textEs: "Porque Dios es el que en vosotros produce así el querer como el hacer, por su buena voluntad.", context: "The same passage commands 'work out your salvation with fear' (v.12) and immediately explains: God is working in you. Divine sovereignty and human effort coexist — God energizes the will and the action." },
  { ref: "Colossians 3:5",      refEs: "Colosenses 3:5",        theme: "Mortification",       color: "#dca15a", text: "Put to death therefore what is earthly in you: sexual immorality, impurity, passion, evil desire, and covetousness, which is idolatry.", textEs: "Haced morir, pues, lo terrenal en vosotros: fornicación, impureza, pasiones desordenadas, malos deseos y avaricia, que es idolatría.", context: "The most direct mortification command in Scripture. 'Put to death' is nekrōsate — actively kill it. Paul lists five sins of desire, culminating in covetousness as idolatry: wanting anything more than God is false worship." },
  { ref: "Colossians 3:10",     refEs: "Colosenses 3:10",       theme: "Renewed Knowledge",   color: "#caa45e", text: "…and have put on the new self, which is being renewed in knowledge after the image of its creator.", textEs: "Y revestido del nuevo, el cual conforme a la imagen del que lo creó se va renovando hasta el pleno conocimiento.", context: "Renewal is progressive and cognitive — 'being renewed in knowledge.' Sanctification reshapes how we think about reality. The new self increasingly reflects the Creator's image as we know Him more truly." },
  { ref: "Colossians 3:12",     refEs: "Colosenses 3:12",       theme: "Virtues to Put On",   color: "#cf9f56", text: "Put on then, as God's chosen ones, holy and beloved, compassionate hearts, kindness, humility, meekness, and patience.", textEs: "Vestíos, pues, como escogidos de Dios, santos y amados, de entrañable misericordia, de benignidad, de humildad, de mansedumbre, de paciencia.", context: "Mortification (put to death) must be matched by vivification (put on). Killing sin creates space; virtue must fill it. Identity as 'chosen, holy, beloved' is the motivation — we dress to match who we are." },
  { ref: "1 Thessalonians 4:3", refEs: "1 Tesalonicenses 4:3",  theme: "God's Will",          color: "#c9a961", text: "For this is the will of God, your sanctification: that you abstain from sexual immorality.", textEs: "Pues la voluntad de Dios es vuestra santificación; que os apartéis de fornicación.", context: "When believers ask 'What is God's will for my life?' this verse answers plainly: your holiness. Sexual purity is the first concrete application — Paul wrote to a culture saturated with immorality, as are we." },
  { ref: "1 Thessalonians 4:7", refEs: "1 Tesalonicenses 4:7",  theme: "Called to Holiness",  color: "#d6a652", text: "For God has not called us for impurity, but in holiness.", textEs: "Pues no nos ha llamado Dios a inmundicia, sino a santificación.", context: "The call to holiness is built into the call to salvation. God did not call us to a more decent version of the old life — He called us into a holy state. Impurity is a contradiction of our calling itself." },
  { ref: "1 Thessalonians 5:22", refEs: "1 Tesalonicenses 5:22", theme: "Abstaining from Evil", color: "#d4a857", text: "Abstain from every form of evil.", textEs: "Absteneos de toda especie de mal.", context: "A sweeping command that closes Paul's ethical instructions. Every form — not just gross sins, but subtle ones. The word 'abstain' (apechesthe) means to hold oneself away, maintaining deliberate distance from anything that participates in evil." },
  { ref: "1 Thessalonians 5:23", refEs: "1 Tesalonicenses 5:23", theme: "Complete Sanctification", color: "#dca15a", text: "Now may the God of peace himself sanctify you completely, and may your whole spirit and soul and body be kept blameless at the coming of our Lord Jesus Christ.", textEs: "Y el mismo Dios de paz os santifique por completo; y todo vuestro ser, espíritu, alma y cuerpo, sea guardado irreprensible para la venida de nuestro Señor Jesucristo.", context: "Sanctification is total — spirit, soul, and body. Nothing is exempt. And it is ultimately God's work: 'the God of peace himself' does it. We cooperate with what He initiates, sustains, and completes." },
  { ref: "2 Thessalonians 2:13", refEs: "2 Tesalonicenses 2:13", theme: "Election & Holiness", color: "#caa45e", text: "But we ought always to give thanks to God for you, brothers beloved by the Lord, because God chose you as the firstfruits to be saved, through sanctification by the Spirit and belief in the truth.", textEs: "Pero nosotros debemos dar siempre gracias a Dios respecto a vosotros, hermanos amados por el Señor, de que Dios os haya escogido desde el principio para salvación, mediante la santificación por el Espíritu y la fe en la verdad.", context: "Election and sanctification are inseparable. God's sovereign choice does not bypass the Spirit's sanctifying work — it operates through it. Both the Spirit's work and personal faith are instruments of salvation." },
  { ref: "2 Timothy 2:21",      refEs: "2 Timoteo 2:21",        theme: "Vessels of Honor",    color: "#cf9f56", text: "Therefore, if anyone cleanses himself from what is dishonorable, he will be a vessel for honorable use, set apart as holy, useful to the master of the house, ready for every good work.", textEs: "Así que, si alguno se limpia de estas cosas, será instrumento para honra, santificado, útil al Señor, y dispuesto para toda buena obra.", context: "Holiness is prerequisite for usefulness in God's service. The image is household vessels: only clean ones are used for the table of honor. Our fitness for God's purposes depends on our purity." },
  { ref: "2 Timothy 2:22",      refEs: "2 Timoteo 2:22",        theme: "Flee & Pursue",       color: "#c9a961", text: "So flee youthful passions and pursue righteousness, faith, love, and peace, along with those who call on the Lord from a pure heart.", textEs: "Huye también de las pasiones juveniles, y sigue la justicia, la fe, el amor y la paz, con los que de corazón limpio invocan al Señor.", context: "Two movements: flee and pursue. Mortification has a direction — away from passion, toward virtue. Critically, this is done 'with those who call on the Lord' — sanctification is communal, not solitary." },
  { ref: "Hebrews 10:10",       refEs: "Hebreos 10:10",         theme: "Sanctified by Christ", color: "#d4a857", text: "And by that will we have been sanctified through the offering of the body of Jesus Christ once for all.", textEs: "En esa voluntad somos santificados mediante la ofrenda del cuerpo de Jesucristo hecha una vez para siempre.", context: "Definitive sanctification — accomplished at the cross, once for all. Christ's offering is the only ground of our holy standing before God. Progressive sanctification flows from this secured foundation." },
  { ref: "Hebrews 10:14",       refEs: "Hebreos 10:14",         theme: "Perfected & Ongoing", color: "#dca15a", text: "For by a single offering he has perfected for all time those who are being sanctified.", textEs: "Porque con una sola ofrenda hizo perfectos para siempre a los que son santificados.", context: "Both tenses simultaneously: 'perfected' (complete) and 'being sanctified' (ongoing). We are positionally complete and progressively advancing — both truths are essential to a healthy view of sanctification." },
  { ref: "Hebrews 12:1",        refEs: "Hebreos 12:1",          theme: "Running the Race",    color: "#caa45e", text: "Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us.", textEs: "Por tanto, nosotros también, teniendo en derredor nuestro tan grande nube de testigos, despojémonos de todo peso y del pecado que nos asedia, y corremos con paciencia la carrera que tenemos por delante.", context: "The metaphor is athletic. Weights are not sinful things but even good things that slow the runner. Sin 'clings closely' — it is the garment that entangles. Both must go for the race to be run with endurance." },
  { ref: "Hebrews 12:14",       refEs: "Hebreos 12:14",         theme: "Holiness Required",   color: "#cf9f56", text: "Strive for peace with everyone, and for the holiness without which no one will see the Lord.", textEs: "Seguid la paz con todos, y la santidad, sin la cual nadie verá al Señor.", context: "One of the most sobering texts on holiness. 'Holiness' here is not perfection but the genuine pursuit of it — without which there is no vision of God. This is not a works-righteousness statement but a proof-of-regeneration one." },
  { ref: "Hebrews 13:12",       refEs: "Hebreos 13:12",         theme: "Sanctified by Blood",  color: "#c9a961", text: "So Jesus also suffered outside the gate in order to sanctify the people through his own blood.", textEs: "Por lo cual también Jesús, para santificar al pueblo mediante su propia sangre, padeció fuera de la puerta.", context: "Christ's suffering outside the city gate — the place of shame and rejection — was the price of our sanctification. Holiness cost Him everything. This grounds our pursuit of holiness in gratitude, not self-achievement." },
  { ref: "James 1:21",          refEs: "Santiago 1:21",         theme: "Receiving the Word",  color: "#d6a652", text: "Therefore put away all filthiness and rampant wickedness and receive with meekness the implanted word, which is able to save your souls.", textEs: "Por lo cual, desechando toda inmundicia y abundancia de malicia, recibid con mansedumbre la palabra implantada, la cual puede salvar vuestras almas.", context: "The Word is implanted — already within the believer by the Spirit. But it must be received with meekness: teachableness, humility, a readiness to be corrected. Soil preparation (putting away sin) enables the word to bear fruit." },
  { ref: "1 Peter 1:2",         refEs: "1 Pedro 1:2",           theme: "Spirit's Work",       color: "#d4a857", text: "…according to the foreknowledge of God the Father, in the sanctification of the Spirit, for obedience to Jesus Christ and for sprinkling with his blood.", textEs: "…elegidos según la presciencia de Dios Padre en santificación del Espíritu, para obedecer y ser rociados con la sangre de Jesucristo.", context: "Trinitarian sanctification: the Father foreknows, the Spirit sanctifies, the Son's blood cleanses. The goal is obedience — sanctification is not an inward spiritual luxury but produces external conformity to Christ's lordship." },
  { ref: "1 Peter 1:15",        refEs: "1 Pedro 1:15",          theme: "Be Holy",             color: "#dca15a", text: "…but as he who called you is holy, you also be holy in all your conduct.", textEs: "Sino, como aquel que os llamó es santo, sed también vosotros santos en toda vuestra manera de vivir.", context: "Holiness is the family resemblance of God's children. 'All your conduct' — not just religious activities but every domain of life. The standard is God's own character, which motivates awe rather than legalism." },
  { ref: "1 Peter 2:1",         refEs: "1 Pedro 2:1",           theme: "Putting Sin Away",    color: "#caa45e", text: "So put away all malice and all deceit and hypocrisy and envy and all slander.", textEs: "Desechando, pues, toda malicia, todo engaño, hipocresía, envidias, y todas las detracciones.", context: "Preparation for spiritual growth: before the positive (craving the Word), the negative (putting away sin). Like weeding before planting, removing malice and deceit creates space for the Word to nourish." },
  { ref: "1 Peter 2:11",        refEs: "1 Pedro 2:11",          theme: "War on the Flesh",    color: "#cf9f56", text: "Beloved, I urge you as sojourners and exiles to abstain from the passions of the flesh, which wage war against your soul.", textEs: "Amados, yo os ruego como a extranjeros y peregrinos, que os abstengáis de los deseos carnales que batallan contra el alma.", context: "We are strangers here — citizens of a kingdom our sinful passions cannot inherit. 'Wage war' is not metaphor: fleshly desires are an active insurgency against the soul. Abstaining is refusing to supply the enemy." },
  { ref: "2 Peter 1:3",         refEs: "2 Pedro 1:3",           theme: "Divine Resources",    color: "#c9a961", text: "His divine power has granted to us all things that pertain to life and godliness, through the knowledge of him who called us to his own glory and excellence.", textEs: "Como todas las cosas que pertenecen a la vida y a la piedad nos han sido dadas por su divino poder, mediante el conocimiento de aquel que nos llamó por su gloria y excelencia.", context: "The basis of all mortification and sanctification: God has already supplied everything needed. We do not pursue holiness by striving for resources we lack but by drawing on resources already given through knowing Christ." },
  { ref: "1 John 1:9",          refEs: "1 Juan 1:9",            theme: "Confession & Cleansing", color: "#d6a652", text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.", textEs: "Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados, y limpiarnos de toda maldad.", context: "Mortification includes confession — bringing sin into the light of God's presence. The promise is double: forgiveness (guilt removed) and cleansing (corruption addressed). God's faithfulness, not our contrition, is the guarantee." },
  { ref: "1 John 2:15",         refEs: "1 Juan 2:15",           theme: "Not Loving the World", color: "#d4a857", text: "Do not love the world or the things in the world. If anyone loves the world, the love of the Father is not in him.", textEs: "No améis al mundo, ni las cosas que están en el mundo. Si alguno ama al mundo, el amor del Padre no está en él.", context: "Worldly love and love for the Father are mutually exclusive. 'World' here is not creation but the fallen system organized without God. Killing sin means uprooting the loves that rival God in our hearts." },
];

const MEM_STORAGE_KEY = "ryc-mem-verse-state-v2";

interface CustomVerse { ref: string; text: string; }

interface MemState {
  committedRef: string | null;  // verse the user chose to memorize; null = daily recommendation
  mastered: string[];           // refs user has mastered
  hiddenWords: number[];        // indices of currently hidden words
  revealedAll: boolean;
  mode: "learn" | "test";
  customVerses: CustomVerse[];  // user-added verses
}

const DEFAULT_MEM_STATE: MemState = {
  committedRef: null,
  mastered: [],
  hiddenWords: [],
  revealedAll: false,
  mode: "learn",
  customVerses: [],
};

// Day-of-year index — drives which recommended verse appears each day.
function dayOfYearIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

// ─── Grace Gems Article Reader ────────────────────────────────────────────────

function GgArticleReader({
  title, author, authorYears, content: localContent, image, lang, onClose,
}: { title: string; author: string; authorYears?: string; url?: string; content?: string; image?: string; lang: string; onClose: () => void }) {
  const englishContent = localContent ?? "";
  const [esTitle, setEsTitle]     = React.useState<string | null>(null);
  const [esContent, setEsContent] = React.useState<string | null>(null);
  const [translating, setTranslating] = React.useState(false);

  const isEs = lang === "es";
  const content  = isEs ? (esContent ?? englishContent) : englishContent;
  const artTitle = isEs ? (esTitle ?? title) : title;
  const status: "ready" | "fallback" = englishContent.length > 0 ? "ready" : "fallback";

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  // Auto-translate the whole article to Spanish (cached) — same approach as Family Worship
  React.useEffect(() => {
    if (!isEs || !englishContent) { setEsTitle(null); setEsContent(null); return; }
    let cancelled = false;
    setTranslating(true);
    (async () => {
      try {
        const [t, c] = await Promise.all([
          translateToSpanish(title, `art_title_${title}`),
          translateToSpanish(englishContent, `art_body_${title}`),
        ]);
        if (!cancelled) { setEsTitle(t); setEsContent(c); }
      } catch {
        /* leave English text if translation fails */
      } finally {
        if (!cancelled) setTranslating(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEs, englishContent, title]);

  return (
    <div className="fixed inset-0 z-[250] flex flex-col" style={{ background: "#0a0b14", paddingTop: "env(safe-area-inset-top)" }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: "rgba(201,169,97,0.60)" }}>
            {author}
          </p>
          <p className="text-[13px] font-bold text-white leading-tight truncate">{artTitle || title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ minHeight: 0 }}>
        {status === "ready" && (
          <div className="px-5 pt-6 pb-16">
            {image && (
              <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid rgba(201,169,97,0.22)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`Portrait — ${author}`} className="w-full object-cover" style={{ maxHeight: 280 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
            )}
            <h1 className="text-[22px] font-bold leading-snug mb-1" style={{ color: "#c9a961", fontFamily: "'Iowan Old Style','Georgia',serif" }}>
              {artTitle || title}
            </h1>
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {lang === "es" ? "por" : "by"} {author}{authorYears ? ` · ${authorYears}` : ""}
            </p>
            {lang === "es" && translating && (
              <p className="text-[11px] mt-2 flex items-center gap-2" style={{ color: "rgba(201,169,97,0.65)" }}>
                <span className="inline-block w-3 h-3 rounded-full animate-spin" style={{ border: "2px solid rgba(201,169,97,0.25)", borderTopColor: "#c9a961" }} />
                Traduciendo al español…
              </p>
            )}
            <div className="mb-7" />
            <div style={{ fontFamily: "'Iowan Old Style','Georgia',serif" }}>
              {content.split(/\n\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="text-[16px] leading-[1.85] mb-5" style={{ color: "rgba(255,255,255,0.82)" }}>
                  {para.trim()}
                </p>
              ))}
            </div>
          </div>
        )}

        {status === "fallback" && (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-8 text-center">
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.40)" }}>Article text coming soon.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Verse Memorization Widget ─────────────────────────────────────────────────

function VerseMemorizationWidget({
  lang,
  isLight,
  heroH1Color,
  sectionHdColor,
}: {
  lang: string;
  isLight: boolean;
  heroH1Color?: string;
  sectionHdColor?: string;
}) {
  const [fullScreen, setFullScreen]   = useState(false);
  const [customMode, setCustomMode]   = useState(false);
  const [customRef,  setCustomRef]    = useState("");
  const [customText, setCustomText]   = useState("");

  // Auto-fit: scale the verse text in full-screen so the whole verse is visible without scrolling
  const verseTextRef = React.useRef<HTMLParagraphElement>(null);
  const [fitPx, setFitPx] = useState(22);

  // Persisted state (hydrate from localStorage after mount to avoid SSR mismatch)
  const [memState, setMemState] = useState<MemState>(DEFAULT_MEM_STATE);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEM_STORAGE_KEY);
      if (raw) setMemState({ ...DEFAULT_MEM_STATE, ...(JSON.parse(raw) as Partial<MemState>) });
    } catch { /* ignore */ }
  }, []);

  const saveState = (s: MemState) => {
    setMemState(s);
    try { localStorage.setItem(MEM_STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  };

  // Combined pool: built-in attribute verses + the user's own verses
  const customAsVerses: MemVerse[] = memState.customVerses.map((c) => ({
    ref: c.ref, refEs: c.ref, text: c.text, textEs: c.text,
    theme: lang === "es" ? "Personal" : "My Verse", color: "#c9a961",
    context: "",
  }));
  const allVerses: MemVerse[] = [...MEM_VERSES, ...customAsVerses];

  // Daily recommendation — rotates each day through not-yet-mastered attributes of God
  const recommendPool = MEM_VERSES.filter((v) => !memState.mastered.includes(v.ref));
  const recList = recommendPool.length > 0 ? recommendPool : MEM_VERSES;
  const dailyVerse = recList[dayOfYearIndex() % recList.length];

  const isCommitted = memState.committedRef !== null;
  const activeVerse =
    (isCommitted ? allVerses.find((v) => v.ref === memState.committedRef) : dailyVerse) ?? dailyVerse;

  const verseText = lang === "es" ? activeVerse.textEs : activeVerse.text;
  const verseRef  = lang === "es" ? activeVerse.refEs  : activeVerse.ref;
  const words = verseText.split(/\s+/);

  const accentColor = "#c9a961";  // Gold Navy accent throughout
  const isMastered = memState.mastered.includes(activeVerse.ref);
  const remaining = MEM_VERSES.filter((v) => !memState.mastered.includes(v.ref)).length;

  // In test mode: toggle word visibility
  const toggleWord = (i: number) => {
    if (memState.mode !== "test") return;
    const hidden = memState.hiddenWords.includes(i)
      ? memState.hiddenWords.filter((w) => w !== i)
      : [...memState.hiddenWords, i];
    saveState({ ...memState, hiddenWords: hidden, revealedAll: false });
  };

  // Commit to the currently-shown verse → locks it in so it no longer rotates daily
  const commitVerse = (ref: string) => {
    saveState({ ...memState, committedRef: ref, hiddenWords: [], revealedAll: false, mode: "learn" });
  };

  const markMastered = () => {
    const mastered = [...new Set([...memState.mastered, activeVerse.ref])];
    // return to the daily recommendation, which now skips mastered verses
    saveState({ ...memState, committedRef: null, mastered, hiddenWords: [], revealedAll: false, mode: "learn" });
  };

  // Stop memorizing the committed verse and go back to the daily recommendation
  const releaseVerse = () =>
    saveState({ ...memState, committedRef: null, hiddenWords: [], revealedAll: false, mode: "learn" });

  const changeVerse = (ref: string) => {
    if (ref === "__custom__") { setCustomMode(true); return; }
    commitVerse(ref);
  };

  const startTest = () => {
    // Hide ~40% of words randomly to start
    const count = Math.ceil(words.length * 0.4);
    const indices: number[] = [];
    while (indices.length < count) {
      const r = Math.floor(Math.random() * words.length);
      if (!indices.includes(r)) indices.push(r);
    }
    saveState({ ...memState, mode: "test", hiddenWords: indices, revealedAll: false });
  };

  const revealAll = () => saveState({ ...memState, hiddenWords: [], revealedAll: true });
  const resetToLearn = () => saveState({ ...memState, mode: "learn", hiddenWords: [], revealedAll: false });

  const addCustomVerse = () => {
    if (!customText.trim()) return;
    const cv: CustomVerse = {
      ref: customRef.trim() || (lang === "es" ? "Mi Versículo" : "My Verse"),
      text: customText.trim(),
    };
    const customVerses = [...memState.customVerses, cv];
    setCustomMode(false);
    setCustomRef(""); setCustomText("");
    saveState({ ...memState, customVerses, committedRef: cv.ref, hiddenWords: [], revealedAll: false, mode: "learn" });
  };

  // Lock body scroll in fullscreen
  useEffect(() => {
    if (fullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [fullScreen]);

  // Fit the verse to the screen (binary-search a font size so it never needs scrolling)
  useEffect(() => {
    if (!fullScreen || memState.mode !== "learn") return;
    const fit = () => {
      const el = verseTextRef.current;
      if (!el) return;
      // Budget the verse roughly half the viewport so it's fully visible up top
      const target = Math.min(Math.max(window.innerHeight * 0.44, 200), 560);
      let lo = 15, hi = 32, best = 15;
      el.style.lineHeight = "1.55";
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        el.style.fontSize = `${mid}px`;
        if (el.scrollHeight <= target) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
      }
      el.style.fontSize = `${best}px`;
      setFitPx(best);
    };
    const id = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", fit); };
  }, [fullScreen, verseText, memState.mode]);

  const cardContent = (inFull: boolean) => (
    <div className={`relative flex flex-col ${inFull ? "h-full" : ""}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: accentColor }}>
            {isCommitted
              ? (lang === "es" ? "Memorizando" : "Memorizing")
              : (lang === "es" ? "Versículo de Hoy" : "Today's Verse")} · {activeVerse.theme}
          </p>
          <p className="text-[18px] font-bold text-white mt-0.5">{verseRef}</p>
          {isCommitted && !isMastered && (
            <span
              className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}33` }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-4 1-2 2 1 4-3-1-4 4-1-4-4-1 4-4-1-3 4 1 2-2 1-4z"/></svg>
              {lang === "es" ? "Fijado hasta completar" : "Pinned until complete"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isMastered && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}>
              ✓ {lang === "es" ? "Memorizado" : "Mastered"}
            </span>
          )}
          {!inFull && (
            <button
              onClick={() => setFullScreen(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              style={{ background: "rgba(255,255,255,0.06)" }}
              title={lang === "es" ? "Pantalla completa" : "Full screen"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Verse display */}
      <div
        className={`flex-1 rounded-2xl p-4 mb-4 ${inFull ? (memState.mode === "learn" ? "flex items-center justify-center" : "overflow-y-auto") : ""}`}
        style={{
          background: `linear-gradient(135deg, ${accentColor}14, rgba(26,29,39,0.6))`,
          border: `1px solid ${accentColor}28`,
          ...(inFull && memState.mode === "learn" ? { maxHeight: "56vh" } : {}),
        }}
      >
        {memState.mode === "learn" ? (
          // Learn mode — full verse visible, auto-sized in full screen so it never scrolls
          <p
            ref={inFull ? verseTextRef : undefined}
            className={`text-white/85 ${inFull ? "text-center leading-[1.55]" : "text-[14px] leading-[1.75]"}`}
            style={{ fontFamily: "'Iowan Old Style','Georgia',serif", ...(inFull ? { fontSize: `${fitPx}px` } : {}) }}
          >
            &ldquo;{verseText}&rdquo;
          </p>
        ) : (
          // Test mode — tap words to reveal/hide
          <div className="flex flex-wrap gap-1.5 leading-loose">
            {words.map((word, i) => {
              const hidden = memState.hiddenWords.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleWord(i)}
                  className={`inline-block rounded px-1 py-0.5 transition-all ${inFull ? "text-[17px]" : "text-[14px]"}`}
                  style={{
                    fontFamily: "'Iowan Old Style','Georgia',serif",
                    background: hidden ? `${accentColor}30` : "transparent",
                    color: hidden ? "transparent" : "rgba(255,255,255,0.85)",
                    border: hidden ? `1px solid ${accentColor}40` : "1px solid transparent",
                    minWidth: `${Math.max(word.length * 0.55, 1.5)}ch`,
                    minHeight: "1.5rem",
                    cursor: "pointer",
                  }}
                >
                  {hidden ? "▪".repeat(Math.min(word.replace(/[^a-zA-Z]/g, "").length, 8)) : word}
                </button>
              );
            })}
            {memState.revealedAll && (
              <p className="w-full text-[10px] mt-2 font-bold" style={{ color: accentColor }}>
                {lang === "es" ? "¡Todo revelado! Inténtalo de memoria." : "All revealed — try it from memory!"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Context summary — shown in learn mode */}
      {memState.mode === "learn" && (activeVerse as MemVerse & { context?: string }).context && (
        <div
          className="mb-4 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(201,169,97,0.06)", border: "1px solid rgba(201,169,97,0.13)" }}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-1" style={{ color: "rgba(201,169,97,0.60)" }}>
            {lang === "es" ? "Contexto" : "Context"}
          </p>
          <p className="text-[11.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.52)" }}>
            {(activeVerse as MemVerse & { context?: string }).context}
          </p>
        </div>
      )}

      {/* Mode toggle hint */}
      {isCommitted && memState.mode === "test" && (
        <p className="text-[10px] text-white/35 text-center mb-3">
          {lang === "es" ? "Toca cada palabra para revelarla u ocultarla" : "Tap any word to reveal or hide it"}
        </p>
      )}

      {/* Action buttons */}
      {!isCommitted ? (
        // ── Daily-recommendation state: invite the user to commit ──
        <>
          <button
            onClick={() => commitVerse(activeVerse.ref)}
            className="w-full py-3 rounded-xl text-[14px] font-extrabold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #d9b970, #c9a961)", color: "#0e1018", boxShadow: "0 6px 20px rgba(201,169,97,0.30)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
            {lang === "es" ? "Memorizar este versículo" : "Memorize this verse"}
          </button>
          <p className="text-[10.5px] text-white/35 text-center mt-2.5 leading-relaxed">
            {lang === "es"
              ? "49 versículos sobre santificación y la mortificación del pecado. Rota diariamente."
              : "49 verses on sanctification & killing sin — rotates daily until you choose one."}
          </p>
        </>
      ) : memState.mode === "learn" ? (
        <div className="flex gap-2">
          <button
            onClick={startTest}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            {lang === "es" ? "Ponerse a Prueba" : "Test Myself"}
          </button>
          <button
            onClick={markMastered}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.30)" }}
          >
            {lang === "es" ? "Lo Memoricé →" : "I Mastered It →"}
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={revealAll}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            {lang === "es" ? "Ver Todo" : "Reveal All"}
          </button>
          <button
            onClick={resetToLearn}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            {lang === "es" ? "← Volver" : "← Back"}
          </button>
          <button
            onClick={markMastered}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.30)" }}
          >
            {lang === "es" ? "¡Memoricé!" : "Mastered!"}
          </button>
        </div>
      )}

      {/* Release / switch row — only when a verse is committed */}
      {isCommitted && (
        <button
          onClick={releaseVerse}
          className="mt-3 mx-auto text-[10.5px] font-semibold text-white/40 hover:text-white/70 transition-colors"
        >
          {lang === "es" ? "↺ Elegir otro versículo" : "↺ Choose a different verse"}
        </button>
      )}

      {/* Progress bar */}
      {MEM_VERSES.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold tracking-wider text-white/30 uppercase">
              {lang === "es" ? "Progreso" : "Progress"} — {memState.mastered.length}/{MEM_VERSES.length}
            </span>
            <span className="text-[9px] font-bold" style={{ color: accentColor }}>
              {remaining > 0 ? `${remaining} ${lang === "es" ? "restantes" : "remaining"}` : (lang === "es" ? "¡Todos dominados!" : "All mastered!")}
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(memState.mastered.length / MEM_VERSES.length) * 100}%`, background: accentColor }}
            />
          </div>
        </div>
      )}

      {/* Verse picker */}
      {inFull && (
        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30 mb-3">
            {lang === "es" ? "Atributos de Dios" : "Attributes of God"}
          </p>
          <div className="flex flex-col gap-1.5 max-h-[28vh] overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
            {allVerses.map((v) => {
              const isCur = activeVerse.ref === v.ref;
              const isMast = memState.mastered.includes(v.ref);
              return (
                <button
                  key={v.ref}
                  onClick={() => changeVerse(v.ref)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: isCur ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isCur ? accentColor + "40" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  <div>
                    <p className="text-[12px] font-bold text-white">{lang === "es" ? v.refEs : v.ref}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: accentColor + "bb" }}>{v.theme}</p>
                  </div>
                  {isMast && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "#10b981", flexShrink: 0 }}>
                      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
            {/* Custom verse option */}
            <button
              onClick={() => setCustomMode(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{ background: "rgba(201,169,97,0.06)", border: "1px solid rgba(201,169,97,0.20)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a961" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              <p className="text-[12px] font-bold" style={{ color: "#c9a961" }}>
                {lang === "es" ? "Agregar mi propio versículo" : "Add my own verse"}
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Full-screen overlay ──────────────────────────────────────────────── */}
      {fullScreen && (
        <div
          className="fixed inset-0 z-[400] flex flex-col"
          style={{
            background: "radial-gradient(circle at 50% 0%, #161a26 0%, #0e1018 55%)",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Back arrow */}
          <div className="flex items-center px-5 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(201,169,97,0.14)" }}>
            <button
              onClick={() => setFullScreen(false)}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              <span className="text-[13px] font-semibold">{lang === "es" ? "Volver" : "Back"}</span>
            </button>
            <div className="flex-1" />
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: accentColor }}>
              {lang === "es" ? "Memorización" : "Memorization"}
            </p>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 max-w-lg w-full mx-auto">
            {cardContent(true)}
          </div>
        </div>
      )}

      {/* ── Custom verse modal ───────────────────────────────────────────────── */}
      {customMode && (
        <div
          className="fixed inset-0 z-[450] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(6px)" }}
          onClick={() => setCustomMode(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-6 pb-10"
            style={{ background: "#1a1d27", border: "1px solid rgba(201,169,97,0.22)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[15px] font-bold text-white">{lang === "es" ? "Agregar mi versículo" : "Add My Verse"}</p>
              <button onClick={() => setCustomMode(false)} className="text-white/40 hover:text-white/70">✕</button>
            </div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-white/35 mb-1.5">
              {lang === "es" ? "Referencia (ej. Juan 3:16)" : "Reference (e.g. John 3:16)"}
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-xl text-[14px] text-white mb-3 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,97,0.22)" }}
              value={customRef}
              onChange={(e) => setCustomRef(e.target.value)}
              placeholder="John 3:16"
            />
            <label className="block text-[10px] font-bold tracking-widest uppercase text-white/35 mb-1.5">
              {lang === "es" ? "Texto del versículo" : "Verse text"}
            </label>
            <textarea
              className="w-full px-3 py-2.5 rounded-xl text-[14px] text-white outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,97,0.22)" }}
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={lang === "es" ? "Escribe o pega el versículo aquí…" : "Type or paste the verse here…"}
            />
            <button
              onClick={addCustomVerse}
              disabled={!customText.trim()}
              className="mt-4 w-full py-3 rounded-xl text-[14px] font-bold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #d9b970, #c9a961)", color: "#0e1018" }}
            >
              {lang === "es" ? "Memorizar este versículo" : "Memorize This Verse"}
            </button>
          </div>
        </div>
      )}

      {/* ── Compact card on homepage ─────────────────────────────────────────── */}
      <section className="mt-9">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-white" style={sectionHdColor ? { color: sectionHdColor } : {}}>
            {lang === "es" ? "Memorización Bíblica" : "Bible Memorization"}
          </h3>
          <button
            onClick={() => setFullScreen(true)}
            className="text-[11px] font-bold transition-colors"
            style={{ color: "rgba(201,169,97,0.7)" }}
          >
            {lang === "es" ? "Abrir →" : "Open →"}
          </button>
        </div>

        <div
          className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(201,169,97,0.13), rgba(26,29,39,0.85))",
            border: "1px solid rgba(201,169,97,0.26)",
          }}
          onClick={() => setFullScreen(true)}
        >
          {/* Reference + theme */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] mb-0.5" style={{ color: accentColor }}>
                {isCommitted
                  ? (lang === "es" ? "Memorizando" : "Memorizing")
                  : (lang === "es" ? "Versículo de Hoy" : "Today's Verse")} · {activeVerse.theme}
              </p>
              <p className="text-[16px] font-bold text-white">{verseRef}</p>
            </div>
            {isMastered ? (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.30)" }}>
                ✓ {lang === "es" ? "Memorizado" : "Mastered"}
              </span>
            ) : (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${accentColor}1f`, color: accentColor, border: `1px solid ${accentColor}3a` }}>
                {isCommitted
                  ? (memState.mode === "learn" ? (lang === "es" ? "Aprender" : "Learn") : (lang === "es" ? "Prueba" : "Test"))
                  : (lang === "es" ? "Nuevo hoy" : "New today")}
              </span>
            )}
          </div>

          {/* Verse preview — full text, no clipping */}
          <p className="text-[12.5px] text-white/70 leading-relaxed italic mb-3" style={{ fontFamily: "'Iowan Old Style','Georgia',serif" }}>
            &ldquo;{verseText}&rdquo;
          </p>

          {/* CTA row */}
          {!isCommitted ? (
            <button
              onClick={(e) => { e.stopPropagation(); commitVerse(activeVerse.ref); }}
              className="w-full py-2.5 rounded-xl text-[12.5px] font-extrabold transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #d9b970, #c9a961)", color: "#0e1018" }}
            >
              {lang === "es" ? "Memorizar este versículo" : "Memorize this verse"}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(memState.mastered.length / MEM_VERSES.length) * 100}%`, background: accentColor }}
                />
              </div>
              <span className="text-[10px] font-bold text-white/35 flex-shrink-0">
                {memState.mastered.length}/{MEM_VERSES.length}
              </span>
              <span className="text-[11px] font-bold flex-shrink-0" style={{ color: accentColor }}>
                {lang === "es" ? "Continuar →" : "Continue →"}
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const today = new Date();
  const { lang } = useLanguage();
  const hvPool = lang === "es" ? HISTORY_VERSES_ES : HISTORY_VERSES;
  const todayHV = hvPool[today.getDate() % hvPool.length];

  const [streakData,       setStreakData]       = useState<StreakData | null>(null);
  const [newBadgeIds,      setNewBadgeIds]      = useState<BadgeId[]>([]);
  const [toastVisible,     setToastVisible]     = useState(false);
  const [devotionalBadges, setDevotionalBadges] = useState<DevotionalBadgeId[]>([]);
  const [videoOpen,        setVideoOpen]        = useState(false);
  const [historyOpen,      setHistoryOpen]      = useState(false);
  const featuredVideo = FEATURED_VIDEOS[lang as "en" | "es"] ?? FEATURED_VIDEOS.en;

  // Articles
  const [articles,       setArticles]       = useState<MarrowArticle[]>([]);
  const [articleLoading, setArticleLoading] = useState(false);

  // In-app article reader (Marrow)
  const [openArticle,    setOpenArticle]    = useState<MarrowArticle | null>(null);
  const [articleContent, setArticleContent] = useState<ArticleContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  // In-app Grace Gems reader
  const [ggReader, setGgReader] = useState<{ title: string; author: string; authorYears?: string; url: string; content?: string; image?: string } | null>(null);

  // Theme detection — drives background glow color
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === "undefined") return "premium-neon";
    return localStorage.getItem("ryc-theme") ?? "premium-neon";
  });
  useEffect(() => {
    const sync = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail as string | undefined;
      setTheme(detail ?? localStorage.getItem("ryc-theme") ?? "premium-neon");
    };
    sync();
    window.addEventListener("ryc-theme-change", sync);
    return () => window.removeEventListener("ryc-theme-change", sync);
  }, []);

  // Streak / badges
  useEffect(() => {
    const prev = loadStreak();
    const next = recordLogin();
    const earned = getNewBadges(prev, next);
    setStreakData(next);
    if (earned.length > 0) {
      setNewBadgeIds(earned);
      setToastVisible(true);
      const timer = setTimeout(() => setToastVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const dp = loadDevotionalProgress();
    setDevotionalBadges(dp.badges as DevotionalBadgeId[]);
  }, []);

  // Fetch articles
  useEffect(() => {
    setArticleLoading(true);
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => { if (data.articles?.length) setArticles(data.articles); })
      .catch(() => {})
      .finally(() => setArticleLoading(false));
  }, []);

  // Lock body scroll when article reader is open
  useEffect(() => {
    if (openArticle) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [openArticle]);

  // Open article in-app reader
  const openArticleModal = async (article: MarrowArticle) => {
    setOpenArticle(article);
    setArticleContent(null);
    setContentLoading(true);
    try {
      const r = await fetch(`/api/articles/content?url=${encodeURIComponent(article.href)}`);
      const data = await r.json();
      setArticleContent(data);
    } catch {
      setArticleContent({ title: article.title, date: article.date, content: "Could not load article." });
    } finally {
      setContentLoading(false);
    }
  };

  // Weekly article pick
  const weeklyArticle = (() => {
    if (articles.length === 0) return null;
    const base = weekIndex() % articles.length;
    for (let i = 0; i < articles.length; i++) {
      const c = articles[(base + i) % articles.length];
      const combined = c.title + c.excerpt + c.href;
      if (/youtube\.com|youtu\.be|marrow\s*show|in this episode|\/marrow-show/i.test(combined)) continue;
      return c;
    }
    return articles[base];
  })();

  const isPremiumNeon   = theme === "premium-neon";
  const isGoldNavy      = theme === "gold-navy";
  const isLightPink     = theme === "light-pink";
  const isLightElegant  = theme === "light-elegant";

  // Continue card backgrounds — match the active theme
  const meditCardBg = isPremiumNeon
    ? "linear-gradient(135deg, #2a0a45, #10052a)"
    : isGoldNavy
    ? "linear-gradient(135deg, #151821, #0e1018)"
    : isLightPink
    ? "linear-gradient(135deg, #fce4f0, #f5c9e3)"
    : isLightElegant
    ? "linear-gradient(135deg, #ede4d4, #f5efe5)"
    : "linear-gradient(135deg, #1a4a3a, #0a1f18)";

  const articleCardBg = isPremiumNeon
    ? "linear-gradient(135deg, #051828, #020c18)"
    : isGoldNavy
    ? "linear-gradient(135deg, #131620, #0e1018)"
    : isLightPink
    ? "linear-gradient(135deg, #fdeaf5, #f8d5ec)"
    : isLightElegant
    ? "linear-gradient(135deg, #e8dece, #f0e8da)"
    : "linear-gradient(135deg, #4a2a1a, #1f140a)";

  const bookCardBg = isPremiumNeon
    ? "linear-gradient(135deg, #031828, #010c14)"
    : isGoldNavy
    ? "linear-gradient(135deg, rgba(201,169,97,0.18) 0%, #14172280 40%, #0e1018 100%)"
    : isLightPink
    ? "linear-gradient(135deg, #e0f2fe, #bae6fd)"
    : isLightElegant
    ? "linear-gradient(135deg, #e5ddd0, #ede5d8)"
    : "linear-gradient(135deg, #0a2a3a, #041218)";

  const historicalCardBg = isPremiumNeon
    ? "linear-gradient(135deg, #1a1005, #0a0800)"
    : isGoldNavy
    ? "linear-gradient(135deg, rgba(201,169,97,0.14) 0%, #1a1d2780 40%, #0e1018 100%)"
    : isLightPink
    ? "linear-gradient(135deg, #fef9ee, #fef3c7)"
    : isLightElegant
    ? "linear-gradient(135deg, #f0e8d8, #f8f2e8)"
    : "linear-gradient(135deg, #2a1a05, #120b00)";

  // Card label/text colors per theme
  const meditLabelColor   = isLightPink ? "#9d174d" : isLightElegant ? "#7c5c2e" : isGoldNavy ? "#c9a961" : undefined;
  const articleLabelColor = isLightPink ? "#9d174d" : isLightElegant ? "#7c5c2e" : isGoldNavy ? "#c9a961" : undefined;
  const goldNavyLabel     = isGoldNavy ? "#c9a961" : undefined;
  const cardTextColor     = isLightPink ? "#4a0020" : isLightElegant ? "#1a1209" : undefined;
  const cardSubTextColor  = isLightPink ? "rgba(74,0,32,0.45)" : isLightElegant ? "rgba(26,18,9,0.45)" : undefined;
  const cardIconBg        = isLightPink ? "rgba(219,39,119,0.15)" : isLightElegant ? "rgba(124,92,46,0.15)" : isGoldNavy ? "rgba(201,169,97,0.20)" : "rgba(0,0,0,0.40)";

  // Hero text colors — light themes need dark text instead of white
  const isLight = isLightElegant || isLightPink;
  const heroH1Color    = isLightElegant ? "#1c1409"                  : isLightPink ? "#4a0020"                  : undefined;
  const heroH2Color    = isLightElegant ? "rgba(28,20,9,0.50)"       : isLightPink ? "rgba(74,0,32,0.45)"       : undefined;
  const heroYearColor  = isLightElegant ? "rgba(28,20,9,0.45)"       : isLightPink ? "rgba(74,0,32,0.40)"       : undefined;
  const heroQuoteColor = isLightElegant ? "rgba(28,20,9,0.62)"       : isLightPink ? "rgba(74,0,32,0.58)"       : undefined;
  const heroCtaText    = isLightElegant ? "#1c1409"                  : isLightPink ? "#4a0020"                  : undefined;
  const sectionHdColor = isLightElegant ? "#1c1409"                  : isLightPink ? "#4a0020"                  : undefined;
  const seeAllColor    = isLightElegant ? "rgba(28,20,9,0.38)"       : isLightPink ? "rgba(74,0,32,0.35)"       : undefined;

  // Background gradient baked into root div — never a separate child element
  const rootBackground = isPremiumNeon
    ? `radial-gradient(60% 80% at 50% 0%, rgba(124,58,237,0.45) 0%, transparent 70%), radial-gradient(120% 80% at 50% 0%, rgba(59,42,107,0.50) 0%, rgba(17,10,38,0.0) 60%), #07080d`
    : isGoldNavy
    ? `radial-gradient(60% 80% at 50% 0%, rgba(201,169,97,0.32) 0%, transparent 70%), radial-gradient(120% 80% at 50% 0%, rgba(30,22,5,0.45) 0%, rgba(14,16,24,0.0) 60%), #0e1018`
    : isLightPink
    ? `radial-gradient(60% 80% at 50% 0%, rgba(244,114,182,0.22) 0%, transparent 70%), #fff0f5`
    : isLightElegant
    ? `radial-gradient(60% 80% at 50% 0%, rgba(155,114,40,0.10) 0%, transparent 70%), #f5f0e8`
    : `radial-gradient(60% 80% at 50% 0%, ${todayHV.glow} 0%, transparent 70%), radial-gradient(120% 80% at 50% 0%, rgba(59,42,107,0.35) 0%, rgba(17,10,38,0.0) 60%), #050507`;

  const earnedBadgeIds = (streakData?.badges ?? []) as BadgeId[];
  const todayIdx  = dayOfWeekIndex();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const streak    = streakData?.streak ?? 0;
  const dayUpper  = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  // Two-line hero headline
  const heroHeadline = todayHV.event === "Diet of Worms"
    ? ["Here I stand.", "I cannot do otherwise."]
    : todayHV.text.split(/[,.]/).map((s) => s.trim()).filter(Boolean).slice(0, 2);

  return (
    <div
      className={`min-h-screen text-white relative ${isGoldNavy ? "" : "overflow-hidden"}`}
      style={{ background: rootBackground }}
    >

      {/* ── History verse modal ───────────────────────────────────────────── */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          onClick={() => setHistoryOpen(false)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden"
            style={{ background: "#0a0a0f", border: `1px solid ${AC_BORDER_SM}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: AC }}>
                  {todayHV.event} · {todayHV.year}
                </p>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
                >✕</button>
              </div>
              <p className="text-lg font-bold text-white">{todayHV.reference}</p>
              <p className="mt-3 text-sm italic text-white/70 leading-relaxed" style={{ fontFamily: SERIF }}>
                &ldquo;{todayHV.text}&rdquo;
              </p>
            </div>
            <div className="px-5 py-4 max-h-[45vh] overflow-y-auto">
              <p className="text-[9px] font-black uppercase tracking-[0.20em] text-white/30 mb-2">Church History</p>
              <p className="text-[13px] text-white/65 leading-relaxed">{todayHV.history}</p>
            </div>
            <div className="px-5 pb-5">
              <Link
                href={`/lexicon?book=${encodeURIComponent(todayHV.book)}&chapter=${todayHV.chapter}`}
                onClick={() => setHistoryOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: AC_BG, border: `1px solid ${AC_BORDER}`, color: AC }}
              >
                Read {todayHV.reference} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Meditation video modal ──────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[300] bg-black flex flex-col"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
          onClick={() => setVideoOpen(false)}
        >
          <button
            onClick={() => setVideoOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
          >✕</button>
          <div className="flex-1 relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <video
              src={featuredVideo.file}
              autoPlay controls playsInline
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = "none";
                const iframe = document.getElementById("featured-yt-fallback");
                if (iframe) iframe.style.display = "block";
              }}
            />
            {featuredVideo.youtubeId && (
              <iframe
                id="featured-yt-fallback"
                style={{ display: "none" }}
                src={`https://www.youtube-nocookie.com/embed/${featuredVideo.youtubeId}?autoplay=1&rel=0`}
                title={featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            )}
            {/* Name overlay at bottom of video */}
            <div
              className="absolute left-0 right-0 bottom-0 flex flex-col items-center px-6 pb-5 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
            >
              <p className="text-[13px] font-bold text-white/70 text-center tracking-wide">
                Mojmir Adamek
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── In-app article reader ─────────────────────────────────────────── */}
      {openArticle && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-[#0a0a0f]" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-4 border-b border-white/[0.07]">
            <button
              onClick={() => setOpenArticle(null)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] active:bg-white/[0.12] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/70">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: AC_BG, border: `1px solid ${AC_BORDER_SM}` }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{ color: AC }}>
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] truncate" style={{ color: AC_SUB }}>Marrow Ministries</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ minHeight: 0, WebkitOverflowScrolling: "touch" }}>
            <div className="px-5 pt-6 pb-4">
              <h1 className="text-[20px] font-bold text-white/92 leading-snug mb-3">
                {articleContent?.title || openArticle.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-6">
                {articleContent?.author && !/guest|marrow ministries|free content/i.test(articleContent.author) && (
                  <p className="text-[12px] text-white/45 font-medium">By {articleContent.author}</p>
                )}
                {articleContent?.author && !/guest|marrow ministries|free content/i.test(articleContent.author) && (articleContent?.date || openArticle.date) && (
                  <span className="text-white/15 text-[11px]">·</span>
                )}
                {(articleContent?.date || openArticle.date) && (
                  <p className="text-[12px] text-white/25">
                    {new Date((articleContent?.date || openArticle.date) + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              {contentLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <div className="w-6 h-6 rounded-full animate-spin"
                    style={{ border: `2px solid ${AC_BG}`, borderTopColor: AC }} />
                  <span className="text-white/20 text-xs">Loading article…</span>
                </div>
              ) : (
                <>
                  <p className="text-[15px] text-white/70 leading-[1.8] whitespace-pre-wrap">
                    {articleContent?.content || openArticle.excerpt}
                  </p>
                  <div className="mt-8 pt-5 border-t border-white/[0.06]">
                    <p className="text-[11px] text-white/20 leading-relaxed">
                      {articleContent?.author && !/guest|marrow ministries|free content/i.test(articleContent.author)
                        ? <>Article by <span className="text-white/35 font-semibold">{articleContent.author}</span> — originally published at{" "}</>
                        : <>Originally published at{" "}</>
                      }
                      <a href="https://marrowministries.org/articles" target="_blank" rel="noopener noreferrer"
                        style={{ color: AC_SUB }} className="underline underline-offset-2">
                        marrowministries.org
                      </a>. All rights reserved.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.07]">
            <a
              href={openArticle.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-2xl text-sm font-bold transition-all"
              style={{ background: AC_BG, border: `1px solid ${AC_BORDER}`, color: AC }}
            >
              Open on Marrow Ministries →
            </a>
          </div>
        </div>
      )}

      {/* ── Grace Gems in-app reader ─────────────────────────────────────── */}
      {ggReader && (
        <GgArticleReader
          title={ggReader.title}
          author={ggReader.author}
          authorYears={ggReader.authorYears}
          content={ggReader.content}
          image={ggReader.image}
          lang={lang}
          onClose={() => setGgReader(null)}
        />
      )}

      {/* ── Badge unlock toast ────────────────────────────────────────────── */}
      {toastVisible && newBadgeIds.length > 0 && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-sm"
          style={{ background: "#050507", border: `1px solid ${AC_BORDER_SM}` }}
        >
          <GeneratedBadgeLogo id={newBadgeIds[0]} family="streak" size={24} />
          <span className="text-[12px] font-bold" style={{ color: AC }}>
            {newBadgeIds.map((id) => BADGES[id].label).join(", ")} unlocked!
          </span>
        </div>
      )}

      {/* ── Gold Navy lamp background ─────────────────────────────────────── */}
      {isGoldNavy && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-0"
          style={{ top: "-60px", height: "620px" }}
        >
          {/* Lamp photo — shifted up so the lamp head sits near the very top of the screen */}
          <img
            src="/lamp-bg.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center top" }}
          />
          {/* Fade into page background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 35%, rgba(14,16,24,0.55) 68%, #0e1018 100%)",
            }}
          />
        </div>
      )}

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <main className={`home-main relative max-w-lg mx-auto px-5 pb-28 ${isGoldNavy ? "pt-20" : "pt-10"}`}>

        {/* Hero — date label */}
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: AC }}>
          {dayUpper}{streak > 0 ? ` · DAY ${streak}` : ""}
        </p>

        {/* h1/h2 serif headline */}
        <h1
          className="text-[40px] leading-[1.04] font-normal text-white tracking-tight"
          style={{ fontFamily: SERIF, ...(heroH1Color ? { color: heroH1Color } : {}) }}
        >
          {heroHeadline[0] || todayHV.event}
        </h1>
        {heroHeadline[1] && (
          <h2
            className="text-[40px] leading-[1.04] italic text-white/55 tracking-tight mb-5"
            style={{ fontFamily: SERIF, ...(heroH2Color ? { color: heroH2Color } : {}) }}
          >
            {heroHeadline[1]}{todayHV.text.split(/[,.]/).filter(Boolean).length > 2 ? "…" : ""}
          </h2>
        )}

        {/* Pill badges — event + year */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span
            className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
            style={{ border: `1px solid ${AC_BORDER}`, background: AC_BG, color: AC }}
          >
            {todayHV.event}
          </span>
          <span
            className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 bg-white/[0.04] text-white/55"
            style={heroYearColor ? { color: heroYearColor, borderColor: "rgba(28,20,9,0.12)", background: "rgba(28,20,9,0.05)" } : {}}
          >
            {todayHV.year}
          </span>
        </div>

        {/* Italic serif blockquote */}
        <p
          className="text-[14px] text-white/72 italic leading-[1.55] mb-6"
          style={{ fontFamily: SERIF, ...(heroQuoteColor ? { color: heroQuoteColor } : {}) }}
        >
          &ldquo;{todayHV.text}&rdquo;
        </p>

        {/* Gold CTA card — Read the full story */}
        <button
          onClick={() => setHistoryOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl active:scale-[0.99] transition-all"
          style={{ background: AC_CTA_GRAD, border: `1px solid ${AC_BORDER}` }}
        >
          <div className="text-left">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(201,169,97,0.85)" }}>
              {todayHV.reference}
            </p>
            <p className="text-[14px] font-bold text-white mt-0.5" style={heroCtaText ? { color: heroCtaText } : {}}>Read the full story</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: AC }}>
            <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* ── Continue section ─────────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white" style={sectionHdColor ? { color: sectionHdColor } : {}}>Featured</h3>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
            {/* Featured meditation video */}
            <button
              onClick={() => setVideoOpen(true)}
              className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
              style={!featuredVideo.thumb ? { background: meditCardBg } : {}}
            >
              {/* Thumbnail cover */}
              {featuredVideo.thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredVideo.thumb}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              )}
              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: featuredVideo.thumb
                  ? "linear-gradient(to top, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.18) 100%)"
                  : "transparent" }}
              />
              {/* Play button */}
              <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center self-end" style={{ background: "rgba(255,255,255,0.20)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              </div>
              {/* Labels */}
              <div className="relative z-10">
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "#c9a961" }}>Meditation</p>
                <p className="text-[12px] font-bold leading-snug mt-0.5 text-white">{featuredVideo.title}</p>
                <p className="text-[10px] mt-1.5 text-white/55">Tap to watch</p>
              </div>
            </button>

            {/* Featured Grace Gems article — rotates every 3 days */}
            {(() => {
              const art = getRotatingArticle();
              return (
                <button
                  onClick={() => setGgReader({ title: art.title, author: art.author, authorYears: art.authorYears, url: art.url, content: art.content, image: art.image })}
                  className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.18) 0%, rgba(10,12,20,0.97) 60%)", border: "1px solid rgba(201,169,97,0.28)" }}
                >
                  {/* Cover image (when provided) — hides itself if the file is missing */}
                  {art.image && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.08) 100%)" }}
                      />
                    </>
                  )}
                  {/* Book icon */}
                  <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center self-end" style={{ background: cardIconBg }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isLightPink ? "#9d174d" : isLightElegant ? "#7c5c2e" : isGoldNavy ? "#c9a961" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                    </svg>
                  </div>
                  <div className="relative z-10">
                    <p className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: "#c9a961" }}>Article</p>
                    <p className="text-[11px] font-bold leading-snug mt-0.5 line-clamp-3 text-white">{art.title}</p>
                    <p className="text-[9px] mt-1.5" style={{ color: "rgba(201,169,97,0.70)" }}>{art.author}</p>
                  </div>
                </button>
              );
            })()}

            {/* Free Books */}
            <Link
              href="/library"
              className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
            >
              {/* Cover image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/library-cover.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ filter: "brightness(1.35) contrast(1.05)" }}
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.10) 100%)" }}
              />
              {/* Content */}
              <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center self-end" style={{ background: cardIconBg }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isLightPink ? "#9d174d" : isLightElegant ? "#7c5c2e" : isGoldNavy ? "#c9a961" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: isGoldNavy ? "#c9a961" : "rgba(96,165,250,0.90)" }}>Library</p>
                <p className="text-[12px] font-bold leading-snug mt-0.5 text-white">Free Books</p>
                <p className="text-[10px] mt-1.5 text-white/55">Puritan classics</p>
              </div>
            </Link>

            {/* Historical Documents */}
            <Link
              href="/learn"
              className="flex-shrink-0 w-[145px] h-[180px] rounded-2xl p-3 flex flex-col justify-between text-left active:scale-[0.98] transition-all relative overflow-hidden"
            >
              {/* Cover image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/history-cover.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ filter: "brightness(1.5) contrast(1.05)" }}
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.10) 100%)" }}
              />
              {/* Content */}
              <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center self-end" style={{ background: cardIconBg }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isLightPink ? "#9d174d" : isLightElegant ? "#7c5c2e" : isGoldNavy ? "#c9a961" : "white"} strokeWidth="2" strokeLinecap="round">
                  <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                  <line x1="10" y1="9"  x2="17" y2="9"/>
                  <line x1="10" y1="13" x2="17" y2="13"/>
                  <line x1="10" y1="17" x2="14" y2="17"/>
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase" style={{ color: isGoldNavy ? "#c9a961" : "rgba(196,181,253,0.90)" }}>History</p>
                <p className="text-[12px] font-bold leading-snug mt-0.5 text-white">Historical Documents</p>
                <p className="text-[10px] mt-1.5 text-white/55">Church history</p>
              </div>
            </Link>

          </div>

        </section>

        {/* ── Verse Memorization Widget ────────────────────────────────────── */}
        <VerseMemorizationWidget lang={lang} isLight={isLight} heroH1Color={heroH1Color} sectionHdColor={sectionHdColor} />

        {/* ── Video section promo ──────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white" style={sectionHdColor ? { color: sectionHdColor } : {}}>
              {lang === "es" ? "Biblioteca de Videos" : "Video Library"}
            </h3>
            <Link href="/videos" className="text-[11px] font-bold transition-colors" style={{ color: "rgba(201,169,97,0.7)" }}>
              {lang === "es" ? "Ver todo →" : "See all →"}
            </Link>
          </div>

          <Link href="/videos" className="block group">
            <div
              className="rounded-2xl overflow-hidden active:scale-[0.99] transition-all"
              style={{ background: "linear-gradient(135deg, rgba(201,169,97,0.13) 0%, rgba(10,12,20,0.98) 55%)", border: "1px solid rgba(201,169,97,0.24)" }}
            >
              {/* Header row */}
              <div className="flex items-center gap-3.5 px-4 pt-4 pb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #d9b970, #c9a961)", boxShadow: "0 6px 20px rgba(201,169,97,0.28)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0e1018" style={{ marginLeft: 2 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(201,169,97,0.65)" }}>
                    {lang === "es" ? "Fundamentos de la Fe" : "Fundamentals of the Faith"}
                  </p>
                  <p className="text-[16px] font-bold text-white leading-tight mt-0.5">
                    {lang === "es" ? "Biblioteca de Videos" : "Video Library"}
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,97,0.45)" strokeWidth="2.2" strokeLinecap="round" className="flex-shrink-0">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>

              {/* Divider */}
              <div className="mx-4 mb-3" style={{ height: "1px", background: "rgba(201,169,97,0.11)" }} />

              {/* Topic pills */}
              <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                {(lang === "es"
                  ? ["Dios", "Cristo", "El Evangelio", "Salvación", "Escritura", "El Espíritu"]
                  : ["God", "Christ", "The Gospel", "Salvation", "Scripture", "The Church"]
                ).map((c) => (
                  <span
                    key={c}
                    className="flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(201,169,97,0.08)", color: "rgba(201,169,97,0.78)", border: "1px solid rgba(201,169,97,0.15)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </section>

        {/* ── Your streak ─────────────────────────────────────────────────── */}
        <section className="mt-9">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-white" style={sectionHdColor ? { color: sectionHdColor } : {}}>Your streak</h3>
            <p className="text-[12px] font-bold" style={{ color: AC }}>{streak} {streak === 1 ? "day" : "days"}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-3 py-4 flex justify-between" style={isLight ? { borderColor: "rgba(28,20,9,0.10)", background: "rgba(28,20,9,0.04)" } : {}}>
            {dayLabels.map((d, i) => {
              const isCurrent = i === todayIdx;
              const isDone = i < todayIdx && i >= Math.max(0, todayIdx - streak + 1);
              return (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
                    style={
                      isDone
                        ? { background: AC, color: "#1a0e2e" }
                        : isCurrent
                          ? { background: "rgba(201,169,97,0.15)", border: `1px solid ${AC}` }
                          : { background: "rgba(255,255,255,0.05)" }
                    }
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full" style={{ background: AC }} />}
                  </div>
                  <span
                    className={"text-[10px] " + (isCurrent ? "text-white font-semibold" : "text-white/35")}
                    style={isLight ? { color: isCurrent ? (heroH1Color ?? undefined) : (heroYearColor ?? undefined) } : {}}
                  >{d}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Badges showcase ───────────────────────────────────────────────── */}
        {(earnedBadgeIds.length > 0 || devotionalBadges.length > 0) && (
          <section className="mt-9">
            <h3 className="text-[15px] font-bold text-white mb-3" style={sectionHdColor ? { color: sectionHdColor } : {}}>Badges</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {earnedBadgeIds.map((id) => {
                const badge = BADGES[id];
                return (
                  <div
                    key={id}
                    title={badge.desc}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-xl"
                    style={{ border: `1px solid ${AC_BORDER_SM}`, background: AC_BG }}
                  >
                    <GeneratedBadgeLogo id={id} family="streak" size={30} />
                    <span className="text-[8px] font-bold text-center leading-tight" style={{ color: AC_SUB }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
              {devotionalBadges.map((id) => {
                const badge = DEVOTIONAL_BADGES[id];
                return (
                  <div
                    key={`dev-${id}`}
                    title={badge.desc}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-amber-600/35 bg-amber-600/10"
                  >
                    <GeneratedBadgeLogo id={id} family="devotional" size={30} />
                    <span className="text-[8px] font-bold text-center leading-tight text-amber-300/90">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
