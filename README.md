# Fimrash Logistics Services Platform (MVP)

> **Hyper-Local Courier Dispatch, Landmark Routing & Anti-Theft COD Settlement Platform for Kano Metropolis**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built by](https://img.shields.io/badge/Built%20by-OrchidByte%20Solutions-00d26a.svg)](https://orchidbyte-solutions.com.ng)
[![Operating Zone](https://img.shields.io/badge/Operating%20Zone-Kano%20Metropolis-orange.svg)](#)

---

## 📌 Executive Summary

**Fimrash Logistics Services** is an intra-state metropolitan dispatch and parcel delivery platform purpose-built for the commercial realities of **Kano State, Nigeria**. 

Traditional address-based logistics systems fail in northern Nigerian commercial centres because streets lack formal house numbering and drivers navigate through historical gates (*Kofar*), major markets, and informal landmarks. Furthermore, social-commerce vendors (Instagram, TikTok, WhatsApp traders in Kantin Kwari and Farm Centre) lose millions to fraudulent delivery claims and face chaotic Cash-on-Delivery (COD) reconciliation.

Fimrash Logistics solves this with:
1. **Landmark-First Navigation**: Direct pickup/dropoff selection matching Kano’s commercial nodes (Kantin Kwari, Singer, Farm Centre, Sabon Gari, Nassarawa GRA, Hotoro, BUK).
2. **Anti-Theft OTP Handshake**: A 4-digit recipient one-time passcode required before a rider can mark an order delivered.
3. **Automated COD Ledger**: Seamless reconciliation of item cost collected in cash versus delivery fees, with instant vendor payouts.
4. **Lightweight PWA Design**: Under 120KB initial bundle size, fast loading on 3G/EDGE mobile data, installable directly to the home screen without app store overhead.

---

## 🛠️ Tech Stack & Lightweight Architecture

| Layer | Technology | Rationale & Performance Metrics |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | Built with Vite for rapid sub-second loads (<120KB gzipped). Zero bloated dependencies. Mobile-first PWA design for riders and dispatchers. |
| **Backend API** | PHP 8.x / Laravel REST API | Headless JSON API without heavy Blade/session overhead. Native compatibility with low-cost Nigerian cPanel/shared hosting. ACID database transactions for COD reconciliation. |
| **Database** | MySQL (InnoDB) | Strict relational integrity and row-level locking for money balances, waybill state transitions, and audit logs. SQLite supported for zero-friction local testing. |
| **Notifications** | Termii SMS / WhatsApp Webhooks | Instant dispatch alerts and recipient tracking links sent via lightweight background queues. |

---

## 🗺️ Kano Metropolitan Commercial Zones Supported

- **Zone 1 (Core Central Commercial)**: Kantin Kwari (Textiles), Singer Market (Provisions), Sabon Gari, Kofar Wambai, Bata, Fagge.
- **Zone 2 (Business & Tech Hubs)**: Farm Centre, Zoo Road, Court Road, Post Office Road, Murtala Muhammad Way.
- **Zone 3 (Residential & Institutional)**: Nassarawa GRA, Tarauni, Hotoro GRA, BUK Old & New Campus, Badawa, Janbulo.
- **Zone 4 (Outer & Industrial Rings)**: Sharada Phase I & II, Challawa Industrial, Bompai, Dawanau Grains Market, Unguwa Uku.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (v24 recommended)
- **PHP**: v8.1+
- **Composer**: v2.x
- **MySQL**: 8.0+ (or SQLite for local dev)

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd backend
php -S 127.0.0.1:8080 -t public
```

---

## 👥 Authors & Founders
- **Co-Founders**: Fimrash Logistics Team
- **Engineering & Architecture**: [OrchidByte Solutions & General Services](https://orchidbyte-solutions.com.ng) (CAC BN: 9343571)
