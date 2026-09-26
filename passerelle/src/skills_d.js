/* =====================================================================
   COMPÉTENCES — escales 6 (intégrales), 7 (vecteurs), 8 (complexes)
   ===================================================================== */

/* valeur réelle → écriture exacte (p/q)·√m si possible */
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
function cTexNum(re, im, u) { // complexe (valeurs réelles) → TeX a + bi
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
/* nombres complexes exacts à parties rationnelles */
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

/* =========================== ESCALE 6 =========================== */
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
  id: "c6-primitives-usuelles", ch: 6, ref: 0, title: "Primitives usuelles",
  learn: L({
    idea: "Une primitive F de f est une fonction dont la dérivée est f : " + M("F'=f") + ". C'est la dérivée « à l'envers ».",
    rule: D("x^n\\to\\frac{x^{n+1}}{n+1}\\quad \\frac1x\\to\\ln x\\quad e^x\\to e^x\\quad \\frac1{x^2}\\to-\\frac1x") + D("\\sqrt x\\to\\frac23x\\sqrt x\\quad \\cos x\\to\\sin x\\quad \\sin x\\to-\\cos x") + "On ajoute toujours une constante " + M("+C") + ".",
    steps: ["Traite chaque terme séparément.", "Pour " + M("x^n") + " : augmente l'exposant de 1, divise par le nouvel exposant.", "Vérifie en dérivant ta réponse : tu dois retrouver f."],
    trap: "Primitive de " + M("\\sin x") + " : " + M("-\\cos x") + " (signe −). Primitive de " + M("\\frac1x") + " : " + M("\\ln x") + ", pas " + M("x^0/0") + ".",
    input: "<code>x^3/3+2ln(x)</code> (le <code>+C</code> est facultatif).",
  }),
  gen() {
    const T = primTerms();
    return { q: "Donne une primitive de " + M("f(x)=" + T.f) + " (sur " + M("]0;+\\infty[") + ").", type: "expr", prim: 1, ans: T.Fs, deriv: T.ds, dom: [0.3, 3], atex: "F(x)=" + T.F + "+C", lhs: 1, pre: "F(x) =",
      sol: ["Terme par terme, avec le tableau des primitives.", M("F(x)=" + T.F + "+C") + ".", "Vérification : en dérivant F on retrouve f."] };
  },
});

sk({
  id: "c6-primitives-composees", ch: 6, ref: 0, title: "Primitives de fonctions composées",
  learn: L({
    rule: D("e^{ax+b}\\to\\frac1ae^{ax+b}\\qquad (ax+b)^n\\to\\frac{(ax+b)^{n+1}}{a(n+1)}\\qquad \\frac{1}{ax+b}\\to\\frac1a\\ln(ax+b)") + D("\\frac{u'}{u}\\to\\ln|u|\\qquad u'e^u\\to e^u\\qquad u'u^n\\to\\frac{u^{n+1}}{n+1}\\qquad \\cos(ax)\\to\\frac1a\\sin(ax)"),
    steps: ["Reconnais la forme (u' × quelque chose de u ?).", "S'il manque un facteur constant, ajoute-le et compense : " + M("x\\,e^{x^2}=\\frac12\\cdot2x\\,e^{x^2}") + ".", "Vérifie en dérivant."],
    trap: "Oublier le " + M("\\frac1a") + " : la primitive de " + M("e^{3x}") + " est " + M("\\frac13e^{3x}") + ".",
  }),
  gen() {
    const t = ri(1, 7), a = ri(2, 5) * (coin() ? 1 : 1), b = rnz(-4, 4), n = ri(2, 4), k = ri(1, 5);
    const T = [null,
      ["e^{" + linT(a, b) + "}", "(1/" + a + ")*e^(" + linIn(a, b) + ")", frac(1, a) + "e^{" + linT(a, b) + "}", "e^(" + linIn(a, b) + ")", [0.2, 2]],
      [pr(linT(a, b)) + "^{" + n + "}", "(" + linIn(a, b) + ")^" + (n + 1) + "/" + a * (n + 1), frac(pr(linT(a, b)) + "^{" + (n + 1) + "}", a * (n + 1)), "(" + linIn(a, b) + ")^" + (n + 1) + "/" + (n + 1), [0.2, 2]],
      [frac(1, linT(a, Math.abs(b))), "(1/" + a + ")*ln(" + linIn(a, Math.abs(b)) + ")", frac(1, a) + "\\ln\\left(" + linT(a, Math.abs(b)) + "\\right)", "ln(" + linIn(a, Math.abs(b)) + ")", [0.2, 3]],
      [frac("2x", "x^2+" + k), "ln(x^2+" + k + ")", "\\ln\\left(x^2+" + k + "\\right)", null, [0.2, 3]],
      ["x\\,e^{x^2}", "(1/2)*e^(x^2)", "\\frac12e^{x^2}", "e^(x^2)", [0.1, 1.5]],
      ["\\cos(" + a + "x)", "(1/" + a + ")*sin(" + a + "x)", frac(1, a) + "\\sin(" + a + "x)", "sin(" + a + "x)", [0.2, 3]],
      ["x\\left(x^2+1\\right)^{" + n + "}", "(x^2+1)^" + (n + 1) + "/" + 2 * (n + 1), frac("\\left(x^2+1\\right)^{" + (n + 1) + "}", 2 * (n + 1)), "(x^2+1)^" + (n + 1) + "/" + (n + 1), [0.1, 1.5]],
    ][t];
    return { q: "Donne une primitive de " + M("f(x)=" + T[0]) + ".", type: "expr", prim: 1, ans: T[1], dom: T[4], atex: "F(x)=" + T[2] + "+C", lhs: 1, pre: "F(x) =",
      traps: T[3] ? [{ ans: T[3], m: "Il manque un facteur constant : dérive ta réponse, tu ne retombes pas exactement sur f." }] : [],
      sol: ["Forme reconnue (voir le tableau).", M("F(x)=" + T[2] + "+C") + ".", "Vérification : " + M("F'(x)=" + T[0]) + " ✔."] };
  },
});

sk({
  id: "c6-primitive-condition", ch: 6, ref: 0, title: "La primitive qui passe par un point",
  learn: L({
    rule: "Toutes les primitives de f sont " + M("F(x)+C") + ". Une condition " + M("F(x_0)=y_0") + " fixe la constante C.",
    steps: ["Écris une primitive générale " + M("F(x)+C") + ".", "Remplace x par " + M("x_0") + " et écris " + M("=y_0") + ".", "Résous pour trouver C.", "Écris F avec la bonne valeur de C."],
    trap: "Ici on veut <b>une seule</b> fonction : pas de " + M("+C") + " dans la réponse finale.",
  }),
  gen() {
    if (coin()) {
      const P = [rnz(-3, 3) * 3, rnz(-4, 4) * 2, rnz(-6, 6)]; const F = [P[0] / 3, P[1] / 2, P[2], 0].map(v => q(v));
      const x0 = ri(-2, 2), y0 = rnz(-8, 8); const C = q(y0).sub(pevalQ(F, q(x0))); const Ff = F.slice(0, 3).concat([C]);
      return { q: "Trouve la primitive F de " + M("f(x)=" + polyT(P)) + " telle que " + M("F(" + x0 + ")=" + y0) + ".", type: "expr", ans: polyIn(Ff), atex: "F(x)=" + polyT(Ff), lhs: 1, pre: "F(x) =",
        sol: [M("F(x)=" + polyT(F.slice(0, 3).concat([0])) + "+C") + ".", M("F(" + x0 + ")=" + pevalQ(F, q(x0)).tex() + "+C=" + y0) + ", donc " + M("C=" + C.tex()) + ".", M("F(x)=" + polyT(Ff)) + "."] };
    }
    const a = rnz(-4, 4), y0 = rnz(-6, 6); const C = y0 - a;
    return { q: "Trouve la primitive F de " + M("f(x)=" + mono(a, "e^{x}", true)) + " telle que " + M("F(0)=" + y0) + ".", type: "expr", ans: a + "*e^x+(" + C + ")", atex: "F(x)=" + mono(a, "e^{x}", true) + (C ? sgnTex(C) : ""), lhs: 1, pre: "F(x) =",
      sol: [M("F(x)=" + mono(a, "e^x", true) + "+C") + ".", M("F(0)=" + a + "+C=" + y0) + ", donc " + M("C=" + C) + ".", M("F(x)=" + mono(a, "e^{x}", true) + (C ? sgnTex(C) : "")) + "."] };
  },
});

sk({
  id: "c6-integrale-polynome", ch: 6, ref: 1, title: "Calculer une intégrale (polynôme)",
  learn: L({
    rule: M("\\int_a^b f(x)\\,dx=\\big[F(x)\\big]_a^b=F(b)-F(a)") + ", où F est une primitive de f.",
    steps: ["Trouve une primitive F (sans +C).", "Calcule F(b) puis F(a) (avec des parenthèses).", "Fais F(b) − F(a).", "Simplifie."],
    trap: "C'est F(b) − F(a), dans cet ordre (borne du haut moins borne du bas).",
  }),
  gen() {
    const P = [rnz(-2, 2), rnz(-4, 4), rnz(-6, 6)]; if (coin()) P.shift();
    const n = P.length - 1; const F = P.map((c, i) => q(c, n - i + 1)).concat([q(0)]);
    const a = ri(-2, 1), b = a + ri(1, 3); const v = pevalQ(F, q(b)).sub(pevalQ(F, q(a)));
    return { q: "Calcule " + M("\\int_{" + a + "}^{" + b + "}\\left(" + polyT(P) + "\\right)dx") + ".", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(),
      traps: [{ ans: v.neg().plain(), m: "C'est F(b) − F(a) : borne du haut moins borne du bas." }],
      sol: ["Primitive : " + M("F(x)=" + polyT(F)) + ".", M("F(" + b + ")=" + pevalQ(F, q(b)).tex()) + ", " + M("F(" + a + ")=" + pevalQ(F, q(a)).tex()) + ".", M("\\int=F(" + b + ")-F(" + a + ")=" + v.tex()) + "."] };
  },
});

