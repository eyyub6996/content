/* =====================================================================
   COMPÉTENCES — escales 0 et 1
   Chaque compétence : une mini-leçon + un générateur d'exercices
   (énoncé, réponse attendue, correction détaillée, pièges fréquents).
   ===================================================================== */
const SKILLS = [];
function sk(o) { SKILLS.push(o); }
function L(o) {
  let h = "";
  if (o.idea) h += "<p>" + o.idea + "</p>";
  if (o.rule) h += '<div class="box remember"><div class="bt">À savoir par cœur</div>' + o.rule + "</div>";
  if (o.steps) h += '<div class="box method"><div class="bt">La méthode</div><ol>' + o.steps.map(s => "<li>" + s + "</li>").join("") + "</ol></div>";
  if (o.trap) h += '<div class="box warn"><div class="bt">Le piège</div>' + o.trap + "</div>";
  if (o.input) h += '<p class="muted small"><b>Pour écrire ta réponse :</b> ' + o.input + "</p>";
  return h;
}
const CHAPTERS = [
  { n: 0, name: "Lire les maths", short: "Lire" },
  { n: 1, name: "Le calcul algébrique", short: "Calcul" },
  { n: 2, name: "Équations et inéquations", short: "Équations" },
  { n: 3, name: "Trigonométrie", short: "Trigo" },
  { n: 4, name: "Fonctions, exp et ln", short: "Fonctions" },
  { n: 5, name: "Dérivées", short: "Dérivées" },
  { n: 6, name: "Intégrales", short: "Intégrales" },
  { n: 7, name: "Vecteurs", short: "Vecteurs" },
  { n: 8, name: "Nombres complexes", short: "Complexes" },
];

/* ---------- utilitaires d'intervalles pour les générateurs ---------- */
function ivS(lo, hi, lc, rc) { const b = x => (x === Infinity ? "+inf" : x === -Infinity ? "-inf" : st(x)); return (lc ? "[" : "]") + b(lo) + ";" + b(hi) + (rc ? "]" : "["); }
function ivT(lo, hi, lc, rc) { const b = x => (x === Infinity ? "+\\infty" : x === -Infinity ? "-\\infty" : tx(x)); return (lc ? "\\left[" : "\\left]") + b(lo) + "\\,;\\," + b(hi) + (rc ? "\\right]" : "\\right["); }
const IV = (lo, hi, lc, rc) => ({ lo, hi, lc: lc && isFinite(lo), rc: rc && isFinite(hi) });
const ivv = x => (x instanceof Q ? x.v : x);

/* =========================== ESCALE 0 =========================== */
sk({
  id: "c0-signes", ch: 0, ref: 3, title: "La règle des signes",
  learn: L({
    idea: "Pour multiplier ou diviser des nombres relatifs, on traite <b>séparément</b> le signe et la valeur.",
    rule: "Compte les facteurs négatifs : <b>nombre pair → résultat positif</b>, <b>nombre impair → résultat négatif</b>." + D("(-3)\\times(-4)=12 \\qquad (-3)\\times 4=-12 \\qquad \\frac{-12}{-3}=4"),
    steps: ["Compte les nombres négatifs (facteurs et diviseurs).", "Pair → +, impair → −.", "Calcule avec les valeurs sans signe."],
    trap: "Le « − » d'une soustraction n'est pas un facteur : " + M("-3-4=-7") + " (pas de règle des signes ici).",
  }),
  gen() {
    const k = ri(2, 4), f = []; for (let i = 0; i < k; i++) f.push(rnz(-7, 7));
    if (!f.some(x => x < 0)) f[0] = -f[0];
    const prod = f.reduce((a, b) => a * b, 1);
    let div = null;
    if (coin()) { const c = [2, 3, 4, 5, 6].filter(d => prod % d === 0 && d !== Math.abs(prod)); if (c.length) div = pick(c) * sg(); }
    const val = div ? prod / div : prod;
    const tex = f.map(tp).join(" \\times ");
    const neg = f.filter(x => x < 0).length + (div && div < 0 ? 1 : 0);
    return {
      q: "Calcule : " + M(div ? frac(tex, tx(div)) : tex), type: "num", ans: String(val), form: ["rat"], atex: tx(val),
      traps: [{ ans: String(-val), m: "Erreur de signe : compte les nombres négatifs (pair → +, impair → −)." }],
      sol: ["Nombres négatifs : <b>" + neg + "</b> → " + (neg % 2 ? "impair, le résultat est <b>négatif</b>." : "pair, le résultat est <b>positif</b>."),
        "Sans les signes : " + M(f.map(Math.abs).join("\\times") + (div ? "\\div " + Math.abs(div) : "") + " = " + Math.abs(val)) + ".",
        "Résultat : " + M(tx(val)) + "."],
    };
  },
});

sk({
  id: "c0-puissances-signes", ch: 0, ref: 3, title: "Puissances et signes",
  learn: L({
    idea: "L'exposant s'applique <b>seulement</b> à ce qui est juste avant lui.",
    rule: M("(-3)^2=(-3)\\times(-3)=9") + " mais " + M("-3^2=-(3\\times3)=-9") + ".<br>Un nombre négatif à une puissance <b>paire</b> donne un résultat positif, à une puissance <b>impaire</b> un résultat négatif. " + M("(-1)^{n}=1") + " si n est pair, " + M("-1") + " si n est impair.",
    steps: ["Regarde s'il y a une parenthèse autour du nombre négatif.", "Sans parenthèse : calcule la puissance, puis mets le signe −.", "Avec parenthèse : le signe dépend de la parité de l'exposant."],
    trap: M("-2^4") + " vaut " + M("-16") + ", pas 16.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = ri(2, 5), n = a <= 3 ? ri(2, 5) : ri(2, 3), v = Math.pow(-a, n);
      return { q: "Calcule : " + M("(-" + a + ")^{" + n + "}"), type: "num", ans: String(v), form: ["rat"], atex: tx(v),
        traps: [{ ans: String(-v), m: "Erreur de signe : exposant " + (n % 2 ? "impair → résultat négatif." : "pair → résultat positif.") }],
        sol: ["La parenthèse contient le signe : on multiplie " + n + " fois " + M("-" + a) + ".", "Exposant " + (n % 2 ? "impair → négatif" : "pair → positif") + " ; " + M(a + "^{" + n + "}=" + Math.abs(v)) + ".", "Résultat : " + M(tx(v)) + "."] };
    }
    if (t === 2) {
      const a = ri(2, 6), n = pick([2, 2, 4]), v = -Math.pow(a, n);
      return { q: "Calcule : " + M("-" + a + "^{" + n + "}"), type: "num", ans: String(v), form: ["rat"], atex: tx(v),
        traps: [{ ans: String(-v), m: "Sans parenthèse, l'exposant ne s'applique qu'à " + a + " : " + M("-" + a + "^{" + n + "}=-(" + a + "^{" + n + "})") + "." }],
        sol: ["Pas de parenthèse : l'exposant ne concerne que " + a + ".", M("-" + a + "^{" + n + "}=-(" + a + "^{" + n + "})=-" + Math.abs(v)) + "."] };
    }
    if (t === 3) {
      const a = ri(2, 3), b = ri(2, 4), n = pick([2, 3]), m = n === 2 ? 3 : 2;
      const A = Math.pow(-a, n), B = Math.pow(-b, m), op = pick(["-", "+"]);
      const v = op === "-" ? A - B : A + B;
      return { q: "Calcule : " + M("(-" + a + ")^{" + n + "} " + op + " (-" + b + ")^{" + m + "}"), type: "num", ans: String(v), form: ["rat"], atex: tx(v),
        sol: [M("(-" + a + ")^{" + n + "}=" + A) + " (exposant " + (n % 2 ? "impair" : "pair") + ") et " + M("(-" + b + ")^{" + m + "}=" + B) + ".", M(tp(A) + " " + op + " " + tp(B) + " = " + v) + "."] };
    }
    const N = ri(11, 2099), s = pick([1, -1]), v = N % 2 ? -1 : 1;
    const base = s === 1 ? "(-1)" : "-1";
    const val = s === 1 ? v : -1;
    return { q: "Calcule : " + M(base + "^{" + N + "}"), type: "num", ans: String(val), form: ["rat"], atex: tx(val),
      sol: s === 1 ? [N + " est " + (N % 2 ? "impair" : "pair") + ", donc " + M("(-1)^{" + N + "}=" + v) + "."] : ["Pas de parenthèse : " + M("-1^{" + N + "}=-(1^{" + N + "})=-1") + ", quel que soit l'exposant."] };
  },
});

