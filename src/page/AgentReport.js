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

  // ✅ Columns
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

  // ✅ Calculate averages
  const getAverages = () => {
    if (data.length === 0) return {};

    const totals = {};
    const count = data.length;

    columns.forEach((col) => {
      totals[col] = 0;
    });

    data.forEach((agent) => {
      columns.forEach((col) => {
        totals[col] += Number(agent[col]) || 0;
      });
    });

    const averages = {};
    columns.forEach((col) => {
      averages[col] = (totals[col] / count).toFixed(2);
    });

    return averages;
  };

  const averages = getAverages();

  // ✅ Summary stats
  const totalAgents = data.length;
  const totalCalls = data.reduce((sum, a) => sum + (a.total || 0), 0);
  const avgTalkTime =
    data.reduce((sum, a) => sum + (a.avgTalkTime || 0), 0) /
      (data.length || 1);

  return (
    <div style={styles.container}>
      {/* Upload Card */}
      <div style={styles.card}>
        <h2 style={styles.title}>Agent Performance Report</h2>

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

      {/* Summary */}
      {!loading && data.length > 0 && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p>Total Agents</p>
            <h2>{totalAgents}</h2>
          </div>

          <div style={styles.statCard}>
            <p>Total Calls</p>
            <h2>{totalCalls}</h2>
          </div>

          <div style={styles.statCard}>
            <p>Avg Talk Time</p>
            <h2>{avgTalkTime.toFixed(2)}</h2>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div style={styles.tableCard}>
          <h3 style={styles.subtitle}>Agent Summary</h3>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Agent</th>
                  <th style={styles.thCenter}>Total</th>
                  {columns.map((col) => (
                    <th key={col} style={styles.thCenter}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((agent, index) => (
                  <tr
                    key={index}
                    style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}
                  >
                    <td style={styles.td}>{agent.agent}</td>
                    <td style={styles.tdCenter}>{agent.total}</td>

                    {columns.map((col) => (
                      <td key={col} style={styles.tdCenter}>
                        {formatValue(col, agent[col])}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* 🔥 Average Row */}
                <tr style={styles.avgRow}>
                  <td style={styles.td}><b>Average</b></td>
                  <td style={styles.tdCenter}>-</td>

                  {columns.map((col) => (
                    <td key={col} style={styles.tdCenter}>
                      <b>{averages[col]}</b>
                    </td>
                  ))}
                </tr>
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
    fontFamily: "Segoe UI, sans-serif",
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

  statsRow: {
    display: "flex",
    gap: "15px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    minWidth: "150px",
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  tableCard: {
    marginTop: "30px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  subtitle: {
    marginBottom: "15px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    background: "#1e293b",
    color: "#fff",
  },
  thCenter: {
    padding: "12px",
    textAlign: "center",
    background: "#1e293b",
    color: "#fff",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  tdCenter: {
    padding: "10px",
    textAlign: "center",
    borderBottom: "1px solid #eee",
  },
  rowEven: {
    background: "#fff",
  },
  rowOdd: {
    background: "#f9fafb",
  },
  avgRow: {
    background: "#e2e8f0",
  },
  noData: {
    textAlign: "center",
    marginTop: "30px",
  },
};

export default AgentReport;