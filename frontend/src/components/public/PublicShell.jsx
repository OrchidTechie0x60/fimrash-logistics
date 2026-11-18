import React from 'react';
import { PackagePlus, Search, Phone } from 'lucide-react';
import { useI18n } from '../../i18n';
import { hrefFor, linkHandler } from '../../lib/router';

const DESK_TEL = 'tel:08156661246';

// Official Fimrash logos (from Graphics_logo/, cut out to transparent PNGs in public/brand/).
// `on` is the ground the logo sits on: 'dark' uses the reversed artwork, 'light' the primary.
// Brand rule: keep at least 96px wide on screen, with clear space of one arrowhead around it.
const LOGO_FILES = {
  lockup: { dark: '/brand/fimrash-lockup-reversed.png', light: '/brand/fimrash-lockup.png', ratio: 880 / 196 },
  stacked: { dark: '/brand/fimrash-stacked-reversed.png', light: '/brand/fimrash-stacked.png', ratio: 480 / 452 },
  mark: { dark: '/brand/fimrash-mark-reversed.png', light: '/brand/fimrash-mark.png', ratio: 256 / 217 },
};

export function BrandLogo({ variant = 'lockup', on = 'dark', height = 36, className = '', alt = 'Fimrash Logistics' }) {
  const file = LOGO_FILES[variant];
  return (
    <img
      src={file[on]}
      alt={alt}
      height={height}
      width={Math.round(height * file.ratio)}
      className={`select-none ${className}`}
      style={{ height, width: 'auto' }}
      draggable="false"
    />
  );
}

export function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t('lang.label')} className={`inline-flex rounded-full p-1 bg-[rgba(11,18,64,0.55)] shadow-[inset_0_0_0_1px_rgba(241,234,219,0.2)] ${className}`}>
      {[
        ['en', 'EN'],
        ['ha', 'HA'],
      ].map(([code, label]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`min-w-11 h-9 px-3 rounded-full text-sm font-bold transition-colors ${
            lang === code ? 'bg-[#f1eadb] text-[#0b1240]' : 'text-[#c9d3f2] hover:text-[#f1eadb]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function PublicHeader({ active }) {
  const { t } = useI18n();
  const link = (tab, label) => (
    <a
      href={hrefFor(tab)}
      onClick={linkHandler(tab)}
      aria-current={active === tab ? 'page' : undefined}
      className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
        active === tab ? 'text-[#f1eadb] bg-[rgba(241,234,219,0.1)]' : 'text-[#c9d3f2] hover:text-[#f1eadb]'
      }`}
    >
      {label}
    </a>
  );

  return (
    <header className="iw iw-cloth-deep sticky top-0 z-40 border-b border-[rgba(241,234,219,0.1)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center justify-between gap-3">
        <a href="/" onClick={linkHandler('home')} className="flex items-center gap-2.5 shrink-0" aria-label="Fimrash Logistics, home">
          <BrandLogo height={34} className="sm:hidden" />
          <BrandLogo height={40} className="hidden sm:block" />
        </a>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {link('tracking', t('nav.track'))}
          <a href={DESK_TEL} className="ml-2 px-3 py-2 rounded-lg font-semibold text-[#c9d3f2] hover:text-[#f1eadb] inline-flex items-center gap-2 iw-num">
            <Phone className="w-4 h-4" aria-hidden="true" />
            0815 666 1246
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <a href={hrefFor('booking')} onClick={linkHandler('booking')} className="hidden sm:inline-flex iw-btn iw-btn-primary !min-h-11 !px-4 !text-base">
            {t('nav.send')}
          </a>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="iw iw-cloth-deep pb-28 md:pb-10 pt-12 border-t border-[rgba(241,234,219,0.08)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <BrandLogo height={48} alt="Fimrash Logistics Services" />
          <p className="text-[#8fa8e8] max-w-sm">{t('footer.tagline')}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[#c9d3f2] font-semibold">
          <a href={hrefFor('booking')} onClick={linkHandler('booking')} className="hover:text-[#f1eadb]">{t('nav.send')}</a>
          <a href={hrefFor('tracking')} onClick={linkHandler('tracking')} className="hover:text-[#f1eadb]">{t('nav.track')}</a>
          <a href={DESK_TEL} className="hover:text-[#f1eadb] iw-num">0815 666 1246</a>
          <span className="text-[#8fa8e8] font-normal">© {new Date().getFullYear()} · {t('footer.built')}</span>
        </div>
      </div>
    </footer>
  );
}

// Phones: Send and Track stay under the thumb on every public page.
export function MobileDock({ active }) {
  const { t } = useI18n();
  return (
    <nav aria-label="Quick actions" className="iw iw-cloth-deep iw-dock md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pt-2.5 grid grid-cols-2 gap-2.5">
      <a href={hrefFor('booking')} onClick={linkHandler('booking')} aria-current={active === 'booking' ? 'page' : undefined} className="iw-btn iw-btn-primary !min-h-12">
        <PackagePlus className="w-5 h-5" aria-hidden="true" />
        {t('nav.send')}
      </a>
      <a href={hrefFor('tracking')} onClick={linkHandler('tracking')} aria-current={active === 'tracking' ? 'page' : undefined} className="iw-btn iw-btn-ghost !min-h-12">
        <Search className="w-5 h-5" aria-hidden="true" />
        {t('nav.track')}
      </a>
    </nav>
  );
}
