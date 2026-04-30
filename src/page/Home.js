import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [mode, setMode] = useState("cdr");
  const [timezone, setTimezone] = useState("ALL");

  const handleAgentReport = async () => {
    navigate("/agent-report");
  }

  const handleUpload = async () => {
    if (!file) return alert("Select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timezone", timezone);

    try {
      setLoading(true);
      setResult(null);

      let res;

      // ✅ FIX: correct API routing
      if (mode === "cdr") {
        // 👉 CDR DATA API
        res = await axios.post("http://localhost:3000/analyze", formData);
      } else {
        // 👉 TIMEZONE API (your existing logic)
        formData.append("mode", mode);

        res = await axios.post("http://localhost:3000/upload", formData);
      }

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    setResult(null);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2> Dialer Analytics Dashboard</h2>

      {/* MODE */}
      <div style={{ marginBottom: "15px" }}>
        <label>Mode: </label>
        <select value={mode} onChange={handleModeChange}>
          <option value="cdr">CDR Summary</option>
          <option value="timezone">Timezone Split</option>
        </select>
      </div>

      {/* TIMEZONE */}
      {mode === "timezone" && (
        <div style={{ marginBottom: "15px" }}>
          <label>Timezone: </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="EST">EST</option>
            <option value="CST">CST</option>
            <option value="MST">MST</option>
            <option value="PST">PST</option>
          </select>
        </div>
      )}

      {/* FILE */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {file && <p>Selected: <strong>{file.name}</strong></p>}

      <br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload"}
      </button>

      {/* LOADING */}
      {loading && <p>Processing file...</p>}

      {/* ================= CDR UI ================= */}
      {!loading && mode === "cdr" && result?.report && (
        <div style={{ marginTop: "30px" }}>
          <h3>📈 CDR Connectivity</h3>

          {result.report.length === 0 ? (
            <p>No CDR data found</p>
          ) : (
            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Connectivity </th>
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
          )}
        </div>
      )}

      {/* ================= TIMEZONE UI ================= */}
      {!loading && mode === "timezone" && result?.summary && (
        <div style={{ marginTop: "30px" }}>
          <h3>🌍 Timezone Summary</h3>

          <div style={{ display: "flex", gap: "10px" }}>
            {Object.entries(result.summary).map(([zone, count]) => (
              <div
                key={zone}
                style={{ border: "1px solid #ccc", padding: "10px" }}
              >
                <h4>{zone}</h4>
                <p>{count}</p>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px" }}>⬇ Downloads</h3>

          {result.files?.length > 0 ? (
            result.files.map((f, i) => (
              <div key={i}>
                <a
                  href={`http://localhost:3000${f.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download {f.zone}
                </a>
              </div>
            ))
          ) : (
            <p>No files available</p>
          )}
        </div>
      )}


      <button onClick={handleAgentReport} style={{ marginTop: "20px" }}>
        Agent Report
      </button>
    </div>
  );
}

export default Home;