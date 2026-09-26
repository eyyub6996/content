/* =====================================================================
   COMPÉTENCES — escales 4 (fonctions, exp, ln) et 5 (dérivées)
   ===================================================================== */

/* courbe en SVG (repère de −4 à 4) */
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
  return '<figure class="plotwrap"><svg viewBox="0 0 ' + W + " " + H + '" class="plot" role="img" aria-label="Courbe d\'une fonction">' + g + '<path class="pc" d="' + path + '"/></svg></figure>';
}

/* =========================== ESCALE 4 =========================== */
sk({
  id: "c4-image", ch: 4, ref: 0, title: "Calculer une image f(a)",
  learn: L({
    rule: "Pour calculer " + M("f(a)") + ", on remplace <b>chaque</b> x par a, <b>entre parenthèses</b>.",
    steps: ["Réécris l'expression avec des parenthèses vides à la place de x.", "Mets la valeur dans chaque parenthèse.", "Calcule avec les priorités (puissances d'abord)."],
    trap: "Si " + M("f(x)=x^2") + ", alors " + M("f(-3)=(-3)^2=9") + " et pas " + M("-9") + ".",
  }),
  gen() {
    if (rnd() < 0.7) {
      const a = rnz(-4, 4), b = rnz(-9, 9), c = rnz(-9, 9), x0 = rnd() < 0.8 ? q(rnz(-5, 5)) : q(rnz(-5, 5), pick([2, 3]));
      const v = pevalQ([a, b, c], x0);
      const traps = x0.n < 0 ? [{ ans: q(a).mul(x0.mul(x0)).neg().add(x0.mul(b)).add(c).plain(), m: M(pr(x0.tex()) + "^2=" + x0.mul(x0).tex()) + " : un carré est positif. Mets des parenthèses !" }] : [];
      return { q: "Soit " + M("f(x)=" + polyT([a, b, c])) + ". Calcule " + M("f\\left(" + x0.tex() + "\\right)") + ".", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(), traps,
        sol: [M("f\\left(" + x0.tex() + "\\right)=" + tx(a) + "\\times" + pr(x0.tex()) + "^2" + (b < 0 ? "-" : "+") + Math.abs(b) + "\\times" + pr(x0.tex()) + sgnTex(c)) + ".", M("=" + q(a).mul(x0.mul(x0)).tex() + sgnTex(x0.mul(b)) + sgnTex(c) + "=" + v.tex()) + "."] };
    }
    const a = rnz(-5, 5), b = rnz(-9, 9), d = rnz(-6, 6); let x0 = q(rnz(-5, 5)); if (x0.add(d).n === 0) x0 = x0.add(1);
    const v = x0.mul(a).add(b).div(x0.add(d));
    return { q: "Soit " + M("f(x)=" + frac(linT(a, b), linT(1, d))) + ". Calcule " + M("f(" + x0.tex() + ")") + " (fraction irréductible).", type: "num", ans: v.plain(), form: ["irr"], atex: v.tex(),
      sol: [M("f(" + x0.tex() + ")=" + frac(tx(a) + "\\times" + tp(x0.n) + sgnTex(b), tx(x0.n) + sgnTex(d)) + "=" + frac(x0.mul(a).add(b).tex(), x0.add(d).tex()) + "=" + v.tex()) + "."] };
  },
});

sk({
  id: "c4-domaine", ch: 4, ref: 1, title: "Domaine de définition",
  learn: L({
    rule: "Trois interdits : <b>diviser par 0</b>, <b>racine carrée d'un négatif</b>, <b>ln d'un nombre ≤ 0</b>." + D("\\frac1{u}:\\ u\\ne0\\qquad \\sqrt u:\\ u\\ge0\\qquad \\ln u:\\ u>0"),
    steps: ["Repère chaque fraction, racine et ln.", "Écris la condition correspondante.", "Résous la ou les conditions.", "Écris le domaine en intervalle(s)."],
    trap: "Pour ln, la condition est <b>strictement</b> positive (crochet ouvert) ; pour la racine, ≥ 0 (crochet fermé).",
    input: "<code>[2;+inf[</code>, <code>]-inf;3[ U ]3;+inf[</code> ou <code>R\\{3}</code>.",
  }),
  gen() {
    const t = ri(1, 7); const a = rnz(-4, 4); const r = q(rnz(-8, 8), Math.abs(a)); const b = r.mul(-a); if (!b.isInt()) return this.gen();
    const u = linT(a, b.n), R = r.plain(), RT = r.tex();
    let fx, ans, sol;
    if (t === 1) { fx = "\\sqrt{" + u + "}"; ans = a > 0 ? "[" + R + ";+inf[" : "]-inf;" + R + "]"; sol = ["Condition : " + M(u + "\\ge0") + (a < 0 ? " (on divise par " + a + " < 0 : le sens change)" : "") + ", soit " + M("x" + (a > 0 ? "\\ge" : "\\le") + RT) + "."]; }
    else if (t === 2) { fx = frac(1, u); ans = "]-inf;" + R + "[ U ]" + R + ";+inf["; sol = ["Condition : " + M(u + "\\ne0") + ", soit " + M("x\\ne" + RT) + "."]; }
    else if (t === 3) { const k = ri(1, 6); fx = frac(ri(1, 5), "x^2-" + k * k); ans = "]-inf;" + -k + "[ U ]" + -k + ";" + k + "[ U ]" + k + ";+inf["; sol = ["Condition : " + M("x^2-" + k * k + "\\ne0") + ", soit " + M("x\\ne-" + k) + " et " + M("x\\ne" + k) + "."]; }
    else if (t === 4) { fx = "\\ln\\left(" + u + "\\right)"; ans = a > 0 ? "]" + R + ";+inf[" : "]-inf;" + R + "["; sol = ["Condition : " + M(u + ">0") + ", soit " + M("x" + (a > 0 ? ">" : "<") + RT) + "."]; }
    else if (t === 5) { const k = ri(1, 6); fx = "\\ln\\left(" + k * k + "-x^2\\right)"; ans = "]" + -k + ";" + k + "["; sol = ["Condition : " + M(k * k + "-x^2>0") + ", c'est-à-dire " + M("x^2<" + k * k) + ".", "Trinôme positif entre ses racines : " + M("-" + k + "<x<" + k) + "."]; }
    else if (t === 6) { fx = frac(1, "\\sqrt{" + u + "}"); ans = a > 0 ? "]" + R + ";+inf[" : "]-inf;" + R + "["; sol = ["Racine au dénominateur : il faut " + M(u + ">0") + " (≥ 0 pour la racine, ≠ 0 pour la fraction).", "Soit " + M("x" + (a > 0 ? ">" : "<") + RT) + "."]; }
    else {
      const aa = ri(1, 3), rr = rnz(-5, 5), cc = rr + (a > 0 ? ri(1, 4) : ri(1, 4)); const u2 = linT(aa, -aa * rr);
      fx = frac("\\sqrt{" + u2 + "}", linT(1, -cc)); ans = "[" + rr + ";" + cc + "[ U ]" + cc + ";+inf[";
      sol = ["Racine : " + M(u2 + "\\ge0\\iff x\\ge" + rr) + ".", "Dénominateur : " + M("x\\ne" + cc) + ".", "On enlève " + cc + " de " + M("[" + rr + ";+\\infty[") + "."];
    }
    const atex = ivTex(parseIntervals(ans));
    sol.push("Domaine : " + M("D_f=" + atex) + ".");
    return { q: "Donne le domaine de définition de " + M("f(x)=" + fx) + ".", type: "interval", ans, atex: "D_f=" + atex, sol };
  },
});

sk({
  id: "c4-reference", ch: 4, ref: 2, title: "Les fonctions de référence", target: 5,
  learn: L({
    rule: "Carré " + M("x^2") + " : parabole, décroissante puis croissante, minimum en 0. Cube " + M("x^3") + " : croissante sur ℝ. Inverse " + M("\\frac1x") + " : définie sur " + M("\\mathbb R^*") + ", deux branches, décroissante sur chaque intervalle. Racine " + M("\\sqrt x") + " : définie sur " + M("[0;+\\infty[") + ", croissante. " + M("e^x") + " : toujours > 0, croissante, passe par (0 ; 1). " + M("\\ln x") + " : définie sur " + M("]0;+\\infty[") + ", croissante, passe par (1 ; 0).",
    steps: ["Regarde où la courbe existe (domaine).", "Regarde si elle monte ou descend.", "Repère un point simple : (0 ; 1) pour exp, (1 ; 0) pour ln, (0 ; 0) pour carré et cube."],
    trap: M("\\ln x<0") + " pour " + M("0<x<1") + " ; " + M("e^x") + " n'est jamais négatif ni nul.",
  }),
  gen() {
    const F = [
      [x => x * x, "x\\mapsto x^2"], [x => x * x * x, "x\\mapsto x^3"], [x => 1 / x, "x\\mapsto \\frac1x"], [x => (x >= 0 ? Math.sqrt(x) : NaN), "x\\mapsto\\sqrt x"],
      [x => Math.exp(x), "x\\mapsto e^x"], [x => (x > 0 ? Math.log(x) : NaN), "x\\mapsto \\ln x"], [x => -x * x, "x\\mapsto -x^2"], [x => Math.exp(-x), "x\\mapsto e^{-x}"],
    ];
    if (rnd() < 0.6) {
      const k = ri(0, F.length - 1); const others = shuf(F.map((_, i) => i).filter(i => i !== k)).slice(0, 3); const order = shuf([k].concat(others));
      return { q: "Quelle fonction est représentée ci-dessous ?" + plotSVG(F[k][0]), type: "choice", opts: order.map(i => M(F[i][1])), a: order.indexOf(k), atex: F[k][1],
        sol: ["Repères : " + ["parabole tournée vers le haut, sommet en (0 ; 0)", "croissante sur ℝ, passe par (0 ; 0) et (1 ; 1)", "deux branches séparées, pas de point en x = 0", "commence en (0 ; 0), seulement pour x ≥ 0", "toujours au-dessus de l'axe, passe par (0 ; 1), croissante", "seulement pour x > 0, passe par (1 ; 0), croissante", "parabole tournée vers le bas", "toujours positive, passe par (0 ; 1), décroissante"][k] + "."] };
    }
    const P = [
      ["La fonction carré est décroissante sur :", ["]-\\infty\\,;\\,0]", "[0\\,;\\,+\\infty[", "\\mathbb{R}", "]-1\\,;\\,1["], "La parabole descend jusqu'au sommet (0 ; 0), puis remonte."],
      ["Pour quels x a-t-on " + M("\\ln x<0") + " ?", ["]0\\,;\\,1[", "]-\\infty\\,;\\,0[", "]1\\,;\\,+\\infty[", "]-\\infty\\,;\\,1["], "ln est négatif avant 1 (et n'existe que pour x > 0)."],
      ["Pour quels x a-t-on " + M("e^x>0") + " ?", ["\\mathbb{R}", "]0\\,;\\,+\\infty[", "[0\\,;\\,+\\infty[", "]1\\,;\\,+\\infty["], "L'exponentielle est strictement positive pour tout réel x."],
      ["La fonction inverse " + M("x\\mapsto\\frac1x") + " est définie sur :", ["\\mathbb{R}\\setminus\\{0\\}", "\\mathbb{R}", "]0\\,;\\,+\\infty[", "[0\\,;\\,+\\infty["], "On ne peut pas diviser par 0 : tout sauf 0."],
      ["La fonction " + M("\\ln") + " est définie sur :", ["]0\\,;\\,+\\infty[", "[0\\,;\\,+\\infty[", "\\mathbb{R}", "]1\\,;\\,+\\infty["], "ln u existe seulement si u > 0."],
      ["La fonction racine carrée est définie sur :", ["[0\\,;\\,+\\infty[", "]0\\,;\\,+\\infty[", "\\mathbb{R}", "]-\\infty\\,;\\,0]"], "On peut prendre la racine de 0, pas d'un négatif."],
      ["Pour quels x a-t-on " + M("e^x<1") + " ?", ["]-\\infty\\,;\\,0[", "]0\\,;\\,+\\infty[", "]-\\infty\\,;\\,1[", "\\varnothing"], M("e^x<e^0") + " donc " + M("x<0") + " (exp est croissante)."],
    ];
    const [qq, o, e] = pick(P); const order = shuf([0, 1, 2, 3]);
    return { q: qq, type: "choice", opts: order.map(i => M(o[i])), a: order.indexOf(0), atex: o[0], sol: [e] };
  },
});

