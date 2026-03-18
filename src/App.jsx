import React, { useState, useEffect } from "react";

const TIPI = ["Genetica", "Consulenza Alimentazione", "Grossista"];

const COLORS = {
  primary: "#801336",
  green: "#4d7c5a",
  bg: "#f7f1e6",
  white: "#fff",
  border: "#d4c5a9",
  card: "#fffbe6",
  text: "#333",
  muted: "#888",
  danger: "#c0392b",
  blue: "#2980b9",
  orange: "#e67e22",
};

const TIPO_COLOR = {
  Genetica: "#6a0dad",
  "Consulenza Alimentazione": "#4d7c5a",
  Grossista: "#801336",
};

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const EMPTY_FORM = {
  azienda: "",
  referente: "",
  telefono: "",
  indirizzo: "",
  data: new Date().toISOString().slice(0, 10),
  tipo: "Genetica",
  note: "",
};

function loadVisite() {
  try {
    return JSON.parse(localStorage.getItem("agrivisit_visite") || "[]");
  } catch {
    return [];
  }
}

function saveVisite(list) {
  localStorage.setItem("agrivisit_visite", JSON.stringify(list));
}

function exportCSV(visite) {
  const header = ["ID", "Data", "Azienda", "Referente", "Telefono", "Indirizzo", "Tipo", "Note"];
  const rows = visite.map((v) => [
    v.id, v.data, v.azienda, v.referente, v.telefono, v.indirizzo, v.tipo,
    `"${(v.note || "").replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agrivisit_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function printVisita(v) {
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>Visita - ${v.azienda}</title>
    <style>
      body { font-family: sans-serif; padding: 32px; color: #333; }
      h1 { color: #801336; margin-bottom: 4px; }
      .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; color: #fff; font-size: 14px; margin-bottom: 16px; background: ${TIPO_COLOR[v.tipo] || "#888"}; }
      table { border-collapse: collapse; width: 100%; margin-top: 16px; }
      td { padding: 8px 12px; border: 1px solid #ccc; vertical-align: top; }
      td:first-child { font-weight: bold; width: 140px; background: #f7f1e6; }
      .note { white-space: pre-wrap; }
      .footer { margin-top: 32px; font-size: 12px; color: #888; text-align: center; }
    </style></head><body>
    <h1>Boviteam Consulting</h1>
    <div class="badge">${v.tipo}</div>
    <table>
      <tr><td>Data</td><td>${v.data}</td></tr>
      <tr><td>Azienda</td><td>${v.azienda || "—"}</td></tr>
      <tr><td>Referente</td><td>${v.referente || "—"}</td></tr>
      <tr><td>Telefono</td><td>${v.telefono || "—"}</td></tr>
      <tr><td>Indirizzo</td><td>${v.indirizzo || "—"}</td></tr>
      <tr><td>Note</td><td class="note">${v.note || "—"}</td></tr>
    </table>
    <div class="footer">AgriVisit Pro — Boviteam Consulting © ${new Date().getFullYear()}</div>
    </body></html>
  `);
  win.document.close();
  win.print();
}

// ---- Button component ----
function Btn({ onClick, color, children, small, title }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: small ? "5px 10px" : "10px 18px",
        fontSize: small ? 13 : 15,
        borderRadius: 8,
        border: "none",
        backgroundColor: hover ? darken(color) : color,
        color: "#fff",
        cursor: "pointer",
        transition: "background 0.15s",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function darken(hex) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - 30);
  const g = Math.max(0, ((num >> 8) & 0xff) - 30);
  const b = Math.max(0, (num & 0xff) - 30);
  return `rgb(${r},${g},${b})`;
}

