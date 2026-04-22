import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
const CROP_RECOMMENDATION_URL = process.env.CROP_RECOMMENDATION_URL || 'http://localhost:8001';
const HISTORY_SERVICE_URL = process.env.HISTORY_SERVICE_URL || 'http://localhost:8003';
const DISEASE_DETECTION_URL = process.env.DISEASE_DETECTION_URL || 'http://localhost:8002';
const KRISHIBOT_URL = process.env.KRISHIBOT_URL || 'http://localhost:8000';

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
export const forwardCropRecommendation = async (data) => {
  try {
    const response = await axios.post(`${CROP_RECOMMENDATION_URL}/recommend`, data, {
      timeout: 30000,
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

    return {
      cropRecommendation: cropStatus ? 'UP' : 'DOWN',
      diseaseDetection: diseaseStatus ? 'UP' : 'DOWN',
    };
  } catch (error) {
    throw error;
  }
};

// Get History from History Service
export const getHistory = async (userId) => {
  try {
    const response = await axios.get(`${HISTORY_SERVICE_URL}/history/${userId}`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forward to KrishiBot Service
export const forwardChatbotQuery = async (query) => {
  try {
    const response = await axios.post(`${KRISHIBOT_URL}/api/ask-text?query=${encodeURIComponent(query)}`, {}, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forward Voice to KrishiBot Service
export const forwardChatbotVoice = async (formData, language = 'hi') => {
  try {
    const response = await axios.post(`${KRISHIBOT_URL}/api/ask-voice?language=${language}`, formData, {
      timeout: 60000,
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

