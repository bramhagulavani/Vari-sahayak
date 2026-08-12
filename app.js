/* VariSahayak – app.js */
/* All data is session-only — reloading the page resets everything to defaults */

// ===== PAGE NAVIGATION =====
function showPage(pageId, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
  if (navEl) closeMenu();
  if (pageId === 'map') {
    // Defer init until the canvas has real layout dimensions
    requestAnimationFrame(() => { if (window.Map3D) Map3D.init(); });
  }
}

// ===== MAP VIEW TOGGLE (3D / 2D) =====
function setMapView(mode) {
  const wrap3d = document.getElementById('map3dWrap');
  const canvas2d = document.getElementById('mapCanvas');
  const btn3d = document.getElementById('vtBtn3D');
  const btn2d = document.getElementById('vtBtn2D');
  if (mode === '3d') {
    wrap3d.style.display = '';
    canvas2d.style.display = 'none';
    btn3d.classList.add('active');
    btn2d.classList.remove('active');
    requestAnimationFrame(() => { if (window.Map3D) Map3D.init(); });
  } else {
    wrap3d.style.display = 'none';
    canvas2d.style.display = '';
    btn2d.classList.add('active');
    btn3d.classList.remove('active');
  }
}

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('navLinks').classList.remove('open');
}

// ===== TABS =====
function switchTab(groupId, contentId, btn) {
  const group = document.getElementById(groupId);
  if (!group) return;
  // Deactivate all tabs in this group
  group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // Find sibling tab-content elements (parent's next siblings)
  const parent = group.parentElement;
  parent.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  const target = document.getElementById(contentId);
  if (target) target.classList.add('active');
}

// ===== TOAST =====
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== REGISTRATION =====
let regCounter = 6;
const allMembers = [
  { id: 'VS-2025-0001', name: 'Suresh Kale', role: 'Volunteer', area: 'Pune – Swargate', task: 'Crowd Management', status: 'active' },
  { id: 'VS-2025-0002', name: 'Dr. Anita More', role: 'Doctor / Medical', area: 'Pandharpur – Temple Zone', task: 'Medical Aid', status: 'active' },
  { id: 'VS-2025-0003', name: 'Constable Vivek Rane', role: 'Police Officer', area: 'Lonand', task: 'Security Patrol', status: 'active' },
  { id: 'VS-2025-0004', name: 'Priya Deshmukh', role: 'NGO Worker', area: 'Jejuri', task: 'Food & Water', status: 'on-duty' },
  { id: 'VS-2025-0005', name: 'Mahesh Shinde', role: 'Area Coordinator', area: 'Saswad', task: 'Route Guidance', status: 'off' },
];

function registerPerson() {
  const name = document.getElementById('reg-name').value.trim();
  const mobile = document.getElementById('reg-mobile').value.trim();
  const role = document.getElementById('reg-role').value;
  const area = document.getElementById('reg-area').value;
  const task = document.getElementById('reg-task').value;
  const org = document.getElementById('reg-org').value.trim();

  if (!name || !mobile || !role) {
    showToast('⚠️ Please fill in Name, Mobile, and Role.');
    return;
  }

  const newId = 'VS-2025-' + String(regCounter).padStart(4, '0');
  regCounter++;

  allMembers.push({ id: newId, name, role, area: area || '—', task: task || '—', status: 'active' });
  renderMemberTable(allMembers);

  const result = document.getElementById('reg-result');
  result.classList.remove('hidden');
  result.innerHTML = `
    <div style="background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:12px;padding:20px;margin-top:16px;max-width:500px">
      <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:12px">✅ Registration Successful!</div>
      <div style="font-size:14px;color:#374151;line-height:2">
        <b>ID Generated:</b> <code style="background:#E8EDF4;padding:2px 8px;border-radius:4px;font-weight:700">${newId}</code><br/>
        <b>Name:</b> ${name}<br/>
        <b>Role:</b> ${role}<br/>
        <b>Area:</b> ${area || 'Not assigned'}<br/>
        <b>Task:</b> ${task || 'Not assigned'}<br/>
        ${org ? '<b>Org:</b> ' + org + '<br/>' : ''}
      </div>
      <div style="margin-top:14px;font-size:13px;color:#64748B">🖨️ QR Badge will be printed at the registration desk. Check the "QR Badge Preview" tab to see a sample.</div>
    </div>
  `;

  // Clear form
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-mobile').value = '';
  document.getElementById('reg-role').value = '';
  document.getElementById('reg-area').value = '';
  document.getElementById('reg-task').value = '';
  document.getElementById('reg-org').value = '';

  showToast('✅ ' + name + ' registered with ID ' + newId);
}

