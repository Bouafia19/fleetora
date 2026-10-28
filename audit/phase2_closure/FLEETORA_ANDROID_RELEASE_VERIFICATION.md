# FLEETORA — ANDROID RELEASE & SIGNING VERIFICATION REPORT

**Date:** 2026-10-27  
**Audited Release Target:** `73ce5e4291a8c76f415a8911557e9c3446dd4d78`  
**Applications in Scope:** Fleetora Partner (`com.fleetora.partner`) & Fleetora Client (`com.fleetora.client`)  
**Status:** **BLOCKED — PRODUCTION UPLOAD KEYSTORE REQUIRED**  

---

## 1. Application Inventory & Target Specifications

The Android mobile applications built using Capacitor 6 and Vue 3 were inspected:

### 1.1 Application Configuration
| Attribute | Fleetora Partner App | Fleetora Client App |
| :--- | :--- | :--- |
| **Application ID** | `com.fleetora.partner` | `com.fleetora.client` |
| **Version Code** | `1` | `1` |
| **Version Name** | `1.0.0` | `1.0.0` |
| **Compile SDK** | `34` (Android 14) | `34` (Android 14) |
| **Target SDK** | `34` (Android 14) | `34` (Android 14) |
| **Minimum SDK** | `22` (Android 5.1 Lollipop) | `22` (Android 5.1 Lollipop) |
| **Build Type** | Release (`isMinifyEnabled = false`) | Release (`isMinifyEnabled = false`) |
| **Cleartext Allowed** | `false` (HTTPS Enforced) | `false` (HTTPS Enforced) |

---

## 2. Release Artifact Inspection & Cryptographic Hashes

Release App Bundles (AAB) and testing APKs were verified directly on disk:

### 2.1 Release Artifact Table
| Application | Artifact Format | File Path | File Size | SHA-256 Checksum | Signing Status |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Partner** | **AAB** | `frontend/fleetora_vue3_capacitor6_partner/android/app/build/outputs/bundle/release/app-release.aab` | 11.34 MB | `85adc089475ed2f16d8830a5abe8389ff8e86a9f09b76b93273a481811bda9ef` | **UNSIGNED** |
| **Partner** | **APK** | `frontend/fleetora_vue3_capacitor6_partner/android/app/build/outputs/apk/release/app-release-unsigned.apk` | 12.27 MB | `b3a1b27abbabf80c0e233220e133699d5497e47360b22bbcf1d0721ff0208b09` | **UNSIGNED** |
| **Client** | **AAB** | `frontend/fleetora_vue3_capacitor6_client/android/app/build/outputs/bundle/release/app-release.aab` | 11.08 MB | `49a6410062365c11be6214afafc967290efe54a4e3e5cd8bccd8390ee5a7fc4b` | **UNSIGNED** |
| **Client** | **APK** | `frontend/fleetora_vue3_capacitor6_client/android/app/build/outputs/apk/release/app-release-unsigned.apk` | 11.96 MB | `25a2553511d03d25ac79a0086c1a8da0f92584dbe81804583dc1eab5c8d2bfa2` | **UNSIGNED** |

### 2.2 Signature Probe
```bash
jarsigner -verify frontend/fleetora_vue3_capacitor6_partner/android/app/build/outputs/bundle/release/app-release.aab
# Result: jar is unsigned.

jarsigner -verify frontend/fleetora_vue3_capacitor6_client/android/app/build/outputs/bundle/release/app-release.aab
# Result: jar is unsigned.
```

---

## 3. Production Keystore Security Policy

- **Filesystem Audit:** A scan of the local machine revealed only `~/.android/debug.keystore`.
- **Policy Compliance:** The production release upload keystore (`*.jks`) is strictly protected and rightly excluded from the shared Git repository to prevent credential compromise.
- **Strict Mandate:** Replacing the production key with a temporary local key is prohibited, as Google Play rejects uploads signed by mismatched keys once Play App Signing is enrolled.

---

## 4. Signing & Google Play Internal Testing Instructions

The authorized release engineer must execute the following commands in a protected build environment:

```bash
# 1. Sign Partner App Bundle
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore "$PRODUCTION_UPLOAD_KEYSTORE" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  frontend/fleetora_vue3_capacitor6_partner/android/app/build/outputs/bundle/release/app-release.aab \
  "$KEY_ALIAS"

# 2. Sign Client App Bundle
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore "$PRODUCTION_UPLOAD_KEYSTORE" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  frontend/fleetora_vue3_capacitor6_client/android/app/build/outputs/bundle/release/app-release.aab \
  "$KEY_ALIAS"

# 3. Verify Signatures
jarsigner -verify -verbose -certs frontend/fleetora_vue3_capacitor6_partner/android/app/build/outputs/bundle/release/app-release.aab
jarsigner -verify -verbose -certs frontend/fleetora_vue3_capacitor6_client/android/app/build/outputs/bundle/release/app-release.aab
```

### Google Play Console Upload:
1. Log in to [Google Play Console](https://play.google.com/console).
2. Select Application (`Fleetora Partner` or `Fleetora Client`).
3. Navigate to **Testing** $\rightarrow$ **Internal testing**.
4. Create a new release and upload the signed `.aab`.
5. Roll out the release to internal testers. Do NOT publish directly to production track without testing feedback.

---

## 5. Gate Status

- **Status:** **BLOCKED**
- **Missing Resource:** Production upload keystore & Google Play Console account access.
- **Responsible Party:** Mobile Release Engineer / Google Play Account Admin.
- **Prevents GREEN:** Yes (Required for mobile distribution).
