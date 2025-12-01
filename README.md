# VanProperty Insights

Vancouver Property Tax Data Explorer - A full-stack web application for exploring Vancouver property tax data.

**Student:** Deep Patel  
**Courses:** WMDD 4921 & WMDD 4936  
**Instructor:** Professor Jordan Miller

---

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd express
npm install
```

**Frontend:**
```bash
cd react
npm install
```

### 2. Populate Database

From project root:
```bash
node data.js
```

### 3. Start Application

**Terminal 1 - Backend:**
```bash
cd express
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd react
npm run dev
```
App runs on `http://localhost:3000`

### 4. Access Application

Open browser to: `http://localhost:3000`

---

## Features

- Advanced property search
- Neighborhood analytics
- Watchlist functionality
- Saved searches
- Property value tracking

---

## Tech Stack

- **Backend:** Node.js, Express.js, SQLite
- **Frontend:** React, Vite
- **Database:** SQLite (7 normalized tables)
- **Data:** 500 properties from Vancouver Open Data

---

## Project Structure
```
VanProp/
├── express/          # Backend (Port 5000)
├── react/            # Frontend (Port 3000)
├── data.js           # Database population
├── schema.sql        # Database schema
└── queries.sql       # Sample queries
```

---

## Documentation

See `SUBMISSION.md` for complete project documentation.

---

© 2024 Deep Patel | BCIT WMDD Project
