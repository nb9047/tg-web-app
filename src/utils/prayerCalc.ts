import { City, PrayerTimes, AsrMethod } from '../types';

export const UZ_CITIES: City[] = [
  {
    id: 'tashkent',
    nameUz: 'Toshkent',
    nameUzCyr: 'Тошкент',
    nameRu: 'Ташкент',
    lat: 41.311081,
    lng: 69.240562,
    timezone: 5,
    offsets: { fajr: 2, sunrise: 0, dhuhr: 4, asr: 2, maghrib: 3, isha: 3 }
  },
  {
    id: 'andijan',
    nameUz: 'Andijon',
    nameUzCyr: 'Андижон',
    nameRu: 'Андижан',
    lat: 40.78206,
    lng: 72.34424,
    timezone: 5,
    offsets: { fajr: -2, sunrise: -1, dhuhr: 3, asr: 1, maghrib: 2, isha: 2 }
  },
  {
    id: 'namangan',
    nameUz: 'Namangan',
    nameUzCyr: 'Наманган',
    nameRu: 'Наманган',
    lat: 40.9983,
    lng: 71.6726,
    timezone: 5,
    offsets: { fajr: -1, sunrise: 0, dhuhr: 3, asr: 1, maghrib: 2, isha: 2 }
  },
  {
    id: 'fergana',
    nameUz: 'Fargʻona',
    nameUzCyr: 'Фарғона',
    nameRu: 'Фергана',
    lat: 40.3864,
    lng: 71.7864,
    timezone: 5,
    offsets: { fajr: -1, sunrise: 0, dhuhr: 3, asr: 1, maghrib: 2, isha: 2 }
  },
  {
    id: 'gulistan',
    nameUz: 'Guliston',
    nameUzCyr: 'Гулистон',
    nameRu: 'Гулистан',
    lat: 40.4897,
    lng: 68.7847,
    timezone: 5,
    offsets: { fajr: 3, sunrise: 1, dhuhr: 4, asr: 3, maghrib: 3, isha: 4 }
  },
  {
    id: 'jizzakh',
    nameUz: 'Jizzax',
    nameUzCyr: 'Жиззах',
    nameRu: 'Джизак',
    lat: 40.1158,
    lng: 67.8422,
    timezone: 5,
    offsets: { fajr: 4, sunrise: 2, dhuhr: 4, asr: 3, maghrib: 4, isha: 4 }
  },
  {
    id: 'samarkand',
    nameUz: 'Samarqand',
    nameUzCyr: 'Самарқанд',
    nameRu: 'Самарканд',
    lat: 39.6542,
    lng: 66.9597,
    timezone: 5,
    offsets: { fajr: 5, sunrise: 3, dhuhr: 5, asr: 4, maghrib: 4, isha: 4 }
  },
  {
    id: 'bukhara',
    nameUz: 'Buxoro',
    nameUzCyr: 'Бухоро',
    nameRu: 'Бухара',
    lat: 39.7747,
    lng: 64.4286,
    timezone: 5,
    offsets: { fajr: 7, sunrise: 4, dhuhr: 6, asr: 5, maghrib: 5, isha: 5 }
  },
  {
    id: 'navoiy',
    nameUz: 'Navoiy',
    nameUzCyr: 'Навоий',
    nameRu: 'Навои',
    lat: 40.0844,
    lng: 65.3792,
    timezone: 5,
    offsets: { fajr: 6, sunrise: 3, dhuhr: 5, asr: 4, maghrib: 5, isha: 5 }
  },
  {
    id: 'karshi',
    nameUz: 'Qarshi',
    nameUzCyr: 'Қарши',
    nameRu: 'Карши',
    lat: 38.8612,
    lng: 65.7847,
    timezone: 5,
    offsets: { fajr: 7, sunrise: 4, dhuhr: 6, asr: 5, maghrib: 5, isha: 5 }
  },
  {
    id: 'termez',
    nameUz: 'Termiz',
    nameUzCyr: 'Термиз',
    nameRu: 'Термез',
    lat: 37.2242,
    lng: 67.2783,
    timezone: 5,
    offsets: { fajr: 6, sunrise: 4, dhuhr: 5, asr: 4, maghrib: 4, isha: 4 }
  },
  {
    id: 'urgench',
    nameUz: 'Urganch',
    nameUzCyr: 'Урганч',
    nameRu: 'Ургенч',
    lat: 41.5500,
    lng: 60.6333,
    timezone: 5,
    offsets: { fajr: 12, sunrise: 8, dhuhr: 8, asr: 7, maghrib: 8, isha: 9 }
  },
  {
    id: 'nukus',
    nameUz: 'Nukus',
    nameUzCyr: 'Нукус',
    nameRu: 'Нукус',
    lat: 42.4533,
    lng: 59.6108,
    timezone: 5,
    offsets: { fajr: 13, sunrise: 9, dhuhr: 9, asr: 8, maghrib: 9, isha: 10 }
  }
];

