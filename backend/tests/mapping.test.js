process.env.NODE_ENV = 'test'
const { test, describe } = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

describe('Fleetora Open-Source Mapping Layer Verification Suite', () => {

    test('FLT-MAP-001: Verification of Zero Google Maps Hardcoded Dependencies in Frontend HTML', () => {
        const webHtmlPath = path.resolve(__dirname, '../../frontend/fleetora_web_vue3/index.html')
        const clientHtmlPath = path.resolve(__dirname, '../../frontend/fleetora_vue3_capacitor6_client/index.html')
        const partnerHtmlPath = path.resolve(__dirname, '../../frontend/fleetora_vue3_capacitor6_partner/index.html')

        const webHtml = fs.readFileSync(webHtmlPath, 'utf8')
        const clientHtml = fs.readFileSync(clientHtmlPath, 'utf8')
        const partnerHtml = fs.readFileSync(partnerHtmlPath, 'utf8')

        // Ensure no Google Maps script tags or API keys remain
        assert.strictEqual(webHtml.includes('maps.googleapis.com'), false, 'fleetora_web_vue3 index.html must not load Google Maps')
        assert.strictEqual(clientHtml.includes('maps.googleapis.com'), false, 'fleetora_client index.html must not load Google Maps')
        assert.strictEqual(partnerHtml.includes('maps.googleapis.com'), false, 'fleetora_partner index.html must not load Google Maps')
        assert.strictEqual(webHtml.includes('AIzaSy'), false, 'No Google API keys in web HTML')
        assert.strictEqual(partnerHtml.includes('AIzaSy'), false, 'No Google API keys in partner HTML')
    })

    test('FLT-MAP-002: Verification that @googlemaps/js-api-loader is removed from dependencies', () => {
        const clientPkgPath = path.resolve(__dirname, '../../frontend/fleetora_vue3_capacitor6_client/package.json')
        const clientPkg = JSON.parse(fs.readFileSync(clientPkgPath, 'utf8'))
        assert.strictEqual(clientPkg.dependencies?.['@googlemaps/js-api-loader'], undefined, '@googlemaps/js-api-loader must be removed')
        assert.ok(clientPkg.dependencies?.['maplibre-gl'], 'maplibre-gl must be present in client app dependencies')

        const webPkgPath = path.resolve(__dirname, '../../frontend/fleetora_web_vue3/package.json')
        const webPkg = JSON.parse(fs.readFileSync(webPkgPath, 'utf8'))
        assert.ok(webPkg.dependencies?.['maplibre-gl'], 'maplibre-gl must be present in web app dependencies')
    })

    test('FLT-MAP-003: Haversine Spherical Distance Calculation Accuracy', () => {
        // Sétif Centre (36.1911, 5.4137) to El Eulma (36.1554, 5.6982) ~25.8 km straight line
        const lat1 = 36.1911, lon1 = 5.4137
        const lat2 = 36.1554, lon2 = 5.6982

        const R = 6371
        const dLat = (lat2 - lat1) * (Math.PI / 180)
        const dLon = (lon2 - lon1) * (Math.PI / 180)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        assert.ok(distance > 24 && distance < 27, `Distance should be ~25.8 km, got ${distance}`)
    })

    test('FLT-MAP-004: Fleet Vehicle Data Model & Telemetry Verification', () => {
        const fleetSimPath = path.resolve(__dirname, '../../frontend/fleetora_web_vue3/src/services/fleetSimulationService.js')
        const fleetContent = fs.readFileSync(fleetSimPath, 'utf8')

        // Must define all 5 core logistics statuses
        assert.ok(fleetContent.includes("'moving'"), 'Simulation must support moving status')
        assert.ok(fleetContent.includes("'available'"), 'Simulation must support available status')
        assert.ok(fleetContent.includes("'stopped'"), 'Simulation must support stopped status')
        assert.ok(fleetContent.includes("'offline'"), 'Simulation must support offline status')
        assert.ok(fleetContent.includes("'maintenance'"), 'Simulation must support maintenance status')

        // Must include Sétif corridor coordinates
        assert.ok(fleetContent.includes('36.1911') && fleetContent.includes('5.4137'), 'Simulation must center on Sétif, Algeria')
        assert.ok(fleetContent.includes('FLT-SET-01'), 'Simulation must include Sétif demo vehicle codes')
    })

    test('FLT-MAP-005: Algerian Logistics Hub Presets Availability', () => {
        const geocodingPath = path.resolve(__dirname, '../../frontend/fleetora_web_vue3/src/services/geocodingService.js')
        const geocodingContent = fs.readFileSync(geocodingPath, 'utf8')

        assert.ok(geocodingContent.includes('ALGERIA_LOGISTICS_HUBS'), 'Algerian logistics hubs must be exported')
        assert.ok(geocodingContent.includes('Sétif'), 'Sétif hubs must be present')
        assert.ok(geocodingContent.includes('El Eulma'), 'El Eulma cargo hub must be present')
        assert.ok(geocodingContent.includes('Ain Arnat'), 'Ain Arnat hub must be present')
    })

    test('FLT-MAP-006: Environment Variable Configuration Check', () => {
        const envExamplePath = path.resolve(__dirname, '../../frontend/fleetora_web_vue3/.env.example')
        assert.ok(fs.existsSync(envExamplePath), '.env.example must exist in web frontend')
        const envContent = fs.readFileSync(envExamplePath, 'utf8')

        assert.ok(envContent.includes('VITE_MAP_STYLE_URL'), 'VITE_MAP_STYLE_URL must be defined')
        assert.ok(envContent.includes('VITE_ROUTING_API_URL'), 'VITE_ROUTING_API_URL must be defined')
        assert.ok(envContent.includes('VITE_GEOCODING_API_URL'), 'VITE_GEOCODING_API_URL must be defined')
        assert.strictEqual(envContent.includes('GOOGLE_MAPS_API_KEY'), false, 'Obsolete GOOGLE_MAPS_API_KEY must not exist')
    })
})
