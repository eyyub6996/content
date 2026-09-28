/* =====================================================================
   LEZIONI — struttura comune + Tappa 0 « Le basi da zero »
   Ogni lezione: una spiegazione semplice + un generatore di esercizi
   (testo, risposta attesa, correzione passo per passo, errori tipici).
   ===================================================================== */
const SKILLS = [];
function sk(o) { SKILLS.push(o); }
function L(o) {
  let h = "";
  if (o.idea) h += '<div class="box idea"><div class="bt">L\'idea, in parole semplici</div>' + (o.idea.startsWith("<") ? o.idea : "<p>" + o.idea + "</p>") + "</div>";
  if (o.pic) h += o.pic;
  if (o.rule) h += '<div class="box remember"><div class="bt">Da ricordare</div>' + (o.rule.startsWith("<") ? o.rule : "<p>" + o.rule + "</p>") + "</div>";
  if (o.steps) h += '<div class="box method"><div class="bt">Come si fa</div><ol>' + o.steps.map(s => "<li>" + s + "</li>").join("") + "</ol></div>";
  if (o.trap) h += '<div class="box warn"><div class="bt">Attenzione</div><p>' + o.trap + "</p></div>";
  if (o.input) h += '<p class="muted small"><b>Come scrivere la risposta:</b> ' + o.input + "</p>";
  return h;
}
const CHAPTERS = [
  { n: 0, name: "Le basi da zero", short: "Basi", sub: "Numeri negativi, frazioni, potenze, lettere, prime equazioni" },
  { n: 1, name: "Leggere la matematica", short: "Lettura", sub: "Segni, ordine delle operazioni, intervalli, insiemi di numeri" },
  { n: 2, name: "Il calcolo", short: "Calcolo", sub: "Frazioni, potenze, radici, sviluppare e scomporre" },
  { n: 3, name: "Equazioni e disequazioni", short: "Equazioni", sub: "Primo e secondo grado, sistemi, studio del segno" },
  { n: 4, name: "Trigonometria", short: "Trigonometria", sub: "Triangolo rettangolo, radianti, circonferenza, seno e coseno" },
  { n: 5, name: "Funzioni, esponenziale e logaritmo", short: "Funzioni", sub: "Dominio, eˣ, ln, limiti, asintoti" },
  { n: 6, name: "Derivate", short: "Derivate", sub: "Regole di derivazione, tangente, crescita, massimi e minimi" },
  { n: 7, name: "Integrali", short: "Integrali", sub: "Primitive, aree, valor medio, integrazione per parti" },
  { n: 8, name: "Vettori", short: "Vettori", sub: "Coordinate, prodotto scalare e vettoriale, rette e piani" },
  { n: 9, name: "Numeri complessi", short: "Complessi", sub: "i² = −1, modulo, argomento, forma esponenziale, impedenze" },
  { n: 10, name: "Il francese dell'esame", short: "Francese", sub: "Le parole e le frasi dell'esame, tradotte" },
];

/* ---------- utilità per gli intervalli ---------- */
function ivS(lo, hi, lc, rc) { const b = x => (x === Infinity ? "+inf" : x === -Infinity ? "-inf" : st(x)); return (lc ? "[" : "]") + b(lo) + ";" + b(hi) + (rc ? "]" : "["); }
function ivT(lo, hi, lc, rc) { const b = x => (x === Infinity ? "+\\infty" : x === -Infinity ? "-\\infty" : tx(x)); return (lc ? "\\left[" : "\\left]") + b(lo) + "\\,;\\," + b(hi) + (rc ? "\\right]" : "\\right["); }
const IV = (lo, hi, lc, rc) => ({ lo, hi, lc: lc && isFinite(lo), rc: rc && isFinite(hi) });

/* ---------- disegni ---------- */
let SVGID = 0;
function numberLine(o) { // o = {min, max, pts:[{v, lab}], arrow:{from, to, lab}}
  const min = o.min, max = o.max, W = 360, pad = 18, top = o.arrow ? 46 : 20, H = top + 42, y = top + 8;
  const X = v => pad + ((v - min) / (max - min)) * (W - 2 * pad);
  const step = max - min > 24 ? 5 : max - min > 14 ? 2 : 1;
  let g = '<line class="nl" x1="' + (pad - 10) + '" y1="' + y + '" x2="' + (W - pad + 10) + '" y2="' + y + '"/>';
  for (let v = min; v <= max; v++) { g += '<line class="nt" x1="' + X(v).toFixed(1) + '" y1="' + (y - 5) + '" x2="' + X(v).toFixed(1) + '" y2="' + (y + 5) + '"/>'; if (v % step === 0) g += '<text class="nx' + (v === 0 ? " z" : "") + '" x="' + X(v).toFixed(1) + '" y="' + (y + 22) + '">' + (v < 0 ? "−" + -v : v) + "</text>"; }
  if (o.arrow) {
    const a = X(o.arrow.from), b = X(o.arrow.to), id = "ah" + ++SVGID, h = Math.min(30, 12 + Math.abs(b - a) / 6);
    g += '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="nah"/></marker></defs>';
    g += '<path class="na" d="M' + a.toFixed(1) + " " + (y - 8) + " Q" + ((a + b) / 2).toFixed(1) + " " + (y - 8 - 2 * h).toFixed(1) + " " + b.toFixed(1) + " " + (y - 8) + '" marker-end="url(#' + id + ')"/>';
    g += '<text class="nal" x="' + ((a + b) / 2).toFixed(1) + '" y="' + (y - 12 - h).toFixed(1) + '">' + o.arrow.lab + "</text>";
  }
  (o.pts || []).forEach(p => { g += '<circle class="np" cx="' + X(p.v).toFixed(1) + '" cy="' + y + '" r="6"/>'; if (p.lab) g += '<text class="npl" x="' + X(p.v).toFixed(1) + '" y="' + (y - 12) + '">' + p.lab + "</text>"; });
  return '<figure class="pic"><svg viewBox="0 0 ' + W + " " + H + '" class="nline" role="img" aria-label="Retta dei numeri">' + g + "</svg></figure>";
}
function pizza(n, k) {
  const R = 60, c = 70; let g = "";
  for (let i = 0; i < n; i++) {
    const a0 = (2 * Math.PI * i) / n - Math.PI / 2, a1 = (2 * Math.PI * (i + 1)) / n - Math.PI / 2;
    const x0 = c + R * Math.cos(a0), y0 = c + R * Math.sin(a0), x1 = c + R * Math.cos(a1), y1 = c + R * Math.sin(a1);
    g += '<path class="' + (i < k ? "pz on" : "pz") + '" d="M' + c + " " + c + "L" + x0.toFixed(1) + " " + y0.toFixed(1) + "A" + R + " " + R + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + x1.toFixed(1) + " " + y1.toFixed(1) + 'Z"/>';
  }
  return '<figure class="pic"><svg viewBox="0 0 140 140" class="pizza" role="img" aria-label="Pizza divisa in ' + n + " fette, " + k + ' colorate">' + g + "</svg></figure>";
}
function gridPoint(px, py, lab) {
  const W = 220, s = 22, c = W / 2; let g = "";
  for (let i = -4; i <= 4; i++) { g += '<line class="pg" x1="' + (c + i * s) + '" y1="' + (c - 4.5 * s) + '" x2="' + (c + i * s) + '" y2="' + (c + 4.5 * s) + '"/><line class="pg" x1="' + (c - 4.5 * s) + '" y1="' + (c + i * s) + '" x2="' + (c + 4.5 * s) + '" y2="' + (c + i * s) + '"/>'; }
  g += '<line class="pa" x1="' + (c - 4.8 * s) + '" y1="' + c + '" x2="' + (c + 4.8 * s) + '" y2="' + c + '"/><line class="pa" x1="' + c + '" y1="' + (c - 4.8 * s) + '" x2="' + c + '" y2="' + (c + 4.8 * s) + '"/>';
  for (let i = -4; i <= 4; i++) if (i) { g += '<text class="pt" x="' + (c + i * s) + '" y="' + (c + 14) + '" text-anchor="middle">' + i + '</text><text class="pt" x="' + (c - 6) + '" y="' + (c - i * s + 4) + '" text-anchor="end">' + i + "</text>"; }
  g += '<text class="pt" x="' + (c + 4.6 * s) + '" y="' + (c - 6) + '">x</text><text class="pt" x="' + (c + 6) + '" y="' + (c - 4.4 * s) + '">y</text>';
  g += '<circle class="gpt" cx="' + (c + px * s) + '" cy="' + (c - py * s) + '" r="6"/><text class="gptl" x="' + (c + px * s + 8) + '" y="' + (c - py * s - 8) + '">' + lab + "</text>";
  return '<figure class="pic"><svg viewBox="0 0 ' + W + " " + W + '" class="grid" role="img" aria-label="Piano cartesiano con un punto">' + g + "</svg></figure>";
}
function balancePic(left, right) {
  return '<figure class="pic"><svg viewBox="0 0 300 150" class="balance" role="img" aria-label="Bilancia in equilibrio"><path class="bb" d="M150 40 L150 128 M110 132 H190"/><path class="bb" d="M40 40 H260"/><path class="bb" d="M40 40 L20 90 M40 40 L60 90 M260 40 L240 90 M260 40 L280 90"/><path class="bp" d="M10 90 H70 Q40 112 10 90Z M230 90 H290 Q260 112 230 90Z"/><circle class="bpv" cx="150" cy="40" r="5"/><text class="bt1" x="40" y="80">' + left + '</text><text class="bt1" x="260" y="80">' + right + "</text></svg></figure>";
}

