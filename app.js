// =====================
// SmartMeal app.js
// =====================

// ----- بيانات المستخدمين -----
// مثال: يمكن إضافة مستخدم Admin هنا مباشرة
let users = JSON.parse(localStorage.getItem("users")) || [
    {
        name: "Admin",
        email: "202116076@ocmt.edu.om",
        password: "123456",
        phone: "9999999",
        isAdmin: true
    }
];
localStorage.setItem("users", JSON.stringify(users));

// ----- تسجيل الدخول -----
document.getElementById("loginForm")?.addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.email === email && u.password === password);

    if(user){
        localStorage.setItem("currentUser", JSON.stringify(user));
        
        // تحويل إلى menu.html بعد تسجيل الدخول
        if(user.isAdmin){
            window.location.href = "admin.html";
        } else {
            window.location.href = "menu.html";
        }
    } else {
        alert("Incorrect email or password!");
    }
});

// ----- التسجيل -----
document.getElementById("registerForm")?.addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const phone = document.getElementById("registerPhone").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // التحقق إذا البريد موجود مسبقاً
    if(users.some(u => u.email === email)){
        return alert("Email already registered!");
    }

    const newUser = {name, email, password, phone, isAdmin: false};
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! You can now login.");
    window.location.href = "login.html";
});

// ----- التأكد من تسجيل الدخول قبل أي صفحة -----
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

// إذا كانت الصفحة menu.html
if(document.getElementById("menuGrid")){
    if(!currentUser){
        window.location.href = "login.html";
    } else {
        // عرض قائمة الطعام
        const menuItems = [
            {name: "Burger", type:"main", price: 2.8},
            {name: "Pizza", type:"main", price: 3.5},
            {name: "Black Coffee", type:"drinks", price: 1.3},
            {name: "Fries", type:"dessert", price: 1.5}
        ];

        const menuGrid = document.getElementById("menuGrid");

        menuItems.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("menu-item");
            div.innerHTML = `
                <h3>${item.name}</h3>
                <p>Price: ${item.price} OMR</p>
                <button onclick="addOrder('${item.name}', ${item.price})">Order</button>
            `;
            menuGrid.appendChild(div);
        });
    }
}

// ----- إضافة الطلبات -----
function addOrder(itemName, price) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser) return alert("Please login first");

    const order = {
        id: Date.now(),
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone,
        items: itemName,
        total: price,
        status: "Preparing"
    };

    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Order placed!");
    // تحديث العداد إذا كان موجود
    const cartCount = document.getElementById("cartCount");
    if(cartCount) cartCount.textContent = orders.length;
}

// ----- عرض الطلبات في Admin -----
if(document.getElementById("adminOrders")){
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    const adminOrdersDiv = document.getElementById("adminOrders");

    if(orders.length === 0){
        adminOrdersDiv.innerHTML = "<p>No orders yet.</p>";
    } else {
        orders.forEach(o => {
            const div = document.createElement("div");
            div.classList.add("order-card");
            div.innerHTML = `
                <strong>Order #${o.id}</strong><br>
                <div><strong>Name:</strong> ${o.userName}</div>
                <div><strong>Email:</strong> ${o.userEmail}</div>
                <div><strong>Phone:</strong> ${o.userPhone}</div>
                <div><strong>Items:</strong> ${o.items}</div>
                <div><strong>Total:</strong> ${o.total} OMR</div>
                <div><strong>Status:</strong> ${o.status}</div>
            `;
            adminOrdersDiv.appendChild(div);
        });
    }
}

// ----- Logout -----
document.getElementById("logoutBtn")?.addEventListener("click", function(){
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});
