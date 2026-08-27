const SHEET_ID = "1-Fgf491BlXL_EQKguT3zwB9haNCnKxveD7ti6phHuYM";
const SHEET_NAME = "Sheet1";
const LOW_STOCK_LIMIT = 5;


/* ================================
   OPEN WEB APP
================================ */

function doGet() {

  return HtmlService
    .createHtmlOutputFromFile("Index")
    .setTitle("Rose Bakeshop Inventory")
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );

}


/* ================================
   GET GOOGLE SHEET
================================ */

function getSheet() {

  const spreadsheet =
    SpreadsheetApp.openById(SHEET_ID);

  let sheet =
    spreadsheet.getSheetByName(SHEET_NAME);


  if (!sheet) {

    sheet =
      spreadsheet.insertSheet(SHEET_NAME);

    sheet.getRange(
      1,
      1,
      1,
      7
    ).setValues([[
      "ID",
      "Product Name",
      "Category",
      "Quantity",
      "Price",
      "Stock Status",
      "Date Added"
    ]]);


    sheet
      .getRange(1, 1, 1, 7)
      .setFontWeight("bold");


    sheet.setFrozenRows(1);

  }


  return sheet;

}


/* ================================
   INITIALIZE SYSTEM
================================ */

function initializeSystem() {

  getSheet();

  return {
    success: true
  };

}


/* ================================
   GET PRODUCTS
================================ */

function getProducts() {

  const sheet =
    getSheet();


  const lastRow =
    sheet.getLastRow();


  if (lastRow <= 1) {

    return [];

  }


  const data =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        7
      )
      .getValues();


  return data.map(function(row) {

    return {

      id:
        String(row[0]),

      name:
        String(row[1]),

      category:
        String(row[2]),

      quantity:
        Number(row[3]) || 0,

      price:
        Number(row[4]) || 0,

      status:
        String(row[5]),

      date:
        row[6]
          ? Utilities.formatDate(
              new Date(row[6]),
              Session.getScriptTimeZone(),
              "MMM dd, yyyy"
            )
          : ""

    };

  });

}


/* ================================
   ADD PRODUCT
================================ */

function addProduct(product) {

  const sheet =
    getSheet();


  if (!product) {

    throw new Error(
      "Product information is missing."
    );

  }


  const name =
    String(
      product.name || ""
    ).trim();


  const category =
    String(
      product.category || ""
    ).trim();


  const quantity =
    Number(product.quantity);


  const price =
    Number(product.price);


  if (!name) {

    throw new Error(
      "Product name is required."
    );

  }


  if (!category) {

    throw new Error(
      "Category is required."
    );

  }


  if (
    isNaN(quantity) ||
    quantity < 0
  ) {

    throw new Error(
      "Invalid quantity."
    );

  }


  if (
    isNaN(price) ||
    price < 0
  ) {

    throw new Error(
      "Invalid price."
    );

  }


  const id =
    generateProductID();


  const status =
    getStockStatus(quantity);


  sheet.appendRow([

    id,

    name,

    category,

    quantity,

    price,

    status,

    new Date()

  ]);


  return {

    success: true,

    message:
      "Product added successfully."

  };

}


/* ================================
   UPDATE PRODUCT
================================ */

function updateProduct(product) {

  const sheet =
    getSheet();


  if (
    !product ||
    !product.id
  ) {

    throw new Error(
      "Product ID is required."
    );

  }


  const name =
    String(
      product.name || ""
    ).trim();


  const category =
    String(
      product.category || ""
    ).trim();


  const quantity =
    Number(product.quantity);


  const price =
    Number(product.price);


  if (!name) {

    throw new Error(
      "Product name is required."
    );

  }


  if (!category) {

    throw new Error(
      "Category is required."
    );

  }


  if (
    isNaN(quantity) ||
    quantity < 0
  ) {

    throw new Error(
      "Invalid quantity."
    );

  }


  if (
    isNaN(price) ||
    price < 0
  ) {

    throw new Error(
      "Invalid price."
    );

  }


  const data =
    sheet.getDataRange()
      .getValues();


  for (
    let i = 1;
    i < data.length;
    i++
  ) {


    if (
      String(data[i][0]) ===
      String(product.id)
    ) {


      sheet
        .getRange(i + 1, 2)
        .setValue(name);


      sheet
        .getRange(i + 1, 3)
        .setValue(category);


      sheet
        .getRange(i + 1, 4)
        .setValue(quantity);


      sheet
        .getRange(i + 1, 5)
        .setValue(price);


      sheet
        .getRange(i + 1, 6)
        .setValue(
          getStockStatus(quantity)
        );


      return {

        success: true,

        message:
          "Product updated successfully."

      };

    }

  }


  throw new Error(
    "Product not found."
  );

}


/* ================================
   DELETE PRODUCT
================================ */

function deleteProduct(id) {

  const sheet =
    getSheet();


  if (!id) {

    throw new Error(
      "Product ID is required."
    );

  }


  const data =
    sheet.getDataRange()
      .getValues();


  for (
    let i = 1;
    i < data.length;
    i++
  ) {


    if (
      String(data[i][0]) ===
      String(id)
    ) {


      sheet.deleteRow(
        i + 1
      );


      return {

        success: true,

        message:
          "Product deleted successfully."

      };

    }

  }


  throw new Error(
    "Product not found."
  );

}


/* ================================
   GENERATE PRODUCT ID
================================ */

function generateProductID() {

  return (
    "RB-" +
    new Date().getTime()
  );

}


/* ================================
   STOCK STATUS
================================ */

function getStockStatus(quantity) {

  quantity =
    Number(quantity);


  if (quantity <= 0) {

    return "Out of Stock";

  }


  if (
    quantity <=
    LOW_STOCK_LIMIT
  ) {

    return "Low Stock";

  }


  return "Available";

}


/* ================================
   DASHBOARD DATA
================================ */

function getDashboardData() {

  const products =
    getProducts();


  let totalProducts =
    products.length;


  let totalItems =
    0;


  let lowStock =
    0;


  let outOfStock =
    0;


  let inventoryValue =
    0;


  products.forEach(
    function(product) {


      totalItems +=
        product.quantity;


      inventoryValue +=
        product.quantity *
        product.price;


      if (
        product.quantity <= 0
      ) {

        outOfStock++;

      }

      else if (
        product.quantity <=
        LOW_STOCK_LIMIT
      ) {

        lowStock++;

      }

    }
  );


  return {

    totalProducts:
      totalProducts,

    totalItems:
      totalItems,

    lowStock:
      lowStock,

    outOfStock:
      outOfStock,

    inventoryValue:
      inventoryValue

  };

}
