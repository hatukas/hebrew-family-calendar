import React, { useState, useRef } from 'react';
import { HDate } from '@hebcal/core';
import { toPng } from 'html-to-image';
import {
  getHolidaysForHDate,
  getHebrewMonthNameHe,
  isEventMatchingHDate,
  toHebrewNumeral,
} from '../utils/hebrewCalendar';
import type { DayInfo, FamilyEvent } from '../utils/hebrewCalendar';
import { useEvents } from '../context/EventContext';
import { EventModal } from './EventModal';
import { MonthlySummary } from './MonthlySummary';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Printer,
  Download,
  Upload,
  Calendar as CalendarIcon,
  RotateCcw,
  Trash2,
  Copy,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { events, exportEventsJSON, importEventsJSON, clearAllEvents } = useEvents();

  // State for active Gregorian year and month (0-indexed)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FamilyEvent | null>(null);
  const [defaultDay, setDefaultDay] = useState<number>(1);
  const [defaultMonth, setDefaultMonth] = useState<string>('Tishrei');

  // File Upload Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarCaptureRef = useRef<HTMLDivElement>(null);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Build days grid for current Gregorian month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Day of week offset (Sunday = 0, Saturday = 6)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();

  // Previous month padding days
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: DayInfo[] = [];

  // 1. Previous month padding
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const gDate = new Date(currentYear, currentMonth - 1, dayNum);
    const hdate = new HDate(gDate);

    daysGrid.push({
      gregorianDate: gDate,
      gregorianDay: dayNum,
      isCurrentMonth: false,
      isToday: false,
      hdate,
      hebrewDayStr: toHebrewNumeral(hdate.getDate()),
      hebrewMonthStrNameStr: getHebrewMonthNameHe(hdate.getMonthName()),
      hebrewFullStr: `${toHebrewNumeral(hdate.getDate())} ב${getHebrewMonthNameHe(hdate.getMonthName())}`,
      holidays: getHolidaysForHDate(hdate),
      events: events.filter(e => isEventMatchingHDate(e, hdate)),
    });
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
    const gDate = new Date(currentYear, currentMonth, dayNum);
    const hdate = new HDate(gDate);

    const isToday =
      gDate.getDate() === today.getDate() &&
      gDate.getMonth() === today.getMonth() &&
      gDate.getFullYear() === today.getFullYear();

    daysGrid.push({
      gregorianDate: gDate,
      gregorianDay: dayNum,
      isCurrentMonth: true,
      isToday,
      hdate,
      hebrewDayStr: toHebrewNumeral(hdate.getDate()),
      hebrewMonthStrNameStr: getHebrewMonthNameHe(hdate.getMonthName()),
      hebrewFullStr: `${toHebrewNumeral(hdate.getDate())} ב${getHebrewMonthNameHe(hdate.getMonthName())}`,
      holidays: getHolidaysForHDate(hdate),
      events: events.filter(e => isEventMatchingHDate(e, hdate)),
    });
  }

  // 3. Next month padding to fill complete grid (multiples of 7)
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const gDate = new Date(currentYear, currentMonth + 1, dayNum);
    const hdate = new HDate(gDate);

    daysGrid.push({
      gregorianDate: gDate,
      gregorianDay: dayNum,
      isCurrentMonth: false,
      isToday: false,
      hdate,
      hebrewDayStr: toHebrewNumeral(hdate.getDate()),
      hebrewMonthStrNameStr: getHebrewMonthNameHe(hdate.getMonthName()),
      hebrewFullStr: `${toHebrewNumeral(hdate.getDate())} ב${getHebrewMonthNameHe(hdate.getMonthName())}`,
      holidays: getHolidaysForHDate(hdate),
      events: events.filter(e => isEventMatchingHDate(e, hdate)),
    });
  }

  // Determine Hebrew month header info for title
  const midMonthHDate = new HDate(new Date(currentYear, currentMonth, 15));
  const hebrewMonthTitle = `${getHebrewMonthNameHe(midMonthHDate.getMonthName())} ${toHebrewNumeral(midMonthHDate.getFullYear())}`;

  const gregorianMonthTitle = firstDayOfMonth.toLocaleDateString('he-IL', {
    month: 'long',
    year: 'numeric',
  });

  const handleOpenAddModal = (hday?: number, hmonth?: string) => {
    setSelectedEvent(null);
    setDefaultDay(hday || 1);
    setDefaultMonth(hmonth || midMonthHDate.getMonthName());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: FamilyEvent) => {
    setSelectedEvent(evt);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) {
          const success = importEventsJSON(content);
          if (success) {
            alert('האירועים יובאו בהצלחה!');
          } else {
            alert('שגיאה בייבוא הקובץ. אנא ודא שהקובץ במבנה תקין.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearEvents = () => {
    if (confirm('האם אתה בטוח שברצונך למחוק את כלל האירועים בלוח?')) {
      clearAllEvents();
    }
  };

  const handleCopyCalendarImage = async () => {
    if (!calendarCaptureRef.current || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
      alert('הדפדפן אינו תומך בהעתקת תמונות. ניתן להשתמש בכפתור ההדפסה כדי לשמור את הלוח.');
      return;
    }

    setIsCopyingImage(true);
    setImageCopied(false);

    try {
      const dataUrl = await toPng(calendarCaptureRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setImageCopied(true);
      window.setTimeout(() => setImageCopied(false), 2500);
    } catch (error) {
      console.error('Failed to copy calendar image:', error);
      alert('לא ניתן היה להעתיק את הלוח כתמונה. נסה שוב.');
    } finally {
      setIsCopyingImage(false);
    }
  };

  const currentMonthOnlyDays = daysGrid.filter(d => d.isCurrentMonth);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 print-container">
      
      {/* Top Action Bar / Header */}
      <header className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6 mb-6 no-print">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                לוח שנה עברי-לועזי משפחתי
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                ניהול ימי הולדת, ימי נישואין ואזכרות לפי התאריך העברי
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              אירוע חדש
            </button>

            <button
              onClick={handleCopyCalendarImage}
              disabled={isCopyingImage}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-wait text-white text-sm font-semibold rounded-xl shadow-sm transition"
              title="העתקת הלוח הנראה כתמונה לשליחה בוואטסאפ"
            >
              <Copy className="w-4 h-4" />
              {isCopyingImage ? 'מכין תמונה...' : imageCopied ? 'התמונה הועתקה' : 'העתק כתמונה'}
            </button>

            <button
              onClick={handleClearEvents}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-sm font-semibold rounded-xl transition"
              title="מחק את כלל האירועים הקיימים בלוח"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              איפוס האירועים בלוח
            </button>

            <button
              onClick={exportEventsJSON}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              title="ייצוא נתונים ל-JSON"
            >
              <Download className="w-4 h-4" />
              ייצוא
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              title="ייבוא נתונים מ-JSON"
            >
              <Upload className="w-4 h-4" />
              ייבוא
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition"
              title="הדפסת לוח השנה"
            >
              <Printer className="w-4 h-4" />
              הדפסה
            </button>
          </div>

        </div>

        {/* Calendar Month & Year Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition border border-slate-200"
              title="חודש קודם"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleToday}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              היום
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition border border-slate-200"
              title="חודש הבא"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Month Titles */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-indigo-950">
              {hebrewMonthTitle}
            </h2>
            <div className="text-sm font-medium text-slate-500">
              {gregorianMonthTitle}
            </div>
          </div>

          <div className="hidden sm:block text-xs text-slate-400 font-medium">
            תמיכה מלאה בשנים מעוברות (אדר א'/ב')
          </div>
        </div>
      </header>

      {/* PAGE 1: Calendar Grid Container (Print Page 1) */}
      <div className="print-page-1">
        {/* Print Banner (Only visible during print) */}
        <div className="hidden print-only mb-2 text-center">
          <h1 className="text-2xl font-bold">{hebrewMonthTitle}</h1>
          <h2 className="text-base text-slate-600">{gregorianMonthTitle}</h2>
        </div>

        <div
          ref={calendarCaptureRef}
          className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden calendar-grid-container"
        >
          
          {/* Day Names Header */}
          <div className="grid grid-cols-7 bg-slate-800 text-white text-center font-bold text-xs sm:text-sm py-2">
            <div>ראשון</div>
            <div>שני</div>
            <div>שלישי</div>
            <div>רביעי</div>
            <div>חמישי</div>
            <div>שישי</div>
            <div>שבת</div>
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 calendar-grid divide-x divide-y divide-slate-100 text-right">
            {daysGrid.map((day, idx) => (
              <div
                key={idx}
                className={`day-cell min-h-[105px] p-2 flex flex-col justify-between transition-colors relative group ${
                  !day.isCurrentMonth
                    ? 'bg-slate-50/60 text-slate-400'
                    : day.isToday
                    ? 'bg-amber-50/40 ring-2 ring-amber-400/50 inset-0 z-10'
                    : 'bg-white hover:bg-slate-50/70'
                }`}
              >
                {/* Day Top Bar (Gregorian & Hebrew Dates) */}
                <div className="flex items-start justify-between">
                  <span
                    className={`text-xs sm:text-sm font-extrabold px-1.5 py-0.5 rounded-md ${
                      day.isToday
                        ? 'bg-amber-500 text-white'
                        : day.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.gregorianDay}
                  </span>

                  <span className="text-xs sm:text-sm font-bold text-indigo-900 bg-indigo-50/80 px-1.5 py-0.5 rounded-md border border-indigo-100/60">
                    {day.hebrewDayStr}
                  </span>
                </div>

                {/* Day Contents: Holidays & Events */}
                <div className="my-1 space-y-1 overflow-hidden">
                  {/* Holidays & Parashat HaShavua */}
                  {day.holidays.map((h, hIdx) => {
                    const isParasha = h.includes('פָּרָשַׁת') || h.includes('פרשת');
                    return (
                      <div
                        key={`h-${hIdx}`}
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded border truncate ${
                          isParasha
                            ? 'bg-amber-100 text-amber-950 border-amber-300 font-black'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-200/80'
                        }`}
                        title={h}
                      >
                        {isParasha ? '📖 ' : '🌿 '}
                        {h}
                      </div>
                    );
                  })}

                  {/* Family Events */}
                  {day.events.map((evt, eIdx) => {
                    let badgeStyle = 'bg-purple-100 text-purple-900 border-purple-200';
                    if (evt.type === 'birthday') badgeStyle = 'bg-blue-100 text-blue-900 border-blue-200';
                    if (evt.type === 'anniversary') badgeStyle = 'bg-rose-100 text-rose-900 border-rose-200';
                    if (evt.type === 'yahrzeit') badgeStyle = 'bg-slate-200 text-slate-900 border-slate-300 font-bold';

                    return (
                      <button
                        key={`e-${eIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(evt);
                        }}
                        className={`w-full text-right text-[11px] px-1.5 py-0.5 rounded border truncate transition transform hover:scale-[1.02] block ${badgeStyle}`}
                        title={`${evt.title} (${evt.personName || ''})`}
                      >
                        {evt.type === 'birthday' && '🎉 '}
                        {evt.type === 'anniversary' && '💍 '}
                        {evt.type === 'yahrzeit' && '🕯️ '}
                        {evt.title}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Add Button on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition no-print flex justify-end">
                  <button
                    onClick={() => handleOpenAddModal(day.hdate.getDate(), day.hdate.getMonthName())}
                    className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-semibold flex items-center gap-0.5"
                    title="הוסף אירוע ביום זה"
                  >
                    <Plus className="w-3 h-3" /> הוסף
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAGE 2: Concentrated Monthly Summary Table (Print Page 2) */}
      <div className="print-page-2">
        <MonthlySummary
          currentMonthDays={currentMonthOnlyDays}
          onSelectEvent={handleOpenEditModal}
        />
      </div>

      {/* Add / Edit Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialEvent={selectedEvent}
        defaultHebrewDay={defaultDay}
        defaultHebrewMonth={defaultMonth}
      />

    </div>
  );
};
