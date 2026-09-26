/* =====================================================================
   MOTEUR : hasard reproductible, fractions exactes, lecture des réponses,
   calcul complexe, vérification automatique des réponses.
   ===================================================================== */

/* ---------- hasard reproductible (une graine = une question) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = Math.random;
function seeded(seed, fn) { const old = rnd; rnd = mulberry32(seed); try { return fn(); } finally { rnd = old; } }
function newSeed() { return Math.floor(Math.random() * 2147483647) + 1; }
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const rnz = (a, b) => { let v; do v = ri(a, b); while (v === 0); return v; };
const pick = a => a[Math.floor(rnd() * a.length)];
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const coin = () => rnd() < 0.5;
const sg = () => (rnd() < 0.5 ? -1 : 1);

/* ---------- arithmétique exacte ---------- */
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }
class Q {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("division par zéro");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; this.n = n / g; this.d = d / g;
    if (Object.is(this.n, -0)) this.n = 0;
  }
  static of(x) { return x instanceof Q ? x : new Q(x, 1); }
  add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.of(o); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  abs() { return new Q(Math.abs(this.n), this.d); }
  inv() { return new Q(this.d, this.n); }
  eq(o) { o = Q.of(o); return this.n === o.n && this.d === o.d; }
  isInt() { return this.d === 1; }
  get v() { return this.n / this.d; }
  sign() { return Math.sign(this.n); }
  tex() { if (this.d === 1) return String(this.n); return (this.n < 0 ? "-" : "") + "\\frac{" + Math.abs(this.n) + "}{" + this.d + "}"; }
  str() { if (this.d === 1) return this.n < 0 ? "(" + this.n + ")" : String(this.n); return "(" + this.n + "/" + this.d + ")"; }
  plain() { return this.d === 1 ? String(this.n) : this.n + "/" + this.d; }
}
const q = (n, d) => new Q(n, d);
const Qv = x => Q.of(x);

/* ---------- aides d'écriture TeX ---------- */
function tx(x) { x = Qv(x); return x.tex(); }                         // nombre
function tp(x) { x = Qv(x); return x.n < 0 ? "\\left(" + x.tex() + "\\right)" : x.tex(); } // entre parenthèses si négatif
function st(x) { return Qv(x).str(); }                                // pour la chaîne attendue
function sgnTex(x) { x = Qv(x); return x.n < 0 ? " - " + x.abs().tex() : " + " + x.tex(); } // "+ 3" ou "- 3"
function mono(c, body, first) {
  c = Qv(c); if (c.n === 0) return "";
  const neg = c.n < 0, a = neg ? c.neg() : c;
  const t = body ? ((a.n === 1 && a.d === 1) ? body : a.tex() + body) : a.tex();
  if (first) return (neg ? "-" : "") + t;
  return (neg ? " - " : " + ") + t;
}
/* polynôme, coefficients du plus haut degré au plus bas */
function polyT(cs, v = "x") {
  const n = cs.length - 1; let out = "";
  cs.forEach((c, i) => { const d = n - i; const b = d === 0 ? "" : d === 1 ? v : v + "^{" + d + "}"; out += mono(c, b, out === ""); });
  return out || "0";
}
function polyS(cs, v = "x") {
  const n = cs.length - 1; const parts = [];
  cs.forEach((c, i) => { c = Qv(c); if (c.n === 0) return; const d = n - i; parts.push(st(c) + (d === 0 ? "" : d === 1 ? "*" + v : "*" + v + "^" + d)); });
  return parts.length ? parts.join("+") : "0";
}
/* entrée « comme un élève » : 3x^2-2x+5 */
function polyIn(cs, v = "x") {
  const n = cs.length - 1; let out = "";
  cs.forEach((c, i) => {
    c = Qv(c); if (c.n === 0) return; const d = n - i;
    const neg = c.n < 0, a = neg ? c.neg() : c;
    const coef = a.d === 1 ? (a.n === 1 && d > 0 ? "" : String(a.n)) : "(" + a.n + "/" + a.d + ")";
    const body = d === 0 ? "" : d === 1 ? v : v + "^" + d;
    out += (neg ? "-" : out === "" ? "" : "+") + coef + body;
  });
  return out || "0";
}
function pmul(A, B) { const r = Array(A.length + B.length - 1).fill(0).map(() => q(0)); A.forEach((a, i) => B.forEach((b, j) => { r[i + j] = r[i + j].add(Qv(a).mul(b)); })); return r; }
function padd(A, B) { const n = Math.max(A.length, B.length); const a = Array(n - A.length).fill(0).concat(A), b = Array(n - B.length).fill(0).concat(B); return a.map((x, i) => Qv(x).add(b[i])); }
function pscale(A, k) { return A.map(x => Qv(x).mul(k)); }
function ptrim(A) { let i = 0; while (i < A.length - 1 && Qv(A[i]).n === 0) i++; return A.slice(i); }
function pevalQ(A, x) { let r = q(0); A.forEach(c => { r = r.mul(x).add(c); }); return r; }
function pder(A) { const n = A.length - 1; return n === 0 ? [q(0)] : A.slice(0, -1).map((c, i) => Qv(c).mul(n - i)); }
function linT(a, b, v = "x") { return polyT([a, b], v); }
function linIn(a, b, v = "x") { return polyIn([a, b], v); }
function pr(t) { return "\\left(" + t + "\\right)"; }
function frac(a, b) { return "\\frac{" + a + "}{" + b + "}"; }
function M(t) { return "\\(" + t + "\\)"; }            // maths en ligne
function D(t) { return '<div class="m">\\[' + t + "\\]</div>"; } // maths centrées
function sqrtT(k, m) { // k√m simplifié en TeX
  if (m === 1) return tx(k);
  const kk = Qv(k); if (kk.eq(1)) return "\\sqrt{" + m + "}"; if (kk.eq(-1)) return "-\\sqrt{" + m + "}";
  return kk.tex() + "\\sqrt{" + m + "}";
}
function sqrtIn(k, m) { if (m === 1) return st(k); return st(k) + "*sqrt(" + m + ")"; }
function simplSqrt(n) { let k = 1, m = n; for (let f = 2; f * f <= m; f++) { while (m % (f * f) === 0) { m /= f * f; k *= f; } } return [k, m]; }
function isSquareFree(n) { for (let f = 2; f * f <= n; f++) if (n % (f * f) === 0) return false; return true; }

/* angles remarquables : fraction de π */
function piT(r) { // r = Q (multiple de π)
  r = Qv(r); if (r.n === 0) return "0";
  const s = r.n < 0 ? "-" : "", a = Math.abs(r.n), num = a === 1 ? "\\pi" : a + "\\pi";
  return r.d === 1 ? s + num : s + "\\frac{" + num + "}{" + r.d + "}";
}
function piIn(r) { r = Qv(r); if (r.n === 0) return "0"; return "(" + r.n + "*pi/" + r.d + ")"; }