function renderMemberTable(members) {
  const statusMap = { active: 'Active', 'on-duty': 'On Duty', off: 'Off Shift' };
  const tbody = document.getElementById('memberTableBody');
  if (!tbody) return;
  tbody.innerHTML = members.map(m => `
    <tr>
      <td>${m.id}</td>
      <td>${m.name}</td>
      <td>${m.role}</td>
      <td>${m.area}</td>
      <td>${m.task}</td>
      <td><span class="badge-status ${m.status}">${statusMap[m.status] || m.status}</span></td>
    </tr>
  `).join('');
}

function filterTable(role) {
  const filtered = role ? allMembers.filter(m => m.role === role) : allMembers;
  renderMemberTable(filtered);
}

function searchTable(q) {
  const lower = q.toLowerCase();
  const filtered = allMembers.filter(m => m.name.toLowerCase().includes(lower) || m.id.toLowerCase().includes(lower));
  renderMemberTable(filtered);
}

// ===== BULK CSV UPLOAD (real parsing) =====
let parsedCSVRows = [];   // holds parsed rows until user clicks Process

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  readCSVFile(file);
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if (!file) return;
  readCSVFile(file);
}

function readCSVFile(file) {
  if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
    showToast('⚠️ Please upload a .csv, .xlsx or .xls file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    parseCSV(text, file.name);
  };
  reader.readAsText(file);
}

function parseCSV(text, filename) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) { showToast('⚠️ CSV appears empty or has no data rows.'); return; }

  // Detect header row (skip it)
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const nameIdx   = header.findIndex(h => h.includes('name'));
  const mobileIdx = header.findIndex(h => h.includes('mobile') || h.includes('phone'));
  const roleIdx   = header.findIndex(h => h.includes('role'));
  const areaIdx   = header.findIndex(h => h.includes('area') || h.includes('zone'));
  const taskIdx   = header.findIndex(h => h.includes('task') || h.includes('speciali'));
  const orgIdx    = header.findIndex(h => h.includes('org') || h.includes('affil'));

  parsedCSVRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (!cols[nameIdx]) continue;  // skip empty rows
    parsedCSVRows.push({
      name:   cols[nameIdx]   || '—',
      mobile: cols[mobileIdx] || '—',
      role:   cols[roleIdx]   || 'Volunteer',
      area:   cols[areaIdx]   || '—',
      task:   cols[taskIdx]   || '—',
      org:    cols[orgIdx]    || '—',
    });
  }

  if (parsedCSVRows.length === 0) { showToast('⚠️ No valid rows found in file.'); return; }

  // Show preview — first 5 rows
  const preview5 = parsedCSVRows.slice(0, 5);
  const tbody = document.getElementById('bulk-table-body');
  tbody.innerHTML = preview5.map(r =>
    `<tr><td>${r.name}</td><td>${r.mobile}</td><td>${r.role}</td><td>${r.area}</td><td><span class="badge-status active">Ready</span></td></tr>`
  ).join('');

  // Update the process button label
  const processBtn = document.querySelector('#bulk-preview .btn-primary');
  if (processBtn) processBtn.textContent = `Process All ${parsedCSVRows.length} Records & Generate IDs`;

  document.getElementById('bulk-preview').classList.remove('hidden');
  showToast(`📂 "${filename}" loaded – ${parsedCSVRows.length} records found. Preview shows first 5.`);
}

function processBulk() {
  if (parsedCSVRows.length === 0) { showToast('⚠️ No data to process. Upload a file first.'); return; }

  const startId = regCounter;
  parsedCSVRows.forEach(row => {
    const newId = 'VS-2025-' + String(regCounter).padStart(4, '0');
    regCounter++;
    allMembers.push({
      id:     newId,
      name:   row.name,
      role:   row.role,
      area:   row.area,
      task:   row.task,
      status: 'active',
    });
  });

  renderMemberTable(allMembers);

  const endId = regCounter - 1;
  const count = parsedCSVRows.length;
  showToast(`✅ ${count} records processed! IDs VS-2025-${String(startId).padStart(4,'0')} → VS-2025-${String(endId).padStart(4,'0')}`);

  // Reset
  parsedCSVRows = [];
  document.getElementById('bulk-preview').classList.add('hidden');
  document.getElementById('excelFile').value = '';
}

