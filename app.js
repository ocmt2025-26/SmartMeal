const MENU = [
  { id: 1,  name: 'Chicken Burger🍔',      price: 1.50, type: 'main' },
  { id: 2,  name: 'Shawarma Sandwich🌯',   price: 1.10, type: 'main' },
  { id: 3,  name: 'Black Coffee☕',        price: 1.00, type: 'drinks' },
  { id: 4,  name: 'French Fries 🍟',       price: 0.70, type: 'main' },
  { id: 5,  name: 'Choco Cake Slice🍰',    price: 1.20, type: 'dessert' },
  { id: 6,  name: 'Cookies🍪',             price: 1.00, type: 'dessert' },
  { id: 7,  name: 'Karak Tea ☕',          price: 0.10, type: 'drinks' },
  { id: 8,  name: 'Pizza🍕',               price: 2.80, type: 'main' },
  { id: 9,  name: 'Orange Fresh Juice🧃',  price: 1.10, type: 'drinks' },
  { id: 10, name: 'Mango Fresh Juice 🧃',  price: 1.10, type: 'drinks' },
  { id: 11, name: 'Ice Cream 🍦',          price: 0.30, type: 'dessert' }
];

const ADMIN_CREDENTIALS = { email: "admin@ocmt.edu.om", password: "admin123" };
const TENANT_ID = 'SMARTMEAL';

function getCart() {
  try { return JSON.parse(localStorage.getItem('smartmeal_cart') || '[]'); }
  catch { return []; }
}
function saveCart(c) {
  localStorage.setItem('smartmeal_cart', JSON.stringify(c));
  updateCartCount();
}
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.innerText = count;
}

