#!/usr/bin/env python3
"""Construit le PDF « Mathématiques pour la passerelle — méthode complète ».

Chaîne : fichiers texte (contenu/*.txt, format décrit dans README.md)
  -> HTML (formules LaTeX rendues par KaTeX dans Chromium)
  -> PDF (Playwright), deux passes pour numéroter la table des matières,
  -> signets PDF ajoutés avec PyMuPDF.
Toutes les vérifications @check (sympy) doivent passer, sinon la construction échoue.
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
CONTENU = ROOT / "contenu"
OUT = ROOT / "build"
sys.path.insert(0, str(SRC))

import gens  # noqa: E402
import figures  # noqa: E402
import checks  # noqa: E402

PDF_NAME = "Mathematiques_passerelle_methode_complete.pdf"
FILES = [
    "00_debut.txt",
    "01_lire.txt",
    "02_calcul.txt",
    "03_equations.txt",
    "04_trigo.txt",
    "05_fonctions.txt",
    "06_derivees.txt",
    "07_integrales.txt",
    "08_vecteurs.txt",
    "09_complexes.txt",
    "10_revisions.txt",
    "11_examens.txt",
    "12_annexes.txt",
]

STARS = {1: "★☆☆☆", 2: "★★☆☆", 3: "★★★☆", 4: "★★★★"}
LEVEL = {1: "facile", 2: "moyen", 3: "difficile", 4: "niveau examen"}

BOXES = {
    # type: (classe css, titre par défaut, icône)
    "idee": ("b-idee", "L'idée, avec des mots simples", "►"),
    "pourquoi": ("b-pourquoi", "Pourquoi ça marche ?", "?"),
    "coeur": ("b-coeur", "À savoir par cœur", "✔"),
    "astuce": ("b-astuce", "Astuce", "★"),
    "exemple": ("b-exemple", "Exemple corrigé", "✎"),
    "piege": ("b-piege", "Attention, piège !", "⚠"),
    "lire": ("b-lire", "Comment lire", "◆"),
    "methode": ("b-methode", "La méthode, étape par étape", "►"),
    "objectifs": ("b-objectifs", "Dans ce chapitre, tu vas apprendre à…", "◎"),
    "check": ("b-check", "Vérifie-toi (2 minutes)", "?"),
    "note": ("b-note", "", ""),
    "examen": ("b-examen", "Consignes", "⏱"),
}


def esc(s):
    return html.escape(s, quote=False)


MATH_RE = re.compile(r"(\$\$.+?\$\$|\$[^$]+?\$)")


def split_math(s):
    """Découpe une ligne en morceaux texte / math ($...$)."""
    return MATH_RE.split(s)


def typo(t):
    """Typographie française hors formules : espaces insécables."""
    t = re.sub(r" ([:;?!»])", "\u00a0\\1", t)
    t = t.replace("« ", "«\u00a0")
    return t


def inline(s):
    out = []
    bold = False
    for p in split_math(s):
        if not p:
            continue
        if p.startswith("$"):
            out.append('<span class="m">' + esc(p) + "</span>")
        else:
            p = esc(typo(p))
            # gras : peut englober des formules -> bascule d'état sur toute la ligne
            pieces = p.split("**")
            q = pieces[0]
            for piece in pieces[1:]:
                bold = not bold
                q += ("<strong>" if bold else "</strong>") + piece
            p = q
            p = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", p)
            p = re.sub(r"==(.+?)==", r"<mark>\1</mark>", p)
            p = p.replace("✔", '<span class="ok">✔</span>').replace("✘", '<span class="ko">✘</span>')
            out.append(p)
    if bold:
        out.append("</strong>")
    return "".join(out)


def split_cells(line):
    """Découpe une ligne de tableau sur les | qui ne sont pas dans une formule."""
    line = line.strip()
    if line.startswith("|"):
        line = line[1:]
    if line.endswith("|") and not line.endswith("\\|"):
        line = line[:-1]
    cells, cur, inmath = [], "", False
    i = 0
    while i < len(line):
        c = line[i]
        if c == "$":
            inmath = not inmath
            cur += c
        elif c == "|" and not inmath:
            cells.append(cur.strip())
            cur = ""
        else:
            cur += c
        i += 1
    cells.append(cur.strip())
    return cells


def slug(s):
    s = re.sub(r"[^\w]+", "-", s.lower()).strip("-")
    return s[:60]


class Builder:
    def __init__(self):
        self.toc = []  # (niveau, id, texte)
        self.chap = None  # identifiant du chapitre courant (ex. "1")
        self.ex_count = 0
        self.q_count = 0
        self.items = []  # corrigés en attente : ("ex"|"qcm"|"drill"|"serie", données)
        self.checks = []  # (label, expression)
        self.n_ex = 0
        self.n_qcm = 0
        self.n_drill = 0
        self.fig_count = 0
        self.uid = 0
        self.qprefix = ""
        self.cur_serie = ""
        self.serie_drill = 0
        self.drill_letter = 0

    def new_id(self, prefix="h"):
        self.uid += 1
        return f"{prefix}{self.uid}"

    # ------------------------------------------------------------------ blocs
    def blocks(self, lines):
        """Transforme une liste de lignes en HTML (paragraphes, listes, tableaux…)."""
        out = []
        i = 0
        n = len(lines)
        step = 0
        para = []

        def flush():
            if para:
                out.append("<p>" + inline(" ".join(para)) + "</p>")
                para.clear()

        while i < n:
            line = lines[i]
            s = line.strip()
            if not s:
                flush()
                i += 1
                continue
            # formule centrée ($$ ... $$ sur une ou plusieurs lignes)
            if s.startswith("$$"):
                flush()
                if s.endswith("$$") and len(s) > 4:
                    out.append('<div class="dm">' + esc(s) + "</div>")
                    i += 1
                    continue
                buf = [s[2:]]
                i += 1
                while i < n and "$$" not in lines[i]:
                    buf.append(lines[i])
                    i += 1
                if i < n:
                    buf.append(lines[i].replace("$$", ""))
                i += 1
                out.append('<div class="dm">$$' + esc("\n".join(buf)) + "$$</div>")
                continue
            # boîte
            if s.startswith(":::"):
                flush()
                head = s[3:].strip()
                typ, _, title = head.partition(" ")
                inner = []
                i += 1
                depth = 0
                while i < n:
                    t = lines[i].strip()
                    if t.startswith(":::") and t != ":::":
                        depth += 1
                    elif t == ":::":
                        if depth == 0:
                            break
                        depth -= 1
                    inner.append(lines[i])
                    i += 1
                i += 1
                out.append(self.box(typ, title.strip(), inner))
                continue
            # directives
            if s.startswith("@"):
                flush()
                i = self.directive(lines, i, out)
                continue
            if s.startswith("### "):
                flush()
                out.append("<h3>" + inline(s[4:]) + "</h3>")
                i += 1
                continue
            if s.startswith("## "):
                flush()
                hid = self.new_id("s")
                txt = s[3:]
                self.toc.append((2, hid, txt))
                mnum = re.match(r"^(\d+\.\d+|[A-Z]\.\d+)\s+(.*)$", txt)
                inner_h = (f'<span class="hn">{mnum.group(1)}</span>' + inline(mnum.group(2))) if mnum else inline(txt)
                out.append(f'<h2 id="{hid}">' + inner_h + "</h2>")
                i += 1
                continue
            if s.startswith("# "):
                flush()
                out.append(self.chapter_head(s[2:]))
                i += 1
                continue
            # tableau
            if s.startswith("|"):
                flush()
                rows = []
                while i < n and lines[i].strip().startswith("|"):
                    rows.append(split_cells(lines[i]))
                    i += 1
                out.append(self.table(rows))
                continue
            # étapes
            if s.startswith("+ "):
                flush()
                step += 1
                out.append(f'<p class="step"><b>Étape {step}.</b> ' + inline(s[2:]) + "</p>")
                i += 1
                continue
            if s.startswith("=> "):
                flush()
                out.append('<p class="concl"><span class="arrow">➜</span> ' + inline(s[3:]) + "</p>")
                i += 1
                continue
            if s.startswith("> "):
                flush()
                out.append('<p class="retenir"><b>À retenir :</b> ' + inline(s[2:]) + "</p>")
                i += 1
                continue
            # sous-questions a) b) c)
            if re.match(r"^[a-h]\) ", s):
                flush()
                items = []
                while i < n and re.match(r"^[a-h]\) ", lines[i].strip()):
                    t = lines[i].strip()
                    items.append((t[0], t[3:]))
                    i += 1
                out.append(self.subq(items))
                continue
            # listes
            if s.startswith("- "):
                flush()
                items = []
                while i < n and lines[i].strip().startswith("- "):
                    items.append(lines[i].strip()[2:])
                    i += 1
                    while i < n and lines[i].startswith("  ") and lines[i].strip() and not lines[i].strip().startswith("- "):
                        items[-1] += " " + lines[i].strip()
                        i += 1
                out.append("<ul>" + "".join("<li>" + inline(t) + "</li>" for t in items) + "</ul>")
                continue
            if re.match(r"^\d+\. ", s):
                flush()
                items = []
                while i < n and re.match(r"^\d+\. ", lines[i].strip()):
                    items.append(re.sub(r"^\d+\. ", "", lines[i].strip()))
                    i += 1
                    while i < n and lines[i].startswith("  ") and lines[i].strip() and not re.match(r"^\d+\. ", lines[i].strip()):
                        items[-1] += " " + lines[i].strip()
                        i += 1
                out.append("<ol>" + "".join("<li>" + inline(t) + "</li>" for t in items) + "</ol>")
                continue
            if s.startswith("[ ] "):
                flush()
                items = []
                while i < n and lines[i].strip().startswith("[ ] "):
                    items.append(lines[i].strip()[4:])
                    i += 1
                out.append('<ul class="checklist">' + "".join("<li>" + inline(t) + "</li>" for t in items) + "</ul>")
                continue
            para.append(s)
            flush()
            i += 1
        flush()
        return "\n".join(out)

    def subq(self, items):
        longest = max(len(re.sub(r"\$|\\[a-z]+|[{}]", "", t)) for _, t in items)
        if longest <= 22 and len(items) >= 3:
            w = "w4"
        elif longest <= 34 and len(items) >= 3:
            w = "w3"
        elif longest <= 55:
            w = "w2"
        else:
            w = "w1"
        return (
            f'<div class="sqs {w}">'
            + "".join(f'<div class="sq"><b>{k})</b> {inline(t)}</div>' for k, t in items)
            + "</div>"
        )

    def table(self, rows):
        cls = "tbl"
        if rows and rows[0] and rows[0][0].startswith("!"):
            # tableau sans en-tête
            rows[0][0] = rows[0][0][1:]
            body = rows
            head = None
        else:
            head, body = rows[0], rows[1:]
        h = [f'<table class="{cls}">']
        if head:
            h.append("<thead><tr>" + "".join("<th>" + inline(c) + "</th>" for c in head) + "</tr></thead>")
        h.append("<tbody>")
        for r in body:
            h.append("<tr>" + "".join("<td>" + inline(c) + "</td>" for c in r) + "</tr>")
        h.append("</tbody></table>")
        return "".join(h)

    def box(self, typ, title, inner):
        if typ == "signes":
            return self.signtable(inner)
        if typ == "page":
            return '<div class="pb"></div>' + self.blocks(inner)
        if typ == "cols":
            return '<div class="cols2">' + self.blocks(inner) + "</div>"
        if typ == "center":
            return '<div class="center">' + self.blocks(inner) + "</div>"
        if typ == "badges":
            return '<div class="badges">' + "".join(
                f'<span class="badge">{inline(l.strip())}</span>' for l in inner if l.strip()
            ) + "</div>"
        if typ == "cover":
            return '<section class="cover">' + self.blocks(inner) + "</section>"
        cls, dtitle, icon = BOXES[typ]
        title = title or dtitle
        body_lines = inner
        answers = None
        if typ == "check" and "---" in [l.strip() for l in inner]:
            k = [l.strip() for l in inner].index("---")
            body_lines, answers = inner[:k], inner[k + 1 :]
        h = [f'<div class="box {cls}">']
        if title:
            h.append(f'<div class="bt"><span class="bi">{icon}</span> {inline(title)}</div>')
        h.append(self.blocks(body_lines))
        if answers:
            h.append('<div class="ans"><b>Réponses :</b> ' + inline(" ".join(a.strip() for a in answers)) + "</div>")
        h.append("</div>")
        return "\n".join(h)

    def signtable(self, inner):
        rows = [split_cells(l.replace("||", "‖")) for l in inner if l.strip()]
        head = rows[0]
        label, bounds = head[0], head[1:]
        k = len(bounds)
        ncol = 2 * k - 1
        h = ['<table class="signes"><tbody>']
        cells = [f'<th class="lab">{inline("$" + label + "$")}</th>']
        for j in range(ncol):
            if j % 2 == 0:
                b = bounds[j // 2]
                cells.append(f'<th class="bd">{inline("$" + b + "$") if b else ""}</th>')
            else:
                cells.append('<th class="iv"></th>')
        h.append("<tr>" + "".join(cells) + "</tr>")
        for r in rows[1:]:
            lab = r[0]
            toks = r[1:]
            if len(toks) == ncol - 2:  # seulement l'intérieur : colonnes ±∞ vides
                toks = [""] + toks + [""]
            toks = toks + [""] * (ncol - len(toks))
            lab_html = inline(lab) if "$" in lab else inline("$\\displaystyle " + lab + "$")
            cells = [f'<th class="lab">{lab_html}</th>']
            for j, t in enumerate(toks[:ncol]):
                c = "bd" if j % 2 == 0 else "iv"
                t = t.strip()
                if t in ("||", "‖"):
                    cells.append(f'<td class="{c} dbar"><span class="dbl">‖</span></td>')
                elif t in ("/", "up"):
                    cells.append(f'<td class="{c} var"><span class="arr up">↗</span></td>')
                elif t in ("\\", "down"):
                    cells.append(f'<td class="{c} var"><span class="arr down">↘</span></td>')
                elif t.startswith("^"):
                    cells.append(f'<td class="{c} top">{inline("$" + t[1:] + "$")}</td>')
                elif t.startswith("_"):
                    cells.append(f'<td class="{c} bot">{inline("$" + t[1:] + "$")}</td>')
                elif t.startswith("‖"):
                    cells.append(f'<td class="{c} dbar"><span class="dbl">‖</span> {inline("$" + t[1:].strip() + "$")}</td>')
                elif t:
                    tt = t.replace("-", "−") if t in ("-", "+") else t
                    cells.append(f'<td class="{c}">{inline("$" + tt + "$") if tt not in ("−", "+") else tt}</td>')
                else:
                    cells.append(f'<td class="{c}"></td>')
            h.append("<tr>" + "".join(cells) + "</tr>")
        h.append("</tbody></table>")
        return "".join(h)

    def chapter_head(self, s):
        parts = [p.strip() for p in s.split("|")]
        if len(parts) == 1:
            return f'<h1 class="plain">{inline(parts[0])}</h1>'
        num, title = parts[0], parts[1]
        sub = parts[2] if len(parts) > 2 else ""
        self.chap = num
        self.ex_count = 0
        self.q_count = 0
        self.drill_letter = 0
        self.qprefix = ""
        hid = self.new_id("c")
        label = f"{num} · {title}" if num else title
        self.toc.append((1, hid, label))
        numhtml = f'<div class="cnum">{esc(num)}</div>' if num and len(num) <= 3 else ""
        return (
            f'<div class="pb"></div><header class="chap" id="{hid}">'
            f'{numhtml}<div class="ctit"><h1>{inline(title)}</h1>'
            + (f'<div class="csub">{inline(sub)}</div>' if sub else "")
            + "</div></header>"
        )

    # ------------------------------------------------------------ directives
    def directive(self, lines, i, out):
        s = lines[i].strip()
        name, _, arg = s[1:].partition(" ")
        arg = arg.strip()
        n = len(lines)
        if name == "page":
            out.append('<div class="pb"></div>')
            return i + 1
        if name == "toc":
            out.append('<div class="pb"></div><!--TOC-->')
            return i + 1
        if name == "fig":
            key, _, cap = arg.partition("|")
            out.append(self.figure(key.split(), cap.strip()))
            return i + 1
        if name == "serie":
            sid, _, title = arg.partition("|")
            sid = sid.strip()
            hid = self.new_id("x")
            first = self.ex_count + 1
            self.cur_serie = sid
            self.serie_drill = 0
            self.items.append(("serie", (sid, title.strip())))
            out.append(
                f'<h3 class="serie" id="{hid}">Série {esc(sid)} — {inline(title.strip())}</h3>'
            )
            return i + 1
        if name == "exo":
            return self.exercise(lines, i, out, arg)
        if name == "qcm":
            return self.qcm(lines, i, out, arg)
        if name == "drill":
            return self.drill(arg, out, i)
        if name == "corriges":
            out.append(self.corriges(arg))
            return i + 1
        if name == "qnum":
            self.qprefix = arg
            self.q_count = 0
            return i + 1
        if name == "check":
            self.checks.append((f"{self.chap}", arg))
            return i + 1
        raise SystemExit(f"Directive inconnue : {s}")

    def figure(self, keys, cap):
        svgs = []
        for k in keys:
            width = None
            if ":" in k:
                k, width = k.split(":")
            svg = figures.get(k)
            style = f' style="width:{width}%"' if width else ""
            svgs.append(f'<div class="fg"{style}>{svg}</div>')
        self.fig_count += 1
        c = f'<figcaption>{inline(cap)}</figcaption>' if cap else ""
        return f'<figure class="fig">{"".join(svgs)}{c}</figure>'

    def collect(self, lines, i, stops):
        buf = []
        while i < len(lines) and not any(lines[i].strip().startswith(s) for s in stops):
            buf.append(lines[i])
            i += 1
        return buf, i

    def exercise(self, lines, i, out, arg):
        lvl_s, _, title = arg.partition("|")
        lvl = int(lvl_s.strip() or 2)
        self.ex_count += 1
        self.n_ex += 1
        num = f"{self.chap}.{self.ex_count}"
        stmt, i = self.collect(lines, i + 1, ["@sol", "@end"])
        sol, checks_ = [], []
        if lines[i].strip().startswith("@sol"):
            body, i = self.collect(lines, i + 1, ["@end"])
            for l in body:
                if l.strip().startswith("@check "):
                    checks_.append(l.strip()[7:])
                else:
                    sol.append(l)
        for c in checks_:
            self.checks.append((f"Ex. {num}", c))
        eid = f"ex-{slug(num)}"
        t = f' <span class="extitle">{inline(title.strip())}</span>' if title.strip() else ""
        out.append(
            f'<div class="exo" id="{eid}"><div class="exh"><span class="exn">Ex. {num}</span>'
            f'<span class="stars" title="{LEVEL[lvl]}">{STARS[lvl]}</span>{t}</div>'
            f'<div class="exb">{self.blocks(stmt)}</div></div>'
        )
        self.items.append(("ex", (num, lvl, title.strip(), sol)))
        return i + 1

    def qcm(self, lines, i, out, arg):
        self.q_count += 1
        self.n_qcm += 1
        num = f"{self.q_count}" if self.qprefix else f"{self.chap}.{self.q_count}"
        body, i = self.collect(lines, i + 1, ["@rep", "@end"])
        stmt, opts = [], []
        for l in body:
            m = re.match(r"^\s*([A-D])\) (.*)$", l)
            if m:
                opts.append((m.group(1), m.group(2)))
            else:
                stmt.append(l)
        rep, expl = "", ""
        checks_ = []
        if lines[i].strip().startswith("@rep"):
            r = lines[i].strip()[4:].strip()
            rep, _, expl = r.partition("|")
            rep = rep.strip()
            i += 1
            more, i = self.collect(lines, i, ["@end"])
            for l in more:
                if l.strip().startswith("@check "):
                    checks_.append(l.strip()[7:])
                elif l.strip():
                    expl += " " + l.strip()
        for c in checks_:
            self.checks.append((f"Q {num}", c))
        longest = max(len(re.sub(r"\$|\\[a-z]+|[{}]", "", t)) for _, t in opts)
        w = "w4" if longest <= 16 else ("w2" if longest <= 40 else "w1")
        oh = "".join(f'<div class="opt"><b>{k}</b> {inline(t)}</div>' for k, t in opts)
        out.append(
            f'<div class="qcm"><div class="qh"><span class="qn">Q{esc(num)}</span></div>'
            f'<div class="qb">{self.blocks(stmt)}<div class="opts {w}">{oh}</div></div></div>'
        )
        self.items.append(("qcm", (num, rep, expl.strip())))
        return i + 1

    def drill(self, arg, out, i):
        spec, _, title = arg.partition("|")
        parts = spec.split()
        gname, count, seed = parts[0], int(parts[1]), int(parts[2])
        cols = int(parts[3]) if len(parts) > 3 else 3
        items = gens.generate(gname, count, seed)
        self.drill_letter += 1
        if self.chap == "R":
            self.serie_drill += 1
            did = f"{self.cur_serie}.{self.serie_drill}"
        else:
            did = f"{self.chap}.{'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[self.drill_letter - 1]}"
        self.n_drill += len(items)
        consigne = gens.CONSIGNE.get(gname, "")
        head = f'<div class="drill"><div class="dh"><span class="dn">Automatismes {esc(did)}</span> {inline(title.strip())}</div>'
        if consigne:
            head += f'<div class="dc">{inline(consigne)}</div>'
        lis = "".join(f"<li>{inline(q)}</li>" for q, _ in items)
        out.append(head + f'<ol class="dl c{cols}">{lis}</ol></div>')
        self.items.append(("drill", (did, title.strip(), [a for _, a in items], cols)))
        return i + 1

    def corriges(self, arg):
        h = []
        title = arg or f"Corrigés du chapitre {self.chap}"
        hid = self.new_id("k")
        self.toc.append((2, hid, title))
        h.append(f'<div class="pb"></div><h2 class="corr" id="{hid}">{inline(title)}</h2>')
        qcms = []
        for kind, data in self.items:
            if kind == "serie":
                sid, t = data
                h.append(f'<h3 class="serie">Série {esc(sid)} — {inline(t)}</h3>')
            elif kind == "ex":
                num, lvl, t, sol = data
                h.append(
                    f'<div class="sol"><div class="solh"><span class="exn">Corrigé Ex. {num}</span>'
                    f'<span class="stars">{STARS[lvl]}</span></div>{self.blocks(sol)}</div>'
                )
            elif kind == "drill":
                did, t, answers, cols = data
                lis = "".join(f"<li>{inline(a)}</li>" for a in answers)
                h.append(
                    f'<div class="drill sold"><div class="dh"><span class="dn">Automatismes {esc(did)}</span> {inline(t)} — réponses</div>'
                    f'<ol class="dl c{cols}">{lis}</ol></div>'
                )
            elif kind == "qcm":
                qcms.append(data)
        if qcms:
            h.append('<h3 class="serie">Corrigé des QCM</h3>')
            for num, rep, expl in qcms:
                h.append(
                    f'<p class="qsol"><span class="qn">Q{esc(num)}</span> <b class="rep">→ {esc(rep)}</b> {inline(expl)}</p>'
                )
        self.items = []
        return "\n".join(h)

    # ------------------------------------------------------------- document
    def render_toc(self, pages=None):
        h = ['<nav class="toc"><h2 class="toch">Sommaire</h2>']
        for lvl, hid, txt in self.toc:
            p = pages.get(hid, "") if pages else ""
            h.append(
                f'<div class="t{lvl}"><a href="#{hid}"><span class="tt">{inline(txt)}</span>'
                f'<span class="dots"></span><span class="tp">{p}</span></a></div>'
            )
        h.append("</nav>")
        return "\n".join(h)


def katex_macros():
    return {
        "\\R": "\\mathbb{R}",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
        "\\Q": "\\mathbb{Q}",
        "\\C": "\\mathbb{C}",
        "\\ff": "\\mathopen{[}#1\\,;\\,#2\\mathclose{]}",
        "\\fo": "\\mathopen{[}#1\\,;\\,#2\\mathclose{[}",
        "\\of": "\\mathopen{]}#1\\,;\\,#2\\mathclose{]}",
        "\\oo": "\\mathopen{]}#1\\,;\\,#2\\mathclose{[}",
        "\\V": "\\overrightarrow{#1}",
        "\\dx": "\\,\\mathrm{d}x",
        "\\dt": "\\,\\mathrm{d}t",
        "\\pv": "\\wedge",
        "\\Re": "\\operatorname{Re}",
        "\\Im": "\\operatorname{Im}",
        "\\ul": "\\underline{#1}",
    }


def page_html(body):
    fonts = ROOT / "node_modules/@fontsource"
    ff = []
    for w in (400, 600, 700):
        for st in ("normal", "italic"):
            f = fonts / f"source-sans-3/files/source-sans-3-latin-{w}-{st}.woff2"
            ff.append(
                f"@font-face{{font-family:'Source Sans 3';font-style:{st};font-weight:{w};src:url('{f.as_uri()}') format('woff2');}}"
            )
            f = fonts / f"source-sans-3/files/source-sans-3-latin-ext-{w}-{st}.woff2"
            ff.append(
                f"@font-face{{font-family:'Source Sans 3';font-style:{st};font-weight:{w};src:url('{f.as_uri()}') format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF;}}"
            )
    for w in (600, 700, 800):
        f = fonts / f"bitter/files/bitter-latin-{w}-normal.woff2"
        ff.append(f"@font-face{{font-family:'Bitter';font-weight:{w};src:url('{f.as_uri()}') format('woff2');}}")
    katex = (ROOT / "node_modules/katex/dist").as_uri()
    css = (SRC / "style.css").read_text(encoding="utf-8")
    macros = json.dumps(katex_macros())
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Mathématiques pour la passerelle — méthode complète</title>
<link rel="stylesheet" href="{katex}/katex.min.css">
<style>{''.join(ff)}</style>
<style>{css}</style>
<script src="{katex}/katex.min.js"></script>
<script src="{katex}/contrib/auto-render.min.js"></script>
</head><body>
{body}
<script>
window.addEventListener('load', () => {{
  const errors = [];
  renderMathInElement(document.body, {{
    delimiters: [{{left: '$$', right: '$$', display: true}}, {{left: '$', right: '$', display: false}}],
    throwOnError: false, strict: 'ignore', macros: {macros},
    errorCallback: (msg, err) => errors.push(msg + ' ' + err)
  }});
  document.querySelectorAll('.katex-error').forEach(e => errors.push('KATEX: ' + e.title + ' :: ' + e.textContent));
  window.__errors = errors;
  document.fonts.ready.then(() => {{ document.body.dataset.ready = '1'; }});
}});
</script>
</body></html>"""