sk({
  id: "c0-priorites", ch: 0, ref: 4, title: "Les priorités de calcul",
  learn: L({
    rule: "Ordre : <b>1.</b> parenthèses → <b>2.</b> puissances → <b>3.</b> multiplications et divisions (de gauche à droite) → <b>4.</b> additions et soustractions (de gauche à droite).",
    steps: ["Repère les parenthèses et calcule-les d'abord.", "Calcule les puissances.", "Fais les × et ÷.", "Termine par les + et −, de gauche à droite.", "Réécris toute la ligne à chaque étape."],
    trap: M("2+3\\times4=14") + ", pas 20. On ne calcule pas « dans l'ordre de lecture ».",
  }),
  gen() {
    const t = ri(1, 5); let q, v, sol, traps = [];
    if (t === 1) {
      const a = ri(2, 15), b = ri(2, 9), c = ri(2, 9); v = a + b * c;
      q = a + " + " + b + " \\times " + c; sol = ["× avant + : " + M(b + "\\times" + c + "=" + b * c) + ".", M(a + "+" + b * c + "=" + v) + "."];
      traps.push({ ans: String((a + b) * c), m: "La multiplication passe avant l'addition." });
    } else if (t === 2) {
      const a = ri(5, 40), b = ri(2, 5), c = ri(1, 9), d = ri(1, 9); const e = c - d, f = e * e; v = a - b * f;
      q = a + " - " + b + " \\times (" + c + " - " + d + ")^2";
      sol = ["Parenthèses : " + M(c + "-" + d + "=" + e) + ".", "Puissance : " + M(tp(e) + "^2=" + f) + ".", "Multiplication : " + M(b + "\\times" + f + "=" + b * f) + ".", "Soustraction : " + M(a + "-" + b * f + "=" + v) + "."];
      traps.push({ ans: String((a - b) * f), m: "Tu as fait la soustraction avant la multiplication." });
    } else if (t === 3) {
      const a = ri(2, 9), b = ri(2, 9), d = ri(2, 6), k = ri(2, 9), c = d * k, e = ri(1, 20); v = a * b - k + e;
      q = a + " \\times " + b + " - " + c + " \\div " + d + " + " + e;
      sol = ["× et ÷ d'abord : " + M(a + "\\times" + b + "=" + a * b) + " et " + M(c + "\\div" + d + "=" + k) + ".", "Puis de gauche à droite : " + M(a * b + "-" + k + "+" + e + "=" + v) + "."];
      traps.push({ ans: String(a * b - k - e), m: "De gauche à droite : " + M("a-b+c=(a-b)+c") + ", pas " + M("a-(b+c)") + "." });
    } else if (t === 4) {
      const b = ri(2, 6), c = ri(2, 6), d = pick([2, 3, 4, 5]), quo = rnz(-6, 9), a = d * quo + b * c; v = quo;
      q = "(" + a + " - " + b + " \\times " + c + ") \\div " + d;
      sol = ["Dans la parenthèse, × d'abord : " + M(b + "\\times" + c + "=" + b * c) + ".", M(a + "-" + b * c + "=" + (a - b * c)) + ".", M(tp(a - b * c) + "\\div" + d + "=" + v) + "."];
    } else {
      const a = ri(1, 20), b = ri(1, 9), c = ri(1, 9), d = ri(2, 6); v = a - (b - c) * d;
      q = a + " - (" + b + " - " + c + ") \\times " + d;
      sol = ["Parenthèses : " + M(b + "-" + c + "=" + (b - c)) + ".", "Multiplication : " + M(tp(b - c) + "\\times" + d + "=" + (b - c) * d) + ".", M(a + "-" + tp((b - c) * d) + "=" + v) + "."];
      traps.push({ ans: String((a - (b - c)) * d), m: "La multiplication passe avant la soustraction." });
    }
    return { q: "Calcule : " + M(q), type: "num", ans: String(v), form: ["rat"], atex: tx(v), sol, traps };
  },
});

sk({
  id: "c0-intervalles", ch: 0, ref: 2, title: "Écrire un intervalle",
  learn: L({
    idea: "Un intervalle est un « morceau » de la droite des réels, sans trou.",
    rule: "<b>Crochet tourné vers le nombre</b> " + M("[\\,2") + " : 2 est <b>inclus</b> (≤ ou ≥).<br><b>Crochet tourné vers l'extérieur</b> " + M("]\\,2") + " : 2 est <b>exclu</b> (< ou >).<br>Du côté de " + M("\\pm\\infty") + ", le crochet est toujours ouvert." + D("-2<x\\le5 \\iff x\\in\\left]-2\\,;\\,5\\right] \\qquad x\\ge3 \\iff x\\in\\left[3\\,;\\,+\\infty\\right["),
    steps: ["Repère la plus petite et la plus grande valeur possibles.", "Pour chaque borne : ≤ ou ≥ → crochet fermé ; < ou > → crochet ouvert.", "Pas de limite d'un côté → ∞ avec crochet ouvert."],
    trap: "On écrit toujours la petite borne à gauche, et on sépare les bornes par un point-virgule.",
    input: "<code>]-2;5]</code> ou <code>[3;+inf[</code> (le bouton ∞ aide).",
  }),
  gen() {
    const a = ri(-9, 5), b = a + ri(1, 9);
    if (rnd() < 0.35) {
      const lc = coin(), rc = coin();
      const good = M(a + (lc ? "\\le" : "<") + " x " + (rc ? "\\le" : "<") + b);
      const opts = [[lc, rc], [!lc, rc], [lc, !rc], [!lc, !rc]].map(([l, r]) => M(a + (l ? "\\le" : "<") + " x " + (r ? "\\le" : "<") + b));
      const order = shuf([0, 1, 2, 3]);
      return { q: "L'écriture " + M("x\\in" + ivT(a, b, lc, rc)) + " signifie :", type: "choice", opts: order.map(i => opts[i]), a: order.indexOf(0), atex: good.slice(2, -2),
        sol: ["Crochet gauche " + (lc ? "tourné vers " + a + " : inclus (≤)." : "tourné vers l'extérieur : " + a + " exclu (<)."), "Crochet droit " + (rc ? "tourné vers " + b + " : inclus (≤)." : "tourné vers l'extérieur : " + b + " exclu (<)."), "Donc " + good + "."] };
    }
    const t = ri(1, 3);
    let lo, hi, lc, rc, cond;
    if (t === 1) { lo = a; hi = b; lc = coin(); rc = coin(); cond = a + (lc ? "\\le" : "<") + " x " + (rc ? "\\le" : "<") + b; }
    else if (t === 2) { lo = a; hi = Infinity; lc = coin(); rc = false; cond = "x " + (lc ? "\\ge" : ">") + " " + a; }
    else { lo = -Infinity; hi = b; lc = false; rc = coin(); cond = "x " + (rc ? "\\le" : "<") + " " + b; }
    return { q: "Écris sous forme d'intervalle l'ensemble des réels " + M("x") + " tels que " + M(cond) + ".", type: "interval", ans: ivS(lo, hi, lc, rc), atex: ivT(lo, hi, lc, rc),
      sol: [isFinite(lo) ? "Borne de gauche " + lo + " : " + (lc ? "≤ donc incluse → « [ »." : "< donc exclue → « ] »." ) : "Pas de limite à gauche : " + M("-\\infty") + " avec « ] ».",
        isFinite(hi) ? "Borne de droite " + hi + " : " + (rc ? "≤ donc incluse → « ] »." : "< donc exclue → « [ »." ) : "Pas de limite à droite : " + M("+\\infty") + " avec « [ ».",
        "Réponse : " + M(ivT(lo, hi, lc, rc)) + "."] };
  },
});

sk({
  id: "c0-inter-union", ch: 0, ref: 2, title: "Intersection et réunion",
  learn: L({
    rule: M("I\\cap J") + " (« I <b>inter</b> J ») : les nombres qui sont dans I <b>et</b> dans J (la partie commune).<br>" + M("I\\cup J") + " (« I <b>union</b> J ») : les nombres qui sont dans I <b>ou</b> dans J (tout ce qui est colorié).",
    steps: ["Dessine une droite graduée.", "Colorie I d'une couleur, J d'une autre.", "∩ : garde la zone coloriée deux fois. ∪ : garde tout.", "Pour chaque borne, reprends le crochet de l'intervalle d'où elle vient."],
    trap: "Si les deux intervalles ne se touchent pas, l'intersection est vide : " + M("\\varnothing") + ".",
    input: "<code>]1;3]</code>, <code>[-2;0[ U ]4;+inf[</code>, ou <code>vide</code>.",
  }),
  gen() {
    const mk = () => { const inf = rnd() < 0.3; if (inf) { return coin() ? IV(-Infinity, ri(-3, 6), false, coin()) : IV(ri(-6, 3), Infinity, coin(), false); } const lo = ri(-8, 4); return IV(lo, lo + ri(2, 8), coin(), coin()); };
    let I = mk(), J = mk(); let guard = 0;
    while ((I.lo === J.lo && I.hi === J.hi) && guard++ < 20) J = mk();
    const cap = rnd() < 0.55;
    const inter = () => {
      let lo, lc, hi, rc;
      if (I.lo > J.lo) { lo = I.lo; lc = I.lc; } else if (J.lo > I.lo) { lo = J.lo; lc = J.lc; } else { lo = I.lo; lc = I.lc && J.lc; }
      if (I.hi < J.hi) { hi = I.hi; rc = I.rc; } else if (J.hi < I.hi) { hi = J.hi; rc = J.rc; } else { hi = I.hi; rc = I.rc && J.rc; }
      if (lo > hi || (lo === hi && !(lc && rc))) return null;
      return IV(lo, hi, lc, rc);
    };
    const s = X => ivS(X.lo, X.hi, X.lc, X.rc), t = X => ivT(X.lo, X.hi, X.lc, X.rc);
    let ans, atex;
    if (cap) { const r = inter(); ans = r ? (r.lo === r.hi ? "{" + r.lo + "}" : s(r)) : "vide"; atex = r ? (r.lo === r.hi ? "\\{" + r.lo + "\\}" : t(r)) : "\\varnothing"; }
    else { ans = s(I) + " U " + s(J); atex = ivTex(parseIntervals(ans)); }
    return { q: "Soit " + M("I=" + t(I)) + " et " + M("J=" + t(J)) + ". Détermine " + M(cap ? "I\\cap J" : "I\\cup J") + ".", type: "interval", ans, atex,
      sol: ["Sur une droite graduée, colorie I puis J.", cap ? "L'intersection est la partie coloriée <b>deux fois</b>." : "La réunion est <b>tout</b> ce qui est colorié (au moins une fois).", "Chaque borne garde le crochet de l'intervalle dont elle vient.", "Réponse : " + M(atex) + "."] };
  },
});

