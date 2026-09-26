/* =====================================================================
   APPLICATION : parcours, maîtrise, révisions espacées, examens, suivi
   ===================================================================== */
const KEY = "passerelle-maitrise-v1";
const DAY = 86400000;
const INTERVALS = [1, 3, 7, 14, 30, 60];
const SKB = {}; SKILLS.forEach((s, i) => { s.i = i; SKB[s.id] = s; });
const CHS = CHAPTERS.map(c => Object.assign({}, c, { skills: SKILLS.filter(s => s.ch === c.n) }));
const RANKS = [[0, "Scribe débutant"], [300, "Scribe de Babylone"], [900, "Élève d'al-Khwarizmi"], [1800, "Géomètre d'Alexandrie"], [3000, "Calculateur de Neper"], [4500, "Disciple de Newton"], [6500, "Héritier d'Archimède"], [9000, "Cartésien confirmé"], [12000, "Maître des complexes"], [16000, "Prêt pour la passerelle"]];

/* ---------- état et sauvegarde ---------- */
function fresh() { return { v: 1, up: 0, xp: 0, streak: { last: null, count: 0 }, examDate: null, sk: {}, gates: {}, exams: [], errs: [], hist: {}, time: 0, read: {}, welcome: 0 }; }
function migrate(o) { const d = fresh(); if (!o || typeof o !== "object") return d; for (const k in d) if (o[k] === undefined) o[k] = d[k]; return o; }
let P = fresh();
try { const s = localStorage.getItem(KEY); if (s) P = migrate(JSON.parse(s)); } catch (e) {}
const Sync = { doc: null, state: "local", timer: null, busy: false, again: false };
function save() {
  P.up = Date.now();
  const keys = Object.keys(P.hist).sort(); if (keys.length > 200) keys.slice(0, keys.length - 200).forEach(k => delete P.hist[k]);
  if (P.exams.length > 60) P.exams = P.exams.slice(-60);
  try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {}
  if (Sync.doc) { clearTimeout(Sync.timer); Sync.timer = setTimeout(pushRemote, 2500); }
}
async function pushRemote() {
  if (!Sync.doc) return; if (Sync.busy) { Sync.again = true; return; }
  Sync.busy = true;
  try { await Sync.doc.set(JSON.parse(JSON.stringify(P))); Sync.state = "account"; } catch (e) { Sync.state = "error"; }
  Sync.busy = false; drawBar();
  if (Sync.again) { Sync.again = false; pushRemote(); }
}
async function initSync() {
  if (!window.claude || typeof window.claude.use !== "function") return;
  try {
    const [user, db] = await Promise.all([window.claude.use("user"), window.claude.use("db")]);
    if (!user || !db) return;
    const uid = await user.id(); if (!uid) return;
    const doc = db.doc("data/users/" + uid + "/progress");
    const snap = await doc.get();
    Sync.doc = doc; Sync.state = "account";
    if (snap.exists) {
      const R = snap.data();
      if (R && (R.up || 0) > (P.up || 0)) { P = migrate(JSON.parse(JSON.stringify(R))); try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} if (typeof VIEW === "function") VIEW(); }
      else if ((P.up || 0) > ((R && R.up) || 0)) pushRemote();
    } else if (P.up) pushRemote();
    drawBar();
  } catch (e) { Sync.doc = null; Sync.state = "local"; }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && Sync.doc) { clearTimeout(Sync.timer); pushRemote(); } });

