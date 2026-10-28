# Fleetora — Marketing Screenshot & Visual Reference Catalog

**Project:** Fleetora Modern Transportation & Logistics Platform  
**Target Systems:** Google Veo 3 Video Synthesis, Nano Banana Image Generation, Social Ad Campaigns & Product Launch  
**Total Assets:** 59 High-Resolution Assets (29 Native Production Screenshots, 21 Social Format Assets, 8 Realistic Device Mockups, 1 Master 4K Contact Sheet)  
**Location:** `audit/marketing/fleetora/`  

---

## 1. Catalog Overview & Story Journey

The Fleetora visual reference library is structured around the core commercial customer narrative:

$$\textbf{Discover} \longrightarrow \textbf{Choose} \longrightarrow \textbf{Book/Request} \longrightarrow \textbf{Track} \longrightarrow \textbf{Complete}$$

Along with dedicated partner (carrier/driver) dispatch operations and enterprise administrative oversight.

```text
audit/marketing/fleetora/
├── 01_hero/                               # High-impact onboarding & brand anchors
├── 02_discovery/                          # Location, map console & load search
├── 03_services/                           # 5 vehicle classifications & capability matrix
├── 04_vehicle_selection/                  # Interactive pricing, payload selection & guaranteed tariffs
├── 05_booking/                            # Waypoint confirmation, consignment setup & dispatch CTA
├── 06_driver/                             # Transporter assignment, driver badge & dialer link
├── 07_tracking/                           # Real-time status, in-dispatch progress & radar
├── 08_confirmation/                       # Successful delivery receipt & 5-star digital rating
├── 09_partner/                            # Driver Hub, duty toggle, wallet, BaridiMob & KYC compliance
├── 10_admin/                              # Operations KPI analytics, fleet tiers & billing ledger
├── social/
│   ├── portrait_9x16/                     # Instagram Reels, TikTok, Shorts, Stories (1080x1920)
│   ├── landscape_16x9/                    # YouTube, Facebook, LinkedIn, Website Hero (1920x1080)
│   └── square_1x1/                        # Instagram Posts, Facebook feed, Product Cards (1080x1080)
├── device_mockups/                        # Modern iPhone 15 Pro, Android & Desktop Studio frames
├── fleetora_marketing_contact_sheet.png   # 4K UHD Master Visual Reference Board
├── FLEETORA_MARKETING_SCREENSHOT_REPORT.md# Executive Marketing Report & Technical Audit
└── README.md                              # This master catalog document
```

---

## 2. Master Screenshot Catalog

### Section 01: Hero & Onboarding (`01_hero/`)

#### 1. `fleetora_hero_home.png`
- **Feature Represented:** Fleetora Customer Mobile onboarding welcome screen with visual logistics header, value proposition, and language selector (EN, FR, AR).
- **User Journey Stage:** Discover / Landing
- **Recommended Veo 3 Use:** Opening scene: A shipper opens the Fleetora mobile app on their smartphone; camera zooms smoothly into the "Freight Transport, Simplified" headline and value badges.
- **Recommended Nano Banana Use:** Anchor image for social media launch banners, mobile app store listing feature graphic, and hero visual reference.
- **Recommended Marketing Channels:** Instagram Stories, TikTok ads, Mobile App Stores (Google Play / App Store), Website Mobile Landing.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/home`).
- **Limitations:** None. Brand logo, language switcher, and value props fully rendered.

#### 2. `fleetora_web_hero.png`
- **Feature Represented:** Fleetora Customer Web onboarding & split-screen enterprise portal with Algerian mobile validation and verified logistics emblem.
- **User Journey Stage:** Discover / Web Sign In
- **Recommended Veo 3 Use:** Office B2B cutaway: A supply chain manager seated at a workstation logging into the Fleetora dispatch console.
- **Recommended Nano Banana Use:** Website hero background, enterprise whitepaper cover, LinkedIn sponsored carousel banner.
- **Recommended Marketing Channels:** LinkedIn B2B campaigns, desktop website hero, Google Display Network.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_web_vue3`, `/signup`).
- **Limitations:** Clean UI, zero dev tools or browser artifacts.

