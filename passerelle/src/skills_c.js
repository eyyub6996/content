/* =====================================================================
   LEZIONI — Tappa 5 (funzioni, esponenziale, logaritmo) e Tappa 6 (derivate)
   ===================================================================== */

/* grafico in SVG (da −4 a 4) */
function plotSVG(f, o) {
  o = o || {}; const W = 240, H = 240, a = o.xmin ?? -4, b = o.xmax ?? 4, c = o.ymin ?? -4, d = o.ymax ?? 4;
  const X = x => ((x - a) / (b - a)) * W, Y = y => H - ((y - c) / (d - c)) * H;
  let g = "";
  for (let i = Math.ceil(a); i <= b; i++) g += '<line class="pg" x1="' + X(i).toFixed(1) + '" y1="0" x2="' + X(i).toFixed(1) + '" y2="' + H + '"/>';
  for (let j = Math.ceil(c); j <= d; j++) g += '<line class="pg" x1="0" y1="' + Y(j).toFixed(1) + '" x2="' + W + '" y2="' + Y(j).toFixed(1) + '"/>';
  g += '<line class="pa" x1="0" y1="' + Y(0).toFixed(1) + '" x2="' + W + '" y2="' + Y(0).toFixed(1) + '"/><line class="pa" x1="' + X(0).toFixed(1) + '" y1="0" x2="' + X(0).toFixed(1) + '" y2="' + H + '"/>';
  g += '<text class="pt" x="' + (X(1) - 3).toFixed(1) + '" y="' + (Y(0) + 13).toFixed(1) + '">1</text><text class="pt" x="' + (X(0) - 11).toFixed(1) + '" y="' + (Y(1) + 4).toFixed(1) + '">1</text>';
  let path = "", pen = false;
  for (let k = 0; k <= 480; k++) {
    const x = a + ((b - a) * k) / 480; let y; try { y = f(x); } catch (e) { y = NaN; }
    if (!isFinite(y) || y > d + 3 || y < c - 3) { pen = false; continue; }
    path += (pen ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1); pen = true;
  }
  return '<figure class="plotwrap"><svg viewBox="0 0 ' + W + " " + H + '" class="plot" role="img" aria-label="Grafico di una funzione">' + g + '<path class="pc" d="' + path + '"/></svg></figure>';
}

/* =========================== TAPPA 5 =========================== */
sk({
  id: "c4-image", ch: 5, title: "Calcolare f(a)",
  learn: L({
    idea: "Una <b>funzione</b> è come una macchina: le dai un numero x, lei fa dei calcoli e ti restituisce un altro numero, " + M("f(x)") + ". Calcolare " + M("f(3)") + " vuol dire: metti 3 al posto di x.",
    rule: "Per calcolare " + M("f(a)") + ", sostituisci <b>ogni</b> x con a, <b>tra parentesi</b>.",
    steps: ["Riscrivi l'espressione con delle parentesi vuote al posto di ogni x.", "Metti il numero dentro ogni parentesi.", "Calcola con l'ordine delle operazioni (prima le potenze)."],
    trap: "Se " + M("f(x)=x^2") + ", allora " + M("f(-3)=(-3)^2=9") + " e non " + M("-9") + ".",
  }),
  gen() {
    if (rnd() < 0.7) {
      const a = rnz(-4, 4), b = rnz(-9, 9), c = rnz(-9, 9), x0 = rnd() < 0.8 ? q(rnz(-5, 5)) : q(rnz(-5, 5), pick([2, 3]));
      const v = pevalQ([a, b, c], x0);
      const traps = x0.n < 0 ? [{ ans: q(a).mul(x0.mul(x0)).neg().add(x0.mul(b)).add(c).plain(), m: M(pr(x0.tex()) + "^2=" + x0.mul(x0).tex()) + ": un quadrato è positivo. Usa le parentesi!" }] : [];
      return { q: "Sia " + M("f(x)=" + polyT([a, b, c])) + ". Calcola " + M("f\\left(" + x0.tex() + "\\right)") + ".", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(), traps,
        sol: [M("f\\left(" + x0.tex() + "\\right)=" + tx(a) + "\\times" + pr(x0.tex()) + "^2" + (b < 0 ? "-" : "+") + Math.abs(b) + "\\times" + pr(x0.tex()) + sgnTex(c)) + ".", M("=" + q(a).mul(x0.mul(x0)).tex() + sgnTex(x0.mul(b)) + sgnTex(c) + "=" + v.tex()) + "."] };
    }
    const a = rnz(-5, 5), b = rnz(-9, 9), d = rnz(-6, 6); let x0 = q(rnz(-5, 5)); if (x0.add(d).n === 0) x0 = x0.add(1);
    const v = x0.mul(a).add(b).div(x0.add(d));
    return { q: "Sia " + M("f(x)=" + frac(linT(a, b), linT(1, d))) + ". Calcola " + M("f(" + x0.tex() + ")") + " (frazione semplificata).", type: "num", ans: v.plain(), form: ["irr"], atex: v.tex(),
      sol: [M("f(" + x0.tex() + ")=" + frac(tx(a) + "\\times" + tp(x0.n) + sgnTex(b), tx(x0.n) + sgnTex(d)) + "=" + frac(x0.mul(a).add(b).tex(), x0.add(d).tex()) + "=" + v.tex()) + "."] };
  },
});

sk({
  id: "c4-domaine", ch: 5, title: "Il dominio (dove la funzione esiste)",
  learn: L({
    idea: "Alcuni calcoli sono impossibili, quindi certe x non si possono mettere nella macchina. Il <b>dominio</b> è l'insieme delle x « permesse ».",
    rule: "Tre divieti: <b>dividere per 0</b>, <b>radice quadrata di un negativo</b>, <b>ln di un numero ≤ 0</b>." + D("\\frac1{u}:\\ u\\ne0\\qquad \\sqrt u:\\ u\\ge0\\qquad \\ln u:\\ u>0"),
    steps: ["Trova ogni frazione, radice e ln.", "Scrivi la condizione giusta per ognuna.", "Risolvi le condizioni.", "Scrivi il dominio come intervallo (o unione di intervalli)."],
    trap: "Per ln la condizione è <b>strettamente</b> positiva (parentesi aperta); per la radice è ≥ 0 (parentesi chiusa).",
    input: "<code>[2;+inf[</code>, <code>]-inf;3[ U ]3;+inf[</code> oppure <code>R\\{3}</code>.",
  }),
  gen() {
    const t = ri(1, 7); const a = rnz(-4, 4); const r = q(rnz(-8, 8), Math.abs(a)); const b = r.mul(-a); if (!b.isInt()) return this.gen();
    const u = linT(a, b.n), R = r.plain(), RT = r.tex();
    let fx, ans, sol;
    if (t === 1) { fx = "\\sqrt{" + u + "}"; ans = a > 0 ? "[" + R + ";+inf[" : "]-inf;" + R + "]"; sol = ["Condizione: " + M(u + "\\ge0") + (a < 0 ? " (divido per " + a + " < 0: il verso si gira)" : "") + ", cioè " + M("x" + (a > 0 ? "\\ge" : "\\le") + RT) + "."]; }
    else if (t === 2) { fx = frac(1, u); ans = "]-inf;" + R + "[ U ]" + R + ";+inf["; sol = ["Condizione: " + M(u + "\\ne0") + ", cioè " + M("x\\ne" + RT) + "."]; }
    else if (t === 3) { const k = ri(1, 6); fx = frac(ri(1, 5), "x^2-" + k * k); ans = "]-inf;" + -k + "[ U ]" + -k + ";" + k + "[ U ]" + k + ";+inf["; sol = ["Condizione: " + M("x^2-" + k * k + "\\ne0") + ", cioè " + M("x\\ne-" + k) + " e " + M("x\\ne" + k) + "."]; }
    else if (t === 4) { fx = "\\ln\\left(" + u + "\\right)"; ans = a > 0 ? "]" + R + ";+inf[" : "]-inf;" + R + "["; sol = ["Condizione: " + M(u + ">0") + ", cioè " + M("x" + (a > 0 ? ">" : "<") + RT) + "."]; }
    else if (t === 5) { const k = ri(1, 6); fx = "\\ln\\left(" + k * k + "-x^2\\right)"; ans = "]" + -k + ";" + k + "["; sol = ["Condizione: " + M(k * k + "-x^2>0") + ", cioè " + M("x^2<" + k * k) + ".", "È positivo tra le due soluzioni: " + M("-" + k + "<x<" + k) + "."]; }
    else if (t === 6) { fx = frac(1, "\\sqrt{" + u + "}"); ans = a > 0 ? "]" + R + ";+inf[" : "]-inf;" + R + "["; sol = ["Radice al denominatore: serve " + M(u + ">0") + " (≥ 0 per la radice, ≠ 0 per la frazione).", "Cioè " + M("x" + (a > 0 ? ">" : "<") + RT) + "."]; }
    else {
      const aa = ri(1, 3), rr = rnz(-5, 5), cc = rr + ri(1, 4); const u2 = linT(aa, -aa * rr);
      fx = frac("\\sqrt{" + u2 + "}", linT(1, -cc)); ans = "[" + rr + ";" + cc + "[ U ]" + cc + ";+inf[";
      sol = ["Radice: " + M(u2 + "\\ge0\\iff x\\ge" + rr) + ".", "Denominatore: " + M("x\\ne" + cc) + ".", "Tolgo " + cc + " da " + M("[" + rr + ";+\\infty[") + "."];
    }
    const atex = ivTex(parseIntervals(ans));
    sol.push("Dominio: " + M("D_f=" + atex) + ".");
    return { q: "Trova il dominio di " + M("f(x)=" + fx) + ".", type: "interval", ans, atex: "D_f=" + atex, sol };
  },
});

sk({
  id: "c4-reference", ch: 5, title: "Le funzioni da riconoscere", target: 5,
  learn: L({
    idea: "Alcune funzioni tornano sempre. Conviene riconoscere subito il loro grafico, come si riconosce una faccia.",
    rule: M("x^2") + ": una « U », minimo in (0 ; 0). " + M("x^3") + ": sale sempre. " + M("\\frac1x") + ": due rami separati, niente in x = 0. " + M("\\sqrt x") + ": parte da (0 ; 0), solo per x ≥ 0, sale. " + M("e^x") + ": sempre sopra l'asse, passa per (0 ; 1), sale sempre più in fretta. " + M("\\ln x") + ": solo per x > 0, passa per (1 ; 0), sale lentamente.",
    steps: ["Guarda dove esiste la curva (dominio).", "Guarda se sale o scende.", "Cerca un punto facile: (0 ; 1) per exp, (1 ; 0) per ln, (0 ; 0) per quadrato e cubo."],
    trap: M("\\ln x<0") + " per " + M("0<x<1") + "; " + M("e^x") + " non è mai negativo né zero.",
  }),
  gen() {
    const F = [
      [x => x * x, "x\\mapsto x^2"], [x => x * x * x, "x\\mapsto x^3"], [x => 1 / x, "x\\mapsto \\frac1x"], [x => (x >= 0 ? Math.sqrt(x) : NaN), "x\\mapsto\\sqrt x"],
      [x => Math.exp(x), "x\\mapsto e^x"], [x => (x > 0 ? Math.log(x) : NaN), "x\\mapsto \\ln x"], [x => -x * x, "x\\mapsto -x^2"], [x => Math.exp(-x), "x\\mapsto e^{-x}"],
    ];
    if (rnd() < 0.6) {
      const k = ri(0, F.length - 1); const others = shuf(F.map((_, i) => i).filter(i => i !== k)).slice(0, 3); const order = shuf([k].concat(others));
      return { q: "Quale funzione è disegnata qui sotto?" + plotSVG(F[k][0]), type: "choice", opts: order.map(i => M(F[i][1])), a: order.indexOf(k), atex: F[k][1],
        sol: ["Indizi: " + ["una « U » verso l'alto, vertice in (0 ; 0)", "sale sempre, passa per (0 ; 0) e (1 ; 1)", "due rami separati, niente in x = 0", "parte da (0 ; 0), solo per x ≥ 0", "sempre sopra l'asse, passa per (0 ; 1), sale", "solo per x > 0, passa per (1 ; 0), sale", "una « U » capovolta", "sempre positiva, passa per (0 ; 1), scende"][k] + "."] };
    }
    const P = [
      ["La funzione x² scende (è decrescente) su:", ["]-\\infty\\,;\\,0]", "[0\\,;\\,+\\infty[", "\\mathbb{R}", "]-1\\,;\\,1["], "La « U » scende fino al vertice (0 ; 0), poi risale."],
      ["Per quali x si ha " + M("\\ln x<0") + "?", ["]0\\,;\\,1[", "]-\\infty\\,;\\,0[", "]1\\,;\\,+\\infty[", "]-\\infty\\,;\\,1["], "ln è negativo prima di 1 (ed esiste solo per x > 0)."],
      ["Per quali x si ha " + M("e^x>0") + "?", ["\\mathbb{R}", "]0\\,;\\,+\\infty[", "[0\\,;\\,+\\infty[", "]1\\,;\\,+\\infty["], "L'esponenziale è sempre positiva, per ogni x."],
      ["La funzione " + M("x\\mapsto\\frac1x") + " esiste su:", ["\\mathbb{R}\\setminus\\{0\\}", "\\mathbb{R}", "]0\\,;\\,+\\infty[", "[0\\,;\\,+\\infty["], "Non si può dividere per 0: tutti i numeri tranne 0."],
      ["La funzione " + M("\\ln") + " esiste su:", ["]0\\,;\\,+\\infty[", "[0\\,;\\,+\\infty[", "\\mathbb{R}", "]1\\,;\\,+\\infty["], "ln u esiste solo se u > 0."],
      ["La radice quadrata esiste su:", ["[0\\,;\\,+\\infty[", "]0\\,;\\,+\\infty[", "\\mathbb{R}", "]-\\infty\\,;\\,0]"], "Si può fare la radice di 0, non di un negativo."],
      ["Per quali x si ha " + M("e^x<1") + "?", ["]-\\infty\\,;\\,0[", "]0\\,;\\,+\\infty[", "]-\\infty\\,;\\,1[", "\\varnothing"], M("e^x<e^0") + " quindi " + M("x<0") + " (exp sale sempre)."],
    ];
    const [qq, o, e] = pick(P); const order = shuf([0, 1, 2, 3]);
    return { q: qq, type: "choice", opts: order.map(i => M(o[i])), a: order.indexOf(0), atex: o[0], sol: [e] };
  },
});

