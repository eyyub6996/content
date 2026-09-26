/* =====================================================================
   COMPÉTENCES — escales 2 (équations) et 3 (trigonométrie)
   ===================================================================== */
const setIn = arr => arr.map(v => (v instanceof Q ? v.plain() : String(v)));
const setTex = arr => (arr.length ? "S=\\left\\{" + arr.join("\\,;\\,") + "\\right\\}" : "S=\\varnothing");
function qSort(arr) { return arr.slice().sort((a, b) => Qv(a).v - Qv(b).v); }

/* =========================== ESCALE 2 =========================== */
sk({
  id: "c2-eq1", ch: 2, ref: 1, title: "Équation du premier degré",
  learn: L({
    idea: "Une équation est une balance en équilibre : ce qu'on fait d'un côté, on le fait de l'autre.",
    rule: "On peut <b>ajouter/soustraire</b> le même nombre des deux côtés, et <b>multiplier/diviser</b> par le même nombre <b>non nul</b>.",
    steps: ["Regroupe les x à gauche, les nombres à droite (en changeant de côté, un terme change de signe).", "Réduis chaque côté : " + M("ax=b") + ".", "Divise par a : " + M("x=\\frac ba") + ".", "Vérifie en remplaçant x dans l'équation de départ."],
    trap: "Si " + M("-3x=12") + ", alors " + M("x=-4") + " : on divise par −3, signe compris.",
    input: "<code>7/2</code> (ou <code>x = 7/2</code>).",
  }),
  gen() {
    const x = q(rnz(-12, 12), pick([1, 1, 1, 2, 3, 4, 5])), a = rnz(-9, 9); let c = rnz(-9, 9); while (c === a) c = rnz(-9, 9);
    const b = rnz(-15, 15), d = x.mul(a - c).add(b); if (!d.isInt()) return this.gen();
    const D0 = d.n;
    const L0 = polyT([a, b]), R0 = polyT([c, D0]);
    return { q: "Résous : " + M(L0 + "=" + R0), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
      traps: [{ ans: [q(D0 + b, a - c).plain()], m: "Quand un terme change de côté, il change de signe." }],
      sol: ["On regroupe les x à gauche et les nombres à droite (un terme qui change de côté change de signe) : " + M(polyT([a, 0]) + (c < 0 ? "+" + polyT([-c, 0]) : "-" + polyT([c, 0])) + "=" + D0 + (b < 0 ? "+" + -b : "-" + b)) + ".", "On réduit : " + M(polyT([a - c, 0]) + "=" + (D0 - b)) + ".", "On divise par " + M(tx(a - c)) + " : " + M("x=" + frac(D0 - b, a - c) + "=" + x.tex()) + "."] };
  },
});

sk({
  id: "c2-eq1-avance", ch: 2, ref: 1, title: "Équations avec parenthèses et fractions",
  learn: L({
    rule: "Avec des fractions, on multiplie <b>chaque terme</b> des deux côtés par le dénominateur commun : les fractions disparaissent.",
    steps: ["Développe les parenthèses (attention aux « − » devant).", "S'il y a des fractions : multiplie tout par le dénominateur commun.", "Résous comme une équation du 1er degré."],
    trap: "En multipliant par le dénominateur commun, on n'oublie <b>aucun</b> terme (même ceux sans fraction).",
  }),
  gen() {
    if (coin()) {
      const k = rnz(-5, 5), p = rnz(-6, 6), m = rnz(-5, 5), n = rnz(-6, 6); const r = rnz(-3, 3), s = rnz(-10, 10);
      const A = k + m - r; if (A === 0) return this.gen();
      const B = s + k * p - m * n; const x = q(B, A);
      const lhs = (k === 1 ? "" : k === -1 ? "-" : k) + pr(linT(1, -p)) + (m < 0 ? "-" : "+") + (Math.abs(m) === 1 ? "" : Math.abs(m)) + pr(linT(1, n));
      return { q: "Résous : " + M(lhs + "=" + polyT([r, s])), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["On développe : " + M(polyT([k, -k * p]) + (m < 0 ? "" : "+") + polyT([m, m * n]) + "=" + polyT([r, s])) + ".", "On regroupe les x à gauche, les nombres à droite : " + M(polyT([A, 0]) + "=" + B) + ".", M("x=" + frac(B, A) + "=" + x.tex()) + "."] };
    }
    let a = ri(2, 6), c = ri(2, 6); while (c === a) c = ri(2, 6);
    const b = q(rnz(-5, 5), pick([1, 2, 3, 4])), d = q(rnz(-5, 5), pick([1, 2, 3]));
    const coef = q(1, a).sub(q(1, c)); const x = d.sub(b).div(coef);
    const Lc = lcm(lcm(a, c), lcm(b.d, d.d));
    return { q: "Résous : " + M(frac("x", a) + sgnTex(b) + "=" + frac("x", c) + sgnTex(d)), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
      sol: ["On multiplie tout par " + Lc + " : " + M(Lc / a + "x" + sgnTex(b.mul(Lc)) + "=" + Lc / c + "x" + sgnTex(d.mul(Lc))) + ".", "On regroupe : " + M((Lc / a - Lc / c) + "x=" + d.sub(b).mul(Lc).tex()) + ".", M("x=" + x.tex()) + "."] };
  },
});

sk({
  id: "c2-produit-nul", ch: 2, ref: 2, title: "Équation produit nul",
  learn: L({
    rule: "Un produit est nul <b>si et seulement si</b> l'un des facteurs est nul : " + M("A\\times B=0\\iff A=0\\text{ ou }B=0") + ".",
    steps: ["Mets tout d'un côté, 0 de l'autre.", "Factorise (facteur commun, identité remarquable).", "Écris « facteur 1 = 0 ou facteur 2 = 0 » et résous chaque petite équation."],
    trap: "Dans " + M("x^2=5x") + ", ne divise pas par x : tu perdrais la solution " + M("x=0") + ". Écris " + M("x(x-5)=0") + ".",
    input: "<code>0 ; 5</code> (sépare les solutions par un point-virgule).",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = rnz(-4, 4), b = rnz(-9, 9), c = rnz(-4, 4), d = rnz(-9, 9); const r1 = q(-b, a), r2 = q(-d, c);
      const s = qSort([r1, r2]);
      return { q: "Résous : " + M(pr(linT(a, b)) + pr(linT(c, d)) + "=0"), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
        sol: [M(linT(a, b) + "=0") + " ou " + M(linT(c, d) + "=0") + ".", M("x=" + r1.tex()) + " ou " + M("x=" + r2.tex()) + "."] };
    }
    if (t === 2) {
      const a = rnz(-6, 6), b = rnz(-9, 9); const r = q(b, a); const s = qSort([q(0), r]);
      return { q: "Résous : " + M(polyT([a, 0, 0]) + "=" + polyT([b, 0])), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
        traps: [{ ans: [r.plain()], m: "Tu as divisé par x et perdu la solution x = 0. Factorise plutôt." }],
        sol: ["On met tout à gauche : " + M(polyT([a, -b, 0]) + "=0") + ".", "On factorise : " + M("x" + pr(linT(a, -b)) + "=0") + ".", M("x=0") + " ou " + M("x=" + r.tex()) + "."] };
    }
    const a = ri(1, 5), b = rnz(-9, 9); const r = q(-b, a);
    return { q: "Résous : " + M(pr(linT(a, b)) + "^2=0"), type: "set", ans: [r.plain()], form: ["rat"], atex: setTex([r.tex()]),
      sol: ["Un carré est nul si ce qui est dedans est nul : " + M(linT(a, b) + "=0") + ".", M("x=" + r.tex()) + " (une seule solution)."] };
  },
});