// ---- Modal form ----
function Modal({ visita, onSave, onClose }) {
  const [form, setForm] = useState(visita ? { ...visita } : { ...EMPTY_FORM });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    fontSize: 15,
    borderRadius: 8,
    border: `2px solid ${COLORS.border}`,
    backgroundColor: "#fff",
    boxSizing: "border-box",
    marginTop: 4,
    fontFamily: "inherit",
  };
  const labelStyle = { fontWeight: 600, color: COLORS.text, fontSize: 14, display: "block", marginTop: 14 };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: COLORS.bg,
          borderRadius: 18,
          padding: 28,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ color: COLORS.primary, marginTop: 0, marginBottom: 18 }}>
          {visita?.id ? "Modifica Visita" : "Nuova Visita"}
        </h2>

        <label style={labelStyle}>Data</label>
        <input type="date" value={form.data} onChange={set("data")} style={inputStyle} />

        <label style={labelStyle}>Tipo visita</label>
        <select value={form.tipo} onChange={set("tipo")} style={inputStyle}>
          {TIPI.map((t) => <option key={t}>{t}</option>)}
        </select>

        <label style={labelStyle}>Azienda</label>
        <input placeholder="Nome azienda" value={form.azienda} onChange={set("azienda")} style={inputStyle} />

        <label style={labelStyle}>Referente</label>
        <input placeholder="Nome e cognome" value={form.referente} onChange={set("referente")} style={inputStyle} />

        <label style={labelStyle}>Telefono</label>
        <input placeholder="+39 000 000 0000" value={form.telefono} onChange={set("telefono")} style={inputStyle} />

        <label style={labelStyle}>Indirizzo</label>
        <input placeholder="Via, Città" value={form.indirizzo} onChange={set("indirizzo")} style={inputStyle} />

        <label style={labelStyle}>Note</label>
        <textarea
          placeholder="Note sulla visita..."
          value={form.note}
          onChange={set("note")}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <Btn color={COLORS.muted} onClick={onClose}>Annulla</Btn>
          <Btn color={COLORS.primary} onClick={() => onSave(form)}>Salva</Btn>
        </div>
      </div>
    </div>
  );
}

// ---- Confirm dialog ----
function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff", borderRadius: 14, padding: 28,
          maxWidth: 360, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 16, marginBottom: 24, color: COLORS.text }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn color={COLORS.muted} onClick={onCancel}>No</Btn>
          <Btn color={COLORS.danger} onClick={onConfirm}>Elimina</Btn>
        </div>
      </div>
    </div>
  );
}

