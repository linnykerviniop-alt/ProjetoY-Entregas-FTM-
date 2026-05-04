// ─── STATE ───
let currentUser = null;
let currentPage = 'home';
let mapInstance = null;
let partnerMarker = null;
let routeLine = null;
let mapInitialized = false;
let partnerOnline = false;
let selectedRating = 0;

// ─── UTILS ───
function $(id) { return document.getElementById(id); }
function showToast(msg, type='success') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = type;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
function closeModal(id) {
  $(id).classList.remove('show');
}
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  $(`page-${page}`).classList.add('active');
  $(`nav-${page}`).classList.add('active');
  currentPage = page;
  if (page === 'tracking' && !mapInitialized) initMap();
}

// ─── AUTH ───
function setAuthType(type) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[onclick="setAuthType('${type}')"]`).classList.add('active');
  $('login-form').classList.toggle('hidden', type !== 'login');
  $('register-form').classList.toggle('hidden', type === 'login');
}
function doLogin() {
  const email = $('login-email').value;
  const pass = $('login-pass').value;
  const type = $('login-type').value;
  if (!email || !pass) return showToast('Preencha todos os campos', 'error');
  currentUser = { email, type, name: type === 'client' ? 'Cliente Demo' : 'Parceiro Demo', avatar: null };
  document.body.classList.toggle('is-partner', type === 'partner');
  $('home-username').textContent = currentUser.name;
  $('topbar-avatar').textContent = currentUser.name[0].toUpperCase();
  $('profile-name-display').textContent = currentUser.name;
  $('profile-type-display').textContent = type === 'client' ? 'Cliente' : 'Parceiro';
  $('home-type-badge').textContent = type === 'client' ? 'Cliente' : 'Parceiro';
  loadUserData();
  $('auth-screen').classList.add('hide');
  setTimeout(() => {
    $('auth-screen').style.display = 'none';
    $('app').classList.add('show');
    $('splash').classList.add('hide');
    setTimeout(() => $('splash').style.display = 'none', 600);
  }, 400);
}
function doRegister() {
  const name = $('reg-name').value;
  const email = $('reg-email').value;
  const phone = $('reg-phone').value;
  const pass = $('reg-pass').value;
  const type = $('reg-type').value;
  if (!name || !email || !phone || !pass) return showToast('Preencha todos os campos', 'error');
  currentUser = { name, email, phone, type, avatar: null };
  document.body.classList.toggle('is-partner', type === 'partner');
  $('home-username').textContent = currentUser.name;
  $('topbar-avatar').textContent = currentUser.name[0].toUpperCase();
  $('profile-name-display').textContent = currentUser.name;
  $('profile-type-display').textContent = type === 'client' ? 'Cliente' : 'Parceiro';
  $('home-type-badge').textContent = type === 'client' ? 'Cliente' : 'Parceiro';
  loadUserData();
  $('auth-screen').classList.add('hide');
  setTimeout(() => {
    $('auth-screen').style.display = 'none';
    $('app').classList.add('show');
    $('splash').classList.add('hide');
    setTimeout(() => $('splash').style.display = 'none', 600);
  }, 400);
}
function doLogout() {
  currentUser = null;
  document.body.classList.remove('is-partner');
  $('app').classList.remove('show');
  $('auth-screen').style.display = 'flex';
  $('auth-screen').classList.remove('hide');
  $('splash').style.display = 'flex';
  $('splash').classList.remove('hide');
  setTimeout(() => {
    $('login-email').value = 'cliente@demo.com';
    $('login-pass').value = '123456';
    $('reg-name').value = '';
    $('reg-email').value = '';
    $('reg-phone').value = '';
    $('reg-pass').value = '';
  }, 400);
}

// ─── USER DATA ───
function loadUserData() {
  // Mock data
  const deliveries = [
    { id: 'DEL-001', status: 'delivered', route: 'Rua das Flores, 123 → Av. Paulista, 1578', date: '15/04/2024', price: 'R$ 18,90', rating: 5 },
    { id: 'DEL-002', status: 'transit', route: 'Centro → Vila Madalena', date: '16/04/2024', price: 'R$ 12,50', rating: 0 },
    { id: 'DEL-003', status: 'cancelled', route: 'Pinheiros → Moema', date: '14/04/2024', price: 'R$ 25,00', rating: 0 }
  ];
  const stats = { deliveries: deliveries.length, km: 45, spent: 'R$ 56,40' };
  renderRecent(deliveries.slice(0, 3));
  renderHistory(deliveries);
  updateStats(stats);
  updateProfileFields();
}
function renderRecent(deliveries) {
  const list = $('recent-list');
  list.innerHTML = '';
  deliveries.forEach(d => {
    const card = document.createElement('div');
    card.className = 'delivery-card';
    card.onclick = () => goTo('tracking');
    card.innerHTML = `
      <div class="delivery-icon ${d.status}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${d.status === 'delivered' ? '<polyline points="20 6 9 17 4 12"/>' : d.status === 'transit' ? '<circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>' : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}
        </svg>
      </div>
      <div class="delivery-info">
        <div class="delivery-route">${d.route}</div>
        <div class="delivery-meta">${d.date} • ${d.status === 'delivered' ? 'Entregue' : d.status === 'transit' ? 'Em trânsito' : 'Cancelada'}</div>
      </div>
      <div class="delivery-price">${d.price}</div>
    `;
    list.appendChild(card);
  });
}
function renderHistory(deliveries) {
  const list = $('history-list');
  list.innerHTML = '';
  deliveries.forEach(d => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.onclick = () => goTo('tracking');
    card.innerHTML = `
      <div class="history-top">
        <div class="history-id">${d.id}</div>
        <div class="history-date">${d.date}</div>
        <div class="status-badge ${d.status}">${d.status === 'delivered' ? 'Entregue' : d.status === 'transit' ? 'Em trânsito' : 'Cancelada'}</div>
      </div>
      <div class="history-route">
        <div class="route-item"><div class="route-dot origin"></div><div class="route-addr">${d.route.split(' → ')[0]}</div></div>
        <div class="route-item"><div class="route-dot dest"></div><div class="route-addr">${d.route.split(' → ')[1]}</div></div>
      </div>
      <div class="history-footer">
        <div class="history-price">${d.price}</div>
        <div class="history-rating">
          ${[1,2,3,4,5].map(i => `<span class="star ${i <= d.rating ? 'lit' : 'dim'}" onclick="rateDelivery('${d.id}', ${i})">★</span>`).join('')}
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}
function updateStats(stats) {
  $('stat-deliveries').textContent = stats.deliveries;
  $('stat-km').textContent = stats.km;
  $('stat-spent').textContent = stats.spent;
  $('stat-spent-label').textContent = currentUser.type === 'partner' ? 'Ganho' : 'Gasto';
}
function updateProfileFields() {
  $('field-name').textContent = currentUser.name || '—';
  $('field-email').textContent = currentUser.email || '—';
  $('field-phone').textContent = currentUser.phone || '—';
  $('field-birth').textContent = currentUser.birth || '—';
  $('field-gender').textContent = currentUser.gender || '—';
}

