import React, { useRef, useState, useEffect } from "react";

function Map({ selectedMap, siteImage, route }) {
  const imgRef = useRef();
  const [imgHeight, setImgHeight] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);
  // Use the provided siteImage if available, otherwise fallback to selectedMap
  const src =
    siteImage ||
    (selectedMap.startsWith("data:")
      ? selectedMap
      : process.env.PUBLIC_URL + "/images/" + selectedMap);
  useEffect(() => {
    if (imgRef.current) {
      setImgHeight(imgRef.current.offsetHeight);
      setImgWidth(imgRef.current.offsetWidth);
    }
  }, [src]);
  if (!selectedMap) {
    return <div>Please select a map area.</div>;
  }
  return (
    <div
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        padding: 0,
        background: "none",
        border: "none",
        borderRadius: 0,
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt="Selected Map"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "auto",
          display: "block",
          borderRadius: 0,
          margin: 0,
          padding: 0,
          boxShadow: "none",
          background: "none",
        }}
        onLoad={() => {
          if (imgRef.current) {
            setImgHeight(imgRef.current.offsetHeight);
            setImgWidth(imgRef.current.offsetWidth);
          }
        }}
      />
      {route && route.line && imgHeight > 0 && imgWidth > 0 && (
        <svg
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            pointerEvents: "none",
            width: "100%",
            maxWidth: "100%",
            height: "100%",
          }}
          width={imgWidth}
          height={imgHeight}
        >
          <polyline
            points={route.line
              .map((p) => `${p.x * imgWidth},${p.y * imgHeight}`)
              .join(" ")}
            fill="none"
            stroke="#c00"
            strokeWidth="4"
          />
        </svg>
      )}
    </div>
  );
}

export default Map;
