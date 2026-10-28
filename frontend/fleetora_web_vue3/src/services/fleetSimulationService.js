/**
 * Fleetora Fleet Management & Telemetry Simulation Service
 * Provides realistic demo vehicle fleet tracking centered in Sétif, Algeria.
 * Complies with Fleetora vehicle & user data models without external dependencies.
 */

// Sétif & regional road coordinate waypoints for moving vehicle simulation
const ROUTE_SETIF_EL_EULMA = [
  { lat: 36.1911, lng: 5.4137 }, // Sétif Centre (Ain El Fouara)
  { lat: 36.1884, lng: 5.4382 }, // Boulevard Cité 1014
  { lat: 36.1825, lng: 5.4650 }, // Sortie Est Sétif / RN5
  { lat: 36.1760, lng: 5.5020 }, // RN5 Ain Trick junction
  { lat: 36.1710, lng: 5.5480 }, // RN5 Guellal crossroad
  { lat: 36.1650, lng: 5.5990 }, // RN5 Freight corridor
  { lat: 36.1595, lng: 5.6420 }, // El Eulma Commercial perimeter
  { lat: 36.1554, lng: 5.6982 }  // El Eulma Cargo Terminal
]

const ROUTE_SETIF_AIN_OULMENE = [
  { lat: 36.1772, lng: 5.4215 }, // Sétif Zone Industrielle
  { lat: 36.1450, lng: 5.3980 }, // RN28 South exit
  { lat: 36.0820, lng: 5.3620 }, // RN28 Mezloug
  { lat: 36.0150, lng: 5.3340 }, // RN28 Ouled Si Ahmed
  { lat: 35.9189, lng: 5.2974 }  // Ain Oulmene Distribution Hub
]

