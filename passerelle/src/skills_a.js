/* =====================================================================
   LEZIONI — Tappa 1 (leggere la matematica) e Tappa 2 (il calcolo)
   ===================================================================== */

/* =========================== TAPPA 1 =========================== */
sk({
  id: "c0-signes", ch: 1, title: "La regola dei segni con più numeri",
  learn: L({
    idea: "Hai già visto che con due numeri: segni uguali → +, segni diversi → −. Con tanti numeri si fa ancora più in fretta: si <b>contano i numeri negativi</b>.",
    rule: "Numero di negativi <b>pari</b> (2, 4…) → risultato <b>positivo</b>. Numero di negativi <b>dispari</b> (1, 3…) → risultato <b>negativo</b>." + D("(-2)\\times(-3)\\times(-1)=-6\\quad\\text{(3 negativi: dispari)}"),
    steps: ["Conta i numeri negativi (anche quelli sotto la linea di frazione).", "Pari → +, dispari → −.", "Calcola il risultato senza segni e metti il segno davanti."],
    trap: "Il « − » di una sottrazione non conta: in " + M("-3-4") + " non si usa questa regola (fa −7).",
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
      q: "Calcola: " + M(div ? frac(tex, tx(div)) : tex), type: "num", ans: String(val), form: ["rat"], atex: tx(val),
      traps: [{ ans: String(-val), m: "Errore di segno: conta i numeri negativi (pari → +, dispari → −)." }],
      sol: ["Numeri negativi: <b>" + neg + "</b> → " + (neg % 2 ? "dispari, il risultato è <b>negativo</b>." : "pari, il risultato è <b>positivo</b>."),
        "Senza segni: " + M(f.map(Math.abs).join("\\times") + (div ? ":" + Math.abs(div) : "") + " = " + Math.abs(val)) + ".",
        "Risultato: " + M(tx(val)) + "."],
    };
  },
});

sk({
  id: "c0-puissances-signes", ch: 1, title: "Potenze e segni",
  learn: L({
    idea: "L'esponente si applica <b>solo</b> a quello che c'è subito prima. Se il meno è dentro la parentesi, viene moltiplicato anche lui; se è fuori, no.",
    rule: M("(-3)^2=(-3)\\times(-3)=9") + " ma " + M("-3^2=-(3\\times3)=-9") + ".<br>Un negativo elevato a esponente <b>pari</b> diventa positivo, a esponente <b>dispari</b> resta negativo.",
    steps: ["Guarda se il meno è dentro una parentesi.", "Senza parentesi: calcola la potenza, poi metti il meno davanti.", "Con la parentesi: il segno dipende dall'esponente (pari → +, dispari → −)."],
    trap: M("-2^4") + " fa " + M("-16") + ", non 16.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const a = ri(2, 5), n = a <= 3 ? ri(2, 5) : ri(2, 3), v = Math.pow(-a, n);
      return { q: "Calcola: " + M("(-" + a + ")^{" + n + "}"), type: "num", ans: String(v), form: ["rat"], atex: tx(v),
        traps: [{ ans: String(-v), m: "Errore di segno: esponente " + (n % 2 ? "dispari → risultato negativo." : "pari → risultato positivo.") }],
        sol: ["Il meno è dentro la parentesi: moltiplico " + n + " volte " + M("-" + a) + ".", "Esponente " + (n % 2 ? "dispari → negativo" : "pari → positivo") + " ; " + M(a + "^{" + n + "}=" + Math.abs(v)) + ".", "Risultato: " + M(tx(v)) + "."] };
    }
    if (t === 2) {
      const a = ri(2, 6), n = pick([2, 2, 4]), v = -Math.pow(a, n);
      return { q: "Calcola: " + M("-" + a + "^{" + n + "}"), type: "num", ans: String(v), form: ["rat"], atex: tx(v),
        traps: [{ ans: String(-v), m: "Senza parentesi, l'esponente riguarda solo il " + a + ": " + M("-" + a + "^{" + n + "}=-(" + a + "^{" + n + "})") + "." }],
        sol: ["Niente parentesi: l'esponente riguarda solo il " + a + ".", M("-" + a + "^{" + n + "}=-(" + a + "^{" + n + "})=-" + Math.abs(v)) + "."] };
    }
    if (t === 3) {
      const a = ri(2, 3), b = ri(2, 4), n = pick([2, 3]), m = n === 2 ? 3 : 2;
      const A = Math.pow(-a, n), B = Math.pow(-b, m), op = pick(["-", "+"]);
      const v = op === "-" ? A - B : A + B;
      return { q: "Calcola: " + M("(-" + a + ")^{" + n + "} " + op + " (-" + b + ")^{" + m + "}"), type: "num", ans: String(v), form: ["rat"], atex: tx(v),
        sol: [M("(-" + a + ")^{" + n + "}=" + A) + " (esponente " + (n % 2 ? "dispari" : "pari") + ") e " + M("(-" + b + ")^{" + m + "}=" + B) + ".", M(tp(A) + " " + op + " " + tp(B) + " = " + v) + "."] };
    }
    const N = ri(11, 2099), s = pick([1, -1]), v = N % 2 ? -1 : 1;
    const base = s === 1 ? "(-1)" : "-1";
    const val = s === 1 ? v : -1;
    return { q: "Calcola: " + M(base + "^{" + N + "}"), type: "num", ans: String(val), form: ["rat"], atex: tx(val),
      sol: s === 1 ? [N + " è " + (N % 2 ? "dispari" : "pari") + ", quindi " + M("(-1)^{" + N + "}=" + v) + "."] : ["Niente parentesi: " + M("-1^{" + N + "}=-(1^{" + N + "})=-1") + ", qualunque sia l'esponente."] };
  },
});

sk({
  id: "c0-priorites", ch: 1, title: "L'ordine delle operazioni (più lungo)",
  learn: L({
    idea: "Stessa regola della Tappa 0, ma con calcoli più lunghi. Il segreto: <b>riscrivere tutta la riga a ogni passo</b>, facendo una sola cosa alla volta.",
    rule: "1. Parentesi → 2. Potenze → 3. × e : (da sinistra a destra) → 4. + e − (da sinistra a destra).",
    steps: ["Calcola le parentesi.", "Calcola le potenze.", "Fai × e :.", "Finisci con + e −, da sinistra a destra.", "Riscrivi la riga intera dopo ogni passo."],
    trap: M("2+3\\times4=14") + ", non 20. E " + M("10-4+1=7") + " (da sinistra a destra), non 5.",
  }),
  gen() {
    const t = ri(1, 5); let q0, v, sol, traps = [];
    if (t === 1) {
      const a = ri(2, 15), b = ri(2, 9), c = ri(2, 9); v = a + b * c;
      q0 = a + " + " + b + " \\times " + c; sol = ["Prima la ×: " + M(b + "\\times" + c + "=" + b * c) + ".", M(a + "+" + b * c + "=" + v) + "."];
      traps.push({ ans: String((a + b) * c), m: "La moltiplicazione si fa prima dell'addizione." });
    } else if (t === 2) {
      const a = ri(5, 40), b = ri(2, 5), c = ri(1, 9), d = ri(1, 9); const e = c - d, f = e * e; v = a - b * f;
      q0 = a + " - " + b + " \\times (" + c + " - " + d + ")^2";
      sol = ["Parentesi: " + M(c + "-" + d + "=" + e) + ".", "Potenza: " + M(tp(e) + "^2=" + f) + ".", "Moltiplicazione: " + M(b + "\\times" + f + "=" + b * f) + ".", "Sottrazione: " + M(a + "-" + b * f + "=" + v) + "."];
      traps.push({ ans: String((a - b) * f), m: "Hai fatto la sottrazione prima della moltiplicazione." });
    } else if (t === 3) {
      const a = ri(2, 9), b = ri(2, 9), d = ri(2, 6), k = ri(2, 9), c = d * k, e = ri(1, 20); v = a * b - k + e;
      q0 = a + " \\times " + b + " - " + c + " : " + d + " + " + e;
      sol = ["Prima × e : → " + M(a + "\\times" + b + "=" + a * b) + " e " + M(c + ":" + d + "=" + k) + ".", "Poi da sinistra a destra: " + M(a * b + "-" + k + "+" + e + "=" + v) + "."];
      traps.push({ ans: String(a * b - k - e), m: "Da sinistra a destra: " + M("a-b+c=(a-b)+c") + ", non " + M("a-(b+c)") + "." });
    } else if (t === 4) {
      const b = ri(2, 6), c = ri(2, 6), d = pick([2, 3, 4, 5]), quo = rnz(-6, 9), a = d * quo + b * c; v = quo;
      q0 = "(" + a + " - " + b + " \\times " + c + ") : " + d;
      sol = ["Nella parentesi, prima la ×: " + M(b + "\\times" + c + "=" + b * c) + ".", M(a + "-" + b * c + "=" + (a - b * c)) + ".", M(tp(a - b * c) + ":" + d + "=" + v) + "."];
    } else {
      const a = ri(1, 20), b = ri(1, 9), c = ri(1, 9), d = ri(2, 6); v = a - (b - c) * d;
      q0 = a + " - (" + b + " - " + c + ") \\times " + d;
      sol = ["Parentesi: " + M(b + "-" + c + "=" + (b - c)) + ".", "Moltiplicazione: " + M(tp(b - c) + "\\times" + d + "=" + (b - c) * d) + ".", M(a + "-" + tp((b - c) * d) + "=" + v) + "."];
      traps.push({ ans: String((a - (b - c)) * d), m: "La moltiplicazione si fa prima della sottrazione." });
    }
    return { q: "Calcola: " + M(q0), type: "num", ans: String(v), form: ["rat"], atex: tx(v), sol, traps };
  },
});