// ─── REQUEST ───
function selectService(el, service) {
  document.querySelectorAll('.service-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  calcPrice();
}
function calcPrice() {
  const weight = parseFloat($('prod-weight').value) || 0;
  const size = $('prod-size').value;
  const service = document.querySelector('.service-opt.selected')?.getAttribute('data-service') || 'moto';
  let base = 5.90;
  let dist = 9.84;
  let extra = 0;
  if (service === 'cargo') { base += 2; extra += 2; }
  else if (service === 'express') { base += 1; dist += 2; }
  if (size === 'medium') extra += 1;
  else if (size === 'large') extra += 2;
  else if (size === 'xlarge') extra += 3;
  extra += weight * 0.5;
  const total = base + dist + extra;
  const fee = total * 0.1;
  const final = total + fee;
  $('price-main').textContent = `R$ ${final.toFixed(2).replace('.', ',')}`;
  $('pb-base').textContent = `R$ ${base.toFixed(2).replace('.', ',')}`;
  $('pb-dist').textContent = `R$ ${(dist).toFixed(2).replace('.', ',')}`;
  $('pb-extra').textContent = `R$ ${extra.toFixed(2).replace('.', ',')}`;
  $('pb-fee').textContent = `R$ ${fee.toFixed(2).replace('.', ',')}`;
}
function confirmRequest() {
  const origin = $('addr-origin').value;
  const dest = $('addr-dest').value;
  if (!origin || !dest) return showToast('Preencha os endereços', 'error');
  showToast('Solicitação enviada! Aguardando parceiro...', 'success');
  goTo('tracking');
}

// ─── MAP ───
function initMap() {
  if (mapInitialized) return;
  mapInstance = L.map('map').setView([-23.5505, -46.6333], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);
  partnerMarker = L.marker([-23.5505, -46.6333]).addTo(mapInstance)
    .bindPopup('Parceiro Ricardo M.<br>Honda CG 160 • ABC-1234');
  routeLine = L.polyline([
    [-23.5505, -46.6333],
    [-23.5615, -46.6433],
    [-23.5715, -46.6533]
  ], {color: '#E8FF47'}).addTo(mapInstance);
  mapInitialized = true;
}

// ─── PROFILE ───
function openEditModal(field) {
  const modal = $('edit-modal');
  const title = $('edit-modal-title');
  const body = $('edit-modal-body');
  title.textContent = `Editar ${field === 'name' ? 'Nome' : field === 'email' ? 'E-mail' : field === 'phone' ? 'Telefone' : field === 'birth' ? 'Data de Nascimento' : 'Gênero'}`;
  body.innerHTML = `
    <div class="edit-field-group">
      <label>${field === 'name' ? 'Nome Completo' : field === 'email' ? 'E-mail' : field === 'phone' ? 'Telefone' : field === 'birth' ? 'Data de Nascimento' : 'Gênero'}</label>
      ${field === 'gender' ? `
        <select id="edit-value">
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
        </select>
      ` : `<input type="${field === 'email' ? 'email' : field === 'phone' ? 'tel' : field === 'birth' ? 'date' : 'text'}" id="edit-value" value="${currentUser[field] || ''}">`}
    </div>
  `;
  modal.classList.add('show');
}
function saveEditModal() {
  const value = $('edit-value').value;
  if (!value) return showToast('Campo obrigatório', 'error');
  const field = $('edit-modal-title').textContent.split(' ')[1].toLowerCase();
  currentUser[field] = value;
  updateProfileFields();
  closeModal('edit-modal');
  showToast('Perfil atualizado!', 'success');
}
function updateAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    currentUser.avatar = e.target.result;
    $('profile-avatar-display').innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    $('topbar-avatar').innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
  };
  reader.readAsDataURL(file);
}