sk({
  id: "c4-exp-regles", ch: 4, ref: 3, title: "Règles de l'exponentielle",
  learn: L({
    rule: D("e^a\\times e^b=e^{a+b}\\qquad \\frac{e^a}{e^b}=e^{a-b}\\qquad (e^a)^n=e^{na}\\qquad e^0=1\\qquad e^{-a}=\\frac1{e^a}"),
    steps: ["Mets tout sous la forme d'exponentielles.", "Produit → additionne les exposants ; quotient → soustrais (tout l'exposant du bas, entre parenthèses).", "Simplifie l'exposant."],
    trap: M("\\frac{e^{2x}}{e^{x-3}}=e^{2x-(x-3)}=e^{x+3}") + " : le − s'applique à tout l'exposant du bas.",
    input: "<code>e^(x+3)</code>.",
  }),
  gen() {
    const a = rnz(-4, 4), b = rnz(-5, 5), c = rnz(-4, 4), d = rnz(-5, 5), f = rnz(-4, 4), g = rnz(-5, 5);
    if (coin()) {
      const E = [a + c - f, b + d - g]; if (E[0] === 0 && E[1] === 0) return this.gen();
      return { q: "Écris sous la forme " + M("e^{\\ldots}") + " : " + M(frac("e^{" + linT(a, b) + "}\\times e^{" + linT(c, d) + "}", "e^{" + linT(f, g) + "}")), type: "expr", ans: "e^(" + linIn(E[0], E[1]) + ")", form: ["singleExp"], dom: [-1, 1], atex: "e^{" + linT(E[0], E[1]) + "}",
        traps: [{ ans: "e^(" + linIn(a + c - f, b + d + g) + ")", m: "Le − devant l'exposant du bas s'applique à TOUT l'exposant." }],
        sol: ["Exposant : " + M(pr(linT(a, b)) + "+" + pr(linT(c, d)) + "-" + pr(linT(f, g))) + ".", M("=" + linT(E[0], E[1])) + ", donc " + M("e^{" + linT(E[0], E[1]) + "}") + "."] };
    }
    const n = ri(2, 4); const E = [a * n, b * n + d];
    return { q: "Écris sous la forme " + M("e^{\\ldots}") + " : " + M("\\left(e^{" + linT(a, b) + "}\\right)^{" + n + "}\\times e^{" + d + "}"), type: "expr", ans: "e^(" + linIn(E[0], E[1]) + ")", form: ["singleExp"], dom: [-1, 1], atex: "e^{" + linT(E[0], E[1]) + "}",
      sol: [M("(e^{a})^" + n + "=e^{" + n + "a}") + " : " + M(n + pr(linT(a, b)) + "=" + linT(a * n, b * n)) + ".", "Puis on ajoute " + d + " : " + M("e^{" + linT(E[0], E[1]) + "}") + "."] };
  },
});

sk({
  id: "c4-ln-regles", ch: 4, ref: 4, title: "Règles du logarithme",
  learn: L({
    rule: D("\\ln(ab)=\\ln a+\\ln b\\qquad \\ln\\frac ab=\\ln a-\\ln b\\qquad \\ln(a^n)=n\\ln a") + D("\\ln1=0\\qquad \\ln e=1\\qquad \\ln(e^x)=x\\qquad e^{\\ln x}=x\\ (x>0)"),
    steps: ["Écris chaque nombre comme une puissance du même nombre premier : " + M("8=2^3") + ", " + M("\\frac1{16}=2^{-4}") + ", " + M("\\sqrt2=2^{1/2}") + ".", "Sors les exposants : " + M("\\ln(2^3)=3\\ln2") + ".", "Additionne les coefficients."],
    trap: M("\\ln(a+b)\\ne\\ln a+\\ln b") + ". Et " + M("\\ln(3x)\\ne3\\ln x") + ".",
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
      return { q: "Écris sous la forme " + M("k\\ln " + p) + " : " + M(terms.join("")), type: "num", ans, allow: ["ln"], form: ["lnarg:" + p], atex: tot.n === 0 ? "0" : (tot.eq(1) ? "" : tot.eq(-1) ? "-" : tot.tex()) + "\\ln " + p,
        sol: ["Chaque nombre est une puissance de " + p + " : " + pw.slice(0, 3).map(([N, e]) => M(N + "=" + p + "^{" + e + "}")).join(", ") + "…", "On sort les exposants (" + M("\\ln\\frac1a=-\\ln a") + ", " + M("\\ln\\sqrt a=\\frac12\\ln a") + ") et on additionne : " + M("k=" + tot.tex()) + "."] };
    }
    const a = ri(2, 6), L2 = [
      ["\\ln\\left(e^{" + a + "}\\right)", q(a), "ln et exp s'annulent : " + M("\\ln(e^x)=x") + "."],
      ["e^{\\ln " + a + "}", q(a), M("e^{\\ln x}=x") + " pour x > 0."],
      ["\\ln\\sqrt e", q(1, 2), M("\\sqrt e=e^{1/2}") + ", donc " + M("\\ln\\sqrt e=\\frac12") + "."],
      ["e^{2\\ln " + a + "}", q(a * a), M("2\\ln" + a + "=\\ln(" + a + "^2)") + ", donc " + M("e^{\\ln " + a * a + "}=" + a * a) + "."],
      ["\\ln\\frac{1}{e^{" + a + "}}", q(-a), M("\\frac1{e^{" + a + "}}=e^{-" + a + "}") + ", donc " + M("-" + a) + "."],
      ["e^{-\\ln " + a + "}", q(1, a), M("-\\ln" + a + "=\\ln\\frac1" + a) + ", donc " + M("\\frac1" + a) + "."],
      ["\\ln 1+\\ln(e^{" + a + "})", q(a), M("\\ln1=0") + " et " + M("\\ln(e^{" + a + "})=" + a) + "."],
    ];
    const [t, v, e] = pick(L2);
    return { q: "Calcule : " + M(t), type: "num", ans: v.plain(), form: ["rat"], allow: [], atex: v.tex(), sol: [e, "Résultat : " + M(v.tex()) + "."] };
  },
});

sk({
  id: "c4-eq-exp", ch: 4, ref: 3, title: "Équations avec l'exponentielle",
  learn: L({
    rule: M("e^a=e^b\\iff a=b") + ". Pour " + M("k>0") + " : " + M("e^{u}=k\\iff u=\\ln k") + ". Si " + M("k\\le0") + " : pas de solution (" + M("e^u>0") + " toujours).",
    steps: ["Isole l'exponentielle.", "Si c'est " + M("e^{a}=e^{b}") + " : égalise les exposants.", "Si c'est " + M("e^u=k") + " : vérifie que k > 0, puis applique ln.", "Résous l'équation obtenue."],
    trap: M("e^{2x}=-3") + " n'a <b>aucune</b> solution.",
    input: "<code>(ln(5)-1)/2</code> ou <code>vide</code>.",
  }),
  gen() {
    const t = ri(1, 4); const a = rnz(-4, 4), b = rnz(-6, 6);
    if (t === 1) {
      let c = rnz(-4, 4); while (c === a) c = rnz(-4, 4); const d = rnz(-6, 6); const x = q(d - b, a - c);
      return { q: "Résous : " + M("e^{" + linT(a, b) + "}=e^{" + linT(c, d) + "}"), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["Même exponentielle : on égalise les exposants. " + M(linT(a, b) + "=" + linT(c, d)) + ".", M(polyT([a - c, 0]) + "=" + (d - b)) + ", " + M("x=" + x.tex()) + "."] };
    }
    if (t === 2) {
      const k = pick([2, 3, 5, 6, 7, 10]); const A = q(1, a), B = q(-b, a);
      const at = (A.eq(1) ? "" : A.eq(-1) ? "-" : A.tex()) + "\\ln " + k + (B.n ? sgnTex(B) : "");
      return { q: "Résous : " + M("e^{" + linT(a, b) + "}=" + k), type: "set", ans: ["(ln(" + k + ")" + (b < 0 ? "+" + -b : "-" + b) + ")/(" + a + ")"], allow: ["ln"], atex: setTex([at]),
        sol: [k + " > 0 : on applique ln. " + M(linT(a, b) + "=\\ln " + k) + ".", M("x=" + frac("\\ln " + k + sgnTex(-b), a)) + "."] };
    }
    if (t === 3) {
      const k = pick([-1, -2, -5, 0]);
      return { q: "Résous : " + M("e^{" + linT(a, b) + "}=" + k), type: "set", ans: [], atex: setTex([]),
        sol: ["Une exponentielle est toujours strictement positive.", M(k + "\\le0") + " : <b>aucune solution</b>."] };
    }
    const m = rnz(-5, 5); const r1 = 0, r2 = m;
    const s = [r1, r2].sort((u, v) => u - v);
    return { q: "Résous : " + M("e^{" + polyT([1, -m, 0]) + "}=1"), type: "set", ans: s.map(String), form: ["rat"], atex: setTex(s.map(String)),
      sol: [M("1=e^0") + ", donc " + M(polyT([1, -m, 0]) + "=0") + ".", "Produit nul : " + M("x" + pr(linT(1, -m)) + "=0") + ", " + M("x=0") + " ou " + M("x=" + m) + "."] };
  },
});

