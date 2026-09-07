import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import apiClient from "../api/apiClient";

import "../styles/dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  const [userProblem, setUserProblem] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recommendedProblems, setRecommendedProblems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDashboardInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/problems/getUserDashboardInfo/");

      setUserProblem(response.data.user_problem_status ?? null);
      setDailyChallenge(response.data.daily_challenge ?? null);
      setRecentSubmissions(response.data.recent_submissions ?? []);
      setRecommendedProblems(response.data.recommended_problems ?? []);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);

      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch dashboard information",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardInfo();
  }, []);

  const calculateProgress = (solved, total) => {
    if (!total || total <= 0) {
      return 0;
    }

    return Math.min((solved / total) * 100, 100);
  };

  const formatDifficulty = (difficulty) => {
    if (!difficulty) {
      return "";
    }

    return (
      difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "";
    }

    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="dashboard-page">
          <main className="dashboard-content">
            <p>Loading dashboard...</p>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="dashboard-page">
          <main className="dashboard-content">
            <div className="dashboard-card">
              <h2>Unable to load dashboard</h2>
              <p>{error}</p>

              <button className="solve-button" onClick={getDashboardInfo}>
                Try Again
              </button>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (!userProblem) {
    return (
      <>
        <NavBar />
        <div className="dashboard-page">
          <main className="dashboard-content">
            <p>No dashboard information available.</p>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />

      <div className="dashboard-page">
        <main className="dashboard-content">
          {/* Welcome */}
          <section className="dashboard-header">
            <div>
              <p className="dashboard-muted">Welcome back,</p>

              <h1>{user?.username ?? "User"}</h1>

              <p>Keep solving problems and build your streak.</p>
            </div>

            <Link className="solve-button" to="/problems">
              Start Solving
            </Link>
          </section>

          {/* Statistics */}
          <section className="dashboard-stats">
            <div className="dashboard-card stat-card">
              <span className="stat-label">Problems Solved</span>

              <strong className="stat-number">
                {userProblem.total_solved ?? 0}
              </strong>

              <span className="stat-description">Keep going!</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Current Streak</span>

              <strong className="stat-number">
                🔥 {userProblem.streak ?? 0}
              </strong>

              <span className="stat-description">days</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Easy</span>

              <strong className="stat-number easy">
                {userProblem.easy_solved ?? 0}
              </strong>

              <span className="stat-description">solved</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Medium</span>

              <strong className="stat-number medium">
                {userProblem.medium_solved ?? 0}
              </strong>

              <span className="stat-description">solved</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Hard</span>

              <strong className="stat-number hard">
                {userProblem.hard_solved ?? 0}
              </strong>

              <span className="stat-description">solved</span>
            </div>
          </section>

          {/* Daily challenge + progress */}
          <section className="dashboard-grid">
            {/* Daily challenge */}
            <div className="dashboard-card daily-challenge">
              {dailyChallenge ? (
                <>
                  <div className="section-header">
                    <div>
                      <span className="section-label">DAILY CHALLENGE</span>

                      <h2>{dailyChallenge.title}</h2>
                    </div>

                    {dailyChallenge.difficulty && (
                      <span
                        className={`difficulty ${dailyChallenge.difficulty.toLowerCase()}`}
                      >
                        {formatDifficulty(dailyChallenge.difficulty)}
                      </span>
                    )}
                  </div>

                  <p>{dailyChallenge.description}</p>

                  <div className="problem-tags">
                    {(dailyChallenge.tags ?? []).map((tag) => (
                      <span className="problem-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {dailyChallenge.slug && (
                    <Link
                      to={`/problems/${dailyChallenge.slug}`}
                      className="challenge-button"
                    >
                      Solve Challenge
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <div className="section-header">
                    <div>
                      <span className="section-label">DAILY CHALLENGE</span>

                      <h2>No challenge available</h2>
                    </div>
                  </div>

                  <p>There are currently no problems available.</p>

                  <Link to="/problems" className="challenge-button">
                    View Problems
                  </Link>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="dashboard-card progress-card">
              <div className="section-header">
                <h2>Your Progress</h2>
              </div>

              {/* Easy */}
              <div className="progress-item">
                <div className="progress-info">
                  <span>Easy</span>

                  <span>
                    {userProblem.easy_solved ?? 0} /{" "}
                    {userProblem.easy_total ?? 0} solved
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill easy-progress"
                    style={{
                      width: `${calculateProgress(
                        userProblem.easy_solved ?? 0,
                        userProblem.easy_total ?? 0,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="progress-item">
                <div className="progress-info">
                  <span>Medium</span>

                  <span>
                    {userProblem.medium_solved ?? 0} /{" "}
                    {userProblem.medium_total ?? 0} solved
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill medium-progress"
                    style={{
                      width: `${calculateProgress(
                        userProblem.medium_solved ?? 0,
                        userProblem.medium_total ?? 0,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="progress-item">
                <div className="progress-info">
                  <span>Hard</span>

                  <span>
                    {userProblem.hard_solved ?? 0} /{" "}
                    {userProblem.hard_total ?? 0} solved
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill hard-progress"
                    style={{
                      width: `${calculateProgress(
                        userProblem.hard_solved ?? 0,
                        userProblem.hard_total ?? 0,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Recommended Problems */}
          <section className="dashboard-card dashboard-section">
            <div className="section-header">
              <div>
                <h2>Recommended Problems</h2>

                <p>Problems selected based on your progress.</p>
              </div>

              <Link to="/problems">View all</Link>
            </div>

            <div className="recommended-list">
              {recommendedProblems.length > 0 ? (
                recommendedProblems.map((problem) => (
                  <Link
                    className="recommended-row"
                    to={`/problems/${problem.slug}`}
                    key={problem.id}
                  >
                    <div className="recommended-info">
                      <span className="recommended-title">
                        {problem.id}. {problem.title}
                      </span>

                      <div className="recommended-tags">
                        {(problem.tags ?? []).map((tag) => (
                          <span className="recommended-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {problem.difficulty && (
                      <span
                        className={`difficulty ${problem.difficulty.toLowerCase()}`}
                      >
                        {formatDifficulty(problem.difficulty)}
                      </span>
                    )}
                  </Link>
                ))
              ) : (
                <p className="dashboard-muted">
                  No recommended problems available yet.
                </p>
              )}
            </div>
          </section>

          {/* Recent submissions */}
          <section className="dashboard-card dashboard-section">
            <div className="section-header">
              <div>
                <h2>Recent Submissions</h2>

                <p>Your latest coding attempts.</p>
              </div>
            </div>

            <div className="submissions">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission, index) => {
                  const difficulty = submission.problem__difficulty;

                  return (
                    <Link
                      to={
                        submission.problem__slug
                          ? `/problems/${submission.problem__slug}`
                          : "/problems"
                      }
                      className="submission-row"
                      key={
                        submission.id ?? `${submission.problem__slug}-${index}`
                      }
                    >
                      <div className="submission-info">
                        <strong>
                          {submission.problem__title ?? "Unknown Problem"}
                        </strong>

                        <span className="submission-meta">
                          {submission.language ?? "Unknown language"}

                          {submission.submitted_at && (
                            <>
                              {" · "}
                              {new Date(
                                submission.submitted_at,
                              ).toLocaleString()}
                            </>
                          )}
                        </span>
                      </div>

                      {difficulty && (
                        <span
                          className={`difficulty ${difficulty.toLowerCase()}`}
                        >
                          {formatDifficulty(difficulty)}
                        </span>
                      )}

                      <span
                        className={
                          submission.status === "accepted"
                            ? "submission-status accepted"
                            : "submission-status rejected"
                        }
                      >
                        {formatStatus(submission.status)}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <p className="dashboard-muted">
                  You have not submitted any problems yet.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
