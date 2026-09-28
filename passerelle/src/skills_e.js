/* =====================================================================
   LEZIONI — Tappa 9 (numeri complessi)
   ===================================================================== */
const I1 = [q(0), q(1)];
function randZ(lo = -6, hi = 6) { let a, b; do { a = ri(lo, hi); b = ri(lo, hi); } while (b === 0); return cq(a, b); }

sk({
  id: "c8-puissances-i", ch: 9, title: "Il numero i e le sue potenze",
  learn: L({
    idea: "Nessun numero « normale » al quadrato dà −1. I matematici hanno quindi inventato un nuovo numero, <b>i</b>, con " + M("i^2=-1") + ". Con i si costruiscono i <b>numeri complessi</b>, come " + M("3+2i") + ".",
    rule: M("i^2=-1") + ", " + M("i^3=-i") + ", " + M("i^4=1") + ": le potenze di i si ripetono ogni 4. Quindi " + M("i^n=i^{r}") + ", dove r è il resto della divisione di n per 4.",
    steps: ["Dividi l'esponente per 4 e tieni il resto r.", "r = 0 → 1; r = 1 → i; r = 2 → −1; r = 3 → −i."],
    trap: M("i^2=-1") + ", non 1.",
    input: "<code>-i</code>, <code>1</code>.",
  }),
  gen() {
    const n = ri(5, 2030); const r = n % 4; const vals = [cq(1, 0), cq(0, 1), cq(-1, 0), cq(0, -1)];
    if (coin()) return { q: "Calcola " + M("i^{" + n + "}") + ".", type: "num", ans: cIn(vals[r]), allow: ["i"], form: ["algebraic"], atex: cT(vals[r]),
      sol: [M(n + "=4\\times" + Math.floor(n / 4) + "+" + r) + ".", M("i^{" + n + "}=(i^4)^{" + Math.floor(n / 4) + "}\\times i^{" + r + "}=i^{" + r + "}=" + cT(vals[r])) + "."] };
    const a = ri(2, 30), b = ri(2, 30); const rr = (a + b) % 4;
    return { q: "Calcola " + M("i^{" + a + "}\\times i^{" + b + "}") + ".", type: "num", ans: cIn(vals[rr]), allow: ["i"], form: ["algebraic"], atex: cT(vals[rr]),
      sol: [M("i^{" + a + "}\\times i^{" + b + "}=i^{" + (a + b) + "}") + ".", M((a + b) + "=4\\times" + Math.floor((a + b) / 4) + "+" + rr) + ", quindi " + M(cT(vals[rr])) + "."] };
  },
});

sk({
  id: "c8-calculs", ch: 9, title: "Calcolare con i numeri complessi",
  learn: L({
    idea: "Si calcola esattamente come con le lettere (come se i fosse x). L'unica regola nuova: ogni volta che compare " + M("i^2") + ", lo sostituisci con " + M("-1") + ".",
    rule: "Scrittura finale: " + M("a+bi") + " (parte reale + parte immaginaria). Utile: " + M("(a+bi)(a-bi)=a^2+b^2") + ".",
    steps: ["Sviluppa (4 prodotti).", "Sostituisci " + M("i^2") + " con " + M("-1") + ".", "Raggruppa i numeri senza i e quelli con i: " + M("a+bi") + "."],
    trap: M("(2i)^2=4i^2=-4") + ".",
    input: "<code>7-4i</code>, <code>-3+i/2</code>.",
  }),
  gen() {
    const t = ri(1, 4); const z = randZ(), w = randZ();
    let r, qt, s;
    if (t === 1) { r = coin() ? cAdd(z, w) : cSub(z, w); const op = r[0].eq(z[0].add(w[0])) && r[1].eq(z[1].add(w[1])) ? "+" : "-"; qt = cP(z) + op + cP(w); s = ["Numeri con numeri, i con i: " + M(cT(r)) + "."]; }
    else if (t === 2) { r = cMul(z, w); qt = cP(z) + cP(w); s = ["Sviluppo: " + M(z[0].mul(w[0]).tex() + sgnTex(z[0].mul(w[1])) + "i" + sgnTex(z[1].mul(w[0])) + "i" + sgnTex(z[1].mul(w[1])) + "i^2") + ".", M("i^2=-1") + ": " + M(cT(r)) + "."]; }
    else if (t === 3) { r = cMul(z, z); qt = cP(z) + "^2"; s = [M("(a+bi)^2=a^2+2abi+b^2i^2=a^2-b^2+2abi") + ".", M("=" + z[0].mul(z[0]).tex() + "-" + z[1].mul(z[1]).tex() + sgnTex(z[0].mul(z[1]).mul(2)) + "i=" + cT(r)) + "."]; }
    else { const zb = [z[0], z[1].neg()]; r = cMul(z, zb); qt = cP(z) + cP(zb); s = [M("(a+bi)(a-bi)=a^2+b^2") + ": " + M(z[0].mul(z[0]).tex() + "+" + z[1].mul(z[1]).tex() + "=" + cT(r)) + "."]; }
    const trap = t === 2 ? [z[0].mul(w[0]).add(z[1].mul(w[1])), z[0].mul(w[1]).add(z[1].mul(w[0]))] : t === 3 ? [z[0].mul(z[0]).add(z[1].mul(z[1])), z[0].mul(z[1]).mul(2)] : null;
    return { q: "Scrivi nella forma a + bi: " + M(qt), type: "num", ans: cIn(r), allow: ["i"], form: ["algebraic"], atex: cT(r),
      traps: trap ? [{ ans: cIn(trap), m: M("i^2=-1") + ", non +1." }] : [], sol: s };
  },
});

