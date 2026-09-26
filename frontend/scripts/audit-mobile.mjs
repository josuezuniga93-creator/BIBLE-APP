import { chromium, webkit } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.AUDIT_URL || 'http://127.0.0.1:3100';
const output = path.resolve(process.env.AUDIT_OUTPUT || '../audit-screenshots-2026-09-26');
const routes = (process.env.AUDIT_ROUTES || '/,/lexicon,/family-worship,/notes,/more,/library,/learn,/timeline,/bible-tracker,/bible-plans,/study-tools,/kids-books,/videos,/church-analysis,/church-analysis/new,/church-directory,/fellowship,/give,/highlights,/collections,/profile,/auth/login,/privacy,/quotes,/preview,/videos/submit,/videos/admin,/library/pilgrims-progress,/church-history/athanasius').split(',');
const widths = (process.env.AUDIT_WIDTHS || '360,393,430').split(',').map(Number);
const themes = (process.env.AUDIT_THEMES || 'white-noir,gold-navy').split(',');
const browser = await (process.env.AUDIT_ENGINE === 'webkit' ? webkit : chromium).launch({ headless: true });
await mkdir(output, { recursive: true });
const results = [];
try {
  for (const width of widths) {
    for (const theme of themes) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
      await context.addInitScript(({ theme }) => {
        localStorage.setItem('tulip_onboarded', 'true');
        localStorage.setItem('ryc-theme', theme);
        localStorage.setItem('ryc-translation', 'kjv');
      }, { theme });
      for (const route of routes) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const result = { route, width, theme, errors };
        try {
          const response = await page.goto(baseURL + route, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => {
            await page.waitForLoadState('domcontentloaded');
            return null;
          });
          await page.locator('body').waitFor();
          result.status = response?.status() || null;
          result.layout = await page.evaluate(() => {
            const width = document.documentElement.clientWidth;
            const overflow = [...document.querySelectorAll('main *, .layout-children > *, nav')].filter(el => {
              const rect = el.getBoundingClientRect();
              if (!rect.width || !rect.height || getComputedStyle(el).position === 'absolute') return false;
              let ancestor = el.parentElement;
              while (ancestor && ancestor !== document.body) {
                if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(ancestor).overflowX)) return false;
                ancestor = ancestor.parentElement;
              }
              return rect.right > width + 2 || rect.left < -2;
            }).slice(0, 12).map(el => ({ tag: el.tagName, class: String(el.className).slice(0, 90), text: el.textContent?.trim().slice(0, 70) }));
            return { documentWidth: document.documentElement.scrollWidth, viewport: width, overflow };
          });
          if (width === widths[0]) {
            const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
            result.accessibility = accessibility.violations.map(v => ({ id: v.id, impact: v.impact, count: v.nodes.length, nodes: v.nodes.slice(0, 8).map(n => ({ target: n.target, summary: n.failureSummary })) }));
          }
          result.screenshot = `${route.replace(/[^a-z0-9]+/gi, '-') || 'home'}-${width}-${theme}.png`;
          await page.screenshot({ path: path.join(output, result.screenshot), fullPage: false });
        } catch (error) { result.failure = error.message; }
        results.push(result);
        console.log(JSON.stringify({ route, width, theme, status: result.status, errors: errors.length, overflow: result.layout?.overflow.length, a11y: result.accessibility?.map(v => `${v.id}:${v.count}`), failure: result.failure }));
        await page.close();
        await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
      }
      await context.close();
    }
  }
} finally { await browser.close(); }
