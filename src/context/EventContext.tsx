import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FamilyEvent } from '../utils/hebrewCalendar';

interface EventContextType {
  events: FamilyEvent[];
  addEvent: (event: Omit<FamilyEvent, 'id'>) => void;
  updateEvent: (id: string, event: Omit<FamilyEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  clearAllEvents: () => void;
  exportEventsJSON: () => void;
  importEventsJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'hebrew_family_calendar_events_v1';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<FamilyEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved events:', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = (eventData: Omit<FamilyEvent, 'id'>) => {
    const newEvent: FamilyEvent = {
      ...eventData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventData: Omit<FamilyEvent, 'id'>) => {
    setEvents(prev => prev.map(evt => (evt.id === id ? { ...eventData, id } : evt)));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const clearAllEvents = () => {
    setEvents([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportEventsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hebrew_family_calendar_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importEventsJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        const validEvents: FamilyEvent[] = parsed.map((item, index) => ({
          id: item.id || `imported_${Date.now()}_${index}`,
          title: item.title || 'אירוע יובא',
          personName: item.personName || '',
          type: ['birthday', 'anniversary', 'yahrzeit', 'general'].includes(item.type) ? item.type : 'general',
          hebrewDay: Number(item.hebrewDay) || 1,
          hebrewMonth: item.hebrewMonth || 'Tishrei',
          hebrewYear: item.hebrewYear ? Number(item.hebrewYear) : undefined,
          notes: item.notes || '',
        }));
        setEvents(validEvents);
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  };

  return (
    <EventContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      clearAllEvents,
      exportEventsJSON,
      importEventsJSON,
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