sk({
  id: "c8-division", ch: 9, title: "Dividere i numeri complessi",
  learn: L({
    idea: "Non si può lasciare i al denominatore. Il trucco: moltiplicare sopra e sotto per il <b>coniugato</b> (lo stesso numero con il segno di i cambiato). Sotto resta così un numero senza i.",
    rule: M("\\frac{z}{a+bi}=\\frac{z(a-bi)}{a^2+b^2}") + ".",
    steps: ["Scrivi il coniugato del denominatore (cambia il segno davanti a i).", "Moltiplica sopra e sotto per questo coniugato.", "Sotto: " + M("a^2+b^2") + " (un numero senza i). Sopra: sviluppa.", "Separa in " + M("\\frac{\\ldots}{\\ldots}+\\frac{\\ldots}{\\ldots}i") + " e semplifica."],
    trap: "Non si divide « parte per parte »: " + M("\\frac{4+6i}{1+2i}\\ne4+3i") + ".",
  }),
  gen() {
    const w = randZ(-4, 4); let r;
    if (coin()) { r = randZ(-5, 5); } else { const n = randZ(-5, 5); r = cDiv(n, w); }
    const z = cMul(r, w); const wb = [w[0], w[1].neg()]; const N = cMul(z, wb), dd = w[0].mul(w[0]).add(w[1].mul(w[1]));
    const trap = [z[0].div(w[0].n === 0 ? 1 : w[0]), z[1].div(w[1])];
    return { q: "Scrivi nella forma a + bi: " + M(frac(cT(z), cT(w))), type: "num", ans: cIn(r), allow: ["i"], form: ["algebraic"], atex: cT(r),
      traps: [{ ans: cIn(trap), m: "Non si divide parte per parte: moltiplica per il coniugato del denominatore." }],
      sol: ["Coniugato del denominatore: " + M(cT(wb)) + ".", M(frac(cP(z) + cP(wb), cP(w) + cP(wb)) + "=" + frac(cT(N), dd.tex())) + ".", M("=" + cT(r)) + "."] };
  },
});

sk({
  id: "c8-re-im-conjugue", ch: 9, title: "Parte reale, parte immaginaria, coniugato",
  learn: L({
    idea: "Un numero complesso " + M("a+bi") + " ha due « pezzi »: a (la parte senza i) e b (il numero davanti a i). Il coniugato è lo stesso numero con il segno di i cambiato.",
    rule: "Se " + M("z=a+bi") + ": " + M("\\text{Re}(z)=a") + ", " + M("\\text{Im}(z)=b") + " (un numero <b>senza</b> i), " + M("\\bar z=a-bi") + ".",
    steps: ["Prima scrivi z nella forma a + bi.", "Leggi a e b.", "Coniugato: cambia il segno davanti a i."],
    trap: "La parte immaginaria di " + M("3-5i") + " è " + M("-5") + ", non " + M("-5i") + ".",
  }),
  gen() {
    const z = randZ(-5, 5), w = randZ(-4, 4); const r = cMul(z, w); const t = ri(1, 3);
    if (t === 3) { const rb = [r[0], r[1].neg()]; return { q: "Scrivi il coniugato di " + M("z=" + cP(z) + cP(w)) + " (forma a + bi).", type: "num", ans: cIn(rb), allow: ["i"], form: ["algebraic"], atex: cT(rb),
      traps: [{ ans: cIn(r), m: "Questo è z stesso: il coniugato cambia il segno della parte immaginaria." }], sol: ["Forma a + bi: " + M("z=" + cT(r)) + ".", M("\\bar z=" + cT(rb)) + "."] }; }
    const re = t === 1; const v = re ? r[0] : r[1];
    return { q: "Scrivi la parte " + (re ? "reale" : "immaginaria") + " di " + M("z=" + cP(z) + cP(w)) + ".", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(),
      sol: ["Sviluppo: " + M("z=" + cT(r)) + ".", M("\\text{" + (re ? "Re" : "Im") + "}(z)=" + v.tex()) + (re ? "." : " (un numero, senza i).")] };
  },
});

