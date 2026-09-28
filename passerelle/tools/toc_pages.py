"""Trova le pagine dei titoli nel libro PDF e scrive toc.json per l'indice.
Uso: python toc_pages.py passerelle_libro.pdf toc.json   (serve pypdf)
"""
import json, re, sys
from pypdf import PdfReader

pdf, out = sys.argv[1], sys.argv[2]
pages = [re.sub(r"\s+", " ", (p.extract_text() or "").replace("’", "'")) for p in PdfReader(pdf).pages]
start = next(i for i, t in enumerate(pages) if "Il percorso in 3 regole" in t)
toc = {"howto": start + 1}

def find(key, pattern):
    rx = re.compile(pattern)
    for i in range(start, len(pages)):
        if rx.search(pages[i]):
            toc[key] = i + 1
            return
    print("NON TROVATO:", key, pattern)

find("plan", r"Piano di studio in 8 settimane")
for n in range(11):
    find("T%d" % n, r"Tappa %d · " % n)
    find("S%d" % n, r"Soluzioni della tappa %d(?!\d)" % n)
lessons = sorted({m for t in pages[start:] for m in re.findall(r"Lezione (\d+\.\d+) · ", t)}, key=lambda s: tuple(map(int, s.split("."))))
for c in lessons:
    find("L" + c, r"Lezione %s · " % re.escape(c))
find("E1", r"Esami di prova · Esame 1")
find("ES", r"Soluzioni degli esami di prova")
find("FR", r"Esame in francese dal corso originale")
find("FS", r"Soluzioni dell'esame in francese")
json.dump(toc, open(out, "w"), indent=0)
print(len(toc), "voci,", len(pages), "pagine")
