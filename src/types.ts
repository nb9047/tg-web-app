export type Language = 'uz_lat' | 'uz_cyr' | 'ru';

export type AsrMethod = 'hanafi' | 'shafi';

export type ActiveTab = 'bugun' | 'oylik' | 'sozlamalar' | 'qibla';

export interface City {
  id: string;
  nameUz: string; // Uzbek Latin
  nameUzCyr: string; // Uzbek Cyrillic
  nameRu: string; // Russian
  lat: number;
  lng: number;
  timezone: number;
  // Specific offsets to fine-tune and align with Muftiyat schedule (minutes)
  offsets: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface NotificationSettings {
  fajr: boolean;
  sunrise: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface Settings {
  cityId: string;
  language: Language;
  asrMethod: AsrMethod;
  notifications: NotificationSettings;
  preAlertMinutes: number; // 0 (Off), 5, 10, 15, 30
  isRamadanMode: boolean;
}