/* ---------- lecture d'une réponse (analyse syntaxique) ---------- */
class PErr extends Error {}
const NAMES = ["racine", "sqrt", "exp", "sin", "cos", "tan", "ln", "log", "pi", "inf", "abs"];
const FUNCS = { sqrt: 1, racine: 1, exp: 1, sin: 1, cos: 1, tan: 1, ln: 1, log: 1, abs: 1 };
function normIn(s) {
  return String(s)
    .replace(/[−–—‒]/g, "-").replace(/[×·∙⋅✕]/g, "*").replace(/[÷:]/g, "/")
    .replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4")
    .replace(/π/g, "pi").replace(/∞/g, "inf").replace(/\u00a0/g, " ")
    .replace(/[{\[]/g, "(").replace(/[}\]]/g, ")");
}
function tokenize(s) {
  s = normIn(s); const toks = []; let i = 0;
  const dig = c => c >= "0" && c <= "9";
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (dig(c) || (c === "." && dig(s[i + 1] || ""))) {
      let j = i, str = "";
      while (j < s.length && (dig(s[j]) || ((s[j] === "." || s[j] === ",") && dig(s[j + 1] || "") && !str.includes(".")))) { str += s[j] === "," ? "." : s[j]; j++; }
      toks.push({ k: "num", v: parseFloat(str), s: str }); i = j; continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      let j = i; while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      let r = s.slice(i, j).toLowerCase();
      while (r.length) {
        const m = NAMES.find(n => r.startsWith(n));
        if (m) { toks.push(FUNCS[m] ? { k: "fn", v: m === "racine" ? "sqrt" : m } : { k: "id", v: m }); r = r.slice(m.length); }
        else { toks.push({ k: "id", v: r[0] }); r = r.slice(1); }
      }
      i = j; continue;
    }
    if (c === "√") { toks.push({ k: "fn", v: "sqrt", sq: 1 }); i++; continue; }
    if ("+-*/^()".includes(c)) { toks.push({ k: c }); i++; continue; }
    if (c === ",") throw new PErr("Virgule inattendue : sépare les valeurs par un point-virgule « ; ».");
    throw new PErr("Caractère non reconnu : « " + c + " »");
  }
  return toks;
}
function parse(str) {
  const t = tokenize(str); let p = 0;
  if (!t.length) throw new PErr("Réponse vide");
  const peek = () => t[p], next = () => t[p++];
  const startsAtom = k => k && (k.k === "num" || k.k === "id" || k.k === "fn" || k.k === "(");
  function closeP() { if (!peek() || peek().k !== ")") throw new PErr("Il manque une parenthèse fermante « ) »."); next(); }
  function expr() { let a = term(); while (peek() && (peek().k === "+" || peek().k === "-")) { const o = next().k; const b = term(); a = { t: o === "+" ? "add" : "sub", a, b }; } return a; }
  function term() {
    let a = unary();
    for (;;) {
      const k = peek();
      if (k && (k.k === "*" || k.k === "/")) { next(); const b = unary(); a = { t: k.k === "*" ? "mul" : "div", a, b }; }
      else if (startsAtom(k)) { const b = power(); a = { t: "mul", a, b, imp: 1 }; }
      else break;
    }
    return a;
  }
  function unary() { const k = peek(); if (k && k.k === "-") { next(); return { t: "neg", a: unary() }; } if (k && k.k === "+") { next(); return unary(); } return power(); }
  function power() {
    const base = atom();
    if (peek() && peek().k === "^") { next(); return { t: "pow", a: base, b: exponent(base) }; }
    return base;
  }
  function exponent(base) {
    let neg = false;
    while (peek() && (peek().k === "-" || peek().k === "+")) { if (next().k === "-") neg = !neg; }
    if (!peek()) throw new PErr("Exposant manquant après « ^ ».");
    const paren = peek().k === "(";
    let e = power();
    if (base.t === "const" && base.n === "e" && !paren) {
      while (peek() && (peek().k === "num" || peek().k === "id")) e = { t: "mul", a: e, b: power(), imp: 1 };
    }
    return neg ? { t: "neg", a: e } : e;
  }
  function atom() {
    const k = next();
    if (!k) throw new PErr("Expression incomplète.");
    if (k.k === "num") return { t: "num", v: k.v, s: k.s };
    if (k.k === "id") {
      if (k.v === "pi") return { t: "const", n: "pi" };
      if (k.v === "e") return { t: "const", n: "e" };
      if (k.v === "i" || k.v === "j") return { t: "const", n: "i", j: k.v === "j" };
      if (k.v === "inf") return { t: "const", n: "inf" };
      return { t: "var", n: k.v };
    }
    if (k.k === "(") { const a = expr(); closeP(); return { t: "par", a }; }
    if (k.k === "fn") {
      let arg;
      if (peek() && peek().k === "(") { next(); arg = expr(); closeP(); }
      else if (k.v === "sqrt") { if (!peek()) throw new PErr("Que faut-il mettre sous la racine ?"); arg = power(); }
      else {
        if (!peek()) throw new PErr("Il manque ce qui suit « " + k.v + " ».");
        let neg = false; if (peek().k === "-") { next(); neg = true; }
        arg = power();
        while (peek() && (peek().k === "num" || peek().k === "id")) arg = { t: "mul", a: arg, b: power(), imp: 1 };
        if (neg) arg = { t: "neg", a: arg };
      }
      return { t: "fn", n: k.v, a: arg };
    }
    if (k.k === ")") throw new PErr("Parenthèse fermante « ) » en trop.");
    throw new PErr("Symbole « " + k.k + " » mal placé.");
  }
  const r = expr();
  if (p < t.length) { const k = t[p]; throw new PErr(k.k === ")" ? "Parenthèse fermante « ) » en trop." : "Je ne comprends pas la fin de ta réponse (après « " + (t[p - 1] ? (t[p - 1].s || t[p - 1].v || t[p - 1].k) : "") + " »)."); }
  return r;
}

