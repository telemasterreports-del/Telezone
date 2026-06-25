import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("cdr");
  const [timezone, setTimezone] = useState("ALL");
  const [selectedStates, setSelectedStates] = useState([]);
  const [trackedJobs, setTrackedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");

  const navigate = useNavigate();

  const loadTrackedJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobsError("");

      const res = await axios.get(apiUrl("/api/jobs"));
      setTrackedJobs(
        (res.data?.jobs || []).filter(
          (job) => job.processType === "timezone_split"
        )
      );
    } catch (err) {
      console.error(err);
      setJobsError(
        err.response?.data?.message ||
          "File tracking is not available"
      );
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackedJobs();

    const timer = window.setInterval(
      loadTrackedJobs,
      10000
    );

    return () => window.clearInterval(timer);
  }, [loadTrackedJobs]);

  const handleUpload = async () => {
    if (!file) return alert("Select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("timezone", timezone);
    formData.append("states", JSON.stringify(selectedStates));

    try {
      setLoading(true);
      setResult(null);

      let res;

      if (mode === "cdr") {
        res = await axios.post(apiUrl("/api/analyze"), formData);
      } else {
        formData.append("mode", mode);
        res = await axios.post(apiUrl("/api/upload"), formData);
      }

      setResult(res.data);
      loadTrackedJobs();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url) => {
    window.open(apiUrl(url), "_self");
  };

  const formatJobType = (type) => {
    if (type === "cdr_summary") return "CDR Summary";
    if (type === "timezone_split") return "Timezone Split";
    return type || "Workflow";
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString();
  };

  const getStatusStyle = (status) => {
    if (status === "completed") {
      return styles.statusCompleted;
    }

    if (status === "failed") {
      return styles.statusFailed;
    }

    return styles.statusProcessing;
  };

  const toggleState = (state) => {
    setSelectedStates((current) =>
      current.includes(state)
        ? current.filter((item) => item !== state)
        : [...current, state]
    );
  };

  const clearSelectedStates = () => {
    setSelectedStates([]);
  };

  const getStateSummaryEntries = (states = [], counts = {}) => {
    return states.map((state) => [
      state,
      counts?.[state] || 0,
    ]);
  };

  const renderOutputGroup = (title, files, getName) => {
    if (!files?.length) {
      return null;
    }

    return (
      <div style={styles.outputGroup}>
        <div style={styles.outputGroupHeader}>
          <span>{title}</span>
          <span style={styles.outputCount}>
            {files.length} file{files.length === 1 ? "" : "s"}
          </span>
        </div>

        <div style={styles.outputList}>
          {files.map((file, index) => (
            <div
              key={`${file.fileName}-${index}`}
              style={styles.outputItem}
            >
              <div>
                <p style={styles.outputName}>
                  {getName(file)}
                </p>
                <p style={styles.outputMeta}>
                  {file.rowCount || 0} rows
                </p>
              </div>

              <button
                onClick={() => downloadFile(file.url)}
                style={styles.outputDownloadBtn}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    );
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

    return `${count} (${avg})`;
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Dialer Analytics Dashboard
          </h1>
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

        {mode === "timezone" && (
          <div style={styles.statePanel}>
            <div style={styles.statePanelHeader}>
              <label style={styles.label}>
                State filter
              </label>

              {selectedStates.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelectedStates}
                  style={styles.textBtn}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={styles.stateGrid}>
              {US_STATES.map((state) => (
                <label
                  key={state}
                  style={{
                    ...styles.stateOption,
                    ...(selectedStates.includes(state)
                      ? styles.stateOptionSelected
                      : {}),
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state)}
                    onChange={() => toggleState(state)}
                  />
                  <span>{state}</span>
                </label>
              ))}
            </div>
          </div>
        )}

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
               {file.name}
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

      <div style={styles.workflowCard}>
        <div style={styles.workflowHeader}>
          <div>
            <h3 style={styles.sectionTitle}>
              Tracked File Workflow
            </h3>
            <p style={styles.workflowSubTitle}>
              Uploads are listed here with their current processing state.
            </p>
          </div>

          <button
            onClick={loadTrackedJobs}
            style={styles.secondaryBtn}
            disabled={jobsLoading}
          >
            {jobsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {jobsError && (
          <div style={styles.errorBox}>
            {jobsError}
          </div>
        )}

        {!jobsError && trackedJobs.length === 0 && (
          <div style={styles.emptyBox}>
            No tracked files yet.
          </div>
        )}

        {!jobsError &&
          trackedJobs.map((job) => {
            const timezoneFiles = job.timezoneOutputs || [];
            const hasStateFilter = job.selectedStates?.length > 0;

            return (
              <div
                key={job._id}
                style={styles.jobRow}
              >
                <div style={styles.jobMain}>
                  <div>
                    <p style={styles.jobName}>
                      {job.originalFileName}
                    </p>
                    <p style={styles.jobMeta}>
                      {formatJobType(job.processType)} - Started{" "}
                      {formatDateTime(job.startedAt || job.createdAt)}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.statusPill,
                      ...getStatusStyle(job.status),
                    }}
                  >
                    {job.status}
                  </span>
                </div>

                <div style={styles.workflowSteps}>
                  <span style={styles.stepDone}>Uploaded</span>
                  <span
                    style={
                      job.status === "failed"
                        ? styles.stepFailed
                        : styles.stepDone
                    }
                  >
                    Processing
                  </span>
                  <span
                    style={
                      job.status === "completed"
                        ? styles.stepDone
                        : job.status === "failed"
                        ? styles.stepFailed
                        : styles.stepPending
                    }
                  >
                    {job.status === "failed" ? "Failed" : "Completed"}
                  </span>
                </div>

                <div style={styles.jobStats}>
                  <span>Input rows: {job.totalInputRows || 0}</span>
                  <span>Output rows: {job.totalOutputRows || 0}</span>
                  {job.selectedTimezone && (
                    <span>Timezone: {job.selectedTimezone}</span>
                  )}
                  {job.selectedStates?.length > 0 && (
                    <span>States: {job.selectedStates.join(", ")}</span>
                  )}
                  <span>Finished: {formatDateTime(job.completedAt)}</span>
                </div>

                {job.processType === "timezone_split" && (
                  <>
                    <div style={styles.filterSummary}>
                      <div style={styles.filterBlock}>
                        <span style={styles.filterLabel}>Timezone</span>
                        <span style={styles.filterValue}>
                          {job.selectedTimezone || "ALL"}
                        </span>
                      </div>

                      <div style={styles.filterBlock}>
                        <span style={styles.filterLabel}>State filter</span>
                        <span style={styles.filterValue}>
                          {hasStateFilter
                            ? job.selectedStates.join(", ")
                            : "All states"}
                        </span>
                      </div>

                      <div style={styles.filterBlock}>
                        <span style={styles.filterLabel}>Result logic</span>
                        <span style={styles.filterValue}>
                          {hasStateFilter
                            ? "Timezone + selected states"
                            : "Timezone only"}
                        </span>
                      </div>
                    </div>

                    {hasStateFilter && (
                      <div style={styles.stateCountGrid}>
                        {getStateSummaryEntries(
                          job.selectedStates,
                          job.selectedStateCounts
                        ).map(([state, count]) => (
                          <span
                            key={state}
                            style={{
                              ...styles.stateCountChip,
                              ...(count > 0
                                ? styles.stateCountMatched
                                : styles.stateCountEmpty),
                            }}
                          >
                            {state}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {job.error && (
                  <div style={styles.errorBox}>
                    {job.error}
                  </div>
                )}

                <div style={styles.outputGrid}>
                  {renderOutputGroup(
                    hasStateFilter
                      ? "Timezone + selected states"
                      : "Timezone output",
                    timezoneFiles,
                    (file) => file.zone || "Timezone"
                  )}
                </div>
              </div>
            );
          })}
      </div>

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

            {result.selectedStates?.length > 0 && (
              <div style={styles.resultStatePanel}>
                <h4 style={styles.resultStateTitle}>
                  Selected state matches
                </h4>

                <div style={styles.stateCountGrid}>
                  {getStateSummaryEntries(
                    result.selectedStates,
                    result.stateSummary
                  ).map(([state, count]) => (
                    <span
                      key={state}
                      style={{
                        ...styles.stateCountChip,
                        ...(count > 0
                          ? styles.stateCountMatched
                          : styles.stateCountEmpty),
                      }}
                    >
                      {state}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

  statePanel: {
    marginTop: "18px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "14px",
    background: "#f9fafb",
  },

  statePanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },

  stateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "8px",
    maxHeight: "220px",
    overflowY: "auto",
  },

  stateOption: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },

  stateOptionSelected: {
    border: "1px solid #2563eb",
    background: "#eff6ff",
    color: "#1d4ed8",
  },

  textBtn: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "700",
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

  workflowCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },

  workflowHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },

  workflowSubTitle: {
    color: "#6b7280",
    margin: "6px 0 0",
    fontSize: "14px",
  },

  errorBox: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "12px",
  },

  emptyBox: {
    background: "#f9fafb",
    color: "#6b7280",
    padding: "16px",
    borderRadius: "8px",
  },

  jobRow: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "14px",
  },

  jobMain: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },

  jobName: {
    margin: 0,
    fontWeight: "700",
    color: "#111827",
    wordBreak: "break-word",
  },

  jobMeta: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  statusPill: {
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  statusCompleted: {
    background: "#dcfce7",
    color: "#166534",
  },

  statusFailed: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  statusProcessing: {
    background: "#fef3c7",
    color: "#92400e",
  },

  workflowSteps: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "14px",
  },

  stepDone: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "700",
  },

  stepPending: {
    background: "#f9fafb",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "700",
  },

  stepFailed: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "700",
  },

  jobStats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "14px",
    color: "#374151",
    fontSize: "13px",
  },

  filterSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginTop: "14px",
    padding: "12px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },

  filterBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  filterLabel: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  filterValue: {
    color: "#111827",
    fontSize: "13px",
    fontWeight: "700",
    lineHeight: 1.35,
  },

  stateCountGrid: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "12px",
  },

  stateCountChip: {
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: "800",
    border: "1px solid transparent",
  },

  stateCountMatched: {
    background: "#ecfdf5",
    color: "#047857",
    borderColor: "#a7f3d0",
  },

  stateCountEmpty: {
    background: "#f9fafb",
    color: "#6b7280",
    borderColor: "#e5e7eb",
  },

  outputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
    marginTop: "14px",
  },

  outputGroup: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    background: "#fff",
  },

  outputGroupHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    padding: "10px 12px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontWeight: "800",
    fontSize: "13px",
  },

  outputCount: {
    color: "#6b7280",
    fontWeight: "700",
  },

  outputList: {
    display: "flex",
    flexDirection: "column",
  },

  outputItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderBottom: "1px solid #f1f5f9",
  },

  outputName: {
    margin: 0,
    color: "#111827",
    fontWeight: "800",
  },

  outputMeta: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: "700",
  },

  outputDownloadBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    flexShrink: 0,
  },

  fileList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "14px",
  },

  fileChip: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "8px 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
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

  resultStatePanel: {
    marginTop: "18px",
    padding: "14px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#f8fafc",
  },

  resultStateTitle: {
    margin: "0 0 10px",
    color: "#111827",
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
