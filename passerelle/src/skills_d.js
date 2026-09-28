/* =====================================================================
   LEZIONI — Tappa 7 (integrali) e Tappa 8 (vettori)
   ===================================================================== */

/* valore reale → scrittura esatta (p/q)·√m se possibile */
function niceNum(v) {
  if (Math.abs(v) < 1e-12) return { t: "0", s: "0", z: 1 };
  for (const m of [1, 2, 3, 6, 5]) for (let d = 1; d <= 12; d++) {
    const p = (v * d) / Math.sqrt(m), P0 = Math.round(p);
    if (Math.abs(p - P0) < 1e-9 && P0 !== 0 && Math.abs(P0) < 100000) {
      const g = gcd(P0, d), P = Math.abs(P0 / g), Dd = d / g, neg = P0 < 0 ? "-" : "";
      const core = m === 1 ? String(P) : (P === 1 ? "" : P) + "\\sqrt{" + m + "}";
      const t = neg + (Dd === 1 ? core : "\\frac{" + (m === 1 ? P : core || "1") + "}{" + Dd + "}");
      const s = neg + (m === 1 ? String(P) : (P === 1 ? "" : P + "*") + "sqrt(" + m + ")") + (Dd === 1 ? "" : "/" + Dd);
      return { t, s, one: P === 1 && Dd === 1 && m === 1 };
    }
  }
  return null;
}
function cTexNum(re, im, u) { // complesso (valori reali) → TeX a + bi
  u = u || "i"; const R = niceNum(re), I = niceNum(im);
  if (!R || !I) return fmtNum(re) + (im < 0 ? "-" : "+") + fmtNum(Math.abs(im)) + u;
  if (Math.abs(im) < 1e-12) return R.t;
  const IA = niceNum(Math.abs(im)); const imT = (IA.one ? "" : IA.t) + u;
  if (Math.abs(re) < 1e-12) return (im < 0 ? "-" : "") + imT;
  return R.t + (im < 0 ? "-" : "+") + imT;
}
function cInNum(re, im) {
  const R = niceNum(re), I = niceNum(Math.abs(im));
  if (Math.abs(im) < 1e-12) return R ? R.s : String(re);
  const imS = (I ? I.s : String(Math.abs(im))) + "*i";
  if (Math.abs(re) < 1e-12) return (im < 0 ? "-" : "") + imS;
  return (R ? R.s : String(re)) + (im < 0 ? "-" : "+") + imS;
}
const expT = k12 => (k12 === 0 ? "0" : (k12 < 0 ? "-i" : "i") + piT(piK(Math.abs(k12))));
const expTQ = r => (r.n === 0 ? "0" : (r.n < 0 ? "-i" : "i") + piT(r.abs()));
/* numeri complessi esatti con parti razionali */
const cq = (a, b) => [Qv(a), Qv(b)];
const cAdd = (z, w) => [z[0].add(w[0]), z[1].add(w[1])];
const cSub = (z, w) => [z[0].sub(w[0]), z[1].sub(w[1])];
const cMul = (z, w) => [z[0].mul(w[0]).sub(z[1].mul(w[1])), z[0].mul(w[1]).add(z[1].mul(w[0]))];
const cDiv = (z, w) => { const d = w[0].mul(w[0]).add(w[1].mul(w[1])); const n = cMul(z, [w[0], w[1].neg()]); return [n[0].div(d), n[1].div(d)]; };
function cT(z, u) { u = u || "i"; const [a, b] = z; if (b.n === 0) return a.tex(); const B = b.abs(); const imT = (B.eq(1) ? "" : B.tex()) + u; if (a.n === 0) return (b.n < 0 ? "-" : "") + imT; return a.tex() + (b.n < 0 ? "-" : "+") + imT; }
function cIn(z) { const [a, b] = z; return "(" + a.plain() + ")+(" + b.plain() + ")*i"; }
const cP = (z, u) => pr(cT(z, u));
const vT = v => "\\left(" + v.map(x => tx(x)).join("\\,;\\,") + "\\right)";
const vIn = v => v.map(x => Qv(x).plain());

/* =========================== TAPPA 7 =========================== */
function primTerms() {
  const pool = [
    () => { const n = ri(0, 3), a = rnz(-6, 6) * (n + 1); const c = a / (n + 1); return { f: mono(a, n === 0 ? "" : n === 1 ? "x" : "x^{" + n + "}", false), F: mono(c, n + 1 === 1 ? "x" : "x^{" + (n + 1) + "}", false), Fs: "+(" + c + ")*x^" + (n + 1), ds: n === 0 ? "+0" : "+(" + a * n + ")*x^" + (n - 1) }; },
    () => { const b = rnz(-5, 5); return { f: (b < 0 ? " - " : " + ") + frac(Math.abs(b), "x"), F: mono(b, "\\ln x", false), Fs: "+(" + b + ")*ln(x)", ds: "-(" + b + ")/x^2" }; },
    () => { const c = rnz(-5, 5); return { f: mono(c, "e^{x}", false), F: mono(c, "e^{x}", false), Fs: "+(" + c + ")*e^x", ds: "+(" + c + ")*e^x" }; },
    () => { const d = rnz(-5, 5); return { f: (d < 0 ? " - " : " + ") + frac(Math.abs(d), "x^2"), F: (d < 0 ? " + " : " - ") + frac(Math.abs(d), "x"), Fs: "-(" + d + ")/x", ds: "-(" + 2 * d + ")/x^3" }; },
    () => { const k = rnz(-3, 3) * 3; return { f: mono(k, "\\sqrt{x}", false), F: mono(q(2 * k, 3), "x\\sqrt{x}", false), Fs: "+(" + (2 * k) / 3 + ")*x*sqrt(x)", ds: "+(" + k + ")/(2*sqrt(x))" }; },
    () => { const m = rnz(-4, 4); return { f: mono(m, "\\cos x", false), F: mono(m, "\\sin x", false), Fs: "+(" + m + ")*sin(x)", ds: "+(" + -m + ")*sin(x)" }; },
    () => { const m = rnz(-4, 4); return { f: mono(m, "\\sin x", false), F: mono(-m, "\\cos x", false), Fs: "+(" + -m + ")*cos(x)", ds: "+(" + m + ")*cos(x)" }; },
  ];
  const idx = shuf([0, 1, 2, 3, 4, 5, 6]).slice(0, ri(2, 3)); const T = idx.map(i => pool[i]());
  const s0 = s => s.replace(/^ \+ /, "").replace(/^ - /, "-");
  return { f: s0(T.map(t => t.f).join("")), F: s0(T.map(t => t.F).join("")), Fs: T.map(t => t.Fs).join("").replace(/^\+/, ""), ds: T.map(t => t.ds).join("").replace(/^\+/, "") };
}
sk({
  id: "c6-primitives-usuelles", ch: 7, title: "Le primitive (la derivata al contrario)",
  learn: L({
    idea: "Derivare è come « smontare » una funzione. Trovare una <b>primitiva</b> è il contrario: cerchi la funzione F che, derivata, ti ridà f. Esempio: la derivata di " + M("x^2") + " è " + M("2x") + ", quindi una primitiva di " + M("2x") + " è " + M("x^2") + ".",
    rule: D("x^n\\to\\frac{x^{n+1}}{n+1}\\quad \\frac1x\\to\\ln x\\quad e^x\\to e^x\\quad \\frac1{x^2}\\to-\\frac1x") + D("\\sqrt x\\to\\frac23x\\sqrt x\\quad \\cos x\\to\\sin x\\quad \\sin x\\to-\\cos x") + "Si aggiunge sempre una costante " + M("+C") + ".",
    steps: ["Tratta ogni termine separatamente.", "Per " + M("x^n") + ": aumenta l'esponente di 1 e dividi per il nuovo esponente.", "Controlla derivando la tua risposta: devi ritrovare f."],
    trap: "Primitiva di " + M("\\sin x") + ": " + M("-\\cos x") + " (con il meno). Primitiva di " + M("\\frac1x") + ": " + M("\\ln x") + ".",
    input: "<code>x^3/3+2ln(x)</code> (il <code>+C</code> si può omettere).",
  }),
  gen() {
    const T = primTerms();
    return { q: "Trova una primitiva di " + M("f(x)=" + T.f) + " (per x > 0).", type: "expr", prim: 1, ans: T.Fs, deriv: T.ds, dom: [0.3, 3], atex: "F(x)=" + T.F + "+C", lhs: 1, pre: "F(x) =",
      sol: ["Termine per termine, con la tabella delle primitive.", M("F(x)=" + T.F + "+C") + ".", "Controllo: derivando F si ritrova f."] };
  },
});

