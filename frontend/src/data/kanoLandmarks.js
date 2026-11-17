// Kano Metropolitan Commercial Landmark & Residential Hub Registry
// Grounded in Kano commerce: Markets, Home Businesses, Residential GRAs & Campuses

export const KANO_ZONES = [
  {
    id: 'Z1_CENTRAL',
    name: 'Zone 1: Central Commercial Core',
    description: 'Kantin Kwari, Singer, Sabon Gari, Fagge, Kofar Wambai, Bata',
    baseFare: 800,
    transitTime: '20-40 mins'
  },
  {
    id: 'Z2_COMMERCIAL_RESIDENTIAL',
    name: 'Zone 2: Midtown & Home Enterprise Corridors',
    description: 'Gyadi-Gyadi, Court Road, Farm Centre, Zoo Road, Post Office Rd',
    baseFare: 900,
    transitTime: '25-45 mins'
  },
  {
    id: 'Z3_RESIDENTIAL_METRO',
    name: 'Zone 3: Metro Residential, Estates & Campuses',
    description: 'Naibawa, Nassarawa GRA, Tarauni, Hotoro GRA, Janbulo, BUK Campuses',
    baseFare: 1100,
    transitTime: '30-55 mins'
  },
  {
    id: 'Z4_OUTER_RING',
    name: 'Zone 4: Outer Ring & Industrial Areas',
    description: 'Sharada I & II, Challawa, Dawanau Grains Market, Unguwa Uku, Rijiyar Zaki',
    baseFare: 1500,
    transitTime: '45-75 mins'
  }
];

