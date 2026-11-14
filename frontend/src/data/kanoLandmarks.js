// Kano Metropolitan Commercial Landmark Registry & Zone Matrix
// Grounded in Kano commercial trade patterns (Textile, FMCG, Tech, Residential)

export const KANO_ZONES = [
  {
    id: 'Z1_CENTRAL',
    name: 'Zone 1: Central Commercial Core',
    description: 'Kantin Kwari, Singer, Sabon Gari, Fagge, Kofar Wambai, Bata',
    baseFare: 800,
    transitTime: '20-40 mins'
  },
  {
    id: 'Z2_COMMERCIAL_TECH',
    name: 'Zone 2: Business & Tech Hubs',
    description: 'Farm Centre GSM Village, Zoo Road, Court Road, Post Office Rd',
    baseFare: 1000,
    transitTime: '25-45 mins'
  },
  {
    id: 'Z3_RESIDENTIAL_GRA',
    name: 'Zone 3: Prime Residential & Institutions',
    description: 'Nassarawa GRA, Tarauni, Hotoro GRA, BUK Old & New Campus',
    baseFare: 1200,
    transitTime: '30-55 mins'
  },
  {
    id: 'Z4_INDUSTRIAL_OUTER',
    name: 'Zone 4: Industrial & Outer Ring',
    description: 'Sharada I & II, Challawa, Dawanau Grains Market, Unguwa Uku',
    baseFare: 1600,
    transitTime: '45-75 mins'
  }
];

