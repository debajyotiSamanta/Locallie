# 🗺️ Locallie — AI-Powered Hyperlocal Community Problem Solving Platform

Locallie is a full-stack web application that empowers residents to report neighborhood issues (potholes, broken streetlights, garbage, water leakage, etc.) with AI-driven categorization, duplicate detection, priority scoring, and real-time community resolution tracking.

---

## ✨ Features

- **AI Report Analysis** — auto-categorization, severity prediction, duplicate detection, fake report filtering, OCR, and image verification
- **Role-Based Dashboards** — Resident, Community Hero, NGO/Volunteer, Government/Admin
- **Gamification** — XP points, badges, leaderboards for Community Heroes
- **Volunteer Drives** — NGOs can organize and manage community cleanup drives
- **Analytics Dashboard** — charts, heatmaps, trend analysis, hero performance stats
- **Public Feed & Map** — live issue tracker with Leaflet map and filters
- **AI Civic Chatbot** — floating assistant for status checks and platform guidance
- **Cloudinary Image Uploads** — real photo evidence stored in the cloud
- **MongoDB Atlas** — persistent cloud database with full seeding

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, React-Leaflet |
| Backend | Node.js, Express 5, MongoDB Atlas (Mongoose) |
| AI Services | Custom NLP rules (categorization, severity, OCR simulation) |
| Media Storage | Cloudinary |
| Database | MongoDB Atlas |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/debajyotiSamanta/Locallie.git
cd Locallie
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in your credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser
```
http://localhost:5173
```

---

## 🔑 Pre-loaded Demo Accounts

| Role | Email | Password |
|---|---|---|
| Resident | jane@example.com | password123 |
| Community Hero | john@example.com | password123 |
| NGO/Volunteer | ngo@example.com | password123 |
| Government/Admin | admin@example.com | password123 |

---

## 📁 Project Structure

```
Locallie/
├── backend/
│   ├── src/
│   │   ├── db/          # MongoDB models & seed data
│   │   ├── routes/      # API routes (issues, auth, analytics, upload)
│   │   ├── services/    # AI logic, Cloudinary integration
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, Footer, Chatbot, GpsPicker, Map
    │   ├── context/     # AuthContext (dark mode, auth, notifications)
    │   ├── services/    # API client
    │   └── views/       # LandingPage, PublicFeed, Dashboards, Analytics
    └── package.json
```

---

## 📄 License

MIT © 2026 Locallie Inc.
