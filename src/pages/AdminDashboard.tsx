import React, { useEffect, useState } from "react";
import { FiUsers, FiBook, FiTrendingUp, FiFileText } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "../config/axios.config";
import "./Dashboard-dark.css";

const API_URL = "https://course-master-backend-chi.vercel.app/api";

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/analytics`, {
        withCredentials: true,
      });
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const chartData = analytics.enrollmentTrends.map((item: any) => ({
    date: new Date(item._id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    enrollments: item.count,
  }));

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="stat-card">
              <FiBook
                className="stat-icon"
                style={{ color: "var(--primary)" }}
              />
              <div>
                <p className="text-tertiary text-sm">Total Courses</p>
                <h2>{analytics.totalCourses}</h2>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="stat-card">
              <FiUsers
                className="stat-icon"
                style={{ color: "var(--success)" }}
              />
              <div>
                <p className="text-tertiary text-sm">Total Enrollments</p>
                <h2>{analytics.totalEnrollments}</h2>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="stat-card">
              <FiTrendingUp
                className="stat-icon"
                style={{ color: "var(--warning)" }}
              />
              <div>
                <p className="text-tertiary text-sm">Completed Courses</p>
                <h2>{analytics.completedCourses}</h2>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="stat-card">
              <FiFileText
                className="stat-icon"
                style={{ color: "var(--info)" }}
              />
              <div>
                <p className="text-tertiary text-sm">Completion Rate</p>
                <h2>{analytics.completionRate}%</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Trends Chart */}
        <div className="card mb-8">
          <h3 className="mb-4">Enrollment Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                }}
              />
              <Line
                type="monotone"
                dataKey="enrollments"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Courses */}
        <div className="card">
          <h3 className="mb-4">Popular Courses</h3>
          <div className="space-y-3">
            {analytics.popularCourses.map((course: any, idx: number) => (
              <div key={idx} className="popular-course-item">
                <div>
                  <h4>{course.title}</h4>
                  <p className="text-sm text-tertiary">
                    {course.enrollments} enrollments
                  </p>
                </div>
                <div className="progress-bar" style={{ width: "200px" }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        (course.enrollments / analytics.totalEnrollments) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
