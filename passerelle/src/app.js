/* =====================================================================
   APP: percorso, lezioni imparate, ripasso a intervalli, verifiche, esami
   ===================================================================== */
const KEY = "passerelle-maitrise-v1";
const DAY = 86400000;
const INTERVALS = [1, 3, 7, 14, 30, 60];
SKILLS.sort((a, b) => a.ch - b.ch);
const SKB = {}; SKILLS.forEach((s, i) => { s.i = i; SKB[s.id] = s; });
const CHS = CHAPTERS.map(c => Object.assign({}, c, { skills: SKILLS.filter(s => s.ch === c.n) }));
const NG = CHS.length; // numero di tappe (0 → 10)

/* ---------- stato e salvataggio ---------- */
function fresh() { return { v: 2, up: 0, xp: 0, streak: { last: null, count: 0 }, examDate: null, sk: {}, gates: {}, exams: [], errs: [], hist: {}, time: 0, read: {}, welcome: 0 }; }
function migrate(o) {
  const d = fresh(); if (!o || typeof o !== "object") return d;
  for (const k in d) if (o[k] === undefined) o[k] = d[k];
  if ((o.v || 1) < 2) { // versione 1 (francese): le tappe erano numerate da 0 a 8, ora da 1 a 9
    const g = {}; for (const n in o.gates) g[+n + 1] = o.gates[n]; o.gates = g;
    o.exams.forEach(e => { if (e.per) { const p = {}; for (const c in e.per) p[+c + 1] = e.per[c]; e.per = p; } });
    o.v = 2; o.welcome = 0;
  }
  return o;
}
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
      else if ((P.up || 0) > ((R && R.up) || 0) || (R && (R.v || 1) < 2)) pushRemote();
    } else if (P.up) pushRemote();
    drawBar();
  } catch (e) { Sync.doc = null; Sync.state = "local"; }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && Sync.doc) { clearTimeout(Sync.timer); pushRemote(); } });

