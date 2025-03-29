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

## 🛠️ Database Schema

**Table: `users`**
```sql
user_id      SERIAL PRIMARY KEY
user_name    VARCHAR(100) NOT NULL
email        VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
created_on   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
last_login   TIMESTAMP
