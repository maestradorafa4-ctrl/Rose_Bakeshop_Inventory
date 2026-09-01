/* =========================================================
   ROSE BAKESHOP INVENTORY
   GITHUB FRONTEND
========================================================= */


/*
   =========================================================
   IMPORTANT
   =========================================================

   Replace this with your deployed Google Apps Script
   Web App URL.

   Example:

   https://script.google.com/macros/s/XXXXXXXX/exec
*/

const API_URL =
    'https://script.google.com/macros/s/AKfycbywd1F_QCcaZhyASrM2ZneuElKchlWNShkAaTkdJWwrUp7zL82-Y77F1Z_uLd3d7iAJ/exec';



/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let productsCache = [];

let lowStockFilter = false;



/* =========================================================
   SHORTCUT
========================================================= */

const $ = id =>
    document.getElementById(id);



/* =========================================================
   PAGE START
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        bindEvents();


        /*
           Check whether a session exists.
        */

        if (
            sessionStorage.getItem(
                'roseToken'
            )
        ) {

            showApp();

            loadDashboard();

        }

    }
);



/* =========================================================
   EVENT HANDLERS
========================================================= */

function bindEvents() {


    /* LOGIN */

    $('loginForm')
        .addEventListener(
            'submit',
            login
        );


    /* LOGOUT */

    $('logoutBtn')
        .addEventListener(
            'click',
            logout
        );


    /* FORGOT PASSWORD */

    $('forgotBtn')
        .addEventListener(
            'click',
            () => {

                showToast(

                    'For security, password reset must be handled by the system administrator.',

                    true

                );

            }
        );


    /* NAVIGATION */

    document
        .querySelectorAll(
            '[data-page]'
        )
        .forEach(
            button => {

                button.addEventListener(
                    'click',
                    () => {

                        const page =
                            button.dataset.page;


                        lowStockFilter =
                            button.dataset.filter ===
                            'low';


                        showPage(
                            page
                        );

                    }
                );

            }
        );


    /* ADD PRODUCT */

    $('productForm')
        .addEventListener(
            'submit',
            addProduct
        );


    /* SETTINGS */

    $('settingsForm')
        .addEventListener(
            'submit',
            updateSettings
        );


    /* REFRESH */

    $('refreshProducts')
        .addEventListener(
            'click',
            () => {

                loadProducts();

            }
        );


    /* SEARCH */

    $('searchProducts')
        .addEventListener(
            'input',
            () => {

                lowStockFilter = false;

                loadProducts(
                    $('searchProducts').value
                );

            }
        );


    /* STOCK IN */

    $('stockInBtn')
        .addEventListener(
            'click',
            stockIn
        );

}



/* =========================================================
   API REQUEST
========================================================= */

async function api(
    action,
    data = {}
) {

    if (
        API_URL.includes(
            'PASTE_YOUR'
        )
    ) {

        throw new Error(

            'Please put your Google Apps Script Web App URL in script.js first.'

        );

    }


    const payload =
        new URLSearchParams();


    payload.set(
        'action',
        action
    );


    Object.entries(
        data
    ).forEach(
        ([key, value]) => {

            payload.set(

                key,

                value == null
                    ? ''
                    : String(value)

            );

        }
    );


    let response;


    try {

        response =
            await fetch(
                API_URL,
                {

                    method: 'POST',

                    body: payload

                }
            );

    }

    catch (error) {

        throw new Error(

            'Unable to connect to the inventory server. Check your Apps Script Web App URL and deployment settings.'

        );

    }


    const text =
        await response.text();


    let result;


    try {

        result =
            JSON.parse(
                text
            );

    }

    catch (error) {

        throw new Error(

            'The server did not return valid JSON. Make sure the Apps Script deployment is a Web App ending in /exec.'

        );

    }


    if (
        !result.ok
    ) {

        throw new Error(

            result.error ||
            'The request failed.'

        );

    }


    return result;

}



/* =========================================================
   LOGIN
========================================================= */

async function login(
    event
) {

    event.preventDefault();


    const username =
        $('username')
            .value
            .trim();


    const password =
        $('password')
            .value;


    if (
        !username ||
        !password
    ) {

        showToast(

            'Enter your username and password.',

            true

        );

        return;

    }


    try {

        const result =
            await api(

                'login',

                {

                    username:
                        username,

                    password:
                        password

                }

            );


        /*
           Store session.
        */

        sessionStorage.setItem(

            'roseToken',

            result.token

        );


        sessionStorage.setItem(

            'roseUser',

            JSON.stringify(
                result.user
            )

        );


        $('password').value =
            '';


        $('attempts')
            .textContent =
            'Login successful.';


        showToast(
            'Login successful.'
        );


        showApp();


        showPage(
            'dashboardPage'
        );


        await loadDashboard();

    }

    catch (error) {

        const message =
            error.message ||
            'Login failed.';


        showToast(
            message,
            true
        );


        $('attempts')
            .textContent =
            message;

    }

}