/* ---------- strumenti ---------- */
const $ = s => document.querySelector(s);
const app = document.getElementById("app");
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function dk(t) { const d = t ? new Date(t) : new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function daysUntil(dateStr) { return Math.round((new Date(dateStr + "T12:00:00") - new Date(dk() + "T12:00:00")) / DAY); }
function fmtDate(dateStr) { try { return new Date(dateStr + "T12:00:00").toLocaleDateString("it-CH", { weekday: "long", day: "numeric", month: "long" }); } catch (e) { return dateStr; } }
function fmtDay(t) { try { return new Date(t).toLocaleDateString("it-CH"); } catch (e) { return dk(t); } }
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
function makeQ(k, seed, easy) { return (easy && seededEasy(seed, () => k.gen())) || seeded(seed, () => k.gen()); }
function shuffleR(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const IC = {
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 .1 1.8.9 3 2 3.5C11 8.5 12 5.5 12 2z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.1 4.5 4.5 0 0 0 7 18z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><rect x="7" y="3" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

/* ---------- giorni di fila ---------- */
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
  document.body.appendChild(d); clearTimeout(toastT); toastT = setTimeout(() => d.remove(), 2600);
}

/* ---------- stato delle lezioni ---------- */
function S(id) { return P.sk[id] || (P.sk[id] = { st: 0, run: 0, n: 0, ok: 0, due: null, iv: 0, lap: 0, last: 0 }); }
function stOf(id) { const s = P.sk[id]; return s ? s.st : 0; } // 0 nuova, 1 in corso, 2 imparata, 3 da ripassare subito
function target(k) { return k.target || 4; }
function isDue(id) { const s = P.sk[id]; return !!(s && s.st === 2 && s.due && s.due <= Date.now()); }
function dueList() { return SKILLS.filter(k => isDue(k.id)).sort((a, b) => P.sk[a.id].due - P.sk[b.id].due); }
function weakList() { return SKILLS.filter(k => stOf(k.id) === 3); }
function mastered(k) { return stOf(k.id) === 2; }
function masteredCount() { return SKILLS.filter(mastered).length; }
function H() { const k = dk(); return P.hist[k] || (P.hist[k] = { q: 0, ok: 0, t: 0, m: 0 }); }
function chDone(c) { return c.skills.filter(mastered).length; }
function gateOK(n) { return !!(P.gates[n] && P.gates[n].passed); }
function easyNow(id) { const s = S(id); return (s.st === 0 || s.st === 1) && s.run < 2; }

function recordAnswer(k, ok, mode, info) {
  info = info || {}; const s = S(k.id), now = Date.now(), ev = {}, h = H();
  s.n++; if (ok) s.ok++; s.last = now; h.q++; if (ok) h.ok++;
  const dt = Math.min(300, Math.max(0, info.dt || 0)); P.time += dt; h.t += dt;
  touchStreak();
  if (!ok && info.seed) { P.errs = P.errs.filter(e => !(e.k === k.id && e.s === info.seed)); P.errs.unshift({ k: k.id, s: info.seed, e: info.easy ? 1 : 0, t: now }); if (P.errs.length > 80) P.errs.length = 80; }
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
  if (ok) P.xp += mode === "practice" ? (info.hint ? 2 : 5) : 8;
  if (ev.mastered) P.xp += 40;
  save(); drawBar(); return ev;
}
function nextSkillInOrder(after) {
  if (!after) { const inProg = SKILLS.find(k => stOf(k.id) === 1); if (inProg) return inProg; }
  const start = after ? SKB[after].i + 1 : 0;
  const order = SKILLS.slice(start).concat(SKILLS.slice(0, start));
  return order.find(k => stOf(k.id) === 0 || stOf(k.id) === 1) || null;
}
function gateReady() { return CHS.find(c => !gateOK(c.n) && chDone(c) === c.skills.length); }
function lastExam(kind) { const l = P.exams.filter(e => (kind ? e.k === kind : true)); return l[l.length - 1]; }
function currentChapter() { const n = nextSkillInOrder(); if (n) return n.ch; const g = gateReady(); return g ? g.n : NG - 1; }

/* ---------- « Sono pronto? »: criteri misurabili ---------- */
function readiness() {
  const tot = SKILLS.length, now = Date.now();
  const solid = SKILLS.filter(k => mastered(k) && !(P.sk[k.id].due && now - P.sk[k.id].due > 3 * DAY)).length;
  const stamps = CHS.filter(c => gateOK(c.n)).length;
  const gens = P.exams.filter(e => e.k === "gen").slice(-3); const genAvg = gens.length ? gens.reduce((a, e) => a + e.sc / e.n, 0) / 3 : 0;
  const qcm = P.exams.filter(e => e.k === "qcm30" || e.k === "qcmmix").slice(-3); const qcmBest = qcm.length ? Math.max(...qcm.map(e => e.sc / e.n)) : 0;
  const overdue = SKILLS.filter(k => mastered(k) && P.sk[k.id].due && now - P.sk[k.id].due > 3 * DAY).length;
  const pct = Math.round(100 * (0.5 * (solid / tot) + 0.15 * (stamps / NG) + 0.25 * genAvg + 0.1 * qcmBest));
  const crit = [
    { ok: masteredCount() === tot, t: "Tutte le lezioni imparate", v: masteredCount() + " / " + tot },
    { ok: stamps === NG, t: "Tutte le " + NG + " verifiche di tappa superate (almeno 90 %)", v: stamps + " / " + NG },
    { ok: overdue === 0 && weakList().length === 0, t: "Nessun ripasso in ritardo, niente da recuperare", v: overdue + weakList().length === 0 ? "✓" : (overdue + weakList().length) + " da riprendere" },
    { ok: gens.length === 3 && gens.every(e => e.sc / e.n >= 0.85), t: "Gli ultimi 3 esami di prova completi almeno all'85 %", v: gens.length ? gens.map(e => Math.round((100 * e.sc) / e.n) + " %").join(" · ") : "nessuno ancora" },
    { ok: qcmBest >= 26 / 30, t: "Un esame a scelta multipla in francese almeno 26 / 30", v: qcm.length ? Math.round(qcmBest * 30) + " / 30" : "nessuno ancora" },
  ];
  return { pct: Math.min(100, pct), crit, ready: crit.every(c => c.ok) };
}

/* ---------- che cosa fare adesso ---------- */
function nextAction() {
  const w = weakList(); if (w.length) return { label: "Recupera: " + w[0].title, sub: "Hai sbagliato questa lezione in un ripasso: 2 esercizi giusti di fila e torna a posto.", run: () => skillView(w[0].id, "practice") };
  const d = dueList(); if (d.length) return { label: "Ripasso di oggi", sub: d.length + " lezion" + (d.length > 1 ? "i" : "e") + " da ripassare, un esercizio ciascuna (pochi minuti).", run: () => startReview() };
  const g = gateReady(); if (g) return { label: "Verifica della Tappa " + g.n, sub: g.name + ": hai imparato tutte le lezioni, ora la verifica finale.", run: () => startGate(g.n) };
  const n = nextSkillInOrder(); if (n) return { label: n.title, sub: "Tappa " + n.ch + " · " + CHS[n.ch].name + (stOf(n.id) === 1 ? " · la stai facendo" : " · lezione nuova"), run: () => skillView(n.id) };
  const lg = lastExam("gen"); if (!lg || Date.now() - lg.d > 2 * DAY || lg.sc / lg.n < 0.85) return { label: "Esame di prova completo", sub: "20 domande, 60 minuti, come all'esame.", run: () => startExam("gen") };
  return { label: "Allenamento misto", sub: "12 domande su tutto il programma.", run: () => startSprint() };
}
function planInfo() {
  const rem = SKILLS.filter(k => !mastered(k)).length;
  const left = P.examDate ? daysUntil(P.examDate) : null;
  const studyDays = left === null ? 45 : Math.max(1, left - 5);
  const perDay = rem ? Math.max(1, Math.ceil(rem / studyDays)) : 0;
  const last7 = []; for (let i = 0; i < 7; i++) { const h = P.hist[dk(Date.now() - i * DAY)]; last7.push(h ? h.m : 0); }
  const pace = last7.reduce((a, b) => a + b, 0) / 7;
  let finish = null; if (rem && pace > 0) finish = dk(Date.now() + Math.ceil(rem / pace) * DAY);
  return { rem, left, perDay, pace, finish };
}

/* ---------- barra in alto ---------- */
let barTitle = "", barBack = null;
function drawBar() {
  const s = streakNow();
  const sync = Sync.state === "account" ? '<span class="sync ok" title="Progressi salvati sul tuo account">' + IC.cloud + "</span>" : Sync.state === "error" ? '<span class="sync err" title="Salvataggio online non riuscito: i progressi restano su questo dispositivo">' + IC.cloud + "</span>" : "";
  document.getElementById("bar").innerHTML =
    (barBack ? '<button class="back" id="bk" aria-label="Indietro">←</button>' : '<span class="logo" aria-hidden="true">Π</span>') +
    '<span class="grow">' + (barTitle || "Passerelle · matematica") + "</span>" + sync +
    '<span class="pill streak' + (s ? " on" : "") + '" title="Giorni di studio di fila">' + IC.flame + s + "</span>";
  const bk = document.getElementById("bk"); if (bk) bk.onclick = barBack;
}
function setBar(t, back) { barTitle = t; barBack = back; drawBar(); }

/* ---------- finestre di conferma (dentro la pagina) ---------- */
function askConfirm(msg, yes, onYes, no) {
  const d = document.createElement("div"); d.className = "modal";
  d.innerHTML = '<div class="mbox" role="dialog" aria-modal="true"><p>' + msg + '</p><div class="actions"><button class="btn ghost" data-a="no">' + (no || "Annulla") + '</button><button class="btn" data-a="yes">' + yes + "</button></div></div>";
  document.body.appendChild(d);
  d.querySelector('[data-a="no"]').onclick = () => d.remove();
  d.querySelector('[data-a="yes"]').onclick = () => { d.remove(); onYes(); };
  d.onclick = e => { if (e.target === d) d.remove(); };
  d.querySelector('[data-a="yes"]').focus();
}
function showModal(html) {
  const d = document.createElement("div"); d.className = "modal";
  d.innerHTML = '<div class="mbox wide" role="dialog" aria-modal="true">' + html + '<div class="actions"><span></span><button class="btn" data-a="close">Chiudi</button></div></div>';
  document.body.appendChild(d); typeset(d);
  d.querySelector('[data-a="close"]').onclick = () => d.remove(); d.onclick = e => { if (e.target === d) d.remove(); };
  return d;
}
const HELP_HTML = `<h3 class="serif">Come scrivere la risposta</h3><div class="tw"><table class="help">
<tr><th>Vuoi scrivere</th><th>Scrivi</th></tr>
<tr><td>\\(\\frac34\\)</td><td><code>3/4</code></td></tr><tr><td>\\(0{,}75\\)</td><td><code>0,75</code> oppure <code>0.75</code></td></tr><tr><td>\\(x^2\\)</td><td><code>x^2</code> oppure <code>x²</code></td></tr>
<tr><td>\\(\\sqrt{3}\\)</td><td><code>sqrt(3)</code> oppure <code>√3</code></td></tr><tr><td>\\(\\frac{1}{2\\sqrt x}\\)</td><td><code>1/(2√x)</code> (usa le parentesi!)</td></tr>
<tr><td>\\(e^{2x+1}\\)</td><td><code>e^(2x+1)</code></td></tr><tr><td>\\(\\ln(x^2+1)\\)</td><td><code>ln(x^2+1)</code></td></tr>
<tr><td>\\(\\frac{5\\pi}{6}\\)</td><td><code>5pi/6</code> oppure <code>5π/6</code></td></tr><tr><td>\\(3-2i\\)</td><td><code>3-2i</code> (oppure <code>j</code>)</td></tr>
<tr><td>\\(2e^{i\\pi/3}\\)</td><td><code>2e^(iπ/3)</code></td></tr><tr><td>soluzioni \\(-2\\) e \\(3\\)</td><td><code>-2 ; 3</code></td></tr>
<tr><td>nessuna soluzione</td><td><code>vuoto</code></td></tr><tr><td>\\(]-\\infty;2]\\cup[3;+\\infty[\\)</td><td><code>]-inf;2] U [3;+inf[</code></td></tr>
<tr><td>\\(\\mathbb R\\setminus\\{3\\}\\)</td><td><code>R\\{3}</code></td></tr><tr><td>coordinate \\((1;-2;3)\\)</td><td><code>(1;-2;3)</code></td></tr>
</table></div><p class="muted">Sotto la casella vedi come la tua risposta è stata letta. Se non è quello che volevi, aggiungi delle parentesi.</p>`;

/* ---------- scheda-domanda (risposta, anteprima, correzione) ---------- */
let QID = 0;
function placeholder(Qn) { return { num: "la tua risposta", expr: "es. 3x^2-2x+1", set: "es. -2 ; 3", interval: "es. ]-2;5]", tuple: "es. (1;-2)", lim: "es. +inf oppure 2/3", eqn: "es. 2x-3y+5=0" }[Qn.type] || ""; }
function inputHint(Qn) {
  const f = Qn.form || [];
  if (Qn.type === "set") return "Scrivi le soluzioni separate da « ; ». Se non ci sono soluzioni, scrivi <code>vuoto</code>.";
  if (Qn.type === "interval") return "Scrivi un intervallo, per esempio <code>]-2;5]</code> oppure <code>[1;+inf[</code>. Per unire due intervalli usa <code>U</code>.";
  if (Qn.type === "tuple") return "Scrivi le coordinate tra parentesi, separate da « ; », per esempio <code>(1;-2)</code>.";
  if (Qn.type === "lim") return "Scrivi <code>+inf</code>, <code>-inf</code> oppure un numero.";
  if (Qn.type === "eqn") return "Scrivi un'equazione intera, con « = », per esempio <code>2x-3y+5=0</code>.";
  if (Qn.type === "expr") return "Scrivi un'espressione con la x, per esempio <code>3x^2-2x+1</code>.";
  if (f.includes("algebraic")) return "Scrivi nella forma a + bi, per esempio <code>3-2i</code>.";
  if (f.includes("expform")) return "Scrivi nella forma r·e^(iθ), per esempio <code>2e^(iπ/3)</code>.";
  if (f.includes("pi")) return "Usa π, per esempio <code>3π/4</code> (oppure <code>3pi/4</code>).";
  if (f.includes("sqrt")) return "Puoi usare la radice, per esempio <code>2√3</code> oppure <code>sqrt(3)/2</code>.";
  if (f.includes("dec")) return "Scrivi un numero con la virgola, per esempio <code>0,75</code>.";
  if (f.includes("irr") || f.includes("rat")) return "Scrivi un numero intero o una frazione, per esempio <code>-3/4</code>.";
  return "Scrivi il risultato.";
}
function keysFor(Qn) {
  const K = [], add = (l, ins) => K.push([l, ins]), allow = Qn.allow || ["sqrt", "pi"], T = Qn.type;
  if (T === "interval") { ["[", "]", ";"].forEach(c => add(c, c)); add("−∞", "-inf"); add("+∞", "+inf"); add("∪", " U "); add("ℝ", "R"); add("vuoto", "vuoto"); add("−", "-"); add("/", "/"); if (/ln|e\^|sqrt/.test(Qn.ans)) { add("ln", "ln("); add("e", "e^("); add("√", "√("); } return K; }
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
  if (T === "set") add("vuoto", "vuoto");
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
  if (!String(raw).trim()) { pv.innerHTML = '<span class="muted">scrivi la risposta qui sopra</span>'; return; }
  const t = previewTex(Qn, raw);
  if (t === null) { pv.innerHTML = '<span class="muted">… scrittura incompleta</span>'; return; }
  const tok = ++pvToken;
  mjx(t).then(node => { if (tok !== pvToken) return; pv.innerHTML = ""; pv.appendChild(node); }).catch(() => { pv.textContent = raw; });
}
function solHTML(Qn) { return '<ol class="sol">' + Qn.sol.map(s => "<li>" + s + "</li>").join("") + "</ol>"; }
function answerLine(Qn) { return Qn.type === "choice" ? "<p><b>Risposta giusta:</b> " + "ABCD"[Qn.a] + ". " + Qn.opts[Qn.a] + "</p>" : "<p><b>Risposta giusta:</b> \\(" + safeLt(Qn.atex) + "\\)</p>"; }
function feedbackHTML(Qn, res, o) {
  if (res.s === "ok") return '<div class="fbx good"><b class="fbt">' + IC.check + " Giusto!</b>" + answerLine(Qn) + "<details><summary>Vedi la correzione</summary>" + solHTML(Qn) + "</details></div>";
  const t = res.giveup ? "Ecco la soluzione" : res.form ? "Quasi: il valore è giusto, ma va scritto in un'altra forma" : "Non è giusto";
  const cheer = o && o.practice ? '<p class="cheer">Sbagliare fa parte dell\'imparare. Leggi con calma la correzione, poi prova con un nuovo esercizio.</p>' : "";
  return '<div class="fbx bad"><b class="fbt">' + IC.cross + " " + t + "</b>" + (res.m ? '<p class="why">' + res.m + "</p>" : "") + answerLine(Qn) + '<p class="solh">Correzione passo passo</p>' + solHTML(Qn) + cheer + "</div>";
}
function qcardHTML(Qn, o) {
  const id = "q" + ++QID; let body;
  if (Qn.type === "choice") body = '<div class="opts">' + Qn.opts.map((op, k) => '<button class="opt" data-k="' + k + '"><span class="l">' + "ABCD"[k] + "</span><span>" + op + "</span></button>").join("") + "</div>";
  else body = '<form class="inrow" autocomplete="off">' + (Qn.pre ? '<span class="pre">\\(' + Qn.pre + "\\)</span>" : "") +
    '<input class="ans" id="' + id + '-in" type="text" inputmode="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="' + esc(placeholder(Qn)) + '" aria-label="La tua risposta">' +
    '<button class="btn go" type="submit">' + (o.exam ? "Salva" : "Controlla") + "</button></form>" +
    '<p class="ihint">' + inputHint(Qn) + "</p>" +
    '<div class="preview"><span class="pvl">Ho letto:</span> <span class="pv"></span></div>' +
    '<div class="keys" aria-label="Tastiera matematica">' + keysFor(Qn).map(k => '<button type="button" class="kb" data-ins="' + esc(k[1]) + '">' + k[0] + "</button>").join("") + "</div>";
  const tools = o.exam ? "" : '<div class="qtools">' + (o.hints ? '<button class="linkbtn" data-act="hint">Aiutami passo passo</button>' : "") + '<button class="linkbtn" data-act="giveup">Non lo so</button>' + (Qn.type === "choice" ? "" : '<button class="linkbtn" data-act="help">Come si scrive?</button>') + "</div>";
  return '<div class="qcard" id="' + id + '">' + (o.badge ? '<div class="qbadge">' + o.badge + "</div>" : "") + '<div class="qtext">' + Qn.q + "</div>" + body + tools + '<div class="fb" aria-live="polite"></div></div>';
}
function wireQCard(root, Qn, o) {
  const inp = root.querySelector(".ans"), pv = root.querySelector(".pv"), fb = root.querySelector(".fb");
  const st = { hint: false, hi: 0, done: false, t0: Date.now() };
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
    if (a === "hint") {
      if (st.done) return; st.hint = true;
      const steps = Qn.sol.length > 1 ? Qn.sol.slice(0, -1) : Qn.sol; st.hi = Math.min(st.hi + 1, steps.length);
      fb.innerHTML = '<div class="fbx hint"><b>Aiuto, un passo alla volta</b><ol class="sol">' + steps.slice(0, st.hi).map(s => "<li>" + s + "</li>").join("") + '</ol><p class="muted small">' + (st.hi < steps.length ? "Prova a continuare da solo. Se serve, chiedi il passo successivo." : "Ora prova a finire tu il calcolo.") + " Con l'aiuto, questo esercizio non conta per la serie, ma impari lo stesso.</p></div>";
      typeset(fb);
      if (st.hi >= steps.length) b.remove(); else b.textContent = "Passo successivo";
    }
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
    fb.innerHTML = feedbackHTML(Qn, res, o); typeset(fb);
    if (o.onAnswer) o.onAnswer(res, { hint: st.hint, dt: (Date.now() - st.t0) / 1000 });
  }
  return st;
}

/* =========================== HOME =========================== */
function home() {
  stopTimers(); setBar("", null); VIEW = home;
  const pl = planInfo(), na = nextAction(), R = readiness(), h = P.hist[dk()] || { q: 0, ok: 0, t: 0, m: 0 };
  const cur = currentChapter(), due = dueList().length;
  const goalN = pl.perDay, goalDone = Math.min(h.m, goalN);
  const goal = pl.rem ? `<div class="goal"><div class="gl"><b>Obiettivo di oggi:</b> imparare ${goalN} lezion${goalN > 1 ? "i" : "e"} nuov${goalN > 1 ? "e" : "a"}${due ? " + il ripasso" : ""}</div><div class="gbar" role="progressbar" aria-valuemin="0" aria-valuemax="${goalN}" aria-valuenow="${goalDone}"><i style="width:${(100 * goalDone) / goalN}%"></i></div><div class="gn">${goalDone >= goalN ? IC.check + " Obiettivo raggiunto! Se hai ancora energia, continua pure." : goalDone + " / " + goalN + " fatte oggi · " + h.q + " esercizi"}</div></div>`
    : '<div class="goal"><div class="gl"><b>Hai imparato tutte le lezioni.</b> Ogni giorno: il ripasso e un esame di prova ogni tanto.</div></div>';
  const left = pl.left;
  const dateLine = P.examDate ? (left > 0 ? "Esame tra <b>" + left + " giorn" + (left > 1 ? "i" : "o") + "</b> (" + fmtDate(P.examDate) + ")" : left === 0 ? "<b>L'esame è oggi.</b> In bocca al lupo!" : "La data dell'esame è passata.") + ' · <button class="linkbtn" id="setDate">cambia</button>' : 'Non hai ancora indicato la data dell\'esame. <button class="linkbtn" id="setDate">Indica la data</button>';
  const welcome = !P.welcome ? `<section class="card welcome"><h2 class="serif">Benvenuto! Come funziona, in 3 punti</h2>
    <ol class="steps"><li><b>Si parte da zero.</b> La Tappa 0 ripassa le basi (numeri negativi, frazioni, potenze…). Poi, tappa dopo tappa, si arriva al livello dell'esame. Tutto è spiegato in italiano, con parole semplici.</li>
    <li><b>Ogni lezione:</b> una spiegazione, un esempio passo passo, poi esercizi (prima facili, poi normali). La lezione è <b>imparata</b> quando fai 4 esercizi giusti di fila senza aiuto.</li>
    <li><b>Tu premi solo « Continua ».</b> L'app sceglie ogni volta la cosa giusta: lezione nuova, ripasso (le lezioni tornano dopo 1, 3, 7, 14, 30 giorni, così non le dimentichi) o verifica.</li></ol>
    <p class="muted">Consiglio: tieni un quaderno e fai i calcoli a mano. Se una tappa ti sembra facile, fai subito la sua <b>verifica</b>: ogni risposta giusta conta come lezione imparata.</p>
    <div class="actions"><button class="btn ghost" id="wGuide">Leggi tutte le istruzioni</button><button class="btn" id="wOk">Ho capito, iniziamo</button></div></section>` : "";
  go(`
  ${welcome}
  <section class="today">
    <p class="hello">${h.q ? "Bentornato! Continuiamo da dove eri rimasto." : "Ciao! Pronto per oggi?"}</p>
    <button class="cta" id="cta">${IC.play}<span><small class="lbl">Continua</small><b>${na.label}</b><small>${na.sub}</small></span></button>
    ${goal}
    <p class="dateline">${dateLine}</p>
  </section>
  <h2 class="sec-title">Il percorso</h2>
  <nav class="tappe" aria-label="Tappe">
    ${CHS.map(c => { const d = chDone(c), tot = c.skills.length, won = gateOK(c.n), here = c.n === cur && !won;
      return `<button class="tappa ${won ? "done" : ""} ${here ? "here" : ""}" data-c="${c.n}"><span class="tn">${won ? IC.check : c.n}</span><span class="tx"><b>Tappa ${c.n} · ${c.name}</b><small>${c.sub}</small><span class="tbar"><i style="width:${(100 * d) / tot}%"></i></span><small class="tcount">${d} / ${tot} lezioni imparate${won ? " · verifica superata" : d === tot ? " · verifica disponibile" : ""}</small></span>${here ? '<span class="tag here">Sei qui</span>' : ""}</button>`; }).join("")}
  </nav>
  <h2 class="sec-title">Altro</h2>
  <div class="tools">
    <button class="tool" id="tReady"><b>Sono pronto?</b><span>Preparazione: ${R.pct} %</span></button>
    <button class="tool" id="tExam"><b>Esami di prova</b><span>Come all'esame, con il tempo</span></button>
    <button class="tool" id="tErr"><b>I miei errori</b><span>${P.errs.length} da rivedere</span></button>
    <button class="tool" id="tStats"><b>I miei progressi</b><span>${masteredCount()} / ${SKILLS.length} lezioni · ${fmtDur(P.time)}</span></button>
    <button class="tool" id="tSet"><b>Data e salvataggio</b><span>${Sync.state === "account" ? "Salvato sul tuo account" : "Salvato su questo dispositivo"}</span></button>
    <button class="tool" id="tGuide"><b>Come funziona</b><span>Le regole e i consigli</span></button>
  </div>
  <p class="foot"><button class="linkbtn" id="tLib">Materiale originale del corso (in francese)</button></p>`, home);
  $("#cta").onclick = na.run;
  $("#setDate").onclick = settingsView;
  app.querySelectorAll(".tappa").forEach(b => b.onclick = () => chapterView(+b.dataset.c));
  $("#tReady").onclick = readyView; $("#tExam").onclick = examsHome; $("#tErr").onclick = errorsView; $("#tStats").onclick = statsView; $("#tSet").onclick = settingsView; $("#tGuide").onclick = guideView; $("#tLib").onclick = libraryHome;
  const wOk = $("#wOk"); if (wOk) { wOk.onclick = () => { P.welcome = 1; save(); home(); }; $("#wGuide").onclick = guideView; }
}

function ring(pct) {
  const r = 42, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return '<svg viewBox="0 0 100 100" class="ring" role="img" aria-label="Preparazione ' + pct + ' %"><circle cx="50" cy="50" r="' + r + '" class="rt"/><circle cx="50" cy="50" r="' + r + '" class="rv" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 50 50)"/><text x="50" y="49" class="rn">' + pct + '<tspan class="rp">%</tspan></text><text x="50" y="66" class="rl">pronto</text></svg>';
}
function readyView() {
  stopTimers(); setBar("Sono pronto?", home); VIEW = readyView;
  const R = readiness(), pl = planInfo();
  const pace = pl.rem ? (pl.finish ? "Al tuo ritmo attuale finirai tutte le lezioni il <b>" + fmtDate(pl.finish) + "</b>." : "Impara la prima lezione per vedere quando finirai.") : "Hai imparato tutte le lezioni.";
  go(`<header class="chead"><div class="where">Una misura onesta</div><h2>Sei pronto al ${R.pct} %</h2></header>
  <section class="panel"><div class="readytop">${ring(R.pct)}<p>Sei pronto per l'esame quando i <b>cinque punti</b> qui sotto sono tutti verdi. Non è una sensazione: sono risultati misurati sui tuoi esercizi. ${pace}</p></div>
  <ul class="crit">${R.crit.map(c => `<li class="${c.ok ? "ok" : ""}"><span class="mi">${c.ok ? IC.check : IC.cross}</span><span class="mt"><b>${c.t}</b><small>${c.v}</small></span></li>`).join("")}</ul>
  ${R.ready ? '<div class="seal big"><span>Pronto<small>per la passerelle</small></span></div><p class="center">Tutti i punti sono verdi. Continua il ripasso di ogni giorno fino all\'esame per restare a questo livello.</p>' : '<p class="muted">Non devi pensarci: premi « Continua » ogni giorno e questi punti diventeranno verdi uno dopo l\'altro.</p>'}
  <div class="actions"><span></span><button class="btn" id="bk2">Torna alla home</button></div></section>`);
  $("#bk2").onclick = home;
}

/* =========================== TAPPA =========================== */
function chapterView(n) {
  stopTimers(); const c = CHS[n]; VIEW = () => chapterView(n);
  setBar("Tappa " + n + " · " + c.short, home);
  const d = chDone(c), gate = P.gates[n];
  const row = (k, j) => {
    const s = S(k.id), stt = s.st, due = isDue(k.id);
    const lab = stt === 2 ? (due ? "da ripassare oggi" : "imparata" + (s.due ? " · ripasso tra " + Math.max(1, Math.ceil((s.due - Date.now()) / DAY)) + " g" : "")) : stt === 3 ? "da recuperare" : stt === 1 ? "in corso · " + s.run + " / " + target(k) + " di fila" : "da scoprire";
    return `<button class="srow st${stt}${due ? " due" : ""}" data-k="${k.id}"><span class="sico">${stt === 2 ? IC.check : stt === 3 ? "!" : j + 1}</span><span class="stx"><b>${k.title}</b><small>${lab}</small></span></button>`;
  };
  go(`<header class="chead"><div class="where">Tappa ${n} di ${NG - 1}</div><h2>${c.name}</h2><p>${c.sub}</p><p class="muted small">${d} / ${c.skills.length} lezioni imparate${gate && gate.passed ? " · verifica superata (" + gate.best + " %)" : gate ? " · miglior verifica: " + gate.best + " %" : ""}</p></header>
  <h3 class="sec-title">Le lezioni, in ordine</h3>
  <div class="slist">${c.skills.map(row).join("")}</div>
  <div class="gatebox ${gateOK(n) ? "won" : ""}">${gateOK(n) ? '<div class="seal sm"><span>Tappa<small>' + n + "</small></span></div>" : ""}<div><b>Verifica della tappa</b><p>Un esercizio per ogni lezione, senza aiuto. Superata con almeno il 90 % (e tutte le lezioni imparate). Puoi farla anche <b>all'inizio</b>: ogni risposta giusta conta subito come lezione imparata.</p><button class="btn" id="gateBtn">${gateOK(n) ? "Rifai la verifica" : "Fai la verifica"}</button></div></div>
  <div class="actions">${n >= 1 && n <= 9 ? '<button class="btn ghost" id="libBtn">Materiale originale (francese)</button>' : "<span></span>"}<button class="btn" id="homeBtn">Torna alla home</button></div>`);
  app.querySelectorAll(".srow").forEach(b => b.onclick = () => skillView(b.dataset.k));
  $("#gateBtn").onclick = () => startGate(n); $("#homeBtn").onclick = home;
  const lb = $("#libBtn"); if (lb) lb.onclick = () => libChapter(n - 1, () => chapterView(n));
}

/* =========================== LEZIONE =========================== */
function meterHTML(k) {
  const s = S(k.id), t = s.st === 3 ? 2 : target(k), filled = s.st === 2 ? t : Math.min(s.run, t);
  let dots = ""; for (let i = 0; i < t; i++) dots += '<i class="' + (i < filled ? "on" : "") + '"></i>';
  const lab = s.st === 2 ? "Imparata" : s.st === 3 ? "Da recuperare: " + filled + " / 2 giusti di fila" : "Giusti di fila: " + filled + " / " + t;
  return '<span class="meter st' + s.st + '" aria-label="' + lab + '">' + dots + "<em>" + lab + "</em></span>";
}
function skillView(id, tab) {
  stopTimers(); const k = SKB[id], c = CHS[k.ch]; VIEW = null;
  const pos = c.skills.indexOf(k) + 1;
  setBar("Tappa " + k.ch + " · " + c.short, () => chapterView(k.ch));
  let T = tab || (stOf(id) === 0 ? "learn" : "practice");
  go(`<header class="chead"><div class="where">Tappa ${k.ch} · lezione ${pos} di ${c.skills.length}</div><h2>${k.title}</h2><div id="meter">${meterHTML(k)}</div></header>
    <div class="tabs" role="tablist"><button class="tab" role="tab" data-t="learn" aria-selected="${T === "learn"}">1. Capire</button><button class="tab" role="tab" data-t="practice" aria-selected="${T === "practice"}">2. Esercizi</button></div><div id="body"></div>`);
  app.querySelectorAll(".tab").forEach(b => b.onclick = () => setTab(b.dataset.t));
  body();
  function setTab(t) { T = t; app.querySelectorAll(".tab").forEach(x => x.setAttribute("aria-selected", x.dataset.t === t)); body(); }
  function body() { if (T === "learn") learn(); else practice(); }
  function learn() {
    const ex = makeQ(k, newSeed(), true);
    $("#body").innerHTML = `<section class="panel lesson">${k.learn}
      <div class="box example"><div class="bt">Esempio passo passo</div><div class="exq">${ex.q}</div>${ex.type === "choice" ? '<ol class="exopts" type="A">' + ex.opts.map(o => "<li>" + o + "</li>").join("") + "</ol>" : ""}
        <ol class="sol reveal">${ex.sol.map(s => "<li>" + s + "</li>").join("")}</ol><div class="exa" hidden>${answerLine(ex)}</div>
        <p class="muted small" id="exTip">Prima prova a pensarci da solo (anche sul quaderno), poi guarda i passi uno alla volta.</p>
        <div class="actions left"><button class="btn" id="stepBtn">Mostra il primo passo</button><button class="small-btn" id="anotherEx">Un altro esempio</button></div></div>
      <div class="actions"><span></span><button class="btn" id="toPr">Ora provo io</button></div></section>`;
    typeset($("#body"));
    const lis = $("#body").querySelectorAll(".sol.reveal li"); let shown = 0;
    $("#stepBtn").onclick = () => {
      if (shown < lis.length) { lis[shown].classList.add("show"); shown++; }
      if (shown >= lis.length) { $("#body").querySelector(".exa").hidden = false; $("#stepBtn").remove(); const t = $("#exTip"); if (t) t.remove(); }
      else $("#stepBtn").textContent = "Passo successivo (" + (shown + 1) + " di " + lis.length + ")";
    };
    $("#anotherEx").onclick = learn;
    $("#toPr").onclick = () => setTab("practice");
  }
  function practice() {
    const s = S(id), easy = easyNow(id);
    const intro = s.st === 2 ? "Lezione imparata. Puoi allenarti ancora quanto vuoi." : s.st === 3 ? "Fai 2 esercizi giusti di fila per recuperare questa lezione." : "Obiettivo: <b>" + target(k) + " esercizi giusti di fila</b>, senza aiuto. I primi sono più facili.";
    $("#body").innerHTML = `<p class="muted small">${intro}</p><div id="qh"></div><div id="after"></div>`;
    const seed = newSeed(), Qn = makeQ(k, seed, easy);
    $("#qh").innerHTML = qcardHTML(Qn, { hints: true, badge: easy ? "Livello: facile" : "Livello: normale" });
    wireQCard($("#qh").firstElementChild, Qn, { hints: true, focus: true, practice: true, onAnswer: (res, inf) => {
      const ev = recordAnswer(k, res.s === "ok", "practice", { hint: inf.hint, seed, easy, dt: inf.dt });
      $("#meter").innerHTML = meterHTML(k);
      const aft = $("#after");
      if (ev.mastered || ev.recovered) {
        const nxt = nextSkillInOrder(id);
        aft.innerHTML = `<div class="win"><div class="seal sm"><span>${ev.mastered ? "Imparata" : "Recuperata"}<small>${IC.check}</small></span></div><div><b>Bravo! « ${k.title} » è ${ev.mastered ? "imparata" : "di nuovo a posto"}.</b><p>${ev.mastered ? "Tornerà nel ripasso domani, poi tra 3, 7, 14 e 30 giorni, così non la dimentichi." : "È tornata nel ripasso normale."}</p></div></div>
          <div class="actions"><button class="btn ghost" id="again">Un altro esercizio</button><button class="btn" id="nextSk">Continua</button></div>`;
        $("#again").onclick = practice;
        $("#nextSk").onclick = () => { if (weakList().length || dueList().length || gateReady()) nextAction().run(); else if (nxt) skillView(nxt.id); else home(); };
        $("#nextSk").focus({ preventScroll: true });
      } else {
        aft.innerHTML = `<div class="actions">${res.s === "ok" ? "<span></span>" : '<button class="btn ghost" id="toLearn">Rileggi la spiegazione</button>'}<button class="btn" id="nq">Prossimo esercizio</button></div>`;
        $("#nq").onclick = practice; $("#nq").focus({ preventScroll: true });
        const tl = $("#toLearn"); if (tl) tl.onclick = () => setTab("learn");
      }
    } });
    typeset($("#qh"));
  }
}

/* =========================== SERIE (correzione subito) =========================== */
function runSession(cfg) {
  stopTimers(); VIEW = null; let i = 0; const results = [];
  setBar(cfg.title, () => askConfirm("Vuoi uscire? Le risposte già date restano salvate.", "Esci", cfg.back || home, "Resto"));
  function draw() {
    if (i >= cfg.items.length) return end();
    const it = cfg.items[i], k = SKB[it.k], Qn = makeQ(k, it.seed);
    go(`<section class="panel"><div class="qtop"><span>Domanda ${i + 1} di ${cfg.items.length}</span><span class="tag">${cfg.hideTitle ? "Tappa " + k.ch : k.title}</span></div><div class="prog"><i style="width:${(i / cfg.items.length) * 100}%"></i></div><div id="qh"></div><div class="actions"><span></span><button class="btn" id="nx" hidden>${i === cfg.items.length - 1 ? "Vedi il risultato" : "Domanda successiva"}</button></div></section>`);
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
    setBar(cfg.title + " · risultato", home);
    go(`<section class="panel"><div class="result"><h3>${sc} / ${n}</h3>${extra || '<p class="muted">' + (sc === n ? "Tutto giusto!" : "Gli errori sono salvati in « I miei errori », e le lezioni sbagliate torneranno presto da ripassare.") + "</p>"}</div>
      <ul class="rlist">${results.map(r => `<li class="${r.ok ? "ok" : "ko"}"><span class="mi">${r.ok ? IC.check : IC.cross}</span><span class="mt"><b>${SKB[r.k].title}</b><small>${r.ev.demoted ? "da recuperare" : r.ev.mastered ? "contata come imparata" : r.ev.recovered ? "recuperata" : r.ev.promoted ? "prossimo ripasso tra " + INTERVALS[S(r.k).iv] + " g" : r.ok ? "giusta" : "da rifare"}</small></span>${r.ok ? "" : `<button class="small-btn" data-k="${r.k}">Esercitati</button>`}</li>`).join("")}</ul>
      <div class="actions"><span></span><button class="btn" id="hb">Continua</button></div></section>`);
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => skillView(b.dataset.k, "practice"));
    $("#hb").onclick = () => (cfg.after ? cfg.after() : home());
  }
  draw();
}
function startReview() {
  const d = dueList().slice(0, 20); if (!d.length) { toast("Niente da ripassare oggi."); return home(); }
  P.hist[dk()] = Object.assign(H(), { rev: 1 }); save();
  runSession({ title: "Ripasso di oggi", mode: "review", hideTitle: true, items: shuffleR(d).map(k => ({ k: k.id, seed: newSeed() })) });
}
function startGate(n) {
  const c = CHS[n];
  runSession({ title: "Verifica della Tappa " + n, mode: "gate", hideTitle: false, back: () => chapterView(n), items: shuffleR(c.skills).map(k => ({ k: k.id, seed: newSeed() })),
    after: () => chapterView(n),
    onEnd: (res, sc, tot) => {
      const pct = Math.round((100 * sc) / tot), all = chDone(c) === c.skills.length, prev = P.gates[n] || { best: 0 };
      const win = pct >= 90 && all, first = win && !prev.passed;
      P.gates[n] = { best: Math.max(prev.best || 0, pct), passed: prev.passed || win, d: Date.now() };
      if (first) P.xp += 150;
      save();
      return win ? '<div class="seal"><span>Tappa ' + n + "<small>superata</small></span></div><p>Verifica " + (first ? "superata" : "confermata") + " con il " + pct + " %. Bravissimo!</p>"
        : "<p>" + pct + " %: " + (pct < 90 ? "serve almeno il 90 %. " : "risultato sufficiente, ma " + (c.skills.length - chDone(c)) + " lezion" + (c.skills.length - chDone(c) > 1 ? "i non sono" : "e non è") + " ancora imparat" + (c.skills.length - chDone(c) > 1 ? "e" : "a") + ". ") + "Le risposte giuste contano già come lezioni imparate: esercitati sulle altre e poi rifai la verifica.</p>";
    } });
}
function startSprint() {
  let pool = SKILLS.filter(k => stOf(k.id) >= 1);
  if (pool.length < 4) pool = SKILLS.filter(k => k.ch <= 1);
  const items = shuffleR(pool).slice(0, 12).map(k => ({ k: k.id, seed: newSeed() }));
  runSession({ title: "Allenamento misto", mode: "sprint", hideTitle: true, items });
}

