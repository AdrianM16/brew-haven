
// Brew Haven Coffee Shop - Global JS (nav, cart, products, rating, search, filters)
const $ = (sel, doc = document) => doc.querySelector(sel);
const $$ = (sel, doc = document) => Array.from(doc.querySelectorAll(sel));

// --- Responsive nav ---
document.addEventListener("click", (e)=>{
  if(e.target.matches(".menu-toggle")){
    const list = $("nav ul"); list.classList.toggle("open");
  }
});

// --- Cart state ---
const CART_KEY = "bh_cart_v1";
const RATINGS_KEY = "bh_ratings_v1";

const cart = {
  items: JSON.parse(localStorage.getItem(CART_KEY) || "[]"),
  save(){ localStorage.setItem(CART_KEY, JSON.stringify(this.items)); updateCartCount(); renderCart(); },
  add(productId){
    const item = this.items.find(i=>i.id===productId);
    if(item){ item.qty++; } else { this.items.push({id:productId, qty:1}); }
    this.save();
  },
  remove(productId){
    this.items = this.items.filter(i=>i.id!==productId); this.save();
  },
  setQty(productId, qty){
    const it = this.items.find(i=>i.id===productId);
    if(!it) return;
    it.qty = Math.max(1, qty|0); this.save();
  },
  clear(){ this.items=[]; this.save(); }
};

// --- Product catalog ---
const PRODUCTS = [
  // Coffee (11 total)
  {id:"cap", name:"Cappuccino", price:120, img:"images/cappuccino.jpg", category:"Coffee", tags:["Hot","Milk"]},
  {id:"lat", name:"Latte", price:110, img:"images/latte.jpg", category:"Coffee", tags:["Hot","Milk"]},
  {id:"esp", name:"Espresso", price:90,  img:"images/espresso.jpg", category:"Coffee", tags:["Hot","Strong"]},
  {id:"moc", name:"Mocha", price:130, img:"images/mocha.jpg", category:"Coffee", tags:["Chocolate"]},
  {id:"ame", name:"Americano", price:100, img:"images/americano.jpg", category:"Coffee", tags:["Hot","Black"]},
  {id:"mac", name:"Caramel Macchiato", price:140, img:"images/caramel.jpg", category:"Coffee", tags:["Caramel"]},
  {id:"cld", name:"Cold Brew", price:110, img:"images/cold.jpg", category:"Coffee", tags:["Cold"]},
  {id:"fla", name:"Flat White", price:125, img:"images/flat.jpg", category:"Coffee", tags:["Hot","Milk"]},
  {id:"aff", name:"Affogato", price:150, img:"images/affogato.jpg", category:"Coffee", tags:["Dessert","Ice Cream"]},
  {id:"iri", name:"Irish Coffee", price:170, img:"images/irish.jpg", category:"Coffee", tags:["Alcohol","Cream"]},
  {id:"mat", name:"Matcha Latte", price:135, img:"images/matcha.jpg", category:"Coffee", tags:["Green Tea","Milk"]},

  // Pastries (8 total)
  {id:"muf", name:"Blueberry Muffin", price:80, img:"images/muffin.jpg", category:"Pastry", tags:["Baked"]},
  {id:"cro", name:"Butter Croissant", price:75, img:"images/croissant.jpg", category:"Pastry", tags:["Baked"]},
  {id:"don", name:"Chocolate Donut", price:85, img:"images/donut.jpg", category:"Pastry", tags:["Sweet"]},
  {id:"brw", name:"Fudge Brownie", price:95, img:"images/brownie.jpg", category:"Pastry", tags:["Choco","Baked"]},
  {id:"ckie", name:"Oatmeal Cookie", price:60, img:"images/cookie.jpg", category:"Pastry", tags:["Baked","Crunchy"]},
  {id:"che", name:"Cheesecake Slice", price:120, img:"images/cheesecake.jpg", category:"Pastry", tags:["Creamy","Sweet"]},
  {id:"cin", name:"Cinnamon Roll", price:100, img:"images/cinnamon.jpg", category:"Pastry", tags:["Sweet","Baked"]},
  {id:"str", name:"Strawberry Shortcake", price:140, img:"images/shortcake.jpg", category:"Pastry", tags:["Fruity","Creamy"]},

  // Merch (6 total)
  {id:"tum", name:"Brew Haven Tumbler", price:300, img:"images/tumbler.jpg", category:"Merch", tags:["Reusable"]},
  {id:"mug", name:"Coffee Mug", price:150, img:"images/mug.jpg", category:"Merch", tags:["Ceramic"]},
  {id:"bag", name:"Eco Tote Bag", price:200, img:"images/totebag.jpg", category:"Merch", tags:["Reusable"]},
  {id:"capm", name:"Cafe Cap", price:180, img:"images/cap.jpg", category:"Merch", tags:["Clothing"]},
  {id:"sts", name:"Sticker Set", price:50, img:"images/stickers.jpg", category:"Merch", tags:["Collectible"]},
  {id:"pin", name:"Cafe Pin Badge", price:90, img:"images/pin.jpg", category:"Merch", tags:["Collectible"]}
];

// --- Ratings state ---
const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}");
function setRating(id, value){
  ratings[id] = value;
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  const el = document.querySelector(`[data-id="${id}"] .rating-value`);
  if(el) el.textContent = value.toFixed(1);
}

// --- Render helpers ---
function updateCartCount(){
  const count = cart.items.reduce((a,b)=>a+b.qty,0);
  $$(".cart-count").forEach(el=>el.textContent = count);
}
function price(p){ return `₱${p.toFixed(2)}`; }