#### 3. `fleetora_partner_hero.png`
- **Feature Represented:** Transporter / Carrier Partner onboarding screen ("Power Your Truck with Guaranteed Freight Loads" & "Drive More. Earn More.").
- **User Journey Stage:** Discover / Driver Acquisition
- **Recommended Veo 3 Use:** Driver recruitment commercial: An independent truck owner-operator installing Fleetora Partner and viewing guaranteed freight benefits.
- **Recommended Nano Banana Use:** Driver acquisition ads, Facebook carrier groups, roadside digital billboards.
- **Recommended Marketing Channels:** Facebook Driver campaigns, YouTube carrier tutorials, TikTok driver promos.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/home`).
- **Limitations:** None. Clean branding and verified carrier tags.

---

### Section 02: Discovery & Route Planning (`02_discovery/`)

#### 4. `fleetora_vehicle_discovery.png`
- **Feature Represented:** Web interactive route planning console with pickup origin (Port d'Alger) and delivery destination (Zone Industrielle Oued Smar), showing estimated distance (28 km) and duration (35 mins).
- **User Journey Stage:** Discover / Plan Route
- **Recommended Veo 3 Use:** Interactive route input shot: The user enters industrial shipping addresses across Algiers, with dynamic route calculation showing instant dispatch readiness.
- **Recommended Nano Banana Use:** Product interface tour graphic, SaaS feature breakdown carousel.
- **Recommended Marketing Channels:** Website product walkthrough, B2B sales decks, LinkedIn product demos.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_web_vue3`, `/map`).
- **Limitations:** Directions rendered with fallback timing simulation where map tiles are cached.

#### 5. `fleetora_customer_search.png`
- **Feature Represented:** Mobile shipment search console with instant search bar, filter chips, and recent dispatch delivery cards.
- **User Journey Stage:** Discover / Shipment History
- **Recommended Veo 3 Use:** Quick lookup cutscene: Customer searches for active delivery records by carrier or destination.
- **Recommended Nano Banana Use:** UI feature card illustrating ease of parcel/freight lookup.
- **Recommended Marketing Channels:** Instagram carousels, mobile app feature highlights.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/search`).
- **Limitations:** None.

#### 6. `fleetora_mobile_discovery.png`
- **Feature Represented:** Customer Mobile bottom-sheet dispatch console with floating action controls and GPS status.
- **User Journey Stage:** Discover / Console
- **Recommended Veo 3 Use:** Handheld phone sequence: User launching dispatch console on the go.
- **Recommended Nano Banana Use:** Mobile app UI mockup component.
- **Recommended Marketing Channels:** App Store screenshots, Instagram Stories.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tabs`).
- **Limitations:** None.

---

### Section 03: Service Categories (`03_services/`)

#### 7. `fleetora_service_categories.png`
- **Feature Represented:** Fleetora comprehensive fleet classification: Fourgonnette (<1.5T), Camion Moyen (3.5T-5T), Camion Plateau (10T), Semi-Remorque (20T+), and Camion Frigorifique (Refrigerated 10T).
- **User Journey Stage:** Choose / Category Exploration
- **Recommended Veo 3 Use:** Service breakdown sequence: Animated camera pan across the 5 truck classes showing capacity from 1.5 tons up to 20+ ton heavy freight.
- **Recommended Nano Banana Use:** Fleet capability infographic, brochure vehicle matrix, promotional comparison card.
- **Recommended Marketing Channels:** Website fleet page, sales one-pagers, Facebook product showcase.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripInfo`).
- **Limitations:** None. Real vehicle photographs and per-km pricing displayed.

#### 8. `fleetora_web_service_catalog.png`
- **Feature Represented:** Web 5-class fleet matrix with per-km tariffs, base minimums, and cargo waypoints summary.
- **User Journey Stage:** Choose / Web Fleet Comparison
- **Recommended Veo 3 Use:** Commercial pricing overview: Highlighting Fleetora's transparent, predictable freight pricing model.
- **Recommended Nano Banana Use:** Enterprise pricing page graphic, comparison table reference.
- **Recommended Marketing Channels:** B2B marketing, pricing calculators, sales decks.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_web_vue3`, `/tripInfo`).
- **Limitations:** None.

