import { Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import NavBar from "../components/NavBar";
import apiClient from "../api/apiClient";

import "../styles/dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const [userProblem, setUserProblem] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState(null);
  const [recommendedProblems, setRecommendedProblems] = useState(null);

  const getUserProblem = async () => {
    try {
      const response = await apiClient.get("/problems/getUserDashboardInfo/");
      setUserProblem(response.data.user_problem_status);
      setDailyChallenge(response.data.daily_challenge);
      setRecentSubmissions(response.data.recent_submissions);
      setRecommendedProblems(response.data.recommended_problems);
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch user problem statistics",
      );
    }
  };

  const fallbackRecommendedProblems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      acceptance: "54.2%",
    },
    {
      id: 2,
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      acceptance: "36.1%",
    },
    {
      id: 3,
      title: "Merge Two Sorted Lists",
      difficulty: "Easy",
      acceptance: "65.8%",
    },
    {
      id: 4,
      title: "Container With Most Water",
      difficulty: "Medium",
      acceptance: "57.4%",
    },
  ];

  const fallbackSubmissions = [
    {
      problem: "Valid Parentheses",
      status: "Accepted",
      language: "Python",
      time: "10 minutes ago",
    },
    {
      problem: "Binary Search",
      status: "Accepted",
      language: "Python",
      time: "1 hour ago",
    },
    {
      problem: "Maximum Subarray",
      status: "Wrong Answer",
      language: "Python",
      time: "Yesterday",
    },
  ];

  // Hooks
  useEffect(() => {
    getUserProblem();
  }, []);

  if (!userProblem) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <>
      <NavBar />
      <div className="dashboard-page">
        {/* Main content */}
        <main className="dashboard-content">
          {/* Welcome */}
          <section className="dashboard-header">
            <div>
              <p className="dashboard-muted">Welcome back,</p>

              <h1>{user.username}</h1>

              <p>Keep solving problems and build your streak.</p>
            </div>

            <Link className="solve-button" to="/problems">
              Start Solving
            </Link>
          </section>

          {/* Top cards */}
          <section className="dashboard-stats">
            <div className="dashboard-card stat-card">
              <span className="stat-label">Problems Solved</span>

              <strong className="stat-number">
                {userProblem.total_solved}
              </strong>

              <span className="stat-description">Keep going!</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Current Streak</span>

              <strong className="stat-number">🔥 {userProblem.streak}</strong>

              <span className="stat-description">days</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Easy</span>

              <strong className="stat-number easy">
                {userProblem.easy_solved}
              </strong>

              <span className="stat-description">solved</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Medium</span>

              <strong className="stat-number medium">
                {userProblem.medium_solved}
              </strong>

              <span className="stat-description">solved</span>
            </div>

            <div className="dashboard-card stat-card">
              <span className="stat-label">Hard</span>

              <strong className="stat-number hard">
                {userProblem.hard_solved}
              </strong>

              <span className="stat-description">solved</span>
            </div>
          </section>

          {/* Main grid */}
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

                    {dailyChallenge.difficulty === "easy" && (
                      <span className="difficulty easy">Easy</span>
                    )}

                    {dailyChallenge.difficulty === "medium" && (
                      <span className="difficulty medium">Medium</span>
                    )}

                    {dailyChallenge.difficulty === "hard" && (
                      <span className="difficulty hard">Hard</span>
                    )}
                  </div>

                  <p>{dailyChallenge.description}</p>

                  <div className="problem-tags">
                    {(dailyChallenge.tags || []).map((tag) => (
                      <span className="problem-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/problems/${dailyChallenge.slug}`}
                    className="challenge-button"
                  >
                    Solve Challenge
                  </Link>
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
                </>
              )}
            </div>

            {/* Progress */}
            <div className="dashboard-card progress-card">
              <div className="section-header">
                <h2>Your Progress</h2>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>Easy</span>
                  <span>
                    {userProblem.easy_solved} / {userProblem.easy_total} solved
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill easy-progress"
                    style={{
                      width: `${
                        userProblem.easy_total > 0
                          ? (userProblem.easy_solved / userProblem.easy_total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>Medium</span>
                  <span>
                    {userProblem.medium_solved} / {userProblem.medium_total}{" "}
                    solved
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill medium-progress"
                    style={{
                      width: `${
                        userProblem.medium_total > 0
                          ? (userProblem.medium_solved /
                              userProblem.medium_total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>Hard</span>
                  <span>
                    {userProblem.hard_solved} / {userProblem.hard_total} solved
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill hard-progress"
                    style={{
                      width: `${
                        userProblem.hard_total > 0
                          ? (userProblem.hard_solved / userProblem.hard_total) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Recommended */}
          <section className="dashboard-card dashboard-section">
            <div className="section-header">
              <div>
                <h2>Recommended Problems</h2>
                <p>Problems selected based on your progress.</p>
              </div>

              <Link to="/problems">View all</Link>
            </div>

            <div className="recommended-list">
              {(recommendedProblems?.length > 0
                ? recommendedProblems
                : fallbackRecommendedProblems
              ).map((problem) => (
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
                      {problem.tags?.map((tag) => (
                        <span className="recommended-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span
                    className={`difficulty ${problem.difficulty.toLowerCase()}`}
                  >
                    {problem.difficulty}
                  </span>
                </Link>
              ))}
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
              {(recentSubmissions?.length > 0
                ? recentSubmissions
                : fallbackSubmissions
              ).map((submission, index) => (
                <Link
                  to={`/problems/${submission.problem__slug}`}
                  className="submission-row"
                  key={index}
                >
                  <div className="submission-info">
                    <strong>{submission.problem__title}</strong>

                    <span className="submission-meta">
                      {submission.language} ·{" "}
                      {new Date(submission.submitted_at).toLocaleString()}
                    </span>
                  </div>

                  <span
                    className={`difficulty ${submission.problem__difficulty.toLowerCase()}`}
                  >
                    {submission.problem__difficulty}
                  </span>

                  <span
                    className={
                      submission.status === "accepted"
                        ? "submission-status accepted"
                        : "submission-status rejected"
                    }
                  >
                    {submission.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default Dashboard;
