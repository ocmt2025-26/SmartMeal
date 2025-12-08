// ======= Data & Storage =======
const MENU = [
    { id: 1, name: 'Chicken Burger🍔', price: 1.50, type: 'main' },
    { id: 2, name: 'Shawarma Sandwich🌯', price: 1.10, type: 'main' },
    { id: 3, name: 'Black Coffee☕', price: 1.00, type: 'drinks' },
    { id: 4, name: 'French Fries 🍟', price: 0.70, type: 'main' },
    { id: 5, name: 'Choco Cake Slice🍰', price: 1.20, type: 'dessert' },
    { id: 6, name: 'Cookies🍪', price: 1.00, type: 'dessert' },
    { id: 7, name: 'Karak Tea ☕', price: 0.10, type: 'drinks' },
    { id: 8, name: 'Pizza🍕', price: 2.80, type: 'main' },
    { id: 9, name: 'Orange Fresh Juice🥤', price: 1.10, type: 'drinks' },
    { id: 10, name: 'Mango Fresh Juice 🥤', price: 1.10, type: 'drinks' },
    { id: 11, name: 'Ice Cream 🍦', price: 0.30, type: 'dessert' }
];

const ADMIN_CREDENTIALS = { email: "admin@ocmt.edu.om", password: "admin123" };

function getCart() { return JSON.parse(localStorage.getItem('smartmeal_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('smartmeal_cart', JSON.stringify(c)); updateCartCount(); }
function getOrders() { return JSON.parse(localStorage.getItem('smartmeal_orders') || '[]'); }
function saveOrders(o) { localStorage.setItem('smartmeal_orders', JSON.stringify(o)); }
function getUser() { return JSON.parse(localStorage.getItem('smartmeal_user') || 'null'); }
function saveUser(u) { localStorage.setItem('smartmeal_user', JSON.stringify(u)); updateProfileLink(); }

// ===== Menu Functions =====
function renderMenuGrid(type = 'all') {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const items = MENU.filter(i => type==='all'?true:i.type===type);
    items.forEach(it => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${it.name}</h3>
            <div class="price">${it.price.toFixed(2)} OMR</div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <button class="btn primary" onclick="addToCart(${it.id})">Add to Cart</button>
                <button class="btn ghost" onclick="viewItem(${it.id})">View</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterType(type, el) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if(el) el.classList.add('active');
    renderMenuGrid(type);
}

function viewItem(id) {
    const it = MENU.find(m => m.id===id);
    if(!it) return;
    alert(it.name + '\nPrice: ' + it.price.toFixed(2) + ' OMR');
}

// ===== Cart Functions =====
function addToCart(id) {
    const it = MENU.find(m => m.id===id);
    if(!it) return;
    const cart = getCart();
    const existing = cart.find(c=>c.id===id);
    if(existing) existing.qty+=1;
    else cart.push({ ...it, qty:1 });
    saveCart(cart);
    toast(it.name + ' added to cart');
}

function updateCartCount(){
    const c = getCart();
    const el = document.getElementById('cartCount');
    if(el) el.innerText = c.reduce((s,i)=>s+i.qty,0);
}

function renderCartPage(){
    const container = document.getElementById('cartContainer');
    if(!container) return;
    const cart = getCart();
    container.innerHTML = '';
    if(cart.length===0) { container.innerHTML = '<p>Your cart is empty</p>'; return; }
    cart.forEach(i=>{
        const div = document.createElement('div');
        div.className='cart-item';
        div.innerHTML=`${i.name} x ${i.qty} = ${(i.price*i.qty).toFixed(2)} OMR
        <button class="btn ghost" onclick="removeFromCart(${i.id})">❌</button>`;
        container.appendChild(div);
    });
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('total').innerText = subtotal.toFixed(2);
}

function removeFromCart(id){
    const cart = getCart().filter(c=>c.id!==id);
    saveCart(cart);
    renderCartPage();
}

function clearCart(){ localStorage.removeItem('smartmeal_cart'); renderCartPage(); updateCartCount(); }

// ===== Orders =======
function confirmOrder(){
    const cart = getCart();
    if(cart.length===0){ alert('Your cart is empty'); return; }
    const user = getUser();
    if(!user){ alert('Please login first!'); return; }

    const deliveryTimeInput = document.getElementById('deliveryTime');
    const deliveryTime = deliveryTimeInput && deliveryTimeInput.value ? deliveryTimeInput.value : 'ASAP';

    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const total = subtotal.toFixed(2);

    const orders = getOrders();
    const order = {
        id: Date.now(),
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        items: cart,
        subtotal,
        delivery: 0,
        total,
        created: new Date().toISOString(),
        deliveryTime,
        status: 'Preparing'
    };

    orders.unshift(order);
    saveOrders(orders);
    localStorage.removeItem('smartmeal_cart');
    updateCartCount();
    renderCartPage();
    renderProfile();
    renderAdmin();
    toast('Order placed! It will be ready at '+deliveryTime+'.');
}

// ===== User ======
function doLogin(){
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    if(!email || !password){ alert('Email & Password required'); return; }
    saveUser({ name:name||'User', email, phone:phone||'', isAdmin:false });
    alert('Logged in as '+(name||'User'));
    location.href='index.html';
}

function logout(){ localStorage.removeItem('smartmeal_user'); updateProfileLink(); location.href='index.html'; }

function updateProfileLink(){
    const user = getUser();
    const el = document.getElementById('profileLink');
    if(el) el.innerText = user ? (user.isAdmin?'Admin':'Account') : 'Login';
}

// ===== Profile =====
function renderProfile(){
    const user = getUser();
    const box = document.getElementById('profileBox');
    if(!box) return;
    box.innerHTML = user ? `<p>Name: ${user.name}<br>Email: ${user.email}<br>Phone: ${user.phone}</p>` : '<p>Please login</p>';

    const history = document.getElementById('orderHistory');
    if(history){
        const orders = getOrders().filter(o=>o.userEmail===user?.email);
        if(orders.length===0){ history.innerHTML='<p>No orders yet</p>'; return; }
        history.innerHTML='';
        orders.forEach(o=>{
            const div = document.createElement('div');
            div.className='order-item';
            div.innerHTML=`<b>Order#${o.id}</b> | ${o.status} | ${o.deliveryTime}<br>
                ${o.items.map(i=>i.name+' x '+i.qty).join('<br>')}<br>
                Total: ${o.total} OMR`;
            history.appendChild(div);
        });
    }
}

// ===== Admin =====
function renderAdmin(){
    const list = document.getElementById('ordersList');
    if(!list) return;
    const orders = getOrders();
    list.innerHTML = '';
    orders.forEach(o=>{
        const div = document.createElement('div');
        div.className='order-item';
        div.innerHTML=`<b>Order#${o.id}</b> | ${o.userName} | ${o.userEmail} | ${o.status} | ${o.deliveryTime}<br>
            ${o.items.map(i=>i.name+' x '+i.qty).join('<br>')}<br>Total: ${o.total} OMR`;
        list.appendChild(div);
    });
}

// ===== Toast =====
function toast(msg){ alert(msg); }

// ===== Init =====
updateCartCount();
renderMenuGrid();
renderProfile();
