import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../api";

const TIMEZONES = ["ALL", "EST", "CST", "MST", "PST"];

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

function TimezoneSplit() {
  const [file, setFile] = useState(null);
  const [timezone, setTimezone] = useState("ALL");
  const [selectedStates, setSelectedStates] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
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
        err.response?.data?.message || "File tracking is not available"
      );
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackedJobs();

    const timer = window.setInterval(loadTrackedJobs, 10000);
    return () => window.clearInterval(timer);
  }, [loadTrackedJobs]);

  const handleUpload = async () => {
    if (!file) return alert("Select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "timezone");
    formData.append("timezone", timezone);
    formData.append("states", JSON.stringify(selectedStates));

    try {
      setLoading(true);
      setResult(null);

      const res = await axios.post(apiUrl("/api/upload"), formData);
      setResult(res.data);
      loadTrackedJobs();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (url) => {
    window.open(apiUrl(url), "_self");
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
    return states.map((state) => [state, counts?.[state] || 0]);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const getStatusStyle = (status) => {
    if (status === "completed") return styles.statusCompleted;
    if (status === "failed") return styles.statusFailed;
    return styles.statusProcessing;
  };

  const renderOutputGroup = (title, files, hasStateFilter) => {
    if (!files?.length) return null;

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
                  {file.zone || "Timezone"}
                </p>
                <p style={styles.outputMeta}>
                  {file.rowCount || file.count || 0} rows
                  {hasStateFilter ? " after state filter" : ""}
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Timezone Split</h1>
          <p style={styles.subTitle}>
            Create timezone output files, optionally narrowed by selected states.
          </p>
        </div>

        <div style={styles.navActions}>
          <button onClick={() => navigate("/")} style={styles.secondaryBtn}>
            CDR Summary
          </button>
          <button
            onClick={() => navigate("/agent-report")}
            style={styles.secondaryBtn}
          >
            Agent Report
          </button>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.mainColumn}>
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Split Settings</h3>
              <span style={styles.selectedBadge}>
                {selectedStates.length
                  ? `${selectedStates.length} states`
                  : "All states"}
              </span>
            </div>

            <label style={styles.label}>Timezone</label>
            <div style={styles.segmentGroup}>
              {TIMEZONES.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setTimezone(zone)}
                  style={{
                    ...styles.segmentBtn,
                    ...(timezone === zone ? styles.segmentBtnActive : {}),
                  }}
                >
                  {zone}
                </button>
              ))}
            </div>

            <div style={styles.statePanel}>
              <div style={styles.statePanelHeader}>
                <label style={styles.label}>State filter</label>

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

            <div style={styles.uploadBox}>
              <label style={styles.label}>Lead File</label>
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
              {loading ? "Processing..." : "Split File"}
            </button>
          </div>

          {loading && (
            <div style={styles.loadingCard}>Processing file...</div>
          )}

          {!loading && result?.summary && (
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Latest Output</h3>
                <span style={styles.selectedBadge}>
                  {result.totalFiles || 0} file
                  {(result.totalFiles || 0) === 1 ? "" : "s"}
                </span>
              </div>

              <div style={styles.zoneGrid}>
                {Object.entries(result.summary).map(([zone, count]) => (
                  <div key={zone} style={styles.zoneCard}>
                    <h4>{zone}</h4>
                    <p>{count}</p>
                  </div>
                ))}

                <div style={styles.zoneCard}>
                  <h4>Duplicates removed</h4>
                  <p>{result.duplicateRowsRemoved || 0}</p>
                </div>
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

              <div style={styles.outputGrid}>
                {renderOutputGroup(
                  result.selectedStates?.length
                    ? "Timezone + selected states"
                    : "Timezone output",
                  result.files,
                  result.selectedStates?.length > 0
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.sideColumn}>
          <div style={styles.workflowCard}>
            <div style={styles.workflowHeader}>
              <div>
                <h3 style={styles.sectionTitle}>File Tracking</h3>
                <p style={styles.workflowSubTitle}>
                  Recent timezone split jobs and outputs.
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

            {jobsError && <div style={styles.errorBox}>{jobsError}</div>}

            {!jobsError && trackedJobs.length === 0 && (
              <div style={styles.emptyBox}>No tracked files yet.</div>
            )}

            {!jobsError &&
              trackedJobs.map((job) => {
                const timezoneFiles = job.timezoneOutputs || [];
                const hasStateFilter = job.selectedStates?.length > 0;

                return (
                  <div key={job._id} style={styles.jobRow}>
                    <div style={styles.jobMain}>
                      <div>
                        <p style={styles.jobName}>{job.originalFileName}</p>
                        <p style={styles.jobMeta}>
                          Started {formatDateTime(job.startedAt || job.createdAt)}
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

                    <div style={styles.jobStats}>
                      <span>Input: {job.totalInputRows || 0}</span>
                      <span>Output: {job.totalOutputRows || 0}</span>
                      <span>
                        Duplicates removed: {job.duplicateRowsRemoved || 0}
                      </span>
                      <span>Timezone: {job.selectedTimezone || "ALL"}</span>
                    </div>

                    <div style={styles.filterSummary}>
                      <div style={styles.filterBlock}>
                        <span style={styles.filterLabel}>State filter</span>
                        <span style={styles.filterValue}>
                          {hasStateFilter
                            ? job.selectedStates.join(", ")
                            : "All states"}
                        </span>
                      </div>

                      <div style={styles.filterBlock}>
                        <span style={styles.filterLabel}>Result</span>
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

                    {job.error && <div style={styles.errorBox}>{job.error}</div>}

                    <div style={styles.outputGrid}>
                      {renderOutputGroup(
                        hasStateFilter
                          ? "Timezone + selected states"
                          : "Timezone output",
                        timezoneFiles,
                        hasStateFilter
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
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
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 460px)",
    gap: "24px",
    alignItems: "start",
  },
  mainColumn: {
    minWidth: 0,
  },
  sideColumn: {
    minWidth: 0,
  },
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },
  sectionTitle: {
    margin: 0,
  },
  selectedBadge: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "7px 10px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
    color: "#374151",
  },
  segmentGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "8px",
  },
  segmentBtn: {
    minHeight: "42px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "800",
    color: "#374151",
  },
  segmentBtnActive: {
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "#fff",
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
    maxHeight: "260px",
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
    fontWeight: "800",
  },
  uploadBox: {
    marginTop: "18px",
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
    fontWeight: "700",
  },
  secondaryBtn: {
    background: "#fff",
    border: "1px solid #d1d5db",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
  },
  loadingCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "24px",
  },
  zoneGrid: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  zoneCard: {
    background: "#eff6ff",
    padding: "18px",
    borderRadius: "8px",
    minWidth: "130px",
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
  workflowCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  workflowHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "16px",
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
    padding: "14px",
    marginTop: "14px",
  },
  jobMain: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  jobName: {
    margin: 0,
    fontWeight: "800",
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
    fontWeight: "800",
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
  jobStats: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
    color: "#374151",
    fontSize: "13px",
  },
  filterSummary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginTop: "12px",
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
    fontWeight: "800",
    textTransform: "uppercase",
  },
  filterValue: {
    color: "#111827",
    fontSize: "13px",
    fontWeight: "800",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
};

export default TimezoneSplit;
