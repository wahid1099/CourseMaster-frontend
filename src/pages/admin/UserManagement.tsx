import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  fetchUsers,
  fetchUserStats,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  setFilters,
  clearFilters
} from '../../store/slices/userManagementSlice';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch, FiFilter } from 'react-icons/fi';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { users, stats, filters, pagination, loading, error } = useSelector(
    (state: RootState) => state.userManagement
  );

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers({ page: 1 }) as any);
    dispatch(fetchUserStats() as any);
  }, [dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
    dispatch(fetchUsers({ ...filters, search: searchTerm, page: 1 }) as any);
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(fetchUsers({ ...filters, [key]: value, page: 1 }) as any);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
    dispatch(fetchUsers({ page: 1 }) as any);
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchUsers({ ...filters, page }) as any);
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: any) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      await dispatch(deleteUser(userId) as any);
      dispatch(fetchUsers({ ...filters, page: pagination.page }) as any);
      dispatch(fetchUserStats() as any);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    await dispatch(toggleUserStatus(userId) as any);
    dispatch(fetchUserStats() as any);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (window.confirm(`Change user role to ${newRole}?`)) {
      await dispatch(changeUserRole({ userId, role: newRole }) as any);
      dispatch(fetchUserStats() as any);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      admin: 'badge-admin',
      moderator: 'badge-moderator',
      teacher: 'badge-teacher',
      instructor: 'badge-instructor',
      student: 'badge-student'
    };
    return classes[role] || 'badge-default';
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={handleCreateUser}>
          <FiPlus /> Add User
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-value success">{stats.active}</p>
          </div>
          <div className="stat-card">
            <h3>Inactive Users</h3>
            <p className="stat-value warning">{stats.inactive}</p>
          </div>
          {stats.byRole.map((roleStat) => (
            <div key={roleStat._id} className="stat-card">
              <h3>{roleStat._id}s</h3>
              <p className="stat-value">{roleStat.count}</p>
              <small>{roleStat.active} active</small>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section card">
        <form onSubmit={handleSearch} className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="filters">
          <div className="filter-group">
            <FiFilter />
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="instructor">Instructor</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(filters.role || filters.status || filters.search) && (
            <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="no-data">
            <p>No users found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        {user.avatar && <img src={user.avatar} alt={user.name} className="user-avatar" />}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditUser(user)}
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleToggleStatus(user._id)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteUser(user._id)}
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

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-btn ${pagination.page === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Modal (placeholder - will be implemented next) */}
      {showModal && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            dispatch(fetchUsers({ ...filters, page: pagination.page }) as any);
            dispatch(fetchUserStats() as any);
          }}
        />
      )}
    </div>
  );
};

// Simple User Modal Component
const UserModal: React.FC<{
  mode: 'create' | 'edit';
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ mode, user, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
    bio: user?.bio || '',
    phone: user?.phone || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'create') {
        await dispatch(createUser(formData) as any);
      } else {
        const { password, ...updateData } = formData;
        await dispatch(updateUser({ userId: user._id, userData: updateData }) as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Create User' : 'Edit User'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {mode === 'create' && (
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="form-group">
            <label>Role *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="instructor">Instructor</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              className="form-textarea"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
