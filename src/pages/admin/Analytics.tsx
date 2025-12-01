import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchCourses } from '../../store/slices/courseSlice';
import { fetchUserStats } from '../../store/slices/userManagementSlice';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import './Analytics.css';

const Analytics: React.FC = () => {
  const dispatch = useDispatch();
  const { courses } = useSelector((state: RootState) => state.courses);
  const { stats } = useSelector((state: RootState) => state.userManagement);

  useEffect(() => {
    dispatch(fetchCourses({ page: 1 }) as any);
    dispatch(fetchUserStats() as any);
  }, [dispatch]);

  // Calculate analytics
  const totalRevenue = courses.reduce((sum, course) => sum + course.price, 0);
  const avgCoursePrice = courses.length > 0 ? totalRevenue / courses.length : 0;
  
  const categoryDistribution = courses.reduce((acc: any, course) => {
    acc[course.category] = (acc[course.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats?.total || 0}</p>
            <span className="stat-label">{stats?.active || 0} active</span>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">
            <FiBook />
          </div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <p className="stat-value">{courses.length}</p>
            <span className="stat-label">{Object.keys(categoryDistribution).length} categories</span>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${totalRevenue.toFixed(2)}</p>
            <span className="stat-label">Avg: ${avgCoursePrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>Growth Rate</h3>
            <p className="stat-value">+12%</p>
            <span className="stat-label">This month</span>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="card analytics-section">
        <h2>User Distribution by Role</h2>
        <div className="distribution-grid">
          {stats?.byRole.map((role) => (
            <div key={role._id} className="distribution-item">
              <div className="distribution-header">
                <span className="role-name">{role._id}</span>
                <span className="role-count">{role.count}</span>
              </div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill"
                  style={{ width: `${(role.count / (stats.total || 1)) * 100}%` }}
                />
              </div>
              <span className="distribution-label">{role.active} active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course Categories */}
      <div className="card analytics-section">
        <h2>Courses by Category</h2>
        <div className="distribution-grid">
          {Object.entries(categoryDistribution).map(([category, count]) => (
            <div key={category} className="distribution-item">
              <div className="distribution-header">
                <span className="role-name">{category}</span>
                <span className="role-count">{count as number}</span>
              </div>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill category"
                  style={{ width: `${((count as number) / courses.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card analytics-section">
        <h2>Quick Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Most Popular Category</h4>
            <p className="insight-value">
              {Object.entries(categoryDistribution).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </p>
          </div>
          <div className="insight-card">
            <h4>Average Course Price</h4>
            <p className="insight-value">${avgCoursePrice.toFixed(2)}</p>
          </div>
          <div className="insight-card">
            <h4>Active Users</h4>
            <p className="insight-value">{stats?.active || 0}</p>
          </div>
          <div className="insight-card">
            <h4>Total Categories</h4>
            <p className="insight-value">{Object.keys(categoryDistribution).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
