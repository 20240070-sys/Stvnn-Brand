// ===== رقم الواتساب (غيّره لرقمك بالكود الدولي بدون + أو أصفار، مثال مصر: 201012345678) =====
const WA_NUMBER = '201069388677';
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// ===== بيانات المنتجات =====
const SHAPES = {
  tee: 'M30 14 L10 28 L20 42 L28 37 V86 H72 V37 L80 42 L90 28 L70 14 Q50 26 30 14Z',
  hoodie: 'M34 10 Q50 24 66 10 L92 32 L84 64 L72 58 V88 H28 V58 L16 64 L8 32Z',
  pants: 'M30 8 H70 L75 92 H54 L50 38 L46 92 H25Z'
};

const PRODUCTS = [
  { id: 1, name: 'Heavy Tee Concrete', type: 'tee', label: 'تيشيرت أوفرسايز', price: 650, color: '#8A919E', tag: 'جديد' },
  { id: 2, name: 'Heavy Tee Cobalt', type: 'tee', label: 'تيشيرت أوفرسايز', price: 650, color: '#2B3FFF' },
  { id: 3, name: 'Core Hoodie Ink', type: 'hoodie', label: 'هودي قطن تقيل', price: 1450, color: '#1B1F27', tag: 'جديد' },
  { id: 4, name: 'Core Hoodie Stone', type: 'hoodie', label: 'هودي قطن تقيل', price: 1450, color: '#B7B2A8' },
  { id: 5, name: 'Wide Cargo Pants', type: 'pants', label: 'بنطلون واسع', price: 1200, color: '#4E5563' },
  { id: 6, name: 'Relaxed Pants Sand', type: 'pants', label: 'بنطلون ريلاكسد', price: 1100, color: '#C2B79F' },
  { id: 7, name: 'Boxy Tee White', type: 'tee', label: 'تيشيرت بوكسي', price: 590, color: '#F6F7F9' },
  { id: 8, name: 'Zip Hoodie Cobalt', type: 'hoodie', label: 'هودي بسحاب', price: 1650, color: '#2B3FFF', tag: 'كمية محدودة' }
];

// ===== أدوات مساعدة =====
const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString('ar-EG') + ' ج.م';
const svg = (p) =>
  `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${SHAPES[p.type]}" fill="${p.color}" stroke="#1B1F27" stroke-opacity=".25" stroke-width="1" stroke-linejoin="round"/></svg>`;

// ===== السلة =====
let cart = [];
try { cart = JSON.parse(localStorage.getItem('stvnn-cart')) || []; } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem('stvnn-cart', JSON.stringify(cart)); } catch (e) {} };

// ===== عرض المنتجات =====
function renderGrid(filter = 'all') {
  const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.type === filter);
  $('#grid').innerHTML = list.map((p) => `
    <article class="card">
      <div class="thumb">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
        ${svg(p)}
        <button class="add" data-add="${p.id}">أضف للسلة</button>
      </div>
      <div class="info">
        <div><h3>${p.name}</h3><small>${p.label}</small></div>
        <span class="price">${fmt(p.price)}</span>
      </div>
    </article>`).join('');
}

document.querySelectorAll('.chip').forEach((c) =>
  c.addEventListener('click', () => {
    document.querySelector('.chip.active').classList.remove('active');
    c.classList.add('active');
    renderGrid(c.dataset.f);
  })
);

$('#grid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]');
  if (!b) return;
  const id = +b.dataset.add;
  const found = cart.find((i) => i.id === id);
  found ? found.qty++ : cart.push({ id, qty: 1 });
  renderCart();
  toggleCart(true);
});

// ===== عرض السلة =====
function renderCart() {
  const box = $('#items');
  if (!cart.length) {
    box.innerHTML = '<p class="empty">السلة فاضية. اختار قطعة من الكولكشن.</p>';
  } else {
    box.innerHTML = cart.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return `
      <div class="row">
        <div class="mini">${svg(p)}</div>
        <div class="meta">
          <b>${p.name}</b>
          <span>${fmt(p.price * i.qty)}</span>
          <div class="qty">
            <button data-dec="${i.id}" aria-label="تقليل">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.id}" aria-label="زيادة">+</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }
  const total = cart.reduce((s, i) => s + PRODUCTS.find((x) => x.id === i.id).price * i.qty, 0);
  $('#total').textContent = fmt(total);
  $('#cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  save();
}

$('#items').addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  if (inc) cart.find((i) => i.id === +inc.dataset.inc).qty++;
  if (dec) {
    const it = cart.find((i) => i.id === +dec.dataset.dec);
    it.qty--;
    if (it.qty <= 0) cart = cart.filter((i) => i !== it);
  }
  if (inc || dec) renderCart();
});

function toggleCart(open) {
  $('#drawer').classList.toggle('on', open);
  $('#overlay').classList.toggle('on', open);
  $('#drawer').setAttribute('aria-hidden', !open);
}
$('#openCart').addEventListener('click', () => toggleCart(true));
$('#closeCart').addEventListener('click', () => toggleCart(false));
$('#overlay').addEventListener('click', () => toggleCart(false));
document.addEventListener('keydown', (e) => e.key === 'Escape' && toggleCart(false));

$('#checkout').addEventListener('click', () => {
  if (!cart.length) return;
  const lines = cart.map((i) => {
    const p = PRODUCTS.find((x) => x.id === i.id);
    return `• ${p.name} × ${i.qty} = ${p.price * i.qty} ج.م`;
  });
  const total = cart.reduce((s, i) => s + PRODUCTS.find((x) => x.id === i.id).price * i.qty, 0);
  const msg = `أهلاً stvnn، عايز أطلب:\n${lines.join('\n')}\nالإجمالي: ${total} ج.م`;
  window.open(waLink(msg), '_blank', 'noopener');
  cart = [];
  renderCart();
  toggleCart(false);
});

// زر الواتساب العائم + رابط الفوتر
$('#waFloat').href = waLink('أهلاً stvnn، عندي استفسار');
$('#waFooter').href = waLink('أهلاً stvnn، عندي استفسار');

// ===== النشرة البريدية =====
$('#newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  $('#nlMsg').textContent = 'تم الاشتراك. هنبعتلك أول ما الدروب الجديد ينزل.';
  e.target.reset();
});

renderGrid();
renderCart();
