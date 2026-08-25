import React, { useState } from 'react';
import { City, Settings, Language, AsrMethod } from '../types';
import { UZ_CITIES } from '../utils/prayerCalc';
import { getTranslation } from '../utils/translations';
import { ChevronRightIcon } from './Icons';

// ─── Bot.py bilan moslashtirish uchun mapping lar ───────────────────────────

/** Frontend namoz kalitlari → bot.py kutadigan kalitlar */
const PRAYER_KEY_MAP: Record<string, string> = {
  fajr:    'bomdod',
  dhuhr:   'peshin',
  asr:     'asr',
  maghrib: 'shom',
  isha:    'hufton',
};

/** Frontend til kodlari → bot.py kutadigan til kodlari */
const LANG_MAP: Record<Language, string> = {
  uz_lat: 'uz',
  uz_cyr: 'uz',
  ru:     'ru',
};

/**
 * cityId → bot.py REGIONS kaliti
 * MUHIM: prayerCalc.ts da nameUz 'Fargʻona' (maxsus apostrof),
 * lekin bot.py "Farg'ona" (oddiy apostrof) kutadi.
 * Shuning uchun cityId dan to'g'ridan-to'g'ri mapping ishlatamiz.
 */
const CITY_REGION_MAP: Record<string, string> = {
  tashkent:  'Toshkent',
  andijan:   'Andijon',
  namangan:  'Namangan',
  fergana:   "Farg'ona",
  gulistan:  'Guliston',
  jizzakh:   'Jizzax',
  samarkand: 'Samarqand',
  bukhara:   'Buxoro',
  navoiy:    'Navoiy',
  karshi:    'Qarshi',
  termez:    'Termiz',
  urgench:   'Urganch',
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface SettingsViewProps {
  settings: Settings;
  onUpdateSettings: (updater: (prev: Settings) => Settings) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [activeSelector, setActiveSelector] = useState<'region' | 'language' | null>(null);
  const [saved, setSaved] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTogglePrayerNotify = (prayerKey: keyof Settings['notifications']) => {
    onUpdateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [prayerKey]: !prev.notifications[prayerKey],
      },
    }));
  };

  const handleSelectPreAlert = (minutes: number) => {
    onUpdateSettings((prev) => ({ ...prev, preAlertMinutes: minutes }));
  };

  const handleSelectLanguage = (lang: Language) => {
    onUpdateSettings((prev) => ({ ...prev, language: lang }));
    setActiveSelector(null);
  };

  const handleSelectCity = (cityId: string) => {
    onUpdateSettings((prev) => ({ ...prev, cityId }));
    setActiveSelector(null);
  };

  // ── Bot ga yuborish ────────────────────────────────────────────────────────
  /**
   * Sozlamalarni bot.py ga yuboradi.
   * bot.py kutadigan format:
   * {
   *   region:  string,             // "Toshkent" | "Andijon" | ...
   *   lang:    "uz" | "ru",
   *   advance: number,             // 0 | 5 | 10 | 15 | 30
   *   prayers: {
   *     tong_saharlik: boolean,
   *     peshin:        boolean,
   *     asr:           boolean,
   *     shom_iftor:    boolean,
   *     hufton:        boolean,
   *   }
   * }
   */
  const sendToBot = () => {
    const tg = (window as any).Telegram?.WebApp;

    // Namoz kalitlarini bot formatiga o'girish
    const prayers: Record<string, boolean> = {};
    (Object.keys(settings.notifications) as Array<keyof typeof settings.notifications>)
      .forEach((key) => {
        const botKey = PRAYER_KEY_MAP[key];
        if (botKey) prayers[botKey] = settings.notifications[key];
      });

    // Shahar nomini uz_lat formatida olamiz (bot.py shu nomni kutadi)
    const city = UZ_CITIES.find((c) => c.id === settings.cityId) || UZ_CITIES[0];

    const payload = {
      region:  CITY_REGION_MAP[settings.cityId] || city.nameUz,
      lang:    LANG_MAP[settings.language] || 'uz',
      advance: settings.preAlertMinutes,
      prayers,
    };

    if (tg) {
      tg.sendData(JSON.stringify(payload));
    } else {
      // Development uchun (brauzerda test qilganda)
      console.log('Bot ga yuboriladigan ma\'lumot:', payload);
    }

    // Saqlandi animatsiyasi
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Yordamchi qiymatlar ───────────────────────────────────────────────────

  const currentCity = UZ_CITIES.find((c) => c.id === settings.cityId) || UZ_CITIES[0];

  const getCityName = (city: City): string => {
    if (settings.language === 'uz_cyr') return city.nameUzCyr;
    if (settings.language === 'ru')     return city.nameRu;
    return city.nameUz;
  };

  const langLabels: Record<Language, string> = {
    uz_lat: "O'zbekcha (Lotin)",
    uz_cyr: 'Ўзбекча (Кирилл)',
    ru:     'Русский',
  };

  const preAlertOptions = [0, 5, 10, 15, 30];

  const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 w-full pb-10 animate-fade-in touch-manipulation">

      {/* 1. Joylashuv va Til ──────────────────────────────────────────────── */}
      <div className="bg-tg-sec-bg rounded-[18px] border border-black/[0.02] dark:border-white/[0.02] overflow-hidden">

        {/* Shahar qatori */}
        <button
          onClick={() => setActiveSelector('region')}
          className="w-full flex items-center justify-between p-4 border-b border-black/[0.03] dark:border-white/[0.03] text-left active:bg-black/[0.02] dark:active:bg-white/[0.02] transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-tg-hint tracking-wider uppercase">
              {getTranslation(settings.language, 'region')}
            </span>
            <span className="text-[16px] font-bold text-tg-text mt-0.5">
              {getCityName(currentCity)}
            </span>
          </div>
          <ChevronRightIcon size={18} />
        </button>

        {/* Til qatori */}
        <button
          onClick={() => setActiveSelector('language')}
          className="w-full flex items-center justify-between p-4 text-left active:bg-black/[0.02] dark:active:bg-white/[0.02] transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-tg-hint tracking-wider uppercase">
              {getTranslation(settings.language, 'language')}
            </span>
            <span className="text-[16px] font-bold text-tg-text mt-0.5">
              {langLabels[settings.language]}
            </span>
          </div>
          <ChevronRightIcon size={18} />
        </button>
      </div>

      {/* 2. Eslatmalar ────────────────────────────────────────────────────── */}
      <div className="bg-tg-sec-bg rounded-[18px] border border-black/[0.02] dark:border-white/[0.02] p-4 flex flex-col gap-4">

        <div>
          <h3 className="text-[14px] font-bold text-tg-text">
            {getTranslation(settings.language, 'notification_alerts')}
          </h3>
          <p className="text-[11px] text-tg-hint leading-relaxed mt-0.5">
            {getTranslation(settings.language, 'pre_alert_desc')}
          </p>
        </div>

        {/* Oldindan ogohlantirish chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 select-none">
          {preAlertOptions.map((opt) => {
            const isActive = settings.preAlertMinutes === opt;
            const label =
              opt === 0
                ? getTranslation(settings.language, 'off')
                : `${opt} ${getTranslation(settings.language, 'minutes')}`;

            return (
              <button
                key={opt}
                onClick={() => handleSelectPreAlert(opt)}
                className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                    : 'bg-black/[0.04] dark:bg-white/[0.04] text-tg-text/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Namoz togglelari */}
        <div className="flex flex-col gap-3.5 border-t border-black/[0.03] dark:border-white/[0.03] pt-4 select-none">
          {prayerKeys.map((key) => {
            const label  = getTranslation(settings.language, key);
            const active = settings.notifications[key];

            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-tg-text">
                  {label}
                </span>

                {/* Toggle switch */}
                <button
                  onClick={() => handleTogglePrayerNotify(key)}
                  aria-label={`Toggle ${key}`}
                  className="relative w-[48px] h-[28px] rounded-full transition-colors duration-200 outline-none"
                  style={{
                    backgroundColor: active
                      ? '#16a37f'
                      : 'var(--tg-theme-hint-color, #71717a)',
                  }}
                >
                  <span
                    className="absolute top-[2px] left-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
                    style={{ transform: active ? 'translateX(20px)' : 'translateX(0px)' }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Saqlash tugmasi ───────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={sendToBot}
          className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all duration-200 ${
            saved
              ? 'bg-green-500 text-white scale-[0.98]'
              : 'bg-primary text-white active:opacity-80 active:scale-[0.98]'
          }`}
        >
          {saved
            ? (settings.language === 'ru' ? '✓ Сохранено' : "✓ Saqlandi")
            : getTranslation(settings.language, 'save')}
        </button>

        {!saved && (
          <p className="text-[11px] text-tg-hint text-center leading-relaxed">
            {settings.language === 'ru'
              ? 'После изменений нажмите кнопку «Сохранить»'
              : settings.language === 'en'
              ? 'Press Save after making changes'
              : "O'zgartirishlardan so'ng Saqlash tugmasini bosing"}
          </p>
        )}
      </div>

      {/* 4. Overlay Sheet ─────────────────────────────────────────────────── */}
      {activeSelector && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setActiveSelector(null)} />

          <div className="relative bg-tg-bg w-full max-w-md rounded-t-[24px] p-5 shadow-xl max-h-[80vh] flex flex-col z-10 animate-slide-up select-none">
            {/* Handle */}
            <div className="w-12 h-1 bg-tg-hint/30 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-tg-text">
                {activeSelector === 'region'
                  ? getTranslation(settings.language, 'region')
                  : getTranslation(settings.language, 'language')}
              </h3>
              <button
                onClick={() => setActiveSelector(null)}
                className="text-[14px] font-bold text-primary active:scale-95"
              >
                {settings.language === 'ru' ? 'Закрыть' : 'Yopish'}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-1 pr-1">

              {/* Shahar tanlash */}
              {activeSelector === 'region' &&
                UZ_CITIES.map((city) => {
                  const isSelected = city.id === settings.cityId;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-tg-text'
                      }`}
                    >
                      <span>{getCityName(city)}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}

              {/* Til tanlash */}
              {activeSelector === 'language' &&
                (Object.keys(langLabels) as Language[]).map((lang) => {
                  const isSelected = lang === settings.language;
                  return (
                    <button
                      key={lang}
                      onClick={() => handleSelectLanguage(lang)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-tg-text'
                      }`}
                    >
                      <span>{langLabels[lang]}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
