# FLEETORA — CUSTOM DOMAIN DNS & TLS VERIFICATION REPORT

**Date:** 2026-10-27  
**Audited Release Target:** `73ce5e4291a8c76f415a8911557e9c3446dd4d78`  
**Target Domains:** `fleetora.com.dz` & `api.fleetora.com.dz`  
**Target Infrastructure:** Render Cloud Platform (Frankfurt `fra`)  
**Status:** **BLOCKED — REGISTRAR / DNS ACTION REQUIRED**  

---

## 1. Domain Configuration Summary

| Domain | Intended Service | Render Destination | Render Domain ID | Verification Status | Public DNS Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **`api.fleetora.com.dz`** | Backend API (`fleetora-api`) | `fleetora-api-93an.onrender.com` | `cdm-dbg6h0nb9u1s73cdrao0` | `unverified` | `NXDOMAIN` (Status 3) |
| **`fleetora.com.dz`** | Web Portal (`fleetora-web`) | `fleetora-web.onrender.com` | Pending Slot/Plan | Pending Slot/Plan | `NXDOMAIN` (Status 3) |

---

## 2. Render Custom Domain Audit

Using authorized Render API credentials (`usr-ccm8oraen0hln4gra9p0`), the custom domain configuration for `fleetora-api` (`srv-dbb5ol9jfumc73dao5k0`) was inspected:

```json
{
  "id": "cdm-dbg6h0nb9u1s73cdrao0",
  "name": "api.fleetora.com.dz",
  "domainType": "subdomain",
  "publicSuffix": "com.dz",
  "redirectForName": "",
  "verificationStatus": "unverified",
  "createdAt": "2026-10-27T09:01:54.70553Z"
}
```

Render is actively listening for DNS delegation and will automatically provision a Let's Encrypt TLS certificate as soon as the CNAME record resolves.

---

## 3. Authoritative DNS & Registry Diagnostics

Diagnostic queries were executed against independent public DNS resolvers and the Algerian ccTLD registry:

### 3.1 DNS-over-HTTPS (DoH) Authoritative Probe
```bash
# Query Google Public DNS (8.8.8.8) DoH API
curl -s "https://dns.google/resolve?name=api.fleetora.com.dz&type=ANY"
```
**Output:**
```json
{
  "Status": 3,
  "TC": false,
  "RD": true,
  "RA": true,
  "AD": false,
  "CD": false,
  "Question": [{"name": "api.fleetora.com.dz.", "type": 255}],
  "Authority": [
    {
      "name": "com.dz.",
      "type": 6,
      "TTL": 3600,
      "data": "ns1.nic.dz. dnsmaster.nic.dz. 2026102600 3600 600 2592000 3600"
    }
  ]
}
```

### 3.2 Root Authority Findings
- **Registry Authority:** `NIC.dz` (Centre de Recherche sur l'Information Scientifique et Technique - CERIST).
- **Authoritative Nameservers:** `ns1.nic.dz`, `ns2.nic.dz`, `ns3.nic.dz`, `ns5.nic.dz`, `ns6.nic.dz`.
- **Root Cause of NXDOMAIN:** The zone `fleetora.com.dz` is not yet delegated or published in the `.dz` ccTLD zone file. No A, AAAA, or CNAME records exist.

---

## 4. Standard Operating Procedure for Domain Owner / Registrar

To complete cutover and enable edge TLS termination, the domain administrator must configure the following records with the domain registrar (NIC.dz or designated registrar):

### 4.1 Required DNS Records
| Hostname / Record | Type | Value / Destination | TTL | Purpose |
| :--- | :---: | :--- | :---: | :--- |
| **`api.fleetora.com.dz`** | **CNAME** | `fleetora-api-93an.onrender.com` | 300 | Routes API traffic to Frankfurt Express instance |
| **`fleetora.com.dz`** | **ALIAS / ANAME** | `fleetora-web.onrender.com` | 300 | Routes apex web traffic to Render Static Edge CDN |
| **`fleetora.com.dz`** | **A (Fallback)** | `216.24.57.1` | 300 | Use only if registrar does not support apex CNAME/ALIAS |

### 4.2 Post-Cutover Automated Verification
Once DNS records are submitted:
```bash
# 1. Verify DNS resolution
dig +short api.fleetora.com.dz
# Expected: points to fleetora-api-93an.onrender.com -> 216.24.57.18

# 2. Verify TLS Certificate Issuance
curl -Iv https://api.fleetora.com.dz/health
# Expected: HTTP 200, valid Let's Encrypt TLS certificate
```

---

## 5. Gate Status

- **Status:** **BLOCKED**
- **Missing Resource:** Registrar zone delegation & CNAME configuration.
- **Responsible Party:** Domain Registrar Admin / DNS Administrator.
- **Prevents GREEN:** Yes (Blocks canonical domain access, though Render origin endpoints are fully operational).
