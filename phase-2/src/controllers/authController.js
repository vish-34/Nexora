const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { getIsConnected } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "coolneighbour_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

// Resilient in-memory store if MongoDB is not running locally
const inMemoryUsers = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup, POST /api/auth/register
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, and password.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if database is connected
    if (getIsConnected()) {
      const userExists = await User.findOne({ email: cleanEmail });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      // Resilient In-Memory Mode
      if (inMemoryUsers.has(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = "mem_" + Date.now();

      const newUser = {
        id: userId,
        _id: userId,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        createdAt: new Date(),
      };

      inMemoryUsers.set(cleanEmail, newUser);
      const token = generateToken(userId);

      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create account.",
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/signin, POST /api/auth/login
 * @access  Public
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if database is connected
    if (getIsConnected()) {
      const user = await User.findOne({ email: cleanEmail });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Signed in successfully.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      // In-Memory Authentication Mode
      const user = inMemoryUsers.get(cleanEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: "Signed in successfully.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Authentication failed.",
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (getIsConnected()) {
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.json({ success: true, user });
    } else {
      for (const [_, u] of inMemoryUsers.entries()) {
        if (u.id === decoded.id) {
          const { password: _, ...cleanUser } = u;
          return res.json({ success: true, user: cleanUser });
        }
      }
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: "Not authorized or invalid token" });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully."
  });
};

module.exports = {
  signup,
  signin,
  getMe,
  logout,
};
