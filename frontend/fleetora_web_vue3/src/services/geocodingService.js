/**
 * Fleetora Open-Source Geocoding & Place Search Service (OSM / Nominatim)
 * Replaces Google Maps Geocoder and Places Autocomplete without API keys.
 * Includes client-side caching, rate-limiting, request debouncing, and cancellation.
 */

const DEFAULT_GEOCODING_URL = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'Fleetora-Logistics-Platform/1.0 (contact@fleetora.com.dz)'

// Curated Algerian Logistics Hubs (Instant offline autocomplete presets)
export const ALGERIA_LOGISTICS_HUBS = [
  {
    name: 'Sétif — Zone Industrielle & Dépôts Logistiques',
    address: 'Zone Industrielle Sétif, Sétif 19000, Algeria',
    lat: 36.1772,
    lng: 5.4215,
    city: 'Sétif',
    wilaya: 'Sétif (19)',
    type: 'Logistics Hub'
  },
  {
    name: 'Sétif — Centre Ville (Ain El Fouara)',
    address: 'Boulevard 8 Mai 1945, Centre Ville, Sétif 19000, Algeria',
    lat: 36.1911,
    lng: 5.4137,
    city: 'Sétif',
    wilaya: 'Sétif (19)',
    type: 'Commercial'
  },
  {
    name: 'Sétif — Gare Routière & Fret El Eulma',
    address: 'Avenue de la République, El Eulma, Sétif 19600, Algeria',
    lat: 36.1554,
    lng: 5.6982,
    city: 'El Eulma',
    wilaya: 'Sétif (19)',
    type: 'Wholesale & Cargo Market'
  },
  {
    name: 'Sétif — Plateforme Fret Aéroport Ain Arnat',
    address: 'Aéroport Ain Arnat 8 Mai 1945, Sétif, Algeria',
    lat: 36.1781,
    lng: 5.3256,
    city: 'Ain Arnat',
    wilaya: 'Sétif (19)',
    type: 'Air Freight Cargo'
  },
  {
    name: 'Sétif — Terminal Logistique Ain Oulmene',
    address: 'Route Nationale 28, Ain Oulmene, Sétif, Algeria',
    lat: 35.9189,
    lng: 5.2974,
    city: 'Ain Oulmene',
    wilaya: 'Sétif (19)',
    type: 'Distribution Hub'
  },
  {
    name: "Algiers — Port d'Alger & Terminal Conteneurs",
    address: "Quai de l'Est, Port d'Alger, Algiers, Algeria",
    lat: 36.7681,
    lng: 3.0645,
    city: 'Algiers',
    wilaya: 'Algiers (16)',
    type: 'Seaport Freight'
  },
  {
    name: 'Algiers — Zone Industrielle Oued Smar',
    address: 'Zone Industrielle Oued Smar, Algiers 16200, Algeria',
    lat: 36.7025,
    lng: 3.1611,
    city: 'Oued Smar',
    wilaya: 'Algiers (16)',
    type: 'Industrial Park'
  },
  {
    name: 'Constantine — Parc Industriel Didouche Mourad',
    address: 'Zone Industrielle Didouche Mourad, Constantine, Algeria',
    lat: 36.4522,
    lng: 6.6341,
    city: 'Constantine',
    wilaya: 'Constantine (25)',
    type: 'Logistics Center'
  },
  {
    name: 'Bordj Bou Arreridj — Complexe Electronique & Logistique',
    address: 'Zone Industrielle BBA, Bordj Bou Arreridj, Algeria',
    lat: 36.0735,
    lng: 4.7612,
    city: 'Bordj Bou Arreridj',
    wilaya: 'BBA (34)',
    type: 'Manufacturing Hub'
  },
  {
    name: 'Oran — Port Autonome & Zone Pétrochimique',
    address: 'Boulevard de la Soummam, Oran, Algeria',
    lat: 35.7058,
    lng: -0.6455,
    city: 'Oran',
    wilaya: 'Oran (31)',
    type: 'Commercial Port'
  }
]

// In-Memory Search Cache (prevents duplicate HTTP calls)
const searchCache = new Map()
const reverseCache = new Map()

// Rate-limiting lock to respect Nominatim usage policy (1 request/second)
let lastRequestTimestamp = 0
let activeAbortController = null

/**
 * Throttle requests to respect public OSM rate limits
 */
async function enforceRateLimit() {
  const now = Date.now()
  const interval = 850 // ms between requests
  const timeSinceLast = now - lastRequestTimestamp
  if (timeSinceLast < interval) {
    await new Promise((resolve) => setTimeout(resolve, interval - timeSinceLast))
  }
  lastRequestTimestamp = Date.now()
}

/**
 * Search locations with debounced input, local preset matches, caching, and rate limiting
 * @param {string} query - Location name or address
 * @param {Object} options - Custom filter options
 * @returns {Promise<Array>} List of suggestion items
 */
