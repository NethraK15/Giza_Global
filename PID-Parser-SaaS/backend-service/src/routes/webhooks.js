const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { success, failure } = require('../utils/apiResponse');

// POST /api/webhooks/stripe
// This is a placeholder for Stripe payment webhooks.
// When a payment is successful, we upgrade the user's plan.
router.post('/stripe', async (req, res) => {
  const { eventType, userEmail, planName } = req.body;

  console.log(`Received webhook: ${eventType} for ${userEmail}`);

  try {
    if (eventType === 'checkout.session.completed' || eventType === 'subscription.updated') {
      const plan = await prisma.plan.findUnique({ where: { name: planName || 'paid' } });
      
      if (!plan) {
        return failure(res, 404, 'Plan not found', 'PLAN_NOT_FOUND');
      }

      await prisma.user.update({
        where: { email: userEmail },
        data: { planId: plan.id }
      });

      console.log(`User ${userEmail} upgraded to ${plan.name} plan`);
    }

    return success(res, 200, { received: true }, { received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return failure(res, 500, 'Webhook processing failed', 'WEBHOOK_FAILED');
  }
});

module.exports = router;
