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
    lat: 12.0035,
    lng: 8.5225,
    name: 'Kantin Kwari Textile Market',
    hausaName: 'Kasuwar Kantin Kwari',
    type: 'market',
    popularAnchors: ['Block B (Behind Access Bank)', 'Block D / Unity Road Gate', 'Standard Chartered junction', 'Gidan Sa\'adu'],
    category: 'Textiles & Fashion'
  },
  {
    id: 'singer-market',
    zoneId: 'Z1_CENTRAL',
    lat: 12.0075,
    lng: 8.5215,
    name: 'Singer Wholesale Market',
    hausaName: 'Kasuwar Singer',
    type: 'market',
    popularAnchors: ['Access Bank corner', 'Railway Track crossing', 'Falgore street junction', 'Yan Shinkafa gate'],
    category: 'FMCG & Provisions'
  },
  {
    id: 'sabon-gari',
    zoneId: 'Z1_CENTRAL',
    lat: 12.012,
    lng: 8.534,
    name: 'Sabon Gari Market',
    hausaName: 'Kasuwar Sabon Gari',
    type: 'market',
    popularAnchors: ['France Road gate', 'Igbo Road junction', 'Yan Kaba vegetable section', 'Main roundabout'],
    category: 'General Goods & Cosmetics'
  },
  {
    id: 'kofar-wambai',
    zoneId: 'Z1_CENTRAL',
    lat: 11.9985,
    lng: 8.512,
    name: 'Kofar Wambai Market',
    hausaName: 'Kasuwar Kofar Wambai',
    type: 'market',
    popularAnchors: ['Footwear section (Yan Takalma)', 'Second-hand clothes (Gwanjo)', 'Old Gate'],
    category: 'Footwear & Apparel'
  },
  {
    id: 'bata-fagge',
    zoneId: 'Z1_CENTRAL',
    lat: 12.009,
    lng: 8.53,
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
    lat: 11.969,
    lng: 8.533,
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
    lat: 11.976,
    lng: 8.542,
    name: 'Farm Centre GSM Village',
    hausaName: 'Kasuwar Wayoyi (Farm Centre)',
    type: 'commercial',
    popularAnchors: ['GSM Complex Gate 1', 'Mobil Filling Station T-Junction', 'Court Road link', 'Tech Plaza'],
    category: 'Phones & Gadgets'
  },
  {
    id: 'zoo-road',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    lat: 11.978,
    lng: 8.526,
    name: 'Zoo Road Commercial & Residential Corridor',
    hausaName: 'Hanyar Gidan Zoo',
    type: 'commercial',
    popularAnchors: ['Ado Bayero Mall / Shoprite', 'Sahad Stores (Zoo Rd branch)', 'Kano Zoo main gate', 'Trade Fair Complex'],
    category: 'Shopping, Groceries & Residences'
  },
  {
    id: 'post-office-murtala',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    lat: 11.995,
    lng: 8.537,
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
    lat: 11.933,
    lng: 8.542,
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
    lat: 12.001,
    lng: 8.547,
    name: 'Nassarawa GRA',
    hausaName: 'G.R.A Nassarawa',
    type: 'residential',
    popularAnchors: ['Coronation Hall', 'State Library', 'Race Course roundabout', 'Sultan Road', 'Bompai Link'],
    category: 'Executive Residential Estates'
  },
  {
    id: 'hotoro-gra',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.99,
    lng: 8.57,
    name: 'Hotoro (Hotoro GRA / NNPC Mega / Housing)',
    hausaName: 'Hotoro / Gidan Mai NNPC',
    type: 'residential',
    popularAnchors: ['NNPC Mega Station', 'Maiduguri Road Roundabout', 'Federal Housing Estate', 'Tishama Axis'],
    category: 'Residential Estates & Transit'
  },
  {
    id: 'tarauni-gra',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.962,
    lng: 8.55,
    name: 'Tarauni Residential & Market Axis',
    hausaName: 'Tarauni / Kasuwa',
    type: 'residential',
    popularAnchors: ['Government Technical College', 'Tarauni Market Junction', 'Maiduguri Road overhead bridge', 'Court Road link'],
    category: 'Residential Homes & Bakeries'
  },
  {
    id: 'janbulo-dorayi',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.973,
    lng: 8.48,
    name: 'Janbulo / Dorayi Residential Axis',
    hausaName: 'Janbulo / Dorayi',
    type: 'residential',
    popularAnchors: ['Janbulo Second Gate', 'Dorayi Karama Juma\'at Mosque', 'BUK Road Roundabout link', 'Federal Low Cost Estate'],
    category: 'Residential Estates & Home Boutiques'
  },
  {
    id: 'buk-new-campus',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.977,
    lng: 8.428,
    name: 'BUK New Campus (Gwarzo Road)',
    hausaName: 'Jami\'ar Bayero (Sabuwar Haraba)',
    type: 'campus',
    popularAnchors: ['Convocation Arena', 'Nana Hall hostel gate', 'Faculty of Tech', 'Staff Quarters gate'],
    category: 'University Campus & Hostels'
  },
  {
    id: 'buk-old-campus',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.984,
    lng: 8.473,
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
    lat: 11.98,
    lng: 8.44,
    name: 'Rijiyar Zaki (Gwarzo Road Axis)',
    hausaName: 'Rijiyar Zaki',
    type: 'residential',
    popularAnchors: ['BUK New Site Back Gate', 'Rijiyar Zaki Police Outpost', 'Kano State Poly Tech Annex'],
    category: 'Residential & Student Housing'
  },
  {
    id: 'kurna-rijiyar-lemo',
    zoneId: 'Z4_OUTER_RING',
    lat: 12.03,
    lng: 8.495,
    name: 'Kurna / Rijiyar Lemo (Katsina Road)',
    hausaName: 'Kurna / Rijiyar Lemo',
    type: 'residential',
    popularAnchors: ['Kurna Juma\'at Mosque', 'Katsina Road Overhead link', 'Rijiyar Lemo Primary School'],
    category: 'Residential Suburb'
  },
  {
    id: 'sharada-industrial',
    zoneId: 'Z4_OUTER_RING',
    lat: 11.96,
    lng: 8.495,
    name: 'Sharada Industrial Estate (Phase 1 & 2)',
    hausaName: 'Masana\'antar Sharada',
    type: 'industrial',
    popularAnchors: ['Panshekara Road junction', 'Phase 1 roundabout', 'Challawa railway bridge'],
    category: 'Industrial / Warehouses'
  },
  {
    id: 'dawanau-market',
    zoneId: 'Z4_OUTER_RING',
    lat: 12.07,
    lng: 8.47,
    name: 'Dawanau International Grains Market',
    hausaName: 'Kasuwar Dawanau',
    type: 'market',
    popularAnchors: ['Katsina Road Expressway gate', 'Central Grains Weighbridge', 'Trailer park'],
    category: 'Grains & Bulk Cargo'
  },
  {
    id: 'unguwa-uku',
    zoneId: 'Z4_OUTER_RING',
    lat: 11.95,
    lng: 8.53,
    name: 'Unguwa Uku Motor Park & Axis',
    hausaName: 'Tashar Unguwa Uku',
    type: 'commercial',
    popularAnchors: ['Zaria Road flyover', 'Inter-state Luxury bus park', 'Yan Awaki cattle link'],
    category: 'Logistics Hub & Transit'
  },
  {
    id: 'kurmi-market',
    zoneId: 'Z1_CENTRAL',
    lat: 11.9975,
    lng: 8.506,
    name: 'Kurmi Market (Old City)',
    hausaName: 'Kasuwar Kurmi',
    type: 'market',
    popularAnchors: ['Main gate', 'Leather & crafts section', 'Kofar Kudu road'],
    category: 'Crafts & General Goods'
  },
  {
    id: 'gidan-sarki',
    zoneId: 'Z1_CENTRAL',
    lat: 11.9935,
    lng: 8.5175,
    name: 'Emir\'s Palace / Kofar Kudu',
    hausaName: 'Gidan Sarki',
    type: 'commercial',
    popularAnchors: ['Kofar Kudu', 'Central Mosque', 'Kano Museum'],
    category: 'Old City'
  },
  {
    id: 'kofar-mata',
    zoneId: 'Z1_CENTRAL',
    lat: 11.9905,
    lng: 8.5065,
    name: 'Kofar Mata (Dye Pits)',
    hausaName: 'Kofar Mata',
    type: 'commercial',
    popularAnchors: ['Dye pits', 'Kofar Mata stadium', 'Kofar Mata junction'],
    category: 'Old City'
  },
  {
    id: 'gwammaja',
    zoneId: 'Z1_CENTRAL',
    lat: 12.006,
    lng: 8.505,
    name: 'Gwammaja',
    hausaName: 'Gwammaja',
    type: 'residential',
    popularAnchors: ['Gwammaja mosque', 'Dala road'],
    category: 'Old City Residential'
  },
  {
    id: 'dala',
    zoneId: 'Z1_CENTRAL',
    lat: 12.0015,
    lng: 8.4975,
    name: 'Dala / Dala Hill',
    hausaName: 'Dutsen Dala',
    type: 'residential',
    popularAnchors: ['Dala hill', 'Dala market', 'Kofar Dawanau road'],
    category: 'Old City Residential'
  },
  {
    id: 'bompai',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    lat: 12.02,
    lng: 8.55,
    name: 'Bompai (Police HQ / Industrial)',
    hausaName: 'Bompai',
    type: 'commercial',
    popularAnchors: ['Police HQ', 'Bompai industrial road', 'Airport road'],
    category: 'Industrial & Offices'
  },
  {
    id: 'gadon-kaya',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    lat: 11.977,
    lng: 8.506,
    name: 'Gadon Kaya',
    hausaName: 'Gadon Kaya',
    type: 'residential',
    popularAnchors: ['Gadon Kaya roundabout', 'Gadon Kaya market'],
    category: 'Residential'
  },
  {
    id: 'kofar-nassarawa',
    zoneId: 'Z2_COMMERCIAL_RESIDENTIAL',
    lat: 11.99,
    lng: 8.528,
    name: 'Kofar Nassarawa',
    hausaName: 'Kofar Nassarawa',
    type: 'commercial',
    popularAnchors: ['Kofar Nassarawa gate', 'State Road'],
    category: 'Commercial'
  },
  {
    id: 'yankatako',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.926,
    lng: 8.545,
    name: 'Naibawa Yankatako (Fimrash office)',
    hausaName: 'Yankatako',
    type: 'residential',
    popularAnchors: ['Fimrash office: Plot 124, Shop 3', 'Off Zaria Road', 'Yankatako market'],
    category: 'Residential'
  },
  {
    id: 'badawa',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 12.02,
    lng: 8.565,
    name: 'Badawa',
    hausaName: 'Badawa',
    type: 'residential',
    popularAnchors: ['Badawa layout', 'Badawa market'],
    category: 'Residential'
  },
  {
    id: 'dakata',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 12.04,
    lng: 8.57,
    name: 'Dakata',
    hausaName: 'Dakata',
    type: 'residential',
    popularAnchors: ['Dakata market', 'Kawaji road'],
    category: 'Residential'
  },
  {
    id: 'gwale',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.985,
    lng: 8.497,
    name: 'Gwale',
    hausaName: 'Gwale',
    type: 'residential',
    popularAnchors: ['Gwale LGA secretariat', 'Gwale market'],
    category: 'Residential'
  },
  {
    id: 'sheka',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.955,
    lng: 8.5,
    name: 'Sheka',
    hausaName: 'Sheka',
    type: 'residential',
    popularAnchors: ['Sheka roundabout', 'Sheka market'],
    category: 'Residential'
  },
  {
    id: 'mariri',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.94,
    lng: 8.565,
    name: 'Mariri',
    hausaName: 'Mariri',
    type: 'residential',
    popularAnchors: ['Mariri bypass', 'Mariri market'],
    category: 'Residential'
  },
  {
    id: 'panshekara',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.935,
    lng: 8.48,
    name: 'Panshekara',
    hausaName: 'Panshekara',
    type: 'residential',
    popularAnchors: ['Panshekara market', 'Madobi road'],
    category: 'Residential'
  },
  {
    id: 'jaen',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 11.98,
    lng: 8.485,
    name: 'Ja\'en',
    hausaName: 'Ja\'en',
    type: 'residential',
    popularAnchors: ['Ja\'en junction', 'Gwarzo road'],
    category: 'Residential'
  },
  {
    id: 'bachirawa',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 12.025,
    lng: 8.505,
    name: 'Bachirawa',
    hausaName: 'Bachirawa',
    type: 'residential',
    popularAnchors: ['Bachirawa market', 'Katsina road'],
    category: 'Residential'
  },
  {
    id: 'aminu-kano-airport',
    zoneId: 'Z3_RESIDENTIAL_METRO',
    lat: 12.0476,
    lng: 8.5246,
    name: 'Mallam Aminu Kano Airport',
    hausaName: 'Filin Jirgin Sama',
    type: 'commercial',
    popularAnchors: ['Departure gate', 'Cargo terminal', 'Airport road'],
    category: 'Transport Hub'
  },
  {
    id: 'challawa',
    zoneId: 'Z4_OUTER_RING',
    lat: 11.9,
    lng: 8.48,
    name: 'Challawa Industrial Estate',
    hausaName: 'Challawa',
    type: 'commercial',
    popularAnchors: ['Industrial estate gate', 'Challawa road'],
    category: 'Industrial'
  },
  {
    id: 'kumbotso',
    zoneId: 'Z4_OUTER_RING',
    lat: 11.89,
    lng: 8.505,
    name: 'Kumbotso',
    hausaName: 'Kumbotso',
    type: 'residential',
    popularAnchors: ['Kumbotso LGA secretariat', 'Zaria road'],
    category: 'Residential'
  }
];

export const getLandmark = (id) => KANO_LANDMARKS.find(l => l.id === id) || null;

// Pricing lives in lib/pricing.js (mirrors backend/src/Pricing.php).
// "Other area" bookings pick the nearest known area for pricing; OTHER_AREA is its select value.
export const OTHER_AREA = 'other';
