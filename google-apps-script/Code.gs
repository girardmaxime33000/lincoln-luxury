/**
 * Reçoit les soumissions du formulaire de contact du site Lincoln Luxury
 * (POST en JSON, envoyé par le `fetch()` des 4 pages index.html), les
 * ajoute comme nouvelle ligne dans la feuille active du classeur auquel
 * ce script est lié, puis envoie une notification par e-mail avec le
 * détail de la demande.
 *
 * Installation : voir la section « Formulaire -> Google Sheets » du
 * README à la racine du dépôt.
 */

// Adresse(s) qui reçoivent une notification à chaque nouvelle demande.
// Plusieurs adresses peuvent être séparées par des virgules.
// Laisser vide ("") pour désactiver l'envoi d'e-mail (seule la feuille
// Google Sheets sera alors mise à jour).
var NOTIFY_EMAIL = "girard.maxime33@gmail.com,driver.lincoln-luxury@outlook.com";

// Nom de l'onglet qui reçoit les lignes du formulaire (utilisé par
// setupDashboard ci-dessous pour construire les formules du dashboard).
var LEADS_SHEET_NAME = "Sheet1";

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var headers = [
    "Date", "Nom", "Courriel", "Téléphone", "Prestation",
    "Début", "Fin", "Nombre de jours", "Passagers", "Message", "Langue", "Page"
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = {};
  }

  // Ignore les requêtes vides : Google Apps Script redirige en interne
  // après un POST, et le navigateur peut suivre cette redirection avec une
  // deuxième requête sans corps JSON. Sans nom, courriel ni message, ce
  // n'est clairement pas une vraie soumission du formulaire — on ne
  // l'enregistre pas et on n'envoie pas d'e-mail, mais on répond quand
  // même "success" pour ne rien casser côté site.
  if (!data.name && !data.email && !data.message) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // "Nombre de jours" est calculé ici (dates inclusives : du 12 au 12 = 1
  // jour, du 12 au 14 = 3 jours) et réutilisé tel quel dans l'e-mail de
  // notification ; laissé vide si une des deux dates manque.
  var dateStart = data.dateStart ? new Date(data.dateStart) : "";
  var dateEnd = data.dateEnd ? new Date(data.dateEnd) : "";
  var nbJours = "";
  if (dateStart && dateEnd) {
    var msParJour = 24 * 60 * 60 * 1000;
    nbJours = Math.round((dateEnd - dateStart) / msParJour) + 1;
    if (nbJours < 1) { nbJours = ""; } // garde-fou si fin avant début
  }
  data.nbJours = nbJours;

  sheet.appendRow([
    data.submittedAt ? new Date(data.submittedAt) : new Date(),
    data.name || "",
    data.email || "",
    data.phone || "",
    data.service || "",
    dateStart || "",
    dateEnd || "",
    nbJours,
    data.pax || "",
    data.message || "",
    data.lang || "",
    data.page || ""
  ]);

  if (NOTIFY_EMAIL && NOTIFY_EMAIL.indexOf("@") > -1) {
    try {
      sendNotificationEmail(data);
    } catch (mailErr) {
      // Une erreur d'envoi d'e-mail ne doit pas empêcher l'enregistrement
      // dans la feuille : elle est simplement journalisée.
      console.error("Échec de l'envoi de la notification : " + mailErr);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Envoie un e-mail récapitulant la demande à NOTIFY_EMAIL, avec le
 * courriel du client en "répondre à" pour pouvoir lui répondre directement.
 * Envoyé en HTML (mise en forme Lincoln Luxury) avec un repli en texte
 * brut pour les clients de messagerie qui n'affichent pas le HTML.
 */
function sendNotificationEmail(data) {
  var subject = "Nouvelle demande de réservation — " + (data.name || "site Lincoln Luxury");

  var dateStartFr = formatDateFr_(data.dateStart);
  var dateEndFr = formatDateFr_(data.dateEnd);
  var nbJoursTxt = data.nbJours ? (data.nbJours + " jour" + (data.nbJours > 1 ? "s" : "")) : "—";
  var receivedAt = data.submittedAt || new Date().toISOString();

  var body = [
    "LINCOLN LUXURY — Nouvelle demande de réservation",
    "",
    "INFORMATIONS CLIENT",
    "Nom : " + (data.name || "—"),
    "Courriel : " + (data.email || "—"),
    "Téléphone : " + (data.phone || "—"),
    "",
    "DÉTAILS DE LA PRESTATION",
    "Prestation : " + (data.service || "—"),
    "Date de début : " + (dateStartFr || "—"),
    "Date de fin : " + (dateEndFr || "—"),
    "Nombre de jours : " + nbJoursTxt,
    "Nombre de passagers : " + (data.pax || "—"),
    "",
    "MESSAGE DU CLIENT",
    data.message || "—",
    "",
    "— — —",
    "Langue de la page : " + (data.lang || "—"),
    "Page : " + (data.page || "—"),
    "Reçu le : " + receivedAt,
    "",
    "Répondez directement à cet e-mail pour contacter le client."
  ].join("\n");

  var row = function (label, value, isLink) {
    var v = escapeHtml_(value || "—");
    if (isLink && value) { v = "<a href=\"" + isLink + escapeHtml_(value) + "\" style=\"color:#1c1c1c;text-decoration:none;\">" + v + "</a>"; }
    return "<tr>" +
      "<td style=\"padding:7px 0;font-size:13px;color:#8a8a86;width:170px;vertical-align:top;\">" + label + "</td>" +
      "<td style=\"padding:7px 0;font-size:14px;color:#1c1c1c;vertical-align:top;\">" + v + "</td>" +
      "</tr>";
  };

  var htmlBody =
    "<div style=\"background:#f5f4f1;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;\">" +
      "<table role=\"presentation\" width=\"100%\" style=\"max-width:560px;margin:0 auto;background:#ffffff;border-collapse:collapse;\">" +
        "<tr><td style=\"background:#1c1c1c;padding:22px 28px;\">" +
          "<div style=\"color:#c9a227;font-size:18px;font-weight:bold;letter-spacing:.06em;\">LINCOLN LUXURY</div>" +
          "<div style=\"color:#ffffff;font-size:13px;margin-top:2px;\">Nouvelle demande de réservation</div>" +
        "</td></tr>" +
        "<tr><td style=\"padding:26px 28px 6px;\">" +
          "<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;margin-bottom:22px;\">" +
            row("Nom", data.name) +
            row("Courriel", data.email, "mailto:") +
            row("Téléphone", data.phone, "tel:") +
          "</table>" +
        "</td></tr>" +
        "<tr><td style=\"padding:0 28px 22px;\">" +
          "<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;border:1px solid #ece9e2;\">" +
            "<tr><td style=\"padding:9px 16px;background:#1c1c1c;color:#c9a227;font-size:11px;letter-spacing:.1em;text-transform:uppercase;\">Détails de la prestation</td></tr>" +
            "<tr><td style=\"padding:4px 16px 12px;background:#faf9f6;\">" +
              "<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;\">" +
                row("Prestation", data.service) +
                row("Date de début", dateStartFr) +
                row("Date de fin", dateEndFr) +
                row("Nombre de jours", nbJoursTxt) +
                row("Passagers", data.pax) +
              "</table>" +
            "</td></tr>" +
          "</table>" +
        "</td></tr>" +
        "<tr><td style=\"padding:0 28px 24px;\">" +
          "<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;border:1px solid #ece9e2;\">" +
            "<tr><td style=\"padding:9px 16px;background:#1c1c1c;color:#c9a227;font-size:11px;letter-spacing:.1em;text-transform:uppercase;\">Message du client</td></tr>" +
            "<tr><td style=\"padding:14px 16px;background:#faf9f6;font-size:14px;color:#1c1c1c;white-space:pre-wrap;\">" + escapeHtml_(data.message || "—") + "</td></tr>" +
          "</table>" +
        "</td></tr>" +
        "<tr><td style=\"padding:0 28px 24px;\">" +
          "<p style=\"margin:0 0 3px;font-size:12px;color:#9a9a95;\">Langue de la page : " + escapeHtml_(data.lang || "—") + " · Page : " + escapeHtml_(data.page || "—") + "</p>" +
          "<p style=\"margin:0;font-size:12px;color:#9a9a95;\">Reçu le " + escapeHtml_(receivedAt) + "</p>" +
        "</td></tr>" +
        "<tr><td style=\"padding:16px 28px;background:#faf9f6;border-top:1px solid #ece9e2;\">" +
          "<p style=\"margin:0;font-size:12px;color:#6b6b66;\">Répondez directement à cet e-mail pour contacter le client — son adresse est déjà en « répondre à ».</p>" +
        "</td></tr>" +
      "</table>" +
    "</div>";

  var mail = { to: NOTIFY_EMAIL, subject: subject, body: body, htmlBody: htmlBody };
  if (data.email) { mail.replyTo = data.email; }

  MailApp.sendEmail(mail);
}

/** Convertit une date ISO "YYYY-MM-DD" en "JJ/MM/AAAA" ; vide si absente. */
function formatDateFr_(iso) {
  if (!iso) { return ""; }
  var parts = String(iso).split("-");
  if (parts.length !== 3) { return String(iso); }
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

/**
 * Échappe les caractères HTML spéciaux d'un texte fourni par le client
 * (nom, message, etc.) avant de l'insérer dans l'e-mail HTML, pour éviter
 * qu'une demande malveillante n'injecte du balisage dans la notification.
 */
function escapeHtml_(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Fonction de test à lancer manuellement depuis l'éditeur Apps Script
 * (sélectionner "testerNotification" dans le menu déroulant à côté du
 * bouton Exécuter, puis cliquer sur Exécuter). Utile pour :
 * - déclencher la demande d'autorisation Gmail si elle n'a pas encore
 *   été validée (l'envoi via doPost, appelé automatiquement par le
 *   formulaire, ne peut pas afficher cette demande) ;
 * - vérifier que NOTIFY_EMAIL reçoit bien l'e-mail, indépendamment du
 *   reste du formulaire.
 * Sans effet sur la feuille Google Sheets : seul un e-mail de test est
 * envoyé.
 */
function testerNotification() {
  sendNotificationEmail({
    name: "Test manuel",
    email: "test@example.com",
    phone: "0600000000",
    service: "Test",
    dateStart: "2026-09-12",
    dateEnd: "2026-09-15",
    nbJours: 4,
    pax: "",
    message: "Ceci est un e-mail de test envoyé manuellement depuis l’éditeur Apps Script, à ignorer.",
    lang: "fr",
    page: "test",
    submittedAt: new Date().toISOString()
  });
}

/**
 * Crée (ou réinitialise) un onglet "Dashboard" avec des formules natives
 * Google Sheets (QUERY/COUNTIFS) qui résument les demandes de l'onglet
 * LEADS_SHEET_NAME : indicateurs clés, répartitions par prestation/langue/
 * page, évolution mensuelle et dernières demandes.
 *
 * Mise en page pensée pour une consultation sur mobile : tout est empilé
 * verticalement dans la seule colonne visible (A), sans aucune cellule
 * fusionnée — aucun scroll horizontal nécessaire dans l'appli Google
 * Sheets. Les colonnes B à N sont masquées ; elles ne servent que de zone
 * de calcul interne (résultats bruts des QUERY) utilisée pour composer le
 * texte affiché en colonne A (ex. "🔹 Aéroport — 4") et ne s'affichent
 * jamais.
 *
 * À lancer une seule fois manuellement depuis l'éditeur Apps Script
 * (sélectionner "setupDashboard" dans le menu déroulant à côté du bouton
 * Exécuter, puis cliquer sur Exécuter). Une fois généré, l'onglet ne
 * contient que des formules classiques : modifie-le librement dans
 * Google Sheets, relancer la fonction l'écrase et le régénère à l'identique.
 *
 * Si tu renommes l'onglet des demandes, mets à jour LEADS_SHEET_NAME en
 * haut de ce fichier avant de relancer setupDashboard. Chaque section a un
 * budget de lignes fixe (6 à 15 selon la section) : si elle affiche plus
 * de lignes que son budget (beaucoup plus de types de prestation, par
 * ex.), les dernières manquent simplement à l'affichage — augmente alors
 * le paramètre `budget` de l'appel `breakdownBlock_` correspondant, et
 * décale les sections suivantes d'autant.
 */
function setupDashboard() {
  try {
    setupDashboard_();
  } catch (err) {
    // Le message d'erreur générique remonté par l'éditeur Apps Script
    // ("An unknown error has occurred") ne dit pas où ça plante : on logue
    // ici le détail exact pour qu'il apparaisse dans le journal d'exécution.
    console.error("setupDashboard a échoué : " + err.message + "\n" + err.stack);
    throw err;
  }
}

function setupDashboard_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = "'" + LEADS_SHEET_NAME + "'";
  var name = "Dashboard";

  var sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear();
    sheet.clearFormats();
  } else {
    sheet = ss.insertSheet(name);
  }
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);

  var DARK = "#1c1c1c";
  var GOLD = "#c9a227";
  var BAND = "#f2f2f2";

  // Une seule colonne visible (A) : pas de cellules fusionnées (merge()
  // provoque parfois des erreurs aléatoires côté API Google Sheets), donc
  // aucun scroll horizontal possible, quel que soit l'écran. Les colonnes
  // B à N sont masquées : elles ne servent que de zone de calcul interne
  // (résultats bruts des QUERY), jamais affichées — chaque section lit sa
  // propre paire de colonnes cachées pour composer une ligne de texte en
  // colonne A (ex. "🔹 Aéroport — 4").
  sheet.setHiddenGridlines(true);
  sheet.setColumnWidth(1, 260);
  sheet.hideColumns(2, 13); // masque B à N

  // — En-tête —
  sheet.getRange("A1").setValue("🚘 Lincoln Luxury — Dashboard")
    .setBackground(DARK).setFontColor(GOLD)
    .setFontSize(14).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 36);

  sheet.getRange("A2").setFormula("=\"Mis à jour le \"&TEXT(NOW(),\"dd/MM/yyyy à HH:mm\")")
    .setFontStyle("italic").setFontColor("#666666")
    .setFontSize(9).setHorizontalAlignment("center");

  // — Indicateurs clés — (chaque ligne est directement un texte complet,
  // pas besoin d'une deuxième colonne).
  sectionHeader_(sheet, 4, "📊 Indicateurs clés", BAND);
  var kpiFormulas = [
    "=\"Total demandes : \"&COUNTA(" + src + "!B2:B)",
    "=\"Aujourd'hui : \"&COUNTIFS(" + src + "!A2:A,\">=\"&TODAY()," + src + "!A2:A,\"<\"&TODAY()+1)",
    "=\"Cette semaine : \"&COUNTIFS(" + src + "!A2:A,\">=\"&TODAY()-WEEKDAY(TODAY(),3)," + src + "!A2:A,\"<\"&TODAY()+1)",
    "=\"Ce mois-ci : \"&COUNTIFS(" + src + "!A2:A,\">=\"&EOMONTH(TODAY(),-1)+1," + src + "!A2:A,\"<=\"&TODAY())",
    "=\"Durée moyenne : \"&TEXT(IFERROR(AVERAGE(" + src + "!H2:H),0),\"0.#\")&\" j.\"",
    "=\"Moy. passagers : \"&TEXT(IFERROR(AVERAGE(" + src + "!I2:I),0),\"0.#\")"
  ];
  kpiFormulas.forEach(function (f, i) {
    sheet.getRange("A" + (5 + i)).setFormula(f);
  });

  // — Par prestation (jusqu'à 15 lignes, source cachée en colonnes C:D) —
  sectionHeader_(sheet, 12, "🚘 Par prestation", BAND);
  breakdownBlock_(sheet, "C",
    "=QUERY(" + src + "!A2:L,\"select E, count(A) where E is not null " +
    "group by E order by count(A) desc\",0)",
    13, 15, "🔹");

  // — Par langue (jusqu'à 6 lignes, source cachée en colonnes E:F) —
  sectionHeader_(sheet, 29, "🌐 Par langue", BAND);
  breakdownBlock_(sheet, "E",
    "=QUERY(" + src + "!A2:L,\"select K, count(A) where K is not null " +
    "group by K order by count(A) desc\",0)",
    30, 6, "🔹");

  // — Par page source (jusqu'à 10 lignes, source cachée en colonnes G:H) —
  sectionHeader_(sheet, 37, "📍 Par page source", BAND);
  breakdownBlock_(sheet, "G",
    "=QUERY(" + src + "!A2:L,\"select L, count(A) where L is not null " +
    "group by L order by count(A) desc\",0)",
    38, 10, "🔹");

  // — Évolution mensuelle, plafonnée à 12 mois (source cachée en I:J) —
  sectionHeader_(sheet, 49, "📈 Évolution (12 derniers mois)", BAND);
  breakdownBlock_(sheet, "I",
    "=QUERY({" + src + "!A2:A, TEXT(" + src + "!A2:A,\"mmm yyyy\")}," +
    "\"select Col2, count(Col1) where Col1 is not null group by Col2 " +
    "order by max(Col1) desc limit 12\",0)",
    50, 12, "📈");

  // — 10 dernières demandes, en cartes (source cachée en colonnes K:N) —
  sectionHeader_(sheet, 63, "🆕 10 dernières demandes", BAND);
  recentLeadsBlock_(sheet,
    "=QUERY(" + src + "!A2:L,\"select A, B, D, E order by A desc limit 10\",0)",
    64, 10);

  sheet.setFrozenRows(1);
}

