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
    windowTag: "MANHÃ • FAIXA DAS 06:40 ÀS 07:55",
    title: "Ida ao Estágio: Pastelaria Tropical → Cristália",
    description:
      "Pega o 330 na Romeu Tórtima (6:46 ou 6:56–6:57), desce na Senador Saraiva (7:14–7:32), muda de lado na ilha e pega o 386 (7:20–7:45) até o Cristália (~7:35–7:50).",
    step1: {
      routeId: "330",
      direction: "VOLTA",
      lineLabel: "Linha 330 (Sentido Centro)",
      color: "#0284c7",
      boardStopId: "af0f7747-4677-11ed-98db-5adc55d213d0",
      boardTitle: "Av. Dr. Romeu Tórtima, 1575 (Pastelaria Tropical)",
      boardPinLabel: "1. Pegar 330 • Pastelaria Tropical",
      habitualHtml:
        "Real testado: <strong>06:46 (#3275)</strong> e <strong>06:56–06:57</strong> &bull; Tabela: <strong>06:46, 06:58, 07:10</strong>",
      alightStopId: "af037fee-4677-11ed-98db-5adc55d213d0",
      alightTitle: "Av. Senador Saraiva, 767 / 676 (Centro)",
      alightPinLabel: "2. Descer 330 • Sen. Saraiva 767",
      alightMeta: "~28 min reais no pico (06:46 → 07:14; ou 06:56 → 07:28–07:32)",
      rideTimeSec: 1680,
      gtfsBaseRideSec: 1336,
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
        "Real testado: <strong>07:20 (#287)</strong>, <strong>07:31–07:45</strong> &bull; Tabela: <strong>07:16, 07:24, 07:32, 07:40</strong>",
      alightStopId: "af05d0b2-4677-11ed-98db-5adc55d213d0",
      alightTitle: "Av. José de Souza Campos, 1358 (Cristália - Cambuí)",
      alightPinLabel: "4. Estágio Cristália (Norte-Sul, 1358)",
      alightMeta: "~14 min de viagem (chegada real: ~07:34 a 07:50)",
      rideTimeSec: 840,
      gtfsBaseRideSec: 830,
      targetWindow: ["07:16", "07:24", "07:32", "07:40", "07:48"],
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
      rideTimeSec: 680,
      gtfsBaseRideSec: 663,
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
      rideTimeSec: 1120,
      gtfsBaseRideSec: 1108,
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
    if (boardedRide && boardedRide.destStopId === st.stop_id) idxSet.add(idx);
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
    stopPredictions[st.stop_id] = arrivals.slice(0, 8);
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
let boardedRide = null; // { routeId, direction, vehicleId, destStopId, boardedAtMs }

// Controle de Economia de Limites e Pausa Inteligente
let userForcedTracking = null; // null = segue agenda automática; true = forçado ligado; false = forçado pausado
let pollingTimer = null;
const POLLING_INTERVAL_MS = 12000;

const busMarkersByKey = new Map();

// Elementos DOM
const liveStatusText = document.getElementById("live-status-text");
const livePulseDot = document.getElementById("live-pulse-dot");
const liveClockEl = document.getElementById("live-clock");
const lastSyncTimeEl = document.getElementById("last-sync-time");

const tabMorning = document.getElementById("tab-morning");
const tabAfternoon = document.getElementById("tab-afternoon");
const tabExplore = document.getElementById("tab-explore");

const commutePanel = document.getElementById("commute-panel");
const explorePanel = document.getElementById("explore-panel");
const activeRideBanner = document.getElementById("active-ride-banner");

/**
 * Verifica se o horário atual está dentro da janela de estágio:
 * Segunda a Sexta: 06:25 às 08:15 (manhã) OU 15:00 às 16:30 (tarde)
 */
function isAutoCommuteWindow(date = new Date()) {
  const day = date.getDay();
  // 0 = Domingo, 6 = Sábado
  if (day === 0 || day === 6) return false;

  const minutes = date.getHours() * 60 + date.getMinutes();
  // Manhã: 06:25 (385) às 08:15 (495)
  const isMorning = minutes >= 385 && minutes <= 495;
  // Tarde: 15:00 (900) às 16:30 (990)
  const isAfternoon = minutes >= 900 && minutes <= 990;

  return isMorning || isAfternoon;
}

function isTrackingActive() {
  if (boardedRide) return true; // Se o usuário está dentro de um ônibus, mantém o rastreamento ativo
  if (userForcedTracking !== null) return userForcedTracking;
  return isAutoCommuteWindow();
}

function updateEcoBarAndStatus() {
  const ecoBar = document.getElementById("eco-bar");
  const ecoIcon = document.getElementById("eco-icon");
  const ecoTitle = document.getElementById("eco-title");
  const ecoSubtitle = document.getElementById("eco-subtitle");
  const btnToggle = document.getElementById("btn-toggle-tracking");

  const active = isTrackingActive();
  const inWindow = isAutoCommuteWindow();

  if (active) {
    ecoBar?.classList.add("is-live-mode");
    if (boardedRide) {
      if (ecoIcon) ecoIcon.textContent = "🚍";
      if (ecoTitle) ecoTitle.textContent = `Embarcado no #${boardedRide.vehicleId}`;
      if (ecoSubtitle) ecoSubtitle.textContent = "Acompanhando trajeto ao vivo";
    } else if (inWindow && userForcedTracking === null) {
      if (ecoIcon) ecoIcon.textContent = "🟢";
      if (ecoTitle) ecoTitle.textContent = "GPS Ao Vivo • Horário de Pico";
      if (ecoSubtitle) ecoSubtitle.textContent = "Seg–Sex 6h25–8h15 e 15h–16h30 (a cada 12s)";
    } else {
      if (ecoIcon) ecoIcon.textContent = "⚡";
      if (ecoTitle) ecoTitle.textContent = "GPS Ligado Manualmente";
      if (ecoSubtitle) ecoSubtitle.textContent = "Rastreamento ativado por você";
    }

    if (btnToggle) {
      btnToggle.textContent = "⏸️ Pausar GPS";
      btnToggle.classList.add("active");
    }
    if (liveStatusText) liveStatusText.textContent = "Ao Vivo";
    if (livePulseDot) livePulseDot.style.display = "inline-block";
  } else {
    ecoBar?.classList.remove("is-live-mode");
    if (ecoIcon) ecoIcon.textContent = "⏸️";
    if (ecoTitle) ecoTitle.textContent = "GPS em Pausa (Economia)";
    if (ecoSubtitle) ecoSubtitle.textContent = "Fora do horário para poupar limites e bateria";
    if (btnToggle) {
      btnToggle.textContent = "▶️ Ligar GPS";
      btnToggle.classList.remove("active");
    }
    if (liveStatusText) liveStatusText.textContent = "Pausado";
    if (livePulseDot) livePulseDot.style.display = "none";
  }
}

function syncPollingState() {
  updateEcoBarAndStatus();
  if (isTrackingActive()) {
    if (!pollingTimer) {
      pollingTimer = setInterval(fetchRealtimeData, POLLING_INTERVAL_MS);
    }
  } else {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }
}

function toggleTracking() {
  const current = isTrackingActive();
  userForcedTracking = !current;
  syncPollingState();
  if (userForcedTracking) {
    fetchRealtimeData();
  }
}

function loadBoardedRideFromStorage() {
  try {
    const raw = localStorage.getItem("radar_estagio_boarded_ride");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.vehicleId && Date.now() - (parsed.boardedAtMs || 0) < 3 * 3600 * 1000) {
      boardedRide = parsed;
    } else {
      localStorage.removeItem("radar_estagio_boarded_ride");
    }
  } catch {
    boardedRide = null;
  }
}

