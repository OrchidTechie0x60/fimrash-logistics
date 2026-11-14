import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import LiveTracking from './components/LiveTracking';
import RiderConsole from './components/RiderConsole';
import ReconciliationHub from './components/ReconciliationHub';
import AuthGate from './components/AuthGate';
import { KANO_LANDMARKS } from './data/kanoLandmarks';
import { 
  getDeliveriesApi, 
  createDeliveryApi, 
  updateDeliveryStatusApi, 
  verifyOtpApi, 
  remitRiderCashApi, 
  isBackendConnected 
} from './services/api';

// Standard Kano intra-state parcel deliveries (Courier delivery fee only)
const INITIAL_DELIVERIES = [
  {
    id: 'del_100',
    trackingCode: 'FMR-KN-1092',
    otpCode: '3419',
    status: 'in_transit',
    senderName: "Hafsat's Pastry & Cakes (Home Kitchen)",
    senderPhone: '08035557788',
    senderLandmark: KANO_LANDMARKS.find(l => l.id === 'gyadi-gyadi'),
    senderDetail: 'House No. 8, Behind Veterinary Clinic, Court Road, Gyadi-Gyadi',
    recipientName: 'Amina Sani',
    recipientPhone: '08144445566',
    recipientLandmark: KANO_LANDMARKS.find(l => l.id === 'naibawa'),
    recipientDetail: 'Near Jallaba Juma\'at Mosque, Yan Lemo, Naibawa',
    itemCategory: 'Cakes, Pastries & Bakes',
    itemDescription: '10-inch Red Velvet Birthday Cake (Keep Upright!)',
    paymentMode: 'pay_on_delivery',
    deliveryFee: 900,
    feeCollected: false,
    assignedRider: {
      name: 'Musa Garba (Rider #04)',
      phone: '08156661246',
      bikeNumber: 'KN-942-TRN'
    },
    createdAt: '01:15 PM'
  },
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
    itemCategory: 'Fabrics & Textiles',
    itemDescription: '3 bundles Super-Magnum Shadda lace',
    paymentMode: 'pay_on_delivery', // recipient pays courier fee on arrival
    deliveryFee: 1200,
    feeCollected: false,
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
    paymentMode: 'prepaid', // sender prepaid delivery fee
    deliveryFee: 1400,
    feeCollected: true,
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
    itemCategory: 'Food & Provisions',
    itemDescription: '2 cartons imported beverage powders',
    paymentMode: 'pay_on_delivery',
    deliveryFee: 900,
    feeCollected: true,
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
    const saved = localStorage.getItem('fimrash_deliveries_v2');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });
  
  // Courier delivery fee cash held in rider pouch
  const [riderCashInHand, setRiderCashInHand] = useState(() => {
    const saved = localStorage.getItem('fimrash_rider_cash_v2');
    return saved ? parseFloat(saved) : 900;
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
    localStorage.setItem('fimrash_deliveries_v2', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('fimrash_rider_cash_v2', riderCashInHand.toString());
  }, [riderCashInHand]);

  // On Mount: Sync with Whogohost MySQL API if configured
  useEffect(() => {
    async function syncBackendData() {
      if (isBackendConnected()) {
        const res = await getDeliveriesApi(deliveries);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(d => ({
            id: d.id,
            trackingCode: d.tracking_code || d.trackingCode,
            otpCode: d.otp_code || d.otpCode,
            status: d.status || 'pending',
            senderType: d.sender_type || 'home',
            senderName: d.sender_name || d.senderName,
            senderPhone: d.sender_phone || d.senderPhone,
            senderLandmark: typeof d.sender_landmark_id === 'string'
              ? (KANO_LANDMARKS.find(l => l.id === d.sender_landmark_id) || KANO_LANDMARKS[0])
              : d.senderLandmark,
            senderDetail: d.sender_landmark_detail || d.senderDetail,
            recipientType: d.recipient_type || 'home',
            recipientName: d.recipient_name || d.recipientName,
            recipientPhone: d.recipient_phone || d.recipientPhone,
            recipientLandmark: typeof d.recipient_landmark_id === 'string'
              ? (KANO_LANDMARKS.find(l => l.id === d.recipient_landmark_id) || KANO_LANDMARKS[6])
              : d.recipientLandmark,
            recipientDetail: d.recipient_landmark_detail || d.recipientDetail,
            itemCategory: d.item_category || d.itemCategory,
            itemDescription: d.item_description || d.itemDescription,
            isFragile: Boolean(d.is_fragile),
            paymentMode: d.payment_mode || d.paymentMode,
            deliveryFee: parseFloat(d.delivery_fee || d.deliveryFee || 1000),
            feeCollected: Boolean(d.cod_collected_by_rider),
            assignedRider: {
              name: 'Musa Garba (Rider #04)',
              phone: '08156661246',
              bikeNumber: 'KN-942-TRN'
            },
            createdAt: d.created_at ? new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'
          }));
          setDeliveries(mapped);
        }
      }
    }
    syncBackendData();
  }, []);

  // Handlers with Whogohost API sync
  const handleDeliveryCreated = async (newDelivery) => {
    setDeliveries(prev => [newDelivery, ...prev]);
    setActiveTrackingCode(newDelivery.trackingCode);
    await createDeliveryApi(newDelivery);
  };

  const handleUpdateDeliveryStatus = async (deliveryId, newStatus) => {
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { ...del, status: newStatus };
      }
      return del;
    }));
    await updateDeliveryStatusApi(deliveryId, newStatus);
  };

  const handleVerifyOtpAndDeliver = async (deliveryId, feeToCollect) => {
    const target = deliveries.find(d => d.id === deliveryId);
    setDeliveries(prev => prev.map(del => {
      if (del.id === deliveryId) {
        return { 
          ...del, 
          status: 'delivered', 
          feeCollected: true,
          otpVerifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
      }
      return del;
    }));

    if (feeToCollect > 0) {
      setRiderCashInHand(prev => prev + feeToCollect);
    }

    if (target) {
      await verifyOtpApi(deliveryId, target.otpCode);
    }
  };

  // Station Manager reconciles and collects physical cash from riders
  const handleRemitRiderCash = async () => {
    setRiderCashInHand(0);
    await remitRiderCashApi();
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

      {/* Main Content Area offset by the permanent vertical left sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 lg:pl-72 transition-all">
        <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8 relative z-10">
          {/* Tab 1: Booking Form (Public - Standard Sized) */}
          {activeTab === 'booking' && (
            <BookingForm onDeliveryCreated={handleDeliveryCreated} />
          )}

          {/* Tab 2: Live Tracking (Public) */}
          {activeTab === 'tracking' && (
            <LiveTracking
              deliveries={deliveries}
              activeTrackingCode={activeTrackingCode}
            />
          )}

          {/* Tab 3: Courier Console (Protected: Courier Only) */}
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

          {/* Tab 4: Delivery Ledger & Cash Vault (Protected: Station Admin Only) */}
          {activeTab === 'ledger' && (
            currentUser && currentUser.role === 'admin' ? (
              <ReconciliationHub
                deliveries={deliveries}
                riderCashInHand={riderCashInHand}
                onRemitRiderCash={handleRemitRiderCash}
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

        {/* Calm Institutional Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-500 dark:text-slate-400 relative z-10 mb-14 md:mb-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">FIMRASH LOGISTICS SERVICES</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>Kano Intra-State Goods &amp; Parcel Dispatch</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span>Hubs: Gyadi-Gyadi • Naibawa • Kwari • BUK</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Engineered by OrchidByte Solutions</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
