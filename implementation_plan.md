# Implementation Plan - Hebrew-Gregorian Family Calendar Application

A modern Hebrew-Gregorian web application tailored for managing family events (birthdays, anniversaries, memorial days/Yahrzeit, custom events) with Hebrew recurring date logic, Jewish holidays, local storage persistence, JSON import/export, and print optimization.

## Recommended Workspace Setup
- **Directory**: `C:\Users\MAX\.gemini\antigravity-ide\scratch\hebrew-family-calendar`
- **Tech Stack**: React + Vite (or Next.js) with Tailwind CSS, `@hebcal/core` & `hebcal` libraries, Lucide icons.

## User Review Required
> [!IMPORTANT]
> - The application will be initialized in `C:\Users\MAX\.gemini\antigravity-ide\scratch\hebrew-family-calendar`. We recommend setting this folder as your active workspace.
> - We will use `@hebcal/core` for high-precision Hebrew date conversions and Jewish holidays calculation.

## Proposed Components & Architecture

### 1. Core Logic & Helpers (`src/utils/hebrewCalendar.ts`)
- Modern Hebrew-Gregorian date converter using `@hebcal/core`.
- Support for Jewish leap years (Adar I / Adar II recurring events mapping).
- Holiday retrieval for Israeli calendar / Diaspora options.
- Recurring event evaluation logic: matching Hebrew month & day across leap/non-leap years.

### 2. State & Storage Management (`src/context/EventContext.tsx` or custom hooks)
- LocalStorage integration for persistent events.
- Import/Export functionality (`.json` payload validation and loading).
- Event CRUD operations (Create, Edit, Delete).

### 3. User Interface (UI/UX - RTL & Modern Aesthetics)
- **Header & Navigation Bar**: Fast jump between Hebrew/Gregorian months & years, Export/Import actions, Add Event button, Print button.
- **Calendar Grid**: Modern monthly view displaying Gregorian day numbers alongside Hebcal Hebrew day names (e.g., "א' בתשרי"). Visual badges for holidays & events.
- **Monthly Summary Table**: Concentrated list below the calendar grid showing chronological events and holidays for the current active month.
- **Add/Edit Event Modal**: Form allowing event title, person name, event category (Birthday, Anniversary, Memorial/Yahrzeit, General), Hebrew date picker (Day, Hebrew Month, Original Year), and notes.
- **Print Optimization (`@media print`)**: Hides navigation headers, sidebars, and action buttons; expands grid and summary table into a sleek, clean A4 Landscape layout.

## Verification Plan

### Automated/Build Verification
- Run `npm run build` or `npm run dev` to ensure error-free compilation.

### Manual Verification
- Test adding events across leap years (Adar / Adar I / Adar II).
- Test JSON export and import with sample event data.
- Verify RTL alignment and print preview rendering.
