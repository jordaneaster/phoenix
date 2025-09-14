# 🔥 Phoenix CRM

**Phoenix CRM** is a lightweight, JavaScript-only CRM built for car dealership sales teams. It focuses on simplicity, mobile-first usability, and targeted features like lead management, follow-up alerts, and a built-in training center.

---

## 📌 Project Goals

- Optimize for **dealership tablet users**
- Minimize complexity — **no spreadsheet-like UI**
- Prioritize ease of use for **beginner salespeople**

---

## 🚀 Tech Stack

| Layer         | Tech                          |
|---------------|-------------------------------|
| Frontend      | Next.js (JavaScript), Tailwind CSS |
| Backend       | Supabase (Database, Auth, Storage, Realtime) |
| Deployment    | Vercel                         |
| Notifications | Supabase Realtime or polling-based logic |
| Email         | Resend / SendGrid (future)     |

---

## 🧩 Core Features (MVP)

### 1. **Authentication**
- Supabase email/password login
- Role-based dashboard access (Salesperson or Manager)

### 2. **Dashboard**
- Mobile-friendly 2x3 card layout with key sections:
  - Leads
  - Follow-Ups
  - Training
  - Team Overview (Manager only)
  - Notifications
  - Profile

### 3. **Lead Management**
- Salespeople view and update their own leads
- Managers can assign and reassign leads
- Lead fields:
  - `full_name`
  - `phone_number`
  - `email`
  - `vehicle_interest`
  - `status` (new, contacted, test_drive, closed)
  - `assigned_to`
  - `notes`
  - `last_contacted_at`
  - `created_at`

### 4. **Follow-Up Notifications**
- Auto-notify salespeople if a lead hasn’t been contacted in 3+ days
- In-dashboard notification badge

### 5. **Training Center**
- Curated dealership training content (text, video, links)
- Track completed training in `training_progress` table
- Certificates shown on user profile

---

## 🧱 Optional / Stretch Goals

- AI-powered **Sales Script Assistant**
- Role-based **certification system**
- Chat/notes on each lead
- Leaderboards for training engagement

---

## 🛠️ Local Development

### 1. Clone the repo
```bash
git clone https://github.com/your-org/phoenix-crm.git
cd phoenix-crm
```

## Setup Instructions

You can use the setup script to install dependencies and create necessary config files:

```bash
chmod +x setup.sh
./setup.sh
```

Or manually install dependencies:

```bash
npm install
```

### 3. Environment Variables
Make sure your `.env` file contains the necessary environment variables, especially:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (Get this from your Supabase dashboard under Settings > API > service_role)

### 4. Seeding the Database
To populate your database with test data:

```bash
npm run seed
```

### 5. Testing Repositories
To test that your repositories are working correctly:

```bash
npm run test-repos
```

### 6. Running the Application
```bash
npm run dev
```

### 7. Stored Procedures
Make sure you've run the SQL script containing all stored procedures before testing repositories.
You can find the SQL in the `db.sql` file.