sk({
  id: "c6-integrale-usuelles", ch: 6, ref: 1, title: "Intégrales avec exp, ln, sin, cos",
  learn: L({
    rule: "Même méthode " + M("[F]_a^b=F(b)-F(a)") + ", avec les valeurs à connaître : " + M("e^0=1") + ", " + M("\\ln1=0") + ", " + M("\\ln e=1") + ", " + M("\\sin0=0") + ", " + M("\\cos0=1") + ", " + M("\\cos\\pi=-1") + ".",
    steps: ["Primitive.", "Remplace par les bornes.", "Utilise les valeurs exactes (ne donne pas de valeur approchée)."],
    trap: M("\\left[-\\cos x\\right]_0^\\pi=-\\cos\\pi-(-\\cos0)=1+1=2") + " : attention aux doubles signes.",
    input: "<code>(e^2-1)/2</code>, <code>ln(2)</code>, <code>2</code>.",
  }),
  gen() {
    const k = ri(1, 3), n = ri(1, 3), m = ri(2, 5);
    const T = [
      ["\\int_0^1 e^{" + (k === 1 ? "" : k) + "x}dx", "(e^" + k + "-1)/" + k, frac("e^{" + k + "}-1", k).replace("\\frac{e^{1}-1}{1}", "e-1").replace("{1}", "1"), [M("F(x)=" + frac(1, k) + "e^{" + k + "x}") + ".", M(frac(1, k) + "(e^{" + k + "}-e^0)=" + frac("e^{" + k + "}-1", k)) + "."]],
      ["\\int_1^{e^{" + n + "}}\\frac{" + m + "}{x}dx", String(m * n), String(m * n), [M("F(x)=" + m + "\\ln x") + ".", M(m + "\\ln(e^{" + n + "})-" + m + "\\ln1=" + m + "\\times" + n + "=" + m * n) + "."]],
      ["\\int_0^{\\pi/2}\\cos x\\,dx", "1", "1", [M("F(x)=\\sin x") + ".", M("\\sin\\frac\\pi2-\\sin0=1") + "."]],
      ["\\int_0^{\\pi}\\sin x\\,dx", "2", "2", [M("F(x)=-\\cos x") + ".", M("-\\cos\\pi-(-\\cos0)=1+1=2") + "."]],
      ["\\int_0^{" + m + "}\\frac{2x}{x^2+1}dx", "ln(" + (m * m + 1) + ")", "\\ln " + (m * m + 1), ["Forme " + M("\\frac{u'}{u}") + " : " + M("F(x)=\\ln(x^2+1)") + ".", M("\\ln(" + (m * m + 1) + ")-\\ln1=\\ln " + (m * m + 1)) + "."]],
      ["\\int_1^{" + m + "}\\frac{1}{x^2}dx", "1-1/" + m, q(m - 1, m).tex(), [M("F(x)=-\\frac1x") + ".", M("-\\frac1{" + m + "}-(-1)=" + q(m - 1, m).tex()) + "."]],
      ["\\int_0^{\\ln " + m + "}e^{x}dx", String(m - 1), String(m - 1), [M("F(x)=e^x") + ".", M("e^{\\ln " + m + "}-e^0=" + m + "-1=" + (m - 1)) + "."]],
      ["\\int_1^{" + m * m + "}\\frac{1}{\\sqrt x}dx", String(2 * (m - 1)), String(2 * (m - 1)), [M("F(x)=2\\sqrt x") + ".", M("2\\sqrt{" + m * m + "}-2\\sqrt1=" + 2 * m + "-2=" + 2 * (m - 1)) + "."]],
    ];
    const [e, ans, at, s] = pick(T);
    return { q: "Calcule la valeur exacte de " + M(e) + ".", type: "num", ans, allow: ["e", "ln", "pi", "sqrt"], atex: at, sol: s };
  },
});

sk({
  id: "c6-aire", ch: 6, ref: 1, title: "Aire sous une courbe (avec changement de signe)",
  learn: L({
    rule: "Si " + M("f\\ge0") + " sur " + M("[a;b]") + ", l'aire vaut " + M("\\int_a^bf") + ". Si " + M("f\\le0") + ", l'aire vaut " + M("-\\int_a^bf") + ". Si f change de signe, on <b>coupe</b> l'intervalle à chaque zéro.",
    steps: ["Trouve où f s'annule dans " + M("[a;b]") + ".", "Étudie le signe de f sur chaque morceau.", "Calcule l'intégrale de chaque morceau, prends sa valeur positive.", "Additionne."],
    trap: "Une intégrale peut être négative, une aire jamais.",
  }),
  gen() {
    if (coin()) {
      const k = ri(1, 3), B = k + ri(1, 2); const F = x => q(x * x * x, 3).sub(k * k * x);
      const A1 = F(k).sub(F(0)).neg(), A2 = F(B).sub(F(k)), A = A1.add(A2), I = F(B).sub(F(0));
      return { q: "Calcule l'aire (en unités d'aire) entre la courbe de " + M("f(x)=x^2-" + k * k) + ", l'axe des abscisses et les droites " + M("x=0") + " et " + M("x=" + B) + ".", type: "num", ans: A.plain(), form: ["rat"], atex: A.tex(),
        traps: [{ ans: I.plain(), m: "C'est l'intégrale, pas l'aire : f change de signe en " + k + ", il faut couper l'intervalle." }],
        sol: ["f s'annule en " + M("x=" + k) + " : " + M("f\\le0") + " sur " + M("[0;" + k + "]") + ", " + M("f\\ge0") + " sur " + M("[" + k + ";" + B + "]") + ".", M("\\int_0^{" + k + "}f=" + A1.neg().tex()) + " → aire " + M(A1.tex()) + " ; " + M("\\int_{" + k + "}^{" + B + "}f=" + A2.tex()) + ".", "Aire totale : " + M(A1.tex() + "+" + A2.tex() + "=" + A.tex()) + "."] };
    }
    const c = ri(1, 4), b = c + ri(1, 4); const A = q(c * c, 2).add(q((b - c) * (b - c), 2)), I = q(b * b, 2).sub(c * b);
    return { q: "Calcule l'aire entre la droite " + M("y=x-" + c) + ", l'axe des abscisses et les droites " + M("x=0") + " et " + M("x=" + b) + ".", type: "num", ans: A.plain(), form: ["rat"], atex: A.tex(),
      traps: [{ ans: I.plain(), m: "C'est l'intégrale (qui compte négativement la partie sous l'axe). Coupe en x = " + c + "." }],
      sol: ["La droite coupe l'axe en " + M("x=" + c) + ".", "Deux triangles : " + M("\\frac{" + c + "\\times" + c + "}{2}") + " (sous l'axe) et " + M("\\frac{" + (b - c) + "\\times" + (b - c) + "}{2}") + " (au-dessus).", "Aire : " + M(A.tex()) + "."] };
  },
});

sk({
  id: "c6-aire-courbes", ch: 6, ref: 2, title: "Aire entre deux courbes",
  learn: L({
    rule: "Si " + M("g\\ge f") + " sur " + M("[a;b]") + ", l'aire entre les courbes vaut " + M("\\int_a^b\\big(g(x)-f(x)\\big)dx") + " (courbe du haut moins courbe du bas).",
    steps: ["Trouve les points d'intersection : résous " + M("f(x)=g(x)") + ".", "Repère quelle courbe est au-dessus (teste une valeur).", "Intègre « haut − bas » entre les intersections."],
    trap: "Ne calcule pas les deux aires séparément sous chaque courbe si l'une passe sous l'axe : utilise directement " + M("g-f") + ".",
  }),
  gen() {
    const r1 = ri(-3, 1), r2 = r1 + ri(1, 4), p = rnz(-3, 3); const s = r1 + r2, t = -r1 * r2 + p;
    const A = q(Math.pow(r2 - r1, 3), 6);
    return { q: "Calcule l'aire du domaine compris entre " + M("f(x)=x^2" + sgnTex(p)) + " et la droite " + M("g(x)=" + polyT([s, t])) + ".", type: "num", ans: A.plain(), form: ["rat"], atex: A.tex(),
      sol: ["Intersections : " + M("x^2" + sgnTex(p) + "=" + polyT([s, t]) + "\\iff " + polyT([1, -s, r1 * r2]) + "=0") + ", soit " + M("x=" + r1) + " et " + M("x=" + r2) + ".", "Entre les deux, la droite est au-dessus : " + M("g(x)-f(x)=" + polyT([-1, s, -r1 * r2])) + ".", M("\\int_{" + r1 + "}^{" + r2 + "}\\left(" + polyT([-1, s, -r1 * r2]) + "\\right)dx=" + A.tex()) + "."] };
  },
});

sk({
  id: "c6-valeur-moyenne", ch: 6, ref: 2, title: "Valeur moyenne",
  learn: L({
    rule: "Valeur moyenne de f sur " + M("[a;b]") + " : " + M("\\mu=\\frac1{b-a}\\int_a^bf(x)\\,dx") + ".",
    steps: ["Calcule l'intégrale.", "Divise par la longueur de l'intervalle " + M("b-a") + "."],
    trap: "Ne pas oublier de diviser par " + M("b-a") + ".",
  }),
  gen() {
    if (rnd() < 0.75) {
      const P = [rnz(-3, 3), rnz(-4, 4), rnz(-6, 6)]; const F = [q(P[0], 3), q(P[1], 2), q(P[2]), q(0)];
      const a = ri(-2, 1), b = a + ri(1, 4); const I = pevalQ(F, q(b)).sub(pevalQ(F, q(a))), mu = I.div(b - a);
      return { q: "Calcule la valeur moyenne de " + M("f(x)=" + polyT(P)) + " sur " + M("[" + a + "\\,;\\," + b + "]") + ".", type: "num", ans: mu.plain(), form: ["rat"], atex: mu.tex(),
        traps: b - a > 1 ? [{ ans: I.plain(), m: "C'est l'intégrale : il faut encore diviser par " + (b - a) + "." }] : [],
        sol: [M("\\int_{" + a + "}^{" + b + "}f=" + I.tex()) + ".", M("\\mu=\\frac1{" + (b - a) + "}\\times" + pr(I.tex()) + "=" + mu.tex()) + "."] };
    }
    return { q: "Calcule la valeur moyenne de " + M("f(x)=e^x") + " sur " + M("[0\\,;\\,2]") + ".", type: "num", ans: "(e^2-1)/2", allow: ["e"], atex: "\\frac{e^2-1}{2}",
      sol: [M("\\int_0^2e^x\\,dx=e^2-1") + ".", M("\\mu=\\frac{e^2-1}{2}") + "."] };
  },
});

