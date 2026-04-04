import React, { useState } from "react";

export default function FeederNotchCalculator() {
  const [pesoTacca, setPesoTacca] = useState("");
  const [numCalate, setNumCalate] = useState("");
  const [kgMangime, setKgMangime] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const peso = parseFloat(pesoTacca);
    const calate = parseFloat(numCalate);
    const kg = parseFloat(kgMangime);
    if (isNaN(peso) || isNaN(calate) || isNaN(kg) || peso <= 0 || calate <= 0 || kg <= 0) return;

    const grammiTotali = kg * 1000;
    const grammiPerCalata = grammiTotali / calate;
    const taccheEsatte = grammiPerCalata / peso;
    const taccheArrotondate = Math.round(taccheEsatte * 2) / 2;
    const totaleEffettivo = taccheArrotondate * peso * calate;
    const scostamentoG = totaleEffettivo - grammiTotali;
    const scostamentoKg = scostamentoG / 1000;

    setResult({
      grammiTotali,
      grammiPerCalata,
      taccheEsatte,
      taccheArrotondate,
      totaleEffettivo,
      scostamentoG,
      scostamentoKg,
    });
  };

  const resetForm = () => {
    setPesoTacca("");
    setNumCalate("");
    setKgMangime("");
    setResult(null);
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    fontSize: 16,
    borderRadius: 8,
    border: "2px solid #ccc",
    marginBottom: 16,
    textAlign: "center",
    boxSizing: "border-box",
  };

  const buttonPress = {
    onMouseDown: (e) => { e.currentTarget.style.transform = "scale(0.95)"; e.currentTarget.style.boxShadow = "inset 0 0 5px rgba(0,0,0,0.2)"; },
    onMouseUp: (e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; },
  };

  return (
    <>
      <h1 style={{
        textAlign: "center",
        color: "#801336",
        marginBottom: 20,
        fontSize: 20
      }}>
        Calcolatore Tacche Autoalimentatore
      </h1>

      <input
        type="number"
        placeholder="Peso di 1 tacca (g)"
        value={pesoTacca}
        onChange={e => setPesoTacca(e.target.value)}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Numero calate al giorno"
        value={numCalate}
        onChange={e => setNumCalate(e.target.value)}
        style={inputStyle}
      />
      <input
        type="number"
        placeholder="Kg di mangime al giorno"
        value={kgMangime}
        onChange={e => setKgMangime(e.target.value)}
        style={inputStyle}
      />

      <button
        onClick={calculate}
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
        {...buttonPress}
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
        {...buttonPress}
      >
        Reset
      </button>

      {result && (
        <div style={{
          textAlign: "left",
          padding: 15,
          borderRadius: 12,
          border: "4px solid #4d7c5a",
          backgroundColor: "#fffbe6",
          marginBottom: 16,
          fontSize: 14,
          lineHeight: 1.8,
        }}>
          <p><strong>Kg → grammi:</strong> {result.grammiTotali.toFixed(0)} g</p>
          <p><strong>Grammi target per calata:</strong> {result.grammiPerCalata.toFixed(1)} g</p>
          <p><strong>Tacche esatte per calata:</strong> {result.taccheEsatte.toFixed(2)}</p>
          <p><strong>Tacche arrotondate (alla mezza tacca):</strong> {result.taccheArrotondate.toFixed(1)}</p>
          <p><strong>Totale giornaliero effettivo:</strong> {result.totaleEffettivo.toFixed(0)} g ({(result.totaleEffettivo / 1000).toFixed(2)} kg)</p>
          <p style={{ color: result.scostamentoG === 0 ? "green" : Math.abs(result.scostamentoG) <= 50 ? "orange" : "red" }}>
            <strong>Scostamento:</strong> {result.scostamentoG >= 0 ? "+" : ""}{result.scostamentoG.toFixed(0)} g ({result.scostamentoKg >= 0 ? "+" : ""}{result.scostamentoKg.toFixed(3)} kg)
          </p>
        </div>
      )}

      <div style={{
        fontSize: 11,
        textAlign: "center",
        color: "#666",
        backgroundColor: "#fff3cd",
        border: "1px solid #ddc87a",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        lineHeight: 1.5,
      }}>
        <strong>Nota:</strong> Il peso di una tacca varia da autoalimentatore ad autoalimentatore. Va quindi inserito ogni volta il peso reale misurato della singola tacca.
      </div>
    </>
  );
}
