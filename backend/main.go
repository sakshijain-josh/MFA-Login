package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username     string `json:"username"`
	PasswordHash string `json:"passwordHash"`
}

type OTPEntry struct {
	Code      string
	ExpiresAt time.Time
}

var (
	users   = []User{}               // in-memory storage
	otpData = map[string]OTPEntry{}  // username -> otp info
	mu      sync.Mutex               // protect shared memory
)

type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type VerifyOTPRequest struct {
	Username string `json:"username"`
	OTP      string `json:"otp"`
}

type APIResponse struct {
	Message string `json:"message"`
}

// --- Utility ---
func findUser(username string) (User, bool) {
	for _, u := range users {
		if u.Username == username {
			return u, true
		}
	}
	return User{}, false
}

func generateOTP() (string, error) {
	// 6-digit OTP: 100000 - 999999
	nBig, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "", err
	}
	otp := 100000 + int(nBig.Int64())
	return fmt.Sprintf("%06d", otp), nil
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*") // for dev only
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
}

func jsonResponse(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(APIResponse{Message: msg})
}

// --- Handlers ---

func handleRegister(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Password = strings.TrimSpace(req.Password)

	if req.Username == "" || req.Password == "" {
		jsonResponse(w, http.StatusBadRequest, "Username and password required")
		return
	}

	mu.Lock()
	defer mu.Unlock()

	_, exists := findUser(req.Username)
	if exists {
		jsonResponse(w, http.StatusConflict, "User already exists")
		return
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	users = append(users, User{
		Username:     req.Username,
		PasswordHash: string(hashBytes),
	})

	jsonResponse(w, http.StatusCreated, "User registered successfully")
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Password = strings.TrimSpace(req.Password)

	if req.Username == "" || req.Password == "" {
		jsonResponse(w, http.StatusBadRequest, "Username and password required")
		return
	}

	mu.Lock()
	user, exists := findUser(req.Username)
	mu.Unlock()

	if !exists {
		jsonResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Verify bcrypt password
	err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		jsonResponse(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	// Password correct -> Generate OTP
	otp, err := generateOTP()
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, "Failed to generate OTP")
		return
	}

	mu.Lock()
	otpData[req.Username] = OTPEntry{
		Code:      otp,
		ExpiresAt: time.Now().Add(2 * time.Minute),
	}
	mu.Unlock()

	// MFA Simulation: "send SMS" => print OTP to console
	log.Printf("[MFA OTP] User=%s OTP=%s (valid 2 min)\n", req.Username, otp)

	jsonResponse(w, http.StatusOK, "Password verified. OTP sent (check backend console).")
}

func handleVerifyOTP(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req VerifyOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.OTP = strings.TrimSpace(req.OTP)

	if req.Username == "" || req.OTP == "" {
		jsonResponse(w, http.StatusBadRequest, "Username and OTP required")
		return
	}

	mu.Lock()
	entry, ok := otpData[req.Username]
	mu.Unlock()

	if !ok {
		jsonResponse(w, http.StatusUnauthorized, "OTP not found. Login again.")
		return
	}

	if time.Now().After(entry.ExpiresAt) {
		mu.Lock()
		delete(otpData, req.Username)
		mu.Unlock()
		jsonResponse(w, http.StatusUnauthorized, "OTP expired. Login again.")
		return
	}

	if req.OTP != entry.Code {
		jsonResponse(w, http.StatusUnauthorized, "Invalid OTP")
		return
	}

	// OTP correct -> remove OTP
	mu.Lock()
	delete(otpData, req.Username)
	mu.Unlock()

	jsonResponse(w, http.StatusOK, "Login Successful ✅")
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	jsonResponse(w, http.StatusOK, "Backend is running ✅")
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", handleHealth)
	mux.HandleFunc("/api/register", handleRegister)
	mux.HandleFunc("/api/login", handleLogin)
	mux.HandleFunc("/api/verify-otp", handleVerifyOTP)

	fmt.Println("✅ Go backend running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