sk({
  id: "c2-eq-carre", ch: 2, ref: 4, title: "Équations x² = k",
  learn: L({
    rule: "Si " + M("k>0") + " : " + M("x^2=k\\iff x=\\sqrt k\\text{ ou }x=-\\sqrt k") + ". Si " + M("k=0") + " : " + M("x=0") + ". Si " + M("k<0") + " : aucune solution (un carré n'est jamais négatif).",
    steps: ["Isole le carré : " + M("(\\ldots)^2=k") + ".", "Regarde le signe de k.", "Écris les deux solutions ±√k (et simplifie la racine)."],
    trap: "Il y a <b>deux</b> solutions : " + M("x^2=9") + " donne 3 <b>et</b> −3.",
    input: "<code>-3 ; 3</code>, <code>-sqrt(5) ; sqrt(5)</code> ou <code>vide</code>.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = ri(1, 4), k = pick([1, 4, 9, 16, 25, 36, 49]) * a, s = [q(-Math.round(Math.sqrt(k / a))), q(Math.round(Math.sqrt(k / a)))];
      const c = -k;
      const r = Math.sqrt(k / a);
      return { q: "Résous : " + M(polyT([a, 0, c]) + "=0"), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
        traps: [{ ans: [String(r)], m: "Il y a deux solutions : +" + r + " et −" + r + "." }],
        sol: [M((a === 1 ? "" : a) + "x^2=" + k) + ", donc " + M("x^2=" + k / a) + ".", M("x=" + r) + " ou " + M("x=-" + r) + "."] };
    }
    if (t === 2) {
      const m = pick([2, 3, 5, 6, 7, 8, 12, 18, 20]), [kk, mm] = simplSqrt(m);
      return { q: "Résous : " + M("x^2=" + m), type: "set", ans: ["-" + sqrtIn(kk, mm), sqrtIn(kk, mm)], allow: ["sqrt"], form: ["sqrt"], atex: setTex(["-" + sqrtT(kk, mm), sqrtT(kk, mm)]),
        traps: [{ ans: [sqrtIn(kk, mm)], m: "Il y a deux solutions : " + M("\\pm" + sqrtT(kk, mm)) + "." }],
        sol: [M(m + ">0") + " : deux solutions " + M("x=\\pm\\sqrt{" + m + "}") + ".", mm !== m ? "On simplifie : " + M("\\sqrt{" + m + "}=" + sqrtT(kk, mm)) + "." : "La racine ne se simplifie pas.", M(setTex(["-" + sqrtT(kk, mm), sqrtT(kk, mm)])) + "."] };
    }
    if (t === 3) {
      const k = ri(1, 30);
      return { q: "Résous : " + M("x^2+" + k + "=0"), type: "set", ans: [], atex: setTex([]),
        sol: [M("x^2=-" + k) + ".", "Un carré est toujours positif ou nul : <b>aucune solution</b> réelle."] };
    }
    const a = rnz(-7, 7), k = ri(1, 8), s = qSort([q(-a - k), q(-a + k)]);
    return { q: "Résous : " + M(pr(linT(1, a)) + "^2=" + k * k), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
      traps: [{ ans: [String(-a + k)], m: "Il y a deux solutions : " + M(linT(1, a) + "=" + k) + " ou " + M(linT(1, a) + "=-" + k) + "." }],
      sol: [M(linT(1, a) + "=" + k) + " ou " + M(linT(1, a) + "=-" + k) + ".", M("x=" + (-a + k)) + " ou " + M("x=" + (-a - k)) + "."] };
  },
});

sk({
  id: "c2-discriminant", ch: 2, ref: 4, title: "Calculer le discriminant Δ",
  learn: L({
    rule: "Pour " + M("ax^2+bx+c") + " : " + M("\\Delta=b^2-4ac") + ".",
    steps: ["Lis a, b, c <b>avec leur signe</b> (range d'abord en " + M("ax^2+bx+c") + ").", "Calcule " + M("b^2") + " (toujours positif).", "Calcule " + M("4ac") + " avec les signes.", M("\\Delta=b^2-4ac") + "."],
    trap: "Avec " + M("c<0") + " : " + M("-4ac") + " devient positif. Pour " + M("x^2+3x-4") + " : " + M("\\Delta=9-4\\times1\\times(-4)=9+16=25") + ".",
  }),
  gen() {
    const a = rnz(-5, 5), b = rnz(-9, 9), c = rnz(-9, 9); const D = b * b - 4 * a * c;
    const order = coin();
    const expr = order ? polyT([a, b, c]) : (c + (b < 0 ? "-" : "+") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "x" + (a < 0 ? "-" : "+") + (Math.abs(a) === 1 ? "" : Math.abs(a)) + "x^2");
    return { q: "Calcule le discriminant de " + M(expr) + ".", type: "num", ans: String(D), form: ["rat"], atex: "\\Delta=" + D,
      traps: [{ ans: String(b * b + 4 * a * c), m: "Attention au signe de " + M("4ac") + " : " + M("\\Delta=b^2-4ac") + "." }, { ans: String(-b * b - 4 * a * c), m: M("b^2") + " est toujours positif : " + M(tp(b) + "^2=" + b * b) + "." }],
      sol: [(!order ? "On range : " + M(polyT([a, b, c])) + ". " : "") + M("a=" + a) + ", " + M("b=" + b) + ", " + M("c=" + c) + ".", M("\\Delta=" + tp(b) + "^2-4\\times" + tp(a) + "\\times" + tp(c) + "=" + b * b + (4 * a * c > 0 ? "-" + 4 * a * c : "+" + -4 * a * c) + "=" + D) + "."] };
  },
});

function trinomeSol(a, b, c) {
  const D = b * b - 4 * a * c; const lines = [M("\\Delta=" + tp(b) + "^2-4\\times" + tp(a) + "\\times" + tp(c) + "=" + D) + "."];
  return { D, lines };
}
sk({
  id: "c2-second-degre", ch: 2, ref: 4, title: "Résoudre ax² + bx + c = 0",
  learn: L({
    rule: M("\\Delta=b^2-4ac") + ". Si " + M("\\Delta>0") + " : deux solutions " + M("x=\\frac{-b\\pm\\sqrt\\Delta}{2a}") + ". Si " + M("\\Delta=0") + " : une solution " + M("x=\\frac{-b}{2a}") + ". Si " + M("\\Delta<0") + " : aucune solution réelle.",
    steps: ["Range l'équation : " + M("ax^2+bx+c=0") + ".", "Calcule Δ.", "Selon le signe de Δ, applique la formule.", "Simplifie les fractions et vérifie une solution."],
    trap: M("-b") + " quand b est négatif : si " + M("b=-5") + ", alors " + M("-b=+5") + ".",
    input: "<code>-2 ; 3/2</code> ou <code>vide</code>.",
  }),
  gen() {
    const t = ri(1, 6);
    if (t === 5) { const r = q(rnz(-6, 6), pick([1, 1, 2, 3])), kk = sg() * ri(1, 2); const P = pmul([r.d, -r.n], [r.d, -r.n]).map(x => x.mul(kk));
      const [A, B, Cc] = P.map(x => x.n); const { lines } = trinomeSol(A, B, Cc);
      return { q: "Résous : " + M(polyT([A, B, Cc]) + "=0"), type: "set", ans: [r.plain()], form: ["rat"], atex: setTex([r.tex()]), sol: lines.concat([M("\\Delta=0") + " : une seule solution " + M("x=\\frac{-b}{2a}=" + frac(tx(-B), 2 * A) + "=" + r.tex()) + "."]) }; }
    if (t === 6) { let a, b, c; do { a = rnz(-4, 4); b = rnz(-6, 6); c = rnz(-9, 9); } while (b * b - 4 * a * c >= 0);
      const { lines } = trinomeSol(a, b, c); return { q: "Résous : " + M(polyT([a, b, c]) + "=0"), type: "set", ans: [], atex: setTex([]), sol: lines.concat([M("\\Delta<0") + " : aucune solution réelle."]) }; }
    const r1 = q(rnz(-7, 7), pick([1, 1, 1, 2, 3])); let r2 = q(rnz(-7, 7), pick([1, 1, 2])); if (r2.eq(r1)) r2 = r2.add(1);
    const k = pick([1, 1, -1, 2]);
    const P = pmul([r1.d, -r1.n], [r2.d, -r2.n]).map(x => x.mul(k)); const [A, B, Cc] = P.map(x => x.n);
    const { D, lines } = trinomeSol(A, B, Cc); const sD = Math.round(Math.sqrt(D));
    const s = qSort([r1, r2]);
    return { q: "Résous : " + M(polyT([A, B, Cc]) + "=0"), type: "set", ans: setIn(s), form: ["rat"], atex: setTex(s.map(tx)),
      sol: lines.concat([M("\\Delta>0") + ", " + M("\\sqrt\\Delta=" + sD) + ".", M("x_1=" + frac(tx(-B) + "-" + sD, 2 * A) + "=" + q(-B - sD, 2 * A).tex()) + " et " + M("x_2=" + frac(tx(-B) + "+" + sD, 2 * A) + "=" + q(-B + sD, 2 * A).tex()) + "."]) };
  },
});

