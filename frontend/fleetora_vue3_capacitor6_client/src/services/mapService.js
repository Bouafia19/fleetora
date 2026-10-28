/**
 * Fleetora MapLibre GL Mapping Service
 * Handles map instance lifecycle, tile/style fallback management, GeoJSON route rendering,
 * and high-performance vehicle marker synchronization.
 */

import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import maplibreglWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

// Ensure MapLibre Web Worker is properly resolved and bundled by Vite in both dev and prod
if (typeof maplibregl.setWorkerUrl === 'function') {
  maplibregl.setWorkerUrl(maplibreglWorkerUrl)
}

// Standard OpenStreetMap raster style fallback definition
export const OSM_RASTER_STYLE = {
  version: 8,
  sources: {
    'osm-raster-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
    }
  },
  layers: [
    {
      id: 'osm-raster-layer',
      type: 'raster',
      source: 'osm-raster-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
}

// Default high-performance vector style derived from OpenStreetMap
export const DEFAULT_STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
export const DEMO_TILES_STYLE_URL = 'https://demotiles.maplibre.org/style.json'

/**
 * Determine the optimal map style URL or object
 */
export function getMapStyle() {
  const envStyle = import.meta.env.VITE_MAP_STYLE_URL
  if (envStyle && envStyle.trim() !== '') {
    return envStyle.trim()
  }
  return DEFAULT_STYLE_URL
}

/**
 * Creates and initializes a MapLibre map instance with standard controls and safeguards
 */
export function createMapInstance(container, options = {}) {
  const style = options.style || getMapStyle()
  const initialCenter = options.center || [5.4137, 36.1911] // Sétif default [lng, lat]
  const initialZoom = options.zoom !== undefined ? options.zoom : 12

  const map = new maplibregl.Map({
    container,
    style,
    center: initialCenter,
    zoom: initialZoom,
    minZoom: 3,
    maxZoom: 18,
    attributionControl: false // Custom attribution added below with OSM compliance
  })

  // 1. Navigation Controls (Zoom, Compass/Pitch)
  map.addControl(
    new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    }),
    'top-right'
  )

  // 2. Fullscreen Control
  map.addControl(
    new maplibregl.FullscreenControl(),
    'top-right'
  )

  // 3. Attribution Control (Mandatory OSM & MapLibre attribution)
  map.addControl(
    new maplibregl.AttributionControl({
      compact: false,
      customAttribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> | Fleetora Freight'
    }),
    'bottom-right'
  )

  // Style loading error fallback safeguard
  let fallbackAttempted = false
  map.on('error', (e) => {
    // If vector style fails to load (e.g. offline or blocked), switch to resilient OSM raster style
    if (!fallbackAttempted && e.error && (e.error.status === 404 || e.error.status === 0 || e.error.message?.includes('style'))) {
      console.warn('[Fleetora Map] Primary style failed, switching to fallback raster style:', e.error)
      fallbackAttempted = true
      try {
        map.setStyle(OSM_RASTER_STYLE)
      } catch (err) {
        console.error('[Fleetora Map] Could not set fallback style:', err)
      }
    }
  })

  return map
}

/**
 * Render or update a GeoJSON route line layer on the map
 */
export function renderRoute(map, coordinates, layerId = 'fleetora-route') {
  if (!map || !coordinates || coordinates.length === 0) return

  const sourceId = `${layerId}-source`
  const casingLayerId = `${layerId}-casing`
  const mainLayerId = `${layerId}-line`

  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  }

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson)
  } else {
    // Add GeoJSON source
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    })

    // Outer casing (drop shadow / outline effect for readability)
    map.addLayer({
      id: casingLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#0B192C',
        'line-width': 8,
        'line-opacity': 0.35
      }
    })

    // Main route polyline (Fleetora Navy / Blue)
    map.addLayer({
      id: mainLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#0284C7',
        'line-width': 5,
        'line-opacity': 0.95
      }
    })
  }
}

/**
 * Remove an existing route line layer and its source from the map
 */
export function removeRoute(map, layerId = 'fleetora-route') {
  if (!map) return
  const sourceId = `${layerId}-source`
  const casingLayerId = `${layerId}-casing`
  const mainLayerId = `${layerId}-line`

  if (map.getLayer(mainLayerId)) map.removeLayer(mainLayerId)
  if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId)
  if (map.getSource(sourceId)) map.removeSource(sourceId)
}

/**
 * Create a custom HTML element for route start/end pin markers
 */
export function createPinElement(type = 'pickup') {
  const el = document.createElement('div')
  el.className = `fl-map-pin fl-map-pin-${type}`
  const color = type === 'pickup' ? '#10B981' : '#EF4444'
  const icon = type === 'pickup' ? 'mdi-circle-medium' : 'mdi-flag-checkered'

  el.innerHTML = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2px solid #FFFFFF;
      cursor: pointer;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `
  return el
}

/**
 * Create a custom vehicle marker HTML element matching Fleetora design standards
 */
export function createVehicleMarkerElement(vehicle, onClick) {
  const el = document.createElement('div')
  el.className = `fl-vehicle-marker fl-vehicle-${vehicle._id} status-${vehicle.status}`
  el.setAttribute('tabindex', '0')
  el.setAttribute('role', 'button')
  el.setAttribute('aria-label', `Vehicle ${vehicle.code} - ${vehicle.name} - Status: ${vehicle.status}`)

  const statusColors = {
    moving: '#0284C7',
    available: '#10B981',
    stopped: '#F59E0B',
    maintenance: '#8B5CF6',
    offline: '#64748B'
  }
  const color = statusColors[vehicle.status] || '#0284C7'

  el.style.cssText = `
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translate(-50%, -50%);
    transition: transform 0.2s ease, filter 0.2s ease;
  `

  el.innerHTML = `
    <div class="fl-marker-badge" style="
      background: white;
      border: 2px solid ${color};
      border-radius: 20px;
      padding: 3px 8px;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
      white-space: nowrap;
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
    ">
      <span style="
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${color};
        display: inline-block;
        ${vehicle.status === 'moving' ? 'box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.3);' : ''}
      "></span>
      <span>${vehicle.code}</span>
      ${vehicle.speed > 0 ? `<span style="color: #64748B; font-size: 9px;">${vehicle.speed} km/h</span>` : ''}
    </div>
    <div style="
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid ${color};
      margin-top: -1px;
    "></div>
  `

  if (onClick) {
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick(vehicle)
    })
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick(vehicle)
      }
    })
  }

  return el
}