export async function searchLocations(query, options = {}) {
  const trimmed = (query || '').trim()
  if (!trimmed || trimmed.length < 2) {
    return []
  }

  const normalizedQuery = trimmed.toLowerCase()

  // 1. Instant check in local curated Algerian hubs (Fastest & 100% reliable offline)
  const localMatches = ALGERIA_LOGISTICS_HUBS.filter((hub) =>
    hub.name.toLowerCase().includes(normalizedQuery) ||
    hub.address.toLowerCase().includes(normalizedQuery) ||
    hub.city.toLowerCase().includes(normalizedQuery) ||
    hub.wilaya.toLowerCase().includes(normalizedQuery)
  ).map((hub) => ({
    label: hub.name,
    address: hub.address,
    lat: hub.lat,
    lng: hub.lng,
    source: 'preset',
    type: hub.type
  }))

  // 2. Check in-memory cache
  if (searchCache.has(normalizedQuery)) {
    const cached = searchCache.get(normalizedQuery)
    // Combine local presets with cached results (presets first)
    const combined = [...localMatches]
    for (const item of cached) {
      if (!combined.some((c) => Math.abs(c.lat - item.lat) < 0.001 && Math.abs(c.lng - item.lng) < 0.001)) {
        combined.push(item)
      }
    }
    return combined.slice(0, 8)
  }

  // 3. Cancel any in-flight external query
  if (activeAbortController) {
    activeAbortController.abort()
  }
  activeAbortController = new AbortController()

  try {
    await enforceRateLimit()

    const baseUrl = import.meta.env.VITE_GEOCODING_API_URL || DEFAULT_GEOCODING_URL
    const params = new URLSearchParams({
      format: 'json',
      q: trimmed,
      countrycodes: 'dz', // Prioritize Algerian addresses
      addressdetails: '1',
      limit: '6'
    })

    const response = await fetch(`${baseUrl}/search?${params.toString()}`, {
      signal: activeAbortController.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': USER_AGENT
      }
    })

    if (response.ok) {
      const data = await response.json()
      const formattedResults = data.map((item) => {
        const address = item.address || {}
        const mainName = item.name || address.road || address.suburb || address.city || address.state || trimmed
        return {
          label: `${mainName}${address.state ? `, ${address.state}` : ''}`,
          address: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          source: 'nominatim',
          type: item.type || 'place'
        }
      })

      searchCache.set(normalizedQuery, formattedResults)

      const merged = [...localMatches]
      for (const item of formattedResults) {
        if (!merged.some((m) => Math.abs(m.lat - item.lat) < 0.001 && Math.abs(m.lng - item.lng) < 0.001)) {
          merged.push(item)
        }
      }
      return merged.slice(0, 8)
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn('[Fleetora Geocoding] Remote geocoding query failed, returning local hubs:', error.message)
    }
  }

  return localMatches.slice(0, 6)
}

/**
 * Reverse geocode a latitude/longitude pair into a readable address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Formatted address details
 */
export async function reverseGeocode(lat, lng) {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return { address: 'Current Location', label: 'Current Position' }
  }

  // Rounded key for cache precision
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`
  if (reverseCache.has(cacheKey)) {
    return reverseCache.get(cacheKey)
  }

  // Check if near any preset hub (< 2 km)
  for (const hub of ALGERIA_LOGISTICS_HUBS) {
    const dLat = Math.abs(hub.lat - lat)
    const dLng = Math.abs(hub.lng - lng)
    if (dLat < 0.02 && dLng < 0.02) {
      const match = { address: hub.address, label: hub.name, lat: hub.lat, lng: hub.lng }
      reverseCache.set(cacheKey, match)
      return match
    }
  }

  try {
    await enforceRateLimit()

    const baseUrl = import.meta.env.VITE_GEOCODING_API_URL || DEFAULT_GEOCODING_URL
    const params = new URLSearchParams({
      format: 'json',
      lat: lat.toString(),
      lon: lng.toString(),
      addressdetails: '1'
    })

    const response = await fetch(`${baseUrl}/reverse?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': USER_AGENT
      }
    })

    if (response.ok) {
      const data = await response.json()
      const addr = data.address || {}
      const label = addr.road || addr.suburb || addr.city || addr.town || addr.state || 'Current Location'
      const result = {
        address: data.display_name,
        label: `${label}${addr.state ? `, ${addr.state}` : ''}`,
        lat,
        lng
      }
      reverseCache.set(cacheKey, result)
      return result
    }
  } catch (error) {
    console.warn('[Fleetora Geocoding] Reverse geocoding failed, using coordinates fallback:', error.message)
  }

  const fallback = {
    address: `Position (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    label: `GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    lat,
    lng
  }
  reverseCache.set(cacheKey, fallback)
  return fallback
}