/* =========================================================
   SHOW APPLICATION
========================================================= */

function showApp() {

    $('loginScreen')
        .classList
        .add('hidden');


    $('appScreen')
        .classList
        .remove('hidden');

}



/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    $('appScreen')
        .classList
        .add('hidden');


    $('loginScreen')
        .classList
        .remove('hidden');

}



/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    const token =
        sessionStorage.getItem(
            'roseToken'
        );


    try {

        if (token) {

            await api(

                'logout',

                {

                    token:
                        token

                }

            );

        }

    }

    catch (error) {

        /*
           Local logout still happens.
        */

    }


    sessionStorage.clear();


    showLogin();


    $('attempts')
        .textContent =
        'Login Attempts Remaining: 5';


    showToast(
        'Logged out successfully.'
    );

}



/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(
    pageId
) {

    document
        .querySelectorAll(
            '.page'
        )
        .forEach(
            page => {

                page.classList.add(
                    'hidden'
                );

            }
        );


    const page =
        $(pageId);


    if (!page) {

        return;

    }


    page.classList.remove(
        'hidden'
    );


    /* LOAD DATA */

    if (
        pageId ===
        'dashboardPage'
    ) {

        loadDashboard();

    }


    if (
        pageId ===
        'productsPage'
    ) {

        loadProducts();

    }


    if (
        pageId ===
        'stockPage'
    ) {

        loadStockProducts();

    }


    if (
        pageId ===
        'settingsPage'
    ) {

        loadSettings();

    }

}



/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const result =
            await api(

                'dashboard',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        )

                }

            );


        $('totalProducts')
            .textContent =
            result.summary.totalProducts;


        $('totalStocks')
            .textContent =
            result.summary.totalStocks;


        $('lowItems')
            .textContent =
            result.summary.lowItems;


        $('outOfStock')
            .textContent =
            result.summary.outOfStock;

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts(
    search = ''
) {

    try {

        const result =
            await api(

                'products',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    search:
                        search

                }

            );


        productsCache =
            result.products;


        let products =
            productsCache;


        /*
           Low-stock button filter.
        */

        if (
            lowStockFilter
        ) {

            products =
                products.filter(

                    product =>
                        product.stockStatus ===
                        'Low Stock'

                );

        }


        renderProducts(
            products
        );

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
    products
) {

    const list =
        $('productList');


    if (
        !products.length
    ) {

        list.innerHTML = `

            <div class="form-card">

                No products found.

            </div>

        `;

        return;

    }


    list.innerHTML =

        products
            .map(
                product => {

                    let statusClass =
                        'in';


                    if (
                        product.stockStatus ===
                        'Low Stock'
                    ) {

                        statusClass =
                            'low';

                    }


                    if (
                        product.stockStatus ===
                        'Out of Stock'
                    ) {

                        statusClass =
                            'out';

                    }


                    return `

                    <article
                        class="product-item"
                    >

                        <div
                            class="product-image"
                        >
                            🍰
                        </div>


                        <div>

                            <div
                                class="product-name"
                            >
                                ${escapeHtml(
                                    product.productName
                                )}
                            </div>


                            <div
                                class="product-meta"
                            >

                                Category:
                                ${escapeHtml(
                                    product.category
                                )}

                                ·

                                Stock:
                                ${product.quantity}

                                ${escapeHtml(
                                    product.unit
                                )}

                            </div>


                            <span
                                class="status ${statusClass}"
                            >

                                ${escapeHtml(
                                    product.stockStatus
                                )}

                            </span>

                        </div>


                        <div
                            class="product-right"
                        >

                            <div
                                class="product-price"
                            >

                                ₱${Number(
                                    product.price
                                ).toFixed(2)}

                            </div>


                            <div
                                class="product-actions"
                            >

                                <button
                                    onclick="quickStockIn('${escapeHtml(product.id)}')"
                                >
                                    Stock In
                                </button>


                                <button
                                    onclick="editProduct('${escapeHtml(product.id)}')"
                                >
                                    Edit
                                </button>


                                <button
                                    onclick="removeProduct('${escapeHtml(product.id)}')"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    </article>

                    `;

                }
            )
            .join('');

}