sk({
  id: "c8-module", ch: 9, title: "Il modulo (la « lunghezza » di un complesso)",
  learn: L({
    idea: "Un numero complesso " + M("a+bi") + " si può disegnare come il punto (a ; b). Il <b>modulo</b> è la sua distanza dall'origine: di nuovo Pitagora.",
    rule: M("|a+bi|=\\sqrt{a^2+b^2}") + ". " + M("|z_1z_2|=|z_1|\\,|z_2|") + " e " + M("\\left|\\frac{z_1}{z_2}\\right|=\\frac{|z_1|}{|z_2|}") + ".",
    steps: ["Leggi a e b (senza la i).", "Calcola " + M("a^2+b^2") + ".", "Fai la radice e semplifica.", "Per un prodotto o una divisione, moltiplica o dividi i moduli."],
    trap: M("|3-4i|=\\sqrt{9+16}=5") + ": " + M("b^2=(-4)^2=16") + ", non " + M("(-4i)^2") + ".",
  }),
  gen() {
    if (coin()) { let z = randZ(-8, 8); if (rnd() < 0.4) { const [a, b] = pick([[3, 4], [5, 12], [6, 8], [8, 15], [1, 1], [2, 2]]); z = cq(a * sg(), b * sg()); }
      const s = z[0].n * z[0].n + z[1].n * z[1].n; const [k, m] = simplSqrt(s);
      return { q: "Calcola " + M("\\left|" + cT(z) + "\\right|") + ".", type: "num", ans: sqrtIn(k, m), form: ["sqrt"], atex: sqrtT(k, m),
        sol: [M("\\sqrt{" + tp(z[0].n) + "^2+" + tp(z[1].n) + "^2}=\\sqrt{" + s + "}") + (m !== s ? "=" + M(sqrtT(k, m)) : "") + "."] }; }
    const [a, b] = pick([[3, 4], [1, 1], [5, 12], [1, 2], [2, 1]]), [c, d] = pick([[1, 1], [3, 4], [1, 3], [2, 2], [6, 8]]);
    const m1 = a * a + b * b, m2 = c * c + d * d; const prod = coin();
    const val = prod ? Math.sqrt(m1 * m2) : Math.sqrt(m1 / m2); const n = niceNum(val); if (!n) return this.gen();
    const z1 = cT(cq(a, b)), z2 = cT(cq(c, -d));
    return { q: "Calcola il modulo di " + M(prod ? pr(z1) + pr(z2) : frac(z1, z2)) + " (senza sviluppare).", type: "num", ans: n.s, form: ["sqrt"], atex: n.t,
      sol: [M("|" + z1 + "|=\\sqrt{" + m1 + "}") + " e " + M("|" + z2 + "|=\\sqrt{" + m2 + "}") + ".", (prod ? "Modulo di un prodotto = prodotto dei moduli: " + M("\\sqrt{" + m1 + "}\\times\\sqrt{" + m2 + "}") : "Modulo di una divisione = divisione dei moduli: " + M(frac("\\sqrt{" + m1 + "}", "\\sqrt{" + m2 + "}"))) + " = " + M(n.t) + "."] };
  },
});

