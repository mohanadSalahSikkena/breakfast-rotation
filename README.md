# 🏢 Office Duty Tracker

A React app that manages multiple office duty rotations (Breakfast & Orders Collection) with independent, fair queue-based systems.

## Features

- 👤 **Employee Management**: Add, edit, delete, and pause employees
- 🔄 **Dual Rotation Systems**:
  - 🍳 **Breakfast Duty** - Track who buys breakfast
  - 📦 **Orders Collection** - Track who collects office orders
- 🎯 **Independent Turn Tracking**: Each rotation maintains separate turn counts
- 📊 **Rotation Queue**: See the complete order of upcoming turns
- 📅 **Dual History Views**:
  - 📋 **List View** - Chronological list of all events
  - 🗓️ **Calendar View** - Monthly calendar showing events by date with navigation
- ⚖️ **Fair Catch-Up System**: Paused employees get extra turns when reactivated to equalize turn counts
- 💾 **Persistent Storage**: All data stored in browser localStorage

## How It Works

1. **Add employees** to the system
2. The app **automatically selects** the next employee based on:
   - **Primary**: Fewest turn count (ensures fairness)
   - **Secondary**: Longest time since last turn
3. Click **"Breakfast Bought"** or **"Orders Collected"** when duty is completed
4. The turn count updates and **moves to the next** employee automatically
5. **Pause employees** who are on vacation or working remotely
6. When reactivated, they'll get **extra turns** until their count catches up with others

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **SQL.js** - SQLite database in the browser
- **LocalStorage** - Persistent data storage

## Database Schema

### Employees Table
- `id` - Primary key
- `name` - Employee name
- `lastTurnDate` - Last time they bought breakfast
- `isActive` - Whether they're currently in rotation
- `turnCount` - Total number of turns

### History Table
- `id` - Primary key
- `employeeId` - Reference to employee
- `employeeName` - Snapshot of employee name
- `date` - When breakfast was bought

## Rotation Logic

The rotation system works by:
1. Filtering for **active employees only**
2. Sorting by `lastTurnDate` (oldest first)
3. Employees who **never went** get priority
4. When marked complete, the date updates and they go to the back of the queue

## Future Enhancements

- 🔔 Push notifications for assigned employees
- 📊 Statistics dashboard (most frequent buyer, longest streak)
- 🌙 Dark mode
- 📱 PWA support for mobile installation
- ☁️ Cloud sync with Firebase for team usage
- 🔐 User authentication for team management

## License

MIT
