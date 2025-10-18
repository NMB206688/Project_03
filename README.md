

# Feedback Portal

A full-stack app for collecting feedback from students/users and managing it via an admin dashboard.

* **Landing page**: Submit Feedback (no login required)
* **Auth**: Signup/Login for normal users; the email in `.env` becomes **admin**
* **Users**: can submit feedback (optionally anonymous), view their own submissions, and reply **after** an admin replies
* **Admin**: sees all feedback, changes status, and replies in threads

---

## Tech Stack

* **Frontend**: React + Vite (Node ≥ 20.19 or 22.12+)
* **Backend**: Node.js + Express
* **Database**: MongoDB (Mongoose)
* **Auth**: JWT (Bearer tokens)
* **Security**: Helmet, CORS, rate limiting

---

## Project Structure

```
feedback-portal/
├─ client/                     # React + Vite frontend
│  ├─ src/
│  │  ├─ api.js               # Axios client + endpoints
│  │  ├─ auth.js              # token storage helpers
│  │  ├─ App.jsx              # routes + top nav
│  │  ├─ main.jsx             # entry
│  │  ├─ theme.css            # styles (centered layout, gradients)
│  │  ├─ components/
│  │  │  └─ AdminRoute.jsx    # route guard for admin
│  │  └─ pages/
│  │     ├─ Submit.jsx        # landing page (submit form)
│  │     ├─ Login.jsx
│  │     ├─ Signup.jsx
│  │     └─ Admin.jsx         # admin dashboard
│  └─ .env.development        # VITE_API_BASE
│
├─ server/                    # Node/Express API
│  ├─ src/
│  │  ├─ index.js             # server bootstrap
│  │  ├─ utils/jwt.js         # sign/verify JWT
│  │  ├─ middleware/auth.js   # requireAuth / requireSuperAdmin
│  │  ├─ controllers/
│  │  │  ├─ authController.js
│  │  │  ├─ feedbackController.js
│  │  │  └─ commentController.js
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  ├─ Feedback.js
│  │  │  └─ Comment.js
│  │  └─ routes/
│  │     ├─ authRoutes.js
│  │     ├─ feedbackRoutes.js
│  │     └─ commentRoutes.js
│  └─ .env
│
└─ README.md                  # this file
```

---

## Prerequisites

* **Node**: v22.12.0 (recommended) or ≥ 20.19
  Check with:

  ```bash
  node -v
  npm -v
  ```
* **MongoDB** running locally at `mongodb://127.0.0.1:27017`

---

## 1) Configure Environment

### `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/feedback_portal_dev
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev_secret_change_me
SUPERADMIN_EMAIL=admin@gmail.com
```

> The user who registers with `SUPERADMIN_EMAIL` becomes **admin** automatically.

### `client/.env.development`

```env
VITE_API_BASE=http://localhost:5000/api/v1
```

---

## 2) Install & Run

### Server

```bash
cd server
npm install
npm run dev
# expect:
# ✅ Connected to MongoDB
# 🚀 Server running at http://localhost:5000
```

### Client

```bash
cd ../client
npm install
npm run dev
# open the printed URL, e.g. http://localhost:5173
```

---

## 3) First Admin (seeding)

Either **signup in the UI** using the admin email from `.env`
or run this once:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Admin","email":"admin@gmail.com","password":"Passw0rd!"}'
```

Response contains `{ user: { role: "admin" }, token: "..." }`.

---

## 4) How to Use (UI)

### Landing Page – Submit

* Centered form to submit feedback.
* **Anonymous** submissions allowed.
* If logged in, recent submissions appear under “My latest submissions.”

### Login / Signup

* **Normal users**: any email except the admin one.
* **Admin**: register/login using `SUPERADMIN_EMAIL` (e.g., `admin@gmail.com`).

### Admin Dashboard

* Lists **all** feedback with columns (title, category, status, created).
* Actions:

  * Change status: `open → in review → resolved`
  * Open thread: view/add comments.
* Admin can always reply.

### Threads / Comments

* Admin can reply anytime.
* Users can reply **after an admin reply** and **not twice in a row** (prevents spamming).
* Users can only see their own feedback threads; admins see all.

---

## Roles & Permissions

