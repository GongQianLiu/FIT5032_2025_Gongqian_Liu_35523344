// Netlify Function for sending emails via Postmark
const postmark = require('postmark');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse request body
    const { to, subject, content, senderInfo, attachment } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !subject || !content) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: to, subject, content' 
        })
      };
    }

    // Initialize Postmark client
    const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);

    // Prepare email data
    const emailData = {
      From: process.env.POSTMARK_FROM_EMAIL || 'noreply@evergreenway.com',
      To: to,
      Subject: subject,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Evergreen Way</h1>
            <p style="color: white; margin: 5px 0 0 0;">Community Care Service</p>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${content.replace(/\n/g, '<br>')}
            </div>
            ${senderInfo ? `
              <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>Sent by:</strong> ${senderInfo.name || 'Evergreen Way User'}<br>
                  <strong>Email:</strong> ${senderInfo.email || 'noreply@evergreenway.com'}
                </p>
              </div>
            ` : ''}
          </div>
          <div style="padding: 15px; text-align: center; background: #f0f0f0; font-size: 12px; color: #666;">
            <p>This email was sent from Evergreen Way Community Care Service</p>
            <p>If you received this email in error, please ignore it.</p>
          </div>
        </div>
      `,
      TextBody: content + (senderInfo ? `\n\nSent by: ${senderInfo.name} (${senderInfo.email})` : ''),
      MessageStream: 'outbound'
    };

    // Add attachment if provided
    if (attachment && attachment.data) {
      emailData.Attachments = [{
        Name: attachment.name,
        Content: attachment.data,
        ContentType: attachment.type
      }];
    }

    // Send email
    const result = await client.sendEmail(emailData);

    // Log successful send
    console.log('Email sent successfully:', {
      messageId: result.MessageID,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        messageId: result.MessageID,
        message: 'Email sent successfully'
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email'
      })
    };
  }
};
