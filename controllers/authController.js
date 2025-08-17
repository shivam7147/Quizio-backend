import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import PasswordReset from "../models/passwordResetModel.js";
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '../utils/sendEmail.js';

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email }, // payload
      process.env.JWT_SECRET, // secret key from .env
      { expiresIn: "7d" } // token expiry
    );

    // ✅ Send response with token and user info (without password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
  }
};

import mongoose from 'mongoose';

const PendingUser = mongoose.models.PendingUser || mongoose.model('PendingUser', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24h expiry
}));

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
    }
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) {
            return res.status(400).json({ message: "A verification email was already sent. Please check your inbox." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = nanoid(32);
    await PendingUser.create({ name, email, password: hashedPassword, token });
    try {
      await sendVerificationEmail(email, token);
    } catch (emailErr) {
            return res.status(500).json({ message: 'Failed to send verification email.', error: emailErr.message });
    }
    res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const sendResetCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }
    const code = nanoid(6);
    await PasswordReset.deleteMany({ email }); // Remove any previous codes
    await PasswordReset.create({ email, code });
    await sendVerificationEmail(email, code);
    res.status(200).json({ message: 'Reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reset code.', error: err.message });
  }
};

export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const record = await PasswordReset.findOne({ email, code });
    if (!record) return res.status(400).json({ message: 'Invalid or expired code.' });
    res.status(200).json({ message: 'Code verified.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const record = await PasswordReset.findOne({ email, code });
    if (!record) return res.status(400).json({ message: 'Invalid or expired code.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No user found.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await PasswordReset.deleteOne({ _id: record._id });
    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const pending = await PendingUser.findOne({ token });
    if (!pending) return res.status(400).json({ message: 'Invalid or expired verification token.' });
    const { name, email, password } = pending;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pending._id });
      return res.status(400).json({ message: 'User already exists.' });
    }
    const newUser = await User.create({ name, email, password });
    await PendingUser.deleteOne({ _id: pending._id });
    const tokenJwt = generateToken(newUser._id);
    res.status(201).json({
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      token: tokenJwt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
