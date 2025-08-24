# Netlify Deployment Guide

This guide explains how to deploy the Evergreen Way application to Netlify with a hybrid email system:
- **Internal emails**: Firebase (user-to-user messaging within the system)
- **External emails**: Netlify Functions + Postmark (sending emails to external addresses)

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Postmark Account**: Sign up at [postmarkapp.com](https://postmarkapp.com)
3. **Domain (Optional)**: For custom email domain

## Step 1: Postmark Setup

1. **Create Postmark Account**
   - Go to [postmarkapp.com](https://postmarkapp.com)
   - Sign up for a free account (100 emails/month free)

2. **Create Server**
   - In Postmark dashboard, create a new server
   - Name it "Evergreen Way" or similar

3. **Get API Token**
   - Go to your server settings
   - Copy the "Server API token"
   - Save this for later

4. **Set Sender Signature**
   - Go to "Sender Signatures"
   - Add your email address (e.g., noreply@yourdomain.com)
   - Verify the email address

## Step 2: Netlify Deployment

### Option A: Deploy from Git Repository

1. **Connect Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub/GitLab repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher

3. **Deploy**
   - Click "Deploy site"
   - Wait for initial deployment

### Option B: Manual Deploy

1. **Build Locally**
   ```bash
   npm install
   npm run build
   ```

2. **Upload to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## Step 3: Environment Variables

1. **Go to Site Settings**
   - In Netlify dashboard, go to your site
   - Click "Site settings" → "Environment variables"

2. **Add Environment Variables**
   ```
   POSTMARK_API_TOKEN=your_postmark_server_token_here
   POSTMARK_FROM_EMAIL=noreply@yourdomain.com
   NODE_ENV=production
   ```

3. **Add Firebase Variables (if needed)**
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 4: Test Email Functionality

1. **Deploy and Test**
   - Redeploy your site after adding environment variables
   - Test both internal and external email sending

2. **Test Internal Emails (Firebase)**
   - Login to the application
   - Try sending internal messages between users
   - These use Firebase directly (no Netlify Functions needed)

3. **Test External Emails (Netlify Functions)**
   - Try sending emails to external addresses
   - Check "Functions" tab in Netlify dashboard
   - You should see `send-email` function
   - Check function logs for any errors

4. **Use Browser Console Tests**
   ```javascript
   // Test complete email system
   await window.testCompleteEmailSystem()

   // Test system configuration
   await window.testEmailSystemConfig()

   // Test external emails only
   await window.testNetlifyEmail()
   ```

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain**
   - In site settings, go to "Domain management"
   - Add your custom domain

2. **Update Postmark Sender**
   - Update sender signature in Postmark to use your custom domain
   - Update `POSTMARK_FROM_EMAIL` environment variable

## Local Development with Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Link Your Site**
   ```bash
   netlify link
   ```

4. **Create Local Environment File**
   ```bash
   # Create .env file with your environment variables
   cp .env.example .env
   # Edit .env with your actual values
   ```

5. **Run Development Server**
   ```bash
   netlify dev
   ```
   This will run your site at `http://localhost:8888` with Netlify Functions support.

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**
   - Ensure `POSTMARK_API_TOKEN` is set correctly
   - Verify `POSTMARK_FROM_EMAIL` is a verified sender signature

2. **Check Function Logs**
   - Go to Netlify dashboard → Functions → send-email
   - Check recent invocations for error messages

3. **Check Postmark Dashboard**
   - Go to Postmark dashboard → Activity
   - Check for bounced or rejected emails

### CORS Issues

- The Netlify Functions should handle CORS automatically
- If issues persist, check the function headers in `netlify/functions/send-email.js`

### Build Failures

1. **Check Build Logs**
   - In Netlify dashboard, check the deploy logs
   - Look for missing dependencies or build errors

2. **Node Version**
   - Ensure you're using Node 18 or higher
   - Add `.nvmrc` file with your Node version if needed

## Security Notes

- Never commit API tokens to your repository
- Use environment variables for all sensitive data
- The Postmark API token is only accessible server-side in Netlify Functions
- Frontend code cannot access server-side environment variables

## Support

- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **Postmark Support**: [postmarkapp.com/support](https://postmarkapp.com/support)
- **Application Issues**: Check the browser console and Netlify function logs
