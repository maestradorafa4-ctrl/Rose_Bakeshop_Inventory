const API_URL =
  "https://script.google.com/macros/s/AKfycbwYd1CuFTGe_aRx9n84UQb6DndcSj15U1y8ojPXjuUz6f2XA-zOk-ryaDa0trTFxEaQnQ/exec";


let products = [];


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  try {

    const response =
      await fetch(
        API_URL +
        "?action=products"
      );


    if (!response.ok) {

      throw new Error(
        "Server returned an error."
      );

    }


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message
      );

    }


    products =
      data.products || [];


    displayProducts(
      products
    );


    loadDashboard();

  }

  catch (error) {

    console.error(
      "Load error:",
      error
    );


    document.getElementById(
      "tableContainer"
    ).innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          ⚠️
        </div>

        <h3>
          Unable to load inventory
        </h3>

        <p>
          Please check your Google Apps Script deployment.
        </p>

      </div>

    `;

  }

}


/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts(data) {

  const container =
    document.getElementById(
      "tableContainer"
    );


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          🧁
        </div>

        <h3>
          No Products Found
        </h3>

        <p>
          Add your first bakery product.
        </p>

      </div>

    `;

    return;

  }


  let html = `

    <table>

      <thead>

        <tr>

          <th>PRODUCT</th>
          <th>CATEGORY</th>
          <th>QUANTITY</th>
          <th>PRICE</th>
          <th>STATUS</th>
          <th>DATE ADDED</th>
          <th>ACTIONS</th>

        </tr>

      </thead>

      <tbody>

  `;


  data.forEach(
    function(product) {


      let statusClass =
        "available";


      if (
        product.status ===
        "Low Stock"
      ) {

        statusClass =
          "low";

      }


      if (
        product.status ===
        "Out of Stock"
      ) {

        statusClass =
          "out";

      }


      html += `

        <tr>

          <td>

            <div class="product-name">

              ${escapeHTML(
                product.name
              )}

            </div>

            <div class="product-id">

              ${escapeHTML(
                product.id
              )}

            </div>

          </td>


          <td>
            ${escapeHTML(
              product.category
            )}
          </td>


          <td>
            ${product.quantity}
          </td>


          <td class="price">

            ₱${Number(
              product.price
            ).toFixed(2)}

          </td>


          <td>

            <span
              class="status ${statusClass}">

              ${escapeHTML(
                product.status
              )}

            </span>

          </td>


          <td>
            ${escapeHTML(
              product.date
            )}
          </td>


          <td>

            <button
              class="edit-btn"
              onclick="editProduct('${escapeJS(product.id)}')">

              Edit

            </button>


            <button
              class="delete-btn"
              onclick="deleteProduct('${escapeJS(product.id)}')">

              Delete

            </button>

          </td>

        </tr>

      `;

    }
  );


  html += `

      </tbody>

    </table>

  `;


  container.innerHTML =
    html;

}


/* =========================================
   DASHBOARD
========================================= */

