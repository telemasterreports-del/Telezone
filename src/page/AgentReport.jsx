import React, { useState } from "react";
import axios from "axios";

function AgentReport() {
  const [cdrFile, setCdrFile] =
    useState(null);

  const [agentFile, setAgentFile] =
    useState(null);

  const [data, setData] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const handleUpload = async () => {
    if (!cdrFile || !agentFile) {
      return alert(
        "Upload both CDR and Agent files"
      );
    }

    const formData =
      new FormData();

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

      const res =
        await axios.post(
          "/api/agent-report",
          formData
        );

      const sorted = (
        res.data?.agents || []
      ).sort(
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

  // Only disposition columns
  const getColumns = () => {
    if (!data.length) return [];

    return Object.keys(
      data[0]
    ).filter(
      (key) =>
        ![
          "agent",
          "total",
          "talkTimeTotal",
          "callCount",
          "avgTalkTime",
        ].includes(key) &&
        !key.includes(
          "Percentage"
        )
    );
  };

  const columns = getColumns();

  // Cell formatting
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
              item.total || 0
            ),
          0
        ) / data.length;

      avgRow.total =
        totalAvg.toFixed(2);

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
                  item[col] ||
                    0
                ),
              0
            ) / data.length;

          avgRow[col] =
            avg.toFixed(2);

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

  // Total Row
  const calculateTotals =
    () => {
      if (!data.length)
        return null;

      const totalRow = {
        agent: "Total",
        total:
          data.reduce(
            (
              sum,
              item
            ) =>
              sum +
              Number(
                item.total || 0
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
                item
              ) =>
                sum +
                Number(
                  item[col] ||
                    0
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
          Agent Performance
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
    </div>
  );
}

const styles = {
  ...yourExistingStyles,
  subtitle: {
    marginBottom: "15px",
    fontWeight: "600",
  },
  totalRow: {
    background:
      "#dcfce7",
    borderTop:
      "2px solid #16a34a",
  },
};

export default AgentReport;