// API Configuration for Evergreen Way
// All API keys and endpoints are centralized here

export const API_CONFIG = {
  // Postmark Email Service
  POSTMARK: {
    API_KEY: 'e297544f-690e-4de4-b14d-15133b77e652',
    FROM_EMAIL: 'noreply@evergreenway.com', // 你需要验证这个邮箱
    API_URL: 'https://api.postmarkapp.com/email',
    ENABLED: true
  },

  // Claude AI Service via ChatAI API
  CLAUDE: {
    API_KEY: 'sk-eC1I52vBo0X5UhVpRp7kO0lQFKaARXRVksrjmpMb9txGj8y3',
    BASE_URL: 'https://www.chataiapi.com/v1',
    API_URL: 'https://www.chataiapi.com/v1/chat/completions',
    MODEL: 'claude-3-5-sonnet-20240620',
    MAX_TOKENS: 300,
    TEMPERATURE: 0.7,
    ENABLED: true
  },

  // Silicon Flow AI Service (Backup) - Disabled due to 401 errors
  SILICON_FLOW: {
    API_KEY: 'sk-huewffnnvgrogghzofeszhnsalqwwhikqxewjetrckbodfza',
    API_URL: 'https://api.siliconflow.com/v1/chat/completions',
    MODEL: 'qwen2.5-72b-instruct',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    ENABLED: false // Disabled due to persistent 401 authentication errors
  },

  // Local AI Service (Primary - Always available)
  LOCAL_AI: {
    API_KEY: '', // No API key needed
    API_URL: '', // Local processing
    MODEL: 'local-smart-ai',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    ENABLED: true // Primary service - always enabled
  },

  // Hugging Face AI Service (Disabled due to auth issues)
  HUGGING_FACE: {
    API_KEY: 'hf_demo', // Demo key for testing
    API_URL: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    MODEL: 'microsoft/DialoGPT-medium',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    ENABLED: false // Disabled due to 401 errors
  },

  // OpenAI-compatible Free Service (Disabled due to auth issues)
  FREE_AI: {
    API_KEY: '', // No API key needed
    API_URL: 'https://api.openai-proxy.com/v1/chat/completions', // Free proxy
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    ENABLED: false // Disabled due to 401 errors
  },

  // Google Gemini AI Service (Disabled - no API key)
  GEMINI: {
    API_KEY: '', // No API key provided
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    MODEL: 'gemini-pro',
    MAX_TOKENS: 1500,
    TEMPERATURE: 0.7,
    ENABLED: false // Disabled - no API key
  },

  // Mapbox Service - Better English support and POI recognition
  MAPBOX: {
    // Free Mapbox access token (public token for demo)
    ACCESS_TOKEN: 'pk.eyJ1IjoiZXZlcmdyZWVud2F5IiwiYSI6ImNscXl6eGZoZjBhZGsya3BjZGNxdGNxZGcifQ.demo_token',
    STYLES: {
      streets: {
        name: 'Streets (English)',
        url: 'mapbox://styles/mapbox/streets-v12',
        id: 'streets-v12'
      },
      light: {
        name: 'Light (English)',
        url: 'mapbox://styles/mapbox/light-v11',
        id: 'light-v11'
      },
      dark: {
        name: 'Dark (English)',
        url: 'mapbox://styles/mapbox/dark-v11',
        id: 'dark-v11'
      },
      satellite: {
        name: 'Satellite Streets (English)',
        url: 'mapbox://styles/mapbox/satellite-streets-v12',
        id: 'satellite-streets-v12'
      }
    },
    DEFAULT_STYLE: 'streets-v12',
    DEFAULT_CENTER: [144.9631, -37.8136], // Melbourne, Australia (English)
    DEFAULT_ZOOM: 12,
    LANGUAGE: 'en',
    ENABLED: true,
    // Geocoding API for address search
    GEOCODING_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    // Directions API for navigation
    DIRECTIONS_URL: 'https://api.mapbox.com/directions/v5/mapbox',
    // Places API for POI search
    PLACES_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  },

  // OpenStreetMap Service (fallback)
  OPENSTREETMAP: {
    // Multiple English map styles available - using services designed for English labels
    STYLES: {
      voyager: {
        name: 'CartoDB Voyager (English)',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '© CartoDB © OpenStreetMap contributors'
      },
      positron: {
        name: 'CartoDB Positron (English)',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '© CartoDB © OpenStreetMap contributors'
      },
      darkMatter: {
        name: 'CartoDB Dark Matter (English)',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '© CartoDB © OpenStreetMap contributors'
      },
      esriWorld: {
        name: 'Esri World Street Map (English)',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '© Esri © OpenStreetMap contributors'
      }
    },
    API_URL: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    ATTRIBUTION: '© CartoDB © OpenStreetMap contributors',
    ENABLED: true,
    NOMINATIM_URL: 'https://nominatim.openstreetmap.org',
    OSRM_URL: 'https://router.project-osrm.org',
    LANGUAGE: 'en',
    SUBDOMAINS: 'abcd',
    DEFAULT_CENTER: [144.9631, -37.8136], // Melbourne, Australia (English)
    DEFAULT_ZOOM: 12
  },

  // Firebase Configuration (for authentication and database)
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    ENABLED: true
  }
};

