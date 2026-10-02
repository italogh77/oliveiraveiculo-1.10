let veiculos = [
  { id:1, tag:"Novidade", marca:"CHEVROLET", modelo:"Onix 1.0 Turbo LT", ano:"2023/2024", km:18400, cambio:"Automático", combustivel:"Flex", preco:78900, foto:"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=900&auto=format&fit=crop" },
  { id:2, tag:"Blindado", marca:"JEEP", modelo:"Compass Limited", ano:"2022/2022", km:41200, cambio:"Automático", combustivel:"Flex", preco:139900, foto:"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=900&auto=format&fit=crop" },
  { id:3, tag:"Único dono", marca:"TOYOTA", modelo:"Corolla XEi 2.0", ano:"2021/2021", km:52000, cambio:"Automático", combustivel:"Flex", preco:112500, foto:"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=900&auto=format&fit=crop" },
  { id:4, tag:"Novidade", marca:"HYUNDAI", modelo:"HB20 Comfort", ano:"2023/2023", km:9800, cambio:"Manual", combustivel:"Flex", preco:69900, foto:"https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=900&auto=format&fit=crop" },
  { id:5, tag:"4x4", marca:"TOYOTA", modelo:"Hilux SRV 2.8", ano:"2020/2021", km:67300, cambio:"Automático", combustivel:"Diesel", preco:219900, foto:"https://images.unsplash.com/photo-1622551511144-1eb314c22b17?q=80&w=900&auto=format&fit=crop" },
  { id:6, tag:"Econômico", marca:"FIAT", modelo:"Mobi Like 1.0", ano:"2022/2022", km:24700, cambio:"Manual", combustivel:"Flex", preco:52900, foto:"https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=900&auto=format&fit=crop" },
];

const favoritos = new Set();
const fmtPreco = n => "R$ " + n.toLocaleString('pt-BR');
const fmtKm = n => n.toLocaleString('pt-BR') + " km";
const STORAGE_KEY = 'oliveira-veiculos-estoque';
const INTERESSE_KEY = 'oliveira-veiculos-interesse';
const SHEET_URL_KEY = 'oliveira-veiculos-sheeturl';

let interesse = {};
let sheetUrl = '';

// ===== Persistência =====
async function salvarEstoque(){
  try { if (window.storage) await window.storage.set(STORAGE_KEY, JSON.stringify(veiculos), true); }
  catch(e){ console.warn(e); }
}
async function carregarEstoque(){
  try {
    if (window.storage){
      const r = await window.storage.get(STORAGE_KEY, true);
      if (r && r.value) veiculos = JSON.parse(r.value);
      else await salvarEstoque();
    }
  } catch(e){ console.warn(e); }
}
async function salvarInteresse(){
  try { if (window.storage) await window.storage.set(INTERESSE_KEY, JSON.stringify(interesse), true); }
  catch(e){ console.warn(e); }
}
async function carregarInteresse(){
  try {
    if (window.storage){
      const r = await window.storage.get(INTERESSE_KEY, true);
      if (r && r.value) interesse = JSON.parse(r.value);
    }
  } catch(e){}
}
async function carregarSheetUrl(){
  try {
    if (window.storage){
      const r = await window.storage.get(SHEET_URL_KEY, false);
      if (r && r.value) sheetUrl = r.value;
    }
  } catch(e){}
}
async function salvarSheetUrl(url){
  sheetUrl = url;
  try { if (window.storage) await window.storage.set(SHEET_URL_KEY, url, false); }
  catch(e){ console.warn(e); }
}

function enviarParaPlanilha(action, payload){
  if (!sheetUrl) return;
  fetch(sheetUrl, { method: 'POST', body: JSON.stringify({ action, ...payload }) })
    .catch(err => console.warn(err));
}

function registrarInteresse(v, tipo){
  if (!interesse[v.id]) interesse[v.id] = { views: 0, whats: 0 };
  interesse[v.id][tipo]++;
  salvarInteresse();
  enviarParaPlanilha('registrarInteresse', { veiculo: `${v.marca} ${v.modelo}`, tipo });
}

