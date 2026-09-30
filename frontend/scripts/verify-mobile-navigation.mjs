import { chromium, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.AUDIT_URL || 'http://localhost:3101';
const output = '/tmp/tulip-mobile-redesign';
await mkdir(output, { recursive: true });
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch();
  for (const width of [320, 393, 430]) {
    for (const theme of ['white-noir', 'gold-navy']) {
      const context = await browser.newContext({ viewport: { width, height: 852 }, isMobile: true, deviceScaleFactor: 1 });
      await context.addInitScript(theme => {
        localStorage.setItem('ryc-theme', theme);
        localStorage.setItem('tulip_onboarded', 'true');
      }, theme);
      const page = await context.newPage();
      for (const route of ['/more', '/lexicon', '/library', '/learn', '/notes', '/family-worship', '/']) {
        await page.goto(base + route, { waitUntil: 'networkidle' });
        await page.locator('.mobile-tab-bar').waitFor();
        const bounds = await page.evaluate(() => {
          const nav = document.querySelector('.mobile-tab-bar');
          const r = nav.getBoundingClientRect();
          const chapter = document.querySelector('.scripture-reader-bar')?.getBoundingClientRect();
          return { x: r.x, right: r.right, bottom: r.bottom, top: r.top, width: innerWidth, height: innerHeight,
            overflow: document.documentElement.scrollWidth > innerWidth,
            background: getComputedStyle(nav).backgroundColor,
            chapterBottom: chapter?.bottom,
            labelsFit: [...nav.querySelectorAll('a')].every(a => a.scrollWidth <= a.clientWidth),
          };
        });
        assert.equal(bounds.x, 0);
        assert.equal(bounds.right, bounds.width);
        assert.equal(bounds.bottom, bounds.height);
        assert.equal(bounds.overflow, false, route + ' horizontal overflow');
        assert.equal(bounds.labelsFit, true, route + ' label clipped');
        assert.equal(bounds.background, theme === 'white-noir' ? 'rgb(255, 255, 255)' : 'rgb(23, 23, 25)');
        if (bounds.chapterBottom) assert.ok(Math.abs(bounds.chapterBottom - bounds.top) <= 1, 'Chapter controls must meet tab bar');
        if (width === 393) await page.screenshot({ path: output + '/' + name + '-' + theme + '-' + (route.slice(1) || 'home') + '.png' });
      }
      await page.locator('.mobile-tab').filter({ hasText: 'Scripture' }).click();
      await page.waitForURL('**/lexicon');
      assert.equal(await page.locator('.mobile-tab[aria-current="page"]').getAttribute('href'), '/lexicon');
      console.log(name, width, theme, '7 routes: aligned, opaque, no overflow, Scripture link correct');
      await context.close();
    }
  }
  await browser.close();
}