sk({
  id: "c6-primitives-composees", ch: 7, title: "Primitive di funzioni composte",
  learn: L({
    idea: "Quando c'è un « dentro » (come " + M("e^{3x}") + "), la derivata aveva moltiplicato per u'. Per tornare indietro bisogna quindi <b>dividere</b> per quel numero.",
    rule: D("e^{ax+b}\\to\\frac1ae^{ax+b}\\qquad (ax+b)^n\\to\\frac{(ax+b)^{n+1}}{a(n+1)}\\qquad \\frac{1}{ax+b}\\to\\frac1a\\ln(ax+b)") + D("\\frac{u'}{u}\\to\\ln|u|\\qquad u'e^u\\to e^u\\qquad u'u^n\\to\\frac{u^{n+1}}{n+1}\\qquad \\cos(ax)\\to\\frac1a\\sin(ax)"),
    steps: ["Riconosci la forma (c'è u' moltiplicato per qualcosa di u?).", "Se manca un numero, aggiungilo e compensa: " + M("x\\,e^{x^2}=\\frac12\\cdot2x\\,e^{x^2}") + ".", "Controlla derivando."],
    trap: "Dimenticare " + M("\\frac1a") + ": la primitiva di " + M("e^{3x}") + " è " + M("\\frac13e^{3x}") + ".",
  }),
  gen() {
    const t = ri(1, 7), a = ri(2, 5), b = rnz(-4, 4), n = ri(2, 4), k = ri(1, 5);
    const T = [null,
      ["e^{" + linT(a, b) + "}", "(1/" + a + ")*e^(" + linIn(a, b) + ")", frac(1, a) + "e^{" + linT(a, b) + "}", "e^(" + linIn(a, b) + ")", [0.2, 2]],
      [pr(linT(a, b)) + "^{" + n + "}", "(" + linIn(a, b) + ")^" + (n + 1) + "/" + a * (n + 1), frac(pr(linT(a, b)) + "^{" + (n + 1) + "}", a * (n + 1)), "(" + linIn(a, b) + ")^" + (n + 1) + "/" + (n + 1), [0.2, 2]],
      [frac(1, linT(a, Math.abs(b))), "(1/" + a + ")*ln(" + linIn(a, Math.abs(b)) + ")", frac(1, a) + "\\ln\\left(" + linT(a, Math.abs(b)) + "\\right)", "ln(" + linIn(a, Math.abs(b)) + ")", [0.2, 3]],
      [frac("2x", "x^2+" + k), "ln(x^2+" + k + ")", "\\ln\\left(x^2+" + k + "\\right)", null, [0.2, 3]],
      ["x\\,e^{x^2}", "(1/2)*e^(x^2)", "\\frac12e^{x^2}", "e^(x^2)", [0.1, 1.5]],
      ["\\cos(" + a + "x)", "(1/" + a + ")*sin(" + a + "x)", frac(1, a) + "\\sin(" + a + "x)", "sin(" + a + "x)", [0.2, 3]],
      ["x\\left(x^2+1\\right)^{" + n + "}", "(x^2+1)^" + (n + 1) + "/" + 2 * (n + 1), frac("\\left(x^2+1\\right)^{" + (n + 1) + "}", 2 * (n + 1)), "(x^2+1)^" + (n + 1) + "/" + (n + 1), [0.1, 1.5]],
    ][t];
    return { q: "Trova una primitiva di " + M("f(x)=" + T[0]) + ".", type: "expr", prim: 1, ans: T[1], dom: T[4], atex: "F(x)=" + T[2] + "+C", lhs: 1, pre: "F(x) =",
      traps: T[3] ? [{ ans: T[3], m: "Manca un numero davanti: se derivi la tua risposta non ritrovi esattamente f." }] : [],
      sol: ["Riconosco la forma (vedi la tabella).", M("F(x)=" + T[2] + "+C") + ".", "Controllo: " + M("F'(x)=" + T[0]) + " ✔."] };
  },
});

sk({
  id: "c6-primitive-condition", ch: 7, title: "La primitiva che passa per un punto",
  learn: L({
    idea: "Le primitive sono infinite (una per ogni valore di C), come tante copie della stessa curva spostate in su o in giù. Se ti dicono per quale punto deve passare, ne resta una sola.",
    rule: "Tutte le primitive di f sono " + M("F(x)+C") + ". Una condizione " + M("F(x_0)=y_0") + " fissa il valore di C.",
    steps: ["Scrivi una primitiva generale " + M("F(x)+C") + ".", "Metti " + M("x_0") + " al posto di x e scrivi " + M("=y_0") + ".", "Risolvi per trovare C.", "Scrivi F con il valore giusto di C."],
    trap: "Qui si vuole <b>una sola</b> funzione: niente " + M("+C") + " nella risposta finale.",
  }),
  gen() {
    if (coin()) {
      const P = [rnz(-3, 3) * 3, rnz(-4, 4) * 2, rnz(-6, 6)]; const F = [P[0] / 3, P[1] / 2, P[2], 0].map(v => q(v));
      const x0 = ri(-2, 2), y0 = rnz(-8, 8); const C = q(y0).sub(pevalQ(F, q(x0))); const Ff = F.slice(0, 3).concat([C]);
      return { q: "Trova la primitiva F di " + M("f(x)=" + polyT(P)) + " tale che " + M("F(" + x0 + ")=" + y0) + ".", type: "expr", ans: polyIn(Ff), atex: "F(x)=" + polyT(Ff), lhs: 1, pre: "F(x) =",
        sol: [M("F(x)=" + polyT(F.slice(0, 3).concat([0])) + "+C") + ".", M("F(" + x0 + ")=" + pevalQ(F, q(x0)).tex() + "+C=" + y0) + ", quindi " + M("C=" + C.tex()) + ".", M("F(x)=" + polyT(Ff)) + "."] };
    }
    const a = rnz(-4, 4), y0 = rnz(-6, 6); const C = y0 - a;
    return { q: "Trova la primitiva F di " + M("f(x)=" + mono(a, "e^{x}", true)) + " tale che " + M("F(0)=" + y0) + ".", type: "expr", ans: a + "*e^x+(" + C + ")", atex: "F(x)=" + mono(a, "e^{x}", true) + (C ? sgnTex(C) : ""), lhs: 1, pre: "F(x) =",
      sol: [M("F(x)=" + mono(a, "e^x", true) + "+C") + ".", M("F(0)=" + a + "+C=" + y0) + ", quindi " + M("C=" + C) + ".", M("F(x)=" + mono(a, "e^{x}", true) + (C ? sgnTex(C) : "")) + "."] };
  },
});

sk({
  id: "c6-integrale-polynome", ch: 7, title: "Calcolare un integrale (polinomio)",
  learn: L({
    idea: "L'integrale da a a b misura l'area « con segno » sotto la curva. Non serve disegnare: si calcola con una primitiva F, facendo « F in alto meno F in basso ».",
    rule: M("\\int_a^b f(x)\\,dx=\\big[F(x)\\big]_a^b=F(b)-F(a)") + ", dove F è una primitiva di f.",
    steps: ["Trova una primitiva F (senza +C).", "Calcola F(b) e poi F(a) (con le parentesi).", "Fai F(b) − F(a).", "Semplifica."],
    trap: "È F(b) − F(a), in quest'ordine (estremo in alto meno estremo in basso).",
  }),
  gen() {
    const P = [rnz(-2, 2), rnz(-4, 4), rnz(-6, 6)]; if (coin()) P.shift();
    const n = P.length - 1; const F = P.map((c, i) => q(c, n - i + 1)).concat([q(0)]);
    const a = ri(-2, 1), b = a + ri(1, 3); const v = pevalQ(F, q(b)).sub(pevalQ(F, q(a)));
    return { q: "Calcola " + M("\\int_{" + a + "}^{" + b + "}\\left(" + polyT(P) + "\\right)dx") + ".", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(),
      traps: [{ ans: v.neg().plain(), m: "È F(b) − F(a): estremo in alto meno estremo in basso." }],
      sol: ["Primitiva: " + M("F(x)=" + polyT(F)) + ".", M("F(" + b + ")=" + pevalQ(F, q(b)).tex()) + ", " + M("F(" + a + ")=" + pevalQ(F, q(a)).tex()) + ".", M("\\int=F(" + b + ")-F(" + a + ")=" + v.tex()) + "."] };
  },
});