function saveBoardedRideToStorage() {
  try {
    if (boardedRide) {
      localStorage.setItem("radar_estagio_boarded_ride", JSON.stringify(boardedRide));
    } else {
      localStorage.removeItem("radar_estagio_boarded_ride");
    }
  } catch {}
}

function getDefaultDestStopForLine(routeId, direction) {
  if (routeId === "330" && direction === "VOLTA") return "af037fee-4677-11ed-98db-5adc55d213d0"; // Senador Saraiva 676
  if (routeId === "386" && direction === "VOLTA") return "af05d0b2-4677-11ed-98db-5adc55d213d0"; // Cristália
  if (routeId === "382" && direction === "IDA") return "af04204f-4677-11ed-98db-5adc55d213d0"; // Benjamin Constant 1633
  if (routeId === "330" && direction === "IDA") return "af0f6d7d-4677-11ed-98db-5adc55d213d0"; // Oxxo Romeu Tórtima 1550
  const dirData = transitData?.routes?.[routeId]?.directions?.[direction];
  if (dirData && dirData.stops && dirData.stops.length > 0) {
    return dirData.stops[dirData.stops.length - 1].stop_id;
  }
  return "";
}

function boardBus(routeId, direction, vehicleId, destStopId) {
  const targetDest = destStopId || getDefaultDestStopForLine(routeId, direction);
  boardedRide = {
    routeId: String(routeId),
    direction: String(direction),
    vehicleId: String(vehicleId),
    destStopId: targetDest,
    boardedAtMs: Date.now(),
  };
  saveBoardedRideToStorage();
  populateRideDestDropdown();
  updateActiveRideBanner();
  updateRealtimeCardsAndMarkers();
  fetchRealtimeData();

  const key = `${routeId}_${direction}_${vehicleId}`;
  const marker = busMarkersByKey.get(key);
  if (marker) {
    map.flyTo(marker.getLatLng(), 15, { duration: 0.6 });
  }
}

function leaveBus() {
  boardedRide = null;
  saveBoardedRideToStorage();
  if (activeRideBanner) activeRideBanner.style.display = "none";
  updateRealtimeCardsAndMarkers();
}

