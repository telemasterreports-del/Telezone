import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("cdr");
  const [timezone, setTimezone] = useState("ALL");

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timezone", timezone);

    try {
      setLoading(true);
      setResult(null);

      let res;

      if (mode === "cdr") {
        res = await axios.post("http://98.88.247.111/analyze", formData);
      } else {
        formData.append("mode", mode);
        res = await axios.post("http://98.88.247.111/upload", formData);
      }

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dialer Analytics Dashboard</h1>
        <button onClick={() => navigate("/agent-report")} style={styles.secondaryBtn}>
          Agent Report
        </button>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        {/* MODE */}
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={styles.input}>
              <option value="cdr">CDR Summary</option>
              <option value="timezone">Timezone Split</option>
            </select>
          </div>

          {mode === "timezone" && (
            <div style={styles.field}>
              <label style={styles.label}>Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={styles.input}
              >
                <option value="ALL">All</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="MST">MST</option>
                <option value="PST">PST</option>
              </select>
            </div>
          )}
        </div>

        {/* FILE */}
        <div style={styles.uploadBox}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && <p style={styles.fileName}>{file.name}</p>}
        </div>

        <button onClick={handleUpload} style={styles.primaryBtn} disabled={loading}>
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>
      </div>

      {/* LOADING */}
      {loading && <p style={styles.loading}>Processing file...</p>}

      {/* ================= CDR ================= */}
      {!loading && mode === "cdr" && result?.report && (
        <div style={styles.tableCard}>
          <h3>CDR Connectivity</h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Connectivity</th>
                </tr>
              </thead>
              <tbody>
                {result.report.map((item, i) => (
                  <tr key={i}>
                    <td>{item.leadId}</td>
                    <td>{item.connectivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TIMEZONE ================= */}
      {!loading && mode === "timezone" && result?.summary && (
        <div style={styles.tableCard}>
          <h3>Timezone Summary</h3>

          <div style={styles.zoneGrid}>
            {Object.entries(result.summary).map(([zone, count]) => (
              <div key={zone} style={styles.zoneCard}>
                <h4>{zone}</h4>
                <p>{count}</p>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px" }}>Downloads</h3>

          {result.files?.map((f, i) => (
            <a
              key={i}
              href={`http://98.88.247.111${f.url}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.downloadLink}
            >
              Download {f.zone}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6f9",
    padding: "30px",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  title: {
    fontWeight: "600",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  field: {
    flex: 1,
    minWidth: "200px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  uploadBox: {
    marginTop: "15px",
  },
  fileName: {
    fontSize: "12px",
    color: "#555",
  },
  primaryBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 16px",
    background: "#e2e8f0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  loading: {
    marginTop: "20px",
  },
  tableCard: {
    marginTop: "25px",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  zoneGrid: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  zoneCard: {
    background: "#f1f5f9",
    padding: "15px",
    borderRadius: "8px",
    minWidth: "100px",
    textAlign: "center",
  },
  downloadLink: {
    display: "block",
    marginTop: "10px",
    color: "#2563eb",
    textDecoration: "none",
  },
};

export default Home;