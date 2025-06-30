import React, { useState, useRef, useEffect } from "react";
import "./AdminDashboard.css";

const defaultSections = [
  { key: "map", label: "Upload Map" },
  { key: "gates", label: "Manage Gates" },
  { key: "routes", label: "Manage Routes" },
  { key: "preview", label: "Preview" },
];

export default function AdminDashboard({ onLogout }) {
  const [section, setSection] = useState("map");
  const [siteImage, setSiteImage] = useState(
    () =>
      localStorage.getItem("siteImage") ||
      process.env.PUBLIC_URL + "/images/Example.png"
  );
  const [gates, setGates] = useState(() => {
    const saved = localStorage.getItem("siteGates");
    return saved ? JSON.parse(saved) : [];
  });
  const [routes, setRoutes] = useState(() => {
    const saved = localStorage.getItem("siteRoutes");
    return saved ? JSON.parse(saved) : [];
  });
  const [gateMapWidth, setGateMapWidth] = useState(600);
  const [routeMapWidth, setRouteMapWidth] = useState(600);
  const [drawing, setDrawing] = useState(false);
  const [currentGate, setCurrentGate] = useState(null);
  const [currentLine, setCurrentLine] = useState([]);
  const [imageHeight, setImageHeight] = useState(0);
  const imageRef = useRef();

  // Save to localStorage on change
  function saveGates(newGates) {
    setGates(newGates);
    localStorage.setItem("siteGates", JSON.stringify(newGates));
  }
  function saveRoutes(newRoutes) {
    setRoutes(newRoutes);
    localStorage.setItem("siteRoutes", JSON.stringify(newRoutes));
  }

  // Upload site image
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSiteImage(ev.target.result);
      localStorage.setItem("siteImage", ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  // Add gate by clicking on image
  function handleImageClick(e) {
    if (!siteImage || section !== "gates") return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width).toFixed(4);
    const y = ((e.clientY - rect.top) / rect.height).toFixed(4);
    const name = prompt("Gate name?");
    if (name) {
      const newGates = [...gates, { name, x, y }];
      saveGates(newGates);
    }
  }

  function handleRouteMapClick(e) {
    if (!siteImage || !currentGate) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width).toFixed(4);
    const y = ((e.clientY - rect.top) / rect.height).toFixed(4);
    setCurrentLine((line) => [...line, { x, y }]);
  }

  function handleStartRoute(gateIdx) {
    setCurrentGate(gates[gateIdx]);
    setCurrentLine([]);
    setDrawing(true);
  }

  function handleSaveRoute() {
    const dest = prompt("Destination name?");
    if (!dest || currentLine.length < 2) return;
    const newRoute = {
      gate: currentGate.name,
      dest,
      line: currentLine,
    };
    saveRoutes([...routes, newRoute]);
    setDrawing(false);
    setCurrentGate(null);
    setCurrentLine([]);
  }

  function handleCancelRoute() {
    setDrawing(false);
    setCurrentGate(null);
    setCurrentLine([]);
  }

  // Delete gate/route
  function handleDeleteGate(idx) {
    if (!window.confirm("Delete this gate and all its routes?")) return;
    const gateName = gates[idx].name;
    saveGates(gates.filter((_, i) => i !== idx));
    saveRoutes(routes.filter((r) => r.gate !== gateName));
  }
  function handleDeleteRoute(idx) {
    if (!window.confirm("Delete this route?")) return;
    saveRoutes(routes.filter((_, i) => i !== idx));
  }

  // Preview mode
  function Preview() {
    const [gate, setGate] = useState(gates[0]?.name || "");
    const gateRoutes = routes.filter((r) => r.gate === gate);
    const [routeIdx, setRouteIdx] = useState(0);
    const [previewHeight, setPreviewHeight] = useState(0);
    const previewImgRef = useRef();
    useEffect(() => {
      if (previewImgRef.current) {
        setPreviewHeight(previewImgRef.current.offsetHeight);
      }
    }, [siteImage, gate, routeIdx]);
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h3>Preview Driver View</h3>
        <div style={{ marginBottom: 12 }}>
          <select
            value={gate}
            onChange={(e) => {
              setGate(e.target.value);
              setRouteIdx(0);
            }}
          >
            {gates.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        {gateRoutes.length > 0 ? (
          <div>
            <select
              value={routeIdx}
              onChange={(e) => setRouteIdx(Number(e.target.value))}
            >
              {gateRoutes.map((r, i) => (
                <option key={i} value={i}>
                  {r.dest}
                </option>
              ))}
            </select>
            <div
              style={{
                marginTop: 16,
                position: "relative",
                display: "inline-block",
                width: "100%",
              }}
            >
              <img
                ref={previewImgRef}
                src={siteImage}
                alt={gateRoutes[routeIdx].dest}
                style={{
                  width: "100%",
                  maxWidth: 600,
                  borderRadius: 8,
                  display: "block",
                }}
                onLoad={() =>
                  setPreviewHeight(
                    previewImgRef.current
                      ? previewImgRef.current.offsetHeight
                      : 0
                  )
                }
              />
              {/* Overlay the selected route as a polyline */}
              {previewHeight > 0 && (
                <svg
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    pointerEvents: "none",
                  }}
                  width={
                    previewImgRef.current
                      ? previewImgRef.current.offsetWidth
                      : 0
                  }
                  height={previewHeight}
                >
                  <polyline
                    points={gateRoutes[routeIdx].line
                      .map(
                        (p) =>
                          `${
                            p.x *
                            (previewImgRef.current
                              ? previewImgRef.current.offsetWidth
                              : 0)
                          },${p.y * previewHeight}`
                      )
                      .join(" ")}
                    fill="none"
                    stroke="#c00"
                    strokeWidth="4"
                  />
                </svg>
              )}
            </div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              {gateRoutes[routeIdx].dest}
            </div>
          </div>
        ) : (
          <div>No routes for this gate.</div>
        )}
      </div>
    );
  }

  // Update imageHeight when the image loads or map width changes
  useEffect(() => {
    if (imageRef.current) {
      setImageHeight(imageRef.current.offsetHeight);
    }
  }, [siteImage, routeMapWidth, section]);

  // Responsive: show Driver View button in sidebar on mobile, fixed on desktop
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;

  return (
    <div className="admin-dashboard">
      {/* Driver View button: fixed on desktop, in sidebar on mobile */}
      {!isMobile && (
        <div style={{ position: "fixed", top: 18, right: 32, zIndex: 1000 }}>
          <button className="btn btn-outline-primary" onClick={onLogout}>
            Driver View
          </button>
        </div>
      )}
      <aside className="sidebar">
        <div className="sidebar-title">Admin</div>
        {defaultSections.map((s) => (
          <button
            key={s.key}
            className={section === s.key ? "active" : ""}
            onClick={() => setSection(s.key)}
            style={
              isMobile
                ? {
                    fontSize: 13,
                    padding: "10px 6px",
                    minWidth: 0,
                    wordBreak: "break-word",
                  }
                : {}
            }
          >
            {s.label}
          </button>
        ))}
        {isMobile && (
          <button
            className="btn btn-outline-primary"
            style={{ margin: 8 }}
            onClick={onLogout}
          >
            Driver View
          </button>
        )}
        <button className="logout" onClick={onLogout}>
          Logout
        </button>
      </aside>
      <main className="main-content">
        {section === "map" && (
          <div>
            <h2>Upload Site Map</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {siteImage && (
              <img
                ref={imageRef}
                src={siteImage}
                alt="Site Map"
                style={{ maxWidth: "100%", marginTop: 16, borderRadius: 8 }}
              />
            )}
          </div>
        )}
        {section === "gates" && (
          <div>
            <h2>Manage Gates</h2>
            {/* Responsive container for mobile */}
            {siteImage ? (
              <div
                style={{
                  position: "relative",
                  display: "block",
                  width: "100vw",
                  maxWidth: 800,
                  minWidth: 0,
                  height: "auto",
                  minHeight: 200,
                  overflowX: "auto",
                  border: "none",
                  borderRadius: 0,
                  background: "none",
                  boxShadow: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <img
                  ref={imageRef}
                  src={siteImage}
                  alt="Site Map"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 0,
                    cursor: "crosshair",
                    display: "block",
                    objectFit: "contain",
                    border: "none",
                    boxShadow: "none",
                    background: "none",
                    margin: 0,
                    padding: 0,
                    maxWidth: 800,
                  }}
                  onClick={handleImageClick}
                />
                {gates.map((g, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${g.x * 100}%`,
                      top: `${g.y * 100}%`,
                      transform: "translate(-50%, -50%)",
                      background: "#232946",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      border: "2px solid #fff",
                      cursor: "pointer",
                    }}
                    title={g.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete this gate?"))
                        handleDeleteGate(i);
                    }}
                  >
                    {g.name[0]}
                  </div>
                ))}
              </div>
            ) : (
              <div>Upload a site map first.</div>
            )}
            <div style={{ marginTop: 16, color: "#888" }}>
              Click on the map to add a gate. Click a gate marker to delete it.
            </div>
          </div>
        )}
        {section === "routes" && (
          <div>
            <h2>Manage Routes</h2>
            {/* Responsive container for mobile */}
            {siteImage ? (
              <div
                style={{
                  position: "relative",
                  display: "block",
                  width: "100vw",
                  maxWidth: 800,
                  minWidth: 0,
                  height: "auto",
                  minHeight: 200,
                  overflowX: "auto",
                  border: "none",
                  borderRadius: 0,
                  background: "none",
                  boxShadow: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                <img
                  ref={imageRef}
                  src={siteImage}
                  alt="Site Map"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 0,
                    cursor: drawing ? "crosshair" : "pointer",
                    display: "block",
                    objectFit: "contain",
                    border: "none",
                    boxShadow: "none",
                    background: "none",
                    margin: 0,
                    padding: 0,
                    maxWidth: 800,
                  }}
                  onClick={drawing ? handleRouteMapClick : undefined}
                  onLoad={() =>
                    setImageHeight(
                      imageRef.current ? imageRef.current.offsetHeight : 0
                    )
                  }
                />
                {/* SVG overlay for all lines and gates */}
                <svg
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    pointerEvents: "none",
                  }}
                  width={imageRef.current ? imageRef.current.offsetWidth : 0}
                  height={imageRef.current ? imageRef.current.offsetHeight : 0}
                >
                  {/* Draw all routes for all gates */}
                  {routes.map((r, idx) => (
                    <polyline
                      key={idx}
                      points={r.line
                        .map(
                          (p) =>
                            `${
                              p.x *
                              (imageRef.current
                                ? imageRef.current.offsetWidth
                                : 0)
                            },${
                              p.y *
                              (imageRef.current
                                ? imageRef.current.offsetHeight
                                : 0)
                            }`
                        )
                        .join(" ")}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      opacity={
                        currentGate && r.gate === currentGate.name ? 1 : 0.5
                      }
                    />
                  ))}
                  {/* Draw current line being drawn */}
                  {drawing && currentLine.length > 0 && (
                    <polyline
                      points={currentLine
                        .map(
                          (p) =>
                            `${
                              p.x *
                              (imageRef.current
                                ? imageRef.current.offsetWidth
                                : 0)
                            },${
                              p.y *
                              (imageRef.current
                                ? imageRef.current.offsetHeight
                                : 0)
                            }`
                        )
                        .join(" ")}
                      fill="none"
                      stroke="#c00"
                      strokeWidth="4"
                    />
                  )}
                </svg>
                {/* Draw gates as absolutely positioned divs */}
                {gates.map((g, i) => {
                  const isSelected =
                    drawing && currentGate && currentGate.name === g.name;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${g.x * 100}%`,
                        top: `${g.y * 100}%`,
                        transform: "translate(-50%, -50%)",
                        background: isSelected ? "#facc15" : "#6366f1",
                        color: isSelected ? "#232946" : "#fff",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        border: isSelected
                          ? "3px solid #232946"
                          : "2px solid #fff",
                        cursor: drawing ? "not-allowed" : "pointer",
                        zIndex: 2,
                        boxShadow: isSelected ? "0 0 0 4px #fde68a" : undefined,
                        transition:
                          "background 0.2s, border 0.2s, box-shadow 0.2s",
                      }}
                      title={g.name}
                      onClick={drawing ? undefined : () => handleStartRoute(i)}
                    >
                      {g.name[0]}
                    </div>
                  );
                })}
                {/* Route drawing controls */}
                {drawing && (
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: 8,
                        fontWeight: 600,
                        color: "#232946",
                        background: "#fde68a",
                        padding: "4px 12px",
                        borderRadius: 6,
                      }}
                    >
                      Drawing from: {currentGate?.name}
                    </div>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleSaveRoute}
                    >
                      Save Route
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleCancelRoute}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>Upload a site map first.</div>
            )}
            <div style={{ marginTop: 16, color: "#888" }}>
              Click a gate to start drawing a route. Click on the map to add
              points. Save when done.
            </div>
          </div>
        )}
        {section === "preview" && <Preview />}
      </main>
    </div>
  );
}
