/* =====================================================================
   LEZIONI — Tappa 10 « Il francese dell'esame »
   Le consegne e le parole dell'esame, tradotte; poi esercizi scritti in francese.
   ===================================================================== */
const VOC = {
  consegne: [
    ["Calculer", "Calcolare"], ["Résoudre", "Risolvere (trovare le soluzioni)"], ["Développer", "Sviluppare (togliere le parentesi)"],
    ["Réduire", "Ridurre (sommare i termini simili)"], ["Factoriser", "Scomporre in fattori (scrivere come prodotto)"], ["Simplifier", "Semplificare"],
    ["Montrer que", "Dimostrare che"], ["En déduire", "Dedurne (usare il risultato di prima)"], ["Justifier", "Giustificare (spiegare perché)"],
    ["Déterminer", "Determinare (trovare)"], ["Vérifier que", "Verificare che (controllare)"], ["Donner", "Dare, scrivere"],
    ["Exprimer y en fonction de x", "Scrivere y usando x"], ["Étudier le signe de", "Studiare il segno di"], ["Étudier les variations de", "Studiare dove cresce e dove decresce"],
    ["Dresser le tableau de variations", "Fare la tabella di variazione"], ["Tracer", "Disegnare (tracciare)"], ["Placer un point", "Mettere un punto (sul disegno)"],
    ["Arrondir au centième", "Arrotondare al centesimo"], ["Écrire sous forme algébrique", "Scrivere nella forma a + bi"], ["Comparer", "Confrontare"],
    ["Dériver", "Derivare"], ["Intégrer", "Integrare"], ["Encadrer", "Trovare due numeri tra cui sta il valore"],
  ],
  legami: [
    ["Soit f la fonction…", "Consideriamo la funzione f…"], ["tel que", "tale che"], ["pour tout x", "per ogni x"], ["il existe", "esiste"],
    ["si et seulement si", "se e solo se"], ["donc", "quindi"], ["or", "ma, però (introduce un fatto noto)"], ["d'où", "da cui, perciò"],
    ["on admet que", "si accetta (senza dimostrare) che"], ["on pose", "chiamiamo, poniamo"], ["sachant que", "sapendo che"],
    ["à l'aide de", "con l'aiuto di, usando"], ["sur l'intervalle", "sull'intervallo"], ["s'annule en", "vale zero in"],
    ["est définie par", "è definita da"], ["admet", "ha (ammette)"], ["à 10⁻² près", "con un errore al massimo di 0,01 (al centesimo)"],
    ["la réponse est", "la risposta è"], ["Vrai ou faux ?", "Vero o falso?"], ["aucune", "nessuna"],
  ],
  calcolo: [
    ["un nombre entier", "un numero intero"], ["un nombre réel", "un numero reale"], ["une fraction irréductible", "una frazione ridotta ai minimi termini"],
    ["le numérateur", "il numeratore (sopra)"], ["le dénominateur", "il denominatore (sotto)"], ["la valeur exacte", "il valore esatto"],
    ["une valeur approchée", "un valore approssimato"], ["la racine carrée", "la radice quadrata"], ["une puissance", "una potenza"],
    ["une identité remarquable", "un prodotto notevole"], ["une équation", "un'equazione"], ["une inéquation", "una disequazione"],
    ["l'inconnue", "l'incognita"], ["l'ensemble des solutions", "l'insieme delle soluzioni"], ["un système", "un sistema"],
    ["le discriminant", "il discriminante (Δ)"], ["une racine d'un polynôme", "una soluzione di P(x) = 0"], ["strictement positif", "strettamente positivo (> 0)"],
    ["un tableau de signes", "una tabella dei segni"], ["l'inverse de x", "l'inverso di x (1/x)"], ["l'opposé de x", "l'opposto di x (−x)"],
    ["le produit", "il prodotto (moltiplicazione)"], ["le quotient", "il quoziente (divisione)"], ["la somme", "la somma"], ["la différence", "la differenza"],
    ["pair", "pari"], ["impair", "dispari"], ["le double", "il doppio"], ["la moitié", "la metà"],
  ],
  funzioni: [
    ["l'ensemble de définition", "il dominio"], ["l'image de 3 par f", "l'immagine di 3, cioè f(3)"], ["un antécédent de 5", "una x che dà f(x) = 5"],
    ["la courbe représentative", "il grafico (la curva)"], ["croissante", "crescente (sale)"], ["décroissante", "decrescente (scende)"],
    ["le tableau de variations", "la tabella di variazione"], ["la fonction dérivée", "la derivata"], ["le nombre dérivé en a", "la derivata nel punto a, f'(a)"],
    ["la tangente", "la retta tangente"], ["le coefficient directeur", "il coefficiente angolare (la pendenza m)"], ["l'ordonnée à l'origine", "il termine noto p in y = mx + p"],
    ["un extremum", "un massimo o un minimo"], ["une asymptote", "un asintoto"], ["la limite en +∞", "il limite a +∞"],
    ["tend vers", "tende a"], ["une primitive", "una primitiva"], ["l'intégrale", "l'integrale"], ["l'aire sous la courbe", "l'area sotto la curva"],
    ["la valeur moyenne", "il valore medio"], ["une intégration par parties", "un'integrazione per parti"], ["le logarithme népérien", "il logaritmo naturale (ln)"],
    ["la fonction exponentielle", "la funzione esponenziale"],
  ],
  geometria: [
    ["un triangle rectangle", "un triangolo rettangolo"], ["l'hypoténuse", "l'ipotenusa"], ["le côté adjacent", "il cateto adiacente"], ["le côté opposé", "il cateto opposto"],
    ["le cercle trigonométrique", "la circonferenza goniometrica"], ["un repère", "un sistema di assi (riferimento)"], ["l'abscisse", "l'ascissa (la x)"], ["l'ordonnée", "l'ordinata (la y)"],
    ["un vecteur", "un vettore"], ["la norme", "la norma (lunghezza)"], ["colinéaires", "collineari (paralleli)"], ["orthogonaux", "ortogonali (perpendicolari)"],
    ["le produit scalaire", "il prodotto scalare"], ["le produit vectoriel", "il prodotto vettoriale"], ["le milieu", "il punto medio"], ["une droite", "una retta"],
    ["un plan", "un piano"], ["un vecteur normal", "un vettore perpendicolare (normale)"], ["un vecteur directeur", "un vettore parallelo alla retta (direttore)"],
    ["un nombre complexe", "un numero complesso"], ["la partie réelle", "la parte reale"], ["la partie imaginaire", "la parte immaginaria"], ["le conjugué", "il coniugato"],
    ["le module", "il modulo"], ["un argument", "un argomento (angolo)"], ["la forme exponentielle", "la forma esponenziale"], ["l'affixe", "l'affisso (il numero complesso di un punto)"],
    ["le cercle de centre A et de rayon r", "il cerchio di centro A e raggio r"],
  ],
};
const VOC_NAMES = { consegne: "Le consegne (i verbi)", legami: "Le parole-ponte", calcolo: "Calcolo ed equazioni", funzioni: "Funzioni, derivate, integrali", geometria: "Trigonometria, vettori, complessi" };
function glossTable(list) {
  return '<div class="tw"><table class="gloss"><thead><tr><th>Francese</th><th>Italiano</th></tr></thead><tbody>' +
    list.map(([f, i]) => "<tr><td lang=\"fr\"><b>" + f + "</b></td><td>" + i + "</td></tr>").join("") + "</tbody></table></div>";
}
function vocQ(list) {
  const k = ri(0, list.length - 1); const fwd = rnd() < 0.7; const a = fwd ? 1 : 0;
  const pool = shuf(list.map((_, i) => i).filter(i => i !== k && list[i][a] !== list[k][a])).slice(0, 3);
  const order = shuf([k].concat(pool));
  const fr = '<span lang="fr">« ' + list[k][0] + " »</span>";
  return { q: fwd ? "Che cosa vuol dire " + fr + "?" : "Come si dice in francese « " + list[k][1] + " »?", type: "choice",
    opts: order.map(i => (fwd ? list[i][1] : '<span lang="fr">' + list[i][0] + "</span>")), a: order.indexOf(k), atex: "",
    sol: [fr + " = « " + list[k][1] + " »."] };
}
function vocSkill(id, key, extra) {
  sk(Object.assign({
    id, ch: 10, title: VOC_NAMES[key], target: 6,
    learn: L({
      idea: "All'esame le domande sono in francese. Non devi parlare francese: basta <b>riconoscere</b> queste parole. Leggi la tabella ad alta voce una volta, poi fai gli esercizi: le parole ti resteranno.",
      rule: glossTable(VOC[key]),
    }),
    gen() { return vocQ(VOC[key]); },
  }, extra || {}));
}
vocSkill("v-consegne", "consegne");
vocSkill("v-legami", "legami");
vocSkill("v-calcolo", "calcolo");
vocSkill("v-funzioni", "funzioni");
vocSkill("v-geometria", "geometria");