export const KANO_LANDMARKS = [
  // Zone 1: Central Commercial Core
  {
    id: 'kwari-textiles',
    zoneId: 'Z1_CENTRAL',
    name: 'Kantin Kwari Textile Market',
    hausaName: 'Kasuwar Kantin Kwari',
    type: 'market',
    popularAnchors: ['Block B (Behind Access Bank)', 'Block D / Unity Road Gate', 'Standard Chartered junction', 'Gidan Sa\'adu'],
    category: 'Textiles & Fashion'
  },
  {
    id: 'singer-market',
    zoneId: 'Z1_CENTRAL',
    name: 'Singer Wholesale Market',
    hausaName: 'Kasuwar Singer',
    type: 'market',
    popularAnchors: ['Access Bank corner', 'Railway Track crossing', 'Falgore street junction', 'Yan Shinkafa gate'],
    category: 'FMCG & Provisions'
  },
  {
    id: 'sabon-gari',
    zoneId: 'Z1_CENTRAL',
    name: 'Sabon Gari Market',
    hausaName: 'Kasuwar Sabon Gari',
    type: 'market',
    popularAnchors: ['France Road gate', 'Igbo Road junction', 'Yan Kaba vegetable section', 'Main roundabout'],
    category: 'General Goods & Cosmetics'
  },
  {
    id: 'kofar-wambai',
    zoneId: 'Z1_CENTRAL',
    name: 'Kofar Wambai Market',
    hausaName: 'Kasuwar Kofar Wambai',
    type: 'market',
    popularAnchors: ['Footwear section (Yan Takalma)', 'Second-hand clothes (Gwanjo)', 'Old Gate'],
    category: 'Footwear & Apparel'
  },
  {
    id: 'bata-fagge',
    zoneId: 'Z1_CENTRAL',
    name: 'Bata / Fagge Commercial Axis',
    hausaName: 'Fagge / Bata',
    type: 'commercial',
    popularAnchors: ['Bata Roundabout', 'Ibrahim Taiwo Road', 'Fagge Mosque plaza'],
    category: 'Retail & Electronics'
  },

  // Zone 2: Midtown & Home Enterprise Corridors
  {
    id: 'gyadi-gyadi',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    name: 'Gyadi-Gyadi (Court Road / Zaria Bypass)',
    hausaName: 'Gyadi-Gyadi / Titin Kotu',
    type: 'residential',
    popularAnchors: [
      'Court Road Veterinary Clinic',
      'Behind Total Filling Station',
      'Federal High Court Axis',
      'Gidan Mai Zaria Road Bypass',
      'Al-Hasanat Residential Quarters'
    ],
    category: 'Home Bakeries, Caterers & Residential'
  },
  {
    id: 'farm-centre',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    name: 'Farm Centre GSM Village',
    hausaName: 'Kasuwar Wayoyi (Farm Centre)',
    type: 'commercial',
    popularAnchors: ['GSM Complex Gate 1', 'Mobil Filling Station T-Junction', 'Court Road link', 'Tech Plaza'],
    category: 'Phones & Gadgets'
  },
  {
    id: 'zoo-road',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    name: 'Zoo Road Commercial & Residential Corridor',
    hausaName: 'Hanyar Gidan Zoo',
    type: 'commercial',
    popularAnchors: ['Ado Bayero Mall / Shoprite', 'Sahad Stores (Zoo Rd branch)', 'Kano Zoo main gate', 'Trade Fair Complex'],
    category: 'Shopping, Groceries & Residences'
  },
  {
    id: 'post-office-murtala',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    name: 'Murtala Muhammad Way / Post Office',
    hausaName: 'Hanyar Murtala',
    type: 'commercial',
    popularAnchors: ['General Post Office', 'Central Bank (CBN) old office', 'Bristol Palace axis'],
    category: 'Corporate & Banking'
  },

  // Zone 3: Metro Residential, Estates & Campuses
  {
    id: 'naibawa',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'Naibawa (Yan Lemo / Flyover / Residential)',
    hausaName: 'Naibawa / Tashar Yan Lemo',
    type: 'residential',
    popularAnchors: [
      'Yan Lemo Fruit & Produce Market',
      'Naibawa Flyover / Zaria Road',
      'Tashar Motocin Kudu (Southern Motor Park)',
      'Jallaba Juma\'at Mosque',
      'Eastern Bypass Link'
    ],
    category: 'Residential Homes & Fruit Wholesale'
  },
  {
    id: 'nassarawa-gra',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'Nassarawa GRA',
    hausaName: 'G.R.A Nassarawa',
    type: 'residential',
    popularAnchors: ['Coronation Hall', 'State Library', 'Race Course roundabout', 'Sultan Road', 'Bompai Link'],
    category: 'Executive Residential Estates'
  },
  {
    id: 'hotoro-gra',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'Hotoro (Hotoro GRA / NNPC Mega / Housing)',
    hausaName: 'Hotoro / Gidan Mai NNPC',
    type: 'residential',
    popularAnchors: ['NNPC Mega Station', 'Maiduguri Road Roundabout', 'Federal Housing Estate', 'Tishama Axis'],
    category: 'Residential Estates & Transit'
  },
  {
    id: 'tarauni-gra',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'Tarauni Residential & Market Axis',
    hausaName: 'Tarauni / Kasuwa',
    type: 'residential',
    popularAnchors: ['Government Technical College', 'Tarauni Market Junction', 'Maiduguri Road overhead bridge', 'Court Road link'],
    category: 'Residential Homes & Bakeries'
  },
  {
    id: 'janbulo-dorayi',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'Janbulo / Dorayi Residential Axis',
    hausaName: 'Janbulo / Dorayi',
    type: 'residential',
    popularAnchors: ['Janbulo Second Gate', 'Dorayi Karama Juma\'at Mosque', 'BUK Road Roundabout link', 'Federal Low Cost Estate'],
    category: 'Residential Estates & Home Boutiques'
  },
  {
    id: 'buk-new-campus',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'BUK New Campus (Gwarzo Road)',
    hausaName: 'Jami\'ar Bayero (Sabuwar Haraba)',
    type: 'campus',
    popularAnchors: ['Convocation Arena', 'Nana Hall hostel gate', 'Faculty of Tech', 'Staff Quarters gate'],
    category: 'University Campus & Hostels'
  },
  {
    id: 'buk-old-campus',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    name: 'BUK Old Campus (Kabuga / BUK Rd)',
    hausaName: 'Jami\'ar Bayero (Tsohuwar Haraba)',
    type: 'campus',
    popularAnchors: ['Old Library roundabout', 'Kabuga Gate', 'Sports Complex', 'Faculty of Medicine'],
    category: 'University Campus'
  },

  // Zone 4: Outer Ring & Industrial Areas
  {
    id: 'rijiyar-zaki',
    zoneId: 'Z4_OUTER_RING',
    name: 'Rijiyar Zaki (Gwarzo Road Axis)',
    hausaName: 'Rijiyar Zaki',
    type: 'residential',
    popularAnchors: ['BUK New Site Back Gate', 'Rijiyar Zaki Police Outpost', 'Kano State Poly Tech Annex'],
    category: 'Residential & Student Housing'
  },
  {
    id: 'kurna-rijiyar-lemo',
    zoneId: 'Z4_OUTER_RING',
    name: 'Kurna / Rijiyar Lemo (Katsina Road)',
    hausaName: 'Kurna / Rijiyar Lemo',
    type: 'residential',
    popularAnchors: ['Kurna Juma\'at Mosque', 'Katsina Road Overhead link', 'Rijiyar Lemo Primary School'],
    category: 'Residential Suburb'
  },
  {
    id: 'sharada-industrial',
    zoneId: 'Z4_OUTER_RING',
    name: 'Sharada Industrial Estate (Phase 1 & 2)',
    hausaName: 'Masana\'antar Sharada',
    type: 'industrial',
    popularAnchors: ['Panshekara Road junction', 'Phase 1 roundabout', 'Challawa railway bridge'],
    category: 'Industrial / Warehouses'
  },
  {
    id: 'dawanau-market',
    zoneId: 'Z4_OUTER_RING',
    name: 'Dawanau International Grains Market',
    hausaName: 'Kasuwar Dawanau',
    type: 'market',
    popularAnchors: ['Katsina Road Expressway gate', 'Central Grains Weighbridge', 'Trailer park'],
    category: 'Grains & Bulk Cargo'
  },
  {
    id: 'unguwa-uku',
    zoneId: 'Z4_OUTER_RING',
    name: 'Unguwa Uku Motor Park & Axis',
    hausaName: 'Tashar Unguwa Uku',
    type: 'commercial',
    popularAnchors: ['Zaria Road flyover', 'Inter-state Luxury bus park', 'Yan Awaki cattle link'],
    category: 'Logistics Hub & Transit'
  }
];

