# Lincoln Luxury

Site vitrine statique (page d'accueil + pages circuit dédiées, en quatre
langues) pour **Lincoln Luxury** — wine tours et transport privé de luxe à
Bordeaux, en Mercedes Classe S.

## Sommaire

- [Structure du projet](#structure-du-projet)
  - [Pages circuit (SEO)](#pages-circuit-seo)
- [Fonctionnalités](#fonctionnalités)
  - [Contenu des pages](#contenu-des-pages)
  - [Simulateur de devis & repères façon réservation/VTC](#simulateur-de-devis--repères-façon-réservationvtc)
  - [Référencement, suivi & accessibilité](#référencement-suivi--accessibilité)
  - [Mode clair / sombre](#mode-clair--sombre)
- [Formulaire → Google Sheets](#formulaire--google-sheets)
  - [Mise en place](#mise-en-place-à-faire-une-seule-fois)
  - [Fonctionnement](#fonctionnement)
  - [Notification par e-mail](#notification-par-e-mail)
  - [Dashboard](#dashboard)
- [Protection anti-spam (reCAPTCHA v3)](#protection-anti-spam-recaptcha-v3)
- [Check-list avant la mise en ligne](#check-list-avant-la-mise-en-ligne)
- [Développement & déploiement](#développement--déploiement)
  - [Développement local](#développement-local)
  - [Déploiement (GitHub Pages)](#déploiement-github-pages)
  - [Domaine personnalisé (Hostinger)](#domaine-personnalisé-hostinger)
- [Crédits photo](#crédits-photo)

## Structure du projet

```
.
├── index.html                    # Accueil, en français (langue par défaut)
├── en/index.html                  # Version anglaise (mêmes sections, même structure)
├── es/index.html                  # Version espagnole
├── zh/index.html                  # Version chinoise (simplifié)
├── medoc/index.html               # Page circuit « Médoc », en français
├── saint-emilion/index.html       # Page circuit « Saint-Émilion & Pomerol »
├── sauternes/index.html           # Page circuit « Sauternes »
├── pessac-leognan/index.html      # Page circuit « Pessac-Léognan »
├── en/medoc/  en/saint-emilion/  en/sauternes/  en/pessac-leognan/   # idem, EN
├── es/medoc/  es/saint-emilion/  es/sauternes/  es/pessac-leognan/   # idem, ES
├── zh/medoc/  zh/saint-emilion/  zh/sauternes/  zh/pessac-leognan/   # idem, ZH
├── assets/
│   ├── css/
│   │   ├── fonts.css    # Déclarations @font-face pour les polices auto-hébergées
│   │   └── site.css     # Feuille de style unique, chargée par les 20 pages
│   ├── fonts/            # Polices auto-hébergées (Cormorant Garamond, Playfair Display, Jost)
│   └── img/               # Photos utilisées sur le site, partagées par toutes les pages/langues
├── google-apps-script/
│   └── Code.gs           # Script Apps Script : reçoit le formulaire, écrit dans Google Sheets
├── .github/workflows/    # Déploiement automatique sur GitHub Pages à chaque push sur main
├── sitemap.xml            # Les 20 URLs (4 accueils + 16 pages circuit), avec alternates hreflang
├── robots.txt             # Pointe vers sitemap.xml
├── CREDITS.md             # Sources et licences des photographies utilisées
└── CNAME                 # Domaine personnalisé GitHub Pages (www.lincoln-luxury.fr)
```

Il n'y a pas de dépendance, de build ni de framework. Le CSS est partagé par
les 20 pages via `assets/css/site.css` (identique quelle que soit la langue
ou la page) : un changement de design se fait à un seul endroit. Chaque page
embarque en revanche son propre JavaScript inline, traduit dans sa langue
(validation de formulaire, messages d'erreur, libellés d'accessibilité) —
chaque page circuit inclut son propre formulaire de devis complet, identique
à celui de l'accueil, avec la prestation « Wine tour » pré-sélectionnée.
Toutes les pages partagent les mêmes ressources dans `assets/` via des
chemins relatifs. Les seules ressources externes sont les polices, qui sont
auto-hébergées dans `assets/fonts/` (pas d'appel à Google Fonts au runtime).

Le sélecteur de langue dans l'en-tête est un menu déroulant (bouton + panneau
listant Français/English/Español/中文) ; les balises `hreflang` sont posées
sur chaque page (accueils et pages circuit) pour le référencement
multilingue, et reprises dans `sitemap.xml`.

### Pages circuit (SEO)

En complément de la section « Circuits » de l'accueil (aperçu des 3
itinéraires), chaque appellation a sa propre page dédiée (Médoc,
Saint-Émilion, Sauternes, Pessac-Léognan), en 4 langues : accroche et
argumentaire propres à l'appellation, déroulé indicatif, FAQ spécifique avec
balisage `FAQPage` (schema.org) pour les extraits enrichis Google, liens
croisés vers les autres circuits, et formulaire de devis complet en bas de
page. Elles sont maillées depuis l'accueil (liens « En savoir plus » dans la
section Circuits) et listées dans `sitemap.xml`.

## Fonctionnalités

### Contenu des pages

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

### Simulateur de devis & repères façon réservation/VTC

Au-delà de la page éditoriale, le site emprunte plusieurs codes des sites
de réservation (Booking) et des applis de VTC/taxi, tout en gardant le
style graphique noir/or du reste du site (pas de badge criard ni d'urgence
artificielle) :

- **Simulateur de devis** (section 09, Contact) : le choix de « Prestation »
  (mise à disposition avec chauffeur / transfert aéroport ou gare /
  transfert vers une destination / autre demande) fait apparaître les
  champs adaptés et calcule une estimation chiffrée en direct, entièrement
  côté navigateur — voir le détail complet dans « [Formulaire → Google
  Sheets](#formulaire--google-sheets) », où sont documentés la grille
  tarifaire, le format des données envoyées et leur enregistrement.
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
  un placeholder — voir la [check-list avant mise en ligne](#check-list-avant-la-mise-en-ligne))
  est un vrai lien `tel:` partout où il apparaît : menu plein écran mobile,
  pied de page et barre d'appel à l'action fixe. Il suffira de remplacer le
  placeholder (dans le `href="tel:"` et dans le texte affiché) une fois le
  vrai numéro connu pour que ces trois emplacements fonctionnent.
- **Protection anti-spam** (reCAPTCHA v3, invisible) : voir la section
  [reCAPTCHA](#protection-anti-spam-recaptcha-v3) ci-dessous.

### Référencement, suivi & accessibilité

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

### Mode clair / sombre

Le site est sombre par défaut. Un bouton dans l'en-tête (à côté du
sélecteur de langue) bascule vers un mode clair, en reprenant la palette
crème déjà utilisée par certaines sections. Le choix est mémorisé
(`localStorage`) et, à défaut, la préférence système
(`prefers-color-scheme`) est respectée au premier chargement. Le hero
(photo de nuit) garde volontairement ses couleurs sombres dans les deux
thèmes, le temps que l'en-tête ne soit pas encore "collée" en haut de page.

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
   copiée à l'étape précédente. *(Déjà fait sur ce dépôt : les 4 fichiers
   pointent vers le déploiement en production.)*
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

## Protection anti-spam (reCAPTCHA v3)

Le formulaire peut être protégé par **reCAPTCHA v3 de Google** : invisible,
sans case à cocher ni interruption pour le visiteur — Google calcule un
score de confiance en arrière-plan à partir du comportement de navigation.
Tant qu'il n'est pas configuré, le formulaire fonctionne exactement comme
avant (aucun filtrage).

1. Crée un site sur la [console reCAPTCHA](https://www.google.com/recaptcha/admin/create) :
   - Type : **reCAPTCHA v3**.
   - Domaines : `lincoln-luxury.fr` (et `localhost` si tu veux tester en
     local).
   - Valide : Google fournit une **clé de site** (publique) et une **clé
     secrète** (privée).
2. Colle la **clé de site** dans la constante `RECAPTCHA_SITE_KEY` du
   script inline, **dans les 4 fichiers HTML** — cherche
   `RECAPTCHA_SITE_KEY_A_COMPLETER` et remplace par la clé copiée.
3. Colle la **clé secrète** dans la constante `RECAPTCHA_SECRET_KEY` en
   haut de `google-apps-script/Code.gs` — cherche
   `RECAPTCHA_SECRET_KEY_A_COMPLETER` et remplace par la clé copiée, puis
   redéploie une **Nouvelle version** (voir plus haut).
4. Une fois les deux clés renseignées, une mention légale (« Ce site est
   protégé par reCAPTCHA... ») apparaît automatiquement sous le formulaire
   — elle est masquée tant que la clé de site n'est pas configurée. Le
   badge Google habituel (le petit encart flottant en bas d'écran) est
   volontairement masqué en CSS (`.grecaptcha-badge`) pour ne pas nuire à
   l'esthétique du site ni chevaucher la barre d'appel à l'action mobile ;
   c'est autorisé par Google à condition de garder cette mention légale.

*(Déjà fait sur ce dépôt : les deux clés sont renseignées et la protection
est active.)*

**Philosophie du filtrage** : reCAPTCHA v3 ne bloque **jamais** une
soumission par excès de prudence. Le jeton est obtenu en tâche de fond,
avec un délai maximal de 6 secondes ; s'il n'est pas obtenu à temps (script
Google bloqué par un bloqueur de publicités, réseau lent, service
indisponible), la demande part quand même sans jeton. Côté serveur
(`Code.gs`), seul un jeton **explicitement mauvais** (score inférieur à
`RECAPTCHA_MIN_SCORE`, 0,5 par défaut) fait ignorer la soumission ; un
jeton absent ou une erreur de vérification ne bloque jamais rien. Ce choix
privilégie volontairement la perte occasionnelle d'un spam plutôt que le
risque de perdre une vraie demande de devis.

## Check-list avant la mise en ligne

Le contenu ci-dessous est volontairement signalé en placeholder (dans le
HTML et, pour certains, visuellement sur la page). État actuel :

- [x] **Formulaire de contact connecté** : `GOOGLE_SHEETS_ENDPOINT` pointe
  vers le déploiement Apps Script en production, dans les 4 langues — voir
  [Formulaire → Google Sheets](#formulaire--google-sheets).
- [x] **reCAPTCHA activé** : `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY`
  sont renseignées, la protection anti-spam est en place — voir
  [Protection anti-spam](#protection-anti-spam-recaptcha-v3).
- [ ] **Coordonnées** : numéro de téléphone (`07 XX XX XX XX` /
  `tel:+33700000000`) et adresse e-mail, sur les 4 langues. Le numéro
  apparaît à quatre endroits : le menu plein écran mobile, la barre
  d'appel à l'action fixe (mobile/tablette), le pied de page et les deux
  blocs JSON-LD — chercher `07 XX XX XX XX` et `+33700000000` dans chaque
  fichier pour les remplacer tous.
- [ ] **Avis clients** : les trois témoignages sont des avis de
  démonstration (section « Ils nous font confiance ») — à remplacer par de
  vrais avis, obtenus avec l'accord des personnes concernées, avant
  d'ajouter un balisage schema.org Review.
- [ ] **Tableau comparatif des coûts** (section 02) : les montants
  (carburant, tarifs VTC en zone viticole...) sont des estimations
  indicatives, à vérifier avec de vrais tarifs locaux avant publication.
- [ ] **Mentions légales** : raison sociale, SIREN, capacité de transport,
  hébergeur — à compléter dans le pied de page des 4 langues.
- [ ] **Image de partage** (`og:image`) : pointe actuellement vers
  `og.jpg`, à créer (1200×630) et déposer à la racine.
- [ ] **Photos** : les photographies actuelles viennent de Wikimedia
  Commons (voir [Crédits photo](#crédits-photo)) ; à remplacer de
  préférence par des photos du vignoble et du véhicule réalisées pour
  Lincoln Luxury.
- [x] **Nom de domaine** : les URLs canoniques, `hreflang` et JSON-LD
  pointent déjà vers `https://www.lincoln-luxury.fr/`, le domaine acheté
  sur Hostinger — à ajuster seulement si le domaine final change. Voir
  [Domaine personnalisé (Hostinger)](#domaine-personnalisé-hostinger)
  pour le branchement complet sur GitHub Pages.

## Développement & déploiement

### Développement local

Aucune installation n'est nécessaire. Pour prévisualiser le site en local,
servez le dossier avec n'importe quel serveur statique, par exemple :

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

(Ouvrir `index.html` directement avec `file://` fonctionne aussi pour un
aperçu rapide, mais un serveur local est plus fidèle au comportement en
production.)

### Déploiement (GitHub Pages)

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
Saint-Émilion/Pessac-Léognan, Mercedes Classe S) sont créditées en commentaire
au-dessus de chaque balise `<img>`, et dans le pied de page de chaque page
(section « Crédits photo »). Sources, auteurs et licences complets (domaine
public, CC0, CC BY-SA ou autorisation du client selon les photos) : voir
[`CREDITS.md`](CREDITS.md).