sk({
  id: "c4-exp-regles", ch: 5, title: "Le regole dell'esponenziale",
  learn: L({
    idea: M("e") + " è un numero speciale (circa 2,718). " + M("e^x") + " segue le stesse regole di tutte le potenze che hai già visto: nei prodotti gli esponenti si sommano.",
    rule: D("e^a\\times e^b=e^{a+b}\\qquad \\frac{e^a}{e^b}=e^{a-b}\\qquad (e^a)^n=e^{na}\\qquad e^0=1\\qquad e^{-a}=\\frac1{e^a}"),
    steps: ["Scrivi tutto come esponenziali.", "Prodotto → somma gli esponenti; divisione → sottrai (tutto l'esponente di sotto, tra parentesi).", "Semplifica l'esponente."],
    trap: M("\\frac{e^{2x}}{e^{x-3}}=e^{2x-(x-3)}=e^{x+3}") + ": il − vale per tutto l'esponente di sotto.",
    input: "<code>e^(x+3)</code>.",
  }),
  gen() {
    const a = rnz(-4, 4), b = rnz(-5, 5), c = rnz(-4, 4), d = rnz(-5, 5), f = rnz(-4, 4), g = rnz(-5, 5);
    if (coin()) {
      const E = [a + c - f, b + d - g]; if (E[0] === 0 && E[1] === 0) return this.gen();
      return { q: "Scrivi nella forma " + M("e^{\\ldots}") + ": " + M(frac("e^{" + linT(a, b) + "}\\times e^{" + linT(c, d) + "}", "e^{" + linT(f, g) + "}")), type: "expr", ans: "e^(" + linIn(E[0], E[1]) + ")", form: ["singleExp"], dom: [-1, 1], atex: "e^{" + linT(E[0], E[1]) + "}",
        traps: [{ ans: "e^(" + linIn(a + c - f, b + d + g) + ")", m: "Il − davanti all'esponente di sotto vale per TUTTO l'esponente." }],
        sol: ["Esponente: " + M(pr(linT(a, b)) + "+" + pr(linT(c, d)) + "-" + pr(linT(f, g))) + ".", M("=" + linT(E[0], E[1])) + ", quindi " + M("e^{" + linT(E[0], E[1]) + "}") + "."] };
    }
    const n = ri(2, 4); const E = [a * n, b * n + d];
    return { q: "Scrivi nella forma " + M("e^{\\ldots}") + ": " + M("\\left(e^{" + linT(a, b) + "}\\right)^{" + n + "}\\times e^{" + d + "}"), type: "expr", ans: "e^(" + linIn(E[0], E[1]) + ")", form: ["singleExp"], dom: [-1, 1], atex: "e^{" + linT(E[0], E[1]) + "}",
      sol: [M("(e^{a})^" + n + "=e^{" + n + "a}") + ": " + M(n + pr(linT(a, b)) + "=" + linT(a * n, b * n)) + ".", "Poi aggiungo " + d + ": " + M("e^{" + linT(E[0], E[1]) + "}") + "."] };
  },
});

sk({
  id: "c4-ln-regles", ch: 5, title: "Le regole del logaritmo ln",
  learn: L({
    idea: M("\\ln") + " è il contrario di " + M("e^x") + ": " + M("\\ln(e^3)=3") + ". Chiedersi " + M("\\ln 8") + " vuol dire « a quale potenza devo elevare e per ottenere 8? ». Le sue regole trasformano i prodotti in somme.",
    rule: D("\\ln(ab)=\\ln a+\\ln b\\qquad \\ln\\frac ab=\\ln a-\\ln b\\qquad \\ln(a^n)=n\\ln a") + D("\\ln1=0\\qquad \\ln e=1\\qquad \\ln(e^x)=x\\qquad e^{\\ln x}=x\\ (x>0)"),
    steps: ["Scrivi ogni numero come potenza dello stesso numero: " + M("8=2^3") + ", " + M("\\frac1{16}=2^{-4}") + ", " + M("\\sqrt2=2^{1/2}") + ".", "Porta fuori gli esponenti: " + M("\\ln(2^3)=3\\ln2") + ".", "Somma i numeri davanti."],
    trap: M("\\ln(a+b)\\ne\\ln a+\\ln b") + ". E " + M("\\ln(3x)\\ne3\\ln x") + ".",
    input: "<code>3ln(2)</code>, <code>-1/2</code>.",
  }),
  gen() {
    if (rnd() < 0.6) {
      const p = pick([2, 3, 5]); const pw = p === 2 ? [[2, 1], [4, 2], [8, 3], [16, 4], [32, 5]] : p === 3 ? [[3, 1], [9, 2], [27, 3], [81, 4]] : [[5, 1], [25, 2], [125, 3]];
      const terms = []; let tot = q(0); const n = ri(2, 3);
      for (let i = 0; i < n; i++) {
        const kind = ri(1, 4); const [N, e] = pick(pw); const s = i === 0 ? 1 : sg();
        let tex, val;
        if (kind <= 2) { tex = "\\ln " + N; val = q(e); } else if (kind === 3) { tex = "\\ln\\frac{1}{" + N + "}"; val = q(-e); } else { tex = "\\ln\\sqrt{" + N + "}"; val = q(e, 2); }
        terms.push((i === 0 ? "" : s > 0 ? "+" : "-") + tex); tot = tot.add(val.mul(s));
      }
      const ans = tot.n === 0 ? "0" : tot.plain() + "*ln(" + p + ")";
      return { q: "Scrivi nella forma " + M("k\\ln " + p) + ": " + M(terms.join("")), type: "num", ans, allow: ["ln"], form: ["lnarg:" + p], atex: tot.n === 0 ? "0" : (tot.eq(1) ? "" : tot.eq(-1) ? "-" : tot.tex()) + "\\ln " + p,
        sol: ["Ogni numero è una potenza di " + p + ": " + pw.slice(0, 3).map(([N, e]) => M(N + "=" + p + "^{" + e + "}")).join(", ") + "…", "Porto fuori gli esponenti (" + M("\\ln\\frac1a=-\\ln a") + ", " + M("\\ln\\sqrt a=\\frac12\\ln a") + ") e sommo: " + M("k=" + tot.tex()) + "."] };
    }
    const a = ri(2, 6), L2 = [
      ["\\ln\\left(e^{" + a + "}\\right)", q(a), "ln ed exp si annullano: " + M("\\ln(e^x)=x") + "."],
      ["e^{\\ln " + a + "}", q(a), M("e^{\\ln x}=x") + " per x > 0."],
      ["\\ln\\sqrt e", q(1, 2), M("\\sqrt e=e^{1/2}") + ", quindi " + M("\\ln\\sqrt e=\\frac12") + "."],
      ["e^{2\\ln " + a + "}", q(a * a), M("2\\ln" + a + "=\\ln(" + a + "^2)") + ", quindi " + M("e^{\\ln " + a * a + "}=" + a * a) + "."],
      ["\\ln\\frac{1}{e^{" + a + "}}", q(-a), M("\\frac1{e^{" + a + "}}=e^{-" + a + "}") + ", quindi " + M("-" + a) + "."],
      ["e^{-\\ln " + a + "}", q(1, a), M("-\\ln" + a + "=\\ln\\frac1" + a) + ", quindi " + M("\\frac1" + a) + "."],
      ["\\ln 1+\\ln(e^{" + a + "})", q(a), M("\\ln1=0") + " e " + M("\\ln(e^{" + a + "})=" + a) + "."],
    ];
    const [t, v, e] = pick(L2);
    return { q: "Calcola: " + M(t), type: "num", ans: v.plain(), form: ["rat"], allow: [], atex: v.tex(), sol: [e, "Risultato: " + M(v.tex()) + "."] };
  },
});

sk({
  id: "c4-eq-exp", ch: 5, title: "Equazioni con l'esponenziale",
  learn: L({
    idea: "Per « liberare » la x che sta in alto nell'esponente si usa il suo contrario, ln. Ricorda però che " + M("e^{\\ldots}") + " è sempre positivo.",
    rule: M("e^a=e^b\\iff a=b") + ". Se " + M("k>0") + ": " + M("e^{u}=k\\iff u=\\ln k") + ". Se " + M("k\\le0") + ": nessuna soluzione.",
    steps: ["Isola l'esponenziale.", "Se hai " + M("e^{a}=e^{b}") + ": uguaglia gli esponenti.", "Se hai " + M("e^u=k") + ": controlla che k > 0, poi applica ln.", "Risolvi l'equazione che ottieni."],
    trap: M("e^{2x}=-3") + " non ha <b>nessuna</b> soluzione.",
    input: "<code>(ln(5)-1)/2</code> oppure <code>vuoto</code>.",
  }),
  gen() {
    const t = ri(1, 4); const a = rnz(-4, 4), b = rnz(-6, 6);
    if (t === 1) {
      let c = rnz(-4, 4); while (c === a) c = rnz(-4, 4); const d = rnz(-6, 6); const x = q(d - b, a - c);
      return { q: "Risolvi: " + M("e^{" + linT(a, b) + "}=e^{" + linT(c, d) + "}"), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["Stessa base e: uguaglio gli esponenti. " + M(linT(a, b) + "=" + linT(c, d)) + ".", M(polyT([a - c, 0]) + "=" + (d - b)) + ", " + M("x=" + x.tex()) + "."] };
    }
    if (t === 2) {
      const k = pick([2, 3, 5, 6, 7, 10]); const A = q(1, a), B = q(-b, a);
      const at = (A.eq(1) ? "" : A.eq(-1) ? "-" : A.tex()) + "\\ln " + k + (B.n ? sgnTex(B) : "");
      return { q: "Risolvi: " + M("e^{" + linT(a, b) + "}=" + k), type: "set", ans: ["(ln(" + k + ")" + (b < 0 ? "+" + -b : "-" + b) + ")/(" + a + ")"], allow: ["ln"], atex: setTex([at]),
        sol: [k + " > 0: applico ln. " + M(linT(a, b) + "=\\ln " + k) + ".", M("x=" + frac("\\ln " + k + sgnTex(-b), a)) + "."] };
    }
    if (t === 3) {
      const k = pick([-1, -2, -5, 0]);
      return { q: "Risolvi: " + M("e^{" + linT(a, b) + "}=" + k), type: "set", ans: [], atex: setTex([]),
        sol: ["Un esponenziale è sempre strettamente positivo.", M(k + "\\le0") + ": <b>nessuna soluzione</b>."] };
    }
    const m = rnz(-5, 5); const s = [0, m].sort((u, v) => u - v);
    return { q: "Risolvi: " + M("e^{" + polyT([1, -m, 0]) + "}=1"), type: "set", ans: s.map(String), form: ["rat"], atex: setTex(s.map(String)),
      sol: [M("1=e^0") + ", quindi " + M(polyT([1, -m, 0]) + "=0") + ".", "Prodotto uguale a zero: " + M("x" + pr(linT(1, -m)) + "=0") + ", " + M("x=0") + " oppure " + M("x=" + m) + "."] };
  },
});

