import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { fetchCourses, deleteCourse } from '../../store/slices/courseSlice';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import './AllCourses.css';

const AllCourses: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, isLoading } = useSelector((state: RootState) => state.courses);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchCourses({ page: 1 }) as any);
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(fetchCourses({ search: searchTerm, page: 1 }) as any);
  };

  const handleDelete = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      await dispatch(deleteCourse(courseId) as any);
      dispatch(fetchCourses({ page: 1 }) as any);
    }
  };

  const handleEdit = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/edit`);
  };

  const handleView = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = !categoryFilter || course.category === categoryFilter;
    // For now, treat all courses as published since isPublished might not exist
    const matchesStatus = !statusFilter;
    return matchesCategory && matchesStatus;
  });

  return (
    <div className="all-courses">
      <div className="page-header">
        <h1>All Courses</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/admin/courses/new')}
        >
          <FiPlus /> Add New Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Courses</h3>
          <p className="stat-value">{courses.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Courses</h3>
          <p className="stat-value success">{courses.length}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p className="stat-value warning">
            {new Set(courses.map(c => c.category)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section card">
        <form onSubmit={handleSearch} className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="filters">
          <div className="filter-group">
            <FiFilter />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {(categoryFilter || statusFilter || searchTerm) && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStatusFilter('');
                dispatch(fetchCourses({ page: 1 }) as any);
              }} 
              className="btn btn-secondary btn-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Table */}
      <div className="card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="no-data">
            <p>No courses found</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/admin/courses/new')}
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Instructor</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="course-info">
                        {course.thumbnail && (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="course-thumbnail"
                          />
                        )}
                        <span>{course.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-category">
                        {course.category}
                      </span>
                    </td>
                    <td>{course.instructor}</td>
                    <td>${course.price}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => handleView(course._id)}
                          title="View"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(course._id)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(course._id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
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

export default AllCourses;
