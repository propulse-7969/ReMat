# ReMat

<p align="center">
  <img src="frontend/src/login-logo.png" alt="ReMat Project Logo" width="25%" height="25%" />
</p>

**ReMat** is an e-waste recycling platform that connects citizens, recycling bins, and administrators. Users earn points for depositing e-waste at bins (with optional AI-based waste classification), request pickups for larger items, and admins manage bins and pickup routes. The project promotes responsible disposal of electronic waste and environmental sustainability.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Usage Guide](#usage-guide)
- [Implementation Overview](#implementation-overview)
- [API Overview](#api-overview)
- [ML Model](#ml-model)
- [License](#license)

---

## Features

### For Users (Citizens)
- **Authentication**: Sign up / login with email-password or Google (Firebase Auth).
- **Dashboard**: View stats, quick actions, and recent activity.
- **Recycle at bin**: Scan a bin QR → capture photo of e-waste → AI classifies type and suggests points → confirm deposit and earn points.
- **Pickup requests**: Submit pickup requests for larger e-waste with photo, location, preferred time, and contact; track status (open / accepted / rejected).
- **Rewards & leaderboard**: View points, rewards, and rank on the leaderboard.
- **Transactions**: History of deposits and points earned.
- **Profile**: View and manage account.

### For Admins
- **Dashboard**: Overview of bins and pickup requests.
- **Bins**: Add, edit, view, and delete bins; set name, location (lat/lng), capacity, and status (active / full / maintenance).
- **Pickup requests**: List open/accepted/rejected requests; accept (with points to award) or reject.
- **Route optimization**: Choose a start location and bins to visit; get an optimized order and OSRM driving route (path + stops).
- **Analytics**: View analytics and insights.

### Bin Kiosk
- **Bin screen** (`/bin/:binId`): Public page for a bin (e.g. from QR). Shows bin name, fill level, capacity, and a QR code for users to scan to start recycling.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|--------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 7** | Build tool and dev server |
| **React Router 7** | Client-side routing |
| **Tailwind CSS 4** | Styling |
| **Firebase** | Auth (email/password, Google) and Firestore |
| **Framer Motion** | Animations |
| **GSAP** | Animations |
| **Leaflet / React-Leaflet** | Maps (bin locations, pickup map) |
| **html5-qrcode / qr-scanner** | QR scanning |
| **react-qr-code** | QR code generation (e.g. on bin screen) |
| **React Hot Toast** | Notifications |
| **React Icons** | Icons |
| **Three.js / OGL** | 3D / WebGL (if used in UI) |
| **face-api.js** | Face detection (if used) |
| **mathjs** | Math utilities |

### Backend
| Technology | Purpose |
|------------|--------|
| **Python 3** | Runtime |
| **FastAPI** | REST API |
| **Uvicorn** | ASGI server |
| **SQLAlchemy 2** | ORM and DB access |
| **PostgreSQL** | Primary database |
| **GeoAlchemy2** | Geospatial columns (bins, pickup locations) |
| **Pydantic** | Request/response validation |
| **Firebase Admin** | Verify Firebase ID tokens (JWT) |
| **TensorFlow / Keras** | E-waste image classification model |
| **Supabase** | Storage for pickup request images (optional; can be replaced) |
| **python-dotenv** | Environment variables |
| **PyJWT** | JWT handling (if used elsewhere) |
| **requests** | HTTP (e.g. OSRM for routing) |

### External Services
- **Firebase**: Authentication and (optionally) Firestore.
- **PostgreSQL**: Database with PostGIS-compatible geography (e.g. `POINT` for bins and pickup locations).
- **OSRM** (router.project-osrm.org): Driving route geometry for admin pickup route optimization.
- **Supabase Storage**: Optional; used in the codebase for uploading pickup request images.

---

## Project Structure

```
ReMat/
├── frontend/                 # React + Vite SPA
│   ├── public/
│   │   ├── tab-logo.png
│   │   └── bin-background.png
│   ├── src/
│   │   ├── app/               # Router, role redirect
│   │   ├── auth/              # Auth context, provider, protected routes
│   │   ├── layouts/           # AdminLayout, UserLayout
│   │   ├── pages/
│   │   │   ├── admin/         # Admin dashboard, bins, pickups, analytics, route
│   │   │   ├── auth/          # Login, Signup
│   │   │   ├── bin/           # Bin kiosk screen
│   │   │   ├── user/          # User dashboard, recycle, rewards, transactions, pickups
│   │   │   ├── components/    # Shared UI, pickup cards, map, QR, camera
│   │   │   └── utils/
│   │   ├── services/          # Firebase config
│   │   └── types.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.*.json
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── core/              # config (ADMIN_EMAILS), firebase init, security (token verify)
│   │   ├── models/            # SQLAlchemy models, enums, Pydantic schemas
│   │   ├── routes/            # auth, user, bins, bin_panel, admin_pickup, user_request, route
│   │   ├── services/          # waste_detector, transaction_service, routing, storage, geo_utils
│   │   └── database.py       # Engine, session, get_db
│   ├── Models/
│   │   └── ewaste_final.keras # Trained e-waste classification model
│   ├── main.py                # FastAPI app, CORS, router includes
│   └── requirements.txt
│
├── requirements.txt           # Root: e.g. tensorflow (for backend ML)
└── README.md
```

---

## Prerequisites

- **Node.js** (v18+ recommended) and **npm**
- **Python** 3.10+ and **pip**
- **PostgreSQL** with PostGIS support (for geography columns)
- **Firebase** project (Auth enabled; optional: Firestore)
- **Supabase** project (optional; only if using backend pickup image upload to Supabase Storage)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd ReMat
```

### 2. Backend setup

```bash
cd backend
```

Create a virtual environment (recommended):

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
pip install -r ../requirements.txt
```

If you use **Supabase** for pickup image storage, install the Supabase client:

```bash
pip install supabase
```

Create an `uploads/waste_images` directory (used for temporary waste images during detection):

```bash
mkdir -p uploads/waste_images
```

**Firebase Admin (backend):**
- In Firebase Console → Project Settings → Service accounts, generate a new private key.
- Save the JSON key as `backend/serviceAccountKey.json` (ensure it is in `.gitignore`).

**Database:**
- Create a PostgreSQL database and enable the PostGIS extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```
- Run migrations or create tables from the SQLAlchemy models (e.g. using Alembic or `Base.metadata.create_all(engine)` from `app.database`). Tables: `users`, `bins`, `transactions`, `pickup_requests`, etc.

**Environment:**
- Copy `.env.example` to `.env` in `backend/` (create one if missing) and set at least:
  - `DATABASE_URL` (e.g. `postgresql://user:password@localhost:5432/remat`)
  - `ADMIN_EMAILS` (comma-separated list of admin emails)
  - If using Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

**Environment:**
- Create `frontend/.env` with your Firebase and API settings (see [Environment Variables](#environment-variables)).

### 4. ML model (e-waste classification)

- The backend expects a Keras model at `backend/Models/ewaste_final.keras`.
- If you do not have it, you can train one using the ReMat Kaggle notebook: [ReMat – ML model training](https://www.kaggle.com/code/saiswaroop8656/remat).
- Place the saved `.keras` file at `backend/Models/ewaste_final.keras`.

---

## Environment Variables

### Backend (`.env` in `backend/`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/remat`) |
| `ADMIN_EMAILS` | Comma-separated emails that get `admin` role on signup |
| `SUPABASE_URL` | Supabase project URL (for pickup image storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for storage upload/delete) |

### Frontend (`.env` in `frontend/`)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional; Firebase analytics |
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://127.0.0.1:8000`) |

---

## Running the Project

### Start the backend

From the project root:

```bash
cd backend
# Activate venv if you use one
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://127.0.0.1:8000/docs`.

### Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Open the URL shown by Vite (e.g. `http://localhost:5173`).

### Production build (frontend)

```bash
cd frontend
npm run build
npm run preview   # optional: preview production build
```

---

## Usage Guide

1. **Sign up / Login**  
   Use the login page with email/password or Google. New users are created on first signup; role is `admin` if email is in `ADMIN_EMAILS`, otherwise `user`.

2. **User: Recycle at a bin**  
   - Open the bin kiosk page (e.g. scan bin QR or go to `/bin/:binId`).  
   - From the app, go to Recycle (or the flow that uses the bin ID).  
   - Capture/upload a photo of the e-waste.  
   - Backend runs the e-waste classifier and returns waste type, confidence, and points.  
   - Optionally override the type; then confirm deposit.  
   - Points are credited and bin fill level is updated.

3. **User: Pickup request**  
   - Submit a request with image, e-waste type, location (lat/lng), preferred datetime, contact number, and optional address.  
   - Image is uploaded (e.g. to Supabase).  
   - Track status under “Pickup requests”.

4. **Admin: Bins**  
   - Add bins (name, lat, lng, capacity, status).  
   - View/edit/delete bins.  
   - Bin screen at `/bin/:binId` shows fill level and QR for users.

5. **Admin: Pickup requests**  
   - List requests; open one to see details.  
   - Accept (set points to award) or reject.

6. **Admin: Route**  
   - Select start location and bins to visit.  
   - Call route optimization API to get ordered stops and OSRM driving path; use the map/UI to display the route.

---

## Implementation Overview

### Authentication
- Frontend: Firebase Auth (email/password + Google). ID token is sent as `Authorization: Bearer <token>` to the backend.
- Backend: `verify_firebase_token` dependency uses Firebase Admin to verify the token and extract `uid` and `email`.  
- User record is stored in PostgreSQL; role is set at signup from `ADMIN_EMAILS`.

### Bins and geography
- Bin locations and pickup request locations are stored as PostGIS `POINT` (SRID 4326) via GeoAlchemy2.
- Queries use `ST_Y(location::geometry)` and `ST_X(location::geometry)` for lat/lng, and `ST_Distance` / `ST_MakePoint` for nearby bins and route optimization.

### E-waste detection and points
- **Waste detector** (`backend/app/services/waste_detector.py`): Loads a Keras model (`ewaste_final.keras`), preprocesses images (ResNet-style), and returns class probabilities.  
- Classes: Battery, Keyboard, Microwave, Mobile, Mouse, PCB, Player, Printer, Television, Washing Machine, Laptop.  
- **Points**:  
  - High confidence (≥ 0.75): `base_points × confidence`.  
  - Medium (0.40–0.75): `base_points × 0.6`.  
  - Low or user override: fixed manual override points per type.  
- User flow: upload image → `/user/detect-waste` → show type and points → confirm via `/user/recycle/{binid}` with waste_type, confidence, and optional user_override.

### Transactions and bin fill level
- Each deposit creates a `Transaction` and updates the user’s total points and the bin’s `fill_level`.  
- When fill level reaches 90%+ of capacity, bin status can be set to `full`.

### Pickup requests
- Created via multipart form (image + metadata). Image is uploaded to Supabase (or alternative); URL is stored in `pickup_requests.image_url`.  
- Status: `open` → `accepted` or `rejected` by admin. On accept, admin sets `points_awarded` and user points are updated.

### Route optimization
- Admin sends start location and list of bin locations.  
- Backend uses nearest-neighbor (haversine) to order stops, then calls OSRM to get driving route geometry.  
- Response: ordered stops and path (lat/lng list) for the map.

### Bin panel (kiosk)
- `GET /bin/panel/{bin_id}` returns bin info.  
- `POST /bin/panel/{bin_id}/confirm` records a deposit (used when the kiosk does not use the full detect-waste flow).

---

## API Overview

| Area | Method | Path | Description |
|------|--------|------|-------------|
| Auth | POST | `/auth/signup` | Register user (Firebase token + name) |
| Auth | POST | `/auth/login` | Login (Firebase token) |
| Auth | GET | `/auth/me` | Current user profile |
| Auth | DELETE | `/auth/me` | Delete account |
| User | GET | `/user/me` | User by ID (query param) |
| User | POST | `/user/detect-waste` | Upload image → waste type + points |
| User | PUT | `/user/recycle/{binid}` | Confirm deposit (body: waste_type, confidence, user_override, etc.) |
| User | GET | `/user/transactions/{user_id}` | Paginated transactions |
| User | GET | `/user/leaderboard` | Leaderboard (page, limit) |
| Bins | GET | `/api/bins/` | List all bins (with lat/lng) |
| Bins | GET | `/api/bins/{bin_id}` | Bin by ID |
| Bins | GET | `/api/bins/nearby` | Nearby bins (lat, lng, limit) |
| Bins | POST | `/api/bins/` | Create bin (admin) |
| Bins | PUT | `/api/bins/{bin_id}` | Update bin |
| Bins | DELETE | `/api/bins/{bin_id}` | Delete bin |
| Bin panel | GET | `/bin/panel/{bin_id}` | Get bin (for kiosk) |
| Bin panel | POST | `/bin/panel/{bin_id}/confirm` | Confirm deposit from kiosk |
| Route | POST | `/api/route/optimize` | Optimize order + OSRM route (body: start, bins) |
| User pickups | GET | `/user/pickup-requests` | My requests (query: user_id) |
| User pickups | GET | `/user/pickup-requests/{id}` | Request details |
| User pickups | POST | `/user/pickup-requests` | Create (multipart: image + form) |
| User pickups | PATCH | `/user/pickup-requests/{id}/location` | Update location |
| User pickups | DELETE | `/user/pickup-requests/{id}` | Delete (open only) |
| Admin pickups | GET | `/admin/pickup-requests` | List requests |
| Admin pickups | GET | `/admin/pickup-requests/{id}` | Request details |
| Admin pickups | PATCH | `/admin/pickup-requests/{id}/accept` | Accept (body: points_awarded) |
| Admin pickups | PATCH | `/admin/pickup-requests/{id}/reject` | Reject |

Protected routes expect header: `Authorization: Bearer <Firebase ID token>`.

---

## ML Model

- The e-waste classifier is a Keras model saved as `backend/Models/ewaste_final.keras`.
- Input: 224×224 RGB image; preprocessing follows ResNet-style (e.g. `keras.applications.resnet.preprocess_input`).
- Output: 11 classes (Battery, Keyboard, Microwave, Mobile, Mouse, PCB, Player, Printer, Television, Washing Machine, Laptop).
- Training notebook: [ReMat on Kaggle](https://www.kaggle.com/code/saiswaroop8656/remat).

---

## License

See repository license file (if any). ReMat is an e-waste recycling project for educational and environmental purposes.