sk({
  id: "c4-eq-ln", ch: 5, title: "Equazioni con ln",
  learn: L({
    idea: "Qui è il contrario: per liberare la x dentro ln si usa l'esponenziale. E dentro ln ci deve sempre essere un numero positivo.",
    rule: M("\\ln a=\\ln b\\iff a=b") + " (con a > 0, b > 0). " + M("\\ln u=k\\iff u=e^k") + ".",
    steps: ["Scrivi prima le condizioni (quello che è dentro ln deve essere > 0).", "Se serve, metti tutto in un solo ln (" + M("\\ln a+\\ln b=\\ln(ab)") + ").", "Togli i ln (o applica exp).", "Risolvi, poi <b>tieni solo</b> le soluzioni che rispettano le condizioni."],
    trap: "Dimenticare le condizioni: un valore che rende negativo quello che c'è dentro ln va scartato.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = ri(1, 4); let c = ri(1, 4); while (c === a) c = ri(1, 4);
      const x = q(rnz(-5, 6)); const b = rnz(-8, 8); const d = x.mul(a - c).add(b).n;
      const ok = x.mul(a).add(b).v > 0;
      return { q: "Risolvi: " + M("\\ln\\left(" + linT(a, b) + "\\right)=\\ln\\left(" + linT(c, d) + "\\right)"), type: "set", ans: ok ? [x.plain()] : [], form: ["rat"], atex: setTex(ok ? [x.tex()] : []),
        traps: ok ? [] : [{ ans: [x.plain()], m: "Per x = " + x.plain() + " quello che c'è dentro ln è negativo: va scartato." }],
        sol: ["Condizioni: " + M(linT(a, b) + ">0") + " e " + M(linT(c, d) + ">0") + ".", M(linT(a, b) + "=" + linT(c, d)) + " dà " + M("x=" + x.tex()) + ".", ok ? "Controllo: " + M(linT(a, b) + "=" + x.mul(a).add(b).tex() + ">0") + " ✔." : "Ma allora " + M(linT(a, b) + "=" + x.mul(a).add(b).tex() + "\\le0") + ": scartato. <b>Nessuna soluzione.</b>"] };
    }
    if (t === 2) {
      const a = ri(1, 4), b = rnz(-6, 6), k = rnz(-2, 3);
      const eT = k === 0 ? "1" : k === 1 ? "e" : "e^{" + k + "}";
      const at = a === 1 ? eT + (b ? sgnTex(-b) : "") : frac(eT + (b ? sgnTex(-b) : ""), a);
      return { q: "Risolvi: " + M("\\ln\\left(" + linT(a, b) + "\\right)=" + k), type: "set", ans: ["(e^(" + k + ")" + (b < 0 ? "+" + -b : "-" + b) + ")/(" + a + ")"], allow: ["e"], atex: setTex([at]), traps: [],
        sol: ["Applico exp: " + M(linT(a, b) + "=" + eT) + ".", M("x=" + at) + " (e " + M(linT(a, b) + "=" + eT + ">0") + " ✔)."] };
    }
    if (t === 3) {
      const p = ri(1, 4), x0 = p + ri(1, 5), c = x0 * x0 - p * p;
      return { q: "Risolvi: " + M("\\ln(x-" + p + ")+\\ln(x+" + p + ")=\\ln " + c), type: "set", ans: [String(x0)], form: ["rat"], atex: setTex([String(x0)]),
        traps: [{ ans: [String(-x0), String(x0)], m: M("x=-" + x0) + " rende " + M("x-" + p) + " negativo: va scartata (condizioni)." }],
        sol: ["Condizioni: " + M("x>" + p) + " (e " + M("x>-" + p) + ").", M("\\ln\\left((x-" + p + ")(x+" + p + ")\\right)=\\ln" + c) + " quindi " + M("x^2-" + p * p + "=" + c) + ", " + M("x^2=" + x0 * x0) + ".", M("x=" + x0) + " oppure " + M("x=-" + x0) + "; solo " + M(x0) + " rispetta " + M("x>" + p) + "."] };
    }
    const k = ri(1, 3);
    return { q: "Risolvi: " + M("\\ln x=-" + k), type: "set", ans: ["e^(-" + k + ")"], allow: ["e"], atex: setTex(["e^{-" + k + "}"]),
      traps: [{ ans: [], m: "ln x può essere negativo (per 0 < x < 1): una soluzione c'è." }],
      sol: ["Applico exp: " + M("x=e^{-" + k + "}") + " (che è > 0, va bene)."] };
  },
});

sk({
  id: "c4-eq-exp-changement", ch: 5, title: "Equazioni e²ˣ + b eˣ + c = 0",
  learn: L({
    idea: "Stesso trucco delle biquadratiche: " + M("e^{2x}=(e^x)^2") + ". Chiamando " + M("X=e^x") + ", l'equazione diventa di secondo grado in X.",
    rule: "Poni " + M("X=e^x") + " (con " + M("X>0") + "): l'equazione diventa " + M("X^2+bX+c=0") + ".",
    steps: ["Poni " + M("X=e^x") + ".", "Risolvi in X (Δ o scomposizione).", "Scarta le X ≤ 0 (un esponenziale è sempre > 0).", "Per ogni X > 0: " + M("x=\\ln X") + "."],
    trap: "Non dare i valori di X: la domanda chiede x. " + M("X=1") + " dà " + M("x=\\ln1=0") + ".",
    input: "<code>0 ; ln(2)</code>.",
  }),
  gen() {
    if (rnd() < 0.7) {
      const X1 = pick([1, 2, 3, 4, 5, -1, -2, -3]); let X2 = pick([1, 2, 3, 4, 6, 7]); while (X2 === X1) X2 = pick([2, 3, 5, 7]);
      const b = -(X1 + X2), c = X1 * X2; const xs = [X1, X2].filter(X => X > 0).sort((u, v) => u - v);
      const ans = xs.map(X => (X === 1 ? "0" : "ln(" + X + ")")), at = xs.map(X => (X === 1 ? "0" : "\\ln " + X));
      return { q: "Risolvi: " + M("e^{2x}" + mono(b, "e^x", false) + sgnTex(c) + "=0"), type: "set", ans, allow: ["ln"], atex: setTex(at),
        traps: [{ ans: [X1, X2].map(String), m: "Questi sono i valori di " + M("X=e^x") + ". Poi serve x = ln X." }],
        sol: ["Pongo " + M("X=e^x>0") + ": " + M("X^2" + mono(b, "X", false) + sgnTex(c) + "=0") + ".", "Soluzioni: " + M("X=" + X1) + " e " + M("X=" + X2) + ".", [X1, X2].map(X => (X > 0 ? M("e^x=" + X) + " → " + M("x=" + (X === 1 ? "0" : "\\ln " + X)) : M("e^x=" + X) + " impossibile")).join(" ; ") + "."] };
    }
    const Y1 = rnz(-2, 3); let Y2 = rnz(-2, 3); while (Y2 === Y1) Y2 = rnz(-2, 3);
    const b = -(Y1 + Y2), c = Y1 * Y2; const ys = [Y1, Y2].sort((u, v) => u - v);
    const eT = y => (y === 0 ? "1" : y === 1 ? "e" : "e^{" + y + "}");
    return { q: "Risolvi (per x > 0): " + M("(\\ln x)^2" + mono(b, "\\ln x", false) + (c ? sgnTex(c) : "") + "=0"), type: "set", ans: ys.map(y => "e^(" + y + ")"), allow: ["e"], atex: setTex(ys.map(eT)),
      sol: ["Pongo " + M("Y=\\ln x") + ": " + M("Y^2" + mono(b, "Y", false) + (c ? sgnTex(c) : "") + "=0") + ", soluzioni " + M("Y=" + Y1) + " e " + M("Y=" + Y2) + ".", M("\\ln x=Y\\iff x=e^Y") + ": " + ys.map(y => M(eT(y))).join(" e ") + "."] };
  },
});

sk({
  id: "c4-ineq-exp-ln", ch: 5, title: "Disequazioni con exp e ln",
  learn: L({
    idea: "exp e ln sono funzioni che « salgono sempre »: se un numero è più grande, anche il suo exp (o il suo ln) è più grande. Quindi si possono togliere senza girare il verso.",
    rule: M("e^a<e^b\\iff a<b") + " e " + M("\\ln a<\\ln b\\iff a<b") + " (per a, b > 0).",
    steps: ["Scrivi i due lati con la stessa funzione: " + M("1=e^0") + ", " + M("0=\\ln1") + ", " + M("k=\\ln(e^k)") + ".", "Togli exp (o ln) senza girare il verso.", "Con ln aggiungi la condizione « dentro > 0 »."],
    trap: M("\\ln(x-2)<0\\iff 0<x-2<1") + ": non dimenticare la condizione " + M("x-2>0") + ".",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = rnz(-4, 4), b = rnz(-6, 6), c = rnz(-3, 3); const op = pick(["<", ">", "\\le", "\\ge"]); const r = q(c - b, a);
      const flip = a < 0; const opR = flip ? { "<": ">", "\\le": "\\ge", ">": "<", "\\ge": "\\le" }[op] : op;
      const closed = opR.includes("e"), right = opR === ">" || opR === "\\ge";
      const ans = right ? ivS(r, Infinity, closed, false) : ivS(-Infinity, r, false, closed);
      return { q: "Risolvi: " + M("e^{" + linT(a, b) + "}" + op + (c === 0 ? " 1" : " e^{" + c + "}")), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
        sol: [(c === 0 ? M("1=e^0") + ". " : "") + "exp sale sempre: " + M(linT(a, b) + op + c) + ".", M(polyT([a, 0]) + op + (c - b)) + (flip ? "; divido per " + a + " < 0, il verso si gira" : "") + ": " + M("x" + opR + r.tex()) + ".", M("S=" + ivTex(parseIntervals(ans))) + "."] };
    }
    if (t === 2) {
      const p = rnz(-4, 5); const neg = coin(); const k = neg ? 0 : ri(1, 2);
      if (neg) return { q: "Risolvi: " + M("\\ln\\left(" + linT(1, -p) + "\\right)<0"), type: "interval", ans: "]" + p + ";" + (p + 1) + "[", atex: "S=\\left]" + p + "\\,;\\," + (p + 1) + "\\right[",
        traps: [{ ans: "]-inf;" + (p + 1) + "[", m: "Condizione: " + M("x-" + tp(p) + ">0") + ", quindi x > " + p + "." }],
        sol: ["Condizione: " + M("x>" + p) + ".", M("\\ln(" + linT(1, -p) + ")<\\ln1\\iff " + linT(1, -p) + "<1\\iff x<" + (p + 1)) + ".", M("S=\\left]" + p + "\\,;\\," + (p + 1) + "\\right[") + "."] };
      const eT = k === 1 ? "e" : "e^{" + k + "}";
      return { q: "Risolvi: " + M("\\ln\\left(" + linT(1, -p) + "\\right)\\ge " + k), type: "interval", ans: "[" + p + "+e^(" + k + ");+inf[", atex: "S=\\left[" + (p ? p + "+" : "") + eT + "\\,;\\,+\\infty\\right[",
        sol: ["Condizione: " + M("x>" + p) + ".", "exp sale sempre: " + M(linT(1, -p) + "\\ge " + eT) + ", cioè " + M("x\\ge " + (p ? p + "+" : "") + eT) + " (che è > " + p + ")."] };
    }
    const k = pick([2, 3, 5, 7]); const op = pick(["\\le", "<", ">", "\\ge"]); const right = op === ">" || op === "\\ge", closed = op.includes("e");
    const ans = right ? (closed ? "[" : "]") + "ln(" + k + ");+inf[" : "]-inf;ln(" + k + ")" + (closed ? "]" : "[");
    return { q: "Risolvi: " + M("e^x" + op + k), type: "interval", ans, atex: "S=" + (right ? (closed ? "\\left[" : "\\left]") + "\\ln " + k + "\\,;\\,+\\infty\\right[" : "\\left]-\\infty\\,;\\,\\ln " + k + (closed ? "\\right]" : "\\right[")),
      sol: [M(k + "=e^{\\ln " + k + "}") + "; exp sale sempre: " + M("x" + op + "\\ln " + k) + "."] };
  },
});