// ===== Lógica de UI Principal =====
const grid = document.getElementById('vehicle-grid');
const countEl = document.getElementById('f-count');
const marcaSelect = document.getElementById('f-marca');

function atualizarFiltroMarcas(){
  if (!marcaSelect) return;
  const atual = marcaSelect.value;
  marcaSelect.innerHTML = '<option value="">Selecione uma opção</option>';
  [...new Set(veiculos.map(v => v.marca))].sort().forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m;
    marcaSelect.appendChild(opt);
  });
  marcaSelect.value = atual;
}

function cardHtml(v){
  const isFav = favoritos.has(v.id);
  return `
  <div class="card card-light" data-id="${v.id}">
    <div class="card-photo" data-open="${v.id}">
      <img src="${v.foto}" alt="${v.marca} ${v.modelo}">
      <div class="fav-btn ${isFav ? 'active' : ''}" data-fav="${v.id}" style="color: #fff; background: rgba(0,0,0,0.4); border:none;">${isFav ? '♥' : '♡'}</div>
    </div>
    <div class="card-body">
      <div class="card-title">${v.marca} ${v.modelo}</div>
      <div class="spec-inline">
        <span>${fmtKm(v.km)}</span>
        <span class="divider">|</span>
        <span>${v.ano}</span>
        <span class="divider">|</span>
        <span>${v.cambio}</span>
      </div>
      <div class="card-price">${fmtPreco(v.preco)}</div>
      <div class="btn-red" data-open="${v.id}">Simular</div>
      <a class="link-atendente" data-whats="${v.id}" href="https://wa.me/5521900000000?text=Tenho%20interesse%20no%20${encodeURIComponent(v.modelo)}">Falar com um atendente</a>
    </div>
  </div>`;
}

function applyFilters(){
  if (!grid) return;
  const search = document.getElementById('f-search').value.trim().toLowerCase();
  const marca = document.getElementById('f-marca').value;
  const cambio = document.getElementById('f-cambio').value;
  const precoRange = document.getElementById('f-preco').value;
  const ordenar = document.getElementById('f-ordenar').value;

  let lista = veiculos.filter(v => {
    const texto = (v.marca + " " + v.modelo).toLowerCase();
    if (search && !texto.includes(search)) return false;
    if (marca && v.marca !== marca) return false;
    if (cambio && v.cambio !== cambio) return false;
    if (precoRange){
      const [min, max] = precoRange.split('-').map(Number);
      if (v.preco < min || v.preco > max) return false;
    }
    return true;
  });

  if (ordenar === 'preco-asc') lista.sort((a,b) => a.preco - b.preco);
  if (ordenar === 'preco-desc') lista.sort((a,b) => b.preco - a.preco);
  if (ordenar === 'km-asc') lista.sort((a,b) => a.km - b.km);

  render(lista);
}

function render(lista){
  if (!grid) return;
  grid.innerHTML = lista.length ? lista.map(cardHtml).join('') : `<div class="empty-state">Nenhum veículo encontrado.</div>`;
  if (countEl) countEl.textContent = `${lista.length} veículo(s) encontrado(s)`;
  attachCardEvents();
}

function attachCardEvents(){
  document.querySelectorAll('[data-fav]').forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); toggleFav(Number(el.dataset.fav)); applyFilters(); });
  });
  document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', () => openModal(Number(el.dataset.open)));
  });
  document.querySelectorAll('[data-whats]').forEach(el => {
    el.addEventListener('click', () => {
      const v = veiculos.find(x => x.id === Number(el.dataset.whats));
      if (v) registrarInteresse(v, 'whats');
    });
  });
}

function toggleFav(id){
  if (favoritos.has(id)) favoritos.delete(id); else favoritos.add(id);
  const favCount = document.getElementById('fav-count');
  if (favCount) favCount.textContent = favoritos.size;
}

