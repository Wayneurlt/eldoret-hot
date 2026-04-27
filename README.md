# Eldoret Hot

A talent discovery platform connecting **models & influencers** with **brands & clients** in Eldoret, Kenya.

## Features

- **Model Profiles** — Models register and build detailed profiles with photos, categories, rates, social links, and portfolio
- **Client Discovery** — Clients browse and filter models by category, availability, and search
- **Meetup Requests** — Clients send project requests directly to models with budget & date details
- **Request Management** — Models accept or decline requests with optional response messages
- **Authentication** — JWT-based auth with separate model and client roles
- **Dashboard** — Personalized dashboard with stats, profile completion tracker, and recent activity

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TailwindCSS
- **State**: Pinia
- **Icons**: Nuxt Icon (Lucide)
- **Backend**: Nuxt Server Routes (Nitro)
- **Database**: SQLite via `better-sqlite3`
- **Auth**: JWT via `jose`, bcrypt via `bcryptjs`

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env` and update:

```env
JWT_SECRET=your-secret-key-here
DB_PATH=./eldoret-hot.db
```

## Project Structure

```
├── pages/
│   ├── index.vue          # Landing page
│   ├── login.vue          # Sign in
│   ├── register.vue       # Sign up (model or client)
│   ├── models/
│   │   ├── index.vue      # Browse all models
│   │   └── [id].vue       # Model profile page
│   ├── dashboard/
│   │   ├── index.vue      # User dashboard
│   │   └── profile.vue    # Edit profile
│   └── meetups/
│       └── index.vue      # Meetup requests
├── server/
│   ├── api/               # REST API routes
│   └── db/                # SQLite database
├── stores/                # Pinia state
├── components/            # Vue components
└── middleware/            # Route guards
```
