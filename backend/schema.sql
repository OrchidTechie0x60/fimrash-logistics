-- Fimrash Logistics Services - Kano Metropolis Intra-State Platform
-- Database Schema & Seed Data (MySQL & SQLite Compatible)

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
    sender_landmark_detail VARCHAR(255),
    
    recipient_type VARCHAR(32) DEFAULT 'home', -- home, market, office
    recipient_name VARCHAR(128) NOT NULL,
    recipient_phone VARCHAR(32) NOT NULL,
    recipient_landmark_id VARCHAR(64) NOT NULL,
    recipient_landmark_detail VARCHAR(255),
    
    item_category VARCHAR(64) NOT NULL,
    item_description VARCHAR(255),
    is_fragile BOOLEAN DEFAULT 0,
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

-- Seed Initial Zones
INSERT OR IGNORE INTO zones (id, name, description, base_fare) VALUES
('Z1_CENTRAL', 'Zone 1: Central Commercial Core', 'Kantin Kwari, Singer, Sabon Gari, Fagge, Kofar Wambai, Bata', 800.00),
('Z2_COMMERCIAL_RESIDENTIAL', 'Zone 2: Midtown & Home Enterprise Corridors', 'Gyadi-Gyadi, Court Road, Farm Centre, Zoo Road, Post Office Rd', 900.00),
('Z3_RESIDENTIAL_METRO', 'Zone 3: Metro Residential, Estates & Campuses', 'Naibawa, Nassarawa GRA, Tarauni, Hotoro GRA, Janbulo, BUK Campuses', 1100.00),
('Z4_OUTER_RING', 'Zone 4: Outer Ring & Industrial Areas', 'Sharada I & II, Challawa, Dawanau Grains Market, Unguwa Uku, Rijiyar Zaki', 1500.00);

-- Seed Fleet Couriers Across Kano Metro Corridors
INSERT OR IGNORE INTO riders (id, name, phone, bike_number, active_zone, status, cash_in_hand) VALUES
('rider_01', 'Ibrahim Aliyu', '08012345678', 'KN-118-GWL', 'Z1_CENTRAL', 'available', 0.00),
('rider_02', 'Aminu Bello', '08023456789', 'KN-553-KMC', 'Z2_COMMERCIAL_RESIDENTIAL', 'available', 0.00),
('rider_03', 'Sani Usman', '08034567890', 'KN-781-TRN', 'Z3_RESIDENTIAL_METRO', 'available', 0.00),
('rider_04', 'Musa Garba', '08156661246', 'KN-942-TRN', 'Z2_COMMERCIAL_RESIDENTIAL', 'available', 900.00),
('rider_05', 'Lawan Haruna', '08056789012', 'KN-320-DGW', 'Z4_OUTER_RING', 'available', 0.00);