sk({
  id: "c0-ensembles", ch: 0, ref: 1, title: "Les ensembles de nombres", target: 5,
  learn: L({
    rule: M("\\mathbb{N}") + " : entiers naturels 0, 1, 2…<br>" + M("\\mathbb{Z}") + " : entiers relatifs …, −2, −1, 0, 1…<br>" + M("\\mathbb{Q}") + " : quotients d'entiers (fractions), par exemple " + M("\\frac{3}{4}") + ", " + M("-0{,}25") + ", " + M("\\frac13") + ".<br>" + M("\\mathbb{R}") + " : tous les nombres de la droite, y compris " + M("\\sqrt2") + " et " + M("\\pi") + "." + D("\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{Q}\\subset\\mathbb{R}"),
    steps: ["Simplifie d'abord le nombre : " + M("\\sqrt{49}=7") + ", " + M("\\frac{12}{4}=3") + ".", "Entier positif → ℕ. Entier négatif → ℤ. Fraction qui ne tombe pas juste → ℚ. Racine qui ne tombe pas juste, π → ℝ."],
    trap: "Un nombre qui « a l'air » d'une fraction ou d'une racine peut être un entier : " + M("-\\frac{18}{6}=-3\\in\\mathbb{Z}") + ".",
  }),
  gen() {
    const pools = [
      ["\\sqrt{" + pick([4, 9, 16, 25, 36, 49, 64, 81]) + "}", 0], [String(ri(0, 40)), 0], ["\\frac{" + (() => { const d = ri(2, 6); return d * ri(1, 9) + "}{" + d; })() + "}", 0],
      [String(-ri(1, 40)), 1], ["-\\sqrt{" + pick([4, 9, 16, 25, 36]) + "}", 1], ["-\\frac{" + (() => { const d = ri(2, 6); return d * ri(1, 9) + "}{" + d; })() + "}", 1],
      ["\\frac{" + pick(["3}{4", "1}{3", "5}{7", "2}{9", "7}{8"]) + "}", 2], ["-0{,}" + pick(["25", "5", "125", "75"]), 2], [pick(["2{,}5", "1{,}75", "3{,}2"]), 2], ["-\\frac{" + pick(["7}{2", "5}{3", "11}{4"]) + "}", 2],
      ["\\sqrt{" + pick([2, 3, 5, 6, 7, 8, 10, 12]) + "}", 3], ["\\pi", 3], ["\\frac{\\sqrt{" + pick([2, 3]) + "}}{2}", 3], ["1+\\sqrt{" + pick([2, 3, 5]) + "}", 3],
    ];
    const [x, a] = pick(pools);
    const opts = ["\\mathbb{N}", "\\mathbb{Z}", "\\mathbb{Q}", "\\mathbb{R}"].map(M);
    const expl = ["C'est un entier positif (ou nul) : il est déjà dans ℕ.", "C'est un entier négatif : ℤ est le plus petit ensemble qui le contient.", "C'est une fraction qui ne tombe pas juste : ℚ.", "Il ne s'écrit pas comme une fraction d'entiers : ℝ."];
    return { q: "Quel est le plus petit ensemble qui contient " + M(x) + " ?", type: "choice", opts, a, atex: ["\\mathbb{N}", "\\mathbb{Z}", "\\mathbb{Q}", "\\mathbb{R}"][a], sol: [expl[a]], fixed: true };
  },
});

sk({
  id: "c0-logique", ch: 0, ref: 0, title: "Implication et équivalence", target: 6,
  learn: L({
    rule: M("A\\Rightarrow B") + " : « si A est vrai, alors B est vrai ».<br>" + M("A\\Leftrightarrow B") + " : A et B sont vrais en même temps (implication dans les deux sens).<br>Pour prouver qu'une implication est <b>fausse</b>, il suffit d'un <b>contre-exemple</b>.",
    steps: ["Lis la phrase « si …, alors … ».", "Cherche un contre-exemple (souvent un nombre négatif ou 0).", "Si tu n'en trouves pas et que tu sais l'expliquer : c'est vrai."],
    trap: M("x^2=9\\Rightarrow x=3") + " est faux : " + M("x=-3") + " est un contre-exemple.",
  }),
  gen() {
    const a = ri(2, 9), b = ri(1, 9);
    const L0 = [
      ["x=" + a + "\\;\\Rightarrow\\; x^2=" + a * a, 1, "Si x vaut " + a + ", alors " + M("x^2=" + a * a) + "."],
      ["x^2=" + a * a + "\\;\\Rightarrow\\; x=" + a, 0, "Contre-exemple : " + M("x=-" + a) + " donne aussi " + M("x^2=" + a * a) + "."],
      ["x^2=" + a * a + "\\;\\Leftrightarrow\\;(x=" + a + "\\text{ ou }x=-" + a + ")", 1, "Les deux sens sont vrais : les deux seules solutions sont " + a + " et −" + a + "."],
      ["x>" + a + "\\;\\Rightarrow\\; x>" + (a - 1), 1, "Tout nombre plus grand que " + a + " est plus grand que " + (a - 1) + "."],
      ["x>" + (a - 1) + "\\;\\Rightarrow\\; x>" + a, 0, "Contre-exemple : " + M("x=" + (a - 1) + "{,}5") + "."],
      ["x<" + a + "\\;\\Rightarrow\\; x^2<" + a * a, 0, "Contre-exemple : " + M("x=-10") + " : " + M("x<" + a) + " mais " + M("x^2=100") + "."],
      ["(x-" + a + ")(x+" + b + ")=0\\;\\Leftrightarrow\\;(x=" + a + "\\text{ ou }x=-" + b + ")", 1, "Un produit est nul si et seulement si un des facteurs est nul."],
      ["\\sqrt{x^2}=x \\text{ pour tout réel } x", 0, "Contre-exemple : " + M("x=-3") + " : " + M("\\sqrt{9}=3\\ne-3") + ". En fait " + M("\\sqrt{x^2}=|x|") + "."],
      ["x\\in\\mathbb{N}\\;\\Rightarrow\\; x\\in\\mathbb{Z}", 1, "Tout entier naturel est un entier relatif : " + M("\\mathbb{N}\\subset\\mathbb{Z}") + "."],
      ["x\\in\\mathbb{Q}\\;\\Rightarrow\\; x\\in\\mathbb{Z}", 0, "Contre-exemple : " + M("\\frac12\\in\\mathbb{Q}") + " n'est pas entier."],
      ["x^2=" + a + "x\\;\\Leftrightarrow\\; x=" + a, 0, M("x=0") + " est aussi solution : " + M("x^2-" + a + "x=x(x-" + a + ")") + "."],
      ["2x+" + b + "=" + (2 * a + b) + "\\;\\Leftrightarrow\\; x=" + a, 1, "On soustrait " + b + " puis on divise par 2 : chaque étape se fait dans les deux sens."],
    ];
    const [s, v, e] = pick(L0);
    return { q: "Vrai ou faux ? " + M(s), type: "choice", opts: ["Vrai", "Faux"], a: v ? 0 : 1, atex: v ? "\\text{Vrai}" : "\\text{Faux}", sol: [e], fixed: true };
  },
});

/* =========================== ESCALE 1 =========================== */
function fracT(n, d) { const x = q(n, d); return x.tex(); }
function coprimeNum(d, lo, hi) { let a; do a = rnz(lo, hi); while (gcd(a, d) !== 1); return a; }

sk({
  id: "c1-frac-add", ch: 1, ref: 0, title: "Additionner des fractions",
  learn: L({
    rule: "On additionne seulement des fractions qui ont le <b>même dénominateur</b> : " + M("\\frac ab+\\frac cb=\\frac{a+c}{b}") + ".",
    steps: ["Cherche le plus petit dénominateur commun (ppcm).", "Multiplie numérateur ET dénominateur pour obtenir ce dénominateur.", "Additionne (ou soustrais) les numérateurs, garde le dénominateur.", "Simplifie : divise en haut et en bas par le même nombre."],
    trap: M("\\frac12+\\frac13\\ne\\frac25") + ". On n'additionne <b>jamais</b> les dénominateurs.",
    input: "<code>7/12</code>, <code>-5/6</code>, <code>3</code>.",
  }),
  gen() {
    let b = ri(2, 12), d = ri(2, 12); while (d === b) d = ri(2, 12);
    const intFirst = rnd() < 0.2;
    const a = intFirst ? rnz(-5, 6) : coprimeNum(b, -9, 9), c = coprimeNum(d, 1, 9);
    const B = intFirst ? 1 : b;
    const op = pick(["+", "-"]);
    const A = q(a, B), Cc = q(c, d), r = op === "+" ? A.add(Cc) : A.sub(Cc);
    const Lc = lcm(B, d), m1 = Lc / B, m2 = Lc / d, num = a * m1 + (op === "+" ? 1 : -1) * c * m2;
    const left = intFirst ? String(a) : fracT(a, b);
    const sol = [
      "Dénominateur commun : " + M(Lc) + ".",
      M(left + " " + op + " " + frac(c, d) + " = " + frac(a * m1, Lc) + " " + op + " " + frac(c * m2, Lc) + " = " + frac(num, Lc)),
      (gcd(num, Lc) > 1 ? "On simplifie par " + gcd(num, Lc) + " : " : "Déjà irréductible : ") + M(r.tex()) + ".",
    ];
    const traps = [];
    if (!intFirst && (op === "+" ? b + d : b - d) !== 0) traps.push({ ans: q(op === "+" ? a + c : a - c, op === "+" ? b + d : b - d).plain(), m: "On n'additionne jamais les dénominateurs : mets d'abord les fractions au même dénominateur." });
    return { q: "Calcule et donne une fraction irréductible : " + M(left + " " + op + " " + frac(c, d)), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(), sol, traps };
  },
});

