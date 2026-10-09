
const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

const logoSlides = document.querySelectorAll('.logo-slide');
if (logoSlides.length > 1) {
  let logoIndex = Math.floor(Math.random() * logoSlides.length);
  logoSlides.forEach(slide => slide.classList.remove('active'));
  logoSlides[logoIndex].classList.add('active');

  setInterval(() => {
    logoSlides[logoIndex].classList.remove('active');
    logoIndex = (logoIndex + 1) % logoSlides.length;
    logoSlides[logoIndex].classList.add('active');
  }, 3000);
}

const CART_KEY = 'igiaed_cart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = readCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = count > 0 ? count : '';
  });
}

function addToCart(product) {
  const cart = readCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
}

function changeQty(id, delta) {
  const cart = readCart();
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.qty += delta;
  const newCart = cart.filter(item => item.qty > 0);
  saveCart(newCart);
  renderCart();
}

function removeItem(id) {
  const cart = readCart().filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function cartText() {
  const cart = readCart();
  if (!cart.length) return 'Ostukorv on tühi.';
  return cart.map(item => `${item.name} (${item.amount || ''}) x ${item.qty}${item.price ? ' = ' + (item.price * item.qty).toFixed(2).replace('.', ',') + ' €' : ''}`).join('\n');
}

function renderCart() {
  const container = document.querySelector('#cart-items');
  if (!container) return;

  const cart = readCart();

  if (!cart.length) {
    container.innerHTML = '<div class="cart-empty">Ostukorv on tühi.</div>';
    return;
  }

  const total = cart.reduce((sum, item) => sum + ((item.price || 0) * item.qty), 0);

  container.innerHTML = cart.map(item => {
    const price = item.price ? `${item.price.toFixed(2).replace('.', ',')} €` : 'Hind lisamisel';
    const subtotal = item.price ? `${(item.price * item.qty).toFixed(2).replace('.', ',')} €` : '';
    return `
    <div class="cart-row">
      <div>
        <div class="cart-row-title">${item.name}</div>
        <div class="cart-row-meta">${item.amount ? item.amount + ' · ' : ''}${price}${subtotal ? ' · kokku ' + subtotal : ''}</div>
      </div>
      <div class="cart-qty">
        <button class="qty-btn" data-qty-minus="${item.id}">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-qty-plus="${item.id}">+</button>
      </div>
      <button class="remove-btn" data-remove-item="${item.id}">Eemalda</button>
    </div>
  `}).join('') + `<div class="cart-total"><strong>Kokku:</strong> ${total.toFixed(2).replace('.', ',')} €</div>`;
}

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add-to-cart]');
  if (addButton) {
    const product = {
      id: addButton.dataset.productId,
      name: addButton.dataset.productName,
      price: parseFloat(addButton.dataset.productPrice || '0'),
      amount: addButton.dataset.productAmount || '',
    };
    addToCart(product);
    const oldText = addButton.textContent;
    addButton.textContent = 'Lisatud';
    setTimeout(() => {
      addButton.textContent = oldText;
    }, 900);
  }

  const plus = event.target.closest('[data-qty-plus]');
  if (plus) changeQty(plus.dataset.qtyPlus, 1);

  const minus = event.target.closest('[data-qty-minus]');
  if (minus) changeQty(minus.dataset.qtyMinus, -1);

  const remove = event.target.closest('[data-remove-item]');
  if (remove) removeItem(remove.dataset.removeItem);

  if (event.target.closest('#clear-cart')) clearCart();

  if (event.target.closest('#copy-cart')) {
    navigator.clipboard.writeText(cartText()).then(() => {
      event.target.textContent = 'Kopeeritud';
      setTimeout(() => event.target.textContent = 'Kopeeri ostukorv', 1000);
    });
  }
});

updateCartCount();
renderCart();
