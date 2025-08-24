# Google Maps API Setup Guide

This guide will help you set up Google Maps API for the Evergreen Way Service Map feature.

## Prerequisites

- Google account
- Credit card (Google Maps API has usage limits and may incur charges)

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top
3. Click "New Project"
4. Enter a project name (e.g., "Evergreen Way Maps")
5. Click "Create"

### 2. Enable Required APIs

1. In your project, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API** - For interactive maps
   - **Places API** - For POI search and place details
   - **Geocoding API** - For address/coordinate conversion
   - **Directions API** - For navigation and routing

### 3. Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. Click "Restrict Key" to secure it

### 4. Restrict API Key (Recommended)

1. In the API key settings, click "Application restrictions"
2. Select "HTTP referrers (web sites)"
3. Add your domain(s):
   - `localhost:5173/*` (for development)
   - `yourdomain.com/*` (for production)
4. Click "API restrictions"
5. Select "Restrict key" and choose the APIs you enabled
6. Click "Save"

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your Google Maps API key:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 6. Test the Integration

1. Start your development server
2. Navigate to the Service Map page
3. The map should load with Google Maps
4. Test the features:
   - Current location detection
   - POI search
   - Directions and navigation
   - Travel information

## Features Implemented

### ✅ Geolocation
- Get user's current location
- Center map on user location
- Location-based services

### ✅ POI Search
- Search for places of interest
- Restaurant, hospital, shop search
- Distance calculation
- Place details and ratings

### ✅ Navigation
- Turn-by-turn directions
- Multiple travel modes (driving, walking, transit, cycling)
- Route optimization
- Alternative routes

### ✅ Travel Information
- Distance and duration
- Cost estimation
- Accessibility information
- Multiple transportation options

## API Usage and Billing

### Free Tier Limits (per month)
- Maps JavaScript API: 28,500 map loads
- Places API: 1,000 requests
- Geocoding API: 2,500 requests
- Directions API: 2,500 requests

### Cost After Free Tier
- Maps JavaScript API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests
- Geocoding API: $5 per 1,000 requests
- Directions API: $5 per 1,000 requests

### Monitoring Usage
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" > "Dashboard"
3. View API usage and quotas
4. Set up billing alerts

## Troubleshooting

### Common Issues

#### "Google Maps not initialized"
- Check if API key is correctly set in environment variables
- Verify APIs are enabled in Google Cloud Console
- Check browser console for error messages

#### "Places search failed"
- Ensure Places API is enabled
- Check if API key has proper restrictions
- Verify billing is enabled

#### "Geolocation error"
- Check if user has granted location permissions
- Ensure HTTPS is used (required for geolocation)
- Test in different browsers

#### "Directions request failed"
- Verify Directions API is enabled
- Check if origin/destination addresses are valid
- Ensure API key has proper restrictions

### Debug Mode

Enable debug logging by checking browser console:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## Security Best Practices

1. **Restrict API Key**: Limit to specific domains and APIs
2. **Monitor Usage**: Set up billing alerts and usage quotas
3. **HTTPS Only**: Use HTTPS in production for geolocation
4. **Rate Limiting**: Implement client-side rate limiting if needed

## Support

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Maps Platform Support](https://developers.google.com/maps/support)

## Next Steps

After setup, you can:
1. Customize map styles and appearance
2. Add more POI categories
3. Implement advanced routing features
4. Add real-time traffic information
5. Integrate with your backend services
