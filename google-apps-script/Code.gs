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
 * À lancer une seule fois manuellement depuis l'éditeur Apps Script
 * (sélectionner "setupDashboard" dans le menu déroulant à côté du bouton
 * Exécuter, puis cliquer sur Exécuter). Une fois généré, l'onglet ne
 * contient que des formules classiques : modifie-le librement dans
 * Google Sheets, relancer la fonction l'écrase et le régénère à l'identique.
 *
 * Si tu renommes l'onglet des demandes, mets à jour LEADS_SHEET_NAME en
 * haut de ce fichier avant de relancer setupDashboard.
 */
function setupDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var src = "'" + LEADS_SHEET_NAME + "'";
  var name = "Dashboard";

  var sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(name);
  }
  ss.setActiveSheet(sheet);
  ss.moveActiveSheet(1);

  sheet.getRange("A1").setValue("Dashboard — Lincoln Luxury")
    .setFontSize(16).setFontWeight("bold");
  sheet.getRange("A2").setValue("Dernière mise à jour :").setFontStyle("italic");
  sheet.getRange("B2").setFormula("=NOW()").setNumberFormat("dd/MM/yyyy HH:mm");

  // Indicateurs clés.
  sheet.getRange("A4").setValue("Indicateurs clés").setFontWeight("bold");
  var kpis = [
    ["Total demandes", "=COUNTA(" + src + "!B2:B)"],
    ["Demandes aujourd'hui",
      "=COUNTIFS(" + src + "!A2:A,\">=\"&TODAY()," + src + "!A2:A,\"<\"&TODAY()+1)"],
    ["Demandes cette semaine",
      "=COUNTIFS(" + src + "!A2:A,\">=\"&TODAY()-WEEKDAY(TODAY(),3)," + src + "!A2:A,\"<\"&TODAY()+1)"],
    ["Demandes ce mois-ci",
      "=COUNTIFS(" + src + "!A2:A,\">=\"&EOMONTH(TODAY(),-1)+1," + src + "!A2:A,\"<=\"&TODAY())"],
    ["Moyenne passagers", "=IFERROR(AVERAGE(" + src + "!G2:G),0)"]
  ];
  sheet.getRange(5, 1, kpis.length, 2).setValues(kpis);
  sheet.getRange(5, 1, kpis.length, 1).setFontWeight("bold");

  // Les 4 tableaux ci-dessous sont posés côte à côte (pas les uns sous les
  // autres) pour qu'ils puissent grandir en hauteur sans jamais se chevaucher.
  sheet.getRange("A12").setValue("Par prestation").setFontWeight("bold");
  sheet.getRange("A13").setFormula(
    "=QUERY(" + src + "!A2:J,\"select E, count(A) where E is not null " +
    "group by E order by count(A) desc label E 'Prestation', count(A) 'Nombre'\",0)");

  sheet.getRange("D12").setValue("Par langue").setFontWeight("bold");
  sheet.getRange("D13").setFormula(
    "=QUERY(" + src + "!A2:J,\"select I, count(A) where I is not null " +
    "group by I order by count(A) desc label I 'Langue', count(A) 'Nombre'\",0)");

  sheet.getRange("G12").setValue("Par page source").setFontWeight("bold");
  sheet.getRange("G13").setFormula(
    "=QUERY(" + src + "!A2:J,\"select J, count(A) where J is not null " +
    "group by J order by count(A) desc label J 'Page', count(A) 'Nombre'\",0)");

  sheet.getRange("J12").setValue("Évolution mensuelle").setFontWeight("bold");
  sheet.getRange("J13").setFormula(
    "=QUERY(" + src + "!A2:J,\"select year(A), month(A)+1, count(A) where A is not null " +
    "group by year(A), month(A)+1 order by year(A), month(A)+1 " +
    "label year(A) 'Année', month(A)+1 'Mois', count(A) 'Nombre'\",0)");

  sheet.getRange("N12").setValue("10 dernières demandes").setFontWeight("bold");
  sheet.getRange("N13").setFormula(
    "=QUERY(" + src + "!A2:J,\"select A, B, C, D, E, G order by A desc limit 10 " +
    "label A 'Date', B 'Nom', C 'Courriel', D 'Téléphone', E 'Prestation', G 'Passagers'\",0)");

  sheet.autoResizeColumns(1, 19);
}