/* frasi complete d'esame: che cosa ti chiedono? */
const FRASI = [
  ["Résoudre dans ℝ l'équation 2x − 5 = 0.", "Trova tutti i numeri x che rendono vera 2x − 5 = 0.", "Calcola 2x − 5 quando x = 0.", "Scomponi 2x − 5 in fattori.", "Disegna la retta y = 2x − 5."],
  ["Développer et réduire A = (x + 3)².", "Togli le parentesi e somma i termini simili.", "Scrivi A come prodotto di fattori.", "Calcola A quando x = 3.", "Risolvi l'equazione A = 0."],
  ["Factoriser B = x² − 9.", "Scrivi B come prodotto: (x − 3)(x + 3).", "Sviluppa B.", "Calcola B quando x = 9.", "Risolvi B > 0."],
  ["Déterminer l'ensemble de définition de f.", "Trova per quali x la funzione f esiste.", "Calcola f(0).", "Trova dove f cresce.", "Disegna il grafico di f."],
  ["Montrer que f'(x) = (x − 1)eˣ.", "Dimostra con i calcoli che la derivata è proprio (x − 1)eˣ.", "Calcola f(1).", "Risolvi (x − 1)eˣ = 0.", "Trova una primitiva di f."],
  ["En déduire le tableau de variations de f.", "Usando il risultato di prima, fai la tabella di dove f sale e scende.", "Ricomincia da capo il calcolo della derivata.", "Fai una tabella di valori di f.", "Trova il dominio di f."],
  ["Calculer la valeur exacte de l'intégrale I.", "Calcola I senza arrotondare (lascia e, ln, π, radici).", "Calcola I con la calcolatrice e arrotonda.", "Trova solo una primitiva.", "Disegna l'area che corrisponde a I."],
  ["Donner une valeur approchée de x à 10⁻² près.", "Scrivi x arrotondato al centesimo (2 cifre dopo la virgola).", "Scrivi x arrotondato al decimo.", "Scrivi il valore esatto di x.", "Scrivi x in notazione scientifica."],
  ["Étudier le signe de g(x) sur ℝ.", "Trova dove g(x) è positivo, negativo o zero.", "Calcola g(0).", "Trova il massimo di g.", "Risolvi g(x) = 1."],
  ["Déterminer une équation de la tangente à la courbe au point d'abscisse 1.", "Trova l'equazione della retta tangente al grafico nel punto con x = 1.", "Trova la retta tangente nel punto con y = 1.", "Calcola soltanto f(1).", "Trova l'asintoto x = 1."],
  ["Écrire z sous forme exponentielle.", "Scrivi z nella forma r·e^(iθ).", "Scrivi z nella forma a + bi.", "Calcola solo il modulo di z.", "Scrivi il coniugato di z."],
  ["Les vecteurs u et v sont-ils colinéaires ? Justifier.", "Dì se u e v sono paralleli e spiega perché.", "Calcola la somma di u e v.", "Dì se u e v sono perpendicolari.", "Calcola la lunghezza di u."],
  ["Exprimer y en fonction de x.", "Scrivi y = (un'espressione con x).", "Scrivi x = (un'espressione con y).", "Calcola y quando x = 0.", "Disegna la curva di y."],
  ["Soit f la fonction définie sur ]0 ; +∞[ par f(x) = ln x − x.", "Consideriamo la funzione f(x) = ln x − x, definita per x > 0.", "Risolvi ln x − x = 0.", "Dimostra che f è sempre positiva.", "Calcola f(0)."],
  ["Déterminer la limite de f en +∞.", "Trova a cosa si avvicina f(x) quando x diventa enorme.", "Calcola f(0).", "Trova il massimo di f.", "Trova dove f non esiste."],
  ["Calculer l'aire du domaine compris entre la courbe et l'axe des abscisses.", "Calcola l'area tra la curva e l'asse x.", "Calcola l'area tra la curva e l'asse y.", "Calcola la lunghezza della curva.", "Trova dove la curva taglia l'asse x."],
  ["Vérifier que 2 est solution de l'équation.", "Controlla, sostituendo x = 2, che l'equazione è vera.", "Risolvi l'equazione da capo.", "Dimostra che 2 è l'unica soluzione.", "Calcola il doppio della soluzione."],
  ["Simplifier au maximum l'expression.", "Semplifica l'espressione il più possibile.", "Sviluppa tutto senza semplificare.", "Calcola un valore approssimato.", "Scomponi in fattori primi."],
  ["Déterminer les coordonnées du milieu I de [AB].", "Trova le coordinate del punto medio I del segmento AB.", "Calcola la lunghezza di AB.", "Trova l'equazione della retta (AB).", "Trova le coordinate del vettore AB."],
  ["Résoudre l'inéquation x² − 4 < 0.", "Trova tutti gli x per cui x² − 4 è negativo.", "Trova gli x per cui x² − 4 = 0.", "Calcola x² − 4 quando x = 0.", "Scomponi x² − 4."],
  ["Déterminer une primitive de f sur ℝ.", "Trova una funzione F la cui derivata è f.", "Calcola la derivata di f.", "Calcola l'integrale di f da 0 a 1.", "Trova il massimo di f."],
  ["Placer dans le plan complexe le point A d'affixe 2 − i.", "Disegna il punto A = (2 ; −1).", "Disegna il punto A = (−1 ; 2).", "Calcola il modulo di 2 − i.", "Scrivi il coniugato di 2 − i."],
];
sk({
  id: "v-frasi", ch: 10, title: "Frasi d'esame: che cosa mi chiedono?", target: 6,
  learn: L({
    idea: "Una domanda d'esame è fatta così: <b>un verbo</b> (che cosa fare) + <b>un oggetto</b> (su cosa). Se riconosci il verbo, sai già metà della risposta.",
    rule: '<ul class="tight"><li><span lang="fr"><b>Résoudre</b></span> → trovare le soluzioni.</li><li><span lang="fr"><b>Développer</b></span> → togliere le parentesi. <span lang="fr"><b>Factoriser</b></span> → fare il contrario.</li><li><span lang="fr"><b>Montrer que</b></span> → il risultato te lo danno già: devi solo fare i calcoli che ci arrivano.</li><li><span lang="fr"><b>En déduire</b></span> → usa la risposta della domanda prima.</li><li><span lang="fr"><b>valeur exacte</b></span> → niente calcolatrice, lascia √, π, e, ln. <span lang="fr"><b>valeur approchée</b></span> → numero con la virgola.</li></ul>',
    steps: ["Trova il verbo (di solito la prima parola).", "Trova l'oggetto (equazione, funzione, vettore…).", "Traduci nella tua testa in italiano, poi risolvi come hai imparato."],
    trap: "« <span lang=\"fr\">Montrer que</span> » non chiede di trovare il risultato (è già scritto): chiede di arrivarci con i calcoli.",
  }),
  gen() {
    const k = ri(0, FRASI.length - 1); const F = FRASI[k]; const order = shuf([1, 2, 3, 4]);
    return { q: "Che cosa ti chiede questa domanda? <span lang=\"fr\">« " + F[0] + " »</span>", type: "choice", opts: order.map(i => F[i]), a: order.indexOf(1), atex: "",
      sol: ["Vuol dire: " + F[1]] };
  },
});