sk({
  id: "c6-integrale-usuelles", ch: 7, title: "Integrali con exp, ln, sin, cos",
  learn: L({
    idea: "Stesso metodo di prima. La sola novità: bisogna conoscere alcuni valori esatti (e lasciare " + M("e") + ", " + M("\\ln") + ", " + M("\\pi") + " scritti così, senza calcolatrice).",
    rule: "Metodo " + M("[F]_a^b=F(b)-F(a)") + ", con i valori da sapere: " + M("e^0=1") + ", " + M("\\ln1=0") + ", " + M("\\ln e=1") + ", " + M("\\sin0=0") + ", " + M("\\cos0=1") + ", " + M("\\cos\\pi=-1") + ".",
    steps: ["Primitiva.", "Sostituisci gli estremi.", "Usa i valori esatti (niente valori approssimati)."],
    trap: M("\\left[-\\cos x\\right]_0^\\pi=-\\cos\\pi-(-\\cos0)=1+1=2") + ": attenzione ai doppi segni.",
    input: "<code>(e^2-1)/2</code>, <code>ln(2)</code>, <code>2</code>.",
  }),
  gen() {
    const k = ri(1, 3), n = ri(1, 3), m = ri(2, 5);
    const T = [
      ["\\int_0^1 e^{" + (k === 1 ? "" : k) + "x}dx", "(e^" + k + "-1)/" + k, frac("e^{" + k + "}-1", k).replace("\\frac{e^{1}-1}{1}", "e-1").replace("{1}", "1"), [M("F(x)=" + frac(1, k) + "e^{" + k + "x}") + ".", M(frac(1, k) + "(e^{" + k + "}-e^0)=" + frac("e^{" + k + "}-1", k)) + "."]],
      ["\\int_1^{e^{" + n + "}}\\frac{" + m + "}{x}dx", String(m * n), String(m * n), [M("F(x)=" + m + "\\ln x") + ".", M(m + "\\ln(e^{" + n + "})-" + m + "\\ln1=" + m + "\\times" + n + "=" + m * n) + "."]],
      ["\\int_0^{\\pi/2}\\cos x\\,dx", "1", "1", [M("F(x)=\\sin x") + ".", M("\\sin\\frac\\pi2-\\sin0=1") + "."]],
      ["\\int_0^{\\pi}\\sin x\\,dx", "2", "2", [M("F(x)=-\\cos x") + ".", M("-\\cos\\pi-(-\\cos0)=1+1=2") + "."]],
      ["\\int_0^{" + m + "}\\frac{2x}{x^2+1}dx", "ln(" + (m * m + 1) + ")", "\\ln " + (m * m + 1), ["Forma " + M("\\frac{u'}{u}") + ": " + M("F(x)=\\ln(x^2+1)") + ".", M("\\ln(" + (m * m + 1) + ")-\\ln1=\\ln " + (m * m + 1)) + "."]],
      ["\\int_1^{" + m + "}\\frac{1}{x^2}dx", "1-1/" + m, q(m - 1, m).tex(), [M("F(x)=-\\frac1x") + ".", M("-\\frac1{" + m + "}-(-1)=" + q(m - 1, m).tex()) + "."]],
      ["\\int_0^{\\ln " + m + "}e^{x}dx", String(m - 1), String(m - 1), [M("F(x)=e^x") + ".", M("e^{\\ln " + m + "}-e^0=" + m + "-1=" + (m - 1)) + "."]],
      ["\\int_1^{" + m * m + "}\\frac{1}{\\sqrt x}dx", String(2 * (m - 1)), String(2 * (m - 1)), [M("F(x)=2\\sqrt x") + ".", M("2\\sqrt{" + m * m + "}-2\\sqrt1=" + 2 * m + "-2=" + 2 * (m - 1)) + "."]],
    ];
    const [e, ans, at, s] = pick(T);
    return { q: "Calcola il valore esatto di " + M(e) + ".", type: "num", ans, allow: ["e", "ln", "pi", "sqrt"], atex: at, sol: s };
  },
});

sk({
  id: "c6-aire", ch: 7, title: "Area sotto una curva",
  learn: L({
    idea: "Un'<b>area</b> è sempre positiva, ma l'integrale conta « in negativo » la parte che sta sotto l'asse x. Quindi, se la curva attraversa l'asse, bisogna tagliare in due pezzi e prendere ogni pezzo in positivo.",
    rule: "Se " + M("f\\ge0") + " su " + M("[a;b]") + ", l'area è " + M("\\int_a^bf") + ". Se " + M("f\\le0") + ", l'area è " + M("-\\int_a^bf") + ". Se f cambia segno, si <b>taglia</b> l'intervallo in ogni zero.",
    steps: ["Trova dove f vale zero dentro " + M("[a;b]") + ".", "Guarda il segno di f su ogni pezzo.", "Calcola l'integrale di ogni pezzo e prendilo in positivo.", "Somma."],
    trap: "Un integrale può essere negativo, un'area mai.",
  }),
  gen() {
    if (coin()) {
      const k = ri(1, 3), B = k + ri(1, 2); const F = x => q(x * x * x, 3).sub(k * k * x);
      const A1 = F(k).sub(F(0)).neg(), A2 = F(B).sub(F(k)), A = A1.add(A2), I = F(B).sub(F(0));
      return { q: "Calcola l'area compresa tra la curva di " + M("f(x)=x^2-" + k * k) + ", l'asse x e le rette " + M("x=0") + " e " + M("x=" + B) + ".", type: "num", ans: A.plain(), form: ["rat"], atex: A.tex(),
        traps: [{ ans: I.plain(), m: "Questo è l'integrale, non l'area: f cambia segno in " + k + ", bisogna tagliare l'intervallo." }],
        sol: ["f vale zero in " + M("x=" + k) + ": " + M("f\\le0") + " su " + M("[0;" + k + "]") + ", " + M("f\\ge0") + " su " + M("[" + k + ";" + B + "]") + ".", M("\\int_0^{" + k + "}f=" + A1.neg().tex()) + " → area " + M(A1.tex()) + "; " + M("\\int_{" + k + "}^{" + B + "}f=" + A2.tex()) + ".", "Area totale: " + M(A1.tex() + "+" + A2.tex() + "=" + A.tex()) + "."] };
    }
    const c = ri(1, 4), b = c + ri(1, 4); const A = q(c * c, 2).add(q((b - c) * (b - c), 2)), I = q(b * b, 2).sub(c * b);
    return { q: "Calcola l'area compresa tra la retta " + M("y=x-" + c) + ", l'asse x e le rette " + M("x=0") + " e " + M("x=" + b) + ".", type: "num", ans: A.plain(), form: ["rat"], atex: A.tex(),
      traps: [{ ans: I.plain(), m: "Questo è l'integrale (che conta in negativo la parte sotto l'asse). Taglia in x = " + c + "." }],
      sol: ["La retta taglia l'asse in " + M("x=" + c) + ".", "Due triangoli: " + M("\\frac{" + c + "\\times" + c + "}{2}") + " (sotto l'asse) e " + M("\\frac{" + (b - c) + "\\times" + (b - c) + "}{2}") + " (sopra).", "Area: " + M(A.tex()) + "."] };
  },
});

