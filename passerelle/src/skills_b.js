/* =====================================================================
   LEZIONI — Tappa 3 (equazioni) e Tappa 4 (trigonometria)
   ===================================================================== */
const setIn = arr => arr.map(v => (v instanceof Q ? v.plain() : String(v)));
const setTex = arr => (arr.length ? "S=\\left\\{" + arr.join("\\,;\\,") + "\\right\\}" : "S=\\varnothing");
function qSort(arr) { return arr.slice().sort((a, b) => Qv(a).v - Qv(b).v); }

/* =========================== TAPPA 3 =========================== */
sk({
  id: "c2-eq1", ch: 3, title: "Equazioni di primo grado",
  learn: L({
    idea: "È la bilancia della Tappa 0, ma con la x da tutte e due le parti. Si portano tutte le x da un lato e tutti i numeri dall'altro, poi si divide.",
    rule: "Un termine che <b>passa dall'altra parte</b> dell'uguale <b>cambia segno</b> (+3 diventa −3). Alla fine si divide per il numero davanti alla x.",
    steps: ["Porta le x a sinistra e i numeri a destra (chi attraversa l'uguale cambia segno).", "Riduci ogni lato: ottieni " + M("ax=b") + ".", "Dividi per a: " + M("x=\\frac ba") + ".", "Verifica rimettendo il numero nell'equazione di partenza."],
    trap: "Se " + M("-3x=12") + ", allora " + M("x=-4") + ": si divide per −3, segno compreso.",
    input: "<code>7/2</code> (oppure <code>x = 7/2</code>).",
  }),
  gen() {
    const x = q(rnz(-12, 12), pick([1, 1, 1, 2, 3, 4, 5])), a = rnz(-9, 9); let c = rnz(-9, 9); while (c === a) c = rnz(-9, 9);
    const b = rnz(-15, 15), d = x.mul(a - c).add(b); if (!d.isInt()) return this.gen();
    const D0 = d.n;
    const L0 = polyT([a, b]), R0 = polyT([c, D0]);
    return { q: "Risolvi: " + M(L0 + "=" + R0), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
      traps: [{ ans: [q(D0 + b, a - c).plain()], m: "Quando un termine passa dall'altra parte dell'uguale, cambia segno." }],
      sol: ["Porto le x a sinistra e i numeri a destra (chi passa dall'altra parte cambia segno): " + M(polyT([a, 0]) + (c < 0 ? "+" + polyT([-c, 0]) : "-" + polyT([c, 0])) + "=" + D0 + (b < 0 ? "+" + -b : "-" + b)) + ".", "Riduco: " + M(polyT([a - c, 0]) + "=" + (D0 - b)) + ".", "Divido per " + M(tx(a - c)) + ": " + M("x=" + frac(D0 - b, a - c) + "=" + x.tex()) + "."] };
  },
});

sk({
  id: "c2-eq1-avance", ch: 3, title: "Equazioni con parentesi e frazioni",
  learn: L({
    idea: "Prima si « pulisce » l'equazione: si tolgono le parentesi e le frazioni. Poi è un'equazione normale di primo grado.",
    rule: "Per togliere le frazioni: moltiplica <b>ogni termine</b> dei due lati per il denominatore comune.",
    steps: ["Togli le parentesi (attenzione ai « − » davanti).", "Se ci sono frazioni: moltiplica tutto per il denominatore comune.", "Risolvi come un'equazione di primo grado."],
    trap: "Quando moltiplichi per il denominatore comune, non dimenticare <b>nessun</b> termine (anche quelli senza frazione).",
  }),
  gen() {
    if (coin()) {
      const k = rnz(-5, 5), p = rnz(-6, 6), m = rnz(-5, 5), n = rnz(-6, 6); const r = rnz(-3, 3), s = rnz(-10, 10);
      const A = k + m - r; if (A === 0) return this.gen();
      const B = s + k * p - m * n; const x = q(B, A);
      const lhs = (k === 1 ? "" : k === -1 ? "-" : k) + pr(linT(1, -p)) + (m < 0 ? "-" : "+") + (Math.abs(m) === 1 ? "" : Math.abs(m)) + pr(linT(1, n));
      return { q: "Risolvi: " + M(lhs + "=" + polyT([r, s])), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["Tolgo le parentesi: " + M(polyT([k, -k * p]) + (m < 0 ? "" : "+") + polyT([m, m * n]) + "=" + polyT([r, s])) + ".", "Porto le x a sinistra e i numeri a destra: " + M(polyT([A, 0]) + "=" + B) + ".", M("x=" + frac(B, A) + "=" + x.tex()) + "."] };
    }
    let a = ri(2, 6), c = ri(2, 6); while (c === a) c = ri(2, 6);
    const b = q(rnz(-5, 5), pick([1, 2, 3, 4])), d = q(rnz(-5, 5), pick([1, 2, 3]));
    const coef = q(1, a).sub(q(1, c)); const x = d.sub(b).div(coef);
    const Lc = lcm(lcm(a, c), lcm(b.d, d.d));
    return { q: "Risolvi: " + M(frac("x", a) + sgnTex(b) + "=" + frac("x", c) + sgnTex(d)), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
      sol: ["Moltiplico tutto per " + Lc + ": " + M(Lc / a + "x" + sgnTex(b.mul(Lc)) + "=" + Lc / c + "x" + sgnTex(d.mul(Lc))) + ".", "Porto le x a sinistra: " + M((Lc / a - Lc / c) + "x=" + d.sub(b).mul(Lc).tex()) + ".", M("x=" + x.tex()) + "."] };
  },
});

sk({
  id: "c2-produit-nul", ch: 3, title: "Prodotto uguale a zero",
  learn: L({
    idea: "Se moltiplichi due numeri e ottieni 0, almeno uno dei due è 0 (non c'è altro modo di ottenere zero con una moltiplicazione). È la « legge di annullamento del prodotto ».",
    rule: M("A\\times B=0\\iff A=0\\text{ oppure }B=0") + ".",
    steps: ["Metti tutto da una parte e 0 dall'altra.", "Scomponi (fattore comune, prodotto notevole).", "Scrivi « primo fattore = 0 oppure secondo fattore = 0 » e risolvi le due equazioni piccole."],
    trap: "In " + M("x^2=5x") + " non dividere per x: perderesti la soluzione " + M("x=0") + ". Scrivi " + M("x(x-5)=0") + ".",
    input: "<code>0 ; 5</code> (separa le soluzioni con il punto e virgola).",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = rnz(-4, 4), b = rnz(-9, 9), c = rnz(-4, 4), d = rnz(-9, 9); const r1 = q(-b, a), r2 = q(-d, c);
      const s = qSort([r1, r2]);
      return { q: "Risolvi: " + M(pr(linT(a, b)) + pr(linT(c, d)) + "=0"), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
        sol: [M(linT(a, b) + "=0") + " oppure " + M(linT(c, d) + "=0") + ".", M("x=" + r1.tex()) + " oppure " + M("x=" + r2.tex()) + "."] };
    }
    if (t === 2) {
      const a = rnz(-6, 6), b = rnz(-9, 9); const r = q(b, a); const s = qSort([q(0), r]);
      return { q: "Risolvi: " + M(polyT([a, 0, 0]) + "=" + polyT([b, 0])), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
        traps: [{ ans: [r.plain()], m: "Hai diviso per x e hai perso la soluzione x = 0. Meglio scomporre." }],
        sol: ["Porto tutto a sinistra: " + M(polyT([a, -b, 0]) + "=0") + ".", "Raccolgo la x: " + M("x" + pr(linT(a, -b)) + "=0") + ".", M("x=0") + " oppure " + M("x=" + r.tex()) + "."] };
    }
    const a = ri(1, 5), b = rnz(-9, 9); const r = q(-b, a);
    return { q: "Risolvi: " + M(pr(linT(a, b)) + "^2=0"), type: "set", ans: [r.plain()], form: ["rat"], atex: setTex([r.tex()]),
      sol: ["Un quadrato è zero solo se quello che c'è dentro è zero: " + M(linT(a, b) + "=0") + ".", M("x=" + r.tex()) + " (una sola soluzione)."] };
  },
});