sk({
  id: "c2-second-degre-racines", ch: 2, ref: 4, title: "Solutions avec des racines",
  learn: L({
    rule: "Quand Δ n'est pas un carré parfait, on garde la racine : " + M("x=\\frac{-b\\pm\\sqrt\\Delta}{2a}") + ", puis on simplifie " + M("\\sqrt\\Delta") + " et la fraction.",
    steps: ["Calcule Δ.", "Simplifie " + M("\\sqrt\\Delta") + " (par exemple " + M("\\sqrt{12}=2\\sqrt3") + ").", "Écris les deux solutions et simplifie par un facteur commun si possible : " + M("\\frac{-2\\pm2\\sqrt3}{2}=-1\\pm\\sqrt3") + "."],
    trap: "On ne simplifie pas seulement un morceau : " + M("\\frac{2+\\sqrt3}{2}\\ne1+\\sqrt3") + ".",
    input: "<code>1-sqrt(3) ; 1+sqrt(3)</code> ou <code>(3-sqrt(5))/2 ; (3+sqrt(5))/2</code>.",
  }),
  gen() {
    let a, b, c, D;
    do { a = pick([1, 1, 1, -1, 2]); b = rnz(-8, 8); c = rnz(-9, 9); D = b * b - 4 * a * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)));
    const [k, m] = simplSqrt(D);
    const sol1 = "(" + (-b) + "-" + k + "*sqrt(" + m + "))/(" + 2 * a + ")", sol2 = "(" + (-b) + "+" + k + "*sqrt(" + m + "))/(" + 2 * a + ")";
    const g = gcd(gcd(b, k), 2 * a);
    const pt = (s) => { const A = q(-b, 2 * a), K = q(k * s, 2 * a); return (A.n === 0 ? "" : A.tex()) + (K.n < 0 ? "-" : A.n === 0 ? "" : "+") + (K.abs().eq(1) ? "" : K.abs().tex()) + "\\sqrt{" + m + "}"; };
    return { q: "Résous : " + M(polyT([a, b, c]) + "=0"), type: "set", ans: [sol1, sol2], allow: ["sqrt"], atex: setTex([pt(-1), pt(1)]),
      sol: [M("\\Delta=" + tp(b) + "^2-4\\times" + tp(a) + "\\times" + tp(c) + "=" + D) + " > 0.", M("\\sqrt{" + D + "}=" + sqrtT(k, m)) + ".", M("x=" + frac(tx(-b) + "\\pm" + sqrtT(k, m), 2 * a)) + (g > 1 ? ", on simplifie par " + g : "") + " : " + M(pt(-1)) + " et " + M(pt(1)) + "."] };
  },
});

sk({
  id: "c2-somme-produit", ch: 2, ref: 4, title: "Somme et produit des racines",
  learn: L({
    rule: "Si " + M("x_1") + " et " + M("x_2") + " sont les solutions de " + M("ax^2+bx+c=0") + " : " + M("x_1+x_2=-\\frac ba") + " et " + M("x_1\\times x_2=\\frac ca") + ".<br>Deux nombres de somme S et de produit P sont les solutions de " + M("X^2-SX+P=0") + ".",
    steps: ["Racine évidente connue : l'autre vaut " + M("x_2=\\frac{c}{a\\,x_1}") + ".", "Somme et produit donnés : résous " + M("X^2-SX+P=0") + "."],
    trap: "La somme est " + M("-\\frac ba") + " (avec un signe −), le produit " + M("\\frac ca") + " (sans signe −).",
  }),
  gen() {
    const r1 = rnz(-6, 6); let r2 = rnz(-8, 8); while (r2 === r1) r2 = rnz(-8, 8); const a = pick([1, 1, 2, -1]);
    if (coin()) {
      const P = pmul([1, -r1], [1, -r2]).map(x => x.mul(a)); const [A, B, Cc] = P.map(x => x.n);
      return { q: M(r1) + " est solution de " + M(polyT([A, B, Cc]) + "=0") + ". Trouve l'autre solution (sans calculer Δ).", type: "num", ans: String(r2), form: ["rat"], atex: "x_2=" + r2,
        traps: [{ ans: String(-r2), m: "Produit des racines : " + M("\\frac ca") + " (sans signe −)." }],
        sol: ["Produit des racines : " + M("x_1x_2=\\frac ca=" + frac(Cc, A) + "=" + q(Cc, A).tex()) + ".", M("x_2=" + frac(q(Cc, A).tex(), tp(r1)) + "=" + r2) + "."] };
    }
    const S = r1 + r2, Pp = r1 * r2; const s = [Math.min(r1, r2), Math.max(r1, r2)];
    return { q: "Trouve les deux nombres dont la somme vaut " + M(S) + " et le produit vaut " + M(Pp) + ".", type: "set", ans: s.map(String), form: ["rat"], atex: s.join("\\text{ et }"),
      sol: ["Ce sont les solutions de " + M("X^2" + mono(-S, "X", false) + sgnTex(Pp) + "=0") + ".", M("\\Delta=" + (S * S - 4 * Pp) + "=" + Math.abs(r1 - r2) + "^2") + ".", "Solutions : " + M(s[0]) + " et " + M(s[1]) + " (vérifie : somme " + S + ", produit " + Pp + ")."] };
  },
});

sk({
  id: "c2-eq-quotient", ch: 2, ref: 3, title: "Équations avec x au dénominateur",
  learn: L({
    rule: "D'abord les <b>valeurs interdites</b> (dénominateur = 0). Ensuite " + M("\\frac AB=\\frac CD\\iff AD=BC") + " (produit en croix).",
    steps: ["Écris les valeurs interdites.", "Fais le produit en croix (ou multiplie par le dénominateur).", "Résous l'équation obtenue.", "<b>Élimine</b> les solutions qui sont des valeurs interdites."],
    trap: "Oublier de vérifier : une « solution » qui annule un dénominateur n'est pas une solution.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const c = 1, d = rnz(-6, 6), k = rnz(-5, 5); let a = rnz(-5, 5); while (a === k * c) a = rnz(-5, 5);
      const x = q(rnz(-9, 9)); if (x.eq(-d)) return this.gen();
      const b = x.mul(k * c - a).add(k * d).n;
      const forb = -d;
      return { q: "Résous : " + M(frac(linT(a, b), linT(c, d)) + "=" + k), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["Valeur interdite : " + M("x=" + forb) + ".", "On multiplie par " + M(pr(linT(c, d))) + " : " + M(linT(a, b) + "=" + polyT([k * c, k * d])) + ".", M(polyT([a - k * c, 0]) + "=" + (k * d - b)) + ", donc " + M("x=" + x.tex()) + " (différent de " + forb + ", on le garde)."] };
    }
    if (t === 2) {
      const p = rnz(-5, 5), kk = rnz(-4, 4); if (kk === 0 || kk === 1) return this.gen();
      // (a x + b)/(x - p) = k avec solution = p  → aucune solution
      const a = kk + ri(1, 3), bb = -a * p; // numérateur a(x − p) : la seule « solution » est la valeur interdite
      return { q: "Résous : " + M(frac(linT(a, bb), linT(1, -p)) + "=" + kk), type: "set", ans: [], atex: setTex([]),
        traps: [{ ans: [String(p)], m: M("x=" + p) + " est une valeur interdite (le dénominateur s'annule) : on l'élimine." }],
        sol: ["Valeur interdite : " + M("x=" + p) + ".", M(linT(a, bb) + "=" + kk + pr(linT(1, -p))) + " donne " + M(polyT([a - kk, 0]) + "=" + (a - kk) * p) + ", donc " + M("x=" + p) + ".", "Mais " + p + " est interdit : <b>aucune solution</b>."] };
    }
    const A = ri(1, 6), B = ri(1, 6); let p = rnz(-5, 5), qq = rnz(-5, 5); if (A === B || p === qq) return this.gen();
    const x = q(A * qq - B * p, A - B); if (x.eq(p) || x.eq(qq)) return this.gen();
    return { q: "Résous : " + M(frac(A, linT(1, -p)) + "=" + frac(B, linT(1, -qq))), type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
      sol: ["Valeurs interdites : " + M(p) + " et " + M(qq) + ".", "Produit en croix : " + M(A + pr(linT(1, -qq)) + "=" + B + pr(linT(1, -p))) + ".", M(polyT([A - B, 0]) + "=" + (A * qq - B * p)) + ", " + M("x=" + x.tex()) + "."] };
  },
});

