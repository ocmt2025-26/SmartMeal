import { db } from "./firebase-init.js";
import { ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const MENU = [
    { id: 1, name: "Chicken Burger🍔", price: 1.50, type: "main" },
    { id: 2, name: "Shawarma Sandwich🌯", price: 1.10, type: "main" },
    { id: 3, name: "Black Coffee☕", price: 1.00, type: "drinks" },
    { id: 4, name: "French Fries 🍟", price: 0.70, type: "main" },
    { id: 5, name: "Choco Cake Slice🍰", price: 1.20, type: "dessert" },
    { id: 6, name: "Cookies🍪", price: 1.00, type: "dessert" },
    { id: 7, name: "Karak Tea ☕", price: 0.10, type: "drinks" },
    { id: 8, name: "Pizza🍕", price: 2.80, type: "main" },
    { id: 9, name: "Orange Fresh Juice🥤", price: 1.10, type: "drinks" },
    { id: 10, name: "Mango Fresh Juice 🥤", price: 1.10, type: "drinks" },
    { id: 11, name: "Ice Cream 🍦", price: 0.30, type: "dessert" }
];

const ADMIN_CREDENTIALS = { email: "admin@ocmt.edu.om", password: "admin123" };

function getCart() { return JSON.parse(localStorage.getItem("cart") || "[]"); }
function saveCart(c) { localStorage.setItem("cart", JSON.stringify(c)); updateCartCount(); }
function getUser() { return JSON.parse(localStorage.getItem("user") || "null"); }
function saveUser(u) { localStorage.setItem("user", JSON.stringify(u)); updateProfileLink(); }

window.addToCart = id => {
    const item = MENU.find(i => i.id === id);
    const cart = getCart();
    const exist = cart.find(c => c.id === id);
    if (exist) exist.qty++;
    else cart.push({ ...item, qty: 1 });
    saveCart(cart);
    renderCartPage();
};

window.changeQty = (i, d) => {
    const cart = getCart();
    cart[i].qty += d;
    if (cart[i].qty < 1) cart.splice(i, 1);
    saveCart(cart);
    renderCartPage();
};

window.removeItem = i => {
    const cart = getCart();
    cart.splice(i, 1);
    saveCart(cart);
    renderCartPage();
};

window.doLogin = () => {
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const name = document.getElementById("name")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        saveUser({ name: "Admin", email, isAdmin: true });
        location.href = "admin.html";
        return;
    }

    saveUser({ name: name || "User", email, phone });
    location.href = "profile.html";
};

window.logout = () => {
    localStorage.removeItem("user");
    location.href = "login.html";
};

window.confirmOrder = () => {
    const cart = getCart();
    const user = getUser();
    if (!cart.length || !user) return;

    const order = {
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        items: cart,
        total: cart.reduce((a, b) => a + b.price * b.qty, 0),
        status: "Preparing",
        time: new Date().toISOString()
    };

    push(ref(db, "orders"), order);
    localStorage.removeItem("cart");
    updateCartCount();
    renderCartPage();
};

function loadAdminOrders() {
    const list = document.getElementById("ordersList");
    if (!list) return;

    onValue(ref(db, "orders"), snap => {
        list.innerHTML = "";
        snap.forEach(s => {
            const o = s.val();
            const id = s.key;
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <strong>${o.userName}</strong>
                <p>${o.userEmail}</p>
                <p>Total: ${o.total} OMR</p>
                <select onchange="updateStatus('${id}', this.value)">
                    <option ${o.status === "Preparing" ? "selected" : ""}>Preparing</option>
                    <option ${o.status === "Ready" ? "selected" : ""}>Ready</option>
                    <option ${o.status === "Completed" ? "selected" : ""}>Completed</option>
                </select>
                <button onclick="deleteOrder('${id}')">Delete</button>
            `;
            list.appendChild(div);
        });
    });
}

window.updateStatus = (id, status) => {
    update(ref(db, "orders/" + id), { status });
};

window.deleteOrder = id => {
    remove(ref(db, "orders/" + id));
};

function renderMenuGrid() {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;
    grid.innerHTML = "";
    MENU.forEach(m => {
        const c = document.createElement("div");
        c.className = "card";
        c.innerHTML = `<h3>${m.name}</h3><p>${m.price} OMR</p><button onclick="addToCart(${m.id})">Add</button>`;
        grid.appendChild(c);
    });
}

function renderCartPage() {
    const box = document.getElementById("cartContainer");
    if (!box) return;
    const cart = getCart();
    box.innerHTML = "";
    cart.forEach((i, idx) => {
        box.innerHTML += `
            <div class="cart-item">
                <p>${i.name} x ${i.qty}</p>
                <button onclick="changeQty(${idx},1)">+</button>
                <button onclick="changeQty(${idx},-1)">-</button>
                <button onclick="removeItem(${idx})">Remove</button>
            </div>
        `;
    });
}

function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (el) el.innerText = getCart().reduce((a, b) => a + b.qty, 0);
}

window.addEventListener("DOMContentLoaded", () => {
    renderMenuGrid();
    renderCartPage();
    updateCartCount();
    if (location.pathname.includes("admin.html")) loadAdminOrders();
});
