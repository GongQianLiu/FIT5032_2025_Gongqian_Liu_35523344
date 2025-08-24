// Map Service - OpenStreetMap integration
// Implements BR E.2: Geolocation with meaningful features
// Features: POI Search, Navigation, Travel Information

import { API_CONFIG, checkAPIServiceStatus, API_ERROR_MESSAGES } from '../config/api';

class OpenStreetMapService {
  constructor() {
    this.map = null;
    this.markers = [];
    this.currentLocation = null;
    this.isInitialized = false;
  }

  // Initialize OpenStreetMap
  async initialize(containerId) {
    try {
      console.log('🗺️ Initializing OpenStreetMap...');
      console.log('🔧 API_CONFIG:', API_CONFIG);
      console.log('🔧 OPENSTREETMAP config:', API_CONFIG.OPENSTREETMAP);

      const status = checkAPIServiceStatus();
      console.log('📊 API Status:', status);
      console.log('🗺️ OpenStreetMap status:', status.openstreetmap);

      if (!status.openstreetmap || !status.openstreetmap.ready) {
        throw new Error(API_ERROR_MESSAGES.OPENSTREETMAP.NOT_CONFIGURED);
      }

      // Load Leaflet CSS and JS if not already loaded
      if (!window.L) {
        await this.loadLeafletScripts();
      }

      // Initialize map with coordinates from config
      this.map = L.map(containerId).setView(API_CONFIG.OPENSTREETMAP.DEFAULT_CENTER, API_CONFIG.OPENSTREETMAP.DEFAULT_ZOOM);

      // Use CartoDB Voyager tiles for English labels and colorful display
      this.currentStyle = 'voyager';
      this.primaryLayer = L.tileLayer(API_CONFIG.OPENSTREETMAP.STYLES.voyager.url, {
        attribution: API_CONFIG.OPENSTREETMAP.STYLES.voyager.attribution,
        maxZoom: 18,
        subdomains: API_CONFIG.OPENSTREETMAP.SUBDOMAINS
      }).addTo(this.map);

      this.isInitialized = true;
      return { success: true };
    } catch (error) {
      console.error('OpenStreetMap initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load Leaflet scripts
  loadLeafletScripts() {
    return new Promise((resolve, reject) => {
      // Check if Leaflet is already loaded
      if (window.L) {
        resolve();
        return;
      }

      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = '';
      
      script.onload = () => {
        console.log('Leaflet loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Leaflet from unpkg');
        reject(new Error('Failed to load Leaflet'));
      };
      
      document.head.appendChild(script);
    });
  }

  // This method is no longer needed with the new style system
  // Keeping for backward compatibility
  addFallbackMapLayer() {
    console.warn('addFallbackMapLayer is deprecated. Use switchMapStyle instead.');
  }

  // Switch to different map style
  switchMapStyle(styleName) {
    if (!this.map || !API_CONFIG.OPENSTREETMAP.STYLES[styleName]) {
      return false;
    }

    try {
      // Store current view
      const currentCenter = this.map.getCenter();
      const currentZoom = this.map.getZoom();

      // Remove current tile layers only
      this.map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          this.map.removeLayer(layer);
        }
      });

      // Add new style layer
      const newStyle = API_CONFIG.OPENSTREETMAP.STYLES[styleName];
      const tileOptions = {
        attribution: newStyle.attribution,
        maxZoom: 18
      };

      // Only add subdomains if the URL contains {s} placeholder
      if (newStyle.url.includes('{s}')) {
        tileOptions.subdomains = API_CONFIG.OPENSTREETMAP.SUBDOMAINS;
      }

      this.primaryLayer = L.tileLayer(newStyle.url, tileOptions).addTo(this.map);

      // Update current style
      this.currentStyle = styleName;

      // Restore view
      this.map.setView(currentCenter, currentZoom);

      console.log(`Switched to ${styleName} map style`);
      return true;
    } catch (error) {
      console.error('Error switching map style:', error);
      return false;
    }
  }

  // Get available map styles
  getAvailableStyles() {
    return Object.keys(API_CONFIG.OPENSTREETMAP.STYLES);
  }

  // Get current map style
  getCurrentStyle() {
    return this.currentStyle;
  }

  // Get current location with fallback to Melbourne
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default Melbourne location');
        const defaultLocation = { lat: -37.8136, lng: 144.9631 };
        this.currentLocation = defaultLocation;

        if (this.map) {
          this.map.setView([defaultLocation.lat, defaultLocation.lng], 13);
          this.addMarker(defaultLocation, 'Melbourne (Default Location)', 'current');
        }

