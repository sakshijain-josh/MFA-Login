## 🔥 API Documentation

Base URL:

```txt
http://localhost:8080/api
```

### ✅ Endpoints Summary

| Method | Endpoint      | Description                      |
| ------ | ------------- | -------------------------------- |
| GET    | `/health`     | Health check                     |
| POST   | `/register`   | Register a new user              |
| POST   | `/login`      | Login → validates password + OTP |
| POST   | `/verify-otp` | Verify OTP → final login success |

---

### ✅ 1) Health Check

**Request**

```http
GET /api/health
```

**Response**

```json
{
  "message": "Backend is running ✅"
}
```

---

### ✅ 2) Register User

**Request**

```http
POST /api/register
Content-Type: application/json
```

**Body**

```json
{
  "username": "sakshijain",
  "password": "sakshi11"
}
```

**Response**

```json
{
  "message": "User registered successfully"
}
```

---

### ✅ 3) Login User (Generates OTP)

**Request**

```http
POST /api/login
Content-Type: application/json
```

**Body**

```json
{
  "username": "sakshijain",
  "password": "sakshi11"
}
```

**Response**

```json
{
  "message": "Password verified. OTP sent (check backend console)."
}
```

✅ Backend console will show:

```txt
[MFA OTP] User=sakshijain OTP=482193 (valid 2 min)
```

---

### ✅ 4) Verify OTP (MFA Step)

**Request**

```http
POST /api/verify-otp
Content-Type: application/json
```

**Body**

```json
{
  "username": "sakshi",
  "otp": "482193"
}
```

**Response**

```json
{
  "message": "Login Successful ✅"
}
```

