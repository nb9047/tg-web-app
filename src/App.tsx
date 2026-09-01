import React, { useEffect, useState, useTransition } from 'react';
import { Settings, ActiveTab, PrayerTimes } from './types';
import { UZ_CITIES, calculatePrayerTimes, getHijriDate } from './utils/prayerCalc';
import { getTranslation } from './utils/translations';
import { TodayView } from './components/TodayView';
import { MonthlyView } from './components/MonthlyView';
import { SettingsView } from './components/SettingsView';
import { QiblaCompass } from './components/QiblaCompass';
import { HouseIcon, CalendarIcon, GearIcon, QiblaIcon, RefreshIcon } from './components/Icons';

// ─── Namoz vaqtlari API shahar mapping (bot.py bilan bir xil) ────────────────
// Manba: https://namoz-vaqtlari.more-info.uz (12 viloyat + Qoraqalpog'iston)
const ISLOMAPI_CITY: Record<string, string> = {
  tashkent:  'Toshkent',
  andijan:   'Andijon',
  namangan:  'Namangan',
  fergana:   'Fargona',
  gulistan:  'Sirdaryo',
  jizzakh:   'Jizzax',
  samarkand: 'Samarqand',
  bukhara:   'Buxoro',
  navoiy:    'Navoiy',
  karshi:    'Qashqadaryo',
  termez:    'Surxandaryo',
  urgench:   'Xorazm',
};

// namozvaqti.uz scraping uchun shahar slug'lari
const SCRAPE_CITY: Record<string, string> = {
  tashkent:  'toshkent',
  andijan:   'andijon',
  namangan:  'namangan',
  fergana:   'fargona',
  gulistan:  'sirdaryo',
  jizzakh:   'jizzax',
  samarkand: 'samarqand',
  bukhara:   'buxoro',
  navoiy:    'navoiy',
  karshi:    'qarshi',
  termez:    'termiz',
  urgench:   'urganch',
};

