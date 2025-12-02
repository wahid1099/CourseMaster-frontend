import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { createCourse, updateCourse, fetchCourse, setCurrentCourse } from '../../store/slices/courseSlice';
import { FiPlus, FiTrash2, FiSave, FiAlertCircle, FiEdit2, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CourseForm.css';

interface ValidationErrors {
  title?: string;
  description?: string;
  instructor?: string;
  price?: string;
  category?: string;
  [key: string]: string | undefined;
}

interface Module {
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
}

const CourseForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentCourse, isLoading } = useSelector((state: RootState) => state.courses);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    price: 0,
    category: '',
    tags: [] as string[],
    thumbnail: '',
    modules: [] as Module[],
    batch: {
      name: '',
      startDate: ''
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  
  // Module/Lesson management state
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<{ index: number; data: Module } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number; lessonIndex: number; data: Lesson } | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourse(id) as any);
    } else {
      dispatch(setCurrentCourse(null));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentCourse && id) {
      setFormData({
        title: currentCourse.title || '',
        description: currentCourse.description || '',
        instructor: currentCourse.instructor || '',
        price: currentCourse.price || 0,
        category: currentCourse.category || '',
        tags: currentCourse.tags || [],
        thumbnail: currentCourse.thumbnail || '',
        modules: currentCourse.modules || [],
        batch: currentCourse.batch || { name: '', startDate: '' }
      });
    }
  }, [currentCourse, id]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Instructor name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      batch: {
        ...prev.batch,
        [name]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleModule = (index: number) => {
    setExpandedModules(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleAddModule = () => {
    setEditingModule({
      index: -1,
      data: {
        title: '',
        description: '',
        order: formData.modules.length + 1,
        lessons: []
      }
    });
    setShowModuleModal(true);
  };

  const handleEditModule = (index: number) => {
    setEditingModule({
      index,
      data: { ...formData.modules[index] }
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = () => {
    if (!editingModule) return;

    if (!editingModule.data.title.trim() || !editingModule.data.description.trim()) {
      toast.error('Module title and description are required');
      return;
    }

    if (editingModule.index === -1) {
      // Add new module
      setFormData(prev => ({
        ...prev,
        modules: [...prev.modules, editingModule.data]
      }));
    } else {
      // Update existing module
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map((m, i) => i === editingModule.index ? editingModule.data : m)
      }));
    }

    setShowModuleModal(false);
    setEditingModule(null);
  };

  const handleDeleteModule = (index: number) => {
    if (confirm('Are you sure you want to delete this module and all its lessons?')) {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.filter((_, i) => i !== index)
      }));
    }
  };

  const handleAddLesson = (moduleIndex: number) => {
    setEditingLesson({
      moduleIndex,
      lessonIndex: -1,
      data: {
        title: '',
        videoUrl: '',
        duration: 0,
        order: formData.modules[moduleIndex].lessons.length + 1
      }
    });
    setShowLessonModal(true);
  };

  const handleEditLesson = (moduleIndex: number, lessonIndex: number) => {
    setEditingLesson({
      moduleIndex,
      lessonIndex,
      data: { ...formData.modules[moduleIndex].lessons[lessonIndex] }
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = () => {
    if (!editingLesson) return;

    if (!editingLesson.data.title.trim() || !editingLesson.data.videoUrl.trim() || editingLesson.data.duration <= 0) {
      toast.error('Lesson title, video URL, and duration are required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => {
        if (i === editingLesson.moduleIndex) {
          if (editingLesson.lessonIndex === -1) {
            // Add new lesson
            return {
              ...module,
              lessons: [...module.lessons, editingLesson.data]
            };
          } else {
            // Update existing lesson
            return {
              ...module,
              lessons: module.lessons.map((l, j) => j === editingLesson.lessonIndex ? editingLesson.data : l)
            };
          }
        }
        return module;
      })
    }));

    setShowLessonModal(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map((module, i) =>
          i === moduleIndex
            ? { ...module, lessons: module.lessons.filter((_, j) => j !== lessonIndex) }
            : module
        )
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      title: true,
      description: true,
      instructor: true,
      category: true,
      price: true
    });

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    try {
      if (id) {
        await dispatch(updateCourse({ id, courseData: formData }) as any);
        toast.success('Course updated successfully!');
      } else {
        await dispatch(createCourse(formData) as any);
        toast.success('Course created successfully!');
      }
      setTimeout(() => navigate('/admin/courses'), 1500);
    } catch (error) {
      console.error('Failed to save course:', error);
      toast.error('Failed to save course. Please try again.');
    }
  };

  return (
    <div className="course-form-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="page-header">
        <h1>{id ? 'Edit Course' : 'Add New Course'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/courses')}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        {/* Basic Information */}
        <div className="card form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              name="title"
              className={`form-input ${touched.title && errors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              placeholder="Enter course title"
            />
            {touched.title && errors.title && (
              <div className="error-message">
                <FiAlertCircle /> {errors.title}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              className={`form-textarea ${touched.description && errors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              rows={5}
              placeholder="Enter course description (minimum 20 characters)"
            />
            {touched.description && errors.description && (
              <div className="error-message">
                <FiAlertCircle /> {errors.description}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Instructor *</label>
              <input
                type="text"
                name="instructor"
                className={`form-input ${touched.instructor && errors.instructor ? 'error' : ''}`}
                value={formData.instructor}
                onChange={handleChange}
                onBlur={() => handleBlur('instructor')}
                placeholder="Instructor name"
              />
              {touched.instructor && errors.instructor && (
                <div className="error-message">
                  <FiAlertCircle /> {errors.instructor}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                className={`form-select ${touched.category && errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={handleChange}
                onBlur={() => handleBlur('category')}
              >
                <option value="">Select category</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
              </select>
              {touched.category && errors.category && (
                <div className="error-message">
                  <FiAlertCircle /> {errors.category}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                name="price"
                className={`form-input ${touched.price && errors.price ? 'error' : ''}`}
                value={formData.price}
                onChange={handleChange}
                onBlur={() => handleBlur('price')}
                min="0"
                step="0.01"
              />
              {touched.price && errors.price && (
                <div className="error-message">
                  <FiAlertCircle /> {errors.price}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              name="thumbnail"
              className="form-input"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-container">
              <input
                type="text"
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag and press Enter"
              />
              <button type="button" className="btn btn-sm btn-primary" onClick={handleAddTag}>
                Add Tag
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Batch Information */}
        <div className="card form-section">
          <h2>Batch Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Batch Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.batch.name}
                onChange={handleBatchChange}
                placeholder="e.g., Fall 2024"
              />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                className="form-input"
                value={formData.batch.startDate}
                onChange={handleBatchChange}
              />
            </div>
          </div>
        </div>

        {/* Modules - Table View */}
        <div className="card form-section">
          <div className="section-header">
            <h2>Course Modules ({formData.modules.length})</h2>
            <button type="button" className="btn btn-primary" onClick={handleAddModule}>
              <FiPlus /> Add Module
            </button>
          </div>

          {formData.modules.length === 0 ? (
            <div className="empty-state">
              <p>No modules added yet. Click "Add Module" to get started.</p>
            </div>
          ) : (
            <div className="modules-table">
              {formData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="module-row">
                  <div className="module-summary">
                    <button
                      type="button"
                      className="expand-btn"
                      onClick={() => toggleModule(moduleIndex)}
                    >
                      {expandedModules.includes(moduleIndex) ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    <div className="module-info">
                      <span className="module-number">Module {moduleIndex + 1}</span>
                      <span className="module-title">{module.title || 'Untitled Module'}</span>
                      <span className="lesson-count">{module.lessons.length} lessons</span>
                    </div>
                    <div className="module-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleEditModule(moduleIndex)}
                        title="Edit Module"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => handleDeleteModule(moduleIndex)}
                        title="Delete Module"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  {expandedModules.includes(moduleIndex) && (
                    <div className="lessons-container">
                      <div className="lessons-header">
                        <h4>Lessons</h4>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleAddLesson(moduleIndex)}
                        >
                          <FiPlus /> Add Lesson
                        </button>
                      </div>

                      {module.lessons.length === 0 ? (
                        <div className="empty-state-small">
                          <p>No lessons added yet.</p>
                        </div>
                      ) : (
                        <table className="lessons-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Title</th>
                              <th>Duration</th>
                              <th>Video URL</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {module.lessons.map((lesson, lessonIndex) => (
                              <tr key={lessonIndex}>
                                <td>{lessonIndex + 1}</td>
                                <td>{lesson.title}</td>
                                <td>{lesson.duration} min</td>
                                <td className="url-cell">{lesson.videoUrl}</td>
                                <td>
                                  <div className="table-actions">
                                    <button
                                      type="button"
                                      className="btn-icon"
                                      onClick={() => handleEditLesson(moduleIndex, lessonIndex)}
                                      title="Edit Lesson"
                                    >
                                      <FiEdit2 />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-icon danger"
                                      onClick={() => handleDeleteLesson(moduleIndex, lessonIndex)}
                                      title="Delete Lesson"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/courses')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            <FiSave /> {isLoading ? 'Saving...' : id ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>

      {/* Module Edit Modal */}
      {showModuleModal && editingModule && (
        <div className="modal-overlay" onClick={() => setShowModuleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingModule.index === -1 ? 'Add Module' : 'Edit Module'}</h2>
              <button className="modal-close" onClick={() => setShowModuleModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Module Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingModule.data.title}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    data: { ...editingModule.data, title: e.target.value }
                  })}
                  placeholder="Module title"
                />
              </div>
              <div className="form-group">
                <label>Module Description *</label>
                <textarea
                  className="form-textarea"
                  value={editingModule.data.description}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    data: { ...editingModule.data, description: e.target.value }
                  })}
                  rows={4}
                  placeholder="Module description"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModuleModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveModule}>
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Edit Modal */}
      {showLessonModal && editingLesson && (
        <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLesson.lessonIndex === -1 ? 'Add Lesson' : 'Edit Lesson'}</h2>
              <button className="modal-close" onClick={() => setShowLessonModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lesson Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingLesson.data.title}
                  onChange={(e) => setEditingLesson({
                    ...editingLesson,
                    data: { ...editingLesson.data, title: e.target.value }
                  })}
                  placeholder="Lesson title"
                />
              </div>
              <div className="form-group">
                <label>Video URL *</label>
                <input
                  type="url"
                  className="form-input"
                  value={editingLesson.data.videoUrl}
                  onChange={(e) => setEditingLesson({
                    ...editingLesson,
                    data: { ...editingLesson.data, videoUrl: e.target.value }
                  })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={editingLesson.data.duration}
                  onChange={(e) => setEditingLesson({
                    ...editingLesson,
                    data: { ...editingLesson.data, duration: parseInt(e.target.value) || 0 }
                  })}
                  min="1"
                  placeholder="Duration in minutes"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowLessonModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveLesson}>
                Save Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseForm;