window.boardBusFromPopup = (routeId, direction, vehicleId) => {
  boardBus(routeId, direction, vehicleId, null);
  map.closePopup();
};

function populateRideDestDropdown() {
  const selectEl = document.getElementById("ride-dest-select");
  if (!selectEl || !boardedRide || !transitData) return;
  const dirData = transitData.routes?.[boardedRide.routeId]?.directions?.[boardedRide.direction];
  if (!dirData || !dirData.stops) return;

  selectEl.innerHTML = dirData.stops
    .map(
      (st) =>
        `<option value="${st.stop_id}" ${st.stop_id === boardedRide.destStopId ? "selected" : ""}>${st.sequence}. ${st.name}</option>`
    )
    .join("");
}

/**
 * Calcula de forma dinâmica (em tempo real via GPS Cittamobi + calibração de trânsito)
 * o tempo restante em segundos até o ponto de descida (destStopId).
 */
function computeDynamicDestEtaSec(vehicleId, etaBoardSec, stepCfg, rtDir, dirData) {
  const destStopId = stepCfg.alightStopId;
  const boardStop = dirData?.stops?.find((s) => s.stop_id === stepCfg.boardStopId);
  const destStop = dirData?.stops?.find((s) => s.stop_id === destStopId);

  const gtfsSegSec =
    boardStop && destStop
      ? Math.max(60, destStop.travel_time_sec - boardStop.travel_time_sec)
      : stepCfg.gtfsBaseRideSec || stepCfg.rideTimeSec;
  const trafficRatio = stepCfg.rideTimeSec / Math.max(1, gtfsSegSec);

  // 1) Verifica se o Cittamobi já tem previsão direta por GPS para este prefixo no ponto de descida
  const directDestList = rtDir?.stop_predictions?.[destStopId] || [];
  const directMatch = directDestList.find((p) => p.vehicle_id === vehicleId);

  if (directMatch) {
    // Se o ônibus ainda não passou no ponto de embarque, somamos o tempo até o embarque + o trecho calibrado
    if (etaBoardSec !== null && etaBoardSec > 0) {
      const rawSegFromCittamobi = Math.max(60, directMatch.eta_sec - etaBoardSec);
      const calibratedSeg = Math.round(rawSegFromCittamobi * Math.max(1, trafficRatio));
      return etaBoardSec + calibratedSeg;
    }
    // Se o ônibus JÁ passou do ponto de embarque e está a caminho da descida:
    return Math.max(0, Math.round(directMatch.eta_sec * Math.max(1, trafficRatio * 0.95)));
  }

  // 2) Se não estiver na lista curta do ponto de descida, calcula pela posição tau_sec do veículo na linha
  const activeVeh = (rtDir?.active_vehicles || []).find((v) => v.vehicle_id === vehicleId);
  if (activeVeh && destStop) {
    const elapsedSec = lastRealtimeSyncMs ? Math.max(0, (Date.now() - lastRealtimeSyncMs) / 1000.0) : 0;
    const curTau = activeVeh.tau_sec + elapsedSec;
    if (etaBoardSec !== null && etaBoardSec > 0) {
      return etaBoardSec + stepCfg.rideTimeSec;
    }
    const remGtfsSec = Math.max(0, destStop.travel_time_sec - curTau);
    return Math.round(remGtfsSec * Math.max(1, trafficRatio));
  }

  return (etaBoardSec || 0) + stepCfg.rideTimeSec;
}