/** Bandeau de titre de section, sur la seule colonne A (usage interne). */
function sectionHeader_(sheet, row, title, bg) {
  sheet.getRange("A" + row).setValue(title)
    .setBackground(bg)
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("middle");
  sheet.setRowHeight(row, 26);
}

/**
 * Pose une QUERY à 2 colonnes (label, nombre) dans une paire de colonnes
 * cachées à partir de helperCol, puis affiche en colonne A, à partir de
 * visibleStartRow, jusqu'à `budget` lignes de texte "emoji label — nombre"
 * (vide si la QUERY a renvoyé moins de lignes que le budget). Usage interne.
 */
function breakdownBlock_(sheet, helperCol, sourceFormula, visibleStartRow, budget, emoji) {
  var col2 = String.fromCharCode(helperCol.charCodeAt(0) + 1);
  sheet.getRange(helperCol + "1").setFormula(sourceFormula);
  for (var j = 1; j <= budget; j++) {
    var visibleRow = visibleStartRow + j - 1;
    var helperRow = j + 1; // +1 : la ligne 1 de la QUERY est son en-tête.
    sheet.getRange("A" + visibleRow).setFormula(
      "=IF(" + helperCol + helperRow + "=\"\",\"\",\"" + emoji + " \"&" +
      helperCol + helperRow + "&\" — \"&" + col2 + helperRow + ")"
    );
  }
}

/**
 * Pose une QUERY à 4 colonnes (date, nom, téléphone, prestation) dans les
 * colonnes cachées K:N, puis affiche en colonne A, à partir de
 * visibleStartRow, jusqu'à `budget` cartes sur 2 lignes chacune. Usage
 * interne, complément de breakdownBlock_ pour un format à 4 champs.
 */
function recentLeadsBlock_(sheet, sourceFormula, visibleStartRow, budget) {
  sheet.getRange("K1").setFormula(sourceFormula);
  for (var j = 1; j <= budget; j++) {
    var visibleRow = visibleStartRow + j - 1;
    var helperRow = j + 1;
    var cell = sheet.getRange("A" + visibleRow);
    cell.setFormula(
      "=IF(K" + helperRow + "=\"\",\"\",\"📅 \"&TEXT(K" + helperRow + ",\"dd/MM\")&\"   👤 \"&L" +
      helperRow + "&CHAR(10)&\"📞 \"&M" + helperRow + "&\"   🚘 \"&N" + helperRow + ")"
    );
    cell.setWrap(true).setFontSize(10);
    sheet.setRowHeight(visibleRow, 34);
  }
}