export const getLandmark = (id) => KANO_LANDMARKS.find(l => l.id === id) || null;

// Fare calculation algorithm for Kano intra-state.
// Display-only estimate: the server (backend/src/Pricing.php) is authoritative and
// backend/tests/fare_parity.php fails if the two ever disagree.
export function calculateDeliveryFare(pickupLandmarkId, dropoffLandmarkId) {
  const pickup = KANO_LANDMARKS.find(l => l.id === pickupLandmarkId);
  const dropoff = KANO_LANDMARKS.find(l => l.id === dropoffLandmarkId);

  if (!pickup || !dropoff) return 1000;

  // Same landmark or immediate neighborhood
  if (pickup.id === dropoff.id) return 600;

  // Neighboring residential corridors (e.g. Gyadi-Gyadi <-> Naibawa, or Tarauni <-> Hotoro)
  const isCloseResidentialPair = 
    (pickup.id === 'gyadi-gyadi' && dropoff.id === 'naibawa') ||
    (pickup.id === 'naibawa' && dropoff.id === 'gyadi-gyadi') ||
    (pickup.id === 'tarauni-gra' && dropoff.id === 'hotoro-gra') ||
    (pickup.id === 'hotoro-gra' && dropoff.id === 'tarauni-gra') ||
    (pickup.id === 'gyadi-gyadi' && dropoff.id === 'tarauni-gra') ||
    (pickup.id === 'tarauni-gra' && dropoff.id === 'gyadi-gyadi') ||
    (pickup.id === 'farm-centre' && dropoff.id === 'gyadi-gyadi') ||
    (pickup.id === 'gyadi-gyadi' && dropoff.id === 'farm-centre');

  if (isCloseResidentialPair) {
    return 900; // Flat ₦900 for immediate neighborhood home deliveries!
  }

  // Same zone
  if (pickup.zoneId === dropoff.zoneId) {
    if (pickup.zoneId === 'Z1_CENTRAL') return 800;
    if (pickup.zoneId === 'Z2_COMMERCIAL_RESIDENTIAL') return 900;
    if (pickup.zoneId === 'Z3_RESIDENTIAL_METRO') return 1000;
    return 1200;
  }

  // Cross-zone pricing matrix
  const zoneWeights = {
    'Z1_CENTRAL': 1.0,
    'Z2_COMMERCIAL_RESIDENTIAL': 1.1,
    'Z3_RESIDENTIAL_METRO': 1.3,
    'Z4_OUTER_RING': 1.7
  };

  const pWeight = zoneWeights[pickup.zoneId] || 1;
  const dWeight = zoneWeights[dropoff.zoneId] || 1;
  const combined = (pWeight + dWeight) / 2;

  // Base fee rounded to nearest 50 Naira
  const estimated = Math.round((850 * combined) / 50) * 50;
  return Math.max(800, Math.min(2200, estimated));
}