async function loadDashboard() {

  try {

    const response =
      await fetch(
        API_URL +
        "?action=dashboard"
      );


    const data =
      await response.json();


    if (!data.success) {

      throw new Error(
        data.message
      );

    }


    const dashboard =
      data.dashboard;


    document.getElementById(
      "totalProducts"
    ).textContent =
      dashboard.totalProducts;


    document.getElementById(
      "totalItems"
    ).textContent =
      dashboard.totalItems;


    document.getElementById(
      "lowStock"
    ).textContent =
      dashboard.lowStock;


    document.getElementById(
      "outOfStock"
    ).textContent =
      dashboard.outOfStock;

  }

  catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


/* =========================================
   SEARCH
========================================= */

document.getElementById(
  "searchInput"
).addEventListener(
  "input",
  function() {


    const search =
      this.value
        .toLowerCase()
        .trim();


    if (!search) {

      displayProducts(
        products
      );

      return;

    }


    const filtered =
      products.filter(
        function(product) {

          return (

            product.name
              .toLowerCase()
              .includes(search)

            ||

            product.category
              .toLowerCase()
              .includes(search)

            ||

            product.status
              .toLowerCase()
              .includes(search)

            ||

            product.id
              .toLowerCase()
              .includes(search)

          );

        }
      );


    displayProducts(
      filtered
    );

  }
);


/* =========================================
   OPEN ADD MODAL
========================================= */

function openAddModal() {

  document.getElementById(
    "modalTitle"
  ).textContent =
    "Add Product";


  document.getElementById(
    "productId"
  ).value =
    "";


  document.getElementById(
    "productName"
  ).value =
    "";


  document.getElementById(
    "category"
  ).value =
    "";


  document.getElementById(
    "quantity"
  ).value =
    "";


  document.getElementById(
    "price"
  ).value =
    "";


  document.getElementById(
    "productModal"
  ).style.display =
    "block";

}


/* =========================================
   EDIT PRODUCT
========================================= */

function editProduct(id) {

  const product =
    products.find(
      function(item) {

        return String(
          item.id
        ) === String(id);

      }
    );


  if (!product) {

    alert(
      "Product not found."
    );

    return;

  }


  document.getElementById(
    "modalTitle"
  ).textContent =
    "Edit Product";


  document.getElementById(
    "productId"
  ).value =
    product.id;


  document.getElementById(
    "productName"
  ).value =
    product.name;


  document.getElementById(
    "category"
  ).value =
    product.category;


  document.getElementById(
    "quantity"
  ).value =
    product.quantity;


  document.getElementById(
    "price"
  ).value =
    product.price;


  document.getElementById(
    "productModal"
  ).style.display =
    "block";

}


/* =========================================
   SAVE PRODUCT
========================================= */

async function saveProduct() {

  const id =
    document.getElementById(
      "productId"
    ).value;


  const name =
    document.getElementById(
      "productName"
    ).value.trim();


  const category =
    document.getElementById(
      "category"
    ).value;


  const quantity =
    document.getElementById(
      "quantity"
    ).value;


  const price =
    document.getElementById(
      "price"
    ).value;


  if (!name) {

    alert(
      "Please enter a product name."
    );

    return;

  }


  if (!category) {

    alert(
      "Please select a category."
    );

    return;

  }


  if (
    quantity === "" ||
    Number(quantity) < 0
  ) {

    alert(
      "Please enter a valid quantity."
    );

    return;

  }


  if (
    price === "" ||
    Number(price) < 0
  ) {

    alert(
      "Please enter a valid price."
    );

    return;

  }


  const product = {

    id:
      id,

    name:
      name,

    category:
      category,

    quantity:
      Number(quantity),

    price:
      Number(price)

  };


  try {

    const action =
      id
        ? "update"
        : "add";


    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              action:
                action,

              product:
                product

            })

        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    showToast(
      result.message
    );


    closeModal();


    await loadProducts();

  }

  catch (error) {

    console.error(
      "Save error:",
      error
    );


    alert(
      error.message ||
      "Unable to save product."
    );

  }

}


/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(id) {

  const product =
    products.find(
      function(item) {

        return String(
          item.id
        ) === String(id);

      }
    );


  if (!product) {

    return;

  }


  const confirmed =
    confirm(
      "Are you sure you want to delete " +
      product.name +
      "?"
    );


  if (!confirmed) {

    return;

  }


  try {

    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify({

              action:
                "delete",

              id:
                id

            })

        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    showToast(
      result.message
    );


    await loadProducts();

  }

  catch (error) {

    console.error(
      "Delete error:",
      error
    );


    alert(
      error.message ||
      "Unable to delete product."
    );

  }

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

  document.getElementById(
    "productModal"
  ).style.display =
    "none";

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  setTimeout(
    function() {

      toast.classList.remove(
        "show"
      );

    },
    3000
  );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value == null
      ? ""
      : value;


  return div.innerHTML;

}


/* =========================================
   ESCAPE JAVASCRIPT
========================================= */

function escapeJS(value) {

  return String(value)

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    );

}


/* =========================================
   CLOSE MODAL OUTSIDE
========================================= */

window.onclick =
  function(event) {

    const modal =
      document.getElementById(
        "productModal"
      );


    if (
      event.target === modal
    ) {

      closeModal();

    }

  };


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
  "keydown",
  function(event) {

    if (
      event.key === "Escape"
    ) {

      closeModal();

    }

  }
);


/* =========================================
   START
========================================= */

window.addEventListener(
  "load",
  function() {

    loadProducts();

  }
);