sk({
  id: "c2-changement-variable", ch: 2, ref: 7, title: "Changement de variable (bicarrée)",
  learn: L({
    rule: "Dans " + M("ax^4+bx^2+c=0") + ", on pose " + M("X=x^2") + " : on obtient " + M("aX^2+bX+c=0") + ", une équation du second degré.",
    steps: ["Pose " + M("X=x^2") + " (avec " + M("X\\ge0") + ").", "Résous en X avec Δ ou le produit nul.", "Pour chaque X ≥ 0, résous " + M("x^2=X") + " : " + M("x=\\pm\\sqrt X") + ". Un X négatif ne donne rien."],
    trap: "Ne t'arrête pas aux valeurs de X : la question demande les valeurs de x.",
  }),
  gen() {
    const X1 = pick([1, 4, 9, 16, -1, -4]); let X2 = pick([1, 4, 9, 16, 25, -9, -2]); while (X2 === X1) X2 = pick([1, 4, 9, 16, 25]);
    const b = -(X1 + X2), c = X1 * X2;
    const xs = []; [X1, X2].forEach(X => { if (X > 0) { const r = Math.sqrt(X); xs.push(-r, r); } });
    xs.sort((u, v) => u - v);
    return { q: "Résous : " + M("x^4" + mono(b, "x^2", false) + sgnTex(c) + "=0"), type: "set", ans: xs.map(String), form: ["rat"], atex: setTex(xs.map(String)),
      traps: [{ ans: [X1, X2].map(String), m: "Ce sont les valeurs de " + M("X=x^2") + " : il faut encore trouver x." }],
      sol: ["On pose " + M("X=x^2") + " : " + M("X^2" + mono(b, "X", false) + sgnTex(c) + "=0") + ".", "Solutions en X : " + M(X1) + " et " + M(X2) + ".", [X1, X2].map(X => (X > 0 ? M("x^2=" + X) + " → " + M("x=\\pm" + Math.sqrt(X)) : M("x^2=" + X) + " → impossible")).join(" ; ") + ".", M(setTex(xs.map(String))) + "."] };
  },
});

sk({
  id: "c2-systeme", ch: 2, ref: 5, title: "Systèmes de deux équations",
  learn: L({
    rule: "Deux méthodes : <b>substitution</b> (isoler une inconnue et la remplacer) ou <b>combinaison</b> (multiplier les équations pour faire disparaître une inconnue en les additionnant).",
    steps: ["Choisis l'inconnue la plus facile à éliminer.", "Élimine-la (combinaison ou substitution).", "Résous l'équation à une inconnue.", "Remplace pour trouver l'autre, puis vérifie dans les deux équations."],
    trap: "En multipliant une équation, multiplie <b>tous</b> ses termes, y compris celui de droite.",
    input: "<code>(2 ; -1)</code> (x puis y).",
  }),
  gen() {
    const x = rnz(-6, 6), y = rnz(-6, 6);
    let a, b, c, d; do { a = rnz(-5, 5); b = rnz(-5, 5); c = rnz(-5, 5); d = rnz(-5, 5); } while (a * d - b * c === 0);
    const e = a * x + b * y, f = c * x + d * y;
    const row = (p, r, s) => mono(p, "x", true) + mono(r, "y", false) + "=" + s;
    return { q: "Résous le système : " + M("\\begin{cases}" + row(a, b, e) + "\\\\" + row(c, d, f) + "\\end{cases}") + " Donne " + M("(x\\,;\\,y)") + ".", type: "tuple", ans: [String(x), String(y)], vars: [], form: ["rat"], atex: "(" + x + "\\,;\\," + y + ")",
      traps: [{ ans: [String(y), String(x)], m: "Tu as inversé x et y : on donne (x ; y)." }],
      sol: ["On élimine y : on multiplie la 1re ligne par " + tp(d) + " et la 2e par " + tp(b) + ", puis on soustrait.", M((a * d - b * c) + "x=" + (e * d - f * b)) + ", donc " + M("x=" + x) + ".", "On remplace dans la 1re : " + M(mono(b, "y", true) + "=" + e + "-" + tp(a * x)) + ", donc " + M("y=" + y) + ".", "Solution : " + M("(" + x + "\\,;\\," + y + ")") + "."] };
  },
});