def render_pdf(html_path, pdf_path):
    r = subprocess.run(
        ["node", str(SRC / "render.cjs"), str(html_path), str(pdf_path)],
        capture_output=True,
        text=True,
        env={**__import__("os").environ, "NODE_PATH": "/opt/node22/lib/node_modules"},
    )
    if r.stdout.strip():
        print(r.stdout.strip())
    if r.returncode != 0:
        print(r.stderr)
        raise SystemExit("Échec du rendu PDF")


def find_pages(pdf_path):
    """Numéros de page des titres, lus dans les destinations nommées du PDF (ancres HTML)."""
    import pymupdf

    doc = pymupdf.open(pdf_path)
    pages = {name: dest["page"] + 1 for name, dest in doc.resolve_names().items() if dest.get("page", -1) >= 0}
    return pages, doc.page_count


def main():
    only = sys.argv[1:]  # construire seulement certains fichiers (aperçu)
    OUT.mkdir(exist_ok=True)
    b = Builder()
    parts = []
    for f in FILES:
        if only and not any(o in f for o in only):
            continue
        p = CONTENU / f
        if not p.exists():
            print(f"(manquant : {f})")
            continue
        lines = p.read_text(encoding="utf-8").split("\n")
        lines = [l for l in lines if not l.startswith("%%")]  # commentaires
        parts.append(b.blocks(lines))
    body = "\n".join(parts)

    # vérifications mathématiques
    fails = checks.run(b.checks)
    print(f"Vérifications sympy : {len(b.checks)} ; échecs : {len(fails)}")
    for lab, expr, err in fails:
        print(f"  ✘ {lab}: {expr}  -> {err}")
    if fails:
        raise SystemExit(1)
    print(f"Exercices : {b.n_ex} · QCM : {b.n_qcm} · automatismes : {b.n_drill} · figures : {b.fig_count}")

    html_path = OUT / "guide.html"
    pdf_tmp = OUT / "pass1.pdf"
    html_path.write_text(page_html(body.replace("<!--TOC-->", b.render_toc())), encoding="utf-8")
    render_pdf(html_path, pdf_tmp)
    pages, npages = find_pages(pdf_tmp)
    html_path.write_text(page_html(body.replace("<!--TOC-->", b.render_toc(pages))), encoding="utf-8")
    render_pdf(html_path, pdf_tmp)
    pages2, npages = find_pages(pdf_tmp)
    if pages2 != pages:
        html_path.write_text(page_html(body.replace("<!--TOC-->", b.render_toc(pages2))), encoding="utf-8")
        render_pdf(html_path, pdf_tmp)
        pages2, npages = find_pages(pdf_tmp)

    import pymupdf

    doc = pymupdf.open(pdf_tmp)
    toc = []
    for lvl, hid, txt in b.toc:
        if hid in pages2:
            clean = re.sub(r"\$([^$]*)\$", r"\1", txt).replace("\\", "")
            clean = re.sub(r"\*\*|\*", "", clean)
            toc.append([lvl, clean, pages2[hid]])
    doc.set_toc(toc)
    doc.set_metadata(
        {
            "title": "Mathématiques pour la passerelle — méthode complète",
            "subject": "Cours, exercices corrigés, examens blancs, planning de 8 semaines",
            "author": "",
            "creator": "passerelle-maths",
            "producer": "Chromium + PyMuPDF",
        }
    )
    final = ROOT / PDF_NAME if not only else OUT / "apercu.pdf"
    doc.save(final, garbage=3, deflate=True)
    print(f"PDF : {final} ({npages} pages)")


if __name__ == "__main__":
    main()