function printBadge() { showToast('🖨️ Badge sent to printer!'); }
function downloadBadge() { showToast('⬇️ Badge PDF downloaded!'); }

// ===== DASHBOARD =====
function switchRole(role, btn) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const roleData = {
    admin:     { total: '12,430', active: '9,812', sos: '3', lf: '27' },
    doctor:    { total: '1,240', active: '1,140', sos: '1', lf: '4' },
    police:    { total: '1,720', active: '1,650', sos: '2', lf: '3' },
    ngo:       { total: '620', active: '590', sos: '0', lf: '8' },
    volunteer: { total: '8,430', active: '7,820', sos: '0', lf: '12' },
  };
  const d = roleData[role] || roleData.admin;
  document.getElementById('kpi-total').textContent = d.total;
  document.getElementById('kpi-active').textContent = d.active;
  document.getElementById('kpi-sos').textContent = d.sos;
  document.getElementById('kpi-lf').textContent = d.lf;
  showToast('Switched to ' + role.charAt(0).toUpperCase() + role.slice(1) + ' view');
}

function resolveAlert(btn) {
  const item = btn.closest('.alert-item');
  item.style.opacity = '0.5';
  btn.textContent = 'Done';
  btn.disabled = true;
  btn.className = 'btn-sm grey';
  showToast('✅ Alert resolved!');
}

// ===== MAP =====
const layerState = { volunteers: true, crowd: true, medical: true, route: true };

function toggleLayer(layer) {
  layerState[layer] = !layerState[layer];
  const visible = layerState[layer];

  // 2D SVG layers
  const layerMap = { volunteers: 'volunteers-layer', medical: 'medical-layer' };
  const id = layerMap[layer];
  if (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = visible ? '' : 'none';
  }
  if (layer === 'crowd') {
    ['crowd-lonand','crowd-pandharpur','crowd-jejuri'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = visible ? '' : 'none';
    });
  }
  if (layer === 'route') {
    const el = document.querySelector('.route-path');
    if (el) el.style.display = visible ? '' : 'none';
  }

  // 3D layers
  if (window.Map3D) Map3D.setLayer(layer, visible);
}

