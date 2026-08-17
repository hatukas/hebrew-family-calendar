import React from 'react';
import type { DayInfo, FamilyEvent } from '../utils/hebrewCalendar';
import { toHebrewYearStr } from '../utils/hebrewCalendar';
import { Calendar as CalendarIcon, Heart, Cake, Flame, Tag } from 'lucide-react';

interface MonthlySummaryProps {
  currentMonthDays: DayInfo[];
  onSelectEvent: (event: FamilyEvent) => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ currentMonthDays, onSelectEvent }) => {
  // Aggregate ONLY family events in the month (excluding holidays)
  const items: Array<{
    date: Date;
    gregorianDay: number;
    hebrewFullStr: string;
    eventData: FamilyEvent;
  }> = [];

  currentMonthDays.forEach(day => {
    // Only Family Events
    day.events.forEach(e => {
      items.push({
        date: day.gregorianDate,
        gregorianDay: day.gregorianDay,
        hebrewFullStr: day.hebrewFullStr,
        eventData: e,
      });
    });
  });

  // Sort chronologically by Gregorian date
  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'birthday':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Cake className="w-3.5 h-3.5" /> יום הולדת
          </span>
        );
      case 'anniversary':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Heart className="w-3.5 h-3.5" /> יום נישואין
          </span>
        );
      case 'yahrzeit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            <Flame className="w-3.5 h-3.5" /> אזכרה
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Tag className="w-3.5 h-3.5" /> כללי
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 mt-6 print-break-inside-avoid">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          ריכוז אירועים משפחתיים לחודש זה
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          סה"כ {items.length} אירועים משפחתיים
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          אין אירועים משפחתיים בחודש זה.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                <th className="py-2.5 px-4">תאריך לועזי</th>
                <th className="py-2.5 px-4">תאריך עברי</th>
                <th className="py-2.5 px-4">סוג אירוע</th>
                <th className="py-2.5 px-4">שם האירוע / אדם</th>
                <th className="py-2.5 px-4">הערות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {items.map((item, idx) => {
                const dateStr = item.date.toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  weekday: 'short',
                });

                const evt = item.eventData;
                return (
                  <tr
                    key={`event-${evt.id}-${idx}`}
                    onClick={() => onSelectEvent(evt)}
                    className="hover:bg-indigo-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-700">{dateStr}</td>
                    <td className="py-3 px-4 text-indigo-900 font-medium">{item.hebrewFullStr}</td>
                    <td className="py-3 px-4">{getEventBadge(evt.type)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {evt.title}
                      {evt.personName && <span className="font-normal text-slate-600 mr-1.5">({evt.personName})</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {evt.notes || '-'}
                      {evt.hebrewYear && (
                        <span className="text-slate-400 block text-[11px]">
                          מקור: {toHebrewYearStr(evt.hebrewYear)} ({evt.hebrewYear})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
