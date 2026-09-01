/* =====================================================
   ROSE BAKESHOP INVENTORY
===================================================== */


/* =====================================================
   GOOGLE APPS SCRIPT URL
===================================================== */

const API_URL =
    'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let productsCache = [];

let lowStockFilter = false;


/* =====================================================
   SHORTCUT
===================================================== */

const $ = id =>
    document.getElementById(id);


/* =====================================================
   START
===================================================== */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        bindEvents();


        if (
            sessionStorage.getItem(
                'roseToken'
            )
        ) {

            showApp();

            showPage(
                'dashboardPage'
            );

        }

    }
);


/* =====================================================
   EVENTS
===================================================== */

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

                    'Please contact the system administrator to reset your password.',

                    true

                );

            }
        );


    /* ALL PAGE BUTTONS */

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

                lowStockFilter =
                    false;


                loadProducts(

                    $('searchProducts')
                        .value

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


/* =====================================================
   API
===================================================== */

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

            'Please add your Google Apps Script Web App URL to script.js.'

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

            'Unable to connect to the inventory server.'

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

            'The Apps Script server did not return valid JSON.'

        );

    }


    if (
        !result.ok
    ) {

        throw new Error(

            result.error ||
            'Request failed.'

        );

    }


    return result;

}


/* =====================================================
   LOGIN
===================================================== */

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


        $('password')
            .value =
            '';


        showApp();


        showPage(
            'dashboardPage'
        );


        await loadDashboard();


        showToast(
            'Login successful.'
        );

    }

    catch (error) {

        showToast(

            error.message,

            true

        );


        $('attempts')
            .textContent =
            error.message;

    }

}


/* =====================================================
   SHOW APP
===================================================== */

function showApp() {

    $('loginScreen')
        .classList
        .add('hidden');


    $('appScreen')
        .classList
        .remove('hidden');

}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    $('appScreen')
        .classList
        .add('hidden');


    $('loginScreen')
        .classList
        .remove('hidden');

}


/* =====================================================
   LOGOUT
===================================================== */

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

        /* Continue local logout */

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


/* =====================================================
   PAGE NAVIGATION
===================================================== */

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


    /* DASHBOARD */

    if (
        pageId ===
        'dashboardPage'
    ) {

        loadDashboard();

    }


    /* PRODUCTS */

    if (
        pageId ===
        'productsPage'
    ) {

        loadProducts();

    }


    /* STOCK */

    if (
        pageId ===
        'stockPage'
    ) {

        loadStockProducts();

    }


    /* SETTINGS */

    if (
        pageId ===
        'settingsPage'
    ) {

        loadSettings();

    }

}


/* =====================================================
   DASHBOARD
===================================================== */

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


/* =====================================================
   PRODUCTS
===================================================== */

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


/* =====================================================
   PRODUCT ICON
===================================================== */

function getProductImage(
    product
) {

    const name =
        String(
            product.productName || ''
        )
        .toLowerCase();


    const category =
        String(
            product.category || ''
        )
        .toLowerCase();


    if (
        name.includes(
            'cupcake'
        )
    ) {

        return '🧁';

    }


    if (
        name.includes(
            'ensaymada'
        )
    ) {

        return '🥐';

    }


    if (
        name.includes(
            'cake'
        )

        ||

        category ===
        'cake'
    ) {

        return '🍰';

    }


    if (
        category ===
        'bread'

        ||

        name.includes(
            'bread'
        )

        ||

        name.includes(
            'pandesal'
        )
    ) {

        return '🍞';

    }


    if (
        category ===
        'pastry'

        ||

        name.includes(
            'croissant'
        )

        ||

        name.includes(
            'danish'
        )

        ||

        name.includes(
            'pie'
        )
    ) {

        return '🥐';

    }


    if (
        category ===
        'cookie'

        ||

        name.includes(
            'cookie'
        )
    ) {

        return '🍪';

    }


    if (
        category ===
        'beverage'

        ||

        name.includes(
            'coffee'
        )

        ||

        name.includes(
            'juice'
        )

        ||

        name.includes(
            'drink'
        )
    ) {

        return '🥤';

    }


    if (
        category ===
        'ingredient'
    ) {

        return '🧈';

    }


    return '🍰';

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

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


                    const productImage =
                        getProductImage(
                            product
                        );


                    return `

                    <article
                        class="product-item"
                    >

                        <div
                            class="product-image"
                        >

                            <span
                                style="
                                    font-size: 30px;
                                "
                            >
                                ${productImage}
                            </span>

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


/* =====================================================
   ADD PRODUCT
===================================================== */

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


/* =====================================================
   LOAD STOCK PRODUCTS
===================================================== */

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


        result.products.forEach(
            product => {

                const option =
                    document.createElement(
                        'option'
                    );


                option.value =
                    product.id;


                option.textContent =

                    `${getProductImage(product)} ` +

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


/* =====================================================
   STOCK IN
===================================================== */

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
            result.message
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


/* =====================================================
   QUICK STOCK IN
===================================================== */

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


/* =====================================================
   EDIT PRODUCT
===================================================== */

async function editProduct(
    id
) {

    const product =
        productsCache.find(

            item =>
                String(item.id) ===
                String(id)

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


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function removeProduct(
    id
) {

    const product =
        productsCache.find(

            item =>
                String(item.id) ===
                String(id)

        );


    if (
        !product
    ) {

        return;

    }


    const confirmed =
        confirm(

            `Delete "${product.productName}"?\n\n` +

            'This action cannot be undone.'

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


/* =====================================================
   LOAD SETTINGS
===================================================== */

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

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}


/* =====================================================
   UPDATE SETTINGS
===================================================== */

async function updateSettings(
    event
) {

    event.preventDefault();


    const confirmed =
        confirm(

            'Are you sure you want to update these system settings?'

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

    }

    catch (error) {

        handleApiError(
            error
        );

    }

}


/* =====================================================
   API ERROR
===================================================== */

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


/* =====================================================
   TOAST
===================================================== */

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


/* =====================================================
   HTML SECURITY
===================================================== */

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