/* =========================== TAPPA 0 =========================== */
const nT = v => (v < 0 ? "(" + v + ")" : String(v)); // numero negativo tra parentesi (in TeX va bene "-")
sk({
  id: "b0-retta", ch: 0, title: "Numeri positivi e negativi", target: 5,
  learn: L({
    idea: "Pensa a un <b>termometro</b>. Sopra lo zero ci sono i numeri positivi (+3 = 3 gradi), sotto lo zero i numeri negativi (−3 = 3 gradi sotto zero). Sulla <b>retta dei numeri</b> è lo stesso, ma coricato: a destra i positivi, a sinistra i negativi.",
    pic: numberLine({ min: -6, max: 6, pts: [{ v: -3, lab: "−3" }, { v: 2, lab: "2" }] }),
    rule: "Più un numero è <b>a destra</b>, più è <b>grande</b>. Quindi −2 è più grande di −7: a −2 gradi fa meno freddo che a −7.",
    steps: ["Immagina la retta dei numeri (o il termometro).", "Metti i due numeri al loro posto.", "Quello più a destra è il più grande."],
    trap: "−7 sembra « più grande » di −2 perché 7 è più di 2. Ma è il contrario: −7 è più freddo, quindi è più piccolo.",
  }),
  gen() {
    if (rnd() < 0.6) {
      let a = ri(-9, 9), b = ri(-9, 9); while (b === a) b = ri(-9, 9); if (a >= 0 && b >= 0) a = -a - 1;
      const big = Math.max(a, b), lo = Math.min(a, b);
      return { q: "Quale numero è più grande?", type: "choice", opts: [M(a), M(b)], a: a > b ? 0 : 1, atex: "", fixed: true,
        sol: ["Mettiamo i due numeri sulla retta:", numberLine({ min: Math.min(-6, lo - 1), max: Math.max(6, big + 1), pts: [{ v: a, lab: String(a).replace("-", "−") }, { v: b, lab: String(b).replace("-", "−") }] }), M(big) + " è più a destra, quindi è il più grande."] };
    }
    const a = ri(-9, -1), b = ri(1, 9);
    return { q: "Stamattina il termometro segnava " + M(a + "\\,\\text{°C}") + ", adesso segna " + M(b + "\\,\\text{°C}") + ". Di quanti gradi è salita la temperatura?", type: "num", ans: String(b - a), form: ["rat"], atex: (b - a) + "\\,\\text{°C}",
      traps: [{ ans: String(b + a), m: "Conta tutti i gradi: da " + a + " fino a 0 (" + -a + " gradi), poi da 0 fino a " + b + " (" + b + " gradi)." }],
      sol: [numberLine({ min: Math.min(-10, a - 1), max: Math.max(10, b + 1), arrow: { from: a, to: b, lab: "+" + (b - a) } }), "Da " + M(a) + " a 0: " + -a + " gradi. Da 0 a " + M(b) + ": " + b + " gradi.", "In tutto: " + M(-a + "+" + b + "=" + (b - a)) + " gradi."] };
  },
});

sk({
  id: "b0-somma-negativi", ch: 0, title: "Sommare e sottrarre con i negativi",
  learn: L({
    idea: "Usa il termometro: <b>+ vuol dire salire</b>, <b>− vuol dire scendere</b>. Per −3 + 5: parti da −3 e sali di 5 gradini: arrivi a 2.",
    pic: numberLine({ min: -6, max: 6, arrow: { from: -3, to: 2, lab: "+5" }, pts: [{ v: -3, lab: "partenza" }] }),
    rule: "+ = sali (vai a destra). − = scendi (vai a sinistra)." + D("-3+5=2\\qquad 2-6=-4\\qquad -1-4=-5"),
    steps: ["Metti il dito sul primo numero.", "Se c'è + sali, se c'è − scendi, di tanti passi quanto dice il secondo numero.", "Leggi il numero dove sei arrivato."],
    trap: "−1 − 4 non fa 3 e nemmeno −3: parti da −1 e scendi di 4, arrivi a −5.",
  }),
  gen() {
    const a = ri(-9, 9), b = ri(1, 9), plus = coin(), r = plus ? a + b : a - b;
    return { q: "Calcola: " + M(a + (plus ? "+" : "-") + b), type: "num", ans: String(r), form: ["rat"], atex: String(r),
      sol: ["Parti da " + M(a) + ". Il segno " + (plus ? "+ vuol dire <b>salire</b>" : "− vuol dire <b>scendere</b>") + " di " + b + " passi.", numberLine({ min: Math.min(a, r) - 1, max: Math.max(a, r) + 1, arrow: { from: a, to: r, lab: (plus ? "+" : "−") + b } }), "Arrivi a " + M(r) + "."] };
  },
});

