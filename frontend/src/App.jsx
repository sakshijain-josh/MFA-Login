import { useState } from "react";
import { registerUser, loginUser, verifyOTP } from "./api";

export default function App() {
  const [mode, setMode] = useState("register"); // register | login | otp
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function resetMsg() {
    setMsg("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    resetMsg();
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = await registerUser(username, password);
      setMsg(data.message);
    } catch (err) {
      setMsg("Something went wrong. Check backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = await loginUser(username, password);
      setMsg(data.message);

      if (data.message.toLowerCase().includes("otp sent")) {
        setMode("otp");
      }
    } catch (err) {
      setMsg("Something went wrong. Check backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = await verifyOTP(username, otp);
      setMsg(data.message);
    } catch (err) {
      setMsg("Something went wrong. Try login again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />

      <div style={styles.shell}>
        {/* Left side text */}
        <div style={styles.left}>
          <div style={styles.brand}>
            <div style={styles.logo}>🔐</div>
            <div>
              <div style={styles.brandTitle}>MFA Login</div>
              <div style={styles.brandSub}>Secure • Minimal • Modern</div>
            </div>
          </div>

          <h1 style={styles.heroTitle}>
            A tiny auth system
            <br />
            with <span style={styles.heroHighlight}>bcrypt + OTP</span>
          </h1>

          <p style={styles.heroText}>
            Register → Login → OTP verify.
            <br />
            OTP appears in backend console.
          </p>

          
        </div>

        {/* Right side glass card */}
        <div style={styles.card}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tabBtn,
                ...(mode === "register" ? styles.tabActive : {}),
              }}
              onClick={() => switchMode("register")}
              disabled={loading}
            >
              Register
            </button>

            <button
              style={{
                ...styles.tabBtn,
                ...(mode === "login" ? styles.tabActive : {}),
              }}
              onClick={() => switchMode("login")}
              disabled={loading}
            >
              Login
            </button>

            <button
              style={{
                ...styles.tabBtn,
                ...(mode === "otp" ? styles.tabActive : {}),
              }}
              onClick={() => switchMode("otp")}
              disabled={loading}
              title="OTP step (after login)"
            >
              OTP
            </button>
          </div>

          {(mode === "register" || mode === "login") && (
            <form
              onSubmit={mode === "register" ? handleRegister : handleLogin}
              style={styles.form}
            >
              <div style={styles.formTitle}>
                {mode === "register" ? "Create your account" : "Welcome back"}
              </div>
              <div style={styles.formSub}>
                {mode === "register"
                  ? "Your password is securely hashed using bcrypt."
                  : "Enter credentials to receive OTP."}
              </div>

              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                placeholder="e.g. sakshi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button style={styles.primaryBtn} type="submit" disabled={loading}>
                {loading
                  ? "Processing..."
                  : mode === "register"
                  ? "Register"
                  : "Login"}
              </button>

              <div style={styles.hint}>
                {mode === "login" ? (
                  <>
                    After password check, OTP is printed in{" "}
                    <b>Go backend terminal</b>.
                  </>
                ) : (
                  <>Tip: Use a strong password even in demos 😄</>
                )}
              </div>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleVerifyOTP} style={styles.form}>
              <div style={styles.formTitle}>OTP Verification</div>
              <div style={styles.formSub}>
                OTP is printed in backend console (simulated SMS).
              </div>

              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                placeholder="same username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label style={styles.label}>Enter OTP</label>
              <input
                style={styles.input}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />

              <button style={styles.primaryBtn} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                style={styles.secondaryBtn}
                type="button"
                onClick={() => switchMode("login")}
                disabled={loading}
              >
                Back to Login
              </button>

              <div style={styles.hint}>
                OTP expires in <b>2 minutes</b>.
              </div>
            </form>
          )}

          {msg && (
            <div
              style={{
                ...styles.toast,
                ...(msg.toLowerCase().includes("successful")
                  ? styles.toastSuccess
                  : msg.toLowerCase().includes("invalid")
                  ? styles.toastError
                  : styles.toastInfo),
              }}
            >
              {msg}
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 22,
    background:
      "radial-gradient(circle at top left, #0b1220 0%, #070b14 55%, #04060d 100%)",
    overflow: "hidden",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    position: "relative",
    color: "#e5e7eb",
  },

  shell: {
    width: "100%",
    maxWidth: 980,
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 18,
    alignItems: "stretch",
    zIndex: 2,
  },

  left: {
    padding: 18,
    borderRadius: 22,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    fontSize: 18,
  },
  brandTitle: {
    fontWeight: 800,
    letterSpacing: 0.4,
  },
  brandSub: {
    fontSize: 12,
    color: "rgba(229,231,235,0.70)",
  },

  heroTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.1,
    letterSpacing: -0.6,
  },
  heroHighlight: {
    background: "linear-gradient(90deg, #60a5fa, #a78bfa, #34d399)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 900,
  },
  heroText: {
    marginTop: 12,
    marginBottom: 16,
    color: "rgba(229,231,235,0.75)",
    lineHeight: 1.5,
  },

  pills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  pill: {
    fontSize: 12,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(229,231,235,0.85)",
  },

  card: {
    borderRadius: 22,
    padding: 16,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 25px 80px rgba(0,0,0,0.55)",
    backdropFilter: "blur(16px)",
    position: "relative",
    overflow: "hidden",
  },

  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 12,
  },

  tabBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(229,231,235,0.85)",
    cursor: "pointer",
    fontWeight: 700,
    transition: "all 0.2s ease",
  },

  tabActive: {
    background: "linear-gradient(135deg, rgba(96,165,250,0.35), rgba(167,139,250,0.25))",
    border: "1px solid rgba(167,139,250,0.45)",
    color: "#ffffff",
    boxShadow: "0 10px 25px rgba(167,139,250,0.18)",
  },

  form: {
    display: "grid",
    gap: 10,
    paddingTop: 10,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.2,
  },

  formSub: {
    fontSize: 13,
    color: "rgba(229,231,235,0.70)",
    marginBottom: 6,
  },

  label: {
    fontSize: 12,
    color: "rgba(229,231,235,0.75)",
    marginTop: 6,
  },

  input: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(2,6,23,0.55)",
    color: "#fff",
    outline: "none",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
    transition: "all 0.2s ease",
  },

  primaryBtn: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
    color: "#051018",
    background: "linear-gradient(135deg, #34d399, #60a5fa, #a78bfa)",
    boxShadow: "0 14px 40px rgba(96,165,250,0.18)",
  },

  secondaryBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(229,231,235,0.9)",
    cursor: "pointer",
    fontWeight: 800,
  },

  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(229,231,235,0.65)",
    lineHeight: 1.4,
  },

  toast: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.35)",
    color: "rgba(229,231,235,0.9)",
    fontSize: 13,
    lineHeight: 1.35,
  },

  toastSuccess: {
    borderColor: "rgba(52,211,153,0.35)",
    background: "rgba(52,211,153,0.08)",
  },

  toastError: {
    borderColor: "rgba(248,113,113,0.35)",
    background: "rgba(248,113,113,0.08)",
  },

  toastInfo: {
    borderColor: "rgba(96,165,250,0.35)",
    background: "rgba(96,165,250,0.08)",
  },

  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "rgba(229,231,235,0.45)",
    zIndex: 2,
  },

  blob: {
    position: "absolute",
    filter: "blur(60px)",
    opacity: 0.5,
    borderRadius: "999px",
    zIndex: 1,
  },
  blob1: {
    width: 420,
    height: 420,
    left: -140,
    top: -140,
    background: "#60a5fa",
  },
  blob2: {
    width: 520,
    height: 520,
    right: -200,
    top: 40,
    background: "#a78bfa",
  },
  blob3: {
    width: 480,
    height: 480,
    left: "35%",
    bottom: -220,
    background: "#34d399",
  },
};
