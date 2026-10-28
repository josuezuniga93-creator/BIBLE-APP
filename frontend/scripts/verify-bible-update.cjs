const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.REVIEW_URL || 'http://127.0.0.1:3120';

(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.setDefaultNavigationTimeout(90000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/notes');
    await page.getByText('Sign in to save notes', { exact: true }).waitFor();
    const id = '00000000-0000-4000-8000-000000000001';
    const user = { id, aud: 'authenticated', role: 'authenticated', email: 'test@example.test', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const token = encode({ alg: 'HS256', typ: 'JWT' }) + '.' + encode({ sub: id, exp: expires, role: 'authenticated', aud: 'authenticated' }) + '.mock';
    const session = { access_token: token, refresh_token: 'test', expires_at: expires, expires_in: 3600, token_type: 'bearer', user };
    let failing = true;
    const rows = new Map();
    // This test never sends credentials or writes notes to the real account.
    await context.route('https://*.supabase.co/**', async route => {
      if (route.request().url().includes('/auth/')) return route.fulfill({ json: user });
      if (route.request().url().includes('/rest/v1/user_sync_data')) {
        if (route.request().method() === 'GET') {
          const key = new URL(route.request().url()).searchParams.get('storage_key')?.replace(/^eq\./, '');
          return route.fulfill({ json: [...rows.values()].filter(row => !key || row.storage_key === key) });
        }
        if (failing) return route.fulfill({ status: 503, json: { message: 'Simulated backup outage' } });
        const data = route.request().postDataJSON();
        for (const row of Array.isArray(data) ? data : [data]) rows.set(row.storage_key, row);
        return route.fulfill({ status: 201, json: [] });
      }
      return route.fulfill({ json: [] });
    });
    await context.addCookies([{ name: 'sb-pencbnbfnpncijcmqymu-auth-token', value: 'base64-' + encode(session), domain: new URL(base).hostname, path: '/' }]);
    await page.evaluate(user => window.dispatchEvent(new CustomEvent('tulip-auth-change', { detail: user })), user);
    await page.getByRole('button', { name: 'New note', exact: true }).click();
    await page.getByRole('textbox', { name: 'Note title', exact: true }).fill('Backup recovery test');
    await page.getByRole('textbox', { name: 'Note content', exact: true }).fill('A note that survives a backup outage.');
    await page.getByRole('button', { name: 'Save note', exact: true }).click();
    console.log('Save submitted');
    await page.getByText('Saved on this device. Account backup pending; retrying automatically.', { exact: true }).waitFor().catch(async error => { console.log(await page.locator('body').innerText()); throw error; });
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tulip_notes_v1')));
    assert.equal(saved[0].title, 'Backup recovery test');
    failing = false;
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await page.getByText('Saved to your account', { exact: true }).waitFor();
    assert.ok(rows.has('tulip_notes_v1'));
    console.log('PASS: notes persist during outage and back up after recovery');
    await page.evaluate(() => localStorage.setItem('tulip_badges_earned_v1', 'malformed-unrelated-data'));
    await page.getByRole('button', { name: 'New note', exact: true }).click();
    await page.getByRole('textbox', { name: 'Note title', exact: true }).fill('Independent backup test');
    await page.getByRole('textbox', { name: 'Note content', exact: true }).fill('This note must save independently of badge synchronization.');
    await page.getByRole('button', { name: 'Save note', exact: true }).click();
    await page.getByText('Saved to your account', { exact: true }).waitFor();
    assert.equal(JSON.parse(rows.get('tulip_notes_v1').value).length, 2);
    console.log('PASS: unrelated sync failure does not prevent note backup');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
