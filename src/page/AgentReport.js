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

      const res = await axios.post(
        "http://localhost:3000/agent-report",
        formData
      );

      // 🔥 sort by total (top agent first)
      const sorted = res.data.sort((a, b) => b.total - a.total);

      setData(sorted);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Get dynamic columns (all dispositions)
  const getColumns = () => {
    if (data.length === 0) return [];

    return Object.keys(data[0]).filter(
      (key) => key !== "agent" && key !== "total"
    );
  };

  const columns = getColumns();

  return (
    <div style={{ padding: "40px" }}>
      <h2>👨‍💼 Agent Report</h2>

      {/* Upload */}
      <div>
        <p>Upload CDR File</p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCdrFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <p>Upload Agent File</p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setAgentFile(e.target.files[0])}
        />
      </div>

      <button onClick={handleUpload} style={{ marginTop: "20px" }}>
        {loading ? "Processing..." : "Generate Report"}
      </button>

      {/* TABLE */}
      {!loading && data.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>📊 Agent Summary</h3>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Total</th>

                {/* 🔥 Dynamic columns */}
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((agent, index) => (
                <tr key={index}>
                  <td>{agent.agent}</td>
                  <td>{agent.total}</td>

                  {columns.map((col) => (
                    <td key={col}>{agent[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length === 0 && <p>No data yet</p>}
    </div>
  );
}

export default AgentReport;