<template>
  <div class="page-container">
    <nav class="navbar">
      <div class="container-fluid">
        <router-link to="/elderly-dashboard" class="navbar-brand">
          <i class="bi bi-heart-fill"></i>
          Evergreen Way - Service Map
        </router-link>
        <div class="d-flex me-auto">
          <router-link to="/volunteer-home" class="btn btn-outline-light me-2">
            <i class="bi bi-house"></i>
            Home
          </router-link>
          <router-link to="/elderly-home" class="btn btn-outline-light me-2">
            <i class="bi bi-house-fill"></i>
            Home
          </router-link>
        </div>
        <div class="d-flex">
          <router-link to="/elderly-dashboard" class="btn btn-outline-light me-2">
            <i class="bi bi-house"></i>
            Back to Dashboard
          </router-link>
          <button class="btn btn-outline-light" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="main-content">
      <div class="container-fluid">
        <div class="page-header mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1>Service Map</h1>
              <p class="text-muted">Find nearby health services and community activities</p>
            </div>
            <div>
              <button class="btn btn-outline-primary me-2" @click="refreshLocation">
                <i class="bi bi-geo-alt"></i>
                Refresh Location
              </button>
              <button class="btn btn-primary" @click="showFilterModal">
                <i class="bi bi-funnel"></i>
                Filter Services
              </button>
              <div class="btn-group ms-2" role="group">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary dropdown-toggle" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  title="Choose map style"
                >
                  <i class="bi bi-palette"></i>
                  {{ getCurrentMapStyleName() }}
                </button>
                <ul class="dropdown-menu">
                  <li v-for="style in availableMapStyles" :key="style.key">
                    <a class="dropdown-item" href="#" @click.prevent="switchMapStyle(style.key)">
                      {{ style.name }}
                    </a>
                  </li>
                </ul>
              </div>
              <button class="btn btn-outline-info ms-2" @click="displayServicesOnMap" title="Show all services on the map">
                <i class="bi bi-geo-alt-fill"></i>
                Show Services
              </button>
              <button class="btn btn-success ms-2" @click="searchElderlyServices" title="Search for elderly care services">
                <i class="bi bi-heart-pulse"></i>
                Find Elderly Services
              </button>
            </div>
          </div>
        </div>

        <!-- Search and Navigation Controls -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0"><i class="bi bi-search"></i> Search Places</h6>
              </div>
              <div class="card-body">
                <div class="input-group mb-2">
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="searchQuery" 
                    placeholder="Search for places..."
                    @keyup.enter="searchPlaces"
                  />
                  <button class="btn btn-primary" @click="searchPlaces">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
                <small class="text-muted">Search for restaurants, hospitals, shops, etc.</small>
                
                <!-- Search Results -->
                <div v-if="searchResults.length > 0" class="search-results mt-3">
                  <h6>Search Results ({{ searchResults.length }})</h6>
                  <div class="search-result-item" 
                       v-for="result in searchResults" 
                       :key="result.id"
                       @click="selectSearchResult(result)">
                    <div class="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{{ result.name }}</strong>
                        <small class="d-block text-muted">{{ result.distance ? result.distance + 'km away' : 'Distance calculating...' }}</small>
                      </div>
                      <span class="badge bg-info">{{ result.type }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0"><i class="bi bi-arrow-right-circle"></i> Get Directions</h6>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <input 
                    type="text" 
                    class="form-control mb-2" 
                    v-model="originAddress" 
                    placeholder="From (or use current location)"
                  />
                  <input 
                    type="text" 
                    class="form-control mb-2" 
                    v-model="destinationAddress" 
                    placeholder="To"
                  />
                  <select class="form-select mb-2" v-model="travelMode">
                    <option value="driving">Driving</option>
                    <option value="walking">Walking</option>
                    <option value="transit">Public Transit</option>
                    <option value="bicycling">Bicycling</option>
                  </select>
                  <button class="btn btn-success w-100" @click="getDirections" :disabled="!destinationAddress">
                    <i class="bi bi-route"></i> Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0"><i class="bi bi-info-circle"></i> Travel Information</h6>
              </div>
              <div class="card-body">
                <div v-if="travelInfo" class="travel-info">
                  <div class="d-flex justify-content-between mb-1">
                    <span>Distance:</span>
                    <strong>{{ travelInfo.distance }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span>Duration:</span>
                    <strong>{{ travelInfo.duration }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span>Cost:</span>
                    <strong>{{ travelInfo.cost }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-1">
                    <span>Accessibility:</span>
                    <strong>{{ travelInfo.accessibility }}</strong>
                  </div>
                </div>
                <div v-else class="text-muted">
                  <small>Get directions to see travel information</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Map Area -->
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">
                  <i class="bi bi-map"></i>
                  Interactive Map
                </h5>
              </div>
              <div class="card-body p-0">
                <div class="map-container">
                  <div id="google-map" class="google-map"></div>
                  <div v-if="!mapInitialized" class="map-loading">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading map...</span>
                    </div>
                    <p class="mt-2">Initializing Google Maps...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Service List -->
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">
                    <i class="bi bi-list"></i>
                    Nearby Services ({{ filteredServices.length }})
                    <small class="text-muted ms-2 d-block">Click "Show Services" to view on map</small>
                  </h5>
                  <button class="btn btn-sm btn-outline-secondary" @click="showFilterModal">
                    <i class="bi bi-funnel"></i>
                    Filters
                  </button>
                </div>
                
                <!-- Active Filters Display -->
                <div v-if="activeFilters.length > 0" class="mt-2">
                  <div class="d-flex flex-wrap gap-1">
                    <span 
                      v-for="filter in activeFilters" 
                      :key="filter"
                      class="badge bg-primary"
                    >
                      {{ filter }}
                    </span>
                    <button 
                      class="btn btn-sm btn-outline-danger ms-2"
                      @click="resetFilters"
                    >
                      <i class="bi bi-x"></i>
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="service-list">
                  <div 
                    v-for="service in filteredServices" 
                    :key="service.id"
                    class="service-item"
                    :class="{ active: selectedService?.id === service.id }"
                    @click="selectService(service)"
                  >
                    <div class="service-icon">
                      <i :class="getServiceIcon(service.type)"></i>
                    </div>
                    <div class="service-info">
                      <h6>{{ service.name }}</h6>
                      <p class="text-muted">{{ service.description }}</p>
                      <small class="text-muted d-block">{{ service.address }}</small>
                      <div class="service-meta">
                        <span class="badge bg-primary">{{ service.type }}</span>
                        <small class="text-muted">{{ service.distance ? service.distance + 'km' : 'Calculating...' }}</small>
                        <div class="rating mt-1">
                          <i 
                            v-for="star in 5" 
                            :key="star"
                            class="bi me-1"
                            :class="star <= service.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'"
                          ></i>
                          <small class="text-muted ms-1">({{ service.rating }})</small>
                        </div>
                      </div>
                    </div>
                    <div class="service-actions">
                      <button class="btn btn-sm btn-outline-primary" @click.stop="navigateToService(service)">
                        <i class="bi bi-arrow-right"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" @click.stop="bookService(service)">
                        <i class="bi bi-calendar-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Modal -->
    <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="filterModalLabel">
              <i class="bi bi-funnel me-2"></i>
              Filter Services
            </h5>
            <button type="button" class="btn-close" @click="closeFilterModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Service Type Filter -->
            <div class="mb-3">
              <label class="form-label">Service Type</label>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="serviceType" id="allTypes" value="all" v-model="modalServiceFilter" checked>
                <label class="form-check-label" for="allTypes">
                  All Types
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="serviceType" id="medicalType" value="medical" v-model="modalServiceFilter">
                <label class="form-check-label" for="medicalType">
                  <i class="bi bi-heart-pulse text-danger me-1"></i>
                  Medical Services
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="serviceType" id="socialType" value="social" v-model="modalServiceFilter">
                <label class="form-check-label" for="socialType">
                  <i class="bi bi-people text-primary me-1"></i>
                  Social Activities
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="serviceType" id="therapyType" value="therapy" v-model="modalServiceFilter">
                <label class="form-check-label" for="therapyType">
                  <i class="bi bi-heart text-success me-1"></i>
                  Therapy Services
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="serviceType" id="nutritionType" value="nutrition" v-model="modalServiceFilter">
                <label class="form-check-label" for="nutritionType">
                  <i class="bi bi-apple text-warning me-1"></i>
                  Nutrition Services
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="serviceType" id="exerciseType" value="exercise" v-model="modalServiceFilter">
                <label class="form-check-label" for="exerciseType">
                  <i class="bi bi-lightning text-info me-1"></i>
                  Exercise & Fitness
                </label>
              </div>
            </div>

            <!-- Distance Filter -->
            <div class="mb-3">
              <label class="form-label">Maximum Distance</label>
              <div class="input-group">
                <input type="range" class="form-range" min="0.5" max="5" step="0.5" v-model="maxDistance" id="distanceRange">
                <span class="input-group-text">{{ maxDistance }} km</span>
              </div>
            </div>

            <!-- Rating Filter -->
            <div class="mb-3">
              <label class="form-label">Minimum Rating</label>
              <div class="d-flex align-items-center">
                <div class="me-2">
                  <i class="bi bi-star-fill text-warning" v-for="star in 5" :key="star"></i>
                </div>
                <select class="form-select" v-model="minRating">
                  <option value="0">Any Rating</option>
                  <option value="1">1+ Star</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars Only</option>
                </select>
              </div>
            </div>

            <!-- Availability Filter -->
            <div class="mb-3">
              <label class="form-label">Availability</label>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="availableNow" v-model="availableNow">
                <label class="form-check-label" for="availableNow">
                  Available Now
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="weekendAvailable" v-model="weekendAvailable">
                <label class="form-check-label" for="weekendAvailable">
                  Weekend Available
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="resetFilters">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Reset
            </button>
            <button type="button" class="btn btn-primary" @click="applyFilters">
              <i class="bi bi-check-circle me-1"></i>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import openStreetMapService from '../services/googleMapsService';
import mapboxService from '../services/mapboxService';

export default {
  name: 'ServiceMap',
  setup() {
    const router = useRouter();
    const toast = useToast();

    const services = ref([
      {
        id: 1,
        name: 'Community Health Center',
        type: 'medical',
        description: 'Provides basic medical services and health checkups',
        lat: 39.9042,
        lng: 116.4074,
        distance: 0,
        rating: 4.5,
        hours: { open: 8, close: 18 },
        weekendAvailable: true,
        address: 'Central Beijing Medical District'
      },
      {
        id: 2,
        name: 'Elderly Activity Center',
        type: 'social',
        description: 'Provides various social activities and entertainment programs',
        lat: 39.9060,
        lng: 116.4090,
        distance: 0,
        rating: 4.2,
        hours: { open: 9, close: 17 },
        weekendAvailable: true,
        address: 'North Beijing Community Hub'
      },
      {
        id: 3,
        name: 'Rehabilitation Therapy Center',
        type: 'therapy',
        description: 'Professional rehabilitation therapy and physical therapy services',
        lat: 39.9020,
        lng: 116.4050,
        distance: 0,
        rating: 4.8,
        hours: { open: 7, close: 19 },
        weekendAvailable: false,
        address: 'South Beijing Health Zone'
      },
      {
        id: 4,
        name: 'Nutrition Consultation Center',
        type: 'nutrition',
        description: 'Professional nutritionist provides dietary guidance',
        lat: 39.9080,
        lng: 116.4110,
        distance: 0,
        rating: 4.0,
        hours: { open: 10, close: 16 },
        weekendAvailable: true,
        address: 'East Beijing Wellness District'
      },
      {
        id: 5,
        name: 'Sports & Fitness Center',
        type: 'exercise',
        description: 'Sports facilities and courses suitable for elderly',
        lat: 39.9000,
        lng: 116.4030,
        distance: 0,
        rating: 4.6,
        hours: { open: 6, close: 22 },
        weekendAvailable: true,
        address: 'West Beijing Sports Complex'
      },
      {
        id: 6,
        name: 'Senior Care Clinic',
        type: 'medical',
        description: 'Specialized healthcare for elderly patients',
        lat: 39.9100,
        lng: 116.4130,
        distance: 0,
        rating: 4.7,
        hours: { open: 8, close: 20 },
        weekendAvailable: true,
        address: 'North Beijing Medical Complex'
      },
      {
        id: 7,
        name: 'Memory Care Center',
        type: 'therapy',
        description: 'Specialized care for memory-related conditions',
        lat: 39.8980,
        lng: 116.4010,
        distance: 0,
        rating: 4.9,
        hours: { open: 9, close: 18 },
        weekendAvailable: false,
        address: 'South Beijing Specialized Care'
      }
    ]);

    const selectedService = ref(null);
    const serviceFilter = ref('all');
    
    // Filter state
    const maxDistance = ref(2.0);
    const minRating = ref(0);
    const availableNow = ref(false);
    const weekendAvailable = ref(false);
    const activeFilters = ref([]);
    const modalServiceFilter = ref('all');
    
    // Map style state
    const currentMapStyle = ref('voyager');
    const availableMapStyles = ref([
      { key: 'voyager', name: 'CartoDB Voyager (English)' },
      { key: 'positron', name: 'CartoDB Positron (English)' },
      { key: 'darkMatter', name: 'CartoDB Dark Matter (English)' },
      { key: 'esriWorld', name: 'Esri World Street Map (English)' }
    ]);
    
    // Google Maps related state
    const mapInitialized = ref(false);
    const currentLocation = ref(null);
    const searchQuery = ref('');
    const originAddress = ref('');
    const destinationAddress = ref('');
    const travelMode = ref('driving');
    const travelInfo = ref(null);
    const searchResults = ref([]);
    const isLoading = ref(false);

    const filteredServices = computed(() => {
      let filtered = [...services.value];
      
      // Filter by service type
      if (serviceFilter.value !== 'all') {
        filtered = filtered.filter(service => service.type === serviceFilter.value);
      }
      
      // Filter by distance
      filtered = filtered.filter(service => service.distance <= maxDistance.value);
      
      // Filter by rating (if service has rating)
      if (minRating.value > 0) {
        filtered = filtered.filter(service => {
          const rating = service.rating || 0;
          return rating >= minRating.value;
        });
      }
      
      // Filter by availability
      if (availableNow.value) {
        filtered = filtered.filter(service => {
          const now = new Date();
          const hour = now.getHours();
          return service.hours && service.hours.open <= hour && service.hours.close >= hour;
        });
      }
      
      if (weekendAvailable.value) {
        filtered = filtered.filter(service => {
          const today = new Date();
          const isWeekend = today.getDay() === 0 || today.getDay() === 6;
          return service.weekendAvailable !== false; // Default to true if not specified
        });
      }
      
      return filtered;
    });

    const getServiceIcon = (type) => {
      const icons = {
        medical: 'bi bi-heart-pulse',
        social: 'bi bi-people',
        therapy: 'bi bi-heart',
        nutrition: 'bi bi-apple',
        exercise: 'bi bi-lightning'
      };
      return icons[type] || 'bi bi-geo-alt';
    };

    const selectService = (service) => {
      selectedService.value = service;
      toast.info(`Selected: ${service.name}`);
    };

    const navigateToService = (service) => {
      destinationAddress.value = service.name;
      toast.success(`Destination set to: ${service.name}`);
      // Auto-trigger directions if we have current location
      if (currentLocation.value) {
        getDirections();
      }
    };

    const bookService = (service) => {
      // In a real app, this would open a booking modal or navigate to booking page
      toast.success(`Booking request for: ${service.name}. Feature coming soon!`);
    };

    // Generate mock nearby services based on location
    const generateMockNearbyServices = (location) => {
      const serviceTypes = [
        { type: 'medical', category: 'Health', names: ['City Hospital', 'Community Health Center', 'Medical Clinic', 'Family Practice'] },
        { type: 'therapy', category: 'Health', names: ['Rehabilitation Center', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy'] },
        { type: 'social', category: 'Social', names: ['Senior Center', 'Community Center', 'Social Services', 'Day Care Center'] },
        { type: 'nutrition', category: 'Health', names: ['Nutrition Center', 'Dietitian Office', 'Meal Delivery', 'Food Bank'] },
        { type: 'exercise', category: 'Fitness', names: ['Senior Fitness', 'Aqua Therapy', 'Yoga Studio', 'Walking Group'] }
      ];

      const mockServices = [];
      let serviceId = 1000;

      serviceTypes.forEach(serviceType => {
        serviceType.names.forEach((name, index) => {
          // Generate random coordinates within 5km of current location
          const latOffset = (Math.random() - 0.5) * 0.09; // ~5km
          const lngOffset = (Math.random() - 0.5) * 0.09;

          const serviceLat = location.lat + latOffset;
          const serviceLng = location.lng + lngOffset;

          mockServices.push({
            id: `mock_${serviceId++}`,
            name: name,
            category: serviceType.category,
            type: serviceType.type,
            lat: serviceLat,
            lng: serviceLng,
            address: `${Math.floor(Math.random() * 999) + 1} Main Street, City`,
            distance: Math.random() * 5000, // 0-5km
            rating: 3.5 + Math.random() * 1.5, // 3.5-5.0
            phone: `+1-555-${Math.floor(Math.random() * 9000 + 1000)}`,
            hours: 'Mon-Fri 8AM-6PM',
            description: `Professional ${serviceType.type} services for elderly care and support`,
            source: 'local'
          });
        });
      });

      return mockServices;
    };

    const refreshLocation = async () => {
      try {
        toast.info('Refreshing location...');
        await getCurrentLocation();
      } catch (error) {
        toast.error('Failed to refresh location');
      }
    };

    // Enhanced Maps functions with OpenStreetMap primary
    const initializeMap = async () => {
      try {
        isLoading.value = true;

        // Try OpenStreetMap first (more reliable)
        let result = await openStreetMapService.initialize('google-map');
        if (result.success) {
          mapInitialized.value = true;
          toast.success('Map loaded successfully');
          await getCurrentLocation();
          return;
        }

        // Fallback to Mapbox if available
        console.warn('OpenStreetMap failed, trying Mapbox:', result.error);
        try {
          result = await mapboxService.initialize('google-map');
          if (result.success) {
            mapInitialized.value = true;
            toast.success('Enhanced map loaded (English streets)');
            await getCurrentLocation();
            return;
          }
        } catch (mapboxError) {
          console.warn('Mapbox also failed:', mapboxError);
        }

        // If both fail, show error
        toast.error('Failed to initialize map services');
      } catch (error) {
        console.error('Map initialization error:', error);
        toast.error('Failed to initialize map');
      } finally {
        isLoading.value = false;
      }
    };

    const getCurrentLocation = async () => {
      try {
        const location = await openStreetMapService.getCurrentLocation();
        currentLocation.value = location;
        originAddress.value = 'Current Location';
        
        // Update service distances after getting location
        calculateServiceDistances();
        
        toast.success('Location updated');
      } catch (error) {
        console.error('Location error:', error);
        toast.error('Failed to get location: ' + error.message);
      }
    };

    // Calculate distances for all services
    const calculateServiceDistances = () => {
      if (openStreetMapService.currentLocation) {
        services.value.forEach(service => {
          if (service.lat && service.lng) {
            service.distance = openStreetMapService.calculateDistance(
              openStreetMapService.currentLocation,
              { lat: service.lat, lng: service.lng }
            );
          }
        });

        // Sort services by distance
        services.value.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
    };

    // Search for elderly services using local data
    const searchElderlyServices = async () => {
      try {
        if (!currentLocation.value) {
          await getCurrentLocation();
        }

        isLoading.value = true;
        toast.info('Searching for elderly services nearby...');

        // Generate mock nearby services based on current location
        const mockServices = generateMockNearbyServices(currentLocation.value);

        // Merge with existing services
        const existingIds = new Set(services.value.map(s => s.id));
        const newServices = mockServices.filter(s => !existingIds.has(s.id));

        if (newServices.length > 0) {
          services.value = [...services.value, ...newServices];
          calculateServiceDistances();
          toast.success(`Found ${newServices.length} nearby elderly services`);
        } else {
          toast.info('All nearby services are already displayed');
        }
      } catch (error) {
        console.error('Elderly services search error:', error);
        toast.error('Failed to search for elderly services');
      } finally {
        isLoading.value = false;
      }
    };

    // Display all services on the map
    const displayServicesOnMap = async () => {
      try {
        if (!mapInitialized.value) {
          toast.warning('Map is not initialized yet. Please wait...');
          return;
        }

        let markersAdded = 0;

        // Try Mapbox first
        if (mapboxService.isInitialized) {
          services.value.forEach(service => {
            if (service.lat && service.lng) {
              mapboxService.addMarker(
                { lat: service.lat, lng: service.lng },
                `${service.name} - ${service.address}`,
                'service'
              );
              markersAdded++;
            }
          });
        } else {
          // Fallback to OpenStreetMap
          services.value.forEach(service => {
            if (service.lat && service.lng) {
              openStreetMapService.addMarker(
                { lat: service.lat, lng: service.lng },
                `${service.name} - ${service.address}`,
                'service'
              );
              markersAdded++;
            }
          });
        }

        if (markersAdded > 0) {
          toast.success(`Displayed ${markersAdded} services on the map`);
        } else {
          toast.warning('No services with valid coordinates found');
        }
      } catch (error) {
        console.error('Error displaying services on map:', error);
        toast.error('Failed to display services on map');
      }
    };

    // Switch map style
    const switchMapStyle = (styleKey) => {
      try {
        let success = false;

        // Try Mapbox first if available
        if (mapboxService.isInitialized) {
          success = mapboxService.switchMapStyle(styleKey);
        } else {
          success = openStreetMapService.switchMapStyle(styleKey);
        }

        if (success) {
          currentMapStyle.value = styleKey;
          toast.success(`Switched to ${getStyleName(styleKey)} map style`);
        } else {
          toast.error('Failed to switch map style');
        }
      } catch (error) {
        console.error('Error switching map style:', error);
        toast.error('Error switching map style');
      }
    };

    // Get style name by key
    const getStyleName = (styleKey) => {
      const style = availableMapStyles.value.find(s => s.key === styleKey);
      return style ? style.name : styleKey;
    };

    // Get current map style name
    const getCurrentMapStyleName = () => {
      return getStyleName(currentMapStyle.value);
    };

    const searchPlaces = async () => {
      if (!searchQuery.value.trim()) {
        toast.warning('Please enter a search query');
        return;
      }

      try {
        isLoading.value = true;
        const location = currentLocation.value || { lat: -37.8136, lng: 144.9631 }; // Melbourne default

        // Try Mapbox first for better results
        if (mapboxService.isInitialized) {
          const result = await mapboxService.searchPOI(searchQuery.value, location);
          if (result.success && result.pois.length > 0) {
            searchResults.value = result.pois;
            toast.success(`Found ${result.pois.length} places`);
            return;
          }
        }

        // Fallback to OpenStreetMap
        const result = await openStreetMapService.searchPOI(searchQuery.value, location);
        if (result.success) {
          searchResults.value = result.pois;
          toast.success(`Found ${result.pois.length} places`);
        } else {
          toast.error('Search failed: ' + result.error);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed: ' + error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const getDirections = async () => {
      if (!destinationAddress.value.trim()) {
        toast.warning('Please enter a destination');
        return;
      }

      try {
        isLoading.value = true;
        let origin = currentLocation.value;

        // If origin address is provided, geocode it
        if (originAddress.value && originAddress.value !== 'Current Location') {
          let geocodeResult;
          if (mapboxService.isInitialized) {
            geocodeResult = await mapboxService.geocodeAddress(originAddress.value);
          } else {
            geocodeResult = await openStreetMapService.geocodeAddress(originAddress.value);
          }

          if (geocodeResult.success) {
            origin = geocodeResult.geocode;
          }
        }

        // Geocode destination
        let destResult;
        if (mapboxService.isInitialized) {
          destResult = await mapboxService.geocodeAddress(destinationAddress.value);
        } else {
          destResult = await openStreetMapService.geocodeAddress(destinationAddress.value);
        }

        if (!destResult.success) {
          toast.error('Invalid destination address');
          return;
        }

        // Get directions
        let result;
        if (mapboxService.isInitialized) {
          result = await mapboxService.getTravelInfo(origin, destResult.geocode, travelMode.value);
        } else {
          result = await openStreetMapService.getTravelInfo(origin, destResult.geocode, travelMode.value);
        }

        if (result.success) {
          travelInfo.value = result.travelInfo;
          toast.success('Directions loaded successfully');
        } else {
          toast.error('Failed to get directions: ' + result.error);
        }
      } catch (error) {
        console.error('Directions error:', error);
        toast.error('Failed to get directions: ' + error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const clearDirections = () => {
      // Note: OpenStreetMap handles route clearing automatically
      travelInfo.value = null;
      toast.info('Directions cleared');
    };

    const selectSearchResult = (result) => {
      destinationAddress.value = result.name;
      toast.success(`Selected: ${result.name}`);
    };

    const showFilterModal = () => {
      // Initialize modal values with current filter values
      modalServiceFilter.value = serviceFilter.value;

      // Show Bootstrap modal safely with retry mechanism
      const tryShowModal = () => {
        try {
          const modalElement = document.getElementById('filterModal');
          if (modalElement && window.bootstrap && window.bootstrap.Modal) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error showing modal:', error);
          return false;
        }
      };

      // Try immediately
      if (tryShowModal()) {
        return;
      }

      // If failed, wait a bit and try again
      setTimeout(() => {
        if (!tryShowModal()) {
          // Final fallback: show a simple alert
          toast.warning('Please wait for the page to fully load before using filters');
        }
      }, 500);
    };

    const applyFilters = () => {
      // Apply modal values to actual filters
      serviceFilter.value = modalServiceFilter.value;
      
      // Update active filters
      activeFilters.value = [];
      
      if (serviceFilter.value !== 'all') {
        activeFilters.value.push(`Type: ${serviceFilter.value}`);
      }
      if (maxDistance.value < 5) {
        activeFilters.value.push(`Max Distance: ${maxDistance.value}km`);
      }
      if (minRating.value > 0) {
        activeFilters.value.push(`Min Rating: ${minRating.value}+ stars`);
      }
      if (availableNow.value) {
        activeFilters.value.push('Available Now');
      }
      if (weekendAvailable.value) {
        activeFilters.value.push('Weekend Available');
      }
      
      // Hide modal safely
      try {
        const modalElement = document.getElementById('filterModal');
        if (modalElement && window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      } catch (error) {
        console.error('Error hiding modal:', error);
      }
      
      toast.success(`Applied ${activeFilters.value.length} filters`);
    };

    const resetFilters = () => {
      serviceFilter.value = 'all';
      maxDistance.value = 2.0;
      minRating.value = 0;
      availableNow.value = false;
      weekendAvailable.value = false;
      activeFilters.value = [];
      
      toast.info('Filters reset to default');
    };

    const closeFilterModal = () => {
      try {
        const modalElement = document.getElementById('filterModal');
        if (modalElement && window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      } catch (error) {
        console.error('Error closing modal:', error);
      }
    };

    const zoomIn = () => {
      if (openStreetMapService.map) {
        openStreetMapService.map.zoomIn();
        toast.success('Map zoomed in');
      } else {
        toast.warning('Map not initialized');
      }
    };

    const zoomOut = () => {
      if (openStreetMapService.map) {
        openStreetMapService.map.zoomOut();
        toast.success('Map zoomed out');
      } else {
        toast.warning('Map not initialized');
      }
    };

    const centerMap = async () => {
      try {
        if (currentLocation.value && openStreetMapService.map) {
          openStreetMapService.map.setView([currentLocation.value.lat, currentLocation.value.lng], 15);
          toast.success('Map centered on current location');
        } else {
          await getCurrentLocation();
        }
      } catch (error) {
        toast.error('Failed to center map');
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('currentUser');
      router.push('/login');
    };

    // Initialize map on component mount
    onMounted(() => {
      initializeMap();

      // Ensure Bootstrap is available for modals
      const checkBootstrap = () => {
        if (window.bootstrap && window.bootstrap.Modal) {
          console.log('Bootstrap is ready for modals');
        } else {
          console.log('Bootstrap not yet available, will retry when needed');
        }
      };

      // Check immediately and after a delay
      checkBootstrap();
      setTimeout(checkBootstrap, 1000);
    });

    return {
      services,
      selectedService,
      serviceFilter,
      filteredServices,
      getServiceIcon,
      selectService,
      navigateToService,
      getDirections,
      bookService,
      refreshLocation,
      showFilterModal,
      zoomIn,
      zoomOut,
      centerMap,
      handleLogout,
      // Google Maps related
      mapInitialized,
      currentLocation,
      searchQuery,
      originAddress,
      destinationAddress,
      travelMode,
      travelInfo,
      searchResults,
      isLoading,
      activeFilters,
      maxDistance,
      minRating,
      availableNow,
      weekendAvailable,
      modalServiceFilter,
      currentMapStyle,
      availableMapStyles,
      initializeMap,
      getCurrentLocation,
      calculateServiceDistances,
      displayServicesOnMap,
      switchMapStyle,
      getCurrentMapStyleName,
      searchPlaces,
      searchElderlyServices,
      clearDirections,
      selectSearchResult,
      applyFilters,
      resetFilters,
      closeFilterModal
    };
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0.75rem 0;
  color: white;
  flex-shrink: 0;
}

.navbar-brand {
  color: white;
  font-weight: 600;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f8f9fa;
}

.page-header h1 {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card {
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
}

.card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}

.map-container {
  height: 500px;
  position: relative;
  background: #e9ecef;
  border-radius: 0 0 8px 8px;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.map-content {
  text-align: center;
  z-index: 1;
}

.map-icon {
  font-size: 4rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.map-controls {
  margin-top: 1rem;
}

.map-markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: all;
  cursor: pointer;
}

.marker-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

.marker-icon:hover {
  transform: scale(1.1);
}

.marker-medical { background-color: #dc3545; }
.marker-social { background-color: #0d6efd; }
.marker-therapy { background-color: #198754; }
.marker-nutrition { background-color: #fd7e14; }
.marker-exercise { background-color: #6f42c1; }

.marker-tooltip {
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  white-space: nowrap;
  z-index: 10;
}

.marker-tooltip h6 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.marker-tooltip p {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: #6c757d;
}

.service-list {
  max-height: 400px;
  overflow-y: auto;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.service-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.service-item.active {
  background-color: #e3f2fd;
  border-color: #007bff;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  font-size: 1.2rem;
}

.service-item:nth-child(1) .service-icon { background-color: #dc3545; }
.service-item:nth-child(2) .service-icon { background-color: #0d6efd; }
.service-item:nth-child(3) .service-icon { background-color: #198754; }
.service-item:nth-child(4) .service-icon { background-color: #fd7e14; }
.service-item:nth-child(5) .service-icon { background-color: #6f42c1; }

.service-info {
  flex: 1;
}

.service-info h6 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.service-info p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.service-actions {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .map-container {
    height: 300px;
  }
  
  .service-item {
    flex-direction: column;
    text-align: center;
  }
  
  .service-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .service-actions {
    margin-top: 0.5rem;
  }
}

/* Map Styles */
.google-map {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  z-index: 1;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.travel-info {
  font-size: 0.9rem;
}

.travel-info .d-flex {
  border-bottom: 1px solid #eee;
  padding: 0.25rem 0;
}

.travel-info .d-flex:last-child {
  border-bottom: none;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.search-result-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

/* Filter Modal Styles */
.modal-header {
  background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
  color: white;
}

.modal-header .btn-close {
  filter: invert(1);
}

.form-range {
  width: 100%;
}

.rating {
  font-size: 0.8rem;
}

.rating .bi-star-fill {
  color: #ffc107;
}

.rating .bi-star {
  color: #6c757d;
}

/* Active Filters */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

.gap-1 {
  gap: 0.25rem !important;
}
</style>