// Eventos de filtro
['f-search','f-marca','f-cambio','f-preco','f-ordenar'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', applyFilters);
});

const btnClear = document.getElementById('f-clear');
if (btnClear){
  btnClear.addEventListener('click', () => {
    document.getElementById('f-search').value = '';
    document.getElementById('f-marca').value = '';
    document.getElementById('f-cambio').value = '';
    document.getElementById('f-preco').value = '';
    document.getElementById('f-ordenar').value = '';
    applyFilters();
  });
}

// Modal de detalhes dinâmico
const detailBackdrop = document.createElement('div');
detailBackdrop.className = 'modal-backdrop';
detailBackdrop.id = 'modal-backdrop';
detailBackdrop.innerHTML = `
  <div class="modal">
    <div class="modal-photo"><img id="modal-img" src="" alt=""></div>
    <div class="modal-body">
      <button class="modal-close" id="modal-close">✕</button>
      <div class="card-make" id="modal-make"></div>
      <div class="card-model" id="modal-model"></div>
      <div class="spec-sheet" id="modal-specs"></div>
      <div class="card-price" id="modal-price"></div>
      <p class="modal-note">Revisado, com laudo cautelar e histórico verificado. Aceita veículo na troca.</p>
      <div class="card-actions">
        <button class="btn btn-outline" id="modal-fav">♡ Favoritar</button>
        <a class="btn btn-primary" id="modal-whats" href="#">Falar no WhatsApp</a>
      </div>
    </div>
  </div>`;
document.body.appendChild(detailBackdrop);

function openModal(id){
  const v = veiculos.find(x => x.id === id);
  if (!v) return;
  document.getElementById('modal-img').src = v.foto;
  document.getElementById('modal-make').textContent = v.marca;
  document.getElementById('modal-model').textContent = v.modelo;
  document.getElementById('modal-price').textContent = fmtPreco(v.preco);
  document.getElementById('modal-specs').innerHTML = `
    <div class="spec-row"><span>Ano</span><b>${v.ano}</b></div>
    <div class="spec-row"><span>KM</span><b>${fmtKm(v.km)}</b></div>
    <div class="spec-row"><span>Câmbio</span><b>${v.cambio}</b></div>
    <div class="spec-row"><span>Combustível</span><b>${v.combustivel}</b></div>
  `;
  const whats = document.getElementById('modal-whats');
  whats.href = `https://wa.me/5521900000000?text=Tenho%20interesse%20no%20${encodeURIComponent(v.modelo)}`;
  whats.onclick = () => registrarInteresse(v, 'whats');
  
  const favBtn = document.getElementById('modal-fav');
  favBtn.textContent = favoritos.has(id) ? '♥ Favoritado' : '♡ Favoritar';
  favBtn.onclick = () => { toggleFav(id); favBtn.textContent = favoritos.has(id) ? '♥ Favoritado' : '♡ Favoritar'; applyFilters(); };
  
  detailBackdrop.classList.add('open');
  registrarInteresse(v, 'views');
}
document.getElementById('modal-close').addEventListener('click', () => detailBackdrop.classList.remove('open'));
detailBackdrop.addEventListener('click', e => { if (e.target === detailBackdrop) detailBackdrop.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') detailBackdrop.classList.remove('open'); });

// Controle do Menu Mobile e Favoritos do Header
const favPill = document.getElementById('fav-pill');
let showingFavOnly = false;
if (favPill){
  favPill.addEventListener('click', () => {
    if (!grid) { window.location.href = 'estoque.html'; return; }
    showingFavOnly = !showingFavOnly;
    if (showingFavOnly) render(veiculos.filter(v => favoritos.has(v.id)));
    else applyFilters();
  });
}

const menuBtn = document.getElementById('menu-btn');
const mobileNav = document.getElementById('mobile-nav');
if (menuBtn && mobileNav){
  menuBtn.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
}

// Formulário de Contato
const contactForm = document.getElementById('contact-form');
if (contactForm){
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('form-msg').classList.add('show');
    e.target.reset();
  });
}