sk({
  id: "c0-intervalles", ch: 1, title: "Scrivere un intervallo",
  learn: L({
    idea: "Un intervallo è un <b>pezzo della retta dei numeri</b>, senza buchi. Per esempio « tutti i numeri tra −2 e 5 ». Le parentesi quadre dicono se i numeri agli estremi sono compresi o no.",
    rule: "Parentesi <b>girata verso il numero</b> " + M("[\\,2") + ": 2 è <b>compreso</b> (≤ o ≥).<br>Parentesi <b>girata verso l'esterno</b> " + M("]\\,2") + ": 2 è <b>escluso</b> (< o >).<br>Dalla parte dell'infinito la parentesi è sempre aperta." + D("-2<x\\le5 \\iff x\\in\\left]-2\\,;\\,5\\right] \\qquad x\\ge3 \\iff x\\in\\left[3\\,;\\,+\\infty\\right["),
    steps: ["Trova il numero più piccolo e il più grande possibili.", "Per ciascuno: ≤ o ≥ → parentesi chiusa (verso il numero); < o > → parentesi aperta (girata fuori).", "Se da un lato non c'è limite: ∞ con parentesi aperta."],
    trap: "Il numero più piccolo va sempre a sinistra, e i due estremi si separano con il punto e virgola.",
    input: "<code>]-2;5]</code> oppure <code>[3;+inf[</code> (il tasto ∞ ti aiuta).",
  }),
  gen() {
    const a = ri(-9, 5), b = a + ri(1, 9);
    if (rnd() < 0.35) {
      const lc = coin(), rc = coin();
      const good = M(a + (lc ? "\\le" : "<") + " x " + (rc ? "\\le" : "<") + b);
      const opts = [[lc, rc], [!lc, rc], [lc, !rc], [!lc, !rc]].map(([l, r]) => M(a + (l ? "\\le" : "<") + " x " + (r ? "\\le" : "<") + b));
      const order = shuf([0, 1, 2, 3]);
      return { q: "La scrittura " + M("x\\in" + ivT(a, b, lc, rc)) + " vuol dire:", type: "choice", opts: order.map(i => opts[i]), a: order.indexOf(0), atex: good.slice(2, -2),
        sol: ["Parentesi a sinistra " + (lc ? "girata verso " + a + ": compreso (≤)." : "girata verso l'esterno: " + a + " escluso (<)."), "Parentesi a destra " + (rc ? "girata verso " + b + ": compreso (≤)." : "girata verso l'esterno: " + b + " escluso (<)."), "Quindi " + good + "."] };
    }
    const t = ri(1, 3);
    let lo, hi, lc, rc, cond;
    if (t === 1) { lo = a; hi = b; lc = coin(); rc = coin(); cond = a + (lc ? "\\le" : "<") + " x " + (rc ? "\\le" : "<") + b; }
    else if (t === 2) { lo = a; hi = Infinity; lc = coin(); rc = false; cond = "x " + (lc ? "\\ge" : ">") + " " + a; }
    else { lo = -Infinity; hi = b; lc = false; rc = coin(); cond = "x " + (rc ? "\\le" : "<") + " " + b; }
    return { q: "Scrivi come intervallo l'insieme dei numeri " + M("x") + " tali che " + M(cond) + ".", type: "interval", ans: ivS(lo, hi, lc, rc), atex: ivT(lo, hi, lc, rc),
      sol: [isFinite(lo) ? "Estremo sinistro " + lo + ": " + (lc ? "≤, quindi compreso → « [ »." : "<, quindi escluso → « ] ».") : "A sinistra non c'è limite: " + M("-\\infty") + " con « ] ».",
        isFinite(hi) ? "Estremo destro " + hi + ": " + (rc ? "≤, quindi compreso → « ] »." : "<, quindi escluso → « [ ».") : "A destra non c'è limite: " + M("+\\infty") + " con « [ ».",
        "Risposta: " + M(ivT(lo, hi, lc, rc)) + "."] };
  },
});