sk({
  id: "c2-inequation1", ch: 2, ref: 6, title: "Inéquations du premier degré",
  learn: L({
    rule: "Comme une équation, <b>sauf</b> : si on multiplie ou divise par un nombre <b>négatif</b>, on <b>change le sens</b> de l'inégalité.",
    steps: ["Regroupe les x d'un côté, les nombres de l'autre.", "Divise par le coefficient de x. S'il est négatif : retourne le signe (< devient >).", "Écris l'ensemble des solutions en intervalle."],
    trap: M("-2x<6\\iff x>-3") + " (et non " + M("x<-3") + ").",
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
    const wrongRight = !right;
    const trap = wrongRight ? ivS(r, Infinity, closed, false) : ivS(-Infinity, r, false, closed);
    return { q: "Résous : " + M(polyT([a, b]) + " " + op + " " + polyT([c, d])), type: "interval", ans, atex: "S=" + atex,
      traps: flip ? [{ ans: trap, m: "On divise par " + k + " (négatif) : il faut changer le sens de l'inégalité." }] : [],
      sol: ["On regroupe : " + M(polyT([k, 0]) + " " + op + " " + (d - b)) + ".", flip ? "On divise par " + M(k) + ", <b>négatif</b> : on change le sens. " + M("x " + opR + " " + r.tex()) + "." : "On divise par " + M(k) + " (positif) : " + M("x " + opR + " " + r.tex()) + ".", M("S=" + atex) + "."] };
  },
});

function signCol(a, b, xs) { // signe de ax+b sur chaque intervalle délimité par xs (triés)
  const pts = [-Infinity].concat(xs, [Infinity]); const out = [];
  for (let i = 0; i < pts.length - 1; i++) { const m = !isFinite(pts[i]) ? pts[i + 1] - 1 : !isFinite(pts[i + 1]) ? pts[i] + 1 : (pts[i] + pts[i + 1]) / 2; out.push(a * m + b > 0 ? "+" : "-"); }
  return out;
}
function cellsFor(root, xs, mark) { return xs.map(x => (Math.abs(x - root) < 1e-12 ? mark : "")); }
function solveSignIneq(roots, signs, op, forb) { // intervalles où le signe convient
  const want = op === ">" || op === "\\ge" ? "+" : "-", closed = op === "\\le" || op === "\\ge";
  const pts = [-Infinity].concat(roots, [Infinity]); const parts = [];
  signs.forEach((s, i) => { if (s === want) parts.push({ lo: pts[i], hi: pts[i + 1], lc: closed && isFinite(pts[i]) && !forb.includes(pts[i]), rc: closed && isFinite(pts[i + 1]) && !forb.includes(pts[i + 1]) }); });
  if (closed) roots.forEach((r, i) => { if (!forb.includes(r) && !parts.some(p => p.lo === r || p.hi === r)) parts.push({ lo: r, hi: r, lc: true, rc: true }); });
  return parts;
}
const partsStr = (parts, rootsQ) => { if (!parts.length) return "vide"; const fmt = x => { if (!isFinite(x)) return x > 0 ? "+inf" : "-inf"; const f = rootsQ.find(r => Math.abs(r.v - x) < 1e-12); return f ? f.plain() : String(x); };
  return parts.map(p => (p.lo === p.hi ? "{" + fmt(p.lo) + "}" : (p.lc ? "[" : "]") + fmt(p.lo) + ";" + fmt(p.hi) + (p.rc ? "]" : "["))).join(" U "); };

sk({
  id: "c2-signe-affine", ch: 2, ref: 6, title: "Signe de ax + b",
  learn: L({
    rule: M("ax+b") + " s'annule en " + M("x=-\\frac ba") + ". Il est du <b>signe de a à droite</b> de ce nombre, et du signe contraire à gauche.",
    steps: ["Trouve la racine " + M("-\\frac ba") + ".", "Regarde le signe de a.", "Place les signes dans un tableau : « signe contraire de a | 0 | signe de a »."],
    trap: "Pour " + M("-2x+6") + " (a = −2 < 0) : positif <b>avant</b> 3, négatif après.",
  }),
  gen() {
    const a = rnz(-6, 6), r = q(rnz(-9, 9), pick([1, 1, 2, 3])); const b = r.mul(-a); if (!b.isInt()) return this.gen();
    const op = pick([">", "<", "\\ge", "\\le"]);
    const signs = signCol(a, b.n, [r.v]);
    const parts = solveSignIneq([r.v], signs, op, []);
    const ans = partsStr(parts, [r]);
    return { q: "Pour quels réels " + M("x") + " a-t-on " + M(polyT([a, b.n]) + " " + op + " 0") + " ?", type: "interval", ans, atex: ivTex(parseIntervals(ans)),
      sol: ["Racine : " + M(polyT([a, b.n]) + "=0\\iff x=" + r.tex()) + ".", "a = " + a + (a > 0 ? " > 0 : négatif avant, positif après." : " < 0 : positif avant, négatif après."), signTable([r.tex()], [{ label: polyT([a, b.n]), signs }]), "Réponse : " + M(ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-inequation-produit", ch: 2, ref: 6, title: "Inéquation produit (tableau de signes)",
  learn: L({
    rule: "Le signe d'un produit se lit dans un <b>tableau de signes</b> : une ligne par facteur, puis la règle des signes colonne par colonne.",
    steps: ["Trouve la racine de chaque facteur.", "Range les racines dans l'ordre sur la ligne des x.", "Remplis le signe de chaque facteur (signe de a à droite de sa racine).", "Dernière ligne : règle des signes. Lis les intervalles qui conviennent (crochets fermés si ≤ ou ≥)."],
    trap: "On ne « divise » pas une inéquation par un facteur contenant x : son signe change selon x.",
    input: "<code>]-inf;-2] U [3;+inf[</code>.",
  }),
  gen() {
    const a = pick([1, 1, 2, -1, -2, 3]), c = pick([1, 1, 2, -1, 3]);
    const r1 = q(rnz(-7, 7), a > 0 ? a : -a), r2 = q(rnz(-7, 7), Math.abs(c)); if (r1.eq(r2) || !r1.mul(-a).isInt() || !r2.mul(-c).isInt()) return this.gen();
    const b = r1.mul(-a).n, d = r2.mul(-c).n; const rs = qSort([r1, r2]);
    const xs = rs.map(r => r.v); const op = pick([">", "<", "\\ge", "\\le"]);
    const s1 = signCol(a, b, xs), s2 = signCol(c, d, xs), sp = s1.map((s, i) => (s === s2[i] ? "+" : "-"));
    const parts = solveSignIneq(xs, sp, op, []), ans = partsStr(parts, rs);
    return { q: "Résous : " + M(pr(linT(a, b)) + pr(linT(c, d)) + " " + op + " 0"), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
      sol: ["Racines : " + M(r1.tex()) + " et " + M(r2.tex()) + ".", signTable(rs.map(r => r.tex()), [{ label: linT(a, b), signs: s1, cells: cellsFor(r1.v, xs, "0") }, { label: linT(c, d), signs: s2, cells: cellsFor(r2.v, xs, "0") }, { label: "\\text{produit}", signs: sp }]), "On garde les colonnes " + (op === ">" || op === "\\ge" ? "+" : "−") + (op.includes("e") ? " et les zéros" : "") + " : " + M("S=" + ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-inequation-second", ch: 2, ref: 6, title: "Signe d'un trinôme ax² + bx + c",
  learn: L({
    rule: "Si Δ > 0 : le trinôme est du <b>signe de a à l'extérieur</b> des racines, du signe contraire entre les racines. Si Δ < 0 : toujours du signe de a. Si Δ = 0 : signe de a, sauf 0 en la racine.",
    steps: ["Calcule Δ et les racines.", "Repère le signe de a.", "« Signe de a à l'extérieur des racines » → tableau de signes.", "Lis les intervalles demandés."],
    trap: "Pour " + M("-x^2+4") + " (a < 0) : positif <b>entre</b> −2 et 2.",
  }),
  gen() {
    if (rnd() < 0.2) {
      let a, b, c; do { a = rnz(-3, 3); b = rnz(-4, 4); c = rnz(-9, 9); } while (b * b - 4 * a * c >= 0);
      const op = pick([">", "<", "\\ge", "\\le"]); const pos = op === ">" || op === "\\ge"; const all = (a > 0) === pos;
      return { q: "Résous : " + M(polyT([a, b, c]) + " " + op + " 0"), type: "interval", ans: all ? "R" : "vide", atex: all ? "S=\\mathbb{R}" : "S=\\varnothing",
        sol: [M("\\Delta=" + (b * b - 4 * a * c)) + " < 0 : le trinôme ne s'annule jamais, il est toujours du signe de " + M("a=" + a) + ".", all ? "L'inégalité est toujours vraie : " + M("S=\\mathbb{R}") + "." : "L'inégalité n'est jamais vraie : " + M("S=\\varnothing") + "."] };
    }
    const r1 = rnz(-7, 6); const r2 = r1 + ri(1, 8); const a = pick([1, 1, -1, 2, -2]);
    const P = pmul([1, -r1], [1, -r2]).map(x => x.mul(a)); const [A, B, Cc] = P.map(x => x.n);
    const op = pick([">", "<", "\\ge", "\\le"]); const xs = [r1, r2];
    const signs = [a > 0 ? "+" : "-", a > 0 ? "-" : "+", a > 0 ? "+" : "-"];
    const parts = solveSignIneq(xs, signs, op, []), ans = partsStr(parts, xs.map(v => q(v)));
    return { q: "Résous : " + M(polyT([A, B, Cc]) + " " + op + " 0"), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
      sol: [M("\\Delta=" + (B * B - 4 * A * Cc)) + ", racines " + M(r1) + " et " + M(r2) + ".", "a = " + A + " " + (A > 0 ? "> 0 : positif à l'extérieur des racines, négatif entre." : "< 0 : négatif à l'extérieur des racines, positif entre."), signTable([String(r1), String(r2)], [{ label: polyT([A, B, Cc]), signs }]), M("S=" + ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-inequation-quotient", ch: 2, ref: 6, title: "Inéquation quotient",
  learn: L({
    rule: "Même tableau de signes que pour un produit, mais la racine du dénominateur est une <b>valeur interdite</b> : double barre dans le tableau, crochet <b>toujours ouvert</b>.",
    steps: ["Racine du numérateur, valeur interdite du dénominateur.", "Tableau de signes (numérateur, dénominateur, quotient).", "Crochet fermé possible au zéro du numérateur (si ≤ ou ≥), jamais à la valeur interdite."],
    trap: "Ne fais pas de produit en croix avec une inéquation : tu ne connais pas le signe du dénominateur.",
  }),
  gen() {
    const a = pick([1, 1, 2, -1]), c = pick([1, 1, -1, 2]);
    const r1 = q(rnz(-6, 6), Math.abs(a)), r2 = q(rnz(-6, 6), Math.abs(c)); if (r1.eq(r2) || !r1.mul(-a).isInt() || !r2.mul(-c).isInt()) return this.gen();
    const b = r1.mul(-a).n, d = r2.mul(-c).n; const rs = qSort([r1, r2]); const xs = rs.map(r => r.v);
    const op = pick([">", "<", "\\ge", "\\le"]);
    const s1 = signCol(a, b, xs), s2 = signCol(c, d, xs), sp = s1.map((s, i) => (s === s2[i] ? "+" : "-"));
    const parts = solveSignIneq(xs, sp, op, [r2.v]), ans = partsStr(parts, rs);
    const trapParts = solveSignIneq(xs, sp, op, []);
    return { q: "Résous : " + M(frac(linT(a, b), linT(c, d)) + " " + op + " 0"), type: "interval", ans, atex: "S=" + ivTex(parseIntervals(ans)),
      traps: op.includes("e") ? [{ ans: partsStr(trapParts, rs), m: M("x=" + r2.tex()) + " est une valeur interdite : le crochet y est toujours ouvert." }] : [],
      sol: ["Zéro du numérateur : " + M(r1.tex()) + ". Valeur interdite : " + M(r2.tex()) + ".", signTable(rs.map(r => r.tex()), [{ label: linT(a, b), signs: s1, cells: cellsFor(r1.v, xs, "0") }, { label: linT(c, d), signs: s2, cells: cellsFor(r2.v, xs, "0") }, { label: "\\text{quotient}", signs: sp, cells: xs.map(x => (Math.abs(x - r2.v) < 1e-12 ? "‖" : "0")) }]), M("S=" + ivTex(parseIntervals(ans))) + "."] };
  },
});

sk({
  id: "c2-methode", ch: 2, ref: 7, title: "Choisir la bonne méthode", target: 5,
  learn: L({
    idea: "Avant de calculer, regarde la <b>forme</b> de l'équation : c'est elle qui dit quelle méthode utiliser.",
    rule: "Pas de " + M("x^2") + " → isoler x. Produit = 0 → produit nul. " + M("x^2=k") + " → racine ±√k. " + M("ax^2+bx+c=0") + " → Δ. " + M("x^4") + " ou " + M("e^{2x}") + " avec " + M("e^x") + " → changement de variable. " + M("e^{\\ldots}=k") + " ou " + M("\\ln(\\ldots)=k") + " → appliquer ln ou exp.",
    steps: ["Tout d'un côté ?", "Déjà factorisé ?", "Quel est le plus grand exposant ?", "Y a-t-il exp ou ln ?"],
  }),
  gen() {
    const M0 = ["Isoler x (1er degré)", "Produit nul", "Discriminant Δ", "Isoler le carré : x² = k", "Changement de variable", "Appliquer ln (ou exp)"];
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
    const expl = ["Pas de carré : on regroupe et on isole x.", "C'est déjà un produit égal à 0.", "Trinôme complet " + M("ax^2+bx+c") + " : on calcule Δ.", "Un carré égal à un nombre : on prend ±√k.", "On pose " + M("X=x^2") + " (ou " + M("X=e^x") + ") pour obtenir un trinôme.", "On applique ln (ou exp) des deux côtés."];
    return { q: "Quelle méthode utiliser pour résoudre " + M(eq) + " ?", type: "choice", opts: order.map(i => M0[i]), a: order.indexOf(k), atex: "", sol: [expl[k]] };
  },
});

/* =========================== ESCALE 3 =========================== */
const TRIG = { // angle en multiples de π/12 → [cos, sin] en chaînes (entrée) et TeX
  0: ["1", "0"], 2: ["sqrt(3)/2", "1/2"], 3: ["sqrt(2)/2", "sqrt(2)/2"], 4: ["1/2", "sqrt(3)/2"], 6: ["0", "1"],
};
const TRIGT = { "1": "1", "0": "0", "sqrt(3)/2": "\\frac{\\sqrt3}{2}", "1/2": "\\frac12", "sqrt(2)/2": "\\frac{\\sqrt2}{2}" };
function trigOf(k12) { // k12 : angle = k12·π/12 (multiple de π/6 ou π/4)
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
  id: "c3-triangle", ch: 3, ref: 0, title: "Triangle rectangle : SOH-CAH-TOA",
  learn: L({
    rule: M("\\cos\\alpha=\\frac{\\text{adjacent}}{\\text{hypoténuse}}") + ", " + M("\\sin\\alpha=\\frac{\\text{opposé}}{\\text{hypoténuse}}") + ", " + M("\\tan\\alpha=\\frac{\\text{opposé}}{\\text{adjacent}}") + " (SOH-CAH-TOA). Pythagore : " + M("\\text{hyp}^2=a^2+b^2") + ".",
    steps: ["Repère l'hypoténuse (en face de l'angle droit).", "Repère le côté opposé et le côté adjacent à l'angle.", "Choisis la formule qui contient ce que tu connais et ce que tu cherches.", "Pour les angles 30°, 45°, 60°, utilise les valeurs exactes."],
    trap: "L'hypoténuse n'est jamais un côté « adjacent » dans la formule du cosinus : adjacent = l'autre côté qui touche l'angle.",
  }),
  gen() {
    const t = ri(1, 3);
    const trip = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]]); const [p, r, h] = trip;
    if (t === 1) {
      const f = pick(["cos", "sin", "tan"]); const val = f === "cos" ? q(r, h) : f === "sin" ? q(p, h) : q(p, r);
      return { q: "Le triangle ABC est rectangle en C, avec " + M("BC=" + p) + ", " + M("AC=" + r) + " et " + M("AB=" + h) + ". Calcule " + M("\\" + f + "(\\widehat{A})") + ".", type: "num", ans: val.plain(), form: ["irr"], atex: val.tex(),
        traps: [{ ans: (f === "cos" ? q(p, h) : f === "sin" ? q(r, h) : q(r, p)).plain(), m: "Tu as confondu côté opposé et côté adjacent à l'angle A." }],
        sol: ["Hypoténuse : AB = " + h + ". Côté opposé à A : BC = " + p + ". Côté adjacent à A : AC = " + r + ".", M("\\" + f + "(\\widehat A)=" + (f === "cos" ? frac("AC", "AB") + "=" + frac(r, h) : f === "sin" ? frac("BC", "AB") + "=" + frac(p, h) : frac("BC", "AC") + "=" + frac(p, r)) + (val.d !== (f === "tan" ? r : h) ? "=" + val.tex() : "")) + "."] };
    }
    if (t === 2) {
      const k = pick([1, 2, 3]); return { q: "Un triangle est rectangle ; ses deux côtés de l'angle droit mesurent " + M(p * k) + " et " + M(r * k) + ". Quelle est la longueur de l'hypoténuse ?", type: "num", ans: String(h * k), form: ["rat"], atex: String(h * k),
        sol: ["Pythagore : " + M("\\text{hyp}^2=" + p * k + "^2+" + r * k + "^2=" + (p * p + r * r) * k * k) + ".", M("\\text{hyp}=\\sqrt{" + (p * p + r * r) * k * k + "}=" + h * k) + "."] };
    }
    const ang = pick([30, 45, 60]), H = ri(2, 12) * 2; const f = pick(["opp", "adj"]);
    const tv = trigOf(ang / 15); const fac = f === "opp" ? tv.s : tv.c; const facT = f === "opp" ? tv.st : tv.ct;
    const ans = H + "*(" + fac + ")"; const val = parse(ans); void val;
    const k = H / 2; const res = fac === "1/2" ? String(k) : fac === "sqrt(3)/2" ? sqrtT(k, 3) : sqrtT(k, 2);
    return { q: "Dans un triangle rectangle, l'hypoténuse mesure " + M(H) + " et un angle aigu mesure " + M(ang + "^\\circ") + ". Donne la valeur exacte du côté " + (f === "opp" ? "opposé" : "adjacent") + " à cet angle.", type: "num", ans, form: ["sqrt"], atex: res,
      sol: [M((f === "opp" ? "\\sin" : "\\cos") + "(" + ang + "^\\circ)=" + frac("\\text{" + (f === "opp" ? "opposé" : "adjacent") + "}", "\\text{hyp}")) + ", donc côté = " + M(H + "\\times" + facT) + ".", "= " + M(res) + "."] };
  },
});

sk({
  id: "c3-radians", ch: 3, ref: 1, title: "Degrés et radians",
  learn: L({
    rule: M("180^\\circ=\\pi\\text{ rad}") + ". Degrés → radians : " + M("\\times\\frac{\\pi}{180}") + ". Radians → degrés : " + M("\\times\\frac{180}{\\pi}") + ".",
    steps: ["Écris la fraction " + M("\\frac{\\text{degrés}}{180}") + " et simplifie-la.", "Le résultat est cette fraction fois π.", "Dans l'autre sens, remplace π par 180°."],
    trap: "Simplifie la fraction : " + M("150^\\circ=\\frac{150}{180}\\pi=\\frac{5\\pi}{6}") + ".",
    input: "<code>5pi/6</code> ou <code>5π/6</code>.",
  }),
  gen() {
    const deg = pick([15, 30, 45, 60, 75, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360, 720, 36, 18, 72]) * (rnd() < 0.15 ? -1 : 1);
    const r = q(deg, 180);
    if (coin()) return { q: "Convertis " + M(deg + "^\\circ") + " en radians (valeur exacte).", type: "num", ans: piIn(r), form: ["pi"], atex: piT(r) + "\\text{ rad}",
      sol: [M(frac(deg, 180) + "=" + r.tex()) + ".", "Donc " + M(deg + "^\\circ=" + piT(r)) + " rad."] };
    return { q: "Convertis " + M(piT(r)) + " rad en degrés.", type: "num", ans: String(deg), form: ["rat"], allow: [], atex: deg + "^\\circ",
      sol: ["On remplace π par 180° : " + M(r.tex() + "\\times180=" + deg) + "°."] };
  },
});

sk({
  id: "c3-valeurs", ch: 3, ref: 2, title: "Valeurs remarquables sur le cercle",
  learn: L({
    rule: "Sur le cercle trigonométrique : " + M("\\cos") + " = abscisse, " + M("\\sin") + " = ordonnée." + D("\\begin{array}{c|ccccc}x&0&\\frac\\pi6&\\frac\\pi4&\\frac\\pi3&\\frac\\pi2\\\\\\hline\\cos x&1&\\frac{\\sqrt3}2&\\frac{\\sqrt2}2&\\frac12&0\\\\\\sin x&0&\\frac12&\\frac{\\sqrt2}2&\\frac{\\sqrt3}2&1\\end{array}") + "Pour un autre angle : on se ramène à l'angle de référence, puis on met le signe selon le quadrant.",
    steps: ["Place l'angle sur le cercle (quel quadrant ?).", "Trouve l'angle de référence (π/6, π/4 ou π/3).", "Prends la valeur du tableau.", "Mets le signe : cos > 0 à droite, sin > 0 en haut."],
    trap: M("\\cos\\frac{2\\pi}{3}=-\\frac12") + " : l'angle est à gauche, donc le cosinus est négatif.",
    input: "<code>sqrt(3)/2</code>, <code>-1/2</code>, <code>sqrt(3)</code>.",
  }),
  gen() {
    const k = pick(K12) * (rnd() < 0.2 ? -1 : 1); const f = pick(["cos", "sin", "cos", "sin", "tan"]);
    const tv = trigOf(k);
    if (f === "tan") {
      if (tv.c === "0") return this.gen();
      const ans = "(" + tv.s + ")/(" + tv.c + ")"; const v = constVal(parse(ans))[0];
      const tt = Math.abs(v) < 1e-9 ? "0" : (v < 0 ? "-" : "") + (Math.abs(Math.abs(v) - 1) < 1e-9 ? "1" : Math.abs(Math.abs(v) - Math.sqrt(3)) < 1e-9 ? "\\sqrt3" : "\\frac{\\sqrt3}{3}");
      return { q: "Donne la valeur exacte de " + M("\\tan\\left(" + piT(piK(k)) + "\\right)") + ".", type: "num", ans, form: ["sqrt"], atex: tt,
        sol: [M("\\tan x=\\frac{\\sin x}{\\cos x}") + ".", M("\\sin=" + tv.st) + " et " + M("\\cos=" + tv.ct) + ".", M("\\tan\\left(" + piT(piK(k)) + "\\right)=" + tt) + "."] };
    }
    const ans = f === "cos" ? tv.c : tv.s, at = f === "cos" ? tv.ct : tv.st, other = f === "cos" ? tv.s : tv.c;
    const traps = [];
    if (other !== ans && other.replace("-", "") !== ans.replace("-", "")) traps.push({ ans: other, m: "Tu as confondu cos et sin : cos = abscisse (horizontal), sin = ordonnée (vertical)." });
    return { q: "Donne la valeur exacte de " + M("\\" + f + "\\left(" + piT(piK(k)) + "\\right)") + ".", type: "num", ans, form: ["sqrt"], atex: at, traps,
      sol: ["L'angle " + M(piT(piK(k))) + " est dans le quadrant " + tv.quad + (tv.ref === 0 || tv.ref === 6 ? " (sur un axe)." : ", angle de référence " + M(piT(piK(tv.ref))) + "."), "Signe : " + (f === "cos" ? "cos > 0 à droite, < 0 à gauche." : "sin > 0 en haut, < 0 en bas."), M("\\" + f + "\\left(" + piT(piK(k)) + "\\right)=" + at) + "."] };
  },
});

sk({
  id: "c3-associes", ch: 3, ref: 2, title: "Angles associés", target: 5,
  learn: L({
    rule: D("\\cos(-x)=\\cos x\\quad\\sin(-x)=-\\sin x\\quad\\cos(\\pi-x)=-\\cos x\\quad\\sin(\\pi-x)=\\sin x") + D("\\cos(\\pi+x)=-\\cos x\\quad \\sin(\\pi+x)=-\\sin x\\quad \\cos\\left(\\tfrac\\pi2-x\\right)=\\sin x\\quad \\sin\\left(\\tfrac\\pi2-x\\right)=\\cos x"),
    steps: ["Dessine le cercle et place x (petit angle dans le 1er quadrant).", "Place l'angle demandé (symétrie).", "Lis si cos/sin changent de signe, ou s'échangent (avec π/2)."],
    trap: "Avec " + M("\\frac\\pi2") + ", cos et sin <b>s'échangent</b> ; avec π, ils gardent leur nom.",
  }),
  gen() {
    const L0 = [["\\cos(-x)", 0], ["\\sin(-x)", 3], ["\\cos(\\pi-x)", 1], ["\\sin(\\pi-x)", 2], ["\\cos(\\pi+x)", 1], ["\\sin(\\pi+x)", 3], ["\\cos\\left(\\frac\\pi2-x\\right)", 2], ["\\sin\\left(\\frac\\pi2-x\\right)", 0], ["\\cos\\left(x+\\frac\\pi2\\right)", 3], ["\\sin\\left(x+\\frac\\pi2\\right)", 0], ["\\cos(x+2\\pi)", 0], ["\\sin(x-\\pi)", 3]];
    const [e, k] = pick(L0); const O = ["\\cos x", "-\\cos x", "\\sin x", "-\\sin x"];
    const order = shuf([0, 1, 2, 3]);
    return { q: "Simplifie : " + M(e) + " =", type: "choice", opts: order.map(i => M(O[i])), a: order.indexOf(k), atex: O[k],
      sol: ["Place x puis " + M(e.replace(/\\(cos|sin)/, "")) + " sur le cercle : la symétrie donne " + M(e + "=" + O[k]) + ".", "Vérifie avec " + M("x=\\frac\\pi6") + " si tu hésites."] };
  },
});

sk({
  id: "c3-mesure-principale", ch: 3, ref: 2, title: "Mesure principale d'un angle",
  learn: L({
    rule: "Un angle ne change pas si on ajoute ou retire des tours complets (" + M("2\\pi") + "). La mesure principale est celle qui est dans " + M("]-\\pi\\,;\\,\\pi]") + ".",
    steps: ["Écris " + M("2\\pi") + " avec le même dénominateur : " + M("2\\pi=\\frac{6\\pi}{3}") + ".", "Retire (ou ajoute) " + M("2\\pi") + " autant de fois que nécessaire.", "Arrête-toi quand le résultat est entre −π (exclu) et π (inclus)."],
    trap: M("\\frac{17\\pi}{3}-\\frac{18\\pi}{3}=-\\frac{\\pi}{3}") + " (on retire 3 tours).",
  }),
  gen() {
    const d = pick([2, 3, 4, 6]); let k; do k = rnz(-40, 40); while (Math.abs(k) <= d || gcd(k, d) !== 1);
    let r = q(k, d); const tours = Math.round(r.v / 2); let m = r.sub(2 * tours); if (m.v <= -1) m = m.add(2); if (m.v > 1) m = m.sub(2);
    return { q: "Donne la mesure principale (dans " + M("]-\\pi\\,;\\,\\pi]") + ") de " + M(piT(r)) + ".", type: "num", ans: piIn(m), form: ["pi"], atex: piT(m),
      sol: [M("2\\pi=" + frac(2 * d + "\\pi", d)) + ".", M(piT(r) + (tours > 0 ? "-" : "+") + Math.abs(tours) + "\\times2\\pi=" + piT(r) + (tours > 0 ? "-" : "+") + frac(Math.abs(2 * tours * d) + "\\pi", d) + "=" + piT(m)) + "."] };
  },
});

sk({
  id: "c3-trouver-angle", ch: 3, ref: 3, title: "Trouver un angle avec cos et sin",
  learn: L({
    rule: "Le cosinus seul ne suffit pas : " + M("\\cos\\frac\\pi3=\\cos\\left(-\\frac\\pi3\\right)=\\frac12") + ". Il faut aussi le <b>signe du sinus</b> (haut ou bas).",
    steps: ["Avec la valeur absolue, trouve l'angle de référence dans le tableau.", "Signe du cos → droite ou gauche. Signe du sin → haut ou bas.", "Déduis l'angle dans " + M("]-\\pi\\,;\\,\\pi]") + "."],
    trap: "Un angle « en bas » est négatif dans " + M("]-\\pi\\,;\\,\\pi]") + ".",
  }),
  gen() {
    const k = pick(K12.filter(v => v !== 0)); let kk = k > 12 ? k - 24 : k; const tv = trigOf(kk);
    return { q: "Trouve " + M("\\theta\\in\\left]-\\pi\\,;\\,\\pi\\right]") + " tel que " + M("\\cos\\theta=" + tv.ct) + " et " + M("\\sin\\theta=" + tv.st) + ".", type: "num", ans: piIn(piK(kk)), form: ["pi"], atex: "\\theta=" + piT(piK(kk)),
      traps: tv.s === "0" ? [] : [{ ans: piIn(piK(-kk)), m: "Regarde le signe du sinus : il dit si l'angle est en haut (positif) ou en bas (négatif)." }],
      sol: ["Angle de référence : " + M(tv.ref ? piT(piK(tv.ref)) : "0") + ".", "cos " + (tv.c.startsWith("-") ? "< 0 → à gauche" : tv.c === "0" ? "= 0 → sur l'axe vertical" : "> 0 → à droite") + " ; sin " + (tv.s.startsWith("-") ? "< 0 → en bas" : tv.s === "0" ? "= 0 → sur l'axe horizontal" : "> 0 → en haut") + ".", M("\\theta=" + piT(piK(kk))) + "."] };
  },
});

sk({
  id: "c3-pythagore-trig", ch: 3, ref: 2, title: "cos² + sin² = 1",
  learn: L({
    rule: "Pour tout x : " + M("\\cos^2x+\\sin^2x=1") + ". Donc " + M("\\cos x=\\pm\\sqrt{1-\\sin^2x}") + " : le signe dépend du quadrant.",
    steps: ["Calcule " + M("1-\\sin^2x") + " (ou " + M("1-\\cos^2x") + ").", "Prends la racine carrée.", "Choisis le signe grâce à l'intervalle donné."],
    trap: "Oublier le signe : si x est entre " + M("\\frac\\pi2") + " et π, le cosinus est <b>négatif</b>.",
  }),
  gen() {
    const [p, r, h] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]); const given = pick(["sin", "cos"]);
    const quad = ri(1, 4); const iv = { 1: "\\left]0\\,;\\,\\frac\\pi2\\right[", 2: "\\left]\\frac\\pi2\\,;\\,\\pi\\right[", 3: "\\left]-\\pi\\,;\\,-\\frac\\pi2\\right[", 4: "\\left]-\\frac\\pi2\\,;\\,0\\right[" }[quad];
    const cs = quad === 1 || quad === 4 ? 1 : -1, ss = quad <= 2 ? 1 : -1;
    const gv = given === "sin" ? q(ss * p, h) : q(cs * p, h); const want = given === "sin" ? "cos" : "sin"; const wv = q((given === "sin" ? cs : ss) * r, h);
    return { q: "On sait que " + M("\\" + given + " x=" + gv.tex()) + " et " + M("x\\in" + iv) + ". Calcule " + M("\\" + want + " x") + ".", type: "num", ans: wv.plain(), form: ["irr"], atex: wv.tex(),
      traps: [{ ans: wv.neg().plain(), m: "Attention au signe : regarde dans quel quadrant se trouve x." }],
      sol: [M("\\" + want + "^2x=1-" + pr(gv.tex()) + "^2=1-" + frac(p * p, h * h) + "=" + frac(r * r, h * h)) + ".", M("\\" + want + " x=\\pm" + frac(r, h)) + ".", "Pour " + M("x\\in" + iv) + ", " + M("\\" + want + " x") + " est " + ((given === "sin" ? cs : ss) > 0 ? "positif" : "négatif") + " : " + M("\\" + want + " x=" + wv.tex()) + "."] };
  },
});

sk({
  id: "c3-equations", ch: 3, ref: 4, title: "Équations cos x = a et sin x = a",
  learn: L({
    rule: M("\\cos x=\\cos\\alpha\\iff x=\\alpha\\text{ ou }x=-\\alpha") + " (à 2π près). " + M("\\sin x=\\sin\\alpha\\iff x=\\alpha\\text{ ou }x=\\pi-\\alpha") + " (à 2π près).",
    steps: ["Trouve un angle α du tableau qui a la bonne valeur.", "Écris la deuxième solution (symétrie : −α pour cos, π − α pour sin).", "Ramène chaque solution dans l'intervalle demandé (ajoute ou retire 2π)."],
    trap: "Il y a presque toujours <b>deux</b> solutions sur un tour.",
    input: "<code>pi/3 ; 5pi/3</code>.",
  }),
  gen() {
    const f = pick(["cos", "sin"]); const k = pick([0, 2, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22]); const tv = trigOf(k);
    const val = f === "cos" ? tv.c : tv.s, valT = f === "cos" ? tv.ct : tv.st;
    const range = pick(["02pi", "mpipi"]);
    const sols = []; K12.forEach(kk => { const t2 = trigOf(kk); if ((f === "cos" ? t2.c : t2.s) === val) sols.push(kk); });
    let ks = sols.map(kk => (range === "02pi" ? kk : kk > 12 ? kk - 24 : kk)).sort((a, b) => a - b);
    const ivt = range === "02pi" ? "\\left[0\\,;\\,2\\pi\\right[" : "\\left]-\\pi\\,;\\,\\pi\\right]";
    return { q: "Résous dans " + M(ivt) + " : " + M("\\" + f + " x=" + valT) + ".", type: "set", ans: ks.map(kk => piIn(piK(kk))), form: ["pi"], atex: setTex(ks.map(kk => piT(piK(kk)))),
      traps: ks.length > 1 ? [{ ans: [piIn(piK(ks[0]))], m: "Il manque une solution : sur un tour, il y en a deux (symétrie)." }] : [],
      sol: ["Valeur du tableau : " + M("\\" + f + "\\left(" + piT(piK(sols[0] > 12 ? sols[0] - 24 : sols[0])) + "\\right)=" + valT) + ".", f === "cos" ? "Pour le cosinus, l'autre solution est symétrique par rapport à l'axe horizontal (angle opposé)." : "Pour le sinus, l'autre solution est symétrique par rapport à l'axe vertical (π − α).", "Dans " + M(ivt) + " : " + M(setTex(ks.map(kk => piT(piK(kk))))) + "."] };
  },
});
