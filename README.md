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

## Contenu de la page

Les quatre langues suivent exactement la même structure, section par
section :

- **Témoignages** (« Ils nous font confiance ») — placés avant le 01, non
  numérotés : la confiance se donne avant l'argumentaire.
- **01 — Le service phare** : wine tours dans le vignoble bordelais.
- **02 — Circuits & itinéraires** : trois exemples de journées avec étapes
  horodatées, une carte schématique en SVG (Médoc, Libournais, Sauternes &
  Graves) et un tableau comparatif du coût réel d'une journée dans le
  vignoble (en solo, en VTC à la carte, avec Lincoln Luxury).
- **03 — Transport privé** : transferts, mise à disposition, discrétion.
- **04 — La Classe S** : la signature du service.
- **05 — La clientèle** : discrétion et confidentialité.
- **06 — Bordeaux et son vignoble** : le territoire et les appellations.
- **07 — Le déroulé** : comment se passe une réservation.
- **08 — Questions** (FAQ) et **09 — Contact** (formulaire de réservation).
- Pied de page : mentions légales, confidentialité, crédits photo.

## Mode clair / sombre

Le site est sombre par défaut. Un bouton dans l'en-tête (à côté du
sélecteur de langue) bascule vers un mode clair, en reprenant la palette
crème déjà utilisée par certaines sections. Le choix est mémorisé
(`localStorage`) et, à défaut, la préférence système
(`prefers-color-scheme`) est respectée au premier chargement. Le hero
(photo de nuit) garde volontairement ses couleurs sombres dans les deux
thèmes, le temps que l'en-tête ne soit pas encore "collée" en haut de page.

## À compléter avant la mise en ligne

Le contenu ci-dessous est volontairement signalé en placeholder (dans le
HTML et, pour certains, visuellement sur la page) et doit être remplacé
avant publication :

- **Coordonnées** : numéro de téléphone (`07 XX XX XX XX`) et adresse e-mail
  dans l'en-tête mobile, la section Contact, le pied de page et les deux
  blocs JSON-LD, sur les 4 langues.
- **Avis clients** : les trois témoignages sont des avis de démonstration
  (section « Ils nous font confiance ») — à remplacer par de vrais avis,
  obtenus avec l'accord des personnes concernées, avant d'ajouter un
  balisage schema.org Review.
- **Tableau comparatif des coûts** (section 02) : les montants (carburant,
  tarifs VTC en zone viticole...) sont des estimations indicatives, à
  vérifier avec de vrais tarifs locaux avant publication.
- **Mentions légales** : raison sociale, SIREN, capacité de transport,
  hébergeur — à compléter dans le pied de page des 4 langues.
- **Image de partage** (`og:image`) : pointe actuellement vers
  `og.jpg`, à créer (1200×630) et déposer à la racine.
- **Nom de domaine** : les URLs canoniques, `hreflang` et JSON-LD pointent
  vers `https://www.lincoln-luxury.fr/` (domaine acheté sur Hostinger) — à
  ajuster si le domaine final diffère. Voir la section « Domaine
  personnalisé (Hostinger) » ci-dessous pour le brancher sur GitHub Pages.
- **Photos** : les photographies actuelles viennent de Wikimedia Commons
  (voir Crédits photo ci-dessous) ; à remplacer de préférence par des
  photos du vignoble et du véhicule réalisées pour Lincoln Luxury.

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
étape de build, via le workflow GitHub Actions défini dans
`.github/workflows/` (déclenché à chaque push sur `main`).

### Domaine personnalisé (Hostinger)

Le domaine `lincoln-luxury.fr` a été acheté sur Hostinger et le fichier
`CNAME` à la racine du dépôt (`www.lincoln-luxury.fr`) indique à GitHub
Pages le domaine à servir. Deux étapes restent à faire pour que le site
réponde sur ce domaine :

1. **Chez Hostinger** (zone DNS du domaine, menu *Domaines → DNS / Nameservers*) :
   - un enregistrement **CNAME** pour `www` → `girardmaxime33000.github.io.`
   - quatre enregistrements **A** sur l'apex (`@` / `lincoln-luxury.fr`)
     vers les IP de GitHub Pages :
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - (optionnel, IPv6) quatre enregistrements **AAAA** sur l'apex :
     ```
     2606:50c0:8000::153
     2606:50c0:8001::153
     2606:50c0:8002::153
     2606:50c0:8003::153
     ```
   - Supprimer/désactiver tout « parking page » ou redirection par défaut
     mis en place par Hostinger sur le domaine.
2. **Côté GitHub** (Settings → Pages du dépôt) : renseigner
   `www.lincoln-luxury.fr` comme *Custom domain* (le fichier `CNAME` du
   dépôt le pré-remplit normalement), attendre la vérification DNS, puis
   cocher **Enforce HTTPS** une fois le certificat émis.

La propagation DNS peut prendre de quelques minutes à 24-48h. Une fois
active, l'apex `lincoln-luxury.fr` redirige automatiquement vers
`https://www.lincoln-luxury.fr/`.

## Crédits photo

Les photographies utilisées (Bordeaux, vignobles du Médoc/Sauternais/
Saint-Émilion, Mercedes Classe S) proviennent de Wikimedia Commons et sont
créditées en commentaire au-dessus de chaque balise `<img>` dans
`index.html` (auteur et licence : domaine public, CC0 ou CC BY-SA selon les
photos).