/* complessi « notevoli »: r·(cos θ + i sin θ) con parti esatte */
function niceZ() {
  const k = pick(K12.filter(v => v % 2 === 0 || v % 3 === 0)); const kk = k > 12 ? k - 24 : k; const tv = trigOf(kk);
  const ref = tv.ref; const scale = ref === 3 ? pick([1, 2, 3]) : ref === 2 || ref === 4 ? pick([2, 4, 6]) : pick([1, 2, 3, 5]);
  const rIn = ref === 3 ? scale + "*sqrt(2)" : String(scale), rT = ref === 3 ? sqrtT(scale, 2) : String(scale);
  const r = ref === 3 ? scale * Math.SQRT2 : scale; const th = (kk * Math.PI) / 12;
  const re = r * Math.cos(th), im = r * Math.sin(th);
  return { k: kk, rIn, rT, re, im, zT: cTexNum(re, im), zIn: cInNum(re, im), tv };
}
sk({
  id: "c8-argument", ch: 9, title: "L'argomento (l'angolo di un complesso)",
  learn: L({
    idea: "Disegna il punto (a ; b). L'<b>argomento</b> è l'angolo tra l'asse orizzontale e la freccia che va dall'origine al punto. Si trova con cos e sin, come nella Tappa 4.",
    rule: M("\\cos\\theta=\\frac a{|z|}") + " e " + M("\\sin\\theta=\\frac b{|z|}") + ". Di solito si dà θ tra " + M("-\\pi") + " (escluso) e " + M("\\pi") + ".",
    steps: ["Calcola " + M("|z|") + ".", "Calcola " + M("\\cos\\theta=\\frac a{|z|}") + " e " + M("\\sin\\theta=\\frac b{|z|}") + ".", "Riconosci l'angolo (tabella) guardando i due segni.", "Disegna il punto per controllare in quale quarto sta."],
    trap: "Un complesso « in basso » (b < 0) ha argomento negativo.",
    input: "<code>-3pi/4</code>.",
  }),
  gen() {
    const Z = niceZ(); if (Z.k === 0 && Z.im === 0 && Z.re < 0) return this.gen();
    return { q: "Trova un argomento (tra " + M("-\\pi") + " escluso e " + M("\\pi") + ") di " + M("z=" + Z.zT) + ".", type: "num", ans: piIn(piK(Z.k)), form: ["pi"], atex: piT(piK(Z.k)),
      traps: Z.tv.s === "0" ? [] : [{ ans: piIn(piK(-Z.k)), m: "Guarda il segno della parte immaginaria: dà il segno dell'argomento." }],
      sol: [M("|z|=" + Z.rT) + ".", M("\\cos\\theta=" + Z.tv.ct) + " e " + M("\\sin\\theta=" + Z.tv.st) + ".", M("\\theta=" + piT(piK(Z.k))) + "."] };
  },
});

sk({
  id: "c8-algebrique-exponentielle", ch: 9, title: "Passare alla forma esponenziale",
  learn: L({
    idea: "Un complesso si può descrivere in due modi: con « quanto a destra e quanto in su » (" + M("a+bi") + ") oppure con « quanto è lungo e che angolo fa » (" + M("r\\,e^{i\\theta}") + "). Sono due indirizzi dello stesso punto.",
    rule: M("z=a+bi=r\\,e^{i\\theta}") + " con " + M("r=|z|") + " (modulo) e θ = argomento. (Forma trigonometrica: " + M("r(\\cos\\theta+i\\sin\\theta)") + ".)",
    steps: ["Calcola il modulo r.", "Trova l'argomento θ (con cos e sin).", "Scrivi " + M("r\\,e^{i\\theta}") + "."],
    trap: "Il modulo r è sempre positivo: " + M("-2e^{i\\pi/3}") + " non è una forma esponenziale.",
    input: "<code>2e^(i*pi/3)</code> oppure <code>sqrt(2)e^(-3iπ/4)</code>.",
  }),
  gen() {
    const Z = niceZ();
    return { q: "Scrivi nella forma esponenziale: " + M("z=" + Z.zT), type: "num", ans: Z.rIn + "*e^(i*" + piIn(piK(Z.k)) + ")", allow: ["i", "pi", "sqrt", "e"], form: ["expform"], atex: (Z.rT === "1" ? "" : Z.rT) + "e^{" + expT(Z.k) + "}",
      sol: [M("r=|z|=" + Z.rT) + ".", M("\\cos\\theta=" + Z.tv.ct) + ", " + M("\\sin\\theta=" + Z.tv.st) + " → " + M("\\theta=" + piT(piK(Z.k))) + ".", M("z=" + (Z.rT === "1" ? "" : Z.rT) + "e^{" + expT(Z.k) + "}") + "."] };
  },
});

sk({
  id: "c8-exponentielle-algebrique", ch: 9, title: "Tornare alla forma a + bi",
  learn: L({
    idea: "È il viaggio inverso: conosci lunghezza e angolo, e vuoi sapere « quanto a destra e quanto in su ».",
    rule: M("r\\,e^{i\\theta}=r\\cos\\theta+i\\,r\\sin\\theta") + ".",
    steps: ["Calcola " + M("\\cos\\theta") + " e " + M("\\sin\\theta") + " (valori esatti).", "Moltiplica ognuno per r.", "Scrivi " + M("a+bi") + "."],
    trap: M("e^{i\\pi}=-1") + " e " + M("e^{i\\pi/2}=i") + ".",
  }),
  gen() {
    const Z = niceZ();
    return { q: "Scrivi nella forma a + bi: " + M("z=" + (Z.rT === "1" ? "" : Z.rT) + "e^{" + expT(Z.k) + "}"), type: "num", ans: Z.zIn, allow: ["i", "sqrt"], form: ["algebraic"], atex: Z.zT,
      sol: [M("\\cos\\left(" + piT(piK(Z.k)) + "\\right)=" + Z.tv.ct) + ", " + M("\\sin\\left(" + piT(piK(Z.k)) + "\\right)=" + Z.tv.st) + ".", M("z=" + Z.rT + "\\times" + pr(Z.tv.ct) + "+i\\times" + Z.rT + "\\times" + pr(Z.tv.st) + "=" + Z.zT) + "."] };
  },
});