// ─── Default Settings ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS: Settings = {
  cityId: 'tashkent',
  language: 'uz_lat',
  asrMethod: 'hanafi',
  notifications: {
    fajr: true,
    sunrise: false,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  preAlertMinutes: 10,
  isRamadanMode: true,
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('bugun');

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('namoz_vaqtlari_settings');
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; }
      catch { return DEFAULT_SETTINGS; }
    }
    return DEFAULT_SETTINGS;
  });

  const [apiTimes, setApiTimes]         = useState<PrayerTimes | null>(null);
  const [apiHijriDate, setApiHijriDate] = useState<{ day: number; monthNumber: number; year: number } | null>(null);
  const [isFetching, setIsFetching]     = useState<boolean>(false);
  const [fetchError, setFetchError]     = useState<boolean>(false);
  const [isPending, startTransition]    = useTransition();

  // ── Settings updater ──────────────────────────────────────────────────────
  const handleUpdateSettings = (updater: (prev: Settings) => Settings) => {
    setSettings((prev) => {
      const next = updater(prev);
      localStorage.setItem('namoz_vaqtlari_settings', JSON.stringify(next));
      return next;
    });
  };

  // ── Telegram theme sync ───────────────────────────────────────────────────
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const syncTheme = () => {
        const doc = document.documentElement;
        if (tg.themeParams) {
          if (tg.themeParams.bg_color)           doc.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
          if (tg.themeParams.text_color)         doc.style.setProperty('--tg-text-color', tg.themeParams.text_color);
          if (tg.themeParams.secondary_bg_color) doc.style.setProperty('--tg-secondary-bg-color', tg.themeParams.secondary_bg_color);
          if (tg.themeParams.hint_color)         doc.style.setProperty('--tg-hint-color', tg.themeParams.hint_color);
          if (tg.themeParams.button_color)       doc.style.setProperty('--tg-button-color', tg.themeParams.button_color);
          if (tg.themeParams.button_text_color)  doc.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color);
        }
        doc.classList.toggle('dark', tg.colorScheme === 'dark');
      };
      syncTheme();
      tg.onEvent('themeChanged', syncTheme);
      return () => tg.offEvent('themeChanged', syncTheme);
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMedia = (e: MediaQueryListEvent | MediaQueryList) => {
        const doc = document.documentElement;
        if (e.matches) {
          doc.classList.add('dark');
          doc.style.setProperty('--tg-bg-color', '#0c0e15');
          doc.style.setProperty('--tg-text-color', '#f1f5f9');
          doc.style.setProperty('--tg-secondary-bg-color', '#161b26');
          doc.style.setProperty('--tg-hint-color', '#94a3b8');
        } else {
          doc.classList.remove('dark');
          doc.style.setProperty('--tg-bg-color', '#f6f8fa');
          doc.style.setProperty('--tg-text-color', '#0f172a');
          doc.style.setProperty('--tg-secondary-bg-color', '#ffffff');
          doc.style.setProperty('--tg-hint-color', '#71717a');
        }
      };
      handleMedia(media);
      media.addEventListener('change', handleMedia);
      return () => media.removeEventListener('change', handleMedia);
    }
  }, []);

  // ── Namoz vaqtlari API dan vaqtlarni olish ────────────────────────────────
  // Manba: https://namoz-vaqtlari.more-info.uz — bot.py bilan bir xil manba,
  // vaqtlar mos keladi.
  //
  // API javobi:
  // {
  //   "isSuccess": true,
  //   "statusCode": 200,
  //   "response": {
  //     "bomdod": "05:25:00", "quyosh": "06:44:00", "peshin": "12:07:00",
  //     "asr": "15:48:00", "shom": "17:33:00", "xufton": "18:49:00",
  //     "region": "Toshkent", "date": "2025-10-23"
  //   }
  // }

  const currentCity = UZ_CITIES.find((c) => c.id === settings.cityId) || UZ_CITIES[0];

  const PRAYER_ORDER = ['Bomdod', 'Quyosh', 'Peshin', 'Asr', 'Shom', 'Xufton'];

  function parseNamozvaqtiHtml(html: string): PrayerTimes | null {
    const text = html.replace(/<[^>]+>/g, '\n');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
    const result: Record<string, string> = {};
  
    for (let i = 0; i < lines.length; i++) {
      if (timeRe.test(lines[i])) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const match = PRAYER_ORDER.find(p => p.toLowerCase() === lines[j].toLowerCase());
          if (match) {
            if (!result[match]) result[match] = lines[i];
            break;
          }
        }
      }
    }
  
    if (Object.keys(result).length < 5) return null;
  
    return {
      fajr:    result['Bomdod'] || '',
      sunrise: result['Quyosh'] || '',
      dhuhr:   result['Peshin'] || '',
      asr:     result['Asr']    || '',
      maghrib: result['Shom']   || '',
      isha:    result['Xufton'] || '',
    };
  }
  
  const fetchOnlineTimes = async () => {
    setIsFetching(true);
    setFetchError(false);

    const now      = new Date();
    const year     = now.getFullYear();
    const month    = now.getMonth() + 1;
    const day      = now.getDate();
    const dateStr  = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const city     = ISLOMAPI_CITY[settings.cityId] || 'Toshkent';
    const apiUrl   = `https://namoz-vaqtlari.more-info.uz:444/api/GetDailyPrayTimes/${encodeURIComponent(city)}/${dateStr}`;
    const proxy    = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    const slug = SCRAPE_CITY[settings.cityId];
    if (slug) {
      const scrapeUrl = `https://namozvaqti.uz/shahar/${slug}`;
      const scrapeProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(scrapeUrl)}`;
      try {
        const res = await fetch(scrapeProxy, { signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          const wrapper = await res.json();
          const parsed = parseNamozvaqtiHtml(wrapper.contents || '');
          if (parsed) {
            setApiTimes(parsed);
            setIsFetching(false);
            return;
          }
        }
      } catch (err) {
        console.warn('namozvaqti.uz scrape muvaffaqiyatsiz:', err);
      }
    }
    
    // yangi API → PrayerTimes
    const mapTimes = (t: Record<string, string>): PrayerTimes => ({
      fajr:    (t.bomdod || '').slice(0, 5),   // Bomdod
      sunrise: (t.quyosh || '').slice(0, 5),   // Quyosh chiqishi
      dhuhr:   (t.peshin || '').slice(0, 5),   // Peshin
      asr:     (t.asr    || '').slice(0, 5),   // Asr
      maghrib: (t.shom   || '').slice(0, 5),   // Shom
      isha:    (t.xufton || '').slice(0, 5),   // Xufton
    });

    // 1-urinish: bevosita API
    try {
      const res  = await fetch(apiUrl, { signal: AbortSignal.timeout(7000) });
      if (!res.ok) throw new Error(`API status ${res.status}`);
      const json = await res.json();
      if (json?.isSuccess && json?.response) {
        setApiTimes(mapTimes(json.response));
        setIsFetching(false);
        return;
      }
      throw new Error('response topilmadi');
    } catch (err) {
      console.warn('Bevosita urinish muvaffaqiyatsiz:', err);
    }

    // 2-urinish: CORS proxy orqali
    try {
      const res     = await fetch(proxy, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`proxy status ${res.status}`);
      const wrapper = await res.json();
      const json    = JSON.parse(wrapper.contents || '{}');
      if (json?.isSuccess && json?.response) {
        setApiTimes(mapTimes(json.response));
        setIsFetching(false);
        return;
      }
      throw new Error('proxy: response topilmadi');
    } catch (proxyErr) {
      console.error('Barcha urinishlar muvaffaqiyatsiz. Offline rejim:', proxyErr);
      setFetchError(true);
      setApiTimes(null);
    } finally {
      setIsFetching(false);
    }
  };

  // Shahar o'zgarganda qayta yuklash
  useEffect(() => {
    fetchOnlineTimes();
  }, [settings.cityId]);

  // ── Offline zaxira hisoblash ──────────────────────────────────────────────
  const localTimes    = calculatePrayerTimes(new Date(), currentCity, settings.asrMethod);
  const tomorrow      = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = calculatePrayerTimes(tomorrow, currentCity, settings.asrMethod);

  // API ishlasa → API vaqtlari, ishlamasa → lokal hisoblash
  const activeTimes = apiTimes || localTimes;

  // ── Sana formatlash ───────────────────────────────────────────────────────
  const gregorianDate = new Date();
  const monthsUz = ['Yanvar','Fevral','Mart','Aprel','May','Iyun',
                    'Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  const monthsRu = ['Января','Февраля','Марта','Апреля','Мая','Июня',
                    'Июля','Августа','Сентября','Октября','Ноября','Декабря'];

  const formattedGregorianDate = settings.language === 'ru'
    ? `${gregorianDate.getDate()}-${monthsRu[gregorianDate.getMonth()]}`
    : `${gregorianDate.getDate()}-${monthsUz[gregorianDate.getMonth()]}`;

  // ── Hijriy sana (lokal hisoblash) ─────────────────────────────────────────
  const getDisplayHijriDate = () => {
    const h        = getHijriDate(gregorianDate);
    const monthNum = h.monthIndex + 1;

    const mUzLat = ['Muharram','Safar',"Rabi'ul avval","Rabi'us soni",
                    'Jumodil avval','Jumodil oxir','Rajab',"Sha'bon",
                    'Ramazon','Shavvol',"Zulqa'da",'Zulhijja'];
    const mRu    = ['Мухаррам','Сафар','Раби аль-авваль','Раби аль-ахир',
                    'Джумада аль-уля','Джумада аль-ахира','Раджаб','Шабан',
                    'Рамадан','Шавваль','Зуль-када','Зуль-хиджа'];

    const monthName = settings.language === 'ru'
      ? (mRu[monthNum - 1]    || '')
      : (mUzLat[monthNum - 1] || '');

    return { formatted: `${h.day} ${monthName}, ${h.year}`, isRamadan: monthNum === 9 };
  };

  const hijriInfo          = getDisplayHijriDate();
  const formattedHijriDate = hijriInfo.formatted;
  const isCurrentlyRamadan = hijriInfo.isRamadan;

  const getCityLabel = () => {
    if (settings.language === 'uz_cyr') return currentCity.nameUzCyr;
    if (settings.language === 'ru')     return currentCity.nameRu;
    return currentCity.nameUz;
  };

  const toggleSingleNotify = (prayerKey: keyof PrayerTimes) => {
    handleUpdateSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [prayerKey]: !prev.notifications[prayerKey] },
    }));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[768px] sm:max-h-[95vh] bg-tg-bg text-tg-text font-sans selection:bg-primary/20 flex flex-col sm:rounded-[32px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] sm:border border-black/[0.04] dark:border-white/[0.06] overflow-hidden">

      {/* Ramazon banneri */}
      {isCurrentlyRamadan && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-center py-2 px-4 shadow-sm flex items-center justify-center gap-1.5 z-30 sticky top-0 border-b border-amber-600/10 animate-fade-in">
          <span className="text-[14px] font-bold tracking-wider uppercase">
            {getTranslation(settings.language, 'ramadan_blessing')}
          </span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 h-[56px] flex items-center justify-between px-5 bg-tg-bg/95 backdrop-blur-md border-b border-black/[0.03] dark:border-white/[0.03] select-none">
        <div className="flex flex-col">
          <h1 className="text-[17px] font-black tracking-tight text-primary uppercase">
            {getCityLabel()}
          </h1>
          <span className="text-[10px] text-tg-hint font-medium uppercase tracking-wider">
            {getTranslation(settings.language, 'title')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[12px] font-bold text-tg-text">
            {formattedGregorianDate}
          </span>
          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
            {formattedHijriDate}
          </span>
        </div>
      </header>

      {/* Kontent */}
      <main className="flex-1 px-4 xs:px-5 py-4 overflow-y-auto w-full flex flex-col gap-4 pb-[80px]">

        {/* API xatosi xabari */}
        {fetchError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[14px] p-4 text-center flex flex-col items-center gap-2 select-none animate-fade-in">
            <p className="text-[12px] font-semibold text-red-600 dark:text-red-400">
              {getTranslation(settings.language, 'api_error')}
            </p>
            <button
              onClick={fetchOnlineTimes}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-red-500/30 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-500/5 active:scale-95 transition-all outline-none"
            >
              <RefreshIcon size={12} />
              {getTranslation(settings.language, 'retry')}
            </button>
          </div>
        )}

        {/* Yuklash skeleti */}
        {isFetching ? (
          <div className="flex flex-col gap-4 animate-pulse select-none">
            <div className="bg-tg-sec-bg rounded-[24px] h-[210px]" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-tg-sec-bg rounded-[14px] h-[68px]" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1">
            {activeTab === 'bugun' && (
              <TodayView
                city={currentCity}
                times={activeTimes}
                tomorrowTimes={tomorrowTimes}
                settings={settings}
                toggleNotification={toggleSingleNotify}
              />
            )}
            {activeTab === 'oylik' && (
              <MonthlyView city={currentCity} settings={settings} />
            )}
            {activeTab === 'sozlamalar' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
            {activeTab === 'qibla' && (
              <QiblaCompass city={currentCity} settings={settings} />
            )}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="absolute bottom-0 inset-x-0 z-30 bg-tg-sec-bg/95 backdrop-blur-md border-t border-black/[0.04] dark:border-white/[0.04] select-none">
        <div
          className="w-full h-[58px] flex items-center justify-around px-2"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {([
            { tab: 'bugun',      Icon: HouseIcon,    labelKey: 'bugun'      },
            { tab: 'oylik',      Icon: CalendarIcon, labelKey: 'oylik'      },
            { tab: 'qibla',      Icon: QiblaIcon,    labelKey: 'qibla'      },
            { tab: 'sozlamalar', Icon: GearIcon,     labelKey: 'sozlamalar' },
          ] as const).map(({ tab, Icon, labelKey }) => (
            <button
              key={tab}
              onClick={() => startTransition(() => setActiveTab(tab))}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${
                activeTab === tab
                  ? 'text-primary scale-105 font-black'
                  : 'text-tg-hint hover:text-tg-text/80'
              }`}
              aria-label={tab}
            >
              <Icon size={20} />
              <span className="text-[10px] font-bold tracking-wide">
                {getTranslation(settings.language, labelKey)}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
