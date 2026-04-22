import axios from 'axios';

// History service base URL: prefer env var, fallback to docker service name then localhost
const HISTORY_BASE_URL = process.env.HISTORY_SERVICE_URL || 'http://history-service:8003';

/**
 * Fire-and-forget activity logger. Never throws.
 * @param {string} userId
 * @param {string} action - e.g., 'CROP_RECOMMENDATION' | 'DISEASE_DETECTION'
 * @param {object} details - arbitrary JSON payload (inputs/outputs)
 */
export async function logActivity(userId, action, details = {}) {
  try {
    if (!userId || !action) return; // skip invalid calls silently

    await axios.post(`${HISTORY_BASE_URL}/log`, {
      userId,
      action,
      details,
    }, {
      timeout: 3000,
      // In compose, the hostname is the service name; for local dev, allow localhost override via env
      validateStatus: () => true,
    });
  } catch (err) {
    // Graceful failure: log and continue
    console.error('[historyLogger] Failed to log activity:', err?.message || err);
  }
}

export { HISTORY_BASE_URL };
