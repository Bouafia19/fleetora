# Fleetora Android Production Deployment & Verification Report

**Date:** October 19, 2026  
**Status:** **SUCCESSFULLY DEPLOYED & VERIFIED ON PHYSICAL HARDWARE**  
**Production Backend:** `https://fleetora-api-93an.onrender.com`  
**Physical Test Device:** Samsung Galaxy A03 (`SM-A035F`) — Android 13 (API 33 / One UI Core 5.1) — Serial `R9YT70ADNDK`

---

## 1. Google 401 UNAUTHENTICATED Error — Root Cause & Resolution Analysis

### Exact Error
```text
401 UNAUTHENTICATED: Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential.
```

### Forensic Diagnosis & Source
| Parameter | Value / Finding |
|---|---|
| **Originating Service** | **Antigravity CLI / AGY IDE Engine** (`~/.gemini/antigravity-cli/`) |
| **Endpoint Contacted** | `https://daily-cloudcode-pa.googleapis.com/v1internal:streamGenerateContent` & `https://play.googleapis.com/log` (Clearcut) |
| **Google Cloud Account** | `khaledsetif1900@gmail.com` (configured in `~/.gemini/google_accounts.json`) |
| **Google Cloud Project** | `next` (configured in `~/.gemini/projects.json`) |
| **Expected Auth Type** | Google OAuth 2 Bearer Access Token (`https://www.googleapis.com/auth/cloud-platform`, `openid`, `userinfo.email`) |
| **Root Cause** | In AGY's local token management (`~/.gemini/oauth_creds.json`), the cached OAuth bearer access token reached its expiration window (`browser.go:265`). When background telemetry (`client.go:72`) and internal model stream calls attempted to execute with an unrefreshed token, the Google Code Assist backend returned HTTP 401. |
| **Auth Restoration** | The Antigravity CLI background daemon completed automated OAuth refresh via `https://oauth2.googleapis.com/token`. All subsequent agent executor model streams and telemetry calls returned HTTP 200 OK without manual intervention. |
| **Impact on Fleetora** | **NONE (Zero Impact)**. Fleetora does not use Google Cloud authentication or Google OAuth for its deployment, backend, or Android applications. Fleetora uses its own custom JWT + bcrypt authentication against MongoDB Atlas on Render. |

---

## 2. Fleetora Production Architecture & Independence from Google Auth

```
[ Customer Android APK ]               [ Partner Android APK ]
(com.nextchallenge.tawssil)    (com.nextchallenge.tawssil_patenaire)
           │                                      │
           │ TLS / HTTPS (Port 443)               │ TLS / HTTPS (Port 443)
           ▼                                      ▼
┌───────────────────────────────────────────────────────────────┐
│     Fleetora Production API (Render Web Service)              │
│         https://fleetora-api-93an.onrender.com                │
│                                                               │
│  • Express 5 + Node.js (JWT Authentication, CORS enabled)     │
│  • Socket.io Dispatch Engine                                  │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
               ┌────────────────────────────────┐
               │    MongoDB Atlas Database      │
               │  (Cluster: cluster0-a.zvvsm)   │
               └────────────────────────────────┘
```

1. **Backend Authentication:** JSON Web Tokens (JWT) signed and verified locally with `process.env.JWT_SECRET`. No Google IAM, Firebase Auth, or Google OAuth dependency.
2. **Build Pipeline:** Local Android SDK (`/home/next/Android/Sdk`), Gradle 8.2, and Apache Capacitor 6. No Google Cloud Build or cloud-side authentication required.
3. **Maps Integration:** Frontend Google Maps JavaScript API uses client-side public API keys (`AIzaSy...`) loaded asynchronously via HTTPS; it does not require OAuth 2 bearer tokens or Google Cloud CLI authentication.

---

## 3. Production Android Build Artifacts

Both applications were built using production environment variables pointing strictly to the live Render backend (`https://fleetora-api-93an.onrender.com`):

| Application | Package ID | Version | Build Output Path | APK Size |
|---|---|---|---|---|
| **Fleetora Customer** | `com.nextchallenge.tawssil` | `1.0.0` (Capacitor 6) | `build-artifacts/fleetora-client-production.apk` | **14 MB** |
| **Fleetora Partner / Driver** | `com.nextchallenge.tawssil_patenaire` | `1.0.0` (Capacitor 6) | `build-artifacts/fleetora-partner-production.apk` | **14 MB** |

