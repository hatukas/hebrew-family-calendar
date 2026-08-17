# Hebrew-Gregorian Family Calendar Walkthrough

We have successfully initialized, configured, and compiled the **Hebrew-Gregorian Family Calendar Web Application** located in:
`C:\Users\MAX\.gemini\antigravity-ide\scratch\hebrew-family-calendar`

## Implemented Features

### 1. Hebrew Date & Holiday Engine (`src/utils/hebrewCalendar.ts`)
- Powered by `@hebcal/core` for exact conversion between Gregorian dates and Hebrew dates (gematria letters like `א' בתשרי`).
- Full support for Jewish leap years (handles Adar, Adar I, and Adar II recurring events mapping).
- Israeli holidays and official Jewish observances fetched dynamically for every date cell.

### 2. Events & Hebrew Recurrence (`src/context/EventContext.tsx` & `src/components/EventModal.tsx`)
- **Event Categories**: Birthdays (Blue), Anniversaries (Rose/Red), Memorial/Yahrzeit (Gray/Black), and General (Purple).
- **Hebrew Recurrence**: Events added on a specific Hebrew date (e.g. 15 Nisan) automatically repeat each consecutive Hebrew year on that exact day/month.
- Local Storage auto-save (`hebrew_family_calendar_events_v1`).

### 3. Layout & UX (`src/components/CalendarView.tsx` & `src/components/MonthlySummary.tsx`)
- **Grid View**: Clean 7-column monthly grid with RTL support, highlighting today's date and displaying both Gregorian numbers and Hebrew dates.
- **Monthly Summary Table**: Positioned below the main calendar grid, listing all holidays and family events for the current month in chronological order.
- **Navigation Toolbar**: Smooth month-by-month and year-by-year jump, plus quick return to "Today".

### 4. File Management & Export/Import
- **JSON Export**: Downloads a formatted `.json` backup file of all custom events.
- **JSON Import**: Uploads and restores events from any `.json` backup file with validation.

### 5. Print Optimization (`@media print`)
- Hidden navigation headers, toolbars, and action buttons during printing.
- Clean, high-contrast A4 Landscape grid layout suitable for wall calendar prints or archiving.

## Verification & Build Status
- **TypeScript & Vite Build**: Passed cleanly with zero compilation errors (`dist/assets/index-CsvDDnPU.js`).
- **Dev Server**: Running locally at `http://localhost:3000`.

> [!TIP]
> You can open `http://localhost:3000` in your web browser to test adding events, exporting/importing JSON files, or printing the calendar!