sk({
  id: "c2-eq-carre", ch: 3, title: "Equazioni del tipo x² = k",
  learn: L({
    idea: M("x^2=9") + ": quali numeri al quadrato fanno 9? Sia 3 che −3, perché anche " + M("(-3)^2=9") + ". Quindi di solito ci sono <b>due</b> soluzioni.",
    rule: "Se " + M("k>0") + ": " + M("x=\\sqrt k") + " oppure " + M("x=-\\sqrt k") + ". Se " + M("k=0") + ": " + M("x=0") + ". Se " + M("k<0") + ": nessuna soluzione (un quadrato non è mai negativo).",
    steps: ["Isola il quadrato: " + M("(\\ldots)^2=k") + ".", "Guarda il segno di k.", "Scrivi le due soluzioni ±√k (e semplifica la radice)."],
    trap: "Ci sono <b>due</b> soluzioni: " + M("x^2=9") + " dà 3 <b>e</b> −3.",
    input: "<code>-3 ; 3</code>, <code>-sqrt(5) ; sqrt(5)</code> oppure <code>vuoto</code>.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = ri(1, 4), k = pick([1, 4, 9, 16, 25, 36, 49]) * a, s = [q(-Math.round(Math.sqrt(k / a))), q(Math.round(Math.sqrt(k / a)))];
      const c = -k;
      const r = Math.sqrt(k / a);
      return { q: "Risolvi: " + M(polyT([a, 0, c]) + "=0"), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
        traps: [{ ans: [String(r)], m: "Ci sono due soluzioni: +" + r + " e −" + r + "." }],
        sol: [M((a === 1 ? "" : a) + "x^2=" + k) + ", quindi " + M("x^2=" + k / a) + ".", M("x=" + r) + " oppure " + M("x=-" + r) + "."] };
    }
    if (t === 2) {
      const m = pick([2, 3, 5, 6, 7, 8, 12, 18, 20]), [kk, mm] = simplSqrt(m);
      return { q: "Risolvi: " + M("x^2=" + m), type: "set", ans: ["-" + sqrtIn(kk, mm), sqrtIn(kk, mm)], allow: ["sqrt"], form: ["sqrt"], atex: setTex(["-" + sqrtT(kk, mm), sqrtT(kk, mm)]),
        traps: [{ ans: [sqrtIn(kk, mm)], m: "Ci sono due soluzioni: " + M("\\pm" + sqrtT(kk, mm)) + "." }],
        sol: [M(m + ">0") + ": due soluzioni " + M("x=\\pm\\sqrt{" + m + "}") + ".", mm !== m ? "Semplifico: " + M("\\sqrt{" + m + "}=" + sqrtT(kk, mm)) + "." : "La radice non si semplifica.", M(setTex(["-" + sqrtT(kk, mm), sqrtT(kk, mm)])) + "."] };
    }
    if (t === 3) {
      const k = ri(1, 30);
      return { q: "Risolvi: " + M("x^2+" + k + "=0"), type: "set", ans: [], atex: setTex([]),
        sol: [M("x^2=-" + k) + ".", "Un quadrato è sempre positivo o zero: <b>nessuna soluzione</b>."] };
    }
    const a = rnz(-7, 7), k = ri(1, 8), s = qSort([q(-a - k), q(-a + k)]);
    return { q: "Risolvi: " + M(pr(linT(1, a)) + "^2=" + k * k), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
      traps: [{ ans: [String(-a + k)], m: "Ci sono due soluzioni: " + M(linT(1, a) + "=" + k) + " oppure " + M(linT(1, a) + "=-" + k) + "." }],
      sol: [M(linT(1, a) + "=" + k) + " oppure " + M(linT(1, a) + "=-" + k) + ".", M("x=" + (-a + k)) + " oppure " + M("x=" + (-a - k)) + "."] };
  },
});

sk({
  id: "c2-discriminant", ch: 3, title: "Calcolare il discriminante Δ",
  learn: L({
    idea: "Per le equazioni con " + M("x^2") + " (di secondo grado) c'è un numero magico, il <b>discriminante Δ</b> (delta). Ti dice quante soluzioni ci sono. Qui impari solo a calcolarlo.",
    rule: "Per " + M("ax^2+bx+c") + ": " + M("\\Delta=b^2-4ac") + ".",
    steps: ["Leggi a, b, c <b>con il loro segno</b> (prima metti in ordine: " + M("ax^2+bx+c") + ").", "Calcola " + M("b^2") + " (sempre positivo).", "Calcola " + M("4ac") + " con i segni.", M("\\Delta=b^2-4ac") + "."],
    trap: "Se " + M("c<0") + ", " + M("-4ac") + " diventa positivo. Per " + M("x^2+3x-4") + ": " + M("\\Delta=9-4\\times1\\times(-4)=9+16=25") + ".",
  }),
  gen() {
    const a = rnz(-5, 5), b = rnz(-9, 9), c = rnz(-9, 9); const D = b * b - 4 * a * c;
    const order = coin();
    const expr = order ? polyT([a, b, c]) : (c + (b < 0 ? "-" : "+") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "x" + (a < 0 ? "-" : "+") + (Math.abs(a) === 1 ? "" : Math.abs(a)) + "x^2");
    return { q: "Calcola il discriminante di " + M(expr) + ".", type: "num", ans: String(D), form: ["rat"], atex: "\\Delta=" + D,
      traps: [{ ans: String(b * b + 4 * a * c), m: "Attenzione al segno di " + M("4ac") + ": " + M("\\Delta=b^2-4ac") + "." }, { ans: String(-b * b - 4 * a * c), m: M("b^2") + " è sempre positivo: " + M(tp(b) + "^2=" + b * b) + "." }],
      sol: [(!order ? "Metto in ordine: " + M(polyT([a, b, c])) + ". " : "") + M("a=" + a) + ", " + M("b=" + b) + ", " + M("c=" + c) + ".", M("\\Delta=" + tp(b) + "^2-4\\times" + tp(a) + "\\times" + tp(c) + "=" + b * b + (4 * a * c > 0 ? "-" + 4 * a * c : "+" + -4 * a * c) + "=" + D) + "."] };
  },
});

function trinomeSol(a, b, c) {
  const D = b * b - 4 * a * c; const lines = [M("\\Delta=" + tp(b) + "^2-4\\times" + tp(a) + "\\times" + tp(c) + "=" + D) + "."];
  return { D, lines };
}
sk({
  id: "c2-second-degre", ch: 3, title: "Risolvere ax² + bx + c = 0",
  learn: L({
    idea: "Con Δ si risolve <b>qualsiasi</b> equazione di secondo grado, sempre allo stesso modo. È una ricetta: calcoli Δ, guardi il segno, applichi la formula.",
    rule: M("\\Delta=b^2-4ac") + ". Se " + M("\\Delta>0") + ": due soluzioni " + M("x=\\frac{-b\\pm\\sqrt\\Delta}{2a}") + ". Se " + M("\\Delta=0") + ": una soluzione " + M("x=\\frac{-b}{2a}") + ". Se " + M("\\Delta<0") + ": nessuna soluzione.",
    steps: ["Metti in ordine: " + M("ax^2+bx+c=0") + ".", "Calcola Δ.", "A seconda del segno di Δ, usa la formula.", "Semplifica le frazioni e verifica una soluzione."],
    trap: M("-b") + " quando b è negativo: se " + M("b=-5") + ", allora " + M("-b=+5") + ".",
    input: "<code>-2 ; 3/2</code> oppure <code>vuoto</code>.",
  }),
  gen() {
    const t = ri(1, 6);
    if (t === 5) { const r = q(rnz(-6, 6), pick([1, 1, 2, 3])), kk = sg() * ri(1, 2); const P = pmul([r.d, -r.n], [r.d, -r.n]).map(x => x.mul(kk));
      const [A, B, Cc] = P.map(x => x.n); const { lines } = trinomeSol(A, B, Cc);
      return { q: "Risolvi: " + M(polyT([A, B, Cc]) + "=0"), type: "set", ans: [r.plain()], form: ["rat"], atex: setTex([r.tex()]), sol: lines.concat([M("\\Delta=0") + ": una sola soluzione " + M("x=\\frac{-b}{2a}=" + frac(tx(-B), 2 * A) + "=" + r.tex()) + "."]) }; }
    if (t === 6) { let a, b, c; do { a = rnz(-4, 4); b = rnz(-6, 6); c = rnz(-9, 9); } while (b * b - 4 * a * c >= 0);
      const { lines } = trinomeSol(a, b, c); return { q: "Risolvi: " + M(polyT([a, b, c]) + "=0"), type: "set", ans: [], atex: setTex([]), sol: lines.concat([M("\\Delta<0") + ": nessuna soluzione."]) }; }
    const r1 = q(rnz(-7, 7), pick([1, 1, 1, 2, 3])); let r2 = q(rnz(-7, 7), pick([1, 1, 2])); if (r2.eq(r1)) r2 = r2.add(1);
    const k = pick([1, 1, -1, 2]);
    const P = pmul([r1.d, -r1.n], [r2.d, -r2.n]).map(x => x.mul(k)); const [A, B, Cc] = P.map(x => x.n);
    const { D, lines } = trinomeSol(A, B, Cc); const sD = Math.round(Math.sqrt(D));
    const s = qSort([r1, r2]);
    return { q: "Risolvi: " + M(polyT([A, B, Cc]) + "=0"), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
      sol: lines.concat([M("\\Delta>0") + ", " + M("\\sqrt\\Delta=" + sD) + ".", M("x_1=" + frac(tx(-B) + "-" + sD, 2 * A) + "=" + q(-B - sD, 2 * A).tex()) + " e " + M("x_2=" + frac(tx(-B) + "+" + sD, 2 * A) + "=" + q(-B + sD, 2 * A).tex()) + "."]) };
  },
});