sk({
  id: "c6-ipp", ch: 6, ref: 3, title: "Intégration par parties",
  learn: L({
    rule: D("\\int_a^bu\\,v'\\,dx=\\big[uv\\big]_a^b-\\int_a^bu'\\,v\\,dx"),
    steps: ["Choisis u = ce qui se simplifie en dérivant (un polynôme, ou ln x).", "Choisis v' = ce qui s'intègre facilement (" + M("e^x") + ", " + M("\\sin x") + ", " + M("\\cos x") + ", ou 1).", "Calcule u' et v.", "Applique la formule et termine le calcul."],
    trap: "Avec ln x : on prend " + M("u=\\ln x") + " (et " + M("v'=1") + " ou " + M("v'=x") + "), jamais " + M("v'=\\ln x") + ".",
  }),
  gen() {
    const t = ri(1, 6);
    if (t === 1) { const a = rnz(-3, 3), b = rnz(-4, 4); const re = b, co = a - b; // ∫0^1 (ax+b)e^x = b·e + (a − b)
      const at = (re === 0 ? "" : (re === 1 ? "" : re === -1 ? "-" : re) + "e") + (co === 0 ? (re === 0 ? "0" : "") : (co > 0 && re !== 0 ? "+" : "") + co);
      return { q: "Calcule " + M("\\int_0^1\\left(" + linT(a, b) + "\\right)e^x\\,dx") + ".", type: "num", ans: re + "*e+(" + co + ")", allow: ["e"], atex: at,
        sol: [M("u=" + linT(a, b) + ",\\ u'=" + a) + " ; " + M("v'=e^x,\\ v=e^x") + ".", M("\\left[(" + linT(a, b) + ")e^x\\right]_0^1-\\int_0^1" + tp(a) + "e^x\\,dx=" + (a + b) + "e-" + tp(b) + "-" + tp(a) + "(e-1)") + ".", "= " + M(at) + "."] }; }
    const T = [null, null,
      ["\\int_1^e\\ln x\\,dx", "1", "1", [M("u=\\ln x,\\ u'=\\frac1x") + " ; " + M("v'=1,\\ v=x") + ".", M("[x\\ln x]_1^e-\\int_1^e1\\,dx=e-(e-1)=1") + "."]],
      ["\\int_1^e x\\ln x\\,dx", "(e^2+1)/4", "\\frac{e^2+1}{4}", [M("u=\\ln x,\\ u'=\\frac1x") + " ; " + M("v'=x,\\ v=\\frac{x^2}2") + ".", M("\\left[\\frac{x^2}{2}\\ln x\\right]_1^e-\\int_1^e\\frac x2dx=\\frac{e^2}2-\\frac{e^2-1}{4}=\\frac{e^2+1}{4}") + "."]],
      ["\\int_0^\\pi x\\sin x\\,dx", "pi", "\\pi", [M("u=x,\\ u'=1") + " ; " + M("v'=\\sin x,\\ v=-\\cos x") + ".", M("[-x\\cos x]_0^\\pi+\\int_0^\\pi\\cos x\\,dx=\\pi+0=\\pi") + "."]],
      ["\\int_0^{\\pi/2} x\\cos x\\,dx", "pi/2-1", "\\frac\\pi2-1", [M("u=x,\\ u'=1") + " ; " + M("v'=\\cos x,\\ v=\\sin x") + ".", M("[x\\sin x]_0^{\\pi/2}-\\int_0^{\\pi/2}\\sin x\\,dx=\\frac\\pi2-1") + "."]],
      ["\\int_0^1 x\\,e^{-x}dx", "1-2/e", "1-\\frac2e", [M("u=x,\\ u'=1") + " ; " + M("v'=e^{-x},\\ v=-e^{-x}") + ".", M("[-xe^{-x}]_0^1+\\int_0^1e^{-x}dx=-e^{-1}+(1-e^{-1})=1-\\frac2e") + "."]],
    ];
    const [e, ans, at, s] = T[t];
    return { q: "Calcule (par parties) " + M(e) + ".", type: "num", ans, allow: ["e", "pi"], atex: at, sol: s };
  },
});

sk({
  id: "c6-physique", ch: 6, ref: 4, title: "Intégrales en physique",
  learn: L({
    rule: "Distance parcourue : " + M("d=\\int_{t_1}^{t_2}v(t)\\,dt") + " (si v ≥ 0). Charge : " + M("q=\\int i(t)\\,dt") + ". Travail d'une force variable : " + M("W=\\int_{x_1}^{x_2}F(x)\\,dx") + ".",
    steps: ["Identifie la grandeur à intégrer et la variable.", "Calcule l'intégrale entre les bonnes bornes.", "Donne l'unité."],
    trap: "Ressort : " + M("F=kx") + " donne " + M("W=\\frac12k(x_2^2-x_1^2)") + ", pas " + M("k(x_2-x_1)") + ".",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) { const a = ri(1, 4) * 2, b = ri(0, 6), T = ri(1, 5); const d = (a * T * T) / 2 + b * T;
      return { q: "Un mobile a une vitesse " + M("v(t)=" + polyT([a, b], "t")) + " (m/s). Quelle distance (en m) parcourt-il entre " + M("t=0") + " et " + M("t=" + T) + " s ?", type: "num", ans: String(d), form: ["rat"], atex: d + "\\text{ m}",
        sol: [M("d=\\int_0^{" + T + "}\\left(" + polyT([a, b], "t") + "\\right)dt=\\left[" + polyT([a / 2, b, 0], "t") + "\\right]_0^{" + T + "}") + ".", M("=" + d) + " m."] }; }
    if (t === 2) { const k = ri(1, 9) * 10, x1 = q(ri(0, 2), 10), x2 = x1.add(q(ri(1, 3), 10)); const W = x2.mul(x2).sub(x1.mul(x1)).mul(k).div(2);
      return { q: "Un ressort de raideur " + M("k=" + k) + " N/m est étiré de " + M("x_1=" + fmtNum(x1.v)) + " m à " + M("x_2=" + fmtNum(x2.v)) + " m. Calcule le travail " + M("W=\\int_{x_1}^{x_2}kx\\,dx") + " (en J).", type: "num", ans: W.plain(), atex: fmtNum(W.v) + "\\text{ J}",
        sol: [M("W=\\left[\\frac12kx^2\\right]_{x_1}^{x_2}=\\frac12\\times" + k + "\\times(" + fmtNum(x2.v) + "^2-" + fmtNum(x1.v) + "^2)") + ".", M("W=" + fmtNum(W.v)) + " J."] }; }
    const I = ri(1, 9), tau = ri(1, 4);
    return { q: "Un courant vaut " + M("i(t)=" + I + "e^{-t/" + tau + "}") + " (A). Quelle charge (en C) traverse le circuit entre " + M("t=0") + " et " + M("t=" + tau + "\\ln2") + " s ?", type: "num", ans: String((I * tau) / 2), form: ["rat"], atex: fmtNum((I * tau) / 2) + "\\text{ C}",
      sol: [M("q=\\int_0^{" + tau + "\\ln2}" + I + "e^{-t/" + tau + "}dt=\\left[-" + I * tau + "e^{-t/" + tau + "}\\right]_0^{" + tau + "\\ln2}") + ".", M("=-" + I * tau + "\\times\\frac12+" + I * tau + "=" + fmtNum((I * tau) / 2)) + " C."] };
  },
});

sk({
  id: "c6-proprietes", ch: 6, ref: 1, title: "Linéarité et relation de Chasles",
  learn: L({
    rule: M("\\int_a^b(\\alpha f+\\beta g)=\\alpha\\int_a^bf+\\beta\\int_a^bg") + " ; " + M("\\int_a^bf+\\int_b^cf=\\int_a^cf") + " ; " + M("\\int_b^af=-\\int_a^bf") + " ; " + M("\\int_a^b k\\,dx=k(b-a)") + ".",
    steps: ["Découpe l'intégrale demandée avec ces règles.", "Remplace par les valeurs connues.", "Calcule."],
    trap: "Inverser les bornes change le signe.",
  }),
  gen() {
    const a = ri(-2, 1), b = a + ri(1, 3), c = b + ri(1, 3), p = rnz(-8, 8), r = rnz(-8, 8), s = rnz(-8, 8), k = ri(2, 5), m = ri(2, 4);
    const T = [
      ["\\int_{" + a + "}^{" + c + "}f(x)\\,dx", p + r, "Chasles : " + M("\\int_{" + a + "}^{" + b + "}f+\\int_{" + b + "}^{" + c + "}f=" + p + sgnTex(r) + "=" + (p + r)) + "."],
      ["\\int_{" + a + "}^{" + b + "}\\big(" + k + "f(x)-" + m + "g(x)\\big)dx", k * p - m * s, "Linéarité : " + M(k + "\\times" + tp(p) + "-" + m + "\\times" + tp(s) + "=" + (k * p - m * s)) + "."],
      ["\\int_{" + b + "}^{" + a + "}f(x)\\,dx", -p, "Bornes inversées : " + M("-\\int_{" + a + "}^{" + b + "}f=" + -p) + "."],
      ["\\int_{" + a + "}^{" + b + "}\\big(f(x)+" + k + "\\big)dx", p + k * (b - a), M("\\int f+\\int " + k + "=" + p + "+" + k + "\\times" + (b - a) + "=" + (p + k * (b - a))) + "."],
    ];
    const [e, v, s0] = pick(T);
    return { q: "On sait que " + M("\\int_{" + a + "}^{" + b + "}f=" + p) + ", " + M("\\int_{" + b + "}^{" + c + "}f=" + r) + " et " + M("\\int_{" + a + "}^{" + b + "}g=" + s) + ". Calcule " + M(e) + ".", type: "num", ans: String(v), form: ["rat"], atex: String(v), sol: [s0] };
  },
});

/* =========================== ESCALE 7 =========================== */
const pt = (n, P) => n + "\\left(" + P.map(tx).join("\\,;\\,") + "\\right)";
function randP(d) { const P = []; for (let i = 0; i < d; i++) P.push(ri(-7, 7)); return P; }
function randV(d, lo = -6, hi = 6) { let v; do { v = []; for (let i = 0; i < d; i++) v.push(ri(lo, hi)); } while (v.every(x => x === 0)); return v; }

sk({
  id: "c7-coordonnees", ch: 7, ref: 0, title: "Coordonnées d'un vecteur AB",
  learn: L({
    rule: M("\\overrightarrow{AB}=\\left(x_B-x_A\\,;\\,y_B-y_A\\right)") + " : <b>arrivée moins départ</b> (et " + M("z_B-z_A") + " dans l'espace).",
    steps: ["Écris les coordonnées de B (l'arrivée).", "Soustrais celles de A (le départ), composante par composante.", "Attention aux doubles signes : " + M("3-(-2)=5") + "."],
    trap: M("\\overrightarrow{AB}") + " va de A vers B : c'est B − A, pas A − B.",
    input: "<code>(3;-5)</code> ou <code>(3;-5;2)</code>.",
  }),
  gen() {
    const d = rnd() < 0.6 ? 2 : 3; const A = randP(d), B = randP(d); const v = B.map((x, i) => x - A[i]);
    return { q: "Soit " + M(pt("A", A)) + " et " + M(pt("B", B)) + ". Donne les coordonnées de " + M("\\overrightarrow{AB}") + ".", type: "tuple", ans: vIn(v), vars: [], form: ["rat"], atex: "\\overrightarrow{AB}" + vT(v),
      traps: [{ ans: vIn(v.map(x => -x)), m: "C'est B − A (arrivée moins départ), pas A − B." }],
      sol: [M("\\overrightarrow{AB}=\\left(" + B.map((b, i) => tx(b) + "-" + tp(A[i])).join("\\,;\\,") + "\\right)=" + vT(v)) + "."] };
  },
});