export const KANO_LANDMARKS = [
  // Zone 1: Central Commercial
  {
    id: 'kwari-textiles',
    zoneId: 'Z1_CENTRAL',
    name: 'Kantin Kwari Textile Market',
    hausaName: 'Kasuwar Kantin Kwari',
    popularAnchors: ['Block B (Behind Access Bank)', 'Block D / Unity Road Gate', 'Standard Chartered junction', 'Gidan Sa\'adu'],
    category: 'Textiles & Fashion'
  },
  {
    id: 'singer-market',
    zoneId: 'Z1_CENTRAL',
    name: 'Singer Wholesale Market',
    hausaName: 'Kasuwar Singer',
    popularAnchors: ['Access Bank corner', 'Railway Track crossing', 'Falgore street junction', 'Yan Shinkafa gate'],
    category: 'FMCG & Provisions'
  },
  {
    id: 'sabon-gari',
    zoneId: 'Z1_CENTRAL',
    name: 'Sabon Gari Market',
    hausaName: 'Kasuwar Sabon Gari',
    popularAnchors: ['France Road gate', 'Igbo Road junction', 'Yan Kaba vegetable section', 'Main roundabout'],
    category: 'General Goods & Cosmetics'
  },
  {
    id: 'kofar-wambai',
    zoneId: 'Z1_CENTRAL',
    name: 'Kofar Wambai Market',
    hausaName: 'Kasuwar Kofar Wambai',
    popularAnchors: ['Footwear section (Yan Takalma)', 'Second-hand clothes (Gwanjo)', 'Old Gate'],
    category: 'Footwear & Apparel'
  },
  {
    id: 'bata-fagge',
    zoneId: 'Z1_CENTRAL',
    name: 'Bata / Fagge Commercial Axis',
    hausaName: 'Fagge / Bata',
    popularAnchors: ['Bata Roundabout', 'Ibrahim Taiwo Road', 'Fagge Mosque plaza'],
    category: 'Retail & Electronics'
  },

  // Zone 2: Tech & Business Hubs
  {
    id: 'farm-centre',
    zoneId: 'Z2_COMMERCIAL_TECH',
    name: 'Farm Centre GSM Village',
    hausaName: 'Kasuwar Wayoyi (Farm Centre)',
    popularAnchors: ['GSM Complex Gate 1', 'Mobil Filling Station T-Junction', 'Court Road link', 'Tech Plaza'],
    category: 'Phones & Gadgets'
  },
  {
    id: 'zoo-road',
    zoneId: 'Z2_COMMERCIAL_TECH',
    name: 'Zoo Road Commercial Corridor',
    hausaName: 'Hanyar Gidan Zoo',
    popularAnchors: ['Ado Bayero Mall / Shoprite', 'Sahad Stores (Zoo Rd branch)', 'Kano Zoo main gate', 'Trade Fair Complex'],
    category: 'Shopping & Groceries'
  },
  {
    id: 'post-office-murtala',
    zoneId: 'Z2_COMMERCIAL_TECH',
    name: 'Murtala Muhammad Way / Post Office',
    hausaName: 'Hanyar Murtala',
    popularAnchors: ['General Post Office', 'Central Bank (CBN) old office', 'Bristol Palace axis'],
    category: 'Corporate & Banking'
  },

  // Zone 3: Residential & Universities
  {
    id: 'nassarawa-gra',
    zoneId: 'Z3_RESIDENTIAL_GRA',
    name: 'Nassarawa GRA',
    hausaName: 'G.R.A Nassarawa',
    popularAnchors: ['Coronation Hall', 'State Library', 'Race Course roundabout', 'Sultan Road', 'Bompai Link'],
    category: 'Executive Residential'
  },
  {
    id: 'buk-new-campus',
    zoneId: 'Z3_RESIDENTIAL_GRA',
    name: 'BUK New Campus (Gwarzo Road)',
    hausaName: 'Jami\'ar Bayero (Sabuwar Haraba)',
    popularAnchors: ['Convocation Arena', 'Nana Hall hostel gate', 'Faculty of Tech', 'Staff Quarters gate'],
    category: 'University Campus'
  },
  {
    id: 'buk-old-campus',
    zoneId: 'Z3_RESIDENTIAL_GRA',
    name: 'BUK Old Campus (Kabuga / BUK Rd)',
    hausaName: 'Jami\'ar Bayero (Tsohuwar Haraba)',
    popularAnchors: ['Old Library roundabout', 'Kabuga Gate', 'Sports Complex'],
    category: 'University Campus'
  },
  {
    id: 'hotoro-gra',
    zoneId: 'Z3_RESIDENTIAL_GRA',
    name: 'Hotoro GRA / NNPC Mega',
    hausaName: 'Hotoro',
    popularAnchors: ['NNPC Mega Station', 'Maiduguri Road Roundabout', 'Federal Housing Estate'],
    category: 'Residential & Transit'
  },
  {
    id: 'tarauni-gra',
    zoneId: 'Z3_RESIDENTIAL_GRA',
    name: 'Tarauni Residential Axis',
    hausaName: 'Tarauni',
    popularAnchors: ['Government Technical College', 'Tarauni Market Junction', 'Maiduguri Road overhead bridge'],
    category: 'Residential'
  },

  // Zone 4: Industrial & Outer Ring
  {
    id: 'sharada-industrial',
    zoneId: 'Z4_INDUSTRIAL_OUTER',
    name: 'Sharada Industrial Estate (Phase 1 & 2)',
    hausaName: 'Masana\'antar Sharada',
    popularAnchors: ['Panshekara Road junction', 'Phase 1 roundabout', 'Challawa railway bridge'],
    category: 'Industrial / Warehouses'
  },
  {
    id: 'challawa-industrial',
    zoneId: 'Z4_INDUSTRIAL_OUTER',
    name: 'Challawa Industrial Area',
    hausaName: 'Masana\'antar Challawa',
    popularAnchors: ['Challawa Water Works', 'Tannery row', 'Kumbotso junction'],
    category: 'Industrial / Manufacturing'
  },
  {
    id: 'dawanau-market',
    zoneId: 'Z4_INDUSTRIAL_OUTER',
    name: 'Dawanau International Grains Market',
    hausaName: 'Kasuwar Dawanau',
    popularAnchors: ['Katsina Road Expressway gate', 'Central Grains Weighbridge', 'Trailer park'],
    category: 'Grains & Bulk Cargo'
  },
  {
    id: 'unguwa-uku',
    zoneId: 'Z4_INDUSTRIAL_OUTER',
    name: 'Unguwa Uku Motor Park & Axis',
    hausaName: 'Tashar Unguwa Uku',
    popularAnchors: ['Zaria Road flyover', 'Inter-state Luxury bus park', 'Yan Awaki cattle link'],
    category: 'Logistics Hub & Transit'
  }
];

// Fare calculation algorithm for Kano intra-state
export function calculateDeliveryFare(pickupLandmarkId, dropoffLandmarkId) {
  const pickup = KANO_LANDMARKS.find(l => l.id === pickupLandmarkId);
  const dropoff = KANO_LANDMARKS.find(l => l.id === dropoffLandmarkId);

  if (!pickup || !dropoff) return 1000;

  // Same landmark / same market complex
  if (pickup.id === dropoff.id) return 600;

  // Same zone
  if (pickup.zoneId === dropoff.zoneId) {
    if (pickup.zoneId === 'Z1_CENTRAL') return 800;
    if (pickup.zoneId === 'Z2_COMMERCIAL_TECH') return 900;
    return 1000;
  }

  // Cross-zone pricing matrix
  const zoneWeights = {
    'Z1_CENTRAL': 1,
    'Z2_COMMERCIAL_TECH': 1.2,
    'Z3_RESIDENTIAL_GRA': 1.4,
    'Z4_INDUSTRIAL_OUTER': 1.8
  };

  const pWeight = zoneWeights[pickup.zoneId] || 1;
  const dWeight = zoneWeights[dropoff.zoneId] || 1;
  const combined = (pWeight + dWeight) / 2;

  // Base fee rounded to nearest 50 Naira
  const estimated = Math.round((800 * combined) / 50) * 50;
  return Math.max(800, Math.min(2400, estimated));
}