sk({
  id: "c4-limites-infini", ch: 5, title: "Limiti all'infinito (polinomi e frazioni)",
  learn: L({
    idea: "« Limite a +∞ » vuol dire: cosa succede a f(x) quando x diventa enorme (1000, un milione…)? Con numeri così grandi conta solo il termine con l'esponente più alto: gli altri diventano trascurabili.",
    rule: "All'infinito un polinomio si comporta come il suo <b>termine di grado più alto</b>. Una frazione di polinomi si comporta come il rapporto dei termini di grado più alto.",
    steps: ["Tieni solo il termine più forte sopra e sotto.", "Semplifica questo rapporto.", "Guarda dove va quello che resta (" + M("x^2\\to+\\infty") + ", " + M("\\frac{3}{x}\\to0") + "…)."],
    trap: "A " + M("-\\infty") + ": " + M("x^3\\to-\\infty") + " ma " + M("x^2\\to+\\infty") + ".",
    input: "<code>+inf</code>, <code>-inf</code>, <code>2/3</code>, <code>0</code>.",
  }),
  gen() {
    const side = pick([1, -1]); const S = side > 0 ? "+\\infty" : "-\\infty";
    if (coin()) {
      const n = ri(2, 4), a = rnz(-5, 5); const cs = [a]; for (let i = 0; i < n; i++) cs.push(rnz(-9, 9));
      const lim = a * Math.pow(side, n) > 0 ? "+inf" : "-inf";
      return { q: "Calcola " + M("\\lim_{x\\to" + S + "}\\left(" + polyT(cs) + "\\right)"), type: "lim", ans: lim, atex: lim === "+inf" ? "+\\infty" : "-\\infty",
        sol: ["Termine più forte: " + M(mono(a, "x^{" + n + "}", true)) + ".", "A " + M(S) + ", " + M("x^{" + n + "}\\to" + (Math.pow(side, n) > 0 ? "+\\infty" : "-\\infty")) + ", moltiplicato per " + a + ": " + M(lim === "+inf" ? "+\\infty" : "-\\infty") + "."] };
    }
    const n = ri(1, 3), m = ri(1, 3), a = rnz(-6, 6), b = rnz(-6, 6);
    const P = [a]; for (let i = 0; i < n; i++) P.push(rnz(-7, 7)); const Qd = [b]; for (let i = 0; i < m; i++) Qd.push(rnz(-7, 7));
    let ans, at, why;
    if (n === m) { const r = q(a, b); ans = r.plain(); at = r.tex(); why = "Stesso grado: il limite è il rapporto dei numeri davanti " + M(frac(a, b) + "=" + r.tex()) + "."; }
    else if (n < m) { ans = "0"; at = "0"; why = "Il grado di sopra è più piccolo: " + M(frac(mono(a, "", true), mono(b, "x^{" + (m - n) + "}", true)) + "\\to0") + "."; }
    else { const sgn = Math.sign(a / b) * Math.pow(side, n - m); ans = sgn > 0 ? "+inf" : "-inf"; at = sgn > 0 ? "+\\infty" : "-\\infty"; why = "Resta " + M(frac(a, b) + "\\,x^{" + (n - m) + "}") + ", che tende a " + M(at) + "."; }
    return { q: "Calcola " + M("\\lim_{x\\to" + S + "}" + frac(polyT(P), polyT(Qd))), type: "lim", ans, atex: at,
      sol: ["Termini più forti: " + M(frac(mono(a, n === 1 ? "x" : "x^{" + n + "}", true), mono(b, m === 1 ? "x" : "x^{" + m + "}", true))) + ".", why] };
  },
});

sk({
  id: "c4-limites-reference", ch: 5, title: "Limiti da sapere e confronto tra funzioni",
  learn: L({
    idea: "Alcuni limiti vanno semplicemente saputi, come le tabelline. E quando due funzioni « litigano » (una va a 0 e l'altra a ∞), vince sempre la più forte: <b>l'esponenziale batte le potenze di x, e le potenze di x battono ln</b>.",
    rule: M("\\lim_{-\\infty}e^x=0") + ", " + M("\\lim_{+\\infty}e^x=+\\infty") + ", " + M("\\lim_{0^+}\\ln x=-\\infty") + ", " + M("\\lim_{+\\infty}\\ln x=+\\infty") + ", " + M("\\lim_{0^+}\\frac1x=+\\infty") + ".<br>Chi vince: " + M("\\lim_{+\\infty}\\frac{e^x}{x^n}=+\\infty") + ", " + M("\\lim_{+\\infty}x^ne^{-x}=0") + ", " + M("\\lim_{+\\infty}\\frac{\\ln x}{x}=0") + ", " + M("\\lim_{0^+}x\\ln x=0") + ".",
    steps: ["Sostituisci ogni pezzo con il suo limite.", "Se esce una forma « in lotta » (" + M("\\frac\\infty\\infty") + ", " + M("0\\times\\infty") + "), guarda chi è più forte."],
    trap: M("e^{-x}\\to0") + " a " + M("+\\infty") + " (e non " + M("-\\infty") + "): un esponenziale è sempre positivo.",
  }),
  gen() {
    const a = ri(2, 5), n = ri(1, 3), k = rnz(-5, 5);
    const L0 = [
      ["\\lim_{x\\to-\\infty}e^{x}", "0", "0"], ["\\lim_{x\\to+\\infty}e^{-x}", "0", "0"], ["\\lim_{x\\to-\\infty}e^{-x}", "+inf", "+\\infty"],
      ["\\lim_{x\\to0^+}\\ln x", "-inf", "-\\infty"], ["\\lim_{x\\to+\\infty}\\ln x", "+inf", "+\\infty"],
      ["\\lim_{x\\to0^+}\\frac{" + a + "}{x}", "+inf", "+\\infty"], ["\\lim_{x\\to0^-}\\frac{" + a + "}{x}", "-inf", "-\\infty"], ["\\lim_{x\\to+\\infty}\\frac{" + a + "}{x}", "0", "0"],
      ["\\lim_{x\\to+\\infty}\\frac{e^x}{x^{" + n + "}}", "+inf", "+\\infty"], ["\\lim_{x\\to+\\infty}x^{" + n + "}e^{-x}", "0", "0"], ["\\lim_{x\\to+\\infty}\\frac{\\ln x}{x}", "0", "0"],
      ["\\lim_{x\\to0^+}x\\ln x", "0", "0"], ["\\lim_{x\\to-\\infty}xe^x", "0", "0"],
      ["\\lim_{x\\to+\\infty}\\left(" + k + "+" + a + "e^{-x}\\right)", String(k), String(k)], ["\\lim_{x\\to+\\infty}\\left(" + k + "-\\ln x\\right)", "-inf", "-\\infty"],
      ["\\lim_{x\\to-\\infty}\\left(" + a + "e^{x}" + sgnTex(k) + "\\right)", String(k), String(k)],
    ];
    const [e, ans, at] = pick(L0);
    return { q: "Calcola " + M(e) + ".", type: "lim", ans, atex: at, sol: ["È un limite da sapere (vedi « Da ricordare »): " + M(e + "=" + at) + "."] };
  },
});

sk({
  id: "c4-limites-forme", ch: 5, title: "Limiti che danno 0/0",
  learn: L({
    idea: "A volte, sostituendo, esce " + M("\\frac00") + ": non è un risultato, vuol dire « guarda meglio ». Quasi sempre c'è un fattore uguale sopra e sotto che si può semplificare.",
    rule: "Se esce " + M("\\frac00") + ", <b>scomponi</b> il numeratore e semplifica il fattore che vale zero.",
    steps: ["Sostituisci x con il numero: se esce " + M("\\frac00") + ", bisogna semplificare.", "Scomponi: per esempio " + M("x^2-a^2=(x-a)(x+a)") + ".", "Semplifica " + M("(x-a)") + ".", "Ora sostituisci il numero in quello che resta."],
    trap: "Se sotto va a 0 ma sopra no, il limite è infinito: guarda il segno.",
  }),
  gen() {
    const t = ri(1, 3); const a = rnz(-5, 5);
    if (t === 1) { let b = rnz(-6, 6); if (b === -a) b++;
      const P = [1, b - a, -a * b]; const v = a + b;
      return { q: "Calcola " + M("\\lim_{x\\to" + a + "}" + frac(polyT(P), linT(1, -a))), type: "lim", ans: String(v), atex: String(v),
        sol: ["Sostituendo esce " + M("\\frac00") + ": bisogna semplificare.", M(polyT(P) + "=" + pr(linT(1, -a)) + pr(linT(1, b))) + ".", "Semplifico: resta " + M(linT(1, b)) + ", che tende a " + M(a + sgnTex(b) + "=" + v) + "."] };
    }
    if (t === 2) { const r = q(1, 2 * a);
      return { q: "Calcola " + M("\\lim_{x\\to" + a + "}" + frac(linT(1, -a), "x^2-" + a * a)), type: "lim", ans: r.plain(), atex: r.tex(),
        sol: [M("x^2-" + a * a + "=" + pr(linT(1, -a)) + pr(linT(1, a))) + ".", "Semplifico: " + M(frac(1, linT(1, a))) + " → " + M(frac(1, 2 * a) + "=" + r.tex()) + "."] };
    }
    const k = rnz(-5, 5), p = rnz(-4, 4), side = pick(["+", "-"]);
    const pos = (k > 0) === (side === "+");
    return { q: "Calcola " + M("\\lim_{x\\to" + p + "^" + side + "}" + frac(k, linT(1, -p))), type: "lim", ans: pos ? "+inf" : "-inf", atex: pos ? "+\\infty" : "-\\infty",
      sol: ["Quando " + M("x\\to" + p + "^" + side) + ", " + M(linT(1, -p) + "\\to0^" + side) + " (x è " + (side === "+" ? "un po' più grande" : "un po' più piccolo") + " di " + p + ").", M(frac(k, "0^" + side)) + ": " + (pos ? M("+\\infty") : M("-\\infty")) + " (regola dei segni)."] };
  },
});

