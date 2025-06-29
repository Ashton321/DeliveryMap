import React, { useState, useEffect } from "react";
import "./styles.css";
import Map from "./components/Map";
import "bootstrap/dist/css/bootstrap.min.css";

const mapOptionsByGate = {
  1: [
    { label: "Loading Dock", value: "Example1.png" },
    { label: "Dropoff Area", value: "Example2.png" },
    { label: "Stockpile", value: "Example3.png" },
  ],
  5: [
    { label: "Loading Dock", value: "Example4.png" },
    { label: "Dropoff Area", value: "Example5.png" },
    { label: "Stockpile", value: "Example6.png" },
  ],
  9: [
    { label: "Loading Dock", value: "Example7.png" },
    { label: "Dropoff Area", value: "Example8.png" },
    { label: "Stockpile", value: "Example9.png" },
  ],
};

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
  const [darkMode, setDarkMode] = useState(false);
  const [showGateDropdown, setShowGateDropdown] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const gateFromUrl = getGateFromUrl();
    if (gateFromUrl) {
      setSelectedGate(gateFromUrl);
    } else {
      setSelectedGate("9"); // Default to Gate 9 if not in URL
    }
  }, []);

  return (
    <div className={`App${darkMode ? " dark" : ""}`}>
      <div className="container">
        <h1>Gate {selectedGate}</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div></div> {/* Empty div to balance flex space */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 15,
                color: darkMode ? "#f3f6fa" : "#232946",
                marginRight: 6,
              }}
            >
              {darkMode ? "Dark Mode" : "Light Mode"}
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        <div style={{ fontSize: 13, textAlign: "right", marginBottom: 6 }}>
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
              onChange={(e) => setSelectedGate(e.target.value)}
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
        >
          <option value="">Please select a map</option>
          {(mapOptionsByGate[selectedGate] || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Map selectedMap={selectedMap || "Example.png"} />
      </div>
    </div>
  );
}

export default App;
