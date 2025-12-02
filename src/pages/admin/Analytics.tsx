import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { fetchCourses } from '../../store/slices/courseSlice';
import { fetchUserStats } from '../../store/slices/userManagementSlice';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Analytics.css';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

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

  // Prepare chart data
  const categoryChartData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value: value as number,
    courses: value as number
  }));

  const userRoleData = stats?.byRole.map(role => ({
    name: role._id,
    users: role.count,
    active: role.active
  })) || [];

  // Mock data for user growth (replace with real data from backend)
  const userGrowthData = [
    { month: 'Jan', users: 20, revenue: 1200 },
    { month: 'Feb', users: 35, revenue: 2100 },
    { month: 'Mar', users: 50, revenue: 3500 },
    { month: 'Apr', users: 75, revenue: 5200 },
    { month: 'May', users: 95, revenue: 6800 },
    { month: 'Jun', users: stats?.total || 120, revenue: totalRevenue }
  ];

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights and statistics</p>
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

      {/* Charts Row 1 */}
      <div className="charts-row">
        {/* User Growth Chart */}
        <div className="card chart-card">
          <h2>User Growth & Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
                name="Users"
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Categories Bar Chart */}
        <div className="card chart-card">
          <h2>Courses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="courses" fill="#6366f1" radius={[8, 8, 0, 0]} name="Number of Courses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        {/* User Role Distribution Pie Chart */}
        <div className="card chart-card">
          <h2>User Distribution by Role</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="users"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Active vs Total Users */}
        <div className="card chart-card">
          <h2>Active Users by Role</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userRoleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="users" fill="#6366f1" radius={[8, 8, 0, 0]} name="Total Users" />
              <Bar dataKey="active" fill="#10b981" radius={[8, 8, 0, 0]} name="Active Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Insights */}
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
