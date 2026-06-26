import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  uz_lat: {
    title: 'Namoz Vaqtlari',
    bugun: 'Bugun',
    oylik: 'Oylik',
    sozlamalar: 'Sozlamalar',
    qibla: 'Qibla',
    
    // Prayers
    fajr: 'Bomdod',
    sunrise: 'Quyosh',
    dhuhr: 'Peshin',
    asr: 'Asr',
    maghrib: 'Shom',
    isha: 'Xufton',
    
    // Countdown and Hero
    next_prayer: 'Keyingi namoz',
    remaining: 'qoldi',
    passed: 'O’tdi',
    active: 'Hozirgi',
    all_passed: 'Bugungi namozlar tugadi',
    tomorrow_fajr: 'Ertangi Bomdod',
    
    // Monthly
    monthly_calendar: 'Oylik Taqvim',
    day: 'Kun',
    fajr_short: 'Bom',
    sunrise_short: 'Quy',
    dhuhr_short: 'Pes',
    asr_short: 'Asr',
    maghrib_short: 'Sho',
    isha_short: 'Xuf',
    
    // Settings
    settings_title: 'Sozlamalar',
    region: 'Hudud',
    language: 'Til',
    notification_alerts: 'Bildirishnomalar',
    pre_alert: 'Oldindan ogohlantirish',
    pre_alert_desc: 'Namoz vaqtidan bir necha daqiqa oldin xabar berish',
    ramadan_mode: 'Ramazon rejimi',
    ramadan_desc: 'Ramazon Muborak oltin bannerini ko‘rsatish',
    asr_calc_method: 'Asr hisoblash usuli',
    hanafi_shadow: 'Hanafiy (2x soya)',
    shafi_shadow: 'Shofiy (1x soya)',
    minutes: 'daqiqa',
    off: 'O‘chirilgan',
    
    // Qibla
    qibla_title: 'Qibla Kompasi',
    qibla_angle: 'Qibla burchagi',
    compass_instruction: 'Kompisning to‘g‘ri ishlashi uchun qurilmani tekis ushlang.',
    compass_error: 'Qurilma orientatsiyasi qo‘llab-quvvatlanmaydi.',
    compass_not_allowed: 'Kompasga kirishga ruxsat berilmagan.',
    grant_permission: 'Ruxsat berish',
    
    // General / Fallbacks
    ramadan_blessing: 'Ramazon Muborak!',
    retry: 'Qayta urinish',
    api_error: 'Ma’lumotlarni yuklab bo‘lmadi. Offline rejim faollashtirildi.',
    loading: 'Yuklanmoqda...'
  },
  uz_cyr: {
    title: 'Намоз Вақтлари',
    bugun: 'Бугун',
    oylik: 'Ойлик',
    sozlamalar: 'Созламалар',
    qibla: 'Қибла',
    
    // Prayers
    fajr: 'Бомдод',
    sunrise: 'Қуёш',
    dhuhr: 'Пешин',
    asr: 'Аср',
    maghrib: 'Шом',
    isha: 'Хуфтон',
    
    // Countdown and Hero
    next_prayer: 'Кейинги намоз',
    remaining: 'қолди',
    passed: 'Ўтди',
    active: 'Ҳозирги',
    all_passed: 'Бугунги намозлар тугади',
    tomorrow_fajr: 'Эртанги Бомдод',
    
    // Monthly
    monthly_calendar: 'Ойлик Тақвим',
    day: 'Кун',
    fajr_short: 'Бом',
    sunrise_short: 'Қуё',
    dhuhr_short: 'Пеш',
    asr_short: 'Аср',
    maghrib_short: 'Шом',
    isha_short: 'Хуф',
    
    // Settings
    settings_title: 'Созламалар',
    region: 'Ҳудуд',
    language: 'Тил',
    notification_alerts: 'Билдиришномалар',
    pre_alert: 'Олдиндан огоҳлантириш',
    pre_alert_desc: 'Намоз вақтидан бир неча дақиқа олдин хабар бериш',
    ramadan_mode: 'Рамазон режими',
    ramadan_desc: 'Рамазон Муборак олтин баннерини кўрсатиш',
    asr_calc_method: 'Аср ҳисоблаш усули',
    hanafi_shadow: 'Ҳанафий (2х соя)',
    shafi_shadow: 'Шофий (1х соя)',
    minutes: 'дақиқа',
    off: 'Ўчирилган',
    
    // Qibla
    qibla_title: 'Қибла Компаси',
    qibla_angle: 'Қибла бурчаги',
    compass_instruction: 'Компаснинг тўғри ишлаши учун қурилмани текис ушланг.',
    compass_error: 'Қурилма ориентацияси қўллаб-қувватланмайди.',
    compass_not_allowed: 'Компасга киришга рухсат берилмаган.',
    grant_permission: 'Рухсат бериш',
    
    // General / Fallbacks
    ramadan_blessing: 'Рамазон Муборак!',
    retry: 'Қайта уриниш',
    api_error: 'Маълумотларни юклаб бўлмади. Оффлайн режим фаоллаштирилди.',
    loading: 'Юкланмоқда...'
  },
  ru: {
    title: 'Время Намаза',
    bugun: 'Сегодня',
    oylik: 'Месяц',
    sozlamalar: 'Настройки',
    qibla: 'Кибла',
    
    // Prayers
    fajr: 'Фаджр',
    sunrise: 'Восход',
    dhuhr: 'Зухр',
    asr: 'Аср',
    maghrib: 'Магриб',
    isha: 'Иша',
    
    // Countdown and Hero
    next_prayer: 'Следующий намаз',
    remaining: 'осталось',
    passed: 'Прошло',
    active: 'Текущий',
    all_passed: 'Сегодняшние намазы завершены',
    tomorrow_fajr: 'Завтрашний Фаджр',
    
    // Monthly
    monthly_calendar: 'Месячный Календарь',
    day: 'День',
    fajr_short: 'Фад',
    sunrise_short: 'Вос',
    dhuhr_short: 'Зух',
    asr_short: 'Аср',
    maghrib_short: 'Маг',
    isha_short: 'Иша',
    
    // Settings
    settings_title: 'Настройки',
    region: 'Регион',
    language: 'Язык',
    notification_alerts: 'Уведомления',
    pre_alert: 'Предварительное оповещение',
    pre_alert_desc: 'Оповещать за несколько минут до начала намаза',
    ramadan_mode: 'Режим Рамадан',
    ramadan_desc: 'Показывать золотой баннер «Рамадан Мубарак»',
    asr_calc_method: 'Расчет Асра',
    hanafi_shadow: 'Ханафи (2х тень)',
    shafi_shadow: 'Шафии (1х тень)',
    minutes: 'минут',
    off: 'Выключено',
    
    // Qibla
    qibla_title: 'Компас Киблы',
    qibla_angle: 'Угол Киблы',
    compass_instruction: 'Для точной работы компаса держите устройство ровно.',
    compass_error: 'Ориентация устройства не поддерживается.',
    compass_not_allowed: 'Нет разрешения на доступ к компасу.',
    grant_permission: 'Разрешить',
    
    // General / Fallbacks
    ramadan_blessing: 'Рамадан Мубарак!',
    retry: 'Повторить',
    api_error: 'Не удалось загрузить данные. Активирован офлайн-режим.',
    loading: 'Загрузка...'
  }
};

export const getTranslation = (lang: Language, key: string): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.uz_lat[key] || key;
};