sk({
  id: "b0-meno-meno", ch: 0, title: "Togliere un numero negativo",
  learn: L({
    idea: "Togliere un debito è come ricevere dei soldi: se qualcuno ti cancella un debito di 3 €, stai meglio di 3 €. Per questo <b>− (−3)</b> diventa <b>+ 3</b>.",
    rule: "Due segni <b>uguali</b> vicini diventano <b>+</b>: " + M("-(-3)=+3") + ". Due segni <b>diversi</b> vicini diventano <b>−</b>: " + M("+(-3)=-3") + ".",
    steps: ["Guarda i due segni vicini: quello dell'operazione e quello del numero tra parentesi.", "Uguali (− − oppure + +) → +. Diversi (+ − oppure − +) → −.", "Ora calcola come nella lezione precedente (sali o scendi)."],
    trap: M("5-(-3)") + " non fa 2: i due meno diventano un più, quindi " + M("5+3=8") + ".",
  }),
  gen() {
    const a = ri(-9, 9), b = ri(1, 9), minus = coin(); const r = minus ? a + b : a - b;
    const q0 = a + (minus ? "-" : "+") + "(-" + b + ")";
    return { q: "Calcola: " + M(q0), type: "num", ans: String(r), form: ["rat"], atex: String(r),
      traps: [{ ans: String(minus ? a - b : a + b), m: minus ? "Due meno vicini diventano un più: " + M("-(-" + b + ")=+" + b) + "." : "Un più e un meno vicini diventano un meno: " + M("+(-" + b + ")=-" + b) + "." }],
      sol: ["Segni vicini: " + (minus ? "− e − (uguali) → <b>+</b>" : "+ e − (diversi) → <b>−</b>") + ".", M(q0 + "=" + a + (minus ? "+" : "-") + b) + ".", (minus ? "Sali" : "Scendi") + " di " + b + " partendo da " + a + ": " + M(r) + "."] };
  },
});

sk({
  id: "b0-segni", ch: 0, title: "Moltiplicare e dividere con i segni",
  learn: L({
    idea: "Per × e : la regola è diversa (e più semplice): si guardano solo i <b>segni dei due numeri</b>.",
    rule: "<b>Segni uguali → risultato positivo.</b> <b>Segni diversi → risultato negativo.</b>" + D("(-3)\\times(-4)=12\\qquad (-3)\\times4=-12\\qquad (-12):(-3)=4\\qquad 12:(-3)=-4"),
    steps: ["Calcola il numero senza pensare ai segni (3 × 4 = 12).", "Guarda i segni: uguali → +, diversi → −.", "Metti il segno davanti al risultato."],
    trap: "Non confondere con la somma: " + M("-3-4=-7") + " ma " + M("(-3)\\times(-4)=+12") + ".",
  }),
  gen() {
    const a = rnz(-9, 9), b = rnz(-9, 9); const div = coin();
    if (a > 0 && b > 0) return this.gen();
    if (div) { const p = a * b; return { q: "Calcola: " + M(tp(p) + ":" + tp(b)), type: "num", ans: String(a), form: ["rat"], atex: String(a),
      traps: [{ ans: String(-a), m: "Controlla i segni: " + (Math.sign(p) === Math.sign(b) ? "uguali → risultato positivo." : "diversi → risultato negativo.") }],
      sol: ["Senza segni: " + M(Math.abs(p) + ":" + Math.abs(b) + "=" + Math.abs(a)) + ".", "Segni " + (Math.sign(p) === Math.sign(b) ? "uguali → +" : "diversi → −") + ".", "Risultato: " + M(a) + "."] }; }
    const r = a * b;
    return { q: "Calcola: " + M(tp(a) + "\\times" + tp(b)), type: "num", ans: String(r), form: ["rat"], atex: String(r),
      traps: [{ ans: String(-r), m: "Controlla i segni: " + (Math.sign(a) === Math.sign(b) ? "uguali → risultato positivo." : "diversi → risultato negativo.") }],
      sol: ["Senza segni: " + M(Math.abs(a) + "\\times" + Math.abs(b) + "=" + Math.abs(r)) + ".", "Segni " + (Math.sign(a) === Math.sign(b) ? "uguali → +" : "diversi → −") + ".", "Risultato: " + M(r) + "."] };
  },
});

sk({
  id: "b0-ordine", ch: 0, title: "L'ordine delle operazioni",
  learn: L({
    idea: "In un calcolo non si va semplicemente da sinistra a destra. C'è una « fila con precedenza », come al pronto soccorso: prima passano le <b>parentesi</b>, poi le <b>moltiplicazioni e divisioni</b>, e per ultime le <b>addizioni e sottrazioni</b>.",
    rule: "1. Parentesi → 2. Potenze → 3. × e : → 4. + e −" + D("2+3\\times4=2+12=14"),
    steps: ["C'è una parentesi? Calcola prima quella.", "Poi fai le × e le :.", "Per ultime le + e le −, da sinistra a destra.", "Riscrivi tutta la riga a ogni passo."],
    trap: M("2+3\\times4") + " non fa 20 (sarebbe fare prima 2 + 3). La × passa prima: fa 14.",
  }),
  gen() {
    const t = ri(1, 4), a = ri(1, 9), b = ri(2, 9), c = ri(2, 9);
    if (t === 1) { const v = a + b * c; return { q: "Calcola: " + M(a + "+" + b + "\\times" + c), type: "num", ans: String(v), form: ["rat"], atex: String(v), traps: [{ ans: String((a + b) * c), m: "La moltiplicazione va fatta prima dell'addizione." }], sol: ["Prima la ×: " + M(b + "\\times" + c + "=" + b * c) + ".", "Poi la +: " + M(a + "+" + b * c + "=" + v) + "."] }; }
    if (t === 2) { const v = (a + b) * c; return { q: "Calcola: " + M("(" + a + "+" + b + ")\\times" + c), type: "num", ans: String(v), form: ["rat"], atex: String(v), traps: [{ ans: String(a + b * c), m: "La parentesi va calcolata per prima." }], sol: ["Prima la parentesi: " + M(a + "+" + b + "=" + (a + b)) + ".", "Poi la ×: " + M((a + b) + "\\times" + c + "=" + v) + "."] }; }
    if (t === 3) { const k = ri(2, 9), d = ri(2, 5), A = ri(k + 1, 30), v = A - k; return { q: "Calcola: " + M(A + "-" + k * d + ":" + d), type: "num", ans: String(v), form: ["rat"], atex: String(v), sol: ["Prima la divisione: " + M(k * d + ":" + d + "=" + k) + ".", "Poi la sottrazione: " + M(A + "-" + k + "=" + v) + "."] }; }
    const d = ri(1, 8), e = d + ri(1, 5), v = a * (e - d);
    return { q: "Calcola: " + M(a + "\\times(" + e + "-" + d + ")"), type: "num", ans: String(v), form: ["rat"], atex: String(v), sol: ["Prima la parentesi: " + M(e + "-" + d + "=" + (e - d)) + ".", "Poi la ×: " + M(a + "\\times" + (e - d) + "=" + v) + "."] };
  },
});

