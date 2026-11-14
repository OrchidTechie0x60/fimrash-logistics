-- Fimrash Logistics Services - Kano Metropolis Intra-State Platform
-- Database Schema (MySQL & SQLite Compatible)

CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    base_fare DECIMAL(10, 2) DEFAULT 800.00
);

CREATE TABLE IF NOT EXISTS landmarks (
    id VARCHAR(64) PRIMARY KEY,
    zone_id VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    hausa_name VARCHAR(128),
    popular_anchor VARCHAR(255),
    category VARCHAR(64) DEFAULT 'Commercial Market',
    lat DECIMAL(10, 6),
    lng DECIMAL(10, 6)
);

CREATE TABLE IF NOT EXISTS riders (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    bike_number VARCHAR(32) NOT NULL,
    active_zone VARCHAR(32) DEFAULT 'Z1_CENTRAL',
    status VARCHAR(32) DEFAULT 'available', -- available, on_delivery, off_duty
    cash_in_hand DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deliveries (
    id VARCHAR(32) PRIMARY KEY,
    tracking_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. FMR-KN-1042
    sender_type VARCHAR(32) DEFAULT 'home', -- home, market, office
    sender_name VARCHAR(128) NOT NULL,
    sender_phone VARCHAR(32) NOT NULL,
    sender_landmark_id VARCHAR(64) NOT NULL,
    sender_landmark_detail VARCHAR(255), -- e.g. House 14, Behind Veterinary, Court Road / Block B, Line 3
    
    recipient_type VARCHAR(32) DEFAULT 'home', -- home, market, office
    recipient_name VARCHAR(128) NOT NULL,
    recipient_phone VARCHAR(32) NOT NULL,
    recipient_landmark_id VARCHAR(64) NOT NULL,
    recipient_landmark_detail VARCHAR(255), -- e.g. Near Jallaba Mosque, Naibawa / House 12, Coronation Hall Rd
    
    item_category VARCHAR(64) NOT NULL, -- cakes, catering_food, fabrics, perfumes, electronics, documents, personal
    item_description VARCHAR(255),
    is_fragile BOOLEAN DEFAULT 0, -- 1 for cakes, pastries, upright handling
    special_instructions VARCHAR(255),
    
    payment_mode VARCHAR(32) DEFAULT 'pay_on_delivery', -- pay_on_delivery, prepaid
    cod_amount DECIMAL(10, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    
    otp_code VARCHAR(8) NOT NULL, -- 4-digit recipient handshake OTP e.g. 7419
    otp_verified_at TIMESTAMP NULL,
    
    assigned_rider_id VARCHAR(32) NULL,
    status VARCHAR(32) DEFAULT 'pending', -- pending, assigned, picked_up, in_transit, arrived, delivered, cancelled
    
    cod_collected_by_rider BOOLEAN DEFAULT 0,
    cod_remitted_to_vendor BOOLEAN DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cod_ledger (
    id VARCHAR(32) PRIMARY KEY,
    delivery_id VARCHAR(32) NOT NULL,
    rider_id VARCHAR(32) NOT NULL,
    gross_cod DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    net_vendor_payout DECIMAL(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'held_by_rider', -- held_by_rider, remitted_to_hq, paid_to_vendor
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP NULL
);

