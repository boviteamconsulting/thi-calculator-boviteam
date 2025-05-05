import React, { useState } from "react";

export default function App() {
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [thi, setThi] = useState(null);
  const [stressLevel, setStressLevel] = useState("");
  const [color, setColor] = useState("");

  const calculateTHI = () => {
    const T = parseFloat(temperature);
    const UR = parseFloat(humidity);
    if (isNaN(T) || isNaN(UR)) return;
    const result = (1.8 * T + 32) - (0.55 - 0.0055 * UR) * (1.8 * T - 26);
    const rounded = parseFloat(result.toFixed(1));
    setThi(rounded);

    let level = "";
    let levelColor = "";
    if (rounded < 68) {
      level = "Nessuno";
      levelColor = "green";
    } else if (rounded < 73) {
      level = "Leggero";
      levelColor = "limegreen";
    } else if (rounded < 79) {
      level = "Moderato";
      levelColor = "orange";
    } else if (rounded < 84) {
      level = "Elevato";
      levelColor = "orangered";
    } else {
      level = "Grave";
      levelColor = "red";
    }
    setStressLevel(level);
    setColor(levelColor);
  };

  const resetForm = () => {
    setTemperature("");
    setHumidity("");
    setThi(null);
    setStressLevel("");
    setColor("");
  };

  return (
    <div style={{
      fontFamily: "sans-serif",
      padding: 24,
      maxWidth: 360,
      margin: "40px auto",
      backgroundColor: "#f7f1e6",
      border: "4px solid #4d7c5a",
      borderRadius: 24,
      boxShadow: "0 0 12px rgba(0,0,0,0.1)"
    }}>
      <img
        src="/boviteam-logo.jpg"
        alt="Boviteam Logo"
        style={{ width: 150, display: "block", margin: "0 auto 20px" }}
      />
      <h1 style={{
        textAlign: "center",
        color: "#801336",
        marginBottom: 20,
        fontSize: 20
      }}>
        Calcolatore THI
      </h1>
      <input
        type="number"
        placeholder="Temperatura (°C)"
        value={temperature}
        onChange={e => setTemperature(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: "2px solid #ccc",
          marginBottom: 16,
          textAlign: "center"
        }}
      />
      <input
        type="number"
        placeholder="Umidità relativa (%)"
        value={humidity}
        onChange={e => setHumidity(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: "2px solid #ccc",
          marginBottom: 16,
          textAlign: "center"
        }}
      />
      <button
        onClick={calculateTHI}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          backgroundColor: "#801336",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 16,
          transition: "transform 0.15s ease-in-out, boxShadow 0.15s ease-in-out"
        }}
        onMouseDown={e => { e.currentTarget.style.transform = "scale(0.95)"; e.currentTarget.style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.2)"; }}
        onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        Calcola
      </button>
      <button
        onClick={resetForm}
        style={{
          width: "100%",
          padding: 10,
          fontSize: 16,
          borderRadius: 8,
          border: "none",
          backgroundColor: "#4d7c5a",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 16,
          transition: "transform 0.15s ease-in-out, boxShadow 0.15s ease-in-out"
        }}
        onMouseDown={e => { e.currentTarget.style.transform = "scale(0.95)"; e.currentTarget.style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.2)"; }}
        onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        Reset
      </button>
      {thi !== null && (
        <div style={{
          textAlign: "center",
          padding: 15,
          borderRadius: 12,
          border: "4px solid #4d7c5a",
          backgroundColor: "#fffbe6",
          marginBottom: 16
        }}>
          <p><strong>THI:</strong> {thi}</p>
          <p style={{ color: color }}><strong>Livello di stress:</strong> {stressLevel}</p>
        </div>
      )}
      <div style={{ fontSize: 12, textAlign: "center", color: "#888" }}>
        Boviteam Consulting © 2025
      </div>
    </div>
  );
}
