# TrustCircle — StackBlitz + Netlify Deployment Guide

Follow these steps exactly and you'll be live in about 10 minutes.
No local machine, no installs, everything in the browser.

---

## STEP 1 — Create your Supabase database (5 mins)

1. Go to https://supabase.com and sign up free
2. Click "New Project" — give it a name like "trustcircle"
3. Set a database password (save it somewhere)
4. Wait ~2 minutes for it to set up
5. Click "SQL Editor" in the left sidebar
6. Paste and run this SQL:

```sql
create table profiles (
  id uuid references auth.users primary key,
  full_name text not null,
  email text not null,
  skill text,
  bio text,
  phone text,
  location text,
  trust_score integer default 0,
  vouch_count integer default 0,
  created_at timestamp default now()
);

create table vouches (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid references profiles(id),
  vouchee_id uuid references profiles(id),
  message text,
  weight integer default 10,
  created_at timestamp default now(),
  unique(voucher_id, vouchee_id)
);

alter table profiles enable row level security;
alter table vouches enable row level security;

create policy "Public profiles readable" on profiles for select using (true);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Vouches readable" on vouches for select using (true);
create policy "Auth users can vouch" on vouches for insert with check (auth.uid() = voucher_id);
```

7. Go to Project Settings → API
8. Copy your "Project URL" and "anon public" key — you'll need them in Step 2


---

## STEP 2 — Set up on StackBlitz (3 mins)

1. Go to https://stackblitz.com
2. Click "Start new project" → Select "Vite" template (not React+Vite, just Vite)
3. Once it loads, you'll see a file tree on the left

Now upload all your files:
- Click the file tree area
- Delete the default src/main.js and src/style.css files
- Create each file from this zip by clicking "New File" and copying the content

OR even easier:
- Click the top-left menu → "Import from zip"
- Upload this zip file directly — StackBlitz will load everything automatically!

4. Once files are loaded, find the file called ".env.example"
5. Rename it to ".env" (click the file → rename)
6. Open .env and replace the placeholder values:

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

7. StackBlitz will automatically run "npm install" and start the dev server
8. You'll see TrustCircle running live in the right panel!


---

## STEP 3 — Deploy to Netlify (2 mins)

1. In StackBlitz, look for the "Deploy" button (top right area)
   - It may say "Connect to Netlify" or show a Netlify logo
2. Click it and log in / sign up to Netlify (free)
3. When it asks for environment variables, add:
   - VITE_SUPABASE_URL = your project URL
   - VITE_SUPABASE_ANON_KEY = your anon key
4. Click Deploy
5. Netlify gives you a live URL like: https://trustcircle-abc123.netlify.app


---

## STEP 4 — Enable Supabase Auth emails (optional but recommended)

1. In Supabase → Authentication → Settings
2. Set your Site URL to your Netlify URL
3. This makes email confirmation links work properly


---

## File Structure Reference

```
trustcircle/
├── index.html                  ← App entry point
├── vite.config.js              ← Vite config
├── package.json                ← Dependencies
├── netlify.toml                ← Netlify routing fix
├── .env                        ← YOUR SUPABASE KEYS GO HERE
└── src/
    ├── main.jsx                ← React root
    ├── App.jsx                 ← Routes
    ├── index.css               ← Global styles
    ├── supabase.js             ← Supabase client
    ├── context/
    │   └── AuthContext.jsx     ← Login/signup state
    ├── components/
    │   ├── Navbar.jsx          ← Top navigation
    │   ├── TrustRing.jsx       ← Score circle visual
    │   ├── ShareCard.jsx       ← Share profile links
    │   └── ProtectedRoute.jsx  ← Auth guard
    └── pages/
        ├── Home.jsx            ← Landing page
        ├── Signup.jsx          ← Register
        ├── Login.jsx           ← Sign in
        ├── Dashboard.jsx       ← Your profile hub
        ├── EditProfile.jsx     ← Edit bio/location
        ├── Vouch.jsx           ← Vouch for someone
        ├── Search.jsx          ← Find services
        ├── Profile.jsx         ← Public profile
        ├── Leaderboard.jsx     ← Top trusted people
        ├── Notifications.jsx   ← Vouch alerts
        └── HowItWorks.jsx      ← About/FAQ page
```

---

## Pages & URLs

| URL | What it does |
|-----|-------------|
| / | Landing page |
| /signup | Create account |
| /login | Sign in |
| /dashboard | Your profile, score, vouches |
| /edit-profile | Update bio, phone, location |
| /vouch | Vouch for someone |
| /search | Find trusted services |
| /profile/:id | Anyone's public profile |
| /leaderboard | Most trusted in Nigeria |
| /notifications | Vouch alerts |
| /how-it-works | FAQ and explainer |

---

That's it! If anything goes wrong, the most common issue is
missing or wrong Supabase keys in the .env file.