/* ---------- outils ---------- */
const $ = s => document.querySelector(s);
const app = document.getElementById("app");
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function dk(t) { const d = t ? new Date(t) : new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function daysUntil(dateStr) { return Math.round((new Date(dateStr + "T12:00:00") - new Date(dk() + "T12:00:00")) / DAY); }
function fmtDate(dateStr) { try { return new Date(dateStr + "T12:00:00").toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long" }); } catch (e) { return dateStr; } }
function fmtDur(sec) { sec = Math.round(sec); const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60); return h ? h + " h " + String(m).padStart(2, "0") : m + " min"; }
function debounce(f, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; }
function isTouch() { return window.matchMedia && window.matchMedia("(pointer: coarse)").matches; }
function typeset(el) {
  if (window.MathJax && MathJax.startup && MathJax.startup.promise) MathJax.startup.promise.then(() => { if (MathJax.typesetClear) MathJax.typesetClear([el]); return MathJax.typesetPromise([el]); }).catch(() => {});
}
function mjx(tex) { if (!(window.MathJax && MathJax.startup && MathJax.startup.promise)) return Promise.reject(new Error("no mj")); return MathJax.startup.promise.then(() => MathJax.tex2svgPromise(tex, { display: false })); }
let timers = [];
function stopTimers() { timers.forEach(t => clearInterval(t)); timers = []; }
let VIEW = null;
function go(html, view) { app.innerHTML = html; typeset(app); window.scrollTo(0, 0); if (view) VIEW = view; }
function makeQ(k, seed) { return seeded(seed, () => k.gen()); }
function shuffleR(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const IC = {
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 .1 1.8.9 3 2 3.5C11 8.5 12 5.5 12 2z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.1 4.5 4.5 0 0 0 7 18z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>',
};

/* ---------- XP, série, rangs ---------- */
function rankOf(xp) { let r = 0; RANKS.forEach((x, i) => { if (xp >= x[0]) r = i; }); return r; }
function touchStreak() {
  const t = dk(); if (P.streak.last === t) return;
  const y = dk(Date.now() - DAY);
  P.streak.count = P.streak.last === y ? P.streak.count + 1 : 1; P.streak.last = t;
}
function streakNow() { return P.streak.last === dk() || P.streak.last === dk(Date.now() - DAY) ? P.streak.count : 0; }
let toastT;
function toast(msg) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; d.setAttribute("role", "status");
  document.body.appendChild(d); clearTimeout(toastT); toastT = setTimeout(() => d.remove(), 2400);
}
function award(n, why) {
  if (!n) return; const before = rankOf(P.xp); P.xp += n;
  const after = rankOf(P.xp);
  if (after > before) toast("Nouveau rang : " + RANKS[after][1]); else if (why) toast("+" + n + " XP · " + why);
  drawBar();
}

/* ---------- état des compétences ---------- */
function S(id) { return P.sk[id] || (P.sk[id] = { st: 0, run: 0, n: 0, ok: 0, due: null, iv: 0, lap: 0, last: 0 }); }
function stOf(id) { const s = P.sk[id]; return s ? s.st : 0; } // 0 nouvelle, 1 en cours, 2 maîtrisée, 3 à consolider
function target(k) { return k.target || 4; }
function isDue(id) { const s = P.sk[id]; return !!(s && s.st === 2 && s.due && s.due <= Date.now()); }
function dueList() { return SKILLS.filter(k => isDue(k.id)).sort((a, b) => P.sk[a.id].due - P.sk[b.id].due); }
function weakList() { return SKILLS.filter(k => stOf(k.id) === 3); }
function mastered(k) { return stOf(k.id) === 2; }
function masteredCount() { return SKILLS.filter(mastered).length; }
function H() { const k = dk(); return P.hist[k] || (P.hist[k] = { q: 0, ok: 0, t: 0, m: 0 }); }
function chDone(c) { return c.skills.filter(mastered).length; }
function gateOK(n) { return !!(P.gates[n] && P.gates[n].passed); }

function recordAnswer(k, ok, mode, info) {
  info = info || {}; const s = S(k.id), now = Date.now(), ev = {}, h = H();
  s.n++; if (ok) s.ok++; s.last = now; h.q++; if (ok) h.ok++;
  const dt = Math.min(300, Math.max(0, info.dt || 0)); P.time += dt; h.t += dt;
  touchStreak();
  if (!ok && info.seed) { P.errs = P.errs.filter(e => !(e.k === k.id && e.s === info.seed)); P.errs.unshift({ k: k.id, s: info.seed, t: now }); if (P.errs.length > 80) P.errs.length = 80; }
  const firstMaster = () => { if (!s.ever) { s.ever = 1; h.m++; } };
  if (mode === "practice") {
    if (ok && !info.hint) s.run++; else if (!ok) s.run = 0;
    if (s.st === 0) s.st = 1;
    if (s.st === 1 && s.run >= target(k)) { s.st = 2; s.iv = 0; s.due = now + DAY; ev.mastered = 1; firstMaster(); }
    else if (s.st === 3 && s.run >= 2) { s.st = 2; s.iv = 0; s.due = now + DAY; ev.recovered = 1; }
    else if (s.st === 2 && !ok) { s.st = 3; s.run = 0; s.lap++; s.due = null; ev.demoted = 1; }
  } else {
    if (s.st === 2) {
      if (ok) { if (mode === "review" || !s.due || s.due - now < 2 * DAY) { s.iv = Math.min(s.iv + 1, INTERVALS.length - 1); s.due = now + INTERVALS[s.iv] * DAY; ev.promoted = 1; } }
      else { s.st = 3; s.run = 0; s.lap++; s.due = null; ev.demoted = 1; }
    } else if (s.st === 3) {
      if (ok) s.run++; else s.run = 0;
      if (s.run >= 2) { s.st = 2; s.iv = 0; s.due = now + DAY; ev.recovered = 1; }
    } else {
      if (ok && (mode === "gate" || mode === "exam")) { s.st = 2; s.iv = 0; s.due = now + 2 * DAY; s.run = target(k); ev.mastered = 1; firstMaster(); }
      else if (!ok) s.run = 0;
    }
  }
  let xp = ok ? (mode === "practice" ? (info.hint ? 2 : 5) : 8) : 0;
  if (ev.mastered) xp += 40; if (ev.recovered) xp += 15;
  award(xp, ev.mastered && mode === "practice" ? "compétence maîtrisée" : ev.recovered ? "compétence consolidée" : "");
  save(); return ev;
}
function nextSkillInOrder(after) {
  if (!after) { const inProg = SKILLS.find(k => stOf(k.id) === 1); if (inProg) return inProg; }
  const start = after ? SKB[after].i + 1 : 0;
  const order = SKILLS.slice(start).concat(SKILLS.slice(0, start));
  return order.find(k => stOf(k.id) === 0 || stOf(k.id) === 1) || null;
}
function gateReady() { return CHS.find(c => !gateOK(c.n) && chDone(c) === c.skills.length); }
function lastExam(kind) { const l = P.exams.filter(e => (kind ? e.k === kind : true)); return l[l.length - 1]; }

/* ---------- préparation : critères mesurables ---------- */
function readiness() {
  const tot = SKILLS.length, now = Date.now();
  const solid = SKILLS.filter(k => mastered(k) && !(P.sk[k.id].due && now - P.sk[k.id].due > 3 * DAY)).length;
  const stamps = CHS.filter(c => gateOK(c.n)).length;
  const gens = P.exams.filter(e => e.k === "gen").slice(-3); const genAvg = gens.length ? gens.reduce((a, e) => a + e.sc / e.n, 0) / 3 : 0;
  const qcm = P.exams.filter(e => e.k === "qcm30" || e.k === "qcmmix").slice(-3); const qcmBest = qcm.length ? Math.max(...qcm.map(e => e.sc / e.n)) : 0;
  const overdue = SKILLS.filter(k => mastered(k) && P.sk[k.id].due && now - P.sk[k.id].due > 3 * DAY).length;
  const pct = Math.round(100 * (0.5 * (solid / tot) + 0.15 * (stamps / 9) + 0.25 * genAvg + 0.1 * qcmBest));
  const crit = [
    { ok: masteredCount() === tot, t: "Toutes les compétences maîtrisées", v: masteredCount() + " / " + tot },
    { ok: stamps === 9, t: "Les 9 tampons d'escale (tests ≥ 90 %)", v: stamps + " / 9" },
    { ok: overdue === 0 && weakList().length === 0, t: "Aucune révision en retard, rien à consolider", v: overdue + weakList().length === 0 ? "✓" : (overdue + weakList().length) + " à reprendre" },
    { ok: gens.length === 3 && gens.every(e => e.sc / e.n >= 0.85), t: "3 derniers examens blancs complets ≥ 85 %", v: gens.length ? gens.map(e => Math.round((100 * e.sc) / e.n) + " %").join(" · ") : "aucun" },
    { ok: qcmBest >= 26 / 30, t: "Un examen QCM ≥ 26 / 30", v: qcm.length ? Math.round(qcmBest * 30) + " / 30" : "aucun" },
  ];
  return { pct: Math.min(100, pct), crit, ready: crit.every(c => c.ok) };
}

/* ---------- ce qu'il faut faire maintenant ---------- */
function nextAction() {
  const w = weakList(); if (w.length) return { label: "Consolider : " + w[0].title, sub: w.length + " compétence(s) à reconsolider (2 bonnes réponses d'affilée)", run: () => skillView(w[0].id, "practice") };
  const d = dueList(); if (d.length) return { label: "Révisions du jour", sub: d.length + " compétence(s) à revoir, une question chacune", run: () => startReview() };
  const g = gateReady(); if (g) return { label: "Test de l'escale " + g.n, sub: g.name + " : toutes les compétences sont maîtrisées, gagne le tampon", run: () => startGate(g.n) };
  const n = nextSkillInOrder(); if (n) return { label: (stOf(n.id) === 0 ? "Apprendre : " : "Continuer : ") + n.title, sub: "Escale " + n.ch + " · " + CHS[n.ch].name, run: () => skillView(n.id) };
  const lg = lastExam("gen"); if (!lg || Date.now() - lg.d > 2 * DAY || lg.sc / lg.n < 0.85) return { label: "Examen blanc complet", sub: "20 questions rédigées, 60 minutes", run: () => startExam("gen") };
  return { label: "Série mélangée", sub: "12 questions de tout le programme", run: () => startSprint() };
}
function planInfo() {
  const rem = SKILLS.filter(k => !mastered(k)).length;
  const left = P.examDate ? daysUntil(P.examDate) : null;
  const studyDays = left === null ? 28 : Math.max(1, left - 4);
  const perDay = rem ? Math.max(1, Math.ceil(rem / studyDays)) : 0;
  const last7 = []; for (let i = 0; i < 7; i++) { const h = P.hist[dk(Date.now() - i * DAY)]; last7.push(h ? h.m : 0); }
  const pace = last7.reduce((a, b) => a + b, 0) / 7;
  let finish = null; if (rem && pace > 0) finish = dk(Date.now() + Math.ceil(rem / pace) * DAY);
  return { rem, left, perDay, pace, finish };
}

/* ---------- barre du haut ---------- */
let barTitle = "", barBack = null;
function drawBar() {
  const r = rankOf(P.xp), s = streakNow();
  const sync = Sync.state === "account" ? '<span class="sync ok" title="Progression enregistrée sur ton compte">' + IC.cloud + "</span>" : Sync.state === "error" ? '<span class="sync err" title="Synchronisation en échec : la progression reste sur cet appareil">' + IC.cloud + "</span>" : "";
  document.getElementById("bar").innerHTML =
    (barBack ? '<button class="back" id="bk" aria-label="Retour">←</button>' : '<span class="logo" aria-hidden="true">Π</span>') +
    '<span class="grow">' + (barTitle || "Passerelle · maths") + "</span>" + sync +
    '<span class="pill xp" title="' + RANKS[r][1] + '">' + P.xp + " XP</span>" +
    '<span class="pill streak' + (s ? " on" : "") + '" title="Jours d\'étude d\'affilée">' + IC.flame + s + "</span>";
  const bk = document.getElementById("bk"); if (bk) bk.onclick = barBack;
}
function setBar(t, back) { barTitle = t; barBack = back; drawBar(); }

/* ---------- boîte de confirmation (dans la page) ---------- */
function askConfirm(msg, yes, onYes, no) {
  const d = document.createElement("div"); d.className = "modal";
  d.innerHTML = '<div class="mbox" role="dialog" aria-modal="true"><p>' + msg + '</p><div class="actions"><button class="btn ghost" data-a="no">' + (no || "Annuler") + '</button><button class="btn" data-a="yes">' + yes + "</button></div></div>";
  document.body.appendChild(d);
  d.querySelector('[data-a="no"]').onclick = () => d.remove();
  d.querySelector('[data-a="yes"]').onclick = () => { d.remove(); onYes(); };
  d.onclick = e => { if (e.target === d) d.remove(); };
  d.querySelector('[data-a="yes"]').focus();
}
function showModal(html) {
  const d = document.createElement("div"); d.className = "modal";
  d.innerHTML = '<div class="mbox wide" role="dialog" aria-modal="true">' + html + '<div class="actions"><span></span><button class="btn" data-a="close">Fermer</button></div></div>';
  document.body.appendChild(d); typeset(d);
  d.querySelector('[data-a="close"]').onclick = () => d.remove(); d.onclick = e => { if (e.target === d) d.remove(); };
  return d;
}
const HELP_HTML = `<h3 class="serif">Comment écrire ta réponse</h3><div class="tw"><table class="help">
<tr><th>Tu veux écrire</th><th>Tape</th></tr>
<tr><td>\\(\\frac34\\)</td><td><code>3/4</code></td></tr><tr><td>\\(x^2\\)</td><td><code>x^2</code> ou <code>x²</code></td></tr>
<tr><td>\\(\\sqrt{3}\\)</td><td><code>sqrt(3)</code> ou <code>√3</code></td></tr><tr><td>\\(\\frac{1}{2\\sqrt x}\\)</td><td><code>1/(2√x)</code> (mets des parenthèses !)</td></tr>
<tr><td>\\(e^{2x+1}\\)</td><td><code>e^(2x+1)</code></td></tr><tr><td>\\(\\ln(x^2+1)\\)</td><td><code>ln(x^2+1)</code></td></tr>
<tr><td>\\(\\frac{5\\pi}{6}\\)</td><td><code>5pi/6</code> ou <code>5π/6</code></td></tr><tr><td>\\(3-2i\\)</td><td><code>3-2i</code> (ou <code>j</code>)</td></tr>
<tr><td>\\(2e^{i\\pi/3}\\)</td><td><code>2e^(iπ/3)</code></td></tr><tr><td>solutions \\(-2\\) et \\(3\\)</td><td><code>-2 ; 3</code></td></tr>
<tr><td>aucune solution</td><td><code>vide</code></td></tr><tr><td>\\(]-\\infty;2]\\cup[3;+\\infty[\\)</td><td><code>]-inf;2] U [3;+inf[</code></td></tr>
<tr><td>\\(\\mathbb R\\setminus\\{3\\}\\)</td><td><code>R\\{3}</code></td></tr><tr><td>coordonnées \\((1;-2;3)\\)</td><td><code>(1;-2;3)</code></td></tr>
</table></div><p class="muted">L'aperçu sous la case te montre comment ta réponse a été lue. S'il ne correspond pas à ce que tu voulais, ajoute des parenthèses.</p>`;

/* ---------- carte-question (saisie, aperçu, correction) ---------- */
let QID = 0;
function placeholder(Qn) { return { num: "ta réponse, ex. 3/4", expr: "ex. 3x^2-2x+1", set: "ex. -2 ; 3   (ou « vide »)", interval: "ex. ]-2;5]", tuple: "ex. (1;-2)", lim: "ex. +inf ou 2/3", eqn: "ex. 2x-3y+5=0" }[Qn.type] || ""; }
function keysFor(Qn) {
  const K = [], add = (l, ins) => K.push([l, ins]), allow = Qn.allow || ["sqrt", "pi"], T = Qn.type;
  if (T === "interval") { ["[", "]", ";"].forEach(c => add(c, c)); add("−∞", "-inf"); add("+∞", "+inf"); add("∪", " U "); add("ℝ", "R"); add("∅", "vide"); add("−", "-"); add("/", "/"); if (/ln|e\^|sqrt/.test(Qn.ans)) { add("ln", "ln("); add("e", "e^("); add("√", "√("); } return K; }
  if (T === "lim") { add("+∞", "+inf"); add("−∞", "-inf"); }
  const vars = T === "expr" ? Qn.vars || ["x"] : T === "eqn" ? Qn.vars : [];
  vars.forEach(v => add(v, v));
  if (T === "expr" || T === "eqn") add("x²", "^2");
  add("^", "^"); add("/", "/"); add("(", "("); add(")", ")");
  if (T === "expr" || allow.includes("sqrt")) add("√", "√(");
  if (T === "expr" || allow.includes("e")) add("eˣ", "e^(");
  if (T === "expr" || allow.includes("ln")) add("ln", "ln(");
  if (T === "expr" && /sin|cos/.test(Qn.ans)) { add("sin", "sin("); add("cos", "cos("); }
  if (allow.includes("pi") && (T !== "num" || (Qn.form || []).includes("pi") || allow.includes("i"))) add("π", "π");
  if (allow.includes("i")) add("i", "i");
  if (T === "set" || T === "tuple") add(";", " ; ");
  if (T === "set") add("∅", "vide");
  if (T === "eqn") add("=", "=");
  add("−", "-");
  return K;
}
function insertAt(inp, s) {
  const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? inp.value.length;
  const close = s.endsWith("(") ? ")" : "";
  inp.value = inp.value.slice(0, a) + s + close + inp.value.slice(b);
  const pos = a + s.length; try { inp.setSelectionRange(pos, pos); } catch (e) {}
  if (!isTouch()) inp.focus();
}
let pvToken = 0;
function renderPreview(Qn, raw, pv) {
  if (!pv) return;
  if (!String(raw).trim()) { pv.innerHTML = '<span class="muted">tape ta réponse ci-dessus</span>'; return; }
  const t = previewTex(Qn, raw);
  if (t === null) { pv.innerHTML = '<span class="muted">… écriture incomplète</span>'; return; }
  const tok = ++pvToken;
  mjx(t).then(node => { if (tok !== pvToken) return; pv.innerHTML = ""; pv.appendChild(node); }).catch(() => { pv.textContent = raw; });
}
function solHTML(Qn) { return '<ol class="sol">' + Qn.sol.map(s => "<li>" + s + "</li>").join("") + "</ol>"; }
function answerLine(Qn) { return Qn.type === "choice" ? "<p><b>Bonne réponse :</b> " + "ABCD"[Qn.a] + ". " + Qn.opts[Qn.a] + "</p>" : "<p><b>Réponse :</b> \\(" + Qn.atex + "\\)</p>"; }
function feedbackHTML(Qn, res) {
  if (res.s === "ok") return '<div class="fbx good"><b class="fbt">' + IC.check + " Juste</b>" + answerLine(Qn) + "<details><summary>Voir la correction</summary>" + solHTML(Qn) + "</details></div>";
  const t = res.giveup ? "Voici la solution" : res.form ? "Presque : la valeur est juste, pas la forme" : "Pas juste";
  return '<div class="fbx bad"><b class="fbt">' + IC.cross + " " + t + "</b>" + (res.m ? '<p class="why">' + res.m + "</p>" : "") + answerLine(Qn) + '<p class="solh">Correction pas à pas</p>' + solHTML(Qn) + "</div>";
}
function qcardHTML(Qn, o) {
  const id = "q" + ++QID; let body;
  if (Qn.type === "choice") body = '<div class="opts">' + Qn.opts.map((op, k) => '<button class="opt" data-k="' + k + '"><span class="l">' + "ABCD"[k] + "</span><span>" + op + "</span></button>").join("") + "</div>";
  else body = '<form class="inrow" autocomplete="off">' + (Qn.pre ? '<span class="pre">\\(' + Qn.pre.replace("=", "=") + "\\)</span>" : "") +
    '<input class="ans" id="' + id + '-in" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="' + esc(placeholder(Qn)) + '" aria-label="Ta réponse">' +
    '<button class="btn go" type="submit">' + (o.exam ? "Enregistrer" : "Vérifier") + "</button></form>" +
    '<div class="preview"><span class="pvl">Lu :</span> <span class="pv"></span></div>' +
    '<div class="keys" aria-label="Clavier mathématique">' + keysFor(Qn).map(k => '<button type="button" class="kb" data-ins="' + esc(k[1]) + '">' + k[0] + "</button>").join("") + "</div>";
  const tools = o.exam ? "" : '<div class="qtools">' + (o.hints ? '<button class="linkbtn" data-act="hint">Un indice</button>' : "") + '<button class="linkbtn" data-act="giveup">Je ne sais pas</button><button class="linkbtn" data-act="help">Comment écrire ?</button></div>';
  return '<div class="qcard" id="' + id + '"><div class="qtext">' + Qn.q + "</div>" + body + tools + '<div class="fb" aria-live="polite"></div></div>';
}
function wireQCard(root, Qn, o) {
  const inp = root.querySelector(".ans"), pv = root.querySelector(".pv"), fb = root.querySelector(".fb");
  const st = { hint: false, done: false, t0: Date.now() };
  if (inp) {
    if (o.initial) inp.value = o.initial;
    const upd = debounce(() => renderPreview(Qn, inp.value, pv), 140);
    inp.addEventListener("input", () => { upd(); if (o.onChange) o.onChange(inp.value); });
    root.querySelector("form").onsubmit = e => {
      e.preventDefault();
      if (o.exam) { if (o.onChange) o.onChange(inp.value); if (o.onSubmit) o.onSubmit(); return; }
      submit(inp.value);
    };
    root.querySelectorAll(".kb").forEach(b => { b.addEventListener("pointerdown", e => e.preventDefault()); b.onclick = () => { insertAt(inp, b.dataset.ins); upd(); if (o.onChange) o.onChange(inp.value); }; });
    renderPreview(Qn, inp.value, pv);
    if (o.focus && !isTouch()) setTimeout(() => inp.focus(), 60);
  } else {
    root.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      if (o.exam) { root.querySelectorAll(".opt").forEach(x => x.classList.toggle("sel", x === b)); if (o.onChange) o.onChange(+b.dataset.k); return; }
      submit(+b.dataset.k);
    });
    if (o.exam && o.initial !== undefined && o.initial !== "" && o.initial !== null) { const b = root.querySelector('.opt[data-k="' + o.initial + '"]'); if (b) b.classList.add("sel"); }
  }
  root.querySelectorAll("[data-act]").forEach(b => b.onclick = () => {
    const a = b.dataset.act;
    if (a === "hint") { if (st.done) return; st.hint = true; fb.innerHTML = '<div class="fbx hint"><b>Indice.</b> ' + (Qn.hint || Qn.sol[0]) + '<p class="muted small">Avec un indice, la question ne compte pas pour ta série.</p></div>'; typeset(fb); b.remove(); }
    else if (a === "giveup") { if (!st.done) finish({ s: "ko", m: "", giveup: 1 }, null); }
    else if (a === "help") showModal(HELP_HTML);
  });
  function submit(v) {
    if (st.done) return;
    const res = checkAnswer(Qn, v);
    if (res.s === "bad") { fb.innerHTML = '<div class="fbx warn">' + res.m + "</div>"; typeset(fb); return; }
    finish(res, v);
  }
  function finish(res, v) {
    st.done = true;
    if (inp) { inp.disabled = true; root.querySelector(".go").disabled = true; }
    root.querySelectorAll(".kb,.opt").forEach(b => b.disabled = true);
    const tools = root.querySelector(".qtools"); if (tools) tools.remove();
    if (Qn.type === "choice") root.querySelectorAll(".opt").forEach(b => { const k = +b.dataset.k; if (k === Qn.a) b.classList.add("good"); else if (k === v) b.classList.add("bad"); });
    fb.innerHTML = feedbackHTML(Qn, res); typeset(fb);
    if (o.onAnswer) o.onAnswer(res, { hint: st.hint, dt: (Date.now() - st.t0) / 1000 });
  }
  return st;
}