sk({
  id: "c2-second-degre-racines", ch: 3, title: "Soluzioni con le radici",
  learn: L({
    idea: "A volte Δ non è un quadrato perfetto (per esempio 12). Allora la radice resta nella soluzione: va bene così, basta semplificarla.",
    rule: M("x=\\frac{-b\\pm\\sqrt\\Delta}{2a}") + ", poi si semplifica " + M("\\sqrt\\Delta") + " e la frazione.",
    steps: ["Calcola Δ.", "Semplifica " + M("\\sqrt\\Delta") + " (per esempio " + M("\\sqrt{12}=2\\sqrt3") + ").", "Scrivi le due soluzioni e, se puoi, semplifica per un fattore comune: " + M("\\frac{-2\\pm2\\sqrt3}{2}=-1\\pm\\sqrt3") + "."],
    trap: "Non semplificare solo un pezzo: " + M("\\frac{2+\\sqrt3}{2}\\ne1+\\sqrt3") + ".",
    input: "<code>1-sqrt(3) ; 1+sqrt(3)</code> oppure <code>(3-sqrt(5))/2 ; (3+sqrt(5))/2</code>.",
  }),
  gen() {
    let a, b, c, D;
    do { a = pick([1, 1, 1, -1, 2]); b = rnz(-8, 8); c = rnz(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
    const [k, m] = simplSqrt(D);
    const sol1 = "(" + (-b) + "-" + k + "*sqrt(" + m + "))/(" + 2 * a + ")", sol2 = "(" + (-b) + "+" + k + "*sqrt(" + m + "))/(" + 2 * a + ")";
    const g = gcd(gcd(b, k), 2 * a);
    const pt = (s) => { const A = q(-b, 2 * a), K = q(k * s, 2 * a); return (A.n === 0 ? "" : A.tex()) + (K.n < 0 ? "-" : A.n === 0 ? "" : "+") + (K.abs().eq(1) ? "" : K.abs().tex()) + "\\sqrt{" + m + "}"; };
    return { q: "Risolvi: " + M(polyT([a, b, c]) + "=0"), type: "set", ans: [sol1, sol2], allow: ["sqrt"], atex: setTex([pt(-1), pt(1)]),
      sol: [M("\\Delta=" + tp(b) + "^2-4\\times" + tp(a) + "\\times" + tp(c) + "=" + D) + " > 0.", M("\\sqrt{" + D + "}=" + sqrtT(k, m)) + ".", M("x=" + frac(tx(-b) + "\\pm" + sqrtT(k, m), 2 * a)) + (g > 1 ? ", semplifico per " + g : "") + ": " + M(pt(-1)) + " e " + M(pt(1)) + "."] };
  },
});

sk({
  id: "c2-somme-produit", ch: 3, title: "Somma e prodotto delle soluzioni",
  learn: L({
    idea: "Le due soluzioni di " + M("ax^2+bx+c=0") + " hanno una proprietà comoda: si conoscono la loro somma e il loro prodotto senza calcolarle. Serve per trovare velocemente la seconda soluzione quando conosci la prima.",
    rule: M("x_1+x_2=-\\frac ba") + " e " + M("x_1\\times x_2=\\frac ca") + ".<br>Due numeri con somma S e prodotto P sono le soluzioni di " + M("X^2-SX+P=0") + ".",
    steps: ["Se conosci una soluzione " + M("x_1") + ": l'altra è " + M("x_2=\\frac{c}{a\\,x_1}") + ".", "Se conosci somma e prodotto: risolvi " + M("X^2-SX+P=0") + "."],
    trap: "La somma è " + M("-\\frac ba") + " (con il meno), il prodotto è " + M("\\frac ca") + " (senza meno).",
  }),
  gen() {
    const r1 = rnz(-6, 6); let r2 = rnz(-8, 8); while (r2 === r1) r2 = rnz(-8, 8); const a = pick([1, 1, 2, -1]);
    if (coin()) {
      const P = pmul([1, -r1], [1, -r2]).map(x => x.mul(a)); const [A, B, Cc] = P.map(x => x.n);
      return { q: M(r1) + " è una soluzione di " + M(polyT([A, B, Cc]) + "=0") + ". Trova l'altra soluzione (senza calcolare Δ).", type: "num", ans: String(r2), form: ["rat"], atex: "x_2=" + r2,
        traps: [{ ans: String(-r2), m: "Prodotto delle soluzioni: " + M("\\frac ca") + " (senza meno)." }],
        sol: ["Prodotto delle soluzioni: " + M("x_1x_2=\\frac ca=" + frac(Cc, A) + "=" + q(Cc, A).tex()) + ".", M("x_2=" + frac(q(Cc, A).tex(), tp(r1)) + "=" + r2) + "."] };
    }
    const S = r1 + r2, Pp = r1 * r2; const s = [Math.min(r1, r2), Math.max(r1, r2)];
    return { q: "Trova i due numeri che hanno somma " + M(S) + " e prodotto " + M(Pp) + ".", type: "set", ans: s.map(String), form: ["rat"], atex: s.join("\\text{ e }"),
      sol: ["Sono le soluzioni di " + M("X^2" + mono(-S, "X", false) + sgnTex(Pp) + "=0") + ".", M("\\Delta=" + (S * S - 4 * Pp) + "=" + Math.abs(r1 - r2) + "^2") + ".", "Soluzioni: " + M(s[0]) + " e " + M(s[1]) + " (controlla: somma " + S + ", prodotto " + Pp + ")."] };
  },
});

sk({
  id: "c2-eq-quotient", ch: 3, title: "Equazioni con la x sotto la frazione",
  learn: L({
    idea: "Non si può mai dividere per zero. Quindi, prima di tutto, si cercano i valori di x che renderebbero zero il denominatore: sono « vietati », anche se poi escono come soluzione.",
    rule: "Prima i <b>valori vietati</b> (denominatore = 0). Poi " + M("\\frac AB=\\frac CD\\iff AD=BC") + " (si moltiplica « in croce »).",
    steps: ["Scrivi i valori vietati.", "Moltiplica in croce (o moltiplica per il denominatore).", "Risolvi l'equazione che ottieni.", "<b>Scarta</b> le soluzioni che sono valori vietati."],
    trap: "Dimenticare il controllo: una « soluzione » che rende zero il denominatore non è una soluzione.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const c = 1, d = rnz(-6, 6), k = rnz(-5, 5); let a = rnz(-5, 5); while (a === k * c) a = rnz(-5, 5);
      const x = q(rnz(-9, 9)); if (x.eq(-d)) return this.gen();
      const b = x.mul(k * c - a).add(k * d).n;
      const forb = -d;
      return { q: "Risolvi: " + M(frac(linT(a, b), linT(c, d)) + "=" + k), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["Valore vietato: " + M("x=" + forb) + ".", "Moltiplico per " + M(pr(linT(c, d))) + ": " + M(linT(a, b) + "=" + polyT([k * c, k * d])) + ".", M(polyT([a - k * c, 0]) + "=" + (k * d - b)) + ", quindi " + M("x=" + x.tex()) + " (diverso da " + forb + ", va bene)."] };
    }
    if (t === 2) {
      const p = rnz(-5, 5), kk = rnz(-4, 4); if (kk === 0 || kk === 1) return this.gen();
      const a = kk + ri(1, 3), bb = -a * p; // numeratore a(x − p): l'unica « soluzione » è il valore vietato
      return { q: "Risolvi: " + M(frac(linT(a, bb), linT(1, -p)) + "=" + kk), type: "set", ans: [], atex: setTex([]),
        traps: [{ ans: [String(p)], m: M("x=" + p) + " è un valore vietato (il denominatore diventa 0): va scartato." }],
        sol: ["Valore vietato: " + M("x=" + p) + ".", M(linT(a, bb) + "=" + kk + pr(linT(1, -p))) + " dà " + M(polyT([a - kk, 0]) + "=" + (a - kk) * p) + ", quindi " + M("x=" + p) + ".", "Ma " + p + " è vietato: <b>nessuna soluzione</b>."] };
    }
    const A = ri(1, 6), B = ri(1, 6); let p = rnz(-5, 5), qq = rnz(-5, 5); if (A === B || p === qq) return this.gen();
    const x = q(A * qq - B * p, A - B); if (x.eq(p) || x.eq(qq)) return this.gen();
    return { q: "Risolvi: " + M(frac(A, linT(1, -p)) + "=" + frac(B, linT(1, -qq))), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
      sol: ["Valori vietati: " + M(p) + " e " + M(qq) + ".", "Moltiplico in croce: " + M(A + pr(linT(1, -qq)) + "=" + B + pr(linT(1, -p))) + ".", M(polyT([A - B, 0]) + "=" + (A * qq - B * p)) + ", " + M("x=" + x.tex()) + "."] };
  },
});

sk({
  id: "c2-changement-variable", ch: 3, title: "Cambio di variabile (equazioni biquadratiche)",
  learn: L({
    idea: "In " + M("x^4-5x^2+4=0") + " compaiono solo " + M("x^4") + " e " + M("x^2") + ". Se chiami " + M("X=x^2") + ", allora " + M("x^4=X^2") + " e l'equazione diventa una normale equazione di secondo grado in X.",
    rule: "Poni " + M("X=x^2") + ": " + M("ax^4+bx^2+c=0") + " diventa " + M("aX^2+bX+c=0") + ".",
    steps: ["Poni " + M("X=x^2") + " (X non può essere negativo).", "Risolvi in X (con Δ o scomponendo).", "Per ogni X ≥ 0: " + M("x^2=X") + ", quindi " + M("x=\\pm\\sqrt X") + ". Un X negativo non dà niente."],
    trap: "Non fermarti ai valori di X: la domanda chiede x.",
  }),
  gen() {
    const X1 = pick([1, 4, 9, 16, -1, -4]); let X2 = pick([1, 4, 9, 16, 25, -9, -2]); while (X2 === X1) X2 = pick([1, 4, 9, 16, 25]);
    const b = -(X1 + X2), c = X1 * X2;
    const xs = []; [X1, X2].forEach(X => { if (X > 0) { const r = Math.sqrt(X); xs.push(-r, r); } });
    xs.sort((u, v) => u - v);
    return { q: "Risolvi: " + M("x^4" + mono(b, "x^2", false) + sgnTex(c) + "=0"), type: "set", ans: xs.map(String), form: ["rat"], atex: setTex(xs.map(String)),
      traps: [{ ans: [X1, X2].map(String), m: "Questi sono i valori di " + M("X=x^2") + ": devi ancora trovare x." }],
      sol: ["Pongo " + M("X=x^2") + ": " + M("X^2" + mono(b, "X", false) + sgnTex(c) + "=0") + ".", "Soluzioni in X: " + M(X1) + " e " + M(X2) + ".", [X1, X2].map(X => (X > 0 ? M("x^2=" + X) + " → " + M("x=\\pm" + Math.sqrt(X)) : M("x^2=" + X) + " → impossibile")).join(" ; ") + ".", M(setTex(xs.map(String))) + "."] };
  },
});

sk({
  id: "c2-systeme", ch: 3, title: "Sistemi di due equazioni",
  learn: L({
    idea: "Due incognite (x e y) e due equazioni. L'idea è far sparire una delle due incognite, così resta un'equazione con una sola lettera.",
    rule: "Due metodi: <b>sostituzione</b> (ricavi una lettera e la sostituisci nell'altra equazione) oppure <b>riduzione</b> (moltiplichi le equazioni e le sottrai per far sparire una lettera).",
    steps: ["Scegli la lettera più facile da eliminare.", "Eliminala (sostituzione o riduzione).", "Risolvi l'equazione con una sola lettera.", "Rimetti il valore per trovare l'altra lettera, poi verifica nelle due equazioni."],
    trap: "Quando moltiplichi un'equazione, moltiplica <b>tutti</b> i termini, anche quello a destra dell'uguale.",
    input: "<code>(2 ; -1)</code> (prima x, poi y).",
  }),
  gen() {
    const x = rnz(-6, 6), y = rnz(-6, 6);
    let a, b, c, d; do { a = rnz(-5, 5); b = rnz(-5, 5); c = rnz(-5, 5); d = rnz(-5, 5); } while (a * d - b * c === 0);
    const e = a * x + b * y, f = c * x + d * y;
    const row = (p, r, s) => mono(p, "x", true) + mono(r, "y", false) + "=" + s;
    return { q: "Risolvi il sistema: " + M("\\begin{cases}" + row(a, b, e) + "\\\\" + row(c, d, f) + "\\end{cases}") + " Scrivi " + M("(x\\,;\\,y)") + ".", type: "tuple", ans: [String(x), String(y)], vars: [], form: ["rat"], atex: "(" + x + "\\,;\\," + y + ")",
      traps: [{ ans: [String(y), String(x)], m: "Hai invertito x e y: si scrive (x ; y)." }],
      sol: ["Elimino y: moltiplico la 1ª riga per " + tp(d) + " e la 2ª per " + tp(b) + ", poi le sottraggo.", M((a * d - b * c) + "x=" + (e * d - f * b)) + ", quindi " + M("x=" + x) + ".", "Sostituisco nella 1ª: " + M(mono(b, "y", true) + "=" + e + "-" + tp(a * x)) + ", quindi " + M("y=" + y) + ".", "Soluzione: " + M("(" + x + "\\,;\\," + y + ")") + "."] };
  },
});

sk({
  id: "c2-inequation1", ch: 3, title: "Disequazioni di primo grado",
  learn: L({
    idea: "Una disequazione (con <, >, ≤, ≥) si risolve quasi come un'equazione. C'è <b>una sola differenza</b>, ma importantissima: il verso si gira quando dividi per un numero negativo. (Esempio: 2 < 3, ma dividendo per −1: −2 > −3.)",
    rule: "Se moltiplichi o dividi per un numero <b>negativo</b>, il segno si <b>gira</b> (< diventa >).",
    steps: ["Porta le x da una parte e i numeri dall'altra.", "Dividi per il numero davanti alla x. Se è negativo: gira il segno.", "Scrivi le soluzioni come intervallo."],
    trap: M("-2x<6\\iff x>-3") + " (e non " + M("x<-3") + ").",
    input: "<code>]-3;+inf[</code>.",
  }),
  gen() {
    const a = rnz(-6, 6); let c = rnz(-6, 6); while (c === a) c = rnz(-6, 6);
    const b = rnz(-12, 12), d = rnz(-12, 12); const k = a - c, r = q(d - b, k);
    const op = pick(["<", "\\le", ">", "\\ge"]);
    const flip = k < 0; const opR = flip ? { "<": ">", "\\le": "\\ge", ">": "<", "\\ge": "\\le" }[op] : op;
    const closed = opR === "\\le" || opR === "\\ge", right = opR === ">" || opR === "\\ge";
    const ans = right ? ivS(r, Infinity, closed, false) : ivS(-Infinity, r, false, closed);
    const atex = right ? ivT(r, Infinity, closed, false) : ivT(-Infinity, r, false, closed);
    const trap = right ? ivS(-Infinity, r, false, closed) : ivS(r, Infinity, closed, false);
    return { q: "Risolvi: " + M(polyT([a, b]) + " " + op + " " + polyT([c, d])), type: "interval", ans, atex: "S=" + atex,
      traps: flip ? [{ ans: trap, m: "Hai diviso per " + k + " (negativo): il verso della disequazione va girato." }] : [],
      sol: ["Porto le x a sinistra e i numeri a destra: " + M(polyT([k, 0]) + " " + op + " " + (d - b)) + ".", flip ? "Divido per " + M(k) + ", che è <b>negativo</b>: giro il verso. " + M("x " + opR + " " + r.tex()) + "." : "Divido per " + M(k) + " (positivo): " + M("x " + opR + " " + r.tex()) + ".", M("S=" + atex) + "."] };
  },
});

function signCol(a, b, xs) { // segno di ax+b su ogni intervallo delimitato da xs (in ordine)
  const pts = [-Infinity].concat(xs, [Infinity]); const out = [];
  for (let i = 0; i < pts.length - 1; i++) { const m = !isFinite(pts[i]) ? pts[i + 1] - 1 : !isFinite(pts[i + 1]) ? pts[i] + 1 : (pts[i] + pts[i + 1]) / 2; out.push(a * m + b > 0 ? "+" : "-"); }
  return out;
}
function cellsFor(root, xs, mark) { return xs.map(x => (Math.abs(x - root) < 1e-12 ? mark : "")); }
function solveSignIneq(roots, signs, op, forb) {
  const want = op === ">" || op === "\\ge" ? "+" : "-", closed = op === "\\le" || op === "\\ge";
  const pts = [-Infinity].concat(roots, [Infinity]); const parts = [];
  signs.forEach((s, i) => { if (s === want) parts.push({ lo: pts[i], hi: pts[i + 1], lc: closed && isFinite(pts[i]) && !forb.includes(pts[i]), rc: closed && isFinite(pts[i + 1]) && !forb.includes(pts[i + 1]) }); });
  if (closed) roots.forEach((r, i) => { if (!forb.includes(r) && !parts.some(p => p.lo === r || p.hi === r)) parts.push({ lo: r, hi: r, lc: true, rc: true }); });
  return parts;
}
const partsStr = (parts, rootsQ) => { if (!parts.length) return "vuoto"; const fmt = x => { if (!isFinite(x)) return x > 0 ? "+inf" : "-inf"; const f = rootsQ.find(r => Math.abs(r.v - x) < 1e-12); return f ? f.plain() : String(x); };
  return parts.map(p => (p.lo === p.hi ? "{" + fmt(p.lo) + "}" : (p.lc ? "[" : "]") + fmt(p.lo) + ";" + fmt(p.hi) + (p.rc ? "]" : "["))).join(" U "); };

sk({
  id: "c2-signe-affine", ch: 3, title: "Il segno di ax + b",
  learn: L({
    idea: M("2x-6") + " è negativo per certi x e positivo per altri. Cambia segno in un solo punto: dove vale zero (qui x = 3).",
    rule: M("ax+b") + " vale zero in " + M("x=-\\frac ba") + ". <b>A destra</b> di questo numero ha lo <b>stesso segno di a</b>, a sinistra il segno contrario.",
    steps: ["Trova dove vale zero: " + M("-\\frac ba") + ".", "Guarda il segno di a (il numero davanti alla x).", "Fai la tabella dei segni: « contrario di a | 0 | segno di a »."],
    trap: "Per " + M("-2x+6") + " (a = −2 < 0): positivo <b>prima</b> di 3, negativo dopo.",
  }),
  gen() {
    const a = rnz(-6, 6), r = q(rnz(-9, 9), pick([1, 1, 2, 3])); const b = r.mul(-a); if (!b.isInt()) return this.gen();
    const op = pick([">", "<", "\\ge", "\\le"]);
    const signs = signCol(a, b.n, [r.v]);
    const parts = solveSignIneq([r.v], signs, op, []);
    const ans = partsStr(parts, [r]);
    return { q: "Per quali numeri " + M("x") + " si ha " + M(polyT([a, b.n]) + " " + op + " 0") + "?", type: "interval", ans, atex: ivTex(parseIntervals(ans)),
      sol: ["Vale zero in: " + M(polyT([a, b.n]) + "=0\\iff x=" + r.tex()) + ".", "a = " + a + (a > 0 ? " > 0: negativo prima, positivo dopo." : " < 0: positivo prima, negativo dopo."), signTable([r.tex()], [{ label: polyT([a, b.n]), signs }]), "Risposta: " + M(ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-inequation-produit", ch: 3, title: "Disequazioni con un prodotto (tabella dei segni)",
  learn: L({
    idea: "Il segno di un prodotto dipende dai segni dei fattori (regola dei segni). Si mette tutto in una <b>tabella</b>: una riga per ogni fattore, e l'ultima riga per il prodotto.",
    rule: "Riga per riga: ogni fattore " + M("ax+b") + " ha il segno di a a destra del suo zero. Colonna per colonna: regola dei segni.",
    steps: ["Trova lo zero di ogni fattore.", "Metti gli zeri in ordine sulla riga delle x.", "Riempi il segno di ogni fattore.", "Ultima riga: regola dei segni. Leggi gli intervalli giusti (parentesi chiuse se ≤ o ≥)."],
    trap: "Non si « divide » una disequazione per un fattore con la x: il suo segno cambia a seconda di x.",
    input: "<code>]-inf;-2] U [3;+inf[</code>.",
  }),
  gen() {
    const a = pick([1, 1, 2, -1, -2, 3]), c = pick([1, 1, 2, -1, 3]);
    const r1 = q(rnz(-7, 7), a > 0 ? a : -a), r2 = q(rnz(-7, 7), Math.abs(c)); if (r1.eq(r2) || !r1.mul(-a).isInt() || !r2.mul(-c).isInt()) return this.gen();
    const b = r1.mul(-a).n, d = r2.mul(-c).n; const rs = qSort([r1, r2]);
    const xs = rs.map(r => r.v); const op = pick([">", "<", "\\ge", "\\le"]);
    const s1 = signCol(a, b, xs), s2 = signCol(c, d, xs), sp = s1.map((s, i) => (s === s2[i] ? "+" : "-"));
    const parts = solveSignIneq(xs, sp, op, []), ans = partsStr(parts, rs);
    return { q: "Risolvi: " + M(pr(linT(a, b)) + pr(linT(c, d)) + " " + op + " 0"), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
      sol: ["Zeri: " + M(r1.tex()) + " e " + M(r2.tex()) + ".", signTable(rs.map(r => r.tex()), [{ label: linT(a, b), signs: s1, cells: cellsFor(r1.v, xs, "0") }, { label: linT(c, d), signs: s2, cells: cellsFor(r2.v, xs, "0") }, { label: "\\text{prodotto}", signs: sp }]), "Tengo le colonne " + (op === ">" || op === "\\ge" ? "+" : "−") + (op.includes("e") ? " e gli zeri" : "") + ": " + M("S=" + ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-inequation-second", ch: 3, title: "Il segno di ax² + bx + c",
  learn: L({
    idea: "Il grafico di " + M("ax^2+bx+c") + " è una parabola (una « U »). Se a > 0 la U è rivolta verso l'alto: è positiva fuori dalle soluzioni e negativa in mezzo. Se a < 0 è il contrario.",
    rule: "Se Δ > 0: <b>segno di a all'esterno</b> delle soluzioni, segno contrario in mezzo. Se Δ < 0: sempre il segno di a. Se Δ = 0: segno di a, tranne 0 nella soluzione.",
    steps: ["Calcola Δ e le soluzioni.", "Guarda il segno di a.", "« Segno di a fuori dalle soluzioni » → tabella dei segni.", "Leggi gli intervalli richiesti."],
    trap: "Per " + M("-x^2+4") + " (a < 0): è positivo <b>tra</b> −2 e 2.",
  }),
  gen() {
    if (rnd() < 0.2) {
      let a, b, c; do { a = rnz(-3, 3); b = rnz(-4, 4); c = rnz(-9, 9); } while (b * b - 4 * a * c >= 0);
      const op = pick([">", "<", "\\ge", "\\le"]); const pos = op === ">" || op === "\\ge"; const all = (a > 0) === pos;
      return { q: "Risolvi: " + M(polyT([a, b, c]) + " " + op + " 0"), type: "interval", ans: all ? "R" : "vuoto", atex: all ? "S=\\mathbb{R}" : "S=\\varnothing",
        sol: [M("\\Delta=" + (b * b - 4 * a * c)) + " < 0: non vale mai zero, ha sempre il segno di " + M("a=" + a) + ".", all ? "La disequazione è sempre vera: " + M("S=\\mathbb{R}") + "." : "La disequazione non è mai vera: " + M("S=\\varnothing") + "."] };
    }
    const r1 = rnz(-7, 6); const r2 = r1 + ri(1, 8); const a = pick([1, 1, -1, 2, -2]);
    const P = pmul([1, -r1], [1, -r2]).map(x => x.mul(a)); const [A, B, Cc] = P.map(x => x.n);
    const op = pick([">", "<", "\\ge", "\\le"]); const xs = [r1, r2];
    const signs = [a > 0 ? "+" : "-", a > 0 ? "-" : "+", a > 0 ? "+" : "-"];
    const parts = solveSignIneq(xs, signs, op, []), ans = partsStr(parts, xs.map(v => q(v)));
    return { q: "Risolvi: " + M(polyT([A, B, Cc]) + " " + op + " 0"), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
      sol: [M("\\Delta=" + (B * B - 4 * A * Cc)) + ", soluzioni " + M(r1) + " e " + M(r2) + ".", "a = " + A + " " + (A > 0 ? "> 0: positivo fuori dalle soluzioni, negativo in mezzo." : "< 0: negativo fuori dalle soluzioni, positivo in mezzo."), signTable([String(r1), String(r2)], [{ label: polyT([A, B, Cc]), signs }]), M("S=" + ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-inequation-quotient", ch: 3, title: "Disequazioni con una frazione",
  learn: L({
    idea: "Una frazione ha lo stesso segno di un prodotto (stessa regola dei segni). L'unica differenza: lo zero del denominatore è <b>vietato</b>.",
    rule: "Stessa tabella dei segni del prodotto. Allo zero del denominatore si mette una doppia barra ‖ e la parentesi è <b>sempre aperta</b>.",
    steps: ["Zero del numeratore, valore vietato del denominatore.", "Tabella dei segni (numeratore, denominatore, frazione).", "Parentesi chiusa possibile allo zero del numeratore (se ≤ o ≥), mai al valore vietato."],
    trap: "Non moltiplicare in croce una disequazione: non sai se il denominatore è positivo o negativo.",
  }),
  gen() {
    const a = pick([1, 1, 2, -1]), c = pick([1, 1, -1, 2]);
    const r1 = q(rnz(-6, 6), Math.abs(a)), r2 = q(rnz(-6, 6), Math.abs(c)); if (r1.eq(r2) || !r1.mul(-a).isInt() || !r2.mul(-c).isInt()) return this.gen();
    const b = r1.mul(-a).n, d = r2.mul(-c).n; const rs = qSort([r1, r2]); const xs = rs.map(r => r.v);
    const op = pick([">", "<", "\\ge", "\\le"]);
    const s1 = signCol(a, b, xs), s2 = signCol(c, d, xs), sp = s1.map((s, i) => (s === s2[i] ? "+" : "-"));
    const parts = solveSignIneq(xs, sp, op, [r2.v]), ans = partsStr(parts, rs);
    const trapParts = solveSignIneq(xs, sp, op, []);
    return { q: "Risolvi: " + M(frac(linT(a, b), linT(c, d)) + " " + op + " 0"), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
      traps: op.includes("e") ? [{ ans: partsStr(trapParts, rs), m: M("x=" + r2.tex()) + " è un valore vietato: lì la parentesi è sempre aperta." }] : [],
      sol: ["Zero del numeratore: " + M(r1.tex()) + ". Valore vietato: " + M(r2.tex()) + ".", signTable(rs.map(r => r.tex()), [{ label: linT(a, b), signs: s1, cells: cellsFor(r1.v, xs, "0") }, { label: linT(c, d), signs: s2, cells: cellsFor(r2.v, xs, "0") }, { label: "\\text{frazione}", signs: sp, cells: xs.map(x => (Math.abs(x - r2.v) < 1e-12 ? "‖" : "0")) }]), M("S=" + ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-methode", ch: 3, title: "Scegliere il metodo giusto", target: 5,
  learn: L({
    idea: "Prima di calcolare, guarda la <b>forma</b> dell'equazione: è lei che ti dice quale metodo usare. È la cosa più importante all'esame.",
    rule: "Niente " + M("x^2") + " → isola x. Prodotto = 0 → prodotto uguale a zero. " + M("x^2=k") + " → ±√k. " + M("ax^2+bx+c=0") + " → Δ. " + M("x^4") + " con " + M("x^2") + ", oppure " + M("e^{2x}") + " con " + M("e^x") + " → cambio di variabile. " + M("e^{\\ldots}=k") + " o " + M("\\ln(\\ldots)=k") + " → applica ln o exp.",
    steps: ["È tutto da una parte?", "È già scomposto?", "Qual è l'esponente più grande?", "Ci sono exp o ln?"],
  }),
  gen() {
    const M0 = ["Isolare x (primo grado)", "Prodotto uguale a zero", "Discriminante Δ", "Isolare il quadrato: x² = k", "Cambio di variabile", "Applicare ln (o exp)"];
    const a = rnz(-5, 5), b = rnz(-9, 9), c = ri(2, 30);
    const cases = [
      [polyT([a, b]) + "=" + polyT([rnz(-4, 4) || 1, rnz(-9, 9)]), 0],
      [pr(linT(1, b)) + pr(linT(ri(1, 4), rnz(-7, 7))) + "=0", 1],
      [polyT([ri(1, 3), rnz(-7, 7), rnz(-9, 9)]) + "=0", 2],
      ["x^2=" + c, 3], [pr(linT(1, b)) + "^2=" + c, 3],
      ["x^4" + mono(-ri(2, 9), "x^2", false) + "+" + ri(1, 9) + "=0", 4], ["e^{2x}" + mono(-ri(2, 6), "e^x", false) + "+" + ri(1, 8) + "=0", 4],
      ["e^{" + linT(ri(1, 3), rnz(-5, 5)) + "}=" + c, 5], ["\\ln" + pr(linT(ri(1, 3), rnz(-5, 5))) + "=" + ri(1, 3), 5],
    ];
    const [eq, k] = pick(cases);
    const others = shuf([0, 1, 2, 3, 4, 5].filter(i => i !== k)).slice(0, 3); const order = shuf([k].concat(others));
    const expl = ["Non c'è il quadrato: porto le x da una parte e isolo x.", "È già un prodotto uguale a 0.", "È un'equazione completa " + M("ax^2+bx+c") + ": calcolo Δ.", "Un quadrato uguale a un numero: prendo ±√k.", "Pongo " + M("X=x^2") + " (oppure " + M("X=e^x") + ") e ottengo un'equazione di secondo grado.", "Applico ln (o exp) a tutte e due le parti."];
    return { q: "Quale metodo usi per risolvere " + M(eq) + "?", type: "choice", opts: order.map(i => M0[i]), a: order.indexOf(k), atex: "", sol: [expl[k]] };
  },
});

/* =========================== TAPPA 4 =========================== */
const TRIG = { 0: ["1", "0"], 2: ["sqrt(3)/2", "1/2"], 3: ["sqrt(2)/2", "sqrt(2)/2"], 4: ["1/2", "sqrt(3)/2"], 6: ["0", "1"] };
const TRIGT = { "1": "1", "0": "0", "sqrt(3)/2": "\\frac{\\sqrt3}{2}", "1/2": "\\frac12", "sqrt(2)/2": "\\frac{\\sqrt2}{2}" };
function trigOf(k12) { // angolo = k12·π/12
  let k = ((k12 % 24) + 24) % 24; let sc = 1, ss = 1, ref;
  if (k <= 6) ref = k; else if (k <= 12) { ref = 12 - k; sc = -1; } else if (k <= 18) { ref = k - 12; sc = -1; ss = -1; } else { ref = 24 - k; ss = -1; }
  const [c, s] = TRIG[ref];
  const neg = (str, g) => (str === "0" ? "0" : g < 0 ? "-" + str : str);
  const negT = (str, g) => (str === "0" ? "0" : g < 0 ? "-" + TRIGT[str] : TRIGT[str]);
  return { c: neg(c, sc), s: neg(s, ss), ct: negT(c, sc), st: negT(s, ss), ref, quad: k < 6 ? 1 : k < 12 ? 2 : k < 18 ? 3 : 4 };
}
const K12 = [0, 2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22];
const piK = k12 => q(k12, 12);

sk({
  id: "c3-triangle", ch: 4, title: "Il triangolo rettangolo: seno, coseno, tangente",
  learn: L({
    idea: "In un triangolo rettangolo, il lato più lungo (di fronte all'angolo retto) si chiama <b>ipotenusa</b>. Per un angolo acuto, uno degli altri due lati lo « tocca » (cateto <b>adiacente</b>), l'altro gli sta di fronte (cateto <b>opposto</b>). Seno, coseno e tangente sono semplicemente dei rapporti tra questi lati.",
    rule: M("\\cos\\alpha=\\frac{\\text{adiacente}}{\\text{ipotenusa}}") + ", " + M("\\sin\\alpha=\\frac{\\text{opposto}}{\\text{ipotenusa}}") + ", " + M("\\tan\\alpha=\\frac{\\text{opposto}}{\\text{adiacente}}") + ". Pitagora: " + M("\\text{ipotenusa}^2=a^2+b^2") + ".",
    steps: ["Trova l'ipotenusa (di fronte all'angolo retto).", "Trova il cateto opposto e quello adiacente all'angolo che ti interessa.", "Scegli la formula che contiene quello che conosci e quello che cerchi.", "Per 30°, 45°, 60° usa i valori esatti."],
    trap: "L'ipotenusa non è mai il cateto « adiacente »: adiacente è l'altro lato che tocca l'angolo.",
  }),
  gen() {
    const t = ri(1, 3);
    const trip = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]]); const [p, r, h] = trip;
    if (t === 1) {
      const f = pick(["cos", "sin", "tan"]); const val = f === "cos" ? q(r, h) : f === "sin" ? q(p, h) : q(p, r);
      return { q: "Il triangolo ABC è rettangolo in C, con " + M("BC=" + p) + ", " + M("AC=" + r) + " e " + M("AB=" + h) + ". Calcola " + M("\\" + f + "(\\widehat{A})") + ".", type: "num", ans: val.plain(), form: ["irr"], atex: val.tex(),
        traps: [{ ans: (f === "cos" ? q(p, h) : f === "sin" ? q(r, h) : q(r, p)).plain(), m: "Hai scambiato il cateto opposto e quello adiacente all'angolo A." }],
        sol: ["Ipotenusa: AB = " + h + ". Cateto opposto ad A: BC = " + p + ". Cateto adiacente ad A: AC = " + r + ".", M("\\" + f + "(\\widehat A)=" + (f === "cos" ? frac("AC", "AB") + "=" + frac(r, h) : f === "sin" ? frac("BC", "AB") + "=" + frac(p, h) : frac("BC", "AC") + "=" + frac(p, r)) + (val.d !== (f === "tan" ? r : h) ? "=" + val.tex() : "")) + "."] };
    }
    if (t === 2) {
      const k = pick([1, 2, 3]); return { q: "Un triangolo è rettangolo; i due cateti misurano " + M(p * k) + " e " + M(r * k) + ". Quanto misura l'ipotenusa?", type: "num", ans: String(h * k), form: ["rat"], atex: String(h * k),
        sol: ["Pitagora: " + M("\\text{ip}^2=" + p * k + "^2+" + r * k + "^2=" + (p * p + r * r) * k * k) + ".", M("\\text{ip}=\\sqrt{" + (p * p + r * r) * k * k + "}=" + h * k) + "."] };
    }
    const ang = pick([30, 45, 60]), H = ri(2, 12) * 2; const f = pick(["opp", "adj"]);
    const tv = trigOf(ang / 15); const fac = f === "opp" ? tv.s : tv.c; const facT = f === "opp" ? tv.st : tv.ct;
    const ans = H + "*(" + fac + ")";
    const k = H / 2; const res = fac === "1/2" ? String(k) : fac === "sqrt(3)/2" ? sqrtT(k, 3) : sqrtT(k, 2);
    return { q: "In un triangolo rettangolo l'ipotenusa misura " + M(H) + " e un angolo acuto misura " + M(ang + "^\\circ") + ". Trova il valore esatto del cateto " + (f === "opp" ? "opposto" : "adiacente") + " a questo angolo.", type: "num", ans, form: ["sqrt"], atex: res,
      sol: [M((f === "opp" ? "\\sin" : "\\cos") + "(" + ang + "^\\circ)=" + frac("\\text{" + (f === "opp" ? "opposto" : "adiacente") + "}", "\\text{ipotenusa}")) + ", quindi cateto = " + M(H + "\\times" + facT) + ".", "= " + M(res) + "."] };
  },
});

sk({
  id: "c3-radians", ch: 4, title: "Gradi e radianti",
  learn: L({
    idea: "Gli angoli si possono misurare in gradi (un giro = 360°) oppure in <b>radianti</b> (un giro = 2π). All'esame si usano quasi sempre i radianti. La chiave: <b>180° = π</b>.",
    rule: M("180^\\circ=\\pi") + ". Gradi → radianti: " + M("\\times\\frac{\\pi}{180}") + ". Radianti → gradi: sostituisci π con 180°.",
    steps: ["Scrivi la frazione " + M("\\frac{\\text{gradi}}{180}") + " e semplificala.", "Il risultato è quella frazione per π.", "Al contrario, sostituisci π con 180°."],
    trap: "Semplifica la frazione: " + M("150^\\circ=\\frac{150}{180}\\pi=\\frac{5\\pi}{6}") + ".",
    input: "<code>5pi/6</code> oppure <code>5π/6</code>.",
  }),
  gen() {
    const deg = pick([15, 30, 45, 60, 75, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, 720, 36, 18, 72]) * (rnd() < 0.15 ? -1 : 1);
    const r = q(deg, 180);
    if (coin()) return { q: "Trasforma " + M(deg + "^\\circ") + " in radianti (valore esatto).", type: "num", ans: piIn(r), form: ["pi"], atex: piT(r) + "\\text{ rad}",
      sol: [M(frac(deg, 180) + "=" + r.tex()) + ".", "Quindi " + M(deg + "^\\circ=" + piT(r)) + " rad."] };
    return { q: "Trasforma " + M(piT(r)) + " rad in gradi.", type: "num", ans: String(deg), form: ["rat"], allow: [], atex: deg + "^\\circ",
      sol: ["Sostituisco π con 180°: " + M(r.tex() + "\\times180=" + deg) + "°."] };
  },
});

sk({
  id: "c3-valeurs", ch: 4, title: "I valori da sapere sulla circonferenza",
  learn: L({
    idea: "Disegna un cerchio di raggio 1 (la <b>circonferenza goniometrica</b>). Un angolo corrisponde a un punto del cerchio: il <b>coseno</b> è quanto il punto va a destra/sinistra, il <b>seno</b> è quanto va in su/giù.",
    rule: "cos = coordinata orizzontale, sin = coordinata verticale." + D("\\begin{array}{c|ccccc}x&0&\\frac\\pi6&\\frac\\pi4&\\frac\\pi3&\\frac\\pi2\\\\\\hline\\cos x&1&\\frac{\\sqrt3}2&\\frac{\\sqrt2}2&\\frac12&0\\\\\\sin x&0&\\frac12&\\frac{\\sqrt2}2&\\frac{\\sqrt3}2&1\\end{array}") + "Per gli altri angoli: si prende l'angolo « di riferimento » della tabella e si mette il segno giusto.",
    steps: ["Metti l'angolo sul cerchio (in quale quarto?).", "Trova l'angolo di riferimento (π/6, π/4 o π/3).", "Prendi il valore dalla tabella.", "Metti il segno: cos > 0 a destra, sin > 0 in alto."],
    trap: M("\\cos\\frac{2\\pi}{3}=-\\frac12") + ": l'angolo è a sinistra, quindi il coseno è negativo.",
    input: "<code>sqrt(3)/2</code>, <code>-1/2</code>, <code>sqrt(3)</code>.",
  }),
  gen() {
    const k = pick(K12) * (rnd() < 0.2 ? -1 : 1); const f = pick(["cos", "sin", "cos", "sin", "tan"]);
    const tv = trigOf(k);
    if (f === "tan") {
      if (tv.c === "0") return this.gen();
      const ans = "(" + tv.s + ")/(" + tv.c + ")"; const v = constVal(parse(ans))[0];
      const tt = Math.abs(v) < 1e-9 ? "0" : (v < 0 ? "-" : "") + (Math.abs(Math.abs(v) - 1) < 1e-9 ? "1" : Math.abs(Math.abs(v) - Math.sqrt(3)) < 1e-9 ? "\\sqrt3" : "\\frac{\\sqrt3}{3}");
      return { q: "Trova il valore esatto di " + M("\\tan\\left(" + piT(piK(k)) + "\\right)") + ".", type: "num", ans, form: ["sqrt"], atex: tt,
        sol: [M("\\tan x=\\frac{\\sin x}{\\cos x}") + ".", M("\\sin=" + tv.st) + " e " + M("\\cos=" + tv.ct) + ".", M("\\tan\\left(" + piT(piK(k)) + "\\right)=" + tt) + "."] };
    }
    const ans = f === "cos" ? tv.c : tv.s, at = f === "cos" ? tv.ct : tv.st, other = f === "cos" ? tv.s : tv.c;
    const traps = [];
    if (other !== ans && other.replace("-", "") !== ans.replace("-", "")) traps.push({ ans: other, m: "Hai scambiato cos e sin: cos = orizzontale, sin = verticale." });
    return { q: "Trova il valore esatto di " + M("\\" + f + "\\left(" + piT(piK(k)) + "\\right)") + ".", type: "num", ans, form: ["sqrt"], atex: at, traps,
      sol: ["L'angolo " + M(piT(piK(k))) + " è nel " + tv.quad + "° quarto del cerchio" + (tv.ref === 0 || tv.ref === 6 ? " (su un asse)." : ", angolo di riferimento " + M(piT(piK(tv.ref))) + "."), "Segno: " + (f === "cos" ? "cos > 0 a destra, < 0 a sinistra." : "sin > 0 in alto, < 0 in basso."), M("\\" + f + "\\left(" + piT(piK(k)) + "\\right)=" + at) + "."] };
  },
});

sk({
  id: "c3-associes", ch: 4, title: "Angoli associati", target: 5,
  learn: L({
    idea: "Angoli simmetrici sul cerchio hanno lo stesso seno o lo stesso coseno, a volte con il segno cambiato. Non serve imparare tutto a memoria: basta disegnare.",
    rule: D("\\cos(-x)=\\cos x\\quad\\sin(-x)=-\\sin x\\quad\\cos(\\pi-x)=-\\cos x\\quad\\sin(\\pi-x)=\\sin x") + D("\\cos(\\pi+x)=-\\cos x\\quad \\sin(\\pi+x)=-\\sin x\\quad \\cos\\left(\\tfrac\\pi2-x\\right)=\\sin x\\quad \\sin\\left(\\tfrac\\pi2-x\\right)=\\cos x"),
    steps: ["Disegna il cerchio e metti x (un piccolo angolo in alto a destra).", "Metti l'angolo richiesto (simmetria).", "Guarda se cos o sin cambiano segno, o si scambiano (con π/2)."],
    trap: "Con " + M("\\frac\\pi2") + " cos e sin si <b>scambiano</b>; con π restano gli stessi.",
  }),
  gen() {
    const L0 = [["\\cos(-x)", 0], ["\\sin(-x)", 3], ["\\cos(\\pi-x)", 1], ["\\sin(\\pi-x)", 2], ["\\cos(\\pi+x)", 1], ["\\sin(\\pi+x)", 3], ["\\cos\\left(\\frac\\pi2-x\\right)", 2], ["\\sin\\left(\\frac\\pi2-x\\right)", 0], ["\\cos\\left(x+\\frac\\pi2\\right)", 3], ["\\sin\\left(x+\\frac\\pi2\\right)", 0], ["\\cos(x+2\\pi)", 0], ["\\sin(x-\\pi)", 3]];
    const [e, k] = pick(L0); const O = ["\\cos x", "-\\cos x", "\\sin x", "-\\sin x"];
    const order = shuf([0, 1, 2, 3]);
    return { q: "Semplifica: " + M(e) + " =", type: "choice", opts: order.map(i => M(O[i])), a: order.indexOf(k), atex: O[k],
      sol: ["Metti x e poi l'angolo richiesto sul cerchio: la simmetria dà " + M(e + "=" + O[k]) + ".", "Se hai dubbi, prova con " + M("x=\\frac\\pi6") + "."] };
  },
});

sk({
  id: "c3-mesure-principale", ch: 4, title: "Riportare un angolo tra −π e π",
  learn: L({
    idea: "Fare un giro completo (2π) ti riporta nello stesso punto. Quindi " + M("\\frac{17\\pi}{3}") + " e " + M("-\\frac{\\pi}{3}") + " sono lo stesso punto del cerchio. Si sceglie la misura che sta tra −π e π (la « misura principale »).",
    rule: "Aggiungi o togli " + M("2\\pi") + " finché l'angolo è in " + M("]-\\pi\\,;\\,\\pi]") + ".",
    steps: ["Scrivi " + M("2\\pi") + " con lo stesso denominatore: " + M("2\\pi=\\frac{6\\pi}{3}") + ".", "Togli (o aggiungi) " + M("2\\pi") + " tutte le volte che serve.", "Fermati quando il risultato è tra −π (escluso) e π (compreso)."],
    trap: M("\\frac{17\\pi}{3}-\\frac{18\\pi}{3}=-\\frac{\\pi}{3}") + " (si tolgono 3 giri).",
  }),
  gen() {
    const d = pick([2, 3, 4, 6]); let k; do k = rnz(-40, 40); while (Math.abs(k) <= d || gcd(k, d) !== 1);
    let r = q(k, d); const tours = Math.round(r.v / 2); let m = r.sub(2 * tours); if (m.v <= -1) m = m.add(2); if (m.v > 1) m = m.sub(2);
    return { q: "Trova la misura principale (in " + M("]-\\pi\\,;\\,\\pi]") + ") di " + M(piT(r)) + ".", type: "num", ans: piIn(m), form: ["pi"], atex: piT(m),
      sol: [M("2\\pi=" + frac(2 * d + "\\pi", d)) + ".", M(piT(r) + (tours > 0 ? "-" : "+") + Math.abs(tours) + "\\times2\\pi=" + piT(r) + (tours > 0 ? "-" : "+") + frac(Math.abs(2 * tours * d) + "\\pi", d) + "=" + piT(m)) + "."] };
  },
});

sk({
  id: "c3-trouver-angle", ch: 4, title: "Trovare un angolo da coseno e seno",
  learn: L({
    idea: "Il coseno da solo non basta: " + M("\\cos\\frac\\pi3") + " e " + M("\\cos\\left(-\\frac\\pi3\\right)") + " valgono tutti e due " + M("\\frac12") + " (un punto in alto e uno in basso). Il <b>segno del seno</b> dice se l'angolo è in alto o in basso.",
    steps: ["Senza segni, trova l'angolo di riferimento nella tabella.", "Segno del cos → destra o sinistra. Segno del sin → alto o basso.", "Deduci l'angolo in " + M("]-\\pi\\,;\\,\\pi]") + "."],
    trap: "Un angolo « in basso » è negativo in " + M("]-\\pi\\,;\\,\\pi]") + ".",
  }),
  gen() {
    const k = pick(K12.filter(v => v !== 0)); let kk = k > 12 ? k - 24 : k; const tv = trigOf(kk);
    return { q: "Trova " + M("\\theta\\in\\left]-\\pi\\,;\\,\\pi\\right]") + " tale che " + M("\\cos\\theta=" + tv.ct) + " e " + M("\\sin\\theta=" + tv.st) + ".", type: "num", ans: piIn(piK(kk)), form: ["pi"], atex: "\\theta=" + piT(piK(kk)),
      traps: tv.s === "0" ? [] : [{ ans: piIn(piK(-kk)), m: "Guarda il segno del seno: dice se l'angolo è in alto (positivo) o in basso (negativo)." }],
      sol: ["Angolo di riferimento: " + M(tv.ref ? piT(piK(tv.ref)) : "0") + ".", "cos " + (tv.c.startsWith("-") ? "< 0 → a sinistra" : tv.c === "0" ? "= 0 → sull'asse verticale" : "> 0 → a destra") + "; sin " + (tv.s.startsWith("-") ? "< 0 → in basso" : tv.s === "0" ? "= 0 → sull'asse orizzontale" : "> 0 → in alto") + ".", M("\\theta=" + piT(piK(kk))) + "."] };
  },
});

sk({
  id: "c3-pythagore-trig", ch: 4, title: "cos² + sin² = 1",
  learn: L({
    idea: "Il punto sul cerchio ha coordinate (cos, sin) e il cerchio ha raggio 1. Per Pitagora: " + M("\\cos^2x+\\sin^2x=1") + ". Così, se conosci il seno, trovi il coseno (e viceversa).",
    rule: M("\\cos^2x+\\sin^2x=1") + ", quindi " + M("\\cos x=\\pm\\sqrt{1-\\sin^2x}") + ". Il segno dipende da dove si trova l'angolo.",
    steps: ["Calcola " + M("1-\\sin^2x") + " (oppure " + M("1-\\cos^2x") + ").", "Fai la radice quadrata.", "Scegli il segno guardando l'intervallo dato."],
    trap: "Dimenticare il segno: se x è tra " + M("\\frac\\pi2") + " e π (a sinistra), il coseno è <b>negativo</b>.",
  }),
  gen() {
    const [p, r, h] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const given = pick(["sin", "cos"]);
    const quad = ri(1, 4); const iv = { 1: "\\left]0\\,;\\,\\frac\\pi2\\right[", 2: "\\left]\\frac\\pi2\\,;\\,\\pi\\right[", 3: "\\left]-\\pi\\,;\\,-\\frac\\pi2\\right[", 4: "\\left]-\\frac\\pi2\\,;\\,0\\right[" }[quad];
    const cs = quad === 1 || quad === 4 ? 1 : -1, ss = quad <= 2 ? 1 : -1;
    const gv = given === "sin" ? q(ss * p, h) : q(cs * p, h); const want = given === "sin" ? "cos" : "sin"; const wv = q((given === "sin" ? cs : ss) * r, h);
    return { q: "Sappiamo che " + M("\\" + given + " x=" + gv.tex()) + " e " + M("x\\in" + iv) + ". Calcola " + M("\\" + want + " x") + ".", type: "num", ans: wv.plain(), form: ["irr"], atex: wv.tex(),
      traps: [{ ans: wv.neg().plain(), m: "Attenzione al segno: guarda in quale quarto del cerchio si trova x." }],
      sol: [M("\\" + want + "^2x=1-" + pr(gv.tex()) + "^2=1-" + frac(p * p, h * h) + "=" + frac(r * r, h * h)) + ".", M("\\" + want + " x=\\pm" + frac(r, h)) + ".", "Per " + M("x\\in" + iv) + ", " + M("\\" + want + " x") + " è " + ((given === "sin" ? cs : ss) > 0 ? "positivo" : "negativo") + ": " + M("\\" + want + " x=" + wv.tex()) + "."] };
  },
});

sk({
  id: "c3-equations", ch: 4, title: "Equazioni cos x = a e sin x = a",
  learn: L({
    idea: "Su un giro di cerchio, di solito ci sono <b>due</b> punti con lo stesso coseno (uno in alto e uno in basso) e due punti con lo stesso seno (uno a destra e uno a sinistra).",
    rule: M("\\cos x=\\cos\\alpha") + ": " + M("x=\\alpha") + " oppure " + M("x=-\\alpha") + ". " + M("\\sin x=\\sin\\alpha") + ": " + M("x=\\alpha") + " oppure " + M("x=\\pi-\\alpha") + ". (A meno di giri completi 2π.)",
    steps: ["Trova nella tabella un angolo α con il valore giusto.", "Scrivi la seconda soluzione (simmetria: −α per il coseno, π − α per il seno).", "Porta ogni soluzione nell'intervallo richiesto (aggiungi o togli 2π)."],
    trap: "Quasi sempre ci sono <b>due</b> soluzioni su un giro.",
    input: "<code>pi/3 ; 5pi/3</code>.",
  }),
  gen() {
    const f = pick(["cos", "sin"]); const k = pick([0, 2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22]); const tv = trigOf(k);
    const val = f === "cos" ? tv.c : tv.s, valT = f === "cos" ? tv.ct : tv.st;
    const range = pick(["02pi", "mpipi"]);
    const sols = []; K12.forEach(kk => { const t2 = trigOf(kk); if ((f === "cos" ? t2.c : t2.s) === val) sols.push(kk); });
    let ks = sols.map(kk => (range === "02pi" ? kk : kk > 12 ? kk - 24 : kk)).sort((a, b) => a - b);
    const ivt = range === "02pi" ? "\\left[0\\,;\\,2\\pi\\right[" : "\\left]-\\pi\\,;\\,\\pi\\right]";
    return { q: "Risolvi in " + M(ivt) + ": " + M("\\" + f + " x=" + valT) + ".", type: "set", ans: ks.map(kk => piIn(piK(kk))), form: ["pi"], atex: setTex(ks.map(kk => piT(piK(kk)))),
      traps: ks.length > 1 ? [{ ans: [piIn(piK(ks[0]))], m: "Manca una soluzione: su un giro ce ne sono due (simmetria)." }] : [],
      sol: ["Valore della tabella: " + M("\\" + f + "\\left(" + piT(piK(sols[0] > 12 ? sols[0] - 24 : sols[0])) + "\\right)=" + valT) + ".", f === "cos" ? "Per il coseno, l'altra soluzione è il simmetrico rispetto all'asse orizzontale (l'angolo opposto)." : "Per il seno, l'altra soluzione è il simmetrico rispetto all'asse verticale (π − α).", "In " + M(ivt) + ": " + M(setTex(ks.map(kk => piT(piK(kk))))) + "."] };
  },
});