sk({
  id: "c0-inter-union", ch: 1, title: "Intersezione e unione di intervalli",
  learn: L({
    idea: "Hai due pezzi di retta, I e J. L'<b>intersezione</b> " + M("I\\cap J") + " è la parte che hanno <b>in comune</b>. L'<b>unione</b> " + M("I\\cup J") + " è <b>tutto quello che è colorato</b>, da uno o dall'altro.",
    rule: M("\\cap") + " = « e » (in tutti e due). " + M("\\cup") + " = « o » (in almeno uno).",
    steps: ["Disegna una retta dei numeri.", "Colora I con un colore e J con un altro.", "∩: tieni solo la zona colorata due volte. ∪: tieni tutto.", "Per ogni estremo, riprendi la parentesi dell'intervallo da cui viene."],
    trap: "Se i due intervalli non si toccano, l'intersezione è vuota: " + M("\\varnothing") + ".",
    input: "<code>]1;3]</code>, <code>[-2;0[ U ]4;+inf[</code>, oppure <code>vuoto</code>.",
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
    if (cap) { const r = inter(); ans = r ? (r.lo === r.hi ? "{" + r.lo + "}" : s(r)) : "vuoto"; atex = r ? (r.lo === r.hi ? "\\{" + r.lo + "\\}" : t(r)) : "\\varnothing"; }
    else { ans = s(I) + " U " + s(J); atex = ivTex(parseIntervals(ans)); }
    return { q: "Sia " + M("I=" + t(I)) + " e " + M("J=" + t(J)) + ". Trova " + M(cap ? "I\\cap J" : "I\\cup J") + ".", type: "interval", ans, atex,
      sol: ["Su una retta dei numeri, colora I e poi J.", cap ? "L'intersezione è la parte colorata <b>due volte</b>." : "L'unione è <b>tutto</b> quello che è colorato (almeno una volta).", "Ogni estremo tiene la parentesi dell'intervallo da cui viene.", "Risposta: " + M(atex) + "."] };
  },
});

sk({
  id: "c0-ensembles", ch: 1, title: "Gli insiemi di numeri", target: 5,
  learn: L({
    idea: "I numeri sono divisi in « famiglie », una dentro l'altra, come le bambole russe.",
    rule: M("\\mathbb{N}") + ": i naturali 0, 1, 2, 3…<br>" + M("\\mathbb{Z}") + ": gli interi, anche negativi …, −2, −1, 0, 1…<br>" + M("\\mathbb{Q}") + ": le frazioni, per esempio " + M("\\frac{3}{4}") + ", " + M("-0{,}25") + ", " + M("\\frac13") + ".<br>" + M("\\mathbb{R}") + ": tutti i numeri della retta, anche " + M("\\sqrt2") + " e " + M("\\pi") + "." + D("\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{Q}\\subset\\mathbb{R}"),
    steps: ["Prima semplifica il numero: " + M("\\sqrt{49}=7") + ", " + M("\\frac{12}{4}=3") + ".", "Intero positivo → ℕ. Intero negativo → ℤ. Frazione che non dà un intero → ℚ. Radice che non viene esatta, oppure π → ℝ."],
    trap: "Un numero che « sembra » una frazione o una radice può essere intero: " + M("-\\frac{18}{6}=-3\\in\\mathbb{Z}") + ".",
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
    const expl = ["È un intero positivo (o zero): sta già in ℕ.", "È un intero negativo: ℤ è l'insieme più piccolo che lo contiene.", "È una frazione che non dà un intero: ℚ.", "Non si può scrivere come frazione di interi: ℝ."];
    return { q: "Qual è l'insieme più piccolo che contiene " + M(x) + "?", type: "choice", opts, a, atex: "", sol: [expl[a]], fixed: true };
  },
});

sk({
  id: "c0-logique", ch: 1, title: "Implicazione ed equivalenza", target: 6,
  learn: L({
    idea: "La freccia " + M("\\Rightarrow") + " si legge « se… allora… ». Per esempio: « se piove, allora la strada è bagnata ». Il contrario non è per forza vero (la strada può essere bagnata perché qualcuno ha lavato la macchina).",
    rule: M("A\\Rightarrow B") + ": se A è vera, allora B è vera.<br>" + M("A\\Leftrightarrow B") + ": A e B sono vere insieme (la freccia vale nei due sensi).<br>Per dimostrare che una frase è <b>falsa</b> basta <b>un solo controesempio</b>.",
    steps: ["Leggi la frase come « se …, allora … ».", "Cerca un controesempio (spesso un numero negativo o lo 0).", "Se non lo trovi e sai spiegare perché, è vera."],
    trap: M("x^2=9\\Rightarrow x=3") + " è falsa: " + M("x=-3") + " è un controesempio.",
  }),
  gen() {
    const a = ri(2, 9), b = ri(1, 9);
    const L0 = [
      ["x=" + a + "\\;\\Rightarrow\\; x^2=" + a * a, 1, "Se x vale " + a + ", allora " + M("x^2=" + a * a) + "."],
      ["x^2=" + a * a + "\\;\\Rightarrow\\; x=" + a, 0, "Controesempio: " + M("x=-" + a) + " dà anche " + M("x^2=" + a * a) + "."],
      ["x^2=" + a * a + "\\;\\Leftrightarrow\\;(x=" + a + "\\text{ o }x=-" + a + ")", 1, "Vale nei due sensi: le sole soluzioni sono " + a + " e −" + a + "."],
      ["x>" + a + "\\;\\Rightarrow\\; x>" + (a - 1), 1, "Ogni numero più grande di " + a + " è più grande di " + (a - 1) + "."],
      ["x>" + (a - 1) + "\\;\\Rightarrow\\; x>" + a, 0, "Controesempio: " + M("x=" + (a - 1) + "{,}5") + "."],
      ["x<" + a + "\\;\\Rightarrow\\; x^2<" + a * a, 0, "Controesempio: " + M("x=-10") + ": " + M("x<" + a) + " ma " + M("x^2=100") + "."],
      ["(x-" + a + ")(x+" + b + ")=0\\;\\Leftrightarrow\\;(x=" + a + "\\text{ o }x=-" + b + ")", 1, "Un prodotto è zero se e solo se uno dei fattori è zero."],
      ["\\sqrt{x^2}=x \\text{ per ogni numero } x", 0, "Controesempio: " + M("x=-3") + ": " + M("\\sqrt{9}=3\\ne-3") + ". In realtà " + M("\\sqrt{x^2}=|x|") + "."],
      ["x\\in\\mathbb{N}\\;\\Rightarrow\\; x\\in\\mathbb{Z}", 1, "Ogni naturale è anche un intero: " + M("\\mathbb{N}\\subset\\mathbb{Z}") + "."],
      ["x\\in\\mathbb{Q}\\;\\Rightarrow\\; x\\in\\mathbb{Z}", 0, "Controesempio: " + M("\\frac12\\in\\mathbb{Q}") + " non è un intero."],
      ["x^2=" + a + "x\\;\\Leftrightarrow\\; x=" + a, 0, "Anche " + M("x=0") + " è soluzione: " + M("x^2-" + a + "x=x(x-" + a + ")") + "."],
      ["2x+" + b + "=" + (2 * a + b) + "\\;\\Leftrightarrow\\; x=" + a, 1, "Si toglie " + b + " e si divide per 2: ogni passo si può fare nei due sensi."],
    ];
    const [s, v, e] = pick(L0);
    return { q: "Vero o falso? " + M(s), type: "choice", opts: ["Vero", "Falso"], a: v ? 0 : 1, atex: "", sol: [e], fixed: true };
  },
});

/* =========================== TAPPA 2 =========================== */
function fracT(n, d) { const x = q(n, d); return x.tex(); }
function coprimeNum(d, lo, hi) { let a; do a = rnz(lo, hi); while (gcd(a, d) !== 1); return a; }

sk({
  id: "c1-frac-add", ch: 2, title: "Sommare frazioni con denominatori diversi",
  learn: L({
    idea: "Si possono sommare solo fette della <b>stessa grandezza</b>. Se i numeri sotto sono diversi (terzi e quarti), prima si tagliano le fette in modo che diventino uguali (dodicesimi), poi si contano.",
    rule: "1) Trova un <b>denominatore comune</b> (un numero che è multiplo dei due numeri sotto). 2) Trasforma le frazioni. 3) Somma i numeri sopra." + D("\\frac13+\\frac14=\\frac4{12}+\\frac3{12}=\\frac7{12}"),
    steps: ["Cerca il più piccolo numero che si divide per tutti e due i denominatori (per 3 e 4: 12).", "Per ogni frazione: per quanto moltiplico sotto per arrivare a 12? Moltiplico sopra per lo stesso numero.", "Ora il numero sotto è uguale: somma (o sottrai) quelli sopra.", "Semplifica se puoi."],
    trap: M("\\frac12+\\frac13\\ne\\frac25") + ". I numeri sotto non si sommano <b>mai</b>.",
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
      "Denominatore comune: " + M(Lc) + ".",
      M(left + " " + op + " " + frac(c, d) + " = " + frac(a * m1, Lc) + " " + op + " " + frac(c * m2, Lc) + " = " + frac(num, Lc)),
      (gcd(num, Lc) > 1 ? "Semplifico dividendo per " + gcd(num, Lc) + ": " : "Non si semplifica: ") + M(r.tex()) + ".",
    ];
    const traps = [];
    if (!intFirst && (op === "+" ? b + d : b - d) !== 0) traps.push({ ans: q(op === "+" ? a + c : a - c, op === "+" ? b + d : b - d).plain(), m: "I numeri sotto non si sommano mai: prima porta le frazioni allo stesso denominatore." });
    return { q: "Calcola e semplifica: " + M(left + " " + op + " " + frac(c, d)), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(), sol, traps };
  },
});

sk({
  id: "c1-frac-mul", ch: 2, title: "Moltiplicare e dividere frazioni",
  learn: L({
    idea: "Moltiplicare è facile: sopra per sopra, sotto per sotto. Dividere per una frazione vuol dire <b>moltiplicare per la frazione capovolta</b>.",
    rule: M("\\frac ab\\times\\frac cd=\\frac{a\\times c}{b\\times d}") + " e " + M("\\frac ab:\\frac cd=\\frac ab\\times\\frac dc") + ".",
    steps: ["Per « : » capovolgi la <b>seconda</b> frazione e cambia « : » in « × ».", "Se puoi, semplifica prima di moltiplicare (un numero sopra con uno sotto).", "Moltiplica sopra per sopra e sotto per sotto.", "Controlla il segno e semplifica."],
    trap: "Per moltiplicare <b>non</b> serve il denominatore comune. Per dividere si capovolge solo la seconda frazione.",
  }),
  gen() {
    const b = ri(2, 9), d = ri(2, 12), a = coprimeNum(b, -9, 9), c = coprimeNum(d, 1, 12);
    const div = coin();
    const A = q(a, b), B = q(c, d), r = div ? A.div(B) : A.mul(B);
    const qq = M(fracT(a, b) + (div ? " : " : " \\times ") + frac(c, d));
    const sol = div ? ["Dividere per " + M(frac(c, d)) + " vuol dire moltiplicare per la frazione capovolta " + M(frac(d, c)) + ".", M(fracT(a, b) + "\\times" + frac(d, c) + "=" + frac(tx(a * d), b * c) + "=" + r.tex()) + "."]
      : [M(fracT(a, b) + "\\times" + frac(c, d) + "=" + frac(tx(a * c), b * d)) + ".", "Semplifico: " + M(r.tex()) + "."];
    const traps = div ? [{ ans: A.mul(B).plain(), m: "Per dividere si moltiplica per la frazione CAPOVOLTA." }, { ans: B.inv().mul(A.inv()).plain(), m: "Si capovolge solo la seconda frazione." }] : [];
    return { q: "Calcola e semplifica: " + qq, type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(), sol, traps };
  },
});

sk({
  id: "c1-frac-etage", ch: 2, title: "Frazioni a più piani",
  learn: L({
    idea: "Una frazione « a piani » è solo una divisione scritta in verticale: " + M("\\frac{A}{B}=A:B") + ". Si calcola un piano alla volta.",
    steps: ["Calcola il piano di sopra A (una sola frazione).", "Calcola il piano di sotto B (una sola frazione).", "Dividi: " + M("A:B=A\\times\\frac1B") + " (moltiplica per B capovolta).", "Semplifica."],
    trap: "Non semplificare « in diagonale » tra i piani: prima calcola ogni piano.",
  }),
  gen() {
    let top, bot, qt;
    if (coin()) {
      const a = ri(1, 4), c = ri(2, 6), b = coprimeNum(c, 1, 5), d = ri(1, 4), f = ri(2, 6); let e = coprimeNum(f, 1, 5);
      top = q(a).add(q(b, c)); bot = q(d).sub(q(e, f)); if (bot.n === 0) { e = e + 1; bot = q(d).sub(q(e, f)); }
      qt = frac(a + "+" + frac(b, c), d + "-" + frac(e, f));
      const r = top.div(bot);
      return { q: "Calcola e semplifica: " + M(qt), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
        sol: ["Sopra: " + M(a + "+" + frac(b, c) + "=" + top.tex()) + ".", "Sotto: " + M(d + "-" + fracT(e, f) + "=" + bot.tex()) + ".", "Divido: " + M(frac(top.tex(), bot.tex()) + "=" + top.tex() + "\\times" + (bot.inv().tex()) + "=" + r.tex()) + "."] };
    }
    let a = ri(2, 9), b = ri(2, 9); while (b === a) b = ri(2, 9);
    top = q(1, a).add(q(1, b)); bot = q(1, a).sub(q(1, b)); const r = top.div(bot);
    return { q: "Calcola e semplifica: " + M(frac(frac(1, a) + "+" + frac(1, b), frac(1, a) + "-" + frac(1, b))), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
      sol: ["Sopra: " + M(frac(1, a) + "+" + frac(1, b) + "=" + frac(b + "+" + a, a * b) + "=" + top.tex()) + ".", "Sotto: " + M(frac(1, a) + "-" + frac(1, b) + "=" + frac(b + "-" + a, a * b) + "=" + bot.tex()) + ".", "Divido: " + M("=" + r.tex()) + " (i " + M(a * b) + " si semplificano)."] };
  },
});

sk({
  id: "c1-puiss-exposant", ch: 2, title: "Le regole delle potenze",
  learn: L({
    idea: M("2^3\\times2^4") + " = (2·2·2)·(2·2·2·2) = sette 2 moltiplicati = " + M("2^7") + ". Per questo, quando si moltiplicano potenze con la stessa base, <b>gli esponenti si sommano</b>.",
    rule: D("a^m\\times a^n=a^{m+n}\\qquad \\frac{a^m}{a^n}=a^{m-n}\\qquad (a^m)^n=a^{m\\times n}") + D("a^0=1\\qquad a^{-n}=\\frac1{a^n}"),
    steps: ["Scrivi tutto con la stessa base (" + M("8=2^3") + ", " + M("9=3^2") + "…).", "Prodotto → somma gli esponenti. Divisione → sottrai. Potenza di potenza → moltiplica.", "Fai con calma il calcolo degli esponenti (attenzione ai segni)."],
    trap: M("2^3\\times2^4=2^7") + " (non " + M("2^{12}") + " e non " + M("4^7") + ").",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 4) {
      const A = pick([2, 3]); const big = A === 2 ? [[4, 2], [8, 3], [16, 4]] : [[9, 2], [27, 3]];
      const [B1, e1] = pick(big), [B2, e2] = pick(big); const m = rnz(-3, 4), n = rnz(-4, 5), p = rnz(-3, 3);
      const k = e1 * m + n - e2 * p;
      return { q: "Scriviamo " + M(frac(B1 + "^{" + m + "}\\times " + A + "^{" + n + "}", B2 + "^{" + p + "}")) + " nella forma " + M(A + "^k") + ". Quanto vale " + M("k") + "?", type: "num", ans: String(k), form: ["rat"], atex: String(k),
        sol: ["Stessa base: " + M(B1 + "=" + A + "^{" + e1 + "}") + " e " + M(B2 + "=" + A + "^{" + e2 + "}") + ".", M(B1 + "^{" + m + "}=" + A + "^{" + e1 * m + "}") + ", " + M(B2 + "^{" + p + "}=" + A + "^{" + e2 * p + "}") + ".", M("k=" + e1 * m + (n < 0 ? "" : "+") + n + "-" + tp(e2 * p) + "=" + k) + "."] };
    }
    const A = pick([2, 3, 5, 10, 7]);
    const m = rnz(-5, 9), n = rnz(-5, 9), p = rnz(-4, 6);
    let tex, k, sol, traps = [];
    if (t === 1) { tex = frac(A + "^{" + m + "}\\times " + A + "^{" + n + "}", A + "^{" + p + "}"); k = m + n - p; sol = ["Prodotto: sommo gli esponenti " + M(m + (n < 0 ? "" : "+") + n + "=" + (m + n)) + ".", "Divisione: sottraggo " + M((m + n) + "-" + tp(p) + "=" + k) + "."]; traps.push({ ans: String(m * n - p), m: "In un prodotto gli esponenti si SOMMANO." }); }
    else if (t === 2) { const nn = ri(2, 4); tex = "(" + A + "^{" + m + "})^{" + nn + "}\\times " + A + "^{" + p + "}"; k = m * nn + p; sol = ["Potenza di potenza: moltiplico " + M(tp(m) + "\\times" + nn + "=" + m * nn) + ".", "Poi il prodotto: " + M(m * nn + (p < 0 ? "" : "+") + p + "=" + k) + "."]; traps.push({ ans: String(m + nn + p), m: M("(a^m)^n=a^{m\\times n}") + ": gli esponenti si moltiplicano." }); }
    else { const nn = ri(2, 3); tex = frac(A + "^{" + m + "}", "(" + A + "^{" + n + "})^{" + nn + "}"); k = m - n * nn; sol = ["Sotto: " + M("(" + A + "^{" + n + "})^{" + nn + "}=" + A + "^{" + n * nn + "}") + ".", "Divisione: " + M(m + "-" + tp(n * nn) + "=" + k) + "."]; }
    return { q: "Scriviamo " + M(tex) + " nella forma " + M(A + "^k") + ". Quanto vale " + M("k") + "?", type: "num", ans: String(k), form: ["rat"], atex: String(k), sol, traps };
  },
});

sk({
  id: "c1-puiss-lettres", ch: 2, title: "Potenze con le lettere",
  learn: L({
    idea: "Le stesse regole valgono con la x. E il numero davanti segue anche lui la potenza: " + M("(3x^2)^3=3^3\\,(x^2)^3=27x^6") + ".",
    steps: ["Separa i numeri e le potenze di x.", "Calcola il numero.", "Calcola l'esponente della x con le regole.", "Scrivi il risultato: un numero × " + M("x^{k}") + "."],
    trap: M("(2x^3)^2=4x^6") + " e non " + M("2x^6") + ": anche il 2 va al quadrato.",
    input: "<code>4x^6</code>, <code>3x^(-2)</code>, <code>x^5/2</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = ri(2, 3), m = ri(1, 4), n = ri(2, 3), c = Math.pow(a, n) * sg(), aa = c < 0 ? -a : a;
      if (n % 2 === 0 && aa < 0) return this.gen();
      const k = m * n;
      return { q: "Semplifica: " + M("(" + aa + "x^{" + m + "})^{" + n + "}"), type: "expr", ans: c + "*x^" + k, form: ["mono"], dom: [0.4, 1.9], atex: tx(c) + "x^{" + k + "}",
        traps: [{ ans: aa + "*x^" + k, m: "Anche il numero davanti va elevato alla " + n + "." }, { ans: c + "*x^" + (m + n), m: M("(x^m)^n=x^{m\\times n}") + ": gli esponenti si moltiplicano." }],
        sol: [M("(" + aa + "x^{" + m + "})^{" + n + "}=" + tp(aa) + "^{" + n + "}\\times(x^{" + m + "})^{" + n + "}") + ".", M("=" + c + "\\,x^{" + m + "\\times" + n + "}=" + tx(c) + "x^{" + k + "}") + "."] };
    }
    if (t === 2) {
      const a = ri(2, 3), n = 2, m = ri(1, 3), p = rnz(-3, 3), qq = ri(1, 4);
      const A2 = a * a, b = pick([1, 2, a, A2].filter(v => A2 % v === 0)), c = A2 / b, k = m * n + p - qq;
      return { q: "Semplifica: " + M(frac("(" + a + "x^{" + m + "})^{2}\\times x^{" + p + "}", (b === 1 ? "" : b) + "x^{" + qq + "}")), type: "expr", ans: c + "*x^(" + k + ")", form: ["mono"], dom: [0.4, 1.9], atex: (c === 1 ? "" : c) + "x^{" + k + "}",
        sol: ["Numeri: " + M(frac(a + "^2", b) + "=" + c) + ".", "Esponenti: " + M(m + "\\times2" + (p < 0 ? "" : "+") + p + "-" + qq + "=" + k) + ".", "Risultato: " + M((c === 1 ? "" : c) + "x^{" + k + "}") + (k < 0 ? " (si può anche scrivere " + M(frac(c, "x^{" + -k + "}")) + ")." : ".")] };
    }
    const m = ri(1, 6), n = rnz(-3, 5), p = ri(1, 7), k = m + n - p;
    return { q: "Semplifica: " + M(frac("x^{" + m + "}\\times x^{" + n + "}", "x^{" + p + "}")), type: "expr", ans: "x^(" + k + ")", form: ["mono"], dom: [0.4, 1.9], atex: "x^{" + k + "}",
      traps: [{ ans: "x^(" + (m * n - p) + ")", m: "Nel prodotto di potenze gli esponenti si sommano." }],
      sol: [M(m + (n < 0 ? "" : "+") + n + "-" + p + "=" + k) + ", quindi " + M("x^{" + k + "}") + "."] };
  },
});

sk({
  id: "c1-puiss-10", ch: 2, title: "Potenze di 10 e notazione scientifica",
  learn: L({
    idea: "Per i numeri molto grandi o molto piccoli (in fisica succede spesso) si usa la <b>notazione scientifica</b>: un numero tra 1 e 10, per una potenza di 10. " + M("0{,}00052=5{,}2\\times10^{-4}") + ".",
    rule: "Forma: " + M("a\\times10^n") + " con " + M("1\\le a<10") + ".",
    steps: ["Metti insieme i numeri da una parte e le potenze di 10 dall'altra.", "Calcola ogni parte (regole delle potenze).", "Se il numero davanti non è tra 1 e 10, sposta la virgola e correggi l'esponente: " + M("24\\times10^{3}=2{,}4\\times10^{4}") + "."],
    trap: "Spostare la virgola a sinistra <b>aumenta</b> l'esponente: " + M("0{,}6\\times10^{-2}=6\\times10^{-3}") + ".",
    input: "<code>6*10^-3</code> oppure <code>2.4*10^4</code>.",
  }),
  gen() {
    const a = ri(1, 9), b = ri(2, 9), m = ri(-8, 8), n = ri(-8, 8);
    let mant, e = m + n, qt, sol;
    if (coin()) {
      mant = q(a * b); qt = "(" + a + "\\times10^{" + m + "})\\times(" + b + "\\times10^{" + n + "})";
      sol = ["Metto insieme: " + M("(" + a + "\\times" + b + ")\\times10^{" + m + (n < 0 ? "" : "+") + n + "}=" + a * b + "\\times10^{" + e + "}") + "."];
    } else {
      const c = pick([2, 4, 5, 8]); mant = q(a * b, c); const p = ri(-6, 6); e = m + n - p;
      qt = frac("(" + a + "\\times10^{" + m + "})\\times(" + b + "\\times10^{" + n + "})", c + "\\times10^{" + p + "}");
      sol = ["I numeri: " + M(frac(a + "\\times" + b, c) + "=" + fmtNum(mant.v)) + ".", "Le potenze: " + M("10^{" + m + (n < 0 ? "" : "+") + n + "-" + tp(p) + "}=10^{" + e + "}") + "."];
    }
    let v = mant.v; while (v >= 10) { v /= 10; e++; } while (v < 1) { v *= 10; e--; }
    v = Math.round(v * 1e6) / 1e6;
    sol.push("Aggiusto per avere un numero tra 1 e 10: " + M(fmtNum(v) + "\\times10^{" + e + "}") + ".");
    return { q: "Calcola e scrivi il risultato in notazione scientifica: " + M(qt), type: "num", ans: v + "*10^(" + e + ")", form: ["sci"], allow: [], atex: fmtNum(v) + "\\times10^{" + e + "}", sol };
  },
});

sk({
  id: "c1-racine-simplifier", ch: 2, title: "Semplificare una radice quadrata",
  learn: L({
    idea: M("\\sqrt{72}") + " si può scrivere in modo più semplice: 72 = 36 × 2, e " + M("\\sqrt{36}=6") + ". Quindi " + M("\\sqrt{72}=6\\sqrt2") + ". Si « tira fuori » dalla radice il quadrato perfetto.",
    rule: M("\\sqrt{a\\times b}=\\sqrt a\\times\\sqrt b") + " e " + M("\\sqrt{k^2}=k") + ".",
    steps: ["Cerca il <b>quadrato perfetto più grande</b> che divide il numero: 4, 9, 16, 25, 36, 49, 64, 81, 100…", "Scrivi " + M("\\sqrt{N}=\\sqrt{k^2\\times m}=k\\sqrt m") + ".", "Controlla che sotto la radice non resti un altro quadrato perfetto."],
    trap: M("\\sqrt{a+b}\\ne\\sqrt a+\\sqrt b") + ": la regola vale per × e :, mai per + e −.",
    input: "<code>6sqrt(2)</code> oppure <code>6√2</code>.",
  }),
  gen() {
    const m = pick([2, 3, 5, 6, 7, 10, 11, 13]), k = ri(2, m > 7 ? 5 : 9), N = k * k * m;
    const c = rnd() < 0.25 ? ri(2, 4) : 1;
    return { q: "Semplifica " + M((c > 1 ? c : "") + "\\sqrt{" + N + "}") + " nella forma " + M("a\\sqrt b") + " (con b il più piccolo possibile).", type: "num", ans: (c * k) + "*sqrt(" + m + ")", form: ["sqrt"], atex: sqrtT(c * k, m),
      sol: [M(N + "=" + k * k + "\\times" + m) + " e " + M(k * k + "=" + k + "^2") + " è un quadrato perfetto.", M((c > 1 ? c : "") + "\\sqrt{" + N + "}=" + (c > 1 ? c + "\\times" : "") + "\\sqrt{" + k * k + "}\\times\\sqrt{" + m + "}=" + sqrtT(c * k, m)) + "."] };
  },
});

sk({
  id: "c1-racine-calculs", ch: 2, title: "Calcolare con le radici",
  learn: L({
    idea: "Le radici si trattano come le lettere: " + M("3\\sqrt2+5\\sqrt2=8\\sqrt2") + " (come 3x + 5x = 8x). Si sommano solo radici <b>uguali</b>.",
    rule: M("\\sqrt a\\times\\sqrt b=\\sqrt{ab}") + ", " + M("(\\sqrt a)^2=a") + ", " + M("(a+\\sqrt b)(a-\\sqrt b)=a^2-b") + ".",
    steps: ["Semplifica ogni radice (tira fuori i quadrati perfetti).", "Metti insieme i termini con la stessa radice.", "Per un prodotto, usa i prodotti notevoli."],
    trap: M("\\sqrt 9+\\sqrt{16}=3+4=7") + " ma " + M("\\sqrt{25}=5") + ": non si somma sotto la radice.",
  }),
  gen() {
    const t = ri(1, 5);
    if (t === 1) {
      const m = pick([2, 3, 5, 6, 7]); let p = ri(1, 3), r = ri(2, 4), s = ri(2, 5); const a = ri(1, 5), b = ri(1, 4), c = ri(1, 3);
      let tot = a * p + b * r - c * s; if (tot === 0) { s++; tot = a * p + b * r - c * s; }
      const term = (co, kk) => (co === 1 ? "" : co) + "\\sqrt{" + kk * kk * m + "}";
      return { q: "Scrivi nella forma " + M("a\\sqrt b") + ": " + M(term(a, p) + "+" + term(b, r) + "-" + term(c, s)), type: "num", ans: tot + "*sqrt(" + m + ")", form: ["sqrt"], atex: sqrtT(tot, m),
        sol: ["Semplifico ogni radice: " + [[a, p], [b, r], [c, s]].map(([co, kk]) => M(term(co, kk) + "=" + sqrtT(co * kk, m))).join(", ") + ".", "Metto insieme le " + M("\\sqrt{" + m + "}") + ": " + M("(" + a * p + "+" + b * r + "-" + c * s + ")\\sqrt{" + m + "}=" + sqrtT(tot, m)) + "."] };
    }
    if (t === 2) { const a = ri(2, 6), m = pick([2, 3, 5, 7]); return { q: "Calcola: " + M("(" + a + "\\sqrt{" + m + "})^2"), type: "num", ans: String(a * a * m), form: ["rat"], atex: String(a * a * m), traps: [{ ans: String(a * m), m: "Anche il " + a + " va al quadrato: " + M(a + "^2=" + a * a) + "." }], sol: [M("(" + a + "\\sqrt{" + m + "})^2=" + a + "^2\\times(\\sqrt{" + m + "})^2=" + a * a + "\\times" + m + "=" + a * a * m) + "."] }; }
    if (t === 3) {
      const s = pick([2, 3, 5]); const pairs = [[2, 3], [2, 5], [3, 5], [1, 2], [1, 3], [2, 7], [3, 7], [1, 5]].filter(([u, w]) => u !== s && w !== s);
      const [u, w] = pick(pairs); const A = s * u, B = s * w;
      return { q: "Calcola e semplifica: " + M("\\sqrt{" + A + "}\\times\\sqrt{" + B + "}"), type: "num", ans: s + "*sqrt(" + u * w + ")", form: ["sqrt"], atex: sqrtT(s, u * w),
        sol: [M("\\sqrt{" + A + "}\\times\\sqrt{" + B + "}=\\sqrt{" + A * B + "}") + ".", M(A * B + "=" + s * s + "\\times" + u * w) + ", quindi " + M("\\sqrt{" + A * B + "}=" + sqrtT(s, u * w)) + "."] };
    }
    if (t === 4) { const a = ri(2, 7), m = pick([2, 3, 5, 6, 7, 10, 11]); const v = a * a - m; return { q: "Calcola: " + M("(" + a + "+\\sqrt{" + m + "})(" + a + "-\\sqrt{" + m + "})"), type: "num", ans: String(v), form: ["rat"], atex: String(v), sol: ["Prodotto notevole " + M("(a+b)(a-b)=a^2-b^2") + ": " + M(a + "^2-(\\sqrt{" + m + "})^2=" + a * a + "-" + m + "=" + v) + "."] }; }
    const a = ri(1, 5), m = pick([2, 3, 5, 6, 7]);
    return { q: "Sviluppa e riduci: " + M("(\\sqrt{" + m + "}+" + a + ")^2"), type: "num", ans: (m + a * a) + "+" + 2 * a + "*sqrt(" + m + ")", form: ["sqrt"], atex: (m + a * a) + "+" + sqrtT(2 * a, m),
      traps: [{ ans: String(m + a * a), m: "Manca il doppio prodotto: " + M("(a+b)^2=a^2+2ab+b^2") + "." }],
      sol: [M("(a+b)^2=a^2+2ab+b^2") + " con " + M("a=\\sqrt{" + m + "}") + ", " + M("b=" + a) + ".", M("=" + m + "+2\\times" + a + "\\sqrt{" + m + "}+" + a * a + "=" + (m + a * a) + "+" + sqrtT(2 * a, m)) + "."] };
  },
});

sk({
  id: "c1-racine-conjugue", ch: 2, title: "Togliere la radice dal denominatore",
  learn: L({
    idea: "Per abitudine, non si lascia una radice sotto la linea di frazione. Si moltiplica sopra e sotto per un numero scelto apposta, in modo che la radice sparisca (« razionalizzare »).",
    rule: M("\\frac{a}{\\sqrt m}=\\frac{a\\sqrt m}{m}") + ". Se sotto c'è una somma, si usa il <b>coniugato</b> (si cambia il segno in mezzo): " + M("\\frac{a}{\\sqrt m+b}=\\frac{a(\\sqrt m-b)}{m-b^2}") + ".",
    steps: ["Solo una radice sotto: moltiplica sopra e sotto per quella radice.", "Una somma o differenza sotto: moltiplica sopra e sotto per il <b>coniugato</b> (stesso, con il segno in mezzo cambiato).", "Sotto usa " + M("(A+B)(A-B)=A^2-B^2") + ": la radice sparisce.", "Semplifica."],
    trap: "Moltiplica <b>sopra e sotto</b> per la stessa cosa, altrimenti il valore cambia.",
    input: "<code>2sqrt(3)</code>, <code>(sqrt(5)-1)/2</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const m = pick([2, 3, 5, 6, 7]), a = ri(1, 4) * (coin() ? m : 1) * (coin() ? 1 : ri(1, 3));
      const r = q(a, m);
      return { q: "Togli la radice dal denominatore: " + M(frac(a, "\\sqrt{" + m + "}")), type: "num", ans: r.plain() + "*sqrt(" + m + ")", form: ["noSqrtDen", "sqrt"], atex: r.eq(1) ? "\\sqrt{" + m + "}" : r.isInt() ? r.n + "\\sqrt{" + m + "}" : frac((r.n === 1 ? "" : r.n) + "\\sqrt{" + m + "}", r.d),
        sol: ["Moltiplico sopra e sotto per " + M("\\sqrt{" + m + "}") + ": " + M(frac(a + "\\sqrt{" + m + "}", "\\sqrt{" + m + "}\\times\\sqrt{" + m + "}") + "=" + frac(a + "\\sqrt{" + m + "}", m)) + ".", "Semplifico la frazione " + M(frac(a, m)) + " se posso."] };
    }
    if (t === 2) {
      let m = pick([2, 3, 5, 6, 7, 10]), b = ri(1, 3); if (m === b * b) m++;
      const den = m - b * b, s = pick([1, -1]), a = rnd() < 0.5 ? Math.abs(den) * ri(1, 2) : ri(1, 5);
      const r = q(a, den);
      const ans = r.plain() + "*(sqrt(" + m + ")" + (s > 0 ? "-" : "+") + b + ")";
      return { q: "Togli la radice dal denominatore: " + M(frac(a, "\\sqrt{" + m + "}" + (s > 0 ? "+" : "-") + b)), type: "num", ans, form: ["noSqrtDen", "sqrt"], atex: (r.eq(1) ? "" : r.eq(-1) ? "-" : r.tex()) + "\\left(\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b + "\\right)",
        sol: ["Coniugato: " + M("\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b) + ".", "Sotto: " + M("(\\sqrt{" + m + "})^2-" + b + "^2=" + m + "-" + b * b + "=" + den) + ".", "Risultato: " + M(frac(a + "\\left(\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b + "\\right)", den)) + (r.isInt() ? " = " + M((r.eq(1) ? "" : r.eq(-1) ? "-" : r.n) + "\\left(\\sqrt{" + m + "}" + (s > 0 ? "-" : "+") + b + "\\right)") : "") + "."] };
    }
    const [m, n] = pick([[3, 2], [5, 3], [5, 2], [7, 5], [6, 5], [7, 3], [3, 1]]); const den = m - n, a = den * ri(1, 3);
    const k = a / den; const sq = x => (x === 1 ? "1" : "\\sqrt{" + x + "}"), sqi = x => (x === 1 ? "1" : "sqrt(" + x + ")");
    return { q: "Togli la radice dal denominatore: " + M(frac(a, sq(m) + "-" + sq(n))), type: "num", ans: k + "*(" + sqi(m) + "+" + sqi(n) + ")", form: ["noSqrtDen", "sqrt"], atex: (k === 1 ? "" : k) + (k === 1 ? sq(m) + "+" + sq(n) : "\\left(" + sq(m) + "+" + sq(n) + "\\right)"),
      sol: ["Moltiplico per il coniugato " + M(sq(m) + "+" + sq(n)) + ".", "Sotto: " + M(m + "-" + n + "=" + den) + ".", M(frac(a + "(" + sq(m) + "+" + sq(n) + ")", den) + "=" + (k === 1 ? "" : k) + "\\left(" + sq(m) + "+" + sq(n) + "\\right)") + "."] };
  },
});

/* sviluppare: elenco dei prodotti */
function distLine(A, B) {
  const terms = [];
  const deg = (arr, i) => arr.length - 1 - i;
  A.forEach((a, i) => { if (Qv(a).n === 0) return; B.forEach((b, j) => { if (Qv(b).n === 0) return; const c = Qv(a).mul(b); const d = deg(A, i) + deg(B, j); terms.push(mono(c, d === 0 ? "" : d === 1 ? "x" : "x^{" + d + "}", terms.length === 0)); }); });
  return terms.join("");
}
sk({
  id: "c1-developper", ch: 2, title: "Sviluppare un prodotto di parentesi",
  learn: L({
    idea: "Per togliere le parentesi in " + M("(x+3)(x+2)") + ", <b>ogni</b> termine della prima parentesi moltiplica <b>ogni</b> termine della seconda. Sono 4 moltiplicazioni: come una stretta di mano tra tutti.",
    rule: M("(a+b)(c+d)=ac+ad+bc+bd") + ".",
    steps: ["Scrivi i 4 prodotti (primo × primo, primo × secondo, secondo × primo, secondo × secondo).", "Attenzione ai segni: " + M("(-3)\\times(-2x)=+6x") + ".", "Metti insieme i termini simili (le " + M("x^2") + ", le x, i numeri).", "Scrivi in ordine: " + M("ax^2+bx+c") + "."],
    trap: M("(x+3)(x+2)\\ne x^2+6") + ": non dimenticare i prodotti « incrociati » " + M("2x") + " e " + M("3x") + ".",
    input: "<code>6x^2-7x+2</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    if (t === 1) {
      const a = rnz(-5, 5), b = rnz(-9, 9), c = rnz(-5, 5), d = rnz(-9, 9);
      const P = pmul([a, b], [c, d]);
      return { q: "Sviluppa e riduci: " + M(pr(linT(a, b)) + pr(linT(c, d))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
        traps: [{ ans: polyIn([a * c, 0, b * d]), m: "Mancano i prodotti incrociati: con due parentesi di due termini, i prodotti sono 4." }],
        sol: ["I 4 prodotti: " + M(distLine([a, b], [c, d])) + ".", "Metto insieme: " + M(polyT(P)) + "."] };
    }
    if (t === 2) {
      const k = rnz(-6, 6), a = rnz(-5, 5), b = rnz(-9, 9), m = rnz(-6, 6), c = rnz(-5, 5), d = rnz(-9, 9);
      const P = padd(pscale([a, b], k), pscale([c, d], m));
      if (Qv(P[0]).n === 0) return this.gen();
      return { q: "Sviluppa e riduci: " + M((k === -1 ? "-" : k) + pr(linT(a, b)) + (m < 0 ? "-" : "+") + (Math.abs(m) === 1 ? "" : Math.abs(m)) + pr(linT(c, d))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
        sol: [M(polyT(pscale([a, b], k)) + (m < 0 ? "" : "+") + polyT(pscale([c, d], m))) + ".", "Metto insieme: " + M(polyT(ptrim(P))) + "."] };
    }
    const a = rnz(-4, 4), b = rnz(-3, 3), c = rnz(-6, 6);
    const P = pmul([1, a], [1, b, c]);
    return { q: "Sviluppa e riduci: " + M(pr(linT(1, a)) + pr(polyT([1, b, c]))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      sol: ["Moltiplico " + M("x") + " e poi " + M(tx(a)) + " per ogni termine: " + M(distLine([1, a], [1, b, c])) + ".", "Metto insieme: " + M(polyT(P)) + "."] };
  },
});

sk({
  id: "c1-identites", ch: 2, title: "I prodotti notevoli",
  learn: L({
    idea: "Alcuni prodotti tornano così spesso che conviene imparare il risultato a memoria. Sono delle « scorciatoie ».",
    rule: D("(a+b)^2=a^2+2ab+b^2 \\qquad (a-b)^2=a^2-2ab+b^2 \\qquad (a+b)(a-b)=a^2-b^2"),
    steps: ["Trova a e b (a può essere " + M("3x") + ").", "Calcola " + M("a^2") + " (attenzione: " + M("(3x)^2=9x^2") + ").", "Calcola il doppio prodotto " + M("2ab") + ".", "Calcola " + M("b^2") + " e metti tutto insieme."],
    trap: M("(x+5)^2\\ne x^2+25") + ": manca " + M("2\\times x\\times5=10x") + ".",
  }),
  gen() {
    const a = ri(1, 5), b = ri(1, 9), t = ri(1, 3);
    const A = a === 1 ? "x" : a + "x", aT = a === 1 ? "x" : "(" + a + "x)";
    if (t === 3) {
      const P = [a * a, 0, -b * b];
      return { q: "Sviluppa: " + M("(" + A + "+" + b + ")(" + A + "-" + b + ")"), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
        sol: [M("(a+b)(a-b)=a^2-b^2") + " con " + M("a=" + A) + ", " + M("b=" + b) + ".", M(aT + "^2-" + b + "^2=" + polyT(P)) + "."] };
    }
    const s = t === 1 ? 1 : -1, P = [a * a, 2 * a * b * s, b * b];
    return { q: "Sviluppa: " + M("(" + A + (s > 0 ? "+" : "-") + b + ")^2"), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      traps: [{ ans: polyIn([a * a, 0, b * b]), m: "Manca il doppio prodotto " + M("2ab") + "." }, { ans: polyIn([a * a, 0, -b * b]), m: M("(a-b)^2\\ne a^2-b^2") + ": c'è il doppio prodotto, e " + M("b^2") + " è positivo." }, { ans: polyIn([a * a, 2 * a * b * s, -b * b]), m: "L'ultimo termine " + M("b^2") + " è sempre positivo." }, { ans: polyIn([a, 2 * a * b * s, b * b]), m: M("(" + a + "x)^2=" + a * a + "x^2") + ": anche il numero va al quadrato." }],
      sol: [M(s > 0 ? "(a+b)^2=a^2+2ab+b^2" : "(a-b)^2=a^2-2ab+b^2") + " con " + M("a=" + A) + ", " + M("b=" + b) + ".", M("a^2=" + a * a + "x^2") + ", " + M("2ab=2\\times" + A + "\\times" + b + "=" + 2 * a * b + "x") + ", " + M("b^2=" + b * b) + ".", "Risultato: " + M(polyT(P)) + "."] };
  },
});

sk({
  id: "c1-developper-moins", ch: 2, title: "Sviluppare con un « − » davanti",
  learn: L({
    idea: "Un meno davanti a una parentesi è come un « −1 × »: cambia il segno di <b>tutti</b> i termini dentro, non solo del primo.",
    rule: M("-(x^2-3x+2)=-x^2+3x-2") + ".",
    steps: ["Sviluppa ogni prodotto tenendolo <b>tra parentesi quadre</b>, senza toccare il segno davanti.", "Togli le parentesi quadre: se davanti c'è un −, cambia tutti i segni.", "Metti insieme e riordina."],
    trap: M("5-(x+2)^2") + ": prima " + M("(x+2)^2=x^2+4x+4") + ", poi " + M("5-x^2-4x-4") + ".",
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
    return { q: "Sviluppa e riduci: " + M(qt), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      traps: [{ ans: polyIn(trapP), m: "Il « − » davanti alla parentesi cambia il segno di TUTTI i termini, non solo del primo." }],
      sol: ["Primo pezzo: " + M(polyT(A)) + ".", "Secondo pezzo, tra parentesi quadre: " + M("\\left[" + polyT(B) + "\\right]") + ".", "Tolgo le parentesi quadre cambiando tutti i segni: " + M(polyT(A) + "-\\left[" + polyT(B) + "\\right]=" + polyT(P)) + "."] };
  },
});

sk({
  id: "c1-factoriser-commun", ch: 2, title: "Scomporre: raccogliere un fattore comune",
  learn: L({
    idea: "Scomporre è il contrario di sviluppare: da una somma si torna a un prodotto. Se una cosa è presente in <b>tutti</b> i termini, la si « raccoglie » e la si scrive una volta sola davanti a una parentesi.",
    rule: M("ka+kb=k(a+b)") + ". Esempio: " + M("6x^2-9x=3x(2x-3)") + ".",
    steps: ["Trova quello che c'è in tutti i termini (un numero, " + M("x") + ", o una parentesi intera).", "Scrivilo davanti a una grande parentesi.", "Dentro, scrivi quello che resta di ogni termine.", "Riduci l'interno, poi controlla risviluppando."],
    trap: "Con un « − »: " + M("A\\cdot B-A\\cdot(C+D)=A\\,[B-C-D]") + " (il − vale per tutto C + D).",
    input: "<code>3x(2x-3)</code>, <code>(x+1)(3x+2)</code>.",
  }),
  gen() {
    const t = ri(1, 4);
    if (t === 1) {
      const g = ri(2, 6), p = ri(1, 5); let r = rnz(-9, 9); while (gcd(p, r) !== 1) r = rnz(-9, 9);
      const P = [g * p, g * r, 0];
      return { q: "Scomponi: " + M(polyT(P)), type: "expr", ans: g + "x*(" + linIn(p, r) + ")", form: ["factored"], atex: g + "x" + pr(linT(p, r)),
        sol: ["Fattore comune: " + M(g + "x") + " (" + g + " divide " + g * p + " e " + Math.abs(g * r) + ", e " + M("x") + " c'è in tutti e due i termini).", M(polyT(P) + "=" + g + "x\\times" + (p === 1 ? "x" : p + "x") + (r < 0 ? "-" : "+") + g + "x\\times" + Math.abs(r) + "=" + g + "x" + pr(linT(p, r))) + "."] };
    }
    const p = ri(1, 3), qq = rnz(-7, 7), a = rnz(-4, 4), b = rnz(-8, 8); let c = rnz(-4, 4), d = rnz(-8, 8);
    const F = linT(p, qq), Fi = linIn(p, qq);
    let second, qt, trap = null, steps;
    if (t === 2) { if (a + c === 0) c = a + 1 === 0 ? 2 : c + 1; second = [a + c, b + d]; qt = pr(F) + pr(linT(a, b)) + "+" + pr(F) + pr(linT(c, d)); steps = "[" + linT(a, b) + "+" + linT(c, d) + "]"; }
    else if (t === 3) { if (a - c === 0) c = c + 1; second = [a - c, b - d]; qt = pr(F) + pr(linT(a, b)) + "-" + pr(F) + pr(linT(c, d)); steps = "[" + linT(a, b) + "-" + pr(linT(c, d)) + "]"; trap = [a - c, b + d]; }
    else { if (p - c === 0) c = c + 1; second = [p - c, qq - d]; qt = pr(F) + "^2-" + pr(F) + pr(linT(c, d)); steps = "[" + F + "-" + pr(linT(c, d)) + "]"; trap = [p - c, qq + d]; }
    if (second[1] === 0 && second[0] === 0) return this.gen();
    return { q: "Scomponi: " + M(qt), type: "expr", ans: "(" + Fi + ")*(" + linIn(second[0], second[1]) + ")", form: ["factored"], atex: pr(F) + pr(linT(second[0], second[1])),
      traps: trap ? [{ ans: "(" + Fi + ")*(" + linIn(trap[0], trap[1]) + ")", m: "Il « − » vale per tutta la parentesi: " + M("-(" + linT(c, d) + ")=" + linT(-c, -d)) + "." }] : [],
      sol: ["Fattore comune: " + M(pr(F)) + ".", M(qt + "=" + pr(F) + steps) + ".", "Riduco la parentesi quadra: " + M(pr(F) + pr(linT(second[0], second[1]))) + "."] };
  },
});

sk({
  id: "c1-factoriser-identites", ch: 2, title: "Scomporre con i prodotti notevoli",
  learn: L({
    idea: "I prodotti notevoli letti al contrario servono a scomporre. Quando vedi due quadrati con un meno in mezzo, pensa subito a " + M("(a-b)(a+b)") + ".",
    rule: D("a^2-b^2=(a-b)(a+b)\\qquad a^2+2ab+b^2=(a+b)^2\\qquad a^2-2ab+b^2=(a-b)^2"),
    steps: ["Due termini, due quadrati, un « − » in mezzo → " + M("a^2-b^2") + ".", "Tre termini con due quadrati → controlla il doppio prodotto " + M("2ab") + ".", "Trova a e b (" + M("9x^2=(3x)^2") + ", " + M("25=5^2") + ").", "Scrivi la scomposizione e controlla sviluppando."],
    trap: M("x^2+9") + " non si scompone (è una <b>somma</b> di quadrati).",
  }),
  gen() {
    const a = ri(1, 6); let b = ri(1, 10); while (gcd(a, b) !== 1) b = ri(1, 10);
    const A = a === 1 ? "x" : a + "x", t = ri(1, 4);
    if (t === 1) return { q: "Scomponi: " + M(polyT([a * a, 0, -b * b])), type: "expr", ans: "(" + A + "-" + b + ")(" + A + "+" + b + ")", form: ["factored"], atex: pr(A + "-" + b) + pr(A + "+" + b),
      traps: [{ ans: "(" + A + "-" + b + ")^2", m: M("a^2-b^2=(a-b)(a+b)") + ", non " + M("(a-b)^2") + "." }],
      sol: [M(a * a + "x^2=(" + A + ")^2") + " e " + M(b * b + "=" + b + "^2") + ": è " + M("a^2-b^2") + ".", M("=" + pr(A + "-" + b) + pr(A + "+" + b)) + "."] };
    if (t === 4) return { q: "Scomponi: " + M(b * b + "-" + (a * a === 1 ? "" : a * a) + "x^2"), type: "expr", ans: "(" + b + "-" + A + ")(" + b + "+" + A + ")", form: ["factored"], atex: pr(b + "-" + A) + pr(b + "+" + A),
      sol: ["È " + M("a^2-b^2") + " con " + M("a=" + b) + " e " + M("b=" + A) + ".", M("=" + pr(b + "-" + A) + pr(b + "+" + A)) + "."] };
    const s = t === 2 ? 1 : -1, P = [a * a, 2 * a * b * s, b * b];
    return { q: "Scomponi: " + M(polyT(P)), type: "expr", ans: "(" + A + (s > 0 ? "+" : "-") + b + ")^2", form: ["factored"], atex: pr(A + (s > 0 ? "+" : "-") + b) + "^2",
      sol: ["Due quadrati: " + M(a * a + "x^2=(" + A + ")^2") + " e " + M(b * b + "=" + b + "^2") + ".", "Doppio prodotto: " + M("2\\times" + A + "\\times" + b + "=" + 2 * a * b + "x") + " ✔ (segno " + (s > 0 ? "+" : "−") + ").", "Quindi " + M(polyT(P) + "=" + pr(A + (s > 0 ? "+" : "-") + b) + "^2") + "."] };
  },
});

sk({
  id: "c1-factoriser-diff", ch: 2, title: "Scomporre A² − B² con parentesi",
  learn: L({
    idea: "La regola " + M("A^2-B^2=(A-B)(A+B)") + " funziona anche quando A e B sono parentesi intere. Si tratta ogni parentesi come un unico « blocco ».",
    rule: M("(x+3)^2-(2x-1)^2=[(x+3)-(2x-1)]\\,[(x+3)+(2x-1)]") + ".",
    steps: ["Trova A e B (senza sviluppare!).", "Scrivi " + M("[A-B][A+B]") + " tenendo le parentesi di B.", "In " + M("A-B") + ", il − cambia tutti i segni di B.", "Riduci ogni parentesi quadra."],
    trap: M("(x+3)-(2x-1)=-x+4") + ": il − davanti a " + M("(2x-1)") + " trasforma −1 in +1.",
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
    return { q: "Scomponi: " + M(qt), type: "expr", ans: "(" + linIn(f1[0], f1[1]) + ")(" + linIn(f2[0], f2[1]) + ")", form: ["factored"], atex: pr(linT(f1[0], f1[1])) + pr(linT(f2[0], f2[1])),
      traps: [{ ans: "(" + linIn(f1[0], Aexp[1] + Bexp[1]) + ")(" + linIn(f2[0], f2[1]) + ")", m: "In " + M("A-B") + " il − vale per tutto B: " + M("-(" + Bt + ")=" + linT(-Bexp[0], -Bexp[1])) + "." }],
      sol: [M("A=" + At) + " e " + M("B=" + Bt) + ".", M("[A-B][A+B]=\\left[" + At + "-" + pr(Bt) + "\\right]\\left[" + At + "+" + pr(Bt) + "\\right]") + ".", "Riduco: " + M(pr(linT(f1[0], f1[1])) + pr(linT(f2[0], f2[1]))) + "."] };
  },
});

sk({
  id: "c1-fraction-simplifier", ch: 2, title: "Semplificare una frazione con la x",
  learn: L({
    idea: "Come con i numeri, si semplifica una frazione dividendo sopra e sotto per la stessa cosa. Ma si può togliere solo un <b>fattore</b> (una cosa che moltiplica tutto), mai un pezzo di una somma.",
    rule: M("\\frac{(x-2)(x+3)}{x(x+3)}=\\frac{x-2}{x}") + " (per " + M("x\\ne-3") + ").",
    steps: ["Scomponi il numeratore (fattore comune, prodotto notevole…).", "Scomponi il denominatore.", "Cancella le parentesi uguali sopra e sotto.", "Scrivi quello che resta."],
    trap: M("\\frac{x+3}{x+5}") + " non si semplifica: le x sono dentro delle <b>somme</b>, non sono fattori.",
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
    return { q: "Semplifica (per le x per cui esiste): " + M(frac(num, den)), type: "expr", ans, defined: [rem], atex,
      sol: ["Numeratore: " + M(num + "=" + numF) + ".", "Denominatore: " + M(den + "=" + denF) + ".", "Cancello il fattore comune: " + M(frac(numF, denF) + "=" + atex) + "."] };
  },
});

sk({
  id: "c1-fraction-somme", ch: 2, title: "Sommare frazioni con la x",
  learn: L({
    idea: "Stessa idea delle frazioni con i numeri: serve un denominatore comune. Con la x, di solito il denominatore comune è il <b>prodotto</b> dei due denominatori.",
    rule: M("\\frac{a}{x+p}+\\frac{b}{x+q}=\\frac{a(x+q)+b(x+p)}{(x+p)(x+q)}") + ".",
    steps: ["Denominatore comune: il prodotto dei denominatori (se non hanno niente in comune).", "Moltiplica ogni numeratore per quello che manca al suo denominatore.", "Sviluppa e riduci solo il numeratore.", "Lascia il denominatore scomposto."],
    trap: "Con un « − » tra le frazioni, metti il secondo numeratore tra parentesi: " + M("-\\,b(x+p)=-bx-bp") + ".",
    input: "<code>(3x-1)/((x-1)(x+1))</code>.",
  }),
  gen() {
    const t = ri(1, 3);
    let p = rnz(-5, 5), qq = rnz(-5, 5); while (qq === p) qq = rnz(-5, 5);
    const a = rnz(-6, 6), b = rnz(-6, 6), X = r => linT(1, r), Xi = r => linIn(1, r);
    if (t === 1) {
      const N = [a + b, a * qq + b * p]; if (N[0] === 0 && N[1] === 0) return this.gen();
      return { q: "Scrivi come una sola frazione: " + M(frac(a, X(p)) + (b < 0 ? "-" : "+") + frac(Math.abs(b), X(qq))), type: "expr", ans: "(" + linIn(N[0], N[1]) + ")/((" + Xi(p) + ")(" + Xi(qq) + "))", form: ["oneFrac"], atex: frac(linT(N[0], N[1]), pr(X(p)) + pr(X(qq))),
        sol: ["Denominatore comune: " + M(pr(X(p)) + pr(X(qq))) + ".", "Numeratore: " + M(tx(a) + pr(X(qq)) + (b < 0 ? "-" : "+") + Math.abs(b) + pr(X(p)) + "=" + linT(N[0], N[1])) + ".", "Risultato: " + M(frac(linT(N[0], N[1]), pr(X(p)) + pr(X(qq)))) + "."] };
    }
    if (t === 2) {
      const A = ri(1, 6), B = ri(1, 6), N = [A - B, A * p]; if (N[0] === 0 && N[1] === 0) return this.gen();
      return { q: "Scrivi come una sola frazione: " + M(frac(A, "x") + "-" + frac(B, X(p))), type: "expr", ans: "(" + linIn(N[0], N[1]) + ")/(x(" + Xi(p) + "))", form: ["oneFrac"], atex: frac(linT(N[0], N[1]), "x" + pr(X(p))),
        sol: ["Denominatore comune: " + M("x" + pr(X(p))) + ".", "Numeratore: " + M(A + pr(X(p)) + "-" + B + "x=" + linT(N[0], N[1])) + ".", "Risultato: " + M(frac(linT(N[0], N[1]), "x" + pr(X(p)))) + "."] };
    }
    const k = rnz(-4, 4); const N = [k, k * p + a];
    return { q: "Scrivi come una sola frazione: " + M(k + (a < 0 ? "-" : "+") + frac(Math.abs(a), X(p))), type: "expr", ans: "(" + linIn(N[0], N[1]) + ")/(" + Xi(p) + ")", form: ["oneFrac"], atex: frac(linT(N[0], N[1]), X(p)),
      sol: [M(k + "=" + frac(k + pr(X(p)), X(p))) + ".", "Numeratore: " + M(k + pr(X(p)) + sgnTex(a) + "=" + linT(N[0], N[1])) + ".", "Risultato: " + M(frac(linT(N[0], N[1]), X(p))) + "."] };
  },
});