/* =========================== ACCUEIL =========================== */
function ring(pct) {
  const r = 42, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return '<svg viewBox="0 0 100 100" class="ring" role="img" aria-label="Préparation ' + pct + ' %"><circle cx="50" cy="50" r="' + r + '" class="rt"/><circle cx="50" cy="50" r="' + r + '" class="rv" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 50 50)"/><text x="50" y="49" class="rn">' + pct + '<tspan class="rp">%</tspan></text><text x="50" y="66" class="rl">prêt</text></svg>';
}
function home() {
  stopTimers(); setBar("", null); VIEW = home;
  const R = readiness(), pl = planInfo(), na = nextAction(), due = dueList().length, weak = weakList().length, h = P.hist[dk()] || { q: 0, ok: 0, t: 0, m: 0 };
  const left = pl.left;
  const count = P.examDate ? (left > 0 ? '<span class="big">J − ' + left + "</span><span class=\"cap\">avant l'épreuve · " + fmtDate(P.examDate) + "</span>" : left === 0 ? '<span class="big">Jour J</span><span class="cap">Relis le formulaire et fais confiance à ton travail.</span>' : '<span class="big">Date passée</span><span class="cap"><button class="linkbtn light" id="setDate2">Mettre à jour la date</button></span>') : '<span class="big small">Quand est ton examen ?</span><span class="cap">Indique la date : ton plan du jour en dépend.</span><span><button class="btn brass" id="setDate">Fixer la date</button></span>';
  const g = gateReady();
  const lg = lastExam("gen");
  const examDue = masteredCount() >= SKILLS.length * 0.5 && (!lg || Date.now() - lg.d > 6 * DAY);
  const items = [];
  if (due || h.rev) items.push({ done: due === 0, t: due ? "Révisions : " + due + " compétence" + (due > 1 ? "s" : "") + " à revoir" : "Révisions du jour faites", s: "Une question par compétence. Une erreur la renvoie en consolidation.", go: due ? "rev" : null });
  if (weak) items.push({ done: false, t: "Consolider : " + weak + " compétence" + (weak > 1 ? "s" : ""), s: "2 bonnes réponses d'affilée pour chacune.", go: "weak" });
  if (pl.rem) { const nx = nextSkillInOrder(); items.push({ done: h.m >= pl.perDay, t: "Nouvelles compétences : " + Math.min(h.m, pl.perDay) + " / " + pl.perDay + " aujourd'hui", s: nx ? "Prochaine : " + nx.title + " (escale " + nx.ch + ")" : "", go: "new" }); }
  if (g) items.push({ done: false, t: "Test de l'escale " + g.n + " : " + g.name, s: "≥ 90 % pour gagner le tampon.", go: "gate" });
  if (examDue || (!pl.rem && !R.ready)) items.push({ done: false, t: "Examen blanc de la semaine", s: "20 questions rédigées en 60 minutes.", go: "exam" });
  if (!items.length) items.push({ done: true, t: "Programme terminé", s: "Entretiens ta forme avec une série mélangée par jour.", go: "sprint" });
  const mins = Math.round(Math.min(pl.perDay, pl.rem) * 15 + due * 1.5 + weak * 4);
  const pace = pl.rem ? (pl.finish ? "À ton rythme actuel, programme terminé le <b>" + fmtDate(pl.finish) + "</b>." : "Maîtrise une première compétence pour voir ta date de fin prévue.") : "Tout le programme est maîtrisé.";
  const warn = pl.left !== null && pl.left > 0 && pl.perDay >= 5 ? '<p class="alert">Rythme élevé : ' + pl.perDay + " compétences par jour. Fais deux sessions (matin et soir) plutôt qu'une longue.</p>" : "";
  const welcome = !P.welcome ? `<section class="card welcome"><h2 class="serif">Comment ce parcours te rend prêt</h2>
    <ol class="steps"><li><b>110 compétences</b> couvrent tout le programme. Chacune : une mini-leçon, puis des exercices générés à l'infini, corrigés automatiquement.</li>
    <li>Une compétence est <b>maîtrisée</b> quand tu réussis 4 exercices d'affilée sans aide. Pas avant.</li>
    <li>Elle revient ensuite en <b>révision</b> après 1, 3, 7, 14, 30 jours. Une erreur la renvoie en consolidation : aucune lacune ne peut se cacher.</li>
    <li>Chaque escale se termine par un <b>test ≥ 90 %</b>, puis des <b>examens blancs</b> chronométrés mesurent ton niveau réel.</li></ol>
    <p class="muted">Tu connais déjà une partie ? Passe le <b>test de l'escale</b> : chaque bonne réponse valide directement la compétence.</p>
    <div class="actions"><button class="btn ghost" id="wGuide">Tout le mode d'emploi</button><button class="btn" id="wOk">C'est parti</button></div></section>` : "";
  go(`
  <section class="hero">
    <div class="hl">${count}
      <div class="hstats"><span><b>${masteredCount()}</b>/${SKILLS.length} compétences</span><span><b>${CHS.filter(c => gateOK(c.n)).length}</b>/9 tampons</span><span>${IC.clock} <b>${fmtDur(P.time)}</b> d'étude</span></div>
    </div>
    <button class="hr" id="toReady" aria-label="Voir les critères de préparation">${ring(R.pct)}</button>
  </section>
  ${welcome}
  <section class="card mission">
    <div class="mh"><h2 class="serif">Ta mission du jour</h2><span class="muted">≈ ${Math.max(15, mins)} min</span></div>
    <ul class="mlist">${items.map((it, i) => `<li class="${it.done ? "done" : ""}"><span class="mi">${it.done ? IC.check : '<span class="dotn">' + (i + 1) + "</span>"}</span><span class="mt"><b>${it.t}</b><small>${it.s}</small></span>${it.go && !it.done ? `<button class="small-btn" data-go="${it.go}">Go</button>` : ""}</li>`).join("")}</ul>
    ${warn}
    <button class="cta" id="cta">${IC.play}<span><b>${na.label}</b><small>${na.sub}</small></span></button>
    <p class="muted small">${pace}</p>
  </section>
  <h2 class="sec-title">Le parcours</h2>
  <nav class="route" aria-label="Escales">
    ${CHS.map(c => { const d = chDone(c), stamp = gateOK(c.n), st = STORIES[c.n] || { where: "" };
      const segs = c.skills.map(k => { const s = stOf(k.id); return '<i class="sg' + s + (isDue(k.id) ? " due" : "") + '"></i>'; }).join("");
      return `<button class="stop ${stamp ? "done" : ""}" data-c="${c.n}"><span class="dot">${stamp ? IC.check : c.n}</span><span class="card"><span class="where">${st.where}</span><span class="what">${c.name}</span><span class="segs" aria-label="${d} compétences maîtrisées sur ${c.skills.length}">${segs}</span><span class="minib">${d}/${c.skills.length} maîtrisées${stamp ? " · tampon obtenu" : d === c.skills.length ? " · test disponible" : ""}</span></span></button>`; }).join("")}
  </nav>
  <h2 class="sec-title">Outils</h2>
  <div class="tools">
    <button class="tool" id="tExam"><b>Examens blancs</b><span>Rédigés ou QCM, chronométrés${lg ? " · dernier " + Math.round((100 * lg.sc) / lg.n) + " %" : ""}</span></button>
    <button class="tool" id="tSprint"><b>Série mélangée</b><span>12 questions de ce que tu as appris</span></button>
    <button class="tool" id="tErr"><b>Carnet d'erreurs</b><span>${P.errs.length} erreur(s) à relire et refaire</span></button>
    <button class="tool" id="tStats"><b>Statistiques</b><span>Ce que tu as fait, jour par jour</span></button>
    <button class="tool" id="tLib"><b>Cours complet</b><span>Les leçons détaillées et le formulaire</span></button>
    <button class="tool" id="tSet"><b>Date, sauvegarde</b><span>${Sync.state === "account" ? "Enregistré sur ton compte" : "Enregistré sur cet appareil"}</span></button>
  </div>
  <p class="foot"><button class="linkbtn" id="tGuide">Mode d'emploi et garanties</button></p>`, home);
  $("#cta").onclick = na.run;
  const sd = $("#setDate") || $("#setDate2"); if (sd) sd.onclick = settingsView;
  $("#toReady").onclick = readyView;
  app.querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
    const g0 = b.dataset.go;
    if (g0 === "rev") startReview(); else if (g0 === "weak") skillView(weakList()[0].id, "practice");
    else if (g0 === "new") { const n = nextSkillInOrder(); if (n) skillView(n.id); }
    else if (g0 === "gate") startGate(gateReady().n); else if (g0 === "exam") examsHome(); else startSprint();
  });
  app.querySelectorAll(".stop").forEach(b => b.onclick = () => chapterView(+b.dataset.c));
  $("#tExam").onclick = examsHome; $("#tSprint").onclick = startSprint; $("#tErr").onclick = errorsView; $("#tStats").onclick = statsView; $("#tLib").onclick = libraryHome; $("#tSet").onclick = settingsView; $("#tGuide").onclick = guideView;
  const wOk = $("#wOk"); if (wOk) { wOk.onclick = () => { P.welcome = 1; save(); home(); }; $("#wGuide").onclick = guideView; }
}

