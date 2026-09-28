/* =====================================================================
   LIBRO PDF: costruisce il libro stampabile a partire dalle stesse lezioni
   dell'app (spiegazione, esempio svolto, esercizi, soluzioni, piano di studio).
   window.TOC_PAGES (facoltativo) = numeri di pagina per l'indice.
   ===================================================================== */
(function () {
  const TOCP = window.TOC_PAGES || {};
  const pg = key => '<span class="pgn">' + (TOCP[key] || "000") + "</span>";
  SKILLS.sort((a, b) => a.ch - b.ch);
  const CH = CHAPTERS.map(c => Object.assign({}, c, { skills: SKILLS.filter(s => s.ch === c.n) }));
  const code = k => k.ch + "." + (CH[k.ch].skills.indexOf(k) + 1);
  function hashId(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1900000000) + 1; }
  function gen(k, seed, easy) { return (easy && seededEasy(seed, () => k.gen())) || seeded(seed, () => k.gen()); }
  const cleanLearn = h => h.replace(/<p class="muted small"><b>Come scrivere la risposta:<\/b>[\s\S]*?<\/p>/, "");
  const qHTML = Q => Q.q + (Q.type === "choice" ? '<ol class="choices" type="A">' + Q.opts.map(o => "<li>" + o + "</li>").join("") + "</ol>" : "");
  const ansHTML = Q => Q.type === "choice" ? "<b>Risposta:</b> " + "ABCD"[Q.a] + ") " + Q.opts[Q.a] : "<b>Risposta:</b> \\(" + safeLt(Q.atex) + "\\)";
  const steps = Q => '<ol class="sol">' + Q.sol.map(s => "<li>" + s + "</li>").join("") + "</ol>";

  /* esempio + 4 esercizi (2 facili, 2 normali), sempre gli stessi */
  const EX = {};
  SKILLS.forEach(k => {
    const base = hashId(k.id), ex = gen(k, base, true), seen = new Set([ex.q]), list = [];
    for (let j = 0; list.length < 4 && j < 60; j++) {
      const easy = list.length < 2, Q = gen(k, base + 101 + j * 7919, easy);
      if (seen.has(Q.q)) continue; seen.add(Q.q); list.push({ Q, easy });
    }
    EX[k.id] = { ex, list };
  });

  const INTRO = [
    "Si riparte dalle cose più semplici: numeri negativi, frazioni, potenze, lettere. Se le sai già, vai veloce, ma non saltarle: tutto il resto è costruito sopra.",
    "Impari a « leggere » la matematica: i segni, l'ordine delle operazioni, gli intervalli. È come imparare l'alfabeto prima di leggere un libro.",
    "Il calcolo: frazioni, potenze, radici, sviluppare e scomporre. È la parte che userai in ogni esercizio dell'esame.",
    "Equazioni e disequazioni: trovare il numero nascosto. Primo e secondo grado, sistemi, studio del segno.",
    "Trigonometria: angoli, triangoli, seno e coseno. Con la circonferenza goniometrica tutto diventa un disegno.",
    "Funzioni: la « macchina » che trasforma i numeri. Poi esponenziale e logaritmo, limiti e asintoti.",
    "Derivate: dicono quanto è ripida una curva. Servono per trovare massimi, minimi e rette tangenti.",
    "Integrali: il contrario delle derivate, e il modo per calcolare le aree.",
    "Vettori: frecce che indicano spostamenti, nel piano e nello spazio.",
    "Numeri complessi: i nuovi numeri con i² = −1. Servono anche in elettrotecnica.",
    "Il francese dell'esame: le parole e le frasi delle domande. Alla fine capirai ogni consegna.",
  ];

  /* ---------- copertina ---------- */
  let H = `<section class="cover">
    <div class="c-logo">Π</div>
    <div class="c-kicker">Passerelle · Matematica</div>
    <h1 class="c-title">Il percorso completo,<br>da zero</h1>
    <p class="c-sub">Tutto in italiano · 11 tappe · ${SKILLS.length} lezioni<br>Esempi svolti passo passo · ${SKILLS.length * 4} esercizi con soluzioni<br>Piano di studio di 8 settimane · 2 esami di prova · esame in francese</p>
    <div class="c-fill"><div>Nome: <span class="line"></span></div><div>Data dell'esame: <span class="line"></span></div><div>Inizio del percorso: <span class="line"></span></div></div>
  </section>`;

  /* ---------- indice ---------- */
  const tl = (key, txt, cls) => `<div class="tl ${cls || ""}"><a href="#${key}">${txt}</a><span class="dots"></span>${pg(key)}</div>`;
  H += `<section class="indice page" id="toc"><h2>Indice</h2><p class="muted small">Il quadratino ☐ accanto a ogni lezione: fai una croce quando la lezione è imparata (4 esercizi giusti senza guardare le soluzioni).</p>`;
  H += tl("howto", "Come usare questo libro", "big") + tl("plan", "Piano di studio", "big");
  CH.forEach(c => {
    H += tl("T" + c.n, "Tappa " + c.n + " – " + c.name, "big");
    c.skills.forEach(k => { H += tl("L" + code(k), '<span class="cb">☐</span> ' + code(k) + "&nbsp; " + k.title, "sm"); });
    H += tl("S" + c.n, "Soluzioni della tappa " + c.n, "sm sol");
  });
  H += tl("E1", "Esami di prova", "big") + tl("ES", "Soluzioni degli esami di prova", "sm sol") + tl("FR", "Esame in francese (dal corso originale)", "big") + tl("FS", "Soluzioni dell'esame in francese", "sm sol");
  H += "</section>";

  /* ---------- come usare ---------- */
  H += `<section class="page howto" id="howto"><h2>Come usare questo libro</h2>
  <div class="box remember"><div class="bt">Il percorso in 3 regole</div><ol>
    <li><b>Vai in ordine</b>, dalla Tappa 0 alla Tappa 10. Non saltare: ogni lezione usa quelle di prima.</li>
    <li><b>Per ogni lezione:</b> leggi la spiegazione, rifai l'esempio svolto <b>da solo</b> sul quaderno, poi fai i 4 esercizi e correggili con le soluzioni in fondo alla tappa. La lezione è <b>imparata</b> quando fai i 4 esercizi giusti senza guardare: allora fai una croce ☐ nell'indice.</li>
    <li><b>Ripassa.</b> Il piano di studio ti dice ogni giorno cosa ripassare (le lezioni di 1, 3 e 7 giorni prima). Così non dimentichi quello che hai imparato.</li></ol></div>
  <div class="box idea"><div class="bt">Cosa ti serve</div><p>Un quaderno a quadretti, una matita, una gomma. <b>Niente calcolatrice</b>: all'esame non c'è. Circa un'ora al giorno.</p></div>
  <div class="box method"><div class="bt">Come è fatta ogni lezione</div><ol>
    <li><b>Riquadro blu – L'idea, in parole semplici:</b> il perché, con un esempio della vita di tutti i giorni.</li>
    <li><b>Riquadro verde – Da ricordare:</b> la regola. Tutti i riquadri verdi insieme sono il tuo formulario.</li>
    <li><b>Riquadro grigio – Come si fa:</b> i passi da seguire, sempre nello stesso ordine.</li>
    <li><b>Riquadro rosso – Attenzione:</b> l'errore che fanno quasi tutti.</li>
    <li><b>Riquadro giallo – Esempio svolto:</b> un esercizio risolto passo per passo. Coprilo con un foglio e prova prima tu.</li>
    <li><b>Esercizi:</b> 2 facili e 2 normali. Le soluzioni, con tutti i passaggi, sono alla fine della tappa.</li></ol></div>
  <div class="box warn"><div class="bt">Quando sbagli (succederà, è normale)</div><p>Leggi la correzione passo per passo e trova <b>il passo</b> in cui hai sbagliato. Rifai l'esempio svolto senza guardare. Il giorno dopo rifai l'esercizio sbagliato. Se una lezione proprio non entra, segna un « ? », vai avanti e torna indietro dopo due giorni: spesso diventa chiara.</p></div>
  <div class="box idea"><div class="bt">E il francese?</div><p>L'esame è in francese, ma la matematica si impara meglio nella propria lingua. La <b>Tappa 10</b> ti insegna tutte le parole e le frasi delle domande. Alla fine del libro trovi un esame vero in francese, con le soluzioni.</p></div>
  <p class="muted small">Esiste anche la versione interattiva di questo percorso (stesse lezioni, correzione automatica e ripasso calcolato da sola): https://claude.ai/artifact/7bLgAQusKC2NVhp6wLwkbN</p>
  </section>`;

  /* ---------- piano di studio ---------- */
  const rows = []; let idx = 0; const dayLessons = {};
  for (let w = 1; w <= 6; w++) for (let d = 1; d <= 7; d++) {
    const day = (w - 1) * 7 + d;
    if (d === 7) { rows.push({ day, w, todo: "<b>Ripasso della settimana.</b> Per ogni lezione della settimana rifai l'esempio svolto senza guardare. Segna ✗ quelle che non riesci a fare e rileggile.", rev: "" }); continue; }
    const L = SKILLS.slice(idx, idx + 4); idx += L.length; dayLessons[day] = L;
    const ends = CH.filter(c => L.length && L[L.length - 1] === c.skills[c.skills.length - 1]);
    let todo = L.length ? "Lezioni " + L.map(k => "<b>" + code(k) + "</b> " + k.title).join(" · ") : "Recupera le lezioni segnate con « ? » o ✗.";
    ends.forEach(c => { todo += "<br><i>Fine della tappa " + c.n + ": rifai tutti gli esercizi che avevi sbagliato in questa tappa.</i>"; });
    const rv = [1, 3, 7].map(b => dayLessons[day - b]).filter(x => x && x.length).map(x => code(x[0]) + (x.length > 1 ? "–" + code(x[x.length - 1]) : ""));
    rows.push({ day, w, todo, rev: rv.length ? "1 esercizio per lezione: " + rv.join(", ") : "—" });
  }
  const tail = [
    ["<b>Esame di prova n. 1</b> (60 minuti, senza calcolatrice). Poi correggi e segna le lezioni sbagliate.", "—"],
    ["Rifai le lezioni sbagliate nell'esame 1: esempio svolto + esercizi.", "Lezioni di ieri"],
    ["Ripasso delle Tappe 2, 3 e 4: rifai l'esempio svolto di ogni lezione.", "—"],
    ["Ripasso delle Tappe 5 e 6.", "Tappe 2–4: gli esempi segnati ✗"],
    ["Ripasso delle Tappe 7, 8 e 9.", "Tappe 5–6: gli esempi segnati ✗"],
    ["Tappa 10: rileggi le tabelle del vocabolario. <b>Esame in francese</b>: domande 1–15 (45 minuti).", "Tappe 7–9: gli esempi segnati ✗"],
    ["Giorno leggero: rileggi tutti i riquadri rossi « Attenzione ».", "—"],
    ["<b>Esame di prova n. 2</b> (60 minuti). Correggi e segna le lezioni sbagliate.", "—"],
    ["Rifai le lezioni sbagliate nell'esame 2.", "Lezioni di ieri"],
    ["<b>Esame in francese</b>: domande 16–30 (45 minuti).", "Tappa 10"],
    ["Rifai tutti gli esercizi segnati ✗ nelle Tappe 0–5.", "—"],
    ["Rifai tutti gli esercizi segnati ✗ nelle Tappe 6–10.", "—"],
    ["Rileggi tutti i riquadri verdi « Da ricordare »: sono il tuo formulario.", "—"],
    ["Giorno prima dell'esame: rileggi solo la Tappa 10, prepara il materiale e dormi bene.", "—"],
  ];
  tail.forEach((t, i) => rows.push({ day: 43 + i, w: 7 + Math.floor(i / 7), todo: t[0], rev: t[1] }));
  H += `<section class="page plan" id="plan"><h2>Piano di studio in 8 settimane</h2>
  <p>Circa un'ora al giorno: prima il <b>ripasso</b> (10 minuti), poi le <b>lezioni nuove</b>. Fai una croce ☐ quando hai finito il giorno. Settimane 1–6: tutte le lezioni. Settimane 7–8: esami di prova e ripasso finale.</p>
  <p class="muted small">Hai meno tempo? Nelle Tappe 0, 1 e 2 (le più facili) fai due giorni del piano in un giorno. Hai più tempo? Fai 3 lezioni al giorno invece di 4.</p>
  <table class="plantab"><thead><tr><th></th><th>Giorno</th><th>Cosa fare</th><th>Ripasso (prima di iniziare)</th></tr></thead><tbody>
  ${rows.map(r => `<tr class="${r.day % 7 === 0 ? "wk" : ""}"><td class="cb">☐</td><td class="dn"><b>${r.day}</b><small>sett. ${r.w}</small></td><td>${r.todo}</td><td class="rv">${r.rev}</td></tr>`).join("")}
  </tbody></table></section>`;

  /* ---------- tappe ---------- */
  CH.forEach(c => {
    H += `<section class="page topen" id="T${c.n}"><div class="tbig">${c.n}</div><h1>Tappa ${c.n} · ${c.name}</h1><p class="tsub">${c.sub}</p><p class="tintro">${INTRO[c.n]}</p>
      <div class="box idea"><div class="bt">In questa tappa (${c.skills.length} lezioni)</div><ol class="tlist">${c.skills.map(k => "<li>" + k.title + "</li>").join("")}</ol></div>
      <div class="box method"><div class="bt">Come lavorare</div><ol><li>Leggi la lezione con calma.</li><li>Copri l'esempio svolto e prova a farlo da solo; poi controlla passo per passo.</li><li>Fai i 4 esercizi sul quaderno. Le soluzioni sono a pagina ${pg("S" + c.n)}.</li><li>4 giusti → lezione imparata, fai una croce nell'indice. Se ne sbagli uno, rileggi la correzione e rifallo il giorno dopo.</li></ol></div></section>`;
    c.skills.forEach((k, i) => {
      const e = EX[k.id], cd = code(k);
      H += `<article class="lesson" id="L${cd}"><div class="lhead"><span>Lezione ${cd} · ${k.title}</span><span class="lcheck">☐ imparata</span></div>
        ${cleanLearn(k.learn)}
        <div class="box example"><div class="bt">Esempio svolto</div><div class="exq">${qHTML(e.ex)}</div>${steps(e.ex)}<p class="exans">${ansHTML(e.ex)}</p></div>
        <div class="exs"><div class="exh">Esercizi <span>soluzioni a pagina ${pg("S" + c.n)}</span></div>
        <ol class="exlist">${e.list.map((x, j) => `<li><span class="exn">${cd}.${j + 1}</span>${x.easy ? '<span class="lv">facile</span>' : ""}<div class="exq">${qHTML(x.Q)}</div></li>`).join("")}</ol></div></article>`;
    });
    H += `<section class="page sols" id="S${c.n}"><h2>Soluzioni della tappa ${c.n}</h2><p class="muted small">Controlla prima solo la risposta. Se è sbagliata, leggi i passaggi e cerca il punto in cui ti sei perso.</p>
      ${c.skills.map(k => { const cd = code(k); return `<div class="solblock"><div class="solh">${cd} · ${k.title}</div>${EX[k.id].list.map((x, j) => `<div class="soli"><span class="exn">${cd}.${j + 1}</span> ${ansHTML(x.Q)}${steps(x.Q)}</div>`).join("")}</div>`; }).join("")}
    </section>`;
  });

  /* ---------- esami di prova ---------- */
  const EXW = [[2, 3], [3, 3], [4, 2], [5, 3], [6, 3], [7, 2], [8, 2], [9, 2]];
  const exams = [1, 2].map(n => {
    const picks = []; seeded(4242 + n * 97, () => EXW.forEach(([ch, m]) => shuf(CH[ch].skills).slice(0, m).forEach(k => picks.push(k))));
    return picks.map((k, j) => ({ k, Q: gen(k, hashId(k.id) + 900000 + n * 31337 + j, false) }));
  });
  exams.forEach((E, i) => {
    H += `<section class="page exam" id="E${i + 1}"><h2>${i === 0 ? "Esami di prova · " : ""}Esame ${i + 1}</h2>
      <div class="box example"><div class="bt">Regole</div><p><b>20 domande · 60 minuti.</b> Niente calcolatrice, niente appunti. Scrivi le risposte su un foglio, poi correggi con le soluzioni (pagina ${pg("ES")}). <b>17 giuste su 20 o più</b> = livello da esame.</p></div>
      <ol class="exlist">${E.map((x, j) => `<li><span class="exn">${j + 1}.</span><div class="exq">${qHTML(x.Q)}</div></li>`).join("")}</ol></section>`;
  });
  H += `<section class="page sols" id="ES"><h2>Soluzioni degli esami di prova</h2><p class="muted small">Tra parentesi la lezione da ripassare se hai sbagliato.</p>
    ${exams.map((E, i) => `<div class="solblock"><div class="solh">Esame ${i + 1}</div>${E.map((x, j) => `<div class="soli"><span class="exn">${j + 1}.</span> <span class="muted small">(lezione ${code(x.k)})</span> ${ansHTML(x.Q)}${steps(x.Q)}</div>`).join("")}</div>`).join("")}</section>`;

  /* ---------- esame in francese (dal corso originale) ---------- */
  const g9 = GUIDE.chapters.find(c => c.blocks.some(b => b.t === "qcm"));
  if (g9) {
    const qs = g9.blocks.find(b => b.t === "qcm").items, ss = g9.blocks.find(b => b.t === "qcmsol").items;
    const tapp = s => s.replace(/\[chap\. (\d+)\]/g, (m, n) => "[Tappa " + (+n + 1) + "]");
    H += `<section class="page exam" id="FR"><h2>Esame in francese dal corso originale</h2>
      <div class="box example"><div class="bt">Regole</div><p><b>30 domande a scelta multipla · 90 minuti</b> (circa 3 minuti per domanda). È scritto in francese, come l'esame vero: usa quello che hai imparato nella Tappa 10. Per ogni domanda c'è una sola risposta giusta. <b>26 su 30 o più</b> = pronto.</p></div>
      <ol class="exlist fr" lang="fr">${qs.map((q0, j) => `<li><span class="exn">${j + 1}.</span><div class="exq">${q0.q}<ol class="choices" type="A">${q0.o.map(o => "<li>" + o + "</li>").join("")}</ol></div></li>`).join("")}</ol></section>`;
    H += `<section class="page sols" id="FS"><h2>Soluzioni dell'esame in francese</h2><p class="muted small">Tra parentesi quadre la tappa da ripassare se hai sbagliato.</p>
      <div class="solblock" lang="fr">${ss.map((s, j) => `<div class="soli"><span class="exn">${j + 1}.</span> <b>${s.a}</b> — ${tapp(s.e)}</div>`).join("")}</div></section>`;
  }

  document.getElementById("book").innerHTML = H;
  MathJax.startup.promise.then(() => MathJax.typesetPromise([document.getElementById("book")])).then(() => { window.__done = true; }).catch(e => { window.__err = String(e); window.__done = true; });
})();