/* ---------- calcul complexe ---------- */
const C = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1]],
  mul: (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]],
  div: (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; if (d === 0) return [NaN, NaN]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; },
  exp: a => { const r = Math.exp(a[0]); return [r * Math.cos(a[1]), r * Math.sin(a[1])]; },
  log: a => [Math.log(Math.hypot(a[0], a[1])), Math.atan2(a[1], a[0])],
  abs: a => Math.hypot(a[0], a[1]),
  pow(a, b) {
    if (b[1] === 0 && Number.isInteger(b[0]) && Math.abs(b[0]) <= 200) {
      let n = Math.abs(b[0]), r = [1, 0], base = a;
      while (n) { if (n & 1) r = C.mul(r, base); base = C.mul(base, base); n >>= 1; }
      return b[0] < 0 ? C.div([1, 0], r) : r;
    }
    if (a[1] === 0 && a[0] > 0 && b[1] === 0) return [Math.pow(a[0], b[0]), 0];
    if (a[0] === 0 && a[1] === 0) return b[0] > 0 ? [0, 0] : [NaN, NaN];
    return C.exp(C.mul(b, C.log(a)));
  },
  sqrt(a) { if (a[1] === 0 && a[0] >= 0) return [Math.sqrt(a[0]), 0]; const r = Math.sqrt(C.abs(a)), th = Math.atan2(a[1], a[0]) / 2; return [r * Math.cos(th), r * Math.sin(th)]; },
  sin: a => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])],
  cos: a => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])],
};
function ev(n, env) {
  switch (n.t) {
    case "num": return [n.v, 0];
    case "const": return n.n === "pi" ? [Math.PI, 0] : n.n === "e" ? [Math.E, 0] : n.n === "i" ? [0, 1] : [Infinity, 0];
    case "var": if (!env || !(n.n in env)) throw new PErr("La lettre « " + n.n + " » n'est pas attendue ici."); return env[n.n];
    case "par": return ev(n.a, env);
    case "neg": { const a = ev(n.a, env); return [-a[0], -a[1]]; }
    case "add": return C.add(ev(n.a, env), ev(n.b, env));
    case "sub": return C.sub(ev(n.a, env), ev(n.b, env));
    case "mul": return C.mul(ev(n.a, env), ev(n.b, env));
    case "div": return C.div(ev(n.a, env), ev(n.b, env));
    case "pow": { const b = ev(n.b, env); if (n.a.t === "const" && n.a.n === "e") return C.exp(b); return C.pow(ev(n.a, env), b); }
    case "fn": {
      const a = ev(n.a, env);
      switch (n.n) {
        case "sqrt": return C.sqrt(a);
        case "ln": return (a[0] === 0 && a[1] === 0) ? [NaN, NaN] : C.log(a);
        case "log": return C.div(C.log(a), [Math.LN10, 0]);
        case "exp": return C.exp(a);
        case "sin": return C.sin(a);
        case "cos": return C.cos(a);
        case "tan": return C.div(C.sin(a), C.cos(a));
        case "abs": return [C.abs(a), 0];
      }
    }
  }
  throw new PErr("Expression non reconnue.");
}
const finite = z => isFinite(z[0]) && isFinite(z[1]);
function close(a, b, tol = 1e-8) { const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const s = Math.max(1, Math.hypot(a[0], a[1]), Math.hypot(b[0], b[1])); return d <= tol * s; }
function varsOf(n, out = new Set()) { if (!n || typeof n !== "object") return out; if (n.t === "var") out.add(n.n); ["a", "b"].forEach(k => n[k] && varsOf(n[k], out)); return out; }
function hasNode(n, pred) { if (!n || typeof n !== "object") return false; if (pred(n)) return true; return hasNode(n.a, pred) || hasNode(n.b, pred); }
function isConstNode(n) { return !hasNode(n, x => x.t === "var"); }
function strip(n) { while (n && n.t === "par") n = n.a; return n; }
function constVal(n) { try { return ev(n, {}); } catch (e) { return [NaN, NaN]; } }

/* ---------- affichage TeX de ce que l'élève a écrit ---------- */
function numTex(n) { const s = n.s || String(n.v); return s.replace(".", "{,}"); }
function toTex(n) {
  const needPar = x => ["add", "sub"].includes(x.t);
  const wrap = x => (x.t === "par" ? toTex(x) : "\\left(" + toTex(x) + "\\right)");
  switch (n.t) {
    case "num": return numTex(n);
    case "const": return n.n === "pi" ? "\\pi" : n.n === "e" ? "e" : n.n === "i" ? (n.j ? "j" : "i") : "\\infty";
    case "var": return n.n;
    case "par": return "\\left(" + toTex(n.a) + "\\right)";
    case "neg": return "-" + (needPar(n.a) ? wrap(n.a) : toTex(n.a));
    case "add": return toTex(n.a) + "+" + toTex(n.b);
    case "sub": return toTex(n.a) + "-" + (needPar(n.b) || n.b.t === "neg" ? wrap(n.b) : toTex(n.b));
    case "mul": {
      const l = needPar(n.a) ? wrap(n.a) : toTex(n.a);
      const r = needPar(n.b) || n.b.t === "neg" ? wrap(n.b) : toTex(n.b);
      const bn = strip(n.b), an = n.a;
      const dot = !n.imp || bn.t === "num" || (n.b.t === "pow" && strip(n.b.a).t === "num") || (an.t === "num" && bn.t === "num");
      return l + (dot ? " \\times " : "\\,") + r;
    }
    case "div": return "\\frac{" + toTex(strip(n.a)) + "}{" + toTex(strip(n.b)) + "}";
    case "pow": {
      const a = n.a; let base;
      if (a.t === "num" || a.t === "var" || a.t === "const" || a.t === "par") base = toTex(a); else base = wrap(a);
      return "{" + base + "}^{" + toTex(strip(n.b)) + "}";
    }
    case "fn": {
      const inner = toTex(strip(n.a));
      if (n.n === "sqrt") return "\\sqrt{" + inner + "}";
      if (n.n === "exp") return "e^{" + inner + "}";
      if (n.n === "abs") return "\\left|" + inner + "\\right|";
      return "\\" + (n.n === "log" ? "log" : n.n) + "\\left(" + inner + "\\right)";
    }
  }
  return "?";
}

