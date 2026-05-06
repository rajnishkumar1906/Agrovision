import { registerUser, loginUser, verifyUserToken, forwardCropRecommendation, forwardDiseaseDetection, checkServiceHealth, getHistory as getHistoryService, forwardChatbotQuery, forwardChatbotVoice, getChatbotAudio } from '../services/microserviceService.js';
import { saveToCacheAsync } from '../utils/cacheUtils.js';
import { logActivity } from '../utils/historyLogger.js';
import FormData from 'form-data';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const responseData = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    const status = error.response?.status || 502;
    const errorMessage = error.response?.data?.message || error.message || 'Error registering user';

    return res.status(status).json({
      success: false,
      message: errorMessage,
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const responseData = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: responseData,
    });
  } catch (error) {
    console.error('Error logging in:', error.message);
    const status = error.response?.status || 502;
    const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';

    return res.status(status).json({
      success: false,
      message: errorMessage,
    });
  }
};

// POST /api/auth/verify
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const responseData = await verifyUserToken(token);

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: responseData,
    });
  } catch (error) {
    console.error('Error verifying token:', error.message);

    return res.status(error.response?.status || 401).json({
      success: false,
      message: error.message || 'Invalid token',
    });
  }
};

// POST /api/recommend
export const recommendCrop = async (req, res) => {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📍 Gateway: Forwarding to Crop Recommendation Service');
    console.log(`${'='.repeat(60)}`);

    const startTime = Date.now();
    const language = req.query.language || req.body.language || 'en';

    const responseData = await forwardCropRecommendation(req.body, language);

    const processingTime = Date.now() - startTime;

    if (req.cacheKey) {
      saveToCacheAsync(req.cacheKey, responseData, 3600, req.__memoryCache);
    }

    console.log(`✓ Python Service Response (${processingTime}ms)`);

    // Fire-and-forget audit log (do not await)
    try {
      const userId = req.user?.userId;
      const details = { input: req.body, result: responseData, route: '/api/recommend' };
      // no await — run in background
      logActivity(userId, 'CROP_RECOMMENDATION', details);
    } catch (_) { /* swallow */ }

    return res.status(200).json({
      success: true,
      message: 'Crop recommendation retrieved from Python service',
      data: responseData,
      cached: false,
      latency: `${processingTime}ms`,
    });
  } catch (error) {
    console.error('Error forwarding to Crop Recommendation Service:', error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error from Crop Recommendation Service',
      error: error.message,
    });
  }
};

// POST /api/disease-detect
export const detectDisease = async (req, res) => {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📍 Gateway: Forwarding to Disease Detection Service');
    console.log(`${'='.repeat(60)}`);

    const startTime = Date.now();
    const language = req.query.language || req.query.lang || 'en';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const responseData = await forwardDiseaseDetection(formData, formData.getHeaders(), language);

    const processingTime = Date.now() - startTime;

    console.log(`✓ Disease detection completed (${processingTime}ms)`);
    console.log(`📊 Result: ${responseData.disease_translated || responseData.disease} (${(responseData.confidence * 100).toFixed(1)}%)`);

    // Fire-and-forget audit log
    try {
      const userId = req.user?.userId;
      const details = {
        route: '/api/disease-detect',
        file: req.file?.originalname || 'n/a',
        result: responseData,
      };
      logActivity(userId, 'DISEASE_DETECTION', details);
    } catch (_) { /* swallow */ }

    return res.status(200).json({
      success: true,
      message: 'Disease detection completed',
      data: responseData,
      latency: `${processingTime}ms`,
    });
  } catch (error) {
    console.error('❌ Error forwarding to Disease Detection Service:', error.message);
    if (error.response) {
      console.error('  - Response status:', error.response.status);
      console.error('  - Response data:', error.response.data);
    }

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error from Disease Detection Service',
      error: error.message,
    });
  }
};

// GET /api/health
export const healthCheck = async (req, res) => {
  try {
    const services = await checkServiceHealth();

    return res.status(200).json({
      success: true,
      message: 'Gateway Health Check',
      services,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking service health',
      error: error.message,
    });
  }
};

// GET /api/history - fetch user history from History Service
export const getHistory = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Missing userId in token' });
    }

    const responseData = await getHistoryService(userId);

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || { message: error.message };
    return res.status(status).json({ success: false, message });
  }
};

// POST /api/chatbot/ask-text
export const askChatbot = async (req, res) => {
  try {
    const query = req.query.query || req.body.query;
    const language = req.query.language || req.body.language || 'en';
    const gender = req.query.gender || req.body.gender || 'male';

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const startTime = Date.now();
    console.log(`📝 Final query: "${query}" (Lang: ${language}, Gender: ${gender})`);

    const responseData = await forwardChatbotQuery(query, language, gender);

    const processingTime = Date.now() - startTime;

    console.log(`✓ KrishiBot Response (${processingTime}ms)`);

    // Fire-and-forget audit log
    try {
      const userId = req.user?.userId;
      const details = {
        query,
        route: '/api/chatbot/ask-text',
        result: responseData,
      };
      logActivity(userId, 'CHATBOT_QUERY', details);
    } catch (_) { /* swallow */ }

    // Ensure response matches frontend expected format
    return res.status(200).json({
      success: true,
      message: 'Chatbot query processed',
      data: responseData,
      latency: `${processingTime}ms`,
    });
  } catch (error) {
    console.error('Error forwarding to KrishiBot Service:', error.message);
    if (error.response) {
      console.error('  - Response status:', error.response.status);
      console.error('  - Response data:', error.response.data);
    }

    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error from KrishiBot Service',
      error: error.message,
    });
  }
};

// POST /api/chatbot/ask-voice
export const askChatbotVoice = async (req, res) => {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📍 Gateway: Forwarding Voice to KrishiBot Service');
    console.log(`${'='.repeat(60)}`);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file provided' });
    }

    console.log('✅ Audio file received:', {
      name: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      mimetype: req.file.mimetype
    });

    const language = req.query.language || req.body?.language || 'hi';
    const gender = req.query.gender || req.body?.gender || 'male';
    console.log(`🌐 Language: ${language}, Gender: ${gender}`);

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.wav',
      contentType: req.file.mimetype || 'audio/wav',
    });

    const responseData = await forwardChatbotVoice(formData, language, gender);

    console.log('✅ Voice response received from KrishiBot');

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Error forwarding voice to KrishiBot Service:', error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error from KrishiBot Service',
      error: error.message,
    });
  }
};

// GET /api/chatbot/audio/:filename
export const proxyChatbotAudio = async (req, res) => {
  try {
    const { filename } = req.params;
    console.log(`🎵 Audio request for: ${filename}`);
    
    const response = await getChatbotAudio(filename);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying audio:', error.message);
    res.status(404).json({ success: false, message: 'Audio not found' });
  }
};