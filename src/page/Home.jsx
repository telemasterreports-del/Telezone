import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api";

function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Select a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await axios.post(apiUrl("/api/analyze"), formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getDispositionColumns = () => {
    if (!result?.report?.length) return [];

    return Object.keys(result.report[0]).filter(
      (key) =>
        ![
          "leadId",
          "totalCalls",
          "connectedCalls",
          "connectivity",
        ].includes(key) && !key.endsWith("Avg")
    );
  };

  const dispositionColumns = getDispositionColumns();

  const formatDispositionValue = (item, col) => {
    const count = item[col] ?? 0;
    const avg = item[`${col}Avg`] ?? "0.00%";

    return `${count} (${avg})`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>CDR Summary</h1>
          <p style={styles.subTitle}>
            Upload a CDR CSV to generate lead connectivity analytics.
          </p>
        </div>

        <div style={styles.navActions}>
          <button
            onClick={() => navigate("/timezone-split")}
            style={styles.secondaryBtn}
          >
            Timezone Split
          </button>

          <button
            onClick={() => navigate("/agent-report")}
            style={styles.secondaryBtn}
          >
            Agent Report
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>CDR File</label>

        <div style={styles.uploadBox}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />

          {file && <p style={styles.fileName}>{file.name}</p>}
        </div>

        <button
          onClick={handleUpload}
          style={styles.primaryBtn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate CDR Summary"}
        </button>
      </div>

      {loading && (
        <div style={styles.loadingCard}>Processing file...</div>
      )}

      {!loading && result?.report && (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h3 style={styles.sectionTitle}>CDR Connectivity Report</h3>
            <span style={styles.badge}>{result.report.length} Leads</span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Lead ID</th>
                  <th style={styles.th}>Total Calls</th>
                  <th style={styles.th}>Connected</th>
                  <th style={styles.th}>Connectivity</th>

                  {dispositionColumns.map((col) => (
                    <th key={col} style={styles.th}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {result.report.map((item, i) => (
                  <tr
                    key={i}
                    style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}
                  >
                    <td style={{ ...styles.td, fontWeight: "600" }}>
                      {item.leadId}
                    </td>
                    <td style={styles.td}>{item.totalCalls}</td>
                    <td style={styles.td}>{item.connectedCalls}</td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: "700",
                        color:
                          parseFloat(item.connectivity) >= 8
                            ? "#16a34a"
                            : parseFloat(item.connectivity) >= 5
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {item.connectivity}
                    </td>

                    {dispositionColumns.map((col) => (
                      <td key={col} style={styles.td}>
                        {formatDispositionValue(item, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f3f6fb",
    padding: "32px",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: "700",
    color: "#111827",
  },
  subTitle: {
    color: "#6b7280",
    margin: "6px 0 0",
  },
  navActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  card: {
    background: "#fff",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
  },
  uploadBox: {
    marginTop: "12px",
  },
  fileName: {
    color: "#2563eb",
    marginTop: "10px",
    fontSize: "14px",
  },
  primaryBtn: {
    marginTop: "20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryBtn: {
    background: "#fff",
    border: "1px solid #d1d5db",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  loadingCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: 0,
  },
  badge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "600",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    position: "sticky",
    top: 0,
    background: "#eff6ff",
    padding: "16px",
    textAlign: "left",
    fontWeight: "700",
    borderBottom: "1px solid #dbeafe",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
  },
  rowEven: {
    background: "#fff",
  },
  rowOdd: {
    background: "#f9fafb",
  },
};

export default Home;