// ─── RATING ───
function setRating(rating) {
  selectedRating = rating;
  document.querySelectorAll('.rating-star').forEach((s, i) => {
    s.classList.toggle('selected', i < rating);
    s.classList.toggle('hover', i < rating);
  });
}
function submitRating() {
  if (!selectedRating) return showToast('Selecione uma avaliação', 'error');
  const comment = $('rating-comment').value;
  showToast('Avaliação enviada! Obrigado.', 'success');
  closeModal('rating-modal');
  selectedRating = 0;
  $('rating-comment').value = '';
}

// ─── PARTNER ───
function togglePartnerStatus() {
  partnerOnline = !partnerOnline;
  const toggle = $('partner-toggle');
  const text = $('partner-status-text');
  toggle.classList.toggle('on', partnerOnline);
  text.textContent = partnerOnline ? 'Online' : 'Offline';
  if (partnerOnline) {
    showToast('Você está online! Recebendo solicitações...', 'success');
    setTimeout(() => showRequestAlert(), 2000);
  } else {
    showToast('Você está offline.', 'success');
  }
}
function showRequestAlert() {
  if (!partnerOnline) return;
  $('request-alert').classList.remove('hidden');
  let time = 15;
  const timer = $('req-timer');
  const interval = setInterval(() => {
    time--;
    timer.textContent = time;
    if (time <= 0) {
      clearInterval(interval);
      $('request-alert').classList.add('hidden');
    }
  }, 1000);
}
function acceptRequest() {
  $('request-alert').classList.add('hidden');
  showToast('Solicitação aceita! Vá para o local de coleta.', 'success');
  goTo('tracking');
}
function declineRequest() {
  $('request-alert').classList.add('hidden');
  showToast('Solicitação recusada.', 'success');
}

// ─── FILTERS ───
function filterHistory(chip, filter) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const cards = document.querySelectorAll('.history-card');
  cards.forEach(card => {
    const status = card.querySelector('.status-badge').classList[1];
    card.style.display = filter === 'all' || status === filter ? 'block' : 'none';
  });
}

// ─── INIT ───
window.onload = () => {
  setTimeout(() => {
    $('splash').classList.add('hide');
    setTimeout(() => {
      $('splash').style.display = 'none';
      $('auth-screen').style.display = 'flex';
    }, 600);
  }, 2000);
  calcPrice();
};