sk({
  id: "c4-asymptotes", ch: 5, title: "Gli asintoti",
  learn: L({
    idea: "Un <b>asintoto</b> è una retta a cui la curva si avvicina sempre di più senza toccarla, come un binario. Verticale: la curva « scappa » verso l'alto o il basso vicino a un valore vietato. Orizzontale: la curva si « appiattisce » verso un valore quando x va all'infinito.",
    rule: "Se " + M("\\lim_{x\\to a}f(x)=\\pm\\infty") + ": asintoto <b>verticale</b> " + M("x=a") + ". Se " + M("\\lim_{x\\to\\pm\\infty}f(x)=b") + ": asintoto <b>orizzontale</b> " + M("y=b") + ".<br>Per " + M("f(x)=\\frac{ax+b}{cx+d}") + ": " + M("x=-\\frac dc") + " e " + M("y=\\frac ac") + ".",
    steps: ["Verticale: valore vietato (denominatore = 0, numeratore ≠ 0).", "Orizzontale: limite all'infinito (rapporto dei termini più forti)."],
    trap: "Asintoto verticale → « x = … »; orizzontale → « y = … ».",
  }),
  gen() {
    const a = rnz(-6, 6), b = rnz(-9, 9), c = ri(1, 4) * sg(), d = rnz(-8, 8); if (a * d - b * c === 0) return this.gen();
    const V = q(-d, c), H = q(a, c); const vert = coin();
    if (rnd() < 0.3) { const k = rnz(-5, 5), m = rnz(-5, 5), p = rnz(-5, 5);
      const ask = vert ? q(p) : q(k);
      return { q: "Sia " + M("f(x)=" + k + (m < 0 ? "-" : "+") + frac(Math.abs(m), linT(1, -p))) + ". Scrivi l'equazione dell'asintoto " + (vert ? "verticale: " + M("x=\\;?") : "orizzontale: " + M("y=\\;?")), type: "num", ans: ask.plain(), form: ["rat"], atex: (vert ? "x=" : "y=") + ask.tex(),
        sol: [vert ? "Il denominatore vale zero in " + M("x=" + p) + ": asintoto verticale " + M("x=" + p) + "." : M(frac(m, linT(1, -p)) + "\\to0") + " all'infinito, quindi " + M("f(x)\\to" + k) + ": asintoto " + M("y=" + k) + "."] };
    }
    const ask = vert ? V : H;
    return { q: "Sia " + M("f(x)=" + frac(linT(a, b), linT(c, d))) + ". Scrivi l'equazione dell'asintoto " + (vert ? "verticale: " + M("x=\\;?") : "orizzontale: " + M("y=\\;?")), type: "num", ans: ask.plain(), form: ["rat"], atex: (vert ? "x=" : "y=") + ask.tex(),
      traps: [{ ans: (vert ? H : V).plain(), m: "Hai dato l'altro asintoto: verticale = valore vietato, orizzontale = limite all'infinito." }],
      sol: [vert ? "Valore vietato: " + M(linT(c, d) + "=0\\iff x=" + V.tex()) + " (lì il numeratore non è zero)." : "All'infinito: " + M("f(x)\\approx" + frac(mono(a, "x", true), mono(c, "x", true)) + "=" + H.tex()) + ".", "Asintoto: " + M((vert ? "x=" : "y=") + ask.tex()) + "."] };
  },
});

/* =========================== TAPPA 6 =========================== */
sk({
  id: "c5-taux", ch: 6, title: "Rapporto incrementale e velocità media",
  learn: L({
    idea: "Se in auto fai 120 km in 2 ore, la tua velocità media è 120 : 2 = 60 km/h. Per una funzione è lo stesso: quanto cambia f, diviso quanto cambia x. È la <b>pendenza media</b> tra due punti. La <b>derivata</b> è questa pendenza quando i due punti diventano vicinissimi.",
    rule: "Rapporto incrementale tra a e b: " + M("\\frac{f(b)-f(a)}{b-a}") + ".",
    steps: ["Calcola " + M("f(a)") + " e " + M("f(b)") + ".", "Fai la differenza " + M("f(b)-f(a)") + ".", "Dividi per " + M("b-a") + "."],
    trap: "Stesso ordine sopra e sotto: " + M("f(b)-f(a)") + " diviso " + M("b-a") + ".",
  }),
  gen() {
    const a = rnz(-3, 3), b = rnz(-6, 6), c = rnz(-9, 9); const x1 = ri(-3, 2), x2 = x1 + ri(1, 4);
    const f1 = pevalQ([a, b, c], q(x1)), f2 = pevalQ([a, b, c], q(x2)); const r = f2.sub(f1).div(x2 - x1);
    if (coin()) return { q: "Sia " + M("f(x)=" + polyT([a, b, c])) + ". Calcola il rapporto incrementale di f tra " + M(x1) + " e " + M(x2) + ".", type: "num", ans: r.plain(), form: ["rat"], atex: r.tex(),
      sol: [M("f(" + x1 + ")=" + f1.tex()) + " e " + M("f(" + x2 + ")=" + f2.tex()) + ".", M(frac(f2.tex() + "-" + tp(f1), x2 + "-" + tp(x1)) + "=" + frac(f2.sub(f1).tex(), x2 - x1) + "=" + r.tex()) + "."] };
    const A = ri(1, 3), B = ri(0, 6), t1 = ri(0, 2), t2 = t1 + ri(1, 3); const P = [A, B, 0];
    const d1 = pevalQ(P, q(t1)), d2 = pevalQ(P, q(t2)), v = d2.sub(d1).div(t2 - t1);
    return { q: "Un oggetto si trova nella posizione " + M("x(t)=" + polyT(P, "t")) + " (metri, t in secondi). Qual è la sua velocità media tra " + M("t=" + t1) + " e " + M("t=" + t2) + " (in m/s)?", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex() + "\\text{ m/s}",
      sol: [M("x(" + t1 + ")=" + d1.tex()) + ", " + M("x(" + t2 + ")=" + d2.tex()) + ".", M("v_{media}=" + frac(d2.tex() + "-" + tp(d1), t2 + "-" + t1) + "=" + v.tex()) + " m/s."] };
  },
});

function dTerms() {
  const pool = [
    () => { const a = rnz(-5, 5), n = ri(2, 5); return [mono(a, "x^{" + n + "}", false), "+(" + a + ")*x^" + n, mono(a * n, n - 1 === 1 ? "x" : "x^{" + (n - 1) + "}", false), "+(" + a * n + ")*x^" + (n - 1), null]; },
    () => { const a = rnz(-9, 9); return [mono(a, "x", false), "+(" + a + ")*x", sgnTex(a), "+(" + a + ")", null]; },
    () => { const a = rnz(-6, 6); return [(a < 0 ? " - " : " + ") + frac(Math.abs(a), "x"), "+(" + a + ")/x", (a < 0 ? " + " : " - ") + frac(Math.abs(a), "x^2"), "-(" + a + ")/x^2", "+(" + a + ")/x^2"]; },
    () => { const a = rnz(-4, 4) * 2; return [mono(a, "\\sqrt{x}", false), "+(" + a + ")*sqrt(x)", (a < 0 ? " - " : " + ") + frac(Math.abs(a / 2) === 1 ? "" : Math.abs(a / 2), "\\sqrt{x}").replace("\\frac{}", "\\frac{1}"), "+(" + a / 2 + ")/sqrt(x)", null]; },
    () => { const a = rnz(-5, 5); return [mono(a, "e^{x}", false), "+(" + a + ")*e^x", mono(a, "e^{x}", false), "+(" + a + ")*e^x", null]; },
    () => { const a = rnz(-5, 5); return [mono(a, "\\ln x", false), "+(" + a + ")*ln(x)", (a < 0 ? " - " : " + ") + frac(Math.abs(a), "x"), "+(" + a + ")/x", null]; },
    () => { const a = rnz(-4, 4); return [mono(a, "\\sin x", false), "+(" + a + ")*sin(x)", mono(a, "\\cos x", false), "+(" + a + ")*cos(x)", null]; },
    () => { const a = rnz(-4, 4); return [mono(a, "\\cos x", false), "+(" + a + ")*cos(x)", mono(-a, "\\sin x", false), "+(" + -a + ")*sin(x)", "+(" + a + ")*sin(x)"]; },
  ];
  const idx = shuf([0, 1, 2, 3, 4, 5, 6, 7]).slice(0, ri(2, 3)); const T = idx.map(i => pool[i]());
  const strip0 = s => s.replace(/^ \+ /, "").replace(/^ - /, "-");
  return { f: strip0(T.map(t => t[0]).join("")), fs: T.map(t => t[1]).join(""), d: strip0(T.map(t => t[2]).join("")), ds: T.map(t => t[3]).join(""), trap: T.some(t => t[4]) ? T.map(t => t[4] || t[3]).join("") : null };
}
sk({
  id: "c5-derivees-usuelles", ch: 6, title: "Le derivate delle funzioni di base",
  learn: L({
    idea: "La <b>derivata</b> " + M("f'(x)") + " dice quanto è ripida la curva in ogni punto (la sua pendenza). Per calcolarla non serve disegnare: basta una tabella di regole, da imparare come le tabelline.",
    rule: D("(x^n)'=nx^{n-1}\\quad (k)'=0\\quad \\left(\\tfrac1x\\right)'=-\\tfrac1{x^2}\\quad (\\sqrt x)'=\\tfrac1{2\\sqrt x}") + D("(e^x)'=e^x\\quad (\\ln x)'=\\tfrac1x\\quad (\\sin x)'=\\cos x\\quad (\\cos x)'=-\\sin x") + "E: " + M("(u+v)'=u'+v'") + ", " + M("(k\\cdot u)'=k\\cdot u'") + ".",
    steps: ["Deriva ogni termine separatamente.", "Il numero davanti resta davanti.", "Un numero da solo (costante) sparisce."],
    trap: M("(\\cos x)'=-\\sin x") + " (con il meno) e " + M("\\left(\\frac1x\\right)'=-\\frac1{x^2}") + ".",
    input: "<code>6x^2-3/x^2+e^x</code>. Puoi scrivere <code>f'(x)=</code> davanti.",
  }),
  gen() {
    const T = dTerms(); const c = rnz(-9, 9);
    return { q: "Calcola la derivata di " + M("f(x)=" + T.f + sgnTex(c)) + ".", type: "expr", ans: T.ds.replace(/^\+/, "") || "0", dom: [0.3, 3], atex: "f'(x)=" + T.d, lhs: 1, pre: "f'(x) =",
      traps: T.trap ? [{ ans: T.trap.replace(/^\+/, ""), m: "Controlla i segni: " + M("\\left(\\frac1x\\right)'=-\\frac1{x^2}") + " e " + M("(\\cos x)'=-\\sin x") + "." }] : [],
      sol: ["Derivo termine per termine; la costante " + c + " sparisce.", M("f'(x)=" + T.d) + "."] };
  },
});

