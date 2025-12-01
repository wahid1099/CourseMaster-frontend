import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiUser, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import { fetchCourse } from '../store/slices/courseSlice';
import { RootState } from '../store/store';
import axios from 'axios';
import './Dashboard-dark.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector((state: RootState) => state.courses);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id) as any);
    }
  }, [id, dispatch]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API_URL}/student/enroll/${id}`, {}, { withCredentials: true });
      alert('Successfully enrolled! Check your dashboard.');
      navigate('/student/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Enrollment failed');
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

  const totalLessons = currentCourse.modules?.reduce((sum, mod) => sum + mod.lessons.length, 0) || 0;

  return (
    <div className="course-details-page">
      <div className="course-header">
        <div className="container">
          <div className="course-header-content">
            <div>
              <span className="badge badge-primary">{currentCourse.category}</span>
              <h1 className="mt-2">{currentCourse.title}</h1>
              <p className="course-instructor"><FiUser /> By {currentCourse.instructor}</p>
            </div>
            <div className="course-header-actions">
              <div className="course-price-box">
                <span className="price-label">Price</span>
                <span className="price">${currentCourse.price}</span>
              </div>
              <button onClick={handleEnroll} className="btn btn-primary btn-lg">
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-6">
        <div className="course-details-grid">
          <div className="course-main">
            <section className="card mb-6">
              <h2>About This Course</h2>
              <p>{currentCourse.description}</p>
            </section>

            <section className="card">
              <h2>Course Content</h2>
              <div className="course-stats mb-4">
                <span><FiBookOpen /> {currentCourse.modules?.length || 0} Modules</span>
                <span><FiClock /> {totalLessons} Lessons</span>
              </div>
              
              {currentCourse.modules?.map((module, idx) => (
                <div key={idx} className="module-item">
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                  <ul className="lesson-list">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <li key={lessonIdx}>
                        <FiClock size={14} /> {lesson.title} ({lesson.duration} min)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </div>

          <div className="course-sidebar">
            <div className="card">
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
                  <p>${currentCourse.price}</p>
                </div>
              </div>
              <div className="info-item">
                <FiClock />
                <div>
                  <strong>Batch</strong>
                  <p>{currentCourse.batch.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
