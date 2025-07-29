import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

// @desc    Register user
// @route   POST /api/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "User with this email already exists");
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, 201, "User registered successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    sendError(res, 500, "Server error during registration");
  }
};

// @desc    Login user
// @route   POST /api/login
// @access  Public
export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, 400, errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Generate token
    const token = generateToken(user._id);

    sendSuccess(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, 500, "Server error during login");
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Update fields
    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (email && email.trim()) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        return sendError(res, 400, "Email already in use by another user");
      }

      user.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return sendError(
          res,
          400,
          "Password must be at least 6 characters long"
        );
      }
      user.password = password;
    }

    // Save user (password will be hashed by pre-save middleware)
    await user.save();

    sendSuccess(res, 200, "Profile updated successfully", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      return sendError(res, 400, "Email already in use");
    }

    sendError(res, 500, "Server error during profile update");
  }
};