sk({
  id: "b0-frazione", ch: 0, title: "Che cos'è una frazione",
  learn: L({
    idea: "Una frazione è <b>una parte di un intero</b>. Se tagli una pizza in 8 fette uguali e ne prendi 3, hai preso " + M("\\frac38") + " della pizza. Il numero <b>sotto</b> (denominatore) dice in quante parti tagli; il numero <b>sopra</b> (numeratore) dice quante parti prendi.",
    pic: pizza(8, 3),
    rule: M("\\frac ab") + " = prendo a parti su b. Per calcolare " + M("\\frac34") + " di 20: dividi per il numero sotto, poi moltiplica per quello sopra: " + M("20:4=5") + ", " + M("5\\times3=15") + ".",
    steps: ["Il numero sotto: in quante parti è diviso l'intero.", "Il numero sopra: quante parti prendi.", "« Frazione di un numero »: prima dividi per il numero sotto, poi moltiplichi per quello sopra."],
    trap: "La linea di frazione è una divisione: " + M("\\frac{3}{4}") + " vuol dire anche 3 : 4.",
    input: "una frazione si scrive con la barra: <code>3/8</code>.",
  }),
  gen() {
    if (coin()) {
      const n = pick([3, 4, 5, 6, 8, 10, 12]), k = ri(1, n - 1);
      return { q: "Che frazione della pizza è colorata?" + pizza(n, k), type: "num", ans: k + "/" + n, atex: frac(k, n),
        sol: ["La pizza è tagliata in <b>" + n + "</b> fette uguali: è il numero sotto.", "Le fette colorate sono <b>" + k + "</b>: è il numero sopra.", "Frazione: " + M(frac(k, n)) + (gcd(k, n) > 1 ? " (che si può anche scrivere " + M(q(k, n).tex()) + ")." : ".")] };
    }
    const n = pick([2, 3, 4, 5, 10]), k = ri(1, n - 1), m = ri(2, 12), N = n * m;
    return { q: "Quanto fa " + M(frac(k, n)) + " di " + N + "?", type: "num", ans: String(k * m), form: ["rat"], atex: String(k * m),
      traps: [{ ans: String(N * n / k), m: "Prima si divide per il numero <b>sotto</b> (" + n + "), poi si moltiplica per quello sopra (" + k + ")." }],
      sol: ["Dividi per il numero sotto: " + M(N + ":" + n + "=" + m) + " (è una parte).", "Moltiplica per il numero sopra: " + M(m + "\\times" + k + "=" + k * m) + "."] };
  },
});

sk({
  id: "b0-semplificare", ch: 0, title: "Semplificare una frazione",
  learn: L({
    idea: M("\\frac68") + " e " + M("\\frac34") + " sono la <b>stessa quantità</b> di pizza (6 fette piccole oppure 3 fette grandi). Semplificare vuol dire scrivere la frazione con numeri più piccoli.",
    rule: "Dividi il numero sopra <b>e</b> quello sotto per lo stesso numero, finché non esiste più un divisore comune." + D("\\frac{6}{8}=\\frac{6:2}{8:2}=\\frac34"),
    steps: ["Cerca un numero che divide sia sopra sia sotto: prova 2, poi 3, poi 5…", "Dividi tutti e due.", "Ripeti finché puoi. Quando non puoi più, la frazione è « ridotta ai minimi termini »."],
    trap: "Dividi sempre sopra <b>e</b> sotto per lo stesso numero, mai uno solo dei due.",
  }),
  gen() {
    const b = ri(2, 9); let a; do a = ri(1, 2 * b); while (gcd(a, b) !== 1 || a === b); const m = ri(2, 6);
    return { q: "Semplifica il più possibile: " + M(frac(a * m, b * m)), type: "num", ans: a + "/" + b, form: ["irr"], atex: frac(a, b),
      sol: [a * m + " e " + b * m + " si possono dividere tutti e due per " + m + ".", M(frac(a * m + ":" + m, b * m + ":" + m) + "=" + frac(a, b)) + ".", a + " e " + b + " non hanno più divisori in comune: finito."] };
  },
});

sk({
  id: "b0-equivalenti", ch: 0, title: "Frazioni equivalenti",
  learn: L({
    idea: "Se moltiplichi sopra e sotto per lo stesso numero, la frazione non cambia: " + M("\\frac12=\\frac24=\\frac36") + " (mezza pizza è sempre mezza pizza). Ci servirà per sommare le frazioni.",
    rule: M("\\frac ab=\\frac{a\\times k}{b\\times k}") + ": quello che fai sotto, lo fai anche sopra.",
    steps: ["Guarda il numero che conosci già nella nuova frazione.", "Chiediti: per quanto ho moltiplicato? (per esempio da 4 a 12: × 3).", "Fai la stessa cosa all'altro numero."],
  }),
  gen() {
    const b = ri(2, 9); let a; do a = ri(1, b - 1); while (gcd(a, b) !== 1); const m = ri(2, 6);
    if (coin()) return { q: "Completa: " + M(frac(a, b) + "=" + frac("?", b * m)), type: "num", ans: String(a * m), form: ["rat"], atex: String(a * m),
      sol: ["Sotto: da " + b + " a " + b * m + " hai moltiplicato per " + m + ".", "Fai lo stesso sopra: " + M(a + "\\times" + m + "=" + a * m) + "."] };
    return { q: "Completa: " + M(frac(a, b) + "=" + frac(a * m, "?")), type: "num", ans: String(b * m), form: ["rat"], atex: String(b * m),
      sol: ["Sopra: da " + a + " a " + a * m + " hai moltiplicato per " + m + ".", "Fai lo stesso sotto: " + M(b + "\\times" + m + "=" + b * m) + "."] };
  },
});

