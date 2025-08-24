# Postmark Email Service Setup Guide

This guide will help you set up Postmark for the Evergreen Way email service.

## Prerequisites

- Postmark account (sign up at https://postmarkapp.com)
- Verified sender domain or email address

## Step-by-Step Setup

### 1. Create Postmark Account

1. Go to [Postmark](https://postmarkapp.com)
2. Click "Sign Up" and create your account
3. Verify your email address

### 2. Create a Server

1. In your Postmark dashboard, click "Add a Server"
2. Choose "Create a new server"
3. Enter a server name (e.g., "Evergreen Way")
4. Select "Transactional" as the server type
5. Click "Create Server"

### 3. Get API Token

1. In your server dashboard, go to "API Tokens"
2. Copy the "Server API Token" (this is your API key)
3. Keep this token secure - you'll need it for configuration

### 4. Verify Sender Email

1. Go to "Sender Signatures" in your server dashboard
2. Click "Add a new signature"
3. Enter your sender email address
4. Follow the verification process (check your email for verification link)
5. Once verified, this email will be your "from" address

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your Postmark configuration:
   ```bash
   VITE_POSTMARK_API_KEY=e297544f-690e-4de4-b14d-15133b77e652
   VITE_POSTMARK_FROM_EMAIL=your_verified_sender@yourdomain.com
   ```

### 6. Configure Firebase Functions (Optional)

If you want to use Firebase Functions for email sending:

1. Set Firebase configuration:
   ```bash
   firebase functions:config:set postmark.api_key="e297544f-690e-4de4-b14d-15133b77e652"
   firebase functions:config:set postmark.from_email="your_verified_sender@yourdomain.com"
   ```

2. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

### 7. Test the Integration

1. Start your development server
2. Navigate to the Email Management page
3. Try sending a test email
4. Check the Postmark dashboard for delivery status

## Features Implemented

### ✅ Direct API Integration
- Send emails directly via Postmark API
- Automatic fallback to Firebase Functions
- Real-time delivery tracking

### ✅ Email Templates
- Welcome emails for new users
- Task reminder emails
- Custom email sending
- Attachment support

### ✅ Error Handling
- Comprehensive error logging
- Automatic retry mechanisms
- Detailed error messages

### ✅ Monitoring
- Email delivery tracking
- Bounce and spam reporting
- Performance analytics

## API Usage and Limits

### Free Tier (Postmark)
- 100 emails per month free
- Additional emails: $1.25 per 1,000

### Production Limits
- 10,000 emails per day (default)
- Can be increased upon request
- No rate limiting for transactional emails

## Troubleshooting

### Common Issues

#### "Postmark API key not configured"
- Check if `VITE_POSTMARK_API_KEY` is set in `.env.local`
- Verify the API key is correct
- Ensure the key is for the correct server

#### "Sender email not verified"
- Verify your sender email in Postmark dashboard
- Check if verification email was clicked
- Wait for verification to complete

#### "Email sending failed"
- Check Postmark dashboard for error details
- Verify recipient email format
- Check if you've exceeded sending limits

#### "Firebase Functions error"
- Ensure Firebase Functions are deployed
- Check Firebase Functions logs
- Verify Postmark configuration in Firebase

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## Security Best Practices

1. **Secure API Token**: Never expose your API token in client-side code
2. **Domain Verification**: Use verified domains for better deliverability
3. **Rate Limiting**: Implement client-side rate limiting if needed
4. **Monitoring**: Set up alerts for failed deliveries

## Postmark Dashboard Features

### Email Analytics
- Delivery rates
- Open rates
- Click rates
- Bounce rates

### Templates
- Create reusable email templates
- Dynamic content support
- A/B testing capabilities

### Webhooks
- Real-time delivery notifications
- Bounce and spam reports
- Custom event handling

## Support

- [Postmark Documentation](https://postmarkapp.com/developer)
- [Postmark Support](https://postmarkapp.com/support)
- [API Reference](https://postmarkapp.com/developer/api/overview)

## Next Steps

After setup, you can:
1. Create custom email templates
2. Set up webhooks for real-time notifications
3. Implement email analytics
4. Configure bounce handling
5. Set up automated email campaigns