// Julian Date helper
function getJulianDate(date: Date): number {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
  return jd;
}

// Convert Radians to Degrees
const radToDeg = (rad: number) => (rad * 180.0) / Math.PI;

// Convert Degrees to Radians
const degToRad = (deg: number) => (deg * Math.PI) / 180.0;

// High-precision solar calculation
export const calculatePrayerTimes = (
  date: Date,
  city: City,
  asrMethod: AsrMethod = 'hanafi'
): PrayerTimes => {
  const jd = getJulianDate(date);
  const D = jd - 2451545.0; // Days since J2000.0

  // Anomalistic mean longitude of the Sun
  const g = 357.529 + 0.98560028 * D;
  const gRad = degToRad(g % 360);

  // Mean longitude of the Sun
  const q = 280.459 + 0.98564736 * D;
  
  // Geocentric apparent longitude of the Sun (ecliptic longitude)
  const L = q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  const LRad = degToRad(L % 360);

  // Obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * D;
  const eRad = degToRad(e);

  // Solar declination
  const sinDelta = Math.sin(eRad) * Math.sin(LRad);
  const delta = Math.asin(sinDelta); // Declination in radians

  // Equation of time (using Spencer formula approximation)
  // Day angle in radians
  const gamma = (2 * Math.PI * (D - 1)) / 365.2425;
  const eqt =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)); // EqT in minutes

  const latRad = degToRad(city.lat);

  // Solar noon (Dhuhr) in local hours
  // 12 + timezone - longitude/15 - EoT/60
  const solarNoonDecimal = 12 + city.timezone - city.lng / 15 - eqt / 60;

  // Hour Angle function
  const computeHourAngle = (altitudeDeg: number): number => {
    const altRad = degToRad(altitudeDeg);
    const cosH =
      (Math.sin(altRad) - Math.sin(latRad) * Math.sin(delta)) /
      (Math.cos(latRad) * Math.cos(delta));

    if (cosH < -1) return 0; // Polar night
    if (cosH > 1) return 24; // Polar day
    return radToDeg(Math.acos(cosH)) / 15; // in hours
  };

  // 1. Fajr (Dawn) - Uzbek custom is using -18.0 degrees twilight angle
  const fajrHourAngle = computeHourAngle(-18.0);
  let fajrDecimal = solarNoonDecimal - fajrHourAngle;

  // 2. Shuruk (Sunrise) - standard refraction -0.833 degrees
  const sunriseHourAngle = computeHourAngle(-0.833);
  let sunriseDecimal = solarNoonDecimal - sunriseHourAngle;

  // 3. Sunset / Maghrib - standard refraction -0.833 degrees
  const sunsetHourAngle = computeHourAngle(-0.833);
  let sunsetDecimal = solarNoonDecimal + sunsetHourAngle;

  // 4. Isha (Night) - standard twilight -17.0 degrees
  const ishaHourAngle = computeHourAngle(-17.0);
  let ishaDecimal = solarNoonDecimal + ishaHourAngle;

  // 5. Asr (Afternoon)
  // Shafi (N = 1) or Hanafi (N = 2) shadow factors
  const N = asrMethod === 'hanafi' ? 2 : 1;
  const tempCot = N + Math.abs(Math.tan(latRad - delta));
  const asrAltitude = Math.atan(1 / tempCot); // altitude in radians
  const asrHourAngle = radToDeg(
    Math.acos(
      (Math.sin(asrAltitude) - Math.sin(latRad) * Math.sin(delta)) /
        (Math.cos(latRad) * Math.cos(delta))
    )
  ) / 15;
  let asrDecimal = solarNoonDecimal + asrHourAngle;

  // Apply custom city-specific fine-tuning offsets (and convert to decimal hours first)
  const applyOffset = (decimalHours: number, offsetMinutes: number): number => {
    return decimalHours + offsetMinutes / 60;
  };

  fajrDecimal = applyOffset(fajrDecimal, city.offsets.fajr);
  sunriseDecimal = applyOffset(sunriseDecimal, city.offsets.sunrise);
  const dhuhrDecimal = applyOffset(solarNoonDecimal, city.offsets.dhuhr);
  asrDecimal = applyOffset(asrDecimal, city.offsets.asr);
  sunsetDecimal = applyOffset(sunsetDecimal, city.offsets.maghrib);
  ishaDecimal = applyOffset(ishaDecimal, city.offsets.isha);

  // Formatter to string HH:MM
  const formatTime = (decimalHours: number): string => {
    if (isNaN(decimalHours)) return '--:--';
    let hours = Math.floor(decimalHours);
    let minutes = Math.round((decimalHours - hours) * 60);
    if (minutes === 60) {
      hours += 1;
      minutes = 0;
    }
    hours = (hours + 24) % 24;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return {
    fajr: formatTime(fajrDecimal),
    sunrise: formatTime(sunriseDecimal),
    dhuhr: formatTime(dhuhrDecimal),
    asr: formatTime(asrDecimal),
    maghrib: formatTime(sunsetDecimal), // Maghrib is sunset time + offset
    isha: formatTime(ishaDecimal)
  };
};

