const SHEET_ID = "1-Fgf491BlXL_EQKguT3zwB9haNCnKxveD7ti6phHuYM";
const SHEET_NAME = "Products";

function doGet() {
  return HtmlService.createTemplateFromFile("Index")
    .evaluate()
    .setTitle("Rose Bakeshop Inventory")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    sheet.appendRow([
      "ID",
      "Product Name",
      "Category",
      "Quantity",
      "Price",
      "Stock Status",
      "Date Added"
    ]);
  }

  return sheet;
}
