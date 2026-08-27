# Lincoln Luxury

Site vitrine statique (une seule page, en quatre langues) pour **Lincoln
Luxury** — wine tours et transport privé de luxe à Bordeaux, en Mercedes
Classe S.

## Structure du projet

```
.
├── index.html          # Page d'accueil, en français (langue par défaut)
├── en/index.html        # Version anglaise (mêmes sections, même structure)
├── es/index.html        # Version espagnole
├── zh/index.html        # Version chinoise (simplifié)
└── assets/
    ├── css/
    │   └── fonts.css    # Déclarations @font-face pour les polices auto-hébergées
    ├── fonts/            # Polices auto-hébergées (Cormorant Garamond, Playfair Display, Jost)
    └── img/               # Photos utilisées sur la page, partagées par les 4 langues
```

Il n'y a pas de dépendance, de build ni de framework : chaque `index.html`
embarque son propre CSS (identique dans les 4 langues) et un peu de
JavaScript inline (traduit dans chaque langue : validation de formulaire,
messages d'erreur, libellés d'accessibilité). Les quatre pages partagent les
mêmes ressources dans `assets/` via des chemins relatifs. Les seules
ressources externes sont les polices, qui sont auto-hébergées dans
`assets/fonts/` (pas d'appel à Google Fonts au runtime).

Le sélecteur de langue est dans l'en-tête (FR / EN / ES / 中文) ; les balises
`hreflang` sont posées sur les 4 pages pour le référencement multilingue.

## Mode clair / sombre

Le site est sombre par défaut. Un bouton dans l'en-tête (à côté du
sélecteur de langue) bascule vers un mode clair, en reprenant la palette
crème déjà utilisée par certaines sections. Le choix est mémorisé
(`localStorage`) et, à défaut, la préférence système
(`prefers-color-scheme`) est respectée au premier chargement. Le hero
(photo de nuit) garde volontairement ses couleurs sombres dans les deux
thèmes, le temps que l'en-tête ne soit pas encore "collée" en haut de page.

## Développement local

Aucune installation n'est nécessaire. Pour prévisualiser le site en local,
servez le dossier avec n'importe quel serveur statique, par exemple :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

(Ouvrir `index.html` directement avec `file://` fonctionne aussi pour un
aperçu rapide, mais un serveur local est plus fidèle au comportement en
production.)

## Déploiement (GitHub Pages)

Le site étant 100 % statique, il se déploie tel quel sur GitHub Pages, sans
étape de build. Voir la configuration mise en place dans ce dépôt (workflow
GitHub Actions ou branche de déploiement, selon la configuration choisie
dans les paramètres du dépôt).

## Crédits photo

Les photographies utilisées (Bordeaux, vignobles du Médoc/Sauternais/
Saint-Émilion, Mercedes Classe S) proviennent de Wikimedia Commons et sont
créditées en commentaire au-dessus de chaque balise `<img>` dans
`index.html` (auteur et licence : domaine public, CC0 ou CC BY-SA selon les
photos).