// Route distance & transit time estimator for Kano corridors
export function calculateRouteMetrics(pickupLandmarkId, dropoffLandmarkId) {
  const pickup = KANO_LANDMARKS.find(l => l.id === pickupLandmarkId);
  const dropoff = KANO_LANDMARKS.find(l => l.id === dropoffLandmarkId);

  if (!pickup || !dropoff) {
    return { distanceKm: 4.5, estMinutes: 25, corridor: 'Metropolitan Direct' };
  }

  if (pickup.id === dropoff.id) {
    return { distanceKm: 1.2, estMinutes: 12, corridor: 'Local Neighborhood' };
  }

  const key = `${pickup.id}_${dropoff.id}`;
  const reverseKey = `${dropoff.id}_${pickup.id}`;

  const customMatrix = {
    'gyadi-gyadi_naibawa': { km: 4.2, mins: 22, corridor: 'Zaria Road Corridor' },
    'gyadi-gyadi_hotoro-gra': { km: 6.8, mins: 28, corridor: 'Maiduguri Road Bypass' },
    'gyadi-gyadi_tarauni-gra': { km: 3.1, mins: 15, corridor: 'Court Road / Tarauni' },
    'kwari-textiles_nassarawa-gra': { km: 5.4, mins: 25, corridor: 'State Road Arterial' },
    'farm-centre_zoo-road': { km: 3.8, mins: 18, corridor: 'Trade Fair Complex Link' },
    'tarauni-gra_buk-new-campus': { km: 11.2, mins: 40, corridor: 'BUK Road Expressway' },
    'singer-market_zoo-road': { km: 4.9, mins: 24, corridor: 'Ibrahim Taiwo Arterial' },
    'sabon-gari_buk-new-campus': { km: 13.5, mins: 45, corridor: 'Katsina / BUK Link' },
    'kwari-textiles_farm-centre': { km: 4.6, mins: 22, corridor: 'Bata / Post Office Rd' },
    'hotoro-gra_naibawa': { km: 5.2, mins: 25, corridor: 'Eastern Ring Road Link' },
  };

  if (customMatrix[key]) {
    return {
      distanceKm: customMatrix[key].km,
      estMinutes: customMatrix[key].mins,
      corridor: customMatrix[key].corridor
    };
  }
  if (customMatrix[reverseKey]) {
    return {
      distanceKm: customMatrix[reverseKey].km,
      estMinutes: customMatrix[reverseKey].mins,
      corridor: customMatrix[reverseKey].corridor
    };
  }

  // Zone distance approximation
  let km = 5.5;
  let mins = 30;
  if (pickup.zoneId === dropoff.zoneId) {
    km = 3.6;
    mins = 20;
  } else if (pickup.zoneId === 'Z4_OUTER_RING' || dropoff.zoneId === 'Z4_OUTER_RING') {
    km = 12.8;
    mins = 48;
  } else {
    km = 7.5;
    mins = 35;
  }

  return {
    distanceKm: km,
    estMinutes: mins,
    corridor: `${pickup.name.split(' ')[0]} ⇄ ${dropoff.name.split(' ')[0]} Axis`
  };
}
