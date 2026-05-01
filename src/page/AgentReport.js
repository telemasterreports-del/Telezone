import React, { useState } from "react";
import axios from "axios";

function AgentReport() {
  const [cdrFile, setCdrFile] = useState(null);
  const [agentFile, setAgentFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!cdrFile || !agentFile) {
      return alert("Upload both CDR and Agent files");
    }

    const formData = new FormData();
    formData.append("cdrFile", cdrFile);
    formData.append("agentFile", agentFile);

    try {
      setLoading(true);

      const res = await axios.post("/api/agent-report", formData);

      const sorted = res.data.sort((a, b) => b.total - a.total);
      setData(sorted);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Dynamic columns
  const getColumns = () => {
    if (data.length === 0) return [];

    return Object.keys(data[0]).filter(
      (key) =>
        key !== "agent" &&
        key !== "total" &&
        key !== "talkTimeTotal" &&
        key !== "callCount"
    );
  };

  const columns = getColumns();

  // ✅ Format values
  const formatValue = (col, value) => {
    if (value === undefined || value === null) return "-";

    if (col === "avgTalkTime") {
      return Number(value).toFixed(2);
    }

    return value;
  };

  // ✅ 🔥 CALCULATE AVERAGES ROW
  const calculateAverages = () => {
    if (data.length === 0) return null;

    const avgRow = {
      agent: "Average",
      total: Math.round(
        data.reduce((sum, d) => sum + d.total, 0) / data.length
      ),
    };

    columns.forEach((col) => {
      const sum = data.reduce((acc, d) => acc + (d[col] || 0), 0);
      avgRow[col] = (sum / data.length).toFixed(2);
    });

    return avgRow;
  };

  const avgRow = calculateAverages();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Agent Performance Report</h2>

        {/* Upload */}
        <div style={styles.uploadGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>CDR File</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCdrFile(e.target.files[0])}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Agent File</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setAgentFile(e.target.files[0])}
              style={styles.input}
            />
          </div>
        </div>

        <button onClick={handleUpload} style={styles.button}>
          {loading ? "Processing..." : "Generate Report"}
        </button>
      </div>

      {/* TABLE */}
      {!loading && data.length > 0 && (
        <div style={styles.tableCard}>
          <h3 style={styles.subtitle}>Agent Summary</h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Agent</th>
                  <th style={styles.th}>Total</th>
                  {columns.map((col) => (
                    <th key={col} style={styles.th}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((agent, index) => (
                  <tr
                    key={index}
                    style={
                      index % 2 === 0 ? styles.rowEven : styles.rowOdd
                    }
                  >
                    <td style={styles.td}>{agent.agent}</td>
                    <td style={styles.td}>{agent.total}</td>

                    {columns.map((col) => (
                      <td key={col} style={styles.td}>
                        {formatValue(col, agent[col])}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* 🔥 AVERAGE ROW */}
                {avgRow && (
                  <tr style={styles.avgRow}>
                    <td style={styles.tdBold}>{avgRow.agent}</td>
                    <td style={styles.tdBold}>{avgRow.total}</td>

                    {columns.map((col) => (
                      <td key={col} style={styles.tdBold}>
                        {avgRow[col]}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <p style={styles.noData}>No data available</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fa",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    marginBottom: "20px",
    fontWeight: "600",
  },
  uploadGrid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  inputGroup: {
    flex: 1,
    minWidth: "250px",
  },
  label: {
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "8px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  tableCard: {
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#f1f5f9",
    padding: "10px",
    textAlign: "left",
  },
  td: {
    padding: "10px",
  },
  tdBold: {
    padding: "10px",
    fontWeight: "700",
  },
  rowEven: {
    background: "#fff",
  },
  rowOdd: {
    background: "#fafafa",
  },
  avgRow: {
    background: "#e0f2fe",
    borderTop: "2px solid #2563eb",
  },
  noData: {
    textAlign: "center",
    marginTop: "30px",
  },
};

export default AgentReport;