/* ---------- formes imposées ---------- */
function numLit(n) { const s = strip(n); if (s.t === "num" && Number.isInteger(s.v)) return s.v; if (s.t === "neg") { const v = numLit(s.a); return v === null ? null : -v; } return null; }
function asFrac(n) { // entier ou ±entier/entier
  n = strip(n);
  if (n.t === "neg") { const r = asFrac(n.a); return r ? (r.dec ? r : { n: -r.n, d: r.d, lit: r.lit }) : null; }
  if (n.t === "num") return Number.isInteger(n.v) ? { n: n.v, d: 1, lit: 1 } : { dec: true };
  if (n.t === "div") { const a = numLit(n.a), b = numLit(n.b); if (a !== null && b !== null) return { n: a, d: b }; }
  return null;
}
function monoDeg(n, v) { // degré si monôme en v (coefficient constant), sinon null
  switch (n.t) {
    case "num": return 0;
    case "const": return n.n === "i" ? null : 0;
    case "par": return isConstNode(n.a) ? 0 : null;
    case "var": return n.n === v ? 1 : null;
    case "pow": {
      if (isConstNode(n)) return 0;
      const a = strip(n.a); const e = numLit(n.b);
      if (a.t === "var" && a.n === v && e !== null) return e;
      return null;
    }
    case "neg": return monoDeg(n.a, v);
    case "mul": { const a = monoDeg(n.a, v), b = monoDeg(n.b, v); return a === null || b === null ? null : a + b; }
    case "div": { if (!isConstNode(n.b)) { const a = monoDeg(n.a, v), b = monoDeg(n.b, v); if (a !== null && b !== null && strip(n.b).t !== "par") return a - b; return null; } return monoDeg(n.a, v); }
    case "fn": return isConstNode(n) ? 0 : null;
  }
  return null;
}
function sumTerms(n, out = []) {
  n = strip(n);
  if (n.t === "add" || n.t === "sub") { sumTerms(n.a, out); sumTerms(n.b, out); }
  else if (n.t === "neg" && ["add", "sub", "par"].includes(n.a.t)) out.push({ t: "bad" });
  else out.push(n);
  return out;
}
function isExpanded(n, v = "x") {
  const ts = sumTerms(n); const ds = ts.map(t => (t.t === "bad" ? null : monoDeg(t, v)));
  if (ds.some(d => d === null)) return false;
  return new Set(ds).size === ds.length;
}
function flatFactors(n, out = []) {
  n = strip(n);
  if (n.t === "mul") { flatFactors(n.a, out); flatFactors(n.b, out); }
  else if (n.t === "neg") flatFactors(n.a, out);
  else if (n.t === "div" && isConstNode(n.b)) flatFactors(n.a, out);
  else out.push(n);
  return out;
}
function polyDegree(n, v = "x") { // degré (≤ 6) d'une expression polynomiale, sinon null
  const f = x => { try { return ev(n, { [v]: [x, 0] })[0]; } catch (e) { return NaN; } };
  const ys = [0, 1, 2, 3, 4, 5, 6, 7].map(x => f(x * 0.7 - 1.3));
  if (ys.some(y => !isFinite(y))) return null;
  let d = ys.slice();
  for (let k = 0; k < 7; k++) {
    if (d.every(y => Math.abs(y) < 1e-7 * (1 + Math.abs(ys[0])))) return k === 0 ? -1 : k - 1;
    d = d.slice(1).map((y, i) => y - d[i]);
  }
  return null;
}
function isFactored(n, v = "x", maxDeg = 1) {
  const fs = flatFactors(n).filter(f => !isConstNode(f));
  let count = 0;
  for (const f0 of fs) {
    let f = strip(f0), mult = 1;
    if (f.t === "pow") { const e = numLit(f.b); if (e === null || e < 1) return false; mult = e; f = strip(f.a); }
    if (f.t === "mul" || f.t === "neg") return false;
    const d = polyDegree(f, v);
    if (d === null || d < 1 || d > maxDeg) return false;
    count += mult;
  }
  const hasK = flatFactors(n).filter(isConstNode).some(f => { const v = constVal(f); return finite(v) && Math.abs(Math.abs(v[0]) - 1) > 1e-9; });
  return count >= 2 || (count === 1 && hasK);
}
function isOneFrac(n) {
  n = strip(n); if (n.t === "neg") n = strip(n.a);
  if (n.t !== "div") return false;
  const nested = x => hasNode(x, y => y.t === "div" && !isConstNode(y.b));
  return !nested(n.a) && !nested(n.b);
}
function isSqrtSimplified(n) {
  return !hasNode(n, x => x.t === "fn" && x.n === "sqrt" && (() => { const a = strip(x.a); if (a.t !== "num" || !Number.isInteger(a.v)) return false; return a.v > 1 && !isSquareFree(a.v); })())
    && !hasNode(n, x => x.t === "fn" && x.n === "sqrt" && (() => { const a = strip(x.a); return a.t === "num" && (a.v === 0 || a.v === 1 || a.v === 4 || a.v === 9); })());
}
function noSqrtInDen(n) { return !hasNode(n, x => x.t === "div" && hasNode(x.b, y => y.t === "fn" && y.n === "sqrt")); }
function hasI(n) { return hasNode(n, x => x.t === "const" && x.n === "i"); }
function isRealConst(n) { return isConstNode(n) && !hasI(n) && !hasNode(n, x => x.t === "fn" && ["sin", "cos", "tan", "ln", "exp", "log"].includes(x.n)); }
function isImagTerm(t) {
  t = strip(t);
  if (t.t === "const" && t.n === "i") return true;
  if (t.t === "neg") return isImagTerm(t.a);
  if (t.t === "mul") return (isRealConst(t.a) && isImagTerm(t.b)) || (isImagTerm(t.a) && isRealConst(t.b));
  if (t.t === "div") return isImagTerm(t.a) && isRealConst(t.b);
  return false;
}
function isAlgebraic(n) {
  const r0 = strip(n); if (r0.t === "div" && isRealConst(r0.b) && !hasI(r0.b)) return isAlgebraic(r0.a);
  const ts = sumTerms(n); let re = 0, im = 0;
  for (const t of ts) { if (t.t === "bad") return false; if (!hasI(t)) { if (!isRealConst(t)) return false; re++; } else if (isImagTerm(t)) im++; else return false; }
  return re <= 1 && im <= 1;
}
function expPart(n) { // e^(X) ou exp(X)
  n = strip(n);
  if (n.t === "pow" && strip(n.a).t === "const" && strip(n.a).n === "e") return n.b;
  if (n.t === "fn" && n.n === "exp") return n.a;
  return null;
}
function isExpForm(n) {
  n = strip(n); let r = [1, 0], X = expPart(n);
  if (!X && (n.t === "mul" || n.t === "div")) {
    const A = strip(n.a), B = strip(n.b);
    if (n.t === "mul" && expPart(B) && isRealConst(A)) { r = constVal(A); X = expPart(B); }
    else if (n.t === "mul" && expPart(A) && isRealConst(B)) { r = constVal(B); X = expPart(A); }
  }
  if (!X || !isConstNode(X)) return false;
  const xv = constVal(X); if (!finite(xv) || Math.abs(xv[0]) > 1e-9) return false;
  return r[0] > 0;
}
function isSingleExp(n) { n = strip(n); if (expPart(n)) return true; return false; }
function literals(n, out = []) { if (!n || typeof n !== "object") return out; if (n.t === "num") out.push(n.v); literals(n.a, out); literals(n.b, out); return out; }
function isPiReduced(n, val) { // k·π/d avec k/d irréductible
  if (!hasNode(n, x => x.t === "const" && x.n === "pi")) return Math.abs(val) < 1e-12 && literals(n).every(v => v === 0);
  const r = val / Math.PI; let best = null;
  for (let d = 1; d <= 24; d++) { const k = Math.round(r * d); if (Math.abs(k / d - r) < 1e-9) { best = [k, d]; break; } }
  if (!best) return true;
  const ok = new Set([Math.abs(best[0]), best[1], 1]);
  let pis = 0; hasNode(n, x => { if (x.t === "const" && x.n === "pi") pis++; return false; });
  return pis === 1 && literals(n).every(v => ok.has(Math.abs(v))) && !hasNode(n, x => x.t === "fn");
}
function allowedNodes(n, allow) {
  const A = new Set(allow || []);
  let bad = null;
  hasNode(n, x => {
    if (x.t === "fn") {
      if (x.n === "sqrt" && !A.has("sqrt")) bad = "Donne un nombre sans racine carrée : calcule-la.";
      else if (["sin", "cos", "tan"].includes(x.n) && !A.has("trig")) bad = "Calcule la valeur exacte : pas de cos, sin ou tan dans la réponse.";
      else if ((x.n === "ln" || x.n === "log") && !A.has("ln")) bad = "La réponse ne doit pas contenir ln : calcule la valeur.";
      else if (x.n === "exp" && !A.has("e")) bad = "La réponse ne doit pas contenir d'exponentielle.";
      else if (x.n === "abs") bad = "Pas de valeur absolue dans la réponse.";
    }
    if (x.t === "const") {
      if (x.n === "pi" && !A.has("pi")) bad = "La réponse ne devrait pas contenir π.";
      if (x.n === "e" && !A.has("e")) bad = "La réponse ne devrait pas contenir e.";
      if (x.n === "i" && !A.has("i")) bad = "La réponse est un nombre réel : pas de i.";
      if (x.n === "inf") bad = "∞ n'est pas un nombre ici.";
    }
    return false;
  });
  return bad;
}