sk({
  id: "c6-aire-courbes", ch: 7, title: "Area tra due curve",
  learn: L({
    idea: "L'area tra due curve è come « la curva di sopra meno la curva di sotto », sommata da un punto d'incontro all'altro.",
    rule: "Se " + M("g\\ge f") + " su " + M("[a;b]") + ", l'area tra le curve è " + M("\\int_a^b\\big(g(x)-f(x)\\big)dx") + " (curva di sopra meno curva di sotto).",
    steps: ["Trova i punti d'incontro: risolvi " + M("f(x)=g(x)") + ".", "Guarda quale curva sta sopra (prova un valore in mezzo).", "Integra « sopra − sotto » tra i punti d'incontro."],
    trap: "Non calcolare separatamente le aree sotto ogni curva: usa direttamente " + M("g-f") + ".",
  }),
  gen() {
    const r1 = ri(-3, 1), r2 = r1 + ri(1, 4), p = rnz(-3, 3); const s = r1 + r2, t = -r1 * r2 + p;
    const A = q(Math.pow(r2 - r1, 3), 6);
    return { q: "Calcola l'area della regione compresa tra " + M("f(x)=x^2" + sgnTex(p)) + " e la retta " + M("g(x)=" + polyT([s, t])) + ".", type: "num", ans: A.plain(), form: ["rat"], atex: A.tex(),
      sol: ["Punti d'incontro: " + M("x^2" + sgnTex(p) + "=" + polyT([s, t]) + "\\iff " + polyT([1, -s, r1 * r2]) + "=0") + ", cioè " + M("x=" + r1) + " e " + M("x=" + r2) + ".", "In mezzo la retta sta sopra: " + M("g(x)-f(x)=" + polyT([-1, s, -r1 * r2])) + ".", M("\\int_{" + r1 + "}^{" + r2 + "}\\left(" + polyT([-1, s, -r1 * r2]) + "\\right)dx=" + A.tex()) + "."] };
  },
});

sk({
  id: "c6-valeur-moyenne", ch: 7, title: "Valore medio",
  learn: L({
    idea: "Come la media dei voti: sommi tutto (qui con l'integrale) e dividi per « quanti sono » (qui la lunghezza dell'intervallo).",
    rule: "Valore medio di f su " + M("[a;b]") + ": " + M("\\mu=\\frac1{b-a}\\int_a^bf(x)\\,dx") + ".",
    steps: ["Calcola l'integrale.", "Dividi per la lunghezza dell'intervallo " + M("b-a") + "."],
    trap: "Non dimenticare di dividere per " + M("b-a") + ".",
  }),
  gen() {
    if (rnd() < 0.75) {
      const P = [rnz(-3, 3), rnz(-4, 4), rnz(-6, 6)]; const F = [q(P[0], 3), q(P[1], 2), q(P[2]), q(0)];
      const a = ri(-2, 1), b = a + ri(1, 4); const I = pevalQ(F, q(b)).sub(pevalQ(F, q(a))), mu = I.div(b - a);
      return { q: "Calcola il valore medio di " + M("f(x)=" + polyT(P)) + " su " + M("[" + a + "\\,;\\," + b + "]") + ".", type: "num", ans: mu.plain(), form: ["rat"], atex: mu.tex(),
        traps: b - a > 1 ? [{ ans: I.plain(), m: "Questo è l'integrale: bisogna ancora dividere per " + (b - a) + "." }] : [],
        sol: [M("\\int_{" + a + "}^{" + b + "}f=" + I.tex()) + ".", M("\\mu=\\frac1{" + (b - a) + "}\\times" + pr(I.tex()) + "=" + mu.tex()) + "."] };
    }
    return { q: "Calcola il valore medio di " + M("f(x)=e^x") + " su " + M("[0\\,;\\,2]") + ".", type: "num", ans: "(e^2-1)/2", allow: ["e"], atex: "\\frac{e^2-1}{2}",
      sol: [M("\\int_0^2e^x\\,dx=e^2-1") + ".", M("\\mu=\\frac{e^2-1}{2}") + "."] };
  },
});

sk({
  id: "c6-ipp", ch: 7, title: "Integrazione per parti",
  learn: L({
    idea: "È la regola del prodotto « al contrario ». Serve quando devi integrare un prodotto come " + M("x\\,e^x") + ": scegli un pezzo che si semplifica derivando (x) e uno facile da integrare (" + M("e^x") + ").",
    rule: D("\\int_a^bu\\,v'\\,dx=\\big[uv\\big]_a^b-\\int_a^bu'\\,v\\,dx"),
    steps: ["Scegli u = quello che si semplifica derivando (un polinomio, oppure ln x).", "Scegli v' = quello che si integra facilmente (" + M("e^x") + ", " + M("\\sin x") + ", " + M("\\cos x") + ", oppure 1).", "Calcola u' e v.", "Applica la formula e finisci il calcolo."],
    trap: "Con ln x: si prende " + M("u=\\ln x") + " (e " + M("v'=1") + " oppure " + M("v'=x") + "), mai " + M("v'=\\ln x") + ".",
  }),
  gen() {
    const t = ri(1, 6);
    if (t === 1) { const a = rnz(-3, 3), b = rnz(-4, 4); const re = b, co = a - b; // ∫0^1 (ax+b)e^x = b·e + (a − b)
      const at = (re === 0 ? "" : (re === 1 ? "" : re === -1 ? "-" : re) + "e") + (co === 0 ? (re === 0 ? "0" : "") : (co > 0 && re !== 0 ? "+" : "") + co);
      return { q: "Calcola " + M("\\int_0^1\\left(" + linT(a, b) + "\\right)e^x\\,dx") + ".", type: "num", ans: re + "*e+(" + co + ")", allow: ["e"], atex: at,
        sol: [M("u=" + linT(a, b) + ",\\ u'=" + a) + "; " + M("v'=e^x,\\ v=e^x") + ".", M("\\left[(" + linT(a, b) + ")e^x\\right]_0^1-\\int_0^1" + tp(a) + "e^x\\,dx=" + (a + b) + "e-" + tp(b) + "-" + tp(a) + "(e-1)") + ".", "= " + M(at) + "."] }; }
    const T = [null, null,
      ["\\int_1^e\\ln x\\,dx", "1", "1", [M("u=\\ln x,\\ u'=\\frac1x") + "; " + M("v'=1,\\ v=x") + ".", M("[x\\ln x]_1^e-\\int_1^e1\\,dx=e-(e-1)=1") + "."]],
      ["\\int_1^e x\\ln x\\,dx", "(e^2+1)/4", "\\frac{e^2+1}{4}", [M("u=\\ln x,\\ u'=\\frac1x") + "; " + M("v'=x,\\ v=\\frac{x^2}2") + ".", M("\\left[\\frac{x^2}{2}\\ln x\\right]_1^e-\\int_1^e\\frac x2dx=\\frac{e^2}2-\\frac{e^2-1}{4}=\\frac{e^2+1}{4}") + "."]],
      ["\\int_0^\\pi x\\sin x\\,dx", "pi", "\\pi", [M("u=x,\\ u'=1") + "; " + M("v'=\\sin x,\\ v=-\\cos x") + ".", M("[-x\\cos x]_0^\\pi+\\int_0^\\pi\\cos x\\,dx=\\pi+0=\\pi") + "."]],
      ["\\int_0^{\\pi/2} x\\cos x\\,dx", "pi/2-1", "\\frac\\pi2-1", [M("u=x,\\ u'=1") + "; " + M("v'=\\cos x,\\ v=\\sin x") + ".", M("[x\\sin x]_0^{\\pi/2}-\\int_0^{\\pi/2}\\sin x\\,dx=\\frac\\pi2-1") + "."]],
      ["\\int_0^1 x\\,e^{-x}dx", "1-2/e", "1-\\frac2e", [M("u=x,\\ u'=1") + "; " + M("v'=e^{-x},\\ v=-e^{-x}") + ".", M("[-xe^{-x}]_0^1+\\int_0^1e^{-x}dx=-e^{-1}+(1-e^{-1})=1-\\frac2e") + "."]],
    ];
    const [e, ans, at, s] = T[t];
    return { q: "Calcola (per parti) " + M(e) + ".", type: "num", ans, allow: ["e", "pi"], atex: at, sol: s };
  },
});

