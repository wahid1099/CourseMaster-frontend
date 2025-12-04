import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiClock, FiCheckCircle, FiXCircle, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import "./QuizTaking.css";

const API_URL = "/api";

interface Question {
  question: string;
  options: string[];
  correctAnswer?: number;
}

interface Quiz {
  _id: string;
  title: string;
  questions: Question[];
  passingScore: number;
  course?: {
    _id: string;
    title: string;
  };
}

const QuizTaking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    fetchQuiz();
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/quizzes/${id}`, {
        withCredentials: true,
      });
      setQuiz(response.data.quiz);
      setAnswers(new Array(response.data.quiz.questions.length).fill(-1));
    } catch (error: any) {
      console.error("Failed to fetch quiz:", error);
      toast.error(error.response?.data?.message || "Failed to load quiz");
      navigate("/student/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (answers.includes(-1)) {
      toast.warning("Please answer all questions before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_URL}/quizzes/${id}/submit`,
        { answers, timeSpent },
        { withCredentials: true }
      );

      setResults(response.data.result);
      setShowResults(true);
      toast.success(
        response.data.result.passed
          ? "Congratulations! You passed the quiz!"
          : "Quiz submitted. Keep practicing!"
      );
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);
      toast.error(error.response?.data?.message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  if (showResults && results) {
    return (
      <div className="quiz-taking">
        <div className="quiz-container">
          <div className="quiz-results-page">
            <div
              className={`results-header ${
                results.passed ? "passed" : "failed"
              }`}
            >
              {results.passed ? (
                <FiCheckCircle size={64} />
              ) : (
                <FiXCircle size={64} />
              )}
              <h1>
                {results.passed ? "Congratulations!" : "Keep Practicing!"}
              </h1>
              <p>
                {results.passed
                  ? "You passed the quiz!"
                  : "You did not pass this time."}
              </p>
            </div>

            <div className="results-stats">
              <div className="stat-item">
                <h3>Score</h3>
                <p className="stat-value">
                  {results.score} / {results.totalPoints}
                </p>
              </div>
              <div className="stat-item">
                <h3>Percentage</h3>
                <p className="stat-value">{results.percentage}%</p>
              </div>
              <div className="stat-item">
                <h3>Passing Score</h3>
                <p className="stat-value">{quiz.passingScore}%</p>
              </div>
              <div className="stat-item">
                <h3>Time Spent</h3>
                <p className="stat-value">{formatTime(timeSpent)}</p>
              </div>
            </div>

            <div className="results-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/student/dashboard")}
              >
                <FiArrowLeft /> Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-taking">
      <div className="quiz-container">
        <div className="quiz-header">
          <button
            className="btn-back"
            onClick={() => navigate("/student/dashboard")}
          >
            <FiArrowLeft /> Back
          </button>
          <div className="quiz-info">
            <h1>{quiz.title}</h1>
            {quiz.course && <p className="course-name">{quiz.course.title}</p>}
          </div>
          <div className="quiz-timer">
            <FiClock />
            <span>{formatTime(timeSpent)}</span>
          </div>
        </div>

        <div className="quiz-progress">
          <div className="progress-text">
            Question {answers.filter((a) => a !== -1).length} /{" "}
            {quiz.questions.length} answered
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (answers.filter((a) => a !== -1).length /
                    quiz.questions.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="quiz-questions">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <h3 className="question-title">Question {qIndex + 1}</h3>
              <p className="question-text">{question.question}</p>

              <div className="options-list">
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className={`option-item ${
                      answers[qIndex] === oIndex ? "selected" : ""
                    }`}
                    onClick={() => handleAnswerSelect(qIndex, oIndex)}
                  >
                    <div className="option-radio">
                      {answers[qIndex] === oIndex && (
                        <div className="radio-dot" />
                      )}
                    </div>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-footer">
          <button
            className="btn btn-primary btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting || answers.includes(-1)}
          >
            {isSubmitting ? "Submitting..." : "Submit Quiz"}
          </button>
          {answers.includes(-1) && (
            <p className="submit-hint">Please answer all questions to submit</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