sk({
  id: "c1-frac-mul", ch: 1, ref: 0, title: "Multiplier et diviser des fractions",
  learn: L({
    rule: M("\\frac ab\\times\\frac cd=\\frac{a\\times c}{b\\times d}") + " et " + M("\\frac ab\\div\\frac cd=\\frac ab\\times\\frac dc") + " (on multiplie par l'<b>inverse</b>).",
    steps: ["Pour ÷ : remplace par × l'inverse de la 2e fraction.", "Simplifie en croix avant de multiplier (plus facile).", "Multiplie les numérateurs entre eux, les dénominateurs entre eux.", "Vérifie le signe et que la fraction est irréductible."],
    trap: "Pour multiplier, <b>pas besoin</b> de dénominateur commun. Pour diviser, on retourne la <b>deuxième</b> fraction seulement.",
  }),
  gen() {
    const b = ri(2, 9), d = ri(2, 12), a = coprimeNum(b, -9, 9), c = coprimeNum(d, 1, 12);
    const div = coin();
    const A = q(a, b), B = q(c, d), r = div ? A.div(B) : A.mul(B);
    const qq = M(fracT(a, b) + (div ? " \\div " : " \\times ") + frac(c, d));
    const sol = div ? ["Diviser par " + M(frac(c, d)) + ", c'est multiplier par son inverse " + M(frac(d, c)) + ".", M(fracT(a, b) + "\\times" + frac(d, c) + "=" + frac(tx(a * d), b * c) + "=" + r.tex()) + "."]
      : [M(fracT(a, b) + "\\times" + frac(c, d) + "=" + frac(tx(a * c), b * d)) + ".", "On simplifie : " + M(r.tex()) + "."];
    const traps = div ? [{ ans: A.mul(B).plain(), m: "Pour diviser, on multiplie par l'INVERSE de la deuxième fraction." }, { ans: B.inv().mul(A.inv()).plain(), m: "On ne retourne que la deuxième fraction." }] : [];
    return { q: "Calcule et donne une fraction irréductible : " + qq, type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(), sol, traps };
  },
});

sk({
  id: "c1-frac-etage", ch: 1, ref: 0, title: "Fractions à étages",
  learn: L({
    idea: "Une fraction « à étages » est une division : " + M("\\frac{A}{B}=A\\div B") + ".",
    steps: ["Calcule le numérateur A (une seule fraction).", "Calcule le dénominateur B (une seule fraction).", "Divise : " + M("\\frac AB=A\\times\\frac 1B") + " (multiplie par l'inverse de B).", "Simplifie."],
    trap: "Ne simplifie pas « en diagonale » entre les étages : calcule chaque étage d'abord.",
  }),
  gen() {
    let top, bot, qt;
    if (coin()) {
      const a = ri(1, 4), c = ri(2, 6), b = coprimeNum(c, 1, 5), d = ri(1, 4), f = ri(2, 6); let e = coprimeNum(f, 1, 5);
      top = q(a).add(q(b, c)); bot = q(d).sub(q(e, f)); if (bot.n === 0) { e = e + 1; bot = q(d).sub(q(e, f)); }
      qt = frac(a + "+" + frac(b, c), d + "-" + frac(e, f));
      const r = top.div(bot);
      return { q: "Calcule et donne une fraction irréductible : " + M(qt), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
        sol: ["En haut : " + M(a + "+" + frac(b, c) + "=" + top.tex()) + ".", "En bas : " + M(d + "-" + fracT(e, f) + "=" + bot.tex()) + ".", "On divise : " + M(frac(top.tex(), bot.tex()) + "=" + top.tex() + "\\times" + (bot.inv().tex()) + "=" + r.tex()) + "."] };
    }
    let a = ri(2, 9), b = ri(2, 9); while (b === a) b = ri(2, 9);
    top = q(1, a).add(q(1, b)); bot = q(1, a).sub(q(1, b)); const r = top.div(bot);
    return { q: "Calcule et donne une fraction irréductible : " + M(frac(frac(1, a) + "+" + frac(1, b), frac(1, a) + "-" + frac(1, b))), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
      sol: ["En haut : " + M(frac(1, a) + "+" + frac(1, b) + "=" + frac(b + "+" + a, a * b) + "=" + top.tex()) + ".", "En bas : " + M(frac(1, a) + "-" + frac(1, b) + "=" + frac(b + "-" + a, a * b) + "=" + bot.tex()) + ".", "On divise : " + M("=" + r.tex()) + " (les " + M(a * b) + " se simplifient)."] };
  },
});

sk({
  id: "c1-puiss-exposant", ch: 1, ref: 1, title: "Règles des puissances",
  learn: L({
    rule: D("a^m\\times a^n=a^{m+n}\\qquad \\frac{a^m}{a^n}=a^{m-n}\\qquad (a^m)^n=a^{m\\times n}") + D("a^0=1\\qquad a^{-n}=\\frac1{a^n}\\qquad (ab)^n=a^nb^n"),
    steps: ["Écris tout avec la même base (" + M("8=2^3") + ", " + M("9=3^2") + "…).", "Produit → on additionne les exposants ; quotient → on soustrait ; puissance de puissance → on multiplie.", "Fais le calcul des exposants avec soin (attention aux signes)."],
    trap: M("2^3\\times2^4=2^7") + " (et non " + M("2^{12}") + " ni " + M("4^7") + ").",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 4) {
      const A = pick([2, 3]); const big = A === 2 ? [[4, 2], [8, 3], [16, 4]] : [[9, 2], [27, 3]];
      const [B1, e1] = pick(big), [B2, e2] = pick(big); const m = rnz(-3, 4), n = rnz(-4, 5), p = rnz(-3, 3);
      const k = e1 * m + n - e2 * p;
      return { q: "On écrit " + M(frac(B1 + "^{" + m + "}\\times " + A + "^{" + n + "}", B2 + "^{" + p + "}")) + " sous la forme " + M(A + "^k") + ". Que vaut " + M("k") + " ?", type: "num", ans: String(k), form: ["rat"], atex: String(k),
        sol: ["Même base : " + M(B1 + "=" + A + "^{" + e1 + "}") + " et " + M(B2 + "=" + A + "^{" + e2 + "}") + ".", M(B1 + "^{" + m + "}=" + A + "^{" + e1 * m + "}") + ", " + M(B2 + "^{" + p + "}=" + A + "^{" + e2 * p + "}") + ".", M("k=" + e1 * m + (n < 0 ? "" : "+") + n + "-" + tp(e2 * p) + "=" + k) + "."] };
    }
    const A = pick([2, 3, 5, 10, 7]);
    const m = rnz(-5, 9), n = rnz(-5, 9), p = rnz(-4, 6);
    let tex, k, sol, traps = [];
    if (t === 1) { tex = frac(A + "^{" + m + "}\\times " + A + "^{" + n + "}", A + "^{" + p + "}"); k = m + n - p; sol = ["Produit : on additionne " + M(m + (n < 0 ? "" : "+") + n + "=" + (m + n)) + ".", "Quotient : on soustrait " + M((m + n) + "-" + tp(p) + "=" + k) + "."]; traps.push({ ans: String(m * n - p), m: "Pour un produit, on ADDITIONNE les exposants." }); }
    else if (t === 2) { const nn = ri(2, 4); tex = "(" + A + "^{" + m + "})^{" + nn + "}\\times " + A + "^{" + p + "}"; k = m * nn + p; sol = ["Puissance de puissance : on multiplie " + M(tp(m) + "\\times" + nn + "=" + m * nn) + ".", "Puis produit : " + M(m * nn + (p < 0 ? "" : "+") + p + "=" + k) + "."]; traps.push({ ans: String(m + nn + p), m: M("(a^m)^n=a^{m\\times n}") + " : on multiplie les exposants." }); }
    else { const nn = ri(2, 3); tex = frac(A + "^{" + m + "}", "(" + A + "^{" + n + "})^{" + nn + "}"); k = m - n * nn; sol = ["En bas : " + M("(" + A + "^{" + n + "})^{" + nn + "}=" + A + "^{" + n * nn + "}") + ".", "Quotient : " + M(m + "-" + tp(n * nn) + "=" + k) + "."]; }
    return { q: "On écrit " + M(tex) + " sous la forme " + M(A + "^k") + ". Que vaut " + M("k") + " ?", type: "num", ans: String(k), form: ["rat"], atex: String(k), sol, traps };
  },
});

sk({
  id: "c1-puiss-lettres", ch: 1, ref: 1, title: "Puissances avec des lettres",
  learn: L({
    rule: "Mêmes règles qu'avec les nombres, et le coefficient suit aussi : " + M("(3x^2)^3=3^3\\,(x^2)^3=27x^6") + ".",
    steps: ["Sépare les nombres et les puissances de x.", "Calcule le nombre.", "Calcule l'exposant de x avec les règles.", "Écris le résultat : un nombre × " + M("x^{k}") + "."],
    trap: M("(2x^3)^2=4x^6") + " et pas " + M("2x^6") + " : le 2 aussi est au carré.",
    input: "<code>4x^6</code>, <code>3x^(-2)</code>, <code>x^5/2</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = ri(2, 3), m = ri(1, 4), n = ri(2, 3), c = Math.pow(a, n) * sg(), aa = c < 0 ? -a : a;
      if (n % 2 === 0 && aa < 0) return this.gen();
      const k = m * n;
      return { q: "Simplifie : " + M("(" + aa + "x^{" + m + "})^{" + n + "}"), type: "expr", ans: c + "*x^" + k, form: ["mono"], dom: [0.4, 1.9], atex: tx(c) + "x^{" + k + "}",
        traps: [{ ans: aa + "*x^" + k, m: "Le coefficient aussi est élevé à la puissance " + n + "." }, { ans: c + "*x^" + (m + n), m: M("(x^m)^n=x^{m\\times n}") + " : on multiplie les exposants." }],
        sol: [M("(" + aa + "x^{" + m + "})^{" + n + "}=" + tp(aa) + "^{" + n + "}\\times(x^{" + m + "})^{" + n + "}") + ".", M("=" + c + "\\,x^{" + m + "\\times" + n + "}=" + tx(c) + "x^{" + k + "}") + "."] };
    }
    if (t === 2) {
      const a = ri(2, 3), n = 2, m = ri(1, 3), p = rnz(-3, 3), qq = ri(1, 4);
      const A2 = a * a, b = pick([1, 2, a, A2].filter(v => A2 % v === 0)), c = A2 / b, k = m * n + p - qq;
      return { q: "Simplifie : " + M(frac("(" + a + "x^{" + m + "})^{2}\\times x^{" + p + "}", (b === 1 ? "" : b) + "x^{" + qq + "}")), type: "expr", ans: c + "*x^(" + k + ")", form: ["mono"], dom: [0.4, 1.9], atex: (c === 1 ? "" : c) + "x^{" + k + "}",
        sol: ["Nombres : " + M(frac(a + "^2", b) + "=" + c) + ".", "Exposants : " + M(m + "\\times2" + (p < 0 ? "" : "+") + p + "-" + qq + "=" + k) + ".", "Résultat : " + M((c === 1 ? "" : c) + "x^{" + k + "}") + (k < 0 ? " (on peut aussi écrire " + M(frac(c, "x^{" + -k + "}")) + ")." : ".")] };
    }
    const m = ri(1, 6), n = rnz(-3, 5), p = ri(1, 7), k = m + n - p;
    return { q: "Simplifie : " + M(frac("x^{" + m + "}\\times x^{" + n + "}", "x^{" + p + "}")), type: "expr", ans: "x^(" + k + ")", form: ["mono"], dom: [0.4, 1.9], atex: "x^{" + k + "}",
      traps: [{ ans: "x^(" + (m * n - p) + ")", m: "Produit de puissances : on additionne les exposants." }],
      sol: [M(m + (n < 0 ? "" : "+") + n + "-" + p + "=" + k) + ", donc " + M("x^{" + k + "}") + "."] };
  },
});