function readyView() {
  stopTimers(); setBar("Suis-je prêt ?", home); VIEW = readyView;
  const R = readiness();
  go(`<header class="chead"><div class="where">Mesure objective</div><h2>Prêt pour la passerelle : ${R.pct} %</h2><p>Ce pourcentage combine tes compétences maîtrisées (50 %), tes tampons d'escale (15 %), tes 3 derniers examens blancs complets (25 %) et ton meilleur QCM (10 %). Tu es prêt quand les cinq critères ci-dessous sont verts.</p></header>
  <section class="panel"><ul class="crit">${R.crit.map(c => `<li class="${c.ok ? "ok" : ""}"><span class="mi">${c.ok ? IC.check : IC.cross}</span><span class="mt"><b>${c.t}</b><small>${c.v}</small></span></li>`).join("")}</ul>
  ${R.ready ? '<div class="seal big"><span>Prêt<small>pour la passerelle</small></span></div><p class="center">Tous les critères sont remplis. Continue les révisions du jour jusqu\'à l\'épreuve pour rester à ce niveau.</p>' : '<p class="muted">Suis la mission du jour : elle te fait avancer exactement vers ces critères.</p>'}
  <div class="actions"><span></span><button class="btn" id="bk2">Retour</button></div></section>`);
  $("#bk2").onclick = home;
}

/* =========================== ESCALE =========================== */
function chapterView(n) {
  stopTimers(); const c = CHS[n], st = STORIES[n] || { where: "", title: "", story: [], lien: "", tricks: [] }; VIEW = () => chapterView(n);
  setBar("Escale " + n + " · " + c.short, home);
  const d = chDone(c), gate = P.gates[n];
  const row = k => {
    const s = S(k.id), stt = s.st, due = isDue(k.id);
    const lab = stt === 2 ? (due ? "à réviser aujourd'hui" : "maîtrisée · révision " + (s.due ? "dans " + Math.max(1, Math.ceil((s.due - Date.now()) / DAY)) + " j" : "")) : stt === 3 ? "à consolider" : stt === 1 ? "en cours · série " + s.run + "/" + target(k) : "à découvrir";
    return `<button class="srow st${stt}${due ? " due" : ""}" data-k="${k.id}"><span class="sico">${stt === 2 ? IC.check : stt === 3 ? "!" : k.i - c.skills[0].i + 1}</span><span class="stx"><b>${k.title}</b><small>${lab}${s.n ? " · " + Math.round((100 * s.ok) / s.n) + " % de réussite" : ""}</small></span></button>`;
  };
  go(`<header class="chead"><div class="where">${st.where}</div><h2>${c.name}</h2><p>${d} / ${c.skills.length} compétences maîtrisées${gate && gate.passed ? " · tampon obtenu (" + gate.best + " %)" : gate ? " · meilleur test : " + gate.best + " %" : ""}</p></header>
  <div class="gatebox ${gateOK(n) ? "won" : ""}">${gateOK(n) ? '<div class="seal sm"><span>' + (st.where.split(",")[0] || "Escale") + "<small>" + n + "</small></span></div>" : ""}<div><b>Test de l'escale</b><p>Une question par compétence, sans indice. Au moins 90 % et toutes les compétences maîtrisées : tu gagnes le tampon. Tu peux aussi le passer <b>au début</b> pour valider directement ce que tu sais déjà.</p><button class="btn" id="gateBtn">${gateOK(n) ? "Repasser le test" : "Passer le test"}</button></div></div>
  <h3 class="sec-title">Les compétences</h3>
  <div class="slist">${c.skills.map(row).join("")}</div>
  <details class="story"><summary>L'histoire de l'escale : ${st.title}</summary>${(st.story || []).map(p => "<p>" + p + "</p>").join("")}<div class="lien">${st.lien || ""}</div>${(st.tricks || []).map(t => '<div class="trick"><b class="t">' + t.t + "</b>" + t.d + "</div>").join("")}</details>
  <div class="actions"><button class="btn ghost" id="libBtn">Cours complet du chapitre</button><button class="btn" id="homeBtn">Retour au parcours</button></div>`);
  app.querySelectorAll(".srow").forEach(b => b.onclick = () => skillView(b.dataset.k));
  $("#gateBtn").onclick = () => startGate(n); $("#libBtn").onclick = () => libChapter(n, 0); $("#homeBtn").onclick = home;
}

