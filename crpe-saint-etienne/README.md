# Réussir le CRPE 2027 — méthode complète (académie de Lyon, Saint-Étienne)

Guide de préparation au concours externe de professeur des écoles (CRPE, niveau bac+3), session 2027 :
cours, exercices corrigés, automatismes, QCM, sujets blancs et planning daté de fin septembre 2026 jusqu'aux écrits
des 30 et 31 mars 2027, puis préparation des oraux.

Le PDF prêt à imprimer se trouve ici : `CRPE_2027_Saint-Etienne_methode_complete.pdf`.

## Contenu

- Le concours en bref : épreuves, barèmes, notes éliminatoires, calendrier 2027, checklist des démarches
  (inscription Cyclades du 1er octobre au 25 novembre 2026, 12 h), planning semaine par semaine, préparation des oraux
- Test de diagnostic
- Français : classes de mots, fonctions, phrase complexe, verbe, accords et orthographe, lexique,
  compréhension et rédaction (avec un exemple rédigé complet)
- Mathématiques : nombres et calcul, arithmétique, proportionnalité et pourcentages, calcul littéral et fonctions,
  géométrie plane, grandeurs et mesures, statistiques et probabilités, algorithmique et tableur
- Écrit 2 : histoire-géographie-EMC, sciences et technologie, arts, anglais
- Oraux : méthode de l'oral 1 (français ou mathématiques) avec fiches notions et sujets corrigés ;
  entretien (présentation, système éducatif, valeurs de la République, mises en situation corrigées)
- Révisions cumulatives R1 à R3, trois sujets blancs de l'écrit 1 et un sujet blanc de l'écrit 2, corrigés et barèmes
- Annexes : formulaire, fiche mémo de grammaire, sigles, checklists des derniers jours, cartes mémoire,
  tableau de suivi, sources officielles

Les informations sur le concours datent de septembre 2026 : les textes officiels (devenirenseignant.gouv.fr,
ac-lyon.fr, Cyclades) font foi. Les sujets blancs sont des sujets d'entraînement, pas des sujets officiels.

## Reconstruire le PDF

Même chaîne de production que `../passerelle-maths` (voir son README pour le format des fichiers `contenu/*.txt`).
`node_modules` peut être un lien vers celui de `passerelle-maths` ou installé avec `npm install`.

```sh
npm install                       # KaTeX et polices
pip install sympy matplotlib pymupdf
python3 src/build.py              # construit le PDF complet
python3 src/build.py 03_nombres   # aperçu d'un seul fichier -> build/apercu.pdf
```

Les réponses mathématiques sont vérifiées automatiquement (`@check`, sympy) et les séries d'automatismes
sont générées avec leurs réponses exactes (`src/gens.py`).
