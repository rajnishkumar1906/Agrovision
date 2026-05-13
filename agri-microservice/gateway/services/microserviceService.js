import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth:4001';
const CROP_RECOMMENDATION_URL = process.env.CROP_RECOMMENDATION_URL || 'http://croprec:8001';
const HISTORY_SERVICE_URL = process.env.HISTORY_SERVICE_URL || 'http://history:8003';
const DISEASE_DETECTION_URL = process.env.DISEASE_DETECTION_URL || 'http://disease:8002';
const KRISHIBOT_URL = process.env.KRISHIBOT_SERVICE_URL || 'http://krishibot:8004';

// Forward to Auth Service - Register
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/register`, userData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    // If the downstream service didn't respond at all (connection refused, timeout, DNS, etc.)
    if (!error?.response) {
      const code = error?.code ? ` (${error.code})` : '';
      const msg = `Auth service unreachable at ${AUTH_SERVICE_URL}${code}`;
      const enriched = new Error(msg);
      enriched.cause = error;
      throw enriched;
    }
    throw error;
  }
};

// Forward to Auth Service - Login
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, credentials, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (!error?.response) {
      const code = error?.code ? ` (${error.code})` : '';
      const msg = `Auth service unreachable at ${AUTH_SERVICE_URL}${code}`;
      const enriched = new Error(msg);
      enriched.cause = error;
      throw enriched;
    }
    throw error;
  }
};

// Forward to Auth Service - Verify Token
export const verifyUserToken = async (token) => {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, {}, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (!error?.response) {
      const code = error?.code ? ` (${error.code})` : '';
      const msg = `Auth service unreachable at ${AUTH_SERVICE_URL}${code}`;
      const enriched = new Error(msg);
      enriched.cause = error;
      throw enriched;
    }
    throw error;
  }
};

// Forward to Crop Recommendation Service
export const forwardCropRecommendation = async (data, language = 'en') => {
  try {
    // Merge language into data if not present
    const payload = { ...data, language };
    const response = await axios.post(`${CROP_RECOMMENDATION_URL}/recommend`, payload, {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forward to Disease Detection Service
export const forwardDiseaseDetection = async (formData, headers, language = 'en') => {
  try {
    // Add language as query parameter
    const url = `${DISEASE_DETECTION_URL}/predict?language=${language}`;
    console.log(`📤 Forwarding to: ${url}`);
    
    const response = await axios.post(url, formData, {
      timeout: 60000,
      headers: {
        ...headers,
        'Content-Type': undefined
      },
    });
    
    console.log(`📥 Disease service response:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Disease service error:');
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Data:', error.response.data);
    } else if (error.request) {
      console.error('  - No response received. Is disease service running on port 8002?');
    } else {
      console.error('  - Error:', error.message);
    }
    throw error;
  }
};


// Check service health
export const checkServiceHealth = async () => {
  try {
    const cropStatus = await axios.get(`${CROP_RECOMMENDATION_URL}/`, { timeout: 5000 }).catch(() => null);
    const diseaseStatus = await axios.get(`${DISEASE_DETECTION_URL}/`, { timeout: 5000 }).catch(() => null);
    const historyStatus = await axios.get(`${HISTORY_SERVICE_URL}/`, { timeout: 5000 }).catch(() => null);
    const krishibotStatus = await axios.get(`${KRISHIBOT_URL}/`, { timeout: 5000 }).catch(() => null);

    return {
      cropRecommendation: cropStatus ? 'UP' : 'DOWN',
      diseaseDetection: diseaseStatus ? 'UP' : 'DOWN',
      history: historyStatus ? 'UP' : 'DOWN',
      krishibot: krishibotStatus ? 'UP' : 'DOWN',
    };
  } catch (error) {
    throw error;
  }
};

// Get History from History Service
export const getHistory = async (userId, params = {}) => {
  try {
    const { action, search, limit, page } = params;
    const url = new URL(`${HISTORY_SERVICE_URL}/history/${userId}`);
    if (action) url.searchParams.append('action', action);
    if (search) url.searchParams.append('search', search);
    if (limit) url.searchParams.append('limit', limit);
    if (page) url.searchParams.append('page', page);

    const response = await axios.get(url.toString(), {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forward Text to KrishiBot Service
export const forwardChatbotText = async (query, language = 'hi', gender = 'male') => {
  try {
    const response = await axios.post(`${KRISHIBOT_URL}/api/ask-text?query=${encodeURIComponent(query)}&language=${language}&gender=${gender}`, {}, {
      timeout: 120000, // Increased to 120s
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forward Voice to KrishiBot Service
export const forwardChatbotVoice = async (formData, language = 'hi', gender = 'male') => {
  try {
    const response = await axios.post(`${KRISHIBOT_URL}/api/ask-voice?language=${language}&gender=${gender}`, formData, {
      timeout: 120000, // Increased to 120s to allow for slower CPU STT processing
      headers: {
        ...formData.getHeaders ? formData.getHeaders() : { 'Content-Type': 'multipart/form-data' },
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Proxy Audio from KrishiBot Service
export const getChatbotAudio = async (filename) => {
  try {
    const response = await axios.get(`${KRISHIBOT_URL}/api/audio/${filename}`, {
      responseType: 'stream',
      timeout: 10000,
    });
    return response;
  } catch (error) {
    throw error;
  }
};