sk({
  id: "c5-produit", ch: 6, title: "Derivata di un prodotto",
  learn: L({
    idea: "Quando due funzioni sono moltiplicate, la derivata <b>non</b> è il prodotto delle derivate. C'è una formula precisa: si deriva un pezzo alla volta, lasciando fermo l'altro.",
    rule: M("(u\\cdot v)'=u'\\cdot v+u\\cdot v'") + ".",
    steps: ["Scrivi chi è u e chi è v.", "Calcola u' e v'.", "Metti insieme: " + M("u'v+uv'") + ".", "Se serve, raccogli (spesso " + M("e^x") + ")."],
    trap: M("(x\\,e^x)'=1\\times e^x+x\\,e^x=(x+1)e^x") + ", non " + M("1\\times e^x") + ".",
    input: "<code>(2x+5)e^x</code>, <code>2xln(x)+x</code>.",
  }),
  gen() {
    const t = ri(1, 5); const a = rnz(-4, 4), b = rnz(-6, 6);
    const tpl = [
      null,
      { f: pr(linT(a, b)) + "e^{x}", fs: "(" + linIn(a, b) + ")*e^x", d: pr(linT(a, a + b)) + "e^{x}", ds: "(" + linIn(a, a + b) + ")*e^x", u: linT(a, b), up: String(a), v: "e^x", vp: "e^x", tr: "(" + a + ")*e^x" },
      { f: pr(polyT([a, 0, b])) + "\\ln x", fs: "(" + polyIn([a, 0, b]) + ")*ln(x)", d: mono(2 * a, "x\\ln x", true) + "+" + frac(polyT([a, 0, b]), "x"), ds: "(" + 2 * a + ")*x*ln(x)+(" + polyIn([a, 0, b]) + ")/x", u: polyT([a, 0, b]), up: mono(2 * a, "x", true), v: "\\ln x", vp: "\\frac1x", tr: "(" + 2 * a + ")*x/x" },
      { f: "x^{" + Math.abs(a) + "}e^{x}", fs: "x^" + Math.abs(a) + "*e^x", d: "(" + Math.abs(a) + "x^{" + (Math.abs(a) - 1) + "}+x^{" + Math.abs(a) + "})e^{x}", ds: "(" + Math.abs(a) + "*x^" + (Math.abs(a) - 1) + "+x^" + Math.abs(a) + ")*e^x", u: "x^{" + Math.abs(a) + "}", up: Math.abs(a) + "x^{" + (Math.abs(a) - 1) + "}", v: "e^x", vp: "e^x", tr: Math.abs(a) + "*x^" + (Math.abs(a) - 1) + "*e^x" },
      { f: mono(a, "x\\sin x", true), fs: "(" + a + ")*x*sin(x)", d: mono(a, "\\sin x", true) + mono(a, "x\\cos x", false), ds: "(" + a + ")*sin(x)+(" + a + ")*x*cos(x)", u: mono(a, "x", true), up: String(a), v: "\\sin x", vp: "\\cos x", tr: "(" + a + ")*cos(x)" },
      { f: pr(linT(a, b)) + pr(polyT([1, 0, rnz(-5, 5)])), fs: null },
    ][t];
    if (t === 5) { const c = rnz(-5, 5); const P = pmul([a, b], [1, 0, c]); const Dd = pder(P);
      return { q: "Calcola la derivata di " + M("f(x)=" + pr(linT(a, b)) + pr(polyT([1, 0, c]))) + ".", type: "expr", ans: polyIn(Dd), atex: "f'(x)=" + polyT(Dd), lhs: 1, pre: "f'(x) =",
        traps: [{ ans: "(" + a + ")*2*x", m: "La derivata di un prodotto non è il prodotto delle derivate: " + M("(uv)'=u'v+uv'") + "." }],
        sol: [M("u=" + linT(a, b)) + ", " + M("u'=" + a) + "; " + M("v=" + polyT([1, 0, c])) + ", " + M("v'=2x") + ".", M("f'(x)=" + a + pr(polyT([1, 0, c])) + "+" + pr(linT(a, b)) + "\\times2x=" + polyT(Dd)) + "."] };
    }
    if (t === 3 && Math.abs(a) < 2) return this.gen();
    return { q: "Calcola la derivata di " + M("f(x)=" + tpl.f) + ".", type: "expr", ans: tpl.ds, dom: [0.3, 3], atex: "f'(x)=" + tpl.d, lhs: 1, pre: "f'(x) =",
      traps: [{ ans: tpl.tr, m: "La derivata di un prodotto non è il prodotto delle derivate: " + M("(uv)'=u'v+uv'") + "." }],
      sol: [M("u=" + tpl.u) + ", " + M("u'=" + tpl.up) + "; " + M("v=" + tpl.v) + ", " + M("v'=" + tpl.vp) + ".", M("f'(x)=u'v+uv'=" + tpl.d) + "."] };
  },
});

sk({
  id: "c5-quotient", ch: 6, title: "Derivata di un quoziente (frazione)",
  learn: L({
    idea: "Per una frazione di funzioni c'è una formula simile a quella del prodotto, con un meno in mezzo e un quadrato sotto. L'ordine è importante.",
    rule: M("\\left(\\frac uv\\right)'=\\frac{u'v-uv'}{v^2}") + " e " + M("\\left(\\frac1v\\right)'=-\\frac{v'}{v^2}") + ".",
    steps: ["Scrivi u (sopra), v (sotto), u' e v'.", "Sopra: " + M("u'v-uv'") + " <b>in quest'ordine</b>.", "Sotto: " + M("v^2") + " (non svilupparlo).", "Sviluppa e riduci solo la parte di sopra."],
    trap: "L'ordine conta: " + M("u'v-uv'") + ", non " + M("uv'-u'v") + " (altrimenti il segno è sbagliato).",
    input: "<code>7/(x+2)^2</code>, <code>e^x(x-1)/x^2</code>.",
  }),
  gen() {
    const t = ri(1, 5);
    if (t === 1) {
      const a = rnz(-5, 5), b = rnz(-7, 7), c = ri(1, 3) * sg(), d = rnz(-7, 7); const N = a * d - b * c; if (N === 0) return this.gen();
      const den = linT(c, d);
      return { q: "Calcola la derivata di " + M("f(x)=" + frac(linT(a, b), den)) + ".", type: "expr", ans: N + "/(" + linIn(c, d) + ")^2", atex: "f'(x)=" + frac(N, pr(den) + "^2"), lhs: 1, pre: "f'(x) =",
        traps: [{ ans: String(q(a, c).v), m: "Non è " + M("\\frac{u'}{v'}") + ": usa " + M("\\frac{u'v-uv'}{v^2}") + "." }, { ans: -N + "/(" + linIn(c, d) + ")^2", m: "L'ordine conta: " + M("u'v-uv'") + " (tu hai il segno opposto)." }],
        sol: [M("u=" + linT(a, b)) + ", " + M("u'=" + a) + "; " + M("v=" + den) + ", " + M("v'=" + c) + ".", "Sopra: " + M(a + pr(den) + "-" + pr(linT(a, b)) + "\\times" + tp(c) + "=" + N) + ".", M("f'(x)=" + frac(N, pr(den) + "^2")) + "."] };
    }
    const k = rnz(-6, 6), a = ri(1, 4), b = rnz(-6, 6);
    const tpl = [null, null,
      { f: frac("e^x", "x"), ds: "e^x*(x-1)/x^2", d: frac("e^x(x-1)", "x^2"), s: [M("u=e^x=u'") + ", " + M("v=x") + ", " + M("v'=1") + ".", M("\\frac{e^x\\cdot x-e^x\\cdot1}{x^2}=\\frac{e^x(x-1)}{x^2}") + "."], tr: "e^x*(1-x)/x^2" },
      { f: frac("\\ln x", "x"), ds: "(1-ln(x))/x^2", d: frac("1-\\ln x", "x^2"), s: [M("u=\\ln x") + ", " + M("u'=\\frac1x") + ", " + M("v=x") + ", " + M("v'=1") + ".", M("\\frac{\\frac1x\\cdot x-\\ln x}{x^2}=\\frac{1-\\ln x}{x^2}") + "."], tr: "(ln(x)-1)/x^2" },
      { f: frac("x", "x^2+" + a), ds: "(" + a + "-x^2)/(x^2+" + a + ")^2", d: frac(a + "-x^2", "(x^2+" + a + ")^2"), s: [M("u=x,\\ u'=1") + "; " + M("v=x^2+" + a + ",\\ v'=2x") + ".", M("\\frac{(x^2+" + a + ")-x\\cdot2x}{(x^2+" + a + ")^2}=\\frac{" + a + "-x^2}{(x^2+" + a + ")^2}") + "."], tr: "(x^2-" + a + ")/(x^2+" + a + ")^2" },
      { f: frac(k, linT(a, b)), ds: -k * a + "/(" + linIn(a, b) + ")^2", d: frac(-k * a, pr(linT(a, b)) + "^2"), s: [M("\\left(\\frac1v\\right)'=-\\frac{v'}{v^2}") + " con " + M("v=" + linT(a, b)) + ", " + M("v'=" + a) + ".", M("f'(x)=" + k + "\\times\\frac{-" + a + "}{" + pr(linT(a, b)) + "^2}=" + frac(-k * a, pr(linT(a, b)) + "^2")) + "."], tr: k * a + "/(" + linIn(a, b) + ")^2" },
    ][t];
    return { q: "Calcola la derivata di " + M("f(x)=" + tpl.f) + ".", type: "expr", ans: tpl.ds, dom: [0.4, 3], atex: "f'(x)=" + tpl.d, lhs: 1, pre: "f'(x) =",
      traps: [{ ans: tpl.tr, m: "Errore di segno: sopra si fa " + M("u'v-uv'") + ", in quest'ordine." }], sol: tpl.s };
  },
});

sk({
  id: "c5-composee", ch: 6, title: "Derivata di una funzione composta (con un « dentro »)",
  learn: L({
    idea: "In " + M("e^{3x}") + " c'è una funzione « dentro » un'altra: il 3x sta dentro l'esponenziale. Regola: derivi la funzione esterna come al solito, e poi <b>moltiplichi per la derivata di quello che c'è dentro</b> (u').",
    rule: D("(e^u)'=u'e^u\\qquad (u^n)'=n\\,u'\\,u^{n-1}\\qquad (\\ln u)'=\\frac{u'}{u}\\qquad (\\sqrt u)'=\\frac{u'}{2\\sqrt u}") + D("(\\sin u)'=u'\\cos u\\qquad (\\cos u)'=-u'\\sin u"),
    steps: ["Trova la parte « dentro », u.", "Calcola u'.", "Applica la formula: derivata « di fuori » × u'."],
    trap: "Dimenticare u': " + M("(e^{3x})'=3e^{3x}") + ", non " + M("e^{3x}") + ".",
    input: "<code>3e^(3x+1)</code>, <code>2x/(x^2+1)</code>.",
  }),
  gen() {
    const t = ri(1, 8); const a = rnz(-4, 4), b = rnz(-6, 6), n = ri(2, 5), A = ri(1, 4), B = ri(1, 9);
    const U = linT(a, b), Ui = linIn(a, b);
    const T = [null,
      ["e^{" + U + "}", "(" + a + ")*e^(" + Ui + ")", mono(a, "e^{" + U + "}", true), "e^(" + Ui + ")", M("u=" + U) + ", " + M("u'=" + a)],
      [pr(U) + "^{" + n + "}", n * a + "*(" + Ui + ")^" + (n - 1), n * a + pr(U) + (n - 1 === 1 ? "" : "^{" + (n - 1) + "}"), n + "*(" + Ui + ")^" + (n - 1), M("u=" + U) + ", " + M("u'=" + a)],
      ["\\ln\\left(" + polyT([A, 0, B]) + "\\right)", 2 * A + "x/(" + polyIn([A, 0, B]) + ")", frac(2 * A + "x", polyT([A, 0, B])), "1/(" + polyIn([A, 0, B]) + ")", M("u=" + polyT([A, 0, B])) + ", " + M("u'=" + 2 * A + "x")],
      ["\\sqrt{" + linT(A, B) + "}", A + "/(2*sqrt(" + linIn(A, B) + "))", frac(A, "2\\sqrt{" + linT(A, B) + "}"), "1/(2*sqrt(" + linIn(A, B) + "))", M("u=" + linT(A, B)) + ", " + M("u'=" + A)],
      ["\\sin\\left(" + U + "\\right)", "(" + a + ")*cos(" + Ui + ")", mono(a, "\\cos\\left(" + U + "\\right)", true), "cos(" + Ui + ")", M("u=" + U) + ", " + M("u'=" + a)],
      ["\\cos\\left(" + A + "x^2\\right)", "(" + -2 * A + ")*x*sin(" + A + "x^2)", -2 * A + "x\\sin\\left(" + A + "x^2\\right)", "-sin(" + A + "x^2)", M("u=" + A + "x^2") + ", " + M("u'=" + 2 * A + "x")],
      ["e^{" + mono(A, "x^2", true) + "}", 2 * A + "x*e^(" + A + "x^2)", 2 * A + "x\\,e^{" + mono(A, "x^2", true) + "}", "e^(" + A + "x^2)", M("u=" + mono(A, "x^2", true)) + ", " + M("u'=" + 2 * A + "x")],
      [frac(1, pr(linT(A, B)) + "^2"), -2 * A + "/(" + linIn(A, B) + ")^3", frac(-2 * A, pr(linT(A, B)) + "^3"), "-2/(" + linIn(A, B) + ")^3", M("\\frac1{u^2}=u^{-2}") + ", " + M("u'=" + A)],
    ][t];
    return { q: "Calcola la derivata di " + M("f(x)=" + T[0]) + ".", type: "expr", ans: T[1], dom: [0.2, 2.5], atex: "f'(x)=" + T[2], lhs: 1, pre: "f'(x) =",
      traps: (Math.abs(a) === 1 && [1, 2, 5].includes(t)) || (t === 4 && A === 1) || (t === 8 && A === 1) ? [] : [{ ans: T[3], m: "Hai dimenticato di moltiplicare per u' (la derivata di quello che c'è dentro)." }],
      sol: [T[4] + ".", "Applico la formula: " + M("f'(x)=" + T[2]) + "."] };
  },
});