// --- Products Page ---
function renderProductsPage(){
  const list = $("#productList");
  if(!list) return; // not on products page

  const search = $("#searchBar");
  const filter = $("#filterCategory");
  const sort = $("#sortSelect");

  function currentList(){
    const q = (search.value||"").toLowerCase();
    let arr = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));
    if(filter.value !== "All") arr = arr.filter(p => p.category === filter.value);
    if(sort.value === "priceAsc") arr.sort((a,b)=>a.price-b.price);
    if(sort.value === "priceDesc") arr.sort((a,b)=>b.price-a.price);
    if(sort.value === "nameAsc") arr.sort((a,b)=>a.name.localeCompare(b.name));
    if(sort.value === "nameDesc") arr.sort((a,b)=>b.name.localeCompare(a.name));
    return arr;
  }

  function beanRow(id){
    const val = ratings[id] || 0;
    let beans = "";
    for(let i=1;i<=5;i++){
      const filled = i <= Math.round(val) ? "filled" : "";
      beans += `<span class="bean ${filled}" data-v="${i}" title="${i} bean${i>1?'s':''}">☕</span>`;
    }
    return `<div class="rating" data-rate-for="${id}">${beans}<span style="margin-left:6px" class="rating-value">${(val||0).toFixed(1)}</span></div>`;
  }

  function render(){
    const arr = currentList();
    list.innerHTML = arr.map(p=>`
      <div class="product" data-id="${p.id}">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="content">
          <div class="meta">
            <strong>${p.name}</strong>
            <span>${price(p.price)}</span>
          </div>
          <div>${p.category} ${p.tags.map(t=>`<span class="tag">${t}</span>`).join(" ")}</div>
          ${beanRow(p.id)}
          <div class="actions">
            <button onclick="cart.add('${p.id}')">Add to Cart</button>
            <button class="secondary" onclick="openCart()">View Cart</button>
          </div>
        </div>
      </div>
    `).join("");
  }
  render();

  // Wire controls
  [search, filter, sort].forEach(el=> el && el.addEventListener("input", render));

  // Unique rating interaction: clicking beans sets rating, double-click clears
  document.addEventListener("click", (e)=>{
    const bean = e.target.closest(".bean");
    if(!bean) return;
    const wrap = bean.closest(".rating");
    const id = wrap.dataset.rateFor;
    const v = Number(bean.dataset.v);
    setRating(id, v);
    // Re-render just the bean row
    const parent = wrap.parentElement;
    wrap.outerHTML = (function(){ // regenerate
      const val = ratings[id] || 0;
      let beans = "";
      for(let i=1;i<=5;i++){
        const filled = i <= Math.round(val) ? "filled" : "";
        beans += `<span class="bean ${filled}" data-v="${i}" title="${i} bean${i>1?'s':''}">☕</span>`;
      }
      return `<div class="rating" data-rate-for="${id}">${beans}<span style="margin-left:6px" class="rating-value">${(val||0).toFixed(1)}</span></div>`;
    })();
  });

  document.addEventListener("dblclick", (e)=>{
    const bean = e.target.closest(".bean");
    if(!bean) return;
    const wrap = bean.closest(".rating");
    const id = wrap.dataset.rateFor;
    setRating(id, 0);
    const valEl = wrap.querySelector(".rating-value");
    if(valEl) valEl.textContent = "0.0";
    $$(".bean", wrap).forEach(b=>b.classList.remove("filled"));
  });
}

// --- Cart drawer ---
function openCart(){ $(".cart-drawer").classList.add("open"); renderCart(); }
function closeCart(){ $(".cart-drawer").classList.remove("open"); }

function renderCart(){
  const list = $(".cart-items");
  if(!list) return;
  if(cart.items.length===0){
    list.innerHTML = `<p>Your cart is empty.</p>`;
  } else {
    list.innerHTML = cart.items.map(({id, qty})=>{
      const p = PRODUCTS.find(x=>x.id===id);
      return `<div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${p.name}</strong>
            <span>${price(p.price*qty)}</span>
          </div>
          <div class="qty">
            <button onclick="cart.setQty('${id}', ${qty-1})">-</button>
            <span>${qty}</span>
            <button onclick="cart.setQty('${id}', ${qty+1})">+</button>
            <button class="secondary" style="margin-left:auto" onclick="cart.remove('${id}')">Remove</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }
  const total = cart.items.reduce((sum,{id,qty})=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + p.price*qty;
  },0);
  $(".cart-total").textContent = price(total);
}
window.openCart = openCart;
window.cart = cart;

// --- Contact form validation (client-side only) ---
function wireContactForm(){
  const form = $("form[data-contact]");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();

    const errors = [];
    if(name.length < 2) errors.push("Please enter your full name.");
    if(!/^\+?\d[\d\s\-]{7,}$/.test(phone)) errors.push("Enter a valid contact number.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email address.");
    if(msg.length < 10) errors.push("Message should be at least 10 characters.");

    const out = $("#formMessages");
    if(errors.length){
      out.textContent = errors.join(" ");
      out.style.color = "crimson";
      return;
    }
    // Simulate submit
    const submissions = JSON.parse(localStorage.getItem("bh_messages")||"[]");
    submissions.push({name, phone, email, msg, ts: Date.now()});
    localStorage.setItem("bh_messages", JSON.stringify(submissions));
    out.textContent = "Thanks! Your message has been sent.";
    out.style.color = "green";
    form.reset();
  });
}

// --- Init on DOM ready ---
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  renderProductsPage();
  wireContactForm();
  renderCart();
});