// Initial Fleetora Demo Fleet Vehicles
const INITIAL_DEMO_FLEET = [
  {
    _id: 'flt-veh-001',
    code: 'FLT-SET-01',
    name: 'Semi-Remorque (Heavy Freight 20T+)',
    category: 'Semi-Remorque',
    licensePlate: '00192-120-19',
    photo: '/trucks/4.png',
    priceKm: 260,
    minimum: 12000,
    status: 'moving', // moving, available, stopped, offline, maintenance
    speed: 58,
    heading: 85,
    fuelLevel: 82,
    cargo: 'Industrial Machinery & Structural Steel',
    weight: '16.5 Tons',
    destination: 'El Eulma Freight Terminal',
    origin: 'Sétif Centre Logistics Hub',
    driver: {
      name: 'Rachid Bouzid',
      phone: '+213 551 23 45 67',
      code: 'DRV-19-044',
      rating: 4.9,
      avatar: '/avatar.png'
    },
    location: {
      lat: 36.1825,
      lng: 5.4650,
      address: 'Route Nationale 5, Sortie Est, Sétif'
    },
    assignedRoute: ROUTE_SETIF_EL_EULMA,
    currentWaypointIndex: 2,
    routeProgressDirection: 1, // 1 forward, -1 backward
    lastUpdate: new Date().toISOString()
  },
  {
    _id: 'flt-veh-002',
    code: 'FLT-SET-02',
    name: 'Camion Moyen (Box Truck 3.5T - 5T)',
    category: 'Camion Moyen',
    licensePlate: '01843-118-19',
    photo: '/trucks/2.jpg',
    priceKm: 110,
    minimum: 4500,
    status: 'stopped',
    speed: 0,
    heading: 180,
    fuelLevel: 65,
    cargo: 'Retail Consumer Goods & Electronics',
    weight: '3.2 Tons',
    destination: 'Zone Industrielle Sétif Loading Bay 4',
    origin: 'Algiers Depot',
    driver: {
      name: 'Karim Benali',
      phone: '+213 550 00 00 02',
      code: 'FLT-DRV-001',
      rating: 4.8,
      avatar: '/avatar.png'
    },
    location: {
      lat: 36.1772,
      lng: 5.4215,
      address: 'Zone Industrielle Sétif, Voie D, Sétif'
    },
    assignedRoute: null,
    lastUpdate: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    _id: 'flt-veh-003',
    code: 'FLT-SET-03',
    name: 'Fourgonnette (Van < 1.5T)',
    category: 'Fourgonnette',
    licensePlate: '04921-121-19',
    photo: '/trucks/1.jpeg',
    priceKm: 65,
    minimum: 2500,
    status: 'available',
    speed: 0,
    heading: 0,
    fuelLevel: 94,
    cargo: 'Available for Immediate Dispatch',
    weight: 'Empty (1.4T Capacity)',
    destination: 'Standby at Hub',
    origin: 'Ain Arnat Airport Logistics Area',
    driver: {
      name: 'Walid Cherif',
      phone: '+213 552 98 76 54',
      code: 'DRV-19-082',
      rating: 5.0,
      avatar: '/avatar.png'
    },
    location: {
      lat: 36.1781,
      lng: 5.3256,
      address: 'Plateforme Fret Aéroport Ain Arnat, Sétif'
    },
    assignedRoute: null,
    lastUpdate: new Date(Date.now() - 3 * 60000).toISOString()
  },
  {
    _id: 'flt-veh-004',
    code: 'FLT-SET-04',
    name: 'Camion Frigorifique (Refrigerated 10T)',
    category: 'Camion Frigorifique',
    licensePlate: '00782-119-19',
    photo: '/trucks/5.jpg',
    priceKm: 220,
    minimum: 9500,
    status: 'moving',
    speed: 48,
    heading: 195,
    fuelLevel: 78,
    cargo: 'Fresh Dairy & Cold Chain Produce (+4°C)',
    weight: '7.8 Tons',
    destination: 'Ain Oulmene Supermarket Central Hub',
    origin: 'Sétif Agro-Park',
    driver: {
      name: 'Sofiane Meziani',
      phone: '+213 553 45 67 89',
      code: 'DRV-19-015',
      rating: 4.7,
      avatar: '/avatar.png'
    },
    location: {
      lat: 36.0820,
      lng: 5.3620,
      address: 'Route Nationale 28, Mezloug vers Ain Oulmene'
    },
    assignedRoute: ROUTE_SETIF_AIN_OULMENE,
    currentWaypointIndex: 2,
    routeProgressDirection: 1,
    lastUpdate: new Date().toISOString()
  },
  {
    _id: 'flt-veh-005',
    code: 'FLT-SET-05',
    name: 'Camion Plateau (Flatbed 10T)',
    category: 'Camion Plateau',
    licensePlate: '03102-117-19',
    photo: '/trucks/3.png',
    priceKm: 180,
    minimum: 7500,
    status: 'maintenance',
    speed: 0,
    heading: 270,
    fuelLevel: 45,
    cargo: 'Scheduled 50,000 KM Hydraulic Inspection',
    weight: 'Empty',
    destination: 'Sétif Central Fleet Workshop',
    origin: 'Workshop Bay 2',
    driver: {
      name: 'Mourad Belkacem',
      phone: '+213 554 11 22 33',
      code: 'DRV-19-009',
      rating: 4.6,
      avatar: '/avatar.png'
    },
    location: {
      lat: 36.2050,
      lng: 5.3850,
      address: 'Garage Central Fleetora, Zone Nord, Sétif'
    },
    assignedRoute: null,
    lastUpdate: new Date(Date.now() - 180 * 60000).toISOString()
  },
  {
    _id: 'flt-veh-006',
    code: 'FLT-SET-06',
    name: 'Fourgonnette (Van < 1.5T)',
    category: 'Fourgonnette',
    licensePlate: '05520-122-19',
    photo: '/trucks/1.jpeg',
    priceKm: 65,
    minimum: 2500,
    status: 'offline',
    speed: 0,
    heading: 0,
    fuelLevel: 88,
    cargo: 'Driver Shift Concluded',
    weight: 'Empty',
    destination: 'Parked',
    origin: 'Sétif Université Depot',
    driver: {
      name: 'Yacine Haddad',
      phone: '+213 555 88 99 00',
      code: 'DRV-19-103',
      rating: 4.9,
      avatar: '/avatar.png'
    },
    location: {
      lat: 36.1985,
      lng: 5.4320,
      address: 'Parking El Bez, Sétif'
    },
    assignedRoute: null,
    lastUpdate: new Date(Date.now() - 360 * 60000).toISOString()
  }
]