sk({
  id: "c5-mixte", ch: 6, title: "Derivate miste (livello esame)",
  learn: L({
    idea: "All'esame le regole si mescolano. Il segreto: chiediti « qual è l'operazione più esterna? » (una somma, un prodotto, una frazione?) e parti da lì. Le composte si trattano dentro.",
    steps: ["Qual è l'operazione « più esterna »?", "Applica la regola giusta (somma, prodotto, quoziente).", "Deriva ogni pezzo (anche le composte).", "Raccogli il risultato (spesso l'esponenziale)."],
    trap: M("(x\\,e^{-2x})'=e^{-2x}+x\\times(-2)e^{-2x}=(1-2x)e^{-2x}") + ".",
  }),
  gen() {
    const k = ri(1, 3), a = ri(1, 3), b = rnz(-5, 5);
    const T = [
      ["x\\,e^{-" + (k === 1 ? "" : k) + "x}", "(1-" + k + "x)*e^(-" + k + "x)", pr(linT(-k, 1)) + "e^{-" + (k === 1 ? "" : k) + "x}", ["Prodotto: " + M("u=x,\\ u'=1") + "; " + M("v=e^{-" + k + "x},\\ v'=-" + k + "e^{-" + k + "x}") + ".", M("f'(x)=e^{-" + k + "x}-" + k + "x\\,e^{-" + k + "x}=" + pr(linT(-k, 1)) + "e^{-" + k + "x}") + "."]],
      ["x^2e^{" + k + "x}", "(" + k + "x^2+2x)*e^(" + k + "x)", pr(polyT([k, 2, 0])) + "e^{" + k + "x}", ["Prodotto: " + M("u=x^2,\\ u'=2x") + "; " + M("v=e^{" + k + "x},\\ v'=" + k + "e^{" + k + "x}") + ".", M("f'(x)=2xe^{" + k + "x}+" + k + "x^2e^{" + k + "x}=" + pr(polyT([k, 2, 0])) + "e^{" + k + "x}") + "."]],
      ["x\\ln(" + a + "x)", "ln(" + a + "x)+1", "\\ln(" + a + "x)+1", ["Prodotto: " + M("u=x,\\ u'=1") + "; " + M("v=\\ln(" + a + "x),\\ v'=\\frac{" + a + "}{" + a + "x}=\\frac1x") + ".", M("f'(x)=\\ln(" + a + "x)+x\\cdot\\frac1x=\\ln(" + a + "x)+1") + "."]],
      [pr(linT(2, b)) + "e^{-x}", "(" + linIn(-2, 2 - b) + ")*e^(-x)", pr(linT(-2, 2 - b)) + "e^{-x}", ["Prodotto: " + M("u=" + linT(2, b) + ",\\ u'=2") + "; " + M("v=e^{-x},\\ v'=-e^{-x}") + ".", M("f'(x)=2e^{-x}-" + pr(linT(2, b)) + "e^{-x}=" + pr(linT(-2, 2 - b)) + "e^{-x}") + "."]],
      [frac("e^x", "x+" + a), "x*e^x/(x+" + a + ")^2".replace("x*e^x", a === 1 ? "x*e^x" : "(x+" + (a - 1) + ")*e^x"), frac((a === 1 ? "x" : "(x+" + (a - 1) + ")") + "e^x", "(x+" + a + ")^2"), ["Quoziente: " + M("u=e^x=u'") + ", " + M("v=x+" + a + ",\\ v'=1") + ".", M("f'(x)=\\frac{e^x(x+" + a + ")-e^x}{(x+" + a + ")^2}=" + frac((a === 1 ? "x" : "(x+" + (a - 1) + ")") + "e^x", "(x+" + a + ")^2")) + "."]],
      ["\\ln(x^2+" + a + ")+" + (k === 1 ? "" : k) + "x", "2x/(x^2+" + a + ")+" + k, frac("2x", "x^2+" + a) + "+" + k, ["Somma: " + M("(\\ln u)'=\\frac{u'}{u}") + " con " + M("u=x^2+" + a) + ".", M("f'(x)=\\frac{2x}{x^2+" + a + "}+" + k) + "."]],
      [pr(linT(k, b)) + "^3", 3 * k + "*(" + linIn(k, b) + ")^2", 3 * k + pr(linT(k, b)) + "^2", ["Composta " + M("u^3") + ": " + M("3u'u^2") + " con " + M("u'=" + k) + ".", M("f'(x)=" + 3 * k + pr(linT(k, b)) + "^2") + "."]],
    ];
    const [f, ds, d, s] = pick(T);
    return { q: "Calcola la derivata di " + M("f(x)=" + f) + ".", type: "expr", ans: ds, dom: [0.3, 2.5], atex: "f'(x)=" + d, lhs: 1, pre: "f'(x) =", sol: s };
  },
});

sk({
  id: "c5-tangente", ch: 6, title: "La retta tangente",
  learn: L({
    idea: "La tangente è la retta che « sfiora » la curva in un punto, con la stessa pendenza. La pendenza è la derivata in quel punto.",
    rule: "Tangente al grafico di f nel punto di ascissa a: " + D("y=f'(a)(x-a)+f(a)"),
    steps: ["Calcola " + M("f(a)") + ".", "Calcola " + M("f'(x)") + " e poi " + M("f'(a)") + " (la pendenza).", "Sostituisci in " + M("y=f'(a)(x-a)+f(a)") + ".", "Sviluppa per avere " + M("y=mx+p") + "."],
    trap: "È " + M("(x-a)") + ": se " + M("a=-2") + ", si scrive " + M("(x+2)") + ".",
    input: "<code>3x-2</code> (puoi scrivere <code>y = 3x-2</code>).",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const P = [rnz(-3, 3), rnz(-5, 5), rnz(-6, 6)]; if (coin()) P.unshift(rnz(-2, 2)); const a = rnz(-3, 3);
      const fa = pevalQ(P, q(a)), m = pevalQ(pder(P), q(a)), p = fa.sub(m.mul(a));
      return { q: "Sia " + M("f(x)=" + polyT(P)) + ". Trova l'equazione della tangente al grafico nel punto di ascissa " + M(a) + ".", type: "expr", ans: linIn(m, p), atex: "y=" + polyT([m, p]), lhs: 1, pre: "y =",
        sol: [M("f(" + a + ")=" + fa.tex()) + ".", M("f'(x)=" + polyT(pder(P))) + ", " + M("f'(" + a + ")=" + m.tex()) + ".", M("y=" + m.tex() + pr(linT(1, -a)) + sgnTex(fa) + "=" + polyT([m, p])) + "."] };
    }
    if (t === 2) { const a = pick([0, 1]); return a === 0 ? { q: "Trova l'equazione della tangente al grafico di " + M("f(x)=e^x") + " nel punto di ascissa " + M(0) + ".", type: "expr", ans: "x+1", atex: "y=x+1", lhs: 1, pre: "y =", sol: [M("f(0)=e^0=1") + ", " + M("f'(0)=e^0=1") + ".", M("y=1\\times(x-0)+1=x+1") + "."] }
      : { q: "Trova l'equazione della tangente al grafico di " + M("f(x)=e^x") + " nel punto di ascissa " + M(1) + ".", type: "expr", ans: "e*x", atex: "y=ex", lhs: 1, pre: "y =", sol: [M("f(1)=e") + ", " + M("f'(1)=e") + ".", M("y=e(x-1)+e=ex") + "."] }; }
    if (t === 3) { const k = ri(1, 4); return { q: "Trova l'equazione della tangente al grafico di " + M("f(x)=" + (k === 1 ? "" : k) + "\\ln x") + " nel punto di ascissa " + M(1) + ".", type: "expr", ans: k + "x-" + k, atex: "y=" + polyT([k, -k]), lhs: 1, pre: "y =", sol: [M("f(1)=" + k + "\\ln1=0") + ", " + M("f'(x)=\\frac{" + k + "}{x}") + ", " + M("f'(1)=" + k) + ".", M("y=" + k + "(x-1)+0=" + polyT([k, -k])) + "."] }; }
    const a = pick([1, 4, 9]), r = Math.sqrt(a), m = q(1, 2 * r), p = q(r).sub(m.mul(a));
    return { q: "Trova l'equazione della tangente al grafico di " + M("f(x)=\\sqrt x") + " nel punto di ascissa " + M(a) + ".", type: "expr", ans: linIn(m, p), atex: "y=" + polyT([m, p]), lhs: 1, pre: "y =",
      sol: [M("f(" + a + ")=" + r) + ", " + M("f'(x)=\\frac1{2\\sqrt x}") + ", " + M("f'(" + a + ")=" + m.tex()) + ".", M("y=" + m.tex() + "(x-" + a + ")+" + r + "=" + polyT([m, p])) + "."] };
  },
});

