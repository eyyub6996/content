# Mathématiques pour la passerelle — méthode complète

Guide de préparation en 8 semaines (cours, exercices corrigés, automatismes, QCM, examens blancs).

Le PDF prêt à imprimer se trouve ici : `Mathematiques_passerelle_methode_complete.pdf`.

## Contenu

- Mode d'emploi, planning jour par jour sur 8 semaines, test de diagnostic
- Chapitres 0 à 8 : lire les maths et le calcul, calcul algébrique, équations et inéquations,
  trigonométrie, fonctions (exp, ln, limites), dérivées, intégrales, vecteurs, nombres complexes
- Pour chaque chapitre : objectifs, cours expliqué, exemples guidés, exercices classés par séries,
  automatismes (séries de calculs générées), QCM, bilan de fin de chapitre, corrigés détaillés
- 8 séries de révision cumulative, 3 examens blancs de 30 QCM avec correction expliquée
- Formulaire, 25 erreurs à éviter, 100 cartes mémoire, lexique français–italien

## Reconstruire le PDF

Prérequis : Python 3 (`sympy`, `matplotlib`, `pymupdf`), Node.js avec Playwright et Chromium.

```sh
npm install                       # KaTeX et polices
pip install sympy matplotlib pymupdf
python3 src/build.py              # construit le PDF complet (≈ 2 min)
python3 src/build.py 03_equations # aperçu d'un seul fichier -> build/apercu.pdf
```

## Organisation

- `contenu/*.txt` : le texte du guide, dans un format léger :
  - `# N | Titre | sous-titre` : chapitre ; `## N.M Titre` : section ; `### Titre` : sous-section
  - `:::type Titre` … `:::` : encadrés (`idee`, `pourquoi`, `coeur`, `astuce`, `exemple`, `piege`,
    `lire`, `methode`, `objectifs`, `check`, `note`, `examen`, `signes` pour les tableaux de signes/variations)
  - `+ texte` : étape numérotée ; `=> texte` : conclusion ; `> texte` : « À retenir »
  - `@exo N | titre` … `@sol` … `@check expr` … `@end` : exercice (difficulté N de 1 à 4), corrigé,
    vérification automatique avec sympy
  - `@qcm` … `A)`…`D)` … `@rep X | explication` … `@end` : question à choix multiples
  - `@drill générateur nombre graine colonnes | titre` : série d'automatismes générée par `src/gens.py`
  - `@serie ID | titre`, `@fig clé:largeur | légende`, `@corriges`, `@page`, `@toc`
  - formules en LaTeX entre `$…$` (en ligne) ou `$$…$$` (centrées), rendues par KaTeX
- `src/build.py` : analyse le contenu, vérifie toutes les réponses (`@check`), produit le HTML puis le PDF
- `src/gens.py` : générateurs d'automatismes (réponses calculées de façon exacte et vérifiées)
- `src/figures.py` : figures (matplotlib) ; `src/checks.py` : fonctions de vérification ;
  `src/render.cjs` : rendu PDF avec Chromium ; `src/style.css` : mise en page
