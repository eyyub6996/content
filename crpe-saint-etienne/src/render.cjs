// Rend guide.html en PDF A4 avec Chromium (Playwright).
// Usage : node render.cjs <entrée.html> <sortie.pdf>
const { chromium } = require("playwright");

(async () => {
  const [, , input, output] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + input, { waitUntil: "load", timeout: 300000 });
  await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 300000 });
  const errors = await page.evaluate(() => window.__errors || []);
  if (errors.length) {
    console.log(`Erreurs KaTeX (${errors.length}) :`);
    for (const e of errors.slice(0, 60)) console.log("  " + e);
    await browser.close();
    process.exit(2);
  }
  const footer = `
    <div style="font-family: 'Source Sans 3', sans-serif; font-size: 7.5px; color: #8a8f98; width: 100%;
                padding: 0 15mm; display: flex; justify-content: space-between;">
      <span>Réussir le CRPE 2027 — méthode complète</span>
      <span>page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>`;
  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: footer,
    margin: { top: "14mm", bottom: "16mm", left: "15mm", right: "15mm" },
    outline: false,
  });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
