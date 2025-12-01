import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiDollarSign, FiClock } from 'react-icons/fi';
import { fetchCourses, fetchCategories, setFilters, clearFilters } from '../store/slices/courseSlice';
import { RootState } from '../store/store';
import './Home.css';
import './Home-dark.css';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { courses, isLoading, categories, filters, currentPage, pages } = useSelector(
    (state: RootState) => state.courses
  );
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCourses({ page: 1 }) as any);
    dispatch(fetchCategories() as any);
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    dispatch(fetchCourses({ ...filters, search: searchTerm, page: 1 }) as any);
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setFilters({ category }));
    dispatch(fetchCourses({ ...filters, category, page: 1 }) as any);
  };

  const handleSortChange = (sort: string) => {
    dispatch(setFilters({ sort }));
    dispatch(fetchCourses({ ...filters, sort, page: 1 }) as any);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
    dispatch(fetchCourses({ page: 1 }) as any);
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchCourses({ ...filters, page }) as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title fade-in">
            Learn Anything, <span className="gradient-text">Anywhere</span>
          </h1>
          <p className="hero-subtitle fade-in">
            Discover thousands of courses from world-class instructors
          </p>
          
          <form onSubmit={handleSearch} className="search-bar fade-in">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <div className="filters">
            <div className="filter-group">
              <FiFilter />
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <FiDollarSign />
              <select
                className="filter-select"
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {(filters.search || filters.category || filters.sort) && (
              <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="courses-section">
        <div className="container">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="courses-grid">
                {courses.map((course) => (
                  <Link to={`/courses/${course._id}`} key={course._id} className="course-card">
                    <div className="course-thumbnail">
                      <img src={course.thumbnail} alt={course.title} />
                      <span className="course-category">{course.category}</span>
                    </div>
                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <p className="course-instructor">By {course.instructor}</p>
                      <p className="course-description">{course.description.substring(0, 100)}...</p>
                      <div className="course-footer">
                        <span className="course-price">${course.price}</span>
                        <span className="course-batch">
                          <FiClock size={14} /> {course.batch.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
