# Fleetora - Modern Transportation & Mobility Platform

**Fleetora** is a modernized, full-stack transportation, logistics, and mobility management platform. It provides end-to-end management for cargo dispatch, customer bookings, driver tracking, administrative oversight, and partner billing.

Fleetora was developed by safely cloning and modernizing the legacy Frettic project, upgrading every component to the latest stable production stack (Node.js 24 LTS, Express 5, Mongoose 8, Vue 3.5, Vuetify 4, Pinia 3, and Vite 7) while preserving 100% of the core business logic, user workflows, and APIs.

---

## 1. System Architecture

Fleetora is composed of 1 backend API service, 4 dedicated frontend applications, and an Nginx reverse proxy layer:

```
                                  [ Client / Partner / Admin Users ]
                                                  │
                                                  ▼
                                      [ Nginx Reverse Proxy (SSL) ]
                                      Port 80 / 443 (fleetora.conf)
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                ▼                                 ▼                                 ▼
      [ Customer Web App ]               [ Admin Panel ]                    [ Backend API ]
      Vue 3.5 + Vuetify 4               Vue 3.5 + Vuetify 4                 Express 5 + Node 24
      (fleetora_web_vue3)                   (adminPanel)                        Port 3000 /api
                │                                 │                                 │
                └─────────────────────────────────┴─────────────────────────────────┤
                                                                                    ▼
                                                                           [ MongoDB Database ]
                                                                             database: fleetora
```

### Applications Inventory:

1. **Backend API (`fleetora/backend`)**:
   - Express 5.3, Mongoose 8.24, Socket.io 4.8.
   - Dual-mount routing (`/` and `/api/`) for 100% interoperability with web, mobile, and Nginx.
   - Security hardened with Helmet, Rate Limiter, CORS, and resilient mock fallbacks for Firebase FCM and Twilio SMS.
   - Automated test suite (`node:test`).

2. **Administration Panel (`fleetora/frontend/adminPanel`)**:
   - Modern Vue 3.5 + Vuetify 4.2 + Pinia 3 + Vite 7 application.
   - Role-Based Access Control (RBAC) with CASL ability rules.
   - Management dashboards for Users, Vehicles, Trips, Billing, Announcements, and Company Settings.
   - Dynamic PDF generation for invoices (`jspdf`, `jspdf-autotable`).

3. **Customer Web Application (`fleetora/frontend/fleetora_web_vue3`)**:
   - Customer booking interface with MapLibre GL JS open-source routing, interactive dispatch console, price estimation, live Sétif fleet telemetry, and realtime driver notifications via Socket.io.
   - Modernized with Vue 3.5, Vuetify 4, Pinia, MapLibre GL JS, and Vite 7. Zero Google Maps API key required for DEMO.

4. **Customer Mobile Application (`fleetora/frontend/fleetora_vue3_capacitor6_client`)**:
   - Cross-platform Android & iOS app powered by Capacitor 6.
   - Geolocation tracking, phone verification, camera integration, and trip management.
   - App ID: `com.fleetora.client`.

5. **Driver / Partner Mobile Application (`frontend/fleetora_vue3_capacitor6_partner`)**:
   - Cross-platform driver dispatch app with trip reception, GPS routing, status updates, partner registration, document upload, and billing tracking.
   - App ID: `com.fleetora.partner`.

### Project Directory Structure

