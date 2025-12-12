const ADMIN_CREDENTIALS = { email: "admin@ocmt.edu.om", password: "admin123" };
const TENANT_ID = 'SMARTMEAL';

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

// --------- User Management ----------
function getUser(){ return JSON.parse(localStorage.getItem('smartmeal_user') || 'null'); }
function saveUser(u){ localStorage.setItem('smartmeal_user', JSON.stringify(u)); updateProfileLink(); renderProfile(); }
function logout(){ localStorage.removeItem('smartmeal_user'); updateProfileLink(); renderProfile(); alert('Logged out'); location.href='index.html'; }

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
  if(!email || !password){ alert('Email and password required'); return; }

  if(email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password){
    saveUser({ name:'Admin', email, phone, isAdmin:true });
    alert('Admin logged in');
    location.href = 'admin.html';
    return;
  }

  let users = JSON.parse(localStorage.getItem('smartmeal_users') || '[]');
  let existing = users.find(u=>u.email===email);
  if(existing){
    if(existing.password === password){
      saveUser(existing);
      alert('Login successful');
      location.href = 'profile.html';
    } else { alert('Incorrect password'); }
  } else {
    const newUser = { name:name||'User', email, password, phone, isAdmin:false };
    users.push(newUser);
    localStorage.setItem('smartmeal_users', JSON.stringify(users));
    saveUser(newUser);
    alert('Registration successful, logged in!');
    location.href = 'profile.html';
  }
}

