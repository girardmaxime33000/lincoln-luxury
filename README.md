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
├── assets/
│   ├── css/
│   │   └── fonts.css    # Déclarations @font-face pour les polices auto-hébergées
│   ├── fonts/            # Polices auto-hébergées (Cormorant Garamond, Playfair Display, Jost)
│   └── img/               # Photos utilisées sur la page, partagées par les 4 langues
├── google-apps-script/
│   └── Code.gs           # Script Apps Script : reçoit le formulaire, écrit dans Google Sheets
├── .github/workflows/    # Déploiement automatique sur GitHub Pages à chaque push sur main
└── CNAME                 # Domaine personnalisé GitHub Pages (www.lincoln-luxury.fr)
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
- **08 — Questions** (FAQ) et **09 — Contact** (formulaire de réservation /
  simulateur de devis, voir la section dédiée ci-dessous).
- Pied de page : mentions légales, confidentialité, crédits photo, numéro
  de téléphone cliquable.

## Simulateur de devis & repères façon réservation/VTC

Au-delà de la page éditoriale, le site emprunte plusieurs codes des sites
de réservation (Booking) et des applis de VTC/taxi, tout en gardant le
style graphique noir/or du reste du site (pas de badge criard ni d'urgence
artificielle) :

- **Simulateur de devis** (section 09, Contact) : le choix de « Prestation »
  (mise à disposition avec chauffeur / transfert aéroport ou gare /
  transfert vers une destination / autre demande) fait apparaître les
  champs adaptés et calcule une estimation chiffrée en direct, entièrement
  côté navigateur — voir le détail complet dans « Formulaire → Google
  Sheets » ci-dessous, où sont documentés la grille tarifaire, le format
  des données envoyées et leur enregistrement.
- **Mini-estimateur dans le hero** : une « barre de recherche » compacte,
  tout en haut de la page, qui laisse choisir une prestation dès l'écran
  d'accueil (`#hero-quote` / `#hero-service`). Valider renvoie vers le
  simulateur complet en bas de page avec la prestation déjà présélectionnée
  et le focus posé sur le premier champ — aucun calcul n'est dupliqué ici,
  c'est une redirection vers le vrai formulaire.
- **Barre d'appel à l'action fixe** (`.mobile-cta`) : sur mobile et
  tablette (moins de 1180px de large, tant que le bouton « Réserver » de
  l'en-tête desktop n'est pas visible), une barre reste fixée en bas de
  l'écran avec un lien « Appeler » (`tel:`) et un lien « Devis instantané »
  vers le formulaire.
- **Bandeau de réassurance** (`.trust-bar`) : juste au-dessus du
  formulaire de contact — devis gratuit et sans engagement, réponse
  personnelle sous 24h, discrétion totale sur les données transmises.
- **Numéro de téléphone cliquable** : le numéro (`07 XX XX XX XX`, encore
  un placeholder — voir « À compléter avant la mise en ligne ») est un
  vrai lien `tel:` partout où il apparaît : menu plein écran mobile, pied
  de page et barre d'appel à l'action fixe. Il suffira de remplacer le
  placeholder (dans le `href="tel:"` et dans le texte affiché) une fois le
  vrai numéro connu pour que ces trois emplacements fonctionnent.

## Référencement, suivi & accessibilité

- **SEO** : balises `hreflang` croisées entre les 4 langues, URL
  canonique, image de partage Open Graph (`og:image`), et deux blocs
  JSON-LD par page — un schéma `LimousineService` (coordonnées, zone
  desservie, prestations proposées) et un schéma `FAQPage` qui reprend les
  questions de la section 08. Un favicon typographique (monogramme « L »
  doré sur fond noir) est généré en `data:` URI SVG inline, sans fichier
  externe.
- **Suivi** : Google Tag Manager (`GTM-NJ3XCNSF`) et Google Analytics via
  `gtag.js` (`G-8XLYD7NMHF`) sont posés en haut de chaque page, avec le
  `<noscript>` de secours pour GTM. Identifiants à remplacer par ceux du
  compte définitif avant mise en ligne si besoin.
- **Accessibilité** : lien d'évitement (« Aller au contenu ») en tout
  début de page, messages d'erreur de formulaire en `role="status"`,
  intitulés `aria-label`/`aria-describedby` sur les champs et boutons,
  `prefers-reduced-motion` respecté (désactive les animations de
  révélation au scroll et le grain du hero), état de focus visible
  (`:focus-visible`) cohérent avec la charte graphique.
- **Impression** : une feuille de style dédiée (`@media print`) masque
  l'en-tête, le menu plein écran, le bandeau défilant et les effets visuels
  du hero pour ne conserver que le contenu utile.

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