| Capability           | Guest | User (logged in)              | Admin (superadmin email) |
| -------------------- | :---: | ----------------------------- | :----------------------: |
| Submit feedback      |   ✅   | ✅ (can link to their account) |             ✅            |
| See list of feedback |   ❌   | ✅ (own submissions only)      |    ✅ (all submissions)   |
| Change status        |   ❌   | ❌                             |             ✅            |
| Comment              |   ❌   | ✅* (after admin reply)        |             ✅            |
| View any thread      |   ❌   | ❌ (only theirs)               |             ✅            |

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

### Auth

* `POST /auth/register` → `{ user, token }`
  Body: `{ name, email, password }`
  If `email === SUPERADMIN_EMAIL`, role = `admin`.
* `POST /auth/login` → `{ user, token }`
  Body: `{ email, password }`
* `GET /auth/me` (Bearer) → `{ user }`
* `GET /auth/admin/ping` (Bearer admin) → `{ ok: true }`

### Feedback

* `POST /feedback` (Bearer optional)
  Body: `{ title, body, category?, isAnonymous? }`

  * If logged in & `isAnonymous=false`, links to `createdBy`.
* `GET /feedback` (Bearer optional)

  * Admin: all; User: own only; Guest: none
  * Query: `?status=open|in_review|resolved&category=bug|feature|ux|process|other|all&sort=-createdAt&page=1&limit=8`
* `PATCH /feedback/:id/status` (Bearer admin)
  Body: `{ status: "open" | "in_review" | "resolved" }`

### Comments

* `GET /feedback/:id/comments` (Bearer optional; permission enforced)
* `POST /feedback/:id/comments` (Bearer)

  * Admin: always can comment
  * User: only on own feedback, only after an admin commented, and not twice in a row
    Body: `{ body }`

> All protected routes use `Authorization: Bearer <token>` header.

---

## Common cURL Tests

```bash
# Register a normal user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Nani","email":"nani@gmail.com","password":"Passw0rd!"}'

# Login (get token)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nani@gmail.com","password":"Passw0rd!"}'

# As user, submit feedback (non-anonymous)
TOKEN=<paste_token_here>
curl -X POST http://localhost:5000/api/v1/feedback \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"App too slow","body":"Loads take 5s+","category":"bug","isAnonymous":false}'

# Admin login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"Passw0rd!"}'
ADMIN_TOKEN=<paste_admin_token>

# Admin: list all feedback
curl "http://localhost:5000/api/v1/feedback?sort=-createdAt&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Admin: status update
curl -X PATCH http://localhost:5000/api/v1/feedback/<FEEDBACK_ID>/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_review"}'

# Admin: add comment
curl -X POST http://localhost:5000/api/v1/feedback/<FEEDBACK_ID>/comments \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"body":"We are investigating."}'
```

---

## Troubleshooting

**Login failed (admin)**

* Make sure you used the exact email in `SUPERADMIN_EMAIL` (e.g., `admin@gmail.com`).
* Server must be restarted after editing `.env`.

**Signup failed**

* Email already exists (try logging in).
* Check server console for an error line—Mongo duplicate key, etc.

**Client can’t reach API**

* Verify `client/.env.development` → `VITE_API_BASE=http://localhost:5000/api/v1`
* Server is running and shows the “Server running” log.
* `CORS_ORIGIN` matches the Vite URL.

**Mongo collection got messy (only if needed)**

```bash
mongosh
use feedback_portal_dev
db.users.drop()
db.users.createIndex({ email: 1 }, { unique: true })
exit
```

Then re-register the admin.

**Node version mismatch**

* Use Node 22 LTS (or >= 20.19).
  In Windows with nvm:

  ```bash
  nvm install 22.12.0
  nvm use 22.12.0
  ```

---

## Security Notes

* Keep `JWT_SECRET` secret and unique in production.
* Set `CORS_ORIGIN` to your real frontend domain in production.
* Rate limiting enabled for `/api/*`. Tune values as needed.
* Passwords are salted + hashed with `bcryptjs`.

---

## Roadmap / Nice-to-haves

* File attachments on feedback & comments
* Labels/tags and assignees for admins
* Public feed (optional) with moderation
* Email notifications on replies
* Export to CSV

---

## License

MIT — use and adapt freely for your course/project.

---