sk({
  id: "c4-eq-ln", ch: 4, ref: 4, title: "Équations avec ln",
  learn: L({
    rule: M("\\ln a=\\ln b\\iff a=b") + " (avec a > 0, b > 0). " + M("\\ln u=k\\iff u=e^k") + ".",
    steps: ["Écris d'abord les conditions d'existence (ce qui est dans ln doit être > 0).", "Regroupe en un seul ln si besoin (" + M("\\ln a+\\ln b=\\ln(ab)") + ").", "Enlève les ln (ou applique exp).", "Résous, puis <b>garde seulement</b> les solutions qui respectent les conditions."],
    trap: "Oublier les conditions : une valeur qui rend un ln négatif doit être rejetée.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = ri(1, 4); let c = ri(1, 4); while (c === a) c = ri(1, 4);
      const x = q(rnz(-5, 6)); const b = rnz(-8, 8); const d = x.mul(a - c).add(b).n; // a x + b = c x + d
      const ok = x.mul(a).add(b).v > 0;
      return { q: "Résous : " + M("\\ln\\left(" + linT(a, b) + "\\right)=\\ln\\left(" + linT(c, d) + "\\right)"), type: "set", ans: ok ? [x.plain()] : [], form: ["rat"], atex: setTex(ok ? [x.tex()] : []),
        traps: ok ? [] : [{ ans: [x.plain()], m: "Pour x = " + x.plain() + ", ce qui est dans le ln est négatif : on rejette cette valeur." }],
        sol: ["Conditions : " + M(linT(a, b) + ">0") + " et " + M(linT(c, d) + ">0") + ".", M(linT(a, b) + "=" + linT(c, d)) + " donne " + M("x=" + x.tex()) + ".", ok ? "Vérification : " + M(linT(a, b) + "=" + x.mul(a).add(b).tex() + ">0") + " ✔." : "Mais alors " + M(linT(a, b) + "=" + x.mul(a).add(b).tex() + "\\le0") + " : on rejette. <b>Aucune solution.</b>"] };
    }
    if (t === 2) {
      const a = ri(1, 4), b = rnz(-6, 6), k = rnz(-2, 3);
      const eT = k === 0 ? "1" : k === 1 ? "e" : "e^{" + k + "}";
      const at = a === 1 ? eT + (b ? sgnTex(-b) : "") : frac(eT + (b ? sgnTex(-b) : ""), a);
      return { q: "Résous : " + M("\\ln\\left(" + linT(a, b) + "\\right)=" + k), type: "set", ans: ["(e^(" + k + ")" + (b < 0 ? "+" + -b : "-" + b) + ")/(" + a + ")"], allow: ["e"], atex: setTex([at]), traps: [],
        sol: ["On applique exp : " + M(linT(a, b) + "=" + eT) + ".", M("x=" + at) + " (et " + M(linT(a, b) + "=" + eT + ">0") + " ✔)."] };
    }
    if (t === 3) {
      const p = ri(1, 4), x0 = p + ri(1, 5), c = x0 * x0 - p * p;
      return { q: "Résous : " + M("\\ln(x-" + p + ")+\\ln(x+" + p + ")=\\ln " + c), type: "set", ans: [String(x0)], form: ["rat"], atex: setTex([String(x0)]),
        traps: [{ ans: [String(-x0), String(x0)], m: M("x=-" + x0) + " rend " + M("x-" + p) + " négatif : on la rejette (conditions d'existence)." }],
        sol: ["Conditions : " + M("x>" + p) + " (et " + M("x>-" + p) + ").", M("\\ln\\left((x-" + p + ")(x+" + p + ")\\right)=\\ln" + c) + " donc " + M("x^2-" + p * p + "=" + c) + ", " + M("x^2=" + x0 * x0) + ".", M("x=" + x0) + " ou " + M("x=-" + x0) + " ; seule " + M(x0) + " respecte " + M("x>" + p) + "."] };
    }
    const k = ri(1, 3);
    return { q: "Résous : " + M("\\ln x=-" + k), type: "set", ans: ["e^(-" + k + ")"], allow: ["e"], atex: setTex(["e^{-" + k + "}"]),
      traps: [{ ans: [], m: "ln x peut être négatif (pour 0 < x < 1) : il y a une solution." }],
      sol: ["On applique exp : " + M("x=e^{-" + k + "}") + " (qui est bien > 0)."] };
  },
});

sk({
  id: "c4-eq-exp-changement", ch: 4, ref: 3, title: "e²ˣ + b eˣ + c = 0",
  learn: L({
    rule: M("e^{2x}=(e^x)^2") + ". On pose " + M("X=e^x") + " (avec " + M("X>0") + ") : l'équation devient " + M("X^2+bX+c=0") + ".",
    steps: ["Pose " + M("X=e^x") + ".", "Résous le trinôme en X (Δ ou factorisation).", "Rejette les X ≤ 0 (une exponentielle est toujours > 0).", "Pour chaque X > 0 : " + M("x=\\ln X") + "."],
    trap: "Ne donne pas les valeurs de X : la question demande x. " + M("X=1") + " donne " + M("x=\\ln1=0") + ".",
    input: "<code>0 ; ln(2)</code>.",
  }),
  gen() {
    if (rnd() < 0.7) {
      const X1 = pick([1, 2, 3, 4, 5, -1, -2, -3]); let X2 = pick([1, 2, 3, 4, 6, 7]); while (X2 === X1) X2 = pick([2, 3, 5, 7]);
      const b = -(X1 + X2), c = X1 * X2; const xs = [X1, X2].filter(X => X > 0).sort((u, v) => u - v);
      const ans = xs.map(X => (X === 1 ? "0" : "ln(" + X + ")")), at = xs.map(X => (X === 1 ? "0" : "\\ln " + X));
      return { q: "Résous : " + M("e^{2x}" + mono(b, "e^x", false) + sgnTex(c) + "=0"), type: "set", ans, allow: ["ln"], atex: setTex(at),
        traps: [{ ans: [X1, X2].map(String), m: "Ce sont les valeurs de " + M("X=e^x") + ". Il faut ensuite x = ln X." }],
        sol: ["On pose " + M("X=e^x>0") + " : " + M("X^2" + mono(b, "X", false) + sgnTex(c) + "=0") + ".", "Solutions : " + M("X=" + X1) + " et " + M("X=" + X2) + ".", [X1, X2].map(X => (X > 0 ? M("e^x=" + X) + " → " + M("x=" + (X === 1 ? "0" : "\\ln " + X)) : M("e^x=" + X) + " impossible")).join(" ; ") + "."] };
    }
    const Y1 = rnz(-2, 3); let Y2 = rnz(-2, 3); while (Y2 === Y1) Y2 = rnz(-2, 3);
    const b = -(Y1 + Y2), c = Y1 * Y2; const ys = [Y1, Y2].sort((u, v) => u - v);
    const eT = y => (y === 0 ? "1" : y === 1 ? "e" : "e^{" + y + "}");
    return { q: "Résous (pour x > 0) : " + M("(\\ln x)^2" + mono(b, "\\ln x", false) + (c ? sgnTex(c) : "") + "=0"), type: "set", ans: ys.map(y => "e^(" + y + ")"), allow: ["e"], atex: setTex(ys.map(eT)),
      sol: ["On pose " + M("Y=\\ln x") + " : " + M("Y^2" + mono(b, "Y", false) + (c ? sgnTex(c) : "") + "=0") + ", solutions " + M("Y=" + Y1) + " et " + M("Y=" + Y2) + ".", M("\\ln x=Y\\iff x=e^Y") + " : " + ys.map(y => M(eT(y))).join(" et ") + "."] };
  },
});