/* =========================== COMPÉTENCE =========================== */
function meterHTML(k) {
  const s = S(k.id), t = s.st === 3 ? 2 : target(k), filled = s.st === 2 ? t : Math.min(s.run, t);
  let dots = ""; for (let i = 0; i < t; i++) dots += '<i class="' + (i < filled ? "on" : "") + '"></i>';
  const lab = s.st === 2 ? "Maîtrisée" : s.st === 3 ? "À consolider : " + filled + "/2 d'affilée" : "Série : " + filled + "/" + t + " d'affilée";
  return '<span class="meter st' + s.st + '" aria-label="' + lab + '">' + dots + "<em>" + lab + "</em></span>";
}
function skillView(id, tab) {
  stopTimers(); const k = SKB[id], c = CHS[k.ch]; VIEW = null;
  setBar("Escale " + k.ch + " · " + c.short, () => chapterView(k.ch));
  let T = tab || (stOf(id) === 0 ? "learn" : "practice");
  const shell = () => `<header class="chead"><div class="where">Escale ${k.ch} · ${c.name}</div><h2>${k.title}</h2><div id="meter">${meterHTML(k)}</div></header>
    <div class="tabs" role="tablist"><button class="tab" role="tab" data-t="learn" aria-selected="${T === "learn"}">Comprendre</button><button class="tab" role="tab" data-t="practice" aria-selected="${T === "practice"}">S'entraîner</button></div><div id="body"></div>`;
  go(shell());
  app.querySelectorAll(".tab").forEach(b => b.onclick = () => { T = b.dataset.t; app.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x === b)); body(); });
  body();
  function body() { if (T === "learn") learn(); else practice(); }
  function learn() {
    const ex = makeQ(k, newSeed());
    $("#body").innerHTML = `<section class="panel lesson">${k.learn}
      <div class="box example"><div class="bt">Exemple corrigé</div><div class="exq">${ex.q}</div>${ex.type === "choice" ? answerLine(ex) : "<p><b>Réponse :</b> \\(" + ex.atex + "\\)</p>"}${solHTML(ex)}<button class="small-btn" id="anotherEx">Un autre exemple</button></div>
      <div class="actions"><button class="btn ghost" id="toLib">Relire le cours complet</button><button class="btn" id="toPr">Je m'entraîne</button></div></section>`;
    typeset($("#body"));
    $("#anotherEx").onclick = learn;
    $("#toPr").onclick = () => { T = "practice"; app.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x.dataset.t === "practice")); body(); };
    $("#toLib").onclick = () => libChapter(k.ch, k.ref, id);
  }
  function practice() {
    const s = S(id);
    const intro = s.st === 2 ? "Compétence maîtrisée. Tu peux t'entraîner encore : une erreur la remettrait en consolidation." : s.st === 3 ? "Réussis 2 exercices d'affilée pour la reconsolider." : "Réussis " + target(k) + " exercices d'affilée, sans indice, pour la maîtriser.";
    $("#body").innerHTML = `<p class="muted small">${intro}</p><div id="qh"></div><div id="after"></div>`;
    const seed = newSeed(), Qn = makeQ(k, seed);
    $("#qh").innerHTML = qcardHTML(Qn, { hints: true });
    wireQCard($("#qh").firstElementChild, Qn, { hints: true, focus: true, onAnswer: (res, inf) => {
      const ev = recordAnswer(k, res.s === "ok", "practice", { hint: inf.hint, seed, dt: inf.dt });
      $("#meter").innerHTML = meterHTML(k);
      const aft = $("#after");
      if (ev.mastered || ev.recovered) {
        const nxt = nextSkillInOrder(id);
        aft.innerHTML = `<div class="win"><div class="seal sm"><span>${ev.mastered ? "Maîtrisée" : "Consolidée"}<small>+${ev.mastered ? 40 : 15} XP</small></span></div><div><b>${k.title}</b><p>${ev.mastered ? "Elle reviendra en révision demain, puis dans 3, 7, 14 et 30 jours." : "De retour dans tes révisions espacées."}</p></div></div>
          <div class="actions"><button class="btn ghost" id="again">Encore un exercice</button><button class="btn" id="nextSk">${nxt ? "Compétence suivante" : "Retour au parcours"}</button></div>`;
        $("#again").onclick = practice;
        $("#nextSk").onclick = () => { const na = nextAction(); if (weakList().length || dueList().length) na.run(); else if (nxt) skillView(nxt.id); else home(); };
      } else {
        aft.innerHTML = `<div class="actions"><button class="btn ghost" id="toLearn">Revoir la leçon</button><button class="btn" id="nq">Question suivante</button></div>`;
        $("#nq").onclick = practice; $("#nq").focus({ preventScroll: true }); $("#toLearn").onclick = () => { T = "learn"; app.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x.dataset.t === "learn")); body(); };
      }
    } });
    typeset($("#qh"));
  }
}

/* =========================== SÉRIES (correction immédiate) =========================== */
function runSession(cfg) {
  stopTimers(); VIEW = null; let i = 0; const results = [], t0 = Date.now();
  setBar(cfg.title, () => askConfirm("Quitter la série ? Les réponses déjà données restent enregistrées.", "Quitter", cfg.back || home));
  function draw() {
    if (i >= cfg.items.length) return end();
    const it = cfg.items[i], k = SKB[it.k], Qn = makeQ(k, it.seed);
    go(`<section class="panel"><div class="qtop"><span>Question ${i + 1} / ${cfg.items.length}</span><span class="tag">${cfg.hideTitle ? "Escale " + k.ch : k.title}</span></div><div class="prog"><i style="width:${(i / cfg.items.length) * 100}%"></i></div><div id="qh"></div><div class="actions"><span></span><button class="btn" id="nx" hidden>${i === cfg.items.length - 1 ? "Voir le bilan" : "Question suivante"}</button></div></section>`);
    $("#qh").innerHTML = qcardHTML(Qn, { hints: false });
    wireQCard($("#qh").firstElementChild, Qn, { focus: true, onAnswer: (res, inf) => {
      const ok = res.s === "ok"; const ev = recordAnswer(k, ok, cfg.mode, { seed: it.seed, dt: inf.dt });
      results.push({ k: it.k, ok, ev, seed: it.seed });
      const nx = $("#nx"); nx.hidden = false; nx.onclick = () => { i++; draw(); }; nx.focus({ preventScroll: true });
    } });
    typeset($("#qh"));
  }
  function end() {
    const sc = results.filter(r => r.ok).length, n = results.length;
    const extra = cfg.onEnd ? cfg.onEnd(results, sc, n) : "";
    setBar(cfg.title + " · bilan", home);
    go(`<section class="panel"><div class="result"><h3>${sc} / ${n}</h3>${extra || '<p class="muted">' + (sc === n ? "Sans faute." : "Les erreurs sont dans ton carnet, et les compétences concernées passent en consolidation.") + "</p>"}</div>
      <ul class="rlist">${results.map(r => `<li class="${r.ok ? "ok" : "ko"}"><span class="mi">${r.ok ? IC.check : IC.cross}</span><span class="mt"><b>${SKB[r.k].title}</b><small>${r.ev.demoted ? "passe en consolidation" : r.ev.mastered ? "validée" : r.ev.recovered ? "reconsolidée" : r.ev.promoted ? "prochaine révision dans " + INTERVALS[S(r.k).iv] + " j" : r.ok ? "juste" : "à retravailler"}</small></span>${r.ok ? "" : `<button class="small-btn" data-k="${r.k}">S'entraîner</button>`}</li>`).join("")}</ul>
      <div class="actions"><span></span><button class="btn" id="hb">Continuer</button></div></section>`);
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => skillView(b.dataset.k, "practice"));
    $("#hb").onclick = () => (cfg.after ? cfg.after() : home());
  }
  draw();
}
function startReview() {
  const d = dueList().slice(0, 20); if (!d.length) { toast("Aucune révision due aujourd'hui."); return home(); }
  P.hist[dk()] = Object.assign(H(), { rev: 1 }); save();
  runSession({ title: "Révisions du jour", mode: "review", hideTitle: true, items: shuffleR(d).map(k => ({ k: k.id, seed: newSeed() })) });
}
function startGate(n) {
  const c = CHS[n];
  runSession({ title: "Test de l'escale " + n, mode: "gate", hideTitle: false, back: () => chapterView(n), items: shuffleR(c.skills).map(k => ({ k: k.id, seed: newSeed() })),
    after: () => chapterView(n),
    onEnd: (res, sc, tot) => {
      const pct = Math.round((100 * sc) / tot), all = chDone(c) === c.skills.length, prev = P.gates[n] || { best: 0 };
      const win = pct >= 90 && all, first = win && !prev.passed;
      P.gates[n] = { best: Math.max(prev.best || 0, pct), passed: prev.passed || win, d: Date.now() };
      if (first) award(150, "tampon de l'escale " + n);
      save();
      const st = STORIES[n] || { where: "Escale" };
      return win ? '<div class="seal"><span>' + st.where.split(",")[0] + "<small>" + ((st.where.split(",")[1] || "").trim()) + '</small></span></div><p>Tampon ' + (first ? "gagné" : "confirmé") + " : " + pct + " %.</p>"
        : "<p>" + pct + " % : " + (pct < 90 ? "il faut 90 % pour le tampon. " : "score suffisant, mais " + (c.skills.length - chDone(c)) + " compétence(s) ne sont pas encore maîtrisées. ") + "Les bonnes réponses ont validé les compétences correspondantes ; travaille les autres, puis repasse le test.</p>";
    } });
}
function startSprint() {
  let pool = SKILLS.filter(k => stOf(k.id) >= 1);
  if (pool.length < 4) pool = SKILLS.filter(k => k.ch <= 1);
  const items = shuffleR(pool).slice(0, 12).map(k => ({ k: k.id, seed: newSeed() }));
  runSession({ title: "Série mélangée", mode: "sprint", hideTitle: true, items });
}