sk({
  id: "c8-calculs-exponentielle", ch: 9, title: "Prodotti e potenze in forma esponenziale",
  learn: L({
    idea: "La forma esponenziale rende facili le moltiplicazioni: le lunghezze si moltiplicano e gli angoli si sommano (come gli esponenti delle potenze).",
    rule: D("r_1e^{i\\theta_1}\\times r_2e^{i\\theta_2}=r_1r_2\\,e^{i(\\theta_1+\\theta_2)}\\qquad \\frac{r_1e^{i\\theta_1}}{r_2e^{i\\theta_2}}=\\frac{r_1}{r_2}e^{i(\\theta_1-\\theta_2)}\\qquad (re^{i\\theta})^n=r^ne^{in\\theta}"),
    steps: ["Scrivi ogni numero in forma esponenziale.", "Moduli: moltiplica (o dividi, o eleva alla n).", "Argomenti: somma (o sottrai, o moltiplica per n).", "Se chiedono la forma a + bi, torna indietro alla fine."],
    trap: "In una potenza, il <b>modulo</b> va elevato alla n e l'<b>argomento</b> va moltiplicato per n.",
  }),
  gen() {
    if (coin()) { const n = ri(2, 12); const s = pick([1, -1]); // (1 + s i)^n
      let z = cq(1, 0); for (let i = 0; i < n; i++) z = cMul(z, cq(1, s));
      return { q: "Calcola " + M("(1" + (s > 0 ? "+" : "-") + "i)^{" + n + "}") + " (forma a + bi).", type: "num", ans: cIn(z), allow: ["i"], form: ["algebraic"], atex: cT(z),
        sol: [M("1" + (s > 0 ? "+" : "-") + "i=\\sqrt2\\,e^{" + (s > 0 ? "" : "-") + "i\\pi/4}") + ".", M("(1" + (s > 0 ? "+" : "-") + "i)^{" + n + "}=(\\sqrt2)^{" + n + "}e^{" + (s > 0 ? "" : "-") + "i" + n + "\\pi/4}") + ".", M("=" + cT(z)) + "."] }; }
    const r1 = ri(1, 5), r2 = ri(1, 5), k1 = rnz(-6, 6), k2 = rnz(-6, 6); const prod = coin();
    const R = prod ? q(r1 * r2) : q(r1, r2), K = prod ? q(k1 + k2, 6) : q(k1 - k2, 6);
    let Km = K; while (Km.v > 1) Km = Km.sub(2); while (Km.v <= -1) Km = Km.add(2);
    return { q: "Siano " + M("z_1=" + (r1 === 1 ? "" : r1) + "e^{" + expTQ(q(k1, 6)) + "}") + " e " + M("z_2=" + (r2 === 1 ? "" : r2) + "e^{" + expTQ(q(k2, 6)) + "}") + ". Scrivi " + M(prod ? "z_1z_2" : "\\frac{z_1}{z_2}") + " in forma esponenziale.", type: "num", ans: R.plain() + "*e^(i*" + piIn(Km) + ")", allow: ["i", "pi", "e"], form: ["expform"], atex: (R.eq(1) ? "" : R.tex()) + "e^{" + expTQ(Km) + "}",
      sol: ["Modulo: " + M(prod ? r1 + "\\times" + r2 + "=" + R.tex() : frac(r1, r2) + "=" + R.tex()) + ".", "Argomento: " + M(piT(q(k1, 6)) + (prod ? "+" : "-") + pr(piT(q(k2, 6))) + "=" + piT(K)) + (Km.eq(K) ? "" : ", riportato a " + M(piT(Km))) + "."] };
  },
});

