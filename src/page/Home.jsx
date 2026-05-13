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
        res = await axios.post("/api/analyze", formData);
      } else {
        formData.append("mode", mode);
        res = await axios.post("/api/upload", formData);
      }

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url) => {
    window.open(url, "_self");
  };

  // Dynamic disposition columns
  const getDispositionColumns = () => {
    if (!result?.report?.length) return [];

    return Object.keys(result.report[0]).filter(
      (key) =>
        ![
          "leadId",
          "totalCalls",
          "connectedCalls",
          "connectivity",
        ].includes(key) &&
        !key.endsWith("Avg")
    );
  };

  const dispositionColumns = getDispositionColumns();

  const formatDispositionValue = (item, col) => {
    const count = item[col] ?? 0;
    const avg = item[`${col}Avg`] ?? "0.00%";

    return `${count} | ${avg}`;
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Dialer Analytics Dashboard
          </h1>
          <p style={styles.subTitle}>
            Upload and analyze dialer CSV reports
          </p>
        </div>

        <button
          onClick={() => navigate("/agent-report")}
          style={styles.secondaryBtn}
        >
          Agent Report
        </button>
      </div>

      {/* UPLOAD CARD */}
      <div style={styles.card}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Mode</label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={styles.input}
            >
              <option value="cdr">
                CDR Summary
              </option>

              <option value="timezone">
                Timezone Split
              </option>
            </select>
          </div>

          {mode === "timezone" && (
            <div style={styles.field}>
              <label style={styles.label}>
                Timezone
              </label>

              <select
                value={timezone}
                onChange={(e) =>
                  setTimezone(e.target.value)
                }
                style={styles.input}
              >
                <option value="ALL">ALL</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="MST">MST</option>
                <option value="PST">PST</option>
              </select>
            </div>
          )}
        </div>

        <div style={styles.uploadBox}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
          />

          {file && (
            <p style={styles.fileName}>
              📄 {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          style={styles.primaryBtn}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "Upload & Analyze"}
        </button>
      </div>

      {loading && (
        <div style={styles.loadingCard}>
          Processing file...
        </div>
      )}

      {/* ===================== CDR REPORT ===================== */}
      {!loading &&
        mode === "cdr" &&
        result?.report && (
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.sectionTitle}>
                📊 CDR Connectivity Report
              </h3>

              <span style={styles.badge}>
                {result.report.length} Leads
              </span>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Lead ID
                    </th>

                    <th style={styles.th}>
                      Total Calls
                    </th>

                    <th style={styles.th}>
                      Connected
                    </th>

                    <th style={styles.th}>
                      Connectivity
                    </th>

                    {dispositionColumns.map(
                      (col) => (
                        <th
                          key={col}
                          style={styles.th}
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {result.report.map(
                    (item, i) => (
                      <tr
                        key={i}
                        style={
                          i % 2 === 0
                            ? styles.rowEven
                            : styles.rowOdd
                        }
                      >
                        <td
                          style={{
                            ...styles.td,
                            fontWeight: "600",
                          }}
                        >
                          {item.leadId}
                        </td>

                        <td style={styles.td}>
                          {item.totalCalls}
                        </td>

                        <td style={styles.td}>
                          {item.connectedCalls}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            fontWeight: "700",
                            color:
                              parseFloat(
                                item.connectivity
                              ) >= 8
                                ? "#16a34a"
                                : parseFloat(
                                    item.connectivity
                                  ) >= 5
                                ? "#d97706"
                                : "#dc2626",
                          }}
                        >
                          {item.connectivity}
                        </td>

                        {dispositionColumns.map(
                          (col) => (
                            <td
                              key={col}
                              style={
                                styles.td
                              }
                            >
                              {formatDispositionValue(
                                item,
                                col
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* ================= TIMEZONE ================= */}
      {!loading &&
        mode === "timezone" &&
        result?.summary && (
          <div style={styles.tableCard}>
            <h3 style={styles.sectionTitle}>
              Timezone Summary
            </h3>

            <div style={styles.zoneGrid}>
              {Object.entries(
                result.summary
              ).map(([zone, count]) => (
                <div
                  key={zone}
                  style={styles.zoneCard}
                >
                  <h4>{zone}</h4>
                  <p>{count}</p>
                </div>
              ))}
            </div>

            <h3
              style={{
                marginTop: "30px",
              }}
            >
              Downloads
            </h3>

            {result.files?.map(
              (f, i) => (
                <button
                  key={i}
                  onClick={() =>
                    downloadFile(
                      f.url
                    )
                  }
                  style={
                    styles.downloadBtn
                  }
                >
                  Download {f.zone}
                </button>
              )
            )}
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
    alignItems: "center",
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
    marginTop: "6px",
  },

  card: {
    background: "#fff",
    padding: "28px",
    borderRadius: "20px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },

  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  field: {
    flex: 1,
    minWidth: "240px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },

  uploadBox: {
    marginTop: "20px",
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
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryBtn: {
    background: "#fff",
    border: "1px solid #d1d5db",
    padding: "10px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loadingCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    textAlign: "center",
  },

  tableCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
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

  zoneGrid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },

  zoneCard: {
    background: "#eff6ff",
    padding: "24px",
    borderRadius: "16px",
    minWidth: "150px",
    textAlign: "center",
  },

  downloadBtn: {
    display: "block",
    marginTop: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
  },
};

export default Home;