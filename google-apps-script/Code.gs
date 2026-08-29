/**
 * Reçoit les soumissions du formulaire de contact du site Lincoln Luxury
 * (POST en JSON, envoyé par le `fetch()` des 4 pages index.html) et les
 * ajoute comme nouvelle ligne dans la feuille active du classeur auquel
 * ce script est lié.
 *
 * Installation : voir la section « Formulaire -> Google Sheets » du
 * README à la racine du dépôt.
 */
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

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