/* ---------- vérification ---------- */
const FORM_MSG = {
  rat: "Simplifie : donne un entier, une fraction irréductible (ou un décimal exact).",
  irr: "Donne une fraction irréductible (ou un entier).",
  expanded: "Ce n'est pas « développé et réduit » : il reste des parenthèses ou des termes à regrouper.",
  factored: "Ce n'est pas factorisé : écris un produit de facteurs du premier degré.",
  factored2: "Ce n'est pas factorisé : écris un produit de facteurs.",
  oneFrac: "Écris le résultat sous la forme d'une seule fraction.",
  sqrt: "Simplifie la racine : il reste un carré parfait sous le radical (√72 = 6√2).",
  noSqrtDen: "Il reste une racine au dénominateur : multiplie par la quantité conjuguée.",
  algebraic: "Donne la forme algébrique a + bi (i ne doit plus être au dénominateur, et tout doit être développé).",
  expform: "Donne la forme exponentielle r·e^(iθ) avec r > 0.",
  singleExp: "Écris le résultat sous la forme d'une seule exponentielle e^(…).",
  pi: "Simplifie la fraction de π (par exemple 5π/6, pas 150π/180).",
  mono: "Écris le résultat comme un seul terme : un nombre fois une puissance de x.",
  sci: "Écris en notation scientifique : a × 10^n avec 1 ≤ a < 10.",
  trigx: "Réponds avec cos(x) ou sin(x), éventuellement précédé d'un signe −.",
};
function checkForm(ast, forms, val, v) {
  for (const f of forms || []) {
    let ok = true;
    if (f === "rat") { const r = asFrac(ast); ok = !!r && (r.dec || (r.d > 0 && gcd(r.n, r.d) === 1 && (r.d !== 1 || r.lit))); }
    else if (f === "irr") { const r = asFrac(ast); ok = !!r && !r.dec && r.d > 0 && gcd(r.n, r.d) === 1 && (r.d !== 1 || r.lit); }
    else if (f === "expanded") ok = isExpanded(ast, v);
    else if (f === "factored") ok = isFactored(ast, v, 1);
    else if (f === "factored2") ok = isFactored(ast, v, 2);
    else if (f === "oneFrac") ok = isOneFrac(ast);
    else if (f === "sqrt") ok = isSqrtSimplified(ast);
    else if (f === "noSqrtDen") ok = noSqrtInDen(ast);
    else if (f === "algebraic") ok = isAlgebraic(ast);
    else if (f === "expform") ok = isExpForm(ast);
    else if (f === "singleExp") ok = isSingleExp(ast);
    else if (f === "pi") ok = isPiReduced(ast, val ? val[0] : 0);
    else if (f === "mono") { const ts = sumTerms(ast); ok = ts.length === 1 && ts[0].t !== "bad" && monoDeg(ts[0], v) !== null; }
    else if (f === "sci") {
      let n = strip(ast); if (n.t === "neg") n = strip(n.a);
      let mant = [1, 0], p = null;
      const isP10 = x => { x = strip(x); return x.t === "pow" && strip(x.a).t === "num" && strip(x.a).v === 10 && numLit(x.b) !== null; };
      if (isP10(n)) p = n; else if (n.t === "mul" && isP10(n.b) && isRealConst(n.a) && !hasNode(n.a, y => y.t === "pow")) { p = n.b; mant = constVal(n.a); }
      else if (n.t === "num") { mant = [n.v, 0]; p = { t: "num", v: 1 }; }
      ok = !!p && Math.abs(mant[0]) >= 1 - 1e-12 && Math.abs(mant[0]) < 10;
      if (n.t === "num") ok = ok && Math.abs(n.v) < 10 && Math.abs(n.v) >= 1;
    }
    else if (f === "trigx") { let n = strip(ast); if (n.t === "neg") n = strip(n.a); ok = n.t === "fn" && (n.n === "cos" || n.n === "sin") && strip(n.a).t === "var"; }
    else if (f.startsWith("lnarg:")) { const a = +f.slice(6); ok = !hasNode(ast, x => x.t === "fn" && (x.n !== "ln" || numLit(x.a) !== a)); }
    if (!ok) return FORM_MSG[f.startsWith("lnarg:") ? "lnarg" : f] || "Présente ta réponse sous la forme demandée (simplifiée).";
  }
  return null;
}
FORM_MSG.lnarg = "Exprime le résultat avec un seul logarithme, celui demandé (par exemple 3 ln 2).";