class FleetSimulationService {
  constructor() {
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_DEMO_FLEET))
    this.subscribers = new Set()
    this.timerId = null
    this.isSimulating = false
  }

  /**
   * Get all fleet vehicles
   */
  getVehicles() {
    return this.vehicles
  }

  /**
   * Get vehicle by ID or Code
   */
  getVehicleById(id) {
    return this.vehicles.find((v) => v._id === id || v.code === id)
  }

  /**
   * Get status styling badge definitions
   */
  getStatusMeta(status) {
    switch (status) {
      case 'moving':
        return {
          label: 'Moving',
          color: '#0284C7', // Sky Blue
          chipColor: 'info',
          bgClass: 'bg-info-50',
          textColor: 'text-info',
          icon: 'mdi-truck-fast',
          pulse: true
        }
      case 'available':
        return {
          label: 'Available',
          color: '#10B981', // Emerald Green
          chipColor: 'success',
          bgClass: 'bg-success-50',
          textColor: 'text-success',
          icon: 'mdi-check-circle',
          pulse: false
        }
      case 'stopped':
        return {
          label: 'Stopped',
          color: '#F59E0B', // Amber
          chipColor: 'warning',
          bgClass: 'bg-warning-50',
          textColor: 'text-warning',
          icon: 'mdi-pause-circle',
          pulse: false
        }
      case 'maintenance':
        return {
          label: 'Maintenance',
          color: '#8B5CF6', // Purple
          chipColor: 'secondary',
          bgClass: 'bg-purple-50',
          textColor: 'text-purple',
          icon: 'mdi-wrench-clock',
          pulse: false
        }
      case 'offline':
      default:
        return {
          label: 'Offline',
          color: '#64748B', // Slate
          chipColor: 'grey',
          bgClass: 'bg-slate-50',
          textColor: 'text-grey',
          icon: 'mdi-power-off',
          pulse: false
        }
    }
  }

  /**
   * Start live coordinate simulation loop (advances moving vehicles)
   * @param {Function} callback - Called whenever vehicle coordinates change
   */
  startSimulation(callback) {
    if (callback) {
      this.subscribers.add(callback)
    }

    if (this.isSimulating) return

    this.isSimulating = true
    this.timerId = setInterval(() => {
      this.tick()
    }, 2800) // Update every 2.8s for smooth realistic movement
  }

  /**
   * Stop simulation loop
   */
  stopSimulation(callback) {
    if (callback) {
      this.subscribers.delete(callback)
    }
    if (this.subscribers.size === 0 && this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
      this.isSimulating = false
    }
  }

  /**
   * Internal simulation cycle
   */
  tick() {
    let hasChanges = false

    for (const vehicle of this.vehicles) {
      if (vehicle.status === 'moving' && vehicle.assignedRoute && vehicle.assignedRoute.length > 1) {
        const route = vehicle.assignedRoute
        let idx = vehicle.currentWaypointIndex || 0
        let dir = vehicle.routeProgressDirection || 1

        // Advance to next waypoint
        idx += dir
        if (idx >= route.length - 1) {
          idx = route.length - 1
          dir = -1 // reverse direction for continuous loop
        } else if (idx <= 0) {
          idx = 0
          dir = 1
        }

        const nextPoint = route[idx]
        const prevPoint = vehicle.location

        // Calculate heading/bearing
        const y = Math.sin((nextPoint.lng - prevPoint.lng) * (Math.PI / 180)) * Math.cos(nextPoint.lat * (Math.PI / 180))
        const x =
          Math.cos(prevPoint.lat * (Math.PI / 180)) * Math.sin(nextPoint.lat * (Math.PI / 180)) -
          Math.sin(prevPoint.lat * (Math.PI / 180)) * Math.cos(nextPoint.lat * (Math.PI / 180)) * Math.cos((nextPoint.lng - prevPoint.lng) * (Math.PI / 180))
        const bearing = Math.round((Math.atan2(y, x) * (180 / Math.PI) + 360) % 360)

        vehicle.location = {
          lat: nextPoint.lat,
          lng: nextPoint.lng,
          address: vehicle.location.address
        }
        vehicle.heading = bearing
        vehicle.speed = Math.floor(45 + Math.random() * 20)
        vehicle.currentWaypointIndex = idx
        vehicle.routeProgressDirection = dir
        vehicle.lastUpdate = new Date().toISOString()
        hasChanges = true
      }
    }

    if (hasChanges) {
      const copy = JSON.parse(JSON.stringify(this.vehicles))
      for (const cb of this.subscribers) {
        try {
          cb(copy)
        } catch (e) {
          console.error('[FleetSimulation] Error in subscriber callback:', e)
        }
      }
    }
  }
}

export const fleetSimulation = new FleetSimulationService()