// API Service Status Checker
export const checkAPIServiceStatus = () => {
  const status = {
    postmark: {
      enabled: API_CONFIG.POSTMARK.ENABLED,
      configured: !!API_CONFIG.POSTMARK.API_KEY && !!API_CONFIG.POSTMARK.FROM_EMAIL,
      ready: API_CONFIG.POSTMARK.ENABLED && !!API_CONFIG.POSTMARK.API_KEY && !!API_CONFIG.POSTMARK.FROM_EMAIL
    },
    gemini: {
      enabled: API_CONFIG.GEMINI.ENABLED,
      configured: !!API_CONFIG.GEMINI.API_KEY,
      ready: API_CONFIG.GEMINI.ENABLED && !!API_CONFIG.GEMINI.API_KEY
    },
    siliconFlow: {
      enabled: API_CONFIG.SILICON_FLOW.ENABLED,
      configured: !!API_CONFIG.SILICON_FLOW.API_KEY,
      ready: API_CONFIG.SILICON_FLOW.ENABLED && !!API_CONFIG.SILICON_FLOW.API_KEY
    },
    mapbox: {
      enabled: API_CONFIG.MAPBOX.ENABLED,
      configured: !!API_CONFIG.MAPBOX.ACCESS_TOKEN,
      ready: API_CONFIG.MAPBOX.ENABLED && !!API_CONFIG.MAPBOX.ACCESS_TOKEN
    },
    openstreetmap: {
      enabled: API_CONFIG.OPENSTREETMAP.ENABLED,
      configured: true,
      ready: API_CONFIG.OPENSTREETMAP.ENABLED
    },
    firebase: {
      enabled: API_CONFIG.FIREBASE.ENABLED,
      configured: !!API_CONFIG.FIREBASE.API_KEY && !!API_CONFIG.FIREBASE.PROJECT_ID,
      ready: API_CONFIG.FIREBASE.ENABLED && !!API_CONFIG.FIREBASE.API_KEY && !!API_CONFIG.FIREBASE.PROJECT_ID
    }
  };

  return status;
};

// API Headers Generator
export const getAPIHeaders = (service) => {
  switch (service) {
    case 'postmark':
      return {
        'X-Postmark-Server-Token': API_CONFIG.POSTMARK.API_KEY,
        'Content-Type': 'application/json'
      };
    
    case 'siliconFlow':
      return {
        'Authorization': `Bearer ${API_CONFIG.SILICON_FLOW.API_KEY}`,
        'Content-Type': 'application/json'
      };
    
    default:
      return {
        'Content-Type': 'application/json'
      };
  }
};

// API Error Messages
export const API_ERROR_MESSAGES = {
  POSTMARK: {
    NOT_CONFIGURED: 'Postmark email service is not configured',
    INVALID_API_KEY: 'Invalid Postmark API key',
    SENDER_NOT_VERIFIED: 'Sender email is not verified in Postmark',
    RATE_LIMIT: 'Rate limit exceeded for Postmark API',
    GENERIC: 'Failed to send email via Postmark'
  },
  SILICON_FLOW: {
    NOT_CONFIGURED: 'Silicon Flow AI service is not configured',
    INVALID_API_KEY: 'Invalid Silicon Flow API key',
    MODEL_NOT_AVAILABLE: 'AI model is not available',
    RATE_LIMIT: 'Rate limit exceeded for Silicon Flow API',
    GENERIC: 'Failed to get AI response'
  },
  OPENSTREETMAP: {
    NOT_CONFIGURED: 'OpenStreetMap service is not configured',
    GENERIC: 'Failed to load OpenStreetMap'
  }
};

// Development/Production Environment Check
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';
};

// API Rate Limiting (Basic)
export const API_RATE_LIMITS = {
  POSTMARK: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000
  },
  SILICON_FLOW: {
    MAX_REQUESTS_PER_MINUTE: 30,
    MAX_REQUESTS_PER_HOUR: 500
  },
  GOOGLE_MAPS: {
    MAX_REQUESTS_PER_MINUTE: 50,
    MAX_REQUESTS_PER_HOUR: 1000
  }
};

export default API_CONFIG;
