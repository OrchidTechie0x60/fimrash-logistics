# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary (public site):** individuals and families in Kano metropolis sending a one-off parcel, document, gift, food order or errand across town — and the recipients who receive a tracking link. Mostly on mid-range Android phones over mobile data.
- **Secondary (public site):** home businesses and market traders (home bakers in Gyadi-Gyadi, caterers, Kantin Kwari / Singer traders, Instagram/WhatsApp sellers) who send repeatedly and use Cash-on-Delivery.
- **Internal (not linked publicly):** riders at `/rider` (phone + PIN, on a motorcycle, often outdoors) and station staff at `/ops` (dispatch, cash remittance, vendor CoD payouts, fleet).

## Product Purpose
Same-day motorcycle courier within Kano metropolis, booked online without an account. Success: a first-time visitor books a pickup or tracks a parcel within seconds, and the handover happens only when the real recipient confirms with their code.

## Positioning
Kano-native, landmark-first dispatch: pickups and drop-offs are chosen by the landmarks people actually navigate by (Kantin Kwari, Singer, Gyadi-Gyadi, Naibawa, BUK, Hotoro…), not street addresses. Every parcel carries a private 4-digit handover code that only the sender and recipient know — the rider cannot mark a delivery complete without it. Flat corridor fares from ₦600 shown before booking.

## Operating Context
- Booking: pickup landmark + detail, drop-off landmark + detail, parcel type, fee paid on delivery or prepaid, optional item-price collection (CoD) for sellers.
- After booking: sender gets a waybill (FMR-KN-XXXXXX), a scannable QR tracking link, and the handover code to send to the recipient by WhatsApp (or SMS when configured).
- Tracking: `/track/<code>` shows status timeline, assigned rider's first name, bike plate and phone; no customer phone numbers or addresses.
- Human fallback: dispatch desk 0815 666 1246 (call and WhatsApp), 7:30 AM – 9:00 PM daily.

## Capabilities and Constraints
- 21 landmarks in 4 zones; fares ₦600–₦2,200 computed by the server.
- No live GPS (map is an approximate landmark route). No online payment yet. No customer accounts.
- Frontend: React 19 + Vite + Tailwind 4 on Vercel; API: plain PHP on Whogohost.
- Rider and ops consoles must not be linked from public navigation; reachable by URL only.

## Brand Commitments
- Name: Fimrash Logistics Services; built by OrchidByte Solutions.
- Official logo: an "F" whose top bar becomes an orange arrow, with the FIMRASH / LOGISTICS wordmark (Archivo 800/600). Source files are in `Graphics_logo/`.
- Brand colours: deep blue #1B3A6B, mid blue #2C5AA0, signal orange #F28C28, light tint #EEF1F6. Signal orange is the site's single action colour.
- Logo rules: clear space of one arrowhead-height; minimum 96px wide on screen; use the one-colour version when only one ink is available.
- Public pages offer a full **English / Hausa language toggle** (user decision).

## Evidence on Hand
- None yet: no testimonials, customer logos, delivery counts, ratings or press. Do not fabricate any.
- Real photos of riders/bikes/deliveries are planned: leave clearly marked replaceable slots.
- Real, demonstrable product truths: landmark list, fare table, handover-code mechanism, tracking timeline, desk number.

## Product Principles
1. Booking and tracking are always one tap away from anywhere on the public site.
2. Trust is shown by mechanism (the handover code, flat fares, named rider), never by invented claims.
3. Speak Kano: landmarks and Hausa the way people actually use them.
4. Built for a phone on mobile data first.

## Accessibility & Inclusion
Bilingual (English/Hausa); readable at arm's length outdoors; pinch-zoom allowed; works on low-end Android and slow networks.
