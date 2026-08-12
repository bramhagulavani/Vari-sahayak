/* ============================================================
   VariSahayak – map3d.js
   REAL 3D map (MapLibre GL) — actual elevation data (Sahyadri
   ghats/hills between Pune and Pandharpur), the real Palkhi Marg
   road, and live-style markers for checkpoints, volunteers,
   medical camps, crowd density and the SOS beacon.
   Data sources at runtime (no API key required):
     - Base imagery : OpenStreetMap raster tiles
     - Elevation    : AWS "elevation-tiles-prod" terrarium DEM
     - Road geometry: OSRM public routing demo server
   ============================================================ */

window.Map3D = (function () {
  let map, initialized = false, loaded = false;
  const markers = { volunteers: [], medical: [], crowd: [], route: null };
  let layerVisible = { volunteers: true, crowd: true, medical: true, route: true };

  // Real coordinates along the Palkhi Marg (Alandi -> Pandharpur)
  const CHECKPOINTS = [
    { name: 'Alandi (Start)',   lng: 73.8973, lat: 18.6809, status: 'normal',   flow: '2,150', vol: '280 volunteers' },
    { name: 'Pune – Swargate',  lng: 73.8567, lat: 18.5204, status: 'normal',   flow: '2,430', vol: '320 volunteers' },
    { name: 'Saswad',           lng: 74.0000, lat: 18.5500, status: 'normal',   flow: '1,820', vol: '185 volunteers' },
    { name: 'Jejuri',           lng: 74.1717, lat: 18.2872, status: 'normal',   flow: '3,100', vol: '410 volunteers' },
    { name: 'Lonand',           lng: 74.1872, lat: 18.0404, status: 'high',     flow: '4,800', vol: '540 volunteers' },
    { name: 'Phaltan',          lng: 74.4318, lat: 17.9911, status: 'normal',   flow: '1,210', vol: '210 volunteers' },
    { name: 'Pandharpur Entry', lng: 75.3278, lat: 17.6778, status: 'critical', flow: '6,200', vol: '820 volunteers' },
  ];

  const STATUS_HEX = { normal: '#2DC653', high: '#F5A623', critical: '#E74C3C' };

  function updateInfoBox(cp) {
    const box = document.getElementById('mapInfoBox3D');
    if (!box) return;
    document.querySelectorAll('.cp-item').forEach(c => c.classList.remove('active'));
    const match = [...document.querySelectorAll('.cp-item')]
      .find(el => el.querySelector('.cp-name')?.textContent.trim() === cp.name.replace(' Entry', ''));
    if (match) match.classList.add('active');

    document.getElementById('infoBoxTitle3D').textContent = '📍 ' + cp.name;
    const statusLabel = cp.status === 'normal' ? 'Normal' : cp.status === 'high' ? 'High Density' : 'CRITICAL – SOS Active';
    document.getElementById('infoBoxContent3D').innerHTML = `
      <div style="line-height:2;font-size:13px">
        <b>Pilgrim Flow:</b> ${cp.flow} pilgrims/hr<br/>
        <b>Status:</b> <span style="color:${STATUS_HEX[cp.status]};font-weight:700">${statusLabel}</span><br/>
        <b>On Ground:</b> ${cp.vol}<br/>
        <b>Terrain:</b> ${(cp.name.includes('Jejuri') || cp.name.includes('Lonand')) ? 'Ghat / hill section' : 'Plains'}<br/>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="btn-sm blue" onclick="showToast('Team dispatched to ${cp.name}')">Dispatch Team</button>
        <button class="btn-sm orange" onclick="showToast('Alert sent for ${cp.name}')">Send Alert</button>
      </div>`;
    box.style.display = 'block';
  }

  function pinEl(color, pulsing) {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.width = '20px';
    wrap.style.height = '20px';
    if (pulsing) {
      const ring = document.createElement('div');
      ring.className = 'm3d-pulse-ring';
      ring.style.background = color;
      wrap.appendChild(ring);
    }
    const dot = document.createElement('div');
    dot.className = 'm3d-pin-dot';
    dot.style.background = color;
    wrap.appendChild(dot);
    return wrap;
  }

  function smallDotEl(color) {
    const dot = document.createElement('div');
    dot.className = 'm3d-small-dot';
    dot.style.background = color;
    return dot;
  }

  function medicalEl() {
    const el = document.createElement('div');
    el.className = 'm3d-medical-pin';
    el.textContent = '+';
    return el;
  }

  async function fetchRoute() {
    const coordStr = CHECKPOINTS.map(c => `${c.lng},${c.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes[0]) return data.routes[0].geometry;
    } catch (e) { /* fall through to straight-line fallback */ }
    // Fallback: straight lines between checkpoints if OSRM is unreachable
    return {
      type: 'LineString',
      coordinates: CHECKPOINTS.map(c => [c.lng, c.lat]),
    };
  }

  function addVolunteers() {
    CHECKPOINTS.forEach((cp) => {
      const count = cp.status === 'critical' ? 5 : cp.status === 'high' ? 4 : 2;
      for (let i = 0; i < count; i++) {
        const jLng = cp.lng + (Math.random() - 0.5) * 0.05;
        const jLat = cp.lat + (Math.random() - 0.5) * 0.05;
        const marker = new maplibregl.Marker({ element: smallDotEl('#4361EE') })
          .setLngLat([jLng, jLat])
          .addTo(map);
        markers.volunteers.push(marker);
      }
    });
  }

  function addMedicalCamps() {
    [CHECKPOINTS[0], CHECKPOINTS[3], CHECKPOINTS[5]].forEach((cp) => {
      const marker = new maplibregl.Marker({ element: medicalEl() })
        .setLngLat([cp.lng + 0.02, cp.lat - 0.015])
        .addTo(map);
      markers.medical.push(marker);
    });
  }

  function addCrowdDensity() {
    const features = CHECKPOINTS.filter(c => c.status !== 'normal').map(cp => ({
      type: 'Feature',
      properties: { color: STATUS_HEX[cp.status] },
      geometry: { type: 'Point', coordinates: [cp.lng, cp.lat] },
    }));
    map.addSource('crowd-density', { type: 'geojson', data: { type: 'FeatureCollection', features } });
    map.addLayer({
      id: 'crowd-density-layer',
      type: 'circle',
      source: 'crowd-density',
      paint: {
        'circle-radius': 55,
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.22,
        'circle-blur': 0.9,
      },
    });
  }

  function addCheckpointPins() {
    CHECKPOINTS.forEach((cp) => {
      const el = pinEl(STATUS_HEX[cp.status], cp.status !== 'normal');
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        updateInfoBox(cp);
        map.flyTo({ center: [cp.lng, cp.lat], zoom: Math.max(map.getZoom(), 10.5), pitch: 55, speed: 0.8 });
      });
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([cp.lng, cp.lat])
        .addTo(map);
      cp._marker = marker;
      cp._el = el;

      // label
      const labelEl = document.createElement('div');
      labelEl.className = 'm3d-label';
      labelEl.textContent = cp.name;
      new maplibregl.Marker({ element: labelEl, anchor: 'bottom', offset: [0, -18] })
        .setLngLat([cp.lng, cp.lat])
        .addTo(map);
    });
  }

  async function addRoute() {
    const geometry = await fetchRoute();
    map.addSource('wari-route', { type: 'geojson', data: { type: 'Feature', geometry, properties: {} } });
    map.addLayer({
      id: 'wari-route-line',
      type: 'line',
      source: 'wari-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#2DC653', 'line-width': 4, 'line-opacity': 0.9 },
    });
    map.addLayer({
      id: 'wari-route-glow',
      type: 'line',
      source: 'wari-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#2DC653', 'line-width': 12, 'line-opacity': 0.18, 'line-blur': 3 },
    }, 'wari-route-line');
  }

  function setStyleAndTerrain() {
    map.on('load', async () => {
      // Elevation source (real DEM — this is what renders the actual Sahyadri ghats/hills)
      map.addSource('terrain-dem', {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15,
      });
      map.setTerrain({ source: 'terrain-dem', exaggeration: 1.6 });

      map.addLayer({
        id: 'hillshade',
        type: 'hillshade',
        source: 'terrain-dem',
        paint: { 'hillshade-exaggeration': 0.7 },
      });

      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun-intensity': 8,
        },
      });

      await addRoute();
      addCrowdDensity();
      addCheckpointPins();
      addVolunteers();
      addMedicalCamps();

      loaded = true;
      document.getElementById('map3dLoading')?.remove();
    });
  }

  function init() {
    const container = document.getElementById('map3dCanvas');
    if (!container || typeof maplibregl === 'undefined') return;

    if (initialized) {
      setTimeout(() => map.resize(), 60);
      return;
    }
    initialized = true;

    map = new maplibregl.Map({
      container: 'map3dCanvas',
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm-base', type: 'raster', source: 'osm' }],
      },
      center: [74.4, 18.2],
      zoom: 8.1,
      pitch: 58,
      bearing: -12,
      antialias: true,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    setStyleAndTerrain();
  }

  function setLayer(layer, visible) {
    layerVisible[layer] = visible;
    if (layer === 'volunteers') markers.volunteers.forEach(m => m.getElement().style.display = visible ? '' : 'none');
    if (layer === 'medical') markers.medical.forEach(m => m.getElement().style.display = visible ? '' : 'none');
    if (layer === 'crowd' && map && map.getLayer('crowd-density-layer')) {
      map.setLayoutProperty('crowd-density-layer', 'visibility', visible ? 'visible' : 'none');
    }
    if (layer === 'route' && map && map.getLayer('wari-route-line')) {
      map.setLayoutProperty('wari-route-line', 'visibility', visible ? 'visible' : 'none');
      map.setLayoutProperty('wari-route-glow', 'visibility', visible ? 'visible' : 'none');
    }
  }

  function focusCheckpoint(name) {
    const cp = CHECKPOINTS.find(c => c.name === name || c.name.replace(' Entry', '') === name);
    if (!cp || !map) return;
    updateInfoBox(cp);
    map.flyTo({ center: [cp.lng, cp.lat], zoom: 10.5, pitch: 55, speed: 0.8 });
  }

  function stop() { /* MapLibre manages its own render loop; nothing to tear down */ }

  return { init, setLayer, focusCheckpoint, stop };
})();