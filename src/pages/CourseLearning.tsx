import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiCheck, FiChevronDown, FiChevronUp, FiClock, FiBook } from 'react-icons/fi';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CourseLearning.css';

const API_URL = '/api';

interface Lesson {
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  thumbnail: string;
  modules: Module[];
}

interface Enrollment {
  _id: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

const CourseLearning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [currentLesson, setCurrentLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const [completedLessonsSet, setCompletedLessonsSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    // Auto-expand first module and select first lesson
    if (course && course.modules.length > 0) {
      setExpandedModules([0]);
      if (course.modules[0].lessons.length > 0) {
        setCurrentLesson({ moduleIndex: 0, lessonIndex: 0 });
      }
    }
  }, [course]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/student/course/${id}/learn`, { 
        withCredentials: true 
      });
      
      setCourse(response.data.course);
      setEnrollment(response.data.enrollment);
    } catch (error: any) {
      console.error('Failed to fetch course data:', error);
      if (error.response?.status === 403) {
        toast.error('You are not enrolled in this course');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleIndex: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleIndex)
        ? prev.filter(i => i !== moduleIndex)
        : [...prev, moduleIndex]
    );
  };

  const selectLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentLesson({ moduleIndex, lessonIndex });
  };

  const markLessonComplete = async () => {
    if (!enrollment || !currentLesson) return;

    try {
      const lessonKey = `${currentLesson.moduleIndex}-${currentLesson.lessonIndex}`;
      
      // Optimistically update UI
      setCompletedLessonsSet(prev => new Set(prev).add(lessonKey));

      await axios.put(
        `${API_URL}/student/enrollments/${enrollment._id}/lesson/complete`,
        {
          moduleIndex: currentLesson.moduleIndex,
          lessonIndex: currentLesson.lessonIndex
        },
        { withCredentials: true }
      );

      // Refresh enrollment data to get updated progress
      await fetchCourseData();
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
      toast.error('Failed to mark lesson as complete. Please try again.');
      // Revert optimistic update on error
      setCompletedLessonsSet(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${currentLesson.moduleIndex}-${currentLesson.lessonIndex}`);
        return newSet;
      });
    }
  };

  const isLessonCompleted = (moduleIndex: number, lessonIndex: number): boolean => {
    return completedLessonsSet.has(`${moduleIndex}-${lessonIndex}`);
  };

  const getCurrentLesson = () => {
    if (!course || !currentLesson) return null;
    return course.modules[currentLesson.moduleIndex]?.lessons[currentLesson.lessonIndex];
  };

  const getTotalDuration = () => {
    if (!course) return 0;
    return course.modules.reduce((total, module) => 
      total + module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0), 0
    );
  };

  // Convert YouTube URL to embeddable format
  const convertToEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Already an embed URL
    if (url.includes('/embed/')) {
      return url;
    }
    
    // Convert youtube.com/watch?v=VIDEO_ID to youtube.com/embed/VIDEO_ID
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    // Return original URL if not a YouTube URL
    return url;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="error-container">
        <p>Course not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }
  const currentLessonData = getCurrentLesson();

  return (
    <div className="course-learning">
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
      {/* Header */}
      <div className="learning-header">
        <div className="header-content">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="course-info">
            <h1>{course.title}</h1>
            <p className="instructor">By {course.instructor}</p>
          </div>
          <div className="progress-info">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray={`${enrollment?.progress || 0}, 100`}
                />
              </svg>
              <span className="progress-text">{enrollment?.progress || 0}%</span>
            </div>
            <div className="progress-details">
              <p>{enrollment?.completedLessons || 0} / {enrollment?.totalLessons || 0} lessons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="learning-container">
        {/* Video Player Section */}
        <div className="video-section">
          {currentLessonData ? (
            <>
              <div className="video-player">
                <iframe
                  src={convertToEmbedUrl(currentLessonData.videoUrl)}
                  title={currentLessonData.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="lesson-details">
                <div className="lesson-header">
                  <div>
                    <h2>{currentLessonData.title}</h2>
                    <p className="lesson-duration">
                      <FiClock /> {currentLessonData.duration} minutes
                    </p>
                  </div>
                  <button 
                    className={`btn ${isLessonCompleted(currentLesson!.moduleIndex, currentLesson!.lessonIndex) ? 'btn-success' : 'btn-primary'}`}
                    onClick={markLessonComplete}
                    disabled={isLessonCompleted(currentLesson!.moduleIndex, currentLesson!.lessonIndex)}
                  >
                    {isLessonCompleted(currentLesson!.moduleIndex, currentLesson!.lessonIndex) ? (
                      <><FiCheck /> Completed</>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-lesson-selected">
              <FiPlay size={48} />
              <p>Select a lesson to start learning</p>
            </div>
          )}
        </div>

        {/* Modules Sidebar */}
        <div className="modules-sidebar">
          <div className="sidebar-header">
            <h3><FiBook /> Course Content</h3>
            <p className="course-stats">
              {course.modules.length} modules • {enrollment?.totalLessons || 0} lessons • {getTotalDuration()} min
            </p>
          </div>

          <div className="modules-list">
            {course.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="module-item">
                <div 
                  className="module-header"
                  onClick={() => toggleModule(moduleIndex)}
                >
                  <div className="module-info">
                    <h4>{module.title}</h4>
                    <p>{module.lessons.length} lessons</p>
                  </div>
                  <button className="toggle-btn">
                    {expandedModules.includes(moduleIndex) ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                </div>

                {expandedModules.includes(moduleIndex) && (
                  <div className="lessons-list">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className={`lesson-item ${
                          currentLesson?.moduleIndex === moduleIndex && 
                          currentLesson?.lessonIndex === lessonIndex 
                            ? 'active' 
                            : ''
                        } ${isLessonCompleted(moduleIndex, lessonIndex) ? 'completed' : ''}`}
                        onClick={() => selectLesson(moduleIndex, lessonIndex)}
                      >
                        <div className="lesson-icon">
                          {isLessonCompleted(moduleIndex, lessonIndex) ? (
                            <FiCheck className="check-icon" />
                          ) : (
                            <FiPlay className="play-icon" />
                          )}
                        </div>
                        <div className="lesson-info">
                          <p className="lesson-title">{lesson.title}</p>
                          <p className="lesson-duration">
                            <FiClock /> {lesson.duration} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