sk({
  id: "c6-physique", ch: 7, title: "Gli integrali in fisica",
  learn: L({
    idea: "L'integrale « somma tanti pezzettini ». Se conosci la velocità in ogni istante, sommando ottieni la distanza percorsa; se conosci la corrente, ottieni la carica.",
    rule: "Distanza percorsa: " + M("d=\\int_{t_1}^{t_2}v(t)\\,dt") + " (se v ≥ 0). Carica: " + M("q=\\int i(t)\\,dt") + ". Lavoro di una forza variabile: " + M("W=\\int_{x_1}^{x_2}F(x)\\,dx") + ".",
    steps: ["Riconosci cosa integrare e rispetto a quale variabile.", "Calcola l'integrale tra gli estremi giusti.", "Scrivi l'unità di misura."],
    trap: "Molla: " + M("F=kx") + " dà " + M("W=\\frac12k(x_2^2-x_1^2)") + ", non " + M("k(x_2-x_1)") + ".",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) { const a = ri(1, 4) * 2, b = ri(0, 6), T = ri(1, 5); const d = (a * T * T) / 2 + b * T;
      return { q: "Un oggetto ha velocità " + M("v(t)=" + polyT([a, b], "t")) + " (m/s). Quanti metri percorre tra " + M("t=0") + " e " + M("t=" + T) + " s?", type: "num", ans: String(d), form: ["rat"], atex: d + "\\text{ m}",
        sol: [M("d=\\int_0^{" + T + "}\\left(" + polyT([a, b], "t") + "\\right)dt=\\left[" + polyT([a / 2, b, 0], "t") + "\\right]_0^{" + T + "}") + ".", M("=" + d) + " m."] }; }
    if (t === 2) { const k = ri(1, 9) * 10, x1 = q(ri(0, 2), 10), x2 = x1.add(q(ri(1, 3), 10)); const W = x2.mul(x2).sub(x1.mul(x1)).mul(k).div(2);
      return { q: "Una molla di costante " + M("k=" + k) + " N/m viene allungata da " + M("x_1=" + fmtNum(x1.v)) + " m a " + M("x_2=" + fmtNum(x2.v)) + " m. Calcola il lavoro " + M("W=\\int_{x_1}^{x_2}kx\\,dx") + " (in J, numero decimale).", type: "num", ans: W.plain(), atex: fmtNum(W.v) + "\\text{ J}",
        sol: [M("W=\\left[\\frac12kx^2\\right]_{x_1}^{x_2}=\\frac12\\times" + k + "\\times(" + fmtNum(x2.v) + "^2-" + fmtNum(x1.v) + "^2)") + ".", M("W=" + fmtNum(W.v)) + " J."] }; }
    const I = ri(1, 9), tau = ri(1, 4);
    return { q: "Una corrente vale " + M("i(t)=" + I + "e^{-t/" + tau + "}") + " (A). Quanta carica (in C) passa nel circuito tra " + M("t=0") + " e " + M("t=" + tau + "\\ln2") + " s?", type: "num", ans: String((I * tau) / 2), form: ["rat"], atex: fmtNum((I * tau) / 2) + "\\text{ C}",
      sol: [M("q=\\int_0^{" + tau + "\\ln2}" + I + "e^{-t/" + tau + "}dt=\\left[-" + I * tau + "e^{-t/" + tau + "}\\right]_0^{" + tau + "\\ln2}") + ".", M("=-" + I * tau + "\\times\\frac12+" + I * tau + "=" + fmtNum((I * tau) / 2)) + " C."] };
  },
});

sk({
  id: "c6-proprietes", ch: 7, title: "Proprietà degli integrali",
  learn: L({
    idea: "Gli integrali si possono spezzare e rimettere insieme, come i pezzi di un percorso: andare da a a b e poi da b a c è come andare da a a c.",
    rule: M("\\int_a^b(\\alpha f+\\beta g)=\\alpha\\int_a^bf+\\beta\\int_a^bg") + "; " + M("\\int_a^bf+\\int_b^cf=\\int_a^cf") + "; " + M("\\int_b^af=-\\int_a^bf") + "; " + M("\\int_a^b k\\,dx=k(b-a)") + ".",
    steps: ["Spezza l'integrale richiesto con queste regole.", "Sostituisci i valori che conosci.", "Calcola."],
    trap: "Scambiare gli estremi cambia il segno.",
  }),
  gen() {
    const a = ri(-2, 1), b = a + ri(1, 3), c = b + ri(1, 3), p = rnz(-8, 8), r = rnz(-8, 8), s = rnz(-8, 8), k = ri(2, 5), m = ri(2, 4);
    const T = [
      ["\\int_{" + a + "}^{" + c + "}f(x)\\,dx", p + r, "Percorso spezzato: " + M("\\int_{" + a + "}^{" + b + "}f+\\int_{" + b + "}^{" + c + "}f=" + p + sgnTex(r) + "=" + (p + r)) + "."],
      ["\\int_{" + a + "}^{" + b + "}\\big(" + k + "f(x)-" + m + "g(x)\\big)dx", k * p - m * s, "I numeri escono dall'integrale: " + M(k + "\\times" + tp(p) + "-" + m + "\\times" + tp(s) + "=" + (k * p - m * s)) + "."],
      ["\\int_{" + b + "}^{" + a + "}f(x)\\,dx", -p, "Estremi scambiati: " + M("-\\int_{" + a + "}^{" + b + "}f=" + -p) + "."],
      ["\\int_{" + a + "}^{" + b + "}\\big(f(x)+" + k + "\\big)dx", p + k * (b - a), M("\\int f+\\int " + k + "=" + p + "+" + k + "\\times" + (b - a) + "=" + (p + k * (b - a))) + "."],
    ];
    const [e, v, s0] = pick(T);
    return { q: "Sappiamo che " + M("\\int_{" + a + "}^{" + b + "}f=" + p) + ", " + M("\\int_{" + b + "}^{" + c + "}f=" + r) + " e " + M("\\int_{" + a + "}^{" + b + "}g=" + s) + ". Calcola " + M(e) + ".", type: "num", ans: String(v), form: ["rat"], atex: String(v), sol: [s0] };
  },
});

/* =========================== TAPPA 8 =========================== */
const pt = (n, P) => n + "\\left(" + P.map(tx).join("\\,;\\,") + "\\right)";
function randP(d) { const P = []; for (let i = 0; i < d; i++) P.push(ri(-7, 7)); return P; }
function randV(d, lo = -6, hi = 6) { let v; do { v = []; for (let i = 0; i < d; i++) v.push(ri(lo, hi)); } while (v.every(x => x === 0)); return v; }

sk({
  id: "c7-coordonnees", ch: 8, title: "Le coordinate di un vettore AB",
  learn: L({
    idea: "Un <b>vettore</b> è uno spostamento: una freccia che dice « di quanto vado a destra e di quanto vado in su ». Per andare da A a B, calcoli di quanto ti sposti.",
    rule: M("\\overrightarrow{AB}=\\left(x_B-x_A\\,;\\,y_B-y_A\\right)") + ": <b>arrivo meno partenza</b> (e " + M("z_B-z_A") + " nello spazio).",
    steps: ["Scrivi le coordinate di B (l'arrivo).", "Togli quelle di A (la partenza), una per una.", "Attenzione ai doppi segni: " + M("3-(-2)=5") + "."],
    trap: M("\\overrightarrow{AB}") + " va da A verso B: è B − A, non A − B.",
    input: "<code>(3;-5)</code> oppure <code>(3;-5;2)</code>.",
  }),
  gen() {
    const d = rnd() < 0.6 ? 2 : 3; const A = randP(d), B = randP(d); const v = B.map((x, i) => x - A[i]);
    return { q: "Siano " + M(pt("A", A)) + " e " + M(pt("B", B)) + ". Scrivi le coordinate di " + M("\\overrightarrow{AB}") + ".", type: "tuple", ans: vIn(v), vars: [], form: ["rat"], atex: "\\overrightarrow{AB}" + vT(v),
      traps: [{ ans: vIn(v.map(x => -x)), m: "È B − A (arrivo meno partenza), non A − B." }],
      sol: [M("\\overrightarrow{AB}=\\left(" + B.map((b, i) => tx(b) + "-" + tp(A[i])).join("\\,;\\,") + "\\right)=" + vT(v)) + "."] };
  },
});

