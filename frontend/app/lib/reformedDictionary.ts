export type DictionaryCategory = "Doctrine" | "Biblical theology" | "Church" | "Salvation" | "Scripture";

export interface DictionaryLanguageNote {
  language: "Hebrew" | "Greek";
  symbol: "א" | "Ω";
  script: string;
  lemma: string;
  transliteration: string;
  pronunciation: string;
  strongs: string;
  meaning: string;
}

export interface ReformedDictionaryEntry {
  id: string;
  term: string;
  termEs: string;
  category: DictionaryCategory;
  definition: string;
  definitionEs: string;
  reformedNote: string;
  reformedNoteEs: string;
  originalLanguages: DictionaryLanguageNote[];
  references: string[];
  confession?: string;
  aliases?: string[];
}

const greek = (script: string, lemma: string, transliteration: string, pronunciation: string, strongs: string, meaning: string): DictionaryLanguageNote => ({
  language: "Greek", symbol: "Ω", script, lemma, transliteration, pronunciation, strongs, meaning,
});

const hebrew = (script: string, lemma: string, transliteration: string, pronunciation: string, strongs: string, meaning: string): DictionaryLanguageNote => ({
  language: "Hebrew", symbol: "א", script, lemma, transliteration, pronunciation, strongs, meaning,
});

