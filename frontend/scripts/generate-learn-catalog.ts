import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LEARN_DOCUMENTS, FULL_DOCUMENT_SECTIONS } from '../app/lib/learnData';

// Shared navigation needs titles, not the complete public-domain library.
const catalog = LEARN_DOCUMENTS.map(({ id, title, sections }) => ({
  id,
  title,
  sections: sections.map(({ id, title }) => ({ id, title })),
}));
const target = fileURLToPath(new URL('../app/lib/learnCatalog.json', import.meta.url));
const content = JSON.stringify(catalog, null, 2) + '\n';
if (!existsSync(target) || readFileSync(target, 'utf8') !== content) writeFileSync(target, content);

const studyCatalog = LEARN_DOCUMENTS.map(({ sections, ...metadata }) => ({
  ...metadata,
  sections: (FULL_DOCUMENT_SECTIONS[metadata.id] || sections).map(({ id, title, label }) => ({ id, title, label })),
}));
const studyTarget = fileURLToPath(new URL('../app/lib/studyDocumentCatalog.json', import.meta.url));
const studyContent = JSON.stringify(studyCatalog, null, 2) + '\n';
if (!existsSync(studyTarget) || readFileSync(studyTarget, 'utf8') !== studyContent) writeFileSync(studyTarget, studyContent);
