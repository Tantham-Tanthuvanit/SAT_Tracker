# 🎓 SAT Practice Score Tracker

A self-hosted web application to track, analyze, and visualize your SAT practice test scores over time. Designed to run on your **Mac Mini (Apple Silicon M1/M2/M3)** home server or your **Windows machine**, accessible from any phone, tablet, or computer on your local home network.

Built with **Python (FastAPI + SQLite)** on the backend and **React (Vite + Tailwind CSS + Recharts)** on the frontend.

---

## 🌟 Key Features

- 📈 **Interactive Line Graph**:
  - Plots practice test scores chronologically over time.
  - Shows **Total Score (400–1600)**, **Math Section (200–800)**, and **Reading & Writing Section (200–800)** progression lines.
  - Option to display **Time Taken (Minutes)**.
  - Customizable **Target Score Goal Line** (e.g. 1500) to keep your eyes on the prize.
  - Filter chart progression by topic or section drills.
  - Rich interactive tooltips with test names, subscores, durations, and review notes.

- 📝 **Rich Test Logging**:
  - **Test Name**: Bluebook Test #, Khan Academy, UWorld, Erica Meltzer, etc.
  - **Date**: Test completion date.
  - **Time Taken**: Formatted in hours and minutes with quick 1-tap presets (`35m`, `64m`, `134m`).
  - **Topic / Section**: Pre-populated with official Digital SAT domains (*Full Test, Math - Algebra, Math - Advanced Math, Reading & Writing - Craft & Structure, etc.*) plus custom topic support.
  - **Score & Subscores**: Total Score, Math sub-score, Reading & Writing sub-score with auto-sum calculation.
  - **Notes & Review**: Log questions missed, pacing notes, and study reminders.

- 📱 **Mobile & Local Network Ready**:
  - **Network-wide Access**: Binds to `0.0.0.0:8000` so any device connected to your home Wi-Fi can open it.
  - **QR Code Scanner**: Tap **"Connect Phone"** to display a QR code you can scan with your iPhone or Android camera to open the dashboard immediately.
  - **Responsive Mobile UI**: Touch-friendly inputs, mobile action drawer, card layouts, and bottom quick-add button.

- 💾 **Data Safety & Portability**:
  - Zero-configuration local SQLite database (`data/sat_tracker.db`).
  - **One-click JSON Export & Import** for backups and transferring data between your Windows PC and Mac Mini.
  - **Seed Sample Data button** to explore sample test progressions immediately.

---

## 🚀 Quick Start

### 🪟 Running on Windows

1. **Option A (One-Click Launcher)**:
   Double-click `start.bat` in the project folder.

2. **Option B (PowerShell / Terminal)**:
   ```powershell
   py run.py
   # or
   python run.py
   ```

The script will automatically set up Python dependencies, ensure the frontend is compiled, and start the server on port `8000`.

---

### 🍏 Running on Mac Mini (Apple Silicon M1/M2/M3)

1. Open **Terminal** on your Mac Mini and navigate to the directory:
   ```bash
   cd /path/to/SAT_tracker
   ```

2. Make `start.sh` executable and run it:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   *(Or run directly with `python3 run.py`)*

3. **Running in the Background on your Mac Mini Home Server**:
   To keep the app running in the background even after you close Terminal, you can use `nohup`:
   ```bash
   nohup python3 run.py > sat_tracker.log 2>&1 &
   ```
   Or using `pm2`:
   ```bash
   npm install -g pm2
   pm2 start "python3 run.py" --name "sat-tracker"
   pm2 save
   ```

---

## 📱 Opening on your Phone / iPad (Local Network)

1. Make sure your phone/tablet is connected to the **same Wi-Fi network** as your Mac Mini or Windows PC.
2. Check the console output when the server starts. You'll see your local IP address:
   ```text
   💻 Localhost:    http://localhost:8000
   📱 Network Link: http://192.168.1.35:8000
   ```
3. Either:
   - Type that URL (`http://<your-server-ip>:8000`) into Safari / Chrome on your phone.
   - **OR** open `http://localhost:8000` on your computer, click **"Connect Phone"**, and **scan the QR code** with your phone's camera!

> 💡 **Tip for iOS / iPadOS**: In Safari, tap the Share icon and select **"Add to Home Screen"** to use the SAT Tracker like a native mobile app!

---

## 🛠️ Project Structure

```text
SAT_tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application & static SPA routing
│   │   ├── database.py      # SQLite connection & schema initialization
│   │   ├── models.py        # Database definitions
│   │   ├── schemas.py       # Pydantic data schemas & validators
│   │   ├── crud.py          # Database queries & stats aggregations
│   │   └── network_utils.py # Local LAN IP detection
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Header & connection drawer
│   │   │   ├── StatsOverview.jsx  # KPI cards (PB, Average, Study time)
│   │   │   ├── ScoreChart.jsx     # Interactive Recharts line graph
│   │   │   ├── ScoreList.jsx      # Test history table & mobile cards
│   │   │   ├── ScoreFormModal.jsx # Add/edit modal with validation
│   │   │   └── NetworkModal.jsx   # QR code & LAN pairing modal
│   │   ├── api.js                 # API client
│   │   ├── utils.js               # Formatting helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── sat_tracker.db       # SQLite database (auto-created)
├── run.py                   # Universal cross-platform launcher
├── start.bat                # Windows double-click starter
├── start.sh                 # Mac Mini M1 bash starter
└── README.md
```

---

## 💻 Development Mode (Optional)

If you want to modify the React frontend with live hot-reloading:

1. **Terminal 1 (Backend API)**:
   ```bash
   python run.py
   ```

2. **Terminal 2 (Frontend with Vite Hot Reload)**:
   ```bash
   cd frontend
   npm run dev -- --host
   ```
   Open `http://localhost:5173`. Vite will automatically proxy API requests to port `8000`.