// Destaque do menu ativo via URL
const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a, .mobile-nav a').forEach(a => {
  if (a.getAttribute('href') === path) a.classList.add('active');
});

// ===== ÁREA DA EQUIPE =====
const TEAM_PASSWORD = 'equipe2026';
const pwBackdrop2 = document.getElementById('pw-backdrop');
const adminOverlay = document.getElementById('admin-overlay');
const photoInput = document.getElementById('photo-input');
let nextId = 100;
let photoTargetId = null;

if (document.getElementById('team-link')){
  document.getElementById('team-link').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-error').classList.remove('show');
    pwBackdrop2.classList.add('open');
    document.getElementById('pw-input').focus();
  });
}

if (document.getElementById('pw-cancel')) document.getElementById('pw-cancel').addEventListener('click', () => pwBackdrop2.classList.remove('open'));
if (pwBackdrop2) pwBackdrop2.addEventListener('click', e => { if (e.target === pwBackdrop2) pwBackdrop2.classList.remove('open'); });

function tryEnter(){
  const val = document.getElementById('pw-input').value;
  if (val === TEAM_PASSWORD){
    pwBackdrop2.classList.remove('open');
    adminOverlay.classList.add('open');
    document.getElementById('sheet-url').value = sheetUrl;
    renderAdmin();
    renderDashboard();
  } else {
    document.getElementById('pw-error').classList.add('show');
  }
}

if (document.getElementById('pw-enter')) document.getElementById('pw-enter').addEventListener('click', tryEnter);
if (document.getElementById('pw-input')) document.getElementById('pw-input').addEventListener('keydown', e => { if (e.key === 'Enter') tryEnter(); });
if (document.getElementById('admin-exit')) document.getElementById('admin-exit').addEventListener('click', () => adminOverlay.classList.remove('open'));

document.querySelectorAll('.admin-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-estoque').style.display = btn.dataset.tab === 'estoque' ? 'block' : 'none';
    document.getElementById('tab-dash').style.display = btn.dataset.tab === 'dash' ? 'block' : 'none';
    if (btn.dataset.tab === 'dash') renderDashboard();
  });
});

if (document.getElementById('sheet-url')) document.getElementById('sheet-url').addEventListener('change', e => salvarSheetUrl(e.target.value.trim()));
if (document.getElementById('sync-estoque')){
  document.getElementById('sync-estoque').addEventListener('click', () => {
    if (!sheetUrl){ document.getElementById('sync-status').textContent = 'Cole a URL da planilha primeiro.'; return; }
    enviarParaPlanilha('salvarEstoque', { veiculos });
    document.getElementById('sync-status').textContent = 'Enviado ✓';
  });
}

function adminRowHtml(v){
  return `
  <div class="admin-row" data-admin-id="${v.id}">
    <div class="admin-thumb" data-change-photo="${v.id}">
      <img src="${v.foto}" alt="">
      <div class="admin-thumb-overlay">Trocar foto</div>
    </div>
    <div class="admin-fields">
      <div><label>Marca / Modelo</label><input type="text" value="${v.marca} ${v.modelo}" data-field="nome" data-id="${v.id}"></div>
      <div><label>Preço (R$)</label><input type="number" value="${v.preco}" data-field="preco" data-id="${v.id}"></div>
      <div><label>KM</label><input type="number" value="${v.km}" data-field="km" data-id="${v.id}"></div>
      <div><label>Etiqueta</label><input type="text" value="${v.tag}" data-field="tag" data-id="${v.id}"></div>
    </div>
    <div class="admin-actions">
      <button class="admin-del" data-del="${v.id}">Remover</button>
      <span class="admin-save-hint">Salvo ✓</span>
    </div>
  </div>`;
}

