import React, { useEffect, useState } from 'react';
import { FiBook, FiClock, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import './Dashboard-dark.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const StudentDashboard: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get(`${API_URL}/student/dashboard`, { withCredentials: true });
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
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
    <div className="dashboard-page">
      <div className="container">
        <h1 className="mb-6">My Dashboard</h1>

        {enrollments.length === 0 ? (
          <div className="card text-center p-6">
            <FiBook size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <h3>No Enrollments Yet</h3>
            <p className="text-secondary">Start learning by enrolling in a course!</p>
            <a href="/" className="btn btn-primary mt-4">Browse Courses</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="card">
                <div className="enrollment-card">
                  <img 
                    src={enrollment.course.thumbnail} 
                    alt={enrollment.course.title}
                    className="enrollment-thumbnail"
                  />
                  <div className="enrollment-content">
                    <h3>{enrollment.course.title}</h3>
                    <p className="text-secondary">By {enrollment.course.instructor}</p>
                    <div className="progress-section mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-semibold">{enrollment.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex gap-4 mt-3 text-sm text-tertiary">
                        <span><FiClock size={14} /> {enrollment.completedLessons}/{enrollment.totalLessons} lessons</span>
                        {enrollment.isCompleted && (
                          <span className="text-success"><FiCheckCircle size={14} /> Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="enrollment-actions">
                    <button className="btn btn-primary">Continue Learning</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
