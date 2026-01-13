#  Minimal Login System — bcrypt + OTP 

A minimal **secure login system** built with **React (frontend)** and **Go (backend)** featuring:

- ✅ User Registration (secure password hashing using **bcrypt**)
- ✅ User Login (password verification using bcrypt compare)
- ✅ MFA Simulation (6-digit OTP printed in backend console)


---

## ✨ Demo Flow

1. **Register**
   - User enters `username + password`
   - Password is hashed with `bcrypt`
   - Stored in in-memory backend storage

2. **Login**
   - User enters `username + password`
   - Backend verifies password hash

3. **OTP Verification (MFA)**
   - Backend generates a **6-digit OTP**
   - OTP is printed in backend terminal (simulating SMS)
   - User enters OTP in UI
   - On success → ✅ Login Successful

---


## 📁 Project Structure

```txt
minimal-login-mfa/
├── backend-go/
│   ├── go.mod
│   └── main.go
└── frontend-react/
    ├── package.json
    └── src/
        ├── api.js
        ├── App.jsx
        └── main.jsx

```


## ✅ Requirements

### Backend

* Go installed (`go1.20+ recommended`)
* Works with standard Go tooling

### Frontend

Vite depends on Node versions.

✅ Recommended:

* Node **20.19+** or **22.12+**

Check version:

```bash
node -v
npm -v
```



## 🚀 Setup & Run

### 1️⃣ Start Backend (Go)

```bash
cd backend-go

go run main.go
```

Backend will run on:

* `http://localhost:8080`

You should see:

```txt
✅ Go backend running on http://localhost:8080
```

---

### 2️⃣ Start Frontend (React)

```bash
cd frontend-react
npm install
npm run dev
```

Frontend will run on:

* `http://localhost:5173`

---


## 🔒 Security Notes

This project demonstrates key secure practices:

* Passwords are **NOT stored in plain text**
* Password is hashed using **bcrypt**
* OTP is time-limited (**2 minutes**)
* OTP is deleted after success

⚠️ Since it uses **in-memory storage**, restarting backend clears users + OTPs.

## UI

<img width="1822" height="956" alt="image" src="https://github.com/user-attachments/assets/84d8c7ad-e1db-467d-b581-e2ea2e6412ef" />

## OTP

<img width="1822" height="956" alt="image" src="https://github.com/user-attachments/assets/69e25ea6-3567-42b4-a889-1c79502750ad" />




---
