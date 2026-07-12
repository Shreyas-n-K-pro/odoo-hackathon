const SibApiV3Sdk = require('sib-api-v3-sdk');
const logger = require('./logger');

/**
 * Sends a transactional email using the Brevo SDK.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.toName - Recipient name
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML body content
 */
async function sendEmail({ to, toName, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'alerts@transitops.in';
  const senderName = process.env.BREVO_SENDER_NAME || 'TransitOps Alerts';

  if (!apiKey) {
    logger.warn(`Brevo API key not set. Skipping email dispatch to ${to}. Log content: ${htmlContent}`);
    return { success: false, reason: 'Brevo API key not configured' };
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = apiKey;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const result = await apiInstance.sendTransacEmail({
      sender: {
        email: senderEmail,
        name: senderName
      },
      to: [{
        email: to,
        name: toName
      }],
      subject: subject,
      htmlContent: htmlContent
    });

    logger.info(`Email successfully dispatched via Brevo SDK to ${to}.`);
    return { success: true, result };
  } catch (error) {
    logger.error(`Error sending email via Brevo SDK to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