```text
fleetora/
├── backend/                               # Express 5 REST API & Socket.io service
│   ├── controllers/                       # Business logic (trips, users, vehicles, billings, etc.)
│   ├── middleware/                        # JWT authentication & CASL permissions
│   ├── models/                            # Mongoose data models
│   ├── modules/                           # Safe Firebase messaging module
│   ├── routes/                            # Dual-mounted Express routes (/ and /api/)
│   ├── scripts/seed.js                    # Database initialization & mock seeder
│   ├── tests/api.test.js                  # Automated test suite (node:test)
│   ├── .env.example                       # Environment configuration template
│   ├── Dockerfile                         # Container definition
│   └── server.js                          # Express application & Socket.io server
├── frontend/                              # Frontend user applications
│   ├── adminPanel/                        # Admin operations portal (Vue 3.5, Vuetify 4, Pinia)
│   ├── fleetora_web_vue3/                 # Customer web application & PWA (Vue 3.5, Vite 7)
│   ├── fleetora_vue3_capacitor6_client/   # Customer mobile app (Capacitor 6, Android & iOS)
│   └── fleetora_vue3_capacitor6_partner/  # Transporter partner mobile app (Capacitor 6, Android & iOS)
├── brand-assets/                          # Canonical brand SVGs, PNGs, maskable icons, and favicons
├── nginx/                                 # Nginx reverse proxy configurations & Dockerfile
├── screenshots/                           # UI verification & Android emulator captures
├── scripts/                               # Brand asset and launcher icon automation scripts
├── docker-compose.yaml                    # Multi-container orchestration
├── FLEETORA_FINAL_RELEASE_VERIFICATION.md # Complete verification and release readiness audit
└── README.md                              # Project documentation
```

---

## 2. Technology Stack & Installed Versions

| Component | Technology | Installed Version | Notes |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `v24.11.1` LTS | Native test runner, ESM support |
| **Package Manager** | npm | `11.6.2` | Clean dependency trees |
| **Backend Framework**| Express | `^5.3.0` | Modern error handling & routing |
| **Database ODM** | Mongoose | `^8.24.5` | Strict schema validation |
| **Database** | MongoDB | `7.0.12` | Isolated `fleetora` database |
| **Frontend Framework**| Vue | `^3.5.44` | Composition & Options API |
| **UI Framework** | Vuetify | `^4.2.6` | Modern Material Design 3 system |
| **State Management**| Pinia | `^3.0.4` | Modular stores with devtools |
| **Routing** | Vue Router | `^4.6.4` | Dynamic route guards |
| **Build Tool** | Vite | `^7.3.7` | Lightning-fast HMR and bundling |
| **Realtime WebSockets**| Socket.io | `^4.8.1` | Room-based real-time dispatch |
| **Mobile Runtime** | Capacitor | `^6.1.2` | Android & iOS native wrappers |
| **Reverse Proxy** | Nginx | `1.24+` | TLS 1.3, gzip, WebSocket upgrade |

---

## 3. Preserved Features & Business Logic

All core Frettic functional baselines have been fully preserved and verified:
- **Authentication & RBAC**: JWT-based session management, CASL permissions (`administrator`, `transporter`, `client`).
- **Trips & Dispatch Lifecycle**: Trip creation, vehicle matching based on cargo distance & weight, real-time transporter pinging via Socket.io, trip status progression (`pending` -> `confirmed` -> `in_progress` -> `completed`).
- **Partner Billing & Commissions**: Automated calculation of 5% commission on completed trips, billing creation, receipt verification, payment tracking, and PDF invoice generation.
- **Vehicle Fleet Catalog**: Category management (small vans, light trucks, heavy carriers), payload capacities, and transporter assignments.
- **Push & SMS Communications**: Twilio verification and Firebase Cloud Messaging with graceful mock fallbacks.
- **Multilingual Support**: Arabic (`ar`), French (`fr`), and English (`en`) localization across all applications.

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js >= 20.19 or 24 LTS
- MongoDB running on port 27017

### 1. Database Configuration & Seeding
From the `fleetora/backend` directory:
```bash
cd "fleetora/backend"
npm install
node scripts/seed.js
```

### Default Seeded Accounts:
| Role | Email / Phone | Password | Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fleetora.com` | `admin123456` | Admin Panel (`/admin`) |
| **Transporter (Partner)** | `+213550000002` | `partner123456` | Partner Mobile App |
| **Client** | `+213550000003` | `client123456` | Customer Web & Mobile |

### 2. Run Backend Tests & Start API
```bash
# Run unit & integration test suite
npm test