sk({
  id: "c1-puiss-10", ch: 1, ref: 1, title: "Puissances de 10 et notation scientifique",
  learn: L({
    rule: "Notation scientifique : " + M("a\\times10^n") + " avec " + M("1\\le a<10") + ". Par exemple " + M("0{,}00052=5{,}2\\times10^{-4}") + ".",
    steps: ["Regroupe les nombres d'un côté, les puissances de 10 de l'autre.", "Calcule chaque partie (règles des puissances).", "Si le nombre devant n'est pas entre 1 et 10, décale la virgule et corrige l'exposant : " + M("24\\times10^{3}=2{,}4\\times10^{4}") + "."],
    trap: "Décaler la virgule vers la gauche <b>augmente</b> l'exposant : " + M("0{,}6\\times10^{-2}=6\\times10^{-3}") + ".",
    input: "<code>6*10^-3</code> ou <code>2.4*10^4</code>.",
  }),
  gen() {
    const a = ri(1, 9), b = ri(2, 9), m = ri(-8, 8), n = ri(-8, 8);
    let mant, e = m + n, qt, sol;
    if (coin()) {
      mant = q(a * b); qt = "(" + a + "\\times10^{" + m + "})\\times(" + b + "\\times10^{" + n + "})";
      sol = ["On regroupe : " + M("(" + a + "\\times" + b + ")\\times10^{" + m + (n < 0 ? "" : "+") + n + "}=" + a * b + "\\times10^{" + e + "}") + "."];
    } else {
      const c = pick([2, 4, 5, 8]); mant = q(a * b, c); e = m + n; const p = ri(-6, 6); e = m + n - p;
      qt = frac("(" + a + "\\times10^{" + m + "})\\times(" + b + "\\times10^{" + n + "})", c + "\\times10^{" + p + "}");
      sol = ["Les nombres : " + M(frac(a + "\\times" + b, c) + "=" + fmtNum(mant.v)) + ".", "Les puissances : " + M("10^{" + m + (n < 0 ? "" : "+") + n + "-" + tp(p) + "}=10^{" + e + "}") + "."];
    }
    let v = mant.v; while (v >= 10) { v /= 10; e++; } while (v < 1) { v *= 10; e--; }
    v = Math.round(v * 1e6) / 1e6;
    sol.push("On ajuste pour avoir un nombre entre 1 et 10 : " + M(fmtNum(v) + "\\times10^{" + e + "}") + ".");
    return { q: "Calcule et donne le résultat en notation scientifique : " + M(qt), type: "num", ans: v + "*10^(" + e + ")", form: ["sci"], allow: [], atex: fmtNum(v) + "\\times10^{" + e + "}", sol };
  },
});

sk({
  id: "c1-racine-simplifier", ch: 1, ref: 2, title: "Simplifier une racine carrée",
  learn: L({
    rule: M("\\sqrt{a\\times b}=\\sqrt a\\times\\sqrt b") + " et " + M("\\sqrt{k^2}=k") + " (pour k ≥ 0). Donc " + M("\\sqrt{72}=\\sqrt{36\\times2}=6\\sqrt2") + ".",
    steps: ["Cherche le <b>plus grand carré parfait</b> qui divise le nombre : 4, 9, 16, 25, 36, 49, 64, 81, 100…", "Écris " + M("\\sqrt{N}=\\sqrt{k^2\\times m}=k\\sqrt m") + ".", "Vérifie qu'il ne reste plus de carré parfait sous la racine."],
    trap: M("\\sqrt{a+b}\\ne\\sqrt a+\\sqrt b") + " : la règle marche pour × et ÷, jamais pour + et −.",
    input: "<code>6sqrt(2)</code> ou <code>6√2</code>.",
  }),
  gen() {
    const m = pick([2, 3, 5, 6, 7, 10, 11, 13]), k = ri(2, m > 7 ? 5 : 9), N = k * k * m;
    const c = rnd() < 0.25 ? ri(2, 4) : 1;
    return { q: "Simplifie " + M((c > 1 ? c : "") + "\\sqrt{" + N + "}") + " sous la forme " + M("a\\sqrt b") + " (b le plus petit possible).", type: "num", ans: (c * k) + "*sqrt(" + m + ")", form: ["sqrt"], atex: sqrtT(c * k, m),
      sol: [M(N + "=" + k * k + "\\times" + m) + " et " + M(k * k + "=" + k + "^2") + " est un carré parfait.", M((c > 1 ? c : "") + "\\sqrt{" + N + "}=" + (c > 1 ? c + "\\times" : "") + "\\sqrt{" + k * k + "}\\times\\sqrt{" + m + "}=" + sqrtT(c * k, m)) + "."] };
  },
});

sk({
  id: "c1-racine-calculs", ch: 1, ref: 2, title: "Calculer avec des racines",
  learn: L({
    rule: M("\\sqrt a\\times\\sqrt b=\\sqrt{ab}") + ", " + M("(\\sqrt a)^2=a") + ", " + M("(a+\\sqrt b)(a-\\sqrt b)=a^2-b") + ". On additionne seulement des racines <b>identiques</b> : " + M("3\\sqrt2+5\\sqrt2=8\\sqrt2") + ".",
    steps: ["Simplifie chaque racine (sortir les carrés parfaits).", "Regroupe les termes avec la même racine, comme des « x ».", "Pour un produit, utilise les identités remarquables."],
    trap: M("\\sqrt 9+\\sqrt{16}=7") + " mais " + M("\\sqrt{25}=5") + " : on n'additionne pas sous la racine.",
  }),
  gen() {
    const t = ri(1, 5);
    if (t === 1) {
      const m = pick([2, 3, 5, 6, 7]); let p = ri(1, 3), r = ri(2, 4), s = ri(2, 5); const a = ri(1, 5), b = ri(1, 4), c = ri(1, 3);
      let tot = a * p + b * r - c * s; if (tot === 0) { s++; tot = a * p + b * r - c * s; }
      const term = (co, kk) => (co === 1 ? "" : co) + "\\sqrt{" + kk * kk * m + "}";
      return { q: "Écris sous la forme " + M("a\\sqrt b") + " : " + M(term(a, p) + "+" + term(b, r) + "-" + term(c, s)), type: "num", ans: tot + "*sqrt(" + m + ")", form: ["sqrt"], atex: sqrtT(tot, m),
        sol: ["On simplifie chaque racine : " + [[a, p], [b, r], [c, s]].map(([co, kk]) => M(term(co, kk) + "=" + sqrtT(co * kk, m))).join(", ") + ".", "On regroupe les " + M("\\sqrt{" + m + "}") + " : " + M("(" + a * p + "+" + b * r + "-" + c * s + ")\\sqrt{" + m + "}=" + sqrtT(tot, m)) + "."] };
    }
    if (t === 2) { const a = ri(2, 6), m = pick([2, 3, 5, 7]); return { q: "Calcule : " + M("(" + a + "\\sqrt{" + m + "})^2"), type: "num", ans: String(a * a * m), form: ["rat"], atex: String(a * a * m), traps: [{ ans: String(a * m), m: "Le " + a + " aussi est au carré : " + M(a + "^2=" + a * a) + "." }], sol: [M("(" + a + "\\sqrt{" + m + "})^2=" + a + "^2\\times(\\sqrt{" + m + "})^2=" + a * a + "\\times" + m + "=" + a * a * m) + "."] }; }
    if (t === 3) {
      const s = pick([2, 3, 5]); const pairs = [[2, 3], [2, 5], [3, 5], [1, 2], [1, 3], [2, 7], [3, 7], [1, 5]].filter(([u, w]) => u !== s && w !== s);
      const [u, w] = pick(pairs); const A = s * u, B = s * w;
      return { q: "Calcule et simplifie : " + M("\\sqrt{" + A + "}\\times\\sqrt{" + B + "}"), type: "num", ans: s + "*sqrt(" + u * w + ")", form: ["sqrt"], atex: sqrtT(s, u * w),
        sol: [M("\\sqrt{" + A + "}\\times\\sqrt{" + B + "}=\\sqrt{" + A * B + "}") + ".", M(A * B + "=" + s * s + "\\times" + u * w) + ", donc " + M("\\sqrt{" + A * B + "}=" + sqrtT(s, u * w)) + "."] };
    }
    if (t === 4) { const a = ri(2, 7), m = pick([2, 3, 5, 6, 7, 10, 11]); const v = a * a - m; return { q: "Calcule : " + M("(" + a + "+\\sqrt{" + m + "})(" + a + "-\\sqrt{" + m + "})"), type: "num", ans: String(v), form: ["rat"], atex: String(v), sol: ["Identité " + M("(a+b)(a-b)=a^2-b^2") + " : " + M(a + "^2-(\\sqrt{" + m + "})^2=" + a * a + "-" + m + "=" + v) + "."] }; }
    const a = ri(1, 5), m = pick([2, 3, 5, 6, 7]);
    return { q: "Développe et réduis : " + M("(\\sqrt{" + m + "}+" + a + ")^2"), type: "num", ans: (m + a * a) + "+" + 2 * a + "*sqrt(" + m + ")", form: ["sqrt"], atex: (m + a * a) + "+" + sqrtT(2 * a, m),
      traps: [{ ans: String(m + a * a), m: "Il manque le double produit : " + M("(a+b)^2=a^2+2ab+b^2") + "." }],
      sol: [M("(a+b)^2=a^2+2ab+b^2") + " avec " + M("a=\\sqrt{" + m + "}") + ", " + M("b=" + a) + ".", M("=" + m + "+2\\times" + a + "\\sqrt{" + m + "}+" + a * a + "=" + (m + a * a) + "+" + sqrtT(2 * a, m)) + "."] };
  },
});

