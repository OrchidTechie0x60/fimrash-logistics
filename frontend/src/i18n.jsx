// English / Hausa for the public pages. Hausa strings should be reviewed by a native speaker
// before launch; keys missing in Hausa fall back to English.
import React, { createContext, useContext, useEffect, useState } from 'react';

const STRINGS = {
  en: {
    'nav.send': 'Send',
    'nav.track': 'Track',
    'nav.desk': 'Desk',
    'lang.label': 'Language',

    'hero.title': 'Send it across Kano. Today.',
    'hero.lede': 'Same-day motorcycle courier between the landmarks you already know. Flat fares, a named rider, and a private code that only your recipient can give.',
    'hero.from': 'Pickup from',
    'hero.to': 'Deliver to',
    'hero.swap': 'Swap pickup and drop-off',
    'hero.fare': 'Fare (small parcel)',
    'hero.notListed': 'Area not listed? Type it on the booking page',
    'hero.eta': 'about {min} min',
    'hero.book': 'Book this pickup',
    'hero.mapHint': 'Tap two landmarks on the map, or choose them above.',
    'hero.mapTitle': 'Kano landmarks we serve',
    'hero.mapPickup': 'Pickup',
    'hero.mapDropoff': 'Drop-off',

    'track.title': 'Track a parcel',
    'track.placeholder': 'FMR-KN-7Q2X9A',
    'track.button': 'Track',
    'track.help': 'The code is on your SMS, WhatsApp message or printed waybill.',

    'how.title': 'How a parcel moves',
    'how.1.title': 'You book',
    'how.1.body': 'Choose two landmarks, see the fare, book in a minute. You get a waybill and a 4-digit handover code. No account needed.',
    'how.2.title': 'A rider collects',
    'how.2.body': 'The nearest on-duty rider picks up from your landmark. You see their name, plate and phone, and every step on the tracking page.',
    'how.3.title': 'The code completes it',
    'how.3.body': 'Your recipient checks the parcel, then gives the rider the code. No code, no delivery.',
    'how.photo': 'Photo coming soon',

    'code.title': 'The rider never sees the code.',
    'code.body': 'Only you and your recipient get the 4-digit handover code. The rider has to ask for it at the door, after the parcel has been checked. Five wrong tries and the delivery locks until the desk steps in.',
    'code.sender': 'Sender',
    'code.recipient': 'Recipient',
    'code.rider': 'Rider',
    'code.hidden': 'hidden',
    'code.sample': 'Example code',

    'fares.title': 'See the fare before you book',
    'fares.lede': 'Priced by road distance from where you send. These are small-parcel fares; bigger parcels, fragile items and cash-on-delivery handling add a little. No surge, no haggling.',
    'fares.from': 'Sending from',
    'fares.min': '{min} min',
    'fares.book': 'Book',
    'fares.zone.Z1_CENTRAL': 'Central markets',
    'fares.zone.Z2_COMMERCIAL_RESIDENTIAL': 'Midtown',
    'fares.zone.Z3_RESIDENTIAL_METRO': 'Residential & campuses',
    'fares.zone.Z4_OUTER_RING': 'Outer ring',
    'fares.same': 'Same area',

    'cod.title': 'Selling online? We collect for you.',
    'cod.body': 'Home bakers, caterers and traders can have the rider collect the item price on delivery. The station pays it back to you with a transfer reference.',
    'cod.cta': 'Book a cash-on-delivery parcel',

    'desk.title': 'Rather talk to someone?',
    'desk.body': 'Our dispatch desk books, tracks and sorts out problems by phone or WhatsApp.',
    'desk.hours': 'Every day, 7:30 AM – 9:00 PM',
    'desk.call': 'Call 0815 666 1246',
    'desk.whatsapp': 'WhatsApp the desk',
    'desk.whatsappText': 'Hello Fimrash, I want to send a parcel.',
    'desk.office': 'Our office:',

    'footer.tagline': 'Same-day courier across Kano metropolis.',
    'footer.built': 'Built by OrchidByte Solutions',
    'map.title': 'Route map',
    'map.approx': 'Approximate',
    'map.sub': 'Landmark-to-landmark route (not live GPS)',
    'map.distance': 'Distance:',
    'map.eta': 'Time:',
    'map.courier': 'Assigned courier',

    'tr.title': 'Track your parcel',
    'tr.lede': 'Status updates from your courier, refreshed automatically while your parcel is on the way.',
    'tr.mine': 'My bookings:',
    'tr.searching': 'Searching…',
    'tr.notFound': 'Waybill not found',
    'tr.notFoundBody': 'Check the code on your SMS, WhatsApp message or printed waybill.',
    'tr.loadError': 'Could not load tracking',
    'tr.empty': 'Enter your waybill code above to see where your parcel is.',
    'tr.plate': 'Plate: {plate}',
    'tr.call': 'Call {phone}',
    'tr.matching': 'We are matching your parcel with an available courier. Call the desk on 0815 666 1246 if it is urgent.',
    'tr.waybill': 'Waybill',
    'tr.fromTo': '{category} from {sender} to {recipient}',
    'tr.updated': 'Updated {time} · refresh',
    'tr.senderCode': 'Handover code (sender copy)',
    'tr.senderCodeNote': 'Share with the recipient only, never with the courier.',
    'tr.receiving': 'Receiving this parcel?',
    'tr.receivingBody': 'Your 4-digit handover code was sent to you by the sender or by SMS. Give it to the courier only after you have checked your parcel.',
    'tr.cancelled': 'This delivery was cancelled. Contact the sender or the Fimrash desk for details.',
    'tr.progress': 'Progress',
    'tr.from': 'From',
    'tr.to': 'To',
    'tr.booked': 'Booked {when}',
    'tr.deliveredAt': 'Delivered {when}',
    'tr.feeOnArrival': 'Delivery fee: pay on arrival',
    'tr.feePrepaid': 'Delivery fee: prepaid by sender',
    'tr.includesCod': 'Includes item price (CoD) of {amount}',
    'tr.payCash': 'Pay the courier in cash when you receive the parcel.',
    'tr.nothingToPay': 'Nothing to pay on delivery.',
    'tr.due': 'Due on handover',
    'tr.nothingDue': 'Nothing due',
    'step.pending': 'Booked', 'step.pending.d': 'Order logged',
    'step.assigned': 'Assigned', 'step.assigned.d': 'Courier matched',
    'step.picked_up': 'Picked up', 'step.picked_up.d': 'Parcel collected',
    'step.in_transit': 'In transit', 'step.in_transit.d': 'On the way',
    'step.arrived': 'Arrived', 'step.arrived.d': 'At your landmark',
    'step.delivered': 'Delivered', 'step.delivered.d': 'Handover complete',
    'status.pending': 'Awaiting courier', 'status.assigned': 'Courier assigned', 'status.picked_up': 'Picked up',
    'status.in_transit': 'In transit', 'status.arrived': 'At destination', 'status.delivered': 'Delivered', 'status.cancelled': 'Cancelled',
  },

  ha: {
    'nav.send': 'Aika',
    'nav.track': 'Bibiya',
    'nav.desk': 'Ofis',
    'lang.label': 'Harshe',

    'hero.title': 'Aika kayanka ko’ina a Kano. Yau.',
    'hero.lede': 'Jigilar babur a rana guda tsakanin wuraren da ka sani. Farashi sananne, mai babur mai suna, da lambar sirri da mai karɓa kaɗai zai bayar.',
    'hero.from': 'Ɗauka daga',
    'hero.to': 'Kai zuwa',
    'hero.swap': 'Musanya wurin ɗauka da na kaiwa',
    'hero.fare': 'Kuɗi (ƙaramin kaya)',
    'hero.notListed': 'Ba a lissafa wurinka ba? Rubuta shi a shafin oda',
    'hero.eta': 'kimanin minti {min}',
    'hero.book': 'Yi odar ɗauka',
    'hero.mapHint': 'Taɓa wurare biyu a taswira, ko zaɓe su a sama.',
    'hero.mapTitle': 'Wuraren Kano da muke zuwa',
    'hero.mapPickup': 'Ɗauka',
    'hero.mapDropoff': 'Kaiwa',

    'track.title': 'Bibiyi kayanka',
    'track.placeholder': 'FMR-KN-7Q2X9A',
    'track.button': 'Bincika',
    'track.help': 'Lambar tana cikin SMS, saƙon WhatsApp ko takardar jigilarka.',

    'how.title': 'Yadda kaya ke tafiya',
    'how.1.title': 'Kana yin oda',
    'how.1.body': 'Zaɓi wurare biyu, ka ga kuɗin, ka yi oda cikin minti ɗaya. Za ka samu takardar jigila da lambar sirri mai lambobi 4. Ba sai ka buɗe asusu ba.',
    'how.2.title': 'Mai babur ya ɗauka',
    'how.2.body': 'Mai babur mafi kusa da ke aiki zai ɗauki kayan daga wurinka. Za ka ga sunansa, lambar babur da wayarsa, da kowane mataki a shafin bibiya.',
    'how.3.title': 'Lambar sirri ce ke kammalawa',
    'how.3.body': 'Mai karɓa zai duba kayan, sannan ya ba mai babur lambar. Babu lamba, babu isarwa.',
    'how.photo': 'Hoto na nan tafe',

    'code.title': 'Mai babur ba ya ganin lambar.',
    'code.body': 'Kai da mai karɓa kaɗai ke samun lambar sirri mai lambobi 4. Sai mai babur ya roƙe ta a ƙofa, bayan an duba kayan. Kuskure biyar, sai a kulle isarwar har ofis ya shiga.',
    'code.sender': 'Mai aikawa',
    'code.recipient': 'Mai karɓa',
    'code.rider': 'Mai babur',
    'code.hidden': 'a ɓoye',
    'code.sample': 'Misalin lamba',

    'fares.title': 'Ga kuɗin kafin ka yi oda',
    'fares.lede': 'Ana lissafa kuɗi da nisan hanya daga inda ka aika. Waɗannan na ƙananan kaya ne; manyan kaya, kaya masu fashewa da karɓar kuɗin kaya suna ƙara kaɗan. Babu ƙari, babu ciniki.',
    'fares.from': 'Aikawa daga',
    'fares.min': 'minti {min}',
    'fares.book': 'Oda',
    'fares.zone.Z1_CENTRAL': 'Kasuwannin tsakiya',
    'fares.zone.Z2_COMMERCIAL_RESIDENTIAL': 'Tsakiyar gari',
    'fares.zone.Z3_RESIDENTIAL_METRO': 'Unguwanni da jami’o’i',
    'fares.zone.Z4_OUTER_RING': 'Bayan gari',
    'fares.same': 'Wuri ɗaya',

    'cod.title': 'Kana sayarwa ta yanar gizo? Za mu karɓo maka kuɗi.',
    'cod.body': 'Masu gasa kek, masu dafa abinci da ’yan kasuwa za su iya sa mai babur ya karɓi kuɗin kaya a lokacin isarwa. Ofis zai tura maka kuɗin da shaidar biya.',
    'cod.cta': 'Yi odar kaya mai biya-a-kawo',

    'desk.title': 'Kana son magana da mutum?',
    'desk.body': 'Ofishin jigilarmu yana karɓar oda, bibiya da warware matsala ta waya ko WhatsApp.',
    'desk.hours': 'Kullum, 7:30 na safe – 9:00 na dare',
    'desk.call': 'Kira 0815 666 1246',
    'desk.whatsapp': 'Tura saƙo ta WhatsApp',
    'desk.whatsappText': 'Sannu Fimrash, ina son aika kaya.',
    'desk.office': 'Ofishinmu:',

    'footer.tagline': 'Jigilar rana guda a cikin birnin Kano.',
    'footer.built': 'OrchidByte Solutions ne suka gina',
    'map.title': 'Taswirar hanya',
    'map.approx': 'Kimanin',
    'map.sub': 'Hanya daga wuri zuwa wuri (ba GPS kai tsaye ba)',
    'map.distance': 'Tazara:',
    'map.eta': 'Lokaci:',
    'map.courier': 'Mai babur da aka ba',

    'tr.title': 'Bibiyi kayanka',
    'tr.lede': 'Bayanai daga mai babur, suna sabuntuwa da kansu yayin da kayanka ke kan hanya.',
    'tr.mine': 'Ododina:',
    'tr.searching': 'Ana nema…',
    'tr.notFound': 'Ba a sami takardar jigila ba',
    'tr.notFoundBody': 'Duba lambar da ke cikin SMS, saƙon WhatsApp ko takardar jigilarka.',
    'tr.loadError': 'An kasa loda bibiya',
    'tr.empty': 'Shigar da lambar takardar jigila a sama don ganin inda kayanka suke.',
    'tr.plate': 'Lambar babur: {plate}',
    'tr.call': 'Kira {phone}',
    'tr.matching': 'Muna neman mai babur da zai ɗauki kayanka. Kira ofis a 0815 666 1246 idan da gaggawa.',
    'tr.waybill': 'Takardar jigila',
    'tr.fromTo': '{category} daga {sender} zuwa {recipient}',
    'tr.updated': 'An sabunta {time} · sake loda',
    'tr.senderCode': 'Lambar sirri (kwafin mai aikawa)',
    'tr.senderCodeNote': 'Ba mai karɓa kaɗai, kada ka ba mai babur.',
    'tr.receiving': 'Kai ne mai karɓa?',
    'tr.receivingBody': 'Mai aikawa ko SMS ya turo maka lambar sirri mai lambobi 4. Ka ba mai babur ita sai bayan ka duba kayanka.',
    'tr.cancelled': 'An soke wannan isarwa. Tuntuɓi mai aikawa ko ofishin Fimrash don ƙarin bayani.',
    'tr.progress': 'Ci gaba',
    'tr.from': 'Daga',
    'tr.to': 'Zuwa',
    'tr.booked': 'An yi oda {when}',
    'tr.deliveredAt': 'An isar {when}',
    'tr.feeOnArrival': 'Kuɗin jigila: a biya idan an kawo',
    'tr.feePrepaid': 'Kuɗin jigila: mai aikawa ya riga ya biya',
    'tr.includesCod': 'Har da kuɗin kaya (biya-a-kawo) {amount}',
    'tr.payCash': 'Ka biya mai babur tsabar kuɗi idan ka karɓi kayan.',
    'tr.nothingToPay': 'Babu abin da za a biya lokacin isarwa.',
    'tr.due': 'Za a biya lokacin karɓa',
    'tr.nothingDue': 'Babu biya',
    'step.pending': 'An yi oda', 'step.pending.d': 'An karɓi oda',
    'step.assigned': 'An ba mai babur', 'step.assigned.d': 'An sami mai babur',
    'step.picked_up': 'An ɗauka', 'step.picked_up.d': 'An karɓi kayan',
    'step.in_transit': 'Kan hanya', 'step.in_transit.d': 'Yana tafe',
    'step.arrived': 'Ya iso', 'step.arrived.d': 'A wurinka',
    'step.delivered': 'An isar', 'step.delivered.d': 'An kammala',
    'status.pending': 'Ana jiran mai babur', 'status.assigned': 'An ba mai babur', 'status.picked_up': 'An ɗauka',
    'status.in_transit': 'Kan hanya', 'status.arrived': 'Ya iso wurin', 'status.delivered': 'An isar', 'status.cancelled': 'An soke',
  },
};

const STORAGE_KEY = 'fimrash_lang';
const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

const initialLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ha') return saved;
  } catch { /* storage unavailable */ }
  return navigator.language?.toLowerCase().startsWith('ha') ? 'ha' : 'en';
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const t = (key, vars = {}) => {
    const template = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
  };

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export const useI18n = () => useContext(LanguageContext);
