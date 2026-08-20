import { HDate, gematriya, HebrewCalendar } from '@hebcal/core';

export type EventType = 'birthday' | 'anniversary' | 'yahrzeit' | 'general';

export interface FamilyEvent {
  id: string;
  title: string;
  personName?: string;
  type: EventType;
  hebrewDay: number;
  hebrewMonth: string; // e.g. "Nisan", "Adar", "Adar I", "Adar II", "Tishrei"
  hebrewYear?: number; // original year created/born
  gregorianDateStr?: string; // original gregorian date if available YYYY-MM-DD
  notes?: string;
}

export interface DayInfo {
  gregorianDate: Date;
  gregorianDay: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hdate: HDate;
  hebrewDayStr: string; // e.g. "א'", "ט"ו"
  hebrewMonthStrNameStr: string; // Hebrew name e.g. "תשרי", "שבט"
  hebrewFullStr: string; // e.g. "א' בתשרי"
  holidays: string[];
  events: FamilyEvent[];
}

// Hebrew Month Names mapping in Hebrew
export const HEBREW_MONTH_NAMES_HE: Record<string, string> = {
  'Nisan': 'ניסן',
  'Iyyar': 'אייר',
  'Sivan': 'סיון',
  'Tamuz': 'תמוז',
  'Av': 'אב',
  'Elul': 'אלול',
  'Tishrei': 'תשרי',
  'Cheshvan': 'חשון',
  'Kislev': 'כסלו',
  'Tevet': 'טבת',
  'Sh\'vat': 'שבט',
  'Adar': 'אדר',
  'Adar I': 'אדר א\'',
  'Adar II': 'אדר ב\'',
};

export const HEBREW_MONTH_LIST = [
  { key: 'Tishrei', name: 'תשרי' },
  { key: 'Cheshvan', name: 'חשון' },
  { key: 'Kislev', name: 'כסלו' },
  { key: 'Tevet', name: 'טבת' },
  { key: 'Sh\'vat', name: 'שבט' },
  { key: 'Adar', name: 'אדר (שנה רגילה)' },
  { key: 'Adar I', name: 'אדר א\' (שנה מעוברת)' },
  { key: 'Adar II', name: 'אדר ב\' (שנה מעוברת)' },
  { key: 'Nisan', name: 'ניסן' },
  { key: 'Iyyar', name: 'אייר' },
  { key: 'Sivan', name: 'סיון' },
  { key: 'Tamuz', name: 'תמוז' },
  { key: 'Av', name: 'אב' },
  { key: 'Elul', name: 'אלול' },
];

export const HEBREW_NUMERALS: Record<number, string> = {
  1: "א'", 2: "ב'", 3: "ג'", 4: "ד'", 5: "ה'", 6: "ו'", 7: "ז'", 8: "ח'", 9: "ט'", 10: "י'",
  11: 'י"א', 12: 'י"ב', 13: 'י"ג', 14: 'י"ד', 15: 'ט"ו', 16: 'ט"ז', 17: 'י"ז', 18: 'י"ח', 19: 'י"ט', 20: "כ'",
  21: 'כ"א', 22: 'כ"ב', 23: 'כ"ג', 24: 'כ"ד', 25: 'כ"ה', 26: 'כ"ו', 27: 'כ"ח', 28: 'כ"ח', 29: 'כ"ט', 30: "ל'",
};

// Convert number to Hebrew gematria string
export function toHebrewNumeral(num: number): string {
  if (HEBREW_NUMERALS[num]) return HEBREW_NUMERALS[num];
  try {
    return gematriya(num);
  } catch {
    return String(num);
  }
}

// Convert Year number to Hebrew Gematria string (e.g. 5786 -> תשפ"ו)
export function toHebrewYearStr(year: number): string {
  try {
    return gematriya(year);
  } catch {
    return String(year);
  }
}

// Get localized Hebrew Month name
export function getHebrewMonthNameHe(monthName: string): string {
  return HEBREW_MONTH_NAMES_HE[monthName] || monthName;
}

export function getEventYearsElapsed(event: FamilyEvent, currentHebrewYear: number): number | undefined {
  if (event.hebrewYear === undefined || event.hebrewYear > currentHebrewYear) {
    return undefined;
  }

  return currentHebrewYear - event.hebrewYear;
}

export function formatEventTitle(event: FamilyEvent, currentHebrewYear: number): string {
  const yearsElapsed = getEventYearsElapsed(event, currentHebrewYear);
  return yearsElapsed === undefined ? event.title : `${event.title} (${yearsElapsed})`;
}

// Match if a recurring event falls on a specific HDate (handling leap year / Adar logic)
export function isEventMatchingHDate(event: FamilyEvent, hdate: HDate): boolean {
  const currentMonthName = hdate.getMonthName();
  const currentDay = hdate.getDate();
  const isLeap = hdate.isLeapYear();

  // Day match check
  if (event.hebrewDay !== currentDay) {
    return false;
  }

  const evtMonth = event.hebrewMonth;

  // Exact month match
  if (evtMonth === currentMonthName) {
    return true;
  }

  // Handle Adar logic across leap vs non-leap years
  if (!isLeap) {
    // In a regular year, events registered in Adar, Adar I, or Adar II map to Adar
    if (currentMonthName === 'Adar' && (evtMonth === 'Adar' || evtMonth === 'Adar I' || evtMonth === 'Adar II')) {
      return true;
    }
  } else {
    // In a leap year:
    if (evtMonth === 'Adar' && currentMonthName === 'Adar II') {
      return true;
    }
  }

  return false;
}

// Normalize Hebrew string (remove Niqqud / vowels for exact matching)
function removeNikud(str: string): string {
  return str.replace(/[\u0591-\u05C7]/g, '');
}

// Format Rosh Hashana holiday text replacing numeric year (e.g., "רֹאשׁ הַשָּׁנָה 5786") with Gematria ("רֹאשׁ הַשָּׁנָה תשפ״ו")
function formatHolidayTitle(title: string): string {
  return title.replace(/(\d{4})/, (match) => {
    const yearNum = parseInt(match, 10);
    return toHebrewYearStr(yearNum);
  });
}

// Get holidays & Parashat HaShavua for a specific HDate
export function getHolidaysForHDate(hdate: HDate): string[] {
  const titles: string[] = [];

  // 1. Regular holidays on date
  const dayHolidays = HebrewCalendar.getHolidaysOnDate(hdate, true) || [];
  dayHolidays.forEach((h: any) => {
    titles.push(formatHolidayTitle(h.render('he')));
  });

  // 2. Parashat HaShavua on Saturdays (Israel reading cycle)
  if (hdate.getDay() === 6) {
    const saturdayEvents = HebrewCalendar.calendar({
      start: hdate.greg(),
      end: hdate.greg(),
      sedrot: true,
      il: true,
    });
    saturdayEvents.forEach((evt: any) => {
      const rendered = formatHolidayTitle(evt.render('he'));
      if (!titles.includes(rendered)) {
        titles.push(rendered);
      }
    });
  }

  return titles.filter((title: string) => {
    const cleanTitle = removeNikud(title);

    // Filter out Yom Kippur Katan
    if (cleanTitle.includes('יום כיפור קטן') || cleanTitle.includes('יום כפור קטן')) return false;

    // Filter out BeHaB Fasts
    if (cleanTitle.includes('בה"ב') || cleanTitle.includes('בה״ב') || cleanTitle.includes('תענית בה')) return false;

    return true;
  });
}
