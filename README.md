# Fimrash Logistics Services Platform

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
2. **Anti-Theft OTP Handshake**: A server-generated 4-digit code that only the sender and recipient ever see. The rider must get it from the recipient at handover; 5 wrong attempts lock the delivery.
3. **Cash & COD Ledger**: Every naira a rider collects is recorded per delivery. The station receives each rider's pouch (shortfalls are recorded) and pays vendors separately with a payment reference.
4. **Shareable tracking links**: `/track/FMR-KN-XXXXXX` works from SMS, WhatsApp or the QR code printed on the waybill, and shows no customer phone numbers or addresses.

---

## 🛠️ Tech Stack & Lightweight Architecture

| Layer | Technology | Rationale & Performance Metrics |
|---|---|---|
| **Frontend** | React 19 + Vite + Tailwind CSS (Vercel) | ~113KB gzipped JS. Mobile-first screens for customers, riders and station staff. |
| **Backend API** | Plain PHP 8.1+ REST API (no framework, no Composer) | Runs on cPanel shared hosting. Signed bearer tokens, hashed PINs/passwords, DB-backed rate limiting, transactional cash handling. |
| **Database** | MySQL (InnoDB) | Strict relational integrity and row-level locking for money balances, waybill state transitions, and audit logs. SQLite supported for zero-friction local testing. |
| **Notifications** | Termii SMS (optional) + WhatsApp share links | When Termii is configured the recipient gets the handover code and tracking link by SMS; otherwise the sender sends it via a one-tap WhatsApp message. |

---

## 🗺️ Kano Metropolitan Commercial Zones Supported

- **Zone 1 (Core Central Commercial)**: Kantin Kwari (Textiles), Singer Market (Provisions), Sabon Gari, Kofar Wambai, Bata, Fagge.
- **Zone 2 (Business & Tech Hubs)**: Farm Centre, Zoo Road, Court Road, Post Office Road, Murtala Muhammad Way.
- **Zone 3 (Residential & Institutional)**: Nassarawa GRA, Tarauni, Hotoro GRA, BUK Old & New Campus, Badawa, Janbulo.
- **Zone 4 (Outer & Industrial Rings)**: Sharada Phase I & II, Challawa Industrial, Bompai, Dawanau Grains Market, Unguwa Uku.

---

## 🚀 Getting Started (local development)

Prerequisites: Node.js 18+ and PHP 8.1+ with `pdo_sqlite` (MySQL is only needed in production).

```bash
# 1. API (SQLite database and signing key are created automatically in backend/storage/)
cp backend/config.example.php backend/config.php
#    edit backend/config.php: set 'driver' => 'sqlite' and a bootstrap_admin password (10+ chars)
php -S localhost:8000 -t backend/public backend/public/index.php

# 2. Frontend (in another terminal). /api is proxied to localhost:8000.
cd frontend && npm install && npm run dev
```

Open http://localhost:5173/ops, sign in with the bootstrap admin, then add riders (with PINs) under **Fleet**.

## 👷 Roles

| Who | Where | Signs in with |
|---|---|---|
| Customer / merchant | `/` (book), `/track/<code>` | No account |
| Rider | `/rider` | Phone number or bike plate + PIN (set by station staff) |
| Station staff | `/ops` | Email + password |

Command-line admin tools (run on the server or locally):

```bash
php backend/bin/manage.php create-admin ops2@fimrash.com "Night Shift Manager"
php backend/bin/manage.php reset-admin-password ops@fimrash.com
php backend/bin/manage.php set-rider-pin 08031234567
php backend/bin/manage.php list-riders
```

## ✅ Tests

```bash
php backend/tests/api_test.php      # end-to-end API suite (auth, OTP, state machine, ledger, privacy, rate limits)
php backend/tests/fare_parity.php   # fails if frontend and backend fare tables disagree
cd frontend && npm run lint && npm run build
```

Deployment: see [DEPLOYMENT_GUIDE_VERCEL_WHOGOHOST.md](DEPLOYMENT_GUIDE_VERCEL_WHOGOHOST.md).

---

## 👥 Authors & Founders
- **Co-Founders**: Fimrash Logistics Team
- **Engineering & Architecture**: [OrchidByte Solutions & General Services](https://orchidbyte-solutions.com.ng) (CAC BN: 9343571)

