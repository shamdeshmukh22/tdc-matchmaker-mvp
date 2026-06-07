# TDC Matchmaker — Internal Dashboard MVP

An internal tool built for **The Date Crew** matchmakers to manage client profiles, track their journey, and get AI-powered match suggestions — all from one clean dashboard.

This was built as part of a Full Stack Developer Internship assignment.

---

## Live Links

| Service | URL |
|---|---|
| Frontend (Vercel) | https://tdc-matchmaker-mvp-8f37.vercel.app |
| Backend API (Render) | https://tdc-matchmaker-mvp.onrender.com |
| GitHub Repo | https://github.com/shamdeshmukh22/tdc-matchmaker-mvp |

> **Note:** The backend is hosted on Render's free tier. On the first load it may take 20–30 seconds to wake up. This is normal — just wait a moment and the data will load.

---

## Sample Login

```
Username: admin
Password: password123
```

---

## Tech Stack

**Frontend**
- React (Vite)
- Plain CSS for styling
- Hosted on Vercel

**Backend**
- Node.js + Express
- Profile data stored in static JSON files
- Hosted on Render

**AI**
- Groq API (LLM-based match scoring)
- Used to score and explain match compatibility for each profile

---

## Features

- Login screen with basic auth
- Dashboard showing all customers assigned to the matchmaker
- Customer detail view with full biodata (name, age, city, education, income, caste, religion, relocation preference, and more)
- 100+ dummy profiles in the matching pool (opposite gender)
- AI-powered match scoring with short explanations
- "Send Match" button with a modal showing match details
- Gender-specific matching logic (different approach for male and female customers)

---

## Matching Logic

The matching works differently depending on the gender of the customer being viewed.

**For male customers**, the algorithm looks for women who are:
- Younger in age
- Shorter in height
- Earning less income
- Compatible on views about having children

**For female customers**, the algorithm focuses more on lifestyle and values:
- Similar or compatible profession type
- Matching preference on relocation
- Compatible views on family and children
- Similar educational background

After filtering, Groq's LLM scores each potential match and generates a short human-readable explanation like *"Strong match — both are open to relocation and share similar values around family."* This helps the matchmaker quickly decide who to suggest.

---

## How to Run Locally

**Clone the repo**
```bash
git clone https://github.com/shamdeshmukh22/tdc-matchmaker-mvp.git
cd tdc-matchmaker-mvp
```

**Start the backend**
```bash
cd backend
npm install
node server.js
```
Backend runs on `http://localhost:5000`

**Start the frontend**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

**Environment variables**

Create a `.env` file inside the `backend` folder:
```
GROQ_API_KEY=""
```

---

## Project Structure

```
tdc-matchmaker-mvp/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── profiles.json      # 100+ dummy matchmaking profiles
│   └── matchLogic.js      # Gender-specific matching algorithm
├── frontend/
│   ├── src/
│   │   ├── pages/         # Login, Dashboard, CustomerDetail
│   │   ├── components/    # MatchCard, ProfileView, SendMatchModal
│   │   └── App.jsx
└── README.md
```

---

## Assumptions Made

- All profiles are Indian residents by default (cities, castes, and languages reflect Indian context)
- The matchmaker sees only their assigned clients on the dashboard
- "Send Match" triggers a modal (no real email is sent — mock behaviour)
- Income, height, and age comparisons are used as soft filters, not hard blocks
- Groq API is used instead of OpenAI for faster, free-tier AI responses

---

## Author

**Ghansham Deshmukh**
Built for: The Date Crew — Full Stack Developer Internship Assignment