function renderAdmin(){
  const adminList = document.getElementById('admin-list');
  if (!adminList) return;
  adminList.innerHTML = veiculos.map(adminRowHtml).join('');
  
  document.querySelectorAll('[data-change-photo]').forEach(el => {
    el.addEventListener('click', () => { photoTargetId = Number(el.dataset.changePhoto); photoInput.click(); });
  });
  
  document.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('change', async () => {
      const id = Number(el.dataset.id);
      const v = veiculos.find(x => x.id === id);
      if (!v) return;
      const field = el.dataset.field;
      if (field === 'nome'){
        const [marca, ...resto] = el.value.split(' ');
        v.marca = marca.toUpperCase();
        v.modelo = resto.join(' ');
      } else if (field === 'preco' || field === 'km'){ v[field] = Number(el.value) || 0; }
      else { v[field] = el.value; }
      
      atualizarFiltroMarcas();
      applyFilters();
      await salvarEstoque();
    });
  });
  
  document.querySelectorAll('[data-del]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = Number(el.dataset.del);
      const idx = veiculos.findIndex(x => x.id === id);
      if (idx > -1) veiculos.splice(idx, 1);
      renderAdmin(); atualizarFiltroMarcas(); applyFilters();
      await salvarEstoque();
    });
  });
}

if (photoInput){
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file || photoTargetId === null) return;
    const reader = new FileReader();
    reader.onload = async e => {
      const v = veiculos.find(x => x.id === photoTargetId);
      if (v){ v.foto = e.target.result; renderAdmin(); applyFilters(); await salvarEstoque(); }
      photoInput.value = '';
    };
    reader.readAsDataURL(file);
  });
}

if (document.getElementById('admin-add')){
  document.getElementById('admin-add').addEventListener('click', async () => {
    nextId = Math.max(nextId, ...veiculos.map(v => v.id)) + 1;
    veiculos.push({ id: nextId, tag:"Novo", marca:"MARCA", modelo:"Modelo", ano:"2024/2024", km:0, cambio:"Manual", combustivel:"Flex", preco:0, foto:"https://images.unsplash.com/photo-1494905998402-395d579af36f?q=80&w=900&auto=format&fit=crop" });
    renderAdmin(); atualizarFiltroMarcas(); applyFilters();
    await salvarEstoque();
  });
}

function renderDashboard(){
  if (!document.getElementById('dash-summary')) return;
  let totalViews = 0, totalWhats = 0, top = null;
  veiculos.forEach(v => {
    const i = interesse[v.id] || { views:0, whats:0 };
    totalViews += i.views; totalWhats += i.whats;
    if (!top || i.views > (interesse[top.id]?.views || 0)) top = v;
  });
  document.getElementById('dash-summary').innerHTML = `
    <div class="dash-card"><div class="num">${totalViews}</div><div class="label">Total Views</div></div>
    <div class="dash-card"><div class="num">${totalWhats}</div><div class="label">WhatsApp</div></div>
    <div class="dash-card"><div class="num" style="font-size:16px;">${top ? top.marca+' '+top.modelo : '—'}</div><div class="label">Mais Visto</div></div>
  `;
  const maxViews = Math.max(1, ...veiculos.map(v => (interesse[v.id]?.views || 0)));
  document.getElementById('dash-body').innerHTML = veiculos
    .slice()
    .sort((a,b) => (interesse[b.id]?.views||0) - (interesse[a.id]?.views||0))
    .map(v => {
      const i = interesse[v.id] || { views:0, whats:0 };
      const pct = Math.round((i.views / maxViews) * 100);
      return `<tr>
        <td>${v.marca} ${v.modelo}</td>
        <td>${i.views}<div class="dash-bar"><div class="dash-bar-fill" style="width:${pct}%"></div></div></td>
        <td>${i.whats}</td>
      </tr>`;
    }).join('');
}

// ===== Inicialização Segura =====
(async () => {
  await carregarEstoque();
  await carregarInteresse();
  await carregarSheetUrl();
  
  if (grid) {
    atualizarFiltroMarcas();
    applyFilters();
  } else {
    const favCount = document.getElementById('fav-count');
    if (favCount) favCount.textContent = favoritos.size;
  }
})();