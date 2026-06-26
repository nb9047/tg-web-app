import React, { useEffect, useState, useRef } from 'react';
import { City, Settings } from '../types';
import { getTranslation } from '../utils/translations';
import { calculateQiblaDirection } from '../utils/prayerCalc';
import { InfoIcon, QiblaIcon } from './Icons';

interface QiblaCompassProps {
  city: City;
  settings: Settings;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ city, settings }) => {
  const [heading, setHeading] = useState<number>(0);
  const [permissionState, setPermissionState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isManual, setIsManual] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  
  const qiblaAngle = calculateQiblaDirection(city); // Calculate Qibla direction for current city (approx 247 for Tashkent)

  // Webkit deviceorientation permission request
  const requestPermission = async () => {
    const DeviceEvent = window.DeviceOrientationEvent as any;
    if (DeviceEvent && typeof DeviceEvent.requestPermission === 'function') {
      try {
        const response = await DeviceEvent.requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          bindOrientationEvent();
        } else {
          setPermissionState('denied');
          setIsManual(true);
        }
      } catch (err) {
        console.error('Error requesting orientation permission:', err);
        setPermissionState('denied');
        setIsManual(true);
      }
    } else {
      // Standard browser
      setPermissionState('granted');
      bindOrientationEvent();
    }
  };

  const bindOrientationEvent = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // webkitCompassHeading is available on iOS safari / TMA iOS
      let currentHeading = (event as any).webkitCompassHeading;
      
      if (currentHeading === undefined) {
        // Fallback for Android (alpha is counter-clockwise, need to convert to clockwise)
        if (event.alpha !== null) {
          currentHeading = (360 - event.alpha) % 360;
          
          // If absolute orientation is available
          if (event.absolute) {
            setIsManual(false);
          }
        }
      } else {
        setIsManual(false);
      }

      if (currentHeading !== undefined && currentHeading !== null) {
        setHeading(Math.round(currentHeading));
      }
    };

    // Use absolute orientation first for Android devices
    const win = window as any;
    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', handleOrientation as any);
    } else if ('ondeviceorientation' in win) {
      win.addEventListener('deviceorientation', handleOrientation);
    } else {
      setPermissionState('unsupported');
      setIsManual(true);
    }

    return () => {
      win.removeEventListener('deviceorientation', handleOrientation);
      win.removeEventListener('deviceorientationabsolute', handleOrientation as any);
    };
  };

  useEffect(() => {
    // Check if permission API exists
    const DeviceEvent = window.DeviceOrientationEvent as any;
    if (DeviceEvent && typeof DeviceEvent.requestPermission === 'function') {
      // Permission required (iOS)
      setPermissionState('default');
    } else if ('ondeviceorientation' in window || 'ondeviceorientationabsolute' in window) {
      // Standard (Android/some browsers doesn't require upfront request, starts automatically)
      setPermissionState('granted');
      const unbind = bindOrientationEvent();
      return unbind;
    } else {
      setPermissionState('unsupported');
      setIsManual(true);
    }
  }, [city]);

  // Calibration effect simulation
  useEffect(() => {
    setIsCalibrating(true);
    const timer = setTimeout(() => setIsCalibrating(false), 800);
    return () => clearTimeout(timer);
  }, [city]);

  // Fallback Drag-to-Rotate interaction for non-gyroscope environments
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isManual) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isManual || dragStart === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - dragStart;
    
    // Rotate 1.2 degrees per pixel dragged
    setHeading((prev) => (prev - diff * 0.4 + 360) % 360);
    setDragStart(clientX);
  };

  const handleDragEnd = () => {
    setDragStart(null);
  };

  // Helper arrays for clock tick styling
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  // Direction angle calculation relative to device heading
  // If compass is at 0 deg (heading East), the relative Qibla dial should rotate accordingly
  // Needle points to Qibla relative to North
  const needleRotation = (qiblaAngle - heading + 360) % 360;

  return (
    <div className="flex flex-col items-center gap-5 w-full h-full animate-fade-in touch-manipulation">
      {/* Dynamic degree values */}
      <div className="text-center select-none">
        <div 
          className="text-[44px] font-extrabold text-tg-text leading-none flex items-center justify-center"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {heading}°
          <span className="text-primary text-[24px] font-medium align-top ml-1">N</span>
        </div>
        <p className="text-[12px] font-semibold text-tg-hint uppercase tracking-wider mt-1.5">
          {getTranslation(settings.language, 'qibla_angle')}:{' '}
          <span className="text-primary font-bold">{qiblaAngle}°</span>
        </p>
      </div>

      {/* COMPASS CONTAINER */}
      <div 
        className={`relative w-[240px] h-[240px] rounded-full bg-tg-sec-bg border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-center shadow-lg transition-transform duration-300 ${
          isManual ? 'cursor-grab active:cursor-grabbing' : ''
        } ${isCalibrating ? 'scale-95 opacity-80' : 'scale-100'}`}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Short & Long Ticks (Static Ring) */}
        <div className="absolute inset-2 rounded-full border border-black/[0.02] dark:border-white/[0.02]" />
        
        {/* Rotating compass dial containing directional ticks & letters */}
        <div 
          className="absolute inset-0 transition-transform"
          style={{ 
            transform: `rotate(${-heading}deg)`,
            transition: isCalibrating ? 'transform 300ms ease-out' : 'transform 100ms ease-out'
          }}
        >
          {/* North, East, South, West Markers */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[12px] font-black text-red-500">N</span>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-black text-tg-hint">E</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-black text-tg-hint">S</span>
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-black text-tg-hint">W</span>

          {/* Compass Dial Tick Marks */}
          {ticks.map((deg) => {
            const is90 = deg % 90 === 0;
            return (
              <div
                key={deg}
                className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 flex justify-between pointer-events-none px-4"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div 
                  className={`rounded-full ${
                    is90 
                      ? 'w-[4px] h-[4px] bg-tg-hint' 
                      : 'w-[1px] h-[6px] bg-tg-hint/30'
                  }`} 
                />
                <div 
                  className={`rounded-full ${
                    is90 
                      ? 'w-[4px] h-[4px] bg-tg-hint' 
                      : 'w-[1px] h-[6px] bg-tg-hint/30'
                  }`} 
                />
              </div>
            );
          })}
        </div>

        {/* COMPASS NEEDLES (Rotating overlay) */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ 
            transform: `rotate(${needleRotation}deg)`,
            transition: isCalibrating ? 'transform 300ms ease-out' : 'transform 200ms ease-out'
          }}
        >
          {/* North marker secondary helper */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-red-500 opacity-60" />

          {/* SVG needle - Solid primary green pointing to Qibla, minimal Red tip for North */}
          <svg viewBox="0 0 100 100" className="w-[140px] h-[140px] overflow-visible">
            {/* Mekka (Kaaba) Direction Needle */}
            {/* Points straight up (which aligns with qiblaAngle) */}
            <path
              d="M 50,50 L 50,5"
              stroke="#16a37f"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Elegant Pointer Arrow at top of Kaaba direction */}
            <path
              d="M 45,18 L 50,5 L 55,18 Z"
              fill="#16a37f"
            />

            {/* Opposite True North needle end */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="80"
              stroke="var(--tg-theme-hint-color, #71717a)"
              strokeWidth="2"
              strokeDasharray="2 3"
            />
            
            {/* Center Pivot Axis */}
            <circle cx="50" cy="50" r="5" fill="#16a37f" />
            <circle cx="50" cy="50" r="2.5" fill="#ffffff" />
          </svg>

          {/* Dynamic Kaaba icon right at the tip of our Qibla needle */}
          <div className="absolute -translate-y-[62px] bg-primary text-white p-1 rounded-full border-2 border-white dark:border-tg-bg shadow-md">
            <QiblaIcon size={14} className="animate-pulse" />
          </div>
        </div>
      </div>

      {/* Permissions / Drag Guidance Status Callouts */}
      <div className="w-full bg-tg-sec-bg rounded-[14px] p-4 border border-black/[0.02] dark:border-white/[0.02] flex items-start gap-3 select-none">
        <InfoIcon size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5 flex-1">
          <p className="text-[12px] font-semibold text-tg-text leading-tight">
            {isManual 
              ? 'Slayder / Drag rejimida' 
              : getTranslation(settings.language, 'qibla_title')}
          </p>
          <p className="text-[11px] text-tg-hint leading-relaxed">
            {isManual 
              ? 'Sensoringiz yo’qligi sababli, ekranni barmoq/sichqoncha yordamida surib kompasingizni sinab ko’rishingiz mumkin.' 
              : getTranslation(settings.language, 'compass_instruction')}
          </p>

          {permissionState === 'default' && (
            <button
              onClick={requestPermission}
              className="mt-2 text-[12px] font-bold text-white bg-primary px-4 py-1.5 rounded-lg w-max shadow-sm active:scale-95 transition-all"
            >
              {getTranslation(settings.language, 'grant_permission')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