sk({
  id: "c5-variations", ch: 6, title: "Dove la funzione sale e dove scende",
  learn: L({
    idea: "La derivata è la pendenza. Se è <b>positiva</b>, la curva <b>sale</b> (come una strada in salita); se è <b>negativa</b>, <b>scende</b>. Quindi per sapere dove f sale basta studiare il segno di f'.",
    rule: "Se " + M("f'(x)>0") + " su un intervallo, f è <b>crescente</b> (sale); se " + M("f'(x)<0") + ", f è <b>decrescente</b> (scende).",
    steps: ["Calcola " + M("f'(x)") + " e scomponila.", "Studia il suo segno (tabella dei segni).", "Traduci: + → f sale, − → f scende.", "Rispondi con intervalli (le parentesi si possono chiudere nei punti dove f' = 0)."],
    trap: "Conta il segno di " + M("f'") + ", non il segno di f.",
    input: "<code>]-inf;-1] U [3;+inf[</code>.",
  }),
  gen() {
    const t = ri(1, 3); const up = coin();
    if (t === 1) {
      const r1 = rnz(-4, 3), r2 = r1 + 2 * ri(1, 3); const k = pick([1, -1]);
      const P = [q(k), q(-3 * k * (r1 + r2), 2), q(3 * k * r1 * r2), q(rnz(-5, 5))];
      const Dp = pder(P); const signs = k > 0 ? ["+", "-", "+"] : ["-", "+", "-"];
      const want = up ? "+" : "-"; const pts = [-Infinity, r1, r2, Infinity];
      const parts = signs.map((s, i) => (s === want ? { lo: pts[i], hi: pts[i + 1] } : null)).filter(Boolean);
      const ans = parts.map(p => (isFinite(p.lo) ? "[" + p.lo : "]-inf") + ";" + (isFinite(p.hi) ? p.hi + "]" : "+inf[")).join(" U ");
      return { q: "Sia " + M("f(x)=" + polyT(P)) + ". Su quale/i intervallo/i f è " + (up ? "crescente (sale)" : "decrescente (scende)") + "?", type: "interval", loose: 1, ans, atex: ivTex(parseIntervals(ans)),
        sol: [M("f'(x)=" + polyT(Dp) + "=" + (3 * k === 3 ? "3" : "-3") + pr(linT(1, -r1)) + pr(linT(1, -r2))) + ".", signTable([String(r1), String(r2)], [{ label: "f'(x)", signs }]), "f " + (up ? "sale" : "scende") + " dove " + M("f'(x)" + (up ? ">0" : "<0")) + ": " + M(ivTex(parseIntervals(ans))) + "."] };
    }
    if (t === 2) {
      const a = rnz(-4, 4); const r = a - 1;
      const ans = up ? "[" + r + ";+inf[" : "]-inf;" + r + "]";
      return { q: "Sia " + M("f(x)=" + pr(linT(1, -a)) + "e^x") + ". Su quale intervallo f è " + (up ? "crescente (sale)" : "decrescente (scende)") + "?", type: "interval", loose: 1, ans, atex: ivTex(parseIntervals(ans)),
        sol: [M("f'(x)=e^x+" + pr(linT(1, -a)) + "e^x=" + pr(linT(1, 1 - a)) + "e^x") + ".", M("e^x>0") + ": il segno di f' è quello di " + M(linT(1, 1 - a)) + ", positivo per " + M("x>" + r) + ".", "Risposta: " + M(ivTex(parseIntervals(ans))) + "."] };
    }
    const k = ri(1, 4);
    const ans = up ? "]0;" + k + "]" : "[" + k + ";+inf[";
    return { q: "Sia " + M("f(x)=" + (k === 1 ? "" : k) + "\\ln x-x") + " su " + M("]0;+\\infty[") + ". Su quale intervallo f è " + (up ? "crescente (sale)" : "decrescente (scende)") + "?", type: "interval", loose: 1, ans, atex: ivTex(parseIntervals(ans)),
      sol: [M("f'(x)=\\frac{" + k + "}{x}-1=\\frac{" + k + "-x}{x}") + ".", "Per x > 0 il segno è quello di " + M(k + "-x") + ": positivo se " + M("x<" + k) + ".", "Risposta: " + M(ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c5-extremum", ch: 6, title: "Massimo e minimo",
  learn: L({
    idea: "In cima a una collina la strada smette di salire e comincia a scendere: in quel punto la pendenza è zero. Così si trovano i massimi e i minimi: dove " + M("f'=0") + " e cambia segno.",
    rule: "Un massimo o un minimo si trova dove " + M("f'") + " <b>vale zero e cambia segno</b>. Su un intervallo chiuso " + M("[a;b]") + " si confrontano anche i valori agli estremi.",
    steps: ["Calcola f' e trova dove vale zero.", "Fai la tabella: dove sale, dove scende.", "Calcola f nei punti trovati (e agli estremi, se l'intervallo è chiuso).", "Il più grande è il massimo, il più piccolo il minimo."],
    trap: "Spesso si chiede il <b>valore</b> del massimo (f(x₀)), non il punto x₀ dove si trova.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = rnz(-3, 3), h = q(rnz(-4, 4), pick([1, 2])), c = rnz(-6, 6); const b = h.mul(-2 * a); if (!b.isInt()) return this.gen();
      const v = pevalQ([a, b.n, c], h); const kind = a > 0 ? "minimo" : "massimo";
      return { q: "Sia " + M("f(x)=" + polyT([a, b.n, c])) + ". Qual è il valore del " + kind + " di f?", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(),
        traps: [{ ans: h.plain(), m: "Questo è il punto x₀ dove si trova il " + kind + ". La domanda chiede il valore f(x₀)." }],
        sol: [M("f'(x)=" + polyT([2 * a, b.n]) + "=0\\iff x=" + h.tex()) + ".", "a = " + a + (a > 0 ? " > 0: f scende e poi sale, è un minimo." : " < 0: f sale e poi scende, è un massimo."), M("f\\left(" + h.tex() + "\\right)=" + v.tex()) + "."] };
    }
    if (t === 2) return { q: "Qual è il valore massimo di " + M("f(x)=x\\,e^{-x}") + " su " + M("\\mathbb R") + "?", type: "num", ans: "1/e", allow: ["e"], atex: "\\frac1e",
      traps: [{ ans: "1", m: "x = 1 è il punto del massimo; il suo valore è f(1)." }],
      sol: [M("f'(x)=(1-x)e^{-x}") + ", vale zero in " + M("x=1") + ": f sale prima e scende dopo.", "Massimo: " + M("f(1)=1\\times e^{-1}=\\frac1e") + "."] };
    if (t === 3) { const k = ri(1, 3); return { q: "Qual è il valore minimo di " + M("f(x)=e^{x}-" + (k === 1 ? "" : k) + "x") + " su " + M("\\mathbb R") + "?", type: "num", ans: k + "-" + k + "*ln(" + k + ")", allow: ["ln"], atex: k === 1 ? "1" : k + "-" + k + "\\ln " + k,
      sol: [M("f'(x)=e^x-" + k) + ", vale zero per " + M("x=\\ln " + k) + "; negativa prima, positiva dopo: è un minimo.", M("f(\\ln " + k + ")=" + k + "-" + k + "\\ln " + k) + (k === 1 ? " = 1" : "") + "."] }; }
    const r = ri(1, 3), B = r + ri(1, 3);
    const P = [1, 0, -3 * r * r, 0]; const vr = pevalQ(P, q(r)), v0 = q(0), vB = pevalQ(P, q(B));
    const askMax = coin(); const ans = askMax ? (vB.v > v0.v ? vB : v0) : vr;
    return { q: "Sia " + M("f(x)=" + polyT(P)) + " su " + M("[0\\,;\\," + B + "]") + ". Qual è il valore " + (askMax ? "massimo" : "minimo") + " di f su questo intervallo?", type: "num", ans: ans.plain(), form: ["rat"], atex: ans.tex(),
      sol: [M("f'(x)=3x^2-" + 3 * r * r + "=3(x-" + r + ")(x+" + r + ")") + ": su " + M("[0;" + B + "]") + " f scende fino a " + r + " e poi sale.", "Valori: " + M("f(0)=0") + ", " + M("f(" + r + ")=" + vr.tex()) + ", " + M("f(" + B + ")=" + vB.tex()) + ".", (askMax ? "Massimo" : "Minimo") + ": " + M(ans.tex()) + "."] };
  },
});

sk({
  id: "c5-optimisation", ch: 6, title: "Problemi di ottimizzazione",
  learn: L({
    idea: "« Ottimizzare » vuol dire trovare il massimo o il minimo di qualcosa di concreto: l'area più grande, il costo più basso… È la derivata applicata alla vita reale.",
    rule: "Scrivi la quantità da ottimizzare come una <b>funzione di una sola lettera</b>, poi studia la sua derivata.",
    steps: ["Scegli la lettera x (e i valori possibili).", "Scrivi la quantità da ottimizzare usando solo x.", "Deriva, trova dove f' = 0, controlla che sia davvero un massimo/minimo.", "Rispondi alla domanda (il valore o la misura, con l'unità)."],
    trap: "Rileggi la domanda: a volte chiede x, a volte il valore migliore.",
  }),
  gen() {
    const t = ri(1, 5);
    if (t === 1) { const k = ri(2, 15), P = 4 * k; return { q: "Un rettangolo ha perimetro " + M(P) + " m. Qual è la sua area massima (in m²)?", type: "num", ans: String(k * k), form: ["rat"], atex: k * k + "\\text{ m}^2",
      sol: ["Lati x e " + M((P / 2) + "-x") + ". Area " + M("A(x)=x(" + P / 2 + "-x)=" + P / 2 + "x-x^2") + ".", M("A'(x)=" + P / 2 + "-2x=0\\iff x=" + k) + " (massimo: A' passa da + a −).", "Il rettangolo è un quadrato di lato " + k + ": " + M("A=" + k * k) + " m²."] }; }
    if (t === 2) { const m = ri(2, 6), a = 6 * m; return { q: "Da un cartone quadrato di " + M(a) + " cm di lato si taglia un quadrato di lato x in ogni angolo, per fare una scatola senza coperchio. Per quale valore di x (in cm) il volume è massimo?", type: "num", ans: String(m), form: ["rat"], atex: "x=" + m,
      sol: [M("V(x)=x(" + a + "-2x)^2") + " per " + M("0<x<" + a / 2) + ".", M("V'(x)=(" + a + "-2x)^2-4x(" + a + "-2x)=(" + a + "-2x)(" + a + "-6x)") + ".", "In " + M("]0;" + a / 2 + "[") + ", V' vale zero in " + M("x=" + m) + " (da + a −): massimo per " + M("x=" + m) + " cm."] }; }
    if (t === 3) { const h = ri(3, 30), c = ri(10, 100), b = 2 * h; const askQ = coin(); const Bm = h * h - c;
      return { q: "Il guadagno (in migliaia di franchi) quando si vendono x pezzi è " + M("B(x)=-x^2+" + b + "x-" + c) + ". " + (askQ ? "Quanti pezzi bisogna vendere per guadagnare il massimo?" : "Qual è il guadagno massimo?"), type: "num", ans: String(askQ ? h : Bm), form: ["rat"], atex: askQ ? "x=" + h : String(Bm),
        sol: [M("B'(x)=-2x+" + b + "=0\\iff x=" + h) + " (B' passa da + a −: massimo).", askQ ? "Bisogna vendere " + h + " pezzi." : M("B(" + h + ")=-" + h * h + "+" + b * h + "-" + c + "=" + Bm) + "."] }; }
    if (t === 4) { const m = ri(2, 12), L0 = 4 * m; return { q: "Si recinta un'area rettangolare lungo un fiume (nessun recinto dal lato del fiume) con " + M(L0) + " m di rete. Qual è l'area massima (in m²)?", type: "num", ans: String(2 * m * m), form: ["rat"], atex: 2 * m * m + "\\text{ m}^2",
      sol: ["Due lati x perpendicolari al fiume, un lato " + M(L0 + "-2x") + ". " + M("A(x)=x(" + L0 + "-2x)") + ".", M("A'(x)=" + L0 + "-4x=0\\iff x=" + m) + ".", M("A(" + m + ")=" + m + "\\times" + 2 * m + "=" + 2 * m * m) + " m²."] }; }
    const k = ri(2, 9); const askX = coin();
    return { q: "Il costo medio di produzione è " + M("C(x)=x+" + frac(k * k, "x")) + " per " + M("x>0") + ". " + (askX ? "Per quale x è minimo?" : "Qual è il costo medio minimo?"), type: "num", ans: String(askX ? k : 2 * k), form: ["rat"], atex: askX ? "x=" + k : String(2 * k),
      sol: [M("C'(x)=1-" + frac(k * k, "x^2") + "=\\frac{x^2-" + k * k + "}{x^2}") + ", vale zero per " + M("x=" + k) + " (x > 0).", "C' passa da − a +: minimo. " + (askX ? M("x=" + k) : M("C(" + k + ")=" + k + "+" + k + "=" + 2 * k)) + "."] };
  },
});

sk({
  id: "c5-physique", ch: 6, title: "La derivata in fisica: velocità e corrente",
  learn: L({
    idea: "In fisica la derivata è ovunque: la velocità dice quanto cambia la posizione, l'accelerazione quanto cambia la velocità, la corrente quanto cambia la carica.",
    rule: "Velocità = derivata della posizione: " + M("v(t)=x'(t)") + ". Accelerazione = derivata della velocità: " + M("a(t)=v'(t)") + ". Corrente = derivata della carica: " + M("i(t)=q'(t)") + ".",
    steps: ["Riconosci cosa ti danno e cosa ti chiedono.", "Deriva (una o due volte).", "Sostituisci t con il valore richiesto e scrivi l'unità."],
    trap: "Qui la variabile è t (il tempo), non x.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 3) { const Q0 = ri(2, 12), tau = pick([1, 2, 4, 5]); const v = q(-Q0, tau);
      return { q: "La carica di un condensatore che si scarica è " + M("q(t)=" + Q0 + "e^{-t/" + tau + "}") + " (in mC, t in s). Calcola la corrente " + M("i(0)=q'(0)") + " (in mA).", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex() + "\\text{ mA}",
        sol: [M("q'(t)=" + Q0 + "\\times\\left(-\\frac1{" + tau + "}\\right)e^{-t/" + tau + "}") + ".", M("i(0)=-" + frac(Q0, tau) + "=" + v.tex()) + " mA (il segno − indica la scarica)."] }; }
    const P = [rnz(-2, 2), rnz(-4, 6), rnz(-5, 5), rnz(0, 9)]; const t0 = ri(0, 4); const acc = t === 2;
    const V = pder(P), A = pder(V); const v = pevalQ(acc ? A : V, q(t0));
    return { q: "La posizione di un oggetto è " + M("x(t)=" + polyT(P, "t")) + " (m, s). Calcola " + (acc ? "la sua accelerazione" : "la sua velocità") + " a " + M("t=" + t0) + " s.", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex() + (acc ? "\\text{ m/s}^2" : "\\text{ m/s}"),
      sol: [M("v(t)=x'(t)=" + polyT(V, "t")) + ".", acc ? M("a(t)=v'(t)=" + polyT(A, "t")) + ", " + M("a(" + t0 + ")=" + v.tex()) + " m/s²." : M("v(" + t0 + ")=" + v.tex()) + " m/s."] };
  },
});