// ---- Visita Card ----
function VisitaCard({ v, onEdit, onCopy, onDelete, onPrint }) {
  const tipoColor = TIPO_COLOR[v.tipo] || COLORS.muted;
  return (
    <div
      style={{
        backgroundColor: COLORS.card,
        border: `2px solid ${COLORS.border}`,
        borderLeft: `6px solid ${tipoColor}`,
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              backgroundColor: tipoColor, color: "#fff",
              borderRadius: 10, padding: "2px 10px", fontSize: 12, fontWeight: 700,
            }}>
              {v.tipo}
            </span>
            <span style={{ fontSize: 13, color: COLORS.muted }}>{v.data}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, color: COLORS.text }}>{v.azienda || "—"}</div>
          {v.referente && <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 2 }}>👤 {v.referente}</div>}
          {v.telefono && <div style={{ fontSize: 13, color: COLORS.muted }}>📞 {v.telefono}</div>}
          {v.indirizzo && <div style={{ fontSize: 13, color: COLORS.muted }}>📍 {v.indirizzo}</div>}
          {v.note && (
            <div style={{
              marginTop: 8, fontSize: 13, color: "#555",
              backgroundColor: "#f0ead8", borderRadius: 8, padding: "6px 10px",
              whiteSpace: "pre-wrap",
            }}>
              {v.note}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Btn small color={COLORS.blue} onClick={() => onEdit(v)} title="Modifica">✏️</Btn>
          <Btn small color={COLORS.orange} onClick={() => onCopy(v)} title="Copia / Duplica">📋</Btn>
          <Btn small color={COLORS.green} onClick={() => onPrint(v)} title="Stampa">🖨️</Btn>
          <Btn small color={COLORS.danger} onClick={() => onDelete(v)} title="Elimina">🗑️</Btn>
        </div>
      </div>
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [visite, setVisite] = useState(loadVisite);
  const [modal, setModal] = useState(null); // null | { visita? }
  const [confirm, setConfirm] = useState(null); // null | { id }
  const [filtroTipo, setFiltroTipo] = useState("Tutti");
  const [search, setSearch] = useState("");

  useEffect(() => { saveVisite(visite); }, [visite]);

  const openNew = () => setModal({ visita: null });
  const openEdit = (v) => setModal({ visita: v });
  const closeModal = () => setModal(null);

  const handleSave = (form) => {
    if (modal.visita?.id) {
      setVisite((prev) => prev.map((v) => v.id === modal.visita.id ? { ...form, id: v.id } : v));
    } else {
      setVisite((prev) => [{ ...form, id: newId() }, ...prev]);
    }
    setModal(null);
  };

  const handleCopy = (v) => {
    const copy = { ...v, id: newId(), azienda: v.azienda + " (copia)", data: new Date().toISOString().slice(0, 10) };
    setVisite((prev) => [copy, ...prev]);
  };

  const handleDelete = (v) => setConfirm({ id: v.id });

  const confirmDelete = () => {
    setVisite((prev) => prev.filter((v) => v.id !== confirm.id));
    setConfirm(null);
  };

  const filtered = visite.filter((v) => {
    const matchTipo = filtroTipo === "Tutti" || v.tipo === filtroTipo;
    const q = search.toLowerCase();
    const matchSearch = !q || [v.azienda, v.referente, v.telefono, v.indirizzo, v.note].some((f) => (f || "").toLowerCase().includes(q));
    return matchTipo && matchSearch;
  });

  const counts = TIPI.reduce((acc, t) => ({ ...acc, [t]: visite.filter((v) => v.tipo === t).length }), {});

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ede8df", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{
        backgroundColor: COLORS.primary,
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
      }}>
        <img src="/boviteam-logo.jpg" alt="Boviteam" style={{ height: 50, borderRadius: 8, objectFit: "contain", backgroundColor: "#fff", padding: 3 }} />
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: 0.5 }}>AgriVisit Pro</div>
          <div style={{ color: "#f0c0c0", fontSize: 13 }}>Boviteam Consulting — Gestione Visite</div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
        {/* Stats strip */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {TIPI.map((t) => (
            <div key={t} style={{
              flex: 1, minWidth: 120,
              backgroundColor: "#fff",
              border: `3px solid ${TIPO_COLOR[t]}`,
              borderRadius: 12, padding: "10px 14px",
              textAlign: "center",
            }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: TIPO_COLOR[t] }}>{counts[t]}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>{t}</div>
            </div>
          ))}
          <div style={{
            flex: 1, minWidth: 120,
            backgroundColor: "#fff",
            border: `3px solid ${COLORS.border}`,
            borderRadius: 12, padding: "10px 14px",
            textAlign: "center",
          }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: COLORS.text }}>{visite.length}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600 }}>Totale</div>
          </div>
        </div>

        {/* Actions bar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <Btn color={COLORS.primary} onClick={openNew}>+ Nuova Visita</Btn>
          <Btn color={COLORS.green} onClick={() => exportCSV(visite)}>⬇ Esporta CSV</Btn>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input
            placeholder="🔍 Cerca azienda, referente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 180, padding: "8px 14px", fontSize: 14,
              borderRadius: 8, border: `2px solid ${COLORS.border}`,
              backgroundColor: "#fff", fontFamily: "inherit",
            }}
          />
          {["Tutti", ...TIPI].map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              style={{
                padding: "7px 13px", fontSize: 13, borderRadius: 8, cursor: "pointer", fontWeight: 600,
                border: `2px solid ${t === "Tutti" ? COLORS.border : TIPO_COLOR[t]}`,
                backgroundColor: filtroTipo === t ? (t === "Tutti" ? COLORS.text : TIPO_COLOR[t]) : "#fff",
                color: filtroTipo === t ? "#fff" : (t === "Tutti" ? COLORS.text : TIPO_COLOR[t]),
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", color: COLORS.muted, padding: 48,
            backgroundColor: "#fff", borderRadius: 14,
            border: `2px dashed ${COLORS.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 16 }}>{visite.length === 0 ? "Nessuna visita ancora. Aggiungi la prima!" : "Nessun risultato."}</div>
          </div>
        ) : (
          filtered.map((v) => (
            <VisitaCard
              key={v.id}
              v={v}
              onEdit={openEdit}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onPrint={printVisita}
            />
          ))
        )}

        <div style={{ textAlign: "center", fontSize: 12, color: COLORS.muted, marginTop: 32 }}>
          AgriVisit Pro — Boviteam Consulting © {new Date().getFullYear()}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          visita={modal.visita}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* Confirm delete */}
      {confirm && (
        <Confirm
          message="Sei sicuro di voler eliminare questa visita?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
