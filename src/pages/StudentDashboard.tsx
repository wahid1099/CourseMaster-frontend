import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import {
  FiUser,
  FiBook,
  FiFileText,
  FiEdit2,
  FiMail,
  FiCalendar,
  FiAward,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import "./StudentDashboard.css";

const API_URL = "/api";

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    instructor: string;
    category: string;
  };
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
  enrolledAt: string;
}

interface Assignment {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  title: string;
  description: string;
  moduleIndex?: number;
  status: string;
  submission?: {
    answer: string;
    submittedAt: string;
  };
  review?: {
    feedback: string;
    reviewedAt: string;
  };
}

interface QuizHistory {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    moduleIndex?: number;
  };
  course: {
    _id: string;
    title: string;
  };
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "profile" | "courses" | "assignments" | "quizzes"
  >("courses");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [assignmentAnswer, setAssignmentAnswer] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [enrollmentsRes, assignmentsRes, quizzesRes] = await Promise.all([
        axios.get(`${API_URL}/student/dashboard`, { withCredentials: true }),
        axios
          .get(`${API_URL}/student/assignments`, { withCredentials: true })
          .catch(() => ({ data: { assignments: [] } })),
        axios
          .get(`${API_URL}/quizzes/history`, { withCredentials: true })
          .catch(() => ({ data: { history: [] } })),
      ]);

      setEnrollments(enrollmentsRes.data.enrollments || []);
      setAssignments(assignmentsRes.data.assignments || []);
      setQuizHistory(quizzesRes.data.history || []);

      // Fetch available quizzes for enrolled courses
      await fetchAvailableQuizzes(enrollmentsRes.data.enrollments || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableQuizzes = async (enrollments: Enrollment[]) => {
    try {
      const courseIds = enrollments.map((e) => e.course._id);
      const quizPromises = courseIds.map((courseId) =>
        axios
          .get(`${API_URL}/quizzes/course/${courseId}`, {
            withCredentials: true,
          })
          .catch(() => ({ data: { quizzes: [] } }))
      );

      const quizResults = await Promise.all(quizPromises);
      const allQuizzes = quizResults.flatMap((res) => res.data.quizzes || []);

      // Filter out quizzes that have already been taken
      const takenQuizIds = quizHistory.map((h) => h.quiz._id);
      const available = allQuizzes.filter((q) => !takenQuizIds.includes(q._id));

      setAvailableQuizzes(available);
    } catch (error) {
      console.error("Failed to fetch available quizzes:", error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !assignmentAnswer.trim()) return;

    try {
      await axios.post(
        `${API_URL}/student/assignments`,
        {
          courseId: selectedAssignment.course._id,
          title: selectedAssignment.title,
          description: selectedAssignment.description,
          answer: assignmentAnswer,
        },
        { withCredentials: true }
      );

      toast.success("Assignment submitted successfully!");
      setShowSubmitModal(false);
      setAssignmentAnswer("");
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error("Failed to submit assignment");
    }
  };

  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter((e) => e.isCompleted).length,
    inProgress: enrollments.filter((e) => !e.isCompleted).length,
    totalAssignments: assignments.length,
    pendingAssignments: assignments.filter((a) => a.status !== "reviewed")
      .length,
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        <h1>My Dashboard</h1>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser /> Profile
          </button>
          <button
            className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            <FiBook /> My Courses
          </button>
          <button
            className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`}
            onClick={() => setActiveTab("assignments")}
          >
            <FiFileText /> Assignments
          </button>
          <button
            className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            <FiAward /> Quizzes
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="tab-content">
            <div className="profile-section">
              <div className="card profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="profile-info">
                    <h2>{user?.name || "Student"}</h2>
                    <p className="profile-email">
                      <FiMail /> {user?.email}
                    </p>
                    <p className="profile-joined">
                      <FiCalendar /> Joined {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <button className="btn-icon edit-profile">
                    <FiEdit2 />
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Courses</h3>
                  <p className="stat-value">{stats.totalCourses}</p>
                </div>
                <div className="stat-card">
                  <h3>Completed</h3>
                  <p className="stat-value success">{stats.completedCourses}</p>
                </div>
                <div className="stat-card">
                  <h3>In Progress</h3>
                  <p className="stat-value warning">{stats.inProgress}</p>
                </div>
                <div className="stat-card">
                  <h3>Assignments</h3>
                  <p className="stat-value">{stats.totalAssignments}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === "courses" && (
          <div className="tab-content">
            {enrollments.length === 0 ? (
              <div className="empty-state card">
                <FiBook size={48} />
                <h3>No Courses Yet</h3>
                <p>Start learning by enrolling in a course!</p>
                <a href="/" className="btn btn-primary">
                  Browse Courses
                </a>
              </div>
            ) : (
              <div className="courses-grid">
                {enrollments.map((enrollment) => (
                  <div key={enrollment._id} className="course-card card">
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="course-thumbnail"
                    />
                    <div className="course-content">
                      <span className="course-category">
                        {enrollment.course.category}
                      </span>
                      <h3>{enrollment.course.title}</h3>
                      <p className="course-instructor">
                        By {enrollment.course.instructor}
                      </p>

                      <div className="course-progress">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span className="progress-percentage">
                            {enrollment.progress}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <p className="lessons-count">
                          {enrollment.completedLessons} /{" "}
                          {enrollment.totalLessons} lessons completed
                        </p>
                      </div>

                      {enrollment.isCompleted ? (
                        <span className="badge badge-success">Completed</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-block"
                          onClick={() =>
                            (window.location.href = `/course/${enrollment.course._id}/learn`)
                          }
                        >
                          Continue Learning
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="tab-content">
            {assignments.length === 0 ? (
              <div className="empty-state card">
                <FiFileText size={48} />
                <h3>No Assignments</h3>
                <p>You don't have any assignments yet.</p>
              </div>
            ) : (
              <div className="assignments-list">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="assignment-card card">
                    <div className="assignment-header">
                      <div>
                        <h3>{assignment.title}</h3>
                        <p className="assignment-course">
                          {assignment.course.title}
                          {assignment.moduleIndex !== undefined && (
                            <span className="module-badge">
                              📚 Module {assignment.moduleIndex + 1}
                            </span>
                          )}
                        </p>
                      </div>
                      <span
                        className={`badge ${
                          assignment.status === "reviewed"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </div>
                    <p className="assignment-description">
                      {assignment.description}
                    </p>

                    {assignment.submission ? (
                      <div className="assignment-submission">
                        <h4>Your Submission:</h4>
                        <p>{assignment.submission.answer}</p>
                        <small>
                          Submitted on{" "}
                          {new Date(
                            assignment.submission.submittedAt
                          ).toLocaleDateString()}
                        </small>

                        {assignment.review && (
                          <div className="assignment-feedback">
                            <h4>Instructor Feedback:</h4>
                            <p>{assignment.review.feedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowSubmitModal(true);
                        }}
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === "quizzes" && (
          <div className="tab-content">
            {/* Available Quizzes Section */}
            <div className="quizzes-section">
              <h2>Available Quizzes</h2>
              {availableQuizzes.length === 0 ? (
                <div className="empty-state card">
                  <FiAward size={48} />
                  <h3>No Available Quizzes</h3>
                  <p>
                    There are no quizzes available for your courses at the
                    moment.
                  </p>
                </div>
              ) : (
                <div className="assignments-list">
                  {availableQuizzes.map((quiz) => (
                    <div key={quiz._id} className="assignment-card card">
                      <div className="assignment-header">
                        <div>
                          <h3>{quiz.title}</h3>
                          {quiz.moduleIndex !== undefined && (
                            <small>Module {quiz.moduleIndex + 1}</small>
                          )}
                        </div>
                        <span className="badge badge-primary">Available</span>
                      </div>
                      <div className="quiz-info">
                        <p>
                          <strong>Passing Score:</strong> {quiz.passingScore}%
                        </p>
                        <p>
                          <strong>Questions:</strong>{" "}
                          {quiz.questions?.length || 0}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/quiz/${quiz._id}`)}
                      >
                        Take Quiz
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz History Section */}
            <div className="quizzes-section" style={{ marginTop: "2rem" }}>
              <h2>Quiz History</h2>
              {quizHistory.length === 0 ? (
                <div className="empty-state card">
                  <FiAward size={48} />
                  <h3>No Quiz History</h3>
                  <p>You haven't taken any quizzes yet.</p>
                </div>
              ) : (
                <div className="assignments-list">
                  {quizHistory.map((quiz) => (
                    <div key={quiz._id} className="assignment-card card">
                      <div className="assignment-header">
                        <div>
                          <h3>{quiz.quiz.title}</h3>
                          <p className="assignment-course">
                            {quiz.course.title}
                          </p>
                          {quiz.quiz.moduleIndex !== undefined && (
                            <small>Module {quiz.quiz.moduleIndex + 1}</small>
                          )}
                        </div>
                        <span
                          className={`badge ${
                            quiz.passed ? "badge-success" : "badge-danger"
                          }`}
                        >
                          {quiz.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                      <div className="quiz-results">
                        <div className="quiz-score">
                          <strong>Score:</strong> {quiz.score} /{" "}
                          {quiz.totalPoints} ({quiz.percentage}%)
                        </div>
                        <small>
                          Submitted on{" "}
                          {new Date(quiz.submittedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Assignment Modal */}
        {showSubmitModal && selectedAssignment && (
          <div
            className="modal-overlay"
            onClick={() => setShowSubmitModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Submit Assignment</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowSubmitModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <h3>{selectedAssignment.title}</h3>
                <p className="text-secondary">
                  {selectedAssignment.description}
                </p>

                <div className="form-group">
                  <label>Submission Type</label>
                  <select
                    className="form-select"
                    onChange={(e) => {
                      if (e.target.value === "link") {
                        setAssignmentAnswer("https://drive.google.com/");
                      } else {
                        setAssignmentAnswer("");
                      }
                    }}
                  >
                    <option value="text">Text Answer</option>
                    <option value="link">Google Drive Link</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    {assignmentAnswer.startsWith("https://drive.google.com")
                      ? "Google Drive Link *"
                      : "Your Answer *"}
                  </label>
                  {assignmentAnswer.startsWith("https://drive.google.com") ? (
                    <>
                      <input
                        type="url"
                        className="form-input"
                        value={assignmentAnswer}
                        onChange={(e) => setAssignmentAnswer(e.target.value)}
                        placeholder="https://drive.google.com/file/d/..."
                        required
                      />
                      <small className="form-hint">
                        📎 Make sure the file is shared with "Anyone with the
                        link can view"
                      </small>
                    </>
                  ) : (
                    <textarea
                      className="form-textarea"
                      value={assignmentAnswer}
                      onChange={(e) => setAssignmentAnswer(e.target.value)}
                      placeholder="Enter your answer here..."
                      rows={8}
                      required
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitAssignment}
                  disabled={!assignmentAnswer.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