sk({
  id: "c4-ineq-exp-ln", ch: 4, ref: 4, title: "Inéquations avec exp et ln",
  learn: L({
    rule: "exp et ln sont <b>croissantes</b> : elles gardent le sens des inégalités. " + M("e^a<e^b\\iff a<b") + " et " + M("\\ln a<\\ln b\\iff a<b") + " (pour a, b > 0).",
    steps: ["Écris les deux côtés avec la même fonction : " + M("1=e^0") + ", " + M("0=\\ln1") + ", " + M("k=\\ln(e^k)") + ".", "Enlève exp (ou ln) sans changer le sens.", "Pour ln : ajoute la condition « intérieur > 0 »."],
    trap: M("\\ln(x-2)<0\\iff 0<x-2<1") + " : n'oublie pas la condition " + M("x-2>0") + ".",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = rnz(-4, 4), b = rnz(-6, 6), c = rnz(-3, 3); const op = pick(["<", ">", "\\le", "\\ge"]); const r = q(c - b, a);
      const flip = a < 0; const opR = flip ? { "<": ">", "\\le": "\\ge", ">": "<", "\\ge": "\\le" }[op] : op;
      const closed = opR.includes("e"), right = opR === ">" || opR === "\\ge";
      const ans = right ? ivS(r, Infinity, closed, false) : ivS(-Infinity, r, false, closed);
      return { q: "Résous : " + M("e^{" + linT(a, b) + "}" + op + (c === 0 ? " 1" : " e^{" + c + "}")), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
        sol: [(c === 0 ? M("1=e^0") + ". " : "") + "exp est croissante : " + M(linT(a, b) + op + c) + ".", M(polyT([a, 0]) + op + (c - b)) + (flip ? " ; on divise par " + a + " < 0, le sens change" : "") + " : " + M("x" + opR + r.tex()) + ".", M("S=" + ivTex(parseIntervals(ans))) + "."] };
    }
    if (t === 2) {
      const p = rnz(-4, 5); const neg = coin(); const k = neg ? 0 : ri(1, 2);
      if (neg) return { q: "Résous : " + M("\\ln\\left(" + linT(1, -p) + "\\right)<0"), type: "interval", ans: "]" + p + ";" + (p + 1) + "[", atex: "S=\\left]" + p + "\\,;\\," + (p + 1) + "\\right[",
        traps: [{ ans: "]-inf;" + (p + 1) + "[", m: "Condition d'existence : " + M("x-" + tp(p) + ">0") + ", donc x > " + p + "." }],
        sol: ["Condition : " + M("x>" + p) + ".", M("\\ln(" + linT(1, -p) + ")<\\ln1\\iff " + linT(1, -p) + "<1\\iff x<" + (p + 1)) + ".", M("S=\\left]" + p + "\\,;\\," + (p + 1) + "\\right[") + "."] };
      const eT = k === 1 ? "e" : "e^{" + k + "}";
      return { q: "Résous : " + M("\\ln\\left(" + linT(1, -p) + "\\right)\\ge " + k), type: "interval", ans: "[" + p + "+e^(" + k + ");+inf[", atex: "S=\\left[" + (p ? p + "+" : "") + eT + "\\,;\\,+\\infty\\right[",
        sol: ["Condition : " + M("x>" + p) + ".", "exp est croissante : " + M(linT(1, -p) + "\\ge " + eT) + ", soit " + M("x\\ge " + (p ? p + "+" : "") + eT) + " (qui est bien > " + p + ")."] };
    }
    const k = pick([2, 3, 5, 7]); const op = pick(["\\le", "<", ">", "\\ge"]); const right = op === ">" || op === "\\ge", closed = op.includes("e");
    const ans = right ? (closed ? "[" : "]") + "ln(" + k + ");+inf[" : "]-inf;ln(" + k + ")" + (closed ? "]" : "[");
    return { q: "Résous : " + M("e^x" + op + k), type: "interval", ans, atex: "S=" + (right ? (closed ? "\\left[" : "\\left]") + "\\ln " + k + "\\,;\\,+\\infty\\right[" : "\\left]-\\infty\\,;\\,\\ln " + k + (closed ? "\\right]" : "\\right[")),
      sol: [M(k + "=e^{\\ln " + k + "}") + " ; exp est croissante : " + M("x" + op + "\\ln " + k) + "."] };
  },
});

sk({
  id: "c4-limites-infini", ch: 4, ref: 5, title: "Limites en ±∞ (polynômes, fractions)",
  learn: L({
    rule: "En ±∞, un polynôme se comporte comme son <b>terme de plus haut degré</b>. Une fraction de polynômes se comporte comme le quotient des termes de plus haut degré.",
    steps: ["Garde seulement le terme dominant en haut et en bas.", "Simplifie ce quotient.", "Calcule la limite de ce qui reste (" + M("x^2\\to+\\infty") + ", " + M("\\frac{3}{x}\\to0") + "…)."],
    trap: "En " + M("-\\infty") + ", " + M("x^3\\to-\\infty") + " mais " + M("x^2\\to+\\infty") + ".",
    input: "<code>+inf</code>, <code>-inf</code>, <code>2/3</code>, <code>0</code>.",
  }),
  gen() {
    const side = pick([1, -1]); const S = side > 0 ? "+\\infty" : "-\\infty";
    if (coin()) {
      const n = ri(2, 4), a = rnz(-5, 5); const cs = [a]; for (let i = 0; i < n; i++) cs.push(rnz(-9, 9));
      const lim = a * Math.pow(side, n) > 0 ? "+inf" : "-inf";
      return { q: "Calcule " + M("\\lim_{x\\to" + S + "}\\left(" + polyT(cs) + "\\right)"), type: "lim", ans: lim, atex: lim === "+inf" ? "+\\infty" : "-\\infty",
        sol: ["Terme dominant : " + M(mono(a, "x^{" + n + "}", true)) + ".", "En " + M(S) + ", " + M("x^{" + n + "}\\to" + (Math.pow(side, n) > 0 ? "+\\infty" : "-\\infty")) + ", multiplié par " + a + " : " + M(lim === "+inf" ? "+\\infty" : "-\\infty") + "."] };
    }
    const n = ri(1, 3), m = ri(1, 3), a = rnz(-6, 6), b = rnz(-6, 6);
    const P = [a]; for (let i = 0; i < n; i++) P.push(rnz(-7, 7)); const Qd = [b]; for (let i = 0; i < m; i++) Qd.push(rnz(-7, 7));
    let ans, at, why;
    if (n === m) { const r = q(a, b); ans = r.plain(); at = r.tex(); why = "Même degré : limite = quotient des coefficients dominants " + M(frac(a, b) + "=" + r.tex()) + "."; }
    else if (n < m) { ans = "0"; at = "0"; why = "Degré du haut plus petit : " + M(frac(mono(a, "", true), mono(b, "x^{" + (m - n) + "}", true)) + "\\to0") + "."; }
    else { const sgn = Math.sign(a / b) * Math.pow(side, n - m); ans = sgn > 0 ? "+inf" : "-inf"; at = sgn > 0 ? "+\\infty" : "-\\infty"; why = "Il reste " + M(frac(a, b) + "\\,x^{" + (n - m) + "}") + " qui tend vers " + M(at) + "."; }
    return { q: "Calcule " + M("\\lim_{x\\to" + S + "}" + frac(polyT(P), polyT(Qd))), type: "lim", ans, atex: at,
      sol: ["Termes dominants : " + M(frac(mono(a, n === 1 ? "x" : "x^{" + n + "}", true), mono(b, m === 1 ? "x" : "x^{" + m + "}", true))) + ".", why] };
  },
});