#### 9. `fleetora_carrier_services.png`
- **Feature Represented:** Carrier Hub dispatch operations catalog (Incoming Shipment Requests, Planned Trips, Trip Records, Invoices, Documents, Support).
- **User Journey Stage:** Choose / Carrier Services
- **Recommended Veo 3 Use:** Driver ecosystem showcase: Explaining the comprehensive operational tools provided to Fleetora drivers.
- **Recommended Nano Banana Use:** Transporter marketing one-pager, partner program visual reference.
- **Recommended Marketing Channels:** Carrier recruitment portals, driver training materials.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/tabs`).
- **Limitations:** None.

---

### Section 04: Vehicle Selection & Pricing (`04_vehicle_selection/`)

#### 10. `fleetora_vehicle_selection.png`
- **Feature Represented:** Mobile vehicle selector with route summary (Port d'Alger to Zone Industrielle Oued Smar, 25 km), Van selected, and live minimum fare calculation (2,500 DZD).
- **User Journey Stage:** Choose / Light Vehicle Selection
- **Recommended Veo 3 Use:** Selection action shot: Customer tapping on the light van card to book an urgent pallet delivery.
- **Recommended Nano Banana Use:** Customer journey step 2 illustration.
- **Recommended Marketing Channels:** Instagram feed, product onboarding tour.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripInfo`).
- **Limitations:** None.

#### 11. `fleetora_vehicle_selected_heavy.png`
- **Feature Represented:** Semi-Remorque (Heavy Freight 20T+) selected with active checkmark, showing 260 DZD/km tariff, 12,000 DZD total fare, and "Guaranteed Rate" badge.
- **User Journey Stage:** Choose / Heavy Freight Selection
- **Recommended Veo 3 Use:** Hero commercial transition: Customer selects a 20-ton articulated semi-trailer; camera transitions from app UI to a cinematic 3D truck hitting the highway.
- **Recommended Nano Banana Use:** High-ticket industrial marketing, logistics service promotion.
- **Recommended Marketing Channels:** LinkedIn B2B, industrial freight campaigns, Facebook ads.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripInfo`).
- **Limitations:** None.

#### 12. `fleetora_web_vehicle_selection.png`
- **Feature Represented:** Web vehicle selection with interactive fare breakdown (Rate per km: 65 DZD, Distance charge: 1,625 DZD, Base guarantee: 2,500 DZD) and confirm dispatch button.
- **User Journey Stage:** Choose / Upfront Fare Breakdown
- **Recommended Veo 3 Use:** Highlighting transparency: Zooming in on the upfront fare guarantee calculation.
- **Recommended Nano Banana Use:** Pricing transparency ad, enterprise trust builder.
- **Recommended Marketing Channels:** SaaS review sites, LinkedIn Sponsored Content.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_web_vue3`, `/tripInfo`).
- **Limitations:** None.

---

### Section 05: Booking & Request Flow (`05_booking/`)

#### 13. `fleetora_booking_request.png`
- **Feature Represented:** Mobile active booking summary with Shipment ID (#908123), agreed total fare (4,800 DZD), "Pay on Delivery", waypoints, and cancel option.
- **User Journey Stage:** Book / Request Confirmation
- **Recommended Veo 3 Use:** Request confirmed scene: Customer reviewing final shipment terms before driver is dispatched.
- **Recommended Nano Banana Use:** UI reference for checkout and dispatch confirmation flows.
- **Recommended Marketing Channels:** App Store feature graphics, customer journey infographics.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripDetail`).
- **Limitations:** None.

#### 14. `fleetora_web_booking_console.png`
- **Feature Represented:** Web enterprise booking console with route waypoints, vehicle category selection, and instant dispatch trigger.
- **User Journey Stage:** Book / Enterprise Dispatch
- **Recommended Veo 3 Use:** B2B dispatch sequence: Logistics coordinator confirming multi-city freight booking.
- **Recommended Nano Banana Use:** Enterprise product card, whitepaper illustration.
- **Recommended Marketing Channels:** Corporate presentations, B2B landing pages.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_web_vue3`, `/tripInfo`).
- **Limitations:** None.

---

### Section 06: Assigned Driver & Transporter (`06_driver/`)

#### 15. `fleetora_driver_assigned.png`
- **Feature Represented:** Verified Transporter Assigned card: Driver Karim Benali (+213 550 00 00 02), direct phone call action, 5-star customer rating, and waypoints.
- **User Journey Stage:** Driver / Carrier Verification
- **Recommended Veo 3 Use:** Driver assigned scene: Notification chimes on customer's phone showing Karim Benali assigned; phone cutaway to a professional driver in Fleetora uniform starting his engine.
- **Recommended Nano Banana Use:** Trust and safety campaign banner, driver profile feature graphic.
- **Recommended Marketing Channels:** Instagram Stories, safety advertisements, customer trust materials.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripDetail`).
- **Limitations:** None. Real seeded Algerian carrier profile.

#### 16. `fleetora_driver_profile.png`
- **Feature Represented:** Driver specification settings, vehicle documentation, and availability controls.
- **User Journey Stage:** Driver / Driver Settings
- **Recommended Veo 3 Use:** Driver onboard sequence: Demonstrating carrier qualification and vehicle verification.
- **Recommended Nano Banana Use:** Driver recruitment guide, KYC onboarding tutorial graphic.
- **Recommended Marketing Channels:** Partner onboarding portals, driver support FAQ.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/updateProfile`).
- **Limitations:** None.

