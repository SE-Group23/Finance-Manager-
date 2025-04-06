# Auth Backend – Node.js + Express + PostgreSQL (Neon)

## ✅ Overview

This is the backend for a full-stack project using:
- Node.js + Express
- PostgreSQL (hosted on [Neon](https://neon.tech))
- JWT-based Authentication
- TypeScript

---

## 🔧 Features Implemented

- User **Signup** with:
  - Input validation
  - Duplicate email check
  - Password hashing (`bcryptjs`)
  - PostgreSQL insert
  - JWT generation
- User **Login** with:
  - Email + password check
  - Secure comparison (`bcrypt.compare`)
  - Token generation
  - `last_login` timestamp update
- `.env` based config with `DATABASE_URL` and `JWT_SECRET`

---

## 🗂️ Project Structure

```plaintext
backend/
│
├── index.ts                  # Main Express server file
├── .env                      # Environment variables (DB URL, JWT secret)
├── pg-migrate.config.js
|
├── db/                       # Database Access Layer
│   ├── index.ts              # PostgreSQL pool connection (via pg)
│   ├── query.ts              # Reusable query wrapper w/ error handling
│   ├── migrations/           # SQL files for schema setup
│   │   └── initialSchema.sql
│   ├── repositories/         # Repository pattern (table-level logic)
│   │   ├── userRepository.ts
│   │   └── transactionRepository.ts
│   └── models/               # TypeScript interfaces for table rows
│       ├── user.ts
│       └── transaction.ts
│
├── routes/                   # Express routes (e.g., auth routes)
│   └── auth.ts
├── controllers/              # (TBD) Route controllers (separation of logic)
│   └── authController.ts
├── middleware/               # (TBD) Middleware (e.g., auth checks)
└── utils/                    # (TBD) Shared helpers (e.g., validation, logging)


## 🐘 Database Migrations with `node-pg-migrate`

This project uses [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate) for managing PostgreSQL database migrations.

### 📦 Installation

Install the migration tool as a development dependency (run this inside the backend folder):

```bash
npm install node-pg-migrate --save-dev
```

---

### ⚙️ Configuration

Created a file called `pg-migrate.config.js` in the root of your backend folder:

```js
require('dotenv').config();

module.exports = {
  migrationDirectory: 'db/migrations',
  direction: 'up',
  logFileName: 'migrations.log',
  databaseUrl: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};
```

Make sure your `.env` file contains the correct `DATABASE_URL` pointing to your PostgreSQL instance.

---

### 🏃 Running Migrations

Once this script is in `package.json`:

```json
"scripts": {
  "migrate": "node-pg-migrate"
}
```

Then run:

```bash
npm run migrate
```

This will apply all new migrations to your database.


---

### 🛠 Creating a New Migration

To create a new migration file:

```bash
npm run migrate:create migration_name
```

A new file will be created inside `db/migrations/`.
