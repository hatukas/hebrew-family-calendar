import React, { useState, useEffect } from 'react';
import { useEvents } from '../context/EventContext';
import { HEBREW_MONTH_LIST, HEBREW_NUMERALS, toHebrewYearStr } from '../utils/hebrewCalendar';
import type { FamilyEvent, EventType } from '../utils/hebrewCalendar';
import { HDate } from '@hebcal/core';
import { X, Calendar, User, FileText, Tag } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: FamilyEvent | null;
  defaultHebrewDay?: number;
  defaultHebrewMonth?: string;
}

// Generate dropdown years list: Current Hebrew year down to 120 years back
const currentHYear = new HDate().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 120 }, (_, i) => {
  const year = currentHYear - i;
  return {
    year,
    label: `${toHebrewYearStr(year)} (${year})`,
  };
});

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  initialEvent,
  defaultHebrewDay = 1,
  defaultHebrewMonth = 'Tishrei',
}) => {
  const { addEvent, updateEvent, deleteEvent } = useEvents();

  const [title, setTitle] = useState('');
  const [personName, setPersonName] = useState('');
  const [type, setType] = useState<EventType>('birthday');
  const [hebrewDay, setHebrewDay] = useState<number>(defaultHebrewDay);
  const [hebrewMonth, setHebrewMonth] = useState<string>(defaultHebrewMonth);
  const [hebrewYear, setHebrewYear] = useState<string>(String(currentHYear));
  const [notes, setNotes] = useState('');

  // Update state whenever initialEvent or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title || '');
        setPersonName(initialEvent.personName || '');
        setType(initialEvent.type || 'birthday');
        setHebrewDay(initialEvent.hebrewDay || 1);
        setHebrewMonth(initialEvent.hebrewMonth || 'Tishrei');
        setHebrewYear(initialEvent.hebrewYear ? String(initialEvent.hebrewYear) : '');
        setNotes(initialEvent.notes || '');
      } else {
        setTitle('');
        setPersonName('');
        setType('birthday');
        setHebrewDay(defaultHebrewDay);
        setHebrewMonth(defaultHebrewMonth);
        setHebrewYear(String(currentHYear));
        setNotes('');
      }
    }
  }, [isOpen, initialEvent, defaultHebrewDay, defaultHebrewMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData = {
      title: title.trim(),
      personName: personName.trim() || undefined,
      type,
      hebrewDay,
      hebrewMonth,
      hebrewYear: hebrewYear ? parseInt(hebrewYear, 10) : undefined,
      notes: notes.trim() || undefined,
    };

    if (initialEvent) {
      updateEvent(initialEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialEvent && confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      deleteEvent(initialEvent.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            {initialEvent ? 'עריכת אירוע משפחתי' : 'הוספת אירוע משפחתי חדש'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-right">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              שם האירוע *
            </label>
            <input
              type="text"
              required
              placeholder="לדוגמה: יום הולדת 30, אזכרה לסבא"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
            />
          </div>

          {/* Person Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-4 h-4 text-slate-400" />
                שם האדם
              </label>
              <input
                type="text"
                placeholder="לדוגמה: משה"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-4 h-4 text-slate-400" />
                סוג האירוע
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as EventType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 bg-white"
              >
                <option value="birthday">🎉 יום הולדת (כחול)</option>
                <option value="anniversary">💍 יום נישואין (ורוד/אדום)</option>
                <option value="yahrzeit">🕯️ אזכרה (אפור/שחור)</option>
                <option value="general">📅 כללי (סגול)</option>
              </select>
            </div>
          </div>

          {/* Hebrew Date Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">תאריך עברי (לפי לוח השנה)</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">יום עברי</label>
                <select
                  value={hebrewDay}
                  onChange={e => setHebrewDay(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {day} - {HEBREW_NUMERALS[day] || day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">חודש עברי</label>
                <select
                  value={hebrewMonth}
                  onChange={e => setHebrewMonth(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                >
                  {HEBREW_MONTH_LIST.map(m => (
                    <option key={m.key} value={m.key}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  שנה עברית מקורית
                </label>
                <select
                  value={hebrewYear}
                  onChange={e => setHebrewYear(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                >
                  <option value="">ללא שנה</option>
                  {YEAR_OPTIONS.map(opt => (
                    <option key={opt.year} value={opt.year}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              * האירוע יופיע אוטומטית בכל שנה עברית עוקבת בתאריך העברי שנבחר.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              הערות נוספות
            </label>
            <textarea
              rows={2}
              placeholder="מיקום, שעה, או פרטים חשובים..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {initialEvent ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                מחק אירוע
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                {initialEvent ? 'עדכן אירוע' : 'שמור אירוע'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