# Start backend server (runs on port 4000)
npm start
```

### 3. Build & Run Frontend Applications

#### Administration Panel:
```bash
cd "frontend/adminPanel"
npm install
npm run dev     # Starts dev server on http://localhost:5173/admin/
npm run build   # Production build to dist/
```

#### Customer Web App:
```bash
cd "frontend/fleetora_web_vue3"
npm install
npm run dev     # Starts dev server on http://localhost:7072/
npm run build   # Production build to dist/
```

#### Customer Mobile App:
```bash
cd "frontend/fleetora_vue3_capacitor6_client"
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug   # Generates app-debug.apk in app/build/outputs/apk/debug/
```

#### Driver / Partner Mobile App:
```bash
cd "frontend/fleetora_vue3_capacitor6_partner"
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug   # Generates app-debug.apk in app/build/outputs/apk/debug/
```

---

## 5. Mobile & PWA Release Highlights

- **Pure GPS Brand Identity**: Canonical location/navigation pin in `#00366F` Navy and `#0EA5E9` Sky Blue across all web favicons, PWA icons, launcher mipmaps, and in-app navigation headers. Zero lettermarks, 0 legacy monograms.
- **Installable PWA**: `fleetora_web_vue3` includes full service worker caching, `manifest.webmanifest`, native standalone detection, and interactive Chrome/Edge & iOS installation prompt modals.
- **Android Adaptive Icons**: Full 6-density mipmaps (`ic_launcher`, `ic_launcher_round`, `ic_launcher_foreground`, `ic_launcher_background`) adhering to 72dp/108dp safe-zone guidelines, with 26 landscape and portrait splash screens.
- **Canonical Brand Repository**: Exported vectors and rasters located in [`brand-assets/`](./brand-assets).
- **Release Verification Report**: Comprehensive audit and emulator verification documented in [`FLEETORA_FINAL_RELEASE_VERIFICATION.md`](./FLEETORA_FINAL_RELEASE_VERIFICATION.md).

---

## 6. Environment Configuration Guide

### Backend (`backend/.env.example`):
```env
# Fleetora Backend Environment Configuration
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fleetora
SECRET=fleetora_jwt_secret_development_key_change_in_production
CORS_ORIGINS=*

# Optional external service credentials (resilient mock fallbacks active if unconfigured)
ACCOUNT_SID=
AUTH_TOKEN=
SERVICE_ID=
FIREBASE_SERVICE_ACCOUNT_PATH=
```

---

## 7. Frontend Visual Redesign Highlights

Fleetora introduces a dedicated design system built for logistics and freight mobility:
- **Color Palette**: Sky Blue primary (`#0284c7`), Deep Slate (`#0f172a`), Cyan accent (`#38bdf8`), Neutral Background (`#f8fafc`).
- **Typography & Layout**: Modern Inter/Roboto font stack with clear hierarchy, high-contrast chips, and elevation-2 card surfacing.
- **Data Tables**: Vuetify 4 modern data tables with responsive horizontal scrolling, instant filtering, clean action buttons, and accessible empty/loading states.
- **Form Controls**: Outlined compact inputs (`density="compact"`, `variant="outlined"`), password visibility toggles, and live validation.

---

## 9. Open-Source Mapping Stack & Fleet Architecture

Fleetora has completely replaced Google Maps with an enterprise-grade, open-source geospatial stack powered by **MapLibre GL JS**, **OpenStreetMap-derived vector tiles**, **OSRM routing**, and **Nominatim geocoding**.

### Core Architecture Components

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Fleetora Open-Source Map Engine                        │
├─────────────────────┬──────────────────────────┬────────────────────────────────┤
│ Map Rendering       │ MapLibre GL JS           │ WebGL vector & raster engine   │
│ Map Data / Tiles    │ OpenStreetMap (CARTO GL) │ Configurable: VITE_MAP_STYLE_URL│
│ Routing Provider    │ OSRM Driving Engine      │ GeoJSON LineString polylines   │
│ Geocoding & Search  │ Nominatim OSM Engine     │ Debounced, cached & rate-limited│
│ Telemetry / Fleet   │ Sétif Regional Simulator │ Status: Moving, Available, etc.│
└─────────────────────┴──────────────────────────┴────────────────────────────────┘
```

### Environment Configuration

In `frontend/fleetora_web_vue3/.env.example`:
```env
# MapLibre Map Style URL (CARTO Positron vector tiles derived from OpenStreetMap)
VITE_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/positron-gl-style/style.json

