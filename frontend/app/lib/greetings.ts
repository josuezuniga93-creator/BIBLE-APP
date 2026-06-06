export interface Greeting {
  line1: string; // uses {name} as placeholder
  line2: string;
  line1Es?: string;
  line2Es?: string;
  slot: "morning" | "afternoon" | "evening" | "night" | "any";
}

export const GREETINGS: Greeting[] = [
  // ── MORNING ──────────────────────────────────────────────
  { slot: "morning", line1: "Good morning, {name}.", line2: "God's mercies are new every morning.", line1Es: "Buenos días, {name}.", line2Es: "Las misericordias de Dios son nuevas cada mañana." },
  { slot: "morning", line1: "Rise with gratitude, {name}.", line2: "The Lord has given you another day.", line1Es: "Despierta con gratitud, {name}.", line2Es: "El Señor te ha dado un día más." },
  { slot: "morning", line1: "A new day begins, {name}.", line2: "Seek the Lord while He may be found.", line1Es: "Un nuevo día comienza, {name}.", line2Es: "Busca al Señor mientras puede ser hallado." },
  { slot: "morning", line1: "Wake up with hope, {name}.", line2: "God's promises stand firm and sure.", line1Es: "Despierta con esperanza, {name}.", line2Es: "Las promesas de Dios permanecen firmes." },
  { slot: "morning", line1: "Today is a gift, {name}.", line2: "Seek first the kingdom of God.", line1Es: "Hoy es un regalo, {name}.", line2Es: "Busca primero el reino de Dios." },
  { slot: "morning", line1: "Start your morning in the Word, {name}.", line2: "Let truth guide your steps.", line1Es: "Comienza en la Palabra, {name}.", line2Es: "Que la verdad guíe tus pasos." },
  { slot: "morning", line1: "Another sunrise, {name}.", line2: "Another reminder of God's faithfulness.", line1Es: "Otro amanecer, {name}.", line2Es: "Otro recordatorio de la fidelidad de Dios." },
  { slot: "morning", line1: "Walk into today with courage, {name}.", line2: "The Lord is mighty to save.", line1Es: "Entra al día con valentía, {name}.", line2Es: "El Señor es poderoso para salvar." },
  { slot: "morning", line1: "The Lord reigns over this morning, {name}.", line2: "Trust Him for the day ahead.", line1Es: "El Señor reina sobre esta mañana, {name}.", line2Es: "Confía en Él para el día que viene." },
  { slot: "morning", line1: "Begin today with worship, {name}.", line2: "End it with gratitude.", line1Es: "Empieza con adoración, {name}.", line2Es: "Termina con gratitud." },
  { slot: "morning", line1: "The morning star has risen, {name}.", line2: "Christ is the same yesterday and today and forever.", line1Es: "La estrella de la mañana ha salido, {name}.", line2Es: "Cristo es el mismo ayer, hoy y por los siglos." },
  { slot: "morning", line1: "God's mercies await you, {name}.", line2: "They are great and freely given.", line1Es: "Las misericordias de Dios te esperan, {name}.", line2Es: "Son grandes y se dan gratuitamente." },
  { slot: "morning", line1: "Greet this day with prayer, {name}.", line2: "The Lord hears those who call upon Him.", line1Es: "Saluda este día con oración, {name}.", line2Es: "El Señor oye a quienes claman a Él." },
  { slot: "morning", line1: "This morning belongs to Him, {name}.", line2: "Let every hour reflect that truth.", line1Es: "Esta mañana es de Él, {name}.", line2Es: "Que cada hora refleje esa verdad." },
  { slot: "morning", line1: "Before the world demands your attention, {name}.", line2: "Give the first moments to prayer.", line1Es: "Antes de que el mundo exija tu atención, {name}.", line2Es: "Da los primeros momentos a la oración." },
  { slot: "morning", line1: "The Lord's lovingkindness is fresh today, {name}.", line2: "Taste it in the Word.", line1Es: "La misericordia del Señor es fresca hoy, {name}.", line2Es: "Pruébala en la Palabra." },
  { slot: "morning", line1: "Rise and shine, {name}.", line2: "Your light has come — Christ is risen.", line1Es: "Levántate y resplandece, {name}.", line2Es: "Tu luz ha llegado — Cristo ha resucitado." },
  { slot: "morning", line1: "Seek Him first, {name}.", line2: "All else will follow in its place.", line1Es: "Búscale primero, {name}.", line2Es: "Todo lo demás seguirá en su lugar." },
  { slot: "morning", line1: "God's strength is available to you, {name}.", line2: "Ask for it at the start of this day.", line1Es: "La fortaleza de Dios está disponible para ti, {name}.", line2Es: "Pídela al inicio de este día." },
  { slot: "morning", line1: "Morning prayer opens the day well, {name}.", line2: "Bring your heart to the throne of grace.", line1Es: "La oración matutina abre bien el día, {name}.", line2Es: "Lleva tu corazón al trono de la gracia." },
  { slot: "morning", line1: "God is Lord of this morning, {name}.", line2: "Acknowledge Him and walk in wisdom.", line1Es: "Dios es Señor de esta mañana, {name}.", line2Es: "Reconócelo y camina en sabiduría." },
  { slot: "morning", line1: "The cross stands firm this morning, {name}.", line2: "Christ's sacrifice is the hope of the world.", line1Es: "La cruz permanece firme esta mañana, {name}.", line2Es: "El sacrificio de Cristo es la esperanza del mundo." },
  { slot: "morning", line1: "Open the Word this morning, {name}.", line2: "God still speaks through Scripture.", line1Es: "Abre la Palabra esta mañana, {name}.", line2Es: "Dios aún habla a través de las Escrituras." },
  { slot: "morning", line1: "Pause to pray, {name}.", line2: "God is near to all who call on Him.", line1Es: "Pausa para orar, {name}.", line2Es: "Dios está cerca de todos los que le invocan." },
  { slot: "morning", line1: "Another day has arrived, {name}.", line2: "The Lord's hand is not shortened — He is able to save.", line1Es: "Un nuevo día ha llegado, {name}.", line2Es: "La mano del Señor no se ha acortado — Él puede salvar." },
  // ── AFTERNOON ────────────────────────────────────────────
  { slot: "afternoon", line1: "Keep going, {name}.", line2: "God's grace is sufficient.", line1Es: "Sigue adelante, {name}.", line2Es: "La gracia de Dios es suficiente." },
  { slot: "afternoon", line1: "Pause for a moment, {name}.", line2: "God sees every detail of your day.", line1Es: "Pausa un momento, {name}.", line2Es: "Dios ve cada detalle de tu día." },
  { slot: "afternoon", line1: "The day is moving quickly, {name}.", line2: "Eternity never moves — Christ is unchanging.", line1Es: "El día pasa rápido, {name}.", line2Es: "La eternidad no cambia — Cristo es inmutable." },
  { slot: "afternoon", line1: "Take courage, {name}.", line2: "God rewards those who diligently seek Him.", line1Es: "Toma valor, {name}.", line2Es: "Dios recompensa a quienes le buscan con diligencia." },
  { slot: "afternoon", line1: "In the middle of today's tasks, {name}.", line2: "Remember — God is near to the humble.", line1Es: "En medio de las tareas de hoy, {name}.", line2Es: "Recuerda — Dios está cerca de los humildes." },
  { slot: "afternoon", line1: "When distractions are many, {name}.", line2: "His Word remains steady.", line1Es: "Cuando las distracciones abundan, {name}.", line2Es: "Su Palabra permanece firme." },
  { slot: "afternoon", line1: "Slow down and breathe, {name}.", line2: "God's providence is never rushed.", line1Es: "Desacelera y respira, {name}.", line2Es: "La providencia de Dios nunca tiene prisa." },
  { slot: "afternoon", line1: "Good afternoon, {name}.", line2: "Take a moment to be still before God.", line1Es: "Buenas tardes, {name}.", line2Es: "Toma un momento para estar quieto ante Dios." },
  { slot: "afternoon", line1: "Midday pause, {name}.", line2: "Cast your cares on God — He is able.", line1Es: "Pausa del mediodía, {name}.", line2Es: "Echa tus cargas sobre Dios — Él puede llevarlas." },
  { slot: "afternoon", line1: "Do not grow weary in doing good, {name}.", line2: "In due season you will reap, if you do not give up.", line1Es: "No te canses de hacer el bien, {name}.", line2Es: "A su tiempo cosecharás, si no te rindes." },
  { slot: "afternoon", line1: "Your work matters, {name}.", line2: "Do it as unto the Lord.", line1Es: "Tu trabajo importa, {name}.", line2Es: "Hazlo como para el Señor." },
  { slot: "afternoon", line1: "The afternoon calls for perseverance, {name}.", line2: "Run with endurance the race set before you.", line1Es: "La tarde exige perseverancia, {name}.", line2Es: "Corre con paciencia la carrera que tienes por delante." },
  { slot: "afternoon", line1: "Lift your eyes, {name}.", line2: "My help comes from the Lord, maker of heaven and earth.", line1Es: "Alza tus ojos, {name}.", line2Es: "Mi ayuda viene del Señor, que hizo el cielo y la tierra." },
  { slot: "afternoon", line1: "Fix your thoughts, {name}.", line2: "Whatever is true and honorable — think on these things.", line1Es: "Fija tus pensamientos, {name}.", line2Es: "Todo lo verdadero y honesto — piensa en estas cosas." },
  { slot: "afternoon", line1: "God is not distant this afternoon, {name}.", line2: "Draw near to Him and He will draw near to you.", line1Es: "Dios no está lejos esta tarde, {name}.", line2Es: "Acércate a Él y Él se acercará a ti." },
  { slot: "afternoon", line1: "The King is on His throne, {name}.", line2: "Nothing that happens today escapes His eye.", line1Es: "El Rey está en Su trono, {name}.", line2Es: "Nada de lo que ocurre hoy escapa a Su mirada." },
  { slot: "afternoon", line1: "Do not let the afternoon steal your peace, {name}.", line2: "The peace of God surpasses understanding.", line1Es: "No dejes que la tarde robe tu paz, {name}.", line2Es: "La paz de Dios sobrepasa todo entendimiento." },
  { slot: "afternoon", line1: "Pray without ceasing, {name}.", line2: "Even a whispered prayer reaches heaven.", line1Es: "Ora sin cesar, {name}.", line2Es: "Hasta un susurro de oración llega al cielo." },
  { slot: "afternoon", line1: "Life changes quickly, {name}.", line2: "Jesus Christ is the same yesterday and today and forever.", line1Es: "La vida cambia rápido, {name}.", line2Es: "Jesucristo es el mismo ayer, hoy y por los siglos." },
  { slot: "afternoon", line1: "The afternoon is here, {name}.", line2: "God's strength is available to all who ask.", line1Es: "La tarde ha llegado, {name}.", line2Es: "La fortaleza de Dios está disponible para quienes la piden." },
  { slot: "afternoon", line1: "Pause and pray, {name}.", line2: "The Lord hears those who call upon Him.", line1Es: "Pausa y ora, {name}.", line2Es: "El Señor oye a quienes claman a Él." },
  { slot: "afternoon", line1: "God does not change with the hour, {name}.", line2: "He is as faithful now as He ever was.", line1Es: "Dios no cambia con la hora, {name}.", line2Es: "Él es tan fiel ahora como siempre lo ha sido." },
  // ── EVENING ──────────────────────────────────────────────
  { slot: "evening", line1: "The day is ending, {name}.", line2: "Christ remains the Light of the world.", line1Es: "El día termina, {name}.", line2Es: "Cristo sigue siendo la Luz del mundo." },
  { slot: "evening", line1: "Rest well, {name}.", line2: "The Lord never slumbers nor sleeps.", line1Es: "Descansa bien, {name}.", line2Es: "El Señor no dormita ni duerme." },
  { slot: "evening", line1: "Sleep in peace tonight, {name}.", line2: "The Lord neither slumbers nor sleeps.", line1Es: "Duerme en paz esta noche, {name}.", line2Es: "El Señor no dormita ni duerme." },
  { slot: "evening", line1: "Bring your burdens to God, {name}.", line2: "He is able to carry what you cannot.", line1Es: "Lleva tus cargas a Dios, {name}.", line2Es: "Él puede cargar lo que tú no puedes." },
  { slot: "evening", line1: "The stars shine above, {name}.", line2: "God's promises shine brighter.", line1Es: "Las estrellas brillan arriba, {name}.", line2Es: "Las promesas de Dios brillan más." },
  { slot: "evening", line1: "Another day is finished, {name}.", line2: "His mercies await tomorrow.", line1Es: "Otro día ha terminado, {name}.", line2Es: "Sus misericordias esperan mañana." },
  { slot: "evening", line1: "The night may be dark, {name}.", line2: "Christ is the Light no darkness can overcome.", line1Es: "La noche puede ser oscura, {name}.", line2Es: "Cristo es la Luz que ninguna oscuridad puede vencer." },
  { slot: "evening", line1: "Reflect on today with gratitude, {name}.", line2: "Count the mercies you were given.", line1Es: "Reflexiona en este día con gratitud, {name}.", line2Es: "Cuenta las misericordias que recibiste." },
  { slot: "evening", line1: "Good evening, {name}.", line2: "Reflect on His Word as the day closes.", line1Es: "Buenas noches, {name}.", line2Es: "Reflexiona en Su Palabra al cerrar el día." },
  { slot: "evening", line1: "Evening, {name}.", line2: "Give thanks — God was faithful again today.", line1Es: "Noche, {name}.", line2Es: "Da gracias — Dios fue fiel de nuevo hoy." },
  { slot: "evening", line1: "The work of today is done, {name}.", line2: "Rest in the God who never tires.", line1Es: "El trabajo de hoy ha terminado, {name}.", line2Es: "Descansa en el Dios que nunca se cansa." },
  { slot: "evening", line1: "As the evening falls, {name}.", line2: "God remains a refuge and strength.", line1Es: "Al caer la noche, {name}.", line2Es: "Dios permanece como refugio y fortaleza." },
  { slot: "evening", line1: "Tonight, return to His promises, {name}.", line2: "Not one of them has ever failed.", line1Es: "Esta noche, vuelve a Sus promesas, {name}.", line2Es: "Ni una sola ha fallado jamás." },
  { slot: "evening", line1: "The quiet of evening is a gift, {name}.", line2: "Use it to draw near to God.", line1Es: "La quietud de la noche es un regalo, {name}.", line2Es: "Úsala para acercarte a Dios." },
  { slot: "evening", line1: "Before you sleep, give thanks, {name}.", line2: "Gratitude is the language of the humble.", line1Es: "Antes de dormir, da gracias, {name}.", line2Es: "La gratitud es el lenguaje de los humildes." },
  { slot: "evening", line1: "God is faithful, {name}.", line2: "His faithfulness does not diminish with the night.", line1Es: "Dios es fiel, {name}.", line2Es: "Su fidelidad no disminuye con la noche." },
  { slot: "evening", line1: "Rest tonight, {name}.", line2: "The Lord reigns over heaven and earth.", line1Es: "Descansa esta noche, {name}.", line2Es: "El Señor reina sobre el cielo y la tierra." },
  { slot: "evening", line1: "Repent and rest, {name}.", line2: "God is rich in mercy to all who call on Him.", line1Es: "Arrepiéntete y descansa, {name}.", line2Es: "Dios es rico en misericordia para con todos los que le invocan." },
  { slot: "evening", line1: "Bring your day to God in prayer, {name}.", line2: "He hears every sincere prayer.", line1Es: "Lleva tu día a Dios en oración, {name}.", line2Es: "Él escucha toda oración sincera." },
  { slot: "evening", line1: "The day has ended, {name}.", line2: "God is the same tonight as He was this morning.", line1Es: "El día ha terminado, {name}.", line2Es: "Dios es el mismo esta noche que esta mañana." },
  // ── NIGHT ────────────────────────────────────────────────
  { slot: "night", line1: "Rest well, {name}.", line2: "The Lord never slumbers nor sleeps.", line1Es: "Que descanses, {name}.", line2Es: "El Señor no dormita ni duerme." },
  { slot: "night", line1: "The night is His too, {name}.", line2: "God reigns even in the darkest hours.", line1Es: "La noche también es de Él, {name}.", line2Es: "Dios reina incluso en las horas más oscuras." },
  { slot: "night", line1: "Be still, {name}.", line2: "Know that He is God.", line1Es: "Aquiétate, {name}.", line2Es: "Sabe que Él es Dios." },
  { slot: "night", line1: "Even in the dark hours, {name}.", line2: "God's word is a lamp to the feet.", line1Es: "Incluso en las horas oscuras, {name}.", line2Es: "La Palabra de Dios es lámpara a los pies." },
  { slot: "night", line1: "Lay every worry before God, {name}.", line2: "He is able to do far more than we ask.", line1Es: "Deposita toda preocupación ante Dios, {name}.", line2Es: "Él puede hacer mucho más de lo que pedimos." },
  { slot: "night", line1: "In the quiet of the night, {name}.", line2: "God's Word still speaks.", line1Es: "En el silencio de la noche, {name}.", line2Es: "La Palabra de Dios aún habla." },
  { slot: "night", line1: "Seek the Lord tonight, {name}.", line2: "He is not far from any one of us.", line1Es: "Busca al Señor esta noche, {name}.", line2Es: "No está lejos de ninguno de nosotros." },
  // ── ANY TIME ─────────────────────────────────────────────
  { slot: "any", line1: "Come to Christ, {name}.", line2: "He says: Come to me, all who are weary.", line1Es: "Ven a Cristo, {name}.", line2Es: "Él dice: Venid a mí, todos los que estáis cansados." },
  { slot: "any", line1: "God's sovereignty has not changed today, {name}.", line2: "Neither has His goodness.", line1Es: "La soberanía de Dios no ha cambiado hoy, {name}.", line2Es: "Tampoco Su bondad." },
  { slot: "any", line1: "The Lord is mighty to save, {name}.", line2: "Call upon Him while He may be found.", line1Es: "El Señor es poderoso para salvar, {name}.", line2Es: "Invócalo mientras puede ser hallado." },
  { slot: "any", line1: "God is rich in mercy, {name}.", line2: "He delights to show compassion.", line1Es: "Dios es rico en misericordia, {name}.", line2Es: "Él se deleita en mostrar compasión." },
  { slot: "any", line1: "Nothing surprises God today, {name}.", line2: "Walk in quiet trust.", line1Es: "Nada sorprende a Dios hoy, {name}.", line2Es: "Camina con confianza tranquila." },
  { slot: "any", line1: "The King reigns, {name}.", line2: "Therefore take heart.", line1Es: "El Rey reina, {name}.", line2Es: "Por eso, anímate." },
  { slot: "any", line1: "Your circumstances may change, {name}.", line2: "God's character never does.", line1Es: "Tus circunstancias pueden cambiar, {name}.", line2Es: "El carácter de Dios nunca cambia." },
  { slot: "any", line1: "The Word of God stands forever, {name}.", line2: "Build your life upon it.", line1Es: "La Palabra de Dios permanece para siempre, {name}.", line2Es: "Edifica tu vida sobre ella." },
  { slot: "any", line1: "Repentance is a gift God offers, {name}.", line2: "Do not delay to seek it.", line1Es: "El arrepentimiento es un regalo que Dios ofrece, {name}.", line2Es: "No tardes en buscarlo." },
  { slot: "any", line1: "Look to the cross, {name}.", line2: "There is fullness of mercy there.", line1Es: "Mira la cruz, {name}.", line2Es: "Allí hay plena misericordia." },
  { slot: "any", line1: "Christ is sufficient, {name}.", line2: "He has always been sufficient.", line1Es: "Cristo es suficiente, {name}.", line2Es: "Siempre ha sido suficiente." },
  { slot: "any", line1: "God's power is made perfect in weakness, {name}.", line2: "Humble yourself before Him.", line1Es: "El poder de Dios se perfecciona en la debilidad, {name}.", line2Es: "Humíllate delante de Él." },
  { slot: "any", line1: "Pray boldly, {name}.", line2: "God hears the prayer of those who seek Him.", line1Es: "Ora con valentía, {name}.", line2Es: "Dios oye la oración de quienes le buscan." },
  { slot: "any", line1: "The gospel is good news, {name}.", line2: "Christ died for sinners — that is the hope of the world.", line1Es: "El evangelio son buenas noticias, {name}.", line2Es: "Cristo murió por los pecadores — esa es la esperanza del mundo." },
  { slot: "any", line1: "Do not trust your feelings alone, {name}.", line2: "God's Word is more reliable than what we feel.", line1Es: "No confíes solo en tus sentimientos, {name}.", line2Es: "La Palabra de Dios es más confiable que lo que sentimos." },
  { slot: "any", line1: "This world is not the end, {name}.", line2: "God has promised to make all things new.", line1Es: "Este mundo no es el final, {name}.", line2Es: "Dios ha prometido hacer nuevas todas las cosas." },
  { slot: "any", line1: "God's timing is perfect, {name}.", line2: "Trust it even when you cannot see it.", line1Es: "El tiempo de Dios es perfecto, {name}.", line2Es: "Confía en él aunque no puedas verlo." },
  { slot: "any", line1: "Set your mind on things above, {name}.", line2: "The things of this world are passing away.", line1Es: "Pon tu mente en las cosas de arriba, {name}.", line2Es: "Las cosas de este mundo son pasajeras." },
  { slot: "any", line1: "The fear of the Lord is wisdom, {name}.", line2: "Begin there and all else follows.", line1Es: "El temor del Señor es sabiduría, {name}.", line2Es: "Empieza ahí y todo lo demás seguirá." },
  { slot: "any", line1: "Worship is not just for Sunday, {name}.", line2: "Every moment can glorify God.", line1Es: "La adoración no es solo para el domingo, {name}.", line2Es: "Cada momento puede glorificar a Dios." },
  { slot: "any", line1: "Be still and know, {name}.", line2: "He is God — and that is enough.", line1Es: "Aquiétate y sabe, {name}.", line2Es: "Él es Dios — y eso es suficiente." },
  { slot: "any", line1: "Christ rose from the dead, {name}.", line2: "His resurrection is the greatest fact in history.", line1Es: "Cristo resucitó de los muertos, {name}.", line2Es: "Su resurrección es el mayor hecho de la historia." },
  { slot: "any", line1: "Humility opens the door to God, {name}.", line2: "He opposes the proud but gives grace to the humble.", line1Es: "La humildad abre la puerta a Dios, {name}.", line2Es: "Él resiste a los soberbios pero da gracia a los humildes." },
  { slot: "any", line1: "God's Word is a lamp, {name}.", line2: "Let it light the path ahead.", line1Es: "La Palabra de Dios es una lámpara, {name}.", line2Es: "Deja que ilumine el camino." },
  { slot: "any", line1: "Contentment is learned, {name}.", line2: "Learn it at the feet of Christ.", line1Es: "El contentamiento se aprende, {name}.", line2Es: "Aprende a los pies de Cristo." },
  { slot: "any", line1: "Trials are not the end of the story, {name}.", line2: "God is writing a story greater than we can see.", line1Es: "Las pruebas no son el fin de la historia, {name}.", line2Es: "Dios está escribiendo una historia mayor de lo que podemos ver." },
  { slot: "any", line1: "God is not silent, {name}.", line2: "Open Scripture — He is speaking.", line1Es: "Dios no está en silencio, {name}.", line2Es: "Abre las Escrituras — Él está hablando." },
  { slot: "any", line1: "The Lord is good, {name}.", line2: "His steadfast love endures forever.", line1Es: "El Señor es bueno, {name}.", line2Es: "Su misericordia es para siempre." },
  { slot: "any", line1: "Doubt does not disqualify you, {name}.", line2: "Bring it to the one who is truth.", line1Es: "La duda no te descalifica, {name}.", line2Es: "Llévala a Aquel que es la verdad." },
  { slot: "any", line1: "God is working, {name}.", line2: "Even when you cannot see it.", line1Es: "Dios está obrando, {name}.", line2Es: "Incluso cuando no puedes verlo." },
  { slot: "any", line1: "Gather with other believers, {name}.", line2: "The Lord blesses those who seek Him together.", line1Es: "Reúnete con otros creyentes, {name}.", line2Es: "El Señor bendice a quienes le buscan juntos." },
  { slot: "any", line1: "Christ is coming again, {name}.", line2: "Live in light of that day.", line1Es: "Cristo viene de nuevo, {name}.", line2Es: "Vive a la luz de ese día." },
  { slot: "any", line1: "God's love is not based on performance, {name}.", line2: "It is rooted in His own eternal character.", line1Es: "El amor de Dios no se basa en el desempeño, {name}.", line2Es: "Está arraigado en Su propio carácter eterno." },
  { slot: "any", line1: "God knows you by name, {name}.", line2: "He made you and nothing is hidden from Him.", line1Es: "Dios te conoce por nombre, {name}.", line2Es: "Él te hizo y nada está oculto ante Él." },
  { slot: "any", line1: "Scripture is your sword, {name}.", line2: "Carry it — and use it.", line1Es: "La Escritura es tu espada, {name}.", line2Es: "Llévala — y úsala." },
  { slot: "any", line1: "God is patient toward all people, {name}.", line2: "Not wishing that any should perish.", line1Es: "Dios es paciente con todos, {name}.", line2Es: "No quiere que ninguno perezca." },
  { slot: "any", line1: "Seek God's face, {name}.", line2: "He promises to be found by those who seek Him.", line1Es: "Busca el rostro de Dios, {name}.", line2Es: "Él promete ser hallado por quienes le buscan." },
  { slot: "any", line1: "Christ's yoke is easy, {name}.", line2: "Come to Him and find rest for your soul.", line1Es: "El yugo de Cristo es fácil, {name}.", line2Es: "Ven a Él y halla descanso para tu alma." },
  { slot: "any", line1: "Every good gift comes from above, {name}.", line2: "Do not forget the Giver.", line1Es: "Todo buen regalo viene de arriba, {name}.", line2Es: "No olvides al Dador." },
  { slot: "any", line1: "God's promises are yes and amen, {name}.", line2: "Stand on them without wavering.", line1Es: "Las promesas de Dios son sí y amén, {name}.", line2Es: "Párate sobre ellas sin vacilar." },
  { slot: "any", line1: "The body of Christ exists, {name}.", line2: "Seek out those who love God and grow together.", line1Es: "El cuerpo de Cristo existe, {name}.", line2Es: "Busca a quienes aman a Dios y creced juntos." },
  { slot: "any", line1: "God does not waste suffering, {name}.", line2: "He is able to bring good from every trial.", line1Es: "Dios no desperdicia el sufrimiento, {name}.", line2Es: "Él puede sacar bien de cada prueba." },
  { slot: "any", line1: "Open God's Word today, {name}.", line2: "Wisdom is found in His truth.", line1Es: "Abre la Palabra de Dios hoy, {name}.", line2Es: "La sabiduría se halla en Su verdad." },
  { slot: "any", line1: "God is the same today as He was in eternity, {name}.", line2: "His purposes will not fail.", line1Es: "Dios es el mismo hoy que en la eternidad, {name}.", line2Es: "Sus propósitos no fallarán." },
  { slot: "any", line1: "Glorify God in the small things today, {name}.", line2: "They are often the most important.", line1Es: "Glorifica a Dios en las cosas pequeñas hoy, {name}.", line2Es: "Suelen ser las más importantes." },
  { slot: "any", line1: "Ask God for wisdom, {name}.", line2: "He gives generously to all who ask in faith.", line1Es: "Pide sabiduría a Dios, {name}.", line2Es: "Él da generosamente a todos los que piden con fe." },
  { slot: "any", line1: "The name of the Lord is a strong tower, {name}.", line2: "The righteous run to it and are safe.", line1Es: "El nombre del Señor es torre fuerte, {name}.", line2Es: "El justo corre a ella y está a salvo." },
  { slot: "any", line1: "God hears prayer, {name}.", line2: "Call upon His name today.", line1Es: "Dios oye la oración, {name}.", line2Es: "Invoca Su nombre hoy." },
  { slot: "any", line1: "The fear of the Lord adds length to life, {name}.", line2: "Walk wisely before Him.", line1Es: "El temor del Señor prolonga la vida, {name}.", line2Es: "Camina sabiamente delante de Él." },
  { slot: "any", line1: "Meditate on Scripture today, {name}.", line2: "The one who does this is like a tree planted by water.", line1Es: "Medita en las Escrituras hoy, {name}.", line2Es: "El que lo hace es como árbol plantado junto al agua." },
  { slot: "any", line1: "God is the Creator of all things, {name}.", line2: "He owes nothing and gives everything.", line1Es: "Dios es el Creador de todo, {name}.", line2Es: "No debe nada y lo da todo." },
  { slot: "any", line1: "Confess your sins to God, {name}.", line2: "He is faithful and just to forgive those who come to Him.", line1Es: "Confiesa tus pecados a Dios, {name}.", line2Es: "Él es fiel y justo para perdonar a los que vienen a Él." },
  { slot: "any", line1: "The resurrection of Christ changed everything, {name}.", line2: "Consider what it means for you today.", line1Es: "La resurrección de Cristo lo cambió todo, {name}.", line2Es: "Considera lo que significa para ti hoy." },
  { slot: "any", line1: "God calls all people to repentance, {name}.", line2: "Whoever calls on the name of the Lord will be saved.", line1Es: "Dios llama a todos a arrepentirse, {name}.", line2Es: "Todo el que invoque el nombre del Señor será salvo." },
  { slot: "any", line1: "Wisdom cries out in the streets, {name}.", line2: "Listen for God's voice in Scripture today.", line1Es: "La sabiduría clama en las calles, {name}.", line2Es: "Escucha la voz de Dios en las Escrituras hoy." },
  { slot: "any", line1: "God is holy, {name}.", line2: "All who approach Him must do so on His terms.", line1Es: "Dios es santo, {name}.", line2Es: "Todo el que se acerque a Él debe hacerlo en Sus términos." },
  { slot: "any", line1: "The heart is deceitful, {name}.", line2: "Let God's Word, not feelings, be your guide.", line1Es: "El corazón es engañoso, {name}.", line2Es: "Que la Palabra de Dios, no los sentimientos, sea tu guía." },
  { slot: "any", line1: "Where can you go from God's Spirit, {name}?", line2: "He is present in every place.", line1Es: "¿Adónde podrías ir del Espíritu de Dios, {name}?", line2Es: "Él está presente en todo lugar." },
  { slot: "any", line1: "God is long-suffering toward sinners, {name}.", line2: "Do not presume upon His patience — run to Him.", line1Es: "Dios es longánime hacia los pecadores, {name}.", line2Es: "No presumas de Su paciencia — corre a Él." },
  { slot: "any", line1: "The heavens declare the glory of God, {name}.", line2: "Look up — creation testifies to its Maker.", line1Es: "Los cielos declaran la gloria de Dios, {name}.", line2Es: "Mira arriba — la creación testifica de su Hacedor." },
  { slot: "any", line1: "God is just, {name}.", line2: "And the justifier of those who trust in Christ.", line1Es: "Dios es justo, {name}.", line2Es: "Y el que justifica a los que confían en Cristo." },
  { slot: "any", line1: "Christ said: I am the way, the truth, and the life, {name}.", line2: "No one comes to the Father except through Him.", line1Es: "Cristo dijo: Yo soy el camino, la verdad y la vida, {name}.", line2Es: "Nadie viene al Padre sino por medio de Él." },
  { slot: "any", line1: "Consider the grace of God, {name}.", line2: "He did not spare His own Son.", line1Es: "Considera la gracia de Dios, {name}.", line2Es: "Él no escatimó a Su propio Hijo." },
  { slot: "any", line1: "Seek repentance daily, {name}.", line2: "God is near to those with contrite hearts.", line1Es: "Busca el arrepentimiento cada día, {name}.", line2Es: "Dios está cerca de los de corazón contrito." },
  { slot: "any", line1: "There is no God like the God of Scripture, {name}.", line2: "Worship Him in spirit and in truth.", line1Es: "No hay Dios como el Dios de las Escrituras, {name}.", line2Es: "Adórale en espíritu y en verdad." },
  { slot: "any", line1: "The gospel calls all people, {name}.", line2: "Believe in the Lord Jesus Christ and be saved.", line1Es: "El evangelio llama a todos, {name}.", line2Es: "Cree en el Señor Jesucristo y serás salvo." },
];

/**
 * Select a greeting that feels random to each user each day.
 * Uses a seed based on: date + name hash — so it varies daily
 * and across different users without needing a server.
 */
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function getDailyGreeting(name: string, hour: number, lang: string): { line1: string; line2: string } {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const seed = hashCode(dateKey + name);

  // Filter by time slot
  const slot =
    hour >= 5 && hour < 12 ? "morning" :
    hour >= 12 && hour < 17 ? "afternoon" :
    hour >= 17 && hour < 21 ? "evening" : "night";

  const pool = GREETINGS.filter(g => g.slot === slot || g.slot === "any");
  const item = pool[seed % pool.length];

  const l1 = (lang === "es" && item.line1Es ? item.line1Es : item.line1).replace("{name}", name);
  const l2 = lang === "es" && item.line2Es ? item.line2Es : item.line2;
  return { line1: l1, line2: l2 };
}
