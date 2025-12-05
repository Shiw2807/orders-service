/**
 * Notification Service
 * 
 * ARCHITECTURAL CONCERN: This belongs in a separate microservice,
 * not embedded in the orders-service. Violates single responsibility.
 * 
 * ARCHITECTURAL DRIFT: Orders service should not handle notifications directly
 */

const https = require('https');

// ISSUE: Credentials hardcoded - SECURITY VULNERABILITY
const EMAIL_API_KEY = 'sk_live_abc123xyz789';
const SMS_API_KEY = 'twilio_secret_key_here';
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/T00/B00/XXXX';

// DUPLICATED LOGIC: Email validation exists in multiple places
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// INCONSISTENT CODE QUALITY: Mixing async patterns
async function sendEmail(to, subject, body) {
  // ARCHITECTURAL CONCERN: Direct third-party API call
  // Should use a notification service or message queue
  
  console.log(`Sending email to ${to}: ${subject}`);
  
  // ISSUE: No error handling, no retry logic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, messageId: 'msg_' + Date.now() });
    }, 100);
  });
}

// INCONSISTENT: Callback style vs Promise style
function sendSMS(phoneNumber, message, callback) {
  // ARCHITECTURAL DRIFT: SMS logic in orders service
  console.log(`Sending SMS to ${phoneNumber}`);
  
  setTimeout(() => {
    callback(null, { success: true });
  }, 50);
}

// DUPLICATED LOGIC: Same Slack notification exists in payments-service
async function sendSlackNotification(channel, message) {
  const payload = JSON.stringify({
    channel: channel,
    text: message,
    username: 'Orders Bot'
  });

  // ISSUE: Hardcoded webhook URL
  return new Promise((resolve, reject) => {
    // Simulated - in real code this would call Slack API
    console.log(`Slack [${channel}]: ${message}`);
    resolve({ ok: true });
  });
}

// ARCHITECTURAL CONCERN: Order-specific logic mixed with notification logic
async function notifyOrderCreated(order) {
  const tasks = [];

  // INCONSISTENT: Sometimes await, sometimes push to array
  tasks.push(sendEmail(
    order.customerEmail,
    'Order Confirmed',
    `Your order ${order.id} has been confirmed. Total: $${order.total}`
  ));

  if (order.total > 1000) {
    // DUPLICATED: Same threshold logic in orderProcessor.js
    tasks.push(sendSlackNotification(
      '#high-value-orders',
      `High value order: ${order.id} - $${order.total}`
    ));
  }

  // ISSUE: If one notification fails, all fail
  return Promise.all(tasks);
}

// BREAKING CHANGE: Changed function signature
// Old: notifyOrderShipped(orderId, trackingNumber)
// New: notifyOrderShipped(order, carrier, trackingInfo)
async function notifyOrderShipped(order, carrier, trackingInfo) {
  // This breaks existing callers that use the old signature
  return sendEmail(
    order.customerEmail,
    'Order Shipped',
    `Your order ${order.id} has shipped via ${carrier}. Tracking: ${trackingInfo.number}`
  );
}

// DUPLICATED: Phone validation also in validation.js
function validatePhoneNumber(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}

module.exports = {
  sendEmail,
  sendSMS,
  sendSlackNotification,
  notifyOrderCreated,
  notifyOrderShipped,
  validateEmail,
  validatePhoneNumber,
  // ISSUE: Exposing internal constants
  EMAIL_API_KEY,
  SMS_API_KEY
};