# Optional commercial tile provider key (MapTiler, Stadia) - Leave blank for open-source default
VITE_MAP_API_KEY=

# Open-source routing provider (OSRM)
VITE_ROUTING_API_URL=https://router.project-osrm.org/route/v1/driving

# Open-source geocoding provider (Nominatim)
VITE_GEOCODING_API_URL=https://nominatim.openstreetmap.org
```

### Running the Demo Without Google Maps

1. Seed the database with realistic Algerian and Sétif fleet accounts:
   ```bash
   cd backend
   node scripts/seed.js
   ```
2. Start the Backend API:
   ```bash
   npm start
   ```
3. Start the Customer Web App:
   ```bash
   cd ../frontend/fleetora_web_vue3
   npm run dev
   ```
4. Access `http://localhost:7072/` and log in with `+213550000003` / `client123456`.
5. You will see the **Dispatch Console & Sétif Live Fleet** with real-time moving markers, vehicle telemetry, speed, status filters, and instant route generation without ever needing a Google API key.

### Attribution Requirements

Per OpenStreetMap license terms (ODbL), all maps rendered within Fleetora include required attribution:
> **© OpenStreetMap contributors**

This attribution is visibly embedded in the bottom-right corner of the map canvas via MapLibre's attribution control.

### Demo vs Production Recommendations

> [!IMPORTANT]
> **DEMO Configuration**:
> The demo uses public CARTO Positron OSM vector styles, demo OSRM routing (`router.project-osrm.org`), and public Nominatim geocoding with strict client-side debouncing (350ms), request cancellation, rate limiting (1 req/sec), in-memory caching, and Algerian preset logistics hubs.
>
> **PRODUCTION Configuration**:
> For commercial scale production deployments:
> 1. **Tiles**: Deploy a self-hosted vector tile server using [TileServer GL](https://github.com/maptiler/tileserver-gl) or [Martin](https://github.com/maplibre/martin) serving an Algeria/North-Africa `.mbtiles` extract (e.g. from Geofabrik), or subscribe to a dedicated provider (MapTiler, Stadia Maps, Protomaps). Do NOT use public OpenStreetMap raster tile servers as an unlimited commercial production backend.
> 2. **Routing**: Host an internal [OSRM](https://project-osrm.org/) Docker instance (`osrm-backend`) loaded with Algeria OSM road networks for zero-latency, private turn-by-turn routing.
> 3. **Geocoding**: Deploy a private [Nominatim](https://nominatim.org/) or [Pelias](https://pelias.io/) container for unlimited Algerian address lookups without third-party rate limits.

---

## 10. Documentation Index

The following project reports document the modernization, brand transformation, and release verification:
- [`FLEETORA_FINAL_RELEASE_VERIFICATION.md`](./FLEETORA_FINAL_RELEASE_VERIFICATION.md): Comprehensive end-to-end audit, test matrix, and release readiness verification.
- [`FLEETORA_GLOBAL_BRAND_ICON_AUDIT.md`](./FLEETORA_GLOBAL_BRAND_ICON_AUDIT.md): Complete audit of brand assets, favicon pipelines, and icon vector generation.
- [`FLEETORA_COMPLETE_UI_AND_ANDROID_AUDIT.md`](./FLEETORA_COMPLETE_UI_AND_ANDROID_AUDIT.md): Detailed analysis of UI modernizations and Android Capacitor 6 configuration.
- [`FLEETORA_CUSTOMER_DRIVER_REDESIGN_REPORT.md`](./FLEETORA_CUSTOMER_DRIVER_REDESIGN_REPORT.md): Design system and interface redesign for customer and partner applications.
- [`FLEETORA_PARTNER_ANDROID_DEVICE_REPORT.md`](./FLEETORA_PARTNER_ANDROID_DEVICE_REPORT.md): Partner app device integration and emulator verification report.