function sampleEnv(vars, dom) {
  const env = {};
  vars.forEach(v => { const d = (dom && (dom[v] || (Array.isArray(dom) ? dom : null))) || [-2.7, 3.1]; env[v] = [d[0] + Math.random() * (d[1] - d[0]), 0]; });
  return env;
}
/* compare deux expressions ; mode "prim" : égales à une constante près ; mode "prop" : proportionnelles */
function sameExpr(ua, ea, vars, dom, mode) {
  let good = 0, tries = 0, first = null, ratio = null;
  while (good < 7 && tries < 80) {
    tries++;
    const env = sampleEnv(vars, dom);
    let e; try { e = ev(ea, env); } catch (x) { continue; }
    if (!finite(e)) continue;
    let u; try { u = ev(ua, env); } catch (x) { return false; }
    if (!finite(u)) return false;
    if (mode === "prim") { const d = C.sub(u, e); if (!first) first = d; else if (!close(d, first, 1e-6)) return false; }
    else if (mode === "prop") {
      if (Math.hypot(e[0], e[1]) < 1e-9) { if (Math.hypot(u[0], u[1]) > 1e-7) return false; }
      else { const r = C.div(u, e); if (!ratio) { ratio = r; if (C.abs(r) < 1e-9) return false; } else if (!close(r, ratio, 1e-7)) return false; }
    }
    else if (!close(u, e, 1e-7)) return false;
    good++;
  }
  return good >= 3;
}

function unwrap(s) { // enlève une paire de { } ( ) [ ] qui entoure TOUTE la liste
  s = s.trim(); const o = s[0], c = s[s.length - 1];
  if (!((o === "{" && c === "}") || (o === "(" && c === ")") || (o === "[" && c === "]"))) return s;
  let d = 0; for (let i = 0; i < s.length; i++) { const ch = s[i]; if ("{([".includes(ch)) d++; else if ("})]".includes(ch)) d--; if (d === 0 && i < s.length - 1) return s; }
  return s.slice(1, -1).trim();
}
/* découpe d'une liste de valeurs : 2 ; -3   ou   x = 2 ou x = -3 */
const EMPTY_RE = /^\s*(s\s*=\s*)?(∅|ø|\{\s*\}|vide|aucune?( solution)?|pas de solution|rien|impossible|0 solution)\s*$/i;
function splitList(s) {
  s = String(s).trim().replace(/^[sS]\s*=\s*/, "").trim();
  if (EMPTY_RE.test(s)) return [];
  s = unwrap(s);
  let parts;
  if (/;|\bou\b|\bet\b/i.test(s)) parts = s.split(/;|\bou\b|\bet\b/i);
  else {
    parts = []; let cur = "";
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "," && !(/\d/.test(s[i - 1] || "") && /\d/.test(s[i + 1] || ""))) { parts.push(cur); cur = ""; } else cur += c;
    }
    parts.push(cur);
  }
  return parts.map(p => p.trim().replace(/^[a-z]\w*\s*=\s*/i, "").trim()).filter(p => p.length);
}

/* intervalles */
const INF_RE = /^\s*(\+|-|−)?\s*(inf|infini|∞)\s*$/i;
function parseBound(s) {
  const m = INF_RE.exec(s); if (m) return (m[1] === "-" || m[1] === "−") ? -Infinity : Infinity;
  const v = constVal(parse(s)); if (!finite(v) || Math.abs(v[1]) > 1e-12) throw new PErr("Borne non reconnue : « " + s.trim() + " »");
  return v[0];
}
function parseIntervals(s) {
  s = String(s).trim().replace(/−/g, "-").replace(/\s+/g, " ");
  if (EMPTY_RE.test(s)) return [];
  const pieces = s.split(/∪| U | u |\bU\b|\bou\b/).map(x => x.trim()).filter(Boolean);
  let out = [];
  for (let pc of pieces) {
    pc = pc.replace(/^x\s*∈\s*/i, "").trim();
    let m;
    if (/^(ℝ|R|IR)$/i.test(pc)) { out.push({ lo: -Infinity, hi: Infinity, lc: false, rc: false }); continue; }
    if ((m = /^(?:ℝ|R|IR)\s*(?:\\|-|−|privé de)\s*\{(.+)\}$/i.exec(pc))) {
      const pts = splitList(m[1]).map(parseBound).sort((a, b) => a - b); let lo = -Infinity;
      pts.forEach(p => { out.push({ lo, hi: p, lc: false, rc: false }); lo = p; }); out.push({ lo, hi: Infinity, lc: false, rc: false }); continue;
    }
    if ((m = /^\{(.+)\}$/.exec(pc))) { splitList(m[1]).map(parseBound).forEach(p => out.push({ lo: p, hi: p, lc: true, rc: true })); continue; }
    const L = pc[0], R = pc[pc.length - 1];
    if (!"[]".includes(L) || !"[]".includes(R)) throw new PErr("Écris un intervalle avec des crochets, par exemple ]-2 ; 5].");
    const mid = pc.slice(1, -1);
    let bits = mid.split(";");
    if (bits.length !== 2) {
      const cm = []; for (let i = 0; i < mid.length; i++) if (mid[i] === "," && !(/\d/.test(mid[i - 1] || "") && /\d/.test(mid[i + 1] || ""))) cm.push(i);
      if (cm.length === 1) bits = [mid.slice(0, cm[0]), mid.slice(cm[0] + 1)];
      else throw new PErr("Sépare les deux bornes par « ; », par exemple [1 ; 4[.");
    }
    const lo = parseBound(bits[0]), hi = parseBound(bits[1]);
    const lc = L === "[", rc = R === "]";
    if ((lo === -Infinity && lc) || (hi === Infinity && rc)) throw new PErr("Du côté de l'infini, le crochet est toujours ouvert : ]-∞ … ou … +∞[.");
    if (lo > hi) throw new PErr("La petite borne s'écrit à gauche.");
    out.push({ lo, hi, lc, rc });
  }
  out.sort((a, b) => a.lo - b.lo || (b.lc - a.lc));
  const merged = [];
  for (const iv of out) {
    const last = merged[merged.length - 1];
    if (last && (iv.lo < last.hi - 1e-12 || (Math.abs(iv.lo - last.hi) < 1e-12 && (last.rc || iv.lc)))) {
      if (iv.hi > last.hi + 1e-12) { last.hi = iv.hi; last.rc = iv.rc; } else if (Math.abs(iv.hi - last.hi) < 1e-12) last.rc = last.rc || iv.rc;
    } else merged.push(Object.assign({}, iv));
  }
  return merged;
}
const feq = (a, b) => (a === b) || (isFinite(a) && isFinite(b) && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)));
function sameIntervals(A, B, loose) {
  if (A.length !== B.length) return false;
  return A.every((a, i) => { const b = B[i]; return feq(a.lo, b.lo) && feq(a.hi, b.hi) && (loose || ((a.lc === b.lc || !isFinite(a.lo)) && (a.rc === b.rc || !isFinite(a.hi)))); });
}
function ivTex(A) {
  if (!A.length) return "\\varnothing";
  const b = x => (x === Infinity ? "+\\infty" : x === -Infinity ? "-\\infty" : fracTex(x));
  return A.map(a => (a.lo === a.hi ? "\\{" + b(a.lo) + "\\}" : (a.lc ? "[" : "]") + b(a.lo) + "\\,;\\," + b(a.hi) + (a.rc ? "]" : "["))).join(" \\cup ");
}
function fracTex(x) { // 0.5 → \frac12 si c'est une fraction simple
  if (Number.isInteger(Math.round(x * 1e9) / 1e9)) return String(Math.round(x));
  for (let d = 2; d <= 12; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return (n < 0 ? "-" : "") + "\\frac{" + Math.abs(n) + "}{" + d + "}"; }
  return fmtNum(x);
}
function fmtNum(x) { const r = Math.round(x * 1e6) / 1e6; return String(r).replace(".", "{,}").replace("-", "-"); }