sk({
  id: "c7-operations", ch: 7, ref: 1, title: "Opérations sur les vecteurs",
  learn: L({
    rule: "On calcule composante par composante : " + M("k\\vec u+m\\vec v=(ku_x+mv_x\\,;\\,ku_y+mv_y)") + ". Milieu de [AB] : " + M("\\left(\\frac{x_A+x_B}2\\,;\\,\\frac{y_A+y_B}2\\right)") + ". ABCD est un parallélogramme si " + M("\\overrightarrow{AB}=\\overrightarrow{DC}") + ".",
    steps: ["Écris chaque vecteur multiplié par son coefficient.", "Additionne composante par composante.", "Pour un parallélogramme : " + M("D=A+C-B") + "."],
    trap: M("-3\\times(-2)=+6") + " : attention aux signes.",
  }),
  gen() {
    const t = ri(1, 3), d = rnd() < 0.6 ? 2 : 3;
    if (t === 1) { const u = randV(d), v = randV(d), k = rnz(-3, 3), m = rnz(-3, 3); const w = u.map((x, i) => k * x + m * v[i]);
      return { q: "Soit " + M("\\vec u" + vT(u)) + " et " + M("\\vec v" + vT(v)) + ". Calcule les coordonnées de " + M(mono(k, "\\vec u", true) + mono(m, "\\vec v", false)) + ".", type: "tuple", ans: vIn(w), vars: [], form: ["rat"], atex: vT(w),
        sol: [M(mono(k, "\\vec u", true) + "=" + vT(u.map(x => k * x))) + ", " + M(mono(m, "\\vec v", true) + "=" + vT(v.map(x => m * x))) + ".", "Somme : " + M(vT(w)) + "."] }; }
    if (t === 2) { const A = randP(d), B = randP(d); const Mi = A.map((x, i) => q(x + B[i], 2));
      return { q: "Soit " + M(pt("A", A)) + " et " + M(pt("B", B)) + ". Donne les coordonnées du milieu I de [AB].", type: "tuple", ans: vIn(Mi), vars: [], form: ["rat"], atex: "I" + vT(Mi),
        sol: ["On fait la moyenne de chaque coordonnée : " + M("I" + vT(Mi)) + "."] }; }
    const A = randP(2), B = randP(2), Cc = randP(2); const Dd = A.map((x, i) => x + Cc[i] - B[i]);
    return { q: "Soit " + M(pt("A", A)) + ", " + M(pt("B", B)) + ", " + M(pt("C", Cc)) + ". Trouve D tel que ABCD soit un parallélogramme.", type: "tuple", ans: vIn(Dd), vars: [], form: ["rat"], atex: "D" + vT(Dd),
      sol: [M("\\overrightarrow{AD}=\\overrightarrow{BC}") + " donc " + M("D=A+C-B") + ".", M("D" + vT(Dd)) + "."] };
  },
});

sk({
  id: "c7-norme", ch: 7, ref: 0, title: "Norme et distance",
  learn: L({
    rule: M("\\|\\vec u\\|=\\sqrt{x^2+y^2}") + " (plan) ou " + M("\\sqrt{x^2+y^2+z^2}") + " (espace). " + M("AB=\\|\\overrightarrow{AB}\\|") + ".",
    steps: ["Calcule les coordonnées du vecteur.", "Mets chaque composante au carré (toujours positif).", "Additionne, prends la racine et simplifie-la."],
    trap: M("\\sqrt{3^2+4^2}=5") + ", pas " + M("3+4=7") + ".",
  }),
  gen() {
    const d = rnd() < 0.5 ? 2 : 3; let v = randV(d); if (rnd() < 0.3) v = pick([[3, 4], [6, 8], [5, 12], [1, 2, 2], [2, 3, 6], [4, 4, 7]]).map(x => x * sg());
    const s = v.reduce((a, x) => a + x * x, 0); const [k, m] = simplSqrt(s);
    const useAB = coin(); const A = randP(v.length), B = A.map((x, i) => x + v[i]);
    return { q: useAB ? "Calcule la distance AB, avec " + M(pt("A", A)) + " et " + M(pt("B", B)) + "." : "Calcule la norme de " + M("\\vec u" + vT(v)) + ".", type: "num", ans: sqrtIn(k, m), form: ["sqrt"], atex: sqrtT(k, m),
      sol: [(useAB ? M("\\overrightarrow{AB}" + vT(v)) + ". " : "") + M("\\sqrt{" + v.map(x => tp(x) + "^2").join("+") + "}=\\sqrt{" + s + "}") + ".", m !== s ? "On simplifie : " + M("\\sqrt{" + s + "}=" + sqrtT(k, m)) + "." : "Résultat : " + M(sqrtT(k, m)) + "."] };
  },
});

sk({
  id: "c7-colineaires", ch: 7, ref: 2, title: "Vecteurs colinéaires",
  learn: L({
    rule: M("\\vec u(x\\,;\\,y)") + " et " + M("\\vec v(x'\\,;\\,y')") + " sont colinéaires si et seulement si " + M("xy'-yx'=0") + " (produit en croix).",
    steps: ["Écris " + M("xy'-yx'=0") + " avec les coordonnées.", "Résous pour trouver le paramètre."],
    trap: "Colinéaires = « parallèles » : ils peuvent être de sens contraires.",
  }),
  gen() {
    const x = rnz(-6, 6), xp = rnz(-6, 6), yp = rnz(-8, 8); const m = q(x * yp, xp);
    return { q: "Pour quelle valeur de " + M("m") + " les vecteurs " + M("\\vec u(" + x + "\\,;\\,m)") + " et " + M("\\vec v(" + xp + "\\,;\\," + yp + ")") + " sont-ils colinéaires ?", type: "num", ans: m.plain(), form: ["rat"], atex: "m=" + m.tex(),
      sol: [M(x + "\\times" + tp(yp) + "-m\\times" + tp(xp) + "=0") + ".", M(tx(xp) + "m=" + x * yp) + ", " + M("m=" + m.tex()) + "."] };
  },
});

sk({
  id: "c7-produit-scalaire", ch: 7, ref: 3, title: "Produit scalaire (coordonnées)",
  learn: L({
    rule: M("\\vec u\\cdot\\vec v=xx'+yy'") + " (plan) ou " + M("xx'+yy'+zz'") + " (espace). Le résultat est un <b>nombre</b>, pas un vecteur.",
    steps: ["Multiplie les composantes deux à deux.", "Additionne les produits."],
    trap: "Ne réponds pas avec un vecteur : " + M("(1;2)\\cdot(3;4)=3+8=11") + ".",
  }),
  gen() {
    const d = rnd() < 0.5 ? 2 : 3; const u = randV(d, -7, 7), v = randV(d, -7, 7); const s = u.reduce((a, x, i) => a + x * v[i], 0);
    return { q: "Calcule " + M("\\vec u\\cdot\\vec v") + " avec " + M("\\vec u" + vT(u)) + " et " + M("\\vec v" + vT(v)) + ".", type: "num", ans: String(s), form: ["rat"], atex: String(s),
      sol: [M(u.map((x, i) => tp(x) + "\\times" + tp(v[i])).join("+") + "=" + u.map((x, i) => tp(x * v[i])).join("+") + "=" + s) + "."] };
  },
});

sk({
  id: "c7-orthogonalite", ch: 7, ref: 3, title: "Vecteurs orthogonaux",
  learn: L({
    rule: M("\\vec u\\perp\\vec v\\iff\\vec u\\cdot\\vec v=0") + ".",
    steps: ["Écris le produit scalaire avec le paramètre.", "Pose-le égal à 0.", "Résous."],
    trap: "Orthogonal (produit scalaire nul) n'est pas colinéaire (produit en croix nul).",
  }),
  gen() {
    const d = coin() ? 2 : 3; const u = randV(d), v = randV(d); const k = ri(0, d - 1); if (v[k] === 0) v[k] = 2;
    const rest = u.reduce((a, x, i) => (i === k ? a : a + x * v[i]), 0); const m = q(-rest, v[k]);
    const uT = "\\left(" + u.map((x, i) => (i === k ? "m" : tx(x))).join("\\,;\\,") + "\\right)";
    return { q: "Pour quelle valeur de " + M("m") + " les vecteurs " + M("\\vec u" + uT) + " et " + M("\\vec v" + vT(v)) + " sont-ils orthogonaux ?", type: "num", ans: m.plain(), form: ["rat"], atex: "m=" + m.tex(),
      sol: [M("\\vec u\\cdot\\vec v=" + u.map((x, i) => (i === k ? tp(v[i]) + "m" : tp(x) + "\\times" + tp(v[i]))).join("+") + "=0") + ".", M(tx(v[k]) + "m" + sgnTex(rest) + "=0") + ", " + M("m=" + m.tex()) + "."] };
  },
});

sk({
  id: "c7-angle", ch: 7, ref: 3, title: "Produit scalaire et angle",
  learn: L({
    rule: M("\\vec u\\cdot\\vec v=\\|\\vec u\\|\\times\\|\\vec v\\|\\times\\cos\\theta") + ", donc " + M("\\cos\\theta=\\frac{\\vec u\\cdot\\vec v}{\\|\\vec u\\|\\|\\vec v\\|}") + ".",
    steps: ["Calcule (ou lis) le produit scalaire et les normes.", "Calcule " + M("\\cos\\theta") + ".", "Retrouve θ avec les valeurs remarquables (θ entre 0 et π)."],
    trap: M("\\cos\\theta<0") + " → angle obtus (entre " + M("\\frac\\pi2") + " et π).",
  }),
  gen() {
    const k = pick([2, 3, 4, 6, 8, 9, 10]); const tv = trigOf(k); const nu = ri(1, 6), nv = ri(1, 6) * 2;
    const dot = constVal(parse(nu + "*" + nv + "*(" + tv.c + ")"))[0]; const dn = niceNum(dot);
    if (coin()) return { q: "On sait que " + M("\\|\\vec u\\|=" + nu) + ", " + M("\\|\\vec v\\|=" + nv) + " et que l'angle entre eux vaut " + M(piT(piK(k))) + ". Calcule " + M("\\vec u\\cdot\\vec v") + ".", type: "num", ans: dn.s, form: ["sqrt"], atex: dn.t,
      sol: [M("\\vec u\\cdot\\vec v=" + nu + "\\times" + nv + "\\times\\cos\\left(" + piT(piK(k)) + "\\right)=" + nu * nv + "\\times" + pr(tv.ct) + "=" + dn.t) + "."] };
    return { q: "On sait que " + M("\\|\\vec u\\|=" + nu) + ", " + M("\\|\\vec v\\|=" + nv) + " et " + M("\\vec u\\cdot\\vec v=" + dn.t) + ". Quel est l'angle entre " + M("\\vec u") + " et " + M("\\vec v") + " (en radians) ?", type: "num", ans: piIn(piK(k)), form: ["pi"], atex: piT(piK(k)),
      sol: [M("\\cos\\theta=" + frac(dn.t, nu * nv) + "=" + tv.ct) + ".", "Avec θ entre 0 et π : " + M("\\theta=" + piT(piK(k))) + "."] };
  },
});

sk({
  id: "c7-droite-cartesienne", ch: 7, ref: 4, title: "Équation cartésienne d'une droite",
  learn: L({
    rule: "Une droite a une équation " + M("ax+by+c=0") + ". Un vecteur <b>directeur</b> est " + M("\\vec u(-b\\,;\\,a)") + ", un vecteur <b>normal</b> est " + M("\\vec n(a\\,;\\,b)") + ".",
    steps: ["Directeur " + M("\\vec u(p\\,;\\,q)") + " → on peut prendre " + M("a=q") + ", " + M("b=-p") + ". Normal " + M("\\vec n(a\\,;\\,b)") + " → a et b directement.", "Trouve c en remplaçant les coordonnées du point connu : " + M("ax_A+by_A+c=0") + ".", "Écris l'équation complète."],
    trap: "Une droite a une infinité d'équations cartésiennes (on peut tout multiplier par un même nombre) : toutes sont acceptées.",
    input: "<code>2x-3y+5=0</code>.",
  }),
  gen() {
    const A = randP(2); const normal = coin(); const w = randV(2, -5, 5);
    const a = normal ? w[0] : w[1], b = normal ? w[1] : -w[0]; const c = -(a * A[0] + b * A[1]);
    const eq = mono(a, "x", true) + mono(b, "y", false) + (c ? sgnTex(c) : "") + "=0";
    return { q: "Donne une équation cartésienne de la droite passant par " + M(pt("A", A)) + " et de vecteur " + (normal ? "normal " + M("\\vec n" + vT(w)) : "directeur " + M("\\vec u" + vT(w))) + ".", type: "eqn", vars: ["x", "y"], ans: "(" + a + ")*x+(" + b + ")*y+(" + c + ")", atex: eq.replace(/^\+/, ""),
      sol: [normal ? "Vecteur normal : " + M("a=" + a) + ", " + M("b=" + b) + "." : "Vecteur directeur " + M("(" + w[0] + ";" + w[1] + ")") + " : " + M("a=" + a) + ", " + M("b=" + b) + ".", "Avec A : " + M(tx(a) + "\\times" + tp(A[0]) + "+" + tp(b) + "\\times" + tp(A[1]) + "+c=0") + ", " + M("c=" + c) + ".", M(eq) + "."] };
  },
});