sk({
  id: "b0-somma-frazioni", ch: 0, title: "Sommare frazioni con lo stesso denominatore",
  learn: L({
    idea: "Se le fette sono della stessa grandezza (stesso numero sotto), basta contarle: " + M("\\frac27+\\frac37=\\frac57") + ": 2 fette più 3 fette fanno 5 fette, sempre di settimi.",
    rule: M("\\frac ac+\\frac bc=\\frac{a+b}{c}") + ". Il numero sotto <b>non cambia</b>.",
    steps: ["Controlla che il numero sotto sia lo stesso.", "Somma (o sottrai) i numeri sopra.", "Il numero sotto resta uguale."],
    trap: M("\\frac27+\\frac37") + " non fa " + M("\\frac5{14}") + ": il numero sotto resta 7.",
  }),
  gen() {
    const c = ri(3, 12); let a, b, plus, r;
    do { a = ri(1, c); b = ri(1, c); plus = coin(); r = plus ? a + b : a - b; } while (r === 0 || gcd(Math.abs(r), c) !== 1);
    const res = q(r, c);
    return { q: "Calcola: " + M(frac(a, c) + (plus ? "+" : "-") + frac(b, c)), type: "num", ans: res.plain(), form: ["irr"], atex: res.tex(),
      traps: plus ? [{ ans: r + "/" + 2 * c, m: "Il numero sotto non si somma: resta " + c + "." }] : [],
      sol: ["Stesso numero sotto (" + c + "): si " + (plus ? "sommano" : "sottraggono") + " solo i numeri sopra.", M(frac(a + (plus ? "+" : "-") + b, c) + "=" + res.tex()) + "."] };
  },
});

sk({
  id: "b0-per-frazioni", ch: 0, title: "Moltiplicare le frazioni",
  learn: L({
    idea: "Per moltiplicare due frazioni non serve nessun trucco: <b>sopra per sopra, sotto per sotto</b>.",
    rule: M("\\frac ab\\times\\frac cd=\\frac{a\\times c}{b\\times d}") + ". Un numero intero è una frazione con 1 sotto: " + M("3=\\frac31") + ".",
    steps: ["Moltiplica i numeri sopra.", "Moltiplica i numeri sotto.", "Semplifica se puoi."],
  }),
  gen() {
    if (coin()) { const k = ri(2, 5), b = ri(2, 9); let a; do a = ri(1, b - 1); while (gcd(a, b) !== 1); const r = q(k * a, b);
      return { q: "Calcola: " + M(k + "\\times" + frac(a, b)), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
        sol: [M(k + "=" + frac(k, 1)) + ".", M(frac(k, 1) + "\\times" + frac(a, b) + "=" + frac(k + "\\times" + a, "1\\times" + b) + "=" + frac(k * a, b)) + (r.d !== b ? "=" + M(r.tex()) : "") + "."] }; }
    const a = ri(1, 5), b = ri(2, 6), c = ri(1, 5), d = ri(2, 6); const r = q(a * c, b * d);
    return { q: "Calcola: " + M(frac(a, b) + "\\times" + frac(c, d)), type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
      sol: ["Sopra per sopra: " + M(a + "\\times" + c + "=" + a * c) + ". Sotto per sotto: " + M(b + "\\times" + d + "=" + b * d) + ".", M(frac(a * c, b * d)) + (r.d !== b * d ? ", che si semplifica in " + M(r.tex()) : "") + "."] };
  },
});

sk({
  id: "b0-decimali", ch: 0, title: "Frazioni e numeri con la virgola",
  learn: L({
    idea: "Un numero con la virgola è un altro modo di scrivere una frazione: 0,5 è la metà, cioè " + M("\\frac12") + ".",
    rule: M("\\frac12=0{,}5\\quad \\frac14=0{,}25\\quad \\frac34=0{,}75\\quad \\frac15=0{,}2\\quad \\frac1{10}=0{,}1") + ". Da frazione a decimale: dividi il numero sopra per quello sotto.",
    steps: ["Frazione → decimale: fai la divisione sopra : sotto.", "Decimale → frazione: 0,25 = 25 centesimi = " + M("\\frac{25}{100}") + ", poi semplifica."],
    input: "il decimale si scrive con la virgola o con il punto: <code>0,75</code> oppure <code>0.75</code>.",
  }),
  gen() {
    const L0 = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [1, 20], [3, 20], [1, 25], [5, 4], [3, 2], [7, 4]];
    const [a, b] = pick(L0), v = a / b, vs = String(v), vt = vs.replace(".", "{,}");
    if (coin()) return { q: "Scrivi " + M(frac(a, b)) + " come numero con la virgola.", type: "num", ans: vs, form: ["dec"], atex: vt, sol: ["Dividi il numero sopra per quello sotto: " + M(a + ":" + b + "=" + vt) + "."] };
    const den = Math.pow(10, (vs.split(".")[1] || "").length), num = Math.round(v * den);
    return { q: "Scrivi " + M(vt) + " come frazione semplificata.", type: "num", ans: a + "/" + b, form: ["irr"], atex: frac(a, b),
      sol: [M(vt + "=" + frac(num, den)) + " (" + (den === 10 ? "decimi" : den === 100 ? "centesimi" : "millesimi") + ").", "Semplifica: " + M(frac(num, den) + "=" + frac(a, b)) + "."] };
  },
});

sk({
  id: "b0-potenze", ch: 0, title: "Le potenze",
  learn: L({
    idea: M("2^3") + " è un modo corto di scrivere " + M("2\\times2\\times2") + ": il 2 moltiplicato per sé stesso <b>3 volte</b>. Il numerino in alto (l'esponente) dice quante volte.",
    rule: M("a^n=a\\times a\\times\\ldots\\times a") + " (n volte). " + M("a^1=a") + ". " + M("a^0=1") + " (sempre, è una regola). " + M("10^n") + " = 1 seguito da n zeri.",
    steps: ["Scrivi il numero tante volte quanto dice l'esponente.", "Moltiplica passo per passo."],
    trap: M("2^3") + " non fa " + M("2\\times3=6") + ": fa " + M("2\\times2\\times2=8") + ".",
    input: "per scrivere « alla » usa il simbolo ^: <code>2^3</code>.",
  }),
  gen() {
    const a = ri(2, 10), n = a <= 3 ? ri(0, 5) : a <= 5 ? ri(0, 3) : a === 10 ? ri(0, 5) : ri(0, 2); const v = Math.pow(a, n);
    const prod = n === 0 ? "" : Array(n).fill(a).join("\\times");
    return { q: "Calcola: " + M(a + "^{" + n + "}"), type: "num", ans: String(v), form: ["rat"], atex: String(v),
      traps: n > 1 ? [{ ans: String(a * n), m: "Non è " + a + " × " + n + ": è " + a + " moltiplicato per sé stesso " + n + " volte." }] : [],
      sol: n === 0 ? ["Qualsiasi numero (tranne 0) alla potenza 0 fa 1. È una regola da ricordare."] : n === 1 ? ["Esponente 1: il numero resta lui stesso."] : [M(a + "^{" + n + "}=" + prod) + ".", "= " + M(v) + "."] };
  },
});