---

### Section 07: Live Tracking & Dispatch Status (`07_tracking/`)

#### 17. `fleetora_live_tracking.png`
- **Feature Represented:** Live active dispatch tracking view with Shipment ID, In-Dispatch status badge, assigned transporter status, and pickup-dropoff timeline.
- **User Journey Stage:** Track / Real-Time Progress
- **Recommended Veo 3 Use:** Live tracking cutscene: Customer looks at phone while waiting at the warehouse; phone screen shows live tracking status with driver en route.
- **Recommended Nano Banana Use:** "Track Every Kilometer" promotional graphic, mobile GPS feature highlight.
- **Recommended Marketing Channels:** Instagram Reels, YouTube Shorts, product feature tours.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripDetail`).
- **Limitations:** None.

#### 18. `fleetora_dispatch_status_inprogress.png`
- **Feature Represented:** Active Dispatches radar console with direct shortcut to freight booking.
- **User Journey Stage:** Track / Dispatch Queue
- **Recommended Veo 3 Use:** Dispatch center monitoring sequence.
- **Recommended Nano Banana Use:** UI asset for dispatch queue documentation.
- **Recommended Marketing Channels:** App Store screenshots.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripsInProgress`).
- **Limitations:** None.

---

### Section 08: Confirmation & Completion (`08_confirmation/`)

#### 19. `fleetora_booking_confirmation.png`
- **Feature Represented:** Completed delivery screen with COMPLETED status badge, Shipment ID (#48E98A), agreed total fare paid (3,500 DZD), 5 golden stars customer service rating, and route waypoints.
- **User Journey Stage:** Complete / Digital Receipt & Rating
- **Recommended Veo 3 Use:** Final scene of marketing video: Pallet is unloaded safely at the destination warehouse; customer taps 5 stars on their phone; camera tilts up to a smiling driver and customer shaking hands with Fleetora trucks in the background.
- **Recommended Nano Banana Use:** Customer satisfaction banner, testimonial ad background, electronic proof of delivery graphic.
- **Recommended Marketing Channels:** Instagram posts, customer success stories, website proof-of-delivery section.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/tripDetail`).
- **Limitations:** None. Perfect 5-star rating visual.

#### 20. `fleetora_completed_dispatch_record.png`
- **Feature Represented:** Shipment audit log with completed delivery card showing carrier Karim Benali, Port d'Alger to Oued Smar, and 3,500 DZD fare settlement.
- **User Journey Stage:** Complete / History Audit
- **Recommended Veo 3 Use:** Supply chain bookkeeping cutaway.
- **Recommended Nano Banana Use:** Expense management and accounting integration visual.
- **Recommended Marketing Channels:** B2B accounting presentations.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_client`, `/search`).
- **Limitations:** None.

---

### Section 09: Carrier & Partner Experience (`09_partner/`)

#### 21. `fleetora_partner_hub_dashboard.png`
- **Feature Represented:** Driver Dispatch Hub: Karim Benali (VERIFIED), Online/Offline toggle with active beacon pulse, Today's Operations KPI cards (Earnings: 24,500 DZD, Loads: 18 Trips, Rating: 4.9 stars), and dispatch operations menu.
- **User Journey Stage:** Partner / Operations Dashboard
- **Recommended Veo 3 Use:** Driver success commercial: Carrier driver turns on the "Online & Dispatch Ready" switch; incoming freight alerts pop up with high-paying load requests.
- **Recommended Nano Banana Use:** Driver recruitment billboard, "Earn up to 25,000 DZD/day" promotional graphic.
- **Recommended Marketing Channels:** Facebook Driver recruitment ads, TikTok carrier testimonials, Algerian transporter groups.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/tabs`).
- **Limitations:** None. High-impact commercial KPI metrics.

#### 22. `fleetora_partner_wallet.png`
- **Feature Represented:** Carrier Driver Wallet: Available Payout Balance (45,200 DZD), Instant Payout button, 10% platform commission, BaridiMob/CCP RIP account verification (00799999001234567890), and recent settlement ledger.
- **User Journey Stage:** Partner / Financial Settlements
- **Recommended Veo 3 Use:** Instant payout feature scene: Transporter taps "Request Payout"; funds are immediately transferred to their BaridiMob account.
- **Recommended Nano Banana Use:** Financial transparency advertisement, driver benefit graphic.
- **Recommended Marketing Channels:** Facebook and WhatsApp carrier communities, payment gateway marketing.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/wallet`).
- **Limitations:** None.