sk({
  id: "c4-limites-reference", ch: 4, ref: 5, title: "Limites de référence et croissances comparées",
  learn: L({
    rule: M("\\lim_{-\\infty}e^x=0") + ", " + M("\\lim_{+\\infty}e^x=+\\infty") + ", " + M("\\lim_{0^+}\\ln x=-\\infty") + ", " + M("\\lim_{+\\infty}\\ln x=+\\infty") + ", " + M("\\lim_{0^+}\\frac1x=+\\infty") + ".<br><b>Croissances comparées</b> : l'exponentielle l'emporte sur toute puissance de x, et toute puissance de x l'emporte sur ln : " + M("\\lim_{+\\infty}\\frac{e^x}{x^n}=+\\infty") + ", " + M("\\lim_{+\\infty}x^ne^{-x}=0") + ", " + M("\\lim_{+\\infty}\\frac{\\ln x}{x}=0") + ", " + M("\\lim_{0^+}x\\ln x=0") + ".",
    steps: ["Remplace chaque morceau par sa limite.", "Si tu obtiens une forme indéterminée (" + M("\\frac\\infty\\infty") + ", " + M("0\\times\\infty") + "), utilise les croissances comparées."],
    trap: M("e^{-x}\\to0") + " en " + M("+\\infty") + " (et pas " + M("-\\infty") + ") : une exponentielle est toujours positive.",
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
    return { q: "Calcule " + M(e) + ".", type: "lim", ans, atex: at, sol: ["Limite de référence (voir le tableau à savoir par cœur) : " + M(e + "=" + at) + "."] };
  },
});

sk({
  id: "c4-limites-forme", ch: 4, ref: 5, title: "Lever une forme indéterminée 0/0",
  learn: L({
    rule: "Si en remplaçant on trouve " + M("\\frac00") + ", on <b>factorise</b> le numérateur pour simplifier le facteur qui s'annule.",
    steps: ["Remplace x par a : si tu trouves " + M("\\frac00") + ", c'est une forme indéterminée.", "Factorise : " + M("x^2-a^2=(x-a)(x+a)") + ".", "Simplifie par " + M("(x-a)") + ".", "Remplace x par a dans ce qui reste."],
    trap: "Si le dénominateur tend vers 0 mais pas le numérateur, la limite est infinie : regarde le signe.",
  }),
  gen() {
    const t = ri(1, 3); const a = rnz(-5, 5);
    if (t === 1) { let b = rnz(-6, 6); if (b === -a) b++;
      const P = [1, b - a, -a * b]; const v = a + b;
      return { q: "Calcule " + M("\\lim_{x\\to" + a + "}" + frac(polyT(P), linT(1, -a))), type: "lim", ans: String(v), atex: String(v),
        sol: ["En remplaçant : " + M("\\frac00") + ", forme indéterminée.", M(polyT(P) + "=" + pr(linT(1, -a)) + pr(linT(1, b))) + ".", "On simplifie : " + M(linT(1, b)) + ", qui tend vers " + M(a + sgnTex(b) + "=" + v) + "."] };
    }
    if (t === 2) { const r = q(1, 2 * a);
      return { q: "Calcule " + M("\\lim_{x\\to" + a + "}" + frac(linT(1, -a), "x^2-" + a * a)), type: "lim", ans: r.plain(), atex: r.tex(),
        sol: [M("x^2-" + a * a + "=" + pr(linT(1, -a)) + pr(linT(1, a))) + ".", "On simplifie : " + M(frac(1, linT(1, a))) + " → " + M(frac(1, 2 * a) + "=" + r.tex()) + "."] };
    }
    const k = rnz(-5, 5), p = rnz(-4, 4), side = pick(["+", "-"]);
    const pos = (k > 0) === (side === "+");
    return { q: "Calcule " + M("\\lim_{x\\to" + p + "^" + side + "}" + frac(k, linT(1, -p))), type: "lim", ans: pos ? "+inf" : "-inf", atex: pos ? "+\\infty" : "-\\infty",
      sol: ["Quand " + M("x\\to" + p + "^" + side) + ", " + M(linT(1, -p) + "\\to0^" + side) + " (x est " + (side === "+" ? "un peu plus grand" : "un peu plus petit") + " que " + p + ").", M(frac(k, "0^" + side)) + " : " + (pos ? M("+\\infty") : M("-\\infty")) + " (règle des signes)."] };
  },
});

sk({
  id: "c4-asymptotes", ch: 4, ref: 5, title: "Asymptotes",
  learn: L({
    rule: "Si " + M("\\lim_{x\\to a}f(x)=\\pm\\infty") + " : asymptote <b>verticale</b> " + M("x=a") + ". Si " + M("\\lim_{x\\to\\pm\\infty}f(x)=b") + " : asymptote <b>horizontale</b> " + M("y=b") + ".<br>Pour " + M("f(x)=\\frac{ax+b}{cx+d}") + " : " + M("x=-\\frac dc") + " et " + M("y=\\frac ac") + ".",
    steps: ["Verticale : valeur interdite (dénominateur nul, numérateur non nul).", "Horizontale : limite en ±∞ (quotient des termes dominants)."],
    trap: "Asymptote verticale → équation « x = … » ; horizontale → « y = … ».",
  }),
  gen() {
    const a = rnz(-6, 6), b = rnz(-9, 9), c = ri(1, 4) * sg(), d = rnz(-8, 8); if (a * d - b * c === 0) return this.gen();
    const V = q(-d, c), H = q(a, c); const vert = coin();
    if (rnd() < 0.3) { const k = rnz(-5, 5), m = rnz(-5, 5), p = rnz(-5, 5);
      const ask = vert ? q(p) : q(k);
      return { q: "Soit " + M("f(x)=" + k + (m < 0 ? "-" : "+") + frac(Math.abs(m), linT(1, -p))) + ". Donne l'équation de l'asymptote " + (vert ? "verticale : " + M("x=\\;?") : "horizontale : " + M("y=\\;?")), type: "num", ans: ask.plain(), form: ["rat"], atex: (vert ? "x=" : "y=") + ask.tex(), lhs: 1,
        sol: [vert ? "Le dénominateur s'annule en " + M("x=" + p) + " : asymptote verticale " + M("x=" + p) + "." : M(frac(m, linT(1, -p)) + "\\to0") + " en ±∞, donc " + M("f(x)\\to" + k) + " : asymptote " + M("y=" + k) + "."] };
    }
    const ask = vert ? V : H;
    return { q: "Soit " + M("f(x)=" + frac(linT(a, b), linT(c, d))) + ". Donne l'équation de l'asymptote " + (vert ? "verticale : " + M("x=\\;?") : "horizontale : " + M("y=\\;?")), type: "num", ans: ask.plain(), form: ["rat"], atex: (vert ? "x=" : "y=") + ask.tex(),
      traps: [{ ans: (vert ? H : V).plain(), m: "Tu as donné l'autre asymptote : verticale = valeur interdite, horizontale = limite en ±∞." }],
      sol: [vert ? "Valeur interdite : " + M(linT(c, d) + "=0\\iff x=" + V.tex()) + " (le numérateur n'y est pas nul)." : "En ±∞ : " + M("f(x)\\approx" + frac(mono(a, "x", true), mono(c, "x", true)) + "=" + H.tex()) + ".", "Asymptote : " + M((vert ? "x=" : "y=") + ask.tex()) + "."] };
  },
});

/* =========================== ESCALE 5 =========================== */
sk({
  id: "c5-taux", ch: 5, ref: 0, title: "Taux de variation et vitesse moyenne",
  learn: L({
    rule: "Taux de variation de f entre a et b : " + M("\\frac{f(b)-f(a)}{b-a}") + " (la pente de la corde). Le nombre dérivé " + M("f'(a)") + " est la limite de ce taux quand b se rapproche de a.",
    steps: ["Calcule " + M("f(a)") + " et " + M("f(b)") + ".", "Fais la différence " + M("f(b)-f(a)") + ".", "Divise par " + M("b-a") + "."],
    trap: "Garde le même ordre en haut et en bas : " + M("f(b)-f(a)") + " sur " + M("b-a") + ".",
  }),
  gen() {
    const a = rnz(-3, 3), b = rnz(-6, 6), c = rnz(-9, 9); const x1 = ri(-3, 2), x2 = x1 + ri(1, 4);
    const f1 = pevalQ([a, b, c], q(x1)), f2 = pevalQ([a, b, c], q(x2)); const r = f2.sub(f1).div(x2 - x1);
    if (coin()) return { q: "Soit " + M("f(x)=" + polyT([a, b, c])) + ". Calcule le taux de variation de f entre " + M(x1) + " et " + M(x2) + ".", type: "num", ans: r.plain(), form: ["rat"], atex: r.tex(),
      sol: [M("f(" + x1 + ")=" + f1.tex()) + " et " + M("f(" + x2 + ")=" + f2.tex()) + ".", M(frac(f2.tex() + "-" + tp(f1), x2 + "-" + tp(x1)) + "=" + frac(f2.sub(f1).tex(), x2 - x1) + "=" + r.tex()) + "."] };
    const A = ri(1, 3), B = ri(0, 6), t1 = ri(0, 2), t2 = t1 + ri(1, 3); const P = [A, B, 0];
    const d1 = pevalQ(P, q(t1)), d2 = pevalQ(P, q(t2)), v = d2.sub(d1).div(t2 - t1);
    return { q: "Un mobile a pour position " + M("x(t)=" + polyT(P, "t")) + " (en mètres, t en secondes). Quelle est sa vitesse moyenne entre " + M("t=" + t1) + " et " + M("t=" + t2) + " (en m/s) ?", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex() + "\\text{ m/s}",
      sol: [M("x(" + t1 + ")=" + d1.tex()) + ", " + M("x(" + t2 + ")=" + d2.tex()) + ".", M("v_{moy}=" + frac(d2.tex() + "-" + tp(d1), t2 + "-" + t1) + "=" + v.tex()) + " m/s."] };
  },
});

function dTerms() { // somme de termes usuels et sa dérivée
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
  id: "c5-derivees-usuelles", ch: 5, ref: 1, title: "Dériver les fonctions usuelles",
  learn: L({
    rule: D("(x^n)'=nx^{n-1}\\quad (k)'=0\\quad \\left(\\tfrac1x\\right)'=-\\tfrac1{x^2}\\quad (\\sqrt x)'=\\tfrac1{2\\sqrt x}") + D("(e^x)'=e^x\\quad (\\ln x)'=\\tfrac1x\\quad (\\sin x)'=\\cos x\\quad (\\cos x)'=-\\sin x") + "Et " + M("(u+v)'=u'+v'") + ", " + M("(ku)'=ku'") + ".",
    steps: ["Dérive chaque terme séparément.", "Garde les coefficients devant.", "Une constante seule disparaît."],
    trap: M("(\\cos x)'=-\\sin x") + " (avec un signe −) et " + M("\\left(\\frac1x\\right)'=-\\frac1{x^2}") + ".",
    input: "<code>6x^2-3/x^2+e^x</code>. Tu peux écrire <code>f'(x)=</code> devant.",
  }),
  gen() {
    const T = dTerms(); const c = rnz(-9, 9);
    return { q: "Dérive " + M("f(x)=" + T.f + sgnTex(c)) + ".", type: "expr", ans: T.ds.replace(/^\+/, "") || "0", dom: [0.3, 3], atex: "f'(x)=" + T.d, lhs: 1, pre: "f'(x) =",
      traps: T.trap ? [{ ans: T.trap.replace(/^\+/, ""), m: "Vérifie les signes : " + M("\\left(\\frac1x\\right)'=-\\frac1{x^2}") + " et " + M("(\\cos x)'=-\\sin x") + "." }] : [],
      deriv: null, sol: ["On dérive terme à terme ; la constante " + c + " disparaît.", M("f'(x)=" + T.d) + "."] };
  },
});

sk({
  id: "c5-produit", ch: 5, ref: 2, title: "Dériver un produit (uv)' = u'v + uv'",
  learn: L({
    rule: M("(uv)'=u'v+uv'") + ". <b>Pas</b> " + M("u'v'") + " !",
    steps: ["Écris u et v.", "Calcule u' et v'.", "Assemble " + M("u'v+uv'") + ".", "Factorise si c'est utile (souvent par " + M("e^x") + ")."],
    trap: M("(x\\,e^x)'=1\\times e^x+x\\,e^x=(x+1)e^x") + ", pas " + M("1\\times e^x") + ".",
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
      return { q: "Dérive " + M("f(x)=" + pr(linT(a, b)) + pr(polyT([1, 0, c]))) + ".", type: "expr", ans: polyIn(Dd), atex: "f'(x)=" + polyT(Dd), lhs: 1, pre: "f'(x) =",
        traps: [{ ans: "(" + a + ")*2*x", m: "La dérivée d'un produit n'est pas le produit des dérivées : " + M("(uv)'=u'v+uv'") + "." }],
        sol: [M("u=" + linT(a, b)) + ", " + M("u'=" + a) + " ; " + M("v=" + polyT([1, 0, c])) + ", " + M("v'=2x") + ".", M("f'(x)=" + a + pr(polyT([1, 0, c])) + "+" + pr(linT(a, b)) + "\\times2x=" + polyT(Dd)) + "."] };
    }
    if (t === 3 && Math.abs(a) < 2) return this.gen();
    return { q: "Dérive " + M("f(x)=" + tpl.f) + ".", type: "expr", ans: tpl.ds, dom: [0.3, 3], atex: "f'(x)=" + tpl.d, lhs: 1, pre: "f'(x) =",
      traps: [{ ans: tpl.tr, m: "La dérivée d'un produit n'est pas le produit des dérivées : " + M("(uv)'=u'v+uv'") + "." }],
      sol: [M("u=" + tpl.u) + ", " + M("u'=" + tpl.up) + " ; " + M("v=" + tpl.v) + ", " + M("v'=" + tpl.vp) + ".", M("f'(x)=u'v+uv'=" + tpl.d) + "."] };
  },
});