- **Coordonnées** : numéro de téléphone (`07 XX XX XX XX` / `tel:+33700000000`)
  et adresse e-mail, sur les 4 langues. Le numéro apparaît à quatre
  endroits : le menu plein écran mobile, la barre d'appel à l'action fixe
  (mobile/tablette), le pied de page et les deux blocs JSON-LD — chercher
  `07 XX XX XX XX` et `+33700000000` dans chaque fichier pour les
  remplacer tous. (Le bloc récapitulatif Téléphone/Courriel/Zone qui
  figurait à côté du formulaire de contact a été retiré : ces informations
  ne sont plus affichées tant qu'elles ne sont pas définitives.)
- **Formulaire de contact** : le formulaire envoie ses soumissions vers
  Google Sheets via Google Apps Script, mais l'URL de déploiement doit être
  renseignée avant mise en ligne — voir la section « Formulaire → Google
  Sheets » ci-dessous.
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

## Formulaire → Google Sheets

Le formulaire de contact (section 09, les 4 langues) envoie ses soumissions
à une feuille Google Sheets via un script Google Apps Script fourni dans
`google-apps-script/Code.gs`. Aucun serveur n'est nécessaire : le
JavaScript du formulaire fait un `fetch()` en `POST` directement vers le
déploiement Apps Script.

### Mise en place (à faire une seule fois)

1. Crée une nouvelle feuille de calcul sur [Google Sheets](https://sheets.google.com)
   (par exemple « Lincoln Luxury — Demandes »).
2. Dans cette feuille : menu **Extensions → Apps Script**.
3. Supprime le contenu par défaut de `Code.gs` et colle-y le contenu du
   fichier `google-apps-script/Code.gs` de ce dépôt. Enregistre (icône
   disquette ou `Ctrl/Cmd+S`).
4. **Déployer → Nouveau déploiement** :
   - Type : **Application Web**
   - Exécuter en tant que : **Moi** (ton compte Google)
   - Qui a accès : **Tout le monde**
   - Clique sur **Déployer**, autorise les permissions demandées (le script
     accède uniquement à cette feuille), puis copie l'**URL de
     l'application Web** générée (elle se termine par `/exec`).
5. Colle cette URL dans la constante `GOOGLE_SHEETS_ENDPOINT` du script
   inline, **dans les 4 fichiers HTML** (`index.html`, `en/index.html`,
   `es/index.html`, `zh/index.html`) — cherche
   `URL_DU_DEPLOIEMENT_APPS_SCRIPT_A_COMPLETER` et remplace par l'URL
   copiée à l'étape précédente.
6. `NOTIFY_EMAIL` est déjà renseignée dans `Code.gs` avec
   `girard.maxime33@gmail.com,driver.lincoln-luxury@outlook.com` — ce sont
   ces adresses (séparées par une virgule) qui recevront une notification à
   chaque demande. Change-les directement dans l'éditeur Apps Script si
   besoin (puis **Gérer les déploiements → modifier → Nouvelle version**,
   voir plus bas — cela ne change pas l'URL). Laisse `NOTIFY_EMAIL = ""`
   pour désactiver les notifications par e-mail (seule la feuille Google
   Sheets sera alors mise à jour).

Tant que l'URL de déploiement n'est pas renseignée dans les fichiers HTML,
le formulaire refuse l'envoi et affiche un message expliquant qu'il n'est
pas encore connecté (visible en local, donc facile à repérer avant mise en
ligne).

### Fonctionnement

- Le formulaire est un **simulateur de devis** : le choix de « Prestation »
  (mise à disposition avec chauffeur / transfert aéroport ou gare / transfert
  vers une destination / autre demande) fait apparaître les champs adaptés
  (heures par jour et paniers repas, ou horaire jour/nuit, ou destination et
  aller-retour) et calcule une estimation en direct, entièrement côté
  navigateur, à partir de la grille tarifaire codée en haut du script inline
  de chaque page (100 €/h en mise à disposition, minimum 4h, 25 € le panier
  repas, 100 €/139,90 € pour un transfert Bordeaux jour/nuit, tarifs fixes
  par destination). Le total s'affiche dans un encart doré avec un lien
  « Voir le détail » repliable ; pour « Autre demande », aucun calcul n'est
  proposé (« Devis personnalisé »).
- Chaque soumission valide ajoute une ligne dans la feuille active du
  classeur (date, nom, courriel, téléphone, prestation, date de début, date
  de fin, nombre de jours, détail du devis, estimation en euros, nombre de
  passagers, message, langue de la page, URL de la page). Le script crée
  automatiquement la ligne d'en-têtes au premier envoi. Les dates de
  début/fin sont saisies via un calendrier sur le site
  (`<input type="date">`) ; le nombre de jours est calculé automatiquement
  par le script (inclusif : du 12 au 12 = 1 jour), vide si une des deux
  dates manque. Le détail et le montant du devis sont calculés côté
  navigateur (voir ci-dessus) puis transmis tels quels au script, qui se
  contente de les enregistrer — il n'y a pas de double calcul côté serveur,
  car il s'agit d'une demande de devis indicative et non d'un paiement.
- L'appel `fetch()` utilise le mode `no-cors` (Apps Script ne gère pas les
  requêtes CORS en préflight) : la réponse ne peut donc pas être lue côté
  navigateur — la confirmation à l'écran signifie seulement que la requête
  est partie sans erreur réseau, pas qu'Apps Script l'a traitée avec
  succès. Vérifie de temps en temps que la feuille se remplit bien.
- Si tu redéploies le script après une modification (`Code.gs`), choisis
  **Gérer les déploiements → modifier → Nouvelle version** pour que l'URL
  existante reste valide (sinon il faut mettre à jour les 4 fichiers HTML
  avec la nouvelle URL).

### Notification par e-mail

À chaque demande enregistrée dans la feuille, le script envoie aussi un
e-mail récapitulatif mis en forme (HTML, avec repli en texte brut) aux
adresses définies dans `NOTIFY_EMAIL` (en haut de `Code.gs`) : nom,
courriel, téléphone, prestation, date de début, date de fin, nombre de
jours (calculé automatiquement), détail du devis, estimation (mise en
valeur en gras doré), passagers, message, langue, page. L'e-mail du client
est placé en « répondre à », donc répondre directement à la notification
répond au client.

- L'e-mail est envoyé depuis le compte Google propriétaire du script
  (celui utilisé lors du déploiement), avec la limite quotidienne standard
  de `MailApp` pour un compte Google gratuit (100 e-mails/jour) — largement
  suffisant pour un formulaire de contact.
- Un échec d'envoi d'e-mail n'empêche jamais l'écriture dans la feuille
  Google Sheets : la feuille reste la source de vérité si un e-mail se
  perd.
- Pour couper les notifications sans toucher au reste, vide `NOTIFY_EMAIL`
  (`NOTIFY_EMAIL = "";`) et redéploie une nouvelle version.

**La feuille se remplit mais aucun e-mail n'arrive** : c'est en général une
autorisation Gmail manquante. Comme les appels du formulaire sont
automatiques, Google ne peut pas afficher de fenêtre d'autorisation à ce
moment-là — l'envoi échoue silencieusement (l'erreur est journalisée mais
n'empêche pas la ligne d'être ajoutée à la feuille). Pour corriger :

1. Dans l'éditeur Apps Script, ouvre le menu déroulant à côté du bouton
   **Exécuter** et choisis la fonction **`testerNotification`**.
2. Clique sur **Exécuter**. Si une fenêtre d'autorisation Google apparaît
   (avec un éventuel écran « Google n'a pas vérifié cette application » →
   **Paramètres avancés → Accéder à [nom du projet] (non sécurisé)**),
   valide-la.
3. Regarde si l'e-mail de test arrive à l'adresse définie dans
   `NOTIFY_EMAIL` (vérifie aussi les spams).
4. En cas d'erreur, le détail apparaît directement dans l'éditeur ainsi que
   dans le journal **Exécutions**.

### Dashboard

Le classeur peut aussi afficher un onglet **Dashboard** récapitulant les
demandes reçues (indicateurs clés — dont un total estimé en euros cumulant
tous les devis calculés —, répartitions par prestation/langue/page,
évolution mensuelle, dernières demandes), construit uniquement avec des
formules natives Google Sheets (`QUERY`, `COUNTIFS`) — donc modifiable
librement ensuite directement dans Sheets.

Mise en page pensée pour une consultation sur mobile : tout est empilé
verticalement dans la seule colonne visible (A), sans aucune cellule
fusionnée et sans jamais avoir besoin de scroller horizontalement dans
l'appli Google Sheets. Les 10 dernières demandes s'affichent en petites
cartes (une par ligne) plutôt qu'en tableau large. Les colonnes B à N sont
masquées : elles servent uniquement de zone de calcul interne (résultats
bruts des `QUERY`) utilisée pour composer le texte affiché en colonne A.

Pour le générer (ou le régénérer) :

1. Vérifie que `LEADS_SHEET_NAME` (en haut de `Code.gs`) correspond bien au
   nom de l'onglet qui reçoit les lignes du formulaire (`Sheet1` par
   défaut) — renomme-le dans le script si tu as renommé l'onglet.
2. Dans l'éditeur Apps Script, ouvre le menu déroulant à côté du bouton
   **Exécuter** et choisis la fonction **`setupDashboard`**.
3. Clique sur **Exécuter**. Un onglet **Dashboard** est créé (ou réinitialisé
   s'il existe déjà) en première position du classeur.

Relancer `setupDashboard` à tout moment écrase et régénère l'onglet à
l'identique — utile si tu veux revenir à la mise en page d'origine après
l'avoir personnalisé. Aucun effet sur l'onglet des demandes ni sur
l'envoi d'e-mail.

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
