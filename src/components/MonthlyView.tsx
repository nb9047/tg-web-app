import React, { useState } from 'react';
import { City, Settings } from '../types';
import { getTranslation } from '../utils/translations';
import { calculatePrayerTimes, getHijriDate } from '../utils/prayerCalc';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface MonthlyViewProps {
  city: City;
  settings: Settings;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ city, settings }) => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  const monthNamesUz = [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr'
  ];

  const monthNamesRu = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь'
  ];

  const getMonthName = (month: number): string => {
    return settings.language === 'ru' ? monthNamesRu[month] : monthNamesUz[month];
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Generate days in month
  const getDaysInMonth = (month: number, year: number): Date[] => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(selectedMonth, selectedYear);

  return (
    <div className="flex flex-col gap-4 w-full h-full animate-fade-in touch-manipulation">
      {/* Monthly Pagination Header */}
      <div className="flex items-center justify-between bg-tg-sec-bg px-4 py-3 rounded-[14px] border border-black/[0.02] dark:border-white/[0.02] select-none">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-tg-text/80 active:scale-90 active:bg-black/5 dark:active:bg-white/5 transition-all"
          aria-label="Previous Month"
        >
          <ChevronLeftIcon size={18} />
        </button>

        <span className="text-[16px] font-bold text-tg-text tracking-wide">
          {getMonthName(selectedMonth)} {selectedYear}
        </span>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-tg-text/80 active:scale-90 active:bg-black/5 dark:active:bg-white/5 transition-all"
          aria-label="Next Month"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>

      {/* Monthly Calendar Table */}
      <div className="flex-1 bg-tg-sec-bg rounded-[18px] border border-black/[0.02] dark:border-white/[0.02] overflow-hidden flex flex-col">
        {/* Sticky Grid Header */}
        <div className="grid grid-cols-[38px_1fr_1fr_1fr_1fr_1fr_1fr] bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.05] sticky top-0 py-3 text-center text-[10px] font-bold text-tg-hint uppercase tracking-wider z-10">
          <div>{getTranslation(settings.language, 'day')}</div>
          <div>{getTranslation(settings.language, 'fajr_short')}</div>
          <div>{getTranslation(settings.language, 'sunrise_short')}</div>
          <div>{getTranslation(settings.language, 'dhuhr_short')}</div>
          <div>{getTranslation(settings.language, 'asr_short')}</div>
          <div>{getTranslation(settings.language, 'maghrib_short')}</div>
          <div>{getTranslation(settings.language, 'isha_short')}</div>
        </div>

        {/* Scrollable Grid Body */}
        <div className="overflow-y-auto max-h-[60vh] divide-y divide-black/[0.03] dark:divide-white/[0.03] select-none">
          {days.map((dayDate) => {
            const isToday =
              dayDate.getDate() === today.getDate() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getFullYear() === today.getFullYear();

            const pTimes = calculatePrayerTimes(dayDate, city, settings.asrMethod);
            const hijri = getHijriDate(dayDate);
            const isRamadan = hijri.monthIndex === 8; // Ramadan month

            // Layout row styling
            let rowClasses = 'grid grid-cols-[38px_1fr_1fr_1fr_1fr_1fr_1fr] py-3 text-center text-[13px] items-center transition-all duration-150 relative';
            if (isToday) {
              rowClasses += ' bg-primary/[0.08] font-bold text-primary';
            } else {
              rowClasses += ' text-tg-text hover:bg-black/[0.01] dark:hover:bg-white/[0.01]';
            }

            if (isRamadan) {
              rowClasses += ' border-l-[3px] border-l-[#d97706] bg-[#d97706]/[0.03] dark:bg-[#d97706]/[0.01]';
            }

            return (
              <div 
                key={dayDate.getTime()} 
                className={rowClasses}
                style={{ contentVisibility: 'auto' }}
              >
                {/* Day representation */}
                <div className="flex flex-col items-center justify-center border-r border-black/[0.03] dark:border-white/[0.03]">
                  <span className={`text-[13px] font-extrabold ${isToday ? 'text-primary' : ''}`}>
                    {dayDate.getDate()}
                  </span>
                  <span className={`text-[8px] font-bold -mt-0.5 ${isRamadan ? 'text-[#d97706]' : 'opacity-75'}`}>
                    {hijri.day}
                  </span>
                </div>

                {/* Times with tabular numerals */}
                <div className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {pTimes.fajr}
                </div>
                <div className="opacity-70" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {pTimes.sunrise}
                </div>
                <div className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {pTimes.dhuhr}
                </div>
                <div className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {pTimes.asr}
                </div>
                <div className="font-bold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {pTimes.maghrib}
                </div>
                <div className="font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {pTimes.isha}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