function updateActiveRideBanner() {
  if (!activeRideBanner) return;
  if (!boardedRide || !transitData) {
    activeRideBanner.style.display = "none";
    return;
  }

  activeRideBanner.style.display = "flex";
  const { routeId, direction, vehicleId, destStopId } = boardedRide;
  const dirKey = `${routeId}_${direction}`;
  const dirData = transitData.routes?.[routeId]?.directions?.[direction];
  const rtDir = realtimeDirections[dirKey];

  const titleEl = document.getElementById("ride-title-tag");
  const nextStopNameEl = document.getElementById("ride-next-stop-name");
  const nextStopEtaEl = document.getElementById("ride-next-stop-eta");
  const progressFillEl = document.getElementById("ride-progress-fill");
  const stopsLeftEl = document.getElementById("ride-stops-left");
  const destClockEl = document.getElementById("ride-dest-clock");
  const destCountdownEl = document.getElementById("ride-dest-countdown");

  if (!dirData) return;

  const selectEl = document.getElementById("ride-dest-select");
  if (selectEl && selectEl.options.length === 0) {
    populateRideDestDropdown();
  }

  const destStop =
    dirData.stops.find((s) => s.stop_id === destStopId) || dirData.stops[dirData.stops.length - 1];
  const elapsedSec = lastRealtimeSyncMs ? Math.min(25, Math.max(0, (Date.now() - lastRealtimeSyncMs) / 1000.0)) : 0;

  const veh = (rtDir?.active_vehicles || []).find((v) => v.vehicle_id === vehicleId);
  const directDestPred = (rtDir?.stop_predictions?.[destStop.stop_id] || []).find(
    (p) => p.vehicle_id === vehicleId
  );

  // Fator de calibração de pico para a linha 330 VOLTA de manhã (28 min reais vs 22 min tabela)
  const isMorning330Peak =
    routeId === "330" && direction === "VOLTA" && new Date().getHours() >= 6 && new Date().getHours() <= 9;
  const speedScale = isMorning330Peak ? 1680 / 1336 : 1.0;

  if (veh) {
    const curTau = veh.tau_sec + elapsedSec;
    titleEl.textContent = `🚌 No Ônibus ${routeId} • #${vehicleId} (${veh.is_realtime ? "GPS Ao Vivo" : "Estimado"})`;

    // Encontrar a próxima parada imediata na rua
    let nextStopObj = dirData.stops.find((s) => s.sequence === veh.next_stop_sequence) || dirData.stops[0];
    for (let k = 0; k < dirData.stops.length; k++) {
      if (dirData.stops[k].travel_time_sec >= curTau) {
        nextStopObj = dirData.stops[k];
        break;
      }
    }

    const etaNextSec = Math.max(0, Math.round(nextStopObj.travel_time_sec - curTau));
    nextStopNameEl.textContent = `${nextStopObj.sequence}. ${nextStopObj.name}`;
    nextStopEtaEl.textContent = `${formatEtaSeconds(etaNextSec)} (${formatArrivalClockTime(etaNextSec)})`;

    // Calcular tempo até o ponto de descida escolhido
    let etaDestSec = 0;
    if (directDestPred) {
      etaDestSec = Math.max(0, Math.round((directDestPred.eta_sec - elapsedSec) * speedScale));
    } else {
      etaDestSec = Math.max(0, Math.round((destStop.travel_time_sec - curTau) * speedScale));
    }

    const stopsRemaining = Math.max(0, destStop.sequence - nextStopObj.sequence + 1);
    const pct = Math.max(
      5,
      Math.min(100, Math.round((nextStopObj.sequence / Math.max(1, destStop.sequence)) * 100))
    );
    progressFillEl.style.width = `${pct}%`;

    if (stopsRemaining === 0 || etaDestSec <= 25) {
      stopsLeftEl.textContent = "🔔 Prepare-se para descer!";
      destClockEl.textContent = "Agora";
      destCountdownEl.textContent = "(chegando no ponto)";
    } else {
      stopsLeftEl.textContent = `Faltam ${stopsRemaining} ${stopsRemaining === 1 ? "parada" : "paradas"}`;
      destClockEl.textContent = `~${formatArrivalClockTime(etaDestSec)}`;
      destCountdownEl.textContent = `(${formatEtaSeconds(etaDestSec)})`;
    }
  } else if (directDestPred) {
    const etaDestSec = Math.max(0, Math.round((directDestPred.eta_sec - elapsedSec) * speedScale));
    titleEl.textContent = `🚌 No Ônibus ${routeId} • #${vehicleId}`;
    nextStopNameEl.textContent = `Rumo a ${destStop.name}`;
    nextStopEtaEl.textContent = formatEtaSeconds(etaDestSec);
    progressFillEl.style.width = "65%";
    stopsLeftEl.textContent = "Em trânsito até sua descida";
    destClockEl.textContent = `~${formatArrivalClockTime(etaDestSec)}`;
    destCountdownEl.textContent = `(${formatEtaSeconds(etaDestSec)})`;
  } else {
    titleEl.textContent = `🚌 No Ônibus ${routeId} • #${vehicleId}`;
    nextStopNameEl.textContent = "Sincronizando posição GPS na via...";
    nextStopEtaEl.textContent = "Aguarde";
  }
}

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

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  loadBoardedRideFromStorage();

  const curHour = new Date().getHours();
  currentMode = curHour >= 12 && curHour < 19 ? "AFTERNOON" : "MORNING";

  try {
    const res = await fetch("data/transit_data.json");
    transitData = await res.json();

    setupEventListeners();
    if (boardedRide) {
      populateRideDestDropdown();
      updateActiveRideBanner();
    }
    syncActiveModeTabs();
    renderActiveView(true);

    // Atualização inicial única
    await fetchRealtimeData();

    // Sincroniza estado de economia e inicia polling periódico se ativo
    syncPollingState();

    // Verifica a cada 20 segundos se entrou ou saiu do horário de pico (Seg-Sex 6h25-8h15 e 15h-16h30)
    setInterval(() => {
      syncPollingState();
    }, 20000);

    setInterval(tickSmoothVehicles, 1000);
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    if (liveStatusText) liveStatusText.textContent = "Erro";
  }
}

