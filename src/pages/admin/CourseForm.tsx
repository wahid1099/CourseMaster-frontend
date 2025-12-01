import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/store';
import { createCourse, updateCourse, fetchCourse, setCurrentCourse } from '../../store/slices/courseSlice';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import './CourseForm.css';

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
    modules: [] as any[],
    batch: {
      name: '',
      startDate: ''
    }
  });

  const [tagInput, setTagInput] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
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

  const handleAddModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: '',
          description: '',
          order: prev.modules.length + 1,
          lessons: []
        }
      ]
    }));
  };

  const handleModuleChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const handleRemoveModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const handleAddLesson = (moduleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  title: '',
                  videoUrl: '',
                  duration: 0,
                  order: module.lessons.length + 1
                }
              ]
            }
          : module
      )
    }));
  };

  const handleLessonChange = (moduleIndex: number, lessonIndex: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson: any, j: number) =>
                j === lessonIndex ? { ...lesson, [field]: value } : lesson
              )
            }
          : module
      )
    }));
  };

  const handleRemoveLesson = (moduleIndex: number, lessonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_: any, j: number) => j !== lessonIndex)
            }
          : module
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (id) {
        await dispatch(updateCourse({ id, courseData: formData }) as any);
        alert('Course updated successfully!');
      } else {
        await dispatch(createCourse(formData) as any);
        alert('Course created successfully!');
      }
      navigate('/admin/courses');
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  return (
    <div className="course-form-page">
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
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter course title"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Enter course description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Instructor *</label>
              <input
                type="text"
                name="instructor"
                className="form-input"
                value={formData.instructor}
                onChange={handleChange}
                required
                placeholder="Instructor name"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Marketing">Marketing</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                name="price"
                className="form-input"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
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

        {/* Modules */}
        <div className="card form-section">
          <div className="section-header">
            <h2>Course Modules</h2>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleAddModule}>
              <FiPlus /> Add Module
            </button>
          </div>

          {formData.modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="module-card">
              <div className="module-header">
                <h3>Module {moduleIndex + 1}</h3>
                <button
                  type="button"
                  className="btn-icon danger"
                  onClick={() => handleRemoveModule(moduleIndex)}
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="form-group">
                <label>Module Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={module.title}
                  onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                  required
                  placeholder="Module title"
                />
              </div>

              <div className="form-group">
                <label>Module Description *</label>
                <textarea
                  className="form-textarea"
                  value={module.description}
                  onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
                  required
                  rows={3}
                  placeholder="Module description"
                />
              </div>

              {/* Lessons */}
              <div className="lessons-section">
                <div className="section-header">
                  <h4>Lessons</h4>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleAddLesson(moduleIndex)}
                  >
                    <FiPlus /> Add Lesson
                  </button>
                </div>

                {module.lessons.map((lesson: any, lessonIndex: number) => (
                  <div key={lessonIndex} className="lesson-card">
                    <div className="lesson-header">
                      <span>Lesson {lessonIndex + 1}</span>
                      <button
                        type="button"
                        className="btn-icon danger"
                        onClick={() => handleRemoveLesson(moduleIndex, lessonIndex)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Lesson Title *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={lesson.title}
                          onChange={(e) =>
                            handleLessonChange(moduleIndex, lessonIndex, 'title', e.target.value)
                          }
                          required
                          placeholder="Lesson title"
                        />
                      </div>

                      <div className="form-group">
                        <label>Duration (minutes) *</label>
                        <input
                          type="number"
                          className="form-input"
                          value={lesson.duration}
                          onChange={(e) =>
                            handleLessonChange(moduleIndex, lessonIndex, 'duration', parseInt(e.target.value) || 0)
                          }
                          required
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Video URL *</label>
                      <input
                        type="url"
                        className="form-input"
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          handleLessonChange(moduleIndex, lessonIndex, 'videoUrl', e.target.value)
                        }
                        required
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default CourseForm;