sk({
  id: "b0-radici", ch: 0, title: "Quadrati e radici quadrate",
  learn: L({
    idea: "La radice quadrata fa il <b>contrario</b> del quadrato. " + M("7^2=49") + ", quindi " + M("\\sqrt{49}=7") + ". Chiedersi " + M("\\sqrt{49}") + " vuol dire: quale numero, moltiplicato per sé stesso, fa 49?",
    rule: "I quadrati da conoscere: " + M("1,\\,4,\\,9,\\,16,\\,25,\\,36,\\,49,\\,64,\\,81,\\,100,\\,121,\\,144,\\,169,\\,196,\\,225") + " (sono " + M("1^2") + " fino a " + M("15^2") + ").",
    steps: ["Per " + M("n^2") + ": moltiplica n per sé stesso.", "Per " + M("\\sqrt{N}") + ": cerca nella lista dei quadrati il numero che dà N."],
    input: "la radice si scrive con il tasto √ oppure <code>sqrt(49)</code>.",
  }),
  gen() {
    const n = ri(1, 15), t = ri(1, 3);
    if (t === 1) return { q: "Calcola: " + M(n + "^2"), type: "num", ans: String(n * n), form: ["rat"], atex: String(n * n), traps: [{ ans: String(2 * n), m: M(n + "^2") + " vuol dire " + M(n + "\\times" + n) + ", non " + M(n + "\\times2") + "." }], sol: [M(n + "^2=" + n + "\\times" + n + "=" + n * n) + "."] };
    if (t === 2) return { q: "Calcola: " + M("\\sqrt{" + n * n + "}"), type: "num", ans: String(n), form: ["rat"], allow: [], atex: String(n), sol: ["Quale numero moltiplicato per sé stesso fa " + n * n + "? " + M(n + "\\times" + n + "=" + n * n) + ".", M("\\sqrt{" + n * n + "}=" + n) + "."] };
    return { q: "Quale numero positivo, al quadrato, fa " + M(n * n) + "?", type: "num", ans: String(n), form: ["rat"], allow: [], atex: String(n), sol: [M(n + "^2=" + n * n) + ", quindi il numero è " + M(n) + " (è " + M("\\sqrt{" + n * n + "}") + ")."] };
  },
});

sk({
  id: "b0-lettere", ch: 0, title: "Le lettere: sostituire un numero",
  learn: L({
    idea: "Una lettera, per esempio <b>x</b>, è una <b>scatola</b> che contiene un numero. Se x = 3, allora " + M("2x") + " vuol dire " + M("2\\times3=6") + ". Tra un numero e una lettera attaccati c'è sempre una <b>moltiplicazione nascosta</b>.",
    rule: M("2x=2\\times x") + ", " + M("x^2=x\\times x") + ". Se sostituisci un numero negativo, mettilo <b>tra parentesi</b>: se " + M("x=-2") + ", " + M("x^2=(-2)^2=4") + ".",
    steps: ["Riscrivi l'espressione mettendo delle parentesi al posto di ogni x.", "Metti il numero dentro le parentesi.", "Calcola con l'ordine delle operazioni."],
    trap: "Se " + M("x=-3") + ": " + M("x^2=(-3)^2=9") + ", non −9.",
  }),
  gen() {
    const x0 = rnz(-4, 5), a = rnz(-5, 6), b = ri(-9, 9), t = ri(1, 3);
    let expr, v, line;
    if (t === 1) { expr = polyT([a, b]); v = a * x0 + b; line = tx(a) + "\\times" + tp(x0) + sgnTex(b) + "=" + tp(a * x0) + sgnTex(b); }
    else if (t === 2) { expr = polyT([a, 0, b]); v = a * x0 * x0 + b; line = tx(a) + "\\times" + tp(x0) + "^2" + sgnTex(b) + "=" + tx(a) + "\\times" + x0 * x0 + sgnTex(b); }
    else { expr = "x^2" + mono(a, "x", false); v = x0 * x0 + a * x0; line = tp(x0) + "^2" + sgnTex(a) + "\\times" + tp(x0) + "=" + x0 * x0 + sgnTex(a * x0); }
    const traps = x0 < 0 && t >= 2 ? [{ ans: String(t === 2 ? -a * x0 * x0 + b : -x0 * x0 + a * x0), m: M(tp(x0) + "^2=" + x0 * x0) + ": il quadrato di un negativo è positivo. Usa le parentesi!" }] : [];
    return { q: "Se " + M("x=" + x0) + ", quanto vale " + M(expr) + "?", type: "num", ans: String(v), form: ["rat"], atex: String(v), traps,
      sol: ["Al posto di x metti " + M(tp(x0)) + " (tra parentesi).", M(line) + ".", "= " + M(v) + "."] };
  },
});