export function getHijriDate(date: Date): {
  day: number;
  monthIndex: number; // 0-indexed (0=Muharram, 11=Zulhijja)
  year: number;
} {
  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const day   = date.getDate();

  // Kuwaiti algoritm — bot.py bilan aynan bir xil
  const a   = Math.floor((14 - month) / 12);
  const y   = year + 4800 - a;
  const m   = month + 12 * a - 3;
  const jdn = day
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045;

  let l       = jdn - 1948440 + 10632;
  const n     = Math.floor((l - 1) / 10631);
  l           = l - 10631 * n + 354;
  const j     = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
              + Math.floor(l / 5670)            * Math.floor((43 * l) / 15238);
  l           = l
              - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
              - Math.floor(j / 16)         * Math.floor((15238 * j) / 43)
              + 29;

  const hMonth = Math.floor((24 * l) / 709);
  const hDay   = l - Math.floor((709 * hMonth) / 24);
  const hYear  = 30 * n + j - 30;

  return {
    day:        hDay,
    monthIndex: hMonth - 1,  // 0-indexed, qolgan kod bilan mos
    year:       hYear,
  };
}
// Qibla Direction calculation (degrees from True North clockwise)
// Mekka is located at Lat 21.4225, Lng 39.8262
export const calculateQiblaDirection = (city: City): number => {
  const mekkaLat = degToRad(21.4225);
  const mekkaLng = degToRad(39.8262);
  const cityLat = degToRad(city.lat);
  const cityLng = degToRad(city.lng);

  const deltaLng = mekkaLng - cityLng;

  const y = Math.sin(deltaLng);
  const x =
    Math.cos(cityLat) * Math.tan(mekkaLat) - Math.sin(cityLat) * Math.cos(deltaLng);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = radToDeg(qiblaRad);

  // Normalize to 0 - 360 degrees
  qiblaDeg = (qiblaDeg + 360) % 360;
  return Math.round(qiblaDeg);
};
