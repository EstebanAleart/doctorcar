"use client";

/**
 * Tracking propio con sendBeacon (no bloquea, sobrevive navegación).
 * Complementa GA4 (que pierde ~30% por adblockers en AR).
 */

const ENDPOINT = "/api/tracking/event";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  let sid = sessionStorage.getItem("dc_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("dc_sid", sid);
  }
  return sid;
}

function getUtm() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ]) {
    const v = p.get(key);
    if (v) utm[key] = v;
  }
  return utm;
}

function getReferrer() {
  if (typeof document === "undefined") return null;
  return document.referrer || null;
}

export function track(evento, params = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    evento,
    pagina: window.location.pathname,
    referrer: getReferrer(),
    session_id: getOrCreateSessionId(),
    utm: getUtm(),
    ua_mobile: /Mobi|Android/i.test(navigator.userAgent),
    ts: Date.now(),
    ...params,
  };

  try {
    const ok = navigator.sendBeacon(
      ENDPOINT,
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    if (!ok) throw new Error("sendBeacon failed");
  } catch {
    fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }

  if (typeof window.dataLayer !== "undefined") {
    window.dataLayer.push({ event: evento, ...params });
  }
}

/* ===================== Eventos prearmados ===================== */

export function trackClickWhatsapp(meta = {}) {
  track("click_whatsapp", meta);
}

export function trackClickPortal(meta = {}) {
  track("click_portal", meta);
}

export function trackSubmitPresupuesto(meta = {}) {
  track("submit_presupuesto", meta);
}

export function trackViewAseguradora(aseguradora) {
  track("view_aseguradora", { aseguradora });
}

export function trackOutboundMaps() {
  track("outbound_maps");
}