/* esercizi veri, scritti come all'esame (in francese) */
sk({
  id: "v-esercizi", ch: 10, title: "Esercizi scritti in francese", target: 6,
  learn: L({
    idea: "Qui trovi esercizi facili che conosci già, ma scritti <b>in francese</b>, come all'esame. La matematica è la stessa: cambia solo la lingua della domanda. Nella correzione c'è sempre la traduzione.",
    rule: '<ul class="tight"><li><span lang="fr">Résoudre dans ℝ</span> → Risolvi (x è un numero reale).</li><li><span lang="fr">Développer et réduire</span> → Sviluppa e riduci.</li><li><span lang="fr">Factoriser</span> → Scomponi.</li><li><span lang="fr">Calculer f(2)</span> → Calcola f(2).</li><li><span lang="fr">Déterminer la dérivée</span> → Trova la derivata.</li><li><span lang="fr">Simplifier la fraction</span> → Semplifica la frazione.</li></ul>',
    steps: ["Leggi la domanda e trova il verbo.", "Traducilo (usa la tabella sopra).", "Risolvi come nelle tappe precedenti."],
  }),
  gen() {
    const t = ri(1, 6);
    if (t === 1) {
      const a = rnz(-6, 6), b = rnz(-9, 9), c = rnz(-9, 9); const x = q(c - b, a);
      return { q: '<span lang="fr">Résoudre dans ℝ l\'équation</span> ' + M(linT(a, b) + "=" + c) + ".", type: "set", ans: [x.plain()], form: ["rat"], atex: setTex([x.tex()]),
        sol: ["Traduzione: « Risolvi l'equazione " + M(linT(a, b) + "=" + c) + " ».", M(tx(a) + "x=" + (c - b)) + ", quindi " + M("x=" + x.tex()) + "."] };
    }
    if (t === 2) {
      const a = rnz(-6, 6), b = rnz(-6, 6); const P = [1, a + b, a * b];
      return { q: '<span lang="fr">Développer et réduire l\'expression</span> ' + M("A=" + pr(linT(1, a)) + pr(linT(1, b))) + ".", type: "expr", ans: polyIn(P), form: ["expanded"], atex: "A=" + polyT(P), lhs: 1, pre: "A =",
        sol: ["Traduzione: « Sviluppa e riduci A ».", M(pr(linT(1, a)) + pr(linT(1, b)) + "=x^2" + mono(b, "x", false) + mono(a, "x", false) + sgnTex(a * b) + "=" + polyT(P)) + "."] };
    }
    if (t === 3) {
      const k = ri(1, 9);
      return { q: '<span lang="fr">Factoriser</span> ' + M("B=x^2-" + k * k) + ".", type: "expr", ans: "(x-" + k + ")(x+" + k + ")", form: ["factored"], atex: "B=(x-" + k + ")(x+" + k + ")", lhs: 1, pre: "B =",
        sol: ["Traduzione: « Scomponi B ».", "Prodotto notevole " + M("a^2-b^2=(a-b)(a+b)") + ": " + M("x^2-" + k * k + "=(x-" + k + ")(x+" + k + ")") + "."] };
    }
    if (t === 4) {
      const a = rnz(-3, 3), b = rnz(-6, 6), c = rnz(-9, 9), x0 = rnz(-4, 4); const v = pevalQ([a, b, c], q(x0));
      return { q: '<span lang="fr">Soit f la fonction définie sur ℝ par</span> ' + M("f(x)=" + polyT([a, b, c])) + '. <span lang="fr">Calculer l\'image de</span> ' + M(x0) + ' <span lang="fr">par f.</span>', type: "num", ans: v.plain(), form: ["rat"], atex: "f(" + x0 + ")=" + v.tex(),
        sol: ["Traduzione: « Sia f la funzione definita su ℝ da f(x) = … Calcola l'immagine di " + x0 + " », cioè " + M("f(" + x0 + ")") + ".", M("f(" + x0 + ")=" + tx(a) + "\\times" + tp(x0) + "^2" + (b < 0 ? "-" : "+") + Math.abs(b) + "\\times" + tp(x0) + sgnTex(c) + "=" + v.tex()) + "."] };
    }
    if (t === 5) {
      const a = rnz(-5, 5), n = ri(2, 4), b = rnz(-9, 9), c = rnz(-9, 9); const P = [a]; for (let i = 1; i < n - 1; i++) P.push(0); P.push(b, c);
      const Dd = pder(P);
      return { q: '<span lang="fr">Déterminer la fonction dérivée de</span> ' + M("f(x)=" + polyT(P)) + ".", type: "expr", ans: polyIn(Dd), atex: "f'(x)=" + polyT(Dd), lhs: 1, pre: "f'(x) =",
        sol: ["Traduzione: « Trova la derivata di f ».", M("(x^n)'=nx^{n-1}") + " e la costante sparisce: " + M("f'(x)=" + polyT(Dd)) + "."] };
    }
    const g = ri(2, 9), p = ri(1, 9), qq = ri(2, 9); if (gcd(p, qq) !== 1 || p === qq) return this.gen();
    const r = q(p, qq);
    return { q: '<span lang="fr">Simplifier la fraction</span> ' + M(frac(p * g, qq * g)) + ' <span lang="fr">(donner une fraction irréductible).</span>', type: "num", ans: r.plain(), form: ["irr"], atex: r.tex(),
      sol: ["Traduzione: « Semplifica la frazione (scrivila ridotta ai minimi termini) ».", "Divido sopra e sotto per " + g + ": " + M(frac(p * g, qq * g) + "=" + r.tex()) + "."] };
  },
});
