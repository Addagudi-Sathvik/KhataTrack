let accessToken = null;

const STORAGE_KEY = 'accessToken';

function loadFromStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// Hydrate on boot so protected endpoints (/api/expenses) work after reload/navigation.
accessToken = loadFromStorage();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors (private mode etc.)
  }
}

export function clearAccessToken() {
  accessToken = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