sk({
  id: "c7-operations", ch: 8, title: "Operazioni con i vettori",
  learn: L({
    idea: "Con i vettori si calcola « un numero alla volta »: la prima coordinata con la prima, la seconda con la seconda.",
    rule: M("k\\vec u+m\\vec v=(ku_x+mv_x\\,;\\,ku_y+mv_y)") + ". Punto medio di [AB]: " + M("\\left(\\frac{x_A+x_B}2\\,;\\,\\frac{y_A+y_B}2\\right)") + ". ABCD è un parallelogramma se " + M("\\overrightarrow{AB}=\\overrightarrow{DC}") + ".",
    steps: ["Moltiplica ogni vettore per il suo numero.", "Somma coordinata per coordinata.", "Per un parallelogramma: " + M("D=A+C-B") + "."],
    trap: M("-3\\times(-2)=+6") + ": attenzione ai segni.",
  }),
  gen() {
    const t = ri(1, 3), d = rnd() < 0.6 ? 2 : 3;
    if (t === 1) { const u = randV(d), v = randV(d), k = rnz(-3, 3), m = rnz(-3, 3); const w = u.map((x, i) => k * x + m * v[i]);
      return { q: "Siano " + M("\\vec u" + vT(u)) + " e " + M("\\vec v" + vT(v)) + ". Calcola le coordinate di " + M(mono(k, "\\vec u", true) + mono(m, "\\vec v", false)) + ".", type: "tuple", ans: vIn(w), vars: [], form: ["rat"], atex: vT(w),
        sol: [M(mono(k, "\\vec u", true) + "=" + vT(u.map(x => k * x))) + ", " + M(mono(m, "\\vec v", true) + "=" + vT(v.map(x => m * x))) + ".", "Somma: " + M(vT(w)) + "."] }; }
    if (t === 2) { const A = randP(d), B = randP(d); const Mi = A.map((x, i) => q(x + B[i], 2));
      return { q: "Siano " + M(pt("A", A)) + " e " + M(pt("B", B)) + ". Scrivi le coordinate del punto medio I di [AB].", type: "tuple", ans: vIn(Mi), vars: [], form: ["rat"], atex: "I" + vT(Mi),
        sol: ["Faccio la media di ogni coordinata: " + M("I" + vT(Mi)) + "."] }; }
    const A = randP(2), B = randP(2), Cc = randP(2); const Dd = A.map((x, i) => x + Cc[i] - B[i]);
    return { q: "Siano " + M(pt("A", A)) + ", " + M(pt("B", B)) + ", " + M(pt("C", Cc)) + ". Trova D in modo che ABCD sia un parallelogramma.", type: "tuple", ans: vIn(Dd), vars: [], form: ["rat"], atex: "D" + vT(Dd),
      sol: [M("\\overrightarrow{AD}=\\overrightarrow{BC}") + " quindi " + M("D=A+C-B") + ".", M("D" + vT(Dd)) + "."] };
  },
});

sk({
  id: "c7-norme", ch: 8, title: "Lunghezza di un vettore e distanza",
  learn: L({
    idea: "La <b>norma</b> è la lunghezza della freccia. Si calcola con Pitagora: i due spostamenti sono i cateti, la freccia è l'ipotenusa.",
    rule: M("\\|\\vec u\\|=\\sqrt{x^2+y^2}") + " (piano) oppure " + M("\\sqrt{x^2+y^2+z^2}") + " (spazio). " + M("AB=\\|\\overrightarrow{AB}\\|") + ".",
    steps: ["Calcola le coordinate del vettore.", "Fai il quadrato di ognuna (sempre positivo).", "Somma, fai la radice e semplificala."],
    trap: M("\\sqrt{3^2+4^2}=5") + ", non " + M("3+4=7") + ".",
  }),
  gen() {
    const d = rnd() < 0.5 ? 2 : 3; let v = randV(d); if (rnd() < 0.3) v = pick([[3, 4], [6, 8], [5, 12], [1, 2, 2], [2, 3, 6], [4, 4, 7]]).map(x => x * sg());
    const s = v.reduce((a, x) => a + x * x, 0); const [k, m] = simplSqrt(s);
    const useAB = coin(); const A = randP(v.length), B = A.map((x, i) => x + v[i]);
    return { q: useAB ? "Calcola la distanza AB, con " + M(pt("A", A)) + " e " + M(pt("B", B)) + "." : "Calcola la norma (lunghezza) di " + M("\\vec u" + vT(v)) + ".", type: "num", ans: sqrtIn(k, m), form: ["sqrt"], atex: sqrtT(k, m),
      sol: [(useAB ? M("\\overrightarrow{AB}" + vT(v)) + ". " : "") + M("\\sqrt{" + v.map(x => tp(x) + "^2").join("+") + "}=\\sqrt{" + s + "}") + ".", m !== s ? "Semplifico: " + M("\\sqrt{" + s + "}=" + sqrtT(k, m)) + "." : "Risultato: " + M(sqrtT(k, m)) + "."] };
  },
});

sk({
  id: "c7-colineaires", ch: 8, title: "Vettori paralleli (collineari)",
  learn: L({
    idea: "Due vettori sono <b>collineari</b> se sono paralleli: uno è l'altro moltiplicato per un numero. C'è un test veloce con un « prodotto in croce ».",
    rule: M("\\vec u(x\\,;\\,y)") + " e " + M("\\vec v(x'\\,;\\,y')") + " sono collineari se e solo se " + M("xy'-yx'=0") + ".",
    steps: ["Scrivi " + M("xy'-yx'=0") + " con le coordinate.", "Risolvi per trovare la lettera."],
    trap: "Collineari = paralleli: possono anche andare in versi opposti.",
  }),
  gen() {
    const x = rnz(-6, 6), xp = rnz(-6, 6), yp = rnz(-8, 8); const m = q(x * yp, xp);
    return { q: "Per quale valore di " + M("m") + " i vettori " + M("\\vec u(" + x + "\\,;\\,m)") + " e " + M("\\vec v(" + xp + "\\,;\\," + yp + ")") + " sono collineari?", type: "num", ans: m.plain(), form: ["rat"], atex: "m=" + m.tex(),
      sol: [M(x + "\\times" + tp(yp) + "-m\\times" + tp(xp) + "=0") + ".", M(tx(xp) + "m=" + x * yp) + ", " + M("m=" + m.tex()) + "."] };
  },
});

sk({
  id: "c7-produit-scalaire", ch: 8, title: "Il prodotto scalare",
  learn: L({
    idea: "Il <b>prodotto scalare</b> prende due vettori e restituisce un solo <b>numero</b>. Dice quanto due frecce « vanno nella stessa direzione ».",
    rule: M("\\vec u\\cdot\\vec v=xx'+yy'") + " (piano) oppure " + M("xx'+yy'+zz'") + " (spazio).",
    steps: ["Moltiplica le coordinate a due a due (prima con prima, seconda con seconda…).", "Somma i prodotti."],
    trap: "Il risultato è un numero, non un vettore: " + M("(1;2)\\cdot(3;4)=3+8=11") + ".",
  }),
  gen() {
    const d = rnd() < 0.5 ? 2 : 3; const u = randV(d, -7, 7), v = randV(d, -7, 7); const s = u.reduce((a, x, i) => a + x * v[i], 0);
    return { q: "Calcola " + M("\\vec u\\cdot\\vec v") + " con " + M("\\vec u" + vT(u)) + " e " + M("\\vec v" + vT(v)) + ".", type: "num", ans: String(s), form: ["rat"], atex: String(s),
      sol: [M(u.map((x, i) => tp(x) + "\\times" + tp(v[i])).join("+") + "=" + u.map((x, i) => tp(x * v[i])).join("+") + "=" + s) + "."] };
  },
});

sk({
  id: "c7-orthogonalite", ch: 8, title: "Vettori perpendicolari (ortogonali)",
  learn: L({
    idea: "Due vettori sono <b>ortogonali</b> se formano un angolo retto (90°). In quel caso il prodotto scalare fa esattamente 0.",
    rule: M("\\vec u\\perp\\vec v\\iff\\vec u\\cdot\\vec v=0") + ".",
    steps: ["Scrivi il prodotto scalare con la lettera.", "Mettilo uguale a 0.", "Risolvi."],
    trap: "Ortogonali (prodotto scalare = 0) non vuol dire collineari (prodotto in croce = 0).",
  }),
  gen() {
    const d = coin() ? 2 : 3; const u = randV(d), v = randV(d); const k = ri(0, d - 1); if (v[k] === 0) v[k] = 2;
    const rest = u.reduce((a, x, i) => (i === k ? a : a + x * v[i]), 0); const m = q(-rest, v[k]);
    const uT = "\\left(" + u.map((x, i) => (i === k ? "m" : tx(x))).join("\\,;\\,") + "\\right)";
    return { q: "Per quale valore di " + M("m") + " i vettori " + M("\\vec u" + uT) + " e " + M("\\vec v" + vT(v)) + " sono ortogonali?", type: "num", ans: m.plain(), form: ["rat"], atex: "m=" + m.tex(),
      sol: [M("\\vec u\\cdot\\vec v=" + u.map((x, i) => (i === k ? tp(v[i]) + "m" : tp(x) + "\\times" + tp(v[i]))).join("+") + "=0") + ".", M(tx(v[k]) + "m" + sgnTex(rest) + "=0") + ", " + M("m=" + m.tex()) + "."] };
  },
});

