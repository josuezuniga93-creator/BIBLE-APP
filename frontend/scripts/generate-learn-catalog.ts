import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LEARN_DOCUMENTS } from '../app/lib/learnData';

// Shared navigation needs titles, not the complete public-domain library.
const catalog = LEARN_DOCUMENTS.map(({ id, title, sections }) => ({
  id,
  title,
  sections: sections.map(({ id, title }) => ({ id, title })),
}));
const target = fileURLToPath(new URL('../app/lib/learnCatalog.json', import.meta.url));
const content = JSON.stringify(catalog, null, 2) + '\n';
if (!existsSync(target) || readFileSync(target, 'utf8') !== content) writeFileSync(target, content);
