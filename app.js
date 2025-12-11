const ADMIN_CREDENTIALS = { email: "admin@ocmt.edu.om", password: "admin123" };
const MENU = [
  { id: 1, name: 'Chicken Burger🍔', price: 1.50, type: 'main' },
  { id: 2, name: 'Shawarma Sandwich🌯', price: 1.10, type: 'main' },
  { id: 3, name: 'Black Coffee☕', price: 1.00, type: 'drinks' },
  { id: 4, name: 'French Fries 🍟', price: 0.70, type: 'main' },
  { id: 5, name: 'Choco Cake Slice🍰', price: 1.20, type: 'dessert' },
  { id: 6, name: 'Cookies🍪', price: 1.00, type: 'dessert' },
  { id: 7, name: 'Karak Tea ☕', price: 0.10, type: 'drinks' },
  { id: 8, name: 'Pizza🍕', price: 2.80, type: 'main' },
  { id: 9, name: 'Orange Fresh Juice🧃', price: 1.10, type: 'drinks' },
  { id: 10, name: 'Mango Fresh Juice 🧃', price: 1.10, type: 'drinks' },
  { id: 11, name: 'Ice Cream 🍦', price: 0.30, type: 'dessert' }
];

function getUser(){ return JSON.parse(localStorage.getItem('smartmeal_user') || 'null'); }
function saveUser(u){ localStorage.setItem('smartmeal_user', JSON.stringify(u)); updateProfileLink(); }
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

function logout(){ localStorage.removeItem('smartmeal_user'); updateProfileLink(); alert('Logged out'); location.href='index.html'; }

function getCart(){ return JSON.parse(localStorage.getItem('smartmeal_cart') || '[]'); }
function saveCart(c){ localStorage.setItem('smartmeal_cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const count = getCart().reduce((s,i)=>s+i.qty,0); const el=document.getElementById('cartCount'); if(el) el.innerText=count; }

function renderMenuGrid(type='all'){
  const grid = document.getElementById('menuGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const items = MENU.filter(i => type==='all' ? true : i.type===type);
  items.forEach(it=>{
    const card = document.createElement('div');
    card.className = 'card menu-item';
    card.innerHTML = `
      <div class="row space-between">
        <h4>${it.name}</h4>
        <strong>${it.price.toFixed(2)} OMR</strong>
      </div>
      <div class="row gap-8">
        <button onclick="addToCart(${it.id})">Add to Cart</button>
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

function addToCart(id){
  const it = MENU.find(m=>m.id===id); if(!it) return;
  const cart = getCart();
  const existing = cart.find(c=>c.id===id);
  if(existing) existing.qty+=1; else cart.push({ id:it.id,name:it.name,price:it.price,qty:1 });
  saveCart(cart);
  alert(`${it.name} added to cart`);
}

function renderCartPage(){
  const container = document.getElementById('cartContainer');
  if(!container) return;
  const cart = getCart();
  container.innerHTML = '';
  if(cart.length===0){
    container.innerHTML = '<p>Your cart is empty.</p>';
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
        <button onclick="removeItem(${idx})">Remove</button>
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
  if(cart[index].qty < 1) cart.splice(index,1);
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
  const elSub = document.getElementById('subtotal');
  const elTot = document.getElementById('total');
  if(elSub) elSub.innerText = subtotal.toFixed(2);
  if(elTot) elTot.innerText = subtotal.toFixed(2);
}

function confirmOrder(){
  const cart = getCart();
  if(cart.length===0){ alert('Your cart is empty'); return; }
  const user = getUser();
  if(!user){ alert('Please login first'); return; }
  alert('Your order has been sent to the cafeteria and will be ready in 10 minutes.');
  localStorage.removeItem('smartmeal_cart');
  updateCartCount();
  renderCartPage();
}

window.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  updateProfileLink();
  renderMenuGrid('all');

  document.querySelectorAll('.chip').forEach(el=>{
    el.addEventListener('click', ()=>filterType(el.dataset.type, el));
  });

  renderCartPage();
  const confirmBtn = document.getElementById('confirmOrderBtn');
  if(confirmBtn) confirmBtn.addEventListener('click', confirmOrder);
});