        resolve(defaultLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.currentLocation = location;

          // Center map on current location
          if (this.map) {
            this.map.setView([location.lat, location.lng], 15);
            this.addMarker(location, 'Current Location', 'current');
          }

          resolve(location);
        },
        (error) => {
          console.warn('Geolocation failed:', error.message, '- using default Melbourne location');
          const defaultLocation = { lat: -37.8136, lng: 144.9631 };
          this.currentLocation = defaultLocation;

          if (this.map) {
            this.map.setView([defaultLocation.lat, defaultLocation.lng], 13);
            this.addMarker(defaultLocation, 'Melbourne (Default Location)', 'current');
          }

          resolve(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  // Search for points of interest
  async searchPOI(query, location) {
    try {
      // Use Nominatim API for geocoding and POI search
      const response = await fetch(
        `${API_CONFIG.OPENSTREETMAP.NOMINATIM_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=10&lat=${location.lat}&lon=${location.lng}&radius=5000&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      const pois = data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
        distance: this.calculateDistance(location, { lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
      }));

      // Add markers for search results
      this.clearMarkers();
      pois.forEach(poi => {
        this.addMarker({ lat: poi.lat, lng: poi.lng }, poi.name, 'poi');
      });

      return { success: true, pois };
    } catch (error) {
      console.error('POI search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Geocode address
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `${API_CONFIG.OPENSTREETMAP.NOMINATIM_URL}/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      if (data.length === 0) {
        throw new Error('Address not found');
      }

      const result = data[0];
      return {
        success: true,
        geocode: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get travel information
  async getTravelInfo(origin, destination, mode = 'driving') {
    try {
      // Map travel modes to OSRM supported modes
      const osrmMode = this.mapTravelMode(mode);
      
      // Use OSRM API for routing
      const response = await fetch(
        `${API_CONFIG.OPENSTREETMAP.OSRM_URL}/route/v1/${osrmMode}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error('Routing request failed');
      }

      const data = await response.json();
      if (data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      
      // Draw route on map
      this.drawRoute(route.geometry);

      return {
        success: true,
        travelInfo: {
          distance: (route.distance / 1000).toFixed(1) + ' km',
          duration: Math.round(route.duration / 60) + ' min',
          cost: this.estimateCost('driving', route.distance / 1000),
          accessibility: 'Route available'
        },
        route: route.geometry
      };
    } catch (error) {
      console.error('Travel info error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add marker to map
  addMarker(position, title, type = 'default') {
    if (!this.map) return;

    const icon = this.getMarkerIcon(type);
    const marker = L.marker([position.lat, position.lng], { icon })
      .addTo(this.map)
      .bindPopup(title);

    this.markers.push(marker);
    return marker;
  }

  // Get marker icon based on type
  getMarkerIcon(type) {
    const iconOptions = {
      iconUrl: this.getIconUrl(type),
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    };

    return L.icon(iconOptions);
  }

  // Get icon URL based on type
  getIconUrl(type) {
    switch (type) {
      case 'current':
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
      case 'poi':
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
      case 'service':
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
      default:
        return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png';
    }
  }

  // Draw route on map
  drawRoute(geometry) {
    if (!this.map) return;

    // Remove existing route
    this.clearRoute();

    // Add new route
    const routeLayer = L.geoJSON(geometry, {
      style: {
        color: '#007bff',
        weight: 4,
        opacity: 0.7
      }
    }).addTo(this.map);

    this.routeLayer = routeLayer;
  }

  // Clear route
  clearRoute() {
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
  }

  // Clear markers
  clearMarkers() {
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLon = this.deg2rad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  }

  // Calculate distance from current location to a point
  calculateDistanceFromCurrent(lat, lon) {
    if (!this.currentLocation) {
      return null;
    }
    return this.calculateDistance(
      this.currentLocation, 
      { lat: parseFloat(lat), lng: parseFloat(lon) }
    );
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Map travel modes to OSRM supported modes
  mapTravelMode(mode) {
    const modeMap = {
      'driving': 'driving',
      'walking': 'foot',
      'bicycling': 'cycling',
      'transit': 'driving' // Fallback to driving for transit
    };
    return modeMap[mode] || 'driving';
  }

  // Estimate travel cost
  estimateCost(mode, distance) {
    const costs = {
      driving: `$${(distance * 0.15).toFixed(2)}`,
      walking: 'Free',
      bicycling: 'Free',
      transit: `$${(distance * 0.25).toFixed(2)}`
    };
    return costs[mode] || 'Free';
  }

  // Check service status
  checkStatus() {
    return checkAPIServiceStatus().openstreetmap;
  }

  // Destroy map
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.isInitialized = false;
    this.clearMarkers();
    this.clearRoute();
  }
}

export default new OpenStreetMapService();
