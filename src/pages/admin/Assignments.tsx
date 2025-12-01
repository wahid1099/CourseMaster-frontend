import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchAssignments, fetchAssignmentStats, reviewAssignment, setCurrentAssignment } from '../../store/slices/assignmentSlice';
import { FiFileText, FiClock, FiCheckCircle, FiSearch, FiEye } from 'react-icons/fi';
import './Assignments.css';

const Assignments: React.FC = () => {
  const dispatch = useDispatch();
  const { assignments, currentAssignment, stats, isLoading } = useSelector((state: RootState) => state.assignments);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    dispatch(fetchAssignments({ page: 1 }) as any);
    dispatch(fetchAssignmentStats() as any);
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchAssignments({ search: searchTerm, page: 1 }) as any);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    dispatch(fetchAssignments({ status, page: 1 }) as any);
  };

  const handleViewAssignment = (assignment: any) => {
    dispatch(setCurrentAssignment(assignment));
    setFeedback(assignment.review?.feedback || '');
    setShowModal(true);
  };

  const handleReview = async () => {
    if (currentAssignment && feedback.trim()) {
      await dispatch(reviewAssignment({ id: currentAssignment._id, feedback }) as any);
      setShowModal(false);
      dispatch(fetchAssignments({ page: 1 }) as any);
    }
  };

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h1>Assignment Review</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FiFileText /></div>
          <div className="stat-content">
            <h3>Total Assignments</h3>
            <p className="stat-value">{stats?.total || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><FiClock /></div>
          <div className="stat-content">
            <h3>Pending Review</h3>
            <p className="stat-value warning">{stats?.pending || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FiCheckCircle /></div>
          <div className="stat-content">
            <h3>Reviewed</h3>
            <p className="stat-value success">{stats?.reviewed || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-section">
        <form onSubmit={handleSearch} className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by student or assignment title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="filters">
          <button className={`filter-btn ${!statusFilter ? 'active' : ''}`} onClick={() => handleFilterChange('')}>
            All
          </button>
          <button className={`filter-btn ${statusFilter === 'pending' || statusFilter === 'submitted' ? 'active' : ''}`} onClick={() => handleFilterChange('submitted')}>
            Pending
          </button>
          <button className={`filter-btn ${statusFilter === 'reviewed' ? 'active' : ''}`} onClick={() => handleFilterChange('reviewed')}>
            Reviewed
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="no-data">
            <p>No assignments found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Assignment</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.student?.name || 'N/A'}</td>
                    <td>{assignment.course?.title || 'N/A'}</td>
                    <td>{assignment.title}</td>
                    <td>{new Date(assignment.submission.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${assignment.status === 'reviewed' ? 'badge-success' : 'badge-warning'}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleViewAssignment(assignment)} title="View">
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showModal && currentAssignment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assignment Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="assignment-details">
                <div className="detail-group">
                  <label>Student:</label>
                  <p>{currentAssignment.student?.name}</p>
                </div>
                <div className="detail-group">
                  <label>Course:</label>
                  <p>{currentAssignment.course?.title}</p>
                </div>
                <div className="detail-group">
                  <label>Assignment Title:</label>
                  <p>{currentAssignment.title}</p>
                </div>
                <div className="detail-group">
                  <label>Description:</label>
                  <p>{currentAssignment.description}</p>
                </div>
                <div className="detail-group">
                  <label>Student's Answer:</label>
                  <div className="answer-box">{currentAssignment.submission.answer}</div>
                </div>
                <div className="detail-group">
                  <label>Feedback:</label>
                  <textarea
                    className="form-textarea"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={handleReview} disabled={!feedback.trim()}>
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
