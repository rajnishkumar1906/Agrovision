import User from '../models/User.js';
import { generatePasetoToken, verifyPasetoToken } from "../utils/pasetoTokenUtils.js";

// Register user
export const register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    const finalName = name || username;

    console.log('Register request body:', req.body);
    if (!finalName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name (or username), email, and password',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name: finalName,
      email,
      password,
    });

    // Wait for the token to be generated
    const token = await generatePasetoToken(user._id.toString()); // ensure string

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        username: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Wait for the token
    const token = await generatePasetoToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        username: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Verify token - note: verifyPasetoToken is async, need await
export const verify = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const { valid, decoded, error } = await verifyPasetoToken(token);

    if (valid) {
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        userId: decoded.userId,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error,
      });
    }
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message,
    });
  }
};