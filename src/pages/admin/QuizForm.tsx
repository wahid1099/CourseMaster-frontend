import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import "./QuizForm.css";

const API_URL = "/api";

interface Course {
  _id: string;
  title: string;
  modules: any[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizFormData {
  title: string;
  courseId: string;
  moduleIndex: string;
  passingScore: number;
  questions: Question[];
  isStandalone: boolean;
}

const QuizForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    courseId: "",
    moduleIndex: "",
    passingScore: 70,
    questions: [{ question: "", options: ["", ""], correctAnswer: 0 }],
    isStandalone: false,
  });

  useEffect(() => {
    fetchCourses();
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`, {
        withCredentials: true,
      });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/admin/quizzes/${id}`, {
        withCredentials: true,
      });
      const quiz = response.data.quiz;
      setFormData({
        title: quiz.title,
        courseId: quiz.course?._id || "",
        moduleIndex:
          quiz.moduleIndex !== undefined ? quiz.moduleIndex.toString() : "",
        passingScore: quiz.passingScore,
        questions: quiz.questions,
        isStandalone: !quiz.course,
      });
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    if (!formData.isStandalone && !formData.courseId) {
      toast.error("Please select a course or create a standalone quiz");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (q.options.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
    }

    try {
      setIsLoading(true);
      const payload: any = {
        title: formData.title,
        questions: formData.questions,
        passingScore: formData.passingScore,
      };

      if (!formData.isStandalone) {
        payload.courseId = formData.courseId;
        if (formData.moduleIndex) {
          payload.moduleIndex = parseInt(formData.moduleIndex);
        }
      }

      if (id) {
        await axios.put(`${API_URL}/admin/quizzes/${id}`, payload, {
          withCredentials: true,
        });
        toast.success("Quiz updated successfully!");
      } else {
        await axios.post(`${API_URL}/admin/quizzes`, payload, {
          withCredentials: true,
        });
        toast.success("Quiz created successfully!");
      }

      navigate("/admin/quizzes");
    } catch (error: any) {
      console.error("Failed to save quiz:", error);
      toast.error(error.response?.data?.message || "Failed to save quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { question: "", options: ["", ""], correctAnswer: 0 },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push("");
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    // Adjust correct answer if needed
    if (
      newQuestions[questionIndex].correctAnswer >=
      newQuestions[questionIndex].options.length
    ) {
      newQuestions[questionIndex].correctAnswer = 0;
    }
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const selectedCourse = courses.find((c) => c._id === formData.courseId);

  return (
    <div className="quiz-form-page">
      <div className="form-header">
        <button className="btn-back" onClick={() => navigate("/admin/quizzes")}>
          <FiArrowLeft /> Back to Quizzes
        </button>
        <h1>{id ? "Edit Quiz" : "Create New Quiz"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="card form-section">
          <h2>Quiz Details</h2>

          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isStandalone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isStandalone: e.target.checked,
                    courseId: "",
                    moduleIndex: "",
                  })
                }
              />
              <span>Standalone Quiz (not tied to any course/module)</span>
            </label>
          </div>

          {!formData.isStandalone && (
            <>
              <div className="form-group">
                <label>Course *</label>
                <select
                  className="form-select"
                  value={formData.courseId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      courseId: e.target.value,
                      moduleIndex: "",
                    })
                  }
                  required={!formData.isStandalone}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse &&
                selectedCourse.modules &&
                selectedCourse.modules.length > 0 && (
                  <div className="form-group">
                    <label>Module (Optional)</label>
                    <select
                      className="form-select"
                      value={formData.moduleIndex}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          moduleIndex: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        General Quiz (not module-specific)
                      </option>
                      {selectedCourse.modules.map((module, index) => (
                        <option key={index} value={index}>
                          Module {index + 1}: {module.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
            </>
          )}

          <div className="form-group">
            <label>Passing Score (%)</label>
            <input
              type="number"
              className="form-input"
              value={formData.passingScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passingScore: parseInt(e.target.value),
                })
              }
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        {/* Questions */}
        <div className="card form-section">
          <div className="section-header">
            <h2>Questions</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addQuestion}
            >
              <FiPlus /> Add Question
            </button>
          </div>

          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-block">
              <div className="question-header">
                <h3>Question {qIndex + 1}</h3>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  className="form-textarea"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                  placeholder="Enter your question"
                  rows={3}
                  required
                />
              </div>

              <div className="options-section">
                <label>Options *</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-row">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() =>
                        updateQuestion(qIndex, "correctAnswer", oIndex)
                      }
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={option}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                      required
                    />
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => removeOption(qIndex, oIndex)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => addOption(qIndex)}
                >
                  <FiPlus /> Add Option
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/quizzes")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            <FiSave />{" "}
            {isLoading ? "Saving..." : id ? "Update Quiz" : "Create Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