sk({
  id: "c7-angle", ch: 8, title: "Prodotto scalare e angolo",
  learn: L({
    idea: "Il prodotto scalare si può calcolare anche con le lunghezze e l'angolo tra le frecce. Così, al contrario, si può trovare l'angolo.",
    rule: M("\\vec u\\cdot\\vec v=\\|\\vec u\\|\\times\\|\\vec v\\|\\times\\cos\\theta") + ", quindi " + M("\\cos\\theta=\\frac{\\vec u\\cdot\\vec v}{\\|\\vec u\\|\\|\\vec v\\|}") + ".",
    steps: ["Calcola (o leggi) il prodotto scalare e le lunghezze.", "Calcola " + M("\\cos\\theta") + ".", "Ritrova θ con i valori della tabella (θ tra 0 e π)."],
    trap: M("\\cos\\theta<0") + " → angolo ottuso (tra " + M("\\frac\\pi2") + " e π).",
  }),
  gen() {
    const k = pick([2, 3, 4, 6, 8, 9, 10]); const tv = trigOf(k); const nu = ri(1, 6), nv = ri(1, 6) * 2;
    const dot = constVal(parse(nu + "*" + nv + "*(" + tv.c + ")"))[0]; const dn = niceNum(dot);
    if (coin()) return { q: "Sappiamo che " + M("\\|\\vec u\\|=" + nu) + ", " + M("\\|\\vec v\\|=" + nv) + " e che l'angolo tra loro è " + M(piT(piK(k))) + ". Calcola " + M("\\vec u\\cdot\\vec v") + ".", type: "num", ans: dn.s, form: ["sqrt"], atex: dn.t,
      sol: [M("\\vec u\\cdot\\vec v=" + nu + "\\times" + nv + "\\times\\cos\\left(" + piT(piK(k)) + "\\right)=" + nu * nv + "\\times" + pr(tv.ct) + "=" + dn.t) + "."] };
    return { q: "Sappiamo che " + M("\\|\\vec u\\|=" + nu) + ", " + M("\\|\\vec v\\|=" + nv) + " e " + M("\\vec u\\cdot\\vec v=" + dn.t) + ". Qual è l'angolo tra " + M("\\vec u") + " e " + M("\\vec v") + " (in radianti)?", type: "num", ans: piIn(piK(k)), form: ["pi"], atex: piT(piK(k)),
      sol: [M("\\cos\\theta=" + frac(dn.t, nu * nv) + "=" + tv.ct) + ".", "Con θ tra 0 e π: " + M("\\theta=" + piT(piK(k))) + "."] };
  },
});

sk({
  id: "c7-droite-cartesienne", ch: 8, title: "Equazione cartesiana di una retta",
  learn: L({
    idea: "Una retta si può descrivere con un'equazione " + M("ax+by+c=0") + ". I numeri a e b sono legati alla direzione della retta: basta conoscerne uno e un punto.",
    rule: "Retta " + M("ax+by+c=0") + ": un vettore <b>direttore</b> (parallelo alla retta) è " + M("\\vec u(-b\\,;\\,a)") + ", un vettore <b>normale</b> (perpendicolare) è " + M("\\vec n(a\\,;\\,b)") + ".",
    steps: ["Direttore " + M("\\vec u(p\\,;\\,q)") + " → si può prendere " + M("a=q") + ", " + M("b=-p") + ". Normale " + M("\\vec n(a\\,;\\,b)") + " → a e b direttamente.", "Trova c mettendo le coordinate del punto noto: " + M("ax_A+by_A+c=0") + ".", "Scrivi l'equazione completa."],
    trap: "Una retta ha tante equazioni (si può moltiplicare tutto per uno stesso numero): sono tutte accettate.",
    input: "<code>2x-3y+5=0</code>.",
  }),
  gen() {
    const A = randP(2); const normal = coin(); const w = randV(2, -5, 5);
    const a = normal ? w[0] : w[1], b = normal ? w[1] : -w[0]; const c = -(a * A[0] + b * A[1]);
    const eq = mono(a, "x", true) + mono(b, "y", false) + (c ? sgnTex(c) : "") + "=0";
    return { q: "Scrivi un'equazione cartesiana della retta che passa per " + M(pt("A", A)) + " e ha vettore " + (normal ? "normale " + M("\\vec n" + vT(w)) : "direttore " + M("\\vec u" + vT(w))) + ".", type: "eqn", vars: ["x", "y"], ans: "(" + a + ")*x+(" + b + ")*y+(" + c + ")", atex: eq.replace(/^\+/, ""),
      sol: [normal ? "Vettore normale: " + M("a=" + a) + ", " + M("b=" + b) + "." : "Vettore direttore " + M("(" + w[0] + ";" + w[1] + ")") + ": " + M("a=" + a) + ", " + M("b=" + b) + ".", "Con A: " + M(tx(a) + "\\times" + tp(A[0]) + "+" + tp(b) + "\\times" + tp(A[1]) + "+c=0") + ", " + M("c=" + c) + ".", M(eq) + "."] };
  },
});

sk({
  id: "c7-droite-reduite", ch: 8, title: "Retta per due punti (y = mx + p)",
  learn: L({
    idea: "Hai già visto le rette " + M("y=mx+p") + " nella Tappa 0. Qui la trovi partendo da due punti: prima la pendenza, poi p.",
    rule: "Pendenza " + M("m=\\frac{y_B-y_A}{x_B-x_A}") + ", poi " + M("p=y_A-mx_A") + ".",
    steps: ["Calcola la pendenza m.", "Metti un punto in " + M("y=mx+p") + " per trovare p.", "Controlla con l'altro punto."],
    trap: "Stesso ordine sopra e sotto: " + M("y_B-y_A") + " e " + M("x_B-x_A") + ".",
  }),
  gen() {
    const A = randP(2); let B = randP(2); while (B[0] === A[0]) B[0] = A[0] + ri(1, 4);
    const m = q(B[1] - A[1], B[0] - A[0]), p = q(A[1]).sub(m.mul(A[0]));
    return { q: "Scrivi l'equazione " + M("y=mx+p") + " della retta (AB), con " + M(pt("A", A)) + " e " + M(pt("B", B)) + ".", type: "expr", ans: linIn(m, p), atex: "y=" + polyT([m, p]), lhs: 1, pre: "y =",
      sol: [M("m=" + frac(B[1] + "-" + tp(A[1]), B[0] + "-" + tp(A[0])) + "=" + m.tex()) + ".", M("p=" + A[1] + "-" + pr(m.tex()) + "\\times" + tp(A[0]) + "=" + p.tex()) + ".", M("y=" + polyT([m, p])) + "."] };
  },
});

function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
sk({
  id: "c7-produit-vectoriel", ch: 8, title: "Il prodotto vettoriale",
  learn: L({
    idea: "Nello spazio, il <b>prodotto vettoriale</b> di due vettori dà un <b>nuovo vettore</b> perpendicolare a tutti e due. Serve per trovare piani e aree.",
    rule: D("\\vec u\\wedge\\vec v=\\left(u_yv_z-u_zv_y\\,;\\;u_zv_x-u_xv_z\\,;\\;u_xv_y-u_yv_x\\right)"),
    steps: ["1ª coordinata: " + M("u_yv_z-u_zv_y") + ".", "2ª coordinata: " + M("u_zv_x-u_xv_z") + " (attenzione all'ordine: è qui che si sbaglia).", "3ª coordinata: " + M("u_xv_y-u_yv_x") + ".", "Controllo: il prodotto scalare con " + M("\\vec u") + " deve dare 0."],
    trap: "La 2ª coordinata ha un segno trappola: " + M("u_zv_x-u_xv_z") + ", non " + M("u_xv_z-u_zv_x") + ".",
  }),
  gen() {
    const u = randV(3, -4, 4), v = randV(3, -4, 4); const w = cross(u, v); if (w.every(x => x === 0)) return this.gen();
    return { q: "Calcola " + M("\\vec u\\wedge\\vec v") + " con " + M("\\vec u" + vT(u)) + " e " + M("\\vec v" + vT(v)) + ".", type: "tuple", ans: vIn(w), vars: [], form: ["rat"], atex: vT(w),
      traps: [{ ans: vIn([w[0], -w[1], w[2]]), m: "Errore di segno sulla 2ª coordinata: " + M("u_zv_x-u_xv_z") + "." }, { ans: vIn(w.map(x => -x)), m: "Hai calcolato " + M("\\vec v\\wedge\\vec u") + ": l'ordine conta (tutti i segni si invertono)." }],
      sol: [M("x: " + tp(u[1]) + "\\times" + tp(v[2]) + "-" + tp(u[2]) + "\\times" + tp(v[1]) + "=" + w[0]) + ".", M("y: " + tp(u[2]) + "\\times" + tp(v[0]) + "-" + tp(u[0]) + "\\times" + tp(v[2]) + "=" + w[1]) + ".", M("z: " + tp(u[0]) + "\\times" + tp(v[1]) + "-" + tp(u[1]) + "\\times" + tp(v[0]) + "=" + w[2]) + ".", M("\\vec u\\wedge\\vec v=" + vT(w)) + "."] };
  },
});

