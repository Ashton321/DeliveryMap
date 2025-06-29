import React, { useState, useEffect } from "react";

function Map({ selectedMap }) {
    const [Maps, setMaps] = useState([]);

    useEffect(() => {
        fetch("maps.json")
        .then((response) => response.json())
        .then((data) => setMaps(data));
    }, []);

    if (!selectedMap) {
        return <div>Please select a map area.</div>;
    }
    return (
        <img src={`images/${selectedMap}`} alt="Selected Map" style={{ maxWidth: '100%', height: 'auto' }} />
    );
}

export default Map;