sk({
  id: "c7-droite-reduite", ch: 7, ref: 4, title: "Droite passant par deux points (y = mx + p)",
  learn: L({
    rule: "Pente " + M("m=\\frac{y_B-y_A}{x_B-x_A}") + ", puis " + M("p=y_A-mx_A") + ".",
    steps: ["Calcule la pente m.", "Remplace un point dans " + M("y=mx+p") + " pour trouver p.", "Vérifie avec l'autre point."],
    trap: "Même ordre en haut et en bas : " + M("y_B-y_A") + " et " + M("x_B-x_A") + ".",
  }),
  gen() {
    const A = randP(2); let B = randP(2); while (B[0] === A[0]) B[0] = A[0] + ri(1, 4);
    const m = q(B[1] - A[1], B[0] - A[0]), p = q(A[1]).sub(m.mul(A[0]));
    return { q: "Donne l'équation réduite de la droite (AB), avec " + M(pt("A", A)) + " et " + M(pt("B", B)) + ".", type: "expr", ans: linIn(m, p), atex: "y=" + polyT([m, p]), lhs: 1, pre: "y =",
      sol: [M("m=" + frac(B[1] + "-" + tp(A[1]), B[0] + "-" + tp(A[0])) + "=" + m.tex()) + ".", M("p=" + A[1] + "-" + pr(m.tex()) + "\\times" + tp(A[0]) + "=" + p.tex()) + ".", M("y=" + polyT([m, p])) + "."] };
  },
});

function cross(u, v) { return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; }
sk({
  id: "c7-produit-vectoriel", ch: 7, ref: 5, title: "Produit vectoriel",
  learn: L({
    rule: D("\\vec u\\wedge\\vec v=\\left(u_yv_z-u_zv_y\\,;\\;u_zv_x-u_xv_z\\,;\\;u_xv_y-u_yv_x\\right)") + "Le résultat est un vecteur <b>orthogonal</b> à " + M("\\vec u") + " et à " + M("\\vec v") + ".",
    steps: ["1re composante : cache la 1re ligne, calcule le « déterminant » " + M("u_yv_z-u_zv_y") + ".", "2e composante : " + M("u_zv_x-u_xv_z") + " (attention à l'ordre, c'est là que l'on se trompe).", "3e composante : " + M("u_xv_y-u_yv_x") + ".", "Vérifie : le résultat scalaire " + M("\\vec u") + " doit donner 0."],
    trap: "La 2e composante a un signe piège : " + M("u_zv_x-u_xv_z") + ", pas " + M("u_xv_z-u_zv_x") + ".",
  }),
  gen() {
    const u = randV(3, -4, 4), v = randV(3, -4, 4); const w = cross(u, v); if (w.every(x => x === 0)) return this.gen();
    return { q: "Calcule " + M("\\vec u\\wedge\\vec v") + " avec " + M("\\vec u" + vT(u)) + " et " + M("\\vec v" + vT(v)) + ".", type: "tuple", ans: vIn(w), vars: [], form: ["rat"], atex: vT(w),
      traps: [{ ans: vIn([w[0], -w[1], w[2]]), m: "Erreur de signe sur la 2e composante : " + M("u_zv_x-u_xv_z") + "." }, { ans: vIn(w.map(x => -x)), m: "C'est " + M("\\vec v\\wedge\\vec u") + " : l'ordre compte (tout est de signe opposé)." }],
      sol: [M("x: " + tp(u[1]) + "\\times" + tp(v[2]) + "-" + tp(u[2]) + "\\times" + tp(v[1]) + "=" + w[0]) + ".", M("y: " + tp(u[2]) + "\\times" + tp(v[0]) + "-" + tp(u[0]) + "\\times" + tp(v[2]) + "=" + w[1]) + ".", M("z: " + tp(u[0]) + "\\times" + tp(v[1]) + "-" + tp(u[1]) + "\\times" + tp(v[0]) + "=" + w[2]) + ".", M("\\vec u\\wedge\\vec v=" + vT(w)) + "."] };
  },
});

sk({
  id: "c7-plan", ch: 7, ref: 5, title: "Équation d'un plan",
  learn: L({
    rule: "Un plan de vecteur normal " + M("\\vec n(a\\,;\\,b\\,;\\,c)") + " a une équation " + M("ax+by+cz+d=0") + ". Par trois points A, B, C : " + M("\\vec n=\\overrightarrow{AB}\\wedge\\overrightarrow{AC}") + ".",
    steps: ["Trouve un vecteur normal (donné, ou produit vectoriel).", "Écris " + M("ax+by+cz+d=0") + " avec ses coordonnées.", "Trouve d en remplaçant un point du plan."],
    trap: "Toutes les équations proportionnelles décrivent le même plan : elles sont toutes acceptées.",
    input: "<code>2x-y+3z-4=0</code>.",
  }),
  gen() {
    const A = randP(3); let n;
    let intro;
    if (coin()) { n = randV(3, -5, 5); intro = "de vecteur normal " + M("\\vec n" + vT(n)); }
    else { const B = A.map(x => x + ri(-3, 3)), Cc = A.map(x => x + ri(-3, 3)); const ab = B.map((x, i) => x - A[i]), ac = Cc.map((x, i) => x - A[i]); n = cross(ab, ac); if (n.every(x => x === 0)) return this.gen(); intro = "contenant aussi " + M(pt("B", B)) + " et " + M(pt("C", Cc)) + " (utilise " + M("\\overrightarrow{AB}\\wedge\\overrightarrow{AC}") + ")"; }
    const d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]);
    const eq = (mono(n[0], "x", true) + mono(n[1], "y", n[0] === 0) + mono(n[2], "z", n[0] === 0 && n[1] === 0) + (d ? sgnTex(d) : "") + "=0");
    return { q: "Donne une équation du plan passant par " + M(pt("A", A)) + " " + intro + ".", type: "eqn", vars: ["x", "y", "z"], ans: "(" + n[0] + ")*x+(" + n[1] + ")*y+(" + n[2] + ")*z+(" + d + ")", atex: eq,
      sol: ["Vecteur normal : " + M("\\vec n" + vT(n)) + ".", "Avec A : " + M(n[0] + "\\times" + tp(A[0]) + "+" + tp(n[1]) + "\\times" + tp(A[1]) + "+" + tp(n[2]) + "\\times" + tp(A[2]) + "+d=0") + ", " + M("d=" + d) + ".", M(eq) + "."] };
  },
});

sk({
  id: "c7-aire-triangle", ch: 7, ref: 5, title: "Aire d'un triangle dans l'espace",
  learn: L({
    rule: "Aire du triangle ABC : " + M("\\mathcal A=\\frac12\\left\\|\\overrightarrow{AB}\\wedge\\overrightarrow{AC}\\right\\|") + ".",
    steps: ["Calcule " + M("\\overrightarrow{AB}") + " et " + M("\\overrightarrow{AC}") + ".", "Calcule leur produit vectoriel.", "Calcule sa norme, puis divise par 2."],
    trap: "Ne pas oublier le " + M("\\frac12") + " (la norme du produit vectoriel donne l'aire du parallélogramme).",
  }),
  gen() {
    const A = randP(3); const ab = randV(3, -3, 3), ac = randV(3, -3, 3); const n = cross(ab, ac); if (n.every(x => x === 0)) return this.gen();
    const B = A.map((x, i) => x + ab[i]), Cc = A.map((x, i) => x + ac[i]); const s = n.reduce((a, x) => a + x * x, 0); const [k, m] = simplSqrt(s);
    const r = q(k, 2); const ans = m === 1 ? r.plain() : r.plain() + "*sqrt(" + m + ")"; const at = m === 1 ? r.tex() : r.d === 1 ? sqrtT(r.n, m) : frac((r.n === 1 ? "" : r.n) + "\\sqrt{" + m + "}", 2);
    return { q: "Calcule l'aire du triangle ABC avec " + M(pt("A", A)) + ", " + M(pt("B", B)) + ", " + M(pt("C", Cc)) + ".", type: "num", ans, form: ["sqrt"], atex: at,
      traps: [{ ans: sqrtIn(k, m), m: "C'est l'aire du parallélogramme : divise par 2." }],
      sol: [M("\\overrightarrow{AB}" + vT(ab)) + ", " + M("\\overrightarrow{AC}" + vT(ac)) + ".", M("\\overrightarrow{AB}\\wedge\\overrightarrow{AC}=" + vT(n)) + ", de norme " + M("\\sqrt{" + s + "}") + ".", M("\\mathcal A=\\frac12\\sqrt{" + s + "}=" + at) + "."] };
  },
});

sk({
  id: "c7-travail", ch: 7, ref: 3, title: "Travail d'une force",
  learn: L({
    rule: "Travail d'une force constante sur un déplacement : " + M("W=\\vec F\\cdot\\overrightarrow{AB}=F\\times AB\\times\\cos\\theta") + " (en joules si F en N et AB en m).",
    steps: ["Avec des coordonnées : produit scalaire composante par composante.", "Avec des normes et un angle : " + M("F\\cdot d\\cdot\\cos\\theta") + " avec les valeurs exactes."],
    trap: "Si la force est perpendiculaire au déplacement, le travail est nul.",
  }),
  gen() {
    if (coin()) { const F = randV(2, -9, 9), d = randV(2, -6, 6); const W = F[0] * d[0] + F[1] * d[1];
      return { q: "Une force " + M("\\vec F" + vT(F)) + " (en N) déplace un objet de " + M("\\overrightarrow{AB}" + vT(d)) + " (en m). Calcule le travail W (en J).", type: "num", ans: String(W), form: ["rat"], atex: W + "\\text{ J}",
        sol: [M("W=" + tp(F[0]) + "\\times" + tp(d[0]) + "+" + tp(F[1]) + "\\times" + tp(d[1]) + "=" + W) + " J."] }; }
    const Fn = ri(1, 10) * 10, dd = ri(1, 8) * 2, k = pick([0, 2, 3, 4, 6, 8]); const tv = trigOf(k); const W = constVal(parse(Fn + "*" + dd + "*(" + tv.c + ")"))[0]; const wn = niceNum(W);
    return { q: "Une force de " + M(Fn) + " N fait un angle de " + M(k * 15 + "^\\circ") + " avec un déplacement de " + M(dd) + " m. Calcule le travail (valeur exacte, en J).", type: "num", ans: wn.s, form: ["sqrt"], atex: wn.t + "\\text{ J}",
      sol: [M("W=" + Fn + "\\times" + dd + "\\times\\cos(" + k * 15 + "^\\circ)=" + Fn * dd + "\\times" + pr(tv.ct) + "=" + wn.t) + " J."] };
  },
});

