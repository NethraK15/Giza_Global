const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { authenticateToken } = require('../middlewares/auth');
const { success, failure } = require('../utils/apiResponse');

// GET /api/users/me -> get user profile & limits
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      include: {
        plan: true
      }
    });

    if (!user) return failure(res, 404, 'User not found', 'USER_NOT_FOUND');
    
    // Format response to provide plan name clearly
    const userData = {
      ...user,
      planName: user.plan.name,
      maxDaily: user.plan.maxDaily,
      maxMonthly: user.plan.maxMonthly
    };
    delete userData.plan; // cleanup raw object
    delete userData.passwordHash;

    return success(res, 200, userData, userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return failure(res, 500, 'Failed to fetch user', 'USER_FETCH_FAILED');
  }
});

// POST /api/users/upgrade -> Mock upgrade subscription
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const paidPlan = await prisma.plan.findUnique({ where: { name: 'paid' } });
    if (!paidPlan) return failure(res, 500, 'System error: Paid plan not found. Please run seeding.', 'PLAN_MISSING');

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { planId: paidPlan.id, monthlyUsage: 0, lastResetDate: new Date() },
      include: { plan: true }
    });
    
    return success(res, 200, { id: updatedUser.id, email: updatedUser.email, plan: updatedUser.plan.name }, { id: updatedUser.id, email: updatedUser.email, plan: updatedUser.plan.name });
  } catch (error) {
    console.error('Upgrade error:', error);
    return failure(res, 500, 'Failed to upgrade plan', 'UPGRADE_FAILED');
  }
});

module.exports = router;
