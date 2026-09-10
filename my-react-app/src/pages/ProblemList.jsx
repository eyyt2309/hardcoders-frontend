import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import NavBar from "../components/NavBar";
import apiClient from "../api/apiClient";

import "../styles/ProblemList.css";

function ProblemList() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await apiClient.get("/problems/getProblemsList/");

        setProblems(response.data.problems);
      } catch (error) {
        console.error(error);
        setError("Failed to load problems.");
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  /*
   * Extract every unique tag from all problems.
   *
   * Example:
   *
   * [
   *   { name: "Array" },
   *   { name: "Hash Table" },
   *   { name: "Dynamic Programming" }
   * ]
   */
  const availableTags = useMemo(() => {
    const tags = problems.flatMap((problem) => problem.tags || []);

    return [...new Set(tags)].sort();
  }, [problems]);

  /*
   * Filter problems whenever:
   * - search changes
   * - difficulty changes
   * - selectedTags changes
   */
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch = problem.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" ||
        problem.difficulty.toLowerCase() === difficulty.toLowerCase();

      const problemTags = problem.tags || [];

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => problemTags.includes(tag));

      return matchesSearch && matchesDifficulty && matchesTags;
    });
  }, [problems, search, difficulty, selectedTags]);

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((selectedTag) => selectedTag !== tag)
        : [...prev, tag],
    );
  }

  function clearFilters() {
    setSelectedTags([]);
    setDifficulty("All");
    setSearch("");
  }

  function openProblem(slug) {
    navigate(`/problems/${slug}`);
  }

  if (loading) {
    return (
      <div className="problem-list-page">
        <p>Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="problem-list-page">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="problem-list-page">
        {/* Header */}
        <div className="problem-list-header">
          <div>
            <h1>Problems</h1>
            <p>
              Practice coding problems and improve your problem-solving skills.
            </p>
          </div>
        </div>

        <div className="problem-list-layout">
          {/* Filters */}
          <aside className="problem-filters">
            <div className="filter-header">
              <h3>Filters</h3>

              <button
                type="button"
                className="clear-filter-button"
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>

            {/* Search */}
            <div className="filter-section">
              <label htmlFor="problem-search">Search</label>

              <input
                id="problem-search"
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Difficulty */}
            <div className="filter-section">
              <label>Difficulty</label>

              <div className="difficulty-filters">
                {["All", "Easy", "Medium", "Hard"].map((level) => (
                  <button
                    type="button"
                    key={level}
                    className={
                      difficulty === level
                        ? "difficulty-filter active"
                        : "difficulty-filter"
                    }
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="filter-section">
              <label>Tags</label>

              <div className="tag-filter-list">
                {availableTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={
                      selectedTags.includes(tag)
                        ? "tag-filter active"
                        : "tag-filter"
                    }
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Problem Table */}
          <main className="problem-table-container">
            <div className="problem-table-header">
              <span>
                {filteredProblems.length}{" "}
                {filteredProblems.length === 1 ? "Problem" : "Problems"}
              </span>
            </div>

            <div className="problem-table">
              <div className="problem-row table-head">
                <div>Status</div>
                <div>Title</div>
                <div>Difficulty</div>
                <div>Tags</div>
              </div>

              {filteredProblems.length === 0 ? (
                <div className="no-problems">
                  No problems match the selected filters.
                </div>
              ) : (
                filteredProblems.map((problem) => (
                  <div
                    key={problem.problem_number}
                    className="problem-row"
                    onClick={() => openProblem(problem.slug)}
                  >
                    <div className="problem-status">
                      {problem.solved ? (
                        <span className="solved-icon">✓</span>
                      ) : (
                        <span className="unsolved-icon">○</span>
                      )}
                    </div>

                    <div className="problem-title">
                      {problem.problem_number}. {problem.title}
                    </div>

                    <div>
                      <span
                        className={`difficulty ${problem.difficulty.toLowerCase()}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <div className="problem-tags">
                      {(problem.tags || []).map((tag) => (
                        <span className="problem-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default ProblemList;
