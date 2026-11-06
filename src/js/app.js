/**
 * Radar do Estágio (Barão Geraldo ↔ Cristália / Cambuí)
 * 100% Autônomo (Decodificador Protobuf Cittamobi direto no navegador + PWA Mobile)
 * Funciona na nuvem (GitHub Pages / 4G no Moto G9 Play) sem precisar do PC ligado!
 */

const CAMPINAS_CENTER = [-22.865, -47.062];
const INITIAL_ZOOM = 13;
const CARTO_API_KEY = "cb1_536t_1_d8b1d99997aec27b47268129";
const CITTAMOBI_TOKEN = "$2a$10$aGN1MBopPjiM/97AzcG28ugrkNejBLKz8sJ/.vJ3RNDRENgyUX1t6";

const PRIORITY_STOP_IDS = new Set([
  "af0f7747-4677-11ed-98db-5adc55d213d0", // 330 VOLTA #08: Av. Dr. Romeu Tórtima, 1575 (Pastelaria Tropical)
  "af037fee-4677-11ed-98db-5adc55d213d0", // 330 VOLTA #25: Av. Senador Saraiva, 676/767 (Descida Centro)
  "af033e95-4677-11ed-98db-5adc55d213d0", // 386 VOLTA #02: Av. Senador Saraiva, 528 (Ilha Centro -> Cambuí)
  "af05d0b2-4677-11ed-98db-5adc55d213d0", // 386 VOLTA #11: Av. João Mendes Jr, 290 / Norte-Sul 1358 (Cristália)
  "af3ce3d6-4677-11ed-98db-5adc55d213d0", // 382 IDA #04: Av. José de Souza Campos, 1133 (Casa da Sobremesa)
  "af04204f-4677-11ed-98db-5adc55d213d0", // 382 IDA #11: Av. Benjamin Constant, 1633 (Descida Centro)
  "af038c96-4677-11ed-98db-5adc55d213d0", // 330 IDA #03: R. Ferreira Penteado, 1023
  "af045dd9-4677-11ed-98db-5adc55d213d0", // 330 IDA #04: Av. Anchieta, 330 (Centro -> Unicamp)
  "af0f6d7d-4677-11ed-98db-5adc55d213d0", // 330 IDA #22: Av. Romeu Tórtima, 1550 / Oxxo Unicamp
]);

const COMMUTE_PRESETS = {
  MORNING: {
    id: "MORNING",
    windowTag: "MANHÃ • FAIXA DAS 06:50 ÀS 07:55",
    title: "Ida ao Estágio: Pastelaria Tropical → Cristália",
    description:
      "Pega o 330 na Romeu Tórtima (6:56–6:57), desce na Senador Saraiva (7:28–7:32), muda de lado na ilha e pega o 386 (7:31–7:45) até o Cristália (~7:50).",
    step1: {
      routeId: "330",
      direction: "VOLTA",
      lineLabel: "Linha 330 (Sentido Centro)",
      color: "#0284c7",
      boardStopId: "af0f7747-4677-11ed-98db-5adc55d213d0",
      boardTitle: "Av. Dr. Romeu Tórtima, 1575 (Pastelaria Tropical)",
      boardPinLabel: "1. Pegar 330 • Pastelaria Tropical",
      habitualHtml:
        "Costuma passar: <strong>06:56 – 06:57</strong> &bull; Tabela: <strong>06:46, 06:58, 07:10</strong>",
      alightStopId: "af037fee-4677-11ed-98db-5adc55d213d0",
      alightTitle: "Av. Senador Saraiva, 767 / 676 (Centro)",
      alightPinLabel: "2. Descer 330 • Sen. Saraiva 767",
      alightMeta: "~22 min de viagem (chegada habitual: 07:28 – 07:32)",
      rideTimeSec: 1336,
      targetWindow: ["06:46", "06:58", "07:10", "07:22"],
    },
    transfer: {
      title: "Baldeação na Av. Senador Saraiva (~180m a pé • 2 min)",
      subtitle: "Andar um pouco para a frente e mudar de lado da ilha para pegar o 386",
      walkSeconds: 120,
    },
    step2: {
      routeId: "386",
      direction: "VOLTA",
      lineLabel: "Linha 386 (Sentido Cambuí)",
      color: "#059669",
      boardStopId: "af033e95-4677-11ed-98db-5adc55d213d0",
      boardTitle: "Av. Senador Saraiva, 528 (Ilha Central)",
      boardPinLabel: "3. Pegar 386 • Ilha Sen. Saraiva",
      habitualHtml:
        "Alta variação: <strong>07:31, 07:32 a 07:45</strong> &bull; Tabela: <strong>07:24, 07:32, 07:40, 07:48</strong>",
      alightStopId: "af05d0b2-4677-11ed-98db-5adc55d213d0",
      alightTitle: "Av. José de Souza Campos, 1358 (Cristália - Cambuí)",
      alightPinLabel: "4. Estágio Cristália (Norte-Sul, 1358)",
      alightMeta: "~14 min de viagem (chegada habitual: ~07:50)",
      rideTimeSec: 830,
      targetWindow: ["07:24", "07:32", "07:40", "07:48"],
    },
  },
  AFTERNOON: {
    id: "AFTERNOON",
    windowTag: "TARDE • SAÍDA ÀS 15:00 (FAIXA 15:15 ÀS 16:00)",
    title: "Volta p/ Casa: Cristália (15h) → Oxxo Unicamp",
    description:
      "Sai às 15h, pega o 382 ao lado da Casa da Sobremesa (15:25–15:32), desce na Benjamin Constant 1633 e pega o 330 (~15:38) até o Oxxo da Romeu Tórtima 1550.",
    step1: {
      routeId: "382",
      direction: "IDA",
      lineLabel: "Linha 382 (Sentido Centro / Shopping)",
      color: "#d97706",
      boardStopId: "af3ce3d6-4677-11ed-98db-5adc55d213d0",
      boardTitle: "Av. José de Souza Campos, 1133 (Ao lado da Casa da Sobremesa)",
      boardPinLabel: "1. Pegar 382 • Casa da Sobremesa",
      habitualHtml:
        "Costuma passar: <strong>15:25 – 15:32</strong> &bull; Tabela: <strong>15:26, 16:26</strong>",
      alightStopId: "af04204f-4677-11ed-98db-5adc55d213d0",
      alightTitle: "Av. Benjamin Constant, 1633 (Centro)",
      alightPinLabel: "2. Descer 382 • Benj. Constant 1633",
      alightMeta: "~11 min de viagem (chegada habitual: ~15:35)",
      rideTimeSec: 663,
      targetWindow: ["15:26", "16:26"],
    },
    transfer: {
      title: "Conexão no Centro: Benj. Constant, 1633 → Ponto do 330 (~180m)",
      subtitle: "Caminhada rápida até o ponto do 330 antes dele passar (~15:38)",
      walkSeconds: 150,
    },
    step2: {
      routeId: "330",
      direction: "IDA",
      lineLabel: "Linha 330 (Sentido Unicamp)",
      color: "#0284c7",
      boardStopId: "af045dd9-4677-11ed-98db-5adc55d213d0",
      boardTitle: "Av. Anchieta, 330 / R. Ferreira Penteado, 1023 (Centro)",
      boardPinLabel: "3. Pegar 330 • Centro (15:38)",
      habitualHtml:
        "Costuma passar: <strong>~15:38</strong> &bull; Tabela: <strong>15:27, 15:44, 16:01</strong>",
      alightStopId: "af0f6d7d-4677-11ed-98db-5adc55d213d0",
      alightTitle: "Av. Dr. Romeu Tórtima, 1550 (Em frente ao Oxxo Unicamp)",
      alightPinLabel: "4. Descer 330 • Oxxo Unicamp (1550)",
      alightMeta: "~18 min de viagem até a frente do Oxxo Unicamp",
      rideTimeSec: 1108,
      targetWindow: ["15:27", "15:44", "16:01"],
    },
  },
};

