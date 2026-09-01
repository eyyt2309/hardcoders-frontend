import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import CodeEditor from "../components/CodeEditor";
import NavBar from "../components/NavBar";

import { IoMdCheckmark } from "react-icons/io";
import "../styles/ProblemSubmission.css";

function ProblemSubmission() {
  const { slug } = useParams();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTestCase, setSelectedTestCase] = useState(0);

  const [pastSubmission, setPastSubmission] = useState(null);

  // Stores the metrics returned for each testcase
  const [runResults, setRunResults] = useState([]);

  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const response = await apiClient.get(`/problems/${slug}/`);

        const problemData = response.data.problem;
        const pastSubmissionData = response.data.past_submission;

        setProblem(problemData);
        setPastSubmission(pastSubmissionData);

        // Load past submission if any else starter code into Monaco
        if (pastSubmissionData != null) {
          setCode(pastSubmissionData.code);
        } else {
          setCode(problemData.starter_code || "");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load problem.");
      } finally {
        setLoading(false);
      }
    }

    fetchProblem();
  }, [slug]);

  async function handleRun() {
    try {
      setRunning(true);

      // Clear previous results
      setRunResults([]);

      const response = await apiClient.post(`/problems/${slug}/run/`, {
        code,
        language: "python",
      });

      console.log("Run response:", response.data);

      setRunResults(response.data.metrics || []);
    } catch (error) {
      console.error(error);

      setRunResults([
        {
          status: "runtime_error",
          stderr: error.response?.data?.error || "Failed to run code.",
        },
      ]);
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      const response = await apiClient.post(`/problems/${slug}/submit/`, {
        code,
        language: "python",
      });

      console.log("Submit response:", response.data);

      // If submit also returns metrics
      if (response.data.metrics) {
        setRunResults(response.data.metrics);
      }
    } catch (error) {
      console.error(error);

      setRunResults([
        {
          status: "runtime_error",
          stderr: error.response?.data?.error || "Failed to submit solution.",
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  function formatStatus(status) {
    if (!status) {
      return "";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatValue(value) {
    if (value === undefined || value === null) {
      return "—";
    }

    if (typeof value === "string") {
      return value;
    }

    return JSON.stringify(value);
  }

  if (loading) {
    return <div className="problem-submission-loading">Loading problem...</div>;
  }

  if (error) {
    return <div className="problem-submission-error">{error}</div>;
  }

  if (!problem) {
    return null;
  }

  const selectedResult = runResults[selectedTestCase] || null;

  return (
    <>
      <NavBar />

      <div className="problem-submission-page">
        {/* =========================
            LEFT PANEL
        ========================== */}

        <section className="problem-description-panel">
          <div className="problem-description-content">
            {/* Title */}

            <div className="problem-title-section">
              <h1>
                {problem.id}. {problem.title}
              </h1>

              <div className="problem-meta">
                <span
                  className={`problem-difficulty ${problem.difficulty.toLowerCase()}`}
                >
                  {problem.difficulty}
                </span>

                <div className="problem-tags">
                  {(problem.tags || []).map((tag) => (
                    <span className="problem-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}

            <div className="problem-section">
              <p className="problem-description">{problem.description}</p>
            </div>

            {/* Input format */}

            {problem.input_format && (
              <div className="problem-section">
                <h3>Input Format</h3>

                <p>{problem.input_format}</p>
              </div>
            )}

            {/* Output format */}

            {problem.output_format && (
              <div className="problem-section">
                <h3>Output Format</h3>

                <p>{problem.output_format}</p>
              </div>
            )}

            {/* Example */}

            {(problem.example_input || problem.example_output) && (
              <div className="problem-section">
                <h3>Example</h3>

                <div className="example-box">
                  <div>
                    <strong>Input:</strong>

                    <pre>{problem.example_input}</pre>
                  </div>

                  <div>
                    <strong>Output:</strong>

                    <pre>{problem.example_output}</pre>
                  </div>

                  {problem.explanation && (
                    <div>
                      <strong>Explanation:</strong>

                      <p>{problem.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Constraints */}

            {problem.constraints && (
              <div className="problem-section">
                <h3>Constraints</h3>

                <pre className="constraints">{problem.constraints}</pre>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            RIGHT PANEL
        ========================== */}

        <section className="submission-panel">
          {/* Editor Header */}

          <div className="editor-header">
            <div className="editor-header-title">Code</div>
            <div className="editor-header-right">
              {pastSubmission?.status === "accepted" && (
                <IoMdCheckmark className="accepted-checkmark" />
              )}

              <select className="language-select" defaultValue="python">
                <option value="python">Python3</option>
              </select>
            </div>
          </div>

          {/* Monaco Editor */}

          <div className="submission-editor">
            <CodeEditor
              value={code}
              onChange={setCode}
              language="python"
              height="100%"
            />
          </div>

          {/* =========================
              TEST CASE PANEL
          ========================== */}

          <div className="test-case-panel">
            {/* Header */}

            <div className="test-case-panel-header">
              <span>Testcase</span>

              {selectedResult && (
                <span className={`run-status ${selectedResult.status}`}>
                  {formatStatus(selectedResult.status)}
                </span>
              )}
            </div>

            {/* Testcase tabs */}

            <div className="test-case-tabs">
              {(problem.test_cases || []).map((testCase, index) => {
                const result = runResults[index];

                return (
                  <button
                    key={index}
                    type="button"
                    className={
                      selectedTestCase === index
                        ? "test-case-tab active"
                        : "test-case-tab"
                    }
                    onClick={() => setSelectedTestCase(index)}
                  >
                    Case {index + 1}
                    {result && (
                      <span
                        className={`test-case-result-icon ${result.status}`}
                      >
                        {result.status === "accepted" ? " ✓" : " ✕"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* =========================
                BEFORE RUNNING
            ========================== */}

            {problem.test_cases?.length > 0 && !selectedResult && (
              <div className="test-case-content">
                <div className="test-value">
                  <label>Input</label>

                  <pre>{problem.test_cases[selectedTestCase].input_data}</pre>
                </div>
              </div>
            )}

            {/* =========================
                RESULT
            ========================== */}

            {selectedResult && (
              <div className="run-result">
                {/* Status */}

                <div className="result-status-section">
                  <h3 className={`result-status ${selectedResult.status}`}>
                    {formatStatus(selectedResult.status)}
                  </h3>
                </div>

                {/* Metrics */}

                <div className="metrics-grid">
                  {/* Runtime */}

                  <div className="metric-card">
                    <span className="metric-label">Runtime</span>

                    <span className="metric-value">
                      {selectedResult.runtime_ms != null
                        ? `${Number(selectedResult.runtime_ms).toFixed(2)} ms`
                        : "—"}
                    </span>
                  </div>

                  {/* CPU */}

                  <div className="metric-card">
                    <span className="metric-label">CPU Time</span>

                    <span className="metric-value">
                      {selectedResult.cpu_ms != null
                        ? `${Number(selectedResult.cpu_ms).toFixed(2)} ms`
                        : "—"}
                    </span>
                  </div>

                  {/* Memory */}

                  <div className="metric-card">
                    <span className="metric-label">Memory</span>

                    <span className="metric-value">
                      {selectedResult.memory_kb != null
                        ? `${(Number(selectedResult.memory_kb) / 1024).toFixed(
                            2,
                          )} MB`
                        : "—"}
                    </span>
                  </div>

                  {/* Exit code */}

                  <div className="metric-card">
                    <span className="metric-label">Exit Code</span>

                    <span className="metric-value">
                      {selectedResult.exit_code ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Input */}

                <div className="test-value">
                  <label>Input</label>

                  <pre>
                    {selectedResult.input_data ??
                      problem.test_cases?.[selectedTestCase]?.input_data ??
                      "—"}
                  </pre>
                </div>

                {/* Actual output */}

                {selectedResult.actual !== undefined && (
                  <div className="test-value">
                    <label>Your Output</label>

                    <pre>{formatValue(selectedResult.actual)}</pre>
                  </div>
                )}

                {/* Expected output */}

                {selectedResult.expected !== undefined && (
                  <div className="test-value">
                    <label>Expected</label>

                    <pre>{formatValue(selectedResult.expected)}</pre>
                  </div>
                )}

                {/* Runtime errors */}

                {selectedResult.stderr && (
                  <div className="test-value error-output">
                    <label>Error</label>

                    <pre>{selectedResult.stderr}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================
              ACTIONS
          ========================== */}

          <div className="submission-actions">
            <button
              type="button"
              className="run-button"
              onClick={handleRun}
              disabled={running || submitting}
            >
              {running ? "Running..." : "Run"}
            </button>

            <button
              type="button"
              className="submit-button"
              onClick={handleSubmit}
              disabled={running || submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default ProblemSubmission;