### Verified Network Configuration
- Both apps configure `android/app/src/main/res/xml/network_security_config.xml` with system CA trust anchors for seamless TLS verification against `*.onrender.com`.
- Web assets bundled in `android/app/src/main/assets/public/` target `https://fleetora-api-93an.onrender.com` with `Capacitor.isNativePlatform()` fallbacks, preventing localhost loopback issues on mobile runtime.

---

## 4. Physical Device Installation & Live Verification Results

The APKs were installed and tested on the physical device via ADB (`/home/next/Android/Sdk/platform-tools/adb`):

```bash
adb -s R9YT70ADNDK install -r build-artifacts/fleetora-client-production.apk  # Success
adb -s R9YT70ADNDK install -r build-artifacts/fleetora-partner-production.apk # Success
```

### Verification Matrix

| Test Case | Customer App (`com.nextchallenge.tawssil`) | Partner App (`com.nextchallenge.tawssil_patenaire`) | Status |
|---|---|---|:---:|
| **Clean App Launch** | Rendered branded welcome splash & portal screen with `#00366F` status bar. | Rendered "Carrier Partner Hub" with multi-language selector (EN/FR/AR). | **PASS** |
| **Invalid Credentials Rejection** | Submitted invalid credentials (`550000003` + wrong password). API returned 401; UI rejected and cleared inputs. | Submitted invalid credentials (`550000002` + wrong password). API returned error; inputs cleared. | **PASS** |
| **Production Login Authentication** | Authenticated as `Amine Meziane` (`+213550000003`). Backend returned valid JWT and user payload. | Authenticated as `Karim Benali` (`+213550000002`). Backend returned valid transporter JWT. | **PASS** |
| **Dynamic Data Loading from Atlas** | Loaded customer profile, live GPS location in Sétif (`5CG3+G4 Sétif, Algérie`), and Trip History module. | Loaded transporter dashboard, "Verified Carrier" status, today's metrics (24,500 DZD, 18 trips, 4.9 rating). | **PASS** |
| **Sub-Page Navigation & Financials** | Opened Drawer -> Navigated to "Trips" history page cleanly. | Opened "Billing & Invoices" -> Loaded payment statement (Oct 19, 2026, 3,150 DZD Confirmed). | **PASS** |
| **Session Persistence Across Cold Kill** | Killed via `am force-stop`. Relaunched via `am start`. App resumed directly into authenticated state without login prompt. | Killed via `am force-stop`. Relaunched via `am start`. App resumed directly into Driver Hub with active session. | **PASS** |

---

## 5. Verification Evidence & Screenshots

All high-resolution proof captures from the physical phone are recorded in the `screenshots/` directory:
- `screenshots/customer_app_launch.png` — Customer app welcome screen
- `screenshots/customer_login_form.png` — Customer sign-in interface
- `screenshots/customer_bad_credentials_rejected_final.png` — Production API rejection of invalid client credentials
- `screenshots/customer_logged_in_dashboard.png` — Authenticated Customer map and booking interface with live Sétif GPS
- `screenshots/customer_voyages_list.png` — Customer navigation drawer displaying verified user "Amine Meziane"
- `screenshots/customer_voyages_tab.png` — Trips history screen populated from Render backend
- `screenshots/customer_session_persisted.png` — Cold restart verification of persistent Customer session
- `screenshots/partner_app_launch2.png` — Partner app Carrier Hub welcome screen
- `screenshots/partner_login_screen.png` — Partner driver login interface
- `screenshots/partner_bad_credentials_rejected.png` — Production API rejection of invalid partner credentials
- `screenshots/partner_dashboard_clean.png` — Authenticated Carrier Hub showing "Karim Benali [VERIFIED]" & metrics
- `screenshots/partner_toggle_status.png` — Real-time driver profile & dispatch readiness controls
- `screenshots/partner_billing_page.png` — Carrier billing statements & settlement records from MongoDB Atlas
- `screenshots/partner_session_persisted2.png` — Cold restart verification of persistent Partner session