// ============================================================================
// DECODIFICADOR PROTOBUF BINÁRIO DIRETO NO NAVEGADOR (ZERO BACKEND NECESSÁRIO)
// ============================================================================
const utf8Decoder = new TextDecoder("utf-8");

function readVarint(buf, pos) {
  let result = 0n;
  let shift = 0n;
  while (pos < buf.length) {
    const b = buf[pos++];
    result |= BigInt(b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7n;
  }
  if (result >= 1n << 63n) {
    result -= 1n << 64n;
  }
  return { val: Number(result), pos };
}

function decodeVehiclePrediction(buf) {
  let pos = 0;
  const end = buf.length;
  const v = { isRealTime: false };
  while (pos < end) {
    const tagRes = readVarint(buf, pos);
    pos = tagRes.pos;
    const fnum = tagRes.val >> 3;
    const wtype = tagRes.val & 0x07;

    if (wtype === 0) {
      const vr = readVarint(buf, pos);
      pos = vr.pos;
      if (fnum === 3) v.secondsUntilArrival = vr.val;
      else if (fnum === 4) v.minutesUntilArrival = vr.val;
      else if (fnum === 10) v.isRealTime = Boolean(vr.val);
      else if (fnum === 11) v.sequence = vr.val;
    } else if (wtype === 1) {
      const dv = new DataView(buf.buffer, buf.byteOffset + pos, 8);
      const val = dv.getFloat64(0, true);
      pos += 8;
      if (fnum === 8) v.currentLat = val;
      else if (fnum === 9) v.currentLng = val;
    } else if (wtype === 2) {
      const lr = readVarint(buf, pos);
      const len = lr.val;
      pos = lr.pos;
      const sub = buf.subarray(pos, pos + len);
      pos += len;
      const str = utf8Decoder.decode(sub);
      if (fnum === 1) v.vehicleId = str;
      else if (fnum === 2) v.licensePlate = str;
    } else if (wtype === 5) {
      pos += 4;
    } else {
      break;
    }
  }
  return v;
}

function decodeServicePredictions(arrayBuffer) {
  const buf = new Uint8Array(arrayBuffer);
  let pos = 0;
  const end = buf.length;
  const res = { vehicles: [], totalTravelTimeUntilStopSeconds: 0 };

  while (pos < end) {
    const tagRes = readVarint(buf, pos);
    pos = tagRes.pos;
    const fnum = tagRes.val >> 3;
    const wtype = tagRes.val & 0x07;

    if (wtype === 0) {
      const vr = readVarint(buf, pos);
      pos = vr.pos;
      if (fnum === 15) res.totalTravelTimeUntilStopSeconds = Math.max(0, vr.val);
    } else if (wtype === 1) {
      pos += 8;
    } else if (wtype === 2) {
      const lr = readVarint(buf, pos);
      const len = lr.val;
      pos = lr.pos;
      const sub = buf.subarray(pos, pos + len);
      pos += len;
      if (fnum === 12) {
        res.vehicles.push(decodeVehiclePrediction(sub));
      }
    } else if (wtype === 5) {
      pos += 4;
    } else {
      break;
    }
  }
  return res;
}

async function fetchStopPredictionDirect(serviceId, stopId) {
  const url = `https://core.cittamobi.com.br/linesroutes/service/predictions?serviceId=${serviceId}&stopId=${stopId}`;
  const resp = await fetch(url, {
    headers: {
      username: CITTAMOBI_TOKEN,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = await resp.arrayBuffer();
  return decodeServicePredictions(buf);
}

async function fetchDirectionRealtimeClientSide(routeId, dirKey, dirData) {
  const serviceId = dirData.service_id;
  const stops = dirData.stops;
  const shape = dirData.shape;
  const cumDist = dirData.shape_cum_dist_m || stops.map(() => 0);
  const totalTravelSec = dirData.total_travel_time_sec;
  const totalDistM = cumDist[cumDist.length - 1] || 1;

  const nStops = stops.length;
  const idxSet = new Set([0, Math.floor(nStops / 2), nStops - 1]);
  stops.forEach((st, idx) => {
    if (PRIORITY_STOP_IDS.has(st.stop_id)) idxSet.add(idx);
  });
  const sampleIndices = Array.from(idxSet).sort((a, b) => a - b);

  const checkpointResults = await Promise.all(
    sampleIndices.map(async (sIdx) => {
      try {
        const pred = await fetchStopPredictionDirect(serviceId, stops[sIdx].stop_id);
        return { sIdx, pred };
      } catch {
        return { sIdx, pred: { vehicles: [] } };
      }
    })
  );

  const vehicleRuns = {};
  checkpointResults.forEach(({ sIdx, pred }) => {
    const tCheck = stops[sIdx].travel_time_sec;
    (pred.vehicles || []).forEach((v) => {
      const vid = v.vehicleId;
      if (!vid) return;
      const sec = v.secondsUntilArrival ?? 0;
      if (sec < -45) return;
      const tau = tCheck - sec;
      const isRt = Boolean(v.isRealTime);

      let matchedKey = null;
      for (const [k, existing] of Object.entries(vehicleRuns)) {
        if (existing.vehicle_id === vid && Math.abs(existing.tau - tau) < 900) {
          matchedKey = k;
          break;
        }
      }

      if (!matchedKey) {
        const runKey = `${vid}_${Math.round(tau / 1000)}`;
        vehicleRuns[runKey] = {
          vehicle_id: vid,
          tau,
          is_realtime: isRt,
          checkpoint_sec: Math.abs(sec),
          current_lat: v.currentLat,
          current_lng: v.currentLng,
        };
      } else {
        const ex = vehicleRuns[matchedKey];
        if ((isRt && !ex.is_realtime) || (isRt === ex.is_realtime && Math.abs(sec) < ex.checkpoint_sec)) {
          ex.tau = tau;
          ex.is_realtime = isRt || ex.is_realtime;
          ex.checkpoint_sec = Math.abs(sec);
        }
      }
    });
  });

  const activeVehicles = [];
  let terminalAdded = false;
  const sortedRuns = Object.values(vehicleRuns).sort((a, b) => b.tau - a.tau);

  sortedRuns.forEach((run) => {
    const vid = run.vehicle_id;
    const tau = run.tau;
    const isRt = run.is_realtime;

    if (tau >= -60 && tau <= totalTravelSec + 60) {
      const clampedTau = Math.max(0, Math.min(totalTravelSec, tau));
      let segK = 0;
      for (let k = 0; k < stops.length - 1; k++) {
        if (clampedTau >= stops[k].travel_time_sec && clampedTau <= stops[k + 1].travel_time_sec) {
          segK = k;
          break;
        }
      }
      const stPrev = stops[segK];
      const stNext = stops[Math.min(stops.length - 1, segK + 1)];
      const dtSeg = Math.max(1, stNext.travel_time_sec - stPrev.travel_time_sec);
      const alpha = Math.max(0, Math.min(1, (clampedTau - stPrev.travel_time_sec) / dtSeg));
      const distBusM = stPrev.dist_m + alpha * (stNext.dist_m - stPrev.dist_m);
      const pos = interpolateAlongShape(shape, cumDist, distBusM);

      activeVehicles.push({
        vehicle_id: vid,
        route_id: routeId,
        direction: dirKey,
        headsign: dirData.headsign,
        state: "IN_TRANSIT",
        is_realtime: isRt,
        status_label: isRt ? "GPS Ao Vivo • Em trânsito" : "Estimado • Em trânsito",
        lat: pos.lat,
        lon: pos.lon,
        bearing: pos.bearing,
        tau_sec: Math.round(tau),
        progress_pct: Number(((100 * distBusM) / totalDistM).toFixed(1)),
        dist_traveled_km: Number((distBusM / 1000).toFixed(2)),
        current_stop_sequence: stPrev.sequence,
        next_stop_sequence: stNext.sequence,
        next_stop_name: stNext.name,
        eta_next_stop_sec: Math.max(0, Math.round(stNext.travel_time_sec - tau)),
        eta_final_sec: Math.max(0, Math.round(totalTravelSec - tau)),
      });
    } else if (!terminalAdded && tau >= -1500 && tau < -60) {
      terminalAdded = true;
      const depInSec = Math.round(-tau);
      const depInMin = Math.max(1, Math.round(depInSec / 60));
      const stFirst = stops[0];
      activeVehicles.push({
        vehicle_id: vid,
        route_id: routeId,
        direction: dirKey,
        headsign: dirData.headsign,
        state: "AT_TERMINAL",
        is_realtime: isRt,
        status_label: `No Terminal • Sai em ${depInMin} min`,
        lat: stFirst.lat,
        lon: stFirst.lon,
        bearing: 0,
        tau_sec: Math.round(tau),
        progress_pct: 0,
        dist_traveled_km: 0,
        current_stop_sequence: 1,
        next_stop_sequence: 1,
        next_stop_name: stFirst.name,
        eta_next_stop_sec: depInSec,
        eta_final_sec: Math.round(totalTravelSec + depInSec),
      });
    }
  });

  const directPredsByIdx = {};
  checkpointResults.forEach(({ sIdx, pred }) => {
    directPredsByIdx[sIdx] = pred.vehicles || [];
  });

  const stopPredictions = {};
  stops.forEach((st, sIdx) => {
    const direct = directPredsByIdx[sIdx];
    let arrivals = [];
    if (direct && direct.length > 0) {
      direct.forEach((v) => {
        const etaS = v.secondsUntilArrival ?? 0;
        if (etaS >= -20 && etaS <= 7200 && v.vehicleId) {
          arrivals.push({
            vehicle_id: v.vehicleId,
            eta_sec: Math.max(0, etaS),
            eta_min: Math.max(0, Math.round(etaS / 60)),
            is_realtime: Boolean(v.isRealTime),
          });
        }
      });
    } else {
      const tSt = st.travel_time_sec;
      sortedRuns.forEach((run) => {
        const etaS = Math.round(tSt - run.tau);
        if (etaS >= -20 && etaS <= 7200) {
          arrivals.push({
            vehicle_id: run.vehicle_id,
            eta_sec: Math.max(0, etaS),
            eta_min: Math.max(0, Math.round(etaS / 60)),
            is_realtime: run.is_realtime,
          });
        }
      });
    }
    arrivals.sort((a, b) => a.eta_sec - b.eta_sec);
    stopPredictions[st.stop_id] = arrivals.slice(0, 4);
  });

  return {
    route_id: routeId,
    direction: dirKey,
    active_vehicles: activeVehicles,
    stop_predictions: stopPredictions,
  };
}

// ============================================================================
// MAPA LEAFLET & INTERFACE DO USUÁRIO
// ============================================================================
const map = L.map("map", {
  zoomControl: true,
  preferCanvas: true,
}).setView(CAMPINAS_CENTER, INITIAL_ZOOM);

L.tileLayer(`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`, {
  maxZoom: 20,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
}).addTo(map);

const routeLayerGroup = L.layerGroup().addTo(map);
const pinsLayerGroup = L.layerGroup().addTo(map);
const busesLayerGroup = L.layerGroup().addTo(map);
let userGpsMarker = null;

// Estado
let transitData = null;
let currentMode = "MORNING";
let exploreRouteId = "330";
let exploreDirection = "IDA";
let realtimeDirections = {};
let lastRealtimeSyncMs = 0;
let deferredPwaPrompt = null;

const busMarkersByKey = new Map();

// Elementos DOM
const liveStatusText = document.getElementById("live-status-text");
const liveClockEl = document.getElementById("live-clock");
const lastSyncTimeEl = document.getElementById("last-sync-time");

const tabMorning = document.getElementById("tab-morning");
const tabAfternoon = document.getElementById("tab-afternoon");
const tabExplore = document.getElementById("tab-explore");

const commutePanel = document.getElementById("commute-panel");
const explorePanel = document.getElementById("explore-panel");

function updateClock() {
  const now = new Date();
  liveClockEl.textContent = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatEtaSeconds(sec) {
  if (sec <= 30) return "Agora";
  if (sec < 90) return `${sec}s`;
  return `${Math.round(sec / 60)} min`;
}

function formatArrivalClockTime(offsetSeconds) {
  const dt = new Date(Date.now() + offsetSeconds * 1000);
  return dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function computeBearing(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);
  const dl = toRad(lon2 - lon1);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function interpolateAlongShape(shape, cumDist, targetDistM) {
  if (!shape || shape.length === 0) return { lat: CAMPINAS_CENTER[0], lon: CAMPINAS_CENTER[1], bearing: 0 };
  const totalD = cumDist[cumDist.length - 1] || 1;
  if (targetDistM <= 0) return { lat: shape[0][0], lon: shape[0][1], bearing: 0 };
  if (targetDistM >= totalD) {
    const last = shape[shape.length - 1];
    return { lat: last[0], lon: last[1], bearing: 0 };
  }
  for (let i = 0; i < cumDist.length - 1; i++) {
    const d0 = cumDist[i];
    const d1 = cumDist[i + 1];
    if (targetDistM >= d0 && targetDistM <= d1) {
      const frac = d1 > d0 ? (targetDistM - d0) / (d1 - d0) : 0;
      const lat = shape[i][0] + frac * (shape[i + 1][0] - shape[i][0]);
      const lon = shape[i][1] + frac * (shape[i + 1][1] - shape[i][1]);
      return { lat, lon, bearing: computeBearing(shape[i][0], shape[i][1], shape[i + 1][0], shape[i + 1][1]) };
    }
  }
  const last = shape[shape.length - 1];
  return { lat: last[0], lon: last[1], bearing: 0 };
}

async function initApp() {
  updateClock();
  setInterval(updateClock, 1000);

  // Registrar Service Worker para PWA no Android / LineageOS
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  // Selecionar automaticamente Manhã (antes das 12h) ou Tarde (12h às 19h)
  const curHour = new Date().getHours();
  currentMode = curHour >= 12 && curHour < 19 ? "AFTERNOON" : "MORNING";

  try {
    const res = await fetch("data/transit_data.json");
    transitData = await res.json();

    setupEventListeners();
    syncActiveModeTabs();
    renderActiveView(true);

    await fetchRealtimeData();
    setInterval(fetchRealtimeData, 10000);
    setInterval(tickSmoothVehicles, 1000);
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    liveStatusText.textContent = "Erro de conexão";
  }
}

/**
 * Busca dados em tempo real diretamente da API do Cittamobi no navegador
 * (funciona 100% na nuvem / GitHub Pages / 4G sem depender do servidor Python)
 */
async function fetchRealtimeData() {
  if (!transitData || !transitData.routes) return;
  try {
    liveStatusText.textContent = "Sincronizando GPS...";

    // Descobrir quais sentidos precisamos atualizar para o modo atual
    const pairsToFetch = [];
    if (currentMode === "EXPLORE") {
      pairsToFetch.push([exploreRouteId, exploreDirection]);
    } else {
      const preset = COMMUTE_PRESETS[currentMode];
      pairsToFetch.push([preset.step1.routeId, preset.step1.direction]);
      pairsToFetch.push([preset.step2.routeId, preset.step2.direction]);
    }

    const results = await Promise.all(
      pairsToFetch.map(async ([rId, dKey]) => {
        const dData = transitData.routes[rId].directions[dKey];
        return fetchDirectionRealtimeClientSide(rId, dKey, dData);
      })
    );

    results.forEach((r) => {
      realtimeDirections[`${r.route_id}_${r.direction}`] = r;
    });

    lastRealtimeSyncMs = Date.now();
    lastSyncTimeEl.textContent = `GPS: ${new Date().toLocaleTimeString("pt-BR")}`;
    liveStatusText.textContent = "GPS Ao Vivo • EMDEC";
    updateRealtimeCardsAndMarkers();
  } catch (e) {
    console.warn("Tentando fallback local /api/realtime:", e);
    try {
      const res = await fetch("/api/realtime?all=1");
      const data = await res.json();
      if (data.status === "ok" && data.directions) {
        realtimeDirections = data.directions;
        lastRealtimeSyncMs = Date.now();
        liveStatusText.textContent = "GPS Ao Vivo • Local";
        updateRealtimeCardsAndMarkers();
      }
    } catch {
      liveStatusText.textContent = "GPS Offline";
    }
  }
}

function syncActiveModeTabs() {
  tabMorning.classList.toggle("active", currentMode === "MORNING");
  tabAfternoon.classList.toggle("active", currentMode === "AFTERNOON");
  tabExplore.classList.toggle("active", currentMode === "EXPLORE");

  if (currentMode === "EXPLORE") {
    commutePanel.style.display = "none";
    explorePanel.style.display = "flex";
  } else {
    commutePanel.style.display = "flex";
    explorePanel.style.display = "none";
  }
}

function renderActiveView(shouldFitBounds = false) {
  if (!transitData) return;
  routeLayerGroup.clearLayers();
  pinsLayerGroup.clearLayers();

  if (currentMode === "EXPLORE") {
    renderExploreView(shouldFitBounds);
  } else {
    renderCommutePreset(COMMUTE_PRESETS[currentMode], shouldFitBounds);
  }
  updateRealtimeCardsAndMarkers();
}

function renderCommutePreset(preset, shouldFitBounds) {
  document.getElementById("commute-window-tag").textContent = preset.windowTag;
  document.getElementById("commute-title").textContent = preset.title;
  document.getElementById("commute-desc").textContent = preset.description;

  const s1 = preset.step1;
  const s1Chip = document.getElementById("step1-line-chip");
  s1Chip.textContent = s1.lineLabel;
  s1Chip.style.backgroundColor = s1.color;
  document.getElementById("step1-board-box").style.borderLeftColor = s1.color;
  document.getElementById("step1-board-title").textContent = s1.boardTitle;
  document.getElementById("step1-habitual").innerHTML = s1.habitualHtml;
  document.getElementById("step1-alight-title").textContent = s1.alightTitle;
  document.getElementById("step1-alight-meta").textContent = s1.alightMeta;

  document.getElementById("transfer-title").textContent = preset.transfer.title;
  document.getElementById("transfer-subtitle").textContent = preset.transfer.subtitle;

  const s2 = preset.step2;
  const s2Chip = document.getElementById("step2-line-chip");
  s2Chip.textContent = s2.lineLabel;
  s2Chip.style.backgroundColor = s2.color;
  document.getElementById("step2-board-box").style.borderLeftColor = s2.color;
  document.getElementById("step2-board-title").textContent = s2.boardTitle;
  document.getElementById("step2-habitual").innerHTML = s2.habitualHtml;
  document.getElementById("step2-alight-title").textContent = s2.alightTitle;
  document.getElementById("step2-alight-meta").textContent = s2.alightMeta;

  const boundsGroup = L.featureGroup();
  const leg1Coords = drawCommuteLegOnMap(s1, "1", "2", boundsGroup);
  const leg2Coords = drawCommuteLegOnMap(s2, "3", "4", boundsGroup);

  if (leg1Coords.alightLatLng && leg2Coords.boardLatLng) {
    const walkLine = L.polyline([leg1Coords.alightLatLng, leg2Coords.boardLatLng], {
      color: "#f59e0b",
      weight: 4,
      dashArray: "4, 8",
      opacity: 0.95,
    }).addTo(routeLayerGroup);
    walkLine.bindPopup(`<strong>${preset.transfer.title}</strong><br>${preset.transfer.subtitle}`);
  }

  document.getElementById("btn-focus-step1").onclick = () => {
    if (leg1Coords.boardLatLng) map.flyTo(leg1Coords.boardLatLng, 16, { duration: 0.7 });
  };
  document.getElementById("btn-focus-transfer").onclick = () => {
    if (leg1Coords.alightLatLng && leg2Coords.boardLatLng) {
      map.fitBounds(L.latLngBounds([leg1Coords.alightLatLng, leg2Coords.boardLatLng]), {
        padding: [70, 70],
        maxZoom: 17,
      });
    }
  };
  document.getElementById("btn-focus-step2").onclick = () => {
    if (leg2Coords.alightLatLng) map.flyTo(leg2Coords.alightLatLng, 16, { duration: 0.7 });
  };

  if (shouldFitBounds && boundsGroup.getLayers().length > 0) {
    map.fitBounds(boundsGroup.getBounds(), { padding: [40, 40] });
  }
}

function drawCommuteLegOnMap(stepCfg, numBoard, numAlight, boundsGroup) {
  const route = transitData.routes[stepCfg.routeId];
  if (!route) return {};
  const dirData = route.directions[stepCfg.direction];
  if (!dirData) return {};

  const boardStop = dirData.stops.find((s) => s.stop_id === stepCfg.boardStopId) || dirData.stops[0];
  const alightStop =
    dirData.stops.find((s) => s.stop_id === stepCfg.alightStopId) || dirData.stops[dirData.stops.length - 1];

  const iStart = Math.min(boardStop.shape_index, alightStop.shape_index);
  const iEnd = Math.max(boardStop.shape_index, alightStop.shape_index);

  if (iStart > 0) {
    const approachShape = dirData.shape.slice(0, iStart + 1);
    L.polyline(approachShape, {
      color: stepCfg.color,
      weight: 3.5,
      opacity: 0.38,
      dashArray: "6, 8",
    }).addTo(routeLayerGroup);
  }

  const rideShape = dirData.shape.slice(iStart, iEnd + 1);
  if (rideShape.length > 0) {
    L.polyline(rideShape, {
      color: "#ffffff",
      weight: 9,
      opacity: 0.92,
    }).addTo(routeLayerGroup);

    const activeLine = L.polyline(rideShape, {
      color: stepCfg.color,
      weight: 5.5,
      opacity: 0.96,
    }).addTo(routeLayerGroup);

    boundsGroup.addLayer(activeLine);
  }

  const boardLatLng = [boardStop.lat, boardStop.lon];
  const alightLatLng = [alightStop.lat, alightStop.lon];

  addNumberedCommutePin(boardLatLng, numBoard, stepCfg.boardPinLabel, stepCfg.color, stepCfg.boardTitle);
  addNumberedCommutePin(alightLatLng, numAlight, stepCfg.alightPinLabel, "#0f172a", stepCfg.alightTitle);

  return { boardLatLng, alightLatLng };
}

function addNumberedCommutePin(latlng, numberStr, badgeText, bgColor, fullAddress) {
  const icon = L.divIcon({
    className: "commute-pin-icon",
    iconSize: [220, 28],
    iconAnchor: [14, 14],
    html: `
      <div class="commute-pin-wrap">
        <div class="commute-pin-circle" style="background:${bgColor}">${numberStr}</div>
        <span class="commute-pin-label">${badgeText}</span>
      </div>
    `,
  });

  const m = L.marker(latlng, { icon, zIndexOffset: 800 }).addTo(pinsLayerGroup);
  m.bindPopup(`<strong>${badgeText}</strong><br><span style="font-size:0.78rem;color:#475569">${fullAddress}</span>`);
}

function updateRealtimeCardsAndMarkers() {
  if (!transitData) return;

  if (currentMode === "EXPLORE") {
    const dirKey = `${exploreRouteId}_${exploreDirection}`;
    const rtDir = realtimeDirections[dirKey];
    renderBusMarkersOnMap(rtDir ? rtDir.active_vehicles || [] : []);
    return;
  }

  const preset = COMMUTE_PRESETS[currentMode];
  const s1Key = `${preset.step1.routeId}_${preset.step1.direction}`;
  const s2Key = `${preset.step2.routeId}_${preset.step2.direction}`;

  const rt1 = realtimeDirections[s1Key] || {};
  const rt2 = realtimeDirections[s2Key] || {};

  const preds1 = (rt1.stop_predictions && rt1.stop_predictions[preset.step1.boardStopId]) || [];
  const preds2 = (rt2.stop_predictions && rt2.stop_predictions[preset.step2.boardStopId]) || [];

  renderStepLiveEtas("step1-live-etas", preds1, preset.step1, s1Key);
  renderStepLiveEtas("step2-live-etas", preds2, preset.step2, s2Key);
  updateTransferSyncStatus(preds1, preds2, preset);

  const combinedBuses = [...(rt1.active_vehicles || []), ...(rt2.active_vehicles || [])];
  renderBusMarkersOnMap(combinedBuses);
}

function renderStepLiveEtas(containerId, preds, stepCfg, dirKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!preds || preds.length === 0) {
    container.innerHTML = `
      <div class="eta-row-card">
        <div class="eta-bus-desc">
          <span class="eta-bus-status">Sem veículo próximo nos próximos minutos</span>
          <span class="eta-bus-sub">Horários de referência: ${stepCfg.targetWindow.join(" • ")}</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = preds
    .slice(0, 2)
    .map((p) => {
      const isLive = p.is_realtime;
      const arrivalAtBoardClock = formatArrivalClockTime(p.eta_sec);
      const arrivalAtDestClock = formatArrivalClockTime(p.eta_sec + stepCfg.rideTimeSec);
      const busKey = `${dirKey}_${p.vehicle_id}`;

      return `
        <div class="eta-row-card ${isLive ? "is-live" : ""}" data-bus-key="${busKey}">
          <div class="eta-bus-left">
            <span class="eta-bus-badge ${isLive ? "live" : ""}">#${p.vehicle_id}</span>
            <div class="eta-bus-desc">
              <span class="eta-bus-status">${isLive ? "GPS Ao Vivo na Via" : "Programado na Tabela"}</span>
              <span class="eta-bus-sub">Passa às <strong>${arrivalAtBoardClock}</strong> &rarr; Desce às <strong>~${arrivalAtDestClock}</strong></span>
            </div>
          </div>
          <div class="eta-time-right">
            <span class="eta-countdown">${formatEtaSeconds(p.eta_sec)}</span>
            <span class="eta-clock-arrival">${isLive ? "Tempo Real" : "Estimado"}</span>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".eta-row-card[data-bus-key]").forEach((row) => {
    row.addEventListener("click", () => {
      const key = row.dataset.busKey;
      const marker = busMarkersByKey.get(key);
      if (marker) {
        map.flyTo(marker.getLatLng(), 16, { duration: 0.7 });
        marker.openPopup();
      }
    });
  });
}

function updateTransferSyncStatus(preds1, preds2, preset) {
  const radarEl = document.getElementById("transfer-radar-status");
  if (!radarEl) return;

  if (!preds1.length || !preds2.length) {
    radarEl.textContent = `Janela alvo no Centro: ${preset.step2.targetWindow.join(" • ")}`;
    return;
  }

  const firstBus = preds1[0];
  const readyAtTransferSec = firstBus.eta_sec + preset.step1.rideTimeSec + preset.transfer.walkSeconds;
  const readyClock = formatArrivalClockTime(readyAtTransferSec);

  const reachableBus2 = preds2.find((p2) => p2.eta_sec >= readyAtTransferSec - 45);

  if (reachableBus2) {
    const waitMin = Math.max(0, Math.round((reachableBus2.eta_sec - readyAtTransferSec) / 60));
    const bus2Clock = formatArrivalClockTime(reachableBus2.eta_sec);
    if (waitMin <= 3) {
      radarEl.innerHTML = `⚡ <strong>Conexão Rápida:</strong> Chega no Centro às <strong>${readyClock}</strong> e pega o <strong>#${reachableBus2.vehicle_id}</strong> às <strong>${bus2Clock}</strong> (espera ~${waitMin} min).`;
    } else {
      radarEl.innerHTML = `✅ <strong>Conexão Tranquila:</strong> Chega no Centro às <strong>${readyClock}</strong> e pega o <strong>#${reachableBus2.vehicle_id}</strong> às <strong>${bus2Clock}</strong> (espera ~${waitMin} min).`;
    }
  } else {
    const nextImmediate = preds2[0];
    radarEl.innerHTML = `ℹ️ Próximo <strong>${preset.step2.routeId} (#${nextImmediate.vehicle_id})</strong> passa no Centro em <strong>${formatEtaSeconds(nextImmediate.eta_sec)}</strong> (${formatArrivalClockTime(nextImmediate.eta_sec)}).`;
  }
}

function renderBusMarkersOnMap(vehicles) {
  busesLayerGroup.clearLayers();
  busMarkersByKey.clear();

  vehicles.forEach((v) => {
    const key = `${v.route_id}_${v.direction}_${v.vehicle_id}`;
    const isLive = v.is_realtime;

    const icon = L.divIcon({
      className: "bus-map-marker",
      iconSize: [92, 34],
      iconAnchor: [46, 17],
      html: `
        <div class="bus-marker-container">
          <div class="bus-marker-bubble ${isLive ? "is-live" : ""}">
            <span>🚌 ${v.route_id} • #${v.vehicle_id}</span>
          </div>
        </div>
      `,
    });

    const marker = L.marker([v.lat, v.lon], {
      icon,
      zIndexOffset: isLive ? 1000 : 500,
    });

    marker.bindPopup(`
      <div style="min-width:210px;">
        <strong>Ônibus ${v.route_id} • Prefixo #${v.vehicle_id}</strong><br>
        <span style="font-size:0.75rem;color:${isLive ? "#059669" : "#64748b"};font-weight:700;">
          ${v.status_label}
        </span>
        <div style="font-size:0.75rem;color:#334155;margin-top:6px;">
          <strong>Próxima parada:</strong> ${v.next_stop_name}<br>
          <strong>Chegada na parada:</strong> ${formatEtaSeconds(v.eta_next_stop_sec)}
        </div>
      </div>
    `);

    busesLayerGroup.addLayer(marker);
    busMarkersByKey.set(key, marker);
  });
}

function tickSmoothVehicles() {
  if (!transitData || !lastRealtimeSyncMs) return;
  const elapsedSec = (Date.now() - lastRealtimeSyncMs) / 1000.0;
  if (elapsedSec <= 0 || elapsedSec > 30) return;

  Object.values(realtimeDirections).forEach((rtDir) => {
    const route = transitData.routes[rtDir.route_id];
    if (!route) return;
    const dirData = route.directions[rtDir.direction];
    if (!dirData || !dirData.stops || !dirData.shape) return;

    const stops = dirData.stops;
    const shape = dirData.shape;
    const cumDist = dirData.shape_cum_dist_m;
    const totalTravelSec = dirData.total_travel_time_sec;

    (rtDir.active_vehicles || []).forEach((v) => {
      if (v.state !== "IN_TRANSIT") return;
      const curTau = Math.min(totalTravelSec, Math.max(0, v.tau_sec + elapsedSec));

      let segK = 0;
      for (let k = 0; k < stops.length - 1; k++) {
        if (curTau >= stops[k].travel_time_sec && curTau <= stops[k + 1].travel_time_sec) {
          segK = k;
          break;
        }
      }
      const stPrev = stops[segK];
      const stNext = stops[Math.min(stops.length - 1, segK + 1)];
      const dtSeg = Math.max(1, stNext.travel_time_sec - stPrev.travel_time_sec);
      const alpha = Math.max(0, Math.min(1, (curTau - stPrev.travel_time_sec) / dtSeg));
      const targetDistM = stPrev.dist_m + alpha * (stNext.dist_m - stPrev.dist_m);

      const pos = interpolateAlongShape(shape, cumDist, targetDistM);
      const key = `${v.route_id}_${v.direction}_${v.vehicle_id}`;
      const marker = busMarkersByKey.get(key);
      if (marker) marker.setLatLng([pos.lat, pos.lon]);
    });
  });
}

function renderExploreView(shouldFitBounds) {
  const route = transitData.routes[exploreRouteId];
  if (!route) return;
  const dirData = route.directions[exploreDirection];
  if (!dirData) return;

  const poly = L.polyline(dirData.shape, {
    color: route.color,
    weight: 5,
    opacity: 0.9,
  }).addTo(routeLayerGroup);

  if (shouldFitBounds) {
    map.fitBounds(poly.getBounds(), { padding: [36, 36] });
  }

  const listEl = document.getElementById("stops-timeline");
  const q = (document.getElementById("stop-search").value || "").trim().toLowerCase();
  listEl.innerHTML = "";

  dirData.stops.forEach((st) => {
    const m = L.circleMarker([st.lat, st.lon], {
      radius: 5,
      fillColor: "#ffffff",
      color: route.color,
      weight: 2.5,
      fillOpacity: 1,
    }).addTo(pinsLayerGroup);
    m.bindPopup(`<strong>${st.sequence}. ${st.name}</strong><br><small>Horários: ${st.departures.slice(0, 8).join(", ")}</small>`);

    if (q && !st.name.toLowerCase().includes(q)) return;

    const li = document.createElement("li");
    li.className = "stop-item";
    li.innerHTML = `
      <div class="stop-name">${st.sequence}. ${st.name}</div>
      <div class="stop-sched">Horários: ${st.departures.join(", ")}</div>
    `;
    li.onclick = () => {
      map.flyTo([st.lat, st.lon], 17, { duration: 0.6 });
      m.openPopup();
    };
    listEl.appendChild(li);
  });
}

function setupEventListeners() {
  [tabMorning, tabAfternoon, tabExplore].forEach((tab) => {
    tab.addEventListener("click", () => {
      currentMode = tab.dataset.mode;
      syncActiveModeTabs();
      renderActiveView(true);
      fetchRealtimeData();
    });
  });

  document.getElementById("btn-fit-commute").addEventListener("click", () => {
    renderActiveView(true);
  });

  document.getElementById("btn-refresh-rt").addEventListener("click", () => {
    fetchRealtimeData();
  });

  // Botão "📍 Meu GPS" para localizar o usuário na rua pelo celular
  document.getElementById("btn-my-gps").addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada neste navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        if (!userGpsMarker) {
          const icon = L.divIcon({
            className: "user-gps-marker",
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            html: `<div class="user-gps-dot"></div>`,
          });
          userGpsMarker = L.marker(latlng, { icon, zIndexOffset: 1200 }).addTo(map);
          userGpsMarker.bindPopup("<strong>📍 Você está aqui</strong>");
        } else {
          userGpsMarker.setLatLng(latlng);
        }
        map.flyTo(latlng, 16, { duration: 0.8 });
        userGpsMarker.openPopup();
      },
      () => {
        alert("Ative a localização (GPS) do celular e permita o acesso no navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // Botão Mobile para expandir/reduzir área do mapa
  const appLayout = document.getElementById("app-layout");
  document.getElementById("btn-toggle-mobile-map").addEventListener("click", () => {
    appLayout.classList.toggle("map-expanded");
    setTimeout(() => map.invalidateSize(), 280);
  });

  // Prompt de Instalação PWA no Android
  const btnInstall = document.getElementById("btn-install-pwa");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    btnInstall.style.display = "inline-block";
  });

  btnInstall.addEventListener("click", async () => {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    await deferredPwaPrompt.userChoice;
    deferredPwaPrompt = null;
    btnInstall.style.display = "none";
  });

  document.querySelectorAll(".line-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".line-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      exploreRouteId = btn.dataset.route;
      renderActiveView(true);
      fetchRealtimeData();
    });
  });

  document.querySelectorAll(".dir-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dir-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      exploreDirection = btn.dataset.dir;
      renderActiveView(true);
      fetchRealtimeData();
    });
  });

  document.getElementById("stop-search").addEventListener("input", () => {
    if (currentMode === "EXPLORE") renderExploreView(false);
  });
}

initApp();