/* =========================== ESCALE 8 =========================== */
const I1 = [q(0), q(1)];
function randZ(lo = -6, hi = 6) { let a, b; do { a = ri(lo, hi); b = ri(lo, hi); } while (b === 0); return cq(a, b); }

sk({
  id: "c8-puissances-i", ch: 8, ref: 0, title: "Les puissances de i",
  learn: L({
    rule: M("i^2=-1") + ", " + M("i^3=-i") + ", " + M("i^4=1") + " : les puissances de i reviennent tous les 4. Donc " + M("i^n=i^{r}") + " où r est le reste de la division de n par 4.",
    steps: ["Divise l'exposant par 4 et garde le reste r.", "r = 0 → 1 ; r = 1 → i ; r = 2 → −1 ; r = 3 → −i."],
    trap: M("i^2=-1") + ", pas 1.",
    input: "<code>-i</code>, <code>1</code>.",
  }),
  gen() {
    const n = ri(5, 2030); const r = n % 4; const vals = [cq(1, 0), cq(0, 1), cq(-1, 0), cq(0, -1)];
    if (coin()) return { q: "Calcule " + M("i^{" + n + "}") + ".", type: "num", ans: cIn(vals[r]), allow: ["i"], form: ["algebraic"], atex: cT(vals[r]),
      sol: [M(n + "=4\\times" + Math.floor(n / 4) + "+" + r) + ".", M("i^{" + n + "}=(i^4)^{" + Math.floor(n / 4) + "}\\times i^{" + r + "}=i^{" + r + "}=" + cT(vals[r])) + "."] };
    const a = ri(2, 30), b = ri(2, 30); const rr = (a + b) % 4;
    return { q: "Calcule " + M("i^{" + a + "}\\times i^{" + b + "}") + ".", type: "num", ans: cIn(vals[rr]), allow: ["i"], form: ["algebraic"], atex: cT(vals[rr]),
      sol: [M("i^{" + a + "}\\times i^{" + b + "}=i^{" + (a + b) + "}") + ".", M((a + b) + "=4\\times" + Math.floor((a + b) / 4) + "+" + rr) + ", donc " + M(cT(vals[rr])) + "."] };
  },
});

sk({
  id: "c8-calculs", ch: 8, ref: 1, title: "Calculer avec des complexes",
  learn: L({
    rule: "On calcule comme avec des polynômes en i, en remplaçant " + M("i^2") + " par " + M("-1") + ". " + M("(a+bi)(a-bi)=a^2+b^2") + ".",
    steps: ["Développe (4 produits).", "Remplace " + M("i^2") + " par " + M("-1") + ".", "Regroupe partie réelle et partie imaginaire : " + M("a+bi") + "."],
    trap: M("(2i)^2=4i^2=-4") + ".",
    input: "<code>7-4i</code>, <code>-3+i/2</code>.",
  }),
  gen() {
    const t = ri(1, 4); const z = randZ(), w = randZ();
    let r, qt, s;
    if (t === 1) { r = coin() ? cAdd(z, w) : cSub(z, w); const op = r[0].eq(z[0].add(w[0])) && r[1].eq(z[1].add(w[1])) ? "+" : "-"; qt = cP(z) + op + cP(w); s = ["Partie réelle avec partie réelle, imaginaire avec imaginaire : " + M(cT(r)) + "."]; }
    else if (t === 2) { r = cMul(z, w); qt = cP(z) + cP(w); s = ["On développe : " + M(z[0].mul(w[0]).tex() + sgnTex(z[0].mul(w[1])) + "i" + sgnTex(z[1].mul(w[0])) + "i" + sgnTex(z[1].mul(w[1])) + "i^2") + ".", M("i^2=-1") + " : " + M(cT(r)) + "."]; }
    else if (t === 3) { r = cMul(z, z); qt = cP(z) + "^2"; s = [M("(a+bi)^2=a^2+2abi+b^2i^2=a^2-b^2+2abi") + ".", M("=" + z[0].mul(z[0]).tex() + "-" + z[1].mul(z[1]).tex() + sgnTex(z[0].mul(z[1]).mul(2)) + "i=" + cT(r)) + "."]; }
    else { const zb = [z[0], z[1].neg()]; r = cMul(z, zb); qt = cP(z) + cP(zb); s = [M("(a+bi)(a-bi)=a^2+b^2") + " : " + M(z[0].mul(z[0]).tex() + "+" + z[1].mul(z[1]).tex() + "=" + cT(r)) + "."]; }
    const trap = t === 2 ? [z[0].mul(w[0]).add(z[1].mul(w[1])), z[0].mul(w[1]).add(z[1].mul(w[0]))] : t === 3 ? [z[0].mul(z[0]).add(z[1].mul(z[1])), z[0].mul(z[1]).mul(2)] : null;
    return { q: "Écris sous forme algébrique : " + M(qt), type: "num", ans: cIn(r), allow: ["i"], form: ["algebraic"], atex: cT(r),
      traps: trap ? [{ ans: cIn(trap), m: M("i^2=-1") + ", pas +1." }] : [], sol: s };
  },
});

sk({
  id: "c8-division", ch: 8, ref: 1, title: "Diviser des complexes",
  learn: L({
    rule: "Pour diviser, on multiplie en haut et en bas par le <b>conjugué</b> du dénominateur : " + M("\\frac{z}{a+bi}=\\frac{z(a-bi)}{a^2+b^2}") + ".",
    steps: ["Écris le conjugué du dénominateur (change le signe de i).", "Multiplie numérateur et dénominateur par ce conjugué.", "En bas : " + M("a^2+b^2") + " (un réel). En haut : développe.", "Sépare en " + M("\\frac{\\ldots}{\\ldots}+\\frac{\\ldots}{\\ldots}i") + " et simplifie."],
    trap: "Ne divise pas « partie réelle par partie réelle » : " + M("\\frac{4+6i}{2+3i}") + " vaut 2, mais " + M("\\frac{4+6i}{1+2i}\\ne4+3i") + ".",
  }),
  gen() {
    const w = randZ(-4, 4); let r;
    if (coin()) { r = randZ(-5, 5); } else { const n = randZ(-5, 5); r = cDiv(n, w); }
    const z = cMul(r, w); const wb = [w[0], w[1].neg()]; const N = cMul(z, wb), dd = w[0].mul(w[0]).add(w[1].mul(w[1]));
    const trap = [z[0].div(w[0].n === 0 ? 1 : w[0]), z[1].div(w[1])];
    return { q: "Écris sous forme algébrique : " + M(frac(cT(z), cT(w))), type: "num", ans: cIn(r), allow: ["i"], form: ["algebraic"], atex: cT(r),
      traps: [{ ans: cIn(trap), m: "On ne divise pas partie par partie : multiplie par le conjugué du dénominateur." }],
      sol: ["Conjugué du dénominateur : " + M(cT(wb)) + ".", M(frac(cP(z) + cP(wb), cP(w) + cP(wb)) + "=" + frac(cT(N), dd.tex())) + ".", M("=" + cT(r)) + "."] };
  },
});

sk({
  id: "c8-re-im-conjugue", ch: 8, ref: 1, title: "Partie réelle, imaginaire, conjugué",
  learn: L({
    rule: "Si " + M("z=a+bi") + " : " + M("\\text{Re}(z)=a") + ", " + M("\\text{Im}(z)=b") + " (un <b>réel</b>, sans i), " + M("\\bar z=a-bi") + ".",
    steps: ["Mets d'abord z sous forme algébrique.", "Lis a et b.", "Conjugué : change le signe devant i."],
    trap: "La partie imaginaire de " + M("3-5i") + " est " + M("-5") + ", pas " + M("-5i") + ".",
  }),
  gen() {
    const z = randZ(-5, 5), w = randZ(-4, 4); const r = cMul(z, w); const t = ri(1, 3);
    if (t === 3) { const rb = [r[0], r[1].neg()]; return { q: "Donne le conjugué de " + M("z=" + cP(z) + cP(w)) + " (forme algébrique).", type: "num", ans: cIn(rb), allow: ["i"], form: ["algebraic"], atex: cT(rb),
      traps: [{ ans: cIn(r), m: "C'est z lui-même : le conjugué change le signe de la partie imaginaire." }], sol: ["Forme algébrique : " + M("z=" + cT(r)) + ".", M("\\bar z=" + cT(rb)) + "."] }; }
    const re = t === 1; const v = re ? r[0] : r[1];
    return { q: "Donne la partie " + (re ? "réelle" : "imaginaire") + " de " + M("z=" + cP(z) + cP(w)) + ".", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(),
      sol: ["On développe : " + M("z=" + cT(r)) + ".", M("\\text{" + (re ? "Re" : "Im") + "}(z)=" + v.tex()) + (re ? "." : " (un réel, sans i).")] };
  },
});

sk({
  id: "c8-module", ch: 8, ref: 2, title: "Module d'un complexe",
  learn: L({
    rule: M("|a+bi|=\\sqrt{a^2+b^2}") + " (la distance à l'origine). " + M("|z_1z_2|=|z_1|\\,|z_2|") + " et " + M("\\left|\\frac{z_1}{z_2}\\right|=\\frac{|z_1|}{|z_2|}") + ".",
    steps: ["Lis a et b (sans le i).", "Calcule " + M("a^2+b^2") + ".", "Prends la racine et simplifie.", "Pour un produit ou un quotient, multiplie ou divise les modules."],
    trap: M("|3-4i|=\\sqrt{9+16}=5") + " : " + M("b^2=(-4)^2=16") + ", pas " + M("(-4i)^2") + ".",
  }),
  gen() {
    if (coin()) { let z = randZ(-8, 8); if (rnd() < 0.4) { const [a, b] = pick([[3, 4], [5, 12], [6, 8], [8, 15], [1, 1], [2, 2]]); z = cq(a * sg(), b * sg()); }
      const s = z[0].n * z[0].n + z[1].n * z[1].n; const [k, m] = simplSqrt(s);
      return { q: "Calcule " + M("\\left|" + cT(z) + "\\right|") + ".", type: "num", ans: sqrtIn(k, m), form: ["sqrt"], atex: sqrtT(k, m),
        sol: [M("\\sqrt{" + tp(z[0].n) + "^2+" + tp(z[1].n) + "^2}=\\sqrt{" + s + "}") + (m !== s ? "=" + M(sqrtT(k, m)) : "") + "."] }; }
    const [a, b] = pick([[3, 4], [1, 1], [5, 12], [1, 2], [2, 1]]), [c, d] = pick([[1, 1], [3, 4], [1, 3], [2, 2], [6, 8]]);
    const m1 = a * a + b * b, m2 = c * c + d * d; const prod = coin();
    const val = prod ? Math.sqrt(m1 * m2) : Math.sqrt(m1 / m2); const n = niceNum(val); if (!n) return this.gen();
    const z1 = cT(cq(a, b)), z2 = cT(cq(c, -d));
    return { q: "Calcule le module de " + M(prod ? pr(z1) + pr(z2) : frac(z1, z2)) + " (sans développer).", type: "num", ans: n.s, form: ["sqrt"], atex: n.t,
      sol: [M("|" + z1 + "|=\\sqrt{" + m1 + "}") + " et " + M("|" + z2 + "|=\\sqrt{" + m2 + "}") + ".", (prod ? "Module d'un produit = produit des modules : " + M("\\sqrt{" + m1 + "}\\times\\sqrt{" + m2 + "}") : "Module d'un quotient = quotient des modules : " + M(frac("\\sqrt{" + m1 + "}", "\\sqrt{" + m2 + "}"))) + " = " + M(n.t) + "."] };
  },
});