sk({
  id: "c7-plan", ch: 8, title: "Equazione di un piano",
  learn: L({
    idea: "Un piano nello spazio è come un foglio infinito. Si descrive con " + M("ax+by+cz+d=0") + ", dove (a ; b ; c) è una freccia perpendicolare al foglio.",
    rule: "Un piano con vettore normale " + M("\\vec n(a\\,;\\,b\\,;\\,c)") + " ha equazione " + M("ax+by+cz+d=0") + ". Per tre punti A, B, C: " + M("\\vec n=\\overrightarrow{AB}\\wedge\\overrightarrow{AC}") + ".",
    steps: ["Trova un vettore normale (dato, oppure con il prodotto vettoriale).", "Scrivi " + M("ax+by+cz+d=0") + " con le sue coordinate.", "Trova d mettendo un punto del piano."],
    trap: "Le equazioni proporzionali descrivono lo stesso piano: sono tutte accettate.",
    input: "<code>2x-y+3z-4=0</code>.",
  }),
  gen() {
    const A = randP(3); let n;
    let intro;
    if (coin()) { n = randV(3, -5, 5); intro = "con vettore normale " + M("\\vec n" + vT(n)); }
    else { const B = A.map(x => x + ri(-3, 3)), Cc = A.map(x => x + ri(-3, 3)); const ab = B.map((x, i) => x - A[i]), ac = Cc.map((x, i) => x - A[i]); n = cross(ab, ac); if (n.every(x => x === 0)) return this.gen(); intro = "che contiene anche " + M(pt("B", B)) + " e " + M(pt("C", Cc)) + " (usa " + M("\\overrightarrow{AB}\\wedge\\overrightarrow{AC}") + ")"; }
    const d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]);
    const eq = (mono(n[0], "x", true) + mono(n[1], "y", n[0] === 0) + mono(n[2], "z", n[0] === 0 && n[1] === 0) + (d ? sgnTex(d) : "") + "=0");
    return { q: "Scrivi un'equazione del piano che passa per " + M(pt("A", A)) + " " + intro + ".", type: "eqn", vars: ["x", "y", "z"], ans: "(" + n[0] + ")*x+(" + n[1] + ")*y+(" + n[2] + ")*z+(" + d + ")", atex: eq,
      sol: ["Vettore normale: " + M("\\vec n" + vT(n)) + ".", "Con A: " + M(n[0] + "\\times" + tp(A[0]) + "+" + tp(n[1]) + "\\times" + tp(A[1]) + "+" + tp(n[2]) + "\\times" + tp(A[2]) + "+d=0") + ", " + M("d=" + d) + ".", M(eq) + "."] };
  },
});

sk({
  id: "c7-aire-triangle", ch: 8, title: "Area di un triangolo nello spazio",
  learn: L({
    idea: "La lunghezza del prodotto vettoriale è l'area del parallelogramma costruito sulle due frecce. Un triangolo ne è la metà.",
    rule: "Area del triangolo ABC: " + M("\\mathcal A=\\frac12\\left\\|\\overrightarrow{AB}\\wedge\\overrightarrow{AC}\\right\\|") + ".",
    steps: ["Calcola " + M("\\overrightarrow{AB}") + " e " + M("\\overrightarrow{AC}") + ".", "Calcola il loro prodotto vettoriale.", "Calcola la sua lunghezza (norma), poi dividi per 2."],
    trap: "Non dimenticare " + M("\\frac12") + " (senza, è l'area del parallelogramma).",
  }),
  gen() {
    const A = randP(3); const ab = randV(3, -3, 3), ac = randV(3, -3, 3); const n = cross(ab, ac); if (n.every(x => x === 0)) return this.gen();
    const B = A.map((x, i) => x + ab[i]), Cc = A.map((x, i) => x + ac[i]); const s = n.reduce((a, x) => a + x * x, 0); const [k, m] = simplSqrt(s);
    const r = q(k, 2); const ans = m === 1 ? r.plain() : r.plain() + "*sqrt(" + m + ")"; const at = m === 1 ? r.tex() : r.d === 1 ? sqrtT(r.n, m) : frac((r.n === 1 ? "" : r.n) + "\\sqrt{" + m + "}", 2);
    return { q: "Calcola l'area del triangolo ABC con " + M(pt("A", A)) + ", " + M(pt("B", B)) + ", " + M(pt("C", Cc)) + ".", type: "num", ans, form: ["sqrt"], atex: at,
      traps: [{ ans: sqrtIn(k, m), m: "Questa è l'area del parallelogramma: dividi per 2." }],
      sol: [M("\\overrightarrow{AB}" + vT(ab)) + ", " + M("\\overrightarrow{AC}" + vT(ac)) + ".", M("\\overrightarrow{AB}\\wedge\\overrightarrow{AC}=" + vT(n)) + ", di norma " + M("\\sqrt{" + s + "}") + ".", M("\\mathcal A=\\frac12\\sqrt{" + s + "}=" + at) + "."] };
  },
});

sk({
  id: "c7-travail", ch: 8, title: "Il lavoro di una forza",
  learn: L({
    idea: "In fisica, il <b>lavoro</b> di una forza è il prodotto scalare tra la forza e lo spostamento: conta solo la parte di forza che « spinge nella direzione del movimento ».",
    rule: M("W=\\vec F\\cdot\\overrightarrow{AB}=F\\times AB\\times\\cos\\theta") + " (in joule se F è in N e AB in m).",
    steps: ["Con le coordinate: prodotto scalare coordinata per coordinata.", "Con lunghezze e angolo: " + M("F\\cdot d\\cdot\\cos\\theta") + " con i valori esatti."],
    trap: "Se la forza è perpendicolare allo spostamento, il lavoro è zero.",
  }),
  gen() {
    if (coin()) { const F = randV(2, -9, 9), d = randV(2, -6, 6); const W = F[0] * d[0] + F[1] * d[1];
      return { q: "Una forza " + M("\\vec F" + vT(F)) + " (in N) sposta un oggetto di " + M("\\overrightarrow{AB}" + vT(d)) + " (in m). Calcola il lavoro W (in J).", type: "num", ans: String(W), form: ["rat"], atex: W + "\\text{ J}",
        sol: [M("W=" + tp(F[0]) + "\\times" + tp(d[0]) + "+" + tp(F[1]) + "\\times" + tp(d[1]) + "=" + W) + " J."] }; }
    const Fn = ri(1, 10) * 10, dd = ri(1, 8) * 2, k = pick([0, 2, 3, 4, 6, 8]); const tv = trigOf(k); const W = constVal(parse(Fn + "*" + dd + "*(" + tv.c + ")"))[0]; const wn = niceNum(W);
    return { q: "Una forza di " + M(Fn) + " N forma un angolo di " + M(k * 15 + "^\\circ") + " con uno spostamento di " + M(dd) + " m. Calcola il lavoro (valore esatto, in J).", type: "num", ans: wn.s, form: ["sqrt"], atex: wn.t + "\\text{ J}",
      sol: [M("W=" + Fn + "\\times" + dd + "\\times\\cos(" + k * 15 + "^\\circ)=" + Fn * dd + "\\times" + pr(tv.ct) + "=" + wn.t) + " J."] };
  },
});