sk({
  id: "c1-racine-conjugue", ch: 1, ref: 2, title: "Enlever une racine du dénominateur",
  learn: L({
    rule: M("\\frac{a}{\\sqrt m}=\\frac{a\\sqrt m}{m}") + " et, avec la quantité conjuguée, " + M("\\frac{a}{\\sqrt m+b}=\\frac{a(\\sqrt m-b)}{(\\sqrt m+b)(\\sqrt m-b)}=\\frac{a(\\sqrt m-b)}{m-b^2}") + ".",
    steps: ["Racine seule en bas : multiplie en haut et en bas par cette racine.", "Somme ou différence en bas : multiplie en haut et en bas par la <b>quantité conjuguée</b> (on change le signe du milieu).", "En bas, utilise " + M("(A+B)(A-B)=A^2-B^2") + " : la racine disparaît.", "Simplifie."],
    trap: "Multiplie <b>le numérateur ET le dénominateur</b> par la même chose, sinon la valeur change.",
    input: "<code>2sqrt(3)</code>, <code>(sqrt(5)-1)/2</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const m = pick([2, 3, 5, 6, 7]), a = ri(1, 4) * (coin() ? m : 1) * (coin() ? 1 : ri(1, 3));
      const r = q(a, m);
      return { q: "Écris sans racine au dénominateur : " + M(frac(a, "\\sqrt{" + m + "}")), type: "num", ans: r.plain() + "*sqrt(" + m + ")", form: ["noSqrtDen", "sqrt"], atex: r.eq(1) ? "\\sqrt{" + m + "}" : r.isInt() ? r.n + "\\sqrt{" + m + "}" : frac((r.n === 1 ? "" : r.n) + "\\sqrt{" + m + "}", r.d),
        sol: ["On multiplie en haut et en bas par " + M("\\sqrt{" + m + "}") + " : " + M(frac(a + "\\sqrt{" + m + "}", "\\sqrt{" + m + "}\\times\\sqrt{" + m + "}") + "=" + frac(a + "\\sqrt{" + m + "}", m)) + ".", "On simplifie la fraction " + M(frac(a, m)) + " si possible."] };
    }
    if (t === 2) {
      let m = pick([2, 3, 5, 6, 7, 10]), b = ri(1, 3); if (m === b * b) m++;
      const den = m - b * b, s = pick([1, -1]), a = rnd() < 0.5 ? Math.abs(den) * ri(1, 2) : ri(1, 5);
      const r = q(a, den);
      const ans = r.plain() + "*(sqrt(" + m + ")" + (s > 0 ? "-" : "+") + b + ")";
      return { q: "Écris sans racine au dénominateur : " + M(frac(a, "\\sqrt{" + m + "}" + (s > 0 ? "+" : "-") + b)), type: "num", ans, form: ["noSqrtDen", "sqrt"], atex: (r.eq(1) ? "" : r.eq(-1) ? "-" : r.tex()) + "\\left(\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b + "\\right)",
        sol: ["Quantité conjuguée : " + M("\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b) + ".", "En bas : " + M("(\\sqrt{" + m + "})^2-" + b + "^2=" + m + "-" + b * b + "=" + den) + ".", "Résultat : " + M(frac(a + "\\left(\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b + "\\right)", den)) + (r.isInt() ? " = " + M((r.eq(1) ? "" : r.eq(-1) ? "-" : r.n) + "\\left(\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b + "\\right)") : "") + "."] };
    }
    const [m, n] = pick([[3, 2], [5, 3], [5, 2], [7, 5], [6, 5], [7, 3], [3, 1]]); const den = m - n, a = den * ri(1, 3);
    const k = a / den; const sq = x => (x === 1 ? "1" : "\\sqrt{" + x + "}"), sqi = x => (x === 1 ? "1" : "sqrt(" + x + ")");
    return { q: "Écris sans racine au dénominateur : " + M(frac(a, sq(m) + "-" + sq(n))), type: "num", ans: k + "*(" + sqi(m) + "+" + sqi(n) + ")", form: ["noSqrtDen", "sqrt"], atex: (k === 1 ? "" : k) + (k === 1 ? sq(m) + "+" + sq(n) : "\\left(" + sq(m) + "+" + sq(n) + "\\right)"),
      sol: ["On multiplie par la conjuguée " + M(sq(m) + "+" + sq(n)) + ".", "En bas : " + M(m + "-" + n + "=" + den) + ".", M(frac(a + "(" + sq(m) + "+" + sq(n) + ")", den) + "=" + (k === 1 ? "" : k) + "\\left(" + sq(m) + "+" + sq(n) + "\\right)") + "."] };
  },
});

/* développer : ligne d'explication des produits */
function distLine(A, B) { // A, B : [coefs] (plus haut degré d'abord) → produits partiels en TeX
  const terms = [];
  const deg = (arr, i) => arr.length - 1 - i;
  A.forEach((a, i) => { if (Qv(a).n === 0) return; B.forEach((b, j) => { if (Qv(b).n === 0) return; const c = Qv(a).mul(b); const d = deg(A, i) + deg(B, j); terms.push(mono(c, d === 0 ? "" : d === 1 ? "x" : "x^{" + d + "}", terms.length === 0)); }); });
  return terms.join("");
}
sk({
  id: "c1-developper", ch: 1, ref: 3, title: "Développer un produit",
  learn: L({
    rule: M("k(a+b)=ka+kb") + " et " + M("(a+b)(c+d)=ac+ad+bc+bd") + " : chaque terme de la 1re parenthèse multiplie chaque terme de la 2e.",
    steps: ["Écris tous les produits (4 produits pour deux parenthèses de 2 termes).", "Fais attention aux signes : " + M("(-3)\\times(-2x)=+6x") + ".", "Regroupe les termes de même degré (les " + M("x^2") + ", les " + M("x") + ", les nombres).", "Range : " + M("ax^2+bx+c") + "."],
    trap: M("(x+3)(x+2)\\ne x^2+6") + " : on n'oublie pas les produits « croisés » " + M("2x") + " et " + M("3x") + ".",
    input: "<code>6x^2-7x+2</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = rnz(-5, 5), b = rnz(-9, 9), c = rnz(-5, 5), d = rnz(-9, 9);
      const P = pmul([a, b], [c, d]);
      return { q: "Développe et réduis : " + M(pr(linT(a, b)) + pr(linT(c, d))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
        traps: [{ ans: polyIn([a * c, 0, b * d]), m: "Il manque les produits croisés : 4 produits pour deux parenthèses de deux termes." }],
        sol: ["Les 4 produits : " + M(distLine([a, b], [c, d])) + ".", "On regroupe : " + M(polyT(P)) + "."] };
    }
    if (t === 2) {
      const k = rnz(-6, 6), a = rnz(-5, 5), b = rnz(-9, 9), m = rnz(-6, 6), c = rnz(-5, 5), d = rnz(-9, 9);
      const P = padd(pscale([a, b], k), pscale([c, d], m));
      if (Qv(P[0]).n === 0) return this.gen();
      return { q: "Développe et réduis : " + M((k === -1 ? "-" : k) + pr(linT(a, b)) + (m < 0 ? "-" : "+") + (Math.abs(m) === 1 ? "" : Math.abs(m)) + pr(linT(c, d))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
        sol: [M(polyT(pscale([a, b], k)) + (m < 0 ? "" : "+") + polyT(pscale([c, d], m))) + ".", "On regroupe : " + M(polyT(ptrim(P))) + "."] };
    }
    const a = rnz(-4, 4), b = rnz(-3, 3), c = rnz(-6, 6);
    const P = pmul([1, a], [1, b, c]);
    return { q: "Développe et réduis : " + M(pr(linT(1, a)) + pr(polyT([1, b, c]))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      sol: ["On distribue " + M("x") + " puis " + M(tx(a)) + " : " + M(distLine([1, a], [1, b, c])) + ".", "On regroupe : " + M(polyT(P)) + "."] };
  },
});

sk({
  id: "c1-identites", ch: 1, ref: 3, title: "Identités remarquables",
  learn: L({
    rule: D("(a+b)^2=a^2+2ab+b^2 \\qquad (a-b)^2=a^2-2ab+b^2 \\qquad (a+b)(a-b)=a^2-b^2"),
    steps: ["Repère a et b (a peut être " + M("3x") + ").", "Calcule " + M("a^2") + " (attention : " + M("(3x)^2=9x^2") + ").", "Calcule le double produit " + M("2ab") + ".", "Calcule " + M("b^2") + " et assemble."],
    trap: M("(x+5)^2\\ne x^2+25") + " : il manque " + M("2\\times x\\times5=10x") + ".",
  }),
  gen() {
    const a = ri(1, 5), b = ri(1, 9), t = ri(1, 3);
    const A = a === 1 ? "x" : a + "x", aT = a === 1 ? "x" : "(" + a + "x)";
    if (t === 3) {
      const P = [a * a, 0, -b * b];
      return { q: "Développe : " + M("(" + A + "+" + b + ")(" + A + "-" + b + ")"), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
        sol: [M("(a+b)(a-b)=a^2-b^2") + " avec " + M("a=" + A) + ", " + M("b=" + b) + ".", M(aT + "^2-" + b + "^2=" + polyT(P)) + "."] };
    }
    const s = t === 1 ? 1 : -1, P = [a * a, 2 * a * b * s, b * b];
    return { q: "Développe : " + M("(" + A + (s > 0 ? "+" : "-") + b + ")^2"), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      traps: [{ ans: polyIn([a * a, 0, b * b]), m: "Il manque le double produit " + M("2ab") + "." }, { ans: polyIn([a * a, 0, -b * b]), m: M("(a-b)^2\\ne a^2-b^2") + " : il y a un double produit, et " + M("b^2") + " est positif." }, { ans: polyIn([a * a, 2 * a * b * s, -b * b]), m: "Le dernier terme " + M("b^2") + " est toujours positif." }, { ans: polyIn([a, 2 * a * b * s, b * b]), m: M("(" + a + "x)^2=" + a * a + "x^2") + " : le coefficient aussi est au carré." }],
      sol: [M(s > 0 ? "(a+b)^2=a^2+2ab+b^2" : "(a-b)^2=a^2-2ab+b^2") + " avec " + M("a=" + A) + ", " + M("b=" + b) + ".", M("a^2=" + a * a + "x^2") + ", " + M("2ab=2\\times" + A + "\\times" + b + "=" + 2 * a * b + "x") + ", " + M("b^2=" + b * b) + ".", "Résultat : " + M(polyT(P)) + "."] };
  },
});

sk({
  id: "c1-developper-moins", ch: 1, ref: 3, title: "Développer avec un « − » devant",
  learn: L({
    rule: "Un signe − devant une parenthèse change le signe de <b>tous</b> les termes : " + M("-(x^2-3x+2)=-x^2+3x-2") + ".",
    steps: ["Développe chaque produit <b>entre crochets</b>, sans toucher au signe devant.", "Enlève les crochets : si un − les précède, change tous les signes.", "Regroupe et range."],
    trap: M("5-(x+2)^2") + " : on développe " + M("(x+2)^2=x^2+4x+4") + " d'abord, puis " + M("5-x^2-4x-4") + ".",
  }),
  gen() {
    const t = ri(1, 3); let A, B, qt, P;
    if (t === 1) { const a = rnz(-6, 6), b = rnz(-6, 6), c = rnz(-6, 6); A = pmul([1, a], [1, a]); B = pmul([1, b], [1, c]); qt = pr(linT(1, a)) + "^2-" + pr(linT(1, b)) + pr(linT(1, c)); }
    else if (t === 2) { const k = ri(1, 20), a = rnz(-4, 4), b = rnz(-7, 7); A = [k]; B = pmul([a, b], [a, b]); qt = k + "-" + pr(linT(a, b)) + "^2"; }
    else { const a = rnz(-3, 3), b = rnz(-6, 6), c = rnz(-3, 3), d = rnz(-6, 6), e = rnz(-3, 3), f = rnz(-6, 6), r = rnz(-5, 5); A = pmul([a, b], [c, d]); B = pmul([e, f], [1, r]); qt = pr(linT(a, b)) + pr(linT(c, d)) + "-" + pr(linT(e, f)) + pr(linT(1, r)); }
    P = ptrim(padd(A, pscale(B, -1)));
    if (P.length === 1 && Qv(P[0]).n === 0) return this.gen();
    const Bw = B.slice(); const lead = Bw.findIndex(x => Qv(x).n !== 0);
    const trapB = Bw.map((x, i) => (i === lead ? Qv(x).neg() : Qv(x)));
    const trapP = ptrim(padd(A, trapB));
    return { q: "Développe et réduis : " + M(qt), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      traps: [{ ans: polyIn(trapP), m: "Le « − » devant la parenthèse change le signe de TOUS ses termes, pas seulement du premier." }],
      sol: ["Premier morceau : " + M(polyT(A)) + ".", "Second morceau, entre crochets : " + M("\\left[" + polyT(B) + "\\right]") + ".", "On enlève les crochets en changeant tous les signes : " + M(polyT(A) + "-\\left[" + polyT(B) + "\\right]=" + polyT(P)) + "."] };
  },
});

sk({
  id: "c1-factoriser-commun", ch: 1, ref: 4, title: "Factoriser par un facteur commun",
  learn: L({
    rule: M("ka+kb=k(a+b)") + " : on repère ce qui est <b>commun à tous les termes</b> et on le sort.",
    steps: ["Repère le facteur commun (un nombre, " + M("x") + ", ou une parenthèse entière).", "Écris-le devant une grande parenthèse.", "Dans la parenthèse, écris ce qui reste de chaque terme.", "Réduis l'intérieur, puis vérifie en redéveloppant."],
    trap: "Avec un « − » : " + M("A\\cdot B-A\\cdot(C+D)=A\\,[B-C-D]") + " (le − s'applique à tout C + D).",
    input: "<code>3x(2x-3)</code>, <code>(x+1)(3x+2)</code>.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const g = ri(2, 6), p = ri(1, 5); let r = rnz(-9, 9); while (gcd(p, r) !== 1) r = rnz(-9, 9);
      const P = [g * p, g * r, 0];
      return { q: "Factorise : " + M(polyT(P)), type: "expr", ans: g + "x*(" + linIn(p, r) + ")", form: ["factored"], atex: g + "x" + pr(linT(p, r)),
        sol: ["Facteur commun : " + M(g + "x") + " (" + g + " divise " + g * p + " et " + Math.abs(g * r) + ", et " + M("x") + " est dans les deux termes).", M(polyT(P) + "=" + g + "x\\times" + (p === 1 ? "x" : p + "x") + (r < 0 ? "-" : "+") + g + "x\\times" + Math.abs(r) + "=" + g + "x" + pr(linT(p, r))) + "."] };
    }
    const p = ri(1, 3), qq = rnz(-7, 7), a = rnz(-4, 4), b = rnz(-8, 8); let c = rnz(-4, 4), d = rnz(-8, 8);
    const F = linT(p, qq), Fi = linIn(p, qq);
    let second, qt, trap = null, steps;
    if (t === 2) { if (a + c === 0) c = a + 1 === 0 ? 2 : c + 1; second = [a + c, b + d]; qt = pr(F) + pr(linT(a, b)) + "+" + pr(F) + pr(linT(c, d)); steps = "[" + linT(a, b) + "+" + linT(c, d) + "]"; }
    else if (t === 3) { if (a - c === 0) c = c + 1; second = [a - c, b - d]; qt = pr(F) + pr(linT(a, b)) + "-" + pr(F) + pr(linT(c, d)); steps = "[" + linT(a, b) + "-" + pr(linT(c, d)) + "]"; trap = [a - c, b + d]; }
    else { if (p - c === 0) c = c + 1; second = [p - c, qq - d]; qt = pr(F) + "^2-" + pr(F) + pr(linT(c, d)); steps = "[" + F + "-" + pr(linT(c, d)) + "]"; trap = [p - c, qq + d]; }
    if (second[1] === 0 && second[0] === 0) return this.gen();
    return { q: "Factorise : " + M(qt), type: "expr", ans: "(" + Fi + ")*(" + linIn(second[0], second[1]) + ")", form: ["factored"], atex: pr(F) + pr(linT(second[0], second[1])),
      traps: trap ? [{ ans: "(" + Fi + ")*(" + linIn(trap[0], trap[1]) + ")", m: "Le « − » s'applique à toute la parenthèse : " + M("-(" + linT(c, d) + ")=" + linT(-c, -d)) + "." }] : [],
      sol: ["Facteur commun : " + M(pr(F)) + ".", M(qt + "=" + pr(F) + steps) + ".", "On réduit le crochet : " + M(pr(F) + pr(linT(second[0], second[1]))) + "."] };
  },
});

sk({
  id: "c1-factoriser-identites", ch: 1, ref: 4, title: "Factoriser avec les identités",
  learn: L({
    rule: D("a^2-b^2=(a-b)(a+b)\\qquad a^2+2ab+b^2=(a+b)^2\\qquad a^2-2ab+b^2=(a-b)^2"),
    steps: ["Deux termes avec un « − » entre deux carrés → " + M("a^2-b^2") + ".", "Trois termes dont deux carrés → vérifie le double produit " + M("2ab") + ".", "Identifie a et b (" + M("9x^2=(3x)^2") + ", " + M("25=5^2") + ").", "Écris la forme factorisée et vérifie en développant."],
    trap: M("x^2+9") + " ne se factorise pas (c'est une <b>somme</b> de carrés).",
  }),
  gen() {
    const a = ri(1, 6); let b = ri(1, 10); while (gcd(a, b) !== 1) b = ri(1, 10);
    const A = a === 1 ? "x" : a + "x", t = ri(1, 4);
    if (t === 1) return { q: "Factorise : " + M(polyT([a * a, 0, -b * b])), type: "expr", ans: "(" + A + "-" + b + ")(" + A + "+" + b + ")", form: ["factored"], atex: pr(A + "-" + b) + pr(A + "+" + b),
      traps: [{ ans: "(" + A + "-" + b + ")^2", m: M("a^2-b^2=(a-b)(a+b)") + ", pas " + M("(a-b)^2") + "." }],
      sol: [M(a * a + "x^2=(" + A + ")^2") + " et " + M(b * b + "=" + b + "^2") + " : c'est " + M("a^2-b^2") + ".", M("=" + pr(A + "-" + b) + pr(A + "+" + b)) + "."] };
    if (t === 4) return { q: "Factorise : " + M(b * b + "-" + (a * a === 1 ? "" : a * a) + "x^2"), type: "expr", ans: "(" + b + "-" + A + ")(" + b + "+" + A + ")", form: ["factored"], atex: pr(b + "-" + A) + pr(b + "+" + A),
      sol: ["C'est " + M("a^2-b^2") + " avec " + M("a=" + b) + " et " + M("b=" + A) + ".", M("=" + pr(b + "-" + A) + pr(b + "+" + A)) + "."] };
    const s = t === 2 ? 1 : -1, P = [a * a, 2 * a * b * s, b * b];
    return { q: "Factorise : " + M(polyT(P)), type: "expr", ans: "(" + A + (s > 0 ? "+" : "-") + b + ")^2", form: ["factored"], atex: pr(A + (s > 0 ? "+" : "-") + b) + "^2",
      sol: ["Deux carrés : " + M(a * a + "x^2=(" + A + ")^2") + " et " + M(b * b + "=" + b + "^2") + ".", "Double produit : " + M("2\\times" + A + "\\times" + b + "=" + 2 * a * b + "x") + " ✔ (signe " + (s > 0 ? "+" : "−") + ").", "Donc " + M(polyT(P) + "=" + pr(A + (s > 0 ? "+" : "-") + b) + "^2") + "."] };
  },
});

sk({
  id: "c1-factoriser-diff", ch: 1, ref: 4, title: "Factoriser A² − B² avec des expressions",
  learn: L({
    rule: M("A^2-B^2=(A-B)(A+B)") + " marche aussi quand A et B sont des expressions : " + M("(x+3)^2-(2x-1)^2=[(x+3)-(2x-1)]\\,[(x+3)+(2x-1)]") + ".",
    steps: ["Identifie A et B (sans développer !).", "Écris " + M("[A-B][A+B]") + " en gardant les parenthèses de B.", "Dans " + M("A-B") + ", le − change tous les signes de B.", "Réduis chaque crochet."],
    trap: M("(x+3)-(2x-1)=-x+4") + " : le − devant " + M("(2x-1)") + " donne " + M("+1") + ".",
  }),
  gen() {
    let a, b, c, d, qt, Aexp, Bexp;
    if (rnd() < 0.7) {
      a = ri(1, 4); b = rnz(-6, 6); c = ri(1, 4); d = rnz(-6, 6); while (c === a) c = ri(1, 4);
      Aexp = [a, b]; Bexp = [c, d]; qt = pr(linT(a, b)) + "^2-" + pr(linT(c, d)) + "^2";
    } else { const k = ri(1, 9); a = ri(1, 3); b = rnz(-6, 6); Aexp = [0, k]; Bexp = [a, b]; qt = k * k + "-" + pr(linT(a, b)) + "^2"; }
    const f1 = [Aexp[0] - Bexp[0], Aexp[1] - Bexp[1]], f2 = [Aexp[0] + Bexp[0], Aexp[1] + Bexp[1]];
    if (f1[0] === 0 || f2[0] === 0) return this.gen();
    const At = Aexp[0] === 0 ? String(Aexp[1]) : linT(Aexp[0], Aexp[1]), Bt = linT(Bexp[0], Bexp[1]);
    return { q: "Factorise : " + M(qt), type: "expr", ans: "(" + linIn(f1[0], f1[1]) + ")(" + linIn(f2[0], f2[1]) + ")", form: ["factored"], atex: pr(linT(f1[0], f1[1])) + pr(linT(f2[0], f2[1])),
      traps: [{ ans: "(" + linIn(f1[0], Aexp[1] + Bexp[1]) + ")(" + linIn(f2[0], f2[1]) + ")", m: "Dans " + M("A-B") + ", le − s'applique à tout B : " + M("-(" + Bt + ")=" + linT(-Bexp[0], -Bexp[1])) + "." }],
      sol: [M("A=" + At) + " et " + M("B=" + Bt) + ".", M("[A-B][A+B]=\\left[" + At + "-" + pr(Bt) + "\\right]\\left[" + At + "+" + pr(Bt) + "\\right]") + ".", "On réduit : " + M(pr(linT(f1[0], f1[1])) + pr(linT(f2[0], f2[1]))) + "."] };
  },
});

sk({
  id: "c1-fraction-simplifier", ch: 1, ref: 5, title: "Simplifier une fraction avec des x",
  learn: L({
    rule: "On simplifie une fraction par un <b>facteur</b> commun au numérateur et au dénominateur, jamais par un terme d'une somme : " + M("\\frac{(x-2)(x+3)}{x(x+3)}=\\frac{x-2}{x}") + " (pour " + M("x\\ne-3") + ").",
    steps: ["Factorise le numérateur (facteur commun, identité remarquable…).", "Factorise le dénominateur.", "Barre les facteurs identiques en haut et en bas.", "Écris ce qui reste."],
    trap: M("\\frac{x+3}{x+5}") + " ne se simplifie pas : les x sont dans des <b>sommes</b>, pas en facteur.",
    input: "<code>(x-2)/x</code>.",
  }),
  gen() {
    let a = rnz(-6, 6), b = rnz(-6, 6); while (Math.abs(b) === Math.abs(a)) b = rnz(-6, 6);
    const t = ri(1, 5); const X = r => linT(1, r), Xi = r => linIn(1, r);
    let num, den, numF, denF, ans, atex, rem;
    if (t === 1) { num = polyT([1, 0, -a * a]); den = polyT([1, a, 0]); numF = pr(X(-a)) + pr(X(a)); denF = "x" + pr(X(a)); ans = "(" + Xi(-a) + ")/x"; atex = frac(X(-a), "x"); rem = -a; }
    else if (t === 2) { num = polyT([1, a + b, a * b]); den = polyT([1, 0, -b * b]); numF = pr(X(a)) + pr(X(b)); denF = pr(X(-b)) + pr(X(b)); ans = "(" + Xi(a) + ")/(" + Xi(-b) + ")"; atex = frac(X(a), X(-b)); rem = -b; }
    else if (t === 3) { const k = ri(2, 7); num = polyT([k, k * a]); den = polyT([1, 0, -a * a]); numF = k + pr(X(a)); denF = pr(X(-a)) + pr(X(a)); ans = k + "/(" + Xi(-a) + ")"; atex = frac(k, X(-a)); rem = -a; }
    else if (t === 4) { num = polyT([1, -2 * a, a * a]); den = polyT([1, 0, -a * a]); numF = pr(X(-a)) + "^2"; denF = pr(X(-a)) + pr(X(a)); ans = "(" + Xi(-a) + ")/(" + Xi(a) + ")"; atex = frac(X(-a), X(a)); rem = a; }
    else { num = polyT([1, 0, -a * a]); den = X(-a); numF = pr(X(-a)) + pr(X(a)); denF = pr(X(-a)); ans = Xi(a); atex = X(a); rem = a; }
    return { q: "Simplifie (pour les " + M("x") + " où elle existe) : " + M(frac(num, den)), type: "expr", ans, defined: [rem], atex,
      sol: ["Numérateur : " + M(num + "=" + numF) + ".", "Dénominateur : " + M(den + "=" + denF) + ".", "On simplifie par le facteur commun : " + M(frac(numF, denF) + "=" + atex) + "."] };
  },
});

sk({
  id: "c1-fraction-somme", ch: 1, ref: 5, title: "Réduire au même dénominateur (avec x)",
  learn: L({
    rule: M("\\frac{a}{x+p}+\\frac{b}{x+q}=\\frac{a(x+q)+b(x+p)}{(x+p)(x+q)}") + ".",
    steps: ["Dénominateur commun : le produit des dénominateurs (s'ils n'ont rien en commun).", "Multiplie chaque numérateur par ce qui manque à son dénominateur.", "Développe et réduis le numérateur seulement.", "Laisse le dénominateur factorisé."],
    trap: "Avec un « − » entre les fractions, mets le 2e numérateur entre parenthèses : " + M("-\\,b(x+p)=-bx-bp") + ".",
    input: "<code>(3x-1)/((x-1)(x+1))</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    let p = rnz(-5, 5), qq = rnz(-5, 5); while (qq === p) qq = rnz(-5, 5);
    const a = rnz(-6, 6), b = rnz(-6, 6), X = r => linT(1, r), Xi = r => linIn(1, r);
    if (t === 1) {
      const N = [a + b, a * qq + b * p]; if (N[0] === 0 && N[1] === 0) return this.gen();
      return { q: "Écris sous la forme d'une seule fraction : " + M(frac(a, X(p)) + (b < 0 ? "-" : "+") + frac(Math.abs(b), X(qq))), type: "expr", ans: "(" + linIn(N[0], N[1]) + ")/((" + Xi(p) + ")(" + Xi(qq) + "))", form: ["oneFrac"], atex: frac(linT(N[0], N[1]), pr(X(p)) + pr(X(qq))),
        sol: ["Dénominateur commun : " + M(pr(X(p)) + pr(X(qq))) + ".", "Numérateur : " + M(tx(a) + pr(X(qq)) + (b < 0 ? "-" : "+") + Math.abs(b) + pr(X(p)) + "=" + linT(N[0], N[1])) + ".", "Résultat : " + M(frac(linT(N[0], N[1]), pr(X(p)) + pr(X(qq)))) + "."] };
    }
    if (t === 2) {
      const A = ri(1, 6), B = ri(1, 6), N = [A - B, A * p]; if (N[0] === 0 && N[1] === 0) return this.gen();
      return { q: "Écris sous la forme d'une seule fraction : " + M(frac(A, "x") + "-" + frac(B, X(p))), type: "expr", ans: "(" + linIn(N[0], N[1]) + ")/(x(" + Xi(p) + "))", form: ["oneFrac"], atex: frac(linT(N[0], N[1]), "x" + pr(X(p))),
        sol: ["Dénominateur commun : " + M("x" + pr(X(p))) + ".", "Numérateur : " + M(A + pr(X(p)) + "-" + B + "x=" + linT(N[0], N[1])) + ".", "Résultat : " + M(frac(linT(N[0], N[1]), "x" + pr(X(p)))) + "."] };
    }
    const k = rnz(-4, 4); const N = [k, k * p + a];
    return { q: "Écris sous la forme d'une seule fraction : " + M(k + (a < 0 ? "-" : "+") + frac(Math.abs(a), X(p))), type: "expr", ans: "(" + linIn(N[0], N[1]) + ")/(" + Xi(p) + ")", form: ["oneFrac"], atex: frac(linT(N[0], N[1]), X(p)),
      sol: [M(k + "=" + frac(k + pr(X(p)), X(p))) + ".", "Numérateur : " + M(k + pr(X(p)) + sgnTex(a) + "=" + linT(N[0], N[1])) + ".", "Résultat : " + M(frac(linT(N[0], N[1]), X(p))) + "."] };
  },
});
