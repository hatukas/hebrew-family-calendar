import React from 'react';
import { EventProvider } from './context/EventContext';
import { CalendarView } from './components/CalendarView';

const App: React.FC = () => {
  return (
    <EventProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <CalendarView />
      </div>
    </EventProvider>
  );
};

export default App;