/* complexes « remarquables » : r·(cos θ + i sin θ) avec parties exactes */
function niceZ() {
  const k = pick(K12.filter(v => v % 2 === 0 || v % 3 === 0)); const kk = k > 12 ? k - 24 : k; const tv = trigOf(kk);
  const ref = tv.ref; const scale = ref === 3 ? pick([1, 2, 3]) : ref === 2 || ref === 4 ? pick([2, 4, 6]) : pick([1, 2, 3, 5]);
  const rIn = ref === 3 ? scale + "*sqrt(2)" : String(scale), rT = ref === 3 ? sqrtT(scale, 2) : String(scale);
  const r = ref === 3 ? scale * Math.SQRT2 : scale; const th = (kk * Math.PI) / 12;
  const re = r * Math.cos(th), im = r * Math.sin(th);
  return { k: kk, rIn, rT, re, im, zT: cTexNum(re, im), zIn: cInNum(re, im), tv };
}
sk({
  id: "c8-argument", ch: 8, ref: 2, title: "Argument d'un complexe",
  learn: L({
    rule: "L'argument θ est l'angle entre l'axe réel et le point z. " + M("\\cos\\theta=\\frac a{|z|}") + " et " + M("\\sin\\theta=\\frac b{|z|}") + ". On le donne en général dans " + M("]-\\pi\\,;\\,\\pi]") + ".",
    steps: ["Calcule " + M("|z|") + ".", "Calcule " + M("\\cos\\theta=\\frac a{|z|}") + " et " + M("\\sin\\theta=\\frac b{|z|}") + ".", "Reconnais l'angle (tableau) en tenant compte des deux signes.", "Place le point pour vérifier le quadrant."],
    trap: "Un complexe « en bas » (b < 0) a un argument négatif dans " + M("]-\\pi\\,;\\,\\pi]") + ".",
    input: "<code>-3pi/4</code>.",
  }),
  gen() {
    const Z = niceZ(); if (Z.k === 0 && Z.im === 0 && Z.re < 0) return this.gen();
    return { q: "Donne un argument (dans " + M("]-\\pi\\,;\\,\\pi]") + ") de " + M("z=" + Z.zT) + ".", type: "num", ans: piIn(piK(Z.k)), form: ["pi"], atex: piT(piK(Z.k)),
      traps: Z.tv.s === "0" ? [] : [{ ans: piIn(piK(-Z.k)), m: "Regarde le signe de la partie imaginaire : il donne le signe de l'argument." }],
      sol: [M("|z|=" + Z.rT) + ".", M("\\cos\\theta=" + Z.tv.ct) + " et " + M("\\sin\\theta=" + Z.tv.st) + ".", M("\\theta=" + piT(piK(Z.k))) + "."] };
  },
});

sk({
  id: "c8-algebrique-exponentielle", ch: 8, ref: 3, title: "Passer à la forme exponentielle",
  learn: L({
    rule: M("z=a+bi=r\\,e^{i\\theta}") + " avec " + M("r=|z|") + " et " + M("\\theta=\\arg z") + ". (Forme trigonométrique : " + M("r(\\cos\\theta+i\\sin\\theta)") + ".)",
    steps: ["Calcule le module r.", "Trouve l'argument θ (cos et sin).", "Écris " + M("r\\,e^{i\\theta}") + "."],
    trap: "Le module r est toujours positif : " + M("-2e^{i\\pi/3}") + " n'est pas une forme exponentielle.",
    input: "<code>2e^(i*pi/3)</code> ou <code>sqrt(2)e^(-3iπ/4)</code>.",
  }),
  gen() {
    const Z = niceZ();
    return { q: "Écris sous forme exponentielle : " + M("z=" + Z.zT), type: "num", ans: Z.rIn + "*e^(i*" + piIn(piK(Z.k)) + ")", allow: ["i", "pi", "sqrt", "e"], form: ["expform"], atex: (Z.rT === "1" ? "" : Z.rT) + "e^{" + expT(Z.k) + "}",
      sol: [M("r=|z|=" + Z.rT) + ".", M("\\cos\\theta=" + Z.tv.ct) + ", " + M("\\sin\\theta=" + Z.tv.st) + " → " + M("\\theta=" + piT(piK(Z.k))) + ".", M("z=" + (Z.rT === "1" ? "" : Z.rT) + "e^{" + expT(Z.k) + "}") + "."] };
  },
});

sk({
  id: "c8-exponentielle-algebrique", ch: 8, ref: 3, title: "Revenir à la forme algébrique",
  learn: L({
    rule: M("r\\,e^{i\\theta}=r\\cos\\theta+i\\,r\\sin\\theta") + ".",
    steps: ["Calcule " + M("\\cos\\theta") + " et " + M("\\sin\\theta") + " (valeurs exactes).", "Multiplie chacun par r.", "Écris " + M("a+bi") + "."],
    trap: M("e^{i\\pi}=-1") + " et " + M("e^{i\\pi/2}=i") + ".",
  }),
  gen() {
    const Z = niceZ();
    return { q: "Écris sous forme algébrique : " + M("z=" + (Z.rT === "1" ? "" : Z.rT) + "e^{" + expT(Z.k) + "}"), type: "num", ans: Z.zIn, allow: ["i", "sqrt"], form: ["algebraic"], atex: Z.zT,
      sol: [M("\\cos\\left(" + piT(piK(Z.k)) + "\\right)=" + Z.tv.ct) + ", " + M("\\sin\\left(" + piT(piK(Z.k)) + "\\right)=" + Z.tv.st) + ".", M("z=" + Z.rT + "\\times" + pr(Z.tv.ct) + "+i\\times" + Z.rT + "\\times" + pr(Z.tv.st) + "=" + Z.zT) + "."] };
  },
});

sk({
  id: "c8-calculs-exponentielle", ch: 8, ref: 3, title: "Produits et puissances en forme exponentielle",
  learn: L({
    rule: D("r_1e^{i\\theta_1}\\times r_2e^{i\\theta_2}=r_1r_2\\,e^{i(\\theta_1+\\theta_2)}\\qquad \\frac{r_1e^{i\\theta_1}}{r_2e^{i\\theta_2}}=\\frac{r_1}{r_2}e^{i(\\theta_1-\\theta_2)}\\qquad (re^{i\\theta})^n=r^ne^{in\\theta}"),
    steps: ["Écris chaque nombre en forme exponentielle.", "Modules : on multiplie (ou divise, ou puissance n).", "Arguments : on additionne (ou soustrait, ou × n).", "Si on demande la forme algébrique, reviens à " + M("a+bi") + "."],
    trap: "Pour une puissance, c'est le <b>module</b> qui est élevé à la puissance n, et l'<b>argument</b> qui est multiplié par n.",
  }),
  gen() {
    if (coin()) { const n = ri(2, 12); const s = pick([1, -1]); // (1 + s i)^n
      let z = cq(1, 0); for (let i = 0; i < n; i++) z = cMul(z, cq(1, s));
      return { q: "Calcule " + M("(1" + (s > 0 ? "+" : "-") + "i)^{" + n + "}") + " (forme algébrique).", type: "num", ans: cIn(z), allow: ["i"], form: ["algebraic"], atex: cT(z),
        sol: [M("1" + (s > 0 ? "+" : "-") + "i=\\sqrt2\\,e^{" + (s > 0 ? "" : "-") + "i\\pi/4}") + ".", M("(1" + (s > 0 ? "+" : "-") + "i)^{" + n + "}=(\\sqrt2)^{" + n + "}e^{" + (s > 0 ? "" : "-") + "i" + n + "\\pi/4}") + ".", M("=" + cT(z)) + "."] }; }
    const r1 = ri(1, 5), r2 = ri(1, 5), k1 = rnz(-6, 6), k2 = rnz(-6, 6); const prod = coin();
    const R = prod ? q(r1 * r2) : q(r1, r2), K = prod ? q(k1 + k2, 6) : q(k1 - k2, 6);
    let Km = K; while (Km.v > 1) Km = Km.sub(2); while (Km.v <= -1) Km = Km.add(2);
    return { q: "Soit " + M("z_1=" + (r1 === 1 ? "" : r1) + "e^{" + expTQ(q(k1, 6)) + "}") + " et " + M("z_2=" + (r2 === 1 ? "" : r2) + "e^{" + expTQ(q(k2, 6)) + "}") + ". Donne " + M(prod ? "z_1z_2" : "\\frac{z_1}{z_2}") + " sous forme exponentielle.", type: "num", ans: R.plain() + "*e^(i*" + piIn(Km) + ")", allow: ["i", "pi", "e"], form: ["expform"], atex: (R.eq(1) ? "" : R.tex()) + "e^{" + expTQ(Km) + "}",
      sol: ["Module : " + M(prod ? r1 + "\\times" + r2 + "=" + R.tex() : frac(r1, r2) + "=" + R.tex()) + ".", "Argument : " + M(piT(q(k1, 6)) + (prod ? "+" : "-") + pr(piT(q(k2, 6))) + "=" + piT(K)) + (Km.eq(K) ? "" : ", ramené à " + M(piT(Km))) + "."] };
  },
});

sk({
  id: "c8-equation-lineaire", ch: 8, ref: 4, title: "Équations du premier degré dans ℂ",
  learn: L({
    rule: "On isole z comme d'habitude, puis on met le résultat sous forme algébrique (division = conjugué). Si " + M("\\bar z") + " apparaît, on pose " + M("z=x+iy") + " et on identifie parties réelle et imaginaire.",
    steps: ["Isole z : " + M("z=\\frac{\\ldots}{\\ldots}") + ".", "Divise en multipliant par le conjugué.", "Avec " + M("\\bar z") + " : pose " + M("z=x+iy") + ", développe, et écris le système « réel = réel, imaginaire = imaginaire »."],
    trap: M("\\bar z=x-iy") + " : le signe change seulement devant la partie imaginaire.",
  }),
  gen() {
    if (coin()) { const a = randZ(-4, 4), zs = randZ(-5, 5), b = randZ(-6, 6); const c = cAdd(cMul(a, zs), b);
      return { q: "Résous dans ℂ : " + M(cP(a) + "z+" + cP(b) + "=" + cT(c)) + " (donne z sous forme algébrique).", type: "num", ans: cIn(zs), allow: ["i"], form: ["algebraic"], atex: "z=" + cT(zs),
        sol: [M(cP(a) + "z=" + cT(cSub(c, b))) + ".", M("z=" + frac(cT(cSub(c, b)), cT(a))) + " ; on multiplie par le conjugué " + M(cT([a[0], a[1].neg()])) + ".", M("z=" + cT(zs)) + "."] }; }
    const x = rnz(-5, 5), y = rnz(-5, 5), k = pick([2, 3, -2]); // z + k z̄ = (1+k)x + (1−k) y i
    const rhs = cq((1 + k) * x, (1 - k) * y);
    return { q: "Résous dans ℂ : " + M("z" + (k < 0 ? "-" : "+") + Math.abs(k) + "\\bar z=" + cT(rhs)) + ".", type: "num", ans: cIn(cq(x, y)), allow: ["i"], form: ["algebraic"], atex: "z=" + cT(cq(x, y)),
      sol: ["On pose " + M("z=x+iy") + ", " + M("\\bar z=x-iy") + ".", M("x+iy" + (k < 0 ? "-" : "+") + Math.abs(k) + "(x-iy)=" + (1 + k) + "x" + (1 - k < 0 ? "-" : "+") + Math.abs(1 - k) + "iy") + ".", "Identification : " + M((1 + k) + "x=" + (1 + k) * x) + " et " + M((1 - k) + "y=" + (1 - k) * y) + ", donc " + M("x=" + x) + ", " + M("y=" + y) + ".", M("z=" + cT(cq(x, y))) + "."] };
  },
});

