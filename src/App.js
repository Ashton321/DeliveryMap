import React, { useState, useEffect } from "react";
import "./styles.css";
import Map from "./components/Map";
import AdminDashboard from "./components/AdminDashboard";
import "bootstrap/dist/css/bootstrap.min.css";

const LOCAL_STORAGE_KEY = "deliverymap-mapsByGate";

const gateOptions = [
  { label: "Gate 1", value: "1" },
  { label: "Gate 5", value: "5" },
  { label: "Gate 9", value: "9" },
];

function getGateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("gate");
}

function App() {
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedMap, setSelectedMap] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("deliverymap-darkmode");
      return saved === null ? false : saved === "true";
    } catch {
      return false;
    }
  });
  const [showGateDropdown, setShowGateDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("deliverymap-users");
    return saved
      ? JSON.parse(saved)
      : [{ username: "admin", password: "password123" }];
  });

  // Read gates and routes from localStorage for driver view
  const gates = (() => {
    try {
      const saved = localStorage.getItem("siteGates");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();
  const routes = (() => {
    try {
      const saved = localStorage.getItem("siteRoutes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();
  // Get gate name from selectedGate value
  const gateObj = gates.find((g) => g.name.endsWith(selectedGate));
  // Build destination options from routes for this gate
  const destOptions = routes
    .filter((r) => r.gate === (gateObj && gateObj.name))
    .map((r) => ({ label: r.dest, value: r.dest }));
  // Find the selected route for the selected gate and destination
  const selectedRoute = routes.find(
    (r) => r.gate === (gateObj && gateObj.name) && r.dest === selectedMap
  );
  // Use the admin-uploaded map if available
  const siteImage =
    localStorage.getItem("siteImage") ||
    process.env.PUBLIC_URL + "/images/Example.png";

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("deliverymap-darkmode", darkMode);
      localStorage.setItem("deliverymap-users", JSON.stringify(users));
    } catch {}
  }, [darkMode, users]);

  useEffect(() => {
    const gateFromUrl = getGateFromUrl();
    if (gateFromUrl) {
      setSelectedGate(gateFromUrl);
    } else {
      setSelectedGate("9"); // Default to Gate 9 if not in URL
    }
    setSelectedMap(""); // Reset map selection when gate changes
  }, []);

  function handleLogin(username, password) {
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setIsAdmin(true);
      setShowLogin(false);
      setShowCreate(false);
    } else {
      return false;
    }
    return true;
  }

  function handleCreateAccount(username, password) {
    if (!username || !password) return false;
    if (users.find((u) => u.username === username)) return false;
    setUsers((prev) => [...prev, { username, password }]);
    setShowCreate(false);
    setShowLogin(true);
    return true;
  }

  function handleLogout() {
    setIsAdmin(false);
    setShowLogin(false);
    setShowCreate(false);
  }

  // Login and Create Account forms
  function LoginForm({ onLogin, onShowCreate, onBack }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    function handleSubmit(e) {
      e.preventDefault();
      if (!onLogin(username, password)) {
        setError("Invalid credentials");
      }
    }
    return (
      <div className="container" style={{ maxWidth: 340, marginTop: 60 }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="form-control mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div style={{ color: "#c00", marginBottom: 8 }}>{error}</div>
          )}
          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="btn btn-link" onClick={onShowCreate}>
            Create Account
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="btn btn-outline-secondary w-100" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  function CreateAccountForm({ onCreate, onShowLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    function handleSubmit(e) {
      e.preventDefault();
      if (!onCreate(username, password)) {
        setError("Username taken or invalid");
      }
    }
    return (
      <div className="container" style={{ maxWidth: 340, marginTop: 60 }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>
          Create Admin Account
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="form-control mb-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div style={{ color: "#c00", marginBottom: 8 }}>{error}</div>
          )}
          <button className="btn btn-success w-100" type="submit">
            Create Account
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="btn btn-link" onClick={onShowLogin}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  if (showLogin) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onShowCreate={() => {
          setShowLogin(false);
          setShowCreate(true);
        }}
        onBack={() => setShowLogin(false)}
      />
    );
  }
  if (showCreate) {
    return (
      <CreateAccountForm
        onCreate={handleCreateAccount}
        onShowLogin={() => {
          setShowCreate(false);
          setShowLogin(true);
        }}
      />
    );
  }
  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Default main page (public)
  return (
    <div
      className={`App${darkMode ? " dark" : ""}`}
      style={{ overflowX: "hidden" }}
    >
      {/* Floating dark mode toggle */}
      <button
        onClick={() => setDarkMode((d) => !d)}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 2000,
          background: darkMode ? "#232946" : "#fff",
          color: darkMode ? "#fff" : "#232946",
          border: "1px solid #6366f1",
          borderRadius: 20,
          padding: "6px 18px",
          fontWeight: 600,
          fontSize: 15,
          boxShadow: "0 2px 8px #0002",
          cursor: "pointer",
        }}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
      <div
        className="map-driver-container"
        style={{
          width: "100vw",
          maxWidth: "100vw",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            padding: "0 12px",
          }}
        >
          <h1 style={{ fontSize: 24, margin: 0 }}>Delivery Map</h1>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowLogin(true)}
            style={{ fontSize: 15, padding: "4px 12px" }}
          >
            Admin Login
          </button>
        </div>
        <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: 18 }}>
          Gate {selectedGate}
        </h2>
        <div
          style={{
            fontSize: 13,
            textAlign: "right",
            marginBottom: 6,
            padding: "0 12px",
          }}
        >
          <span
            style={{
              color: "#888",
              cursor: "pointer",
              textDecoration: "underline dotted",
              userSelect: "none",
            }}
            onClick={() => setShowGateDropdown((v) => !v)}
          >
            Change starting gate
          </span>
          {showGateDropdown && (
            <select
              className="form-select mt-2"
              style={{ maxWidth: 140, marginLeft: "auto" }}
              value={selectedGate}
              onChange={(e) => {
                const newGate = e.target.value;
                window.location.search = `?gate=${newGate}`;
              }}
            >
              {gateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <select
          className="form-select mb-3"
          value={selectedMap}
          onChange={(e) => setSelectedMap(e.target.value)}
          style={{ margin: "0 12px" }}
        >
          <option value="">Please select a destination</option>
          {destOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          style={{
            width: "100vw",
            maxWidth: "100vw",
            overflowX: "hidden",
            margin: 0,
            padding: 0,
          }}
        >
          <Map
            selectedMap={siteImage}
            siteImage={siteImage}
            route={selectedRoute}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