/* =========================== EXAMENS =========================== */
function libData() {
  if (libData.c) return libData.c;
  const CHL = GUIDE.chapters.map(c => {
    const h1 = c.blocks[0], secs = []; let cur = { title: "Pour commencer", blocks: [] }, ex = null, sol = null, exam = null, examSol = null;
    c.blocks.slice(1).forEach(b => {
      if (b.t === "h2") { if (cur.blocks.length) secs.push(cur); cur = { title: b.html, blocks: [] }; }
      else if (b.t === "exblock") ex = b; else if (b.t === "solblock") sol = b; else if (b.t === "qcm") exam = b.items; else if (b.t === "qcmsol") examSol = b.items; else cur.blocks.push(b);
    });
    if (cur.blocks.length) secs.push(cur);
    const exos = ex ? ex.ex.map((e, i) => ({ lv: e.lv, html: e.html, parts: sol ? sol.sol[i].parts : [] })) : [];
    const qs = [];
    if (ex && ex.qcm) ex.qcm.forEach((q0, i) => { const s = sol.qsol[i]; qs.push({ q: q0.q, type: "choice", opts: q0.o, a: "ABCD".indexOf(s.a), sol: [s.e], atex: "", ch: +c.n }); });
    (BOSS[c.n] || []).forEach(b => qs.push({ q: b[0], type: "choice", opts: b[1], a: b[2], sol: [b[3]], atex: "", ch: +c.n }));
    let examQs = null;
    if (exam) examQs = exam.map((q0, i) => ({ q: q0.q, type: "choice", opts: q0.o, a: "ABCD".indexOf(examSol[i].a), sol: [examSol[i].e], atex: "", ch: +(((examSol[i].e.match(/\[chap\. (\d+)/) || [])[1]) || 0) }));
    return { n: +c.n, title: h1.title, sub: h1.sub, secs, exos, qs, examQs };
  });
  const bank = [].concat(...CHL.map(c => c.qs));
  return (libData.c = { CHL, bank, exam30: CHL[9].examQs });
}
const EXW = [[1, 3], [2, 3], [3, 2], [4, 3], [5, 3], [6, 2], [7, 2], [8, 2]];
function examsHome() {
  stopTimers(); setBar("Examens blancs", home); VIEW = examsHome;
  const hist = P.exams.slice().reverse().slice(0, 12);
  const name = { gen: "Complet rédigé", qcm30: "QCM du guide", qcmmix: "QCM aléatoire", express: "Express" };
  go(`<header class="chead"><div class="where">Conditions réelles</div><h2>Examens blancs</h2><p>Sans calculatrice, sans notes, chronométré. La correction arrive à la fin. Les erreurs renvoient les compétences concernées en consolidation.</p></header>
  <div class="tools">
    <button class="tool main" data-x="gen"><b>Examen complet rédigé</b><span>20 questions tirées de tout le programme, réponses à écrire · 60 min · nouveau sujet à chaque fois</span></button>
    <button class="tool" data-x="qcm30"><b>QCM du guide</b><span>Les 30 questions de l'examen blanc du guide · 90 min</span></button>
    <button class="tool" data-x="qcmmix"><b>QCM aléatoire</b><span>30 QCM tirés de la banque de ${libData().bank.length} questions · 90 min</span></button>
    <button class="tool" data-x="express"><b>Examen express</b><span>10 questions rédigées · 20 min</span></button>
  </div>
  <h3 class="sec-title">Historique</h3>
  ${hist.length ? '<ul class="rlist">' + hist.map(e => `<li class="${e.sc / e.n >= 0.85 ? "ok" : ""}"><span class="mi">${Math.round((100 * e.sc) / e.n)}%</span><span class="mt"><b>${name[e.k] || e.k} · ${e.sc}/${e.n}</b><small>${new Date(e.d).toLocaleDateString("fr-CH")} · ${fmtDur(e.dur || 0)}</small></span></li>`).join("") + "</ul>" : '<p class="muted">Aucun examen passé pour l\'instant. Le premier examen complet est utile dès la moitié du programme.</p>'}`);
  app.querySelectorAll("[data-x]").forEach(b => b.onclick = () => startExam(b.dataset.x));
}
function startExam(kind) {
  let qs, minutes, title;
  if (kind === "gen" || kind === "express") {
    const picks = [];
    if (kind === "gen") EXW.forEach(([ch, n]) => shuffleR(CHS[ch].skills).slice(0, n).forEach(k => picks.push(k)));
    else { const pool = SKILLS.filter(k => k.ch >= 1); shuffleR(pool).slice(0, 10).forEach(k => picks.push(k)); picks.sort((a, b) => a.i - b.i); }
    qs = picks.map(k => { const seed = newSeed(); return { Qn: makeQ(k, seed), k: k.id, seed, ch: k.ch }; });
    minutes = kind === "gen" ? 60 : 20; title = kind === "gen" ? "Examen complet" : "Examen express";
  } else {
    const L = libData(); const src = kind === "qcm30" ? L.exam30 : shuffleR(L.bank).slice(0, 30);
    qs = src.map(Qn => ({ Qn, ch: Qn.ch })); minutes = 90; title = kind === "qcm30" ? "QCM du guide" : "QCM aléatoire";
  }
  askConfirm("<b>" + title + "</b> : " + qs.length + " questions, " + minutes + " minutes. Pas de calculatrice, pas de notes. Prêt ?", "Commencer", () => runExam({ kind, qs, minutes, title }), "Plus tard");
}
function runExam(cfg) {
  stopTimers(); const n = cfg.qs.length; const E = { ans: Array(n).fill(""), i: 0, end: Date.now() + cfg.minutes * 60000, t0: Date.now(), done: false };
  VIEW = null;
  setBar(cfg.title, () => askConfirm("Quitter l'examen ? Il ne sera pas compté.", "Quitter", examsHome, "Continuer l'examen"));
  const clock = () => { const s = Math.max(0, Math.round((E.end - Date.now()) / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  timers.push(setInterval(() => { const c = $("#clock"); if (c) { c.textContent = clock(); if (E.end - Date.now() < 5 * 60000) c.classList.add("low"); } if (Date.now() >= E.end) finish(); }, 1000));
  function draw() {
    const it = cfg.qs[E.i];
    go(`<section class="panel"><div class="qtop"><span>Question ${E.i + 1} / ${n}</span><span>${IC.clock} <b id="clock">${clock()}</b></span></div><div id="qh"></div>
      <div class="qgrid">${cfg.qs.map((x, j) => `<button data-j="${j}" class="${E.ans[j] !== "" ? "ans" : ""} ${j === E.i ? "cur" : ""}" aria-label="Question ${j + 1}">${j + 1}</button>`).join("")}</div>
      <div class="actions"><button class="btn ghost" id="pv" ${E.i === 0 ? "disabled" : ""}>Précédente</button>${E.i < n - 1 ? '<button class="btn" id="nxq">Suivante</button>' : '<button class="btn" id="endx">Terminer et corriger</button>'}</div></section>`);
    $("#qh").innerHTML = qcardHTML(it.Qn, { exam: true });
    const setAns = v => { E.ans[E.i] = v; const g = app.querySelector('.qgrid [data-j="' + E.i + '"]'); if (g) g.classList.toggle("ans", v !== "" && v !== null); };
    wireQCard($("#qh").firstElementChild, it.Qn, { exam: true, focus: true, initial: E.ans[E.i], onChange: setAns, onSubmit: () => { if (E.i < n - 1) { E.i++; draw(); } } });
    typeset($("#qh"));
    app.querySelectorAll(".qgrid button").forEach(b => b.onclick = () => { E.i = +b.dataset.j; draw(); });
    const p = $("#pv"); if (p) p.onclick = () => { E.i--; draw(); };
    const nx = $("#nxq"); if (nx) nx.onclick = () => { E.i++; draw(); };
    const en = $("#endx"); if (en) en.onclick = () => { const miss = E.ans.filter(a => a === "" || a === null).length; if (miss) askConfirm(miss + " question(s) sans réponse. Terminer quand même ?", "Terminer", finish); else finish(); };
  }
  function finish() {
    if (E.done) return; E.done = true; stopTimers();
    const dur = (Date.now() - E.t0) / 1000; let sc = 0; const per = {};
    const graded = cfg.qs.map((it, j) => {
      const a = E.ans[j]; let ok = false, m = "";
      if (it.Qn.type === "choice") ok = a === it.Qn.a;
      else if (a !== "" && a !== null) { const r = checkAnswer(it.Qn, a); ok = r.s === "ok"; m = r.m || ""; }
      if (ok) sc++; per[it.ch] = per[it.ch] || [0, 0]; per[it.ch][1]++; if (ok) per[it.ch][0]++;
      if (it.k) recordAnswer(SKB[it.k], ok, "exam", { seed: it.seed, dt: 0 });
      return { it, a, ok, m };
    });
    P.exams.push({ k: cfg.kind, d: Date.now(), sc, n, per, dur: Math.round(dur) }); award(sc * 3 + 20, "examen terminé"); save();
    const pct = Math.round((100 * sc) / n);
    const weakest = Object.entries(per).filter(([, v]) => v[0] < v[1]).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
    setBar("Correction · " + cfg.title, examsHome); VIEW = null;
    go(`<section class="panel"><div class="result"><h3>${sc} / ${n} · ${pct} %</h3><p>${pct >= 85 ? "Niveau visé atteint. Refais un examen dans quelques jours pour le confirmer." : pct >= 65 ? "Bonne base. Les compétences ratées sont passées en consolidation : la mission du jour te les fera reprendre." : "Point de départ mesuré. Suis la mission du jour, puis refais un examen dans une semaine."} Durée : ${fmtDur(dur)}.</p></div>
      <h4 class="serif">Par escale</h4>
      <div class="breakdown">${Object.entries(per).sort((a, b) => a[0] - b[0]).map(([c, v]) => `<div class="brow"><span>${c}. ${(CHS[c] || { short: "" }).short}</span><div class="bb"><i style="width:${(v[0] / v[1]) * 100}%"></i></div><em>${v[0]}/${v[1]}</em></div>`).join("")}</div>
      ${weakest ? `<p>À reprendre en premier : <b>escale ${weakest[0]} (${(CHS[weakest[0]] || { name: "" }).name})</b>.</p>` : ""}
      <h4 class="serif">Correction détaillée</h4>
      <div class="review">${graded.map((g, j) => `<details class="ri ${g.ok ? "" : "bad"}"><summary><span class="mi">${g.ok ? IC.check : IC.cross}</span> Question ${j + 1}${g.it.k ? " · " + SKB[g.it.k].title : ""}</summary><div class="qtext">${g.it.Qn.q}</div>
        <p><b>Ta réponse :</b> ${g.it.Qn.type === "choice" ? (g.a === "" || g.a === null ? "aucune" : "ABCD"[g.a] + ". " + g.it.Qn.opts[g.a]) : g.a ? "<code>" + esc(g.a) + "</code>" : "aucune"}</p>${g.m && !g.ok ? '<p class="why">' + g.m + "</p>" : ""}${answerLine(g.it.Qn)}${solHTML(g.it.Qn)}${g.it.k && !g.ok ? '<button class="small-btn" data-k="' + g.it.k + '">S\'entraîner sur cette compétence</button>' : ""}</details>`).join("")}</div>
      <div class="actions"><button class="btn ghost" id="ex2">Autres examens</button><button class="btn" id="hm">Retour au parcours</button></div></section>`);
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => skillView(b.dataset.k, "practice"));
    app.querySelectorAll("details.ri").forEach(d => d.addEventListener("toggle", () => typeset(d), { once: true }));
    $("#ex2").onclick = examsHome; $("#hm").onclick = home;
  }
  draw();
}

/* =========================== CARNET D'ERREURS =========================== */
function errorsView() {
  stopTimers(); setBar("Carnet d'erreurs", home); VIEW = errorsView;
  const list = P.errs.filter(e => SKB[e.k]).slice(0, 40);
  go(`<header class="chead"><div class="where">Ne jamais refaire deux fois la même erreur</div><h2>Carnet d'erreurs</h2><p>Chaque exercice raté est gardé ici avec sa correction. Relis-les, puis refais une série sur ces compétences.</p></header>
  ${list.length ? `<div class="actions"><span></span><button class="btn" id="redo">Refaire une série sur mes erreurs</button></div>
  <ul class="rlist">${list.map((e, i) => `<li class="ko"><span class="mi">${IC.cross}</span><span class="mt"><b>${SKB[e.k].title}</b><small>${new Date(e.t).toLocaleDateString("fr-CH")} · escale ${SKB[e.k].ch}</small></span><button class="small-btn" data-i="${i}">Revoir</button></li>`).join("")}</ul>` : '<p class="muted">Aucune erreur enregistrée pour l\'instant.</p>'}`);
  app.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
    const e = list[+b.dataset.i], k = SKB[e.k], Qn = makeQ(k, e.s);
    const d = showModal(`<p class="muted">${k.title}</p><div class="qtext">${Qn.q}</div>${answerLine(Qn)}${solHTML(Qn)}<p><button class="small-btn" id="sim">Faire une question similaire</button></p>`);
    d.querySelector("#sim").onclick = () => { d.remove(); skillView(k.id, "practice"); };
  });
  const r = $("#redo"); if (r) r.onclick = () => {
    const ids = [...new Set(list.map(e => e.k))].slice(0, 12);
    runSession({ title: "Série « erreurs »", mode: "review", hideTitle: false, items: ids.map(id => ({ k: id, seed: newSeed() })), after: errorsView });
  };
}

/* =========================== STATISTIQUES =========================== */
function barChart(days) {
  const W = 640, Hh = 190, pad = { l: 34, r: 8, t: 12, b: 26 }, n = days.length;
  const max = Math.max(10, ...days.map(d => d.q)); const nice = Math.ceil(max / 10) * 10;
  const bw = (W - pad.l - pad.r) / n, y = v => pad.t + (Hh - pad.t - pad.b) * (1 - v / nice);
  let g = ""; [0, 0.5, 1].forEach(f => { const v = Math.round(nice * f); g += '<line class="cg" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ct" x="' + (pad.l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + "</text>"; });
  const bars = days.map((d, i) => {
    const x = pad.l + i * bw + 3, w = Math.max(3, bw - 6), top = y(d.q), h0 = Hh - pad.b - top, r = Math.min(4, w / 2, h0);
    const path = d.q ? 'M' + x + ' ' + (Hh - pad.b) + 'V' + (top + r) + 'q0 -' + r + ' ' + r + ' -' + r + 'H' + (x + w - r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + (Hh - pad.b) + 'Z' : "";
    const tip = d.label + " : " + d.q + " question" + (d.q > 1 ? "s" : "") + (d.q ? ", " + Math.round((100 * d.ok) / d.q) + " % justes, " + fmtDur(d.t) : "");
    return '<g class="hit" tabindex="0" data-tip="' + esc(tip) + '"><rect x="' + (pad.l + i * bw) + '" y="' + pad.t + '" width="' + bw + '" height="' + (Hh - pad.t - pad.b) + '" fill="transparent"/>' + (path ? '<path class="cb" d="' + path + '"/>' : "") + (i % 3 === n % 3 || i === n - 1 ? '<text class="ct" x="' + (pad.l + i * bw + bw / 2) + '" y="' + (Hh - 8) + '" text-anchor="middle">' + d.short + "</text>" : "") + "</g>";
  }).join("");
  return '<div class="chart"><svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Questions répondues par jour">' + g + '<line class="ca" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + (Hh - pad.b) + '" y2="' + (Hh - pad.b) + '"/>' + bars + '</svg><div class="tip" hidden></div></div>';
}
function lineChart(ex) {
  const W = 640, Hh = 190, pad = { l: 40, r: 14, t: 14, b: 26 }, n = ex.length;
  const x = i => (n === 1 ? (W + pad.l - pad.r) / 2 : pad.l + ((W - pad.l - pad.r) * i) / (n - 1)), y = v => pad.t + (Hh - pad.t - pad.b) * (1 - v / 100);
  let g = ""; [0, 50, 100].forEach(v => { g += '<line class="cg" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ct" x="' + (pad.l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + " %</text>"; });
  g += '<line class="goal" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(85) + '" y2="' + y(85) + '"/><text class="ct goalt" x="' + (W - pad.r) + '" y="' + (y(85) - 5) + '" text-anchor="end">objectif 85 %</text>';
  const pts = ex.map((e, i) => [x(i), y((100 * e.sc) / e.n), e]);
  const line = n > 1 ? '<path class="cl" d="M' + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + '"/>' : "";
  const dots = pts.map((p, i) => '<g class="hit" tabindex="0" data-tip="' + esc(new Date(p[2].d).toLocaleDateString("fr-CH") + " · " + p[2].sc + "/" + p[2].n + " (" + Math.round((100 * p[2].sc) / p[2].n) + " %)") + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="transparent"/><circle class="cd" cx="' + p[0] + '" cy="' + p[1] + '" r="5"/>' + (i === n - 1 ? '<text class="ct strong" x="' + p[0] + '" y="' + (p[1] - 11) + '" text-anchor="' + (n === 1 ? "middle" : "end") + '">' + Math.round((100 * p[2].sc) / p[2].n) + " %</text>" : "") + "</g>").join("");
  return '<div class="chart"><svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Scores des examens blancs complets">' + g + line + dots + '</svg><div class="tip" hidden></div></div>';
}
function wireTips(root) {
  root.querySelectorAll(".chart").forEach(ch => {
    const tip = ch.querySelector(".tip");
    const show = (e, el) => { tip.textContent = el.dataset.tip; tip.hidden = false; const r = ch.getBoundingClientRect(), b = el.getBoundingClientRect(); tip.style.left = Math.min(r.width - 10, Math.max(10, b.left - r.left + b.width / 2)) + "px"; tip.style.top = Math.max(0, b.top - r.top - 8) + "px"; };
    ch.querySelectorAll(".hit").forEach(el => { el.addEventListener("pointerenter", e => show(e, el)); el.addEventListener("focus", e => show(e, el)); el.addEventListener("pointerleave", () => (tip.hidden = true)); el.addEventListener("blur", () => (tip.hidden = true)); el.addEventListener("click", e => show(e, el)); });
  });
}
function statsView() {
  stopTimers(); setBar("Statistiques", home); VIEW = statsView;
  const all = Object.values(P.hist), Q = all.reduce((a, h) => a + h.q, 0), OK = all.reduce((a, h) => a + h.ok, 0), days = all.filter(h => h.q).length;
  const lg = P.exams.filter(e => e.k === "gen");
  const dd = []; for (let i = 20; i >= 0; i--) { const t = Date.now() - i * DAY, h = P.hist[dk(t)] || { q: 0, ok: 0, t: 0 }; const d = new Date(t); dd.push({ q: h.q, ok: h.ok, t: h.t, label: d.toLocaleDateString("fr-CH", { weekday: "short", day: "numeric", month: "short" }), short: d.getDate() + "/" + (d.getMonth() + 1) }); }
  const weak = SKILLS.filter(k => P.sk[k.id] && P.sk[k.id].n >= 3).map(k => ({ k, r: P.sk[k.id].ok / P.sk[k.id].n, lap: P.sk[k.id].lap })).sort((a, b) => a.r - b.r || b.lap - a.lap).slice(0, 6);
  go(`<header class="chead"><div class="where">Tes résultats réels</div><h2>Statistiques</h2></header>
  <div class="tiles">
    <div class="tile"><b>${masteredCount()}<small>/${SKILLS.length}</small></b><span>compétences maîtrisées</span></div>
    <div class="tile"><b>${Q}</b><span>exercices corrigés</span></div>
    <div class="tile"><b>${Q ? Math.round((100 * OK) / Q) : 0}<small>%</small></b><span>de réponses justes</span></div>
    <div class="tile"><b>${fmtDur(P.time)}</b><span>d'étude effective sur ${days} jour${days > 1 ? "s" : ""}</span></div>
  </div>
  <section class="panel"><h3 class="serif">Exercices par jour (21 derniers jours)</h3>${Q ? barChart(dd) : '<p class="muted">Le graphique apparaîtra après tes premiers exercices.</p>'}</section>
  <section class="panel"><h3 class="serif">Examens blancs complets</h3>${lg.length ? lineChart(lg.slice(-12)) : '<p class="muted">Aucun examen complet pour l\'instant.</p>'}</section>
  <section class="panel"><h3 class="serif">Par escale</h3><div class="breakdown">${CHS.map(c => { const d = chDone(c); const st = c.skills.map(k => P.sk[k.id]).filter(Boolean), n = st.reduce((a, s) => a + s.n, 0), ok = st.reduce((a, s) => a + s.ok, 0);
    return `<div class="brow"><span>${c.n}. ${c.short}${gateOK(c.n) ? " ✓" : ""}</span><div class="bb"><i style="width:${(d / c.skills.length) * 100}%"></i></div><em>${d}/${c.skills.length}</em><em class="acc">${n ? Math.round((100 * ok) / n) + " %" : "—"}</em></div>`; }).join("")}</div><p class="muted small">Barre : compétences maîtrisées. Pourcentage : taux de réussite dans l'escale.</p></section>
  ${weak.length ? `<section class="panel"><h3 class="serif">Tes points faibles</h3><ul class="rlist">${weak.map(w => `<li><span class="mi">${Math.round(w.r * 100)}%</span><span class="mt"><b>${w.k.title}</b><small>${P.sk[w.k.id].n} essais${w.lap ? " · retombée " + w.lap + " fois" : ""}</small></span><button class="small-btn" data-k="${w.k.id}">S'entraîner</button></li>`).join("")}</ul></section>` : ""}`);
  wireTips(app);
  app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => skillView(b.dataset.k, "practice"));
}

/* =========================== RÉGLAGES, SAUVEGARDE =========================== */
function settingsView() {
  stopTimers(); setBar("Date et sauvegarde", home); VIEW = settingsView;
  go(`<header class="chead"><h2>Date et sauvegarde</h2></header>
  <section class="panel"><h3 class="serif">Date de l'examen</h3><p class="muted">Le plan du jour se calcule à partir de cette date (les 4 derniers jours sont gardés pour les examens blancs).</p>
    <div class="inrow"><input type="date" id="dateIn" value="${P.examDate || ""}" aria-label="Date de l'examen"><button class="btn" id="saveDate">Enregistrer</button></div></section>
  <section class="panel"><h3 class="serif">Où est ta progression ?</h3>
    <p>${Sync.state === "account" ? IC.cloud + " Enregistrée sur ton compte Claude : tu la retrouves sur ton téléphone et ton ordinateur." : IC.phone + " Enregistrée sur cet appareil (dans ce navigateur). Garde une copie avec le code ci-dessous."}</p>
    <div class="actions left"><button class="btn ghost" id="copy">Copier mon code de sauvegarde</button></div>
    <textarea id="code" class="code" rows="3" readonly hidden></textarea>
    <h4>Restaurer une sauvegarde</h4><textarea id="imp" class="code" rows="3" placeholder="Colle ici ton code de sauvegarde"></textarea>
    <div class="actions left"><button class="btn ghost" id="doImp">Restaurer</button></div></section>
  <section class="panel"><h3 class="serif">Recommencer</h3><p class="muted">Efface toute la progression (compétences, examens, XP).</p><button class="btn danger" id="reset">Tout effacer</button></section>`);
  $("#saveDate").onclick = () => { const v = $("#dateIn").value; P.examDate = v || null; save(); toast(v ? "Date enregistrée : " + fmtDate(v) : "Date effacée"); home(); };
  $("#copy").onclick = () => {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(P)))); const ta = $("#code"); ta.value = code; ta.hidden = false;
    const fallback = () => { ta.focus(); ta.select(); toast("Code sélectionné : copie-le (Ctrl+C ou Copier)."); };
    try { navigator.clipboard.writeText(code).then(() => toast("Code copié. Garde-le dans tes notes."), fallback); } catch (e) { fallback(); }
  };
  $("#doImp").onclick = () => {
    let o; try { o = JSON.parse(decodeURIComponent(escape(atob($("#imp").value.trim())))); } catch (e) { toast("Code illisible : vérifie qu'il est complet."); return; }
    if (!o || typeof o !== "object" || !o.sk) { toast("Ce code ne contient pas de progression."); return; }
    askConfirm("Remplacer ta progression actuelle par celle du code ?", "Remplacer", () => { P = migrate(o); P.up = Date.now(); save(); toast("Progression restaurée."); home(); });
  };
  $("#reset").onclick = () => askConfirm("Effacer toute ta progression ? C'est définitif.", "Tout effacer", () => { const d = P.examDate; P = fresh(); P.examDate = d; P.welcome = 0; save(); home(); });
}

/* =========================== MODE D'EMPLOI =========================== */
function guideView() {
  stopTimers(); setBar("Mode d'emploi", home); VIEW = guideView;
  go(`<section class="panel lesson"><h3>Pourquoi ce parcours fonctionne</h3>
  <p>Lire une leçon donne l'impression de comprendre. Ce qui prouve que tu sais, c'est de <b>réussir seul</b>, plusieurs fois, des exercices que tu n'as jamais vus. Tout ici est construit sur cette preuve.</p>
  <div class="box remember"><div class="bt">Les règles du parcours</div>
  <p><b>1. Maîtrise = 4 réussites d'affilée, sans indice.</b> Les exercices sont générés au hasard : impossible de réussir en apprenant les réponses par cœur.</p>
  <p><b>2. Révisions espacées.</b> Une compétence maîtrisée revient après 1, 3, 7, 14, 30 puis 60 jours. C'est le rythme qui fixe les choses dans la mémoire longue.</p>
  <p><b>3. Aucune lacune cachée.</b> Une erreur en révision, en test ou en examen renvoie la compétence en consolidation (2 réussites d'affilée pour revenir).</p>
  <p><b>4. Tampon d'escale = test ≥ 90 %</b>, une question par compétence, sans indice.</p>
  <p><b>5. Prêt = cinq critères mesurés</b> : 110/110 compétences, 9 tampons, rien en retard, 3 examens complets ≥ 85 %, un QCM ≥ 26/30.</p></div>
  <div class="box method"><div class="bt">Ta journée type (45 à 90 minutes)</div><ol><li>Appuie sur le gros bouton de la mission : il choisit toujours la meilleure chose à faire.</li><li>D'abord les révisions (rapides), puis ce qui est à consolider, puis les nouvelles compétences.</li><li>Pour une nouvelle compétence : lis « Comprendre », refais l'exemple corrigé <b>sur papier</b>, puis entraîne-toi.</li><li>Une fois par semaine (dès la moitié du programme) : un examen blanc complet.</li></ol></div>
  <div class="box warn"><div class="bt">À éviter</div><p>Utiliser l'indice ou « Je ne sais pas » trop vite : essaie d'abord sur ton cahier, même 3 minutes. Une erreur suivie de la correction vaut plus que dix exercices lus.</p></div>
  <div class="box idea"><div class="bt">Si tu connais déjà une partie du programme</div><p>Passe le <b>test de l'escale</b> avant d'apprendre : chaque bonne réponse valide directement la compétence (elle reviendra en révision 2 jours plus tard pour vérifier).</p></div>
  ${HELP_HTML}
  <div class="actions"><span></span><button class="btn" id="hb">Retour</button></div></section>`);
  $("#hb").onclick = home;
}

/* =========================== COURS COMPLET (bibliothèque) =========================== */
function rItem(x) {
  if (!x) return ""; if (typeof x === "string") return "<p>" + x + "</p>";
  if (x.t === "p") return "<p>" + x.html + "</p>";
  if (x.t === "math") return x.inline ? "\\(" + esc(x.tex) + "\\)" : dmath(x.tex);
  if (x.t === "group") return x.items.map(rItem).join("");
  return rBlock(x);
}
function balanced(p) { let d = 0; for (const ch of p) { if (ch === "{") d++; else if (ch === "}") d--; if (d < 0) return false; } const l = (p.match(/\\left/g) || []).length, r = (p.match(/\\right/g) || []).length; return d === 0 && l === r; }
function dmath(tex) {
  const parts = tex.split("\\qquad").map(t => t.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every(balanced)) return '<div class="mrow">' + parts.map(p => "<span>\\(\\displaystyle " + esc(p) + "\\)</span>").join("") + "</div>";
  return '<div class="m">\\[' + esc(tex) + "\\]</div>";
}
function cell(c) { if (typeof c === "string") return c; if (c && c.t === "math") return "\\(" + esc(c.tex) + "\\)"; return ""; }
let gid = 0;
function rBlock(b) {
  switch (b.t) {
    case "p": return "<p>" + b.html + "</p>";
    case "h3": return "<h4>" + b.html + "</h4>";
    case "math": return rItem(b);
    case "img": return IMGS[b.src] ? '<figure class="fig"><img src="' + IMGS[b.src] + '" alt="Figure du cours" loading="lazy"></figure>' : "";
    case "table": return '<div class="tw"><table>' + b.rows.map((r, i) => "<tr>" + r.map(c => (b.header && i === 0 ? "<th>" : "<td>") + cell(c) + (b.header && i === 0 ? "</th>" : "</td>")).join("") + "</tr>").join("") + "</table></div>";
    case "box": if (b.kind === "method") return '<div class="box method"><div class="bt">' + b.title + "</div><ol>" + b.steps.map(s => "<li>" + s + "</li>").join("") + "</ol></div>"; return '<div class="box ' + b.kind + '"><div class="bt">' + b.title + "</div>" + b.items.map(rItem).join("") + "</div>";
    case "guide": { const id = "g" + gid++; return '<div class="guide" id="' + id + '"><div class="gt">' + b.title + '</div><p class="hint">Essaie d\'abord sur ton cahier, puis dévoile les étapes une par une.</p>' + b.steps.map((s, i) => '<div class="gs"><span class="gn">Étape ' + (i + 1) + ".</span> " + s + "</div>").join("") + (b.note ? '<div class="note"><b>À retenir :</b> ' + b.note + "</div>" : "") + '<button class="small-btn" data-guide="' + id + '">Voir l\'étape 1</button></div>'; }
    case "group": return b.items.map(rItem).join("");
    default: return "";
  }
}
function wireGuides(root) {
  root.querySelectorAll("[data-guide]").forEach(btn => btn.onclick = () => {
    const g = document.getElementById(btn.dataset.guide), hidden = g.querySelectorAll(".gs:not(.show)");
    if (hidden.length) hidden[0].classList.add("show");
    const left = g.querySelectorAll(".gs:not(.show)").length;
    if (!left) { const n = g.querySelector(".note"); if (n) n.classList.add("show"); btn.remove(); const h = g.querySelector(".hint"); if (h) h.remove(); }
    else btn.textContent = "Voir l'étape " + (g.querySelectorAll(".gs.show").length + 1);
  });
}
function libraryHome() {
  stopTimers(); setBar("Cours complet", home); VIEW = libraryHome;
  const L = libData();
  go(`<header class="chead"><div class="where">La référence détaillée</div><h2>Cours complet</h2><p>Les leçons longues, avec exemples guidés et exercices corrigés. Idéal pour approfondir une compétence difficile.</p></header>
  <div class="slist">${L.CHL.filter(c => c.n <= 8 || c.n === 10).map(c => `<button class="srow" data-c="${c.n}"><span class="sico">${c.n}</span><span class="stx"><b>${c.title}</b><small>${c.n === 10 ? "Formulaire et les 20 erreurs à éviter" : c.secs.length + " sections · " + c.exos.length + " exercices corrigés"}</small></span></button>`).join("")}</div>`);
  app.querySelectorAll("[data-c]").forEach(b => b.onclick = () => libChapter(+b.dataset.c, 0));
}
function libChapter(n, ref, backSkill) {
  stopTimers(); const L = libData(), c = L.CHL.find(x => x.n === n);
  let sec = 0; if (backSkill) { const pre = n + "." + (ref + 1); const f = c.secs.findIndex(s => s.title.replace(/<[^>]+>/g, "").trim().startsWith(pre)); if (f >= 0) sec = f; }
  const back = backSkill ? () => skillView(backSkill, "learn") : libraryHome;
  function draw() {
    VIEW = draw; setBar("Cours · " + (n === 10 ? "Formulaire" : "Escale " + n), back);
    const S0 = c.secs[sec], k = "l" + n + "-" + sec; P.read[k] = 1;
    go(`<header class="chead"><div class="where">${n === 10 ? "À relire la veille" : "Escale " + n}</div><h2>${c.title}</h2><p>${c.sub}</p></header>
    <section class="panel lesson"><div class="toc">${c.secs.map((s, i) => `<button data-s="${i}" class="${P.read["l" + n + "-" + i] ? "read" : ""} ${i === sec ? "cur" : ""}" title="${esc(s.title.replace(/<[^>]+>/g, ""))}">${i + 1}</button>`).join("")}</div>
    <h3>${S0.title}</h3>${S0.blocks.map(rBlock).join("")}
    <div class="actions">${sec > 0 ? '<button class="btn ghost" id="ps">Section précédente</button>' : "<span></span>"}${sec < c.secs.length - 1 ? '<button class="btn" id="ns">Section suivante</button>' : c.exos.length ? '<button class="btn" id="exs">Exercices corrigés</button>' : '<button class="btn" id="bk3">Terminer</button>'}</div></section>`);
    wireGuides(app);
    app.querySelectorAll(".toc button").forEach(b => b.onclick = () => { sec = +b.dataset.s; draw(); });
    const p = $("#ps"); if (p) p.onclick = () => { sec--; draw(); };
    const nx = $("#ns"); if (nx) nx.onclick = () => { sec++; draw(); };
    const e = $("#exs"); if (e) e.onclick = exos;
    const b3 = $("#bk3"); if (b3) b3.onclick = back;
  }
  function exos() {
    VIEW = exos; const STARS = { 1: "★☆☆☆ facile", 2: "★★☆☆ moyen", 3: "★★★☆ difficile", 4: "★★★★ niveau examen" };
    go(`<header class="chead"><div class="where">Escale ${n}</div><h2>Exercices corrigés du cours</h2><p>Fais-les sur ton cahier, puis ouvre le corrigé.</p></header>
    <section class="panel">${c.exos.map((e, i) => `<article class="exo"><div class="eh"><b>Ex. ${i + 1}</b><span class="lv">${STARS[e.lv]}</span></div><div class="stmt">${e.html}</div><details><summary>Voir le corrigé</summary>${e.parts.map(rItem).join("")}</details></article>`).join("")}
    <div class="actions"><button class="btn ghost" id="bl">Retour à la leçon</button><button class="btn" id="bk4">Terminer</button></div></section>`);
    app.querySelectorAll(".exo details").forEach(d => d.addEventListener("toggle", () => typeset(d), { once: true }));
    $("#bl").onclick = draw; $("#bk4").onclick = back;
  }
  draw(); save();
}

/* =========================== DÉMARRAGE =========================== */
home();
initSync();
