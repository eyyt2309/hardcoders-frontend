import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import apiClient from "../api/apiClient";
import "../styles/ProblemCreation.css";
import NavBar from "../components/NavBar";

function ProblemCreation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    description: "",
    input_format: "",
    output_format: "",
    constraints: "",
    example_input: "",
    example_output: "",
    explanation: "",
    starter_code: "",
    solution: "",
    function_name: "",
    tags: "",
  });

  const [testCases, setTestCases] = useState([
    {
      input: "",
      expected_output: "",
      is_hidden: true,
    },
  ]);

  // Natural language prompt entered by the user
  const [problemPrompt, setProblemPrompt] = useState("");

  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleTestCaseChange(index, field, value) {
    setTestCases((prev) =>
      prev.map((testCase, i) =>
        i === index
          ? {
              ...testCase,
              [field]: value,
            }
          : testCase,
      ),
    );
  }

  function addTestCase() {
    setTestCases((prev) => [
      ...prev,
      {
        input: "",
        expected_output: "",
        is_hidden: true,
      },
    ]);
  }

  function removeTestCase(index) {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  }

  // ============================================
  // AI PROBLEM PARAMETER GENERATION
  // ============================================

  async function handleGenerateProblemParameters() {
    const prompt = problemPrompt.trim();

    if (!prompt) {
      console.log("STOPPED: prompt was empty");

      setGenerationError("Please describe the problem you want to generate.");

      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      const response = await apiClient.post(
        "/problems/generateProblemParameters/",
        {
          prompt: prompt,
        },
      );

      const generatedFormData =
        response.data.problem_creation_params ??
        response.data.formData ??
        response.data;

      if (!generatedFormData || typeof generatedFormData !== "object") {
        throw new Error("The AI returned an invalid problem format.");
      }

      // Populate normal form fields
      setFormData((prev) => ({
        ...prev,

        title: generatedFormData.title ?? prev.title,

        difficulty: generatedFormData.difficulty ?? prev.difficulty,

        description: generatedFormData.description ?? prev.description,

        input_format: generatedFormData.input_format ?? prev.input_format,

        output_format: generatedFormData.output_format ?? prev.output_format,

        constraints: generatedFormData.constraints ?? prev.constraints,

        example_input: generatedFormData.example_input ?? prev.example_input,

        example_output: generatedFormData.example_output ?? prev.example_output,

        explanation: generatedFormData.explanation ?? prev.explanation,

        starter_code: generatedFormData.starter_code ?? prev.starter_code,

        solution: generatedFormData.solution ?? prev.solution,

        function_name: generatedFormData.function_name ?? prev.function_name,

        tags: Array.isArray(generatedFormData.tags)
          ? generatedFormData.tags.join(", ")
          : (generatedFormData.tags ?? prev.tags),
      }));

      // Populate generated test cases
      if (
        Array.isArray(generatedFormData.testCases) &&
        generatedFormData.testCases.length > 0
      ) {
        setTestCases(
          generatedFormData.testCases.map((testCase) => ({
            input: testCase.input ?? "",

            expected_output: testCase.expected_output ?? "",

            is_hidden: testCase.is_hidden ?? true,
          })),
        );
      }
    } catch (error) {
      console.error("API ERROR:", error);
      console.error("Response:", error.response);
      console.error("Response data:", error.response?.data);

      setGenerationError(
        error.response?.data?.error ??
          error.response?.data?.message ??
          error.message ??
          "Unable to generate problem parameters.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // ============================================
  // CREATE PROBLEM
  // ============================================

  async function handleSubmit(e) {
    e.preventDefault();

    const problemData = {
      ...formData,

      // Converts:
      //
      // "Array, Hash Table, Two Pointers"
      //
      // into:
      //
      // ["Array", "Hash Table", "Two Pointers"]

      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      testCases,
    };

    console.log(problemData);

    try {
      await apiClient.post("/problems/create/", problemData);

      navigate("/problems");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <NavBar />

      <div className="problem-creation-page">
        <div className="problem-creation-header">
          <div>
            <h1>Create Problem</h1>

            <p>Create a new coding challenge for the platform.</p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button
              type="submit"
              form="problem-form"
              className="publish-button"
            >
              Publish Problem
            </button>
          </div>
        </div>

        <form
          id="problem-form"
          className="problem-form"
          onSubmit={handleSubmit}
        >
          {/* ========================================
              AI PROBLEM GENERATOR
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Generate with AI</h2>

              <p>
                Describe the coding problem you want to create. The AI will
                generate the problem parameters and fill in the form below.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="problemPrompt">Problem Description</label>

              <textarea
                id="problemPrompt"
                rows="6"
                value={problemPrompt}
                onChange={(e) => {
                  console.log("Textarea changed:", e.target.value);
                  setProblemPrompt(e.target.value);
                }}
              />

              <span className="input-hint">
                Describe what kind of coding problem you want in normal
                language.
              </span>
            </div>

            {generationError && (
              <div className="form-group">
                <span className="input-hint">{generationError}</span>
              </div>
            )}

            <button
              type="button"
              className="publish-button"
              onClick={handleGenerateProblemParameters}
              disabled={isGenerating || !problemPrompt.trim()}
            >
              {isGenerating ? "Generating..." : "Generate Problem Parameters"}
            </button>
          </section>

          {/* ========================================
              BASIC INFORMATION
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Basic Information</h2>

              <p>Define the problem title and difficulty.</p>
            </div>

            <div className="form-group">
              <label htmlFor="title">Problem Title</label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Two Sum"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>

              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value="Easy">Easy</option>

                <option value="Medium">Medium</option>

                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>

              <input
                id="tags"
                name="tags"
                type="text"
                placeholder="Array, Hash Table, Dynamic Programming"
                value={formData.tags}
                onChange={handleChange}
              />

              <span className="input-hint">Separate tags using commas.</span>
            </div>
          </section>

          {/* ========================================
              PROBLEM STATEMENT
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Problem Statement</h2>

              <p>Describe what the user needs to solve.</p>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                rows="9"
                placeholder={`Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution...`}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </section>

          {/* ========================================
              INPUT / OUTPUT
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Input & Output</h2>

              <p>Explain the expected input and output format.</p>
            </div>

            <div className="two-column-grid">
              <div className="form-group">
                <label htmlFor="inputFormat">Input Format</label>

                <textarea
                  id="inputFormat"
                  name="input_format"
                  rows="5"
                  placeholder="Describe the input..."
                  value={formData.input_format}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="outputFormat">Output Format</label>

                <textarea
                  id="outputFormat"
                  name="output_format"
                  rows="5"
                  placeholder="Describe the expected output..."
                  value={formData.output_format}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* ========================================
              EXAMPLE
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Example</h2>

              <p>Show the user how the problem works.</p>
            </div>

            <div className="two-column-grid">
              <div className="form-group">
                <label htmlFor="exampleInput">Example Input</label>

                <textarea
                  id="exampleInput"
                  name="example_input"
                  rows="4"
                  className="code-textarea"
                  placeholder={`nums = [2,7,11,15]
target = 9`}
                  value={formData.example_input}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="exampleOutput">Example Output</label>

                <textarea
                  id="exampleOutput"
                  name="example_output"
                  rows="4"
                  className="code-textarea"
                  placeholder="[0,1]"
                  value={formData.example_output}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="explanation">Explanation</label>

              <textarea
                id="explanation"
                name="explanation"
                rows="4"
                placeholder="Because nums[0] + nums[1] = 2 + 7 = 9, we return [0, 1]."
                value={formData.explanation}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* ========================================
              CONSTRAINTS
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Constraints</h2>

              <p>Define limits for accepted inputs.</p>
            </div>

            <div className="form-group">
              <textarea
                name="constraints"
                rows="6"
                className="code-textarea"
                placeholder={`2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9`}
                value={formData.constraints}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* ========================================
              STARTER CODE
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Starter Code</h2>

              <p>Code that will initially appear inside the user's editor.</p>
            </div>

            <CodeEditor
              value={formData.starter_code}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  starter_code: value,
                }))
              }
            />
          </section>

          {/* ========================================
              FUNCTION NAME
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Function Name</h2>

              <p>
                The method that the judge should call inside the Solution class.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="function_name">Function Name</label>

              <input
                id="function_name"
                name="function_name"
                type="text"
                placeholder="e.g. twoSum"
                value={formData.function_name}
                onChange={handleChange}
                required
              />

              <span className="input-hint">
                Enter only the method name, for example: twoSum, isPalindrome,
                maxSubArray.
              </span>
            </div>
          </section>

          {/* ========================================
              TEST CASES
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading test-case-heading">
              <div>
                <h2>Test Cases</h2>

                <p>Test cases are used to validate submitted solutions.</p>
              </div>

              <button
                type="button"
                className="add-test-button"
                onClick={addTestCase}
              >
                + Add Test Case
              </button>
            </div>

            <div className="test-case-list">
              {testCases.map((testCase, index) => (
                <div className="test-case" key={index}>
                  <div className="test-case-top">
                    <div className="test-case-title">
                      <span>Test Case {index + 1}</span>

                      <span
                        className={
                          testCase.is_hidden
                            ? "test-case-badge hidden"
                            : "test-case-badge visible"
                        }
                      >
                        {testCase.is_hidden ? "Hidden" : "Visible"}
                      </span>
                    </div>

                    {testCases.length > 1 && (
                      <button
                        type="button"
                        className="remove-test-button"
                        onClick={() => removeTestCase(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Visibility */}

                  <div className="form-group">
                    <label>Test Case Visibility</label>

                    <select
                      value={testCase.is_hidden ? "hidden" : "visible"}
                      onChange={(e) =>
                        handleTestCaseChange(
                          index,
                          "is_hidden",
                          e.target.value === "hidden",
                        )
                      }
                    >
                      <option value="visible">Visible — shown to users</option>

                      <option value="hidden">
                        Hidden — used only during judging
                      </option>
                    </select>
                  </div>

                  <div className="two-column-grid">
                    <div className="form-group">
                      <label>Input</label>

                      <textarea
                        rows="4"
                        className="code-textarea"
                        placeholder="[2,7,11,15], 9"
                        value={testCase.input}
                        onChange={(e) =>
                          handleTestCaseChange(index, "input", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Expected Output</label>

                      <textarea
                        rows="4"
                        className="code-textarea"
                        placeholder="[0,1]"
                        value={testCase.expected_output}
                        onChange={(e) =>
                          handleTestCaseChange(
                            index,
                            "expected_output",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================
              REFERENCE SOLUTION
          ======================================== */}

          <section className="problem-section">
            <div className="section-heading">
              <h2>Reference Solution</h2>

              <p>
                Store the correct solution for validation or administrator
                reference.
              </p>
            </div>

            <CodeEditor
              value={formData.solution}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  solution: value,
                }))
              }
            />
          </section>

          {/* ========================================
              BOTTOM ACTIONS
          ======================================== */}

          <div className="bottom-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>

            <button type="submit" className="publish-button">
              Publish Problem
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ProblemCreation;
