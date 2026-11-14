import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import LiveTracking from './components/LiveTracking';
import RiderConsole from './components/RiderConsole';
import ReconciliationHub from './components/ReconciliationHub';
import AuthGate from './components/AuthGate';
import { KANO_LANDMARKS } from './data/kanoLandmarks';

// Initial realistic Kano intra-state pilot orders
const INITIAL_DELIVERIES = [
  {
    id: 'del_101',
    trackingCode: 'FMR-KN-2849',
    otpCode: '7214',
    status: 'arrived',
    senderName: 'Al-Ihsan Textiles',
    senderPhone: '08031112233',
    senderLandmark: KANO_LANDMARKS.find(l => l.id === 'kwari-textiles'),
    senderDetail: 'Block B, Line 4, Shop 18',
    recipientName: 'Hajiya Maryam S. Danbatta',
    recipientPhone: '08156661246',
    recipientLandmark: KANO_LANDMARKS.find(l => l.id === 'nassarawa-gra'),
    recipientDetail: 'House No. 12, Coronation Hall Road, Nassarawa GRA',
    itemCategory: 'Fabrics & Fashion',
    itemDescription: '3 bundles Super-Magnum Shadda lace',
    isCod: true,
    itemValue: 18500,
    deliveryFee: 1200,
    netVendorPayout: 17300,
    vendorSettled: false,
    assignedRider: {
      name: 'Musa Garba (Rider #04)',
      phone: '08156661246',
      bikeNumber: 'KN-942-TRN'
    },
    createdAt: '11:15 AM'
  },
  {
    id: 'del_102',
    trackingCode: 'FMR-KN-4105',
    otpCode: '5820',
    status: 'in_transit',
    senderName: 'Apex Mobile Hub',
    senderPhone: '08022223344',
    senderLandmark: KANO_LANDMARKS.find(l => l.id === 'farm-centre'),
    senderDetail: 'GSM Village Complex, Gate 1, Shop 09',
    recipientName: 'Usman Farouk',
    recipientPhone: '08077778899',
    recipientLandmark: KANO_LANDMARKS.find(l => l.id === 'buk-new-campus'),
    recipientDetail: 'Nana Hall Hostel Gate, BUK New Campus',
    itemCategory: 'Phones & Gadgets',
    itemDescription: 'Samsung Galaxy A15 Screen Replacement & Charger',
    isCod: false,
    itemValue: 0,
    deliveryFee: 1400,
    netVendorPayout: 0,
    vendorSettled: true,
    assignedRider: {
      name: 'Musa Garba (Rider #04)',
      phone: '08156661246',
      bikeNumber: 'KN-942-TRN'
    },
    createdAt: '12:30 PM'
  },
  {
    id: 'del_103',
    trackingCode: 'FMR-KN-1932',
    otpCode: '9041',
    status: 'delivered',
    senderName: 'Singer FMCG Direct',
    senderPhone: '08099990011',
    senderLandmark: KANO_LANDMARKS.find(l => l.id === 'singer-market'),
    senderDetail: 'Access Bank Corner, Stall 3',
    recipientName: 'Dr. Kabiru Aliyu',
    recipientPhone: '08055556677',
    recipientLandmark: KANO_LANDMARKS.find(l => l.id === 'zoo-road'),
    recipientDetail: 'Beside Sahad Stores, Zoo Road',
    itemCategory: 'Provisions & Groceries',
    itemDescription: '2 cartons imported beverage powders',
    isCod: true,
    itemValue: 24000,
    deliveryFee: 900,
    netVendorPayout: 23100,
    vendorSettled: true,
    assignedRider: {
      name: 'Ibrahim Aliyu (Rider #02)',
      phone: '08012345678',
      bikeNumber: 'KN-118-GWL'
    },
    createdAt: '09:40 AM'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'booking';
  });

  // Dark / Light Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fimrash_theme') || 'dark';
  });

  // Role-Based Auth User
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fimrash_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [deliveries, setDeliveries] = useState(() => {
    const saved = localStorage.getItem('fimrash_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });
  
  const [riderCashInHand, setRiderCashInHand] = useState(() => {
    const saved = localStorage.getItem('fimrash_rider_cash');
    return saved ? parseFloat(saved) : 0;
  });

  const [activeTrackingCode, setActiveTrackingCode] = useState(null);

  // Sync Theme to HTML class
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    localStorage.setItem('fimrash_theme', theme);
  }, [theme]);

  // Sync Auth User
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fimrash_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fimrash_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('fimrash_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('fimrash_rider_cash', riderCashInHand.toString());
  }, [riderCashInHand]);

  // Handlers
  const handleDeliveryCreated = (newDelivery) => {
    setDeliveries(prev => [newDelivery, ...prev]);
    setActiveTrackingCode(newDelivery.trackingCode);
  };

  const handleUpdateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { ...del, status: newStatus };
      }
      return del;
    }));
  };

  const handleVerifyOtpAndDeliver = (deliveryId, cashAmount) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { ...del, status: 'delivered', otpVerifiedAt: new Date().toLocaleTimeString() };
      }
      return del;
    }));

    if (cashAmount > 0) {
      setRiderCashInHand(prev => prev + cashAmount);
    }
  };

  const handleSettleVendorPayout = (deliveryId) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { ...del, vendorSettled: true };
      }
      return del;
    }));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (activeTab === 'rider' || activeTab === 'ledger') {
      setActiveTab('booking');
    }
  };

  const activeDeliveriesCount = deliveries.filter(d => d.status !== 'delivered').length;

  return (
    <div className="min-h-screen bg-ambient-grid text-slate-100 dark:text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDeliveriesCount={activeDeliveriesCount}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content with Mobile Bottom Padding for App Dock */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-28 md:pb-8 relative z-10">
        {/* Tab 1: Booking (Public) */}
        {activeTab === 'booking' && (
          <BookingForm onDeliveryCreated={handleDeliveryCreated} />
        )}

        {/* Tab 2: Tracking (Public) */}
        {activeTab === 'tracking' && (
          <LiveTracking
            deliveries={deliveries}
            activeTrackingCode={activeTrackingCode}
          />
        )}

        {/* Tab 3: Rider Console (Protected: Courier Only) */}
        {activeTab === 'rider' && (
          currentUser && (currentUser.role === 'rider' || currentUser.role === 'admin') ? (
            <RiderConsole
              deliveries={deliveries}
              onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
              onVerifyOtpAndDeliver={handleVerifyOtpAndDeliver}
            />
          ) : (
            <AuthGate
              targetRole="rider"
              onLoginSuccess={(user) => setCurrentUser(user)}
              theme={theme}
            />
          )
        )}

        {/* Tab 4: COD Settlement Hub (Protected: Operations Admin Only) */}
        {activeTab === 'ledger' && (
          currentUser && currentUser.role === 'admin' ? (
            <ReconciliationHub
              deliveries={deliveries}
              riderCashInHand={riderCashInHand}
              onSettleVendorPayout={handleSettleVendorPayout}
            />
          ) : (
            <AuthGate
              targetRole="admin"
              onLoginSuccess={(user) => setCurrentUser(user)}
              theme={theme}
            />
          )
        )}
      </main>

      {/* Luxury Footer (Hidden or streamlined on small screens) */}
      <footer className="border-t border-white/5 dark:border-white/5 bg-slate-950/80 dark:bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-400 relative z-10 mb-14 md:mb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-black text-white dark:text-white tracking-tight">FIMRASH LOGISTICS SERVICES</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Kano Intra-State Metropolitan Mesh</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Hubs: Kantin Kwari • Singer • Farm Centre • Nassarawa GRA</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400 font-bold">Engineered by OrchidByte Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