sk({
  id: "c8-equation-lineaire", ch: 9, title: "Equazioni di primo grado con i complessi",
  learn: L({
    idea: "Si risolve come un'equazione normale: isoli z. Alla fine c'è di solito una divisione, che si fa con il coniugato.",
    rule: "Si isola z, poi si mette il risultato nella forma a + bi. Se compare " + M("\\bar z") + ", si pone " + M("z=x+iy") + " e si uguagliano le parti reali e le parti immaginarie.",
    steps: ["Isola z: " + M("z=\\frac{\\ldots}{\\ldots}") + ".", "Dividi moltiplicando per il coniugato.", "Con " + M("\\bar z") + ": poni " + M("z=x+iy") + ", sviluppa e scrivi « parte reale = parte reale, parte immaginaria = parte immaginaria »."],
    trap: M("\\bar z=x-iy") + ": il segno cambia solo davanti alla parte immaginaria.",
  }),
  gen() {
    if (coin()) { const a = randZ(-4, 4), zs = randZ(-5, 5), b = randZ(-6, 6); const c = cAdd(cMul(a, zs), b);
      return { q: "Risolvi: " + M(cP(a) + "z+" + cP(b) + "=" + cT(c)) + " (scrivi z nella forma a + bi).", type: "num", ans: cIn(zs), allow: ["i"], form: ["algebraic"], atex: "z=" + cT(zs),
        sol: [M(cP(a) + "z=" + cT(cSub(c, b))) + ".", M("z=" + frac(cT(cSub(c, b)), cT(a))) + "; moltiplico per il coniugato " + M(cT([a[0], a[1].neg()])) + ".", M("z=" + cT(zs)) + "."] }; }
    const x = rnz(-5, 5), y = rnz(-5, 5), k = pick([2, 3, -2]); // z + k z̄ = (1+k)x + (1−k) y i
    const rhs = cq((1 + k) * x, (1 - k) * y);
    return { q: "Risolvi: " + M("z" + (k < 0 ? "-" : "+") + Math.abs(k) + "\\bar z=" + cT(rhs)) + ".", type: "num", ans: cIn(cq(x, y)), allow: ["i"], form: ["algebraic"], atex: "z=" + cT(cq(x, y)),
      sol: ["Pongo " + M("z=x+iy") + ", " + M("\\bar z=x-iy") + ".", M("x+iy" + (k < 0 ? "-" : "+") + Math.abs(k) + "(x-iy)=" + (1 + k) + "x" + (1 - k < 0 ? "-" : "+") + Math.abs(1 - k) + "iy") + ".", "Uguaglio le parti: " + M((1 + k) + "x=" + (1 + k) * x) + " e " + M((1 - k) + "y=" + (1 - k) * y) + ", quindi " + M("x=" + x) + ", " + M("y=" + y) + ".", M("z=" + cT(cq(x, y))) + "."] };
  },
});

sk({
  id: "c8-equation-second-degre", ch: 9, title: "Equazioni di secondo grado con Δ negativo",
  learn: L({
    idea: "Nella Tappa 3, con Δ < 0 non c'erano soluzioni. Ora, grazie a i, le soluzioni ci sono: sono due numeri complessi, uno il coniugato dell'altro.",
    rule: "Se " + M("\\Delta<0") + ": " + M("z=\\frac{-b\\pm i\\sqrt{-\\Delta}}{2a}") + ".",
    steps: ["Calcola Δ.", "Se Δ < 0: calcola " + M("\\sqrt{-\\Delta}") + " (la radice di un numero positivo).", "Scrivi le due soluzioni " + M("\\frac{-b-i\\sqrt{-\\Delta}}{2a}") + " e " + M("\\frac{-b+i\\sqrt{-\\Delta}}{2a}") + ", poi semplifica."],
    trap: "Si fa la radice di " + M("-\\Delta") + " (positivo) e si mette i davanti.",
    input: "<code>1-2i ; 1+2i</code>.",
  }),
  gen() {
    const p = rnz(-5, 5), qq = ri(1, 5); const b = -2 * p, c = p * p + qq * qq; const D0 = b * b - 4 * c;
    const z1 = cq(p, -qq), z2 = cq(p, qq);
    return { q: "Risolvi con i numeri complessi: " + M("z^2" + mono(b, "z", false) + sgnTex(c) + "=0"), type: "set", ans: [cIn(z1), cIn(z2)], allow: ["i"], form: ["algebraic"], atex: setTex([cT(z1), cT(z2)]),
      traps: [{ ans: [cIn(z2)], m: "Ci sono due soluzioni (una è il coniugato dell'altra)." }],
      sol: [M("\\Delta=" + tp(b) + "^2-4\\times" + c + "=" + D0) + " < 0.", M("\\sqrt{-\\Delta}=\\sqrt{" + -D0 + "}=" + 2 * qq) + ".", M("z=" + frac(tx(-b) + "\\pm" + 2 * qq + "i", 2) + "=" + p + "\\pm" + (qq === 1 ? "" : qq) + "i") + "."] };
  },
});

