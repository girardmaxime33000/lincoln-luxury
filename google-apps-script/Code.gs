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
var LEADS_SHEET_NAME = "reporting";

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var headers = [
    "Date", "Nom", "Courriel", "Téléphone", "Prestation",
    "Dates envisagées", "Passagers", "Message", "Langue", "Page"
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

  sheet.appendRow([
    data.submittedAt ? new Date(data.submittedAt) : new Date(),
    data.name || "",
    data.email || "",
    data.phone || "",
    data.service || "",
    data.dates || "",
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
 */
function sendNotificationEmail(data) {
  var subject = "Nouvelle demande — " + (data.name || "site Lincoln Luxury");

  var body = [
    "Nouvelle demande reçue depuis le site Lincoln Luxury.",
    "",
    "Nom : " + (data.name || "—"),
    "Courriel : " + (data.email || "—"),
    "Téléphone : " + (data.phone || "—"),
    "Prestation : " + (data.service || "—"),
    "Dates envisagées : " + (data.dates || "—"),
    "Nombre de passagers : " + (data.pax || "—"),
    "",
    "Message :",
    data.message || "—",
    "",
    "— — —",
    "Langue de la page : " + (data.lang || "—"),
    "Page : " + (data.page || "—"),
    "Reçu le : " + (data.submittedAt || new Date().toISOString())
  ].join("\n");

  var mail = { to: NOTIFY_EMAIL, subject: subject, body: body };
  if (data.email) { mail.replyTo = data.email; }

  MailApp.sendEmail(mail);
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
    dates: "",
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
 * verticalement dans les deux seules colonnes visibles (A et B) — aucun
 * scroll horizontal nécessaire dans l'appli Google Sheets. Les colonnes
 * C à L sont masquées ; elles ne servent que de zone technique pour la
 * carte "dernières demandes" (voir plus bas) et ne s'affichent jamais.
 *
 * À lancer une seule fois manuellement depuis l'éditeur Apps Script
 * (sélectionner "setupDashboard" dans le menu déroulant à côté du bouton
 * Exécuter, puis cliquer sur Exécuter). Une fois généré, l'onglet ne
 * contient que des formules classiques : modifie-le librement dans
 * Google Sheets, relancer la fonction l'écrase et le régénère à l'identique.
 *
 * Si tu renommes l'onglet des demandes, mets à jour LEADS_SHEET_NAME en
 * haut de ce fichier avant de relancer setupDashboard. Les sections sont
 * espacées par des marges fixes généreuses (10 à 15 lignes) : si un jour
 * une section affiche plus de lignes que sa marge (beaucoup plus de types
 * de prestation, par ex.), une erreur "résultat du tableau non développé"
 * apparaît sur la formule concernée — il suffit alors d'espacer davantage
 * les numéros de ligne ci-dessous.
 */
function setupDashboard() {
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

  // Largeurs pensées pour un écran de téléphone en portrait ; C:L masquées.
  sheet.setHiddenGridlines(true);
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 110);
  sheet.hideColumns(3, 10); // masque C à L

  // — En-tête —
  sheet.getRange("A1:B1").merge()
    .setValue("🚘 Lincoln Luxury — Dashboard")
    .setBackground(DARK).setFontColor(GOLD)
    .setFontSize(14).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 36);

  sheet.getRange("A2:B2").merge()
    .setFormula("=\"Mis à jour le \"&TEXT(NOW(),\"dd/MM/yyyy à HH:mm\")")
    .setFontStyle("italic").setFontColor("#666666")
    .setFontSize(9).setHorizontalAlignment("center");

  // — Indicateurs clés —
  sectionHeader_(sheet, 4, "📊 Indicateurs clés", BAND);
  var kpis = [
    ["Total demandes", "=COUNTA(" + src + "!B2:B)"],
    ["Aujourd'hui",
      "=COUNTIFS(" + src + "!A2:A,\">=\"&TODAY()," + src + "!A2:A,\"<\"&TODAY()+1)"],
    ["Cette semaine",
      "=COUNTIFS(" + src + "!A2:A,\">=\"&TODAY()-WEEKDAY(TODAY(),3)," + src + "!A2:A,\"<\"&TODAY()+1)"],
    ["Ce mois-ci",
      "=COUNTIFS(" + src + "!A2:A,\">=\"&EOMONTH(TODAY(),-1)+1," + src + "!A2:A,\"<=\"&TODAY())"],
    ["Moy. passagers", "=IFERROR(AVERAGE(" + src + "!G2:G),0)"]
  ];
  kpis.forEach(function (kpi, i) {
    var r = 5 + i;
    sheet.getRange(r, 1).setValue(kpi[0]).setFontWeight("bold");
    sheet.getRange(r, 2).setFormula(kpi[1])
      .setHorizontalAlignment("right").setNumberFormat("0.#");
  });

  // — Par prestation (marge : lignes 12 à 27) —
  sectionHeader_(sheet, 11, "🚘 Par prestation", BAND);
  sheet.getRange("A12").setFormula(
    "=QUERY(" + src + "!A2:J,\"select E, count(A) where E is not null " +
    "group by E order by count(A) desc label E 'Prestation', count(A) 'Nb'\",0)");

  // — Par langue (marge : lignes 29 à 39) —
  sectionHeader_(sheet, 28, "🌐 Par langue", BAND);
  sheet.getRange("A29").setFormula(
    "=QUERY(" + src + "!A2:J,\"select I, count(A) where I is not null " +
    "group by I order by count(A) desc label I 'Langue', count(A) 'Nb'\",0)");

  // — Par page source (marge : lignes 41 à 56) —
  sectionHeader_(sheet, 40, "📍 Par page source", BAND);
  sheet.getRange("A41").setFormula(
    "=QUERY(" + src + "!A2:J,\"select J, count(A) where J is not null " +
    "group by J order by count(A) desc label J 'Page', count(A) 'Nb'\",0)");

  // — Évolution mensuelle, plafonnée à 12 mois pour tenir dans sa marge —
  sectionHeader_(sheet, 57, "📈 Évolution (12 derniers mois)", BAND);
  sheet.getRange("A58").setFormula(
    "=QUERY({" + src + "!A2:A, TEXT(" + src + "!A2:A,\"mmm yyyy\")}," +
    "\"select Col2, count(Col1) where Col1 is not null group by Col2 " +
    "order by max(Col1) desc limit 12 label Col2 'Mois', count(Col1) 'Nb'\",0)");

  // — 10 dernières demandes, en cartes verticales (pas un tableau large) —
  sectionHeader_(sheet, 73, "🆕 10 dernières demandes", BAND);
  // Zone technique masquée (colonnes H:K) : source des cartes ci-dessous,
  // ne s'affiche jamais à l'écran (colonnes masquées plus haut).
  sheet.getRange("H74").setFormula(
    "=QUERY(" + src + "!A2:J,\"select A, B, D, E order by A desc limit 10\",0)");

  for (var i = 0; i < 10; i++) {
    var row = 75 + i;
    var card = sheet.getRange(row, 1, 1, 2).merge();
    card.setFormula(
      "=IF(H" + row + "=\"\",\"\",\"📅 \"&TEXT(H" + row + ",\"dd/MM\")&\"   👤 \"&I" + row +
      "&CHAR(10)&\"📞 \"&J" + row + "&\"   🚘 \"&K" + row + ")"
    );
    card.setWrap(true).setVerticalAlignment("middle").setFontSize(10);
    sheet.setRowHeight(row, 34);
  }

  sheet.setFrozenRows(1);
}

/** Bandeau de titre de section, sur 2 colonnes fusionnées (usage interne). */
function sectionHeader_(sheet, row, title, bg) {
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue(title)
    .setBackground(bg)
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("middle")
    .setBorder(false, false, true, false, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(row, 26);
}
