import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchEnrollments, fetchEnrollmentStats } from '../../store/slices/enrollmentSlice';
import { FiUsers, FiCheckCircle, FiClock, FiSearch } from 'react-icons/fi';
import './Enrollments.css';

const Enrollments: React.FC = () => {
  const dispatch = useDispatch();
  const { enrollments, stats, isLoading } = useSelector((state: RootState) => state.enrollments);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchEnrollments({ page: 1 }) as any);
    dispatch(fetchEnrollmentStats() as any);
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchEnrollments({ search: searchTerm, page: 1 }) as any);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    dispatch(fetchEnrollments({ status, page: 1 }) as any);
  };

  return (
    <div className="enrollments-page">
      <div className="page-header">
        <h1>Enrollment Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-content">
            <h3>Total Enrollments</h3>
            <p className="stat-value">{stats?.total || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FiCheckCircle /></div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value success">{stats?.completed || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><FiClock /></div>
          <div className="stat-content">
            <h3>Active</h3>
            <p className="stat-value warning">{stats?.active || 0}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-section">
        <form onSubmit={handleSearch} className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="filters">
          <button
            className={`filter-btn ${!statusFilter ? 'active' : ''}`}
            onClick={() => handleFilterChange('')}
          >
            All
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => handleFilterChange('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterChange('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading enrollments...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="no-data">
            <p>No enrollments found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Progress</th>
                  <th>Enrolled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id}>
                    <td>
                      <div className="user-info">
                        <span>{enrollment.student?.name || 'N/A'}</span>
                        <small>{enrollment.student?.email}</small>
                      </div>
                    </td>
                    <td>{enrollment.course?.title || 'N/A'}</td>
                    <td>{enrollment.course?.batch?.name || 'N/A'}</td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="progress-text">{enrollment.progress}%</span>
                    </td>
                    <td>{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${enrollment.isCompleted ? 'badge-success' : 'badge-warning'}`}>
                        {enrollment.isCompleted ? 'Completed' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enrollments;