/* limites */
function parseLim(s) {
  s = String(s).trim();
  if (/^(\+\s*)?(inf|infini|∞|\+∞)$/i.test(s)) return Infinity;
  if (/^(-|−)\s*(inf|infini|∞)$/i.test(s)) return -Infinity;
  return null;
}

/* Vérifie une réponse. Renvoie {s:"ok"|"ko"|"bad", m:message} */
function checkAnswer(Qn, input) {
  try {
    if (Qn.type === "choice") return input === Qn.a ? { s: "ok" } : { s: "ko", m: (Qn.why && Qn.why[input]) || "" };
    let raw = String(input || "").trim();
    if (!raw) return { s: "bad", m: "Écris ta réponse d'abord." };
    if ((Qn.type === "num" || Qn.type === "lim") && /^[a-zA-Z'()θ\s]{1,8}=/.test(raw)) raw = raw.slice(raw.indexOf("=") + 1).trim();
    const allow = Qn.allow || ["sqrt", "pi"];
    const vars = Qn.vars || ["x"];
    const traps = Qn.traps || [];
    const trapMsg = (fn) => { for (const t of traps) { try { if (fn(t.ans)) return t.m; } catch (e) {} } return null; };

    if (Qn.type === "num" || Qn.type === "lim") {
      let target, u;
      if (Qn.type === "lim") {
        const E = parseLim(Qn.ans); const U = parseLim(raw);
        if (E !== null || U !== null) {
          if (E !== null && U !== null) return E === U ? { s: "ok" } : { s: "ko", m: "Attention au signe de l'infini." };
          if (U !== null) return { s: "ko", m: trapMsg(t => parseLim(t) === U) || "La limite est un nombre fini ici." };
          if (/^\s*(inf|∞)/i.test(raw)) return { s: "bad", m: "Précise +∞ ou -∞." };
          const ua = parse(raw); const uv = constVal(ua); if (!finite(uv)) return { s: "bad", m: "Je ne sais pas lire ce nombre." };
          return { s: "ko", m: trapMsg(t => parseLim(t) === null && close(uv, constVal(parse(t)))) || "La limite est infinie ici." };
        }
      }
      const ua = parse(raw);
      if (varsOf(ua).size) return { s: "bad", m: "La réponse est un nombre : pas de lettre « " + [...varsOf(ua)][0] + " »." };
      u = constVal(ua);
      if (!finite(u)) return { s: "bad", m: "Ce calcul n'a pas de sens (division par zéro ?)." };
      target = constVal(parse(Qn.ans));
      if (close(u, target, 1e-9)) {
        const bad = allowedNodes(ua, allow) || checkForm(ua, Qn.form, u, vars[0]);
        return bad ? { s: "ko", m: bad, form: 1 } : { s: "ok" };
      }
      const tm = trapMsg(t => close(u, constVal(parse(t)), 1e-9)); if (tm) return { s: "ko", m: tm };
      if (/\d[.,]\d/.test(raw) && close(u, target, 2e-3)) return { s: "ko", m: "C'est une valeur approchée : il faut la valeur exacte (fraction, racine, π…)." };
      if (close(u, [-target[0], -target[1]], 1e-9)) return { s: "ko", m: "Presque : c'est une erreur de signe." };
      return { s: "ko" };
    }

    if (Qn.type === "expr") {
      let s = raw.replace(/\+\s*(c|k|cte)\s*$/i, "");
      if (Qn.lhs) { const i = s.indexOf("="); if (i >= 0) s = s.slice(i + 1); }
      const ua = parse(s);
      for (const v of varsOf(ua)) if (!vars.includes(v)) return { s: "bad", m: "La lettre « " + v + " » n'est pas attendue ici (variable : " + vars.join(", ") + ")." };
      const ea = parse(Qn.ans);
      const mode = Qn.prim ? "prim" : null;
      if (sameExpr(ua, ea, vars, Qn.dom, mode)) {
        if (Qn.defined) for (const x of Qn.defined) { try { const r = ev(ua, { [vars[0]]: [x, 0] }); if (!finite(r)) return { s: "ko", m: "Tu n'as pas simplifié par le facteur commun : ton expression n'est pas définie en " + fmtNum(x).replace("{,}", ",") + ".", form: 1 }; } catch (e) {} }
        const bad = allowedNodes(ua, allow.concat(["trig", "ln", "e"]).filter(a => !(Qn.deny || []).includes(a))) || checkForm(ua, Qn.form, null, vars[0]);
        return bad ? { s: "ko", m: bad, form: 1 } : { s: "ok" };
      }
      const tm = trapMsg(t => sameExpr(ua, parse(t), vars, Qn.dom, mode)); if (tm) return { s: "ko", m: tm };
      if (Qn.prim && Qn.deriv && sameExpr(ua, parse(Qn.deriv), vars, Qn.dom)) return { s: "ko", m: "Tu as dérivé au lieu de chercher une primitive." };
      if (!Qn.prim && sameExpr(ua, parse(Qn.ans), vars, Qn.dom, "prop")) return { s: "ko", m: "Tu y es presque : il y a une erreur de facteur (coefficient ou signe)." };
      return { s: "ko" };
    }

    if (Qn.type === "set" || Qn.type === "tuple") {
      const parts = splitList(raw);
      const exp = Qn.ans.map(a => constVal(parse(a)));
      let vals = [];
      for (const p of parts) {
        const a = parse(p);
        if (varsOf(a).size) return { s: "bad", m: "Écris seulement les valeurs, séparées par « ; » (par exemple : 2 ; -3)." };
        const v = constVal(a); if (!finite(v)) return { s: "bad", m: "Une des valeurs n'a pas de sens : « " + p + " »." };
        const bad = allowedNodes(a, allow) || checkForm(a, Qn.form, v, vars[0]);
        vals.push({ v, bad });
      }
      if (Qn.type === "tuple") {
        if (vals.length !== exp.length) return { s: "bad", m: "Il faut " + exp.length + " coordonnées, séparées par « ; »." };
        const ok = vals.every((x, i) => close(x.v, exp[i], 1e-9));
        if (ok) { const b = vals.find(x => x.bad); return b ? { s: "ko", m: b.bad, form: 1 } : { s: "ok" }; }
        const tm = trapMsg(t => t.length === vals.length && t.every((a, i) => close(vals[i].v, constVal(parse(a)), 1e-9))); if (tm) return { s: "ko", m: tm };
        const wrong = vals.map((x, i) => close(x.v, exp[i], 1e-9) ? null : i + 1).filter(Boolean);
        return { s: "ko", m: wrong.length < vals.length ? "Coordonnée" + (wrong.length > 1 ? "s" : "") + " fausse" + (wrong.length > 1 ? "s" : "") + " : n° " + wrong.join(", ") + "." : "" };
      }
      const uniq = []; vals.forEach(x => { if (!uniq.some(y => close(y.v, x.v, 1e-9))) uniq.push(x); });
      const expU = []; exp.forEach(x => { if (!expU.some(y => close(y, x, 1e-9))) expU.push(x); });
      const inExp = uniq.filter(x => expU.some(e => close(e, x.v, 1e-9)));
      if (inExp.length === uniq.length && uniq.length === expU.length) {
        const b = uniq.find(x => x.bad); return b ? { s: "ko", m: b.bad, form: 1 } : { s: "ok" };
      }
      const tm = trapMsg(t => { const tv = t.map(a => constVal(parse(a))); return tv.length === uniq.length && tv.every(x => uniq.some(y => close(y.v, x, 1e-9))); }); if (tm) return { s: "ko", m: tm };
      if (!expU.length) return { s: "ko", m: "Cette équation n'a aucune solution." };
      if (!uniq.length) return { s: "ko", m: "Il y a des solutions." };
      if (inExp.length === uniq.length) return { s: "ko", m: "Il manque " + (expU.length - uniq.length > 1 ? "des solutions" : "une solution") + "." };
      if (inExp.length === expU.length) return { s: "ko", m: "Une de tes valeurs n'est pas solution." };
      return { s: "ko", m: inExp.length ? "Une partie seulement est juste." : "" };
    }

    if (Qn.type === "interval") {
      const U = parseIntervals(raw), E = parseIntervals(Qn.ans);
      if (sameIntervals(U, E, Qn.loose)) return { s: "ok" };
      const tm = trapMsg(t => sameIntervals(U, parseIntervals(t), Qn.loose)); if (tm) return { s: "ko", m: tm };
      if (sameIntervals(U, E, true)) return { s: "ko", m: "Les bornes sont justes, mais pas les crochets : [ = inclus, ] tourné vers l'extérieur = exclu." };
      return { s: "ko" };
    }

    if (Qn.type === "eqn") {
      const i = raw.indexOf("=");
      if (i < 0) return { s: "bad", m: "Écris une équation, avec le signe « = »." };
      const L = parse(raw.slice(0, i)), R = parse(raw.slice(i + 1));
      const ua = { t: "sub", a: L, b: R };
      for (const v of varsOf(ua)) if (!vars.includes(v)) return { s: "bad", m: "La lettre « " + v + " » n'est pas attendue ici." };
      return sameExpr(ua, parse(Qn.ans), vars, Qn.dom || [-5, 5], "prop") ? { s: "ok" } : { s: "ko", m: trapMsg(t => sameExpr(ua, parse(t), vars, [-5, 5], "prop")) || "" };
    }
  } catch (e) {
    if (e instanceof PErr) return { s: "bad", m: e.message };
    return { s: "bad", m: "Je n'arrive pas à lire ta réponse. Vérifie les parenthèses." };
  }
  return { s: "bad", m: "?" };
}

/* aperçu : ce que le programme a compris */
function previewTex(Qn, raw) {
  raw = String(raw || "").trim(); if (!raw) return "";
  try {
    if (Qn.type === "interval") return ivTex(parseIntervals(raw));
    if (Qn.type === "set") { const p = splitList(raw); if (!p.length) return "S = \\varnothing"; return "\\left\\{" + p.map(x => toTex(parse(x))).join("\\,;\\,") + "\\right\\}"; }
    if (Qn.type === "tuple") { const p = splitList(raw); return "\\left(" + p.map(x => toTex(parse(x))).join("\\,;\\,") + "\\right)"; }
    if (Qn.type === "lim") { const l = parseLim(raw); if (l !== null) return l > 0 ? "+\\infty" : "-\\infty"; }
    if (Qn.type === "eqn") { const i = raw.indexOf("="); if (i < 0) return toTex(parse(raw)) + " = \\;?"; return toTex(parse(raw.slice(0, i))) + " = " + toTex(parse(raw.slice(i + 1))); }
    if ((Qn.type === "num" || Qn.type === "lim") && /^[a-zA-Z'()θ\s]{1,8}=/.test(raw)) raw = raw.slice(raw.indexOf("=") + 1).trim();
    let s = raw; if (Qn.type === "expr") { s = s.replace(/\+\s*(c|k|cte)\s*$/i, ""); if (Qn.lhs) { const i = s.indexOf("="); if (i >= 0) s = s.slice(i + 1); } }
    return toTex(parse(s)) + (Qn.prim && /\+\s*(c|k|cte)\s*$/i.test(raw) ? " + C" : "");
  } catch (e) { return null; }
}

/* tableau de signes (HTML) : xs = valeurs critiques (TeX), rows = [{label, signs:[...], zeros:[...]}] */
function signTable(xs, rows) {
  const head = "<tr><th>\\(x\\)</th><td>\\(-\\infty\\)</td>" + xs.map(x => "<td></td><td>\\(" + x + "\\)</td>").join("") + "<td></td><td>\\(+\\infty\\)</td></tr>";
  const body = rows.map(r => "<tr><th>\\(" + r.label + "\\)</th><td></td>" + r.signs.map((s, i) => "<td class=\"sg\">" + (s === "+" ? "+" : "−") + "</td>" + (i < xs.length ? "<td class=\"z\">" + (r.cells ? r.cells[i] : "0") + "</td>" : "")).join("") + "<td></td></tr>").join("");
  return '<div class="tw"><table class="signs">' + head + body + "</table></div>";
}