/* =========================================================
   ADD PRODUCT
========================================================= */

async function addProduct(
    event
) {

    event.preventDefault();


    const productName =
        $('productName')
            .value
            .trim();


    const category =
        $('category')
            .value;


    const unit =
        $('unit')
            .value;


    const costPrice =
        $('costPrice')
            .value;


    const sellingPrice =
        $('sellingPrice')
            .value;


    const initialStock =
        $('initialStock')
            .value;


    const reorderLevel =
        $('reorderLevel')
            .value;


    if (
        !productName ||
        !category ||
        !unit
    ) {

        showToast(

            'Please complete all required fields.',

            true

        );

        return;

    }


    if (
        Number(costPrice) < 0 ||
        Number(sellingPrice) < 0 ||
        Number(initialStock) < 0 ||
        Number(reorderLevel) < 0
    ) {

        showToast(

            'Values cannot be negative.',

            true

        );

        return;

    }


    try {

        const result =
            await api(

                'addProduct',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    productName:
                        productName,

                    category:
                        category,

                    unit:
                        unit,

                    costPrice:
                        costPrice,

                    sellingPrice:
                        sellingPrice,

                    initialStock:
                        initialStock,

                    reorderLevel:
                        reorderLevel

                }

            );


        showToast(
            result.message
        );


        $('productForm')
            .reset();


        $('reorderLevel')
            .value =
            5;


        showPage(
            'productsPage'
        );

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   STOCK PRODUCTS
========================================================= */

async function loadStockProducts() {

    try {

        const result =
            await api(

                'products',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    search:
                        ''

                }

            );


        const select =
            $('stockProduct');


        select.innerHTML =
            '';


        if (
            !result.products.length
        ) {

            select.innerHTML = `

                <option value="">
                    No products available
                </option>

            `;

            return;

        }


        result.products.forEach(
            product => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    product.id;


                option.textContent =

                    `${product.productName} — ` +
                    `${product.quantity} ` +
                    `${product.unit}`;


                select.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   STOCK IN
========================================================= */

async function stockIn() {

    const id =
        $('stockProduct')
            .value;


    const amount =
        $('stockAmount')
            .value;


    if (
        !id
    ) {

        showToast(

            'Please select a product.',

            true

        );

        return;

    }


    if (
        Number(amount) <= 0
    ) {

        showToast(

            'Quantity must be greater than 0.',

            true

        );

        return;

    }


    try {

        const result =
            await api(

                'stockIn',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    id:
                        id,

                    amount:
                        amount

                }

            );


        showToast(

            result.message +
            ' New quantity: ' +
            result.quantity

        );


        $('stockAmount')
            .value =
            '';


        await loadStockProducts();


        await loadDashboard();

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   QUICK STOCK IN
========================================================= */

async function quickStockIn(
    id
) {

    const amount =
        prompt(
            'Enter quantity to add:'
        );


    if (
        amount === null
    ) {

        return;

    }


    if (
        Number(amount) <= 0
    ) {

        showToast(

            'Quantity must be greater than 0.',

            true

        );

        return;

    }


    try {

        const result =
            await api(

                'stockIn',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    id:
                        id,

                    amount:
                        amount

                }

            );


        showToast(
            result.message
        );


        await loadProducts(
            $('searchProducts').value
        );


        await loadDashboard();

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   EDIT PRODUCT
========================================================= */

async function editProduct(
    id
) {

    const product =
        productsCache.find(

            item =>
                item.id === id

        );


    if (
        !product
    ) {

        return;

    }


    const name =
        prompt(

            'Product Name:',

            product.productName

        );


    if (
        name === null
    ) {

        return;

    }


    const quantity =
        prompt(

            'Quantity:',

            product.quantity

        );


    if (
        quantity === null
    ) {

        return;

    }


    const price =
        prompt(

            'Selling Price:',

            product.price

        );


    if (
        price === null
    ) {

        return;

    }


    const reorder =
        prompt(

            'Reorder Level:',

            product.reorderLevel

        );


    if (
        reorder === null
    ) {

        return;

    }


    if (
        Number(quantity) < 0 ||
        Number(price) < 0 ||
        Number(reorder) < 0
    ) {

        showToast(

            'Values cannot be negative.',

            true

        );

        return;

    }


    try {

        const result =
            await api(

                'updateProduct',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    id:
                        product.id,

                    productName:
                        name,

                    category:
                        product.category,

                    unit:
                        product.unit,

                    costPrice:
                        product.costPrice || 0,

                    quantity:
                        quantity,

                    sellingPrice:
                        price,

                    reorderLevel:
                        reorder

                }

            );


        showToast(
            result.message
        );


        await loadProducts(
            $('searchProducts').value
        );


        await loadDashboard();

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   DELETE PRODUCT
========================================================= */

async function removeProduct(
    id
) {

    const product =
        productsCache.find(

            item =>
                item.id === id

        );


    if (
        !product
    ) {

        return;

    }


    const confirmed =
        confirm(

            `Delete "${product.productName}"?\n\n` +
            `This action cannot be undone.`

        );


    if (
        !confirmed
    ) {

        return;

    }


    try {

        const result =
            await api(

                'deleteProduct',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    id:
                        id

                }

            );


        showToast(
            result.message
        );


        await loadProducts(
            $('searchProducts').value
        );


        await loadDashboard();

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   SETTINGS
========================================================= */

async function loadSettings() {

    try {

        const result =
            await api(

                'settings',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        )

                }

            );


        $('settingsReorder')
            .value =
            result.settings.reorderLevel;


        $('settingsLow')
            .value =
            result.settings.lowStockThreshold;


        $('settingsUnit')
            .value =
            result.settings.defaultUnit;


        await loadAudit();

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   UPDATE SETTINGS
========================================================= */

async function updateSettings(
    event
) {

    event.preventDefault();


    const confirmed =
        confirm(

            'Are you sure you want to update these system settings?\n\n' +

            'The change will be recorded in the audit log.'

        );


    if (
        !confirmed
    ) {

        return;

    }


    const currentPassword =
        $('currentPassword')
            .value;


    if (
        !currentPassword
    ) {

        showToast(

            'Enter your current password.',

            true

        );

        return;

    }


    try {

        const result =
            await api(

                'updateSettings',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        ),

                    reorderLevel:
                        $('settingsReorder').value,

                    lowStockThreshold:
                        $('settingsLow').value,

                    defaultUnit:
                        $('settingsUnit').value,

                    currentPassword:
                        currentPassword

                }

            );


        $('currentPassword')
            .value =
            '';


        showToast(
            result.message
        );


        await loadAudit();

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   AUDIT LOG
========================================================= */

async function loadAudit() {

    try {

        const result =
            await api(

                'dashboard',

                {

                    token:
                        sessionStorage.getItem(
                            'roseToken'
                        )

                }

            );


        const logs =
            result.recentChanges || [];


        const auditList =
            $('auditList');


        if (
            !logs.length
        ) {

            auditList.innerHTML = `

                <div class="audit-row">

                    No recent changes.

                </div>

            `;

            return;

        }


        auditList.innerHTML =

            logs
                .map(
                    log => `

                    <div
                        class="audit-row"
                    >

                        <div
                            class="audit-action"
                        >
                            ${escapeHtml(
                                log.action
                            )}
                        </div>


                        <div>
                            ${escapeHtml(
                                log.username
                            )}

                            ·

                            ${escapeHtml(
                                log.date
                            )}
                        </div>


                        <div>
                            ${escapeHtml(
                                log.details
                            )}
                        </div>

                    </div>

                    `
                )
                .join('');

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}



/* =========================================================
   API ERROR HANDLER
========================================================= */

function handleApiError(
    error
) {

    const message =
        error.message ||
        'Request failed.';


    const lower =
        message.toLowerCase();


    if (

        lower.includes(
            'session expired'
        )

        ||

        lower.includes(
            'unauthorized'
        )

        ||

        lower.includes(
            'access denied'
        )

    ) {

        sessionStorage.clear();

        showLogin();

    }


    showToast(
        message,
        true
    );

}



/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    error = false
) {

    const toast =
        $('toast');


    toast.textContent =
        message;


    toast.className =
        'toast show';


    if (
        error
    ) {

        toast.classList.add(
            'error'
        );

    }


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(

            () => {

                toast.className =
                    'toast';

            },

            3500

        );

}



/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ''
    )

        .replaceAll(
            '&',
            '&amp;'
        )

        .replaceAll(
            '<',
            '&lt;'
        )

        .replaceAll(
            '>',
            '&gt;'
        )

        .replaceAll(
            '"',
            '&quot;'
        )

        .replaceAll(
            "'",
            '&#039;'
        );

}
