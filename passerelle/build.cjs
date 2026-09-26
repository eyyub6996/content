// Assemble passerelle_maths.html (un seul fichier, utilisable hors ligne).
// MathJax 3.2.2 et les données du cours complet sont repris d'un fichier existant :
//   node build.cjs [fichier-source.html]   (par défaut : passerelle_maths.html lui-même)
// Sortie : passerelle_maths.html (document complet) et dist/passerelle-maths.html (version Artifact, sans <html>/<head>/<body>).
const fs = require("fs"), path = require("path");
const here = p => path.join(__dirname, p);
const src = fs.readFileSync(process.argv[2] || here("passerelle_maths.html"), "utf8");
const mjStart = src.indexOf('<script>(function(){"use strict";var __webpack_modules__');
const mjEndMark = "r.CONFIG.failed(t)}))}()})();</script>";
const mjEnd = src.indexOf(mjEndMark, mjStart);
if (mjStart < 0 || mjEnd < 0) throw new Error("bloc MathJax introuvable");
const mathjax = src.slice(mjStart, mjEnd + mjEndMark.length);
const dStart = src.indexOf("const GUIDE = "), iStart = src.indexOf("const IMGS = ", dStart);
if (dStart < 0 || iStart < 0) throw new Error("données du cours introuvables");
const data = src.slice(dStart, src.indexOf("\n", iStart));
const css = fs.readFileSync(here("src/style.css"), "utf8");
const js = ["engine.js", "skills_a.js", "skills_b.js", "skills_c.js", "skills_d.js", "app.js"].map(f => fs.readFileSync(here("src/" + f), "utf8")).join("\n");
const title = "<title>Passerelle Maths</title>";
const fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,500;0,700;0,800;1,500&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">';
const mjConf = '<script>window.MathJax={tex:{inlineMath:[["\\\\(","\\\\)"]],displayMath:[["\\\\[","\\\\]"]]},svg:{fontCache:"global"},options:{enableMenu:false},startup:{typeset:false}};</script>';
const shell = '<div class="wrap"><div class="bar" id="bar"></div><main id="app"><p style="padding:40px 0;text-align:center;color:#56627A">Chargement du parcours…</p></main></div>';
const appScript = "<script>\n" + data + "\n</script>\n<script>\n" + js + "\n</script>";
const full = "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n" + title + "\n" + fonts + "\n<style>\n" + css + "\n</style>\n" + mjConf + "\n" + mathjax + "\n</head>\n<body>\n" + shell + "\n" + appScript + "\n</body>\n</html>\n";
const art = title + "\n" + fonts + "\n<style>\n" + css + "\n</style>\n" + mjConf + "\n" + mathjax + "\n" + shell + "\n" + appScript + "\n";
fs.writeFileSync(here("passerelle_maths.html"), full);
fs.mkdirSync(here("dist"), { recursive: true });
fs.writeFileSync(here("dist/passerelle-maths.html"), art);
console.log("passerelle_maths.html : " + (full.length / 1e6).toFixed(2) + " Mo");
