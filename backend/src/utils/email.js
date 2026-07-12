const logger = require('./logger');

/**
 * Sends a transactional email using the Brevo API.
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
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to, name: toName }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Brevo SMTP send failed: ${response.statusText} - ${errorText}`);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    logger.info(`Email successfully dispatched via Brevo to ${to}. Message ID: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