function selectCheckpoint(el, name, flow, status, volunteers) {
  document.querySelectorAll('.cp-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  if (window.Map3D) Map3D.focusCheckpoint(name);

  const box = document.getElementById('mapInfoBox');
  document.getElementById('infoBoxTitle').textContent = '📍 ' + name;
  const statusColor = status === 'Normal' ? '#2DC653' : status.includes('CRITICAL') ? '#E74C3C' : '#F5A623';
  document.getElementById('infoBoxContent').innerHTML = `
    <div style="line-height:2;font-size:13px">
      <b>Pilgrim Flow:</b> ${flow || '—'} pilgrims/hr<br/>
      <b>Status:</b> <span style="color:${statusColor};font-weight:700">${status || '—'}</span><br/>
      <b>On Ground:</b> ${volunteers || '—'}<br/>
    </div>
    <div style="margin-top:10px;display:flex;gap:8px">
      <button class="btn-sm blue" onclick="showToast('Team dispatched to ${name}')">Dispatch Team</button>
      <button class="btn-sm orange" onclick="showToast('Alert sent for ${name}')">Send Alert</button>
    </div>
  `;
  box.style.display = 'block';
}

// ===== COMMUNICATION =====
let currentChannel = 'all-hands';
const channelMessages = {
  'all-hands': [
    { type: 'sys', text: '📢 All hands channel – broadcasts go to all registered users.' },
    { type: 'received', avatar: 'SC', sender: 'Suresh Kale · Pune Zone', text: 'Crowd is building up near Swargate. Requesting 2 more volunteers.', time: '10:42 AM' },
    { type: 'sent', sender: 'You · Admin', text: 'Assigning Batch 7 – 3 volunteers dispatched to Swargate junction.', time: '10:43 AM' },
    { type: 'alert', text: '🆘 SOS ALERT: Medical emergency at Lonand Bridge. VS-0087 activated SOS.' },
    { type: 'received', avatar: 'AM', sender: 'Dr. Anita More · Medical', text: 'Medical team dispatched. ETA 4 minutes.', time: '10:51 AM' },
  ],
  'medical': [
    { type: 'sys', text: '🚑 Medical Team channel – for doctors, nurses, and paramedics.' },
    { type: 'received', avatar: 'AM', sender: 'Dr. Anita More', text: 'Camp 5 running low on ORS packets. Need resupply urgently.', time: '11:02 AM' },
    { type: 'sent', sender: 'You · Admin', text: 'Resupply truck dispatched. ETA 20 minutes to Camp 5.', time: '11:04 AM' },
  ],
  'police': [
    { type: 'sys', text: '👮 Police channel – for security and patrol teams.' },
    { type: 'received', avatar: 'VR', sender: 'Constable Vivek Rane', text: 'Suspicious gathering near Lonand bridge. Sending 2 officers to investigate.', time: '10:55 AM' },
  ],
  'pandharpur': [
    { type: 'sys', text: '🏛️ Pandharpur Zone – Entry & Temple teams.' },
    { type: 'alert', text: '🆘 SOS ACTIVE: Critical crowd at Pandharpur Entry Gate. All teams respond.' },
    { type: 'received', avatar: 'PD', sender: 'Priya Deshmukh · NGO', text: 'Setting up overflow holding area at Sector 7. Can accommodate 5,000.', time: '10:53 AM' },
  ],
  'lonand': [
    { type: 'sys', text: '📍 Lonand Zone – km 140 to 155.' },
    { type: 'received', avatar: 'MS', sender: 'Mahesh Shinde · Coordinator', text: 'Bridge density at 93%. Requesting diversion assistance.', time: '10:48 AM' },
    { type: 'sent', sender: 'You · Admin', text: 'AI diversion activated via Natepute bypass. Reducing inflow by 30%.', time: '10:49 AM' },
  ],
};

function selectChannel(el, channelId) {
  document.querySelectorAll('.channel-item').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  currentChannel = channelId;
  const names = { 'all-hands': '📢 All Hands', medical: '🚑 Medical Team', police: '👮 Police', pandharpur: '🏛️ Pandharpur Zone', lonand: '📍 Lonand Zone' };
  document.getElementById('chatChannelName').textContent = names[channelId] || channelId;
  renderChat(channelId);
}

function renderChat(channelId) {
  const messages = channelMessages[channelId] || [];
  const container = document.getElementById('chatMessages');
  container.innerHTML = messages.map(m => {
    if (m.type === 'sys') return `<div class="msg sys"><div class="msg-text">${m.text}</div></div>`;
    if (m.type === 'alert') return `<div class="msg alert-msg"><div class="msg-text"><strong>${m.text}</strong></div></div>`;
    if (m.type === 'received') return `<div class="msg received"><div class="msg-avatar">${m.avatar}</div><div class="msg-bubble"><div class="msg-sender">${m.sender}</div><div class="msg-text">${m.text}</div><div class="msg-time">${m.time}</div></div></div>`;
    if (m.type === 'sent') return `<div class="msg sent"><div class="msg-bubble right"><div class="msg-sender">${m.sender}</div><div class="msg-text">${m.text}</div><div class="msg-time">${m.time}</div></div></div>`;
    return '';
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  const msgs = channelMessages[currentChannel];
  const now = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + (now.getHours() >= 12 ? ' PM' : ' AM');
  msgs.push({ type: 'sent', sender: 'You · Admin', text, time });
  renderChat(currentChannel);
  input.value = '';
}

function startPTT() {
  document.getElementById('pttBtn').classList.add('recording');
  showToast('🎙️ Transmitting... (hold to speak)');
}
function stopPTT() {
  document.getElementById('pttBtn').classList.remove('recording');
  showToast('🔈 Message sent to ' + currentChannel);
}

// ===== SOS ALARM LOGIC =====
function openSosModal() {
  document.getElementById('sosModalBackdrop').classList.add('open');
  document.getElementById('sosModal').classList.add('open');
}
function closeSosModal() {
  document.getElementById('sosModalBackdrop').classList.remove('open');
  document.getElementById('sosModal').classList.remove('open');
}

let sosAudio = null; // Normally we'd play an audio file here
function sendSOS() {
  const type = document.getElementById('sos-type').value;
  const loc = document.getElementById('sos-location').value;
  const msgText = document.getElementById('sos-message').value;
  const reporter = document.getElementById('sos-reporter').value || 'Unknown Reporter';
  
  if (!type || !loc || !msgText) {
    showToast('⚠️ Please fill all required fields', 3000);
    return;
  }
  
  closeSosModal();
  
  // Trigger Alarm Overlay
  const overlay = document.getElementById('sosAlarmOverlay');
  overlay.classList.add('active');
  document.getElementById('sosAlarmMsg').textContent = `${type} at ${loc}`;
  document.getElementById('sosAlarmMeta').textContent = `Reported by: ${reporter} \n "${msgText}"`;
  
  // Add to chat/notif
  const chatMsg = { type: 'alert', text: `🆘 SOS ACTIVE: ${type} at ${loc}. ${msgText} (${reporter})` };
  Object.keys(channelMessages).forEach(ch => channelMessages[ch].push({ ...chatMsg }));
  if (currentChannel) renderChat(currentChannel);
  
  const notifList = document.getElementById('notifList');
  const item = document.createElement('div');
  item.className = 'notif-item sos';
  item.innerHTML = `<div class="notif-type">🆘 SOS</div><div class="notif-content"><div class="notif-title">${type} – ${loc}</div><div class="notif-detail">${msgText} · Reported by: ${reporter}</div></div><div class="notif-time">Just now</div>`;
  if (notifList) notifList.prepend(item);
}

function dismissSOSAlarm() {
  document.getElementById('sosAlarmOverlay').classList.remove('active');
  showToast('✓ SOS Alarm acknowledged', 3000);
}
function dispatchTeam() {
  document.getElementById('sosAlarmOverlay').classList.remove('active');
  showToast('🚑 Emergency unit dispatched to location!', 3000);
}

// ===== FLASH NOTIFICATION LOGIC =====
function openFlashModal() {
  document.getElementById('flashModalBackdrop').classList.add('open');
  document.getElementById('flashModal').classList.add('open');
  // Add preview listener if not added
  const textarea = document.getElementById('flash-message');
  if (!textarea.dataset.listening) {
    textarea.addEventListener('input', (e) => {
      document.getElementById('fpPreviewText').textContent = e.target.value || 'Your message will appear here...';
    });
    textarea.dataset.listening = "true";
  }
}
function closeFlashModal() {
  document.getElementById('flashModalBackdrop').classList.remove('open');
  document.getElementById('flashModal').classList.remove('open');
}

function toggleChip(checkbox) {
  if(checkbox.checked) checkbox.parentElement.classList.add('active');
  else checkbox.parentElement.classList.remove('active');
  
  // update sending text
  const checks = Array.from(document.querySelectorAll('#recipientChips input:checked'));
  const txt = document.getElementById('flashRecipientCount');
  if (checks.length === 0) txt.innerHTML = '📤 Select a recipient group';
  else if (checks.length === 1) txt.innerHTML = `📤 Sending to: <strong>${checks[0].value}</strong>`;
  else txt.innerHTML = `📤 Sending to: <strong>${checks.length} groups</strong>`;
}

function sendFlash() {
  const zone = document.getElementById('flash-zone').value;
  const type = document.getElementById('flash-type').value;
  const msg = document.getElementById('flash-message').value;
  const checks = Array.from(document.querySelectorAll('#recipientChips input:checked'));
  
  if (!msg) { showToast('⚠️ Please write a message', 3000); return; }
  if (checks.length === 0) { showToast('⚠️ Select at least one recipient group', 3000); return; }
  
  closeFlashModal();
  
  let typeLabel = "⚡ Flash";
  let typeClass = "warning";
  if (type === 'info') { typeLabel = "ℹ️ Info"; typeClass = "info"; }
  else if (type === 'route') { typeLabel = "🗺️ Route"; typeClass = "warning"; }
  else if (type === 'supply') { typeLabel = "🛒 Supply"; typeClass = "info"; }
  else if (type === 'weather') { typeLabel = "🌧️ Weather"; typeClass = "warning"; }
  else if (type === 'crowd') { typeLabel = "👥 Crowd"; typeClass = "warning"; }
  
  const notifList = document.getElementById('notifList');
  const item = document.createElement('div');
  item.className = `notif-item ${typeClass}`;
  item.innerHTML = `<div class="notif-type">${typeLabel}</div><div class="notif-content"><div class="notif-title">To: ${zone} (${checks.length} groups)</div><div class="notif-detail">${msg}</div></div><div class="notif-time">Just now</div>`;
  if (notifList) notifList.prepend(item);
  
  showToast('⚡ Flash notification sent to devices!', 3000);
}

// ===== LOST & FOUND =====
let lfType = 'lost';
let caseCounter = 28;

function setLFType(type, btn) {
  lfType = type;
  document.querySelectorAll('.lf-type').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function simulateQRScan() {
  const result = document.getElementById('qr-scan-result');
  result.classList.remove('hidden');
  result.textContent = '✅ QR Scanned: Item Tag #LF-2025-0089 – Blue Bag, Reported Lost at Jejuri, 11:30 AM';
  showToast('📷 QR tag scanned successfully!');
}

function submitLFCase() {
  const desc = document.getElementById('lf-desc').value.trim();
  const loc = document.getElementById('lf-loc').value.trim();
  if (!desc || !loc) {
    showToast('⚠️ Please fill Description and Location.');
    return;
  }

  const caseId = 'LF-' + String(caseCounter).padStart(4, '0');
  caseCounter++;

  const list = document.getElementById('caseList');
  const card = document.createElement('div');
  card.className = 'case-card open';
  card.dataset.status = 'open';
  card.innerHTML = `
    <div class="case-type-badge ${lfType}">${lfType.toUpperCase()}</div>
    <div class="case-body">
      <div class="case-title">${desc}</div>
      <div class="case-loc">📍 ${loc}</div>
      <div class="case-time">⏱ Just now</div>
    </div>
    <div class="case-right">
      <div class="case-status open">Open</div>
      <button class="btn-sm orange" onclick="assignVolunteer(this)">Assign</button>
    </div>
  `;
  list.prepend(card);

  document.getElementById('lf-desc').value = '';
  document.getElementById('lf-loc').value = '';
  document.getElementById('lf-mobile').value = '';
  document.getElementById('qr-scan-result').classList.add('hidden');
  showToast('✅ Case ' + caseId + ' logged! Nearest volunteer will be notified.');
}

function assignVolunteer(btn) {
  const card = btn.closest('.case-card');
  card.dataset.status = 'assigned';
  const volunteers = ['VS-0012', 'VS-0034', 'VS-0067', 'VS-0091', 'VS-0103'];
  const vol = volunteers[Math.floor(Math.random() * volunteers.length)];
  card.querySelector('.case-status').textContent = 'Assigned – ' + vol;
  card.querySelector('.case-status').className = 'case-status assigned';
  btn.textContent = 'Resolve';
  btn.className = 'btn-sm green';
  btn.onclick = function() { resolveCase(btn); };
  showToast('✅ Volunteer ' + vol + ' assigned to this case!');
}

function resolveCase(btn) {
  const card = btn.closest('.case-card');
  card.dataset.status = 'resolved';
  card.classList.add('resolved');
  card.querySelector('.case-status').textContent = 'Resolved';
  card.querySelector('.case-status').className = 'case-status resolved';
  btn.textContent = 'Done';
  btn.className = 'btn-sm grey';
  btn.disabled = true;
  showToast('✅ Case resolved! Great work!');
}

function filterLF(status, btn) {
  document.querySelectorAll('.lf-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.case-card').forEach(card => {
    if (status === 'all' || card.dataset.status === status) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ===== AI / NLP =====
const nlpExamples = [
  {
    text: 'Lonand bridge var gardi khup aahe, ek mahilela tras hoat aahe, ticha shwas ghayala tras hoat aahe.',
    lang: 'Marathi',
    fields: [
      { label: 'Language', value: 'Marathi' },
      { label: 'Location', value: 'Lonand Bridge' },
      { label: 'Incident Type', value: 'Medical Emergency' },
      { label: 'Subject', value: 'Woman (1 person)' },
      { label: 'Symptom', value: 'Breathing difficulty' },
      { label: 'Severity', value: '🔴 HIGH' },
    ],
    action: '🚑 Auto-dispatched: Medical team VS-M-007 (ETA: 3 min) + Alert sent to Lonand Police channel',
  },
  {
    text: 'Jejuri mein pani ki supply khatam ho gayi, bahut log pyase hain, please jaldi karo.',
    lang: 'Hindi',
    fields: [
      { label: 'Language', value: 'Hindi' },
      { label: 'Location', value: 'Jejuri' },
      { label: 'Incident Type', value: 'Resource Shortage' },
      { label: 'Resource', value: 'Water supply' },
      { label: 'Affected', value: 'Multiple pilgrims' },
      { label: 'Severity', value: '🟠 MEDIUM' },
    ],
    action: '⚡ Flash alert sent: NGO water trucks redirected to Jejuri. ETA 15 min.',
  },
  {
    text: 'There is a lost child near Pandharpur main gate. Boy, about 7 years old, wearing a red shirt. Crying and alone.',
    lang: 'English',
    fields: [
      { label: 'Language', value: 'English' },
      { label: 'Location', value: 'Pandharpur Main Gate' },
      { label: 'Incident Type', value: 'Lost Person' },
      { label: 'Subject', value: 'Child – Boy, ~7 years' },
      { label: 'Description', value: 'Red shirt, crying' },
      { label: 'Severity', value: '🟡 PRIORITY' },
    ],
    action: '🔍 Lost & Found case LF-2025-0142 auto-created. Nearest 3 volunteers notified.',
  },
];

function setNLPExample(idx) {
  document.getElementById('nlpInput').value = nlpExamples[idx].text;
  document.getElementById('nlpOutput').style.display = 'none';
}

function parseNLP() {
  const text = document.getElementById('nlpInput').value.trim();
  if (!text) { showToast('⚠️ Please enter a report to parse.'); return; }

  // Match example or use generic
  let result = nlpExamples.find(e => text.trim().startsWith(e.text.substring(0, 20)));
  if (!result) {
    result = {
      fields: [
        { label: 'Language', value: 'Auto-detected' },
        { label: 'Location', value: 'Unknown (needs clarification)' },
        { label: 'Incident Type', value: 'General Report' },
        { label: 'Severity', value: '🟡 MEDIUM' },
      ],
      action: 'ℹ️ Report logged. Manual review required for location disambiguation.',
    };
  }

  const outputDiv = document.getElementById('nlpOutput');
  const fieldsDiv = document.getElementById('nlpFields');
  const actionDiv = document.getElementById('nlpAction');

  outputDiv.style.display = 'block';
  fieldsDiv.innerHTML = result.fields.map(f =>
    `<div class="nlp-field"><span class="nlp-label">${f.label}:</span><span class="nlp-value">${f.value}</span></div>`
  ).join('');
  actionDiv.innerHTML = '⚡ <strong>AI Action Taken:</strong> ' + result.action;
  showToast('🤖 NLP parsing complete!');
}

function downloadCert() {
  showToast('⬇️ Certificate PDF downloaded!');
}

// ===== QR SCANNER LOGIC =====
const mockPilgrims = {
  'pilgrim-1': { id: 'VS-P-10492', name: 'Ramesh Kale', tag: 'senior', tagLabel: 'Senior Citizen', avatar: 'RK', bg: 'var(--orange-lt)', color: '#92400E', details: { Age: 68, Gender: 'Male', Village: 'Alandi', 'Warkari Dindi': 'Sant Dnyaneshwar Maharaj Dindi No. 4', 'Emg. Contact': '+91 98765 43210 (Son)' }, health: [{class: 'orange', text: 'Diabetic'}, {class: 'red', text: 'Heart Patient'}] },
  'pilgrim-2': { id: 'VS-P-28311', name: 'Sunita Jadhav', tag: 'normal', tagLabel: 'Regular', avatar: 'SJ', bg: 'var(--green-lt)', color: '#15803D', details: { Age: 42, Gender: 'Female', Village: 'Dehu', 'Warkari Dindi': 'Tukaram Maharaj Dindi No. 12', 'Emg. Contact': '+91 91234 56780 (Husband)' }, health: [{class: 'green', text: 'Fit / No Issues'}] },
  'pilgrim-3': { id: 'VS-P-44021', name: 'Vitthal Patil', tag: 'disabled', tagLabel: 'Divyang', avatar: 'VP', bg: 'rgba(139,92,246,.25)', color: '#DDD6FE', details: { Age: 55, Gender: 'Male', Village: 'Pandharpur', 'Warkari Dindi': 'Independent', 'Emg. Contact': '+91 99887 76655 (Brother)' }, health: [{class: 'blue', text: 'Wheelchair User'}] },
  'pilgrim-4': { id: 'VS-P-55912', name: 'Raju (Child)', tag: 'child', tagLabel: 'Child', avatar: 'R', bg: 'rgba(239,68,68,.3)', color: '#FCA5A5', details: { Age: 8, Gender: 'Male', Village: 'Saswad', 'Warkari Dindi': 'Dindi No. 2 (Lost)', 'Emg. Contact': '+91 88888 88888 (Father - Missing)' }, health: [{class: 'red', text: 'Lost Child'}, {class: 'orange', text: 'Dehydrated'}] }
};

let currentScannedId = null;

function simulateScan(pId) {
  // Show scanning success animation
  document.getElementById('scannerIdle').classList.add('hidden');
  const success = document.getElementById('scannerSuccess');
  success.classList.remove('hidden');
  
  setTimeout(() => {
    success.classList.add('hidden');
    document.getElementById('scannerIdle').classList.remove('hidden');
    loadPilgrim(pId);
  }, 1000);
}

function loadPilgrim(pId) {
  const p = mockPilgrims[pId];
  if(!p) return;
  currentScannedId = p.id;
  
  // Update Card
  document.getElementById('pcAvatar').textContent = p.avatar;
  document.getElementById('pcName').textContent = p.name;
  document.getElementById('pcId').textContent = 'ID: ' + p.id;
  
  const tagEl = document.getElementById('pcTag');
  tagEl.className = 'pc-tag ' + p.tag;
  tagEl.textContent = p.tagLabel;
  
  // Details
  const detailsHtml = Object.keys(p.details).map(k => `
    <div class="pc-detail-item">
      <div class="pc-detail-label">${k}</div>
      <div class="pc-detail-val">${p.details[k]}</div>
    </div>
  `).join('');
  document.getElementById('pcDetails').innerHTML = detailsHtml;
  
  // Health
  const healthHtml = p.health.map(h => `<div class="pc-health-tag ${h.class}">${h.text}</div>`).join('');
  document.getElementById('pcHealth').innerHTML = `
    <div class="pc-health-title">Health & Alerts</div>
    <div class="pc-health-tags">${healthHtml}</div>
  `;
  
  // UI Switch
  document.getElementById('pilgrimCard').classList.remove('hidden');
  document.getElementById('qrsPlaceholder').classList.add('hidden');
  document.getElementById('actionPanel').classList.remove('hidden');
  
  resetActionPanel();
  showToast('✅ QR Scanned: ' + p.name, 3000);
}

function clearScan() {
  currentScannedId = null;
  document.getElementById('pilgrimCard').classList.add('hidden');
  document.getElementById('qrsPlaceholder').classList.remove('hidden');
  document.getElementById('actionPanel').classList.add('hidden');
}

function switchAPTab(tabId, btn) {
  document.querySelectorAll('.ap-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  document.querySelectorAll('.ap-content').forEach(c => c.classList.remove('active'));
  document.getElementById('ap-' + tabId).classList.add('active');
}

function selectResource(label) {
  // handled by CSS and input:checked, but can add JS side effects here if needed
}

function submitAPAction(actionType) {
  let title = "", detail = "";
  
  if (actionType === 'lostfound') {
    const type = document.querySelector('input[name="lf-type"]:checked').value;
    const loc = document.getElementById('ap-lf-location').value;
    if(!loc) { showToast('⚠️ Location is required'); return; }
    title = type === 'lost' ? 'Lost Person Reported' : 'Found Person Reported';
    detail = `Pilgrim ${currentScannedId} marked as ${type} at ${loc}. Nearest units alerted.`;
  }
  else if (actionType === 'complaint') {
    const type = document.getElementById('ap-complaint-type').value;
    const loc = document.getElementById('ap-complaint-loc').value;
    if(!type || !loc) { showToast('⚠️ Type and Location are required'); return; }
    title = 'Complaint Lodged';
    detail = `Complaint (${type}) logged for ${currentScannedId} at ${loc}. Routed to authorities.`;
  }
  else if (actionType === 'resource') {
    const res = document.querySelector('input[name="res-type"]:checked');
    if(!res) { showToast('⚠️ Select a resource'); return; }
    const urg = document.querySelector('input[name="urgency"]:checked').value;
    title = 'Resource Requested';
    detail = `${res.value.toUpperCase()} requested for ${currentScannedId}. Urgency: ${urg.toUpperCase()}. Dispatching unit.`;
  }
  
  // Show confirmation
  document.querySelectorAll('.ap-content').forEach(c => c.classList.remove('active'));
  document.getElementById('apTabs').style.display = 'none';
  const conf = document.getElementById('apConfirm');
  conf.classList.remove('hidden');
  
  document.getElementById('apConfTitle').textContent = title;
  document.getElementById('apConfId').textContent = 'Ticket: VS-' + Math.floor(Math.random()*9000 + 1000);
  document.getElementById('apConfDetail').textContent = detail;
}

function resetActionPanel() {
  document.getElementById('apConfirm').classList.add('hidden');
  document.getElementById('apTabs').style.display = 'grid';
  document.querySelectorAll('.ap-content').forEach(c => c.classList.remove('active'));
  document.getElementById('ap-lostfound').classList.add('active'); // default tab
  document.querySelectorAll('.ap-tab').forEach(b => b.classList.remove('active'));
  document.querySelector('.ap-tab').classList.add('active');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderMemberTable(allMembers);
  renderChat('all-hands');
});