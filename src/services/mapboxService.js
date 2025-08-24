// Enhanced Mapbox Service for English maps and elderly services
// Implements BR E.2: Geolocation with meaningful features
// Features: English street names, POI Search, Navigation, Elderly Services

import { API_CONFIG } from '../config/api';

class MapboxService {
  constructor() {
    this.map = null;
    this.markers = [];
    this.currentLocation = null;
    this.isInitialized = false;
    this.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'; // Free public token
  }

  // Initialize Mapbox GL JS
  async initialize(containerId) {
    try {
      // Load Mapbox GL JS if not already loaded
      if (!window.mapboxgl) {
        await this.loadMapboxScripts();
      }

      // Set access token
      window.mapboxgl.accessToken = this.accessToken;

      // Initialize map with English locale
      this.map = new window.mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/streets-v12', // English street names
        center: [-74.006, 40.7128], // New York City (good English reference)
        zoom: 12,
        language: 'en' // Force English language
      });

      // Add navigation controls
      this.map.addControl(new window.mapboxgl.NavigationControl());

      // Add geolocate control
      const geolocate = new window.mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });
      this.map.addControl(geolocate);

      // Wait for map to load
      await new Promise((resolve) => {
        this.map.on('load', resolve);
      });

      this.isInitialized = true;
      return { success: true };
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  // Load Mapbox GL JS scripts
  loadMapboxScripts() {
    return new Promise((resolve, reject) => {
      if (window.mapboxgl) {
        resolve();
        return;
      }

      // Load Mapbox GL CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);

      // Load Mapbox GL JS
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      
      script.onload = () => {
        console.log('Mapbox GL JS loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Mapbox GL JS');
        reject(new Error('Failed to load Mapbox GL JS'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Get current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => reject(new Error(`Geolocation error: ${error.message}`)),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // Search for elderly services using Mapbox Places API
  async searchElderlyServices(location, radius = 5000) {
    try {
      const elderlyServiceTypes = [
        'hospital',
        'pharmacy',
        'clinic',
        'nursing home',
        'senior center',
        'assisted living',
        'medical center',
        'rehabilitation center',
        'community center',
        'social services'
      ];

      const allServices = [];

      // Search for each service type
      for (const serviceType of elderlyServiceTypes) {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(serviceType)}.json?` +
          `proximity=${location.lng},${location.lat}&` +
          `limit=10&` +
          `access_token=${this.accessToken}&` +
          `language=en&` +
          `types=poi`;

        try {
          const response = await fetch(url);
          const data = await response.json();

          if (data.features) {
            const services = data.features.map(feature => ({
              id: feature.id,
              name: feature.text || feature.place_name,
              type: serviceType,
              category: this.categorizeElderlyService(serviceType),
              location: {
                lat: feature.center[1],
                lng: feature.center[0]
              },
              address: feature.place_name,
              distance: this.calculateDistance(location, {
                lat: feature.center[1],
                lng: feature.center[0]
              }),
              properties: feature.properties || {}
            }));

            allServices.push(...services);
          }
        } catch (error) {
          console.warn(`Failed to search for ${serviceType}:`, error);
        }
      }

      // Filter by radius and sort by distance
      const filteredServices = allServices
        .filter(service => service.distance <= radius / 1000) // Convert to km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20); // Limit to 20 results

      return {
        success: true,
        services: filteredServices
      };
    } catch (error) {
      console.error('Elderly services search failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Categorize elderly services
  categorizeElderlyService(serviceType) {
    const categories = {
      'hospital': 'healthcare',
      'pharmacy': 'healthcare',
      'clinic': 'healthcare',
      'medical center': 'healthcare',
      'rehabilitation center': 'healthcare',
      'nursing home': 'residential',
      'assisted living': 'residential',
      'senior center': 'community',
      'community center': 'community',
      'social services': 'support'
    };
    return categories[serviceType] || 'other';
  }

  // Get directions between two points
  async getDirections(origin, destination, profile = 'walking') {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
        `${origin.lng},${origin.lat};${destination.lng},${destination.lat}?` +
        `steps=true&` +
        `geometries=geojson&` +
        `language=en&` +
        `access_token=${this.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          success: true,
          directions: {
            distance: `${(route.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(route.duration / 60)} minutes`,
            steps: route.legs[0].steps.map(step => ({
              instruction: step.maneuver.instruction,
              distance: `${step.distance} m`,
              duration: `${Math.round(step.duration / 60)} min`
            })),
            geometry: route.geometry
          }
        };
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Directions request failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Search places with English names
  async searchPlaces(query, location) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `proximity=${location.lng},${location.lat}&` +
        `limit=10&` +
        `language=en&` +
        `access_token=${this.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features) {
        const places = data.features.map(feature => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          location: {
            lat: feature.center[1],
            lng: feature.center[0]
          },
          type: feature.place_type[0],
          relevance: feature.relevance
        }));

        return { success: true, places };
      } else {
        return { success: true, places: [] };
      }
    } catch (error) {
      console.error('Places search failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Add marker to map
  addMarker(location, options = {}) {
    if (!this.map) return null;

    const marker = new window.mapboxgl.Marker(options)
      .setLngLat([location.lng, location.lat])
      .addTo(this.map);

    if (options.popup) {
      const popup = new window.mapboxgl.Popup()
        .setHTML(options.popup);
      marker.setPopup(popup);
    }

    this.markers.push(marker);
    return marker;
  }

  // Clear all markers
  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Switch map style
  switchStyle(styleId) {
    if (this.map && API_CONFIG.MAPBOX.STYLES[styleId]) {
      this.map.setStyle(`mapbox://styles/mapbox/${API_CONFIG.MAPBOX.STYLES[styleId].id}`);
    }
  }

  // Center map on location
  centerOn(location, zoom = 15) {
    if (this.map) {
      this.map.flyTo({
        center: [location.lng, location.lat],
        zoom: zoom
      });
    }
  }
}

export default new MapboxService();
