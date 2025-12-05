import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiClock, FiUser, FiDollarSign, FiBookOpen } from "react-icons/fi";
import { fetchCourse } from "../store/slices/courseSlice";
import { RootState } from "../store/store";
import axios from "../config/axios.config";
import { toast } from "react-toastify";
import "./Dashboard-dark.css";
import "./CourseDetails.css";

const API_URL = "https://course-master-backend-chi.vercel.app/api";

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector(
    (state: RootState) => state.courses
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id) as any);
    }
  }, [id, dispatch]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to enroll in this course");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/student/enroll/${id}`,
        {},
        { withCredentials: true }
      );

      toast.success("Successfully enrolled in the course!");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Enrollment error:", error);
      const errorMessage = error.response?.data?.message || "Enrollment failed";
      toast.error(errorMessage);
    }
  };

  if (isLoading || !currentCourse) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  const totalLessons =
    currentCourse.modules?.reduce((sum, mod) => sum + mod.lessons.length, 0) ||
    0;

  return (
    <div className="course-details-page">
      {/* Hero Section with Large Image */}
      <div className="course-hero">
        <div className="course-hero-image">
          <img src={currentCourse.thumbnail} alt={currentCourse.title} />
          <div className="course-hero-overlay"></div>
        </div>
        <div className="container">
          <div className="course-hero-content">
            <span className="badge badge-primary badge-lg">
              {currentCourse.category}
            </span>
            <h1 className="course-hero-title">{currentCourse.title}</h1>
            <p className="course-hero-instructor">
              <FiUser /> By {currentCourse.instructor}
            </p>
            <div className="course-hero-stats">
              <div className="stat-item">
                <FiBookOpen />
                <span>{currentCourse.modules?.length || 0} Modules</span>
              </div>
              <div className="stat-item">
                <FiClock />
                <span>{totalLessons} Lessons</span>
              </div>
              <div className="stat-item">
                <FiDollarSign />
                <span className="price-highlight">${currentCourse.price}</span>
              </div>
            </div>
            <button onClick={handleEnroll} className="btn btn-primary btn-hero">
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      <div className="container mt-6">
        <div className="course-details-grid">
          <div className="course-main">
            <section className="card mb-6">
              <h2>About This Course</h2>
              <p className="course-about-text">{currentCourse.description}</p>
            </section>

            <section className="card">
              <h2>Course Content</h2>
              <div className="course-stats-bar mb-4">
                <div className="stat-badge">
                  <FiBookOpen />
                  <span>{currentCourse.modules?.length || 0} Modules</span>
                </div>
                <div className="stat-badge">
                  <FiClock />
                  <span>{totalLessons} Lessons</span>
                </div>
              </div>

              {currentCourse.modules?.map((module, idx) => (
                <div key={idx} className="module-item-modern">
                  <div className="module-header">
                    <h4>{module.title}</h4>
                    <span className="module-number">Module {idx + 1}</span>
                  </div>
                  <p className="module-description">{module.description}</p>
                  <ul className="lesson-list-modern">
                    {module.lessons.map((lesson: any, lessonIdx: number) => (
                      <li key={lessonIdx}>
                        <FiClock size={16} />
                        <span>{lesson.title}</span>
                        <span className="lesson-duration">
                          {lesson.duration} min
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </div>

          <div className="course-sidebar">
            <div className="card sticky-sidebar">
              <h3>Course Info</h3>
              <div className="info-item">
                <FiUser />
                <div>
                  <strong>Instructor</strong>
                  <p>{currentCourse.instructor}</p>
                </div>
              </div>
              <div className="info-item">
                <FiDollarSign />
                <div>
                  <strong>Price</strong>
                  <p className="price-text">${currentCourse.price}</p>
                </div>
              </div>
              <div className="info-item">
                <FiClock />
                <div>
                  <strong>Batch</strong>
                  <p>{currentCourse.batch.name}</p>
                </div>
              </div>
              <button
                onClick={handleEnroll}
                className="btn btn-primary w-full mt-4"
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
