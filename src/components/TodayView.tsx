import React, { useEffect, useState } from 'react';
import { City, PrayerTimes, Settings } from '../types';
import { getTranslation } from '../utils/translations';
import { 
  FajrIcon, 
  DhuhrIcon, 
  AsrIcon, 
  MaghribIcon, 
  IshaIcon, 
  BellIcon,
  IslamicCrescentIcon
} from './Icons';

interface TodayViewProps {
  city: City;
  times: PrayerTimes;
  tomorrowTimes: PrayerTimes;
  settings: Settings;
  toggleNotification: (prayerKey: keyof PrayerTimes) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  city,
  times,
  tomorrowTimes,
  settings,
  toggleNotification,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [progressOffset, setProgressOffset] = useState<number>(251.3);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Conversions
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr || timeStr === '--:--') return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = currentMinutes * 60 + now.getSeconds();

  const prayerKeys: { key: keyof PrayerTimes; labelKey: string; icon: React.ReactNode }[] = [
    { key: 'fajr', labelKey: 'fajr', icon: <FajrIcon size={20} /> },
    { key: 'sunrise', labelKey: 'sunrise', icon: <IslamicCrescentIcon size={20} /> }, // Custom crescent path
    { key: 'dhuhr', labelKey: 'dhuhr', icon: <DhuhrIcon size={20} /> },
    { key: 'asr', labelKey: 'asr', icon: <AsrIcon size={20} /> },
    { key: 'maghrib', labelKey: 'maghrib', icon: <MaghribIcon size={20} /> },
    { key: 'isha', labelKey: 'isha', icon: <IshaIcon size={20} /> },
  ];

  // Map prayer times to seconds from midnight
  const getSecondsFromMidnight = (timeStr: string): number => {
    return timeToMinutes(timeStr) * 60;
  };

  // Find next & previous prayers
  let nextPrayerName = 'fajr';
  let nextPrayerTimeStr = times.fajr;
  let prevPrayerTimeStr = times.isha;
  let isNextPrayerTomorrow = false;

  const fajrSec = getSecondsFromMidnight(times.fajr);
  const sunriseSec = getSecondsFromMidnight(times.sunrise);
  const dhuhrSec = getSecondsFromMidnight(times.dhuhr);
  const asrSec = getSecondsFromMidnight(times.asr);
  const maghribSec = getSecondsFromMidnight(times.maghrib);
  const ishaSec = getSecondsFromMidnight(times.isha);

  if (currentSeconds < fajrSec) {
    nextPrayerName = 'fajr';
    nextPrayerTimeStr = times.fajr;
    prevPrayerTimeStr = times.isha; // Isha of yesterday
  } else if (currentSeconds >= fajrSec && currentSeconds < sunriseSec) {
    nextPrayerName = 'sunrise';
    nextPrayerTimeStr = times.sunrise;
    prevPrayerTimeStr = times.fajr;
  } else if (currentSeconds >= sunriseSec && currentSeconds < dhuhrSec) {
    nextPrayerName = 'dhuhr';
    nextPrayerTimeStr = times.dhuhr;
    prevPrayerTimeStr = times.sunrise;
  } else if (currentSeconds >= dhuhrSec && currentSeconds < asrSec) {
    nextPrayerName = 'asr';
    nextPrayerTimeStr = times.asr;
    prevPrayerTimeStr = times.dhuhr;
  } else if (currentSeconds >= asrSec && currentSeconds < maghribSec) {
    nextPrayerName = 'maghrib';
    nextPrayerTimeStr = times.maghrib;
    prevPrayerTimeStr = times.asr;
  } else if (currentSeconds >= maghribSec && currentSeconds < ishaSec) {
    nextPrayerName = 'isha';
    nextPrayerTimeStr = times.isha;
    prevPrayerTimeStr = times.maghrib;
  } else {
    // All prayers of today passed
    nextPrayerName = 'fajr';
    nextPrayerTimeStr = tomorrowTimes.fajr;
    prevPrayerTimeStr = times.isha;
    isNextPrayerTomorrow = true;
  }

  // Calculate remaining seconds
  let targetSec = getSecondsFromMidnight(nextPrayerTimeStr);
  if (isNextPrayerTomorrow) {
    targetSec += 24 * 60 * 60; // Add 1 day in seconds
  }

  const remainingTotalSeconds = Math.max(0, targetSec - currentSeconds);
  const hoursRemaining = Math.floor(remainingTotalSeconds / 3600);
  const minutesRemaining = Math.floor((remainingTotalSeconds % 3600) / 60);
  const secondsRemaining = remainingTotalSeconds % 60;

  // Progress Arc calculation
  // Percentage progress from previous prayer to next prayer
  let prevSec = getSecondsFromMidnight(prevPrayerTimeStr);
  let currentSecAdjusted = currentSeconds;

  if (isNextPrayerTomorrow) {
    if (currentSeconds < prevSec) {
      // It's early morning before Fajr (prevSec is yesterday's Isha, let's treat yesterday's Isha as negative time)
      prevSec -= 24 * 60 * 60;
    } else {
      // It's after today's Isha, counting down to tomorrow's Fajr
      // targetSec is tomorrow's Fajr (already has 24h added)
      // currentSecAdjusted is today's late night
    }
  } else if (currentSeconds < fajrSec && prevPrayerTimeStr === times.isha) {
    // Early morning before Fajr, previous is yesterday's Isha
    prevSec -= 24 * 60 * 60;
  }

  const intervalTotalSeconds = targetSec - prevSec;
  const intervalElapsedSeconds = currentSecAdjusted - prevSec;
  
  const rawProgress = intervalTotalSeconds > 0 ? intervalElapsedSeconds / intervalTotalSeconds : 0;
  const progressPercentage = Math.max(0, Math.min(1, rawProgress));

  // Circumference of semi-circle of r=88 is 276.5
  useEffect(() => {
    // Smooth 1-second transition
    const offset = 276.5 - 276.5 * progressPercentage;
    setProgressOffset(offset);
  }, [progressPercentage]);

  // Check if a prayer card is passed
  const isPassed = (key: keyof PrayerTimes): boolean => {
    if (isNextPrayerTomorrow) return true;
    const keySec = getSecondsFromMidnight(times[key]);
    return currentSeconds >= keySec;
  };

  // Check if a prayer card is currently active (next prayer)
  const isActive = (key: keyof PrayerTimes): boolean => {
    return nextPrayerName === key && !isNextPrayerTomorrow;
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-in touch-manipulation">
      {/* 1. Hero Progress Arc */}
      <div className="relative flex flex-col items-center bg-primary-dim/50 dark:bg-primary-dim/20 rounded-[28px] p-6 border border-primary/10 overflow-hidden">
        {/* SVG Curve Background Overlay */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-5 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0, 50 0, 100 100" stroke="var(--accent)" fill="transparent" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Text Above Arc */}
        <p className="text-[11px] font-black text-primary tracking-[6px] uppercase mb-4 text-center select-none">
          {getTranslation(settings.language, 'next_prayer')}
        </p>

        {/* The SVG Arc */}
        <div className="relative w-full max-w-[260px] aspect-[2/1] flex justify-center items-end select-none">
          <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
            {/* Background Arch Track */}
            <path
              d="M 12 100 A 88 88 0 0 1 188 100"
              fill="none"
              stroke="rgba(22, 163, 127, 0.12)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Realized Active Progress Track */}
            <path
              d="M 12 100 A 88 88 0 0 1 188 100"
              fill="none"
              stroke="#16a37f"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="276.5"
              strokeDashoffset={progressOffset}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>

          {/* Central Timer Information Box */}
          <div className="absolute bottom-1.5 flex flex-col items-center justify-center text-center">
            <h2 className="text-[18px] font-black font-display text-primary tracking-[6px] pl-[6px] uppercase leading-none">
              {getTranslation(settings.language, nextPrayerName)}
            </h2>
            
            <div 
              className="text-[28px] font-black text-tg-text tracking-tight leading-none mt-1.5 mb-1"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {hoursRemaining.toString().padStart(2, '0')}
              <span className="animate-pulse text-primary mx-0.5">:</span>
              {minutesRemaining.toString().padStart(2, '0')}
              <span className="animate-pulse text-primary mx-0.5">:</span>
              {secondsRemaining.toString().padStart(2, '0')}
            </div>
            
            <span className="text-[10px] font-extrabold text-tg-hint uppercase tracking-[4px] pl-[4px]">
              {getTranslation(settings.language, 'remaining')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. End of Day State or Special Notices */}
      {isNextPrayerTomorrow && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[14px] p-4 text-center flex flex-col gap-1 select-none">
          <p className="text-[13px] font-bold text-amber-600 dark:text-amber-500">
            {getTranslation(settings.language, 'all_passed')}
          </p>
          <p className="text-[12px] font-medium text-tg-hint">
            {getTranslation(settings.language, 'tomorrow_fajr')}:{' '}
            <span className="text-tg-text font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {tomorrowTimes.fajr}
            </span>
          </p>
        </div>
      )}

      {/* 3. Prayer Cards List */}
      <div className="flex flex-col gap-2">
        {prayerKeys.map(({ key, labelKey, icon }) => {
          const isPrayerPassed = isPassed(key);
          const isPrayerActive = isActive(key);
          const timeValue = times[key];
          const isNotifyActive = settings.notifications[key as keyof typeof settings.notifications];

          // Determine specific styles for card states to match high density
          let cardClasses = "relative flex items-center justify-between p-4 rounded-[14px] transition-all duration-200";
          if (isPrayerPassed) {
            cardClasses += " opacity-[0.45] hover:opacity-[0.6] bg-tg-bg border border-gray-100 dark:border-neutral-900";
          } else if (isPrayerActive) {
            cardClasses += " bg-primary-dim/60 dark:bg-primary-dim/30 border-l-[3px] border-l-primary border-y border-r border-primary/10";
          } else {
            cardClasses += " bg-tg-bg border border-gray-100 dark:border-neutral-900 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]";
          }

          return (
            <div
              key={key}
              id={`prayer-card-${key}`}
              className={cardClasses}
              style={{ contentVisibility: 'auto' }}
            >
              {/* Left Column: Icon and Name */}
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-full ${
                  isPrayerActive 
                    ? 'bg-primary/10 text-primary' 
                    : isPrayerPassed 
                      ? 'bg-tg-hint/5 text-tg-hint' 
                      : 'bg-black/[0.03] dark:bg-white/[0.03] text-tg-text/85'
                }`}>
                  {icon}
                </div>
                <div>
                  <h4 className={`text-[15px] font-bold tracking-tight ${
                    isPrayerActive ? 'text-primary' : 'text-tg-text'
                  }`}>
                    {getTranslation(settings.language, labelKey)}
                  </h4>
                  <p className="text-[10px] font-bold text-tg-hint uppercase tracking-wider">
                    {isPrayerActive 
                      ? getTranslation(settings.language, 'active') 
                      : isPrayerPassed 
                        ? getTranslation(settings.language, 'passed') 
                        : ''}
                  </p>
                </div>
              </div>

              {/* Right Column: Time & Bell */}
              <div className="flex items-center gap-4">
                <div 
                  className={`text-[21px] font-black tracking-tight ${
                    isPrayerActive ? 'text-primary' : 'text-tg-text'
                  }`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {timeValue}
                </div>
                
                {/* Notification Bell Toggle (Skip Sunrise) */}
                {key !== 'sunrise' ? (
                  <button
                    onClick={() => toggleNotification(key)}
                    id={`notify-btn-${key}`}
                    className={`p-2 rounded-xl transition-all active:scale-95 ${
                      isNotifyActive 
                        ? 'text-primary hover:bg-primary/5' 
                        : 'text-tg-hint/50 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    aria-label={`Toggle notifications for ${key}`}
                  >
                    <BellIcon size={18} active={isNotifyActive} />
                  </button>
                ) : (
                  <div className="w-[34px]" /> // Placeholder for alignment
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
