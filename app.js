// ======= Data & Storage Helpers =======
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

// ======= Menu =======
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

// ======= Cart =======
function addToCart(id) {
    const it = MENU.find(m => m.id===id);
    if(!it) return;
    const cart = getCart();
    const existing = cart.find(c=>c.id===id);
    if(existing) existing.qty +=1;
    else cart.push({ id: it.id, name: it.name, price: it.price, qty: 1 });
    saveCart(cart);
    toast(it.name+' added to cart');
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s,i)=>s+i.qty,0);
    const el = document.getElementById('cartCount');
    if(el) el.innerText = count;
}

function renderCartPage() {
    const container = document.getElementById('cartContainer');
    if(!container) return;
    const cart = getCart();
    container.innerHTML = '';
    if(cart.length===0) container.innerHTML='<p>Your cart is empty.</p>';
    cart.forEach((item,idx)=>{
        const div = document.createElement('div');
        div.className='cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                ${item.price.toFixed(2)} OMR
            </div>
            <div class="qty">
                <button onclick="changeQty(${idx}, -1)">-</button>
                <div>${item.qty}</div>
                <button onclick="changeQty(${idx}, 1)">+</button>
                <button style="margin-left:10px" onclick="removeItem(${idx})">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
    calculateTotals();
}

function changeQty(index, delta){
    const cart = getCart();
    if(!cart[index]) return;
    cart[index].qty += delta;
    if(cart[index].qty<1) cart.splice(index,1);
    saveCart(cart);
    renderCartPage();
}

function removeItem(index){
    const cart = getCart();
    if(!cart[index]) return;
    cart.splice(index,1);
    saveCart(cart);
    renderCartPage();
}

function calculateTotals(){
    const cart = getCart();
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const delivery = 0;
    const total = subtotal;
    const elSub = document.getElementById('subtotal');
    const elDel = document.getElementById('delivery');
    const elTot = document.getElementById('total');
    if(elSub) elSub.innerText=subtotal.toFixed(2);
    if(elDel) elDel.innerText=delivery.toFixed(2);
    if(elTot) elTot.innerText=total.toFixed(2);
}

// ======= Checkout & Orders =======
function confirmOrder(){
    const cart = getCart();
    if(cart.length===0){ alert('Your cart is empty'); return; }
    const user = getUser();
    if(!user){ alert('Please login first!'); return; }

    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    const delivery = 0;
    const total = subtotal.toFixed(2);

    const pickupTime = document.getElementById('pickupTime')?.value || '';

    const orders = getOrders();
    const order = {
        id: Date.now(),
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        items: cart,
        subtotal,
        delivery,
        total,
        created: new Date().toISOString(),
        status: 'Preparing',
        pickupTime
    };

    orders.unshift(order);
    saveOrders(orders);
    localStorage.removeItem('smartmeal_cart');
    updateCartCount();
    renderCartPage();
    renderProfile();
    toast('Order placed! It will be ready in ~10 minutes.');
}

// ======= Login / Profile =======
function doLogin(){
    const name = document.getElementById('name')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const pass = document.getElementById('password')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();

    if(!email||!pass||(!name&&email!==ADMIN_CREDENTIALS.email)||(!phone&&email!==ADMIN_CREDENTIALS.email)){
        alert('Please fill all fields!'); return;
    }

    if(email===ADMIN_CREDENTIALS.email && pass===ADMIN_CREDENTIALS.password){
        saveUser({ email: email, name: "Admin", phone:"", isAdmin:true });
        toast('Logged in as Admin');
        location.href='admin.html'; return;
    }

    const user={name,email,phone,password:pass,isAdmin:false};
    saveUser(user);
    toast('Logged in as '+email);
    location.href='menu.html';
}

function logout(){
    localStorage.removeItem('smartmeal_user');
    updateProfileLink();
    toast('Logged out');
    location.href='login.html';
}

function updateProfileLink(){
    const user = getUser();
    const link = document.getElementById('profileLink');
    if(link) link.innerText = user?user.email.split('@')[0]:'Login';
}

// ======= Profile & Orders =======
function renderProfile(){
    const box = document.getElementById('profileBox');
    if(!box) return;
    const user = getUser();
    if(!user){
        box.innerHTML='<p>Please <a href="login.html">login</a> to see your profile.</p>';
        return;
    }

    box.innerHTML=`
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
    `;

    const history = document.getElementById('orderHistory');
    if(!history) return;
    const orders = getOrders().filter(o=>o.userEmail===user.email);
    history.innerHTML='';
    if(orders.length===0){ history.innerHTML='<p>No previous orders.</p>'; return; }

    orders.forEach(o=>{
        const div = document.createElement('div');
        div.className='card';
        div.style.marginBottom='8px';

        let cancelBtn = '';
        if(o.status !== 'Cancelled' && o.status !== 'Completed') {
            cancelBtn = `<button class="btn danger" onclick="cancelOrder(${o.id})">Cancel Order ❌</button>`;
        }

        div.innerHTML=`
            <strong>Order #${o.id}</strong>
            <div>Items: ${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div>
            <div>Total: ${o.total.toFixed(2)} OMR</div>
            <div>Status: <span id="status-${o.id}">${o.status}</span></div>
            ${o.pickupTime ? `<div>Pickup Time: ${o.pickupTime}</div>` : ''}
            ${cancelBtn}
        `;
        history.appendChild(div);
    });
}

function cancelOrder(orderId){
    if(!confirm('Are you sure you want to cancel this order?')) return;
    const orders = getOrders();
    const idx = orders.findIndex(o=>o.id===orderId);
    if(idx===-1) return;
    orders[idx].status = 'Cancelled';
    saveOrders(orders);
    renderProfile();
    toast('Order cancelled');
}

// ======= Admin Panel =======
function renderAdmin(){
    const user = getUser();
    if(!user || !user.isAdmin){
        alert('Access denied. Admins only!'); location.href='login.html'; return;
    }

    const list = document.getElementById('ordersList');
    if(!list) return;

    const orders = getOrders();
    list.innerHTML='';
    if(orders.length===0){ list.innerHTML='<p>No orders yet.</p>'; return; }

    orders.forEach(o=>{
        const div=document.createElement('div');
        div.className='card';
        div.style.marginBottom='8px';
        div.innerHTML=`
            <strong>Order #${o.id}</strong>
            <div>Name: ${o.userName}</div>
            <div>Email: ${o.userEmail}</div>
            <div>Phone: ${o.userPhone}</div>
            <div>Items: ${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div>
            <div>Total: ${o.total.toFixed(2)} OMR</div>
            <div>Pickup Time: ${o.pickupTime || '-'}</div>
            <div>Status: 
                <select onchange="updateOrderStatus(${o.id}, this.value)">
                    <option value="Preparing" ${o.status==='Preparing'?'selected':''}>Preparing</option>
                    <option value="Ready" ${o.status==='Ready'?'selected':''}>Ready</option>
                    <option value="Completed" ${o.status==='Completed'?'selected':''}>Completed</option>
                    <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
                </select>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateOrderStatus(orderId, status){
    const orders = getOrders();
    const idx = orders.findIndex(o=>o.id===orderId);
    if(idx===-1) return;

    orders[idx].status = status;
    saveOrders(orders);
    renderAdmin();
    toast('Order status updated');

    const statusSpan = document.getElementById(`status-${orderId}`);
    if(statusSpan) statusSpan.innerText = status;
}

// ======= Custom =======
function clearCart() {
    localStorage.removeItem("smartmeal_cart");
    renderCartPage();
    updateCartCount();
    alert("Cart has been cleared!");
}

// ======= Utilities =======
function toast(msg){ alert(msg); }

// ======= Init =======
window.addEventListener('DOMContentLoaded',()=>{
    updateCartCount();
    updateProfileLink();
    renderMenuGrid('all');
    renderCartPage();
    renderProfile();
    if(location.pathname.endsWith('admin.html')) renderAdmin();

    setInterval(()=>{
        const user = getUser();
        if(!user || user.isAdmin) return;
        const orders = getOrders().filter(o=>o.userEmail===user.email);
        orders.forEach(o=>{
            const statusSpan = document.getElementById(`status-${o.id}`);
            if(statusSpan && statusSpan.innerText !== o.status) statusSpan.innerText = o.status;
        });
    },2000);
});