/* =========================== ESAMI DI PROVA =========================== */
function libData() {
  if (libData.c) return libData.c;
  const CHL = GUIDE.chapters.map(c => {
    const h1 = c.blocks[0], secs = []; let cur = { title: "Per cominciare", blocks: [] }, ex = null, sol = null, exam = null, examSol = null;
    c.blocks.slice(1).forEach(b => {
      if (b.t === "h2") { if (cur.blocks.length) secs.push(cur); cur = { title: b.html, blocks: [] }; }
      else if (b.t === "exblock") ex = b; else if (b.t === "solblock") sol = b; else if (b.t === "qcm") exam = b.items; else if (b.t === "qcmsol") examSol = b.items; else cur.blocks.push(b);
    });
    if (cur.blocks.length) secs.push(cur);
    const exos = ex ? ex.ex.map((e, i) => ({ lv: e.lv, html: e.html, parts: sol ? sol.sol[i].parts : [] })) : [];
    const qs = [];
    const chNew = +c.n + 1; // capitolo del corso francese → tappa della nuova app
    if (ex && ex.qcm) ex.qcm.forEach((q0, i) => { const s = sol.qsol[i]; qs.push({ q: q0.q, type: "choice", opts: q0.o, a: "ABCD".indexOf(s.a), sol: [s.e], atex: "", ch: chNew }); });
    (BOSS[c.n] || []).forEach(b => qs.push({ q: b[0], type: "choice", opts: b[1], a: b[2], sol: [b[3]], atex: "", ch: chNew }));
    let examQs = null;
    if (exam) examQs = exam.map((q0, i) => ({ q: q0.q, type: "choice", opts: q0.o, a: "ABCD".indexOf(examSol[i].a), sol: [examSol[i].e], atex: "", ch: +(((examSol[i].e.match(/\[chap\. (\d+)/) || [])[1]) || 0) + 1 }));
    return { n: +c.n, title: h1.title, sub: h1.sub, secs, exos, qs, examQs };
  });
  const bank = [].concat(...CHL.filter(c => c.n <= 8).map(c => c.qs));
  const e9 = CHL.find(c => c.examQs);
  return (libData.c = { CHL, bank, exam30: e9 ? e9.examQs : shuffleR(bank).slice(0, 30) });
}
const EXW = [[2, 3], [3, 3], [4, 2], [5, 3], [6, 3], [7, 2], [8, 2], [9, 2]];
const EXNAME = { gen: "Esame completo", qcm30: "Scelta multipla in francese (esame del corso)", qcmmix: "Scelta multipla in francese (a caso)", express: "Esame veloce" };
function examsHome() {
  stopTimers(); setBar("Esami di prova", home); VIEW = examsHome;
  const hist = P.exams.slice().reverse().slice(0, 12);
  const frOK = gateOK(10) || chDone(CHS[10]) >= 3;
  go(`<header class="chead"><div class="where">Come il giorno dell'esame</div><h2>Esami di prova</h2><p>Senza calcolatrice, senza appunti, con il tempo. La correzione arriva alla fine. Le lezioni sbagliate tornano da recuperare.</p></header>
  <p class="muted small">Quando farli? Il primo esame completo è utile quando hai finito circa metà del percorso (Tappa 5). Poi uno alla settimana.</p>
  <div class="tools">
    <button class="tool main" data-x="gen"><b>Esame completo</b><span>20 domande su tutto il programma, da scrivere · 60 min · domande sempre nuove</span></button>
    <button class="tool" data-x="express"><b>Esame veloce</b><span>10 domande · 20 min</span></button>
    <button class="tool" data-x="qcm30"><b>Scelta multipla in francese</b><span>Le 30 domande dell'esame del corso, in francese come all'esame vero · 90 min${frOK ? "" : " · consigliato dopo la Tappa 10"}</span></button>
    <button class="tool" data-x="qcmmix"><b>Scelta multipla in francese, a caso</b><span>30 domande tra ${libData().bank.length} · 90 min${frOK ? "" : " · consigliato dopo la Tappa 10"}</span></button>
  </div>
  <h3 class="sec-title">I tuoi esami</h3>
  ${hist.length ? '<ul class="rlist">' + hist.map(e => `<li class="${e.sc / e.n >= 0.85 ? "ok" : ""}"><span class="mi">${Math.round((100 * e.sc) / e.n)}%</span><span class="mt"><b>${EXNAME[e.k] || e.k} · ${e.sc}/${e.n}</b><small>${fmtDay(e.d)} · ${fmtDur(e.dur || 0)}</small></span></li>`).join("") + "</ul>" : '<p class="muted">Nessun esame fatto per ora.</p>'}`);
  app.querySelectorAll("[data-x]").forEach(b => b.onclick = () => startExam(b.dataset.x));
}
function startExam(kind) {
  let qs, minutes, title = EXNAME[kind];
  if (kind === "gen" || kind === "express") {
    const picks = [];
    if (kind === "gen") EXW.forEach(([ch, n]) => shuffleR(CHS[ch].skills).slice(0, n).forEach(k => picks.push(k)));
    else { const pool = SKILLS.filter(k => k.ch >= 2 && k.ch <= 9); shuffleR(pool).slice(0, 10).forEach(k => picks.push(k)); picks.sort((a, b) => a.i - b.i); }
    qs = picks.map(k => { const seed = newSeed(); return { Qn: makeQ(k, seed), k: k.id, seed, ch: k.ch }; });
    minutes = kind === "gen" ? 60 : 20;
  } else {
    const Ld = libData(); const src = kind === "qcm30" ? Ld.exam30 : shuffleR(Ld.bank).slice(0, 30);
    qs = src.map(Qn => ({ Qn, ch: Qn.ch })); minutes = 90;
  }
  askConfirm("<b>" + title + "</b>: " + qs.length + " domande, " + minutes + " minuti. Niente calcolatrice, niente appunti. Pronto?", "Inizia", () => runExam({ kind, qs, minutes, title }), "Più tardi");
}
function runExam(cfg) {
  stopTimers(); const n = cfg.qs.length; const E = { ans: Array(n).fill(""), i: 0, end: Date.now() + cfg.minutes * 60000, t0: Date.now(), done: false };
  VIEW = null;
  setBar(cfg.title, () => askConfirm("Vuoi uscire dall'esame? Non verrà contato.", "Esci", examsHome, "Continua l'esame"));
  const clock = () => { const s = Math.max(0, Math.round((E.end - Date.now()) / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  timers.push(setInterval(() => { const c = $("#clock"); if (c) { c.textContent = clock(); if (E.end - Date.now() < 5 * 60000) c.classList.add("low"); } if (Date.now() >= E.end) finish(); }, 1000));
  function draw() {
    const it = cfg.qs[E.i];
    go(`<section class="panel"><div class="qtop"><span>Domanda ${E.i + 1} di ${n}</span><span>${IC.clock} <b id="clock">${clock()}</b></span></div><div id="qh"></div>
      <div class="qgrid">${cfg.qs.map((x, j) => `<button data-j="${j}" class="${E.ans[j] !== "" ? "ans" : ""} ${j === E.i ? "cur" : ""}" aria-label="Domanda ${j + 1}">${j + 1}</button>`).join("")}</div>
      <div class="actions"><button class="btn ghost" id="pv" ${E.i === 0 ? "disabled" : ""}>Precedente</button>${E.i < n - 1 ? '<button class="btn" id="nxq">Successiva</button>' : '<button class="btn" id="endx">Finisci e correggi</button>'}</div></section>`);
    $("#qh").innerHTML = qcardHTML(it.Qn, { exam: true });
    const setAns = v => { E.ans[E.i] = v; const g = app.querySelector('.qgrid [data-j="' + E.i + '"]'); if (g) g.classList.toggle("ans", v !== "" && v !== null); };
    wireQCard($("#qh").firstElementChild, it.Qn, { exam: true, focus: true, initial: E.ans[E.i], onChange: setAns, onSubmit: () => { if (E.i < n - 1) { E.i++; draw(); } } });
    typeset($("#qh"));
    app.querySelectorAll(".qgrid button").forEach(b => b.onclick = () => { E.i = +b.dataset.j; draw(); });
    const p = $("#pv"); if (p) p.onclick = () => { E.i--; draw(); };
    const nx = $("#nxq"); if (nx) nx.onclick = () => { E.i++; draw(); };
    const en = $("#endx"); if (en) en.onclick = () => { const miss = E.ans.filter(a => a === "" || a === null).length; if (miss) askConfirm(miss + " domand" + (miss > 1 ? "e" : "a") + " senza risposta. Vuoi finire lo stesso?", "Finisci", finish); else finish(); };
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
    P.exams.push({ k: cfg.kind, d: Date.now(), sc, n, per, dur: Math.round(dur) }); save();
    const pct = Math.round((100 * sc) / n);
    const weakest = Object.entries(per).filter(([, v]) => v[0] < v[1]).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
    setBar("Correzione · " + cfg.title, examsHome); VIEW = null;
    go(`<section class="panel"><div class="result"><h3>${sc} / ${n} · ${pct} %</h3><p>${pct >= 85 ? "Livello da esame raggiunto! Rifai un esame tra qualche giorno per confermarlo." : pct >= 65 ? "Buona base. Le lezioni sbagliate sono tornate da recuperare: premi « Continua » nella home e l'app te le farà rifare." : "Ora sai da dove partire. Segui « Continua » ogni giorno e rifai un esame tra una settimana."} Tempo: ${fmtDur(dur)}.</p></div>
      <h4 class="serif">Per tappa</h4>
      <div class="breakdown">${Object.entries(per).sort((a, b) => a[0] - b[0]).map(([c, v]) => `<div class="brow"><span>${c}. ${(CHS[c] || { short: "" }).short}</span><div class="bb"><i style="width:${(v[0] / v[1]) * 100}%"></i></div><em>${v[0]}/${v[1]}</em></div>`).join("")}</div>
      ${weakest ? `<p>Da riprendere per prima: <b>Tappa ${weakest[0]} (${(CHS[weakest[0]] || { name: "" }).name})</b>.</p>` : ""}
      <h4 class="serif">Correzione di ogni domanda</h4>
      <div class="review">${graded.map((g, j) => `<details class="ri ${g.ok ? "" : "bad"}"><summary><span class="mi">${g.ok ? IC.check : IC.cross}</span> Domanda ${j + 1}${g.it.k ? " · " + SKB[g.it.k].title : ""}</summary><div class="qtext">${g.it.Qn.q}</div>
        <p><b>La tua risposta:</b> ${g.it.Qn.type === "choice" ? (g.a === "" || g.a === null ? "nessuna" : "ABCD"[g.a] + ". " + g.it.Qn.opts[g.a]) : g.a ? "<code>" + esc(g.a) + "</code>" : "nessuna"}</p>${g.m && !g.ok ? '<p class="why">' + g.m + "</p>" : ""}${answerLine(g.it.Qn)}${solHTML(g.it.Qn)}${g.it.k && !g.ok ? '<button class="small-btn" data-k="' + g.it.k + '">Esercitati su questa lezione</button>' : ""}</details>`).join("")}</div>
      <div class="actions"><button class="btn ghost" id="ex2">Altri esami</button><button class="btn" id="hm">Torna alla home</button></div></section>`);
    app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => skillView(b.dataset.k, "practice"));
    app.querySelectorAll("details.ri").forEach(d => d.addEventListener("toggle", () => typeset(d), { once: true }));
    $("#ex2").onclick = examsHome; $("#hm").onclick = home;
  }
  draw();
}

/* =========================== I MIEI ERRORI =========================== */
function errorsView() {
  stopTimers(); setBar("I miei errori", home); VIEW = errorsView;
  const list = P.errs.filter(e => SKB[e.k]).slice(0, 40);
  go(`<header class="chead"><div class="where">Mai due volte lo stesso errore</div><h2>I miei errori</h2><p>Ogni esercizio sbagliato resta qui con la sua correzione. Rileggili, poi rifai una serie su queste lezioni.</p></header>
  ${list.length ? `<div class="actions"><span></span><button class="btn" id="redo">Rifai una serie sui miei errori</button></div>
  <ul class="rlist">${list.map((e, i) => `<li class="ko"><span class="mi">${IC.cross}</span><span class="mt"><b>${SKB[e.k].title}</b><small>${fmtDay(e.t)} · Tappa ${SKB[e.k].ch}</small></span><button class="small-btn" data-i="${i}">Rivedi</button></li>`).join("")}</ul>` : '<p class="muted">Nessun errore salvato per ora.</p>'}`);
  app.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
    const e = list[+b.dataset.i], k = SKB[e.k], Qn = makeQ(k, e.s, e.e);
    const d = showModal(`<p class="muted">${k.title}</p><div class="qtext">${Qn.q}</div>${answerLine(Qn)}${solHTML(Qn)}<p><button class="small-btn" id="sim">Fai un esercizio simile</button></p>`);
    d.querySelector("#sim").onclick = () => { d.remove(); skillView(k.id, "practice"); };
  });
  const r = $("#redo"); if (r) r.onclick = () => {
    const ids = [...new Set(list.map(e => e.k))].slice(0, 12);
    runSession({ title: "Serie sui miei errori", mode: "review", hideTitle: false, items: ids.map(id => ({ k: id, seed: newSeed() })), after: errorsView });
  };
}

/* =========================== I MIEI PROGRESSI =========================== */
function barChart(days) {
  const W = 640, Hh = 190, pad = { l: 34, r: 8, t: 12, b: 26 }, n = days.length;
  const max = Math.max(10, ...days.map(d => d.q)); const nice = Math.ceil(max / 10) * 10;
  const bw = (W - pad.l - pad.r) / n, y = v => pad.t + (Hh - pad.t - pad.b) * (1 - v / nice);
  let g = ""; [0, 0.5, 1].forEach(f => { const v = Math.round(nice * f); g += '<line class="cg" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ct" x="' + (pad.l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + "</text>"; });
  const bars = days.map((d, i) => {
    const x = pad.l + i * bw + 3, w = Math.max(3, bw - 6), top = y(d.q), h0 = Hh - pad.b - top, r = Math.min(4, w / 2, h0);
    const path = d.q ? 'M' + x + ' ' + (Hh - pad.b) + 'V' + (top + r) + 'q0 -' + r + ' ' + r + ' -' + r + 'H' + (x + w - r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + (Hh - pad.b) + 'Z' : "";
    const tip = d.label + ": " + d.q + " esercizi" + (d.q ? ", " + Math.round((100 * d.ok) / d.q) + " % giusti, " + fmtDur(d.t) : "");
    return '<g class="hit" tabindex="0" data-tip="' + esc(tip) + '"><rect x="' + (pad.l + i * bw) + '" y="' + pad.t + '" width="' + bw + '" height="' + (Hh - pad.t - pad.b) + '" fill="transparent"/>' + (path ? '<path class="cb" d="' + path + '"/>' : "") + (i % 3 === n % 3 || i === n - 1 ? '<text class="ct" x="' + (pad.l + i * bw + bw / 2) + '" y="' + (Hh - 8) + '" text-anchor="middle">' + d.short + "</text>" : "") + "</g>";
  }).join("");
  return '<div class="chart"><svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Esercizi fatti ogni giorno">' + g + '<line class="ca" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + (Hh - pad.b) + '" y2="' + (Hh - pad.b) + '"/>' + bars + '</svg><div class="tip" hidden></div></div>';
}
function lineChart(ex) {
  const W = 640, Hh = 190, pad = { l: 40, r: 14, t: 14, b: 26 }, n = ex.length;
  const x = i => (n === 1 ? (W + pad.l - pad.r) / 2 : pad.l + ((W - pad.l - pad.r) * i) / (n - 1)), y = v => pad.t + (Hh - pad.t - pad.b) * (1 - v / 100);
  let g = ""; [0, 50, 100].forEach(v => { g += '<line class="cg" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ct" x="' + (pad.l - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + " %</text>"; });
  g += '<line class="goal" x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + y(85) + '" y2="' + y(85) + '"/><text class="ct goalt" x="' + (W - pad.r) + '" y="' + (y(85) - 5) + '" text-anchor="end">obiettivo 85 %</text>';
  const pts = ex.map((e, i) => [x(i), y((100 * e.sc) / e.n), e]);
  const line = n > 1 ? '<path class="cl" d="M' + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + '"/>' : "";
  const dots = pts.map((p, i) => '<g class="hit" tabindex="0" data-tip="' + esc(fmtDay(p[2].d) + " · " + p[2].sc + "/" + p[2].n + " (" + Math.round((100 * p[2].sc) / p[2].n) + " %)") + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="transparent"/><circle class="cd" cx="' + p[0] + '" cy="' + p[1] + '" r="5"/>' + (i === n - 1 ? '<text class="ct strong" x="' + p[0] + '" y="' + (p[1] - 11) + '" text-anchor="' + (n === 1 ? "middle" : "end") + '">' + Math.round((100 * p[2].sc) / p[2].n) + " %</text>" : "") + "</g>").join("");
  return '<div class="chart"><svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Risultati degli esami completi">' + g + line + dots + '</svg><div class="tip" hidden></div></div>';
}
function wireTips(root) {
  root.querySelectorAll(".chart").forEach(ch => {
    const tip = ch.querySelector(".tip");
    const show = (e, el) => { tip.textContent = el.dataset.tip; tip.hidden = false; const r = ch.getBoundingClientRect(), b = el.getBoundingClientRect(); tip.style.left = Math.min(r.width - 10, Math.max(10, b.left - r.left + b.width / 2)) + "px"; tip.style.top = Math.max(0, b.top - r.top - 8) + "px"; };
    ch.querySelectorAll(".hit").forEach(el => { el.addEventListener("pointerenter", e => show(e, el)); el.addEventListener("focus", e => show(e, el)); el.addEventListener("pointerleave", () => (tip.hidden = true)); el.addEventListener("blur", () => (tip.hidden = true)); el.addEventListener("click", e => show(e, el)); });
  });
}
function statsView() {
  stopTimers(); setBar("I miei progressi", home); VIEW = statsView;
  const all = Object.values(P.hist), Q = all.reduce((a, h) => a + h.q, 0), OK = all.reduce((a, h) => a + h.ok, 0), days = all.filter(h => h.q).length;
  const lg = P.exams.filter(e => e.k === "gen");
  const dd = []; for (let i = 20; i >= 0; i--) { const t = Date.now() - i * DAY, h = P.hist[dk(t)] || { q: 0, ok: 0, t: 0 }; const d = new Date(t); dd.push({ q: h.q, ok: h.ok, t: h.t, label: d.toLocaleDateString("it-CH", { weekday: "short", day: "numeric", month: "short" }), short: d.getDate() + "/" + (d.getMonth() + 1) }); }
  const weak = SKILLS.filter(k => P.sk[k.id] && P.sk[k.id].n >= 3).map(k => ({ k, r: P.sk[k.id].ok / P.sk[k.id].n, lap: P.sk[k.id].lap })).sort((a, b) => a.r - b.r || b.lap - a.lap).slice(0, 6);
  go(`<header class="chead"><div class="where">I tuoi risultati veri</div><h2>I miei progressi</h2></header>
  <div class="tiles">
    <div class="tile"><b>${masteredCount()}<small>/${SKILLS.length}</small></b><span>lezioni imparate</span></div>
    <div class="tile"><b>${Q}</b><span>esercizi corretti</span></div>
    <div class="tile"><b>${Q ? Math.round((100 * OK) / Q) : 0}<small>%</small></b><span>risposte giuste</span></div>
    <div class="tile"><b>${fmtDur(P.time)}</b><span>di studio in ${days} giorn${days === 1 ? "o" : "i"}</span></div>
  </div>
  <section class="panel"><h3 class="serif">Esercizi al giorno (ultimi 21 giorni)</h3>${Q ? barChart(dd) : '<p class="muted">Il grafico apparirà dopo i primi esercizi.</p>'}</section>
  <section class="panel"><h3 class="serif">Esami di prova completi</h3>${lg.length ? lineChart(lg.slice(-12)) : '<p class="muted">Nessun esame completo per ora.</p>'}</section>
  <section class="panel"><h3 class="serif">Per tappa</h3><div class="breakdown">${CHS.map(c => { const d = chDone(c); const st = c.skills.map(k => P.sk[k.id]).filter(Boolean), n = st.reduce((a, s) => a + s.n, 0), ok = st.reduce((a, s) => a + s.ok, 0);
    return `<div class="brow"><span>${c.n}. ${c.short}${gateOK(c.n) ? " ✓" : ""}</span><div class="bb"><i style="width:${(d / c.skills.length) * 100}%"></i></div><em>${d}/${c.skills.length}</em><em class="acc">${n ? Math.round((100 * ok) / n) + " %" : "—"}</em></div>`; }).join("")}</div><p class="muted small">Barra: lezioni imparate. Percentuale: risposte giuste nella tappa.</p></section>
  ${weak.length ? `<section class="panel"><h3 class="serif">Dove sbagli di più</h3><ul class="rlist">${weak.map(w => `<li><span class="mi">${Math.round(w.r * 100)}%</span><span class="mt"><b>${w.k.title}</b><small>${P.sk[w.k.id].n} esercizi${w.lap ? " · da recuperare " + w.lap + " volt" + (w.lap > 1 ? "e" : "a") : ""}</small></span><button class="small-btn" data-k="${w.k.id}">Esercitati</button></li>`).join("")}</ul></section>` : ""}`);
  wireTips(app);
  app.querySelectorAll("[data-k]").forEach(b => b.onclick = () => skillView(b.dataset.k, "practice"));
}

/* =========================== DATA E SALVATAGGIO =========================== */
function settingsView() {
  stopTimers(); setBar("Data e salvataggio", home); VIEW = settingsView;
  go(`<header class="chead"><h2>Data e salvataggio</h2></header>
  <section class="panel"><h3 class="serif">Data dell'esame</h3><p class="muted">Serve a calcolare quante lezioni fare ogni giorno (gli ultimi 5 giorni restano liberi per gli esami di prova e il ripasso).</p>
    <div class="inrow"><input type="date" id="dateIn" value="${P.examDate || ""}" aria-label="Data dell'esame"><button class="btn" id="saveDate">Salva</button></div></section>
  <section class="panel"><h3 class="serif">Dove sono i miei progressi?</h3>
    <p>${Sync.state === "account" ? IC.cloud + " Salvati sul tuo account Claude: li ritrovi sul telefono e sul computer." : IC.phone + " Salvati su questo dispositivo (in questo browser). Tieni una copia con il codice qui sotto."}</p>
    <div class="actions left"><button class="btn ghost" id="copy">Copia il mio codice di salvataggio</button></div>
    <textarea id="code" class="code" rows="3" readonly hidden></textarea>
    <h4>Ripristinare un salvataggio</h4><textarea id="imp" class="code" rows="3" placeholder="Incolla qui il tuo codice di salvataggio"></textarea>
    <div class="actions left"><button class="btn ghost" id="doImp">Ripristina</button></div></section>
  <section class="panel"><h3 class="serif">Ricominciare da capo</h3><p class="muted">Cancella tutti i progressi (lezioni, esami, errori).</p><button class="btn danger" id="reset">Cancella tutto</button></section>`);
  $("#saveDate").onclick = () => { const v = $("#dateIn").value; P.examDate = v || null; save(); toast(v ? "Data salvata: " + fmtDate(v) : "Data cancellata"); home(); };
  $("#copy").onclick = () => {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(P)))); const ta = $("#code"); ta.value = code; ta.hidden = false;
    const fallback = () => { ta.focus(); ta.select(); toast("Codice selezionato: copialo (Ctrl+C oppure Copia)."); };
    try { navigator.clipboard.writeText(code).then(() => toast("Codice copiato. Tienilo nelle tue note."), fallback); } catch (e) { fallback(); }
  };
  $("#doImp").onclick = () => {
    let o; try { o = JSON.parse(decodeURIComponent(escape(atob($("#imp").value.trim())))); } catch (e) { toast("Codice illeggibile: controlla che sia completo."); return; }
    if (!o || typeof o !== "object" || !o.sk) { toast("Questo codice non contiene progressi."); return; }
    askConfirm("Sostituire i progressi attuali con quelli del codice?", "Sostituisci", () => { P = migrate(o); P.up = Date.now(); save(); toast("Progressi ripristinati."); home(); });
  };
  $("#reset").onclick = () => askConfirm("Cancellare tutti i progressi? Non si può tornare indietro.", "Cancella tutto", () => { const d = P.examDate; P = fresh(); P.examDate = d; save(); home(); });
}

/* =========================== COME FUNZIONA =========================== */
function guideView() {
  stopTimers(); setBar("Come funziona", home); VIEW = guideView;
  go(`<section class="panel lesson"><h3>Perché questo percorso funziona</h3>
  <p>Leggere una spiegazione dà l'impressione di aver capito. Quello che dimostra che sai davvero è <b>riuscire da solo</b>, più volte, esercizi che non hai mai visto. Tutto qui è costruito su questo.</p>
  <div class="box remember"><div class="bt">Le regole</div>
  <p><b>1. Si parte da zero.</b> Tappa 0 (le basi), poi 9 tappe di matematica, poi la Tappa 10 con il francese dell'esame.</p>
  <p><b>2. Lezione imparata = 4 esercizi giusti di fila, senza aiuto.</b> Gli esercizi cambiano ogni volta: non si possono imparare a memoria. I primi due sono più facili.</p>
  <p><b>3. Ripasso a intervalli.</b> Una lezione imparata torna dopo 1, 3, 7, 14, 30 e 60 giorni. È il ritmo che fissa le cose nella memoria.</p>
  <p><b>4. Nessuna lacuna nascosta.</b> Un errore nel ripasso, in una verifica o in un esame rimette la lezione « da recuperare » (2 giusti di fila per tornare a posto).</p>
  <p><b>5. Ogni tappa finisce con una verifica</b> (almeno 90 %). <b>Pronto</b> = i cinque punti della pagina « Sono pronto? » tutti verdi.</p></div>
  <div class="box method"><div class="bt">La tua giornata (45–90 minuti)</div><ol><li>Apri l'app e premi <b>« Continua »</b>. Fa sempre scegliere a lei.</li><li>Per una lezione nuova: leggi « Capire », guarda l'esempio passo passo, rifallo <b>sul quaderno</b>, poi fai gli esercizi.</li><li>Quando raggiungi l'obiettivo di oggi, puoi fermarti. Meglio un po' ogni giorno che tanto una volta sola.</li><li>Da metà percorso (Tappa 5): un esame di prova completo alla settimana.</li></ol></div>
  <div class="box warn"><div class="bt">Da evitare</div><p>Premere « Aiutami » o « Non lo so » troppo presto: prova prima sul quaderno, anche solo 2–3 minuti. Un errore seguito dalla correzione insegna più di dieci esercizi letti.</p></div>
  <div class="box idea"><div class="bt">Se una parte la sai già</div><p>Apri la tappa e fai subito la <b>verifica della tappa</b>: ogni risposta giusta conta come lezione imparata (tornerà nel ripasso dopo 2 giorni per controllare).</p></div>
  <div class="box idea"><div class="bt">E il francese?</div><p>L'esame è in francese, ma per imparare la matematica è meglio la tua lingua. La <b>Tappa 10</b> ti insegna tutte le parole e le frasi dell'esame, e ti fa fare esercizi scritti in francese. Gli esami a scelta multipla in francese sono l'ultimo allenamento.</p></div>
  ${HELP_HTML}
  <div class="actions"><span></span><button class="btn" id="hb">Torna alla home</button></div></section>`);
  $("#hb").onclick = home;
}

/* =========================== MATERIALE ORIGINALE (francese) =========================== */
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
    case "img": return IMGS[b.src] ? '<figure class="fig"><img src="' + IMGS[b.src] + '" alt="Figura del corso" loading="lazy"></figure>' : "";
    case "table": return '<div class="tw"><table>' + b.rows.map((r, i) => "<tr>" + r.map(c => (b.header && i === 0 ? "<th>" : "<td>") + cell(c) + (b.header && i === 0 ? "</th>" : "</td>")).join("") + "</tr>").join("") + "</table></div>";
    case "box": if (b.kind === "method") return '<div class="box method"><div class="bt">' + b.title + "</div><ol>" + b.steps.map(s => "<li>" + s + "</li>").join("") + "</ol></div>"; return '<div class="box ' + b.kind + '"><div class="bt">' + b.title + "</div>" + b.items.map(rItem).join("") + "</div>";
    case "guide": { const id = "g" + gid++; return '<div class="guide" id="' + id + '"><div class="gt">' + b.title + '</div><p class="hint">Prova prima sul quaderno, poi scopri i passi uno alla volta.</p>' + b.steps.map((s, i) => '<div class="gs"><span class="gn">Passo ' + (i + 1) + ".</span> " + s + "</div>").join("") + (b.note ? '<div class="note"><b>Da ricordare:</b> ' + b.note + "</div>" : "") + '<button class="small-btn" data-guide="' + id + '">Mostra il passo 1</button></div>'; }
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
    else btn.textContent = "Mostra il passo " + (g.querySelectorAll(".gs.show").length + 1);
  });
}
function libraryHome() {
  stopTimers(); setBar("Materiale originale", home); VIEW = libraryHome;
  const Ld = libData();
  go(`<header class="chead"><div class="where">Facoltativo · in francese</div><h2>Materiale originale del corso</h2><p>Qui trovi il corso completo originale, in francese, con il formulario. Non è necessario per seguire il percorso: serve per abituarti al francese dell'esame, soprattutto dopo la Tappa 10.</p></header>
  <div class="slist">${Ld.CHL.filter(c => c.n <= 8 || c.n === 10).map(c => `<button class="srow" data-c="${c.n}"><span class="sico">${c.n === 10 ? "F" : c.n + 1}</span><span class="stx"><b lang="fr">${c.title}</b><small>${c.n === 10 ? "Formulario e i 20 errori da evitare" : "Corrisponde alla Tappa " + (c.n + 1) + " · " + c.secs.length + " sezioni · " + c.exos.length + " esercizi corretti"}</small></span></button>`).join("")}</div>`);
  app.querySelectorAll("[data-c]").forEach(b => b.onclick = () => libChapter(+b.dataset.c));
}
function libChapter(n, backFn) {
  stopTimers(); const Ld = libData(), c = Ld.CHL.find(x => x.n === n); if (!c) return libraryHome();
  let sec = 0; const back = backFn || libraryHome;
  function draw() {
    VIEW = draw; setBar(n === 10 ? "Formulario" : "Materiale · Tappa " + (n + 1), back);
    const S0 = c.secs[sec], k = "l" + n + "-" + sec; P.read[k] = 1;
    go(`<header class="chead"><div class="where">In francese</div><h2 lang="fr">${c.title}</h2><p lang="fr">${c.sub}</p></header>
    <section class="panel lesson" lang="fr"><div class="toc">${c.secs.map((s, i) => `<button data-s="${i}" class="${P.read["l" + n + "-" + i] ? "read" : ""} ${i === sec ? "cur" : ""}" title="${esc(s.title.replace(/<[^>]+>/g, ""))}">${i + 1}</button>`).join("")}</div>
    <h3>${S0.title}</h3>${S0.blocks.map(rBlock).join("")}
    <div class="actions" lang="it">${sec > 0 ? '<button class="btn ghost" id="ps">Sezione precedente</button>' : "<span></span>"}${sec < c.secs.length - 1 ? '<button class="btn" id="ns">Sezione successiva</button>' : c.exos.length ? '<button class="btn" id="exs">Esercizi corretti</button>' : '<button class="btn" id="bk3">Fine</button>'}</div></section>`);
    wireGuides(app);
    app.querySelectorAll(".toc button").forEach(b => b.onclick = () => { sec = +b.dataset.s; draw(); });
    const p = $("#ps"); if (p) p.onclick = () => { sec--; draw(); };
    const nx = $("#ns"); if (nx) nx.onclick = () => { sec++; draw(); };
    const e = $("#exs"); if (e) e.onclick = exos;
    const b3 = $("#bk3"); if (b3) b3.onclick = back;
  }
  function exos() {
    VIEW = exos; const STARS = { 1: "★☆☆☆ facile", 2: "★★☆☆ medio", 3: "★★★☆ difficile", 4: "★★★★ livello esame" };
    go(`<header class="chead"><div class="where">In francese</div><h2>Esercizi corretti del corso</h2><p>Falli sul quaderno, poi apri la correzione.</p></header>
    <section class="panel">${c.exos.map((e, i) => `<article class="exo"><div class="eh"><b>Es. ${i + 1}</b><span class="lv">${STARS[e.lv]}</span></div><div class="stmt" lang="fr">${e.html}</div><details><summary>Vedi la correzione</summary><div lang="fr">${e.parts.map(rItem).join("")}</div></details></article>`).join("")}
    <div class="actions"><button class="btn ghost" id="bl">Torna al corso</button><button class="btn" id="bk4">Fine</button></div></section>`);
    app.querySelectorAll(".exo details").forEach(d => d.addEventListener("toggle", () => typeset(d), { once: true }));
    $("#bl").onclick = draw; $("#bk4").onclick = back;
  }
  draw(); save();
}

/* =========================== AVVIO =========================== */
home();
initSync();
