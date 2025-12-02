import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { FiUser, FiBook, FiFileText, FiEdit2, FiMail, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import './StudentDashboard.css';

const API_URL = '/api';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
}

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

const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'assignments'>('courses');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentAnswer, setAssignmentAnswer] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [enrollmentsRes, assignmentsRes] = await Promise.all([
        axios.get(`${API_URL}/student/dashboard`, { withCredentials: true }),
        axios.get(`${API_URL}/student/assignments`, { withCredentials: true }).catch(() => ({ data: { assignments: [] } }))
      ]);
      
      setEnrollments(enrollmentsRes.data.enrollments || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !assignmentAnswer.trim()) return;

    try {
      await axios.post(`${API_URL}/student/assignments`, {
        courseId: selectedAssignment.course._id,
        title: selectedAssignment.title,
        description: selectedAssignment.description,
        answer: assignmentAnswer
      }, { withCredentials: true });

      alert('Assignment submitted successfully!');
      setShowSubmitModal(false);
      setAssignmentAnswer('');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert('Failed to submit assignment');
    }
  };

  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter(e => e.isCompleted).length,
    inProgress: enrollments.filter(e => !e.isCompleted).length,
    totalAssignments: assignments.length,
    pendingAssignments: assignments.filter(a => a.status !== 'reviewed').length
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
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser /> Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <FiBook /> My Courses
          </button>
          <button
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <FiFileText /> Assignments
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="profile-section">
              <div className="card profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="profile-info">
                    <h2>{user?.name || 'Student'}</h2>
                    <p className="profile-email"><FiMail /> {user?.email}</p>
                    <p className="profile-joined"><FiCalendar /> Joined {new Date().toLocaleDateString()}</p>
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
        {activeTab === 'courses' && (
          <div className="tab-content">
            {enrollments.length === 0 ? (
              <div className="empty-state card">
                <FiBook size={48} />
                <h3>No Courses Yet</h3>
                <p>Start learning by enrolling in a course!</p>
                <a href="/" className="btn btn-primary">Browse Courses</a>
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
                      <span className="course-category">{enrollment.course.category}</span>
                      <h3>{enrollment.course.title}</h3>
                      <p className="course-instructor">By {enrollment.course.instructor}</p>
                      
                      <div className="course-progress">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span className="progress-percentage">{enrollment.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <p className="lessons-count">
                          {enrollment.completedLessons} / {enrollment.totalLessons} lessons completed
                        </p>
                      </div>

                      {enrollment.isCompleted ? (
                        <span className="badge badge-success">Completed</span>
                      ) : (
                        <button 
                          className="btn btn-primary btn-block"
                          onClick={() => window.location.href = `/course/${enrollment.course._id}/learn`}
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
        {activeTab === 'assignments' && (
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
                        <p className="assignment-course">{assignment.course.title}</p>
                      </div>
                      <span className={`badge ${assignment.status === 'reviewed' ? 'badge-success' : 'badge-warning'}`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="assignment-description">{assignment.description}</p>
                    
                    {assignment.submission ? (
                      <div className="assignment-submission">
                        <h4>Your Submission:</h4>
                        <p>{assignment.submission.answer}</p>
                        <small>Submitted on {new Date(assignment.submission.submittedAt).toLocaleDateString()}</small>
                        
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

        {/* Submit Assignment Modal */}
        {showSubmitModal && selectedAssignment && (
          <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Submit Assignment</h2>
                <button className="modal-close" onClick={() => setShowSubmitModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <h3>{selectedAssignment.title}</h3>
                <p className="text-secondary">{selectedAssignment.description}</p>
                
                <div className="form-group">
                  <label>Your Answer *</label>
                  <textarea
                    className="form-textarea"
                    value={assignmentAnswer}
                    onChange={(e) => setAssignmentAnswer(e.target.value)}
                    placeholder="Enter your answer here..."
                    rows={8}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSubmitModal(false)}>
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
