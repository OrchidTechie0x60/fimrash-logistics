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

// Fare calculation algorithm for Kano intra-state
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
    (pickup.id === 'farm-centre' && dropoff.id === 'gyadi-gyadi');

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
