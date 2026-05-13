import React, { useState } from "react";
import axios from "axios";

function AgentReport() {
  const [cdrFile, setCdrFile] = useState(null);
  const [agentFile, setAgentFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!cdrFile || !agentFile) {
      return alert(
        "Upload both CDR and Agent files"
      );
    }

    const formData = new FormData();

    formData.append(
      "cdrFile",
      cdrFile
    );

    formData.append(
      "agentFile",
      agentFile
    );

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/agent-report",
        formData
      );

      const sorted =
        res.data.agents.sort(
          (a, b) =>
            b.total - a.total
        );

      setData(sorted);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Hide percentage columns
  const getColumns = () => {
    if (data.length === 0)
      return [];

    return Object.keys(
      data[0]
    ).filter(
      (key) =>
        key !== "agent" &&
        key !== "total" &&
        key !==
          "talkTimeTotal" &&
        key !== "callCount" &&
        key !==
          "avgTalkTime" &&
        !key.includes(
          "Percentage"
        )
    );
  };

  const columns = getColumns();

  // Format cell value
  const formatValue = (
    col,
    row
  ) => {
    const value = row[col];

    if (
      value === undefined ||
      value === null
    ) {
      return "-";
    }

    const percentageKey =
      `${col}Percentage`;

    // Show: count | percentage
    if (
      row[
        percentageKey
      ] !== undefined
    ) {
      return `${value} | ${Number(
        row[
          percentageKey
        ]
      ).toFixed(2)}%`;
    }

    return value;
  };

  // Average Row
  const calculateAverages =
    () => {
      if (
        data.length === 0
      )
        return null;

      const avgRow = {
        agent: "Average",
      };

      avgRow.total =
        (
          data.reduce(
            (
              sum,
              d
            ) =>
              sum +
              Number(
                d.total || 0
              ),
            0
          ) / data.length
        ).toFixed(2);

      columns.forEach(
        (col) => {
          const avgValue =
            data.reduce(
              (
                acc,
                d
              ) =>
                acc +
                Number(
                  d[col] || 0
                ),
              0
            ) / data.length;

          avgRow[col] =
            avgValue.toFixed(
              2
            );

          // % based on avg total
          avgRow[
            `${col}Percentage`
          ] =
            avgRow.total >
            0
              ? (
                  (avgValue /
                    avgRow.total) *
                  100
                ).toFixed(2)
              : 0;
        }
      );

      return avgRow;
    };

  // Total Row
  const calculateTotals =
    () => {
      if (
        data.length === 0
      )
        return null;

      const totalRow = {
        agent: "Total",
        total:
          data.reduce(
            (
              sum,
              d
            ) =>
              sum +
              Number(
                d.total || 0
              ),
            0
          ),
      };

      columns.forEach(
        (col) => {
          totalRow[col] =
            data.reduce(
              (
                sum,
                d
              ) =>
                sum +
                Number(
                  d[col] || 0
                ),
              0
            );
        }
      );

      return totalRow;
    };

  const avgRow =
    calculateAverages();

  const totalRow =
    calculateTotals();

  // Header labels
  const formatHeader = (
    col
  ) => {
    return col
      .replace(
        /([A-Z])/g,
        " $1"
      )
      .trim();
  };

  return (
    <div
      style={
        styles.container
      }
    >
      <div
        style={styles.card}
      >
        <h2
          style={
            styles.title
          }
        >
          Agent
          Performance
          Report
        </h2>

        {/* Upload */}
        <div
          style={
            styles.uploadGrid
          }
        >
          <div
            style={
              styles.inputGroup
            }
          >
            <label
              style={
                styles.label
              }
            >
              CDR File
            </label>

            <input
              type="file"
              accept=".csv"
              onChange={(
                e
              ) =>
                setCdrFile(
                  e.target
                    .files[0]
                )
              }
              style={
                styles.input
              }
            />
          </div>

          <div
            style={
              styles.inputGroup
            }
          >
            <label
              style={
                styles.label
              }
            >
              Agent File
            </label>

            <input
              type="file"
              accept=".csv"
              onChange={(
                e
              ) =>
                setAgentFile(
                  e.target
                    .files[0]
                )
              }
              style={
                styles.input
              }
            />
          </div>
        </div>

        <button
          onClick={
            handleUpload
          }
          style={
            styles.button
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Processing..."
            : "Generate Report"}
        </button>
      </div>

      {/* TABLE */}
      {!loading &&
        data.length >
          0 && (
          <div
            style={
              styles.tableCard
            }
          >
            <h3
              style={
                styles.subtitle
              }
            >
              Agent Summary
            </h3>

            <div
              style={
                styles.tableWrapper
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Agent
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Total
                    </th>

                    {columns.map(
                      (
                        col
                      ) => (
                        <th
                          key={
                            col
                          }
                          style={
                            styles.th
                          }
                        >
                          {formatHeader(
                            col
                          )}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {data.map(
                    (
                      agent,
                      index
                    ) => (
                      <tr
                        key={
                          index
                        }
                        style={
                          index %
                            2 ===
                          0
                            ? styles.rowEven
                            : styles.rowOdd
                        }
                      >
                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            agent.agent
                          }
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            agent.total
                          }
                        </td>

                        {columns.map(
                          (
                            col
                          ) => (
                            <td
                              key={
                                col
                              }
                              style={
                                styles.td
                              }
                            >
                              {formatValue(
                                col,
                                agent
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}

                  {/* Average Row */}
                  {avgRow && (
                    <tr
                      style={
                        styles.avgRow
                      }
                    >
                      <td
                        style={
                          styles.tdBold
                        }
                      >
                        Average
                      </td>

                      <td
                        style={
                          styles.tdBold
                        }
                      >
                        {
                          avgRow.total
                        }
                      </td>

                      {columns.map(
                        (
                          col
                        ) => (
                          <td
                            key={
                              col
                            }
                            style={
                              styles.tdBold
                            }
                          >
                            {formatValue(
                              col,
                              avgRow
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  )}

                  {/* Total Row */}
                  {totalRow && (
                    <tr
                      style={
                        styles.totalRow
                      }
                    >
                      <td
                        style={
                          styles.tdBold
                        }
                      >
                        Total
                      </td>

                      <td
                        style={
                          styles.tdBold
                        }
                      >
                        {
                          totalRow.total
                        }
                      </td>

                      {columns.map(
                        (
                          col
                        ) => (
                          <td
                            key={
                              col
                            }
                            style={
                              styles.tdBold
                            }
                          >
                            {
                              totalRow[
                                col
                              ]
                            }
                          </td>
                        )
                      )}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {!loading &&
        data.length ===
          0 && (
          <p
            style={
              styles.noData
            }
          >
            No data available
          </p>
        )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fa",
    padding: "20px",
    fontFamily:
      "Arial, sans-serif",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "900px",
    margin: "0 auto",
  },

  title: {
    marginBottom: "20px",
    fontWeight: "600",
  },

  subtitle: {
    marginBottom: "15px",
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
    borderCollapse:
      "collapse",
  },

  th: {
    background: "#f1f5f9",
    padding: "10px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "10px",
    whiteSpace: "nowrap",
  },

  tdBold: {
    padding: "10px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  rowEven: {
    background: "#fff",
  },

  rowOdd: {
    background: "#fafafa",
  },

  avgRow: {
    background: "#e0f2fe",
    borderTop:
      "2px solid #2563eb",
  },

  totalRow: {
    background: "#dcfce7",
    borderTop:
      "2px solid #16a34a",
  },

  noData: {
    textAlign: "center",
    marginTop: "30px",
  },
};

export default AgentReport;