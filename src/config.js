export function getWebrtcUrl() {
  return import.meta.env.VITE_WEBRTC_URL || (window.location.origin + '/client');
}

export function getIceServers() {
  const raw = import.meta.env.VITE_ICE_SERVERS_JSON;
  if (!raw) return [{ urls: 'stun:stun.l.google.com:19302' }];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.warn('VITE_ICE_SERVERS_JSON inválido, usando STUN por defecto');
  }
  return [{ urls: 'stun:stun.l.google.com:19302' }];
}