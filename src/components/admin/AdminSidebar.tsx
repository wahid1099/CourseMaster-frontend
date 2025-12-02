import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiBook, 
  FiUsers, 
  FiBarChart2, 
  FiFileText,
  FiMenu,
  FiX
} from 'react-icons/fi';
import './AdminSidebar.css';

const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/courses', icon: FiBook, label: 'All Courses' },
    { path: '/admin/courses/new', icon: FiFileText, label: 'Add Course' },
    { path: '/admin/users', icon: FiUsers, label: 'Manage Users' },
    { path: '/admin/enrollments', icon: FiUsers, label: 'Enrollments' },
    { path: '/admin/assignments', icon: FiFileText, label: 'Assignments' },
    { path: '/admin/quizzes', icon: FiFileText, label: 'Quizzes' },
    { path: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && setIsOpen(false)}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
