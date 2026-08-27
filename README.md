# Lincoln Luxury

Site vitrine statique (une seule page) pour **Lincoln Luxury** — wine tours et
transport privé de luxe à Bordeaux, en Mercedes Classe S.

## Structure du projet

```
.
├── index.html          # Page unique : structure, styles (inline) et contenu
└── assets/
    ├── css/
    │   └── fonts.css    # Déclarations @font-face pour les polices auto-hébergées
    ├── fonts/            # Polices auto-hébergées (Cormorant Garamond, Playfair Display, Jost)
    └── img/               # Photos utilisées sur la page
```

Il n'y a pas de dépendance, de build ni de framework : `index.html` embarque
son propre CSS et un peu de JavaScript inline. Les seules ressources externes
sont les polices, qui sont auto-hébergées dans `assets/fonts/` (plus d'appel
à Google Fonts au runtime).

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
