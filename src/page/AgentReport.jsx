import React, {
  useState,
} from "react";
import axios from "axios";

function AgentReport() {
  const [agentFile, setAgentFile] =
    useState(null);

  const [data, setData] =
    useState([]);

  const [overall, setOverall] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const handleUpload =
    async () => {
      if (!agentFile) {
        return alert(
          "Upload disposition file"
        );
      }

      const formData =
        new FormData();

      formData.append(
        "agentFile",
        agentFile
      );

      try {
        setLoading(true);

        const res =
          await axios.post(
            "/api/agent-report",
            formData
          );

        console.log(
          "API Response:",
          res.data
        );

        const responseData =
          res.data?.agents ||
          [];

        const sorted =
          responseData.sort(
            (a, b) =>
              b.total -
              a.total
          );

        setData(sorted);

        setOverall(
          res.data?.overall ||
            null
        );
      } catch (err) {
        console.error(err);
        alert(
          "Upload failed"
        );
      } finally {
        setLoading(false);
      }
    };

  // Get only disposition columns
  const getColumns = () => {
    if (!data.length)
      return [];

    return Object.keys(
      data[0]
    ).filter(
      (key) =>
        ![
          "agent",
          "total",
        ].includes(key) &&
        !key.includes(
          "Percentage"
        )
    );
  };

  const columns =
    getColumns();

  // Format value
  const formatValue = (
    col,
    row
  ) => {
    const value =
      row[col] ?? 0;

    const percentageKey =
      `${col}Percentage`;

    if (
      row[
        percentageKey
      ] !== undefined
    ) {
      return `${value} (${Number(
        row[
          percentageKey
        ]
      ).toFixed(2)}%)`;
    }

    return value;
  };

  // Average row
  const calculateAverages =
    () => {
      if (!data.length)
        return null;

      const avgRow = {
        agent: "Average",
      };

      const totalAvg =
        data.reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.total ||
                0
            ),
          0
        ) / data.length;

      avgRow.total =
        totalAvg.toFixed(
          2
        );

      columns.forEach(
        (col) => {
          const avg =
            data.reduce(
              (
                sum,
                item
              ) =>
                sum +
                Number(
                  item[
                    col
                  ] || 0
                ),
              0
            ) /
            data.length;

          avgRow[col] =
            avg.toFixed(
              2
            );

          avgRow[
            `${col}Percentage`
          ] =
            totalAvg > 0
              ? (
                  (avg /
                    totalAvg) *
                  100
                ).toFixed(2)
              : 0;
        }
      );

      return avgRow;
    };

  const avgRow =
    calculateAverages();

  const formatHeader = (
    col
  ) =>
    col
      .replace(
        /([A-Z])/g,
        " $1"
      )
      .trim();

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
              Disposition
              File
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
                            styles.tdAgent
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

                  {overall && (
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
                          overall.total
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
                              overall
                            )}
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
    </div>
  );
}

const styles = {
  container: {
    minHeight:
      "100vh",
    background:
      "#f4f7fb",
    padding:
      "30px",
    fontFamily:
      "Inter, sans-serif",
  },

  card: {
    background:
      "#ffffff",
    padding:
      "28px",
    borderRadius:
      "16px",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth:
      "1000px",
    margin:
      "0 auto 30px",
  },

  title: {
    fontSize:
      "28px",
    fontWeight:
      "700",
    marginBottom:
      "24px",
  },

  subtitle: {
    fontSize:
      "20px",
    fontWeight:
      "600",
    marginBottom:
      "20px",
  },

  uploadGrid: {
    display: "flex",
    gap: "20px",
  },

  inputGroup: {
    flex: 1,
  },

  label: {
    display:
      "block",
    marginBottom:
      "8px",
    fontWeight:
      "500",
  },

  input: {
    width: "100%",
    padding:
      "10px",
    border:
      "1px solid #d1d5db",
    borderRadius:
      "8px",
  },

  button: {
    marginTop:
      "20px",
    padding:
      "12px 24px",
    background:
      "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius:
      "8px",
    cursor:
      "pointer",
    fontWeight:
      "600",
  },

  tableCard: {
    background:
      "#ffffff",
    borderRadius:
      "16px",
    padding:
      "24px",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.08)",
  },

  tableWrapper: {
    overflowX:
      "auto",
    borderRadius:
      "12px",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  th: {
    background:
      "#1e293b",
    color: "#fff",
    padding:
      "14px",
    textAlign:
      "left",
    whiteSpace:
      "nowrap",
    position:
      "sticky",
    top: 0,
  },

  td: {
    padding:
      "14px",
    borderBottom:
      "1px solid #e5e7eb",
    whiteSpace:
      "nowrap",
  },

  tdAgent: {
    padding:
      "14px",
    fontWeight:
      "600",
  },

  tdBold: {
    padding:
      "14px",
    fontWeight:
      "700",
  },

  rowEven: {
    background:
      "#ffffff",
  },

  rowOdd: {
    background:
      "#f8fafc",
  },

  avgRow: {
    background:
      "#dbeafe",
  },

  totalRow: {
    background:
      "#dcfce7",
  },
};

export default AgentReport;