sk({
  id: "c8-geometrie", ch: 9, title: "Geometria con i complessi",
  learn: L({
    idea: "Ogni punto del piano ha un « indirizzo » complesso, chiamato <b>affisso</b>: il punto (3 ; 2) ha affisso " + M("3+2i") + ". Distanze e punti medi si calcolano con i complessi.",
    rule: "Distanza: " + M("AB=|z_B-z_A|") + ". Punto medio: " + M("z_I=\\frac{z_A+z_B}2") + ". " + M("|z-z_A|=r") + ": cerchio di centro A e raggio r.",
    steps: ["Traduci la domanda in formula.", "Calcola con parte reale e parte immaginaria.", "Per gli insiemi di punti, riconosci la forma."],
    trap: M("|z+2-i|=3") + " vuol dire " + M("|z-(-2+i)|=3") + ": il centro è " + M("(-2\\,;\\,1)") + ".",
  }),
  gen() {
    const t = ri(1, 3); const A = cq(ri(-5, 5), ri(-5, 5)), B = cq(ri(-5, 5), ri(-5, 5));
    if (t === 1) { const d = cSub(B, A); const s = d[0].n * d[0].n + d[1].n * d[1].n; if (s === 0) return this.gen(); const [k, m] = simplSqrt(s);
      return { q: "Sia A il punto di affisso " + M(cT(A)) + " e B quello di affisso " + M(cT(B)) + ". Calcola la distanza AB.", type: "num", ans: sqrtIn(k, m), form: ["sqrt"], atex: sqrtT(k, m),
        sol: [M("z_B-z_A=" + cT(d)) + ".", M("AB=|" + cT(d) + "|=\\sqrt{" + s + "}" + (m !== s ? "=" + sqrtT(k, m) : "")) + "."] }; }
    if (t === 2) { const I = [A[0].add(B[0]).div(2), A[1].add(B[1]).div(2)];
      return { q: "Sia A il punto di affisso " + M(cT(A)) + " e B quello di affisso " + M(cT(B)) + ". Scrivi l'affisso del punto medio I di [AB].", type: "num", ans: cIn(I), allow: ["i"], form: ["algebraic"], atex: cT(I),
        sol: [M("z_I=" + frac(cP(A) + "+" + cP(B), 2) + "=" + cT(I)) + "."] }; }
    const a = rnz(-4, 4), b = rnz(-4, 4), r = ri(2, 5); const inside = cT(cq(-a, -b));
    const opts = ["Il cerchio di centro " + M("(" + a + "\\,;\\," + b + ")") + " e raggio " + r, "Il cerchio di centro " + M("(" + -a + "\\,;\\," + -b + ")") + " e raggio " + r, "Il cerchio di centro " + M("(" + a + "\\,;\\," + b + ")") + " e raggio " + r * r, "La retta di equazione " + M("y=" + r)];
    const order = shuf([0, 1, 2, 3]);
    return { q: "Qual è l'insieme dei punti M di affisso z tali che " + M("\\left|z" + (inside.startsWith("-") ? "" : "+") + inside + "\\right|=" + r) + "?", type: "choice", opts: order.map(i => opts[i]), a: order.indexOf(0), atex: "",
      sol: [M("\\left|z" + (inside.startsWith("-") ? "" : "+") + inside + "\\right|=\\left|z-(" + cT(cq(a, b)) + ")\\right|") + ": è la distanza tra M e il punto " + M("(" + a + "\\,;\\," + b + ")") + ".", "Questa distanza vale " + r + ": cerchio di centro " + M("(" + a + "\\,;\\," + b + ")") + " e raggio " + r + "."] };
  },
});