#### 23. `fleetora_partner_kyc_documents.png`
- **Feature Represented:** Carrier Compliance & KYC Document Verification checklist (Carte Grise, Registre de Commerce, Carte Transport, Permis Circulation, Pièce d'Identité).
- **User Journey Stage:** Partner / Safety Compliance
- **Recommended Veo 3 Use:** Compliance inspection sequence: Demonstrating strict regulatory verification of all trucks and drivers.
- **Recommended Nano Banana Use:** Enterprise compliance whitepaper graphic, "100% Verified Drivers" seal.
- **Recommended Marketing Channels:** Enterprise security and compliance presentations, corporate B2B pitch decks.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/documents`).
- **Limitations:** None.

#### 24. `fleetora_partner_pending_verification.png`
- **Feature Represented:** KYC Review Status screen with verification readiness timeline (Registration & Documents, Compliance Audit, Account Activation).
- **User Journey Stage:** Partner / Compliance Review
- **Recommended Veo 3 Use:** Trust and safety validation step.
- **Recommended Nano Banana Use:** Carrier onboarding guide graphic.
- **Recommended Marketing Channels:** Driver onboarding app screens.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/pending`).
- **Limitations:** None.

#### 25. `fleetora_partner_planned_trips.png`
- **Feature Represented:** Scheduled loads calendar and upcoming freight commitments for carrier planning.
- **User Journey Stage:** Partner / Load Scheduling
- **Recommended Veo 3 Use:** Driver daily routine shot: Carrier inspecting tomorrow's pre-booked delivery routes.
- **Recommended Nano Banana Use:** Route optimization feature graphic.
- **Recommended Marketing Channels:** Carrier logistics promotions.
- **Aspect Ratio:** 9:19.5 native mobile (860 x 1864 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/fleetora_vue3_capacitor6_partner`, `/plannedTrips`).
- **Limitations:** None.

---

### Section 10: Administration & Operations Management (`10_admin/`)

#### 26. `fleetora_admin_operations_dashboard.png`
- **Feature Represented:** Fleetora Operations Platform Executive Analytics: KPI cards (Finished Trips, Active Clients: 4, Transporters: 2, Admins: 1), Revenue Volume timeline chart, and fleet distribution donut charts.
- **User Journey Stage:** Admin / Executive Oversight
- **Recommended Veo 3 Use:** Central operations room cutscene: Camera glides past a high-tech dispatch wall showing real-time freight analytics across Algeria.
- **Recommended Nano Banana Use:** Enterprise SaaS platform hero image, investor pitch deck dashboard slide, B2B product capability card.
- **Recommended Marketing Channels:** LinkedIn B2B campaigns, Investor relations, Gartner/logistics software showcases.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/adminPanel`, `/admin/dashboard`).
- **Limitations:** None. Fully populated database with real KPIs.

#### 27. `fleetora_admin_fleet_management.png`
- **Feature Represented:** Vehicle fleet categories configuration: Per-km rates, base minimum fares, and priority ranking for all 5 commercial truck tiers.
- **User Journey Stage:** Admin / Fleet Configuration
- **Recommended Veo 3 Use:** Platform configuration scene: Demonstrating flexible rate management and automated tariff calculations.
- **Recommended Nano Banana Use:** Enterprise customization feature graphic.
- **Recommended Marketing Channels:** Logistics conference banners, SaaS configuration walkthroughs.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/adminPanel`, `/admin/vehicles`).
- **Limitations:** None.

#### 28. `fleetora_admin_dispatch_trips.png`
- **Feature Represented:** Global dispatch trips monitoring table: Transporter details, client identity, vehicle class, origin-destination route, price, distance, and FINISHED status.
- **User Journey Stage:** Admin / Dispatch Monitoring
- **Recommended Veo 3 Use:** Freight control sequence: Operational oversight of active logistics movements.
- **Recommended Nano Banana Use:** Operational integrity visual for B2B case studies.
- **Recommended Marketing Channels:** Corporate client case studies, compliance audits.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/adminPanel`, `/admin/trips`).
- **Limitations:** None.

