export interface QAItem {
  id: string;
  question: string;
  questionEs?: string;
  answer: string;        // short summary for home display
  answerEs?: string;
  answerFull: string;    // full detailed answer for full-screen view
  answerFullEs?: string;
  date: string;          // ISO date string
  answered: boolean;
}

// Seed data — one answered question to show on first load
export const SEED_QA: QAItem[] = [
  {
    id: "seed-1",
    question: "What does it mean to be justified by faith?",
    questionEs: "¿Qué significa ser justificado por la fe?",
    answer: "Justification means God declares the sinner righteous on account of Christ's righteousness, received through faith alone — not by works.",
    answerEs: "La justificación significa que Dios declara justo al pecador en virtud de la justicia de Cristo, recibida por la fe sola, no por obras.",
    answerFull: `Justification is a legal declaration by God in which He pronounces the believing sinner righteous in His sight. This righteousness is not an inner transformation (that is sanctification), but a forensic verdict — a change of legal standing before God.\n\nThe basis of justification is the perfect obedience and atoning death of Jesus Christ. His righteousness is imputed (credited) to the believer, while our sin was imputed to Him at the cross (2 Cor. 5:21; Rom. 4:5).\n\nJustification is received through faith alone (sola fide) — not by works of the law (Gal. 2:16; Rom. 3:28). Faith is the instrument, not the ground, of justification.\n\nThis was the great recovery of the Reformation: that a sinner is accepted before God not on the basis of personal merit, but solely on the merit of Christ, received by faith.`,
    answerFullEs: `La justificación es una declaración legal de Dios en la que Él pronuncia justo al pecador creyente ante Sus ojos. Esta justicia no es una transformación interior (eso es la santificación), sino un veredicto forense — un cambio de posición legal ante Dios.\n\nEl fundamento de la justificación es la perfecta obediencia y la muerte expiatoria de Jesucristo. Su justicia se imputa (acredita) al creyente, mientras que nuestro pecado le fue imputado a Él en la cruz (2 Cor. 5:21; Rom. 4:5).\n\nLa justificación se recibe por la fe sola (sola fide) — no por obras de la ley (Gál. 2:16; Rom. 3:28).\n\nEsta fue la gran recuperación de la Reforma: que un pecador es aceptado ante Dios no sobre la base del mérito personal, sino únicamente sobre el mérito de Cristo, recibido por la fe.`,
    date: "2026-06-01T00:00:00Z",
    answered: true,
  },
];
