import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpDown, Search, Package, Bike, KeyRound, Eye, EyeOff, Phone, MessageCircle, Banknote, MoveHorizontal, MapPin } from 'lucide-react';
import { MAP_NODES } from '../../data/kanoMap';
import ResistMap from './ResistMap';
import Stitch from './Stitch';
import { useI18n } from '../../i18n';
import { KANO_LANDMARKS, KANO_ZONES, getLandmark } from '../../data/kanoLandmarks';
import { quote, refreshPricingRates, usePricingRates } from '../../lib/pricing';
import { useRefreshHandler } from '../../lib/refresh';
import { OFFICE_ADDRESS } from '../../lib/business';
import { hrefFor, linkHandler, navigate } from '../../lib/router';

const naira = (n) => `₦${Number(n).toLocaleString('en-NG')}`;

function LandmarkSelect({ id, label, value, onChange, lang }) {
  const { t } = useI18n();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="iw-label block mb-1.5 text-[var(--iw-ink-soft)]">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="iw-field">
        {KANO_ZONES.map((z) => (
          <optgroup key={z.id} label={t(`fares.zone.${z.id}`)}>
            {KANO_LANDMARKS.filter((l) => l.zoneId === z.id).map((l) => (
              <option key={l.id} value={l.id}>
                {lang === 'ha' ? l.hausaName : l.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

// A tie-resist station on the running thread: where the cloth was bound, the rings stay undyed.
function ResistStation({ icon: Icon, seed }) {
  return (
    <div className="relative w-28 h-28 md:w-40 md:h-40 shrink-0">
      <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <filter id={`station-${seed}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="5" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <circle cx="80" cy="80" r="76" fill="#0b1240" />
        <g filter={`url(#station-${seed})`} fill="none" stroke="#f1eadb">
          <circle cx="80" cy="80" r="70" strokeWidth="1.6" strokeOpacity="0.28" strokeDasharray="2 4" />
          <circle cx="80" cy="80" r="58" strokeWidth="2.6" strokeOpacity="0.4" />
          <circle cx="80" cy="80" r="46" strokeWidth="1.4" strokeOpacity="0.55" strokeDasharray="1.5 3.5" />
          <circle cx="80" cy="80" r="34" strokeWidth="3" strokeOpacity="0.8" />
        </g>
      </svg>
      <Icon className="absolute inset-0 m-auto w-8 h-8 md:w-10 md:h-10 text-[#f1eadb]" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

export default function Landing() {
  const { t, lang } = useI18n();
  // Default to a route that crosses the city, so the dye-in is visible on arrival.
  const [fromId, setFromId] = useState('buk-new-campus');
  const [toId, setToId] = useState('nassarawa-gra');
  const [nextPick, setNextPick] = useState('from');
  const [trackCode, setTrackCode] = useState('');
  const [boardFrom, setBoardFrom] = useState('kwari-textiles');
  const mapScroller = useRef(null);

  const rates = usePricingRates();
  useRefreshHandler(refreshPricingRates);
  const heroQuote = quote(rates, fromId, toId);
  const fare = heroQuote.fee;
  const eta = heroQuote.minutes;

  // Phones show the map at legible scale inside a horizontal scroller, opened on the chosen route.
  useEffect(() => {
    const el = mapScroller.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const xs = [fromId, toId].map((id) => MAP_NODES.find((n) => n.id === id)?.x ?? 322);
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
    const px = ((mid - 22) / 600) * (el.scrollWidth - 16) + 8; // viewBox x 22..622 → scroller px
    el.scrollTo({ left: Math.max(0, px - el.clientWidth / 2), behavior: 'smooth' });
  }, [fromId, toId]);

  const pickOnMap = (id) => {
    if (nextPick === 'from') {
      setFromId(id);
      setNextPick('to');
    } else {
      setToId(id);
      setNextPick('from');
    }
  };

  const landmarkName = (l) => (lang === 'ha' ? l.hausaName : l.name);

  const submitTrack = (e) => {
    e.preventDefault();
    const code = trackCode.trim().toUpperCase();
    if (code) navigate('tracking', code);
  };

  return (
    <div className="iw">
      {/* ── 1. Hero: the cloth, the booking swatch, the map, the track strip ── */}
      <section className="iw-cloth relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-14 sm:pb-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-5 space-y-7 min-w-0">
            <div className="space-y-5">
              <h1 className={`iw-display text-[#f1eadb] ${lang === 'ha' ? 'text-[clamp(2.6rem,4.9vw,4.4rem)]' : 'text-[clamp(2.9rem,6.2vw,5.4rem)]'}`}>
                {t('hero.title')}
              </h1>
              <p className="iw-lede text-[var(--iw-mist)]">{t('hero.lede')}</p>
            </div>

            {/* Booking swatch: undyed cotton, bound with a running stitch */}
            <form
              className="relative iw-cotton rounded-[1.4rem] p-5 sm:p-7 space-y-4 shadow-[0_30px_60px_-30px_rgba(11,18,64,0.9)]"
              onSubmit={(e) => {
                e.preventDefault();
                navigate('booking', null, { from: fromId, to: toId });
              }}
            >
              <Stitch tone="ink" />
              <div className="relative grid gap-3">
                <LandmarkSelect id="hero-from" label={`A · ${t('hero.from')}`} value={fromId} onChange={setFromId} lang={lang} />
                <LandmarkSelect id="hero-to" label={`B · ${t('hero.to')}`} value={toId} onChange={setToId} lang={lang} />
                <button
                  type="button"
                  onClick={() => { setFromId(toId); setToId(fromId); }}
                  aria-label={t('hero.swap')}
                  title={t('hero.swap')}
                  className="absolute right-12 top-1/2 -translate-y-[0.15rem] w-9 h-9 rounded-full bg-[var(--iw-indigo)] text-[#f1eadb] grid place-items-center shadow-[0_6px_14px_-6px_rgba(11,18,64,0.8)] hover:bg-[var(--iw-indigo-3)] transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex flex-wrap items-end justify-between gap-4 pt-1">
                <div aria-live="polite">
                  <span className="iw-label block text-[var(--iw-ink-soft)]">{t('hero.fare')}</span>
                  <span className="iw-num block font-[family-name:var(--iw-display)] font-extrabold text-[2.6rem] leading-none tracking-[-0.03em] text-[var(--iw-ink)]">
                    {naira(fare)}
                  </span>
                  <span className="text-sm font-semibold text-[var(--iw-ink-soft)] iw-num">{t('hero.eta', { min: eta })}</span>
                </div>
                <button type="submit" className="iw-btn iw-btn-primary flex-1 sm:flex-none min-w-[13rem]">
                  {t('hero.book')}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <a
                href={hrefFor('booking', null, { from: 'other', to: toId })}
                onClick={linkHandler('booking', null, { from: 'other', to: toId })}
                className="relative inline-block text-sm font-semibold text-[var(--iw-indigo-3)] underline underline-offset-4 decoration-[rgba(44,71,168,0.4)] hover:decoration-[var(--iw-indigo-3)]"
              >
                {t('hero.notListed')}
              </a>
            </form>
          </div>

          <div className="lg:col-span-7 min-w-0 flex flex-col gap-6 lg:-mr-4">
            {/* The resist map (after the track strip on phones) */}
            <div className="order-2 lg:order-1">
              <h2 className="sr-only">{t('hero.mapTitle')}</h2>
              <div ref={mapScroller} className="-mx-4 px-2 overflow-x-auto lg:overflow-visible lg:mx-0 lg:px-0 no-scrollbar">
                <div className="min-w-[560px] lg:min-w-0">
                  <ResistMap
                    fromId={fromId}
                    toId={toId}
                    onPick={pickOnMap}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-[var(--iw-mist)]">
                <span className="inline-flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[#f1eadb] text-[var(--iw-pit)] text-[0.7rem] font-extrabold grid place-items-center">A</span>{t('hero.mapPickup')}</span>
                <span className="inline-flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-[#f1eadb] text-[var(--iw-pit)] text-[0.7rem] font-extrabold grid place-items-center">B</span>{t('hero.mapDropoff')}</span>
                <span className="text-[var(--iw-wash)] inline-flex items-center gap-1.5">
                  <MoveHorizontal className="w-4 h-4 lg:hidden" aria-hidden="true" />
                  {t('hero.mapHint')}
                </span>
              </div>
            </div>

            {/* Track: the deep-dyed strip */}
            <form onSubmit={submitTrack} className="order-1 lg:order-2 relative iw-cloth-deep rounded-[1.2rem] p-5 sm:p-6">
              <Stitch tone="cotton" />
              <div className="relative grid sm:grid-cols-[auto_1fr] sm:items-center gap-3 sm:gap-5">
                <label htmlFor="hero-track" className="iw-h3 text-[#f1eadb] whitespace-nowrap">{t('track.title')}</label>
                <div className="flex gap-2.5 min-w-0">
                  <input
                    id="hero-track"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    placeholder={t('track.placeholder')}
                    autoCapitalize="characters"
                    spellCheck="false"
                    aria-describedby="hero-track-help"
                    className="iw-field iw-field-dark iw-num uppercase !pr-4 tracking-wide"
                  />
                  <button type="submit" className="iw-btn iw-btn-cotton shrink-0 !px-5">
                    <Search className="w-5 h-5" aria-hidden="true" />
                    <span className="hidden sm:inline">{t('track.button')}</span>
                    <span className="sr-only sm:hidden">{t('track.button')}</span>
                  </button>
                </div>
              </div>
              <p id="hero-track-help" className="relative mt-3 text-sm text-[var(--iw-wash)]">{t('track.help')}</p>
            </form>
          </div>
        </div>
      </section>

      {/* ── 2. How a parcel moves: one cloth, one running thread, three resist stations ── */}
      <section className="iw-cotton">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <h2 className="iw-h2 text-[var(--iw-ink)] max-w-2xl">{t('how.title')}</h2>
          {/* PHOTO SLOT: when real Fimrash photos arrive, a photo row can sit above this strip. */}
          <div className="relative mt-12 sm:mt-14 iw-cloth rounded-[1.6rem] overflow-hidden px-5 sm:px-10 py-10 sm:py-14 shadow-[0_30px_60px_-36px_rgba(11,18,64,0.9)]">
            {/* the thread, through the centre of each station */}
            <svg aria-hidden="true" className="absolute pointer-events-none hidden md:block left-[16%] w-[68%] top-[calc(3.5rem+4.5rem)] h-3" preserveAspectRatio="none" viewBox="0 0 100 4">
              <path d="M0 2 Q 25 0.6 50 2 T 100 2" fill="none" stroke="#f1eadb" strokeOpacity="0.55" strokeDasharray="1.6 1.2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2.4 }} />
            </svg>
            <svg aria-hidden="true" className="absolute pointer-events-none md:hidden top-16 left-[calc(1.25rem+3.25rem)] w-3 h-[calc(100%-8rem)]" preserveAspectRatio="none" viewBox="0 0 4 100">
              <path d="M2 0 Q 0.8 50 2 100" fill="none" stroke="#f1eadb" strokeOpacity="0.5" strokeDasharray="1.6 1.2" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2.2 }} />
            </svg>
            <ol className="relative grid md:grid-cols-3 gap-10 md:gap-8">
              {[
                { icon: Package, key: 1 },
                { icon: Bike, key: 2 },
                { icon: KeyRound, key: 3 },
              ].map(({ icon, key }) => (
                <li key={key} className="flex md:flex-col items-start md:items-center gap-5 md:text-center">
                  <ResistStation icon={icon} seed={key + 2} />
                  <div className="min-w-0 md:mt-2">
                    <h3 className="iw-h3 text-[#f1eadb]">{t(`how.${key}.title`)}</h3>
                    <p className="mt-2 text-[1.02rem] leading-relaxed text-[var(--iw-mist)] max-w-xs md:mx-auto">{t(`how.${key}.body`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 3. The handover code: who sees it ─────────────────────────── */}
      <section className="iw-cloth-deep">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <h2 className="iw-h2 text-[#f1eadb]">{t('code.title')}</h2>
            <p className="iw-lede text-[var(--iw-mist)]">{t('code.body')}</p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
            {[
              { who: 'sender', sees: true },
              { who: 'recipient', sees: true },
              { who: 'rider', sees: false },
            ].map(({ who, sees }) => (
              <div key={who} className={`relative rounded-[1.1rem] p-6 ${sees ? 'iw-cotton' : 'iw-cloth'}`}>
                <Stitch tone={sees ? 'ink' : 'cotton'} inset={7} radius={12} />
                <div className={`relative flex items-center justify-between font-bold ${sees ? 'text-[var(--iw-ink)]' : 'text-[#f1eadb]'}`}>
                  <span>{t(`code.${who}`)}</span>
                  {sees ? <Eye className="w-5 h-5" aria-hidden="true" /> : <EyeOff className="w-5 h-5" aria-hidden="true" />}
                </div>
                <div className="relative mt-5 grid grid-cols-4 gap-1.5" aria-label={sees ? `${t('code.sample')}: 2705` : t('code.hidden')}>
                  {['2', '7', '0', '5'].map((d, i) => (
                    <span
                      key={i}
                      className={`iw-num h-14 rounded-lg grid place-items-center font-[family-name:var(--iw-display)] font-extrabold text-[1.9rem] ${
                        sees ? 'bg-[var(--iw-indigo)] text-[#f1eadb]' : 'bg-[rgba(11,18,64,0.7)] text-transparent shadow-[inset_0_0_0_1px_rgba(241,234,219,0.15)]'
                      }`}
                    >
                      {sees ? d : '•'}
                    </span>
                  ))}
                </div>
                <span className={`relative mt-3 block text-sm ${sees ? 'text-[var(--iw-ink-soft)]' : 'text-[var(--iw-wash)]'}`}>
                  {sees ? t('code.sample') : t('code.hidden')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Fare board ─────────────────────────────────────────────── */}
      <section className="iw-cotton-shade">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <h2 className="iw-h2 text-[var(--iw-ink)]">{t('fares.title')}</h2>
              <p className="iw-lede text-[var(--iw-ink-soft)]">{t('fares.lede')}</p>
            </div>
            <div className="w-full lg:w-80">
              <LandmarkSelect id="board-from" label={t('fares.from')} value={boardFrom} onChange={setBoardFrom} lang={lang} />
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-x-10 gap-y-8">
            {KANO_ZONES.map((z) => (
              <div key={z.id} className="min-w-0">
                <h3 className="iw-label uppercase tracking-[0.08em] text-[var(--iw-indigo-3)] pb-2 border-b-2 border-[var(--iw-indigo)]">
                  {t(`fares.zone.${z.id}`)}
                </h3>
                <ul>
                  {KANO_LANDMARKS.filter((l) => l.zoneId === z.id).map((l) => {
                    const same = l.id === boardFrom;
                    const q = quote(rates, boardFrom, l.id);
                    const price = q.fee;
                    const mins = q.minutes;
                    return (
                      <li key={l.id} className="iw-fare-row flex items-center gap-3 py-3 px-1 rounded-md">
                        <div className="flex-1 min-w-0">
                          <span className="block font-semibold text-[var(--iw-ink)] truncate">{landmarkName(l)}</span>
                          <span className="block text-xs text-[var(--iw-ink-soft)] truncate">{same ? t('fares.same') : lang === 'ha' ? l.name : l.hausaName}</span>
                        </div>
                        <span className="iw-num text-sm text-[var(--iw-ink-soft)] w-16 text-right">{t('fares.min', { min: mins })}</span>
                        <span className="iw-num font-[family-name:var(--iw-display)] font-extrabold text-xl text-[var(--iw-ink)] w-20 text-right">{naira(price)}</span>
                        <a
                          href={hrefFor('booking', null, { from: boardFrom, to: l.id })}
                          onClick={linkHandler('booking', null, { from: boardFrom, to: l.id })}
                          aria-label={`${t('fares.book')}: ${landmarkName(getLandmark(boardFrom))} → ${landmarkName(l)}`}
                          className="shrink-0 w-11 h-11 rounded-full grid place-items-center text-[var(--iw-indigo)] hover:bg-[var(--iw-indigo)] hover:text-[#f1eadb] transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Sellers: cash on delivery ──────────────────────────────── */}
      <section className="iw-cloth">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex gap-5 items-start max-w-3xl">
            <span className="shrink-0 w-14 h-14 rounded-2xl bg-[#f1eadb] text-[var(--iw-indigo)] grid place-items-center">
              <Banknote className="w-7 h-7" aria-hidden="true" />
            </span>
            <div className="space-y-3">
              <h2 className="iw-h3 !text-[clamp(1.5rem,2.6vw,2.1rem)] text-[#f1eadb]">{t('cod.title')}</h2>
              <p className="text-[1.05rem] leading-relaxed text-[var(--iw-mist)]">{t('cod.body')}</p>
            </div>
          </div>
          <a href={hrefFor('booking', null, { cod: '1' })} onClick={linkHandler('booking', null, { cod: '1' })} className="iw-btn iw-btn-cotton self-start lg:self-center">
            {t('cod.cta')}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* ── 6. The desk ───────────────────────────────────────────────── */}
      <section className="iw-cotton">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="iw-h2 text-[var(--iw-ink)]">{t('desk.title')}</h2>
            <p className="iw-lede text-[var(--iw-ink-soft)]">{t('desk.body')}</p>
            <p className="font-bold text-[var(--iw-ink)]">{t('desk.hours')}</p>
            <p className="flex items-start gap-2 text-[var(--iw-ink-soft)] max-w-lg pt-2">
              <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[var(--iw-indigo-3)]" aria-hidden="true" />
              <span><strong className="text-[var(--iw-ink)]">{t('desk.office')}</strong> {OFFICE_ADDRESS}</span>
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3">
            <a href="tel:08156661246" className="iw-btn iw-btn-primary iw-num">
              <Phone className="w-5 h-5" aria-hidden="true" />
              {t('desk.call')}
            </a>
            <a
              href={`https://wa.me/2348156661246?text=${encodeURIComponent(t('desk.whatsappText'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="iw-btn shadow-[inset_0_0_0_2px_var(--iw-indigo)] text-[var(--iw-indigo)] hover:bg-[rgba(20,33,92,0.06)]"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              {t('desk.whatsapp')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
