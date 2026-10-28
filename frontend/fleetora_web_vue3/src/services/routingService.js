/**
 * Fleetora Open-Source Routing Service (OSRM / OpenStreetMap)
 * Replaces Google Maps DirectionsService without requiring API keys.
 */

const DEFAULT_ROUTING_URL = 'https://router.project-osrm.org/route/v1/driving'

/**
 * Calculate Great-Circle distance in kilometers between two geographic coordinates
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format duration in minutes into localized readable text
 */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '1 min'
  const rounded = Math.round(minutes)
  if (rounded < 60) return `${rounded} mins`
  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

/**
 * Normalize an input location to { lat, lng }
 */
export function normalizeCoordinates(coord) {
  if (!coord) return null
  if (Array.isArray(coord) && coord.length >= 2) {
    // Check if [lng, lat] or [lat, lng]
    // In MapLibre/GeoJSON standard is [lng, lat]
    return { lng: Number(coord[0]), lat: Number(coord[1]) }
  }
  if (typeof coord === 'object') {
    const lat = Number(coord.lat !== undefined ? coord.lat : coord.latitude)
    const lng = Number(coord.lng !== undefined ? coord.lng : coord.lon !== undefined ? coord.lon : coord.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng }
    }
  }
  return null
}

/**
 * Generate a multi-point interpolated fallback route between two coordinates
 */
function generateFallbackRoute(fromCoord, toCoord) {
  const points = []
  const steps = 12
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    // Add small curve deviation for visual realism
    const lat = fromCoord.lat + (toCoord.lat - fromCoord.lat) * fraction
    const lng = fromCoord.lng + (toCoord.lng - fromCoord.lng) * fraction + Math.sin(fraction * Math.PI) * 0.008
    points.push([lng, lat])
  }
  return points
}

/**
 * Calculate driving route using OSM/OSRM with automatic resilient offline fallback
 * @param {Object|Array} origin - { lat, lng } or [lng, lat]
 * @param {Object|Array} destination - { lat, lng } or [lng, lat]
 * @param {Object} options - Custom options (timeout, fallbackSpeedKmH)
 * @returns {Promise<Object>} Route response with GeoJSON coordinates and metrics
 */
export async function calculateRoute(origin, destination, options = {}) {
  const from = normalizeCoordinates(origin)
  const to = normalizeCoordinates(destination)

  if (!from || !to) {
    throw new Error('Invalid origin or destination coordinates')
  }

  const straightDistanceKm = calculateHaversineDistance(from.lat, from.lng, to.lat, to.lng)
  const routingBaseUrl = import.meta.env.VITE_ROUTING_API_URL || DEFAULT_ROUTING_URL
  const coordinatesString = `${from.lng},${from.lat};${to.lng},${to.lat}`
  const requestUrl = `${routingBaseUrl}/${coordinatesString}?overview=full&geometries=geojson&steps=false`

  const controller = new AbortController()
  const timeoutMs = options.timeout || 4500
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(requestUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const primaryRoute = data.routes[0]
        const distanceKm = Math.max(1, Math.round(primaryRoute.distance / 100) / 10)
        const durationMinutes = Math.max(1, Math.round(primaryRoute.duration / 60))

        return {
          success: true,
          isFallback: false,
          distanceKm,
          distanceFormatted: `${distanceKm} km`,
          durationMinutes,
          durationFormatted: formatDuration(durationMinutes),
          coordinates: primaryRoute.geometry.coordinates, // Array of [lng, lat]
          bounds: [
            [Math.min(from.lng, to.lng), Math.min(from.lat, to.lat)],
            [Math.max(from.lng, to.lng), Math.max(from.lat, to.lat)]
          ]
        }
      }
    }
  } catch (error) {
    // Network failure, timeout, or blocked OSRM server
    console.warn('[Fleetora Routing] OSRM service query failed, engaging geometric fallback:', error.message)
  } finally {
    clearTimeout(timeoutId)
  }

  // Resilient geometric fallback (e.g. road factor 1.25x haversine, 60 km/h avg speed)
  const fallbackDistanceKm = Math.max(1, Math.round(straightDistanceKm * 1.25 * 10) / 10)
  const fallbackMinutes = Math.max(2, Math.round((fallbackDistanceKm / 55) * 60))
  const fallbackCoordinates = generateFallbackRoute(from, to)

  return {
    success: true,
    isFallback: true,
    distanceKm: fallbackDistanceKm,
    distanceFormatted: `${fallbackDistanceKm} km`,
    durationMinutes: fallbackMinutes,
    durationFormatted: formatDuration(fallbackMinutes),
    coordinates: fallbackCoordinates,
    bounds: [
      [Math.min(from.lng, to.lng), Math.min(from.lat, to.lat)],
      [Math.max(from.lng, to.lng), Math.max(from.lat, to.lat)]
    ]
  }
}
