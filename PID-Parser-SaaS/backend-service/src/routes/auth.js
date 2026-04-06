const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { success, failure } = require('../utils/apiResponse');

// /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return failure(res, 400, 'Email and password required', 'VALIDATION_ERROR');

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return failure(res, 400, 'Email already in use', 'DUPLICATE_EMAIL');

    // Find the default "free" plan
    const freePlan = await prisma.plan.findUnique({ where: { name: 'free' } });
    if (!freePlan) return res.status(500).json({ error: 'System error: Default plan not found. Please run seeding.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = name || email.split('@')[0]; // Use name or default to email prefix
    
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash,
        displayName,
        planId: freePlan.id
      }
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return success(res, 201, {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        plan: 'free'
      }
    }, {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        plan: 'free'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return failure(res, 500, 'Failed to create user', 'SIGNUP_FAILED');
  }
});

// /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { plan: true }
    });
    if (!user) return failure(res, 401, 'Invalid credentials', 'AUTH_INVALID_CREDENTIALS');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return failure(res, 401, 'Invalid credentials', 'AUTH_INVALID_CREDENTIALS');

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return success(res, 200, {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        plan: user.plan.name
      }
    }, {
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        plan: user.plan.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return failure(res, 500, 'Login failed', 'AUTH_LOGIN_FAILED');
  }
});

// /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return failure(res, 400, 'Email required', 'VALIDATION_ERROR');

    // Check if user exists (but don't reveal whether email is registered)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user doesn't exist for security
      return success(res, 200, { message: 'If email exists, password reset instructions will be sent' }, { message: 'If email exists, password reset instructions will be sent' });
    }

    // TODO: In production, generate reset token, store in DB, send email
    // For now, just return success message
    console.log(`Password reset requested for: ${email}`);
    return success(res, 200, { message: 'Password reset instructions sent to email' }, { message: 'Password reset instructions sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return failure(res, 500, 'Failed to process request', 'FORGOT_PASSWORD_FAILED');
  }
});

module.exports = router;