#### 29. `fleetora_admin_billing_settlements.png`
- **Feature Represented:** Carrier billing statements ledger with registered transporters, vehicle assignments, and settlement records.
- **User Journey Stage:** Admin / Invoicing & Settlements
- **Recommended Veo 3 Use:** Financial compliance and automated billing scene.
- **Recommended Nano Banana Use:** Corporate finance integration graphic.
- **Recommended Marketing Channels:** B2B financial and supply chain whitepapers.
- **Aspect Ratio:** 16:9 native desktop (3840 x 2160 px @ 2x DPR).
- **Source:** Real Fleetora application screenshot (`frontend/adminPanel`, `/admin/billing`).
- **Limitations:** None.

---

## 3. Social Media Formats Inventory

All social assets are generated without stretching or distorting aspect ratios, set against sleek Fleetora dark-slate and navy brand backdrops.

### A. Portrait Format 9:16 (1080 x 1920 px)
*Optimized for Instagram Reels, TikTok, YouTube Shorts, and Facebook Reels*

1. `social/portrait_9x16/fleetora_hero_9x16.png`: Customer Mobile Onboarding hero.
2. `social/portrait_9x16/fleetora_vehicle_selection_9x16.png`: Semi-Remorque 20T+ selection with 12,000 DZD guaranteed rate.
3. `social/portrait_9x16/fleetora_driver_assigned_9x16.png`: Assigned Transporter Karim Benali with call button.
4. `social/portrait_9x16/fleetora_live_tracking_9x16.png`: Real-time dispatch shipment tracking console.
5. `social/portrait_9x16/fleetora_booking_confirmation_9x16.png`: 5-star completed delivery confirmation.
6. `social/portrait_9x16/fleetora_partner_hub_9x16.png`: Driver Hub: 24,500 DZD today's earnings & online toggle.
7. `social/portrait_9x16/fleetora_partner_wallet_9x16.png`: Carrier Wallet: 45,200 DZD balance & BaridiMob payout.

### B. Landscape Format 16:9 (1920 x 1080 px)
*Optimized for YouTube, Facebook Video, LinkedIn, and Website Hero Sections*

1. `social/landscape_16x9/fleetora_hero_16x9.png`: Framed mobile hero presentation on dark studio gradient.
2. `social/landscape_16x9/fleetora_web_dispatch_16x9.png`: Native web dispatch route planning console.
3. `social/landscape_16x9/fleetora_web_vehicle_selection_16x9.png`: Native web vehicle catalog & fare estimation.
4. `social/landscape_16x9/fleetora_admin_dashboard_16x9.png`: Native operations analytics dashboard.
5. `social/landscape_16x9/fleetora_admin_fleet_16x9.png`: Native fleet categories configuration table.
6. `social/landscape_16x9/fleetora_live_tracking_16x9.png`: Framed tracking console on brand gradient.
7. `social/landscape_16x9/fleetora_booking_confirmation_16x9.png`: Framed completed delivery with 5-star rating.

### C. Square Format 1:1 (1080 x 1080 px)
*Optimized for Instagram Feed, Facebook Feed, LinkedIn Carousels, and Product Cards*

1. `social/square_1x1/fleetora_hero_1x1.png`: Mobile hero card framed for feed engagement.
2. `social/square_1x1/fleetora_vehicle_selection_1x1.png`: Semi-Remorque selection card.
3. `social/square_1x1/fleetora_driver_assigned_1x1.png`: Driver assignment trust card.
4. `social/square_1x1/fleetora_booking_confirmation_1x1.png`: 5-star rating customer success card.
5. `social/square_1x1/fleetora_partner_hub_1x1.png`: Carrier earnings & online status card.
6. `social/square_1x1/fleetora_partner_wallet_1x1.png`: BaridiMob payout & wallet card.
7. `social/square_1x1/fleetora_admin_dashboard_1x1.png`: Executive analytics dashboard card.

---

## 4. Realistic Device Mockups Inventory

Device mockups are secondary visual assets that showcase Fleetora inside modern hardware without replacing the real screenshots.