async function fetchRealtimeData() {
  if (!transitData || !transitData.routes) return;
  try {
    if (liveStatusText) liveStatusText.textContent = "Sincronizando...";

    const pairKeySet = new Set();
    const pairsToFetch = [];
    const addPair = (rId, dKey) => {
      const k = `${rId}_${dKey}`;
      if (!pairKeySet.has(k) && transitData.routes[rId]?.directions?.[dKey]) {
        pairKeySet.add(k);
        pairsToFetch.push([rId, dKey]);
      }
    };

    if (currentMode === "EXPLORE") {
      addPair(exploreRouteId, exploreDirection);
    } else {
      const preset = COMMUTE_PRESETS[currentMode];
      addPair(preset.step1.routeId, preset.step1.direction);
      addPair(preset.step2.routeId, preset.step2.direction);
    }

    if (boardedRide) {
      addPair(boardedRide.routeId, boardedRide.direction);
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
    updateEcoBarAndStatus();
    updateActiveRideBanner();
    updateRealtimeCardsAndMarkers();
  } catch (e) {
    console.warn("Tentando fallback local /api/realtime:", e);
    try {
      const res = await fetch("/api/realtime?all=1");
      const data = await res.json();
      if (data.status === "ok" && data.directions) {
        realtimeDirections = data.directions;
        lastRealtimeSyncMs = Date.now();
        updateEcoBarAndStatus();
        updateActiveRideBanner();
        updateRealtimeCardsAndMarkers();
      }
    } catch {
      if (liveStatusText) liveStatusText.textContent = "Offline";
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
  const s1 = preset.step1;
  const s1Chip = document.getElementById("step1-line-chip");
  if (s1Chip) {
    s1Chip.textContent = s1.routeId;
    s1Chip.style.backgroundColor = s1.color;
  }
  const s1Board = document.getElementById("step1-board-title");
  if (s1Board) s1Board.textContent = s1.boardTitle.replace(/\s*\(.*?\)\s*/g, "");
  const s1Habitual = document.getElementById("step1-habitual");
  if (s1Habitual) s1Habitual.innerHTML = s1.habitualHtml;
  const s1Alight = document.getElementById("step1-alight-title");
  if (s1Alight) s1Alight.textContent = s1.alightTitle;

  const tTitle = document.getElementById("transfer-title");
  if (tTitle) tTitle.textContent = preset.transfer.title;

  const s2 = preset.step2;
  const s2Chip = document.getElementById("step2-line-chip");
  if (s2Chip) {
    s2Chip.textContent = s2.routeId;
    s2Chip.style.backgroundColor = s2.color;
  }
  const s2Board = document.getElementById("step2-board-title");
  if (s2Board) s2Board.textContent = s2.boardTitle.replace(/\s*\(.*?\)\s*/g, "");
  const s2Habitual = document.getElementById("step2-habitual");
  if (s2Habitual) s2Habitual.innerHTML = s2.habitualHtml;
  const s2Alight = document.getElementById("step2-alight-title");
  if (s2Alight) s2Alight.textContent = s2.alightTitle;

  const boundsGroup = L.featureGroup();
  const leg1Coords = drawCommuteLegOnMap(s1, "1", "2", boundsGroup);
  const leg2Coords = drawCommuteLegOnMap(s2, "3", "4", boundsGroup);

  if (leg1Coords.alightLatLng && leg2Coords.boardLatLng) {
    const walkLine = L.polyline([leg1Coords.alightLatLng, leg2Coords.boardLatLng], {
      color: "#f59e0b",
      weight: 3.5,
      dashArray: "4, 6",
      opacity: 0.95,
    }).addTo(routeLayerGroup);
    walkLine.bindPopup(`<strong>${preset.transfer.title}</strong>`);
  }

  if (shouldFitBounds && boundsGroup.getLayers().length > 0) {
    map.fitBounds(boundsGroup.getBounds(), { padding: [35, 35] });
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
    renderExploreActiveBuses(rtDir ? rtDir.active_vehicles || [] : []);
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

  renderStepLiveEtas("step1-live-etas", preds1, preset.step1, s1Key, rt1);
  renderStepLiveEtas("step2-live-etas", preds2, preset.step2, s2Key, rt2);
  updateTransferSyncStatus(preds1, preds2, preset, rt1);

  const combinedBuses = [...(rt1.active_vehicles || []), ...(rt2.active_vehicles || [])];
  renderBusMarkersOnMap(combinedBuses);
}

function renderStepLiveEtas(containerId, preds, stepCfg, dirKey, rtDir) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const dirData = transitData?.routes?.[stepCfg.routeId]?.directions?.[stepCfg.direction];
  const boardStop = dirData?.stops?.find((s) => s.stop_id === stepCfg.boardStopId);
  const alightStop = dirData?.stops?.find((s) => s.stop_id === stepCfg.alightStopId);

  // Também inclui ônibus que JÁ acabaram de passar pelo ponto de embarque e estão em trânsito rumo à descida!
  const approachingIds = new Set((preds || []).map((p) => p.vehicle_id));
  const inTransitVehicles = [];

  if (boardStop && alightStop && rtDir?.active_vehicles) {
    rtDir.active_vehicles.forEach((v) => {
      if (
        v.state === "IN_TRANSIT" &&
        !approachingIds.has(v.vehicle_id) &&
        v.tau_sec >= boardStop.travel_time_sec - 45 &&
        v.tau_sec <= alightStop.travel_time_sec - 30
      ) {
        inTransitVehicles.push(v);
      }
    });
  }

  const rowsHtml = [];

  // 1) Ônibus já na via entre o embarque e a descida (ex: você acabou de entrar no #3275)
  inTransitVehicles.slice(0, 2).forEach((v) => {
    const isLive = v.is_realtime;
    const isBoardedThis =
      boardedRide &&
      boardedRide.routeId === stepCfg.routeId &&
      boardedRide.direction === stepCfg.direction &&
      boardedRide.vehicleId === v.vehicle_id;

    const etaDestSec = computeDynamicDestEtaSec(v.vehicle_id, null, stepCfg, rtDir, dirData);
    const arrivalAtDestClock = formatArrivalClockTime(etaDestSec);
    const busKey = `${dirKey}_${v.vehicle_id}`;

    rowsHtml.push(`
      <div class="eta-row-card ${isLive ? "is-live" : ""} ${isBoardedThis ? "is-boarded" : ""}" data-bus-key="${busKey}">
        <div class="eta-bus-left">
          <span class="eta-bus-badge ${isLive ? "live" : ""}">#${v.vehicle_id}</span>
          <div class="eta-bus-desc">
            <span class="eta-bus-status">${isBoardedThis ? "✅ Você está neste ônibus" : "Na via rumo à descida"}</span>
            <span class="eta-bus-sub">Próx: <strong>${v.next_stop_name}</strong> &rarr; Desce às <strong>~${arrivalAtDestClock}</strong> (${formatEtaSeconds(etaDestSec)})</span>
          </div>
        </div>
        <div class="eta-right-stack">
          <button
            type="button"
            class="btn-board-bus ${isBoardedThis ? "boarded-active" : ""}"
            data-board-route="${stepCfg.routeId}"
            data-board-dir="${stepCfg.direction}"
            data-board-vid="${v.vehicle_id}"
            data-board-dest="${stepCfg.alightStopId}"
          >
            ${isBoardedThis ? "✓ Embarcado" : "🚍 Entrei neste"}
          </button>
        </div>
      </div>
    `);
  });

  // 2) Próximos ônibus chegando no ponto de embarque
  (preds || []).slice(0, 3).forEach((p) => {
    const isLive = p.is_realtime;
    const isBoardedThis =
      boardedRide &&
      boardedRide.routeId === stepCfg.routeId &&
      boardedRide.direction === stepCfg.direction &&
      boardedRide.vehicleId === p.vehicle_id;

    const etaDestSec = computeDynamicDestEtaSec(p.vehicle_id, p.eta_sec, stepCfg, rtDir, dirData);
    const arrivalAtBoardClock = formatArrivalClockTime(p.eta_sec);
    const arrivalAtDestClock = formatArrivalClockTime(etaDestSec);
    const busKey = `${dirKey}_${p.vehicle_id}`;

    rowsHtml.push(`
      <div class="eta-row-card ${isLive ? "is-live" : ""} ${isBoardedThis ? "is-boarded" : ""}" data-bus-key="${busKey}">
        <div class="eta-bus-left">
          <span class="eta-bus-badge ${isLive ? "live" : ""}">#${p.vehicle_id}</span>
          <div class="eta-bus-desc">
            <span class="eta-bus-status">${isBoardedThis ? "✅ Você está neste ônibus" : isLive ? "GPS Ao Vivo • Calculado" : "Programado • Estimado"}</span>
            <span class="eta-bus-sub">Passa às <strong>${arrivalAtBoardClock}</strong> &rarr; Desce às <strong>~${arrivalAtDestClock}</strong></span>
          </div>
        </div>
        <div class="eta-right-stack">
          <div class="eta-time-right">
            <span class="eta-countdown">${formatEtaSeconds(p.eta_sec)}</span>
            <span class="eta-clock-arrival">${isLive ? "GPS Real" : "Estimado"}</span>
          </div>
          <button
            type="button"
            class="btn-board-bus ${isBoardedThis ? "boarded-active" : ""}"
            data-board-route="${stepCfg.routeId}"
            data-board-dir="${stepCfg.direction}"
            data-board-vid="${p.vehicle_id}"
            data-board-dest="${stepCfg.alightStopId}"
          >
            ${isBoardedThis ? "✓ Embarcado" : "🚍 Entrei neste"}
          </button>
        </div>
      </div>
    `);
  });

  if (rowsHtml.length === 0) {
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

  container.innerHTML = rowsHtml.join("");

  container.querySelectorAll(".btn-board-bus").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const rId = btn.dataset.boardRoute;
      const dKey = btn.dataset.boardDir;
      const vId = btn.dataset.boardVid;
      const destId = btn.dataset.boardDest;
      if (
        boardedRide &&
        boardedRide.routeId === rId &&
        boardedRide.direction === dKey &&
        boardedRide.vehicleId === vId
      ) {
        leaveBus();
      } else {
        boardBus(rId, dKey, vId, destId);
      }
    });
  });

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

function updateTransferSyncStatus(preds1, preds2, preset, rt1) {
  const radarEl = document.getElementById("transfer-radar-status");
  if (!radarEl) return;

  const dirData1 = transitData?.routes?.[preset.step1.routeId]?.directions?.[preset.step1.direction];

  // Se o usuário já clicou em "Entrei neste" no ônibus do Passo 1, calcula a conexão a partir dele!
  let readyAtTransferSec = null;
  let step1VehicleLabel = null;

  if (
    boardedRide &&
    boardedRide.routeId === preset.step1.routeId &&
    boardedRide.direction === preset.step1.direction
  ) {
    const etaDestSec = computeDynamicDestEtaSec(
      boardedRide.vehicleId,
      null,
      preset.step1,
      rt1,
      dirData1
    );
    readyAtTransferSec = etaDestSec + preset.transfer.walkSeconds;
    step1VehicleLabel = `#${boardedRide.vehicleId} (embarcado)`;
  } else if (preds1 && preds1.length > 0) {
    const firstBus = preds1[0];
    const etaDestSec = computeDynamicDestEtaSec(
      firstBus.vehicle_id,
      firstBus.eta_sec,
      preset.step1,
      rt1,
      dirData1
    );
    readyAtTransferSec = etaDestSec + preset.transfer.walkSeconds;
    step1VehicleLabel = `#${firstBus.vehicle_id}`;
  }

  if (readyAtTransferSec === null || !preds2 || !preds2.length) {
    radarEl.textContent = `Janela alvo no Centro: ${preset.step2.targetWindow.join(" • ")}`;
    return;
  }

  const readyClock = formatArrivalClockTime(readyAtTransferSec);
  const reachableBus2 = preds2.find((p2) => p2.eta_sec >= readyAtTransferSec - 45);

  if (reachableBus2) {
    const waitMin = Math.max(0, Math.round((reachableBus2.eta_sec - readyAtTransferSec) / 60));
    const bus2Clock = formatArrivalClockTime(reachableBus2.eta_sec);
    if (waitMin <= 4) {
      radarEl.innerHTML = `⚡ <strong>Conexão Rápida (${step1VehicleLabel}):</strong> Na ilha às <strong>${readyClock}</strong> &rarr; pega o <strong>${preset.step2.routeId} #${reachableBus2.vehicle_id}</strong> às <strong>${bus2Clock}</strong> (espera ~${waitMin} min).`;
    } else {
      radarEl.innerHTML = `✅ <strong>Conexão Sincronizada (${step1VehicleLabel}):</strong> Na ilha às <strong>${readyClock}</strong> &rarr; pega o <strong>${preset.step2.routeId} #${reachableBus2.vehicle_id}</strong> às <strong>${bus2Clock}</strong> (espera ~${waitMin} min).`;
    }
  } else {
    const nextImmediate = preds2[0];
    radarEl.innerHTML = `ℹ️ Próximo <strong>${preset.step2.routeId} (#${nextImmediate.vehicle_id})</strong> passa no Centro em <strong>${formatEtaSeconds(nextImmediate.eta_sec)}</strong> (${formatArrivalClockTime(nextImmediate.eta_sec)}).`;
  }
}

function renderExploreActiveBuses(vehicles) {
  const box = document.getElementById("explore-active-buses");
  if (!box) return;
  if (!vehicles || vehicles.length === 0) {
    box.innerHTML = `<div style="font-size:0.72rem;color:#64748b;">Nenhum ônibus em trânsito neste sentido agora.</div>`;
    return;
  }

  box.innerHTML = vehicles
    .slice(0, 4)
    .map((v) => {
      const isBoardedThis =
        boardedRide &&
        boardedRide.routeId === v.route_id &&
        boardedRide.direction === v.direction &&
        boardedRide.vehicleId === v.vehicle_id;
      return `
        <div class="eta-row-card ${v.is_realtime ? "is-live" : ""} ${isBoardedThis ? "is-boarded" : ""}" style="padding:6px 8px;">
          <div class="eta-bus-left">
            <span class="eta-bus-badge ${v.is_realtime ? "live" : ""}">#${v.vehicle_id}</span>
            <div class="eta-bus-desc">
              <span class="eta-bus-status">Próx: ${v.next_stop_name} (${formatEtaSeconds(v.eta_next_stop_sec)})</span>
              <span class="eta-bus-sub">${v.status_label}</span>
            </div>
          </div>
          <button
            type="button"
            class="btn-board-bus ${isBoardedThis ? "boarded-active" : ""}"
            data-exp-route="${v.route_id}"
            data-exp-dir="${v.direction}"
            data-exp-vid="${v.vehicle_id}"
          >
            ${isBoardedThis ? "✓ Embarcado" : "🚍 Entrei neste"}
          </button>
        </div>
      `;
    })
    .join("");

  box.querySelectorAll(".btn-board-bus").forEach((btn) => {
    btn.addEventListener("click", () => {
      boardBus(btn.dataset.expRoute, btn.dataset.expDir, btn.dataset.expVid, null);
    });
  });
}

function renderBusMarkersOnMap(vehicles) {
  busesLayerGroup.clearLayers();
  busMarkersByKey.clear();

  vehicles.forEach((v) => {
    const key = `${v.route_id}_${v.direction}_${v.vehicle_id}`;
    const isLive = v.is_realtime;
    const isBoardedThis =
      boardedRide &&
      boardedRide.routeId === v.route_id &&
      boardedRide.direction === v.direction &&
      boardedRide.vehicleId === v.vehicle_id;

    const icon = L.divIcon({
      className: "bus-map-marker",
      iconSize: [98, 34],
      iconAnchor: [49, 17],
      html: `
        <div class="bus-marker-container">
          <div class="bus-marker-bubble ${isLive ? "is-live" : ""}" style="${isBoardedThis ? "background:#2563eb;border-color:#fde047;box-shadow:0 0 0 5px rgba(37,99,235,0.45);" : ""}">
            <span>${isBoardedThis ? "🚍" : "🚌"} ${v.route_id} • #${v.vehicle_id}</span>
          </div>
        </div>
      `,
    });

    const marker = L.marker([v.lat, v.lon], {
      icon,
      zIndexOffset: isBoardedThis ? 1500 : isLive ? 1000 : 500,
    });

    marker.bindPopup(`
      <div style="min-width:215px;">
        <strong>Ônibus ${v.route_id} • Prefixo #${v.vehicle_id}</strong><br>
        <span style="font-size:0.75rem;color:${isLive ? "#059669" : "#64748b"};font-weight:700;">
          ${v.status_label}
        </span>
        <div style="font-size:0.75rem;color:#334155;margin-top:6px;">
          <strong>Próxima parada:</strong> ${v.next_stop_name}<br>
          <strong>Chegada na parada:</strong> ${formatEtaSeconds(v.eta_next_stop_sec)} (${formatArrivalClockTime(v.eta_next_stop_sec)})
        </div>
        <button
          type="button"
          onclick="window.boardBusFromPopup('${v.route_id}', '${v.direction}', '${v.vehicle_id}')"
          style="margin-top:8px;width:100%;background:#0f172a;color:#fff;border:none;padding:6px 10px;border-radius:5px;font-size:0.74rem;font-weight:700;cursor:pointer;"
        >
          🚍 Entrei neste ônibus (#${v.vehicle_id})
        </button>
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

  if (boardedRide) {
    updateActiveRideBanner();
  }

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

  const rtDir = realtimeDirections[`${exploreRouteId}_${exploreDirection}`];

  dirData.stops.forEach((st) => {
    const m = L.circleMarker([st.lat, st.lon], {
      radius: 5,
      fillColor: "#ffffff",
      color: route.color,
      weight: 2.5,
      fillOpacity: 1,
    }).addTo(pinsLayerGroup);

    const stopPreds = rtDir?.stop_predictions?.[st.stop_id] || [];
    const liveHtml =
      stopPreds.length > 0
        ? `<div style="margin-top:3px;color:#059669;font-weight:700;font-size:0.71rem;">⚡ Próximo: #${stopPreds[0].vehicle_id} em ${formatEtaSeconds(stopPreds[0].eta_sec)} (${formatArrivalClockTime(stopPreds[0].eta_sec)})</div>`
        : "";

    m.bindPopup(
      `<strong>${st.sequence}. ${st.name}</strong>${liveHtml}<br><small>Tabela: ${st.departures.slice(0, 8).join(", ")}</small>`
    );

    if (q && !st.name.toLowerCase().includes(q)) return;

    const li = document.createElement("li");
    li.className = "stop-item";
    li.innerHTML = `
      <div class="stop-name">${st.sequence}. ${st.name}</div>
      ${liveHtml}
      <div class="stop-sched">Tabela: ${st.departures.join(", ")}</div>
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

  document.getElementById("btn-toggle-tracking")?.addEventListener("click", () => {
    toggleTracking();
  });

  document.getElementById("btn-leave-bus")?.addEventListener("click", () => {
    leaveBus();
  });

  document.getElementById("ride-dest-select")?.addEventListener("change", (e) => {
    if (!boardedRide) return;
    boardedRide.destStopId = e.target.value;
    saveBoardedRideToStorage();
    updateActiveRideBanner();
    fetchRealtimeData();
  });

  document.getElementById("btn-fit-commute").addEventListener("click", () => {
    renderActiveView(true);
  });

  document.getElementById("btn-refresh-rt").addEventListener("click", () => {
    fetchRealtimeData();
  });

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

  const appLayout = document.getElementById("app-layout");
  document.getElementById("btn-toggle-mobile-map").addEventListener("click", () => {
    appLayout.classList.toggle("map-expanded");
    setTimeout(() => map.invalidateSize(), 280);
  });

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