// --------- Cart ----------
function getCart(){ return JSON.parse(localStorage.getItem('smartmeal_cart') || '[]'); }
function saveCart(c){ localStorage.setItem('smartmeal_cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const count = getCart().reduce((s,i)=>s+i.qty,0); const el=document.getElementById('cartCount'); if(el) el.innerText=count; }

function addToCart(id){
  const it = MENU.find(m=>m.id===id); if(!it) return;
  const cart = getCart();
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty+=1; else cart.push({ id:it.id,name:it.name,price:it.price,qty:1 });
  saveCart(cart);
  alert(`${it.name} added to cart`);
  renderCartPage();
}

function changeQty(idx, delta){
  const cart = getCart();
  if(!cart[idx]) return;
  cart[idx].qty+=delta;
  if(cart[idx].qty<1) cart.splice(idx,1);
  saveCart(cart);
  renderCartPage();
}

function removeItem(idx){
  const cart = getCart();
  if(!cart[idx]) return;
  cart.splice(idx,1);
  saveCart(cart);
  renderCartPage();
}

function calculateTotals(){
  const cart = getCart();
  const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const total = subtotal;
  const elSub=document.getElementById('subtotal');
  const elTot=document.getElementById('total');
  if(elSub) elSub.innerText=subtotal.toFixed(2);
  if(elTot) elTot.innerText=total.toFixed(2);
}

// --------- Render Menu ----------
function renderMenuGrid(type='all'){
  const grid = document.getElementById('menuGrid');
  if(!grid) return;
  grid.innerHTML='';
  const items = MENU.filter(i => type==='all'?true:i.type===type);
  items.forEach(it=>{
    const card = document.createElement('div');
    card.className='card menu-item';
    card.style.border='1px solid #ddd';
    card.style.padding='10px';
    card.style.margin='5px';
    card.style.borderRadius='6px';
    card.innerHTML=`
      <div class="row space-between">
        <h4>${it.name}</h4>
        <strong>${it.price.toFixed(2)} OMR</strong>
      </div>
      <div class="row gap-8">
        <button onclick="addToCart(${it.id})" style="background:#4CAF50;color:white;border:none;padding:5px 10px;border-radius:4px;">Add to Cart</button>
        <button class="secondary" onclick="viewItem(${it.id})" style="border:1px solid #aaa;padding:5px 10px;border-radius:4px;">View</button>
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
  alert(`${it.name} - ${it.price.toFixed(2)} OMR`);
}

// --------- Profile ----------
function renderProfile(){
  const profileBox=document.getElementById('profileBox');
  const orderHistory=document.getElementById('orderHistory');
  const user=getUser();
  if(!profileBox) return;
  if(!user){ profileBox.innerHTML='<p>Please login to view profile</p>'; if(orderHistory) orderHistory.innerHTML=''; return; }
  profileBox.innerHTML=`
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Phone:</strong> ${user.phone||'-'}</p>
    <button onclick="logout()">Logout</button>
  `;

  if(orderHistory){
    const { db, ref, query, orderByChild, equalTo, onValue } = window.firebaseDb;
    const q = query(ref(db,'orders'),orderByChild('userEmail'),equalTo(user.email));
    onValue(q,(snap)=>{
      const data = snap.val() || {};
      const orders = Object.entries(data).map(([id,v])=>({ id,...v })).sort((a,b)=>(a.created>b.created?-1:1));
      if(orders.length===0){ orderHistory.innerHTML='<p>No orders yet</p>'; return; }
      orderHistory.innerHTML='';
      orders.forEach(o=>{
        const div=document.createElement('div');
        div.className='order-item';
        div.innerHTML=`
          <div><strong>Order #${o.id}</strong> - ${o.status}</div>
          <div>Pick up time: ${o.deliveryTime}</div>
          <div>${o.items.map(i=>`<div>- ${i.name} x ${i.qty} - ${i.price.toFixed(2)} OMR</div>`).join('')}</div>
          <div><strong>Total:</strong> ${o.total} OMR</div>
        `;
        orderHistory.appendChild(div);
      });
    });
  }
}

// --------- Admin ----------
function listenAdminOrders(tenantId = TENANT_ID){
  const list = document.getElementById('ordersList');
  if(!list) return;
  const { db, ref, query, orderByChild, equalTo, onValue } = window.firebaseDb;
  const q = query(ref(db,'orders'),orderByChild('tenantId'),equalTo(tenantId));
  onValue(q,(snap)=>{
    const data = snap.val() || {};
    const orders = Object.entries(data).map(([id,v])=>({ id,...v })).sort((a,b)=>(a.created>b.created?-1:1));
    renderAdminList(orders);
  });
}

function renderAdminList(orders){
  const list=document.getElementById('ordersList');
  if(!list) return;
  list.innerHTML='';
  if(orders.length===0){ list.innerHTML='<p>No orders yet.</p>'; return; }
  orders.forEach(o=>{
    const div=document.createElement('div');
    div.className='card';
    div.style.marginBottom='8px';
    div.innerHTML=`
      <div class="row space-between">
        <strong>Order #${o.id}</strong>
        <span>Status: ${o.status}</span>
      </div>
      <div>Name: ${o.userName}</div>
      <div>Email: ${o.userEmail}</div>
      <div>Phone: ${o.userPhone||'-'}</div>
      <div>Pick up time: ${o.deliveryTime}</div>
      <div>Items: ${o.items.map(i=>i.name+' x'+i.qty).join(', ')}</div>
      <div><strong>Total: ${o.total} OMR</strong></div>
      <div class="row gap-8" style="margin-top:8px">
        <button onclick="updateOrderStatus('${o.id}','Ready')">Ready</button>
        <button onclick="updateOrderStatus('${o.id}','Completed')">Completed</button>
        <button class="secondary" onclick="updateOrderStatus('${o.id}','Cancelled')">Cancelled</button>
        ${['Ready','Completed','Cancelled'].includes(o.status)?`<button class="danger" onclick="deleteOrder('${o.id}')">Delete Order</button>`:''}
      </div>
    `;
    list.appendChild(div);
  });
}

async function updateOrderStatus(orderId,status){
  try { const { db, ref, update } = window.firebaseDb; await update(ref(db,`orders/${orderId}`),{status}); alert('Order status updated'); } 
  catch(e){ console.error(e); alert('Failed to update order'); }
}

async function deleteOrder(orderId){
  try { const { db, ref, remove } = window.firebaseDb; await remove(ref(db,`orders/${orderId}`)); alert('Order deleted'); } 
  catch(e){ console.error(e); alert('Failed to delete order'); }
}

// --------- On Load ----------
window.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();
  updateProfileLink();
  renderMenuGrid('all');
  renderCartPage();
  renderProfile();
  if(location.pathname.endsWith('admin.html')) listenAdminOrders(TENANT_ID);
});