sk({
  id: "c5-quotient", ch: 5, ref: 2, title: "Dériver un quotient (u/v)'",
  learn: L({
    rule: M("\\left(\\frac uv\\right)'=\\frac{u'v-uv'}{v^2}") + " et " + M("\\left(\\frac1v\\right)'=-\\frac{v'}{v^2}") + ".",
    steps: ["Écris u, v, u', v'.", "Numérateur : " + M("u'v-uv'") + " <b>dans cet ordre</b>.", "Dénominateur : " + M("v^2") + " (ne le développe pas).", "Développe et réduis le numérateur."],
    trap: "L'ordre compte : " + M("u'v-uv'") + ", pas " + M("uv'-u'v") + " (sinon le signe est faux).",
    input: "<code>7/(x+2)^2</code>, <code>e^x(x-1)/x^2</code>.",
  }),
  gen() {
    const t = ri(1, 5);
    if (t === 1) {
      const a = rnz(-5, 5), b = rnz(-7, 7), c = ri(1, 3) * sg(), d = rnz(-7, 7); const N = a * d - b * c; if (N === 0) return this.gen();
      const den = linT(c, d);
      return { q: "Dérive " + M("f(x)=" + frac(linT(a, b), den)) + ".", type: "expr", ans: N + "/(" + linIn(c, d) + ")^2", atex: "f'(x)=" + frac(N, pr(den) + "^2"), lhs: 1, pre: "f'(x) =",
        traps: [{ ans: String(q(a, c).v), m: "Ce n'est pas " + M("\\frac{u'}{v'}") + " : utilise " + M("\\frac{u'v-uv'}{v^2}") + "." }, { ans: -N + "/(" + linIn(c, d) + ")^2", m: "L'ordre compte : " + M("u'v-uv'") + " (tu as l'opposé)." }],
        sol: [M("u=" + linT(a, b)) + ", " + M("u'=" + a) + " ; " + M("v=" + den) + ", " + M("v'=" + c) + ".", "Numérateur : " + M(a + pr(den) + "-" + pr(linT(a, b)) + "\\times" + tp(c) + "=" + N) + ".", M("f'(x)=" + frac(N, pr(den) + "^2")) + "."] };
    }
    const k = rnz(-6, 6), a = ri(1, 4), b = rnz(-6, 6);
    const tpl = [null, null,
      { f: frac("e^x", "x"), ds: "e^x*(x-1)/x^2", d: frac("e^x(x-1)", "x^2"), s: [M("u=e^x=u'") + ", " + M("v=x") + ", " + M("v'=1") + ".", M("\\frac{e^x\\cdot x-e^x\\cdot1}{x^2}=\\frac{e^x(x-1)}{x^2}") + "."], tr: "e^x*(1-x)/x^2" },
      { f: frac("\\ln x", "x"), ds: "(1-ln(x))/x^2", d: frac("1-\\ln x", "x^2"), s: [M("u=\\ln x") + ", " + M("u'=\\frac1x") + ", " + M("v=x") + ", " + M("v'=1") + ".", M("\\frac{\\frac1x\\cdot x-\\ln x}{x^2}=\\frac{1-\\ln x}{x^2}") + "."], tr: "(ln(x)-1)/x^2" },
      { f: frac("x", "x^2+" + a), ds: "(" + a + "-x^2)/(x^2+" + a + ")^2", d: frac(a + "-x^2", "(x^2+" + a + ")^2"), s: [M("u=x,\\ u'=1") + " ; " + M("v=x^2+" + a + ",\\ v'=2x") + ".", M("\\frac{(x^2+" + a + ")-x\\cdot2x}{(x^2+" + a + ")^2}=\\frac{" + a + "-x^2}{(x^2+" + a + ")^2}") + "."], tr: "(x^2-" + a + ")/(x^2+" + a + ")^2" },
      { f: frac(k, linT(a, b)), ds: -k * a + "/(" + linIn(a, b) + ")^2", d: frac(-k * a, pr(linT(a, b)) + "^2"), s: [M("\\left(\\frac1v\\right)'=-\\frac{v'}{v^2}") + " avec " + M("v=" + linT(a, b)) + ", " + M("v'=" + a) + ".", M("f'(x)=" + k + "\\times\\frac{-" + a + "}{" + pr(linT(a, b)) + "^2}=" + frac(-k * a, pr(linT(a, b)) + "^2")) + "."], tr: k * a + "/(" + linIn(a, b) + ")^2" },
    ][t];
    return { q: "Dérive " + M("f(x)=" + tpl.f) + ".", type: "expr", ans: tpl.ds, dom: [0.4, 3], atex: "f'(x)=" + tpl.d, lhs: 1, pre: "f'(x) =",
      traps: [{ ans: tpl.tr, m: "Erreur de signe : le numérateur est " + M("u'v-uv'") + ", dans cet ordre." }], sol: tpl.s };
  },
});

