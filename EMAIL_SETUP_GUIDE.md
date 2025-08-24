# Email Service Setup Guide

This guide will help you configure the email service for the Evergreen Way platform.

## Overview

The email service supports two modes:
1. **Direct SendGrid API** (Recommended for development)
2. **Firebase Cloud Functions** (Fallback option)

## Option 1: SendGrid Direct API (Recommended)

### Step 1: Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### Step 2: Create API Key
1. Go to [API Keys](https://app.sendgrid.com/settings/api_keys)
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access" with "Mail Send" permissions
4. Copy the generated API key (starts with `SG.`)

### Step 3: Verify Sender Email
1. Go to [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Click "Verify a Single Sender"
3. Fill in your sender information
4. Click "Create"
5. Check your email and click the verification link

### Step 4: Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# SendGrid Configuration
VITE_SENDGRID_API_KEY=SG.your_actual_api_key_here
VITE_SENDGRID_FROM_EMAIL=your_verified_email@yourdomain.com
```

### Step 5: Test Configuration
1. Restart your development server
2. Go to Email Management page
3. Check the "API Configuration" section
4. SendGrid should show "Configured" status

## Option 2: Firebase Cloud Functions (Fallback)

If you don't want to use SendGrid directly, the system will fall back to Firebase Cloud Functions.

### Requirements
- Firebase project configured
- Firebase Functions deployed
- SendGrid configured in Firebase Functions

### Configuration
1. Deploy Firebase Functions with SendGrid configuration
2. Set environment variables in Firebase:
   ```bash
   firebase functions:config:set sendgrid.api_key="your_sendgrid_api_key"
   firebase functions:config:set sendgrid.from_email="your_verified_email@yourdomain.com"
   ```

## Testing Email Service

### 1. Check API Status
- Go to Email Management page
- Look at the "API Configuration" section
- Verify both SendGrid and Firebase show proper status

### 2. Send Test Email
- Use the "Send Welcome Email" button
- Check console for any errors
- Verify email is received

### 3. Check Statistics
- Statistics are loaded from Firestore `email_logs` collection
- Click "Refresh" button to update stats
- Progress bars show success/pending/failed rates

## Troubleshooting

### Common Issues

#### 1. "SendGrid: Not Configured"
- Check your `.env.local` file exists
- Verify API key format (starts with `SG.`)
- Ensure verified sender email is correct
- Restart development server after changes

#### 2. "Failed to send email"
- Check browser console for detailed errors
- Verify SendGrid API key is valid
- Ensure sender email is verified
- Check SendGrid account status

#### 3. Statistics not loading
- Check Firestore connection
- Verify `email_logs` collection exists
- Check browser console for errors

#### 4. Firebase Functions errors
- Ensure Functions are deployed
- Check Firebase console for function logs
- Verify SendGrid configuration in Firebase

### Debug Steps

1. **Check Environment Variables**
   ```javascript
   console.log('SendGrid API Key:', import.meta.env.VITE_SENDGRID_API_KEY);
   console.log('SendGrid From Email:', import.meta.env.VITE_SENDGRID_FROM_EMAIL);
   ```

2. **Check Network Requests**
   - Open browser DevTools
   - Go to Network tab
   - Send an email and check for API calls

3. **Check Firestore**
   - Open Firebase Console
   - Go to Firestore
   - Check `email_logs` collection

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for sensitive data
- SendGrid API keys have full access to your account
- Consider using restricted API keys for production

## Production Considerations

- Use verified domain authentication in SendGrid
- Set up webhook notifications for delivery status
- Monitor email delivery rates
- Set up bounce and spam complaint handling
- Consider using SendGrid's dynamic templates

## Support

If you encounter issues:
1. Check this guide first
2. Review browser console errors
3. Check Firebase console logs
4. Verify SendGrid account status
5. Test with a simple email first

## Quick Test

To quickly test if everything is working:

1. Set up SendGrid API key
2. Restart development server
3. Go to Email Management
4. Click "Send Welcome Email"
5. Check if email is received
6. Verify statistics update

The system will automatically choose the best available method for sending emails.