export const REFORMED_DICTIONARY_ENTRIES: ReformedDictionaryEntry[] = [
  {
    id: "love", term: "Love", termEs: "Amor", category: "Biblical theology",
    definition: "The holy affection and committed goodwill by which God gives himself for the good of his people and commands them to seek his glory and their neighbor's true good. Biblical love includes delight, loyalty, mercy, sacrifice, and obedient action.",
    definitionEs: "El afecto santo y la buena voluntad comprometida por los que Dios se entrega para el bien de su pueblo y manda que busquen su gloria y el verdadero bien del projimo. El amor biblico incluye deleite, lealtad, misericordia, sacrificio y accion obediente.",
    reformedNote: "Agape is not a technical synonym for 'unconditional love,' nor is phileo merely 'general love.' The words overlap. Agape often emphasizes purposeful, self-giving goodwill; phileo commonly emphasizes affection or attachment. Their sentence, speaker, object, and biblical context determine the sense.",
    reformedNoteEs: "Agape no es un sinonimo tecnico de 'amor incondicional', ni phileo significa meramente 'amor general'. Las palabras se superponen. Agape suele enfatizar buena voluntad decidida y abnegada; phileo suele enfatizar afecto o apego. La frase, el hablante, el objeto y el contexto biblico determinan el sentido.",
    originalLanguages: [
      hebrew("אָהַב", "ahav", "ahav", "ah-HAHV", "H157", "to love, desire, delight in, or show affection"),
      greek("ἀγάπη", "agape", "agape", "ah-GAH-pay", "G26", "love, benevolence, committed goodwill"),
      greek("ἀγαπάω", "agapao", "agapao", "ah-gah-PAH-oh", "G25", "to love, value, welcome, or seek another's good"),
      greek("φιλέω", "phileo", "phileo", "fil-EH-oh", "G5368", "to love with affection, cherish, or be attached to"),
    ],
    references: ["Deuteronomy 6:5", "John 3:16", "John 21:15-17", "1 Corinthians 13", "1 John 4:7-10"], confession: "WCF 16 / 1689 16", aliases: ["agape", "phileo", "charity", "affection"],
  },
  {
    id: "adoption", term: "Adoption", termEs: "Adopcion", category: "Salvation",
    definition: "God's gracious act of receiving justified believers into his family, giving them the name, privileges, care, discipline, and inheritance of his children.",
    definitionEs: "El acto misericordioso de Dios de recibir a los creyentes justificados en su familia, dandoles el nombre, los privilegios, el cuidado, la disciplina y la herencia de sus hijos.",
    reformedNote: "Adoption is distinct from justification but never separated from it: the Judge who declares believers righteous also becomes their Father in Christ.",
    reformedNoteEs: "La adopcion es distinta de la justificacion, pero nunca separada de ella: el Juez que declara justos a los creyentes tambien llega a ser su Padre en Cristo.",
    originalLanguages: [greek("υἱοθεσία", "huiothesia", "huiothesia", "hwee-oth-es-EE-ah", "G5206", "placement as a son; adoption into a family")],
    references: ["John 1:12", "Romans 8:15-17", "Galatians 4:4-7"], confession: "WCF 12 / 1689 12",
  },
  {
    id: "atonement", term: "Atonement", termEs: "Expiacion", category: "Salvation",
    definition: "God's work of dealing with sin through an appointed sacrifice, fulfilled when Christ bore his people's guilt and reconciled them to God by his blood.",
    definitionEs: "La obra de Dios para tratar con el pecado mediante un sacrificio designado, cumplida cuando Cristo llevo la culpa de su pueblo y lo reconcilio con Dios por su sangre.",
    reformedNote: "Christ's atonement is substitutionary and effective: he did not merely make salvation possible, but actually secured redemption for those given to him.",
    reformedNoteEs: "La expiacion de Cristo es sustitutiva y eficaz: no solo hizo posible la salvacion, sino que aseguro realmente la redencion de los que le fueron dados.",
    originalLanguages: [hebrew("כָּפַר", "kaphar", "kaphar", "kah-FAHR", "H3722", "to cover, purge, or make atonement"), greek("ἱλαστήριον", "hilasterion", "hilasterion", "hee-las-TAY-ree-on", "G2435", "place or sacrifice of propitiation")],
    references: ["Leviticus 16:15-16", "Romans 3:24-26", "Hebrews 9:11-14"], confession: "WCF 8.5 / 1689 8.5", aliases: ["substitution", "penal substitution"],
  },
  {
    id: "baptism", term: "Baptism", termEs: "Bautismo", category: "Church",
    definition: "The New Testament ordinance in which a disciple is baptized with water in the name of the Father, Son, and Holy Spirit as a visible sign of union with Christ and entrance into the visible church.",
    definitionEs: "La ordenanza del Nuevo Testamento en la que un discipulo es bautizado con agua en el nombre del Padre, del Hijo y del Espiritu Santo como señal visible de union con Cristo y entrada en la iglesia visible.",
    reformedNote: "Reformed Christians agree that baptism was instituted by Christ as a covenant sign, while Baptist and paedobaptist confessions differ over its proper subjects and mode.",
    reformedNoteEs: "Los cristianos reformados concuerdan en que el bautismo fue instituido por Cristo como señal del pacto, aunque las confesiones bautistas y paedobautistas difieren sobre sus sujetos y modo.",
    originalLanguages: [greek("βαπτίζω", "baptizo", "baptizo", "bap-TID-zoh", "G907", "to dip, immerse, wash, or baptize")],
    references: ["Matthew 28:19", "Acts 2:38-41", "Romans 6:3-4"], confession: "WCF 28 / 1689 29",
  },
  {
    id: "calling", term: "Effectual calling", termEs: "Llamamiento eficaz", category: "Salvation",
    definition: "The sovereign work of God's Spirit by which those chosen in Christ are brought through the gospel from spiritual death to willing faith and repentance.",
    definitionEs: "La obra soberana del Espiritu de Dios por la cual los escogidos en Cristo son llevados mediante el evangelio de la muerte espiritual a la fe y el arrepentimiento voluntarios.",
    reformedNote: "The outward gospel call goes to all who hear; the effectual call inwardly renews the heart so that the sinner freely comes to Christ.",
    reformedNoteEs: "El llamado externo del evangelio va a todos los que oyen; el llamado eficaz renueva interiormente el corazon para que el pecador venga libremente a Cristo.",
    originalLanguages: [greek("καλέω", "kaleo", "kaleo", "kal-EH-oh", "G2564", "to call, summon, or name")],
    references: ["John 6:44", "Romans 8:30", "2 Timothy 1:9"], confession: "WCF 10 / 1689 10", aliases: ["calling", "irresistible grace"],
  },
  {
    id: "church", term: "Church", termEs: "Iglesia", category: "Church",
    definition: "The people called by God through Christ: universally, all the elect united to Christ; visibly, local assemblies that profess the true faith and gather for Word, ordinances, prayer, and discipline.",
    definitionEs: "El pueblo llamado por Dios por medio de Cristo: universalmente, todos los escogidos unidos a Cristo; visiblemente, congregaciones locales que profesan la fe verdadera y se reunen para la Palabra, las ordenanzas, la oracion y la disciplina.",
    reformedNote: "Christ alone is the church's head. Its authority is ministerial and governed by Scripture, never independent from the Word of its King.",
    reformedNoteEs: "Solo Cristo es la cabeza de la iglesia. Su autoridad es ministerial y gobernada por la Escritura, nunca independiente de la Palabra de su Rey.",
    originalLanguages: [hebrew("קָהָל", "qahal", "qahal", "kah-HAHL", "H6951", "assembly or gathered congregation"), greek("ἐκκλησία", "ekklesia", "ekklesia", "ek-klay-SEE-ah", "G1577", "assembly; those called together")],
    references: ["Matthew 16:18", "Acts 2:42", "Ephesians 1:22-23"], confession: "WCF 25 / 1689 26",
  },
  {
    id: "covenant", term: "Covenant", termEs: "Pacto", category: "Biblical theology",
    definition: "A solemn, divinely established bond that orders the relationship between God and human beings through promises, commands, signs, and sanctions.",
    definitionEs: "Un vinculo solemne establecido por Dios que ordena la relacion entre Dios y los seres humanos mediante promesas, mandamientos, señales y sanciones.",
    reformedNote: "Reformed theology reads Scripture covenantally, distinguishing the broken covenant of works from the covenant of grace revealed progressively and fulfilled in Christ.",
    reformedNoteEs: "La teologia reformada lee la Escritura pactualmente, distinguiendo el pacto de obras quebrantado del pacto de gracia revelado progresivamente y cumplido en Cristo.",
    originalLanguages: [hebrew("בְּרִית", "berith", "berith", "beh-REET", "H1285", "covenant, treaty, or binding agreement"), greek("διαθήκη", "diatheke", "diatheke", "dee-ah-THAY-kay", "G1242", "covenant, testament, or appointed arrangement")],
    references: ["Genesis 17:7", "Jeremiah 31:31-34", "Luke 22:20", "Hebrews 8:6"], confession: "WCF 7 / 1689 7", aliases: ["covenant of grace", "covenant theology"],
  },
  {
    id: "election", term: "Election", termEs: "Eleccion", category: "Salvation",
    definition: "God's eternal and gracious choice of particular sinners in Christ for salvation, grounded in his purpose rather than foreseen merit or faith.",
    definitionEs: "La eleccion eterna y misericordiosa de Dios de pecadores particulares en Cristo para salvacion, fundada en su proposito y no en merito o fe previstos.",
    reformedNote: "Election humbles pride and establishes assurance because salvation begins in God's mercy, is accomplished by Christ, and is applied by the Spirit.",
    reformedNoteEs: "La eleccion humilla el orgullo y establece la seguridad porque la salvacion comienza en la misericordia de Dios, es realizada por Cristo y aplicada por el Espiritu.",
    originalLanguages: [hebrew("בָּחַר", "bachar", "bachar", "bah-KHAHR", "H977", "to choose or select"), greek("ἐκλογή", "ekloge", "ekloge", "ek-loh-GAY", "G1589", "choice or selection")],
    references: ["Deuteronomy 7:6-8", "Ephesians 1:4-5", "Romans 9:10-18"], confession: "WCF 3 / 1689 3", aliases: ["unconditional election", "chosen"],
  },
  {
    id: "faith", term: "Faith", termEs: "Fe", category: "Salvation",
    definition: "Receiving and resting on Jesus Christ alone as he is offered in the gospel, with knowledge of God's truth, assent to it, and personal trust in Christ.",
    definitionEs: "Recibir y descansar unicamente en Jesucristo tal como es ofrecido en el evangelio, con conocimiento de la verdad de Dios, asentimiento a ella y confianza personal en Cristo.",
    reformedNote: "Faith is God's gift and the sole instrument of justification; it never merits salvation and is never alone in the justified person, but bears fruit in love and obedience.",
    reformedNoteEs: "La fe es don de Dios y el unico instrumento de la justificacion; nunca merece la salvacion ni permanece sola en la persona justificada, sino que produce amor y obediencia.",
    originalLanguages: [hebrew("אֱמוּנָה", "emunah", "emunah", "eh-moo-NAH", "H530", "firmness, faithfulness, or fidelity"), greek("πίστις", "pistis", "pistis", "PIS-tis", "G4102", "faith, trust, belief, or faithfulness")],
    references: ["Genesis 15:6", "Romans 3:28", "Ephesians 2:8-10", "Hebrews 11:1"], confession: "WCF 14 / 1689 14", aliases: ["saving faith", "sola fide"],
  },
  {
    id: "gospel", term: "Gospel", termEs: "Evangelio", category: "Biblical theology",
    definition: "The good news that the crucified and risen Jesus is Lord and that God freely grants forgiveness and eternal life to sinners who repent and believe in him.",
    definitionEs: "La buena noticia de que Jesus crucificado y resucitado es Señor y que Dios concede gratuitamente perdon y vida eterna a los pecadores que se arrepienten y creen en el.",
    reformedNote: "The gospel announces a finished work before it commands a new life. Good works are the necessary fruit of salvation, never its ground.",
    reformedNoteEs: "El evangelio anuncia una obra terminada antes de ordenar una vida nueva. Las buenas obras son fruto necesario de la salvacion, nunca su fundamento.",
    originalLanguages: [hebrew("בְּשׂוֹרָה", "besorah", "besorah", "beh-soh-RAH", "H1309", "good news or glad tidings"), greek("εὐαγγέλιον", "euangelion", "euangelion", "yoo-ang-GHEL-ee-on", "G2098", "good news or gospel proclamation")],
    references: ["Isaiah 52:7", "Mark 1:14-15", "1 Corinthians 15:1-4"], confession: "WCF 8 / 1689 20", aliases: ["good news", "evangel"],
  },
  {
    id: "grace", term: "Grace", termEs: "Gracia", category: "Salvation",
    definition: "God's free and undeserved favor toward sinners, together with his powerful action to save, sustain, and transform them in Christ.",
    definitionEs: "El favor libre e inmerecido de Dios hacia los pecadores, junto con su accion poderosa para salvarlos, sostenerlos y transformarlos en Cristo.",
    reformedNote: "Grace excludes boasting: salvation is of the Lord from election to glorification, while the grace that justifies also trains believers in holiness.",
    reformedNoteEs: "La gracia excluye toda jactancia: la salvacion pertenece al Señor desde la eleccion hasta la glorificacion, y la gracia que justifica tambien enseña a los creyentes la santidad.",
    originalLanguages: [hebrew("חֵן", "chen", "chen", "khane", "H2580", "favor, acceptance, or grace"), greek("χάρις", "charis", "charis", "KHAH-ris", "G5485", "grace, favor, gift, or gracious help")],
    references: ["Exodus 33:19", "Ephesians 2:8-9", "Titus 2:11-14"], confession: "WCF 10-13 / 1689 10-13", aliases: ["sola gratia"],
  },
  {
    id: "imputation", term: "Imputation", termEs: "Imputacion", category: "Salvation",
    definition: "The judicial counting of something to another's account: Adam's guilt to his descendants, believers' sin to Christ, and Christ's righteousness to believers.",
    definitionEs: "El acto judicial de contar algo a la cuenta de otro: la culpa de Adan a sus descendientes, el pecado de los creyentes a Cristo y la justicia de Cristo a los creyentes.",
    reformedNote: "Justification rests on an alien righteousness credited, not infused as its basis. Christ's obedience is counted to believers who receive him by faith.",
    reformedNoteEs: "La justificacion descansa en una justicia ajena acreditada, no infundida como su base. La obediencia de Cristo es contada a los creyentes que lo reciben por la fe.",
    originalLanguages: [hebrew("חָשַׁב", "chashab", "chashab", "khah-SHAHV", "H2803", "to reckon, account, or consider"), greek("λογίζομαι", "logizomai", "logizomai", "loh-GID-zoh-my", "G3049", "to reckon, credit, or count")],
    references: ["Genesis 15:6", "Romans 4:3-8", "2 Corinthians 5:21"], confession: "WCF 11.1 / 1689 11.1", aliases: ["credited righteousness", "reckoned"],
  },
  {
    id: "incarnation", term: "Incarnation", termEs: "Encarnacion", category: "Doctrine",
    definition: "The eternal Son of God taking to himself a true human nature without ceasing to be divine, so that Jesus Christ is one person in two distinct natures, truly God and truly man.",
    definitionEs: "El Hijo eterno de Dios tomando para si una verdadera naturaleza humana sin dejar de ser divino, de modo que Jesucristo es una persona en dos naturalezas distintas, verdadero Dios y verdadero hombre.",
    reformedNote: "The natures are neither confused nor divided. The one mediator had to be God to save with divine power and man to obey and suffer in our place.",
    reformedNoteEs: "Las naturalezas no se confunden ni se dividen. El unico mediador debia ser Dios para salvar con poder divino y hombre para obedecer y sufrir en nuestro lugar.",
    originalLanguages: [greek("σάρξ", "sarx", "sarx", "sarks", "G4561", "flesh; human nature in John 1:14"), greek("ἐνανθρώπησις", "enanthropesis", "enanthropesis", "en-an-THRO-pay-sis", "Theological term", "becoming human; incarnation")],
    references: ["John 1:1-14", "Philippians 2:5-8", "Hebrews 2:14-17"], confession: "WCF 8.2 / 1689 8.2", aliases: ["two natures", "God-man"],
  },
  {
    id: "justification", term: "Justification", termEs: "Justificacion", category: "Salvation",
    definition: "God's once-for-all legal declaration that a sinner is righteous in his sight because Christ's righteousness is credited to that sinner and received by faith alone.",
    definitionEs: "La declaracion legal, definitiva y unica de Dios de que un pecador es justo ante el porque la justicia de Cristo le es acreditada y recibida solo por la fe.",
    reformedNote: "God pardons sin and accepts believers as righteous, not for anything worked in them, but for Christ's obedience and satisfaction imputed to them.",
    reformedNoteEs: "Dios perdona el pecado y acepta a los creyentes como justos, no por algo obrado en ellos, sino por la obediencia y satisfaccion de Cristo imputadas a ellos.",
    originalLanguages: [greek("δικαιόω", "dikaioo", "dikaioo", "dik-ah-YOH-oh", "G1344", "to justify, declare righteous, or acquit")],
    references: ["Romans 3:23-28", "Romans 5:1", "Galatians 2:16"], confession: "WCF 11 / 1689 11", aliases: ["forensic justification", "faith alone"],
  },
  {
    id: "law", term: "Law of God", termEs: "Ley de Dios", category: "Biblical theology",
    definition: "God's authoritative revelation of his righteous character and will, summarized morally in the Ten Commandments and expressed in the covenantal legislation of Scripture.",
    definitionEs: "La revelacion autoritativa del caracter justo y la voluntad de Dios, resumida moralmente en los Diez Mandamientos y expresada en la legislacion pactual de la Escritura.",
    reformedNote: "The law cannot justify sinners. It exposes sin, restrains evil, and remains a grateful rule of life for believers who are under grace rather than under it as a covenant of works.",
    reformedNoteEs: "La ley no puede justificar a los pecadores. Expone el pecado, restringe el mal y permanece como regla agradecida de vida para creyentes bajo la gracia y no bajo ella como pacto de obras.",
    originalLanguages: [hebrew("תּוֹרָה", "torah", "torah", "toh-RAH", "H8451", "instruction, direction, or law"), greek("νόμος", "nomos", "nomos", "NOM-os", "G3551", "law, custom, or authoritative norm")],
    references: ["Exodus 20:1-17", "Romans 3:20", "Romans 7:12", "Galatians 3:24"], confession: "WCF 19 / 1689 19", aliases: ["moral law", "Ten Commandments"],
  },
  {
    id: "lords-supper", term: "Lord's Supper", termEs: "Cena del Señor", category: "Church",
    definition: "The ordinance instituted by Christ in which the gathered church receives bread and the cup in remembrance of him, proclaiming his death and sharing spiritually in his benefits by faith.",
    definitionEs: "La ordenanza instituida por Cristo en la que la iglesia reunida recibe pan y copa en memoria de el, proclamando su muerte y participando espiritualmente de sus beneficios por la fe.",
    reformedNote: "The elements remain bread and wine. Christ is truly received spiritually by faith; the Supper neither repeats his sacrifice nor works saving grace automatically.",
    reformedNoteEs: "Los elementos permanecen pan y vino. Cristo es recibido verdaderamente de manera espiritual por la fe; la Cena no repite su sacrificio ni obra gracia salvadora automaticamente.",
    originalLanguages: [greek("κυριακὸν δεῖπνον", "kyriakon deipnon", "kyriakon deipnon", "koo-ree-ah-KON DIPE-non", "G2960 + G1173", "the Lord's supper or meal"), greek("κοινωνία", "koinonia", "koinonia", "koy-noh-NEE-ah", "G2842", "fellowship, participation, or sharing")],
    references: ["Luke 22:19-20", "1 Corinthians 10:16-17", "1 Corinthians 11:23-29"], confession: "WCF 29 / 1689 30", aliases: ["communion", "eucharist"],
  },
  {
    id: "mediator", term: "Mediator", termEs: "Mediador", category: "Doctrine",
    definition: "One who stands between estranged parties to secure reconciliation. Jesus Christ is the only mediator between holy God and sinful humanity.",
    definitionEs: "Quien esta entre partes separadas para asegurar reconciliacion. Jesucristo es el unico mediador entre el Dios santo y la humanidad pecadora.",
    reformedNote: "Christ fulfills the threefold office of prophet, priest, and king. His person and completed work make every other saving mediator unnecessary.",
    reformedNoteEs: "Cristo cumple el triple oficio de profeta, sacerdote y rey. Su persona y obra completa hacen innecesario cualquier otro mediador salvador.",
    originalLanguages: [hebrew("מֵלִיץ", "melits", "melits", "may-LEETS", "H3887", "interpreter, advocate, or mediator"), greek("μεσίτης", "mesites", "mesites", "mes-EE-tace", "G3316", "mediator or go-between")],
    references: ["Job 9:32-33", "1 Timothy 2:5", "Hebrews 9:15"], confession: "WCF 8 / 1689 8", aliases: ["prophet priest king"],
  },
  {
    id: "perseverance", term: "Perseverance", termEs: "Perseverancia", category: "Salvation",
    definition: "God's preservation of true believers in faith to the end, worked through their continuing trust, repentance, obedience, and use of the means of grace.",
    definitionEs: "La preservacion de los verdaderos creyentes por Dios en la fe hasta el fin, obrada mediante su confianza, arrepentimiento, obediencia y uso continuos de los medios de gracia.",
    reformedNote: "The saints persevere because God preserves them. Assurance does not encourage carelessness; the same grace that keeps believers also makes them watchful.",
    reformedNoteEs: "Los santos perseveran porque Dios los preserva. La seguridad no fomenta descuido; la misma gracia que guarda a los creyentes tambien los hace vigilantes.",
    originalLanguages: [greek("ὑπομονή", "hypomone", "hypomone", "hoo-pom-on-AY", "G5281", "steadfast endurance or patient continuance")],
    references: ["John 10:27-29", "Philippians 1:6", "1 Peter 1:3-5"], confession: "WCF 17 / 1689 17", aliases: ["preservation", "eternal security"],
  },
  {
    id: "propitiation", term: "Propitiation", termEs: "Propiciacion", category: "Salvation",
    definition: "Christ's sacrificial satisfaction of God's righteous wrath against sin, so that God remains just while showing favor to guilty people who are in Christ.",
    definitionEs: "La satisfaccion sacrificial de Cristo de la ira justa de Dios contra el pecado, de modo que Dios permanece justo al mostrar favor a culpables que estan en Cristo.",
    reformedNote: "Propitiation is not a reluctant Son calming an unwilling Father. The triune God lovingly provides the sacrifice that his own holiness requires.",
    reformedNoteEs: "La propiciacion no es un Hijo renuente calmando a un Padre indispuesto. El Dios trino provee amorosamente el sacrificio que su propia santidad requiere.",
    originalLanguages: [greek("ἱλασμός", "hilasmos", "hilasmos", "hee-las-MOSS", "G2434", "atoning sacrifice that turns away wrath"), greek("ἱλαστήριον", "hilasterion", "hilasterion", "hee-las-TAY-ree-on", "G2435", "means or place of propitiation")],
    references: ["Romans 3:25-26", "Hebrews 2:17", "1 John 2:1-2"], confession: "WCF 8.5 / 1689 8.5", aliases: ["wrath", "satisfaction"],
  },
  {
    id: "providence", term: "Providence", termEs: "Providencia", category: "Doctrine",
    definition: "God's wise, holy, and powerful preservation and government of every creature and event, ordinarily through means and always according to his eternal purpose.",
    definitionEs: "La preservacion y gobierno sabios, santos y poderosos de Dios sobre cada criatura y acontecimiento, ordinariamente por medios y siempre segun su proposito eterno.",
    reformedNote: "Providence includes real secondary causes and human responsibility. God is never the author of sin, yet no event escapes his sovereign decree and governance.",
    reformedNoteEs: "La providencia incluye causas secundarias reales y responsabilidad humana. Dios nunca es autor del pecado, pero ningun acontecimiento escapa de su decreto y gobierno soberanos.",
    originalLanguages: [hebrew("פָּקַד", "paqad", "paqad", "pah-KAHD", "H6485", "to attend to, appoint, or visit"), greek("πρόνοια", "pronoia", "pronoia", "PRON-oy-ah", "G4307", "forethought, care, or provision")],
    references: ["Genesis 50:20", "Psalm 103:19", "Matthew 10:29-31", "Romans 8:28"], confession: "WCF 5 / 1689 5", aliases: ["sovereignty", "government of God"],
  },
  {
    id: "redemption", term: "Redemption", termEs: "Redencion", category: "Salvation",
    definition: "Deliverance from bondage by the payment of a price. Christ redeems his people from guilt, slavery to sin, the curse of the law, and final judgment by giving his life for them.",
    definitionEs: "Liberacion de esclavitud mediante el pago de un precio. Cristo redime a su pueblo de la culpa, la esclavitud al pecado, la maldicion de la ley y el juicio final al dar su vida por ellos.",
    reformedNote: "Redemption is accomplished objectively by Christ and applied personally by the Holy Spirit; its price and power are entirely God's provision.",
    reformedNoteEs: "La redencion es realizada objetivamente por Cristo y aplicada personalmente por el Espiritu Santo; su precio y poder son enteramente provision de Dios.",
    originalLanguages: [hebrew("גָּאַל", "gaal", "gaal", "gah-AHL", "H1350", "to redeem or act as kinsman-redeemer"), greek("ἀπολύτρωσις", "apolytrosis", "apolytrosis", "ap-ol-OO-troh-sis", "G629", "release by ransom; redemption")],
    references: ["Exodus 6:6", "Mark 10:45", "Ephesians 1:7", "1 Peter 1:18-19"], confession: "WCF 8 / 1689 8", aliases: ["ransom", "redeem"],
  },
  {
    id: "regeneration", term: "Regeneration", termEs: "Regeneracion", category: "Salvation",
    definition: "The Holy Spirit's sovereign act of giving spiritual life and a new heart to a sinner who was dead in sin, enabling repentance and faith.",
    definitionEs: "El acto soberano del Espiritu Santo de dar vida espiritual y un corazon nuevo a un pecador muerto en pecado, capacitandolo para el arrepentimiento y la fe.",
    reformedNote: "The new birth is monergistic: God is its decisive actor. Faith is the immediate response of the renewed heart, not the cause that makes regeneration possible.",
    reformedNoteEs: "El nuevo nacimiento es monergista: Dios es su actor decisivo. La fe es la respuesta inmediata del corazon renovado, no la causa que hace posible la regeneracion.",
    originalLanguages: [hebrew("חָדָשׁ", "chadash", "chadash", "khah-DASH", "H2318", "to renew or make new"), greek("παλιγγενεσία", "palingenesia", "palingenesia", "pal-ing-ghen-es-EE-ah", "G3824", "new birth or regeneration")],
    references: ["Ezekiel 36:26-27", "John 3:3-8", "Titus 3:5"], confession: "WCF 10 / 1689 10", aliases: ["new birth", "born again"],
  },
  {
    id: "repentance", term: "Repentance", termEs: "Arrepentimiento", category: "Salvation",
    definition: "A grace in which a sinner, seeing sin as evil and trusting God's mercy in Christ, turns from sin to God with grief, hatred of sin, and a resolve to obey.",
    definitionEs: "Una gracia en la que el pecador, viendo el pecado como mal y confiando en la misericordia de Dios en Cristo, se vuelve del pecado a Dios con dolor, odio al pecado y proposito de obedecer.",
    reformedNote: "Repentance does not pay for sin; Christ alone does. It is nevertheless necessary and lifelong, inseparably accompanying true faith.",
    reformedNoteEs: "El arrepentimiento no paga por el pecado; solo Cristo lo hace. Sin embargo, es necesario, continuo e inseparable de la fe verdadera.",
    originalLanguages: [hebrew("שׁוּב", "shuv", "shuv", "shoov", "H7725", "to turn or return"), greek("μετάνοια", "metanoia", "metanoia", "met-AN-oy-ah", "G3341", "change of mind resulting in a changed direction")],
    references: ["Isaiah 55:7", "Mark 1:15", "Acts 2:38", "2 Corinthians 7:10"], confession: "WCF 15 / 1689 15", aliases: ["turn from sin"],
  },
  {
    id: "resurrection", term: "Resurrection", termEs: "Resurreccion", category: "Doctrine",
    definition: "God's raising of the dead to embodied life. Christ rose bodily as the firstfruits, guaranteeing the bodily resurrection of all people and eternal life for believers.",
    definitionEs: "El levantamiento de los muertos por Dios a vida corporal. Cristo resucito corporalmente como primicias, garantizando la resurreccion corporal de todos y la vida eterna de los creyentes.",
    reformedNote: "Christian hope is not escape from creation but renewed embodied life with Christ in the new creation, while unbelievers are raised for judgment.",
    reformedNoteEs: "La esperanza cristiana no es escapar de la creacion, sino vida corporal renovada con Cristo en la nueva creacion, mientras los incredulos resucitan para juicio.",
    originalLanguages: [hebrew("חָיָה", "chayah", "chayah", "khah-YAH", "H2421", "to live, revive, or preserve alive"), greek("ἀνάστασις", "anastasis", "anastasis", "an-AS-tah-sis", "G386", "a rising up; resurrection from the dead")],
    references: ["Daniel 12:2", "John 11:25", "1 Corinthians 15:20-23"], confession: "WCF 32 / 1689 31",
  },
  {
    id: "righteousness", term: "Righteousness", termEs: "Justicia", category: "Biblical theology",
    definition: "Moral conformity to God's character and law, and the right standing God grants to believers through the obedience of Jesus Christ.",
    definitionEs: "Conformidad moral con el caracter y la ley de Dios, y la posicion justa que Dios concede a los creyentes mediante la obediencia de Jesucristo.",
    reformedNote: "The gospel reveals a righteousness from God: Christ's perfect obedience is the ground of justification and is received, not achieved, by faith.",
    reformedNoteEs: "El evangelio revela una justicia que procede de Dios: la obediencia perfecta de Cristo es la base de la justificacion y se recibe, no se logra, por la fe.",
    originalLanguages: [hebrew("צְדָקָה", "tsedaqah", "tsedaqah", "tseh-dah-KAH", "H6666", "righteousness, justice, or right conduct"), greek("δικαιοσύνη", "dikaiosyne", "dikaiosyne", "dik-ah-yos-OO-nay", "G1343", "righteousness, justice, or right standing")],
    references: ["Isaiah 53:11", "Romans 1:17", "Romans 5:18-19", "Philippians 3:9"], confession: "WCF 11 / 1689 11", aliases: ["justice", "active obedience"],
  },
  {
    id: "sanctification", term: "Sanctification", termEs: "Santificacion", category: "Salvation",
    definition: "The gracious work of God by which believers, already set apart in Christ, are progressively renewed in the whole person and enabled to die to sin and live to righteousness.",
    definitionEs: "La obra misericordiosa de Dios por la que los creyentes, ya apartados en Cristo, son renovados progresivamente en toda la persona y capacitados para morir al pecado y vivir para la justicia.",
    reformedNote: "Sanctification follows and differs from justification: justification changes legal standing once for all; sanctification progressively changes character without becoming the basis of acceptance.",
    reformedNoteEs: "La santificacion sigue a la justificacion y difiere de ella: la justificacion cambia la posicion legal una vez para siempre; la santificacion cambia progresivamente el caracter sin ser base de aceptacion.",
    originalLanguages: [hebrew("קָדַשׁ", "qadash", "qadash", "kah-DASH", "H6942", "to set apart, consecrate, or make holy"), greek("ἁγιασμός", "hagiasmos", "hagiasmos", "hag-ee-as-MOSS", "G38", "holiness, consecration, or sanctification")],
    references: ["John 17:17", "Romans 6:11-14", "1 Thessalonians 4:3"], confession: "WCF 13 / 1689 13", aliases: ["holiness", "mortification"],
  },
  {
    id: "scripture", term: "Scripture", termEs: "Escritura", category: "Scripture",
    definition: "The inspired written Word of God in the sixty-six books of the Old and New Testaments, truthful in all it affirms and the church's final authority for faith and obedience.",
    definitionEs: "La Palabra escrita e inspirada de Dios en los sesenta y seis libros del Antiguo y Nuevo Testamento, verdadera en todo lo que afirma y autoridad final de la iglesia para fe y obediencia.",
    reformedNote: "Scripture is necessary, sufficient, clear in what is required for salvation, and self-authenticating through the Spirit who bears witness by and with the Word.",
    reformedNoteEs: "La Escritura es necesaria, suficiente, clara en lo requerido para salvacion y autentica en si misma mediante el Espiritu que da testimonio por y con la Palabra.",
    originalLanguages: [hebrew("כָּתוּב", "kathuv", "kathuv", "kah-TOOV", "H3789", "written or recorded"), greek("γραφή", "graphe", "graphe", "grah-FAY", "G1124", "writing; in the New Testament, sacred Scripture")],
    references: ["Psalm 19:7-11", "2 Timothy 3:16-17", "2 Peter 1:20-21"], confession: "WCF 1 / 1689 1", aliases: ["Bible", "Word of God", "sola scriptura"],
  },
  {
    id: "sin", term: "Sin", termEs: "Pecado", category: "Biblical theology",
    definition: "Any lack of conformity to or transgression of God's law, arising from a corrupted nature and bringing guilt, pollution, death, and separation from God.",
    definitionEs: "Toda falta de conformidad con la ley de Dios o transgresion de ella, nacida de una naturaleza corrompida y que trae culpa, contaminacion, muerte y separacion de Dios.",
    reformedNote: "After Adam's fall, every part of human nature is corrupted. This total depravity does not mean everyone is as evil as possible, but that no faculty can restore us to God apart from grace.",
    reformedNoteEs: "Despues de la caida de Adan, cada parte de la naturaleza humana esta corrompida. La depravacion total no significa que todos sean tan malos como sea posible, sino que ninguna facultad puede restaurarnos a Dios sin gracia.",
    originalLanguages: [hebrew("חָטָא", "chata", "chata", "khah-TAH", "H2398", "to sin or miss the way"), greek("ἁμαρτία", "hamartia", "hamartia", "ham-ar-TEE-ah", "G266", "sin, wrongdoing, or failure to meet God's standard")],
    references: ["Genesis 6:5", "Romans 3:10-23", "1 John 3:4"], confession: "WCF 6 / 1689 6", aliases: ["total depravity", "fall", "transgression"],
  },
  {
    id: "sovereignty", term: "Sovereignty of God", termEs: "Soberania de Dios", category: "Doctrine",
    definition: "God's absolute right and power as Creator and King to accomplish all his holy will over creation, history, salvation, and judgment.",
    definitionEs: "El derecho y poder absolutos de Dios como Creador y Rey para cumplir toda su santa voluntad sobre la creacion, la historia, la salvacion y el juicio.",
    reformedNote: "Divine sovereignty is never arbitrary: the God who ordains all things is perfectly wise, good, just, and unchangeable, and creatures remain genuinely responsible.",
    reformedNoteEs: "La soberania divina nunca es arbitraria: el Dios que ordena todas las cosas es perfectamente sabio, bueno, justo e inmutable, y las criaturas siguen siendo realmente responsables.",
    originalLanguages: [hebrew("מָלַךְ", "malak", "malak", "mah-LAHK", "H4427", "to reign or be king"), greek("παντοκράτωρ", "pantokrator", "pantokrator", "pan-tok-RAH-tore", "G3841", "almighty; ruler over all")],
    references: ["Psalm 115:3", "Daniel 4:35", "Ephesians 1:11", "Revelation 19:6"], confession: "WCF 2-5 / 1689 2-5", aliases: ["decree", "almighty"],
  },
  {
    id: "trinity", term: "Trinity", termEs: "Trinidad", category: "Doctrine",
    definition: "The one living and true God eternally exists in three distinct persons—Father, Son, and Holy Spirit—equal in deity and glory, sharing one undivided divine essence.",
    definitionEs: "El unico Dios vivo y verdadero existe eternamente en tres personas distintas—Padre, Hijo y Espiritu Santo—iguales en deidad y gloria, compartiendo una sola esencia divina indivisa.",
    reformedNote: "Trinity is a later theological label, not a biblical lemma. It summarizes the Bible's simultaneous teaching that God is one and that Father, Son, and Spirit are personally distinct and fully divine.",
    reformedNoteEs: "Trinidad es una etiqueta teologica posterior, no un lema biblico. Resume la enseñanza simultanea de la Biblia de que Dios es uno y que Padre, Hijo y Espiritu son personalmente distintos y plenamente divinos.",
    originalLanguages: [hebrew("אֶחָד", "echad", "echad", "eh-KHAHD", "H259", "one or unified"), greek("θεότης", "theotes", "theotes", "theh-OT-ace", "G2320", "deity or the fullness of divine nature")],
    references: ["Deuteronomy 6:4", "Matthew 28:19", "2 Corinthians 13:14"], confession: "WCF 2.3 / 1689 2.3", aliases: ["triune God", "Father Son Holy Spirit"],
  },
  {
    id: "union-with-christ", term: "Union with Christ", termEs: "Union con Cristo", category: "Salvation",
    definition: "The Spirit-created bond by which believers are joined to Christ and share in every saving benefit of his death, resurrection, righteousness, life, and inheritance.",
    definitionEs: "El vinculo creado por el Espiritu mediante el cual los creyentes son unidos a Cristo y participan de todo beneficio salvador de su muerte, resurreccion, justicia, vida y herencia.",
    reformedNote: "Union with Christ is the fountain of the order of salvation: believers are justified, adopted, sanctified, preserved, and glorified only in communion with him.",
    reformedNoteEs: "La union con Cristo es la fuente del orden de la salvacion: los creyentes son justificados, adoptados, santificados, preservados y glorificados solo en comunion con el.",
    originalLanguages: [greek("ἐν Χριστῷ", "en Christo", "en Christo", "en khrees-TOH", "G1722 + G5547", "in Christ; the recurring Pauline phrase of union")],
    references: ["John 15:4-5", "Romans 6:5", "1 Corinthians 1:30", "Ephesians 1:3"], confession: "WCF 26 / 1689 27", aliases: ["in Christ", "communion with Christ"],
  },
];
