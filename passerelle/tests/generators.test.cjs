// Vérifie chaque générateur : la réponse attendue doit être acceptée par le correcteur,
// les pièges refusés, le TeX équilibré, pas d'exception.
const fs = require("fs"), vm = require("vm");
const files = process.argv.slice(2).length ? process.argv.slice(2) : ["engine.js", "skills_a.js", "skills_b.js", "skills_c.js", "skills_d.js"].map(f => require("path").join(__dirname, "../src", f));
let code = files.filter(f => fs.existsSync(f)).map(f => fs.readFileSync(f, "utf8")).join("\n");
code += "\n;globalThis.__T={SKILLS,seeded,checkAnswer,previewTex,parse,toTex};";
const ctx = {}; vm.createContext(ctx); vm.runInContext(code, ctx);
const { SKILLS, seeded, checkAnswer, previewTex } = ctx.__T;
const N = +process.env.N || 250;
function balanced(s) { s = String(s).replace(/\\[{}]/g, ""); let d = 0; for (const c of s) { if (c === "{") d++; else if (c === "}") d--; if (d < 0) return false; } return d === 0; }
function delims(s) { const o = (String(s).match(/\\\(/g) || []).length, c = (String(s).match(/\\\)/g) || []).length; return o === c; }
function userInput(Q) {
  if (Q.type === "set" || Q.type === "tuple") return Q.ans.length ? Q.ans.join(" ; ") : "vide";
  if (Q.type === "eqn") return Q.ans + "=0";
  return Q.ans;
}
let bad = 0; const ids = new Set();
for (const S of SKILLS) { const t0 = Date.now(); if (process.env.V) console.log("…", S.id);
  if (ids.has(S.id)) { console.log("DOUBLON", S.id); bad++; } ids.add(S.id);
  let errs = [];
  for (let i = 1; i <= N; i++) {
    let Q;
    try { Q = seeded(i * 7919 + 13, () => S.gen()); } catch (e) { errs.push("seed " + i + " EXC " + e.message + " " + (e.stack || "").split("\n")[1]); continue; }
    if (!Q || !Q.q || !Q.type) { errs.push("seed " + i + " objet incomplet"); continue; }
    if (!Q.sol || !Q.sol.length) errs.push("seed " + i + " pas de solution");
    if (Q.atex === undefined) errs.push("seed " + i + " pas d'atex");
    for (const s of [Q.q, Q.atex, ...(Q.sol || []), ...(Q.opts || [])]) { if (!balanced(s)) errs.push("seed " + i + " accolades: " + String(s).slice(0, 160)); if (!delims(s)) errs.push("seed " + i + " délimiteurs: " + String(s).slice(0, 160)); if (/undefined|NaN|\[object/.test(String(s))) errs.push("seed " + i + " texte suspect: " + String(s).slice(0, 200)); }
    if (Q.type === "choice") { if (!(Q.a >= 0 && Q.a < Q.opts.length)) errs.push("seed " + i + " choix hors limites"); if (new Set(Q.opts).size !== Q.opts.length) errs.push("seed " + i + " options en double: " + Q.opts.join(" | ")); continue; }
    const inp = userInput(Q);
    const r = checkAnswer(Q, inp);
    if (r.s !== "ok") errs.push("seed " + i + " réponse refusée [" + inp + "] → " + r.s + " " + (r.m || "") + " | q=" + Q.q.slice(0, 120));
    if (previewTex(Q, inp) === null) errs.push("seed " + i + " aperçu impossible: " + inp);
    for (const t of Q.traps || []) {
      const ti = Array.isArray(t.ans) ? (t.ans.length ? t.ans.join(";") : "vide") : Q.type === "eqn" ? t.ans + "=0" : t.ans;
      const rt = checkAnswer(Q, ti);
      if (rt.s === "bad") errs.push("seed " + i + " piège illisible [" + ti + "] " + rt.m);
    }
  }
  if (errs.length) { bad++; console.log("✗ " + S.id + " (" + errs.length + ")\n   " + [...new Set(errs)].slice(0, 6).join("\n   ")); }
}
console.log(SKILLS.length + " compétences testées, " + bad + " avec erreurs.");