function renderMenuGrid(type='all') {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const items = MENU.filter(i => type==='all' ? true : i.type===type);
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'card menu-item';
    card.innerHTML = `
      <div class="row space-between">
        <h4>${it.name}</h4>
        <strong>${it.price.toFixed(2)} OMR</strong>
      </div>
      <div class="row gap-8">
        <button onclick="addToCart(${it.id})">Add to Cart</button>
        <button class="secondary" onclick="viewItem(${it.id})">View</button>
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
  toast(`${it.name} - ${it.price.toFixed(2)} OMR`);
}
function addToCart(id){
  const it = MENU.find(m=>m.id===id);
  if(!it) return;
  const cart = getCart();
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty += 1;
  else cart.push({ id: it.id, name: it.name, price: it.price, qty: 1 });
  saveCart(cart);
  renderCartPage();
  toast(`${it.name} added to cart`);
}

function renderCartPage(){
  const container = document.getElementById('cartContainer');
  if(!container) return;
  const cart = getCart();
  container.innerHTML = '';
  if(cart.length===0){
    container.innerHTML = `<p>Your cart is empty.</p>`;
    calculateTotals();
    return;
  }
  cart.forEach((item, idx)=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="row space-between">
        <div><strong>${item.name}</strong></div>
        <div>${item.price.toFixed(2)} OMR</div>
      </div>
      <div class="row gap-8 align-center">
        <button onclick="changeQty(${idx}, -1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${idx}, 1)">+</button>
        <button class="danger" onclick="removeItem(${idx})">Remove</button>
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
  if(cart[index].qty < 1) cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}
function removeItem(index){
  const cart = getCart();
  if(!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}
function calculateTotals(){
  const cart = getCart();
  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  const total = subtotal;
  const elSub = document.getElementById('subtotal');
  const elTot = document.getElementById('total');
  if(elSub) elSub.innerText = subtotal.toFixed(2);
  if(elTot) elTot.innerText = total.toFixed(2);
}

function getUser(){
  try { return JSON.parse(localStorage.getItem('smartmeal_user') || 'null'); }
  catch { return null; }
}
function saveUser(u){
  localStorage.setItem('smartmeal_user', JSON.stringify(u));
  updateProfileLink();
  renderProfile();
}
function logout(){
  localStorage.removeItem('smartmeal_user');
  updateProfileLink();
  renderProfile();
  toast('Logged out');
  if(location.pathname.endsWith('admin.html')) location.href = 'admin-login.html';
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
  if(!email || !password){
    toast('Email and password required');
    return;
  }
  if(email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password){
    saveUser({ name:'Admin', email, phone, isAdmin:true });
    toast('Admin logged in');
    if(location.pathname.endsWith('login.html') || location.pathname.endsWith('admin-login.html'))
      location.href = 'admin.html';
    return;
  }
  let users = JSON.parse(localStorage.getItem('smartmeal_users') || '[]');
  let existingUser = users.find(u => u.email === email);
  if(existingUser){
    if(existingUser.password === password){
      saveUser(existingUser);
      toast('Login successful');
      location.href = 'profile.html';
    } else {
      toast('Incorrect password');
    }
  } else {
    const newUser = { name: name || 'User', email, password, phone, isAdmin:false };
    users.push(newUser);
    localStorage.setItem('smartmeal_users', JSON.stringify(users));
    saveUser(newUser);
    toast('Registration successful, logged in!');
    location.href = 'profile.html';
  }
}

async function confirmOrder(){
  const cart = getCart();
  if(cart.length === 0){ toast('Your cart is empty'); return; }
  const user = getUser();
  if(!user){ toast('Please login first'); return; }
  const deliveryTime = document.getElementById('deliveryTime')?.value || 'Not selected';
  const payment = document.getElementById('paymentMethod')?.value || 'Cash';
  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  const total = subtotal.toFixed(2);
  const order = {
    userName: user.name,
    userEmail: user.email,
    userPhone: user.phone,
    items: cart,
    subtotal,
    total,
    payment,
    deliveryTime,
    created: new Date().toISOString(),
    status: 'Preparing',
    tenantId: TENANT_ID
  };
  try {
    const { db, ref, push } = window.firebaseDb;
    await push(ref(db, 'orders'), order);
    localStorage.removeItem('smartmeal_cart');
    updateCartCount();
    renderCartPage();
    renderProfile();
    toast('Order placed! Pick up at ' + deliveryTime);
  } catch (e) {
    console.error('confirmOrder error', e);
    toast('Failed to place order, please try again');
  }
}

function renderProfile(){
  const profileBox = document.getElementById('profileBox');
  const orderHistory = document.getElementById('orderHistory');
  const user = getUser();
  if(!profileBox) return;
  if(!user){
    profileBox.innerHTML = '<p>Please login to view profile</p>';
    if(orderHistory) orderHistory.innerHTML = '';
    return;
  }
  profileBox.innerHTML = `
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone || '-'}</p>
    <button onclick="logout()">Logout</button>
  `;
  if(orderHistory){
    const { db, ref, query, orderByChild, equalTo, onValue } = window.firebaseDb;
    const q = query(ref(db, 'orders'), orderByChild('userEmail'), equalTo(user.email));
    onValue(q, (snap) => {
      const data = snap.val() || {};
      const orders = Object.entries(data).map(([id, v]) => ({ id, ...v }))
        .sort((a,b) => (a.created > b.created ? -1 : 1));
      if(orders.length === 0){
        orderHistory.innerHTML = '<p>No orders yet</p>';
        return;
      }
      orderHistory.innerHTML = '';
      orders.forEach(o=>{
        const div = document.createElement('div');
        div.className = 'order-item';
        div.innerHTML = `
          <div><strong>Order #${o.id}</strong> - ${o.status}</div>
          <div>Pick up time: ${o.deliveryTime}</div>
          <div>
            ${o.items.map(i => `<div>- ${i.name} x ${i.qty} - ${i.price.toFixed(2)} OMR</div>`).join('')}
          </div>
          <div><strong>Total:</strong> ${o.total} OMR</div>
          ${o.status!=='Cancelled' && o.status!=='Completed' && o.status!=='Ready' ? `<button onclick="cancelOrder('${o.id}')">Cancel</button>` : ''}
        `;
        orderHistory.appendChild(div);
      });
    }, (err)=>console.error('profile onValue error:', err));
  }
}
async function cancelOrder(orderId){
  try {
    const { db, ref, update } = window.firebaseDb;
    await update(ref(db, `orders/${orderId}`), { status: 'Cancelled' });
    toast('Order cancelled');
  } catch (e) {
    console.error('cancelOrder error', e);
    toast('Failed to cancel order');
  }
}

function listenAdminOrders(tenantId = TENANT_ID){
  const list = document.getElementById('ordersList');
  if(!list) return;
  const { db, ref, query, orderByChild, equalTo, onValue } = window.firebaseDb;
  const q = query(ref(db, 'orders'), orderByChild('tenantId'), equalTo(tenantId));
  onValue(q, (snap)=>{
    const data = snap.val() || {};
    const orders = Object.entries(data).map(([id, v]) => ({ id, ...v }));
    renderAdminList(orders);
  }, (err)=>console.error('Admin orders listener error:', err));
}

function renderAdminList(orders){
  const list = document.getElementById('ordersList');
  if(!list) return;
  list.innerHTML = '';
  if(!orders.length){
    list.innerHTML = '<p>No orders yet.</p>';
    return;
  }
  orders.sort((a,b)=> (a.created > b.created ? -1 : 1)).forEach(o=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <div class="row space-between">
        <strong>Order #${o.id}</strong>
        <span>Status: ${o.status}</span>
      </div>
      <div>Name: ${o.userName}</div>
      <div>Email: ${o.userEmail}</div>
      <div>Phone: ${o.userPhone || '-'}</div>
      <div>Pick up time: ${o.deliveryTime}</div>
      <div>Items: ${o.items.map(i => i.name + ' x' + i.qty).join(', ')}</div>
      <div><strong>Total: ${o.total} OMR</strong></div>
      <div class="row gap-8" style="margin-top:8px">
        <button onclick="updateOrderStatus('${o.id}', 'Ready')">Ready</button>
        <button onclick="updateOrderStatus('${o.id}', 'Completed')">Completed</button>
        <button class="secondary" onclick="updateOrderStatus('${o.id}', 'Cancelled')">Cancelled</button>
        ${['Ready','Completed','Cancelled'].includes(o.status) ? `<button class="danger" onclick="deleteOrder('${o.id}')">Delete Order</button>` : ''}
      </div>
    `;
    list.appendChild(div);
  });
}

async function updateOrderStatus(orderId, status){
  try {
    const { db, ref, update } = window.firebaseDb;
    await update(ref(db, `orders/${orderId}`), { status });
    toast('Order status updated');
  } catch (e) {
    console.error('updateOrderStatus error', e);
    toast('Failed to update order status');
  }
}

async function deleteOrder(orderId){
  try {
    const { db, ref, remove } = window.firebaseDb;
    await remove(ref(db, `orders/${orderId}`));
    toast('Order deleted');
  } catch (e) {
    console.error('deleteOrder error', e);
    toast('Failed to delete order');
  }
}

function toast(msg){ alert(msg); }

window.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  updateProfileLink();
  renderMenuGrid('all');
  renderCartPage();
  renderProfile();
  if(location.pathname.endsWith('admin.html')){
    listenAdminOrders(TENANT_ID);
  }
});
