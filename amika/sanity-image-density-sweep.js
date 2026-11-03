async (page) => {
  const browser = page.context().browser();
  const BASE = 'https://loveamika.com';
  const PAGES = [
    '/',
    '/collections/smooth',
    '/collections/color',
    '/ingredients/sea-buckthorn-seed-oil',
    '/blogs/the-strand',
    '/blogs/the-strand/finally-amika-body-care-is-here',
  ];
  const CONFIGS = [
    {name: 'desk1x', w: 1440, h: 900, dpr: 1},
    {name: 'desk2x', w: 1440, h: 900, dpr: 2},
    {name: 'mob1x', w: 390, h: 844, dpr: 1},
    {name: 'mob3x', w: 390, h: 844, dpr: 3},
  ];
  const BPS = [640, 768, 1024, 1280, 1440, 1920];

  const measure = (p) =>
    p.evaluate(() =>
      [...document.querySelectorAll('img[srcset*="cdn.sanity.io"]')].map((i, idx) => {
        const b = i.getBoundingClientRect();
        const pb = i.parentElement.getBoundingClientRect();
        const id = (i.currentSrc || i.src).match(/\/([0-9a-f]{8})[0-9a-f]*-(\d+x\d+)/);
        return {
          idx,
          id: id ? id[1] + '-' + id[2] : '?',
          w: Math.round(b.width),
          h: Math.round(b.height),
          pw: Math.round(pb.width),
          visible: b.width > 0 && getComputedStyle(i).display !== 'none',
          cls: (i.className || '').toString().slice(0, 60),
          pcls: (i.parentElement.className || '').toString().slice(0, 70),
          nat: i.naturalWidth,
        };
      }),
    );

  const loadAll = async (p) => {
    await p.evaluate(() => document.querySelectorAll('img').forEach((i) => (i.loading = 'eager')));
    await p
      .waitForFunction(
        () => [...document.querySelectorAll('img[srcset*="cdn.sanity.io"]')].every((i) => i.complete),
        null,
        {timeout: 20000},
      )
      .catch(() => {});
    await p.waitForTimeout(500);
  };

  const simulateFix = (p) =>
    p.evaluate((BPS) => {
      document.querySelectorAll('img[srcset*="cdn.sanity.io"]').forEach((i) => {
        const first = i.srcset.split(',')[0].trim().split(' ')[0];
        const m = first.match(/-(\d+)x(\d+)\.(\w+)\?/);
        if (!m || m[3] === 'svg') return; // SVGs: Sanity serves untouched; fix leaves them alone
        const rect = first.match(/rect=(\d+),(\d+),(\d+),(\d+)/);
        const srcW = rect ? +rect[3] : +m[1];
        if (srcW >= BPS[BPS.length - 1]) return; // large sources unchanged
        const cands = [...BPS.filter((w) => w < srcW), srcW];
        i.srcset = cands.map((w) => first.replace(/([?&])w=\d+/, `$1w=${w}`) + ` ${w}w`).join(', ');
      });
    }, BPS);

  const results = {};
  for (const path of PAGES) {
    results[path] = {};
    for (const c of CONFIGS) {
      const ctx = await browser.newContext({viewport: {width: c.w, height: c.h}, deviceScaleFactor: c.dpr});
      const p = await ctx.newPage();
      try {
        await p.goto(BASE + path, {waitUntil: 'load', timeout: 45000});
        await loadAll(p);
        results[path][c.name] = await measure(p);
        if (c.dpr > 1) {
          await simulateFix(p);
          await loadAll(p);
          results[path][c.name + '_fix'] = await measure(p);
        }
      } catch (e) {
        results[path][c.name] = 'ERR ' + e.message.slice(0, 100);
      }
      await ctx.close();
    }
  }

  // Report images whose rendered width differs between 1x and high-DPR (layout must be DPR-independent)
  const report = [];
  for (const path of PAGES) {
    const r = results[path];
    for (const [lo, hi] of [['desk1x', 'desk2x'], ['mob1x', 'mob3x']]) {
      if (!Array.isArray(r[lo]) || !Array.isArray(r[hi])) { report.push({path, pair: lo + '/' + hi, err: true}); continue; }
      const fix = r[hi + '_fix'];
      r[hi].forEach((img, k) => {
        const base = r[lo][k];
        if (!base || !img.visible) return;
        if (Math.abs(base.w - img.w) > 2) {
          report.push({
            path, pair: lo + '/' + hi, id: img.id, cls: img.cls, pcls: img.pcls,
            w1x: base.w, wHi: img.w, wHiFixed: fix?.[k]?.w, parentW: base.pw,
          });
        }
      });
      // also: did the simulated fix change any image that was previously DPR-stable?
      if (fix) fix.forEach((img, k) => {
        const base = r[lo][k];
        if (!base || !img.visible) return;
        if (Math.abs(base.w - r[hi][k].w) <= 2 && Math.abs(img.w - r[hi][k].w) > 2) {
          report.push({path, pair: lo + '/' + hi, NEW_CHANGE_FROM_FIX: true, id: img.id, cls: img.cls, before: r[hi][k].w, after: img.w});
        }
      });
    }
  }
  const counts = Object.fromEntries(PAGES.map((p) => [p, Array.isArray(results[p].desk1x) ? results[p].desk1x.length : results[p].desk1x]));
  return JSON.stringify({counts, report}, null, 1);
}
