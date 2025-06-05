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