sk({
  id: "c8-impedances", ch: 9, title: "Le impedenze in elettrotecnica",
  learn: L({
    idea: "In elettrotecnica si usano i complessi per i circuiti in corrente alternata. Si scrive j al posto di i (perché i è già la corrente), ma le regole sono le stesse.",
    rule: M("j^2=-1") + ". " + M("Z_R=R") + ", " + M("Z_L=jL\\omega") + ", " + M("Z_C=\\frac1{jC\\omega}=-\\frac{j}{C\\omega}") + ". In serie si <b>sommano</b>; in parallelo " + M("Z=\\frac{Z_1Z_2}{Z_1+Z_2}") + ". Lo sfasamento è " + M("\\varphi=\\arg Z") + ".",
    steps: ["Calcola ogni impedenza (" + M("L\\omega") + ", " + M("\\frac1{C\\omega}") + ").", "Serie: " + M("Z=R+j\\left(L\\omega-\\frac1{C\\omega}\\right)") + ".", "Modulo " + M("|Z|=\\sqrt{R^2+X^2}") + ", sfasamento con " + M("\\tan\\varphi=\\frac XR") + "."],
    trap: M("\\frac1j=-j") + ": l'impedenza di un condensatore ha parte immaginaria <b>negativa</b>.",
    input: "<code>30+40j</code> (j oppure i, vanno bene tutti e due).",
  }),
  gen() {
    const t = ri(1, 4);
    const [R, X] = pick([[30, 40], [60, 80], [5, 12], [8, 6], [20, 20], [10, 10], [9, 12], [15, 20]]);
    if (t === 1) { const w = 100, L = X / w; const lf = fmtNum(L);
      return { q: "Un circuito in serie contiene " + M("R=" + R + "\\ \\Omega") + " e una bobina " + M("L=" + lf + "\\ \\text{H}") + ", con " + M("\\omega=" + w + "\\ \\text{rad/s}") + ". Scrivi l'impedenza complessa Z.", type: "num", ans: R + "+" + X + "i", allow: ["i"], form: ["algebraic"], atex: "Z=" + R + "+" + X + "j",
        sol: [M("L\\omega=" + lf + "\\times" + w + "=" + X + "\\ \\Omega") + ".", M("Z=R+jL\\omega=" + R + "+" + X + "j") + "."] }; }
    if (t === 2) { const Zm = Math.sqrt(R * R + X * X);
      return { q: "Qual è il modulo dell'impedenza " + M("Z=" + R + (coin() ? "+" : "-") + X + "j") + " (in Ω)?", type: "num", ans: String(Zm), form: ["sqrt"], atex: fmtNum(Zm) + "\\ \\Omega",
        sol: [M("|Z|=\\sqrt{" + R + "^2+" + X + "^2}=\\sqrt{" + (R * R + X * X) + "}=" + fmtNum(Zm)) + " Ω."].map(s => s.replace("=" + fmtNum(Zm) + "\\)", "=" + niceNum(Zm).t + "\\)")) }; }
    if (t === 3) { const Rr = ri(1, 9) * 10, XC = pick([10, 20, 50, 100]);
      return { q: "Un circuito in serie contiene " + M("R=" + Rr + "\\ \\Omega") + " e un condensatore con " + M("\\frac{1}{C\\omega}=" + XC + "\\ \\Omega") + ". Scrivi l'impedenza complessa Z.", type: "num", ans: Rr + "-" + XC + "i", allow: ["i"], form: ["algebraic"], atex: "Z=" + Rr + "-" + XC + "j",
        traps: [{ ans: Rr + "+" + XC + "i", m: M("Z_C=\\frac1{jC\\omega}=-\\frac{j}{C\\omega}") + ": la parte immaginaria è negativa." }],
        sol: [M("Z_C=\\frac{1}{jC\\omega}=-j\\times" + XC) + " (perché " + M("\\frac1j=-j") + ").", M("Z=" + Rr + "-" + XC + "j") + "."] }; }
    const k = ri(1, 5) * 2; const Rp = k, Xp = k; const Zr = cDiv(cMul(cq(Rp, 0), cq(0, Xp)), cq(Rp, Xp));
    const phase = coin();
    if (phase) return { q: "Qual è lo sfasamento " + M("\\varphi=\\arg Z") + " dell'impedenza " + M("Z=" + k + "+" + k + "j") + " (in radianti)?", type: "num", ans: "pi/4", form: ["pi"], atex: "\\frac\\pi4",
      sol: [M("\\tan\\varphi=\\frac{" + k + "}{" + k + "}=1") + " con parte reale positiva: " + M("\\varphi=\\frac\\pi4") + "."] };
    return { q: "Una resistenza " + M("R=" + Rp + "\\ \\Omega") + " è in parallelo con una bobina di impedenza " + M("Z_L=" + Xp + "j") + ". Scrivi l'impedenza equivalente Z.", type: "num", ans: cIn(Zr), allow: ["i"], form: ["algebraic"], atex: "Z=" + cT(Zr, "j"),
      sol: [M("Z=\\frac{Z_RZ_L}{Z_R+Z_L}=\\frac{" + Rp + "\\times" + Xp + "j}{" + Rp + "+" + Xp + "j}") + ".", "Moltiplico per il coniugato " + M(Rp + "-" + Xp + "j") + ": " + M("Z=" + cT(Zr, "j")) + "."] };
  },
});