sk({
  id: "c5-composee", ch: 5, ref: 2, title: "Dériver une fonction composée",
  learn: L({
    rule: D("(e^u)'=u'e^u\\qquad (u^n)'=nu'u^{n-1}\\qquad (\\ln u)'=\\frac{u'}{u}\\qquad (\\sqrt u)'=\\frac{u'}{2\\sqrt u}") + D("(\\sin u)'=u'\\cos u\\qquad (\\cos u)'=-u'\\sin u"),
    steps: ["Repère l'intérieur u.", "Calcule u'.", "Applique la formule : dérivée « de l'extérieur » × u'."],
    trap: "Oublier u' : " + M("(e^{3x})'=3e^{3x}") + ", pas " + M("e^{3x}") + ".",
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
    return { q: "Dérive " + M("f(x)=" + T[0]) + ".", type: "expr", ans: T[1], dom: [0.2, 2.5], atex: "f'(x)=" + T[2], lhs: 1, pre: "f'(x) =",
      traps: (Math.abs(a) === 1 && [1, 2, 5].includes(t)) || (t === 4 && A === 1) || (t === 8 && A === 1) ? [] : [{ ans: T[3], m: "Tu as oublié de multiplier par u' (la dérivée de l'intérieur)." }],
      sol: [T[4] + ".", "On applique la formule : " + M("f'(x)=" + T[2]) + "."] };
  },
});

sk({
  id: "c5-mixte", ch: 5, ref: 2, title: "Dérivées mixtes (niveau examen)",
  learn: L({
    rule: "On combine les règles : d'abord la <b>structure principale</b> (somme, produit, quotient), puis les composées à l'intérieur.",
    steps: ["Quelle est l'opération « la plus extérieure » ?", "Applique la règle correspondante.", "Dérive chaque morceau (composées comprises).", "Factorise le résultat (souvent par l'exponentielle)."],
    trap: M("(x\\,e^{-2x})'=e^{-2x}+x\\times(-2)e^{-2x}=(1-2x)e^{-2x}") + ".",
  }),
  gen() {
    const k = ri(1, 3), a = ri(1, 3), b = rnz(-5, 5);
    const T = [
      ["x\\,e^{-" + (k === 1 ? "" : k) + "x}", "(1-" + k + "x)*e^(-" + k + "x)", pr(linT(-k, 1)) + "e^{-" + (k === 1 ? "" : k) + "x}", ["Produit : " + M("u=x,\\ u'=1") + " ; " + M("v=e^{-" + k + "x},\\ v'=-" + k + "e^{-" + k + "x}") + ".", M("f'(x)=e^{-" + k + "x}-" + k + "x\\,e^{-" + k + "x}=" + pr(linT(-k, 1)) + "e^{-" + k + "x}") + "."]],
      ["x^2e^{" + k + "x}", "(" + k + "x^2+2x)*e^(" + k + "x)", pr(polyT([k, 2, 0])) + "e^{" + k + "x}", ["Produit : " + M("u=x^2,\\ u'=2x") + " ; " + M("v=e^{" + k + "x},\\ v'=" + k + "e^{" + k + "x}") + ".", M("f'(x)=2xe^{" + k + "x}+" + k + "x^2e^{" + k + "x}=" + pr(polyT([k, 2, 0])) + "e^{" + k + "x}") + "."]],
      ["x\\ln(" + a + "x)", "ln(" + a + "x)+1", "\\ln(" + a + "x)+1", ["Produit : " + M("u=x,\\ u'=1") + " ; " + M("v=\\ln(" + a + "x),\\ v'=\\frac{" + a + "}{" + a + "x}=\\frac1x") + ".", M("f'(x)=\\ln(" + a + "x)+x\\cdot\\frac1x=\\ln(" + a + "x)+1") + "."]],
      [pr(linT(2, b)) + "e^{-x}", "(" + linIn(-2, 2 - b) + ")*e^(-x)", pr(linT(-2, 2 - b)) + "e^{-x}", ["Produit : " + M("u=" + linT(2, b) + ",\\ u'=2") + " ; " + M("v=e^{-x},\\ v'=-e^{-x}") + ".", M("f'(x)=2e^{-x}-" + pr(linT(2, b)) + "e^{-x}=" + pr(linT(-2, 2 - b)) + "e^{-x}") + "."]],
      [frac("e^x", "x+" + a), "x*e^x/(x+" + a + ")^2".replace("x*e^x", a === 1 ? "x*e^x" : "(x+" + (a - 1) + ")*e^x"), frac((a === 1 ? "x" : "(x+" + (a - 1) + ")") + "e^x", "(x+" + a + ")^2"), ["Quotient : " + M("u=e^x=u'") + ", " + M("v=x+" + a + ",\\ v'=1") + ".", M("f'(x)=\\frac{e^x(x+" + a + ")-e^x}{(x+" + a + ")^2}=" + frac((a === 1 ? "x" : "(x+" + (a - 1) + ")") + "e^x", "(x+" + a + ")^2")) + "."]],
      ["\\ln(x^2+" + a + ")+" + (k === 1 ? "" : k) + "x", "2x/(x^2+" + a + ")+" + k, frac("2x", "x^2+" + a) + "+" + k, ["Somme : " + M("(\\ln u)'=\\frac{u'}{u}") + " avec " + M("u=x^2+" + a) + ".", M("f'(x)=\\frac{2x}{x^2+" + a + "}+" + k) + "."]],
      [pr(linT(k, b)) + "^3", 3 * k + "*(" + linIn(k, b) + ")^2", 3 * k + pr(linT(k, b)) + "^2", ["Composée " + M("u^3") + " : " + M("3u'u^2") + " avec " + M("u'=" + k) + ".", M("f'(x)=" + 3 * k + pr(linT(k, b)) + "^2") + "."]],
    ];
    const [f, ds, d, s] = pick(T);
    return { q: "Dérive " + M("f(x)=" + f) + ".", type: "expr", ans: ds, dom: [0.3, 2.5], atex: "f'(x)=" + d, lhs: 1, pre: "f'(x) =", sol: s };
  },
});

sk({
  id: "c5-tangente", ch: 5, ref: 3, title: "Équation de la tangente",
  learn: L({
    rule: "Tangente à la courbe de f au point d'abscisse a : " + D("y=f'(a)(x-a)+f(a)"),
    steps: ["Calcule " + M("f(a)") + ".", "Calcule " + M("f'(x)") + " puis " + M("f'(a)") + " (la pente).", "Remplace dans " + M("y=f'(a)(x-a)+f(a)") + ".", "Développe pour obtenir " + M("y=mx+p") + "."],
    trap: "C'est " + M("(x-a)") + " : pour " + M("a=-2") + ", on écrit " + M("(x+2)") + ".",
    input: "<code>3x-2</code> (tu peux écrire <code>y = 3x-2</code>).",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const P = [rnz(-3, 3), rnz(-5, 5), rnz(-6, 6)]; if (coin()) P.unshift(rnz(-2, 2)); const a = rnz(-3, 3);
      const fa = pevalQ(P, q(a)), m = pevalQ(pder(P), q(a)), p = fa.sub(m.mul(a));
      return { q: "Soit " + M("f(x)=" + polyT(P)) + ". Donne l'équation de la tangente à la courbe au point d'abscisse " + M(a) + ".", type: "expr", ans: linIn(m, p), atex: "y=" + polyT([m, p]), lhs: 1, pre: "y =",
        sol: [M("f(" + a + ")=" + fa.tex()) + ".", M("f'(x)=" + polyT(pder(P))) + ", " + M("f'(" + a + ")=" + m.tex()) + ".", M("y=" + m.tex() + pr(linT(1, -a)) + sgnTex(fa) + "=" + polyT([m, p])) + "."] };
    }
    if (t === 2) { const a = pick([0, 1]); return a === 0 ? { q: "Donne l'équation de la tangente à la courbe de " + M("f(x)=e^x") + " au point d'abscisse " + M(0) + ".", type: "expr", ans: "x+1", atex: "y=x+1", lhs: 1, pre: "y =", sol: [M("f(0)=e^0=1") + ", " + M("f'(0)=e^0=1") + ".", M("y=1\\times(x-0)+1=x+1") + "."] }
      : { q: "Donne l'équation de la tangente à la courbe de " + M("f(x)=e^x") + " au point d'abscisse " + M(1) + ".", type: "expr", ans: "e*x", atex: "y=ex", lhs: 1, pre: "y =", sol: [M("f(1)=e") + ", " + M("f'(1)=e") + ".", M("y=e(x-1)+e=ex") + "."] }; }
    if (t === 3) { const k = ri(1, 4); return { q: "Donne l'équation de la tangente à la courbe de " + M("f(x)=" + (k === 1 ? "" : k) + "\\ln x") + " au point d'abscisse " + M(1) + ".", type: "expr", ans: k + "x-" + k, atex: "y=" + polyT([k, -k]), lhs: 1, pre: "y =", sol: [M("f(1)=" + k + "\\ln1=0") + ", " + M("f'(x)=\\frac{" + k + "}{x}") + ", " + M("f'(1)=" + k) + ".", M("y=" + k + "(x-1)+0=" + polyT([k, -k])) + "."] }; }
    const a = pick([1, 4, 9]), r = Math.sqrt(a), m = q(1, 2 * r), p = q(r).sub(m.mul(a));
    return { q: "Donne l'équation de la tangente à la courbe de " + M("f(x)=\\sqrt x") + " au point d'abscisse " + M(a) + ".", type: "expr", ans: linIn(m, p), atex: "y=" + polyT([m, p]), lhs: 1, pre: "y =",
      sol: [M("f(" + a + ")=" + r) + ", " + M("f'(x)=\\frac1{2\\sqrt x}") + ", " + M("f'(" + a + ")=" + m.tex()) + ".", M("y=" + m.tex() + "(x-" + a + ")+" + r + "=" + polyT([m, p])) + "."] };
  },
});

sk({
  id: "c5-variations", ch: 5, ref: 4, title: "Sens de variation",
  learn: L({
    rule: "Si " + M("f'(x)>0") + " sur un intervalle, f est <b>croissante</b> ; si " + M("f'(x)<0") + ", f est <b>décroissante</b>.",
    steps: ["Calcule " + M("f'(x)") + " et factorise-la.", "Étudie son signe (tableau de signes).", "Traduis : + → f monte, − → f descend.", "Réponds avec des intervalles (on peut fermer les crochets aux points où f' = 0)."],
    trap: "C'est le signe de " + M("f'") + " qui compte, pas le signe de f.",
    input: "<code>]-inf;-1] U [3;+inf[</code>.",
  }),
  gen() {
    const t = ri(1, 3); const up = coin();
    if (t === 1) {
      let r1 = rnz(-4, 3), r2 = r1 + 2 * ri(1, 3); const k = pick([1, -1]);
      const P = [q(k), q(-3 * k * (r1 + r2), 2), q(3 * k * r1 * r2), q(rnz(-5, 5))]; // f' = 3k(x−r1)(x−r2)
      const Dp = pder(P); const signs = k > 0 ? ["+", "-", "+"] : ["-", "+", "-"];
      const want = up ? "+" : "-"; const pts = [-Infinity, r1, r2, Infinity];
      const parts = signs.map((s, i) => (s === want ? { lo: pts[i], hi: pts[i + 1] } : null)).filter(Boolean);
      const ans = parts.map(p => (isFinite(p.lo) ? "[" + p.lo : "]-inf") + ";" + (isFinite(p.hi) ? p.hi + "]" : "+inf[")).join(" U ");
      return { q: "Soit " + M("f(x)=" + polyT(P)) + ". Sur quel(s) intervalle(s) f est-elle " + (up ? "croissante" : "décroissante") + " ?", type: "interval", loose: 1, ans, atex: ivTex(parseIntervals(ans)),
        sol: [M("f'(x)=" + polyT(Dp) + "=" + (3 * k === 3 ? "3" : "-3") + pr(linT(1, -r1)) + pr(linT(1, -r2))) + ".", signTable([String(r1), String(r2)], [{ label: "f'(x)", signs }]), "f est " + (up ? "croissante" : "décroissante") + " là où " + M("f'(x)" + (up ? ">0" : "<0")) + " : " + M(ivTex(parseIntervals(ans))) + "."] };
    }
    if (t === 2) {
      const a = rnz(-4, 4); const r = a - 1;
      const ans = up ? "[" + r + ";+inf[" : "]-inf;" + r + "]";
      return { q: "Soit " + M("f(x)=" + pr(linT(1, -a)) + "e^x") + ". Sur quel intervalle f est-elle " + (up ? "croissante" : "décroissante") + " ?", type: "interval", loose: 1, ans, atex: ivTex(parseIntervals(ans)),
        sol: [M("f'(x)=e^x+" + pr(linT(1, -a)) + "e^x=" + pr(linT(1, 1 - a)) + "e^x") + ".", M("e^x>0") + " : f' a le signe de " + M(linT(1, 1 - a)) + ", positif pour " + M("x>" + r) + ".", "Réponse : " + M(ivTex(parseIntervals(ans))) + "."] };
    }
    const k = ri(1, 4);
    const ans = up ? "]0;" + k + "]" : "[" + k + ";+inf[";
    return { q: "Soit " + M("f(x)=" + (k === 1 ? "" : k) + "\\ln x-x") + " sur " + M("]0;+\\infty[") + ". Sur quel intervalle f est-elle " + (up ? "croissante" : "décroissante") + " ?", type: "interval", loose: 1, ans, atex: ivTex(parseIntervals(ans)),
      sol: [M("f'(x)=\\frac{" + k + "}{x}-1=\\frac{" + k + "-x}{x}") + ".", "Pour x > 0, le signe est celui de " + M(k + "-x") + " : positif si " + M("x<" + k) + ".", "Réponse : " + M(ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c5-extremum", ch: 5, ref: 4, title: "Maximum et minimum",
  learn: L({
    rule: "Un extremum local est atteint là où " + M("f'") + " <b>s'annule en changeant de signe</b>. Sur un intervalle fermé " + M("[a;b]") + ", on compare aussi les valeurs aux bornes.",
    steps: ["Calcule f' et trouve où elle s'annule.", "Tableau de variations.", "Calcule f aux points trouvés (et aux bornes si l'intervalle est fermé).", "Le plus grand = maximum, le plus petit = minimum."],
    trap: "On demande souvent la <b>valeur</b> du maximum (f(x₀)), pas l'endroit x₀ où il est atteint.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = rnz(-3, 3), h = q(rnz(-4, 4), pick([1, 2])), c = rnz(-6, 6); const b = h.mul(-2 * a); if (!b.isInt()) return this.gen();
      const v = pevalQ([a, b.n, c], h); const kind = a > 0 ? "minimum" : "maximum";
      return { q: "Soit " + M("f(x)=" + polyT([a, b.n, c])) + ". Quelle est la valeur du " + kind + " de f ?", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex(),
        traps: [{ ans: h.plain(), m: "C'est l'abscisse x₀ où le " + kind + " est atteint. La question demande la valeur f(x₀)." }],
        sol: [M("f'(x)=" + polyT([2 * a, b.n]) + "=0\\iff x=" + h.tex()) + ".", "a = " + a + (a > 0 ? " > 0 : f descend puis monte, c'est un minimum." : " < 0 : f monte puis descend, c'est un maximum."), M("f\\left(" + h.tex() + "\\right)=" + v.tex()) + "."] };
    }
    if (t === 2) return { q: "Quelle est la valeur maximale de " + M("f(x)=x\\,e^{-x}") + " sur " + M("\\mathbb R") + " ?", type: "num", ans: "1/e", allow: ["e"], atex: "\\frac1e",
      traps: [{ ans: "1", m: "x = 1 est l'endroit du maximum ; sa valeur est f(1)." }],
      sol: [M("f'(x)=(1-x)e^{-x}") + ", nulle en " + M("x=1") + " : f croît avant, décroît après.", "Maximum : " + M("f(1)=1\\times e^{-1}=\\frac1e") + "."] };
    if (t === 3) { const k = ri(1, 3); return { q: "Quelle est la valeur minimale de " + M("f(x)=e^{x}-" + (k === 1 ? "" : k) + "x") + " sur " + M("\\mathbb R") + " ?", type: "num", ans: k + "-" + k + "*ln(" + k + ")", allow: ["ln"], atex: k === 1 ? "1" : k + "-" + k + "\\ln " + k,
      sol: [M("f'(x)=e^x-" + k) + ", nulle pour " + M("x=\\ln " + k) + " ; négative avant, positive après : c'est un minimum.", M("f(\\ln " + k + ")=" + k + "-" + k + "\\ln " + k) + (k === 1 ? " = 1" : "") + "."] }; }
    const r = ri(1, 3), B = r + ri(1, 3); // f(x) = x³ − 3r²x sur [0 ; B]
    const P = [1, 0, -3 * r * r, 0]; const vr = pevalQ(P, q(r)), v0 = q(0), vB = pevalQ(P, q(B));
    const askMax = coin(); const ans = askMax ? (vB.v > v0.v ? vB : v0) : vr;
    return { q: "Soit " + M("f(x)=" + polyT(P)) + " sur " + M("[0\\,;\\," + B + "]") + ". Quelle est la valeur " + (askMax ? "maximale" : "minimale") + " de f sur cet intervalle ?", type: "num", ans: ans.plain(), form: ["rat"], atex: ans.tex(),
      sol: [M("f'(x)=3x^2-" + 3 * r * r + "=3(x-" + r + ")(x+" + r + ")") + " : sur " + M("[0;" + B + "]") + ", f décroît jusqu'à " + r + " puis croît.", "Valeurs : " + M("f(0)=0") + ", " + M("f(" + r + ")=" + vr.tex()) + ", " + M("f(" + B + ")=" + vB.tex()) + ".", (askMax ? "Maximum" : "Minimum") + " : " + M(ans.tex()) + "."] };
  },
});

sk({
  id: "c5-optimisation", ch: 5, ref: 5, title: "Problèmes d'optimisation",
  learn: L({
    rule: "Optimiser = trouver le maximum ou le minimum d'une quantité. On l'écrit comme une <b>fonction d'une seule variable</b>, puis on étudie sa dérivée.",
    steps: ["Choisis la variable x (et son intervalle).", "Exprime la quantité à optimiser en fonction de x seulement.", "Dérive, trouve où f' = 0, vérifie que c'est bien un max/min.", "Réponds à la question posée (la valeur ou la dimension, avec l'unité)."],
    trap: "Relis la question : on demande parfois x, parfois la valeur optimale.",
  }),
  gen() {
    const t = ri(1, 5);
    if (t === 1) { const k = ri(2, 15), P = 4 * k; return { q: "Un rectangle a un périmètre de " + M(P) + " m. Quelle est son aire maximale (en m²) ?", type: "num", ans: String(k * k), form: ["rat"], atex: k * k + "\\text{ m}^2",
      sol: ["Côtés x et " + M((P / 2) + "-x") + ". Aire " + M("A(x)=x(" + P / 2 + "-x)=" + P / 2 + "x-x^2") + ".", M("A'(x)=" + P / 2 + "-2x=0\\iff x=" + k) + " (maximum, car A' passe de + à −).", "Le rectangle est un carré de côté " + k + " : " + M("A=" + k * k) + " m²."] }; }
    if (t === 2) { const m = ri(2, 6), a = 6 * m; return { q: "Dans un carton carré de " + M(a) + " cm de côté, on découpe un carré de côté x à chaque coin pour faire une boîte sans couvercle. Pour quelle valeur de x (en cm) le volume est-il maximal ?", type: "num", ans: String(m), form: ["rat"], atex: "x=" + m,
      sol: [M("V(x)=x(" + a + "-2x)^2") + " pour " + M("0<x<" + a / 2) + ".", M("V'(x)=(" + a + "-2x)^2-4x(" + a + "-2x)=(" + a + "-2x)(" + a + "-6x)") + ".", "Dans " + M("]0;" + a / 2 + "[") + ", V' s'annule en " + M("x=" + m) + " (de + à −) : maximum pour " + M("x=" + m) + " cm."] }; }
    if (t === 3) { const h = ri(3, 30), c = ri(10, 100), b = 2 * h; const askQ = coin(); const Bm = h * h - c;
      return { q: "Le bénéfice (en milliers de francs) pour x unités vendues est " + M("B(x)=-x^2+" + b + "x-" + c) + ". " + (askQ ? "Combien d'unités faut-il vendre pour un bénéfice maximal ?" : "Quel est le bénéfice maximal ?"), type: "num", ans: String(askQ ? h : Bm), form: ["rat"], atex: askQ ? "x=" + h : String(Bm),
        sol: [M("B'(x)=-2x+" + b + "=0\\iff x=" + h) + " (B' passe de + à − : maximum).", askQ ? "Il faut vendre " + h + " unités." : M("B(" + h + ")=-" + h * h + "+" + b * h + "-" + c + "=" + Bm) + "."] }; }
    if (t === 4) { const m = ri(2, 12), L0 = 4 * m; return { q: "On clôture un enclos rectangulaire le long d'une rivière (pas de clôture côté rivière) avec " + M(L0) + " m de grillage. Quelle est l'aire maximale (en m²) ?", type: "num", ans: String(2 * m * m), form: ["rat"], atex: 2 * m * m + "\\text{ m}^2",
      sol: ["Deux côtés x perpendiculaires à la rivière, un côté " + M(L0 + "-2x") + ". " + M("A(x)=x(" + L0 + "-2x)") + ".", M("A'(x)=" + L0 + "-4x=0\\iff x=" + m) + ".", M("A(" + m + ")=" + m + "\\times" + 2 * m + "=" + 2 * m * m) + " m²."] }; }
    const k = ri(2, 9); const askX = coin();
    return { q: "Le coût moyen de production est " + M("C(x)=x+" + frac(k * k, "x")) + " pour " + M("x>0") + ". " + (askX ? "Pour quelle valeur de x est-il minimal ?" : "Quel est le coût moyen minimal ?"), type: "num", ans: String(askX ? k : 2 * k), form: ["rat"], atex: askX ? "x=" + k : String(2 * k),
      sol: [M("C'(x)=1-" + frac(k * k, "x^2") + "=\\frac{x^2-" + k * k + "}{x^2}") + ", nulle pour " + M("x=" + k) + " (x > 0).", "C' passe de − à + : minimum. " + (askX ? M("x=" + k) : M("C(" + k + ")=" + k + "+" + k + "=" + 2 * k)) + "."] };
  },
});

sk({
  id: "c5-physique", ch: 5, ref: 5, title: "Dérivée en physique : vitesse, courant",
  learn: L({
    rule: "La vitesse est la dérivée de la position : " + M("v(t)=x'(t)") + ". L'accélération est la dérivée de la vitesse : " + M("a(t)=v'(t)") + ". Le courant est la dérivée de la charge : " + M("i(t)=q'(t)") + ".",
    steps: ["Identifie la grandeur donnée et celle demandée.", "Dérive (une ou deux fois).", "Remplace t par la valeur demandée et donne l'unité."],
    trap: "Dériver par rapport à t : la variable est t, pas x.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 3) { const Q0 = ri(2, 12), tau = pick([1, 2, 4, 5]); const v = q(-Q0, tau);
      return { q: "La charge d'un condensateur qui se décharge est " + M("q(t)=" + Q0 + "e^{-t/" + tau + "}") + " (en mC, t en s). Calcule le courant " + M("i(0)=q'(0)") + " (en mA).", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex() + "\\text{ mA}",
        sol: [M("q'(t)=" + Q0 + "\\times\\left(-\\frac1{" + tau + "}\\right)e^{-t/" + tau + "}") + ".", M("i(0)=-" + frac(Q0, tau) + "=" + v.tex()) + " mA (le signe − indique la décharge)."] }; }
    const P = [rnz(-2, 2), rnz(-4, 6), rnz(-5, 5), rnz(0, 9)]; const t0 = ri(0, 4); const acc = t === 2;
    const V = pder(P), A = pder(V); const v = pevalQ(acc ? A : V, q(t0));
    return { q: "La position d'un mobile est " + M("x(t)=" + polyT(P, "t")) + " (m, s). Calcule " + (acc ? "son accélération" : "sa vitesse") + " à " + M("t=" + t0) + " s.", type: "num", ans: v.plain(), form: ["rat"], atex: v.tex() + (acc ? "\\text{ m/s}^2" : "\\text{ m/s}"),
      sol: [M("v(t)=x'(t)=" + polyT(V, "t")) + ".", acc ? M("a(t)=v'(t)=" + polyT(A, "t")) + ", " + M("a(" + t0 + ")=" + v.tex()) + " m/s²." : M("v(" + t0 + ")=" + v.tex()) + " m/s."] };
  },
});
