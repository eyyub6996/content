// Crea il libro PDF (passerelle_libro.pdf) con le stesse lezioni dell'app.
//   node libro.cjs                → dist/libro.html + passerelle_libro.pdf (indice senza numeri di pagina: « 000 »)
//   node libro.cjs toc.json       → stessa cosa, con i numeri di pagina dell'indice presi da toc.json
// toc.json si ottiene dal primo PDF con tools/toc_pages.py (serve pypdf): due passaggi, stessa impaginazione.
// Serve Playwright con Chromium. MathJax e i dati del corso originale sono ripresi da passerelle_maths.html.
const fs = require("fs"), path = require("path");
const here = p => path.join(__dirname, p);
let pw; try { pw = require("playwright"); } catch (e) { pw = require(require("child_process").execSync("npm root -g").toString().trim() + "/playwright"); }
const src = fs.readFileSync(here("passerelle_maths.html"), "utf8");
const mjStart = src.indexOf('<script>(function(){"use strict";var __webpack_modules__');
const mjEndMark = "r.CONFIG.failed(t)}))}()})();</script>";
const mjEnd = src.indexOf(mjEndMark, mjStart);
if (mjStart < 0 || mjEnd < 0) throw new Error("blocco MathJax non trovato");
const mathjax = src.slice(mjStart, mjEnd + mjEndMark.length);
const gStart = src.indexOf("const GUIDE = ");
if (gStart < 0) throw new Error("dati del corso non trovati");
const guide = src.slice(gStart, src.indexOf("\n", gStart));
const toc = process.argv[2] ? fs.readFileSync(process.argv[2], "utf8") : "{}";
const css = ["fonts.css", "style.css", "book.css"].map(f => fs.readFileSync(here("src/" + f), "utf8")).join("\n");
const js = ["engine.js", "skills_0.js", "skills_a.js", "skills_b.js", "skills_c.js", "skills_d.js", "skills_e.js", "skills_v.js", "book.js"].map(f => fs.readFileSync(here("src/" + f), "utf8")).join("\n");
const mjConf = '<script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]],displayMath:[["\\\\[","\\\\]"]]},svg:{fontCache:"global"},options:{enableMenu:false},startup:{typeset:false}};</script>';
const html = '<!DOCTYPE html>\n<html lang="it" data-theme="light">\n<head>\n<meta charset="utf-8">\n<title>Passerelle Matematica · Il libro</title>\n<style>\n' + css + "\n</style>\n" + mjConf + "\n" + mathjax +
  "\n</head>\n<body>\n<main id=\"book\"></main>\n<script>window.TOC_PAGES=" + toc + ";\n" + guide + "\n</script>\n<script>\n" + js + "\n</script>\n</body>\n</html>\n";
fs.mkdirSync(here("dist"), { recursive: true });
fs.writeFileSync(here("dist/libro.html"), html);
(async () => {
  const b = await pw.chromium.launch();
  const p = await b.newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto("file://" + here("dist/libro.html"));
  await p.waitForFunction(() => window.__done === true, null, { timeout: 900000, polling: 1000 });
  const err = await p.evaluate(() => window.__err || (document.querySelector("[data-mjx-error]") || {}).outerHTML || "");
  if (err || errs.length) throw new Error("errore nel libro: " + err + " " + errs.join(" | "));
  await p.pdf({
    path: here("passerelle_libro.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true, outline: true, tagged: true,
    displayHeaderFooter: true, headerTemplate: "<div></div>",
    footerTemplate: '<div style="width:100%;font-size:8px;color:#8791A5;text-align:center;font-family:sans-serif">Passerelle · Matematica — pagina <span class="pageNumber"></span> di <span class="totalPages"></span></div>',
    margin: { top: "14mm", bottom: "16mm", left: "14mm", right: "14mm" },
  });
  await b.close();
  console.log("passerelle_libro.pdf: " + (fs.statSync(here("passerelle_libro.pdf")).size / 1e6).toFixed(1) + " MB");
})().catch(e => { console.error(e); process.exit(1); });