sk({
  id: "c8-equation-second-degre", ch: 8, ref: 4, title: "Équations du second degré dans ℂ",
  learn: L({
    rule: "Si " + M("\\Delta<0") + " : deux solutions complexes conjuguées " + M("z=\\frac{-b\\pm i\\sqrt{-\\Delta}}{2a}") + ".",
    steps: ["Calcule Δ.", "Si Δ < 0 : " + M("\\sqrt{-\\Delta}") + ".", "Écris les deux solutions " + M("\\frac{-b-i\\sqrt{-\\Delta}}{2a}") + " et " + M("\\frac{-b+i\\sqrt{-\\Delta}}{2a}") + ", puis simplifie."],
    trap: "On prend la racine de " + M("-\\Delta") + " (positif), et on met le i devant.",
    input: "<code>1-2i ; 1+2i</code>.",
  }),
  gen() {
    const p = rnz(-5, 5), qq = ri(1, 5); const b = -2 * p, c = p * p + qq * qq; const D0 = b * b - 4 * c;
    const z1 = cq(p, -qq), z2 = cq(p, qq);
    return { q: "Résous dans ℂ : " + M("z^2" + mono(b, "z", false) + sgnTex(c) + "=0"), type: "set", ans: [cIn(z1), cIn(z2)], allow: ["i"], form: ["algebraic"], atex: setTex([cT(z1), cT(z2)]),
      traps: [{ ans: [cIn(z2)], m: "Il y a deux solutions (conjuguées l'une de l'autre)." }],
      sol: [M("\\Delta=" + tp(b) + "^2-4\\times" + c + "=" + D0) + " < 0.", M("\\sqrt{-\\Delta}=\\sqrt{" + -D0 + "}=" + 2 * qq) + ".", M("z=" + frac(tx(-b) + "\\pm" + 2 * qq + "i", 2) + "=" + p + "\\pm" + (qq === 1 ? "" : qq) + "i") + "."] };
  },
});

sk({
  id: "c8-geometrie", ch: 8, ref: 5, title: "Géométrie avec les complexes",
  learn: L({
    rule: "Distance : " + M("AB=|z_B-z_A|") + ". Milieu : " + M("z_I=\\frac{z_A+z_B}2") + ". " + M("|z-z_A|=r") + " : cercle de centre A et de rayon r. " + M("|z-z_A|=|z-z_B|") + " : médiatrice de [AB].",
    steps: ["Traduis la question en formule.", "Calcule avec les parties réelles et imaginaires.", "Pour les ensembles de points, reconnais la forme."],
    trap: M("|z+2-i|=3") + " : c'est " + M("|z-(-2+i)|") + ", le centre est " + M("(-2\\,;\\,1)") + ".",
  }),
  gen() {
    const t = ri(1, 3); const A = cq(ri(-5, 5), ri(-5, 5)), B = cq(ri(-5, 5), ri(-5, 5));
    if (t === 1) { const d = cSub(B, A); const s = d[0].n * d[0].n + d[1].n * d[1].n; if (s === 0) return this.gen(); const [k, m] = simplSqrt(s);
      return { q: "Soit A d'affixe " + M(cT(A)) + " et B d'affixe " + M(cT(B)) + ". Calcule la distance AB.", type: "num", ans: sqrtIn(k, m), form: ["sqrt"], atex: sqrtT(k, m),
        sol: [M("z_B-z_A=" + cT(d)) + ".", M("AB=|" + cT(d) + "|=\\sqrt{" + s + "}" + (m !== s ? "=" + sqrtT(k, m) : "")) + "."] }; }
    if (t === 2) { const I = [A[0].add(B[0]).div(2), A[1].add(B[1]).div(2)];
      return { q: "Soit A d'affixe " + M(cT(A)) + " et B d'affixe " + M(cT(B)) + ". Donne l'affixe du milieu I de [AB].", type: "num", ans: cIn(I), allow: ["i"], form: ["algebraic"], atex: cT(I),
        sol: [M("z_I=" + frac(cP(A) + "+" + cP(B), 2) + "=" + cT(I)) + "."] }; }
    const a = rnz(-4, 4), b = rnz(-4, 4), r = ri(2, 5); const inside = cT(cq(-a, -b));
    const opts = ["Le cercle de centre " + M("(" + a + "\\,;\\," + b + ")") + " et de rayon " + r, "Le cercle de centre " + M("(" + -a + "\\,;\\," + -b + ")") + " et de rayon " + r, "Le cercle de centre " + M("(" + a + "\\,;\\," + b + ")") + " et de rayon " + r * r, "La droite d'équation " + M("y=" + r)];
    const order = shuf([0, 1, 2, 3]);
    return { q: "Quel est l'ensemble des points M d'affixe z tels que " + M("\\left|z" + (inside.startsWith("-") ? "" : "+") + inside + "\\right|=" + r) + " ?", type: "choice", opts: order.map(i => opts[i]), a: order.indexOf(0), atex: "",
      sol: [M("\\left|z" + (inside.startsWith("-") ? "" : "+") + inside + "\\right|=\\left|z-(" + cT(cq(a, b)) + ")\\right|") + " : distance entre M et le point " + M("(" + a + "\\,;\\," + b + ")") + ".", "Cette distance vaut " + r + " : cercle de centre " + M("(" + a + "\\,;\\," + b + ")") + " et de rayon " + r + "."] };
  },
});

sk({
  id: "c8-impedances", ch: 8, ref: 6, title: "Impédances en électrotechnique",
  learn: L({
    rule: "En électrotechnique on note " + M("j") + " avec " + M("j^2=-1") + ". " + M("Z_R=R") + ", " + M("Z_L=jL\\omega") + ", " + M("Z_C=\\frac1{jC\\omega}=-\\frac{j}{C\\omega}") + ". En série, on <b>additionne</b> ; en parallèle, " + M("Z=\\frac{Z_1Z_2}{Z_1+Z_2}") + ". Le déphasage est " + M("\\varphi=\\arg Z") + ".",
    steps: ["Calcule chaque impédance (" + M("L\\omega") + ", " + M("\\frac1{C\\omega}") + ").", "Série : " + M("Z=R+j\\left(L\\omega-\\frac1{C\\omega}\\right)") + ".", "Module " + M("|Z|=\\sqrt{R^2+X^2}") + ", déphasage avec " + M("\\tan\\varphi=\\frac XR") + "."],
    trap: M("\\frac1j=-j") + " : l'impédance d'un condensateur a une partie imaginaire <b>négative</b>.",
    input: "<code>30+40j</code> (j ou i, les deux sont acceptés).",
  }),
  gen() {
    const t = ri(1, 4);
    const [R, X] = pick([[30, 40], [60, 80], [5, 12], [8, 6], [20, 20], [10, 10], [9, 12], [15, 20]]);
    if (t === 1) { const w = 100, L = X / w; const lf = fmtNum(L);
      return { q: "Un circuit série contient " + M("R=" + R + "\\ \\Omega") + " et une bobine " + M("L=" + lf + "\\ \\text{H}") + ", avec " + M("\\omega=" + w + "\\ \\text{rad/s}") + ". Donne l'impédance complexe Z.", type: "num", ans: R + "+" + X + "i", allow: ["i"], form: ["algebraic"], atex: "Z=" + R + "+" + X + "j",
        sol: [M("L\\omega=" + lf + "\\times" + w + "=" + X + "\\ \\Omega") + ".", M("Z=R+jL\\omega=" + R + "+" + X + "j") + "."] }; }
    if (t === 2) { const Zm = Math.sqrt(R * R + X * X);
      return { q: "Quel est le module de l'impédance " + M("Z=" + R + (coin() ? "+" : "-") + X + "j") + " (en Ω) ?", type: "num", ans: String(Zm), form: ["sqrt"], atex: fmtNum(Zm) + "\\ \\Omega",
        sol: [M("|Z|=\\sqrt{" + R + "^2+" + X + "^2}=\\sqrt{" + (R * R + X * X) + "}=" + fmtNum(Zm)) + " Ω."].map(s => s.replace("=" + fmtNum(Zm) + "\\)", "=" + niceNum(Zm).t + "\\)")) }; }
    if (t === 3) { const Rr = ri(1, 9) * 10, XC = pick([10, 20, 50, 100]), w = 1000, Cc = 1 / (XC * w);
      return { q: "Un circuit série contient " + M("R=" + Rr + "\\ \\Omega") + " et un condensateur tel que " + M("\\frac{1}{C\\omega}=" + XC + "\\ \\Omega") + ". Donne l'impédance complexe Z.", type: "num", ans: Rr + "-" + XC + "i", allow: ["i"], form: ["algebraic"], atex: "Z=" + Rr + "-" + XC + "j",
        traps: [{ ans: Rr + "+" + XC + "i", m: M("Z_C=\\frac1{jC\\omega}=-\\frac{j}{C\\omega}") + " : la partie imaginaire est négative." }],
        sol: [M("Z_C=\\frac{1}{jC\\omega}=-j\\times" + XC) + " (car " + M("\\frac1j=-j") + ").", M("Z=" + Rr + "-" + XC + "j") + "."], _c: Cc }; }
    const k = ri(1, 5) * 2; const Rp = k, Xp = k; const Zr = cDiv(cMul(cq(Rp, 0), cq(0, Xp)), cq(Rp, Xp));
    const phase = coin();
    if (phase) return { q: "Quel est le déphasage " + M("\\varphi=\\arg Z") + " de l'impédance " + M("Z=" + k + "+" + k + "j") + " (en radians) ?", type: "num", ans: "pi/4", form: ["pi"], atex: "\\frac\\pi4",
      sol: [M("\\tan\\varphi=\\frac{" + k + "}{" + k + "}=1") + " avec partie réelle positive : " + M("\\varphi=\\frac\\pi4") + "."] };
    return { q: "Une résistance " + M("R=" + Rp + "\\ \\Omega") + " est en parallèle avec une bobine d'impédance " + M("Z_L=" + Xp + "j") + ". Donne l'impédance équivalente Z.", type: "num", ans: cIn(Zr), allow: ["i"], form: ["algebraic"], atex: "Z=" + cT(Zr, "j"),
      sol: [M("Z=\\frac{Z_RZ_L}{Z_R+Z_L}=\\frac{" + Rp + "\\times" + Xp + "j}{" + Rp + "+" + Xp + "j}") + ".", "On multiplie par le conjugué " + M(Rp + "-" + Xp + "j") + " : " + M("Z=" + cT(Zr, "j")) + "."] };
  },
});