1. `device_mockups/fleetora_mockup_iphone_hero.png`:
   - Hardware: Modern iPhone 15 Pro Titanium chassis with Dynamic Island pill, home swipe indicator, and 30px studio shadow.
   - Screen: Customer Mobile Onboarding Hero.
   - Recommended Use: App Store feature graphic, Instagram launch poster.
2. `device_mockups/fleetora_mockup_iphone_vehicle_selection.png`:
   - Hardware: iPhone 15 Pro Titanium.
   - Screen: Semi-Remorque Heavy Freight 20T+ selection.
   - Recommended Use: Service tier showcase, mobile booking tutorial.
3. `device_mockups/fleetora_mockup_iphone_driver_assigned.png`:
   - Hardware: iPhone 15 Pro Titanium.
   - Screen: Karim Benali assigned with direct dialer.
   - Recommended Use: Customer trust campaign, safety spotlight.
4. `device_mockups/fleetora_mockup_iphone_booking_confirmation.png`:
   - Hardware: iPhone 15 Pro Titanium.
   - Screen: 5-Star completed delivery confirmation.
   - Recommended Use: Customer testimonial ads, post-delivery feedback promotion.
5. `device_mockups/fleetora_mockup_android_partner_hub.png`:
   - Hardware: Modern Android smartphone with punch-hole camera and minimal symmetric bezels.
   - Screen: Driver Hub (24,500 DZD today's earnings, online status toggle).
   - Recommended Use: Transporter driver recruitment ads, carrier testimonials.
6. `device_mockups/fleetora_mockup_android_partner_wallet.png`:
   - Hardware: Modern Android smartphone.
   - Screen: Carrier Wallet (45,200 DZD balance, BaridiMob / CCP instant payout).
   - Recommended Use: Financial benefit marketing for truck drivers across Algeria.
7. `device_mockups/fleetora_mockup_desktop_web_dispatch.png`:
   - Hardware: Modern macOS Safari studio browser with traffic light controls and SSL lock.
   - Screen: Web Dispatch Console (`https://fleetora.com.dz/map`).
   - Recommended Use: B2B website hero section, shipper portal marketing.
8. `device_mockups/fleetora_mockup_desktop_admin_dashboard.png`:
   - Hardware: Modern macOS Safari studio browser.
   - Screen: Operations Platform Analytics Dashboard (`https://fleetora.com.dz/admin/dashboard`).
   - Recommended Use: Corporate presentations, investor decks, enterprise sales collateral.

---

## 5. Master Marketing Contact Sheet

- **File:** `fleetora_marketing_contact_sheet.png`
- **Resolution:** 3840 x 2160 px (4K UHD)
- **Composition:** 8-panel structured visual board featuring the entire customer and carrier narrative:
  1. Scene 1: Discover (Customer Onboarding)
  2. Scene 2: Route Planning (Web Dispatch Waypoints)
  3. Scene 3: Vehicle Selection (5 Fleet Classes & Guaranteed Rate)
  4. Scene 4: Driver Assigned (Karim Benali & Direct Phone Link)
  5. Scene 5: Live Tracking (Shipment ID & Active Dispatch)
  6. Scene 6: Confirmation (Completed Delivery & 5-Star Rating)
  7. Carrier Ecosystem (Driver Hub: 24,500 DZD Earnings & Wallet)
  8. Enterprise B2B (Operations Platform & Revenue Analytics)
- **Purpose:** Authoritative single-image visual reference for AI prompt generation (Veo 3, Nano Banana, Midjourney) and human creative director review.

---

## 6. AI Generation Prompt Guidelines

### For Google Veo 3 Video Prompts:
- Use native screenshots from `01_hero/`, `04_vehicle_selection/`, `06_driver/`, `07_tracking/`, `08_confirmation/`, and `09_partner/` as reference visual anchors.
- Mention: `"Show the exact Fleetora UI as in reference image with dark navy (#00366F) header, verified logistics badge, and modern Material Design 3 cards."`
- Maintain consistency: Carrier name `Karim Benali`, pickup `Port d'Alger`, dropoff `Zone Industrielle Oued Smar`, fare `3,500 DZD` / `12,000 DZD`.

### For Nano Banana Image Prompts:
- Use `device_mockups/` or `social/` assets as input reference images.
- Keep branding clean: Fleetora location pin logo, typography, and Algerian context (`+213` phone numbers, DZD currency).
- Do not introduce fake features, prices, or legacy branding.
