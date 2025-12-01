import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiBook, FiUser, FiLogOut } from 'react-icons/fi';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from '../shared/ThemeToggle';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout() as any);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <FiBook size={28} />
            <span className="gradient-text">CourseMaster</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Courses</Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} 
                  className="nav-link"
                >
                  Dashboard
                </Link>
                <div className="user-menu">
                  <FiUser size={20} />
                  <span>{user?.name}</span>
                  <button onClick={handleLogout} className="btn-logout" title="Logout">
                    <FiLogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </>
            )}
            
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
