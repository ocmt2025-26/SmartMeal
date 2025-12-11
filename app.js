import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, push, get, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
function getUser() { return JSON.parse(localStorage.getItem('smartmeal_user') || 'null'); }
function saveUser(u) { localStorage.setItem('smartmeal_user', JSON.stringify(u)); updateProfileLink(); renderProfile(); renderAdminFirebase?.(); }

function renderMenuGrid(type='all') {
  const grid = document.getElementById('menuGrid');
  if(!grid) return;
  grid.innerHTML='';
  const items = MENU.filter(i => type==='all' ? true : i.type===type);
  items.forEach(it => {
    const card = document.createElement('div');
    card.className='card menu-item';
    card.innerHTML = `
      <div class="menu-item-content">
        <h3>${it.name}</h3>
        <p class="price">${it.price.toFixed(2)} OMR</p>
        <div class="menu-item-actions">
          <button class="btn primary" onclick="addToCart(${it.id})">Add to Cart</button>
          <button class="btn ghost" onclick="viewItem(${it.id})">View</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterType(type, el){
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  renderMenuGrid(type);
}

function viewItem(id){
  const it = MENU.find(m=>m.id===id);
  if(!it) return;
  toast(it.name + " - " + it.price.toFixed(2) + " OMR");
}

function addToCart(id){
  const it = MENU.find(m=>m.id===id);
  if(!it) return;
  const cart = getCart();
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty+=1;
  else cart.push({ id: it.id, name: it.name, price: it.price, qty: 1 });
  saveCart(cart);
  renderCartPage();
  toast(it.name + " added to cart");
}

function updateCartCount(){
  const cart = getCart();
  const count = cart.reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cartCount');
  if(el) el.innerText = count;
}

function renderCartPage(){
  const container = document.getElementById('cartContainer');
  if(!container) return;
  const cart = getCart();
  container.innerHTML='';

  if(cart.length===0){ container.innerHTML='<p>Your cart is empty.</p>'; calculateTotals(); return; }

  cart.forEach((item, idx)=>{
    const div = document.createElement('div');
    div.className='cart-item';
    div.innerHTML=`
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
  const total = subtotal;
  const elSub = document.getElementById('subtotal');
  const elTot = document.getElementById('total');
  if(elSub) elSub.innerText = subtotal.toFixed(2);
  if(elTot) elTot.innerText = total.toFixed(2);
}

function confirmOrder(){
  const cart = getCart();
  if(cart.length===0){ toast('Your cart is empty'); return; }
  const user = getUser();
  if(!user){ toast('Please login first'); return; }

  const deliveryTime = document.getElementById('deliveryTime')?.value || 'Not selected';
  const payment = document.getElementById('paymentMethod')?.value || 'Cash';
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const total = subtotal.toFixed(2);

  const order = {
    id: Date.now(),
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    items: cart,
    subtotal,
    total,
    payment,
    deliveryTime,
    created: new Date().toISOString(),
    status: 'Preparing'
  };

  const deviceId = localStorage.getItem('smartmeal_device_id') || Date.now().toString();
  localStorage.setItem('smartmeal_device_id', deviceId);

  const ordersRef = ref(db, 'orders/' + deviceId);
  push(ordersRef, order);

  localStorage.removeItem('smartmeal_cart');
  updateCartCount();
  renderCartPage();
  renderProfile();
  renderAdminFirebase(deviceId);

  toast('Order placed! Pick up at ' + deliveryTime);
}

function renderProfile(){
  const profileBox = document.getElementById('profileBox');
  const orderHistory = document.getElementById('orderHistory');
  const user = getUser();
  if(!profileBox) return;

  if(!user){
    profileBox.innerHTML='<p>Please login to view profile</p>';
    if(orderHistory) orderHistory.innerHTML='';
    return;
  }

  profileBox.innerHTML=`
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone || '-'}</p>
    <button class="btn ghost" onclick="logout()">Logout</button>
  `;

  if(orderHistory){
    const deviceId = localStorage.getItem('smartmeal_device_id');
    const ordersRef = ref(db, 'orders/' + deviceId);
    onValue(ordersRef, snapshot=>{
      const ordersData = snapshot.val() || {};
      orderHistory.innerHTML='';
      Object.values(ordersData).forEach(o=>{
        const div = document.createElement('div');
        div.className='order-item';
        div.innerHTML=`
          <p><strong>Order #${o.id}</strong> - ${o.status}</p>
          <div><strong>Pick up time:</strong> ${o.deliveryTime}</div>
          <ul>
            ${o.items.map(i=>`<li>${i.name} x ${i.qty} - ${i.price.toFixed(2)} OMR</li>`).join('')}
          </ul>
          <p>Total: ${o.total} OMR</p>
        `;
        orderHistory.appendChild(div);
      });
    });
  }
}

function renderAdminFirebase(deviceId){
  const list = document.getElementById('ordersList');
  if(!list) return;
  const ordersRef = ref(db, 'orders/' + deviceId);
  onValue(ordersRef, snapshot=>{
    const ordersData = snapshot.val() || {};
    list.innerHTML='';
    Object.values(ordersData).forEach(o=>{
      const div = document.createElement('div');
      div.className='card';
      div.style.marginBottom='8px';
      div.innerHTML=`
        <strong>Order #${o.id}</strong>
        <div><strong>Name:</strong> ${o.userName}</div>
        <div><strong>Email:</strong> ${o.userEmail}</div>
        <div><strong>Phone:</strong> ${o.userPhone || '-'}</div>
        <div><strong>Pick up time:</strong> ${o.deliveryTime}</div>
        <div><strong>Items:</strong> ${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div>
        <div><strong>Total:</strong> ${o.total} OMR</div>
        <div><strong>Status:</strong>
          <select onchange="updateOrderStatusFirebase('${deviceId}', ${o.id}, this.value)">
            <option value="Preparing" ${o.status==='Preparing'?'selected':''}>Preparing</option>
            <option value="Ready" ${o.status==='Ready'?'selected':''}>Ready</option>
            <option value="Completed" ${o.status==='Completed'?'selected':''}>Completed</option>
            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </div>
      `;
      list.appendChild(div);
    });
  });
}

function updateOrderStatusFirebase(deviceId, orderId, status){
  const ordersRef = ref(db, 'orders/' + deviceId);
  get(ordersRef).then(snapshot=>{
    const ordersData = snapshot.val() || {};
    const key = Object.keys(ordersData).find(k => ordersData[k].id === orderId);
    if(key){
      set(ref(db, 'orders/' + deviceId + '/' + key + '/status'), status);
      renderAdminFirebase(deviceId);
      renderProfile();
      toast('Order status updated');
    }
  });
}

function logout(){
  localStorage.removeItem('smartmeal_user');
  updateProfileLink();
  renderProfile();
  if(location.pathname.endsWith('admin.html')) location.href='admin-login.html';
}

function updateProfileLink(){
  const link = document.getElementById('profileLink');
  const user = getUser();
  if(!link) return;
  link.innerText = user ? user.name : 'Account';
}

function doLogin(){
  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value.trim();
  const phone = document.getElementById('phone')?.value.trim();

  if(!email || !password){ toast('Email and password required'); return; }

  if(email===ADMIN_CREDENTIALS.email && password===ADMIN_CREDENTIALS.password){
    saveUser({ name:'Admin', email, phone, isAdmin:true });
    toast('Admin logged in');
    if(location.pathname.endsWith('login.html')) location.href='admin.html';
    return;
  }

  saveUser({ name: name || 'User', email, phone });
  toast('Login successful');
  if(location.pathname.endsWith('login.html')) location.href='profile.html';
}

function toast(msg){ alert(msg); }

window.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();
  updateProfileLink();
  renderMenuGrid('all');
  renderCartPage();
  renderProfile();
  if(location.pathname.endsWith('admin.html')){
    const deviceId = localStorage.getItem('smartmeal_device_id');
    if(deviceId) renderAdminFirebase(deviceId);
  }
});