sk({
  id: "b0-termini-simili", ch: 0, title: "Sommare i termini simili",
  learn: L({
    idea: M("3x+5x") + ": sono 3 scatole x più 5 scatole x, cioè 8 scatole x. Si possono sommare solo cose <b>dello stesso tipo</b>: le x con le x, i numeri con i numeri (le mele con le mele).",
    rule: M("3x+5x=8x") + ". " + M("x") + " vuol dire " + M("1x") + ". " + M("2x+3") + " <b>non</b> si può sommare: resta " + M("2x+3") + ". Le " + M("x^2") + " sono un altro tipo ancora.",
    steps: ["Sottolinea con un colore tutti i termini con x, con un altro i numeri (e con un terzo le " + M("x^2") + ").", "Somma i numeri davanti alle x.", "Somma i numeri da soli.", "Scrivi il risultato: prima le " + M("x^2") + ", poi le x, poi il numero."],
    trap: M("2x+3") + " non fa " + M("5x") + ": x e numeri sono cose diverse.",
    input: "<code>6x+2</code>, <code>5x^2-x</code>.",
  }),
  gen() {
    const t = ri(1, 3), a = rnz(-6, 9), b = rnz(-6, 9), c = rnz(-6, 9), d = rnz(-9, 9);
    if (t === 1 || a + b === 0) { const s = a + b || a + b + 1; const bb = s - a; return { q: "Riduci: " + M(mono(a, "x", true) + mono(bb, "x", false)), type: "expr", ans: polyIn([s, 0]), form: ["expanded"], atex: polyT([s, 0]), traps: [{ ans: polyIn([s, 0, 0]), m: "x + x fa 2x, non " + M("x^2") + " (quello è x × x)." }], sol: ["Sono tutte x: sommo i numeri davanti. " + M(tx(a) + sgnTex(bb) + "=" + s) + ".", "Risultato: " + M(polyT([s, 0])) + "."] }; }
    if (t === 2) { const P = [a + c, b + d]; if (P[0] === 0) return this.gen();
      return { q: "Riduci: " + M(mono(a, "x", true) + sgnTex(b) + mono(c, "x", false) + sgnTex(d)), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P), traps: [{ ans: polyIn([a + b + c + d, 0]), m: "Le x e i numeri non si sommano tra loro." }],
        sol: ["Le x: " + M(mono(a, "x", true) + mono(c, "x", false) + "=" + mono(a + c, "x", true)) + ".", "I numeri: " + M(tx(b) + sgnTex(d) + "=" + (b + d)) + ".", "Risultato: " + M(polyT(P)) + "."] }; }
    const P = [a + c, b, 0]; if (P[0] === 0) return this.gen();
    return { q: "Riduci: " + M(mono(a, "x^2", true) + mono(b, "x", false) + mono(c, "x^2", false)), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      sol: ["Le " + M("x^2") + " con le " + M("x^2") + ": " + M(tx(a) + sgnTex(c) + "=" + (a + c)) + ".", "Le x restano da sole: " + M(mono(b, "x", true)) + ".", "Risultato: " + M(polyT(P)) + "."] };
  },
});

sk({
  id: "b0-prodotti-lettere", ch: 0, title: "Moltiplicare con le lettere",
  learn: L({
    idea: M("3\\times2x") + ": moltiplica i numeri (" + M("3\\times2=6") + ") e tieni la x: " + M("6x") + ". E " + M("x\\times x") + " si scrive " + M("x^2") + " (x al quadrato).",
    rule: M("a\\times bx=(a\\times b)\\,x") + ", " + M("x\\times x=x^2") + ", " + M("ax\\times bx=(a\\times b)\\,x^2") + ", " + M("x\\times x^2=x^3") + ".",
    steps: ["Moltiplica i numeri tra loro (attenzione ai segni).", "Conta le x: una x per un'altra x fa " + M("x^2") + ".", "Scrivi il numero davanti e la x dopo."],
    trap: M("2x\\times3x=6x^2") + ", non " + M("6x") + ": ci sono due x.",
    input: "<code>6x^2</code>.",
  }),
  gen() {
    const a = rnz(-5, 6), b = rnz(-5, 6), t = ri(1, 3);
    if (t === 1) return { q: "Calcola: " + M(tx(a) + "\\times" + (b < 0 ? "(" + mono(b, "x", true) + ")" : mono(b, "x", true))), type: "expr", ans: a * b + "x", form: ["mono"], atex: mono(a * b, "x", true), sol: ["Numeri: " + M(tp(a) + "\\times" + tp(b) + "=" + a * b) + ".", "Tengo la x: " + M(mono(a * b, "x", true)) + "."] };
    if (t === 2) return { q: "Calcola: " + M(mono(a, "x", true) + "\\times" + (b < 0 ? "(" + mono(b, "x", true) + ")" : mono(b, "x", true))), type: "expr", ans: a * b + "x^2", form: ["mono"], atex: mono(a * b, "x^2", true), traps: [{ ans: a * b + "x", m: "Ci sono due x: " + M("x\\times x=x^2") + "." }], sol: ["Numeri: " + M(tp(a) + "\\times" + tp(b) + "=" + a * b) + ".", M("x\\times x=x^2") + ".", "Risultato: " + M(mono(a * b, "x^2", true)) + "."] };
    return { q: "Calcola: " + M(mono(a, "x", true) + "\\times" + (b < 0 ? "(" + mono(b, "x^2", true) + ")" : mono(b, "x^2", true))), type: "expr", ans: a * b + "x^3", form: ["mono"], atex: mono(a * b, "x^3", true), sol: ["Numeri: " + M(tp(a) + "\\times" + tp(b) + "=" + a * b) + ".", M("x\\times x^2=x\\times x\\times x=x^3") + ".", "Risultato: " + M(mono(a * b, "x^3", true)) + "."] };
  },
});

sk({
  id: "b0-distributiva", ch: 0, title: "Togliere le parentesi",
  learn: L({
    idea: M("3(x+2)") + " vuol dire « 3 volte (x + 2) »: il 3 moltiplica <b>tutto</b> quello che c'è dentro. Come regalare 3 sacchetti con dentro 1 mela e 2 pere: in tutto 3 mele e 6 pere.",
    rule: M("a(b+c)=ab+ac") + ". Un meno davanti alla parentesi cambia <b>tutti</b> i segni dentro: " + M("-(x+4)=-x-4") + ".",
    steps: ["Il numero fuori moltiplica il primo termine dentro.", "Poi moltiplica il secondo termine (attenzione ai segni).", "Scrivi i due risultati uno dopo l'altro."],
    trap: M("3(x+2)") + " non fa " + M("3x+2") + ": il 3 moltiplica anche il 2.",
    input: "<code>3x+6</code>.",
  }),
  gen() {
    const t = ri(1, 4), k = rnz(-6, 7), a = rnz(-4, 5), b = rnz(-9, 9);
    if (t === 4) { const P = [1, b, 0]; return { q: "Togli le parentesi: " + M("x" + pr(linT(1, b))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P), sol: [M("x\\times x=x^2") + " e " + M("x\\times" + tp(b) + "=" + mono(b, "x", true)) + ".", "Risultato: " + M(polyT(P)) + "."] }; }
    const A = t === 1 ? 1 : a, K = t === 3 ? -1 : k; const P = [K * A, K * b];
    const pre = K === -1 ? "-" : K === 1 ? "" : String(K);
    return { q: "Togli le parentesi: " + M(pre + pr(linT(A, b))), type: "expr", ans: polyIn(P), form: ["expanded"], atex: polyT(P),
      traps: [{ ans: polyIn([K * A, b]), m: "Il numero fuori moltiplica <b>anche</b> il secondo termine." }],
      sol: [K === -1 ? "Il meno davanti cambia tutti i segni dentro." : M(tx(K) + "\\times" + (A === 1 ? "x" : tp(A) + "x") + "=" + mono(K * A, "x", true)) + " e " + M(tx(K) + "\\times" + tp(b) + "=" + K * b) + ".", "Risultato: " + M(polyT(P)) + "."] };
  },
});

