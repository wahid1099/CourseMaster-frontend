import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBook,
  FiFileText,
  FiFilter,
} from "react-icons/fi";
import axios from "axios";
import "./QuizManagement.css";

const API_URL = "https://course-master-backend-chi.vercel.app/api";

interface Quiz {
  _id: string;
  title: string;
  course?: {
    _id: string;
    title: string;
  };
  moduleIndex?: number;
  questions: any[];
  passingScore: number;
}

const QuizManagement: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "module" | "standalone">(
    "all"
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzesByType();
  }, [filterType, quizzes]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/quizzes`, {
        withCredentials: true,
      });
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuizzesByType = () => {
    if (filterType === "all") {
      setFilteredQuizzes(quizzes);
    } else if (filterType === "module") {
      setFilteredQuizzes(
        quizzes.filter((q) => q.course && q.moduleIndex !== undefined)
      );
    } else {
      setFilteredQuizzes(
        quizzes.filter((q) => !q.course || q.moduleIndex === undefined)
      );
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      await axios.delete(`${API_URL}/admin/quizzes/${quizToDelete._id}`, {
        withCredentials: true,
      });
      alert("Quiz deleted successfully");
      setShowDeleteModal(false);
      setQuizToDelete(null);
      fetchQuizzes();
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      alert("Failed to delete quiz");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quiz-management">
      <div className="page-header">
        <div>
          <h1>Quiz Management</h1>
          <p>Create and manage quizzes for courses and modules</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/quizzes/new")}
        >
          <FiPlus /> Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="quiz-filters card">
        <div className="filter-group">
          <FiFilter />
          <label>Filter by Type:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All Quizzes ({quizzes.length})
            </button>
            <button
              className={`filter-btn ${
                filterType === "module" ? "active" : ""
              }`}
              onClick={() => setFilterType("module")}
            >
              Module Quizzes (
              {
                quizzes.filter((q) => q.course && q.moduleIndex !== undefined)
                  .length
              }
              )
            </button>
            <button
              className={`filter-btn ${
                filterType === "standalone" ? "active" : ""
              }`}
              onClick={() => setFilterType("standalone")}
            >
              Standalone (
              {
                quizzes.filter((q) => !q.course || q.moduleIndex === undefined)
                  .length
              }
              )
            </button>
          </div>
        </div>
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <div className="empty-state card">
          <FiFileText size={48} />
          <h3>No Quizzes Found</h3>
          <p>Create your first quiz to get started</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/admin/quizzes/new")}
          >
            <FiPlus /> Create Quiz
          </button>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card card">
              <div className="quiz-header">
                <div className="quiz-type-badge">
                  {quiz.course && quiz.moduleIndex !== undefined ? (
                    <span className="badge badge-primary">
                      <FiBook /> Module Quiz
                    </span>
                  ) : (
                    <span className="badge badge-secondary">
                      <FiFileText /> Standalone
                    </span>
                  )}
                </div>
                <div className="quiz-actions">
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/admin/quizzes/${quiz._id}/edit`)}
                    title="Edit Quiz"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => {
                      setQuizToDelete(quiz);
                      setShowDeleteModal(true);
                    }}
                    title="Delete Quiz"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="quiz-content">
                <h3>{quiz.title}</h3>
                {quiz.course && (
                  <p className="quiz-course">
                    <FiBook /> {quiz.course.title}
                    {quiz.moduleIndex !== undefined &&
                      ` - Module ${quiz.moduleIndex + 1}`}
                  </p>
                )}

                <div className="quiz-stats">
                  <div className="stat">
                    <span className="stat-label">Questions:</span>
                    <span className="stat-value">{quiz.questions.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Passing Score:</span>
                    <span className="stat-value">{quiz.passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && quizToDelete && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Quiz</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{quizToDelete.title}"?</p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