sk({
  id: "b0-equazione-1", ch: 0, title: "La prima equazione (un solo passo)",
  learn: L({
    idea: "Un'equazione è una <b>bilancia in equilibrio</b>: " + M("x+5=12") + ". Per scoprire quanto vale x, togli 5 da <b>tutti e due</b> i piatti: resta " + M("x=7") + ". Qualsiasi cosa fai da una parte, falla anche dall'altra, e la bilancia resta in equilibrio.",
    pic: balancePic("x + 5", "12"),
    rule: M("x+a=b\\ \\to\\ x=b-a") + " · " + M("x-a=b\\ \\to\\ x=b+a") + " · " + M("a\\,x=b\\ \\to\\ x=b:a") + " · " + M("x:a=b\\ \\to\\ x=b\\times a"),
    steps: ["Guarda cosa è « attaccato » alla x (+5, −3, × 4…).", "Fai l'operazione contraria da tutte e due le parti (+ ↔ −, × ↔ :).", "Leggi quanto vale x.", "Verifica: rimetti il numero al posto di x."],
    trap: "Il contrario di « + 5 » è « − 5 », il contrario di « × 4 » è « : 4 ».",
    input: "scrivi solo il numero (<code>7</code>) oppure <code>x = 7</code>.",
  }),
  gen() {
    const t = ri(1, 4), x = ri(-9, 12), a = ri(2, 9);
    let eq, sol;
    if (t === 1) { eq = "x+" + a + "=" + (x + a); sol = ["Alla x è attaccato « + " + a + " ». Il contrario: « − " + a + " » da tutte e due le parti.", M("x=" + (x + a) + "-" + a + "=" + x) + "."]; }
    else if (t === 2) { eq = "x-" + a + "=" + (x - a); sol = ["Alla x è attaccato « − " + a + " ». Il contrario: « + " + a + " » da tutte e due le parti.", M("x=" + tx(x - a) + "+" + a + "=" + x) + "."]; }
    else if (t === 3) { eq = a + "x=" + a * x; sol = [M(a + "x") + " vuol dire " + M(a + "\\times x") + ". Il contrario: dividere per " + a + ".", M("x=" + tp(a * x) + ":" + a + "=" + x) + "."]; }
    else { eq = frac("x", a) + "=" + x; sol = [M(frac("x", a)) + " vuol dire « x diviso " + a + " ». Il contrario: moltiplicare per " + a + ".", M("x=" + tp(x) + "\\times" + a + "=" + a * x) + "."]; }
    const val = t === 4 ? a * x : x;
    sol.push("Verifica: rimettendo " + M(val) + " al posto di x, i due lati sono uguali ✔.");
    return { q: "Trova x: " + M(eq), type: "set", ans: [String(val)], form: ["rat"], atex: "x=" + val, sol,
      traps: t === 1 ? [{ ans: [String(x + 2 * a)], m: "Per togliere « + " + a + " » bisogna fare « − " + a + " », non « + »." }] : t === 2 ? [{ ans: [String(x - 2 * a)], m: "Per togliere « − " + a + " » bisogna fare « + " + a + " »." }] : [] };
  },
});

sk({
  id: "b0-equazione-2", ch: 0, title: "Equazioni in due passi",
  learn: L({
    idea: "In " + M("2x+3=11") + " la x ha due cose attaccate: il « × 2 » e il « + 3 ». Si staccano una alla volta, partendo da quella più lontana dalla x (il + 3).",
    pic: balancePic("2x + 3", "11"),
    rule: "1° passo: togli il numero che è sommato o sottratto. 2° passo: dividi per il numero davanti alla x." + D("2x+3=11\\ \\to\\ 2x=8\\ \\to\\ x=4"),
    steps: ["Sposta il numero: fai l'operazione contraria da tutte e due le parti.", "Dividi tutte e due le parti per il numero davanti alla x.", "Verifica il risultato."],
    trap: "Non dividere subito per 2: prima togli il + 3.",
  }),
  gen() {
    const a = rnz(-6, 7), x = ri(-8, 9), b = rnz(-12, 12); if (a === 1) return this.gen(); const c = a * x + b;
    return { q: "Trova x: " + M(polyT([a, b]) + "=" + c), type: "set", ans: [String(x)], form: ["rat"], atex: "x=" + x,
      traps: [{ ans: [q(c + b, a).plain()], m: "Per togliere « " + (b > 0 ? "+ " + b : "− " + -b) + " » devi fare l'operazione contraria." }],
      sol: ["1° passo: tolgo " + (b > 0 ? "+" + b : b) + " da tutte e due le parti: " + M(mono(a, "x", true) + "=" + c + (b > 0 ? "-" + b : "+" + -b) + "=" + (c - b)) + ".", "2° passo: divido per " + M(tx(a)) + ": " + M("x=" + tp(c - b) + ":" + tp(a) + "=" + x) + ".", "Verifica: " + M(tx(a) + "\\times" + tp(x) + sgnTex(b) + "=" + c) + " ✔."] };
  },
});

sk({
  id: "b0-piano", ch: 0, title: "Il piano cartesiano: leggere un punto",
  learn: L({
    idea: "Un punto si trova con due numeri, come a <b>battaglia navale</b>: prima quanto vai a destra o a sinistra (la <b>x</b>), poi quanto vai in su o in giù (la <b>y</b>). Si scrive A(3 ; 2).",
    pic: gridPoint(3, 2, "A(3 ; 2)"),
    rule: "(x ; y): <b>prima</b> la x (orizzontale), <b>poi</b> la y (verticale). A sinistra dello 0 la x è negativa, sotto lo 0 la y è negativa.",
    steps: ["Parti dall'origine (il centro, dove le linee si incrociano).", "Conta i passi a destra (+) o a sinistra (−): è la x.", "Conta i passi in su (+) o in giù (−): è la y."],
    trap: "Non invertire: (3 ; 2) e (2 ; 3) sono due punti diversi.",
    input: "<code>(3;2)</code> oppure <code>3;2</code>.",
  }),
  gen() {
    let x, y; do { x = ri(-4, 4); y = ri(-4, 4); } while (x === 0 && y === 0 || x === y);
    return { q: "Quali sono le coordinate del punto A?" + gridPoint(x, y, "A"), type: "tuple", ans: [String(x), String(y)], vars: [], form: ["rat"], atex: "A(" + x + "\\,;\\," + y + ")",
      traps: [{ ans: [String(y), String(x)], m: "Hai invertito: prima la x (orizzontale), poi la y (verticale)." }],
      sol: ["Orizzontale: " + (x > 0 ? x + " passi a destra → x = " + x : x < 0 ? -x + " passi a sinistra → x = " + x : "nessun passo → x = 0") + ".", "Verticale: " + (y > 0 ? y + " passi in su → y = " + y : y < 0 ? -y + " passi in giù → y = " + y : "nessun passo → y = 0") + ".", M("A(" + x + "\\,;\\," + y + ")") + "."] };
  },
});
